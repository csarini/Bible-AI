import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:drift/drift.dart' as drift;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/bible_translations.dart';
import '../../../../core/constants/daily_verses_pool.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/coachmark_guide_dialog.dart';
import '../../../../shared/widgets/feedback_dialog.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../../shared/widgets/widget_preview_sheet.dart';
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
              Expanded(
                child: Text(
                  'Copia JSON Exportada',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800, fontSize: 16),
                ),
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
                  color: Colors.grey.withValues(alpha: 0.1),
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
            Expanded(
              child: Text(
                'Restaurar Respaldo JSON',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800, fontSize: 16),
              ),
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

                if (ctx.mounted) {
                  Navigator.pop(ctx);
                }
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
        leading: const IconButton(
          icon: Icon(LucideIcons.menu),
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
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
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
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.75)),
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
                            .read(appSettingsControllerProvider)
                            .setTheme(ref, AppVisualTheme.light),
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
                            .read(appSettingsControllerProvider)
                            .setTheme(ref, AppVisualTheme.sepia),
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
                            .read(appSettingsControllerProvider)
                            .setTheme(ref, AppVisualTheme.dark),
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
              children: BibleTranslationsCatalog.allTranslations.map((tr) {
                final isLast = tr == BibleTranslationsCatalog.allTranslations.last;
                return Column(
                  children: [
                    _buildTranslationRow(
                      context,
                      title: tr.name,
                      abbreviation: tr.abbreviation.toUpperCase(),
                      description: tr.subtitle,
                      badge: tr.badge,
                      isOffline: tr.isOffline,
                      isSelected: translation == tr.id || translation == tr.abbreviation,
                      onTap: () => ref
                          .read(appSettingsControllerProvider)
                          .setTranslation(ref, tr.id),
                    ),
                    if (!isLast) const Divider(height: 16),
                  ],
                );
              }).toList(),
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
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.75)),
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

          // Section 4: Widgets de Pantalla (El Shaddai)
          _buildCard(
            context,
            title: 'Widgets de Pantalla (El Shaddai)',
            icon: LucideIcons.layoutGrid,
            iconColor: SanctuaryColors.sunOrange,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Personaliza y previsualiza cómo lucirán los widgets del versículo diario de El Shaddai en tu pantalla de inicio antes de añadirlos:',
                  style: GoogleFonts.inter(
                      fontSize: 13,
                      color:
                          theme.colorScheme.onSurface.withValues(alpha: 0.75)),
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: SanctuaryColors.sunOrange.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.sparkles,
                        color: SanctuaryColors.sunOrange, size: 20),
                  ),
                  title: Text(
                    'Previsualizar Widgets (2×2 y 4×2)',
                    style: GoogleFonts.inter(
                        fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                  subtitle: Text(
                    'Explora los tamaños pequeño y mediano con el nombre oficial El Shaddai',
                    style: GoogleFonts.inter(
                        fontSize: 12,
                        color:
                            theme.colorScheme.onSurface.withValues(alpha: 0.6)),
                  ),
                  trailing: const Icon(LucideIcons.chevronRight, size: 18),
                  onTap: () {
                    WidgetPreviewSheet.show(
                      context,
                      dailyVerse: getRandomDailyVerse(),
                    );
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 5: Data Backup (Export / Import JSON)
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
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.75)),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _exportBackupJson(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              vertical: 12, horizontal: 8),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(LucideIcons.download, size: 15),
                        label: const Text(
                          'Exportar JSON',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () => _showImportJsonDialog(context),
                        style: FilledButton.styleFrom(
                          backgroundColor: SanctuaryColors.sunOrange,
                          padding: const EdgeInsets.symmetric(
                              vertical: 12, horizontal: 8),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(LucideIcons.upload, size: 15),
                        label: const Text(
                          'Restaurar JSON',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
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
                      color: Colors.purple.withValues(alpha: 0.12),
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
                      color: SanctuaryColors.sunOrange.withValues(alpha: 0.12),
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
              color: SanctuaryColors.waveNavy.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(16),
              border:
                  Border.all(color: SanctuaryColors.waveNavy.withValues(alpha: 0.2)),
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
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Santuario Digital v1.2.0 • Edificación y Discipulado Bíblico',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.65),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Section 7: Mandatory Legal, Copyright & Non-Commercial Declaration Card
          _buildCard(
            context,
            title: 'Avisos Legales, Derechos de Autor y Licencia',
            icon: LucideIcons.shieldCheck,
            iconColor: SanctuaryColors.waveNavy,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '100% SIN FINES DE LUCRO',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.green.shade800,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Declaración de Aplicación Gratuita y No Comercial: Biblia Inteligente (com.elshaddai.biblia_inteligente) es un ministerio de edificación espiritual y discipulado cristiano desarrollado exclusivamente sin fines comerciales. Esta aplicación no contiene compras integradas (in-app purchases), muros de pago, suscripciones comerciales ni publicidad intrusiva.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    height: 1.5,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.85),
                  ),
                ),
                const SizedBox(height: 14),

                // Bíblica citation block
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: SanctuaryColors.waveNavy.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Cita y Reconocimiento de Bíblica, Inc.:',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '«Las citas bíblicas marcadas con NVI © están tomadas de la Santa Biblia, NUEVA VERSIÓN INTERNACIONAL® NVI® © 1999, 2015, 2022 por Bíblica, Inc.® Usado con permiso. Todos los derechos reservados en todo el mundo.»',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontStyle: FontStyle.italic,
                          height: 1.45,
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.75),
                        ),
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: () async {
                          final uri = Uri.parse('https://www.Biblica.com');
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri, mode: LaunchMode.externalApplication);
                          }
                        },
                        child: Text(
                          'Visitar sitio oficial de Biblica (www.Biblica.com)',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: SanctuaryColors.waveNavy,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // API.Bible attribution block
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: SanctuaryColors.waveNavy.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Plataforma Tecnológica de API.Bible:',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'El acceso digital a los textos de las Sagradas Escrituras se realiza a través de la infraestructura autorizada de API.Bible, un servicio de American Bible Society (ABS).',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          height: 1.45,
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.75),
                        ),
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: () async {
                          final uri = Uri.parse('https://api.bible');
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri, mode: LaunchMode.externalApplication);
                          }
                        },
                        child: Text(
                          'Conocer más en https://api.bible',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: SanctuaryColors.waveNavy,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),
                Text(
                  'Protección de Integridad y Privacidad de IA (Cláusula III.B): Ningún texto con derechos de autor se altera, mutila ni se utiliza para el entrenamiento o procesamiento con modelos de Inteligencia Artificial Generativa. Toda la memoria caché local expira y se revalida automáticamente cada 30 días conforme a los términos de uso.',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    height: 1.45,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
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
        side: BorderSide(color: theme.colorScheme.outline.withValues(alpha: 0.3)),
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
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
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
                : Theme.of(context).colorScheme.outline.withValues(alpha: 0.3),
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
                    : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
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
    String? badge,
    bool isOffline = true,
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
                      Flexible(
                        child: Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w700,
                            fontSize: 13.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: SanctuaryColors.waveNavy.withValues(alpha: 0.1),
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
                      if (badge != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isOffline
                                ? SanctuaryColors.emeraldGreen.withValues(alpha: 0.15)
                                : SanctuaryColors.sunOrange.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            badge,
                            style: GoogleFonts.inter(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w700,
                              color: isOffline
                                  ? SanctuaryColors.emeraldGreen
                                  : SanctuaryColors.sunOrange,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.65),
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
