import "package:flutter/material.dart";

class AdminAttendanceScreen extends StatefulWidget {
  const AdminAttendanceScreen({super.key});
  @override
  State<AdminAttendanceScreen> createState() => _AdminAttendanceScreenState();
}

class _AdminAttendanceScreenState extends State<AdminAttendanceScreen> {
  bool clockedIn = false;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
        child: DataTable(
          headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
          columns: const [
            DataColumn(label: Text("Employee")),
            DataColumn(label: Text("Department")),
            DataColumn(label: Text("Hours This Week")),
            DataColumn(label: Text("Status")),
            DataColumn(label: Text("Clocked In / Out")),
          ],
          rows: [
            DataRow(cells: [
              const DataCell(Text("test employee")),
              const DataCell(Text("Engineering")),
              const DataCell(Text("13h")),
              DataCell(Text(clockedIn ? "Clocked In" : "Clocked Out")),
              DataCell(OutlinedButton(onPressed: () => setState(() => clockedIn = !clockedIn), child: Text(clockedIn ? "Mark Clocked Out" : "Mark Clocked In"))),
            ]),
          ],
        ),
      ),
    );
  }
}



