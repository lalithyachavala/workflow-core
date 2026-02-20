import "package:flutter/material.dart";

class InsightsAttendanceScreen extends StatefulWidget {
  const InsightsAttendanceScreen({super.key});
  @override
  State<InsightsAttendanceScreen> createState() => _InsightsAttendanceScreenState();
}

class _InsightsAttendanceScreenState extends State<InsightsAttendanceScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Row(children: [_t("Attendance Graph", 0), _t("Hours in Office vs Hours Worked Graph", 1)]),
        const SizedBox(height: 10),
        Container(
          height: 620,
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Center(child: Text(tab == 0 ? "Attendance graph is yet to add." : "Hours in office vs hours worked graph is yet to add.", style: const TextStyle(fontSize: 20, color: Color(0xFF6B7280)))),
        ),
      ]),
    );
  }

  Widget _t(String s, int i) => InkWell(
        onTap: () => setState(() => tab = i),
        child: Container(height: 50, padding: const EdgeInsets.symmetric(horizontal: 22), decoration: BoxDecoration(color: tab == i ? const Color(0xFFF8FAFC) : Colors.transparent, border: Border.all(color: const Color(0xFFE5E7EB))), alignment: Alignment.center, child: Text(s)),
      );
}


