import "dart:convert";
import "package:flutter/material.dart";
import "screens/admin_screen.dart";
import "screens/admin_attendance_screen.dart";
import "screens/admin_reports_screen.dart";
import "screens/company_structure_screen.dart";
import "screens/documents_screen.dart";
import "screens/employees_screen.dart";
import "screens/face_verification_login_screen.dart";
import "screens/home_screen.dart";
import "screens/insights_attendance_screen.dart";
import "screens/job_details_setup_screen.dart";
import "screens/login_screen.dart";
import "screens/modern_dashboard_screen.dart";
import "screens/overtime_screen.dart";
import "screens/payroll_salary_screen.dart";
import "screens/payroll_reports_screen.dart";
import "screens/projects_setup_screen.dart";
import "screens/qualifications_setup_screen.dart";
import "screens/system_field_names_screen.dart";
import "screens/system_modules_screen.dart";
import "screens/system_permissions_screen.dart";
import "screens/system_users_screen.dart";
import "screens/travel_requests_screen.dart";
import "services/api_client.dart";
import "widgets/modern_sidebar.dart";

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _api = ApiClient(baseUrl: const String.fromEnvironment("API_BASE_URL", defaultValue: "http://localhost:3000/api"));

  bool _loggedIn = false;
  bool _needsFaceVerification = false;
  bool _faceEnrollMode = false;
  bool _isAdmin = false;
  bool _loading = false;
  String _error = "";
  String _currentUserName = "User";
  String _profilePictureBase64 = "";
  String _selectedMenuItem = "admin_dashboard";
  Set<String> _expandedGroups = {"admin"};
  int _totalSeconds = 0;
  List<dynamic> _sessions = [];
  List<dynamic> _hoursByDay = [];
  List<dynamic> _roles = [];
  List<dynamic> _events = [];
  List<dynamic> _users = [];
  List<dynamic> _companyStructures = [];
  List<dynamic> _awayAlerts = [];
  Map<String, dynamic> _dashboardMetrics = {};
  Map<String, dynamic>? _selectedEmployee;
  Map<String, dynamic> _selectedEmployeeAttendance = {};

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
      _needsFaceVerification = true;
      _isAdmin = roleList.contains("admin");
      _currentUserName = localPart.isEmpty ? "User" : "${localPart[0].toUpperCase()}${localPart.substring(1)}";
      _selectedMenuItem = _isAdmin ? "admin_dashboard" : "employees_attendance";
      _expandedGroups = _isAdmin ? {"admin"} : {"employees"};
      try {
        _faceEnrollMode = !(await _api.hasFaceTemplate());
      } catch (_) {
        _faceEnrollMode = false;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _verifyFaceForLogin(List<double> embedding) async {
    await _api.verifyFaceForLogin(embedding);
  }

  Future<void> _enrollMyFace(List<double> embedding, String pose, {String? profileImageBase64}) async {
    await _api.enrollMyFace(embedding, pose, profileImageBase64: profileImageBase64);
  }

  void _onFaceVerified() {
    setState(() {
      _loggedIn = true;
      _needsFaceVerification = false;
    });
    _refresh();
  }

  void _onFaceVerificationFailed() {
    setState(() => _needsFaceVerification = true);
  }

  Future<void> _onEmployeeSelected(Map<String, dynamic> user) async {
    setState(() {
      _selectedEmployee = user;
      _selectedEmployeeAttendance = {};
    });
    try {
      final att = await _api.fetchUserAttendance(user["_id"].toString(), days: 30);
      if (mounted && _selectedEmployee?["_id"] == user["_id"]) {
        setState(() => _selectedEmployeeAttendance = att);
      }
    } catch (_) {
      if (mounted && _selectedEmployee?["_id"] == user["_id"]) {
        setState(() => _selectedEmployeeAttendance = {"sessions": [], "hoursByDay": []});
      }
    }
  }

  Future<void> _backToLogin() async {
    await _api.clearTokens();
    setState(() {
      _needsFaceVerification = false;
    });
  }

  Future<void> _refresh() async {
    setState(() => _loading = true);
    try {
      final futures = await Future.wait([
        _api.fetchToday(),
        _api.fetchSummary(),
        _api.fetchMyHoursByDay(days: 30),
        _api.fetchCurrentUser(),
        if (_isAdmin) _api.fetchRoles() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchAttendanceEvents() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchUsers() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchCompanyStructures() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchAwayAlerts() else Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchDashboardMetrics() else Future.value(<String, dynamic>{}),
      ]);
      final today = futures[0] as Map<String, dynamic>;
      final sessions = futures[1] as List<dynamic>;
      final hoursByDay = futures[2] as List<dynamic>;
      final currentUser = futures[3] as Map<String, dynamic>;
      final roles = futures[4] as List<dynamic>;
      final events = futures[5] as List<dynamic>;
      final users = futures[6] as List<dynamic>;
      final companyStructures = futures[7] as List<dynamic>;
      final awayAlerts = futures[8] as List<dynamic>;
      final dashboardMetrics = futures[9] as Map<String, dynamic>;
      if (mounted) {
        setState(() {
          _totalSeconds = (today["totalSeconds"] ?? 0) as int;
          _sessions = sessions;
          _hoursByDay = hoursByDay;
          final profile = currentUser["profile"] as Map<String, dynamic>?;
          _profilePictureBase64 = profile?["profilePictureBase64"]?.toString() ?? "";
          _roles = roles;
          _events = events;
          _users = users;
          _companyStructures = companyStructures;
          _awayAlerts = awayAlerts;
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

  Future<void> _reportAwayAlert() async {
    await _api.reportAwayAlert();
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

  Future<void> _logout() async {
    setState(() => _loading = true);
    try {
      await _api.logout();
    } finally {
      if (mounted) {
        setState(() {
          _loggedIn = false;
          _isAdmin = false;
          _error = "";
          _selectedMenuItem = "admin_dashboard";
          _expandedGroups = {"admin"};
          _sessions = [];
          _roles = [];
          _events = [];
          _users = [];
          _companyStructures = [];
          _dashboardMetrics = {};
          _totalSeconds = 0;
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loggedIn) {
      return _buildDesktopShell();
    }
    if (_needsFaceVerification) {
      return FaceVerificationLoginScreen(
        onVerify: _verifyFaceForLogin,
        onEnroll: _enrollMyFace,
        onVerified: _onFaceVerified,
        onVerificationFailed: _onFaceVerificationFailed,
        onBackToLogin: () { _backToLogin(); },
        isEnrollMode: _faceEnrollMode,
      );
    }
    return LoginScreen(
      onLogin: _login,
      emailController: _emailController,
      passwordController: _passwordController,
      errorText: _error,
      loading: _loading,
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

    return Scaffold(
      body: Row(
        children: [
          ModernSidebar(
          userName: _currentUserName,
          profilePictureBase64: _profilePictureBase64,
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
      ),
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
            backgroundImage: _profilePictureBase64.isNotEmpty
                ? MemoryImage(base64Decode(_profilePictureBase64))
                : null,
            child: _profilePictureBase64.isEmpty
                ? Text(
                    _currentUserName.isNotEmpty ? _currentUserName.substring(0, 1).toUpperCase() : "U",
                    style: const TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.w700),
                  )
                : null,
          ),
          const SizedBox(width: 6),
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == "logout") {
                _logout();
              }
            },
            itemBuilder: (context) => const [
              PopupMenuItem<String>(value: "logout", child: Text("Logout")),
            ],
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _currentUserName,
                      style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w600, fontSize: 14),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                    Text(_isAdmin ? "Admin" : "Employee", style: const TextStyle(color: Color(0xFF6B7280), fontSize: 11)),
                  ],
                ),
                const SizedBox(width: 2),
                const Icon(Icons.arrow_drop_down, color: Color(0xFF6B7280)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuthenticatedContent() {
    switch (_selectedMenuItem) {
      case "admin_dashboard":
        return ModernDashboardScreen(
          metrics: _dashboardMetrics,
          events: _events,
          awayAlerts: _awayAlerts,
          hoursByDay: _hoursByDay,
          onRefresh: _refresh,
        );
      case "admin_company_structure":
        return CompanyStructureScreen(
          rows: _companyStructures,
          onRefresh: _refresh,
          onCreate: _createCompanyStructure,
          onUpdate: _updateCompanyStructure,
          onDelete: _deleteCompanyStructure,
        );
      case "admin_job_setup":
        return const JobDetailsSetupScreen();
      case "admin_qualification_setup":
        return const QualificationsSetupScreen();
      case "admin_projects":
        return const ProjectsSetupScreen();
      case "reports":
        return const AdminReportsScreen();
      case "employees_list":
        return EmployeesScreen(
          users: _users,
          selectedUser: _selectedEmployee,
          selectedUserAttendance: _selectedEmployeeAttendance,
          isAdmin: _isAdmin,
          onRefresh: _refresh,
          onCreateUser: _createUser,
          onUpdateUser: _updateUser,
          onUserSelected: _onEmployeeSelected,
        );
      case "system_settings":
        return AdminScreen(
          loading: _loading,
          roles: _roles,
          events: _events,
          awayAlerts: _awayAlerts,
          onRefresh: _refresh,
          onCreateRole: _createRole,
          onCreateUser: _createUser,
          onEnrollFace: _enrollFace,
        );
      case "system_users":
        return const SystemUsersScreen();
      case "system_modules":
        return const SystemModulesScreen();
      case "system_permissions":
        return const SystemPermissionsScreen();
      case "system_fields":
        return const SystemFieldNamesScreen();
      case "employees_attendance":
        if (_isAdmin) {
          return const AdminAttendanceScreen();
        }
        return HomeScreen(
          totalSeconds: _totalSeconds,
          events: _sessions,
          hoursByDay: _hoursByDay,
          loading: _loading,
          onRefresh: _refresh,
          onClockIn: _clockIn,
          onClockOut: _clockOut,
          onReportAway: _reportAwayAlert,
        );
      case "insights_attendance":
        return const InsightsAttendanceScreen();
      case "payroll_salary":
        return const PayrollSalaryScreen();
      case "payroll_reports":
        return const PayrollReportsScreen();
      case "manage_overtime":
        return const OvertimeScreen();
      case "manage_documents":
        return const DocumentsScreen();
      case "manage_travel":
        return const TravelRequestsScreen();
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
