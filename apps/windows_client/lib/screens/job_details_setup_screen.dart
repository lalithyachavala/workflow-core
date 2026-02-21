import "package:flutter/material.dart";

class JobDetailsSetupScreen extends StatefulWidget {
  const JobDetailsSetupScreen({super.key});
  @override
  State<JobDetailsSetupScreen> createState() => _JobDetailsSetupScreenState();
}

class _JobDetailsSetupScreenState extends State<JobDetailsSetupScreen> {
  int tab = 0;
  final titles = <Map<String, String>>[];
  final payGrades = <Map<String, String>>[];
  final statuses = <Map<String, String>>[];
  final q = TextEditingController();

  @override
  void dispose() {
    q.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          _tab("Job Titles", 0),
          _tab("Pay Grades", 1),
          _tab("Employment Status", 2),
        ]),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            Row(children: [
              ElevatedButton.icon(onPressed: _onAdd, icon: const Icon(Icons.add_circle_outline), label: const Text("Add New")),
              const Spacer(),
              const SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "input search text", border: OutlineInputBorder()))),
            ]),
            const SizedBox(height: 10),
            _table(),
          ]),
        )
      ]),
    );
  }

  Widget _tab(String t, int i) => InkWell(
        onTap: () => setState(() => tab = i),
        child: Container(
          height: 46,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(color: tab == i ? const Color(0xFFF8FAFC) : Colors.transparent, border: Border.all(color: const Color(0xFFE5E7EB))),
          alignment: Alignment.center,
          child: Text(t),
        ),
      );

  Widget _table() {
    final cols = tab == 0 ? ["Job Title Code", "Job Title", "Actions"] : tab == 1 ? ["Role", "Currency", "Min Salary", "Max Salary", "Actions"] : ["Role", "Employment Status", "Actions"];
    final rows = tab == 0 ? titles : tab == 1 ? payGrades : statuses;
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
            columns: cols.map((c) => DataColumn(label: Text(c))).toList(),
            rows: rows.isEmpty
                ? [DataRow(cells: List.generate(cols.length, (i) => DataCell(Text(i == 0 ? "No data" : ""))))]
                : rows.map((r) {
                    final dataCells = tab == 0
                        ? [DataCell(Text(r["code"]!)), DataCell(Text(r["title"]!))]
                        : tab == 1
                            ? [DataCell(Text(r["role"]!)), DataCell(Text(r["currency"]!)), DataCell(Text(r["min"]!)), DataCell(Text(r["max"]!))]
                            : [DataCell(Text(r["role"]!)), DataCell(Text(r["status"]!))];
                    dataCells.add(DataCell(Row(children: [
                      _a("Edit", const Color(0xFF16A34A), () => _edit(r)),
                      const SizedBox(width: 6),
                      _a("View", const Color(0xFF2563EB), () {}),
                      const SizedBox(width: 6),
                      _a("Delete", const Color(0xFFEA580C), () => setState(() => rows.remove(r))),
                      const SizedBox(width: 6),
                      _a("Copy", const Color(0xFF06B6D4), () => setState(() => rows.add(Map<String, String>.from(r)))),
                    ])));
                    return DataRow(cells: dataCells);
                  }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _a(String t, Color c, VoidCallback onTap) => OutlinedButton(onPressed: onTap, style: OutlinedButton.styleFrom(foregroundColor: c, side: BorderSide(color: c.withValues(alpha: 0.35))), child: Text(t));

  Future<void> _onAdd() async {
    final c1 = TextEditingController();
    final c2 = TextEditingController();
    final c3 = TextEditingController();
    final c4 = TextEditingController();
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Add"),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: c1, decoration: InputDecoration(labelText: tab == 0 ? "Job title code" : "Role")),
          const SizedBox(height: 8),
          TextField(controller: c2, decoration: InputDecoration(labelText: tab == 0 ? "Job title" : tab == 1 ? "Currency" : "Employment status")),
          if (tab == 1) ...[
            const SizedBox(height: 8),
            TextField(controller: c3, decoration: const InputDecoration(labelText: "Min salary")),
            const SizedBox(height: 8),
            TextField(controller: c4, decoration: const InputDecoration(labelText: "Max salary")),
          ],
        ]),
        actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("Cancel")), ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text("Save"))],
      ),
    );
    if (saved == true) {
      setState(() {
        if (tab == 0) {
          titles.add({"code": c1.text, "title": c2.text});
        } else if (tab == 1) {
          payGrades.add({"role": c1.text, "currency": c2.text, "min": c3.text, "max": c4.text});
        } else {
          statuses.add({"role": c1.text, "status": c2.text});
        }
      });
    }
  }

  void _edit(Map<String, String> r) {}
}

