import "package:flutter/material.dart";

class CompanyStructureScreen extends StatelessWidget {
  const CompanyStructureScreen({
    super.key,
    required this.rows,
    required this.onRefresh,
    required this.onCreate,
    required this.onUpdate,
    required this.onDelete,
  });

  final List<dynamic> rows;
  final Future<void> Function() onRefresh;
  final Future<void> Function(Map<String, dynamic>) onCreate;
  final Future<void> Function(String id, Map<String, dynamic>) onUpdate;
  final Future<void> Function(String id) onDelete;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Company Structure", style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          const Text(
            "Here you can define the structure of the company by adding branches, departments, and units.",
            style: TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: () => _openCreateDialog(context),
                icon: const Icon(Icons.add_circle_outline),
                label: const Text("Add New"),
              ),
              const SizedBox(width: 10),
              OutlinedButton(onPressed: onRefresh, child: const Text("Refresh")),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE5E7EB)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text("Name")),
                    DataColumn(label: Text("Address")),
                    DataColumn(label: Text("Type")),
                    DataColumn(label: Text("Country")),
                    DataColumn(label: Text("Time Zone")),
                    DataColumn(label: Text("Parent Structure")),
                    DataColumn(label: Text("Actions")),
                  ],
                  rows: rows.map((row) {
                    final r = row as Map<String, dynamic>;
                    return DataRow(cells: [
                      DataCell(Text(r["name"]?.toString() ?? "-")),
                      DataCell(Text(r["address"]?.toString() ?? "-")),
                      DataCell(Text(r["type"]?.toString() ?? "-")),
                      DataCell(Text(r["country"]?.toString() ?? "-")),
                      DataCell(Text(r["timeZone"]?.toString() ?? "-")),
                      DataCell(Text(r["parentStructure"]?.toString() ?? "-")),
                      DataCell(Row(
                        children: [
                          TextButton(
                            onPressed: () => _openEditDialog(context, r),
                            child: const Text("Edit"),
                          ),
                          TextButton(
                            onPressed: () => onDelete(r["_id"].toString()),
                            child: const Text("Delete"),
                          ),
                        ],
                      )),
                    ]);
                  }).toList(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openCreateDialog(BuildContext context) async {
    final name = TextEditingController();
    final address = TextEditingController();
    final type = TextEditingController(text: "Department");
    final country = TextEditingController(text: "India");
    final timezone = TextEditingController(text: "Asia/Kolkata");
    final parent = TextEditingController();

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Add Company Structure"),
        content: SizedBox(
          width: 500,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            _field("Name", name),
            _field("Address", address),
            _field("Type", type),
            _field("Country", country),
            _field("Time Zone", timezone),
            _field("Parent Structure", parent),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
              await onCreate({
                "name": name.text.trim(),
                "address": address.text.trim(),
                "type": type.text.trim(),
                "country": country.text.trim(),
                "timeZone": timezone.text.trim(),
                "parentStructure": parent.text.trim(),
              });
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Future<void> _openEditDialog(BuildContext context, Map<String, dynamic> row) async {
    final name = TextEditingController(text: row["name"]?.toString() ?? "");
    final address = TextEditingController(text: row["address"]?.toString() ?? "");
    final type = TextEditingController(text: row["type"]?.toString() ?? "");
    final country = TextEditingController(text: row["country"]?.toString() ?? "");
    final timezone = TextEditingController(text: row["timeZone"]?.toString() ?? "");
    final parent = TextEditingController(text: row["parentStructure"]?.toString() ?? "");

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Edit Company Structure"),
        content: SizedBox(
          width: 500,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            _field("Name", name),
            _field("Address", address),
            _field("Type", type),
            _field("Country", country),
            _field("Time Zone", timezone),
            _field("Parent Structure", parent),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
              await onUpdate(row["_id"].toString(), {
                "name": name.text.trim(),
                "address": address.text.trim(),
                "type": type.text.trim(),
                "country": country.text.trim(),
                "timeZone": timezone.text.trim(),
                "parentStructure": parent.text.trim(),
              });
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Widget _field(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      ),
    );
  }
}
