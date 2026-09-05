import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/sanctuary_colors.dart';
import '../../../core/theme/sanctuary_theme.dart';
import '../../core/constants/daily_verses_pool.dart';

/// Interactive bottom sheet modal that lets the user preview how the
/// El Shaddai daily verse widget looks in different sizes (Small 2x2, Medium 4x2)
/// and color styles (Navy, Pergamino, Glass) before adding it to their device.
class WidgetPreviewSheet extends StatefulWidget {
  final DailyVerseData dailyVerse;
  final void Function(String bookId, int chapter, int verse)?
      onNavigateToScripture;

  const WidgetPreviewSheet({
    super.key,
    required this.dailyVerse,
    this.onNavigateToScripture,
  });

  static Future<void> show(
    BuildContext context, {
    required DailyVerseData dailyVerse,
    void Function(String bookId, int chapter, int verse)? onNavigateToScripture,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => WidgetPreviewSheet(
        dailyVerse: dailyVerse,
        onNavigateToScripture: onNavigateToScripture,
      ),
    );
  }

  @override
  State<WidgetPreviewSheet> createState() => _WidgetPreviewSheetState();
}

class _WidgetPreviewSheetState extends State<WidgetPreviewSheet> {
  String _previewWidgetSize = 'all'; // 'all', 'small', 'medium'
  String _previewWidgetTheme = 'navy'; // 'navy', 'parchment', 'glass'

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tokens = context.sanctuaryTokens;
    final isDark = theme.brightness == Brightness.dark;

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (ctx, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.25),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Column(
            children: [
              // Drag Handle
              const SizedBox(height: 12),
              Container(
                width: 44,
                height: 4.5,
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(height: 14),

              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: SanctuaryColors.waveNavy.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        LucideIcons.sparkles,
                        color: SanctuaryColors.sunOrange,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Widgets El Shaddai',
                            style: GoogleFonts.cinzel(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          Text(
                            'Previsualiza el diseño en tu pantalla antes de agregarlo',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.65),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Divider(
                  height: 1,
                  color: theme.colorScheme.outline.withValues(alpha: 0.15)),

              // Scrollable Body
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Size Filters (Todos, Pequeño, Mediano)
                    Row(
                      children: [
                        Text(
                          'Tamaño:',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.7),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Wrap(
                            spacing: 6,
                            children: [
                              _buildSizeFilterChip('all', 'Todos', tokens),
                              _buildSizeFilterChip(
                                  'small', 'Pequeño (2×2)', tokens),
                              _buildSizeFilterChip(
                                  'medium', 'Mediano (4×2)', tokens),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Visual Style Selector (Navy, Pergamino, Glass)
                    Row(
                      children: [
                        Text(
                          'Estilo:',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.7),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Wrap(
                            spacing: 6,
                            children: [
                              _buildStyleFilterChip('navy', 'Navy Real',
                                  SanctuaryColors.waveNavy, tokens),
                              _buildStyleFilterChip('parchment', 'Pergamino',
                                  SanctuaryColors.parchmentPaper, tokens),
                              _buildStyleFilterChip('glass', 'Cristal',
                                  const Color(0xFF334155), tokens),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Small Widget Preview
                    if (_previewWidgetSize == 'all' ||
                        _previewWidgetSize == 'small') ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Widget Pequeño (2×2 / Cuadrado)',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: SanctuaryColors.sunOrange
                                  .withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'iOS & Android',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: SanctuaryColors.sunOrange,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: SizedBox(
                          width: 170,
                          height: 170,
                          child: _buildSmallWidgetPreview(tokens, isDark),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Ocupa 1 espacio (1×1 en iOS / 2×2 en Android). Ideal para la esquina o una Pila Inteligente con el nombre oficial El Shaddai.',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          height: 1.4,
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.6),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Medium Widget Preview
                    if (_previewWidgetSize == 'all' ||
                        _previewWidgetSize == 'medium') ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Widget Mediano (4×2 / Panorámico)',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: SanctuaryColors.emeraldGreen
                                  .withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Banner Principal',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: SanctuaryColors.emeraldGreen,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      _buildMediumWidgetPreview(tokens, isDark),
                      const SizedBox(height: 6),
                      Text(
                        'Ocupa 2 columnas (2×1 en iOS / 4×2 en Android). Formato horizontal completo con el nombre El Shaddai y acceso directo al capítulo bíblico.',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          height: 1.4,
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.6),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Native widgets guidance card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: SanctuaryColors.amberGold.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color:
                              SanctuaryColors.amberGold.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(LucideIcons.smartphone,
                                  color: SanctuaryColors.amberGold, size: 16),
                              const SizedBox(width: 8),
                              Text(
                                '¿Cómo agregarlo en tu celular?',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '1. Mantén presionado un espacio libre de tu pantalla de inicio.\n2. Toca «Widgets» o el botón «+».\n3. Busca «El Shaddai» o «Biblia Inteligente» y selecciona tu tamaño preferido.',
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              height: 1.45,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSizeFilterChip(
      String sizeKey, String label, SanctuaryThemeExtension tokens) {
    final isSelected = _previewWidgetSize == sizeKey;
    return GestureDetector(
      onTap: () {
        setState(() {
          _previewWidgetSize = sizeKey;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? SanctuaryColors.waveNavy
              : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? SanctuaryColors.waveNavy
                : Theme.of(context).colorScheme.outline.withValues(alpha: 0.25),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ),
    );
  }

  Widget _buildStyleFilterChip(String styleKey, String label,
      Color indicatorColor, SanctuaryThemeExtension tokens) {
    final isSelected = _previewWidgetTheme == styleKey;
    return GestureDetector(
      onTap: () {
        setState(() {
          _previewWidgetTheme = styleKey;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? SanctuaryColors.waveNavy
              : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? SanctuaryColors.waveNavy
                : Theme.of(context).colorScheme.outline.withValues(alpha: 0.25),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: indicatorColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 1),
              ),
            ),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : Theme.of(context).colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallWidgetPreview(SanctuaryThemeExtension tokens, bool isDark) {
    Color cardBg;
    Color textColor;
    Color subColor;
    Color badgeBg;
    Color badgeText;
    Border? border;

    if (_previewWidgetTheme == 'navy') {
      cardBg = SanctuaryColors.waveNavy;
      textColor = Colors.white;
      subColor = SanctuaryColors.amberGold;
      badgeBg = Colors.white.withValues(alpha: 0.15);
      badgeText = SanctuaryColors.amberGold;
    } else if (_previewWidgetTheme == 'parchment') {
      cardBg = const Color(0xFFF9F6F0);
      textColor = SanctuaryColors.waveNavy;
      subColor = const Color(0xFF705335);
      badgeBg = SanctuaryColors.waveNavy.withValues(alpha: 0.1);
      badgeText = SanctuaryColors.waveNavy;
      border = Border.all(color: const Color(0xFFE8DFC8), width: 1.5);
    } else {
      cardBg = const Color(0xFF1E293B);
      textColor = Colors.white;
      subColor = SanctuaryColors.cyanSky;
      badgeBg = Colors.white.withValues(alpha: 0.12);
      badgeText = Colors.white;
      border =
          Border.all(color: Colors.white.withValues(alpha: 0.18), width: 1.5);
    }

    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        if (widget.onNavigateToScripture != null) {
          widget.onNavigateToScripture!(widget.dailyVerse.bookId,
              widget.dailyVerse.chapter, widget.dailyVerse.verse);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(22),
          border: border,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.14),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top: El Shaddai Name + Reference Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.sparkles,
                        color: SanctuaryColors.sunOrange, size: 13),
                    const SizedBox(width: 4),
                    Text(
                      'El Shaddai',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                        color: subColor,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    widget.dailyVerse.reference,
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: badgeText,
                    ),
                  ),
                ),
              ],
            ),

            // Center: Verse Scripture Text
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(
                '«${widget.dailyVerse.text}»',
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.spectral(
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                  height: 1.3,
                  color: textColor,
                ),
              ),
            ),

            // Bottom: Gold Accent line & Tap prompt
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 28,
                  height: 2,
                  decoration: BoxDecoration(
                    color: subColor,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
                Text(
                  'Toca para leer',
                  style: GoogleFonts.inter(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: subColor.withValues(alpha: 0.85),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMediumWidgetPreview(
      SanctuaryThemeExtension tokens, bool isDark) {
    Color cardBg;
    Color textColor;
    Color subColor;
    Color badgeBg;
    Color badgeText;
    Border? border;

    if (_previewWidgetTheme == 'navy') {
      cardBg = SanctuaryColors.waveNavy;
      textColor = Colors.white;
      subColor = SanctuaryColors.amberGold;
      badgeBg = Colors.white.withValues(alpha: 0.15);
      badgeText = SanctuaryColors.amberGold;
    } else if (_previewWidgetTheme == 'parchment') {
      cardBg = const Color(0xFFF9F6F0);
      textColor = SanctuaryColors.waveNavy;
      subColor = const Color(0xFF705335);
      badgeBg = SanctuaryColors.waveNavy.withValues(alpha: 0.1);
      badgeText = SanctuaryColors.waveNavy;
      border = Border.all(color: const Color(0xFFE8DFC8), width: 1.5);
    } else {
      cardBg = const Color(0xFF1E293B);
      textColor = Colors.white;
      subColor = SanctuaryColors.cyanSky;
      badgeBg = Colors.white.withValues(alpha: 0.12);
      badgeText = Colors.white;
      border =
          Border.all(color: Colors.white.withValues(alpha: 0.18), width: 1.5);
    }

    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        if (widget.onNavigateToScripture != null) {
          widget.onNavigateToScripture!(widget.dailyVerse.bookId,
              widget.dailyVerse.chapter, widget.dailyVerse.verse);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(24),
          border: border,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.14),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Vertical Gold Accent Line
            Container(
              width: 3.5,
              height: 70,
              decoration: BoxDecoration(
                color: subColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 14),

            // Content Column
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Top Row: El Shaddai Name + Reference Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.bookOpen,
                              color: SanctuaryColors.sunOrange, size: 14),
                          const SizedBox(width: 5),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'El Shaddai',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.6,
                                  color: subColor,
                                ),
                              ),
                              Text(
                                'Versículo del Día',
                                style: GoogleFonts.inter(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w700,
                                  color: SanctuaryColors.sunOrange,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: badgeBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          widget.dailyVerse.reference,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: badgeText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Center: Verse Scripture Quote
                  Text(
                    '«${widget.dailyVerse.text}»',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.spectral(
                      fontSize: 12.5,
                      fontStyle: FontStyle.italic,
                      height: 1.35,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Bottom Action: Continuar leyendo
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'RVR1909',
                        style: GoogleFonts.inter(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: textColor.withValues(alpha: 0.6),
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            'Leer capítulo completo',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: subColor,
                            ),
                          ),
                          const SizedBox(width: 3),
                          Icon(LucideIcons.arrowRight,
                              size: 12, color: subColor),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
