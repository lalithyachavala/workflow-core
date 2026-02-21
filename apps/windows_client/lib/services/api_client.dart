import "dart:convert";
import "package:http/http.dart" as http;
import "package:device_info_plus/device_info_plus.dart";
import "package:package_info_plus/package_info_plus.dart";
import "../models/clock_payload.dart";
import "token_store.dart";

class ApiClient {
  ApiClient({required this.baseUrl});

  final String baseUrl;
  final TokenStore _tokenStore = TokenStore();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse("$baseUrl/auth/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );
    if (res.statusCode >= 400) {
      throw Exception("Login failed: ${res.body}");
    }

    final json = jsonDecode(res.body) as Map<String, dynamic>;
    await _tokenStore.saveTokens(json["accessToken"], json["refreshToken"]);
    return json;
  }

  Future<bool> hasFaceTemplate() async {
    final json = await _authedGet("/auth/face-status");
    return (json["hasTemplate"] ?? false) as bool;
  }

  Future<void> verifyFaceForLogin(List<double> embedding) async {
    final json = await _authedPost("/auth/verify-face", {"embedding": embedding});
    if (json["ok"] != true) {
      throw Exception(json["message"] ?? "Face verification failed.");
    }
  }

  Future<void> enrollMyFace(List<double> embedding, String pose, {String? profileImageBase64}) async {
    final body = <String, dynamic>{"embedding": embedding, "pose": pose};
    if (profileImageBase64 != null && profileImageBase64.isNotEmpty) {
      body["profileImageBase64"] = profileImageBase64;
    }
    final json = await _authedPost("/auth/enroll-face", body);
    if (json["ok"] != true) {
      throw Exception(json["message"] ?? "Face enrollment failed.");
    }
  }

  Future<void> clearTokens() async {
    await _tokenStore.clear();
  }

  Future<void> logout() async {
    final refreshToken = await _tokenStore.getRefreshToken();
    if (refreshToken != null) {
      try {
        await http.post(
          Uri.parse("$baseUrl/auth/logout"),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({"refreshToken": refreshToken}),
        );
      } catch (_) {}
    }
    await _tokenStore.clear();
  }

  Future<Map<String, dynamic>> fetchCurrentUser() async {
    final json = await _authedGet("/auth/me");
    return (json["user"] ?? {}) as Map<String, dynamic>;
  }

  Future<void> clockIn(List<double> embedding) async {
    await _clock("/attendance/clock-in", embedding);
  }

  Future<void> clockOut(List<double> embedding) async {
    await _clock("/attendance/clock-out", embedding);
  }

  Future<Map<String, dynamic>> fetchToday() async {
    return _authedGet("/attendance/my/today");
  }

  Future<List<dynamic>> fetchSummary() async {
    final json = await _authedGet("/attendance/my/summary");
    return (json["sessions"] ?? []) as List<dynamic>;
  }

  Future<List<dynamic>> fetchMyHoursByDay({int days = 30}) async {
    final json = await _authedGet("/attendance/my/hours-by-day?days=$days");
    return (json["hoursByDay"] ?? []) as List<dynamic>;
  }

  Future<Map<String, dynamic>> fetchUserAttendance(String userId, {int days = 30}) async {
    final json = await _authedGet("/admin/users/$userId/attendance?days=$days");
    return json as Map<String, dynamic>;
  }

  Future<List<dynamic>> fetchRoles() async {
    final json = await _authedGet("/admin/roles");
    return (json["roles"] ?? []) as List<dynamic>;
  }

  Future<void> createRole(String name, String description, List<String> permissions) async {
    await _authedPost("/admin/roles", {
      "name": name,
      "description": description,
      "permissions": permissions,
    });
  }

  Future<void> createUser({
    required String email,
    required String password,
    required String displayName,
    required String employeeCode,
    required List<String> roleNames,
  }) async {
    await _authedPost("/admin/users", {
      "email": email,
      "password": password,
      "displayName": displayName,
      "employeeCode": employeeCode,
      "roleNames": roleNames,
    });
  }

  Future<List<dynamic>> fetchAttendanceEvents() async {
    final json = await _authedGet("/admin/attendance");
    return (json["events"] ?? []) as List<dynamic>;
  }

  Future<void> reportAwayAlert() async {
    await _authedPost("/attendance/away-alert", {});
  }

  Future<List<dynamic>> fetchAwayAlerts() async {
    final json = await _authedGet("/admin/away-alerts");
    return (json["alerts"] ?? []) as List<dynamic>;
  }

  Future<void> enrollFace(String userId, String imageBase64) async {
    await _authedPost("/face/enroll", {
      "userId": userId,
      "imageBase64": imageBase64,
    });
  }

  Future<Map<String, dynamic>> fetchDashboardMetrics() async {
    final json = await _authedGet("/admin/dashboard");
    return (json["metrics"] ?? {}) as Map<String, dynamic>;
  }

  Future<List<dynamic>> fetchUsers() async {
    final json = await _authedGet("/admin/users");
    return (json["users"] ?? []) as List<dynamic>;
  }

  Future<Map<String, dynamic>> updateUser(String userId, Map<String, dynamic> payload) async {
    return _authedPatch("/admin/users/$userId", payload);
  }

  Future<List<dynamic>> fetchCompanyStructures() async {
    final json = await _authedGet("/admin/company-structures");
    return (json["rows"] ?? []) as List<dynamic>;
  }

  Future<void> createCompanyStructure(Map<String, dynamic> payload) async {
    await _authedPost("/admin/company-structures", payload);
  }

  Future<void> updateCompanyStructure(String id, Map<String, dynamic> payload) async {
    await _authedPatch("/admin/company-structures/$id", payload);
  }

  Future<void> deleteCompanyStructure(String id) async {
    await _authedDelete("/admin/company-structures/$id");
  }

  Future<void> _clock(String path, List<double> embedding) async {
    final payload = await _buildClockPayload(embedding);
    await _authedPost(path, payload.toJson());
  }

  Future<ClockPayload> _buildClockPayload(List<double> embedding) async {
    final windows = await DeviceInfoPlugin().windowsInfo;
    final packageInfo = await PackageInfo.fromPlatform();

    return ClockPayload(
      embedding: embedding,
      deviceFingerprint: windows.deviceId,
      hostname: windows.computerName,
      osVersion: windows.displayVersion,
      appVersion: packageInfo.version,
    );
  }

  Future<Map<String, dynamic>> _authedGet(String path) async {
    var accessToken = await _tokenStore.getAccessToken();
    if (accessToken == null) {
      throw Exception("No access token.");
    }

    var res = await http.get(
      Uri.parse("$baseUrl$path"),
      headers: {"Authorization": "Bearer $accessToken"},
    );

    if (res.statusCode == 401) {
      accessToken = await _refreshToken();
      res = await http.get(
        Uri.parse("$baseUrl$path"),
        headers: {"Authorization": "Bearer $accessToken"},
      );
    }

    if (res.statusCode >= 400) {
      throw Exception("Request failed: ${res.body}");
    }

    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _authedPost(String path, Map<String, dynamic> body) async {
    var accessToken = await _tokenStore.getAccessToken();
    if (accessToken == null) {
      throw Exception("No access token.");
    }

    var res = await http.post(
      Uri.parse("$baseUrl$path"),
      headers: {
        "Authorization": "Bearer $accessToken",
        "Content-Type": "application/json",
      },
      body: jsonEncode(body),
    );

    if (res.statusCode == 401) {
      accessToken = await _refreshToken();
      res = await http.post(
        Uri.parse("$baseUrl$path"),
        headers: {
          "Authorization": "Bearer $accessToken",
          "Content-Type": "application/json",
        },
        body: jsonEncode(body),
      );
    }

    if (res.statusCode >= 400) {
      throw Exception("Request failed: ${res.body}");
    }

    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _authedPatch(String path, Map<String, dynamic> body) async {
    var accessToken = await _tokenStore.getAccessToken();
    if (accessToken == null) {
      throw Exception("No access token.");
    }

    var res = await http.patch(
      Uri.parse("$baseUrl$path"),
      headers: {
        "Authorization": "Bearer $accessToken",
        "Content-Type": "application/json",
      },
      body: jsonEncode(body),
    );

    if (res.statusCode == 401) {
      accessToken = await _refreshToken();
      res = await http.patch(
        Uri.parse("$baseUrl$path"),
        headers: {
          "Authorization": "Bearer $accessToken",
          "Content-Type": "application/json",
        },
        body: jsonEncode(body),
      );
    }

    if (res.statusCode >= 400) {
      throw Exception("Request failed: ${res.body}");
    }

    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<void> _authedDelete(String path) async {
    var accessToken = await _tokenStore.getAccessToken();
    if (accessToken == null) {
      throw Exception("No access token.");
    }

    var res = await http.delete(
      Uri.parse("$baseUrl$path"),
      headers: {"Authorization": "Bearer $accessToken"},
    );

    if (res.statusCode == 401) {
      accessToken = await _refreshToken();
      res = await http.delete(
        Uri.parse("$baseUrl$path"),
        headers: {"Authorization": "Bearer $accessToken"},
      );
    }

    if (res.statusCode >= 400) {
      throw Exception("Request failed: ${res.body}");
    }
  }

  Future<String> _refreshToken() async {
    final refreshToken = await _tokenStore.getRefreshToken();
    if (refreshToken == null) {
      throw Exception("No refresh token.");
    }

    final res = await http.post(
      Uri.parse("$baseUrl/auth/refresh"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"refreshToken": refreshToken}),
    );
    if (res.statusCode >= 400) {
      throw Exception("Refresh failed: ${res.body}");
    }

    final json = jsonDecode(res.body) as Map<String, dynamic>;
    await _tokenStore.saveTokens(json["accessToken"], json["refreshToken"]);
    return json["accessToken"] as String;
  }
}
