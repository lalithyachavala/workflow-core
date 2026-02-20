import "package:flutter/material.dart";

class TravelRequestsScreen extends StatelessWidget {
  const TravelRequestsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(height: 50, padding: const EdgeInsets.symmetric(horizontal: 20), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border.all(color: const Color(0xFFE5E7EB))), alignment: Alignment.centerLeft, child: const Text("Travel Requests")),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            Row(children: [
              ElevatedButton(onPressed: () {}, child: const Text("Add New +")),
              const SizedBox(width: 8),
              ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.filter_alt, size: 18), label: const Text("Filter")),
              const Spacer(),
              const SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "Search", border: OutlineInputBorder()))),
            ]),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
                  child: DataTable(
                    headingRowColor: WidgetStatePropertyAll(Color(0xFFF3F4F6)),
                    columns: [
                      DataColumn(label: Text("Employee")),
                      DataColumn(label: Text("Travel Type")),
                      DataColumn(label: Text("Purpose")),
                      DataColumn(label: Text("From")),
                      DataColumn(label: Text("To")),
                      DataColumn(label: Text("Travel Date")),
                      DataColumn(label: Text("Status")),
                    ],
                    rows: [DataRow(cells: [DataCell(Text("No data available in table")), DataCell(Text("")), DataCell(Text("")), DataCell(Text("")), DataCell(Text("")), DataCell(Text("")), DataCell(Text(""))])],
                  ),
                ),
              ),
            ),
          ]),
        ),
      ]),
    );
  }
}

