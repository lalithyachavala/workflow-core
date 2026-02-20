import "package:flutter/material.dart";

class ModernDashboardScreen extends StatelessWidget {
  const ModernDashboardScreen({
    super.key,
    required this.metrics,
  });

  final Map<String, dynamic> metrics;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Dashboard", style: TextStyle(fontSize: 31, fontWeight: FontWeight.w700)),
                  SizedBox(height: 2),
                  Text("Thursday, 20 February 2026", style: TextStyle(color: Color(0xFF6B7280))),
                ],
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.download, size: 16),
                label: const Text("Download Report"),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _MetricCard(title: "Total Employees", value: "${metrics["totalEmployees"] ?? 0}", note: "active employees", noteColor: const Color(0xFF16A34A)),
              _MetricCard(title: "Present Today", value: "${metrics["presentToday"] ?? 0}", note: "clock-ins today", noteColor: const Color(0xFF16A34A)),
              _MetricCard(title: "On Break", value: "${metrics["onBreak"] ?? 0}", note: "estimated breaks", noteColor: const Color(0xFF6B7280)),
              _MetricCard(title: "Late Today", value: "${metrics["lateToday"] ?? 0}", note: "after shift start", noteColor: const Color(0xFFDC2626)),
              _MetricCard(title: "Weekly OT Hours", value: "${metrics["weeklyOtHours"] ?? 0}h", note: "calculated overtime", noteColor: const Color(0xFFDC2626)),
              _MetricCard(title: "Absent Today", value: "${metrics["absentToday"] ?? 0}", note: "employees absent", noteColor: const Color(0xFF6B7280)),
              _MetricCard(title: "Pending Punches", value: "${metrics["pendingPunches"] ?? 0}", note: "pending clock-outs", noteColor: const Color(0xFF6B7280)),
              _MetricCard(title: "Pending Leaves", value: "${metrics["pendingLeaves"] ?? 0}", note: "awaiting review", noteColor: const Color(0xFF6B7280)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: const [
              Expanded(child: _Panel(title: "Today's Activity", child: _ListPlaceholder())),
              SizedBox(width: 10),
              Expanded(child: _Panel(title: "Pending Approvals", child: _ListPlaceholder())),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.title,
    required this.value,
    required this.note,
    required this.noteColor,
  });

  final String title;
  final String value;
  final String note;
  final Color noteColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 190,
      height: 126,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Color(0xFF6B7280))),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 31, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
          const Spacer(),
          Text(note, style: TextStyle(fontSize: 12, color: noteColor, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 290,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
            child: Row(
              children: [
                Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
                const Spacer(),
                TextButton(onPressed: () {}, child: const Text("View all")),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _ListPlaceholder extends StatelessWidget {
  const _ListPlaceholder();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(10),
      children: const [
        ListTile(
          dense: true,
          title: Text("Emily Johnson"),
          subtitle: Text("Clocked in"),
          trailing: Text("08:58 AM"),
        ),
        ListTile(
          dense: true,
          title: Text("Tom Bradley"),
          subtitle: Text("Leave request"),
          trailing: Text("Pending"),
        ),
      ],
    );
  }
}
