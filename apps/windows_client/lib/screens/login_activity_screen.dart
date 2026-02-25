import "package:flutter/material.dart";

class LoginActivityScreen extends StatefulWidget {
  const LoginActivityScreen({
    super.key,
    required this.fetchLoginHistory,
  });

  final Future<List<dynamic>> Function(int days) fetchLoginHistory;

  @override
  State<LoginActivityScreen> createState() => _LoginActivityScreenState();
}

class _LoginActivityScreenState extends State<LoginActivityScreen> {
  int _selectedDays = 7;
  bool _loading = false;
  List<dynamic> _history = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _loading = true);
    try {
      final res = await widget.fetchLoginHistory(_selectedDays);
      if (mounted) {
        setState(() => _history = res);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error fetching login history: $e")),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Login Activity",
                      style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827))),
                  const SizedBox(height: 4),
                  Text(
                    "Logins from this device and from any other device or location (only you can see this).",
                    style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.65)),
                  ),
                ],
              ),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                  borderRadius: BorderRadius.circular(8),
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedDays,
                    icon: const Icon(Icons.keyboard_arrow_down,
                        color: Color(0xFF6B7280)),
                    items: const [
                      DropdownMenuItem(value: 7, child: Text("Last 7 days")),
                      DropdownMenuItem(value: 30, child: Text("Last 30 days")),
                      DropdownMenuItem(value: 60, child: Text("Last 60 days")),
                      DropdownMenuItem(value: 90, child: Text("Last 90 days")),
                      DropdownMenuItem(value: 365, child: Text("Last 365 days")),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedDays = val);
                        _loadHistory();
                      }
                    },
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _history.isEmpty
                      ? const Center(
                          child: Text(
                              "No login activity found for this period.",
                              style: TextStyle(color: Color(0xFF6B7280))))
                      : SingleChildScrollView(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              headingTextStyle: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF374151)),
                              dataTextStyle:
                                  const TextStyle(color: Color(0xFF4B5563)),
                              columns: const [
                                DataColumn(label: Text("Date & Time")),
                                DataColumn(label: Text("IP Address")),
                                DataColumn(label: Text("System Name")),
                                DataColumn(label: Text("Location")),
                              ],
                              rows: _history.map((h) {
                                return DataRow(cells: [
                                  DataCell(
                                    Row(
                                      children: [
                                        const Icon(Icons.login,
                                            size: 16, color: Color(0xFF10B981)),
                                        const SizedBox(width: 8),
                                        Text(h["loginTimeFormatted"] ?? "-"),
                                      ],
                                    ),
                                  ),
                                  DataCell(Text(
                                      h["ipAddress"]?.toString().isEmpty == true
                                          ? "-"
                                          : (h["ipAddress"] ?? "-"))),
                                  DataCell(Text(
                                      h["systemName"]?.toString().isEmpty ==
                                              true
                                          ? "-"
                                          : (h["systemName"] ?? "-"))),
                                  DataCell(Text(
                                      h["location"]?.toString().isEmpty == true
                                          ? "-"
                                          : (h["location"] ?? "-"))),
                                ]);
                              }).toList(),
                            ),
                          ),
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
