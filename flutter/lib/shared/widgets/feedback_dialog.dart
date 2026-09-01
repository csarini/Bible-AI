import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/providers/app_settings_providers.dart';
import '../../core/theme/sanctuary_colors.dart';

class FeedbackDialog extends ConsumerStatefulWidget {
  const FeedbackDialog({super.key});

  static void show(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => const FeedbackDialog(),
    );
  }

  @override
  ConsumerState<FeedbackDialog> createState() => _FeedbackDialogState();
}

class _FeedbackDialogState extends ConsumerState<FeedbackDialog> {
  String _feedbackType = 'bug'; // 'bug', 'suggestion', 'general'
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  bool _copied = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  String _getSubject() {
    final typeLabel = _feedbackType == 'bug'
        ? '[Bug / Error]'
        : _feedbackType == 'suggestion'
            ? '[Sugerencia]'
            : '[Consulta / Comentario]';
    final cleanTitle = _titleController.text.trim().isEmpty
        ? 'Nuevo reporte desde la App Flutter'
        : _titleController.text.trim();
    return 'Bug/Sugerencias: $typeLabel $cleanTitle';
  }

  String _getBodyText() {
    final visualTheme = ref.read(appVisualThemeModeProvider);
    final translation = ref.read(appTranslationProvider);

    return '''--- REPORTE DE USUARIO - SANTUARIO DIGITAL EL-SHADDAI (FLUTTER) ---
Tipo: ${_feedbackType == 'bug' ? 'Reporte de Error / Bug' : _feedbackType == 'suggestion' ? 'Sugerencia de Mejora' : 'Consulta General'}
Fecha: ${DateTime.now().toLocal().toString()}
Remitente: ${_nameController.text.trim().isEmpty ? 'Anónimo' : _nameController.text.trim()} ${_emailController.text.trim().isNotEmpty ? '(${_emailController.text.trim()})' : ''}

ASUNTO:
${_titleController.text.trim().isEmpty ? '(Sin asunto especificado)' : _titleController.text.trim()}

DESCRIPCIÓN / DETALLES:
${_descriptionController.text.trim().isEmpty ? '(Sin descripción)' : _descriptionController.text.trim()}

--- INFORMACIÓN TÉCNICA DEL DISPOSITIVO ---
Versión Bíblica: ${translation.toUpperCase()}
Tema: ${visualTheme.name}
Plataforma: Flutter Nativo
------------------------------------------------------------''';
  }

  Future<void> _sendViaEmail() async {
    if (_descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor escribe una descripción del error o sugerencia.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: 'cmedinavera@gmail.com',
      queryParameters: {
        'subject': _getSubject(),
        'body': _getBodyText(),
      },
    );

    try {
      if (await canLaunchUrl(emailUri)) {
        await launchUrl(emailUri);
      } else {
        await _copyToClipboard();
      }
    } catch (_) {
      await _copyToClipboard();
    }
  }

  Future<void> _copyToClipboard() async {
    final fullText = 'Asunto: ${_getSubject()}\n\n${_getBodyText()}';
    await Clipboard.setData(ClipboardData(text: fullText));
    setState(() => _copied = true);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Mensaje copiado al portapapeles! Puedes pegarlo en tu correo o WhatsApp.'),
          backgroundColor: SanctuaryColors.waveNavy,
        ),
      );
    }

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: theme.colorScheme.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 550),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dialog Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: SanctuaryColors.sunOrange.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(LucideIcons.messageSquare, color: SanctuaryColors.sunOrange, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Errores & Sugerencias',
                              style: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: SanctuaryColors.sunOrange,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Feedback',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'Envío directo al Equipo de Desarrollo',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            color: theme.colorScheme.onSurface.withOpacity(0.65),
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

              const SizedBox(height: 16),

              // Type Selector Chips
              Text(
                '1. ¿Qué deseas enviar?',
                style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTypeOption(
                      type: 'bug',
                      label: 'Error (Bug)',
                      icon: LucideIcons.bug,
                      color: Colors.rose,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildTypeOption(
                      type: 'suggestion',
                      label: 'Sugerencia',
                      icon: LucideIcons.lightbulb,
                      color: SanctuaryColors.sunOrange,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildTypeOption(
                      type: 'general',
                      label: 'Consulta',
                      icon: LucideIcons.messageCircle,
                      color: SanctuaryColors.cyanAccent,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Title
              Text(
                '2. Asunto / Título',
                style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _titleController,
                style: GoogleFonts.plusJakartaSans(fontSize: 13),
                decoration: InputDecoration(
                  hintText: _feedbackType == 'bug'
                      ? 'Ej: El audio devocional se detiene / Error en mapas'
                      : 'Ej: Modo lectura continua / Añadir himnos',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),

              const SizedBox(height: 14),

              // Description
              Text(
                '3. Descripción detallada',
                style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _descriptionController,
                maxLines: 4,
                style: GoogleFonts.plusJakartaSans(fontSize: 13),
                decoration: InputDecoration(
                  hintText: _feedbackType == 'bug'
                      ? 'Describe qué pasó, qué estabas haciendo y qué esperabas ver...'
                      : 'Escribe tu propuesta detalladamente y cómo bendecirá a la congregación...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),

              const SizedBox(height: 14),

              // Optional sender info
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nameController,
                      style: GoogleFonts.plusJakartaSans(fontSize: 12),
                      decoration: InputDecoration(
                        labelText: 'Tu Nombre (Opcional)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _emailController,
                      style: GoogleFonts.plusJakartaSans(fontSize: 12),
                      decoration: InputDecoration(
                        labelText: 'Tu Correo (Opcional)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _copyToClipboard,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: Icon(_copied ? LucideIcons.check : LucideIcons.copy, size: 16),
                      label: Text(_copied ? '¡Copiado!' : 'Copiar Texto'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _sendViaEmail,
                      style: FilledButton.styleFrom(
                        backgroundColor: SanctuaryColors.waveNavy,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(LucideIcons.send, size: 16, color: SanctuaryColors.sunOrange),
                      label: const Text('Enviar Correo'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeOption({
    required String type,
    required String label,
    required IconData icon,
    required Color color,
  }) {
    final isSelected = _feedbackType == type;
    return InkWell(
      onTap: () => setState(() => _feedbackType = type),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
        decoration: BoxDecoration(
          color: isSelected ? SanctuaryColors.waveNavy : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? SanctuaryColors.waveNavy : Colors.grey.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: isSelected ? Colors.white : color),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : null,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
