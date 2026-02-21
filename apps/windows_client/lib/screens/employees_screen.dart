import "dart:convert";
import "package:flutter/material.dart";
import "../widgets/attendance_bar_chart.dart";

class EmployeesScreen extends StatelessWidget {
  const EmployeesScreen({
    super.key,
    required this.users,
    required this.selectedUser,
    required this.selectedUserAttendance,
    required this.isAdmin,
    required this.onRefresh,
    required this.onCreateUser,
    required this.onUpdateUser,
    required this.onUserSelected,
  });

  final List<dynamic> users;
  final bool isAdmin;
  final Map<String, dynamic>? selectedUser;
  final Map<String, dynamic> selectedUserAttendance;
  final Future<void> Function() onRefresh;
  final Future<void> Function(Map<String, dynamic>) onCreateUser;
  final Future<void> Function(String userId, Map<String, dynamic>) onUpdateUser;
  final void Function(Map<String, dynamic> user) onUserSelected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (isAdmin)
                ElevatedButton.icon(
                  onPressed: () => _openCreateUserDialog(context),
                  icon: const Icon(Icons.add),
                  label: const Text("Add a New Employee"),
                ),
              if (isAdmin) const SizedBox(width: 10),
              OutlinedButton(onPressed: onRefresh, child: const Text("Refresh")),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ListView.builder(
                      itemCount: users.length,
                      itemBuilder: (context, index) {
                        final user = users[index] as Map<String, dynamic>;
                        final profile = (user["profile"] as Map<String, dynamic>? ?? {});
                        final photoB64 = profile["profilePictureBase64"]?.toString() ?? "";
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundImage: photoB64.isNotEmpty
                                ? MemoryImage(base64Decode(photoB64))
                                : null,
                            child: photoB64.isEmpty
                                ? Text(
                                    (profile["displayName"]?.toString().isNotEmpty ?? false)
                                        ? profile["displayName"].toString().substring(0, 1).toUpperCase()
                                        : "U",
                                  )
                                : null,
                          ),
                          title: Text(profile["displayName"]?.toString().isNotEmpty == true ? profile["displayName"].toString() : user["email"].toString()),
                          subtitle: Text("${profile["employeeCode"] ?? "-"} | ${user["email"]}"),
                          onTap: () => onUserSelected(user),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: users.isEmpty
                        ? const Center(child: Text("No employees found"))
                        : selectedUser != null
                            ? _EmployeeDetailCard(
                                user: selectedUser!,
                                attendance: selectedUserAttendance,
                                isAdmin: isAdmin,
                                onEdit: () => _openEditDialog(context, selectedUser!),
                                onRefresh: onRefresh,
                              )
                            : Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.person_outline, size: 48, color: Color(0xFF9CA3AF)),
                                    const SizedBox(height: 12),
                                    const Text("Select an employee to view details and attendance"),
                                  ],
                                ),
                              ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openCreateUserDialog(BuildContext context) async {
    final employeeCode = TextEditingController();
    final firstName = TextEditingController();
    final lastName = TextEditingController();
    final email = TextEditingController();
    final password = TextEditingController(text: "Employee123!");
    final nationality = TextEditingController();
    final dob = TextEditingController();
    final gender = TextEditingController();
    final maritalStatus = TextEditingController();
    final jobTitle = TextEditingController();
    final department = TextEditingController();
    final manager = TextEditingController();
    int step = 0;

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text("Employee"),
          content: SizedBox(
            width: 700,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: List.generate(
                    5,
                    (i) => Expanded(
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: i <= step ? const Color(0xFF2196F3) : const Color(0xFFE5E7EB),
                            child: Text("${i + 1}", style: TextStyle(color: i <= step ? Colors.white : Colors.black54, fontSize: 12)),
                          ),
                          if (i != 4) const Expanded(child: Divider()),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                if (step == 0) ...[
                  _field("Employee Number", employeeCode),
                  _field("First Name", firstName),
                  _field("Last Name", lastName),
                  _field("Email", email),
                  _field("Password", password),
                  _field("Nationality", nationality),
                  _field("Date of Birth", dob),
                  _field("Gender", gender),
                  _field("Marital Status", maritalStatus),
                ] else if (step == 1) ...[
                  _field("Identification Number", TextEditingController()),
                ] else if (step == 2) ...[
                  _field("Job Title", jobTitle),
                  _field("Department", department),
                  _field("Manager", manager),
                ] else if (step == 3) ...[
                  _field("Phone", TextEditingController()),
                  _field("Timezone", TextEditingController(text: "Asia/Kolkata")),
                ] else ...[
                  const Text("Review and save employee details."),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            if (step > 0)
              TextButton(
                onPressed: () => setState(() => step -= 1),
                child: const Text("Back"),
              ),
            ElevatedButton(
              onPressed: () async {
                if (step < 4) {
                  setState(() => step += 1);
                  return;
                }
                await onCreateUser({
                  "email": email.text.trim(),
                  "password": password.text,
                  "displayName": "${firstName.text.trim()} ${lastName.text.trim()}".trim(),
                  "employeeCode": employeeCode.text.trim(),
                  "roleNames": ["employee"],
                  "profile": {
                    "firstName": firstName.text.trim(),
                    "lastName": lastName.text.trim(),
                    "nationality": nationality.text.trim(),
                    "dateOfBirth": dob.text.trim(),
                    "gender": gender.text.trim(),
                    "maritalStatus": maritalStatus.text.trim(),
                    "jobTitle": jobTitle.text.trim(),
                    "department": department.text.trim(),
                    "manager": manager.text.trim(),
                  }
                });
                if (context.mounted) Navigator.pop(context);
              },
              child: Text(step < 4 ? "Next" : "Save"),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openEditDialog(BuildContext context, Map<String, dynamic> user) async {
    final profile = (user["profile"] as Map<String, dynamic>? ?? {});
    final displayName = TextEditingController(text: profile["displayName"]?.toString() ?? "");
    final department = TextEditingController(text: profile["department"]?.toString() ?? "");
    final jobTitle = TextEditingController(text: profile["jobTitle"]?.toString() ?? "");
    final manager = TextEditingController(text: profile["manager"]?.toString() ?? "");

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Edit Employee"),
        content: SizedBox(
          width: 500,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _field("Display Name", displayName),
              _field("Department", department),
              _field("Job Title", jobTitle),
              _field("Manager", manager),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
              await onUpdateUser(user["_id"].toString(), {
                "profile": {
                  "displayName": displayName.text.trim(),
                  "department": department.text.trim(),
                  "jobTitle": jobTitle.text.trim(),
                  "manager": manager.text.trim(),
                }
              });
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Widget _field(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
        ),
      ),
    );
  }
}

class _EmployeeDetailCard extends StatelessWidget {
  const _EmployeeDetailCard({
    required this.user,
    required this.attendance,
    required this.isAdmin,
    required this.onEdit,
    required this.onRefresh,
  });
  final Map<String, dynamic> user;
  final Map<String, dynamic> attendance;
  final bool isAdmin;
  final VoidCallback onEdit;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final profile = (user["profile"] as Map<String, dynamic>? ?? {});
    final hoursByDay = (attendance["hoursByDay"] as List<dynamic>? ?? []);
    final sessions = (attendance["sessions"] as List<dynamic>? ?? []);
    final photoB64 = profile["profilePictureBase64"]?.toString() ?? "";

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundImage: photoB64.isNotEmpty ? MemoryImage(base64Decode(photoB64)) : null,
                child: photoB64.isEmpty
                    ? Text(
                        (profile["displayName"]?.toString().isNotEmpty ?? false)
                            ? profile["displayName"].toString().substring(0, 1).toUpperCase()
                            : "?",
                        style: const TextStyle(fontSize: 24),
                      )
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile["displayName"]?.toString().isNotEmpty == true
                          ? profile["displayName"].toString()
                          : user["email"].toString(),
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              if (isAdmin)
                OutlinedButton.icon(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text("Edit"),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text("Employee Number: ${profile["employeeCode"] ?? "-"}"),
          Text("Email: ${user["email"]}"),
          Text("Timezone: ${profile["timezone"] ?? "Asia/Kolkata"}"),
          const SizedBox(height: 16),
          const Text("Basic Information", style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text("Department: ${profile["department"] ?? "-"}"),
          Text("Job Title: ${profile["jobTitle"] ?? "-"}"),
          Text("Manager: ${profile["manager"] ?? "-"}"),
          Text("Nationality: ${profile["nationality"] ?? "-"}"),
          const SizedBox(height: 24),
          const Text("Attendance (Hours by Day)", style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          AttendanceBarChart(
            hoursByDay: hoursByDay,
            title: "Hours Worked - Last 30 Days",
            chartHeight: 180,
          ),
          const SizedBox(height: 24),
          const Text("Recent Sessions", style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          if (sessions.isEmpty)
            const Text("No sessions")
          else
            ...sessions.take(15).map((s) => ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              title: Text("In: ${s["clockInAt"] ?? "-"}"),
              subtitle: Text("Out: ${s["clockOutAt"] ?? "-"}"),
              trailing: Text("${(s["totalSeconds"] ?? 0)}s"),
            )),
        ],
      ),
    );
  }
}
