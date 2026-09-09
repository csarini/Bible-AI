import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class SanctuarySavedVersesView extends StatefulWidget {
  final AppDatabase database;
  final Function(String bookId, int chapter, int verse)? onVerseTap;

  const SanctuarySavedVersesView({
    super.key,
    required this.database,
    this.onVerseTap,
  });

  @override
  State<SanctuarySavedVersesView> createState() =>
      _SanctuarySavedVersesViewState();
}

class _SanctuarySavedVersesViewState extends State<SanctuarySavedVersesView> {
  String _selectedFilter = 'Todos';
  String _searchQuery = '';

  final List<String> _filters = [
    'Todos',
    'Promesas',
    'Vida',
    'Paz',
    'Aviso',
    'Divinidad',
  ];

  /// Resolves the color representation for a given category filter using official SanctuaryColors pastel tokens.
  Color _getFilterCategoryColor(String filterName, BuildContext context) {
    switch (filterName) {
      case 'Promesas':
        // Highlight Token: Favoritos / Promesas (Pastel Yellow)
        return SanctuaryColors.highlightYellow;
      case 'Vida':
        // Highlight Token: Vida / Crecimiento (Pastel Green)
        return SanctuaryColors.highlightGreen;
      case 'Paz':
        // Highlight Token: Paz / Sabiduría (Pastel Blue)
        return SanctuaryColors.highlightBlue;
      case 'Aviso':
        // Highlight Token: Advertencia / Importante (Pastel Orange)
        return SanctuaryColors.highlightOrange;
      case 'Divinidad':
        // Highlight Token: Divinidad / Realeza (Pastel Purple)
        return SanctuaryColors.highlightPurple;
      default:
        // Default category fallback uses the primary brand color from Theme
        return Theme.of(context).colorScheme.primary;
    }
  }

  /// Filters bookmark entries based on the selected tag category.
  bool _matchesFilter(LocalBookmarkEntry bookmark) {
    if (_selectedFilter == 'Todos') return true;
    if (_selectedFilter == 'Notas') {
      return bookmark.personalNote != null &&
          bookmark.personalNote!.trim().isNotEmpty;
    }

    final hex = bookmark.colorHex.replaceAll('#', '').toUpperCase();
    final yellowHex = SanctuaryColors.colorToHex(SanctuaryColors.highlightYellow).replaceAll('#', '');
    final greenHex = SanctuaryColors.colorToHex(SanctuaryColors.highlightGreen).replaceAll('#', '');
    final blueHex = SanctuaryColors.colorToHex(SanctuaryColors.highlightBlue).replaceAll('#', '');
    final orangeHex = SanctuaryColors.colorToHex(SanctuaryColors.highlightOrange).replaceAll('#', '');
    final purpleHex = SanctuaryColors.colorToHex(SanctuaryColors.highlightPurple).replaceAll('#', '');

    switch (_selectedFilter) {
      case 'Promesas':
        return hex == yellowHex;
      case 'Vida':
        return hex == greenHex;
      case 'Paz':
        return hex == blueHex;
      case 'Aviso':
        return hex == orangeHex;
      case 'Divinidad':
        return hex == purpleHex;
      default:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Access the current semantic colorScheme and textTheme from Theme.of(context)
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Scaffold(
      // Uses Theme.of(context).scaffoldBackgroundColor automatically
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        // Themed surface background and elevation
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        leading: const IconButton(
          icon: Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Replaced hardcoded SanctuaryColors.sunOrange with semantic colorScheme.secondary
            Icon(LucideIcons.bookmark, size: 20, color: colorScheme.secondary),
            const SizedBox(width: 8),
            Text(
              'Guardados & Notas',
              style: (textTheme.titleMedium ?? GoogleFonts.inter()).copyWith(
                fontWeight: FontWeight.w700,
                color: colorScheme.onSurface,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
      ),
      body: StreamBuilder<List<LocalBookmarkEntry>>(
        stream: widget.database.watchAllBookmarks(),
        builder: (context, snapshot) {
          final allBookmarks = snapshot.data ?? [];

          final filteredBookmarks = allBookmarks.where((b) {
            final matchesCategory = _matchesFilter(b);
            final query = _searchQuery.toLowerCase().trim();
            if (query.isEmpty) return matchesCategory;

            final matchesQuery = b.bookName.toLowerCase().contains(query) ||
                b.verseText.toLowerCase().contains(query) ||
                (b.customTitle?.toLowerCase().contains(query) ?? false) ||
                (b.personalNote?.toLowerCase().contains(query) ?? false);

            return matchesCategory && matchesQuery;
          }).toList();

          return CustomScrollView(
            slivers: [
              // Search Bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: (textTheme.bodyMedium ?? GoogleFonts.inter()).copyWith(
                      color: colorScheme.onSurface,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Buscar en mis versículos o notas...',
                      hintStyle: (textTheme.bodySmall ?? GoogleFonts.inter()).copyWith(
                        // Replaced raw grey with theme-derived onSurface variant
                        color: colorScheme.onSurface.withValues(alpha: 0.6),
                        fontSize: 13,
                      ),
                      prefixIcon: Icon(LucideIcons.search, size: 18, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: Icon(LucideIcons.x, size: 16, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                              onPressed: () => setState(() => _searchQuery = ''),
                            )
                          : null,
                      filled: true,
                      // Replaced hardcoded Color(0xFF1E293B) and Colors.white with semantic colorScheme.surface
                      fillColor: colorScheme.surface,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        // Replaced raw borders with colorScheme.outline token
                        borderSide: BorderSide(
                          color: colorScheme.outline.withValues(alpha: 0.3),
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        // Replaced raw borders with colorScheme.outline token
                        borderSide: BorderSide(
                          color: colorScheme.outline.withValues(alpha: 0.2),
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        // Uses primary brand token on focus
                        borderSide: BorderSide(
                          color: colorScheme.primary,
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Filter Chips
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 40,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _filters.length,
                    itemBuilder: (context, index) {
                      final filterName = _filters[index];
                      final isSelected = _selectedFilter == filterName;
                      // Derived strictly from SanctuaryColors tokens via helper
                      final chipColor = _getFilterCategoryColor(filterName, context);

                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                          onTap: () {
                            setState(() => _selectedFilter = filterName);
                          },
                          borderRadius: BorderRadius.circular(20),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 180),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              // Active background uses colorScheme.primary, inactive uses colorScheme.surface
                              color: isSelected
                                  ? colorScheme.primary
                                  : colorScheme.surface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                // Active border uses colorScheme.primary, inactive uses colorScheme.outline
                                color: isSelected
                                    ? colorScheme.primary
                                    : colorScheme.outline.withValues(alpha: 0.25),
                                width: 1.1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (filterName != 'Todos' && filterName != 'Notas') ...[
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      color: chipColor,
                                      shape: BoxShape.circle,
                                      // Replaced Colors.black26 with colorScheme.outline
                                      border: Border.all(
                                        color: colorScheme.outline.withValues(alpha: 0.35),
                                        width: 0.8,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                ],
                                Text(
                                  filterName,
                                  style: (textTheme.labelMedium ?? GoogleFonts.inter()).copyWith(
                                    // Text color adapts to contrast with active/inactive chip background
                                    color: isSelected
                                        ? colorScheme.onPrimary
                                        : colorScheme.onSurface,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 10)),

              // Empty State
              if (filteredBookmarks.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              // Replaced hardcoded sunOrange with theme.colorScheme.secondary token
                              color: colorScheme.secondary.withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              LucideIcons.bookmarkCheck,
                              size: 40,
                              // Replaced hardcoded sunOrange with theme.colorScheme.secondary token
                              color: colorScheme.secondary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'No hay resultados para "$_searchQuery"'
                                : 'Sin versículos en este filtro',
                            style: (textTheme.titleMedium ?? GoogleFonts.inter()).copyWith(
                              fontWeight: FontWeight.w700,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Resalta versículos en la lectura para verlos organizados aquí.',
                            textAlign: TextAlign.center,
                            style: (textTheme.bodySmall ?? GoogleFonts.inter()).copyWith(
                              // Replaced raw grey with theme colorScheme.onSurface with alpha
                              color: colorScheme.onSurface.withValues(alpha: 0.65),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                // Bookmark Cards List
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final item = filteredBookmarks[index];
                        // Strictly enforced rule 5: Use SanctuaryColors.getHighlightColor
                        final bookmarkColor = SanctuaryColors.getHighlightColor(item.colorHex);

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          elevation: 0,
                          clipBehavior: Clip.antiAlias,
                          // Card background defaults to colorScheme.surface
                          color: colorScheme.surface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            // Replaced raw borders with colorScheme.outline
                            side: BorderSide(
                              color: colorScheme.outline.withValues(alpha: 0.25),
                            ),
                          ),
                          child: InkWell(
                            onTap: () {
                              if (widget.onVerseTap != null) {
                                widget.onVerseTap!(
                                    item.bookId, item.chapter, item.verse);
                              }
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            width: 12,
                                            height: 12,
                                            decoration: BoxDecoration(
                                              color: bookmarkColor,
                                              shape: BoxShape.circle,
                                              // Replaced Colors.black26 with colorScheme.outline
                                              border: Border.all(
                                                color: colorScheme.outline.withValues(alpha: 0.35),
                                                width: 0.8,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '${item.bookName} ${item.chapter}:${item.verse}',
                                            style: (textTheme.titleSmall ?? GoogleFonts.inter()).copyWith(
                                              fontWeight: FontWeight.w800,
                                              color: colorScheme.onSurface,
                                            ),
                                          ),
                                        ],
                                      ),
                                      IconButton(
                                        // Replaced Colors.redAccent with semantic colorScheme.error
                                        icon: Icon(
                                          LucideIcons.trash2,
                                          size: 16,
                                          color: colorScheme.error,
                                        ),
                                        tooltip: 'Eliminar marcador',
                                        onPressed: () async {
                                          await widget.database.deleteBookmark(item.id);
                                        },
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    item.verseText,
                                    style: GoogleFonts.literata(
                                      fontSize: 14.5,
                                      height: 1.5,
                                      color: colorScheme.onSurface,
                                    ),
                                  ),
                                  if (item.personalNote != null &&
                                      item.personalNote!.trim().isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        // Replaced container with semantic surface + outline border
                                        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.35),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: colorScheme.outline.withValues(alpha: 0.15),
                                        ),
                                      ),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Replaced hardcoded sunOrange with semantic colorScheme.secondary
                                          Icon(
                                            LucideIcons.fileText,
                                            size: 14,
                                            color: colorScheme.secondary,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              item.personalNote!,
                                              style: (textTheme.bodySmall ?? GoogleFonts.inter()).copyWith(
                                                color: colorScheme.onSurface.withValues(alpha: 0.85),
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      childCount: filteredBookmarks.length,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

