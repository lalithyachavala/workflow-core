import "package:flutter/material.dart";

class HrmOverviewScreen extends StatelessWidget {
  const HrmOverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFD9EDF7),
              border: Border.all(color: const Color(0xFFBCE8F1)),
            ),
            child: const Text(
              "Upgrade to IceHRM v35, Powerful Analytics & Smarter Payroll at Your Fingertips",
              style: TextStyle(fontSize: 15, color: Color(0xFF2C3E50)),
            ),
          ),
          const SizedBox(height: 12),
          const Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _TopCard(
                color: Color(0xFF15A6D4),
                title: "People",
                subtitle: "11 Employees",
                action: "Manage Employees",
              ),
              _TopCard(
                color: Color(0xFF00A66A),
                title: "Company",
                subtitle: "10 Departments",
                action: "Manage Company",
              ),
              _TopCard(
                color: Color(0xFFE5A00D),
                title: "Users",
                subtitle: "11 Users",
                action: "Manage Users",
              ),
              _TopCard(
                color: Color(0xFFD9534F),
                title: "Projects",
                subtitle: "1 Active Projects",
                action: "Update Clients/Projects",
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Expanded(
                child: _Panel(
                  title: "Employee Check-Ins",
                  child: _CirclePlaceholder(label: "Total\n11"),
                ),
              ),
              SizedBox(width: 10),
              Expanded(
                child: _Panel(
                  title: "Employee Distribution",
                  child: _ChartPlaceholder(),
                ),
              ),
              SizedBox(width: 10),
              Expanded(
                child: _Panel(
                  title: "Task List",
                  child: _TaskPlaceholder(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TopCard extends StatelessWidget {
  const _TopCard({
    required this.color,
    required this.title,
    required this.subtitle,
    required this.action,
  });

  final Color color;
  final String title;
  final String subtitle;
  final String action;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 225,
      height: 118,
      decoration: BoxDecoration(color: color),
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(color: Colors.white, fontSize: 16)),
          const Spacer(),
          Container(
            width: double.infinity,
            color: Colors.black26,
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Center(
              child: Text(
                "$action  >",
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
              ),
            ),
          ),
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
      height: 330,
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFD9D9D9)),
        color: Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Text(title, style: const TextStyle(fontSize: 18)),
          ),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _CirclePlaceholder extends StatelessWidget {
  const _CirclePlaceholder({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 220,
        height: 220,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFF5E78A3), width: 32),
        ),
        child: Center(
          child: Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 36, color: Colors.black54)),
        ),
      ),
    );
  }
}

class _ChartPlaceholder extends StatelessWidget {
  const _ChartPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Icon(Icons.pie_chart, size: 180, color: Color(0xFF67B7DC)),
    );
  }
}

class _TaskPlaceholder extends StatelessWidget {
  const _TaskPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Remember to checkout after shift."),
          SizedBox(height: 12),
          Text("Visit Attendance", style: TextStyle(color: Color(0xFF0099CC))),
        ],
      ),
    );
  }
}
