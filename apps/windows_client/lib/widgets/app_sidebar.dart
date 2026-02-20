import "package:flutter/material.dart";

class SidebarSubItem {
  const SidebarSubItem({
    required this.keyName,
    required this.label,
    required this.icon,
  });

  final String keyName;
  final String label;
  final IconData icon;
}

class SidebarSection {
  const SidebarSection({
    required this.keyName,
    required this.label,
    required this.icon,
    required this.items,
  });

  final String keyName;
  final String label;
  final IconData icon;
  final List<SidebarSubItem> items;
}

class AppSidebar extends StatelessWidget {
  const AppSidebar({
    super.key,
    required this.userName,
    required this.selectedItemKey,
    required this.sections,
    required this.expandedSections,
    required this.onSelectItem,
    required this.onToggleSection,
  });

  final String userName;
  final String selectedItemKey;
  final List<SidebarSection> sections;
  final Set<String> expandedSections;
  final ValueChanged<String> onSelectItem;
  final ValueChanged<String> onToggleSection;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 285,
      decoration: const BoxDecoration(
        color: Color(0xFFF3F3F3),
        border: Border(right: BorderSide(color: Color(0xFFD4D4D4))),
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 10),
            color: const Color(0xFF111111),
            child: const Center(
              child: Text(
                "Home",
                style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w400),
              ),
            ),
          ),
          Container(
            width: double.infinity,
            color: const Color(0xFFEDEDED),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 23,
                  backgroundColor: Color(0xFFBFC7D5),
                  child: Icon(Icons.person, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(userName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 2),
                    const Row(
                      children: [
                        Icon(Icons.circle, color: Colors.green, size: 9),
                        SizedBox(width: 6),
                        Text("Logged In", style: TextStyle(color: Colors.black54, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, thickness: 1),
          Expanded(
            child: ListView(
              children: sections.map((section) {
                final isExpanded = expandedSections.contains(section.keyName);
                return Column(
                  children: [
                    InkWell(
                      onTap: () => onToggleSection(section.keyName),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        child: Row(
                          children: [
                            Icon(section.icon, color: Colors.black54, size: 19),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                section.label,
                                style: const TextStyle(fontSize: 18, color: Colors.black54),
                              ),
                            ),
                            Icon(
                              isExpanded ? Icons.expand_more : Icons.chevron_right,
                              color: Colors.black54,
                              size: 22,
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (isExpanded)
                      ...section.items.map((item) {
                        final selected = item.keyName == selectedItemKey;
                        return InkWell(
                          onTap: () => onSelectItem(item.keyName),
                          child: Container(
                            color: selected ? const Color(0xFFE9E9E9) : null,
                            padding: const EdgeInsets.fromLTRB(40, 9, 12, 9),
                            child: Row(
                              children: [
                                Icon(item.icon, color: selected ? Colors.black : Colors.black54, size: 18),
                                const SizedBox(width: 10),
                                Text(
                                  item.label,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: selected ? Colors.black : Colors.black54,
                                    fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    const Divider(height: 1, thickness: 1),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
