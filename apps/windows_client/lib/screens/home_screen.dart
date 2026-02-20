import "dart:convert";
import "package:flutter/material.dart";

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    super.key,
    required this.totalSeconds,
    required this.events,
    required this.loading,
    required this.onRefresh,
    required this.onClockIn,
    required this.onClockOut,
  });

  final int totalSeconds;
  final List<dynamic> events;
  final bool loading;
  final Future<void> Function() onRefresh;
  final Future<void> Function(String imageBase64) onClockIn;
  final Future<void> Function(String imageBase64) onClockOut;

  String _formatDuration(int seconds) {
    final hours = seconds ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;
    return "${hours.toString().padLeft(2, "0")}:${minutes.toString().padLeft(2, "0")}:${secs.toString().padLeft(2, "0")}";
  }

  @override
  Widget build(BuildContext context) {
    // Placeholder camera capture string for MVP wiring; replace with camera snapshot bytes.
    final fakeImageBase64 = base64Encode(utf8.encode("face-capture-placeholder"));

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Today's Total Working Time: ${_formatDuration(totalSeconds)}", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton(
                onPressed: loading ? null : () => onClockIn(fakeImageBase64),
                child: const Text("Clock In (Face Verify)"),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: loading ? null : () => onClockOut(fakeImageBase64),
                child: const Text("Clock Out (Face Verify)"),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: loading ? null : onRefresh,
                child: const Text("Refresh"),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text("Recent Sessions", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              itemCount: events.length,
              itemBuilder: (context, index) {
                final session = events[index] as Map<String, dynamic>;
                return ListTile(
                  title: Text("In: ${session["clockInAt"] ?? "-"}"),
                  subtitle: Text("Out: ${session["clockOutAt"] ?? "-"}"),
                  trailing: Text("${session["totalSeconds"] ?? 0}s"),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
