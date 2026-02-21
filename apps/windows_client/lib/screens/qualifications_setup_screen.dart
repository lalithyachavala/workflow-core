import "package:flutter/material.dart";

class QualificationsSetupScreen extends StatefulWidget {
  const QualificationsSetupScreen({super.key});
  @override
  State<QualificationsSetupScreen> createState() => _QualificationsSetupScreenState();
}

class _QualificationsSetupScreenState extends State<QualificationsSetupScreen> {
  int tab = 0;
  final names = ["Skills", "Education", "Certifications", "Languages"];
  final Map<int, List<Map<String, String>>> rows = {0: [], 1: [], 2: [], 3: []};

  @override
  Widget build(BuildContext context) {
    final data = rows[tab]!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: List.generate(names.length, (i) => _tab(names[i], i))),
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
                    columns: const [DataColumn(label: Text("Name")), DataColumn(label: Text("Description")), DataColumn(label: Text("Actions"))],
                    rows: data.isEmpty ? const [DataRow(cells: [DataCell(Text("No data")), DataCell(Text("")), DataCell(Text(""))])] : data.map((e) => DataRow(cells: [DataCell(Text(e["name"]!)), DataCell(Text(e["description"]!)), const DataCell(Text("Edit / View / Delete / Copy"))])).toList(),
                  ),
                ),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _tab(String title, int i) => InkWell(
        onTap: () => setState(() => tab = i),
        child: Container(
          height: 46,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(color: tab == i ? const Color(0xFFF8FAFC) : Colors.transparent, border: Border.all(color: const Color(0xFFE5E7EB))),
          alignment: Alignment.center,
          child: Text(title),
        ),
      );
}

