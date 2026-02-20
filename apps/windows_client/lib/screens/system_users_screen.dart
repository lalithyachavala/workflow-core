import "package:flutter/material.dart";

class SystemUsersScreen extends StatefulWidget {
  const SystemUsersScreen({super.key});
  @override
  State<SystemUsersScreen> createState() => _SystemUsersScreenState();
}

class _SystemUsersScreenState extends State<SystemUsersScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final cols = tab == 0
        ? ["Username", "Email", "Employee", "User Level", "Actions"]
        : tab == 1
            ? ["ID", "Name", "Actions"]
            : ["ID", "Username", "Email", "Employee ID", "First Name", "Last Name", "User Level", "Status", "Actions"];
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Row(children: [_tab("Users", 0), _tab("Users Roles", 1), _tab("Users Invitations", 2)]),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            Row(children: [ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add_circle_outline), label: const Text("Add New")), const Spacer(), const SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "input search text", border: OutlineInputBorder())))]),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
                    columns: cols.map((c) => DataColumn(label: Text(c))).toList(),
                    rows: [DataRow(cells: List.generate(cols.length, (i) => DataCell(Text(i == 0 ? "No data" : ""))))],
                  ),
                ),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _tab(String t, int i) => InkWell(
        onTap: () => setState(() => tab = i),
        child: Container(height: 46, padding: const EdgeInsets.symmetric(horizontal: 20), decoration: BoxDecoration(color: tab == i ? const Color(0xFFF8FAFC) : Colors.transparent, border: Border.all(color: const Color(0xFFE5E7EB))), alignment: Alignment.center, child: Text(t)),
      );
}

