import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:drift/drift.dart' as drift;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/coachmark_guide_dialog.dart';
import '../../../../shared/widgets/feedback_dialog.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class SanctuarySettingsView extends ConsumerWidget {
  final AppDatabase database;

  const SanctuarySettingsView({super.key, required this.database});

  Future<void> _exportBackupJson(BuildContext context) async {
    final bookmarks = await database.getAllBookmarks();
    final backupData = {
      'app': 'Biblia Inteligente (Digital Sanctuary)',
      'version': '1.2.0-flutter',
      'exportedAt': DateTime.now().toIso8601String(),
      'bookmarksCount': bookmarks.length,
      'bookmarks': bookmarks
          .map((b) => {
                'id': b.id,
                'bookId': b.bookId,
                'bookName': b.bookName,
                'chapter': b.chapter,
                'verse': b.verse,
                'verseText': b.verseText,
                'colorHex': b.colorHex,
                'customTitle': b.customTitle,
                'personalNote': b.personalNote,
                'createdAt': b.createdAt.toIso8601String(),
              })
          .toList(),
    };

    final jsonStr = const JsonEncoder.withIndent('  ').convert(backupData);
    await Clipboard.setData(ClipboardData(text: jsonStr));

    if (context.mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(LucideIcons.checkCircle2,
                  color: Color(0xFF10B981), size: 22),
              const SizedBox(width: 8),
              Text(
                'Copia JSON Exportada',
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Se han empaquetado ${bookmarks.length} versículos guardados y notas personales.',
                style: GoogleFonts.inter(fontSize: 13),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'El código JSON completo ha sido copiado automáticamente a tu portapapeles. Puedes guardarlo en un archivo o enviarlo por correo.',
                  style: GoogleFonts.inter(
                      fontSize: 11, color: Colors.grey.shade700),
                ),
              ),
            ],
          ),
          actions: [
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: SanctuaryColors.waveNavy,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Entendido'),
            ),
          ],
        ),
      );
    }
  }

  void _showImportJsonDialog(BuildContext context) {
    final textController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(LucideIcons.upload,
                color: SanctuaryColors.sunOrange, size: 22),
            const SizedBox(width: 8),
            Text(
              'Restaurar Respaldo JSON',
              style: GoogleFonts.inter(
                  fontWeight: FontWeight.w800, fontSize: 16),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pega aquí el contenido JSON exportado previamente:',
              style: GoogleFonts.inter(fontSize: 12.5),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: textController,
              maxLines: 5,
              style: GoogleFonts.firaCode(fontSize: 11),
              decoration: InputDecoration(
                hintText:
                    '{\n  "app": "Biblia Inteligente...",\n  "bookmarks": [...]\n}',
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: SanctuaryColors.sunOrange,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              final raw = textController.text.trim();
              if (raw.isEmpty) return;

              try {
                final Map<String, dynamic> data = jsonDecode(raw);
                final List<dynamic>? bookmarks = data['bookmarks'];

                int imported = 0;
                if (bookmarks != null) {
                  for (final item in bookmarks) {
                    final id = item['id'] as String? ??
                        '${item['bookId']}_${item['chapter']}_${item['verse']}';
                    await database.insertOrUpdateBookmark(
                      LocalBookmarksCompanion.insert(
                        id: id,
                        bookId: item['bookId'] as String,
                        bookName: item['bookName'] as String,
                        chapter: item['chapter'] as int,
                        verse: item['verse'] as int,
                        verseText: item['verseText'] as String,
                        colorHex: item['colorHex'] as String,
                        customTitle:
                            drift.Value(item['customTitle'] as String?),
                        personalNote:
                            drift.Value(item['personalNote'] as String?),
                        createdAt: item['createdAt'] != null
                            ? drift.Value(
                                DateTime.parse(item['createdAt'] as String))
                            : const drift.Value.absent(),
                      ),
                    );
                    imported++;
                  }
                }

                Navigator.pop(ctx);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          '¡Éxito! Se restauraron $imported versículos guardados.'),
                      backgroundColor: const Color(0xFF10B981),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          'Error al procesar JSON: Formato no válido ($e)'),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                }
              }
            },
            child: const Text('Restaurar Ahora'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final visualTheme = ref.watch(appVisualThemeModeProvider);
    final translation = ref.watch(appTranslationProvider);

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
            const Icon(LucideIcons.settings,
                size: 20, color: Color(0xFF705335)),
            const SizedBox(width: 8),
            Text(
              'Ajustes del Santuario',
              style: GoogleFonts.inter(
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
            title: 'Apariencia & Tonalidad Visual',
            icon: LucideIcons.palette,
            iconColor: SanctuaryColors.sunOrange,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Elige la tonalidad visual que mejor se adapte a tu iluminación ambiental:',
                  style: GoogleFonts.inter(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withOpacity(0.75)),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _buildOptionTile(
                        context,
                        label: '☀️ Claro',
                        subtitle: 'Pergamino',
                        isSelected: visualTheme == AppVisualTheme.light,
                        onTap: () => ref
                            .read(appVisualThemeModeProvider.notifier)
                            .state = AppVisualTheme.light,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildOptionTile(
                        context,
                        label: '📜 Sepia',
                        subtitle: 'Cálido',
                        isSelected: visualTheme == AppVisualTheme.sepia,
                        onTap: () => ref
                            .read(appVisualThemeModeProvider.notifier)
                            .state = AppVisualTheme.sepia,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildOptionTile(
                        context,
                        label: '🌙 Oscuro',
                        subtitle: 'Noche',
                        isSelected: visualTheme == AppVisualTheme.dark,
                        onTap: () => ref
                            .read(appVisualThemeModeProvider.notifier)
                            .state = AppVisualTheme.dark,
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
            title: 'Traducción Canónica de las Escrituras',
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
                  onTap: () => ref.read(appTranslationProvider.notifier).state =
                      'valera',
                ),
                const Divider(height: 20),
                _buildTranslationRow(
                  context,
                  title: 'Biblia del Oso 1569',
                  abbreviation: 'SSE 1569',
                  description:
                      'Casiodoro de Reina, traducción histórica original.',
                  isSelected: translation == 'sse',
                  onTap: () =>
                      ref.read(appTranslationProvider.notifier).state = 'sse',
                ),
                const Divider(height: 20),
                _buildTranslationRow(
                  context,
                  title: 'Reina Valera NT 1858',
                  abbreviation: 'RV 1858',
                  description: 'Nuevo Testamento, revisión histórica de 1858.',
                  isSelected: translation == 'rv1858',
                  onTap: () => ref.read(appTranslationProvider.notifier).state =
                      'rv1858',
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 3: Reading Quick Settings Launcher
          _buildCard(
            context,
            title: 'Tipografía & Espaciado',
            icon: LucideIcons.slidersHorizontal,
            iconColor: SanctuaryColors.cyanAccent,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Configura el tamaño de fuente, familias tipográficas (Literata, Playfair, Inter) e interlineado:',
                  style: GoogleFonts.inter(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withOpacity(0.75)),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => QuickSettingsSheet.show(context),
                  style: FilledButton.styleFrom(
                    backgroundColor: SanctuaryColors.waveNavy,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    minimumSize: const Size.fromHeight(42),
                  ),
                  icon: const Icon(LucideIcons.settings2, size: 16),
                  label: const Text('Abrir Ajustes de Lectura y Tipografía'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 4: Data Backup (Export / Import JSON)
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
                  style: GoogleFonts.inter(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withOpacity(0.75)),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _exportBackupJson(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(LucideIcons.download, size: 16),
                        label: const Text('Exportar JSON'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () => _showImportJsonDialog(context),
                        style: FilledButton.styleFrom(
                          backgroundColor: SanctuaryColors.sunOrange,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
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

          // Section 5: Guided Tour & Feedback
          _buildCard(
            context,
            title: 'Ayuda, Guía & Soporte',
            icon: LucideIcons.helpCircle,
            iconColor: Colors.purple,
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.purple.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.compass,
                        color: Colors.purple, size: 20),
                  ),
                  title: Text(
                    'Ver Guía Rápida Interactiva',
                    style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700, fontSize: 13.5),
                  ),
                  subtitle: Text(
                    'Recorre las 7 secciones de la app paso a paso',
                    style: GoogleFonts.inter(fontSize: 11),
                  ),
                  trailing: const Icon(LucideIcons.chevronRight, size: 16),
                  onTap: () => CoachMarkGuideDialog.show(context),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: SanctuaryColors.sunOrange.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.messageSquare,
                        color: SanctuaryColors.sunOrange, size: 20),
                  ),
                  title: Text(
                    'Reportar Error o Sugerencia',
                    style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700, fontSize: 13.5),
                  ),
                  subtitle: Text(
                    'Envía comentarios directos al equipo de desarrollo',
                    style: GoogleFonts.inter(fontSize: 11),
                  ),
                  trailing: const Icon(LucideIcons.chevronRight, size: 16),
                  onTap: () => FeedbackDialog.show(context),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 6: El-Shaddai Church Branding Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SanctuaryColors.waveNavy.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border:
                  Border.all(color: SanctuaryColors.waveNavy.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: SanctuaryColors.waveNavy,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.church,
                      color: Colors.white, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Iglesia Cristiana El-Shaddai',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Santuario Digital v1.2.0 • Edificación y Discipulado Bíblico',
                        style: GoogleFonts.inter(
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
                  style: GoogleFonts.inter(
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
            color: isSelected
                ? SanctuaryColors.waveNavy
                : Theme.of(context).colorScheme.outline.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: isSelected
                    ? Colors.white
                    : Theme.of(context).colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: GoogleFonts.inter(
                fontSize: 10,
                color: isSelected
                    ? Colors.white70
                    : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
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
                  color: isSelected
                      ? SanctuaryColors.waveNavy
                      : theme.colorScheme.outline,
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
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w700,
                          fontSize: 13.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: SanctuaryColors.waveNavy.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          abbreviation,
                          style: GoogleFonts.inter(
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
                    style: GoogleFonts.inter(
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
