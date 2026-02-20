import "package:flutter/material.dart";
import "screens/admin_screen.dart";
import "screens/company_structure_screen.dart";
import "screens/employees_screen.dart";
import "screens/home_screen.dart";
import "screens/login_screen.dart";
import "screens/modern_dashboard_screen.dart";
import "services/api_client.dart";
import "widgets/modern_sidebar.dart";

void main() {
  runApp(const WorkforceApp());
}

class WorkforceApp extends StatelessWidget {
  const WorkforceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Workforce Attendance",
      theme: ThemeData(useMaterial3: true),
      home: const AppRoot(),
    );
  }
}

class AppRoot extends StatefulWidget {
  const AppRoot({super.key});

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> {
  final _emailController = TextEditingController(text: "employee@example.com");
  final _passwordController = TextEditingController(text: "Employee123!");
  final _api = ApiClient(baseUrl: const String.fromEnvironment("API_BASE_URL", defaultValue: "http://localhost:3000/api"));

  bool _loggedIn = false;
  bool _isAdmin = false;
  bool _loading = false;
  String _error = "";
  String _currentUserName = "User";
  String _selectedMenuItem = "admin_dashboard";
  Set<String> _expandedGroups = {"admin"};
  int _totalSeconds = 0;
  List<dynamic> _sessions = [];
  List<dynamic> _roles = [];
  List<dynamic> _events = [];
  List<dynamic> _users = [];
  List<dynamic> _companyStructures = [];
  Map<String, dynamic> _dashboardMetrics = {};

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = "";
    });
    try {
      final login = await _api.login(_emailController.text.trim(), _passwordController.text);
      final roleList = ((login["user"]?["roles"] ?? []) as List<dynamic>).map((e) => e.toString()).toList();
      final email = (login["user"]?["email"] ?? _emailController.text.trim()).toString();
      final localPart = email.contains("@") ? email.split("@").first : email;
      _loggedIn = true;
      _isAdmin = roleList.contains("admin");
      _currentUserName = localPart.isEmpty ? "User" : "${localPart[0].toUpperCase()}${localPart.substring(1)}";
      _selectedMenuItem = _isAdmin ? "admin_dashboard" : "employees_attendance";
      _expandedGroups = _isAdmin ? {"admin"} : {"employees"};
      await _refresh();
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _refresh() async {
    setState(() => _loading = true);
    try {
      final futures = await Future.wait([
        _api.fetchToday(),
        _api.fetchSummary(),
        if (_isAdmin) _api.fetchRoles() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchAttendanceEvents() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchUsers() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchCompanyStructures() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchDashboardMetrics() else Future.value(<String, dynamic>{}),
      ]);
      final today = futures[0] as Map<String, dynamic>;
      final sessions = futures[1] as List<dynamic>;
      final roles = futures[2] as List<dynamic>;
      final events = futures[3] as List<dynamic>;
      final users = futures[4] as List<dynamic>;
      final companyStructures = futures[5] as List<dynamic>;
      final dashboardMetrics = futures[6] as Map<String, dynamic>;
      if (mounted) {
        setState(() {
          _totalSeconds = (today["totalSeconds"] ?? 0) as int;
          _sessions = sessions;
          _roles = roles;
          _events = events;
          _users = users;
          _companyStructures = companyStructures;
          _dashboardMetrics = dashboardMetrics;
        });
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _createRole(String name, String description, List<String> permissions) async {
    setState(() => _loading = true);
    try {
      await _api.createRole(name, description, permissions);
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _createUser(
    Map<String, dynamic> payload,
  ) async {
    setState(() => _loading = true);
    try {
      await _api.createUser(
        email: payload["email"].toString(),
        password: payload["password"].toString(),
        displayName: payload["displayName"].toString(),
        employeeCode: payload["employeeCode"].toString(),
        roleNames: (payload["roleNames"] as List<dynamic>).map((e) => e.toString()).toList(),
      );
      if (payload["profile"] is Map<String, dynamic>) {
        final users = await _api.fetchUsers();
        final created = users.cast<Map<String, dynamic>>().firstWhere(
              (u) => (u["email"]?.toString() ?? "").toLowerCase() == payload["email"].toString().toLowerCase(),
              orElse: () => <String, dynamic>{},
            );
        if (created["_id"] != null) {
          await _api.updateUser(created["_id"].toString(), {"profile": payload["profile"]});
        }
      }
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _updateUser(String userId, Map<String, dynamic> payload) async {
    setState(() => _loading = true);
    try {
      await _api.updateUser(userId, payload);
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _createCompanyStructure(Map<String, dynamic> payload) async {
    setState(() => _loading = true);
    try {
      await _api.createCompanyStructure(payload);
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _updateCompanyStructure(String id, Map<String, dynamic> payload) async {
    setState(() => _loading = true);
    try {
      await _api.updateCompanyStructure(id, payload);
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _deleteCompanyStructure(String id) async {
    setState(() => _loading = true);
    try {
      await _api.deleteCompanyStructure(id);
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _enrollFace(String userId, String imageBase64) async {
    setState(() => _loading = true);
    try {
      await _api.enrollFace(userId, imageBase64);
      await _refresh();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _clockIn(String imageBase64) async {
    setState(() => _loading = true);
    try {
      await _api.clockIn(imageBase64);
      await _refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _clockOut(String imageBase64) async {
    setState(() => _loading = true);
    try {
      await _api.clockOut(imageBase64);
      await _refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loggedIn
          ? _buildDesktopShell()
          : LoginScreen(
              onLogin: _login,
              emailController: _emailController,
              passwordController: _passwordController,
              errorText: _error,
              loading: _loading,
            ),
    );
  }

  Widget _buildDesktopShell() {
    final groups = _isAdmin
        ? const [
            ModernNavGroup(
              keyName: "admin",
              label: "Admin",
              icon: Icons.token_outlined,
              items: [
                ModernNavItem(keyName: "admin_dashboard", label: "Dashboard", icon: Icons.desktop_windows_outlined),
                ModernNavItem(keyName: "admin_company_structure", label: "Company Structure", icon: Icons.apartment),
                ModernNavItem(keyName: "admin_job_setup", label: "Job Details Setup", icon: Icons.view_week_outlined),
                ModernNavItem(keyName: "admin_qualification_setup", label: "Qualifications Setup", icon: Icons.check_box_outlined),
                ModernNavItem(keyName: "admin_projects", label: "Projects", icon: Icons.list_alt_outlined),
              ],
            ),
            ModernNavGroup(
              keyName: "employees",
              label: "Employees",
              icon: Icons.grid_view,
              items: [
                ModernNavItem(keyName: "employees_list", label: "Employees", icon: Icons.groups),
              ],
            ),
            ModernNavGroup(
              keyName: "manage",
              label: "Manage",
              icon: Icons.tune,
              items: [
                ModernNavItem(keyName: "manage_documents", label: "Documents", icon: Icons.description_outlined),
                ModernNavItem(keyName: "employees_attendance", label: "Attendance", icon: Icons.schedule_outlined),
                ModernNavItem(keyName: "manage_travel", label: "Travel", icon: Icons.flight_outlined),
                ModernNavItem(keyName: "manage_overtime", label: "Overtime", icon: Icons.more_time_outlined),
              ],
            ),
            ModernNavGroup(
              keyName: "admin_reports",
              label: "Admin Reports",
              icon: Icons.auto_stories,
              items: [
                ModernNavItem(keyName: "reports", label: "Reports", icon: Icons.folder_open_outlined),
              ],
            ),
            ModernNavGroup(
              keyName: "system",
              label: "System",
              icon: Icons.settings_suggest_outlined,
              items: [
                ModernNavItem(keyName: "system_settings", label: "Settings", icon: Icons.settings_outlined),
                ModernNavItem(keyName: "system_users", label: "Users", icon: Icons.person_outline),
                ModernNavItem(keyName: "system_modules", label: "Manage Modules", icon: Icons.folder_outlined),
                ModernNavItem(keyName: "system_permissions", label: "Manage Permissions", icon: Icons.lock_outline),
                ModernNavItem(keyName: "system_fields", label: "Field Names", icon: Icons.straighten_outlined),
              ],
            ),
            ModernNavGroup(
              keyName: "insights",
              label: "Insights",
              icon: Icons.show_chart,
              items: [
                ModernNavItem(keyName: "insights_attendance", label: "Time and Attendance", icon: Icons.person_search_outlined),
              ],
            ),
            ModernNavGroup(
              keyName: "payroll",
              label: "Payroll",
              icon: Icons.receipt_long,
              items: [
                ModernNavItem(keyName: "payroll_salary", label: "Salary", icon: Icons.payments_outlined),
                ModernNavItem(keyName: "payroll_reports", label: "Payroll Reports", icon: Icons.analytics_outlined),
              ],
            ),
          ]
        : const [
            ModernNavGroup(
              keyName: "employees",
              label: "Employees",
              icon: Icons.grid_view,
              items: [
                ModernNavItem(keyName: "employees_list", label: "Employees", icon: Icons.groups),
                ModernNavItem(keyName: "employees_attendance", label: "Attendance", icon: Icons.schedule_outlined),
              ],
            ),
            ModernNavGroup(
              keyName: "insights",
              label: "Insights",
              icon: Icons.show_chart,
              items: [
                ModernNavItem(keyName: "insights_attendance", label: "Time and Attendance", icon: Icons.person_search_outlined),
              ],
            ),
          ];

    return Row(
      children: [
        ModernSidebar(
          userName: _currentUserName,
          selectedItemKey: _selectedMenuItem,
          groups: groups,
          expandedGroups: _expandedGroups,
          onSelectItem: (itemKey) => setState(() => _selectedMenuItem = itemKey),
          onToggleGroup: (groupKey) {
            setState(() {
              if (_expandedGroups.contains(groupKey)) {
                _expandedGroups.remove(groupKey);
              } else {
                _expandedGroups.add(groupKey);
              }
            });
          },
        ),
        Expanded(
          child: Column(
            children: [
              _buildTopHeaderBar(),
              Expanded(child: _buildAuthenticatedContent()),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTopHeaderBar() {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: const Row(
                children: [
                  SizedBox(width: 10),
                  Icon(Icons.search, color: Color(0xFF9CA3AF), size: 18),
                  SizedBox(width: 8),
                  Text(
                    "Search employees, teams, requests...",
                    style: TextStyle(color: Color(0xFF6B7280), fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
          const Spacer(),
          const Icon(Icons.notifications_none, color: Color(0xFF6B7280), size: 21),
          const SizedBox(width: 14),
          CircleAvatar(
            radius: 14,
            backgroundColor: const Color(0xFFE0ECFF),
            child: Text(
              _currentUserName.isNotEmpty ? _currentUserName.substring(0, 1).toUpperCase() : "U",
              style: const TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(width: 6),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_currentUserName, style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w600)),
              Text(_isAdmin ? "Admin" : "Employee", style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12)),
            ],
          ),
          const SizedBox(width: 2),
          const Icon(Icons.arrow_drop_down, color: Color(0xFF6B7280)),
        ],
      ),
    );
  }

  Widget _buildAuthenticatedContent() {
    switch (_selectedMenuItem) {
      case "admin_dashboard":
        return ModernDashboardScreen(metrics: _dashboardMetrics);
      case "admin_company_structure":
        return CompanyStructureScreen(
          rows: _companyStructures,
          onRefresh: _refresh,
          onCreate: _createCompanyStructure,
          onUpdate: _updateCompanyStructure,
          onDelete: _deleteCompanyStructure,
        );
      case "employees_list":
        return EmployeesScreen(
          users: _users,
          onRefresh: _refresh,
          onCreateUser: _createUser,
          onUpdateUser: _updateUser,
        );
      case "system_settings":
      case "system_users":
      case "system_permissions":
        return AdminScreen(
          loading: _loading,
          roles: _roles,
          events: _events,
          onRefresh: _refresh,
          onCreateRole: _createRole,
          onCreateUser: _createUser,
          onEnrollFace: _enrollFace,
        );
      case "employees_attendance":
      case "manage_overtime":
        return HomeScreen(
          totalSeconds: _totalSeconds,
          events: _sessions,
          loading: _loading,
          onRefresh: _refresh,
          onClockIn: _clockIn,
          onClockOut: _clockOut,
        );
      default:
        return _placeholderPanel(
          _selectedMenuItem.replaceAll("_", " "),
          "This module is ready for feature wiring.",
        );
    }
  }

  Widget _placeholderPanel(String title, String message) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Text(message, style: const TextStyle(color: Colors.black54)),
        ],
      ),
    );
  }
}
