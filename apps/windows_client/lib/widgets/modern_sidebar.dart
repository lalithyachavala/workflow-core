import "dart:convert";
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
    this.profilePictureBase64 = "",
    required this.selectedItemKey,
    required this.groups,
    required this.expandedGroups,
    required this.onSelectItem,
    required this.onToggleGroup,
  });

  final String userName;
  final String profilePictureBase64;
  final String selectedItemKey;
  final List<ModernNavGroup> groups;
  final Set<String> expandedGroups;
  final ValueChanged<String> onSelectItem;
  final ValueChanged<String> onToggleGroup;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      decoration: const BoxDecoration(
        color: Color(0xFF1C1C1C),
      ),
      child: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: groups.map((group) => _buildGroup(group)).toList(),
            ),
          ),
          _buildBottomProfile(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: Colors.black,
              shape: BoxShape.circle,
            ),
            child: ClipOval(
              child: Image.asset(
                "assets/logo.png",
                errorBuilder: (context, error, stackTrace) => const Icon(
                    Icons.directions_boat,
                    color: Colors.white,
                    size: 20),
              ),
            ),
          ),
          const SizedBox(width: 12),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Euroasiann Group.",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              Text(
                "My Company",
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGroup(ModernNavGroup group) {
    final bool isExpanded = expandedGroups.contains(group.keyName);
    final bool isGroupActive =
        group.items.any((item) => item.keyName == selectedItemKey);
    final bool isTopLevel = group.items.isEmpty;
    final bool isActiveTopItem = isTopLevel && group.keyName == selectedItemKey;

    return Column(
      children: [
        InkWell(
          onTap: () {
            if (isTopLevel) {
              onSelectItem(group.keyName);
            } else {
              onToggleGroup(group.keyName);
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: (isActiveTopItem || (isGroupActive && !isExpanded))
                  ? const Color(0xFF333333)
                  : Colors.transparent,
            ),
            child: Row(
              children: [
                Icon(
                  group.icon,
                  size: 20,
                  color: (isActiveTopItem || isGroupActive)
                      ? Colors.white
                      : Colors.white70,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    group.label,
                    style: TextStyle(
                      color: (isActiveTopItem || isGroupActive)
                          ? Colors.white
                          : Colors.white70,
                      fontSize: 14,
                      fontWeight: (isActiveTopItem || isGroupActive)
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                  ),
                ),
                if (!isTopLevel)
                  Icon(
                    isExpanded ? Icons.expand_more : Icons.chevron_right,
                    size: 18,
                    color: Colors.white54,
                  ),
              ],
            ),
          ),
        ),
        if (isExpanded && !isTopLevel)
          ...group.items.map((item) {
            final bool isActive = item.keyName == selectedItemKey;
            return InkWell(
              onTap: () => onSelectItem(item.keyName),
              child: Container(
                padding: const EdgeInsets.only(
                    left: 48, top: 10, bottom: 10, right: 16),
                decoration: BoxDecoration(
                  color: isActive
                      ? const Color(0xFF333333).withOpacity(0.5)
                      : Colors.transparent,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        item.label,
                        style: TextStyle(
                          color: isActive ? Colors.white : Colors.white60,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildBottomProfile() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFF151515),
        border: Border(top: BorderSide(color: Colors.white12, width: 0.5)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: Colors.white12,
            backgroundImage: profilePictureBase64.isNotEmpty
                ? MemoryImage(base64Decode(profilePictureBase64))
                : null,
            child: profilePictureBase64.isEmpty
                ? const Icon(Icons.person, size: 18, color: Colors.white)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  userName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold),
                ),
                const Text(
                  "Online",
                  style: TextStyle(color: Colors.green, fontSize: 11),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white54, size: 18),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
