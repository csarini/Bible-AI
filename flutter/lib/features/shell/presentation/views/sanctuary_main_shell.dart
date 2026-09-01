import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../home/presentation/views/sanctuary_home_view.dart';
import '../../../reader/presentation/views/sanctuary_reader_view.dart';
import '../../../saved_verses/presentation/views/sanctuary_saved_verses_view.dart';
import '../../../maps/presentation/views/sanctuary_maps_view.dart';
import '../../../events/presentation/views/sanctuary_events_view.dart';
import '../../../ai_mentor/presentation/views/sanctuary_ai_mentor_view.dart';
import '../../../settings/presentation/views/sanctuary_settings_view.dart';

final selectedTabProvider = StateProvider<int>((ref) => 0);

class SanctuaryMainShell extends ConsumerWidget {
  final AppDatabase database;

  const SanctuaryMainShell({super.key, required this.database});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTab = ref.watch(selectedTabProvider);

    final List<Widget> views = [
      SanctuaryHomeView(
        onNavigateTab: (index) {
          ref.read(selectedTabProvider.notifier).state = index;
        },
      ),
      SanctuaryReaderView(database: database),
      SanctuarySavedVersesView(database: database),
      const SanctuaryMapsView(),
      SanctuaryEventsView(database: database),
      const SanctuaryAiMentorView(),
      SanctuarySettingsView(database: database),
    ];

    return Scaffold(
      body: IndexedStack(
        index: currentTab,
        children: views,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentTab > 4 ? 0 : currentTab,
        onDestinationSelected: (index) {
          ref.read(selectedTabProvider.notifier).state = index;
        },
        height: 65,
        elevation: 0,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.home, size: 20),
            selectedIcon: Icon(LucideIcons.home, size: 20, color: SanctuaryColors.sunOrange),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.bookOpen, size: 20),
            selectedIcon: Icon(LucideIcons.bookOpen, size: 20, color: SanctuaryColors.waveNavy),
            label: 'Lector',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.bookmark, size: 20),
            selectedIcon: Icon(LucideIcons.bookmark, size: 20, color: SanctuaryColors.sunOrange),
            label: 'Guardados',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.map, size: 20),
            selectedIcon: Icon(LucideIcons.map, size: 20, color: SanctuaryColors.cyanAccent),
            label: 'Mapas',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.calendar, size: 20),
            selectedIcon: Icon(LucideIcons.calendar, size: 20, color: SanctuaryColors.brandPurple),
            label: 'Prédicas',
          ),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [SanctuaryColors.waveNavy, Color(0xFF001533)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: SanctuaryColors.sunOrange,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(LucideIcons.church, color: Colors.white, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Santuario Digital',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 17,
                          ),
                        ),
                        Text(
                          'Iglesia El-Shaddai',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 0,
                    icon: LucideIcons.home,
                    title: 'Inicio & Devocional',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 1,
                    icon: LucideIcons.bookOpen,
                    title: 'Lector Bíblico (66 Libros)',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 2,
                    icon: LucideIcons.bookmark,
                    title: 'Versículos & Notas',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 3,
                    icon: LucideIcons.map,
                    title: 'Mapas & Rutas Bíblicas',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 4,
                    icon: LucideIcons.calendar,
                    title: 'Prédicas & Modo Púlpito',
                  ),
                  const Divider(),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 5,
                    icon: LucideIcons.sparkles,
                    title: 'Mentor Teológico IA',
                    badge: '2/DÍA',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 6,
                    icon: LucideIcons.settings,
                    title: 'Ajustes & Respaldo JSON',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    WidgetRef ref,
    BuildContext context, {
    required int index,
    required IconData icon,
    required String title,
    String? badge,
  }) {
    final isSelected = ref.watch(selectedTabProvider) == index;
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? SanctuaryColors.sunOrange : null,
      ),
      title: Text(
        title,
        style: GoogleFonts.plusJakartaSans(
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? SanctuaryColors.sunOrange : null,
        ),
      ),
      trailing: badge != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: SanctuaryColors.sunOrange,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                badge,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            )
          : null,
      selected: isSelected,
      onTap: () {
        ref.read(selectedTabProvider.notifier).state = index;
        Navigator.of(context).pop(); // Close drawer
      },
    );
  }
}
