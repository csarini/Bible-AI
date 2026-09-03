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

  /// Convierte cualquier código Hexadecimal a un objeto Color de Flutter seguro
  Color _parseColor(String rawHex,
      {Color fallback = SanctuaryColors.waveNavy}) {
    final clean = rawHex.replaceAll('#', '').trim().toUpperCase();
    if (clean.length == 6) {
      return Color(int.parse('FF$clean', radix: 16));
    } else if (clean.length == 8) {
      return Color(int.parse(clean, radix: 16));
    }
    return fallback;
  }

  Color _getFilterColor(String filterName) {
    switch (filterName) {
      case 'Promesas':
        return _parseColor('FFF2B2'); // Amarillo
      case 'Vida':
        return _parseColor('D2F5D7'); // Verde
      case 'Paz':
        return _parseColor('D3E7FF'); // Azul
      case 'Aviso':
        return _parseColor('FFDFCC'); // Naranja suave
      case 'Divinidad':
        return _parseColor('E9E4FF'); // Púrpura
      default:
        return SanctuaryColors.waveNavy;
    }
  }

  bool _matchesFilter(LocalBookmarkEntry bookmark) {
    if (_selectedFilter == 'Todos') return true;
    if (_selectedFilter == 'Notas') {
      return bookmark.personalNote != null &&
          bookmark.personalNote!.trim().isNotEmpty;
    }

    final hex = bookmark.colorHex.replaceAll('#', '').toUpperCase();
    switch (_selectedFilter) {
      case 'Promesas':
        return hex == 'FFF2B2';
      case 'Vida':
        return hex == 'D2F5D7';
      case 'Paz':
        return hex == 'D3E7FF';
      case 'Aviso':
        return hex == 'FFDFCC';
      case 'Divinidad':
        return hex == 'E9E4FF';
      default:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryActiveColor = theme.colorScheme.primary;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.bookmark,
                size: 20, color: SanctuaryColors.sunOrange),
            const SizedBox(width: 8),
            Text(
              'Guardados & Notas',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 17,
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
              // Buscador
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Buscar en mis versículos o notas...',
                      hintStyle: GoogleFonts.inter(fontSize: 13),
                      prefixIcon: const Icon(LucideIcons.search, size: 18),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(LucideIcons.x, size: 16),
                              onPressed: () =>
                                  setState(() => _searchQuery = ''),
                            )
                          : null,
                      filled: true,
                      fillColor:
                          isDark ? const Color(0xFF1E293B) : Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color:
                              theme.colorScheme.outline.withValues(alpha: 0.3),
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color:
                              theme.colorScheme.outline.withValues(alpha: 0.2),
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Filtros
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
                      final chipColor = _getFilterColor(filterName);

                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            splashColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () {
                              setState(() => _selectedFilter = filterName);
                            },
                            borderRadius: BorderRadius.circular(20),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 180),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? primaryActiveColor
                                    : theme.colorScheme.surface,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isSelected
                                      ? primaryActiveColor
                                      : theme.colorScheme.outline
                                          .withValues(alpha: 0.25),
                                  width: 1.1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (filterName != 'Todos' &&
                                      filterName != 'Notas') ...[
                                    Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: chipColor,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            color: Colors.black26, width: 0.8),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                  ],
                                  Text(
                                    filterName,
                                    style: GoogleFonts.inter(
                                      color: isSelected
                                          ? theme.colorScheme.onPrimary
                                          : theme.colorScheme.onSurface,
                                      fontWeight: isSelected
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 10)),

              // Lista de Versículos Guardados
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
                              color: SanctuaryColors.sunOrange
                                  .withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              LucideIcons.bookmarkCheck,
                              size: 40,
                              color: SanctuaryColors.sunOrange,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'No hay resultados para "$_searchQuery"'
                                : 'Sin versículos en este filtro',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Resalta versículos en la lectura para verlos organizados aquí.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.65),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final item = filteredBookmarks[index];
                        final bookmarkColor = _parseColor(item.colorHex);

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          elevation: 0,
                          clipBehavior: Clip.antiAlias,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.25),
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
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            width: 12,
                                            height: 12,
                                            decoration: BoxDecoration(
                                              color: bookmarkColor,
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                  color: Colors.black26,
                                                  width: 0.8),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '${item.bookName} ${item.chapter}:${item.verse}',
                                            style: GoogleFonts.inter(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 14,
                                              color:
                                                  theme.colorScheme.onSurface,
                                            ),
                                          ),
                                        ],
                                      ),
                                      IconButton(
                                        icon: const Icon(LucideIcons.trash2,
                                            size: 16, color: Colors.redAccent),
                                        onPressed: () async {
                                          await widget.database
                                              .deleteBookmark(item.id);
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
                                      color: theme.colorScheme.onSurface,
                                    ),
                                  ),
                                  if (item.personalNote != null &&
                                      item.personalNote!.trim().isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: theme
                                            .colorScheme.surfaceContainerHighest
                                            .withValues(alpha: 0.5),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Icon(LucideIcons.fileText,
                                              size: 14,
                                              color: SanctuaryColors.sunOrange),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              item.personalNote!,
                                              style: GoogleFonts.inter(
                                                fontSize: 12,
                                                color: theme
                                                    .colorScheme.onSurface
                                                    .withValues(alpha: 0.85),
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
