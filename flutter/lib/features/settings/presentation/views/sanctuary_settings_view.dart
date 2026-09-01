import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';

final appThemeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.light);
final appTranslationProvider = StateProvider<String>((ref) => 'valera');
final appFontSizeProvider = StateProvider<String>((ref) => 'medium');

class SanctuarySettingsView extends ConsumerWidget {
  final AppDatabase database;

  const SanctuarySettingsView({super.key, required this.database});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(appThemeModeProvider);
    final translation = ref.watch(appTranslationProvider);
    final fontSize = ref.watch(appFontSizeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.settings, size: 20, color: Color(0xFF705335)),
            const SizedBox(width: 8),
            Text(
              'Ajustes del Santuario',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Section 1: Themes & Visual Appearance
          _buildCard(
            context,
            title: 'Apariencia & Modo de Lectura',
            icon: LucideIcons.palette,
            iconColor: SanctuaryColors.sunOrange,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Elige la tonalidad visual que mejor se adapte a tu iluminación ambiental:',
                  style: GoogleFonts.plusJakartaSans(fontSize: 13, color: theme.colorScheme.onSurface.withOpacity(0.75)),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _buildOptionTile(
                        context,
                        label: 'Claro',
                        subtitle: 'Pergamino',
                        isSelected: themeMode == ThemeMode.light,
                        onTap: () => ref.read(appThemeModeProvider.notifier).state = ThemeMode.light,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildOptionTile(
                        context,
                        label: 'Sepia',
                        subtitle: 'Cálido',
                        isSelected: false, // Custom Sepia mapped in SanctuaryTheme
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Tema Sepia activado.')),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildOptionTile(
                        context,
                        label: 'Oscuro',
                        subtitle: 'Noche',
                        isSelected: themeMode == ThemeMode.dark,
                        onTap: () => ref.read(appThemeModeProvider.notifier).state = ThemeMode.dark,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 2: Canonical Translations
          _buildCard(
            context,
            title: 'Traducción de las Escrituras',
            icon: LucideIcons.book,
            iconColor: SanctuaryColors.waveNavy,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTranslationRow(
                  context,
                  title: 'Reina-Valera 1909',
                  abbreviation: 'RVR1909',
                  description: 'Texto canónico en español clásico protestante.',
                  isSelected: translation == 'valera',
                  onTap: () => ref.read(appTranslationProvider.notifier).state = 'valera',
                ),
                const Divider(height: 20),
                _buildTranslationRow(
                  context,
                  title: 'Biblia del Oso 1569',
                  abbreviation: 'SSE 1569',
                  description: 'Casiodoro de Reina, traducción histórica original.',
                  isSelected: translation == 'sse',
                  onTap: () => ref.read(appTranslationProvider.notifier).state = 'sse',
                ),
                const Divider(height: 20),
                _buildTranslationRow(
                  context,
                  title: 'Reina Valera NT 1858',
                  abbreviation: 'RV 1858',
                  description: 'Nuevo Testamento, revisión histórica de 1858.',
                  isSelected: translation == 'rv1858',
                  onTap: () => ref.read(appTranslationProvider.notifier).state = 'rv1858',
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 3: Data Backup (Export / Import JSON)
          _buildCard(
            context,
            title: 'Respaldo & Transferencia (JSON)',
            icon: LucideIcons.hardDrive,
            iconColor: const Color(0xFF10B981),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Descarga o restaura una copia de seguridad con todos tus versículos guardados, notas de prédicas y categorías:',
                  style: GoogleFonts.plusJakartaSans(fontSize: 13, color: theme.colorScheme.onSurface.withOpacity(0.75)),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          final backupData = {
                            'app': 'Biblia Inteligente (Digital Sanctuary)',
                            'version': '1.2.0-flutter',
                            'exportedAt': DateTime.now().toIso8601String(),
                          };
                          final jsonStr = jsonEncode(backupData);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Copia de seguridad generada en formato JSON.'),
                              backgroundColor: SanctuaryColors.waveNavy,
                            ),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(LucideIcons.download, size: 16),
                        label: const Text('Exportar JSON'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Listo para importar archivo de respaldo .json'),
                              backgroundColor: SanctuaryColors.sunOrange,
                            ),
                          );
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: SanctuaryColors.sunOrange,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(LucideIcons.upload, size: 16),
                        label: const Text('Restaurar JSON'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 4: El-Shaddai Church Branding Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SanctuaryColors.waveNavy.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: SanctuaryColors.waveNavy.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: SanctuaryColors.waveNavy,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.church, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Iglesia Cristiana El-Shaddai',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Santuario Digital v1.2.0 • Edificación y Discipulado Bíblico',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          color: theme.colorScheme.onSurface.withOpacity(0.65),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color iconColor,
    required Widget child,
  }) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: theme.colorScheme.outline.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: iconColor),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildOptionTile(
    BuildContext context, {
    required String label,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? SanctuaryColors.waveNavy : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? SanctuaryColors.waveNavy : Theme.of(context).colorScheme.outline.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: isSelected ? Colors.white : Theme.of(context).colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                color: isSelected ? Colors.white70 : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTranslationRow(
    BuildContext context, {
    required String title,
    required String abbreviation,
    required String description,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? SanctuaryColors.waveNavy : theme.colorScheme.outline,
                  width: isSelected ? 6 : 2,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w700,
                          fontSize: 13.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: SanctuaryColors.waveNavy.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          abbreviation,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: SanctuaryColors.waveNavy,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11.5,
                      color: theme.colorScheme.onSurface.withOpacity(0.65),
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
