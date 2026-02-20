import "package:flutter/material.dart";

class SystemModulesScreen extends StatefulWidget {
  const SystemModulesScreen({super.key});
  @override
  State<SystemModulesScreen> createState() => _SystemModulesScreenState();
}

class _SystemModulesScreenState extends State<SystemModulesScreen> {
  int page = 1;
  final pages = {
    1: const [
      ("Attendance", "admin"),
      ("Time and Attendance", "admin"),
      ("Clients", "admin"),
      ("Company Structure", "admin"),
      ("Ice Connect", "admin"),
      ("Custom Fields", "admin"),
      ("Dashboard", "admin"),
      ("Documents", "admin"),
      ("Employees", "admin"),
      ("Field Names", "admin"),
      ("Job Details Setup", "admin"),
      ("Loans", "admin"),
      ("Manage Metadata", "admin"),
      ("Manage Modules", "admin"),
      ("Overtime", "admin"),
    ],
    2: const [
      ("Payroll Reports", "admin"),
      ("Manage Permissions", "admin"),
      ("Projects", "admin"),
      ("Qualifications Setup", "admin"),
      ("Reports", "admin"),
      ("Salary", "admin"),
      ("Settings", "admin"),
      ("Travel", "admin"),
      ("Users", "admin"),
      ("Attendance", "user"),
      ("Dashboard", "user"),
      ("Dependents", "user"),
      ("My Documents", "user"),
      ("Emergency Contacts", "user"),
      ("Basic Information", "user"),
    ],
    3: const [
      ("Loans", "user"),
      ("Overtime Requests", "user"),
      ("Qualifications", "user"),
      ("Reports", "user"),
      ("Salary", "user"),
      ("Time Sheets", "user"),
      ("Travel", "user"),
    ],
  };

  @override
  Widget build(BuildContext context) {
    final rows = pages[page]!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Container(height: 46, padding: const EdgeInsets.symmetric(horizontal: 18), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border.all(color: const Color(0xFFE5E7EB))), alignment: Alignment.centerLeft, child: const Text("Modules")),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            const Row(children: [Spacer(), SizedBox(width: 280, child: TextField(decoration: InputDecoration(hintText: "Search", border: OutlineInputBorder())))]),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
                    columns: const [DataColumn(label: Text("Name")), DataColumn(label: Text("Group")), DataColumn(label: Text("Order")), DataColumn(label: Text("Status")), DataColumn(label: Text(""))],
                    rows: rows
                        .map((r) => DataRow(cells: [DataCell(Text(r.$1)), DataCell(Text(r.$2)), const DataCell(Text("0")), const DataCell(Text("Disabled")), DataCell(IconButton(onPressed: () {}, icon: const Icon(Icons.edit_note)))]))
                        .toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(children: [
              Text("Showing ${page == 1 ? "1 to 15" : page == 2 ? "16 to 30" : "31 to 37"} of 37 entries", style: const TextStyle(fontSize: 12)),
              const Spacer(),
              OutlinedButton(onPressed: page > 1 ? () => setState(() => page -= 1) : null, child: const Text("<- Previous")),
              const SizedBox(width: 4),
              for (var i = 1; i <= 3; i++) ...[
                SizedBox(width: 40, height: 36, child: i == page ? FilledButton(onPressed: () => setState(() => page = i), child: Text("$i")) : OutlinedButton(onPressed: () => setState(() => page = i), child: Text("$i"))),
                const SizedBox(width: 4),
              ],
              OutlinedButton(onPressed: page < 3 ? () => setState(() => page += 1) : null, child: const Text("Next ->")),
            ]),
          ]),
        ),
      ]),
    );
  }
}

