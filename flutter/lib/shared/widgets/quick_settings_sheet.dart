import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/providers/app_settings_providers.dart';
import '../../core/theme/sanctuary_colors.dart';
import '../../core/theme/sanctuary_theme.dart';

class QuickSettingsSheet extends ConsumerWidget {
  const QuickSettingsSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const QuickSettingsSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    // Obtenemos el espacio del sistema inferior (barra de gestos/botones del móvil)
    final double systemBottomPadding = MediaQuery.of(context).padding.bottom;
    final double finalBottomPadding =
        (systemBottomPadding > 0 ? systemBottomPadding : 16.0) + 24.0;

    final visualTheme = ref.watch(appVisualThemeModeProvider);
    final translation = ref.watch(appTranslationProvider);
    final fontSize = ref.watch(appFontSizeProvider);
    final fontFamily = ref.watch(appFontFamilyProvider);
    final lineSpacing = ref.watch(appLineSpacingProvider);
    final showVerseNumbers = ref.watch(appShowVerseNumbersProvider);

    // Calculate preview style
    double previewSize = 17.0;
    if (fontSize == 'small') previewSize = 15.0;
    if (fontSize == 'large') previewSize = 20.0;
    if (fontSize == 'xlarge') previewSize = 23.0;

    double previewHeight = 1.68;
    if (lineSpacing == 'compact') previewHeight = 1.45;
    if (lineSpacing == 'relaxed') previewHeight = 1.95;

    TextStyle previewTextStyle;
    if (fontFamily == 'playfair') {
      previewTextStyle = GoogleFonts.playfairDisplay(
        fontSize: previewSize,
        height: previewHeight,
        color: theme.colorScheme.onSurface,
      );
    } else if (fontFamily == 'inter' || fontFamily == 'jakarta') {
      previewTextStyle = GoogleFonts.inter(
        fontSize: previewSize,
        height: previewHeight,
        color: theme.colorScheme.onSurface,
      );
    } else {
      previewTextStyle = GoogleFonts.literata(
        fontSize: previewSize,
        height: previewHeight,
        color: theme.colorScheme.onSurface,
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      // Se reemplaza el padding fijo por uno adaptativo en la parte inferior
      padding: EdgeInsets.only(
        left: 20,
        top: 12,
        right: 20,
        bottom: finalBottomPadding,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SanctuaryColors.sunOrange.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(LucideIcons.settings2,
                      size: 20, color: SanctuaryColors.sunOrange),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ajustes de Lectura Bíblica',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        'Personaliza la tipografía, tamaño y aspecto visual',
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
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

            const SizedBox(height: 18),

            // Live Preview Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: theme.cardTheme.color,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: theme.colorScheme.outline.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'VISTA PREVIA EN VIVO',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: SanctuaryColors.sunOrange,
                        ),
                      ),
                      Text(
                        'S. Juan 1:1 (${translation.toUpperCase()})',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text.rich(
                    TextSpan(
                      children: [
                        if (showVerseNumbers)
                          TextSpan(
                            text: '1 ',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: SanctuaryColors.sunOrange,
                            ),
                          ),
                        TextSpan(
                          text:
                              'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.',
                          style: previewTextStyle,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // 1. Theme Selection
            _buildSectionLabel('1. Tonalidad Visual & Ambiente'),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: '☀️ Claro',
                    sub: 'Pergamino',
                    isSelected: visualTheme == AppVisualTheme.light,
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setTheme(ref, AppVisualTheme.light),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: '📜 Sepia',
                    sub: 'Cálido',
                    isSelected: visualTheme == AppVisualTheme.sepia,
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setTheme(ref, AppVisualTheme.sepia),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: '🌙 Oscuro',
                    sub: 'Noche',
                    isSelected: visualTheme == AppVisualTheme.dark,
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setTheme(ref, AppVisualTheme.dark),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // 2. Font Size
            _buildSectionLabel('2. Tamaño de Letra'),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'A-',
                    sub: '15px',
                    isSelected: fontSize == 'small',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontSize(ref, 'small'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'A',
                    sub: '17.5px',
                    isSelected: fontSize == 'medium',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontSize(ref, 'medium'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'A+',
                    sub: '20px',
                    isSelected: fontSize == 'large',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontSize(ref, 'large'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'A++',
                    sub: '23px',
                    isSelected: fontSize == 'xlarge',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontSize(ref, 'xlarge'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // 3. Font Family
            _buildSectionLabel('3. Familia Tipográfica'),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'Literata',
                    sub: 'Serifa Bíblica',
                    isSelected: fontFamily == 'literata' ||
                        fontFamily == 'merriweather',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontFamily(ref, 'literata'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'Playfair',
                    sub: 'Editorial',
                    isSelected: fontFamily == 'playfair',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontFamily(ref, 'playfair'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'Inter',
                    sub: 'Sans Moderna',
                    isSelected:
                        fontFamily == 'inter' || fontFamily == 'jakarta',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setFontFamily(ref, 'inter'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // 4. Line Spacing
            _buildSectionLabel('4. Interlineado y Espaciado'),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'Compacto',
                    sub: '1.45',
                    isSelected: lineSpacing == 'compact',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setLineSpacing(ref, 'compact'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'Cómodo',
                    sub: '1.68',
                    isSelected: lineSpacing == 'normal',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setLineSpacing(ref, 'normal'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    context: context,
                    label: 'Amplio',
                    sub: '1.95',
                    isSelected: lineSpacing == 'relaxed',
                    onTap: () => ref
                        .read(appSettingsControllerProvider)
                        .setLineSpacing(ref, 'relaxed'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // 5. Canonical Bible Translation
            _buildSectionLabel('5. Traducción Canónica'),
            const SizedBox(height: 8),
            Column(
              children: [
                _buildTranslationTile(
                  context: context,
                  title: 'Reina-Valera 1909 (RVR1909)',
                  subtitle: 'Texto canónico en español clásico protestante',
                  isSelected: translation == 'valera',
                  onTap: () => ref
                      .read(appSettingsControllerProvider)
                      .setTranslation(ref, 'valera'),
                ),
                const SizedBox(height: 6),
                _buildTranslationTile(
                  context: context,
                  title: 'Biblia del Oso 1569 (SSE)',
                  subtitle: 'Casiodoro de Reina, traducción histórica original',
                  isSelected: translation == 'sse',
                  onTap: () => ref
                      .read(appSettingsControllerProvider)
                      .setTranslation(ref, 'sse'),
                ),
                const SizedBox(height: 6),
                _buildTranslationTile(
                  context: context,
                  title: 'Reina Valera NT 1858 (RV 1858)',
                  subtitle: 'Nuevo Testamento, revisión histórica de 1858',
                  isSelected: translation == 'rv1858',
                  onTap: () => ref
                      .read(appSettingsControllerProvider)
                      .setTranslation(ref, 'rv1858'),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // 6. Show Verse Numbers Switch
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: theme.cardTheme.color,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: theme.colorScheme.outline.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mostrar números de versículo',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w700,
                            fontSize: 13.5,
                          ),
                        ),
                        Text(
                          'Facilita la ubicación de pasajes y referencias',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: showVerseNumbers,
                    activeColor: SanctuaryColors.sunOrange,
                    onChanged: (val) => ref
                        .read(appSettingsControllerProvider)
                        .setShowVerseNumbers(ref, val),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.inter(
        fontSize: 12.5,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.3,
      ),
    );
  }

  Widget _buildChoiceChip({
    required BuildContext context,
    required String label,
    required String sub,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final tokens = context.sanctuaryTokens;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
        decoration: BoxDecoration(
          color: isSelected ? tokens.activeState : tokens.surfaceElevated,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? (tokens.activeState == SanctuaryColors.darkActive
                    ? SanctuaryColors.amberGold
                    : tokens.activeState)
                : theme.colorScheme.outline.withValues(alpha: 0.25),
            width: isSelected ? 1.8 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 12.5,
                color: isSelected ? Colors.white : theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sub,
              style: GoogleFonts.inter(
                fontSize: 10,
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.8)
                    : theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTranslationTile({
    required BuildContext context,
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final tokens = context.sanctuaryTokens;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? tokens.activeState.withValues(alpha: 0.12)
              : tokens.surfaceElevated,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? tokens.activeState
                : theme.colorScheme.outline.withValues(alpha: 0.2),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? LucideIcons.checkCircle2 : LucideIcons.circle,
              size: 18,
              color: isSelected
                  ? tokens.activeState
                  : theme.colorScheme.onSurface.withValues(alpha: 0.4),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isSelected
                          ? (tokens.activeState == SanctuaryColors.darkActive
                              ? SanctuaryColors.amberGold
                              : tokens.activeState)
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
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
}
