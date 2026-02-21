import "dart:async";
import "dart:convert";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_inactive_timer/flutter_inactive_timer.dart";
import "../widgets/attendance_bar_chart.dart";
import "face_detection_screen.dart";

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.totalSeconds,
    required this.events,
    required this.hoursByDay,
    required this.loading,
    required this.onRefresh,
    required this.onClockIn,
    required this.onClockOut,
    required this.onReportAway,
  });

  final int totalSeconds;
  final List<dynamic> events;
  final List<dynamic> hoursByDay;
  final bool loading;
  final Future<void> Function() onRefresh;
  final Future<void> Function(String imageBase64) onClockIn;
  final Future<void> Function(String imageBase64) onClockOut;
  final Future<void> Function() onReportAway;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  FlutterInactiveTimer? _inactiveTimer;
  Timer? _alarmTimer;
  Timer? _adminNotifyTimer;
  bool _awayDialogShown = false;

  bool get _hasOpenSession =>
      widget.events.any((s) => s["clockOutAt"] == null || s["clockOutAt"] == "");

  void _stopAlarm() {
    _alarmTimer?.cancel();
    _alarmTimer = null;
  }

  void _startAlarm() {
    _stopAlarm();
    _alarmTimer = Timer.periodic(const Duration(milliseconds: 500), (_) {
      SystemSound.play(SystemSoundType.alert);
    });
  }

  void _on10MinAway() {
    if (_awayDialogShown || !mounted) return;
    _awayDialogShown = true;
    _startAlarm();

    _adminNotifyTimer = Timer(const Duration(minutes: 5), () async {
      _adminNotifyTimer?.cancel();
      _adminNotifyTimer = null;
      try {
        await widget.onReportAway();
      } catch (_) {}
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Admin has been notified that you have been away for 15+ minutes."),
            backgroundColor: Colors.orange,
          ),
        );
      }
    });

    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text("Away Alert"),
        content: const Text(
          "You have been away for 10 minutes. Please confirm you are back.",
        ),
        actions: [
          TextButton(
            onPressed: () {
              _stopAlarm();
              _adminNotifyTimer?.cancel();
              _adminNotifyTimer = null;
              _awayDialogShown = false;
              Navigator.of(ctx).pop();
            },
            child: const Text("I'm Back"),
          ),
        ],
      ),
    ).then((_) {
      _awayDialogShown = false;
      _stopAlarm();
      _adminNotifyTimer?.cancel();
      _adminNotifyTimer = null;
    });
  }

  void _startIdleMonitoring() {
    _inactiveTimer?.stopMonitoring();
    _inactiveTimer = FlutterInactiveTimer(
      timeoutDuration: 600,
      notificationPer: 100,
      onInactiveDetected: _on10MinAway,
      onNotification: () {},
    );
    _inactiveTimer!.startMonitoring();
  }

  void _stopIdleMonitoring() {
    _inactiveTimer?.stopMonitoring();
    _inactiveTimer = null;
    _stopAlarm();
    _adminNotifyTimer?.cancel();
    _adminNotifyTimer = null;
    _awayDialogShown = false;
  }

  @override
  void didUpdateWidget(HomeScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_hasOpenSession) {
      _startIdleMonitoring();
    } else {
      _stopIdleMonitoring();
    }
  }

  @override
  void dispose() {
    _stopIdleMonitoring();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final hours = seconds ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;
    return "${hours.toString().padLeft(2, "0")}:${minutes.toString().padLeft(2, "0")}:${secs.toString().padLeft(2, "0")}";
  }

  @override
  Widget build(BuildContext context) {
    if (_hasOpenSession && _inactiveTimer == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _hasOpenSession) _startIdleMonitoring();
      });
    }

    final fakeImageBase64 = base64Encode(utf8.encode("face-capture-placeholder"));

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Today's Total Working Time: ${_formatDuration(widget.totalSeconds)}",
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          if (_hasOpenSession)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                "Away detection active (alarm at 10 min, admin notified at 15 min)",
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton(
                onPressed: widget.loading ? null : () => widget.onClockIn(fakeImageBase64),
                child: const Text("Clock In (Face Verify)"),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: widget.loading ? null : () => widget.onClockOut(fakeImageBase64),
                child: const Text("Clock Out (Face Verify)"),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: widget.loading ? null : widget.onRefresh,
                child: const Text("Refresh"),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FaceDetectionScreen()),
                  );
                },
                child: const Text("Test Model Wiring"),
              ),
            ],
          ),
          const SizedBox(height: 20),
          AttendanceBarChart(
            hoursByDay: widget.hoursByDay,
            title: "Hours Worked by Day (Last 30 Days)",
            chartHeight: 160,
          ),
          const SizedBox(height: 20),
          const Text("Recent Sessions", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              itemCount: widget.events.length,
              itemBuilder: (context, index) {
                final session = widget.events[index] as Map<String, dynamic>;
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
