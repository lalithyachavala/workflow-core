import "package:flutter/material.dart";

class AdminLoginActivityScreen extends StatefulWidget {
  const AdminLoginActivityScreen({
    super.key,
    required this.fetchAdminLoginHistory,
  });

  final Future<List<dynamic>> Function({int days}) fetchAdminLoginHistory;

  @override
  State<AdminLoginActivityScreen> createState() =>
      _AdminLoginActivityScreenState();
}

class _AdminLoginActivityScreenState extends State<AdminLoginActivityScreen> {
  int _selectedDays = 7;
  bool _loading = false;
  List<dynamic> _history = [];
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _loading = true);
    try {
      final res = await widget.fetchAdminLoginHistory(days: _selectedDays);
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

  void _showEmployeeDetails(String name, List<dynamic> logs) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 900),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Login History: $name",
                    style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF111827)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Flexible(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: SingleChildScrollView(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: DataTable(
                          columnSpacing: 38,
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
                          rows: logs.map((h) {
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
                                  h["systemName"]?.toString().isEmpty == true
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
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Map<String, List<dynamic>> groupedLogs = {};
    for (var h in _history) {
      final name = (h["displayName"]?.toString().isNotEmpty == true &&
              h["displayName"] != "Unknown")
          ? h["displayName"].toString()
          : h["email"].toString();
      if (!groupedLogs.containsKey(name)) {
        groupedLogs[name] = [];
      }
      groupedLogs[name]!.add(h);
    }

    final filteredNames = groupedLogs.keys.where((name) {
      if (_searchQuery.isEmpty) return true;
      return name.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();
    filteredNames.sort();

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 16,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Employee Login Activity",
                      style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827))),
                  SizedBox(height: 4),
                  Text("Track and view login data across all employees.",
                      style: TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
                ],
              ),
              Row(
                children: [
                  Container(
                    width: 250,
                    height: 40,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search,
                            color: Color(0xFF9CA3AF), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            onChanged: (val) =>
                                setState(() => _searchQuery = val),
                            decoration: const InputDecoration(
                              hintText: "Search employee...",
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
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
                          DropdownMenuItem(
                              value: 7, child: Text("Last 7 days")),
                          DropdownMenuItem(
                              value: 30, child: Text("Last 30 days")),
                          DropdownMenuItem(
                              value: 60, child: Text("Last 60 days")),
                          DropdownMenuItem(
                              value: 90, child: Text("Last 90 days")),
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
                  : filteredNames.isEmpty
                      ? const Center(
                          child: Text(
                            "No login activity found for this period filter or search.",
                            style: TextStyle(color: Color(0xFF6B7280)),
                          ),
                        )
                      : ListView.separated(
                          itemCount: filteredNames.length,
                          separatorBuilder: (_, __) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final name = filteredNames[index];
                            final logs = groupedLogs[name]!;
                            final recentLog = logs.first;
                            return ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 24, vertical: 8),
                              leading: CircleAvatar(
                                backgroundColor: const Color(0xFFE8EEFF),
                                child: Text(
                                  name.substring(0, 1).toUpperCase(),
                                  style: const TextStyle(
                                      color: Color(0xFF2563EB),
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                              title: Text(name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF111827))),
                              subtitle: Text(
                                "Last login: ${recentLog["loginTimeFormatted"] ?? "Unknown"}  •  Total Logins: ${logs.length}",
                                style:
                                    const TextStyle(color: Color(0xFF6B7280)),
                              ),
                              trailing: ElevatedButton(
                                onPressed: () =>
                                    _showEmployeeDetails(name, logs),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFF3F4F6),
                                  foregroundColor: const Color(0xFF374151),
                                  shadowColor: Colors.transparent,
                                  elevation: 0,
                                ),
                                child: const Text("View Activity"),
                              ),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
