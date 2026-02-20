import "package:flutter/material.dart";

enum _PayrollReportsTab {
  payrollEmployees,
  payrollReports,
  payrollColumns,
  payrollGroups,
  savedCalculations,
  payslipTemplates,
}

class PayrollReportsScreen extends StatefulWidget {
  const PayrollReportsScreen({super.key});

  @override
  State<PayrollReportsScreen> createState() => _PayrollReportsScreenState();
}

class _PayrollReportsScreenState extends State<PayrollReportsScreen> {
  _PayrollReportsTab _activeTab = _PayrollReportsTab.payrollEmployees;
  final Map<_PayrollReportsTab, TextEditingController> _searchControllers = {
    _PayrollReportsTab.payrollEmployees: TextEditingController(),
    _PayrollReportsTab.payrollReports: TextEditingController(),
    _PayrollReportsTab.payrollColumns: TextEditingController(),
    _PayrollReportsTab.payrollGroups: TextEditingController(),
    _PayrollReportsTab.savedCalculations: TextEditingController(),
    _PayrollReportsTab.payslipTemplates: TextEditingController(),
  };

  @override
  void dispose() {
    for (final controller in _searchControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTabHeader(),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            padding: const EdgeInsets.all(12),
            child: _buildActivePanel(),
          ),
        ],
      ),
    );
  }

  Widget _buildActivePanel() {
    switch (_activeTab) {
      case _PayrollReportsTab.payrollEmployees:
        return _buildPanel(
          columns: const ["Employee", "Pay Frequency", "Payroll Group", "Currency", ""],
          showFilter: true,
        );
      case _PayrollReportsTab.payrollReports:
        return _buildPanel(
          columns: const ["Name", "Pay Frequency", "Department", "Date Start", "Date End", "Status", ""],
          showFilter: false,
        );
      case _PayrollReportsTab.payrollColumns:
        return _buildPanel(
          columns: const ["Name", "Column Order", "Calculation Method", "Payroll Group", "Editable", "Enabled", ""],
          showFilter: true,
        );
      case _PayrollReportsTab.payrollGroups:
        return _buildPanel(
          columns: const ["Name", "Details", ""],
          showFilter: false,
        );
      case _PayrollReportsTab.savedCalculations:
        return _buildPanel(
          columns: const ["Name", "Payroll Group", ""],
          showFilter: false,
        );
      case _PayrollReportsTab.payslipTemplates:
        return _buildPanel(
          columns: const ["Name", ""],
          showFilter: false,
        );
    }
  }

  Widget _buildPanel({
    required List<String> columns,
    required bool showFilter,
  }) {
    final controller = _searchControllers[_activeTab]!;
    return Column(
      children: [
        Row(
          children: [
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E88E5),
                foregroundColor: Colors.white,
              ),
              child: const Text("Add New +"),
            ),
            if (showFilter) ...[
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E88E5),
                  foregroundColor: Colors.white,
                ),
                icon: const Icon(Icons.filter_alt, size: 18),
                label: const Text("Filter"),
              ),
            ],
            const Spacer(),
            SizedBox(
              width: 300,
              child: TextField(
                controller: controller,
                decoration: const InputDecoration(
                  hintText: "Search",
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: ConstrainedBox(
              constraints: BoxConstraints(minWidth: (columns.length * 190).toDouble()),
              child: DataTable(
                headingRowHeight: 50,
                dataRowMinHeight: 50,
                dataRowMaxHeight: 50,
                headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
                columns: columns
                    .map(
                      (column) => DataColumn(
                        label: Text(
                          column,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    )
                    .toList(),
                rows: List<DataRow>.generate(
                  1,
                  (_) => DataRow(
                    cells: List<DataCell>.generate(
                      columns.length,
                      (index) => DataCell(Text(index == 0 ? "No data available in table" : "")),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            const Text("Showing 0 to 0 of 0 entries", style: TextStyle(fontSize: 12)),
            const Spacer(),
            SizedBox(
              height: 36,
              child: OutlinedButton(
                onPressed: () {},
                child: const Text("<- Previous"),
              ),
            ),
            const SizedBox(width: 4),
            SizedBox(
              height: 36,
              child: OutlinedButton(
                onPressed: () {},
                child: const Text("Next ->"),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTabHeader() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _TabChip(
            title: "Payroll Employees",
            selected: _activeTab == _PayrollReportsTab.payrollEmployees,
            onTap: () => setState(() => _activeTab = _PayrollReportsTab.payrollEmployees),
          ),
          _TabChip(
            title: "Payroll Reports",
            selected: _activeTab == _PayrollReportsTab.payrollReports,
            onTap: () => setState(() => _activeTab = _PayrollReportsTab.payrollReports),
          ),
          _TabChip(
            title: "Payroll Columns",
            selected: _activeTab == _PayrollReportsTab.payrollColumns,
            onTap: () => setState(() => _activeTab = _PayrollReportsTab.payrollColumns),
          ),
          _TabChip(
            title: "Payroll Groups",
            selected: _activeTab == _PayrollReportsTab.payrollGroups,
            onTap: () => setState(() => _activeTab = _PayrollReportsTab.payrollGroups),
          ),
          _TabChip(
            title: "Saved Calculations",
            selected: _activeTab == _PayrollReportsTab.savedCalculations,
            onTap: () => setState(() => _activeTab = _PayrollReportsTab.savedCalculations),
          ),
          _TabChip(
            title: "Payslip Templates",
            selected: _activeTab == _PayrollReportsTab.payslipTemplates,
            onTap: () => setState(() => _activeTab = _PayrollReportsTab.payslipTemplates),
          ),
        ],
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  const _TabChip({
    required this.title,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 26),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFF8FAFC) : Colors.transparent,
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        alignment: Alignment.center,
        child: Text(
          title,
          style: TextStyle(
            fontSize: 16,
            color: const Color(0xFF374151),
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}


