import "package:flutter/material.dart";

class ModernNavItem {
  const ModernNavItem({
    required this.keyName,
    required this.label,
    required this.icon,
  });

  final String keyName;
  final String label;
  final IconData icon;
}

class ModernNavGroup {
  const ModernNavGroup({
    required this.keyName,
    required this.label,
    required this.icon,
    required this.items,
  });

  final String keyName;
  final String label;
  final IconData icon;
  final List<ModernNavItem> items;
}

class ModernSidebar extends StatelessWidget {
  const ModernSidebar({
    super.key,
    required this.userName,
    required this.selectedItemKey,
    required this.groups,
    required this.expandedGroups,
    required this.onSelectItem,
    required this.onToggleGroup,
  });

  final String userName;
  final String selectedItemKey;
  final List<ModernNavGroup> groups;
  final Set<String> expandedGroups;
  final ValueChanged<String> onSelectItem;
  final ValueChanged<String> onToggleGroup;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 190,
      decoration: const BoxDecoration(
        color: Color(0xFFF8F9FB),
        border: Border(right: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Column(
        children: [
          const SizedBox(height: 10),
          const Text("Home", style: TextStyle(fontSize: 26, color: Colors.black87)),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFFF1F1F1),
              border: Border(
                top: BorderSide(color: Color(0xFFE5E7EB)),
                bottom: BorderSide(color: Color(0xFFE5E7EB)),
              ),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFFE5E7EB),
                  child: Icon(Icons.person, size: 17, color: Colors.black54),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(userName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const Row(
                      children: [
                        Icon(Icons.circle, color: Colors.green, size: 8),
                        SizedBox(width: 4),
                        Text("Logged In", style: TextStyle(fontSize: 11, color: Colors.black54)),
                      ],
                    ),
                  ],
                )
              ],
            ),
          ),
          Expanded(
            child: ListView(
              children: groups.map((group) {
                final expanded = expandedGroups.contains(group.keyName);
                return Column(
                  children: [
                    InkWell(
                      onTap: () => onToggleGroup(group.keyName),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        child: Row(
                          children: [
                            Icon(group.icon, size: 16, color: const Color(0xFF4B5563)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                group.label,
                                style: const TextStyle(fontSize: 14, color: Color(0xFF4B5563)),
                              ),
                            ),
                            Icon(expanded ? Icons.expand_more : Icons.chevron_right, size: 18, color: const Color(0xFF6B7280)),
                          ],
                        ),
                      ),
                    ),
                    if (expanded)
                      ...group.items.map((item) {
                        final active = item.keyName == selectedItemKey;
                        return InkWell(
                          onTap: () => onSelectItem(item.keyName),
                          child: Container(
                            color: active ? const Color(0xFFE8EEFF) : null,
                            padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 7),
                            child: Row(
                              children: [
                                Icon(item.icon, size: 15, color: active ? const Color(0xFF2563EB) : const Color(0xFF6B7280)),
                                const SizedBox(width: 8),
                                Text(
                                  item.label,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: active ? const Color(0xFF2563EB) : const Color(0xFF4B5563),
                                    fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
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
