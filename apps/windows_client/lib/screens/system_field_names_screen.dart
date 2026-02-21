import "package:flutter/material.dart";

class SystemFieldNamesScreen extends StatefulWidget {
  const SystemFieldNamesScreen({super.key});
  @override
  State<SystemFieldNamesScreen> createState() => _SystemFieldNamesScreenState();
}

class _SystemFieldNamesScreenState extends State<SystemFieldNamesScreen> {
  int page = 1;
  final pages = <int, List<(String, String, String)>>{
    1: const [
      ("employee_id", "Employee Number", "Employee Number"),
      ("first_name", "First Name", "First Name"),
      ("middle_name", "Middle Name", "Middle Name"),
      ("last_name", "Last Name", "Last Name"),
      ("nationality", "Nationality", "Nationality"),
      ("ethnicity", "Ethnicity", "Ethnicity"),
      ("immigration_status", "Immigration Status", "Immigration Status"),
      ("birthday", "Date of Birth", "Date of Birth"),
      ("gender", "Gender", "Gender"),
      ("marital_status", "Marital Status", "Marital Status"),
    ],
    2: const [
      ("ssn_num", "Social Insurance", "Social Insurance"),
      ("nic_num", "National ID", "National ID"),
      ("other_id", "Additional IDs", "Additional IDs"),
      ("driving_license", "Driving License", "Driving License"),
      ("employment_status", "Employment Status", "Employment Status"),
      ("job_title", "Job Title", "Job Title"),
      ("pay_grade", "Pay Grade", "Pay Grade"),
      ("work_station_id", "Work Station Id", "Work Station Id"),
      ("address1", "Address Line 1", "Address Line 1"),
      ("address2", "Address Line 2", "Address Line 2"),
    ],
    3: const [
      ("city", "City", "City"),
      ("country", "Country", "Country"),
      ("province", "Province", "Province"),
      ("postal_code", "Postal/Zip Code", "Postal/Zip Code"),
      ("home_phone", "Home Phone", "Home Phone"),
      ("mobile_phone", "Mobile Phone", "Mobile Phone"),
      ("work_phone", "Work Phone", "Work Phone"),
      ("work_email", "Work Email", "Work Email"),
      ("private_email", "Private Email", "Private Email"),
      ("joined_date", "Joined Date", "Joined Date"),
    ],
    4: const [
      ("confirmation_date", "Confirmation Date", "Confirmation Date"),
      ("termination_date", "Termination Date", "Termination Date"),
      ("department", "Department", "Department"),
      ("notes", "Notes", "Notes"),
      ("tax_id", "Personal Tax ID", "Personal Tax ID"),
      ("health_insurance", "Health Insurance", "Health Insurance"),
      ("supervisor", "Manager", "Manager"),
      ("indirect_supervisors", "Indirect Managers", "Indirect Managers"),
    ],
  };
  @override
  Widget build(BuildContext context) {
    final rows = pages[page]!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Container(height: 46, padding: const EdgeInsets.symmetric(horizontal: 18), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border.all(color: const Color(0xFFE5E7EB))), alignment: Alignment.centerLeft, child: const Text("Employee Field Names")),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Column(children: [
            const Row(children: [Spacer(), SizedBox(width: 320, child: TextField(decoration: InputDecoration(hintText: "input search text", border: OutlineInputBorder())))]),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB))),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.sizeOf(context).width - 120),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF3F4F6)),
                    columns: const [DataColumn(label: Text("Name")), DataColumn(label: Text("Original Text")), DataColumn(label: Text("Mapped Text")), DataColumn(label: Text("Actions"))],
                    rows: rows.map((r) => DataRow(cells: [DataCell(Text(r.$1)), DataCell(Text(r.$2)), DataCell(Text(r.$3)), DataCell(OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.edit_outlined, size: 14), label: const Text("Edit")))])).toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(mainAxisAlignment: MainAxisAlignment.end, children: [
              OutlinedButton(onPressed: page > 1 ? () => setState(() => page--) : null, child: const Icon(Icons.chevron_left)),
              const SizedBox(width: 8),
              for (var i = 1; i <= 4; i++) ...[
                SizedBox(width: 42, height: 38, child: i == page ? FilledButton(onPressed: () => setState(() => page = i), child: Text("$i")) : OutlinedButton(onPressed: () => setState(() => page = i), child: Text("$i"))),
                const SizedBox(width: 8),
              ],
              OutlinedButton(onPressed: page < 4 ? () => setState(() => page++) : null, child: const Icon(Icons.chevron_right)),
            ]),
          ]),
        ),
      ]),
    );
  }
}

