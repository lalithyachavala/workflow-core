import "package:flutter/material.dart";

class ProjectsSetupScreen extends StatefulWidget {
  const ProjectsSetupScreen({super.key});
  @override
  State<ProjectsSetupScreen> createState() => _ProjectsSetupScreenState();
}

class _ProjectsSetupScreenState extends State<ProjectsSetupScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Row(children: [_tab("Projects", 0), _tab("Employee Projects", 1)]),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            Row(children: [
              ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add_circle_outline), label: const Text("Add New")),
              if (tab == 1) ...[const SizedBox(width: 8), OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt_outlined), label: const Text("Filters"))],
              const Spacer(),
              const SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "input search text", border: OutlineInputBorder()))),
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
                    columns: (tab == 0)
                        ? const [DataColumn(label: Text("Name")), DataColumn(label: Text("Client")), DataColumn(label: Text("Actions"))]
                        : const [DataColumn(label: Text("Employee")), DataColumn(label: Text("Project")), DataColumn(label: Text("Actions"))],
                    rows: const [DataRow(cells: [DataCell(Text("No data")), DataCell(Text("")), DataCell(Text(""))])],
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
          padding: const EdgeInsets.symmetric(horizontal: 22),
          decoration: BoxDecoration(color: tab == i ? const Color(0xFFF8FAFC) : Colors.transparent, border: Border.all(color: const Color(0xFFE5E7EB))),
          alignment: Alignment.center,
          child: Text(title),
        ),
      );
}

