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
    String systemName = "Windows Native Client";
    String publicIp = "";

    try {
      final windows = await DeviceInfoPlugin().windowsInfo;
      systemName =
          "Windows ${windows.displayVersion} (${windows.computerName})";
    } catch (_) {}

    try {
      final ipRes =
          await http.get(Uri.parse("https://api.ipify.org?format=json"));
      if (ipRes.statusCode == 200) {
        publicIp = jsonDecode(ipRes.body)["ip"] as String;
      }
    } catch (_) {}

    final res = await http.post(
      Uri.parse("$baseUrl/auth/login"),
      headers: {
        "Content-Type": "application/json",
        "X-Device-System": systemName,
        if (publicIp.isNotEmpty) "X-Public-Ip": publicIp,
      },
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

  /// Use right after login with the accessToken from the response so we don't rely on
  /// token store read-after-write (avoids enroll shown every time on some platforms).
  Future<bool> hasFaceTemplateWithToken(String accessToken) async {
    final res = await http.get(
      Uri.parse("$baseUrl/auth/face-status"),
      headers: {"Authorization": "Bearer $accessToken"},
    );
    if (res.statusCode >= 400) {
      throw Exception("Request failed: ${res.body}");
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    return (json["hasTemplate"] ?? false) as bool;
  }

  Future<void> verifyFaceForLogin(String imageBase64) async {
    final json = await _authedPost("/auth/verify-face", {
      "imageBase64": imageBase64,
    });
    if (json["ok"] != true) {
      throw Exception(json["message"] ?? "Face verification failed.");
    }
  }

  /// Returns message and employeeCode when no images; or use enrollMyFaceWithImages for in-app registration.
  Future<Map<String, dynamic>> getEnrollFaceInfo() async {
    return _authedPost("/auth/enroll-face", {});
  }

  /// Register face in-app: send 5–15 base64 images to LBPH via Next.js.
  Future<Map<String, dynamic>> enrollMyFaceWithImages(List<String> imageBase64List) async {
    final json = await _authedPost("/auth/enroll-face", {
      "imageBase64List": imageBase64List,
    });
    if (json["ok"] != true) {
      throw Exception(json["message"] ?? "Face registration failed.");
    }
    return json;
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

  Future<void> clockIn(String imageBase64) async {
    await _clockWithMessage("/attendance/clock-in", imageBase64);
  }

  Future<List<dynamic>> fetchLoginHistory({int days = 7}) async {
    final json = await _authedGet("/auth/login-history?days=$days");
    return (json["history"] ?? []) as List<dynamic>;
  }

  Future<List<dynamic>> fetchAdminLoginHistory({int days = 7}) async {
    final json = await _authedGet("/admin/login-history?days=$days");
    return (json["history"] ?? []) as List<dynamic>;
  }

  Future<void> clockOut(String imageBase64) async {
    await _clockWithMessage("/attendance/clock-out", imageBase64);
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

  Future<Map<String, dynamic>> fetchUserAttendance(String userId,
      {int days = 30}) async {
    final json = await _authedGet("/admin/users/$userId/attendance?days=$days");
    return json as Map<String, dynamic>;
  }

  Future<List<dynamic>> fetchRoles() async {
    final json = await _authedGet("/admin/roles");
    return (json["roles"] ?? []) as List<dynamic>;
  }

  Future<void> createRole(
      String name, String description, List<String> permissions) async {
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

  /// Returns server message and employeeCode; face registration is via register_face.py.
  Future<Map<String, dynamic>> enrollFace(String userId, String imageBase64) async {
    return _authedPost("/face/enroll", {
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

  Future<Map<String, dynamic>> updateUser(
      String userId, Map<String, dynamic> payload) async {
    return _authedPatch("/admin/users/$userId", payload);
  }

  Future<List<dynamic>> fetchCompanyStructures() async {
    final json = await _authedGet("/admin/company-structures");
    return (json["rows"] ?? []) as List<dynamic>;
  }

  Future<void> createCompanyStructure(Map<String, dynamic> payload) async {
    await _authedPost("/admin/company-structures", payload);
  }

  Future<void> updateCompanyStructure(
      String id, Map<String, dynamic> payload) async {
    await _authedPatch("/admin/company-structures/$id", payload);
  }

  Future<void> deleteCompanyStructure(String id) async {
    await _authedDelete("/admin/company-structures/$id");
  }

  Future<void> _clockWithMessage(String path, String imageBase64) async {
    final payload = await _buildClockPayload(imageBase64);
    var accessToken = await _tokenStore.getAccessToken();
    if (accessToken == null) throw Exception("No access token.");
    var res = await http.post(
      Uri.parse("$baseUrl$path"),
      headers: {"Authorization": "Bearer $accessToken", "Content-Type": "application/json"},
      body: jsonEncode(payload.toJson()),
    );
    if (res.statusCode == 401) {
      accessToken = await _refreshToken();
      res = await http.post(
        Uri.parse("$baseUrl$path"),
        headers: {"Authorization": "Bearer $accessToken", "Content-Type": "application/json"},
        body: jsonEncode(payload.toJson()),
      );
    }
    if (res.statusCode >= 400) {
      String msg = "Request failed.";
      try {
        final json = jsonDecode(res.body) as Map<String, dynamic>?;
        if (json != null && json["message"] != null) msg = json["message"].toString();
      } catch (_) {}
      throw Exception(msg);
    }
  }

  Future<ClockPayload> _buildClockPayload(String imageBase64) async {
    String deviceId = "";
    String hostname = "unknown";
    String osVersion = "unknown";
    String appVersion = "1.0";
    try {
      final windows = await DeviceInfoPlugin().windowsInfo;
      final packageInfo = await PackageInfo.fromPlatform();
      deviceId = windows.deviceId.isNotEmpty ? windows.deviceId : "win-${windows.computerName}";
      hostname = windows.computerName.isNotEmpty ? windows.computerName : "Windows";
      osVersion = windows.displayVersion.isNotEmpty ? windows.displayVersion : "10";
      appVersion = packageInfo.version.isNotEmpty ? packageInfo.version : "1.0";
      if (deviceId.length < 3) deviceId = "win-$hostname";
    } catch (_) {
      deviceId = "win-unknown";
    }
    return ClockPayload(
      imageBase64: imageBase64,
      deviceFingerprint: deviceId,
      hostname: hostname,
      osVersion: osVersion,
      appVersion: appVersion,
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

  Future<Map<String, dynamic>> _authedPost(
      String path, Map<String, dynamic> body) async {
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

  Future<Map<String, dynamic>> _authedPatch(
      String path, Map<String, dynamic> body) async {
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
