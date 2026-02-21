import "package:flutter/material.dart";

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
    required this.onRefresh,
    required this.onCreateUser,
    required this.onUpdateUser,
  });

  final List<dynamic> users;
  final Future<void> Function() onRefresh;
  final Future<void> Function(Map<String, dynamic> payload) onCreateUser;
  final Future<void> Function(String userId, Map<String, dynamic> payload) onUpdateUser;

  @override
  State<EmployeesScreen> createState() => _EmployeesScreenState();
}

class _EmployeesScreenState extends State<EmployeesScreen> {
  _EmployeesTab _activeTab = _EmployeesTab.employees;
  final _search = TextEditingController();
  int _selectedIndex = 0;
  final List<Map<String, String>> _demoEmployees = const [
    {
      "name": "test employee",
      "employeeNumber": "A9132",
      "email": "test.employee@example.com",
      "phone": "9876543210",
      "timezone": "Asia/Kolkata",
      "department": "Engineering",
      "jobTitle": "QA Analyst",
      "manager": "test manager",
      "nationality": "Indian",
      "dob": "1998-04-16",
      "gender": "Male",
    },
  ];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
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
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _EmployeesTab.values.map((tab) {
                final title = switch (tab) {
                  _EmployeesTab.employees => "Employees",
                  _EmployeesTab.workHistory => "Work History",
                  _EmployeesTab.skills => "Skills",
                  _EmployeesTab.education => "Education",
                  _EmployeesTab.certifications => "Certifications",
                  _EmployeesTab.languages => "Languages",
                  _EmployeesTab.dependents => "Dependents",
                  _EmployeesTab.contacts => "Contacts",
                  _EmployeesTab.deactivated => "Deactivated",
                  _EmployeesTab.archived => "Archived",
                };
                return InkWell(
                  onTap: () => setState(() => _activeTab = tab),
                  child: Container(
                    height: 50,
                    padding: const EdgeInsets.symmetric(horizontal: 22),
                    decoration: BoxDecoration(
                      color: _activeTab == tab ? const Color(0xFFF8FAFC) : Colors.transparent,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    alignment: Alignment.center,
                    child: Text(title, style: const TextStyle(fontSize: 16)),
                  ),
                );
              }).toList(),
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
        Row(
          children: [
            ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.send_outlined), label: const Text("Invite an Employee")),
            const SizedBox(width: 8),
            OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.person_add_alt_1_outlined), label: const Text("Add a New Employee")),
            const SizedBox(width: 8),
            OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt_outlined), label: const Text("Filter Employees")),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 620,
          child: Row(
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
        const SizedBox(height: 10),
        Container(
          height: 380,
          width: double.infinity,
          decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(
            children: [
              Container(
                color: const Color(0xFFF3F4F6),
                padding: const EdgeInsets.all(12),
                child: Row(children: columns.map((c) => Expanded(child: Text(c, style: const TextStyle(fontWeight: FontWeight.w700)))).toList()),
              ),
              const Expanded(child: Center(child: Text("No data", style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 24)))),
            ],
          ),
        ),
      ],
    );
  }
}

