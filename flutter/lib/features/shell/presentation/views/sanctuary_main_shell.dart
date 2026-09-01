import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/coachmark_guide_dialog.dart';
import '../../../../shared/widgets/feedback_dialog.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../../shared/widgets/sanctuary_church_logo.dart';
import '../../../ai_mentor/presentation/views/sanctuary_ai_mentor_view.dart';
import '../../../events/presentation/views/sanctuary_events_view.dart';
import '../../../home/presentation/views/sanctuary_home_view.dart';
import '../../../maps/presentation/views/sanctuary_maps_view.dart';
import '../../../reader/presentation/views/sanctuary_reader_view.dart';
import '../../../reader/presentation/views/sanctuary_search_library_view.dart';
import '../../../saved_verses/presentation/views/sanctuary_saved_verses_view.dart';
import '../../../settings/presentation/views/sanctuary_settings_view.dart';

final selectedTabProvider = StateProvider<int>((ref) => 0);

final GlobalKey<ScaffoldState> sanctuaryScaffoldKey = GlobalKey<ScaffoldState>();

void openSanctuaryDrawer() {
  sanctuaryScaffoldKey.currentState?.openDrawer();
}

class SanctuaryMainShell extends ConsumerWidget {
  final AppDatabase database;

  const SanctuaryMainShell({super.key, required this.database});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTab = ref.watch(selectedTabProvider);
    final visualTheme = ref.watch(appVisualThemeModeProvider);
    final bookmarksCountAsync = ref.watch(bookmarksCountStreamProvider(database));
    final bookmarksCount = bookmarksCountAsync.value ?? 0;

    final List<Widget> views = [
      // 0: Home
      SanctuaryHomeView(
        database: database,
        onNavigateTab: (index) {
          ref.read(selectedTabProvider.notifier).state = index;
        },
      ),
      // 1: Reader
      SanctuaryReaderView(database: database),
      // 2: Search & Library (66 Books & direct reference jump)
      SanctuarySearchLibraryView(
        onSelectPassage: (bookId, chapter, verse) {
          ref.read(appSelectedBookProvider.notifier).state = bookId;
          ref.read(appSelectedChapterProvider.notifier).state = chapter;
          ref.read(appSelectedVerseProvider.notifier).state = verse;
          ref.read(selectedTabProvider.notifier).state = 1; // Switch to Reader
        },
      ),
      // 3: Saved Verses
      SanctuarySavedVersesView(database: database),
      // 4: Biblical Maps
      const SanctuaryMapsView(),
      // 5: Pulpit / Sermons
      SanctuaryEventsView(database: database),
      // 6: AI Theological Mentor
      const SanctuaryAiMentorView(),
      // 7: Settings
      SanctuarySettingsView(database: database),
    ];

    // Bottom Navigation Bar mapping for primary 5 destinations
    int bottomNavIndex = 0;
    if (currentTab == 0) bottomNavIndex = 0;
    else if (currentTab == 1) bottomNavIndex = 1;
    else if (currentTab == 2) bottomNavIndex = 2;
    else if (currentTab == 3) bottomNavIndex = 3;
    else if (currentTab == 4) bottomNavIndex = 4;
    else bottomNavIndex = 0; // Default when viewing sub-tabs

    return Scaffold(
      key: sanctuaryScaffoldKey,
      body: IndexedStack(
        index: currentTab.clamp(0, views.length - 1),
        children: views,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: bottomNavIndex,
        onDestinationSelected: (index) {
          ref.read(selectedTabProvider.notifier).state = index;
        },
        height: 66,
        elevation: 2,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: [
          const NavigationDestination(
            icon: Icon(LucideIcons.home, size: 20),
            selectedIcon: Icon(LucideIcons.home, size: 20, color: SanctuaryColors.sunOrange),
            label: 'Inicio',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.bookOpen, size: 20),
            selectedIcon: Icon(LucideIcons.bookOpen, size: 20, color: SanctuaryColors.waveNavy),
            label: 'Lector',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.library, size: 20),
            selectedIcon: Icon(LucideIcons.library, size: 20, color: SanctuaryColors.cyanAccent),
            label: 'Biblioteca',
          ),
          NavigationDestination(
            icon: Badge(
              label: Text('$bookmarksCount'),
              isLabelVisible: bookmarksCount > 0,
              backgroundColor: SanctuaryColors.sunOrange,
              child: const Icon(LucideIcons.bookmark, size: 20),
            ),
            selectedIcon: Badge(
              label: Text('$bookmarksCount'),
              isLabelVisible: bookmarksCount > 0,
              backgroundColor: SanctuaryColors.sunOrange,
              child: const Icon(LucideIcons.bookmark, size: 20, color: SanctuaryColors.sunOrange),
            ),
            label: 'Guardados',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.map, size: 20),
            selectedIcon: Icon(LucideIcons.map, size: 20, color: SanctuaryColors.waveNavy),
            label: 'Mapas',
          ),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
              // Drawer Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [SanctuaryColors.waveNavy, Color(0xFF001533)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const SanctuaryChurchLogo(
                          size: 32,
                          variant: LogoVariant.symbol,
                          showText: false,
                          isDark: true,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'El-Shaddai',
                              style: GoogleFonts.playfairDisplay(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontStyle: FontStyle.italic,
                                fontSize: 19,
                              ),
                            ),
                            Text(
                              'DIOS TODOPODEROSO',
                              style: GoogleFonts.inter(
                                color: SanctuaryColors.amberGold,
                                fontWeight: FontWeight.w900,
                                fontSize: 8.5,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'SANTUARIO DIGITAL',
                              style: GoogleFonts.inter(
                                color: Colors.white.withOpacity(0.65),
                                fontWeight: FontWeight.w600,
                                fontSize: 10,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Segmented Quick Theme Selector
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildDrawerThemeButton(
                            label: '☀️ Claro',
                            isSelected: visualTheme == AppVisualTheme.light,
                            onTap: () => ref.read(appVisualThemeModeProvider.notifier).state = AppVisualTheme.light,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: _buildDrawerThemeButton(
                            label: '📜 Sepia',
                            isSelected: visualTheme == AppVisualTheme.sepia,
                            onTap: () => ref.read(appVisualThemeModeProvider.notifier).state = AppVisualTheme.sepia,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: _buildDrawerThemeButton(
                            label: '🌙 Oscuro',
                            isSelected: visualTheme == AppVisualTheme.dark,
                            onTap: () => ref.read(appVisualThemeModeProvider.notifier).state = AppVisualTheme.dark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

              // Navigation Items List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 0,
                    icon: LucideIcons.home,
                    title: 'Inicio',
                    badge: 'Hoy',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 1,
                    icon: LucideIcons.bookOpen,
                    title: 'Lectura',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 2,
                    icon: LucideIcons.library,
                    title: 'Buscar',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 4,
                    icon: LucideIcons.compass,
                    title: 'Mapas',
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 3,
                    icon: LucideIcons.bookmark,
                    title: 'Guardados',
                    badge: bookmarksCount > 0 ? '$bookmarksCount' : null,
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 5,
                    icon: LucideIcons.calendar,
                    title: 'Prédicas & Eventos',
                  ),
                  const Divider(indent: 16, endIndent: 16),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 6,
                    icon: LucideIcons.sparkles,
                    title: 'Mentor IA',
                    badge: 'Modo Prueba',
                    badgeColor: SanctuaryColors.emeraldGreen,
                  ),
                ],
              ),
            ),

            // Drawer Footer Quick Actions (Sugerencias & Ayuda)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Theme.of(context).colorScheme.outline.withOpacity(0.3))),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        FeedbackDialog.show(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: SanctuaryColors.sunOrange,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                      icon: const Icon(LucideIcons.messageSquarePlus, size: 16),
                      label: Text(
                        'Sugerencias y Errores',
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        CoachMarkGuideDialog.show(context);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(LucideIcons.helpCircle, size: 15),
                      label: Text(
                        'Guía Rápida Interactiva',
                        style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerThemeButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? SanctuaryColors.sunOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : Colors.white70,
          ),
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
    Color? badgeColor,
  }) {
    final isSelected = ref.watch(selectedTabProvider) == index;
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? SanctuaryColors.sunOrange : null,
      ),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? SanctuaryColors.sunOrange : null,
        ),
      ),
      trailing: badge != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: badgeColor ?? SanctuaryColors.sunOrange,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                badge,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            )
          : null,
      selected: isSelected,
      onTap: () {
        Navigator.of(context).pop(); // Close drawer
        ref.read(selectedTabProvider.notifier).state = index;
      },
    );
  }
}
