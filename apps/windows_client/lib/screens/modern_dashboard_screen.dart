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
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Hours Graph (Requested to be Orange)
            AttendanceBarChart(
              hoursByDay: hoursByDay,
              title: "My Hours Worked (Last 30 Days)",
              chartHeight: 160,
              selectedDays: hoursChartDays,
              onDaysChanged: onHoursChartDaysChanged,
            ),
            const SizedBox(height: 24),
            // Top metric cards
            Row(
              children: [
                Expanded(
                  child: _MetricCard(
                    title: "New Joining Today",
                    value: "0",
                    topBorderColor: Colors.green,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _MetricCard(
                    title: "New Joining This Week",
                    value: "0",
                    topBorderColor: Colors.orange,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _MetricCard(
                    title: "Total Strength",
                    value: "${metrics["totalEmployees"] ?? 1}",
                    topBorderColor: const Color(0xFF6366F1),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Main Content Area
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Offline Employees
                Expanded(
                  flex: 2,
                  child: _Panel(
                    title: "Offline Employees",
                    child: ListView(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        _EmployeeListTile(
                            name: "Jayandra Babu",
                            status: "on a break",
                            statusColor: Colors.red.shade100,
                            textColor: Colors.red),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Leave Requests
                Expanded(
                  flex: 2,
                  child: _Panel(
                    title: "Leave Requests To Approve",
                    child: _EmptyState(
                      icon: Icons.search_outlined,
                      message: "No Records found.",
                      subMessage: "No records available at the moment.",
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Announcements & On Leave
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      _Panel(
                        title: "Announcements",
                        trailing: Icon(Icons.add,
                            size: 16, color: Colors.red.shade400),
                        child: _EmptyState(
                          icon: Icons.search_outlined,
                          message: "No Records found.",
                          subMessage:
                              "There are no announcements at the moment.",
                        ),
                      ),
                      const SizedBox(height: 16),
                      _Panel(
                        title: "On Leave",
                        child: const SizedBox(
                            height: 100), // Placeholder for on leave list
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xFFE54F38),
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.title,
    required this.value,
    required this.topBorderColor,
  });

  final String title;
  final String value;
  final Color topBorderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 140,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Column(
          children: [
            Container(height: 3, color: topBorderColor),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.title, required this.child, this.trailing});
  final String title;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                if (trailing != null) ...[
                  const Spacer(),
                  trailing!,
                ],
              ],
            ),
          ),
          const Divider(height: 1),
          child,
        ],
      ),
    );
  }
}

class _EmployeeListTile extends StatelessWidget {
  const _EmployeeListTile({
    required this.name,
    required this.status,
    required this.statusColor,
    required this.textColor,
  });
  final String name;
  final String status;
  final Color statusColor;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 18,
            backgroundColor: Color(0xFFE5E7EB),
            child: Icon(Icons.person, size: 20, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Text(
            name,
            style: const TextStyle(
                fontWeight: FontWeight.bold, color: Color(0xFF374151)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              status,
              style: TextStyle(
                  color: textColor, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
          const Spacer(),
          const Icon(Icons.mail_outline, size: 16, color: Color(0xFF6B7280)),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState(
      {required this.icon, required this.message, required this.subMessage});
  final IconData icon;
  final String message;
  final String subMessage;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
      child: Center(
        child: Column(
          children: [
            Icon(icon, size: 64, color: const Color(0xFF94A3B8)),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937)),
            ),
            const SizedBox(height: 8),
            Text(
              subMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
          ],
        ),
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
