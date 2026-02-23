import "dart:convert";
import "package:flutter/material.dart";
import "../widgets/attendance_bar_chart.dart";

enum _EmployeesTab {
  employees,
  workHistory,
  skills,
  education,
  certifications,
  languages,
  dependents,
  contacts,
  deactivated,
  archived,
}

class EmployeesScreen extends StatefulWidget {
  const EmployeesScreen({
    super.key,
    required this.users,
    required this.selectedUser,
    required this.selectedUserAttendance,
    required this.isAdmin,
    required this.employeeChartDays,
    required this.onEmployeeChartDaysChanged,
    required this.onRefresh,
    required this.onCreateUser,
    required this.onUpdateUser,
    required this.onUserSelected,
  });

  final List<dynamic> users;
  final bool isAdmin;
  final Map<String, dynamic>? selectedUser;
  final Map<String, dynamic> selectedUserAttendance;
  final int employeeChartDays;
  final void Function(int days) onEmployeeChartDaysChanged;
  final Future<void> Function() onRefresh;
  final Future<void> Function(Map<String, dynamic>) onCreateUser;
  final Future<void> Function(String userId, Map<String, dynamic>) onUpdateUser;
  final void Function(Map<String, dynamic> user) onUserSelected;

  @override
  State<EmployeesScreen> createState() => _EmployeesScreenState();
}

class _EmployeesScreenState extends State<EmployeesScreen> {
  _EmployeesTab _activeTab = _EmployeesTab.employees;
  final _search = TextEditingController();
  int _selectedIndex = 0;
  final List<Map<String, String>> _demoEmployees = const [];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _openCreateUserDialog(BuildContext context) async {
    final email = TextEditingController();
    final password = TextEditingController();
    final displayName = TextEditingController();
    final employeeCode = TextEditingController();
    final roleNames = TextEditingController(text: "employee");

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Add a New Employee"),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: email, decoration: const InputDecoration(labelText: "Email", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: "Password", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: displayName, decoration: const InputDecoration(labelText: "Display Name", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: employeeCode, decoration: const InputDecoration(labelText: "Employee Code", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: roleNames, decoration: const InputDecoration(labelText: "Roles (comma-separated)", border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
              try {
                await widget.onCreateUser({
                  "email": email.text.trim(),
                  "password": password.text.trim(),
                  "displayName": displayName.text.trim(),
                  "employeeCode": employeeCode.text.trim(),
                  "roleNames": roleNames.text.trim().split(",").map((s) => s.trim()).where((s) => s.isNotEmpty).toList(),
                });
                if (context.mounted) Navigator.pop(context);
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
                }
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Future<void> _openEditDialog(BuildContext context, Map<String, dynamic> user) async {
    final profile = user["profile"] as Map<String, dynamic>? ?? {};
    final displayName = TextEditingController(text: profile["displayName"]?.toString() ?? "");
    final employeeCode = TextEditingController(text: profile["employeeCode"]?.toString() ?? "");
    final department = TextEditingController(text: profile["department"]?.toString() ?? "");
    final jobTitle = TextEditingController(text: profile["jobTitle"]?.toString() ?? "");
    final manager = TextEditingController(text: profile["manager"]?.toString() ?? "");
    final timezone = TextEditingController(text: profile["timezone"]?.toString() ?? "Asia/Kolkata");

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Edit Employee"),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: displayName, decoration: const InputDecoration(labelText: "Display Name", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: employeeCode, decoration: const InputDecoration(labelText: "Employee Code", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: department, decoration: const InputDecoration(labelText: "Department", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: jobTitle, decoration: const InputDecoration(labelText: "Job Title", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: manager, decoration: const InputDecoration(labelText: "Manager", border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: timezone, decoration: const InputDecoration(labelText: "Timezone", border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
              await widget.onUpdateUser(user["_id"].toString(), {
                "profile": {
                  "displayName": displayName.text.trim(),
                  "employeeCode": employeeCode.text.trim(),
                  "department": department.text.trim(),
                  "jobTitle": jobTitle.text.trim(),
                  "manager": manager.text.trim(),
                  "timezone": timezone.text.trim(),
                },
              });
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final query = _search.text.trim().toLowerCase();
    final visible = _demoEmployees.where((e) => e["name"]!.toLowerCase().contains(query)).toList();
    final selected = visible.isEmpty ? null : visible[_selectedIndex.clamp(0, visible.length - 1)];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (widget.isAdmin)
                ElevatedButton.icon(
                  onPressed: () => _openCreateUserDialog(context),
                  icon: const Icon(Icons.add),
                  label: const Text("Add a New Employee"),
                ),
              if (widget.isAdmin) const SizedBox(width: 10),
              OutlinedButton(onPressed: widget.onRefresh, child: const Text("Refresh")),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 450,
            child: Row(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: widget.users.length,
                    itemBuilder: (context, index) {
                      final user = widget.users[index] as Map<String, dynamic>;
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
                        onTap: () => widget.onUserSelected(user),
                      );
                    },
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
                    child: widget.users.isEmpty
                        ? const Center(child: Text("No employees found"))
                        : widget.selectedUser != null
                            ? _EmployeeDetailCard(
                                user: widget.selectedUser!,
                                attendance: widget.selectedUserAttendance,
                                isAdmin: widget.isAdmin,
                                employeeChartDays: widget.employeeChartDays,
                                onEmployeeChartDaysChanged: widget.onEmployeeChartDaysChanged,
                                onEdit: () => _openEditDialog(context, widget.selectedUser!),
                                onRefresh: widget.onRefresh,
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
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            padding: const EdgeInsets.all(12),
            child: _activeTab == _EmployeesTab.employees ? _buildEmployeesMain(selected, visible) : _buildBlankTableForTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildEmployeesMain(Map<String, String>? selected, List<Map<String, String>> visible) {
    return Column(
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ElevatedButton.icon(
              onPressed: widget.isAdmin ? () => _openCreateUserDialog(context) : null,
              icon: const Icon(Icons.person_add_alt_1_outlined),
              label: const Text("Invite / Add Employee")
            ),
            OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt_outlined), label: const Text("Filter Employees")),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 620,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 340,
                decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    TextField(
                      controller: _search,
                      onChanged: (_) => setState(() => _selectedIndex = 0),
                      decoration: const InputDecoration(
                        hintText: "Search by Name",
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: ListView.builder(
                        itemCount: visible.length,
                        itemBuilder: (context, index) {
                          final item = visible[index];
                          final active = index == _selectedIndex;
                          return ListTile(
                            tileColor: active ? const Color(0xFFEFF6FF) : null,
                            leading: CircleAvatar(child: Text(item["name"]!.substring(0, 1).toUpperCase())),
                            title: Text(item["name"]!),
                            subtitle: Text("${item["department"]} | ${item["jobTitle"]}"),
                            onTap: () => setState(() => _selectedIndex = index),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
                  padding: const EdgeInsets.all(14),
                  child: selected == null
                      ? const Center(child: Text("No employee selected"))
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(selected["name"]!, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 14),
                            _line("Employee Number", selected["employeeNumber"]!),
                            _line("Email", selected["email"]!),
                            _line("Phone", selected["phone"]!),
                            _line("Timezone", selected["timezone"]!),
                            _line("Department", selected["department"]!),
                            _line("Job Title", selected["jobTitle"]!),
                            _line("Manager", selected["manager"]!),
                            _line("Nationality", selected["nationality"]!),
                            _line("Date of Birth", selected["dob"]!),
                            _line("Gender", selected["gender"]!),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _line(String k, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text("$k: $v", style: const TextStyle(fontSize: 16)),
      );

  Widget _buildBlankTableForTab() {
    final columns = switch (_activeTab) {
      _EmployeesTab.workHistory => const ["Employee", "Job Title", "Start Date", "End Date", "Department", "Manager", "Employment Status", "Actions"],
      _EmployeesTab.skills => const ["Employee", "Skill", "Details", "Actions"],
      _EmployeesTab.education => const ["Employee", "Qualification", "Institute", "Start Date", "Completed On", "Actions"],
      _EmployeesTab.certifications => const ["Employee", "Certification", "Institute", "Granted On", "Valid Until", "Actions"],
      _EmployeesTab.languages => const ["Employee", "Language", "Reading", "Speaking", "Writing", "Listening", "Actions"],
      _EmployeesTab.dependents => const ["Employee", "Name", "Relationship", "Date of Birth", "Id Number", "Actions"],
      _EmployeesTab.contacts => const ["Employee", "Name", "Relationship", "Home Phone", "Work Phone", "Mobile Phone", "Actions"],
      _EmployeesTab.deactivated => const ["Employee Number", "First Name", "Last Name", "Department", "Manager", "Actions"],
      _EmployeesTab.archived => const ["Employee Number", "First Name", "Last Name", "Department", "Manager", "Actions"],
      _ => const ["Actions"],
    };
    return Column(
      children: [
        Row(
          children: [
            if (_activeTab != _EmployeesTab.deactivated && _activeTab != _EmployeesTab.archived)
              ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add_circle_outline), label: const Text("Add New")),
            if (_activeTab != _EmployeesTab.deactivated && _activeTab != _EmployeesTab.archived) const SizedBox(width: 8),
            OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt_outlined), label: const Text("Filters")),
            const Spacer(),
            const SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "input search text", border: OutlineInputBorder()))),
          ],
        ),
      ],
    );
  }
}

class _EmployeeDetailCard extends StatelessWidget {
  const _EmployeeDetailCard({
    required this.user,
    required this.attendance,
    required this.isAdmin,
    required this.employeeChartDays,
    required this.onEmployeeChartDaysChanged,
    required this.onEdit,
    required this.onRefresh,
  });
  final Map<String, dynamic> user;
  final Map<String, dynamic> attendance;
  final bool isAdmin;
  final int employeeChartDays;
  final void Function(int days) onEmployeeChartDaysChanged;
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
            title: "Hours Worked - Last $employeeChartDays Days",
            chartHeight: 180,
            selectedDays: employeeChartDays,
            onDaysChanged: onEmployeeChartDaysChanged,
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

