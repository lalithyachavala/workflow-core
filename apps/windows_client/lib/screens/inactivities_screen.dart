import "package:flutter/material.dart";

/// Lists all employees who were inactive for 15+ minutes, most recent first.
/// Shows: employee name, time of inactivity, date.
class InactivitiesScreen extends StatelessWidget {
  const InactivitiesScreen({
    super.key,
    required this.awayAlerts,
    required this.loading,
    required this.onRefresh,
  });

  final List<dynamic> awayAlerts;
  final bool loading;
  final Future<void> Function() onRefresh;

  String _formatAwayAt(dynamic awayAt) {
    if (awayAt == null) return "-";
    final dt = DateTime.tryParse(awayAt.toString());
    if (dt == null) return awayAt.toString();
    return "${dt.toIso8601String().substring(0, 10)} ${dt.hour.toString().padLeft(2, "0")}:${dt.minute.toString().padLeft(2, "0")}";
  }

  String _employeeDisplay(dynamic a) {
    final name = a["employeeName"]?.toString();
    if (name != null && name.isNotEmpty) return name;
    return a["employeeEmail"]?.toString() ?? "-";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  "Inactivities",
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: loading ? null : onRefresh,
                  child: Text(loading ? "Refreshing..." : "Refresh"),
                ),
              ],
            ),
          ),
          Expanded(
            child: awayAlerts.isEmpty
                ? const Center(
                    child: Text(
                      "No inactivity records. Employees who are inactive for 15+ minutes will appear here.",
                      style: TextStyle(color: Colors.black54),
                      textAlign: TextAlign.center,
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: awayAlerts.length,
                    itemBuilder: (context, index) {
                      final a = awayAlerts[index] as Map<String, dynamic>;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.orange.shade100,
                            child: Icon(Icons.timer_off, color: Colors.orange.shade800, size: 20),
                          ),
                          title: Text(
                            _employeeDisplay(a),
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(
                            "Inactive at: ${_formatAwayAt(a["awayAt"])}\n${a["minutesAway"] ?? 15} minutes",
                            style: const TextStyle(fontSize: 12, color: Colors.black87),
                          ),
                          isThreeLine: true,
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
