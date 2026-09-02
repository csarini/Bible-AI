import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/coachmark_guide_dialog.dart';
import '../../../../shared/widgets/feedback_dialog.dart';
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

final GlobalKey<ScaffoldState> sanctuaryScaffoldKey =
    GlobalKey<ScaffoldState>();

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
    final bookmarksCountAsync =
        ref.watch(bookmarksCountStreamProvider(database));
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
        database: database,
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

    // Bottom Navigation Bar mapping for primary destinations:
    // 0: Inicio -> Tab 0
    // 1: Libros -> Tab 2
    // 2: Lectura -> Tab 1
    // 3: Guardados -> Tab 3
    int bottomNavIndex = 0;
    if (currentTab == 0) {
      bottomNavIndex = 0;
    } else if (currentTab == 2) {
      bottomNavIndex = 1; // Libros
    } else if (currentTab == 1) {
      bottomNavIndex = 2; // Lectura
    } else if (currentTab == 3) {
      bottomNavIndex = 3; // Guardados
    } else if (currentTab == 6) {
      bottomNavIndex = 4; // Mentor IA
    } else {
      bottomNavIndex =
          0; // Default when viewing sub-tabs (Maps, Pulpit, AI, Settings)
    }

    return Scaffold(
      key: sanctuaryScaffoldKey,
      body: IndexedStack(
        index: currentTab.clamp(0, views.length - 1),
        children: views,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: bottomNavIndex,
        onDestinationSelected: (navIndex) {
          int targetTab = 0;
          if (navIndex == 0) {
            targetTab = 0; // Inicio
          } else if (navIndex == 1) {
            targetTab = 2; // Libros
          } else if (navIndex == 2) {
            targetTab = 1; // Lectura
          } else if (navIndex == 3) {
            targetTab = 3; // Guardados
          } else if (navIndex == 4) {
            targetTab = 6; // Mentor Teológico IA
          }
          ref.read(selectedTabProvider.notifier).state = targetTab;
        },
        height: 64,
        elevation: 0,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: [
          const NavigationDestination(
            icon: Icon(LucideIcons.home, size: 20),
            selectedIcon: Icon(LucideIcons.home, size: 20),
            label: 'Inicio',
            tooltip: 'Inicio Devocional',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.library, size: 20),
            selectedIcon: Icon(LucideIcons.library, size: 20),
            label: 'Libros',
            tooltip: '66 Libros y Búsqueda',
          ),
          const NavigationDestination(
            icon: Icon(LucideIcons.bookOpen, size: 20),
            selectedIcon: Icon(LucideIcons.bookOpen, size: 20),
            label: 'Lectura',
            tooltip: 'Lector Bíblico',
          ),
          NavigationDestination(
            icon: Badge(
              label: Text('$bookmarksCount'),
              isLabelVisible: bookmarksCount > 0,
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: const Icon(LucideIcons.bookmark, size: 20),
            ),
            selectedIcon: Badge(
              label: Text('$bookmarksCount'),
              isLabelVisible: bookmarksCount > 0,
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: const Icon(LucideIcons.bookmark, size: 20),
            ),
            label: 'Guardados',
            tooltip: 'Versículos y Notas Guardadas',
          ),
          // Nuevo acceso rápido al Mentor IA
          const NavigationDestination(
            icon: Icon(LucideIcons.sparkles, size: 20),
            selectedIcon: Icon(LucideIcons.sparkles, size: 20),
            label: 'Mentor IA',
            tooltip: 'Asistente Teológico con IA',
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        child: Column(
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.fromLTRB(18, 46, 18, 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: visualTheme == AppVisualTheme.dark
                      ? [
                          SanctuaryColors.darkSurface,
                          SanctuaryColors.darkBackground
                        ]
                      : visualTheme == AppVisualTheme.sepia
                          ? [
                              SanctuaryColors.sepiaSurface,
                              SanctuaryColors.sepiaBackground
                            ]
                          : [SanctuaryColors.waveNavy, const Color(0xFF001533)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border(
                  bottom: BorderSide(
                    color: Theme.of(context)
                        .colorScheme
                        .outline
                        .withValues(alpha: 0.2),
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: visualTheme == AppVisualTheme.light
                              ? Colors.white.withValues(alpha: 0.12)
                              : Theme.of(context)
                                  .colorScheme
                                  .surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: visualTheme == AppVisualTheme.light
                                ? Colors.white24
                                : Theme.of(context)
                                    .colorScheme
                                    .outline
                                    .withValues(alpha: 0.3),
                          ),
                        ),
                        child: SanctuaryChurchLogo(
                          size: 36,
                          variant: LogoVariant.symbol,
                          showText: false,
                          isDark: visualTheme != AppVisualTheme.light,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'El-Shaddai',
                              style: GoogleFonts.playfairDisplay(
                                color: visualTheme == AppVisualTheme.light
                                    ? Colors.white
                                    : Theme.of(context).colorScheme.onSurface,
                                fontWeight: FontWeight.w700,
                                fontStyle: FontStyle.italic,
                                fontSize: 18,
                              ),
                            ),
                            Text(
                              'DIOS TODOPODEROSO',
                              style: GoogleFonts.inter(
                                color: visualTheme == AppVisualTheme.light
                                    ? SanctuaryColors.amberGold
                                    : Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w900,
                                fontSize: 8.5,
                                letterSpacing: 1.1,
                              ),
                            ),
                            Text(
                              'Santuario Digital',
                              style: GoogleFonts.inter(
                                color: visualTheme == AppVisualTheme.light
                                    ? Colors.white.withValues(alpha: 0.7)
                                    : Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withValues(alpha: 0.6),
                                fontWeight: FontWeight.w600,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  // Segmented Quick Theme Selector
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: visualTheme == AppVisualTheme.light
                          ? Colors.black.withValues(alpha: 0.2)
                          : Theme.of(context)
                              .colorScheme
                              .surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildDrawerThemeButton(
                            icon: LucideIcons.sun,
                            label: 'Claro',
                            isSelected: visualTheme == AppVisualTheme.light,
                            onTap: () => ref
                                .read(appSettingsControllerProvider)
                                .setTheme(ref, AppVisualTheme.light),
                          ),
                        ),
                        const SizedBox(width: 3),
                        Expanded(
                          child: _buildDrawerThemeButton(
                            icon: LucideIcons.bookOpen,
                            label: 'Sepia',
                            isSelected: visualTheme == AppVisualTheme.sepia,
                            onTap: () => ref
                                .read(appSettingsControllerProvider)
                                .setTheme(ref, AppVisualTheme.sepia),
                          ),
                        ),
                        const SizedBox(width: 3),
                        Expanded(
                          child: _buildDrawerThemeButton(
                            icon: LucideIcons.moon,
                            label: 'Oscuro',
                            isSelected: visualTheme == AppVisualTheme.dark,
                            onTap: () => ref
                                .read(appSettingsControllerProvider)
                                .setTheme(ref, AppVisualTheme.dark),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Items List with Theme-declared Colors
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
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
                    index: 2,
                    icon: LucideIcons.library,
                    title: 'Libros',
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
                    index: 3,
                    icon: LucideIcons.bookmark,
                    title: 'Notas',
                    badge: bookmarksCount > 0 ? '$bookmarksCount' : null,
                  ),
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: Divider(
                      height: 1,
                      color: Theme.of(context)
                          .colorScheme
                          .outline
                          .withValues(alpha: 0.2),
                    ),
                  ),
                  _buildDrawerItem(
                    ref,
                    context,
                    index: 6,
                    icon: LucideIcons.sparkles,
                    title: 'Mentor Teológico IA',
                    badge: 'demo',
                    badgeColor: Theme.of(context).colorScheme.primary,
                  ),
                ],
              ),
            ),

            // Drawer Footer Quick Actions (Con versión extraída del pubspec.yaml)
            Builder(
              builder: (context) {
                final double bottomPadding =
                    MediaQuery.of(context).padding.bottom;
                final double finalBottomPadding =
                    (bottomPadding > 0 ? bottomPadding : 12.0) + 8.0;

                // Leemos la versión dinámicamente desde el provider
                final versionAsync = ref.watch(appVersionProvider);

                return Container(
                  padding: EdgeInsets.only(
                    left: 12,
                    right: 12,
                    top: 10,
                    bottom: finalBottomPadding,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    border: Border(
                      top: BorderSide(
                        color: Theme.of(context)
                            .colorScheme
                            .outline
                            .withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Botones Guía y Feedback
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.pop(context);
                                CoachMarkGuideDialog.show(context);
                              },
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 10, horizontal: 8),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                                side: BorderSide(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .outline
                                        .withValues(alpha: 0.3)),
                              ),
                              icon:
                                  const Icon(LucideIcons.helpCircle, size: 16),
                              label: Text(
                                'Guía',
                                style: GoogleFonts.inter(
                                    fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: FilledButton.tonalIcon(
                              onPressed: () {
                                Navigator.pop(context);
                                FeedbackDialog.show(context);
                              },
                              style: FilledButton.styleFrom(
                                backgroundColor: Theme.of(context)
                                    .colorScheme
                                    .primary
                                    .withValues(alpha: 0.14),
                                foregroundColor:
                                    Theme.of(context).colorScheme.primary,
                                padding: const EdgeInsets.symmetric(
                                    vertical: 10, horizontal: 8),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              icon: const Icon(LucideIcons.messageSquarePlus,
                                  size: 16),
                              label: Text(
                                'Feedback',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Muestra la versión automáticamente (ej. v1.0.0 (+1))
                      versionAsync.when(
                        data: (versionText) => Text(
                          versionText,
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withValues(alpha: 0.45),
                            letterSpacing: 0.3,
                          ),
                        ),
                        loading: () => const SizedBox(height: 12),
                        error: (_, __) => const SizedBox.shrink(),
                      ),
                    ],
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerThemeButton({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? SanctuaryColors.sunOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 13,
              color: isSelected ? Colors.white : Colors.white70,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : Colors.white70,
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
    Color? badgeColor,
  }) {
    final theme = Theme.of(context);
    final isSelected = ref.watch(selectedTabProvider) == index;
    final activeColor = theme.colorScheme.primary;
    final inactiveColor = theme.colorScheme.onSurface.withValues(alpha: 0.75);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2),
      decoration: BoxDecoration(
        color: isSelected
            ? activeColor.withValues(alpha: 0.12)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        leading: Icon(
          icon,
          size: 20,
          color: isSelected ? activeColor : inactiveColor,
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 13.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? activeColor : theme.colorScheme.onSurface,
          ),
        ),
        trailing: badge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor ?? activeColor,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge,
                  style: GoogleFonts.inter(
                    fontSize: 9.5,
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
      ),
    );
  }
}
