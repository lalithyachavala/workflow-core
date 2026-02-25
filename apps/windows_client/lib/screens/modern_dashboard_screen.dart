import "package:flutter/material.dart";
import "../widgets/attendance_bar_chart.dart";

class ModernDashboardScreen extends StatelessWidget {
  const ModernDashboardScreen({
    super.key,
    required this.metrics,
    required this.events,
    required this.awayAlerts,
    required this.hoursByDay,
    required this.hoursChartDays,
    required this.onHoursChartDaysChanged,
    required this.onRefresh,
  });

  final Map<String, dynamic> metrics;
  final List<dynamic> events;
  final List<dynamic> awayAlerts;
  final List<dynamic> hoursByDay;
  final int hoursChartDays;
  final void Function(int days) onHoursChartDaysChanged;
  final Future<void> Function() onRefresh;

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
                  Text("Admin Overview", style: TextStyle(color: Color(0xFF6B7280))),
                ],
              ),
              const Spacer(),
              OutlinedButton.icon(
                onPressed: () => onRefresh(),
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text("Refresh"),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (awayAlerts.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.shade300),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber, color: Colors.orange.shade800, size: 24),
                      const SizedBox(width: 8),
                      Text("Employees Away > 15 min", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange.shade900)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...awayAlerts.take(10).map((a) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.person_off, size: 20),
                    title: Text(a["employeeEmail"]?.toString() ?? "-"),
                    subtitle: Text("Away since: ${a["awayAt"]?.toString() ?? "-"}"),
                  )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
          AttendanceBarChart(
            hoursByDay: hoursByDay,
            title: "My Hours Worked (Last $hoursChartDays Days)",
            chartHeight: 160,
            selectedDays: hoursChartDays,
            onDaysChanged: onHoursChartDaysChanged,
          ),
          const SizedBox(height: 20),
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
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: _Panel(
                  title: "Recent Attendance (IP & Device)",
                  child: events.isEmpty
                      ? const Padding(padding: EdgeInsets.all(16), child: Center(child: Text("No attendance events")))
                      : ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: events.length > 15 ? 15 : events.length,
                          itemBuilder: (context, index) {
                            final event = events[index] as Map<String, dynamic>;
                            final user = event["userId"] as Map<String, dynamic>?;
                            final profile = user?["profile"] as Map<String, dynamic>?;
                            final email = user?["email"] ?? profile?["displayName"] ?? "-";
                            final device = event["deviceId"] as Map<String, dynamic>?;
                            final hostname = device?["hostname"] ?? "-";
                            final geo = event["geo"] as Map<String, dynamic>?;
                            final geoStr = geo != null && (geo["country"]?.toString().isNotEmpty == true)
                                ? "${geo["country"]}${geo["city"] != null && geo["city"].toString().isNotEmpty ? ", ${geo["city"]}" : ""}"
                                : "";
                            return ListTile(
                              dense: true,
                              title: Text("${event["type"] ?? "-"} | $email"),
                              subtitle: Text("IP: ${event["ip"] ?? "-"}${geoStr.isNotEmpty ? " | $geoStr" : ""}\nDevice: $hostname"),
                              isThreeLine: true,
                            );
                          },
                        ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _Panel(
                  title: "Away Alerts",
                  child: awayAlerts.isEmpty
                      ? const Padding(padding: EdgeInsets.all(16), child: Center(child: Text("No away alerts")))
                      : ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: awayAlerts.length > 10 ? 10 : awayAlerts.length,
                          itemBuilder: (context, index) {
                            final a = awayAlerts[index] as Map<String, dynamic>;
                            return ListTile(
                              dense: true,
                              leading: const Icon(Icons.warning_amber, size: 18, color: Colors.orange),
                              title: Text(a["employeeEmail"]?.toString() ?? "-"),
                              subtitle: Text(a["awayAt"]?.toString() ?? "-"),
                            );
                          },
                        ),
                ),
              ),
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
