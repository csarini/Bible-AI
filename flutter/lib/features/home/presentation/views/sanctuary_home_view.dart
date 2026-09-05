import 'package:drift/drift.dart' show Value;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/constants/daily_verses_pool.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../core/theme/sanctuary_theme.dart';
import '../../../../shared/services/share_service.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../../shared/widgets/sanctuary_church_logo.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class SanctuaryHomeView extends ConsumerStatefulWidget {
  final Function(int targetTabIndex) onNavigateTab;
  final AppDatabase? database;

  const SanctuaryHomeView({
    super.key,
    required this.onNavigateTab,
    this.database,
  });

  @override
  ConsumerState<SanctuaryHomeView> createState() => _SanctuaryHomeViewState();
}

class _SanctuaryHomeViewState extends ConsumerState<SanctuaryHomeView> {
  late DailyVerseData _currentVerse;
  String _activeDevotionalTab =
      'verse'; // 'verse', 'prayer' (reflection removed per request)
  String _selectedThemeFilter = 'Todos';
  bool _isSavedInBookmarks = false;

  final List<String> _themeFilters = [
    'Todos',
    'Paz',
    'Esperanza',
    'Fortaleza',
    'Amor',
    'Sabiduría',
    'Protección',
    'Victoria',
    'Confianza',
  ];

  @override
  void initState() {
    super.initState();
    // Dynamically pick a random daily verse on launch (not hardcoded)
    _currentVerse = getRandomDailyVerse();
    _checkIfSaved();
  }

  void _randomizeVerse({String? theme}) {
    setState(() {
      _currentVerse = getRandomDailyVerse(
        themeFilter: theme ?? _selectedThemeFilter,
        excludeId: _currentVerse.id,
      );
      _isSavedInBookmarks = false;
    });
    _checkIfSaved();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(LucideIcons.sparkles,
                color: SanctuaryColors.amberGold, size: 18),
            const SizedBox(width: 8),
            Text('Nuevo versículo: ${_currentVerse.reference}'),
          ],
        ),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _checkIfSaved() async {
    if (widget.database == null) return;
    try {
      final existing = await widget.database!.getBookmark(
        _currentVerse.bookId,
        _currentVerse.chapter,
        _currentVerse.verse,
      );
      if (mounted) {
        setState(() {
          _isSavedInBookmarks = existing != null;
        });
      }
    } catch (_) {}
  }

  Future<void> _saveToBookmarks() async {
    if (widget.database == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Almacenamiento no disponible')),
      );
      return;
    }

    try {
      final entry = LocalBookmarksCompanion.insert(
        id: 'daily_${_currentVerse.bookId}_${_currentVerse.chapter}_${_currentVerse.verse}',
        bookId: _currentVerse.bookId,
        bookName: _currentVerse.bookName,
        chapter: _currentVerse.chapter,
        verse: _currentVerse.verse,
        verseText: _currentVerse.text,
        colorHex: '#FED65B',
        customTitle: Value('Versículo del Día: ${_currentVerse.theme}'),
        personalNote: Value('Guardado desde el Inicio del Santuario Digital'),
        createdAt: Value(DateTime.now()),
      );

      await widget.database!.insertOrUpdateBookmark(entry);
      setState(() {
        _isSavedInBookmarks = true;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(LucideIcons.bookmarkCheck,
                    color: SanctuaryColors.amberGold, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '¡Guardado en la sección de Guardados! (${_currentVerse.reference})',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            backgroundColor: SanctuaryColors.waveNavy,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            duration: const Duration(seconds: 3),
            action: SnackBarAction(
              label: 'Ver',
              textColor: SanctuaryColors.amberGold,
              onPressed: () => widget.onNavigateTab(3), // Jump to Saved Verses
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al guardar: $e')),
        );
      }
    }
  }

  void _shareCurrentVerse() {
    ShareService.shareScripture(
      context: context,
      reference: _currentVerse.reference,
      text: _currentVerse.text,
      customTitle: 'Versículo del Día: ${_currentVerse.theme}',
      personalReflection:
          _activeDevotionalTab == 'prayer' ? _currentVerse.prayer : null,
    );
  }

  void _continueReadingInReader() {
    // Set active scripture coordinates and switch to Reader
    ref.read(appSelectedBookProvider.notifier).state = _currentVerse.bookId;
    ref.read(appSelectedChapterProvider.notifier).state = _currentVerse.chapter;
    ref.read(appSelectedVerseProvider.notifier).state = _currentVerse.verse;
    widget.onNavigateTab(1); // 1 = Lector Bíblico
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tokens = context.sanctuaryTokens;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        centerTitle: false,
        titleSpacing: 0,
        title: const Align(
          alignment: Alignment.centerLeft,
          child: SanctuaryChurchLogo(
            size: 38,
            variant: LogoVariant.symbol,
            showText: false,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Topics Horizontal Row
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _themeFilters.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final filter = _themeFilters[index];
                  final isSelected = filter == _selectedThemeFilter;
                  return Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedThemeFilter = filter;
                        });
                        _randomizeVerse(theme: filter);
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? tokens.activeState
                              : tokens.surfaceElevated,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? tokens.activeState
                                : theme.colorScheme.outline
                                    .withValues(alpha: 0.25),
                            width: 1.1,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: tokens.activeState
                                        .withValues(alpha: 0.25),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              filter == 'Todos'
                                  ? LucideIcons.sparkles
                                  : LucideIcons.heartHandshake,
                              size: 13,
                              color: isSelected
                                  ? Colors.white
                                  : SanctuaryColors.sunOrange,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              filter,
                              style: GoogleFonts.inter(
                                color: isSelected
                                    ? Colors.white
                                    : theme.colorScheme.onSurface,
                                fontWeight: FontWeight.w700,
                                fontSize: 12.5,
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

            const SizedBox(height: 16),

            // =================================================================
            // VERSÍCULO DEL DÍA - MAIN CARD
            // =================================================================
            Card(
              elevation: 2,
              shadowColor: Colors.black.withValues(alpha: 0.06),
              color: theme.cardTheme.color,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(22),
                side: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.25),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Card Top Bar: Title "Versículo del Día" + Theme tag + Randomize button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: tokens.activeState,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      LucideIcons.sun,
                                      size: 14,
                                      color: SanctuaryColors.amberGold,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Versículo del Día',
                                      maxLines: 1,
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 12,
                                        color: SanctuaryColors.amberGold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Flexible(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: SanctuaryColors.sunOrange
                                        .withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    _currentVerse.theme,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11.5,
                                      color: SanctuaryColors.sunOrange,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Randomize Button
                        IconButton(
                          icon: const Icon(LucideIcons.refreshCw, size: 18),
                          tooltip: 'Cambiar versículo aleatorio',
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.75),
                          onPressed: () => _randomizeVerse(),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Options below header: Versículo | Oración
                    Container(
                      decoration: BoxDecoration(
                        color: tokens.surfaceElevated,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color:
                              theme.colorScheme.outline.withValues(alpha: 0.2),
                        ),
                      ),
                      padding: const EdgeInsets.all(3),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildSubTabButton('Versículo', 'verse', tokens),
                          _buildSubTabButton('Oración', 'prayer', tokens),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Display Scripture Text or Prayer
                    if (_activeDevotionalTab == 'verse') ...[
                      Text(
                        '«${_currentVerse.text}»',
                        style: GoogleFonts.literata(
                          fontSize: 17.5,
                          height: 1.7,
                          fontStyle: FontStyle.italic,
                          color: theme.colorScheme.onSurface,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ] else ...[
                      Text(
                        _currentVerse.prayer,
                        style: GoogleFonts.literata(
                          fontSize: 16,
                          height: 1.65,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],

                    const SizedBox(height: 16),

                    // Reference Citation + "Continuar leyendo" to jump directly to the Reader
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: tokens.surfaceElevated,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color:
                              theme.colorScheme.outline.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Showing current verse reference
                          Expanded(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  LucideIcons.bookOpen,
                                  size: 16,
                                  color: SanctuaryColors.sunOrange,
                                ),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Text(
                                    _currentVerse.reference,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                      color: theme.colorScheme.onSurface,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          // "Continuar leyendo" Text Action
                          Flexible(
                            child: InkWell(
                              onTap: _continueReadingInReader,
                              borderRadius: BorderRadius.circular(8),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Flexible(
                                      child: Text(
                                        'Continuar leyendo',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: SanctuaryColors.sunOrange,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(
                                      LucideIcons.arrowRight,
                                      size: 15,
                                      color: SanctuaryColors.sunOrange,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Actions Row: Share Button + Save to Bookmarks Button
                    Row(
                      children: [
                        const Spacer(),

                        // Compartir Icon-only Button (Adapts to current theme tokens)
                        IconButton.filled(
                          onPressed: _shareCurrentVerse,
                          tooltip: 'Compartir versículo',
                          icon: Icon(
                            LucideIcons.share2,
                            size: 18,
                            color: theme.colorScheme.onSurface,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: tokens.surfaceElevated,
                            side: BorderSide(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.3),
                              width: 1.2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.all(10),
                            minimumSize: const Size(44, 44),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Guardar en la Sección de Guardados Button (Adapts to current theme tokens)
                        IconButton.filled(
                          onPressed: _saveToBookmarks,
                          tooltip: _isSavedInBookmarks
                              ? 'Guardado en notas'
                              : 'Guardar versículo',
                          icon: Icon(
                            _isSavedInBookmarks
                                ? LucideIcons.bookmarkCheck
                                : LucideIcons.bookmark,
                            size: 19,
                            color: _isSavedInBookmarks
                                ? SanctuaryColors.amberGold
                                : theme.colorScheme.onSurface,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: _isSavedInBookmarks
                                ? tokens.activeState
                                : tokens.surfaceElevated,
                            side: BorderSide(
                              color: _isSavedInBookmarks
                                  ? SanctuaryColors.amberGold
                                  : theme.colorScheme.outline
                                      .withValues(alpha: 0.3),
                              width: 1.2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.all(10),
                            minimumSize: const Size(44, 44),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSubTabButton(
      String title, String tabKey, SanctuaryThemeExtension tokens) {
    final isSelected = _activeDevotionalTab == tabKey;
    return GestureDetector(
      onTap: () {
        setState(() {
          _activeDevotionalTab = tabKey;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? tokens.activeState : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected
                ? Colors.white
                : Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withValues(alpha: 0.75),
          ),
        ),
      ),
    );
  }
}
