import "package:flutter/material.dart";

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});
  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  int tab = 0;
  final reports = const [("Test Team Utilization Report", "Random summary report for weekly work distribution.")];
  final exports = const [("Test Compliance Export", "Random export for compliance and payroll snapshots.")];
  @override
  Widget build(BuildContext context) {
    final data = tab == 0 ? reports : exports;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Row(children: [_tab("Reports", 0), _tab("Exports", 1)]),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            const Row(children: [Spacer(), SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "Search", border: OutlineInputBorder())))]),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
                    columns: const [DataColumn(label: Text("Name")), DataColumn(label: Text("Details")), DataColumn(label: Text(""))],
                    rows: data
                        .map((e) => DataRow(cells: [DataCell(Text(e.$1)), DataCell(Text(e.$2)), const DataCell(Icon(Icons.download, color: Color(0xFF84CC16)))]))
                        .toList(),
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

