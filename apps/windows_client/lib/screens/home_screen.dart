import "dart:async";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_inactive_timer/flutter_inactive_timer.dart";
import "../widgets/attendance_bar_chart.dart";
import "face_detection_screen.dart";
import "face_capture_for_clock_screen.dart";

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
  final Future<void> Function(List<double> embedding) onClockIn;
  final Future<void> Function(List<double> embedding) onClockOut;
  final Future<void> Function() onReportAway;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  FlutterInactiveTimer? _inactiveTimer;
  Timer? _adminNotifyTimer;
  bool _awayDialogShown = false;

  bool get _hasOpenSession =>
      widget.events.any((s) => s["clockOutAt"] == null || s["clockOutAt"] == "");

  /// Plays a clear buzzer burst (4 times) exactly at the 10 min mark only.
  void _playBuzzerBurst() {
    Future<void> play() async {
      for (var i = 0; i < 4; i++) {
        SystemSound.play(SystemSoundType.alert);
        await Future<void>.delayed(const Duration(milliseconds: 450));
      }
    }
    play();
  }

  void _on10MinAway() {
    if (_awayDialogShown || !mounted) return;
    _awayDialogShown = true;
    _playBuzzerBurst(); // Buzzer: 3-4 short beeps at 10 min mark only

    // At 15 min (5 min after 10-min warning), report to admin and notify employee
    _adminNotifyTimer = Timer(const Duration(minutes: 5), () async {
      _adminNotifyTimer?.cancel();
      _adminNotifyTimer = null;
      try {
        await widget.onReportAway();
      } catch (_) {}
      if (mounted) {
        Navigator.of(context).pop(); // Close the 10-min dialog if still open
        showDialog<void>(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text("Inactivity Recorded"),
            content: const Text(
              "Your inactivity has been recorded and sent to admin.",
            ),
            actions: [
              TextButton(
                onPressed: () {
                  _awayDialogShown = false;
                  Navigator.of(ctx).pop();
                },
                child: const Text("OK"),
              ),
            ],
          ),
        ).then((_) {
          _awayDialogShown = false;
        });
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


    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Today's Total Working Time: ${_formatDuration(widget.totalSeconds)}",
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton(
                onPressed: widget.loading
                    ? null
                    : () => Navigator.push(
                          context,
                          MaterialPageRoute<void>(
                            builder: (_) => FaceCaptureForClockScreen(
                              title: "Clock In (Face Verify)",
                              onCaptured: (embedding) => widget.onClockIn(embedding),
                            ),
                          ),
                        ),
                child: const Text("Clock In (Face Verify)"),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: widget.loading
                    ? null
                    : () => Navigator.push(
                          context,
                          MaterialPageRoute<void>(
                            builder: (_) => FaceCaptureForClockScreen(
                              title: "Clock Out (Face Verify)",
                              onCaptured: (embedding) => widget.onClockOut(embedding),
                            ),
                          ),
                        ),
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
