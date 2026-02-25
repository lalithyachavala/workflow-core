import "dart:convert";
import "package:flutter/material.dart";
import "screens/admin_attendance_screen.dart";
import "screens/admin_login_activity_screen.dart";
import "screens/admin_reports_screen.dart";
import "screens/admin_screen.dart";
import "screens/company_structure_screen.dart";
import "screens/documents_screen.dart";
import "screens/employees_screen.dart";
import "screens/face_verification_login_screen.dart";
import "screens/home_screen.dart";
import "screens/inactivities_screen.dart";
import "screens/insights_attendance_screen.dart";
import "screens/job_details_setup_screen.dart";
import "screens/login_activity_screen.dart";
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
  final _api = ApiClient(
      baseUrl: const String.fromEnvironment("API_BASE_URL",
          defaultValue: "http://localhost:3000/api"));

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
  int _hoursChartDays = 30;
  int _employeeChartDays = 7;
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
      final login = await _api.login(
          _emailController.text.trim(), _passwordController.text);
      final roleList = ((login["user"]?["roles"] ?? []) as List<dynamic>)
          .map((e) => e.toString())
          .toList();
      final email =
          (login["user"]?["email"] ?? _emailController.text.trim()).toString();
      final localPart = email.contains("@") ? email.split("@").first : email;
      _needsFaceVerification = true;
      _isAdmin = roleList.contains("admin");
      _currentUserName = localPart.isEmpty
          ? "User"
          : "${localPart[0].toUpperCase()}${localPart.substring(1)}";
      _selectedMenuItem = _isAdmin ? "admin_dashboard" : "employees_attendance";
      _expandedGroups = _isAdmin ? {"admin"} : {"employees"};
      // Returning users with enrolled face: verify only (one capture). New users: enroll (3 poses).
      // Use token from login response so we don't rely on token store read-after-write.
      try {
        final accessToken = login["accessToken"]?.toString();
        final hasTemplate = accessToken != null && accessToken.isNotEmpty
            ? await _api.hasFaceTemplateWithToken(accessToken)
            : await _api.hasFaceTemplate();
        _faceEnrollMode = !hasTemplate;
      } catch (_) {
        _faceEnrollMode =
            false; // on error, show verify; backend will say "enroll first" if no template
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _verifyFaceForLogin(String imageBase64) async {
    await _api.verifyFaceForLogin(imageBase64);
  }

  Future<Map<String, dynamic>> _getEnrollFaceInfo() async {
    return _api.getEnrollFaceInfo();
  }

  Future<void> _enrollWithImages(List<String> imageBase64List) async {
    await _api.enrollMyFaceWithImages(imageBase64List);
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
      final att = await _api.fetchUserAttendance(user["_id"].toString(),
          days: _employeeChartDays);
      if (mounted && _selectedEmployee?["_id"] == user["_id"]) {
        setState(() => _selectedEmployeeAttendance = att);
      }
    } catch (_) {
      if (mounted && _selectedEmployee?["_id"] == user["_id"]) {
        setState(() =>
            _selectedEmployeeAttendance = {"sessions": [], "hoursByDay": []});
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
        _api.fetchMyHoursByDay(days: _hoursChartDays),
        _api.fetchCurrentUser(),
        if (_isAdmin) _api.fetchRoles() else Future.value(<dynamic>[]),
        if (_isAdmin)
          _api.fetchAttendanceEvents()
        else
          Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchUsers() else Future.value(<dynamic>[]),
        if (_isAdmin)
          _api.fetchCompanyStructures()
        else
          Future.value(<dynamic>[]),
        if (_isAdmin) _api.fetchAwayAlerts() else Future.value(<dynamic>[]),
        if (_isAdmin)
          _api.fetchDashboardMetrics()
        else
          Future.value(<String, dynamic>{}),
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
          final displayName = profile?["displayName"]?.toString().trim();
          if (displayName != null && displayName.isNotEmpty) {
            _currentUserName = displayName;
          }
          _profilePictureBase64 =
              profile?["profilePictureBase64"]?.toString() ?? "";
          _roles = roles;
          _events = events;
          _users = users;
          _companyStructures = companyStructures;
          _awayAlerts = awayAlerts;
          _dashboardMetrics = dashboardMetrics;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = "Refresh failed: $e");
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _createRole(
      String name, String description, List<String> permissions) async {
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
        roleNames: (payload["roleNames"] as List<dynamic>)
            .map((e) => e.toString())
            .toList(),
      );
      if (payload["profile"] is Map<String, dynamic>) {
        final users = await _api.fetchUsers();
        final created = users.cast<Map<String, dynamic>>().firstWhere(
              (u) =>
                  (u["email"]?.toString() ?? "").toLowerCase() ==
                  payload["email"].toString().toLowerCase(),
              orElse: () => <String, dynamic>{},
            );
        if (created["_id"] != null) {
          await _api.updateUser(
              created["_id"].toString(), {"profile": payload["profile"]});
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

  Future<void> _updateCompanyStructure(
      String id, Map<String, dynamic> payload) async {
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
      final res = await _api.enrollFace(userId, imageBase64);
      if (mounted) {
        final code = res["employeeCode"]?.toString() ?? "";
        final msg = res["message"]?.toString() ?? "";
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text("Employee code for face registration: $code. $msg")),
        );
      }
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
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
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
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
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
        onEnrollInfo: _getEnrollFaceInfo,
        onEnrollWithImages: _enrollWithImages,
        onVerified: _onFaceVerified,
        onVerificationFailed: _onFaceVerificationFailed,
        onBackToLogin: () {
          _backToLogin();
        },
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
    final adminGroups = const [
      ModernNavGroup(
        keyName: "admin_dashboard",
        label: "Dashboard",
        icon: Icons.grid_view_outlined,
        items: [],
      ),
      ModernNavGroup(
        keyName: "recruitment",
        label: "Recruitment",
        icon: Icons.contact_phone_outlined,
        items: [],
      ),
      ModernNavGroup(
        keyName: "onboarding",
        label: "Onboarding",
        icon: Icons.rocket_launch_outlined,
        items: [],
      ),
      ModernNavGroup(
        keyName: "employees_group",
        label: "Employee",
        icon: Icons.people_outline,
        items: [
          ModernNavItem(
            keyName: "employees_list",
            label: "Employees",
            icon: Icons.groups_outlined,
          ),
          ModernNavItem(
            keyName: "admin_login_activity",
            label: "Login Activity",
            icon: Icons.history_outlined,
          ),
        ],
      ),
      ModernNavGroup(
        keyName: "employees_attendance",
        label: "Attendance",
        icon: Icons.check_circle_outline,
        items: [],
      ),
      ModernNavGroup(
        keyName: "manage_leave",
        label: "Leave",
        icon: Icons.cancel_outlined,
        items: [],
      ),
      ModernNavGroup(
        keyName: "payroll_group",
        label: "Payroll",
        icon: Icons.account_balance_wallet_outlined,
        items: [
          ModernNavItem(
            keyName: "payroll_dashboard",
            label: "Dashboard",
            icon: Icons.dashboard_outlined,
          ),
          ModernNavItem(
            keyName: "payroll_salary",
            label: "Payslips",
            icon: Icons.receipt_long_outlined,
          ),
          ModernNavItem(
            keyName: "payroll_reports",
            label: "Payroll Reports",
            icon: Icons.analytics_outlined,
          ),
          ModernNavItem(
            keyName: "payroll_contract",
            label: "Contract",
            icon: Icons.description_outlined,
          ),
          ModernNavItem(
            keyName: "payroll_allowances",
            label: "Allowances",
            icon: Icons.add_circle_outline,
          ),
          ModernNavItem(
            keyName: "payroll_deductions",
            label: "Deductions",
            icon: Icons.remove_circle_outline,
          ),
          ModernNavItem(
            keyName: "payroll_loan",
            label: "Loan / Advanced Salary",
            icon: Icons.monetization_on_outlined,
          ),
          ModernNavItem(
            keyName: "payroll_encashments",
            label: "Encashments & Reimbursements",
            icon: Icons.request_quote_outlined,
          ),
        ],
      ),
    ];

    final employeeGroups = const [
      ModernNavGroup(
        keyName: "admin_dashboard",
        label: "Dashboard",
        icon: Icons.grid_view_outlined,
        items: [],
      ),
      ModernNavGroup(
        keyName: "employees_attendance",
        label: "Attendance",
        icon: Icons.check_circle_outline,
        items: [],
      ),
      ModernNavGroup(
        keyName: "manage_leave",
        label: "Leave",
        icon: Icons.cancel_outlined,
        items: [],
      ),
      ModernNavGroup(
        keyName: "employees_group",
        label: "Employee",
        icon: Icons.people_outline,
        items: [
          ModernNavItem(
            keyName: "login_activity",
            label: "Login Activity",
            icon: Icons.history_outlined,
          ),
        ],
      ),
    ];

    final groups = _isAdmin ? adminGroups : employeeGroups;

    return Scaffold(
      body: Row(
        children: [
          ModernSidebar(
            userName: _currentUserName,
            profilePictureBase64: _profilePictureBase64,
            selectedItemKey: _selectedMenuItem,
            groups: groups,
            expandedGroups: _expandedGroups,
            onSelectItem: (itemKey) =>
                setState(() => _selectedMenuItem = itemKey),
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
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Row(
        children: [
          const Icon(Icons.menu, color: Color(0xFF6B7280), size: 24),
          const SizedBox(width: 16),
          InkWell(
            onTap: () => setState(() => _selectedMenuItem = "admin_dashboard"),
            child: const Text(
              "Euroasiann Group",
              style: TextStyle(
                color: Color(0xFF1F2937),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const Spacer(),
          // Timer Widget (Clickable to go to Attendance/HomeScreen)
          InkWell(
            onTap: () =>
                setState(() => _selectedMenuItem = "employees_attendance"),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF10B981), width: 1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Row(
                children: [
                  Icon(Icons.timer_outlined,
                      color: Color(0xFF10B981), size: 16),
                  SizedBox(width: 8),
                  Text(
                    "00:00:02",
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 20),
          _buildHeaderIcon(Icons.settings_outlined, onTap: () {
            setState(() => _selectedMenuItem = "system_settings");
          }),
          _buildHeaderIcon(Icons.notifications_none_outlined, badge: "0",
              onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Notifications module coming soon")),
            );
          }),
          // Language selection
          PopupMenuButton<String>(
            offset: const Offset(0, 48),
            onSelected: (lang) {},
            itemBuilder: (context) => [
              _buildLanguageItem("English (US)", "🇺🇸", true),
              _buildLanguageItem("Deutsche", "🇩🇪", false),
              _buildLanguageItem("Español", "🇪🇸", false),
              _buildLanguageItem("Français", "🇫🇷", false),
              _buildLanguageItem("عربى", "🇦🇪", false),
              _buildLanguageItem("Português (Brasil)", "🇧🇷", false),
              _buildLanguageItem("Simplified Chinese", "🇨🇳", false),
              _buildLanguageItem("Traditional Chinese", "🇹🇼", false),
              _buildLanguageItem("Italian", "🇮🇹", false),
            ],
            child: _buildHeaderIcon(Icons.language_outlined),
          ),
          // Company selection
          PopupMenuButton<String>(
            offset: const Offset(0, 48),
            onSelected: (comp) {},
            itemBuilder: (context) => [
              _buildCompanyItem("All Company", "AC", const Color(0xFF8DB600)),
              _buildCompanyItem(
                  "Euroasiann Group", "EG", const Color(0xFF1C1C1C),
                  isLogo: true),
              _buildCompanyItem("test", "T", const Color(0xFFE54F38)),
            ],
            child: _buildHeaderIcon(Icons.apartment_outlined),
          ),
          const SizedBox(width: 12),
          // Profile
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == "logout") {
                _logout();
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("$v details coming soon")),
                );
              }
            },
            offset: const Offset(0, 48),
            itemBuilder: (context) => const [
              PopupMenuItem(value: "profile", child: Text("My Profile")),
              PopupMenuItem(value: "username", child: Text("Change Username")),
              PopupMenuItem(value: "password", child: Text("Change Password")),
              PopupMenuDivider(),
              PopupMenuItem(value: "logout", child: Text("Logout")),
            ],
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: const Color(0xFFF3F4F6),
                  backgroundImage: _profilePictureBase64.isNotEmpty
                      ? MemoryImage(base64Decode(_profilePictureBase64))
                      : null,
                  child: _profilePictureBase64.isEmpty
                      ? const Icon(Icons.person,
                          size: 20, color: Color(0xFF9CA3AF))
                      : null,
                ),
                const SizedBox(width: 8),
                Text(
                  _currentUserName,
                  style: const TextStyle(
                    color: Color(0xFF374151),
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Icon(Icons.arrow_drop_down, color: Color(0xFF6B7280)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PopupMenuItem<String> _buildLanguageItem(
      String label, String flag, bool active) {
    return PopupMenuItem(
      value: label,
      child: Row(
        children: [
          Text(flag, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 14))),
          if (active)
            const Icon(Icons.check_circle_outline,
                size: 16, color: Colors.green),
        ],
      ),
    );
  }

  PopupMenuItem<String> _buildCompanyItem(
      String label, String initial, Color bgColor,
      {bool isLogo = false}) {
    return PopupMenuItem(
      value: label,
      child: Row(
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: isLogo ? Colors.transparent : bgColor,
            child: isLogo
                ? Image.asset('assets/logo.png', height: 20)
                : Text(initial,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildHeaderIcon(IconData icon, {String? badge, VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(icon, color: const Color(0xFF4B5563), size: 22),
            if (badge != null && badge != "0")
              Positioned(
                right: -6,
                top: -6,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Color(0xFFE54F38),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    badge,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ),
          ],
        ),
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
          hoursChartDays: _hoursChartDays,
          onHoursChartDaysChanged: (d) {
            setState(() => _hoursChartDays = d);
            _refresh();
          },
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
          employeeChartDays: _employeeChartDays,
          onEmployeeChartDaysChanged: (d) {
            setState(() => _employeeChartDays = d);
            if (_selectedEmployee != null)
              _onEmployeeSelected(_selectedEmployee!);
          },
          onRefresh: _refresh,
          onCreateUser: _createUser,
          onUpdateUser: _updateUser,
          onUserSelected: _onEmployeeSelected,
        );
      case "admin_login_activity":
        return AdminLoginActivityScreen(
            fetchAdminLoginHistory: ({int days = 7}) =>
                _api.fetchAdminLoginHistory(days: days));
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
      case "admin_inactivities":
        if (_isAdmin) {
          return InactivitiesScreen(
            awayAlerts: _awayAlerts,
            loading: _loading,
            onRefresh: _refresh,
          );
        }
        return _placeholderPanel("Inactivities", "Admin only.");
      case "employees_attendance":
        if (_isAdmin) {
          return const AdminAttendanceScreen();
        }
        return HomeScreen(
          totalSeconds: _totalSeconds,
          events: _sessions,
          hoursByDay: _hoursByDay,
          hoursChartDays: _hoursChartDays,
          loading: _loading,
          onRefresh: _refresh,
          onClockIn: _clockIn,
          onClockOut: _clockOut,
          onReportAway: _reportAwayAlert,
          onHoursChartDaysChanged: (d) {
            setState(() => _hoursChartDays = d);
            _refresh();
          },
        );
      case "insights_attendance":
        return const InsightsAttendanceScreen();
      case "login_activity":
        return LoginActivityScreen(
            fetchLoginHistory: (days) => _api.fetchLoginHistory(days: days));
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
          Text(title,
              style:
                  const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Text(message, style: const TextStyle(color: Colors.black54)),
        ],
      ),
    );
  }
}
