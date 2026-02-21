import "package:flutter/material.dart";

class AdminScreen extends StatelessWidget {
  const AdminScreen({
    super.key,
    required this.loading,
    required this.roles,
    required this.events,
    required this.awayAlerts,
    required this.onRefresh,
    required this.onCreateRole,
    required this.onCreateUser,
    required this.onEnrollFace,
  });

  final bool loading;
  final List<dynamic> roles;
  final List<dynamic> events;
  final List<dynamic> awayAlerts;
  final Future<void> Function() onRefresh;
  final Future<void> Function(String name, String description, List<String> permissions) onCreateRole;
  final Future<void> Function(Map<String, dynamic> payload) onCreateUser;
  final Future<void> Function(String userId, String imageBase64) onEnrollFace;

  @override
  Widget build(BuildContext context) {
    final roleNameController = TextEditingController(text: "employee");
    final rolePermController = TextEditingController(text: "attendance:read");
    final userEmailController = TextEditingController();
    final userPasswordController = TextEditingController(text: "Employee123!");
    final userNameController = TextEditingController();
    final userCodeController = TextEditingController();
    final userRolesController = TextEditingController(text: "employee");
    final enrollUserIdController = TextEditingController();
    final enrollImageController = TextEditingController(text: "face-capture-placeholder");

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text("Admin Console", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: loading ? null : onRefresh,
                child: const Text("Refresh"),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Create Role", style: TextStyle(fontWeight: FontWeight.w600)),
                  TextField(controller: roleNameController, decoration: const InputDecoration(labelText: "Role name")),
                  TextField(
                    controller: rolePermController,
                    decoration: const InputDecoration(labelText: "Permissions (comma separated resource:action)"),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: loading
                        ? null
                        : () async {
                            await onCreateRole(
                              roleNameController.text.trim(),
                              "${roleNameController.text.trim()} role",
                              rolePermController.text
                                  .split(",")
                                  .map((e) => e.trim())
                                  .where((e) => e.isNotEmpty)
                                  .toList(),
                            );
                          },
                    child: const Text("Save Role"),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Create User", style: TextStyle(fontWeight: FontWeight.w600)),
                  TextField(controller: userEmailController, decoration: const InputDecoration(labelText: "Email")),
                  TextField(controller: userPasswordController, decoration: const InputDecoration(labelText: "Password")),
                  TextField(controller: userNameController, decoration: const InputDecoration(labelText: "Display name")),
                  TextField(controller: userCodeController, decoration: const InputDecoration(labelText: "Employee code")),
                  TextField(controller: userRolesController, decoration: const InputDecoration(labelText: "Roles (comma separated)")),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: loading
                        ? null
                        : () async {
                            await onCreateUser({
                              "email": userEmailController.text.trim(),
                              "password": userPasswordController.text,
                              "displayName": userNameController.text.trim(),
                              "employeeCode": userCodeController.text.trim(),
                              "roleNames": userRolesController.text
                                  .split(",")
                                  .map((e) => e.trim())
                                  .where((e) => e.isNotEmpty)
                                  .toList(),
                            });
                          },
                    child: const Text("Create User"),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Enroll Face Template", style: TextStyle(fontWeight: FontWeight.w600)),
                  TextField(controller: enrollUserIdController, decoration: const InputDecoration(labelText: "User ID")),
                  TextField(controller: enrollImageController, decoration: const InputDecoration(labelText: "Image Base64")),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: loading
                        ? null
                        : () async {
                            await onEnrollFace(
                              enrollUserIdController.text.trim(),
                              enrollImageController.text.trim(),
                            );
                          },
                    child: const Text("Enroll Face"),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text("Roles", style: TextStyle(fontWeight: FontWeight.w600)),
          ...roles.map((role) => ListTile(
                title: Text(role["name"]?.toString() ?? "-"),
                subtitle: Text((role["permissions"] as List<dynamic>? ?? []).join(", ")),
              )),
          const SizedBox(height: 12),
          if (awayAlerts.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber, color: Colors.orange.shade800),
                      const SizedBox(width: 8),
                      Text("Employees Away > 15 min", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.orange.shade900)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...awayAlerts.take(10).map((a) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(a["employeeEmail"]?.toString() ?? "-"),
                    subtitle: Text(a["awayAt"]?.toString() ?? "-"),
                  )),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          const Text("Recent Attendance Events (IP & Device)", style: TextStyle(fontWeight: FontWeight.w600)),
          ...events.take(20).map(
                (event) {
                  final user = event["userId"] as Map<String, dynamic>?;
                  final profile = user?["profile"] as Map<String, dynamic>?;
                  final email = user?["email"] ?? profile?["displayName"] ?? "-";
                  final device = event["deviceId"] as Map<String, dynamic>?;
                  final hostname = device?["hostname"] ?? "-";
                  final osVersion = device?["osVersion"] ?? "";
                  final geo = event["geo"] as Map<String, dynamic>?;
                  final geoStr = geo != null && (geo["country"]?.toString().isNotEmpty == true)
                      ? "${geo["country"]}${geo["city"] != null && geo["city"].toString().isNotEmpty ? ", ${geo["city"]}" : ""}"
                      : "";
                  return ListTile(
                    title: Text("${event["type"] ?? "-"} | $email"),
                    subtitle: Text(
                      "IP: ${event["ip"] ?? "-"}${geoStr.isNotEmpty ? " | $geoStr" : ""}\n"
                      "Device: $hostname${osVersion.toString().isNotEmpty ? " ($osVersion)" : ""}",
                    ),
                    isThreeLine: true,
                  );
                },
              ),
        ],
      ),
    );
  }
}
