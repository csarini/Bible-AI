import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/providers/app_settings_providers.dart';

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

  Future<void> _sendFeedback() async {
    if (_descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
              'Por favor escribe una descripción del error o sugerencia.'),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
      return;
    }

    final fullText = '${_getSubject()}\n\n${_getBodyText()}';
    try {
      await Share.share(
        fullText,
        subject: _getSubject(),
      );
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
        SnackBar(
          content: const Text(
              '¡Mensaje copiado al portapapeles! Puedes pegarlo en tu correo o mensaje.'),
          backgroundColor: Theme.of(context).colorScheme.primary,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.colorScheme.primary;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: theme.colorScheme.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: primaryColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(LucideIcons.messageSquare,
                        color: primaryColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sugerencias y Errores',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w800,
                            fontSize: 16.5,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        Text(
                          'Ayúdanos a mejorar el Santuario Digital',
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
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(LucideIcons.x, size: 18),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Category Selector
              Text(
                '1. ¿Qué deseas enviar?',
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTypeOption(
                      type: 'bug',
                      label: 'Error',
                      icon: LucideIcons.bug,
                      activeColor: theme.colorScheme.error,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildTypeOption(
                      type: 'suggestion',
                      label: 'Sugerencia',
                      icon: LucideIcons.lightbulb,
                      activeColor: primaryColor,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildTypeOption(
                      type: 'general',
                      label: 'Consulta',
                      icon: LucideIcons.helpCircle,
                      activeColor: theme.colorScheme.secondary,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Title input
              Text(
                '2. Resumen / Título',
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText:
                      'Ej. No se escucha el audio, Error al guardar versículo...',
                  hintStyle: GoogleFonts.inter(
                      fontSize: 12,
                      color:
                          theme.colorScheme.onSurface.withValues(alpha: 0.4)),
                  filled: true,
                  fillColor: theme.colorScheme.surfaceContainerHighest
                      .withValues(alpha: 0.5),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color:
                            theme.colorScheme.outline.withValues(alpha: 0.3)),
                  ),
                ),
                style: GoogleFonts.inter(fontSize: 13),
              ),

              const SizedBox(height: 14),

              // Description input
              Text(
                '3. Descripción detallada *',
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText:
                      'Describe qué ocurrió, qué esperabas que pasara o cuál es tu propuesta...',
                  hintStyle: GoogleFonts.inter(
                      fontSize: 12,
                      color:
                          theme.colorScheme.onSurface.withValues(alpha: 0.4)),
                  filled: true,
                  fillColor: theme.colorScheme.surfaceContainerHighest
                      .withValues(alpha: 0.5),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color:
                            theme.colorScheme.outline.withValues(alpha: 0.3)),
                  ),
                ),
                style: GoogleFonts.inter(fontSize: 13),
              ),

              const SizedBox(height: 14),

              // Sender Details (Optional)
              Text(
                '4. Tus Datos (Opcional)',
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        hintText: 'Tu Nombre',
                        hintStyle: GoogleFonts.inter(
                            fontSize: 12,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.4)),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest
                            .withValues(alpha: 0.5),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.3)),
                        ),
                      ),
                      style: GoogleFonts.inter(fontSize: 12.5),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        hintText: 'Tu Correo',
                        hintStyle: GoogleFonts.inter(
                            fontSize: 12,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.4)),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest
                            .withValues(alpha: 0.5),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.3)),
                        ),
                      ),
                      style: GoogleFonts.inter(fontSize: 12.5),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Compact Icon Action Buttons
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: _copyToClipboard,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          vertical: 12, horizontal: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      side: BorderSide(
                          color:
                              theme.colorScheme.outline.withValues(alpha: 0.3)),
                    ),
                    icon: Icon(
                      _copied ? LucideIcons.check : LucideIcons.copy,
                      size: 18,
                      color: _copied ? primaryColor : null,
                    ),
                    label: Text(
                      _copied ? '¡Copiado!' : 'Copiar',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _copied ? primaryColor : null,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _sendFeedback,
                      style: FilledButton.styleFrom(
                        backgroundColor: primaryColor,
                        foregroundColor: theme.colorScheme.onPrimary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(LucideIcons.send, size: 18),
                      label: Text(
                        'Enviar',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
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
    required Color activeColor,
  }) {
    final theme = Theme.of(context);
    final isSelected = _feedbackType == type;

    return InkWell(
      onTap: () => setState(() => _feedbackType = type),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? activeColor.withValues(alpha: 0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? activeColor
                : theme.colorScheme.outline.withValues(alpha: 0.2),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon,
                size: 18,
                color: isSelected
                    ? activeColor
                    : theme.colorScheme.onSurface.withValues(alpha: 0.5)),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? activeColor : theme.colorScheme.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
