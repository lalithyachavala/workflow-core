import "package:flutter/material.dart";

class SystemPermissionsScreen extends StatefulWidget {
  const SystemPermissionsScreen({super.key});
  @override
  State<SystemPermissionsScreen> createState() => _SystemPermissionsScreenState();
}

class _SystemPermissionsScreenState extends State<SystemPermissionsScreen> {
  int page = 1;
  final pages = <int, List<(String, String, String, String)>>{
    1: const [
      ("Manager", "Admin clients", "Add Clients", "No"),
      ("Manager", "Admin clients", "Edit Clients", "Yes"),
      ("Manager", "Admin clients", "Delete Clients", "No"),
      ("Manager", "Admin company_structure", "Add Company Structure", "No"),
      ("Manager", "Admin company_structure", "Edit Company Structure", "No"),
      ("Manager", "Admin company_structure", "Delete Company Structure", "No"),
      ("Manager", "Admin projects", "Add Projects", "Yes"),
      ("Manager", "Admin projects", "Edit Projects", "Yes"),
      ("Manager", "Admin projects", "Delete Projects", "No"),
      ("Manager", "Admin qualifications", "Add Skills", "Yes"),
      ("Manager", "Admin qualifications", "Edit Skills", "Yes"),
      ("Manager", "Admin qualifications", "Delete Skills", "No"),
      ("Manager", "Admin qualifications", "Add Education", "Yes"),
      ("Manager", "Admin qualifications", "Edit Education", "Yes"),
      ("Manager", "Admin qualifications", "Delete Education", "No"),
    ],
    2: const [
      ("Manager", "Admin qualifications", "Add Certifications", "Yes"),
      ("Manager", "Admin qualifications", "Edit Certifications", "Yes"),
      ("Manager", "Admin qualifications", "Delete Certifications", "No"),
      ("Manager", "Admin qualifications", "Add Languages", "Yes"),
      ("Manager", "Admin qualifications", "Edit Languages", "Yes"),
      ("Manager", "Admin qualifications", "Delete Languages", "No"),
      ("Manager", "Personal Information dependents", "Add Dependents", "Yes"),
      ("Manager", "Personal Information dependents", "Edit Dependents", "Yes"),
      ("Manager", "Personal Information dependents", "Delete Dependents", "Yes"),
      ("Employee", "Personal Information dependents", "Add Dependents", "Yes"),
      ("Employee", "Personal Information dependents", "Edit Dependents", "Yes"),
      ("Employee", "Personal Information dependents", "Delete Dependents", "Yes"),
      ("Manager", "Documents documents", "Add Documents", "Yes"),
      ("Manager", "Documents documents", "Edit Documents", "Yes"),
      ("Manager", "Documents documents", "Delete Documents", "Yes"),
    ],
    3: const [
      ("Employee", "Documents documents", "Add Documents", "Yes"),
      ("Employee", "Documents documents", "Edit Documents", "Yes"),
      ("Employee", "Documents documents", "Delete Documents", "Yes"),
      ("Manager", "Personal Information emergency_contact", "Add Emergency Contacts", "Yes"),
      ("Manager", "Personal Information emergency_contact", "Edit Emergency Contacts", "Yes"),
      ("Manager", "Personal Information emergency_contact", "Delete Emergency Contacts", "Yes"),
      ("Employee", "Personal Information emergency_contact", "Add Emergency Contacts", "Yes"),
      ("Employee", "Personal Information emergency_contact", "Edit Emergency Contacts", "Yes"),
      ("Employee", "Personal Information emergency_contact", "Delete Emergency Contacts", "Yes"),
      ("Manager", "Personal Information employees", "Edit Employee Number", "No"),
      ("Manager", "Personal Information employees", "Edit EPF/CPF Number", "Yes"),
      ("Manager", "Personal Information employees", "Edit Employment Status", "No"),
      ("Manager", "Personal Information employees", "Edit Job Title", "Yes"),
      ("Manager", "Personal Information employees", "Edit Pay Grade", "Yes"),
      ("Manager", "Personal Information employees", "Edit Joined Date", "Yes"),
    ],
    4: const [
      ("Manager", "Personal Information employees", "Edit Department", "Yes"),
      ("Manager", "Personal Information employees", "Edit Work Email", "Yes"),
      ("Manager", "Personal Information employees", "Edit Country", "Yes"),
      ("Manager", "Personal Information employees", "Upload/Delete Profile Image", "Yes"),
      ("Manager", "Personal Information employees", "Edit Employee Details", "Yes"),
      ("Employee", "Personal Information employees", "Edit Employee Number", "No"),
      ("Employee", "Personal Information employees", "Edit EPF/CPF Number", "Yes"),
      ("Employee", "Personal Information employees", "Edit Employment Status", "No"),
      ("Employee", "Personal Information employees", "Edit Job Title", "No"),
      ("Employee", "Personal Information employees", "Edit Pay Grade", "No"),
      ("Employee", "Personal Information employees", "Edit Joined Date", "No"),
      ("Employee", "Personal Information employees", "Edit Department", "No"),
      ("Employee", "Personal Information employees", "Edit Work Email", "No"),
      ("Employee", "Personal Information employees", "Edit Country", "No"),
      ("Employee", "Personal Information employees", "Upload/Delete Profile Image", "Yes"),
    ],
    5: const [
      ("Employee", "Personal Information employees", "Edit Employee Details", "Yes"),
      ("Manager", "Finance salary", "Add Salary", "No"),
      ("Manager", "Finance salary", "Edit Salary", "No"),
      ("Manager", "Finance salary", "Delete Salary", "No"),
      ("Employee", "Finance salary", "Add Salary", "No"),
      ("Employee", "Finance salary", "Edit Salary", "No"),
      ("Employee", "Finance salary", "Delete Salary", "No"),
      ("Manager", "Travel Management travel", "Add Travel Request", "Yes"),
      ("Manager", "Travel Management travel", "Edit Travel Request", "Yes"),
      ("Manager", "Travel Management travel", "Delete Travel Request", "Yes"),
      ("Employee", "Travel Management travel", "Add Travel Request", "Yes"),
      ("Employee", "Travel Management travel", "Edit Travel Request", "Yes"),
      ("Employee", "Travel Management travel", "Delete Travel Request", "Yes"),
    ],
  };

  @override
  Widget build(BuildContext context) {
    final rows = pages[page]!;
    final range = page == 1 ? "1 to 15" : page == 2 ? "16 to 30" : page == 3 ? "31 to 45" : page == 4 ? "46 to 60" : "61 to 73";
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
        child: Column(children: [
          Row(children: [ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt, size: 18), label: const Text("Filter")), const Spacer(), const SizedBox(width: 280, child: TextField(decoration: InputDecoration(hintText: "Search", border: OutlineInputBorder())))]),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: ConstrainedBox(
                constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
                child: DataTable(
                  headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
                  columns: const [DataColumn(label: Text("User Level")), DataColumn(label: Text("Module")), DataColumn(label: Text("Permission")), DataColumn(label: Text("Value")), DataColumn(label: Text(""))],
                  rows: rows
                      .map((r) => DataRow(cells: [DataCell(Text(r.$1)), DataCell(Text(r.$2)), DataCell(Text(r.$3)), DataCell(Text(r.$4)), DataCell(IconButton(onPressed: () {}, icon: const Icon(Icons.edit_note)))]))
                      .toList(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(children: [
            Text("Showing $range of 73 entries", style: const TextStyle(fontSize: 12)),
            const Spacer(),
            OutlinedButton(onPressed: page > 1 ? () => setState(() => page--) : null, child: const Text("<- Previous")),
            const SizedBox(width: 4),
            for (var i = 1; i <= 5; i++) ...[
              SizedBox(width: 40, height: 36, child: i == page ? FilledButton(onPressed: () => setState(() => page = i), child: Text("$i")) : OutlinedButton(onPressed: () => setState(() => page = i), child: Text("$i"))),
              const SizedBox(width: 4),
            ],
            OutlinedButton(onPressed: page < 5 ? () => setState(() => page++) : null, child: const Text("Next ->")),
          ]),
        ]),
      ),
    );
  }
}

