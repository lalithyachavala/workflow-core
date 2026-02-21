import "package:flutter/material.dart";
import "package:fl_chart/fl_chart.dart";

class AttendanceBarChart extends StatelessWidget {
  const AttendanceBarChart({
    super.key,
    required this.hoursByDay,
    this.title = "Hours Worked by Day",
    this.maxBarWidth = 16,
    this.chartHeight = 180,
  });

  final List<dynamic> hoursByDay;
  final String title;
  final double maxBarWidth;
  final double chartHeight;

  @override
  Widget build(BuildContext context) {
    if (hoursByDay.isEmpty) {
      return SizedBox(
        height: chartHeight + 40,
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              const Text("No attendance data"),
            ],
          ),
        ),
      );
    }

    final maxHours = hoursByDay.fold<double>(
      8,
      (m, e) {
        final h = ((e["totalSeconds"] ?? 0) as num) / 3600;
        return h > m ? h : m;
      },
    );

    return SizedBox(
      height: chartHeight + 60,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: maxHours * 1.1,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => const Color(0xFF2563EB),
                    tooltipPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    tooltipMargin: 8,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      final d = hoursByDay[group.x.toInt()] as Map<String, dynamic>;
                      final secs = (d["totalSeconds"] ?? 0) as num;
                      final hours = secs / 3600;
                      final mins = (secs % 3600) ~/ 60;
                      return BarTooltipItem(
                        "${d["date"] ?? ""}\n${hours.toStringAsFixed(1)}h ${mins}m",
                        const TextStyle(color: Colors.white, fontSize: 12),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 24,
                      getTitlesWidget: (val, meta) {
                        if (val.toInt() < 0 || val.toInt() >= hoursByDay.length) {
                          return const SizedBox();
                        }
                        final d = hoursByDay[val.toInt()] as Map<String, dynamic>;
                        final dateStr = (d["date"] ?? "").toString();
                        final short = dateStr.length >= 10 ? dateStr.substring(5) : dateStr;
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            short,
                            style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280)),
                          ),
                        );
                      },
                      interval: hoursByDay.length > 14 ? (hoursByDay.length / 7).ceilToDouble() : 1,
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 28,
                      getTitlesWidget: (val, meta) => Text(
                        "${val.toInt()}h",
                        style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280)),
                      ),
                    ),
                  ),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: maxHours > 0 ? maxHours / 4 : 2,
                ),
                borderData: FlBorderData(show: false),
                barGroups: hoursByDay.asMap().entries.map((e) {
                  final secs = (e.value["totalSeconds"] ?? 0) as num;
                  final hours = secs / 3600;
                  return BarChartGroupData(
                    x: e.key,
                    barRods: [
                      BarChartRodData(
                        toY: hours,
                        color: const Color(0xFF2563EB),
                        width: maxBarWidth,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                      ),
                    ],
                    showingTooltipIndicators: [0],
                  );
                }).toList(),
              ),
              duration: const Duration(milliseconds: 300),
            ),
          ),
        ],
      ),
    );
  }
}
