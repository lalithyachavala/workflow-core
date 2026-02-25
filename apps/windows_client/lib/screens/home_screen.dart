import "dart:async";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_inactive_timer/flutter_inactive_timer.dart";
import "../widgets/attendance_bar_chart.dart";
import "face_capture_for_clock_screen.dart";

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.totalSeconds,
    required this.events,
    required this.hoursByDay,
    required this.hoursChartDays,
    required this.loading,
    required this.onRefresh,
    required this.onClockIn,
    required this.onClockOut,
    required this.onReportAway,
    this.onHoursChartDaysChanged,
  });

  final int totalSeconds;
  final List<dynamic> events;
  final List<dynamic> hoursByDay;
  final int hoursChartDays;
  final bool loading;
  final Future<void> Function() onRefresh;
  final Future<void> Function(String imageBase64) onClockIn;
  final Future<void> Function(String imageBase64) onClockOut;
  final Future<void> Function() onReportAway;
  final void Function(int days)? onHoursChartDaysChanged;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  FlutterInactiveTimer? _inactiveTimer;
  Timer? _adminNotifyTimer;
  Timer? _elapsedTimer;
  bool _awayDialogShown = false;

  bool get _hasOpenSession =>
      widget.events.any((s) => s["clockOutAt"] == null || s["clockOutAt"] == "");

  int get _displayTotalSeconds {
    if (!_hasOpenSession) return widget.totalSeconds;
    final open = widget.events.cast<Map<String, dynamic>>().firstWhere(
          (s) => s["clockOutAt"] == null || s["clockOutAt"] == "",
          orElse: () => <String, dynamic>{},
        );
    if (open.isEmpty) return widget.totalSeconds;
    final inAt = open["clockInAt"]?.toString();
    if (inAt == null || inAt.isEmpty) return widget.totalSeconds;
    try {
      final clockIn = DateTime.parse(inAt);
      final elapsed = DateTime.now().difference(clockIn).inSeconds;
      return widget.totalSeconds + elapsed;
    } catch (_) {
      return widget.totalSeconds;
    }
  }

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

  void _startElapsedTimer() {
    _elapsedTimer?.cancel();
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted && _hasOpenSession) setState(() {});
    });
  }

  void _stopElapsedTimer() {
    _elapsedTimer?.cancel();
    _elapsedTimer = null;
  }

  @override
  void didUpdateWidget(HomeScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_hasOpenSession) {
      _startIdleMonitoring();
      _startElapsedTimer();
    } else {
      _stopIdleMonitoring();
      _stopElapsedTimer();
    }
  }

  @override
  void initState() {
    super.initState();
    if (_hasOpenSession) {
      _startElapsedTimer();
    }
  }

  @override
  void dispose() {
    _stopIdleMonitoring();
    _stopElapsedTimer();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final hours = seconds ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;
    return "${hours.toString().padLeft(2, "0")}:${minutes.toString().padLeft(2, "0")}:${secs.toString().padLeft(2, "0")}";
  }

  String _formatDateTime(String? isoStr) {
    if (isoStr == null || isoStr.isEmpty) return "—";
    try {
      final dt = DateTime.parse(isoStr);
      return "${dt.day.toString().padLeft(2, "0")}/${dt.month.toString().padLeft(2, "0")}/${dt.year} ${dt.hour.toString().padLeft(2, "0")}:${dt.minute.toString().padLeft(2, "0")}";
    } catch (_) {
      return isoStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_hasOpenSession && _inactiveTimer == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _hasOpenSession) _startIdleMonitoring();
      });
    }
    if (_hasOpenSession && _elapsedTimer == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _hasOpenSession) _startElapsedTimer();
      });
    }

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "My Attendance",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Text(
            "Today's Total Working Time: ${_formatDuration(_displayTotalSeconds)}",
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Text(
            "All sessions and totals are saved; they will appear whenever you log in again. Only you can access your portal (password + face verification).",
            style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
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
                              onCaptured: (imageBase64) => widget.onClockIn(imageBase64),
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
                              onCaptured: (imageBase64) => widget.onClockOut(imageBase64),
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
            ],
          ),
          const SizedBox(height: 20),
          AttendanceBarChart(
            hoursByDay: widget.hoursByDay,
            title: "Hours Worked by Day (Last ${widget.hoursChartDays} Days)",
            chartHeight: 160,
            selectedDays: widget.onHoursChartDaysChanged != null ? widget.hoursChartDays : null,
            onDaysChanged: widget.onHoursChartDaysChanged,
          ),
          const SizedBox(height: 20),
          const Text("Recent Sessions", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          Text(
            "Each clock-in starts a new session. Clock out completes it and records duration.",
            style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              itemCount: widget.events.length,
              itemBuilder: (context, index) {
                final session = widget.events[index] as Map<String, dynamic>;
                final isOpen = session["clockOutAt"] == null || session["clockOutAt"] == "";
                int secs = (session["totalSeconds"] ?? 0) as int;
                if (isOpen) {
                  final inAt = session["clockInAt"]?.toString();
                  if (inAt != null && inAt.isNotEmpty) {
                    try {
                      secs = DateTime.now().difference(DateTime.parse(inAt)).inSeconds;
                    } catch (_) {}
                  }
                }
                final durationText = isOpen ? _formatDuration(secs) : _formatDuration((session["totalSeconds"] ?? 0) as int);
                return ListTile(
                  title: Text("In: ${_formatDateTime(session["clockInAt"]?.toString())}"),
                  subtitle: Text(isOpen ? "Out: — (clocked in)" : "Out: ${_formatDateTime(session["clockOutAt"]?.toString())}"),
                  trailing: Text(durationText, style: const TextStyle(fontWeight: FontWeight.w600)),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
