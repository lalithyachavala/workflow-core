import "package:flutter/material.dart";

class PayrollSalaryScreen extends StatefulWidget {
  const PayrollSalaryScreen({super.key});
  @override
  State<PayrollSalaryScreen> createState() => _PayrollSalaryScreenState();
}

class _PayrollSalaryScreenState extends State<PayrollSalaryScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final tabs = ["Salary Component Types", "Salary Components", "Employee Salary Components"];
    final cols = tab == 0 ? ["Code", "Name", ""] : tab == 1 ? ["Name", "Salary Component Type", "Details", ""] : ["Employee", "Salary Component", "Amount", "Details", ""];
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Row(children: List.generate(tabs.length, (i) => _tab(tabs[i], i))),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            Row(children: [
              ElevatedButton(onPressed: () {}, child: const Text("Add New +")),
              if (tab == 2) ...[const SizedBox(width: 8), ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt, size: 18), label: const Text("Filter"))],
              const Spacer(),
              const SizedBox(width: 300, child: TextField(decoration: InputDecoration(hintText: "Search", border: OutlineInputBorder()))),
            ]),
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
                    rows: [DataRow(cells: List.generate(cols.length, (i) => DataCell(Text(i == 0 ? "No data available in table" : ""))))],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Row(children: [const Text("Showing 0 to 0 of 0 entries", style: TextStyle(fontSize: 12)), const Spacer(), OutlinedButton(onPressed: () {}, child: const Text("<- Previous")), const SizedBox(width: 4), OutlinedButton(onPressed: () {}, child: const Text("Next ->"))]),
          ]),
        ),
      ]),
    );
  }

  Widget _tab(String t, int i) => InkWell(
        onTap: () => setState(() => tab = i),
        child: Container(height: 50, padding: const EdgeInsets.symmetric(horizontal: 24), decoration: BoxDecoration(color: tab == i ? const Color(0xFFF8FAFC) : Colors.transparent, border: Border.all(color: const Color(0xFFE5E7EB))), alignment: Alignment.center, child: Text(t)),
      );
}

