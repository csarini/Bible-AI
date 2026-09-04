import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';
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
  final TextEditingController _messageController = TextEditingController();
  bool _copied = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  String _getSubject() {
    final typeLabel = _feedbackType == 'bug'
        ? 'Error'
        : _feedbackType == 'suggestion'
            ? 'Idea'
            : 'Consulta';
    return 'Feedback El-Shaddai [$typeLabel]';
  }

  String _getBodyText() {
    final visualTheme = ref.read(appVisualThemeModeProvider);
    final translation = ref.read(appTranslationProvider);

    return '''--- FEEDBACK SANTUARIO DIGITAL EL-SHADDAI ---
Tipo: ${_feedbackType == 'bug' ? 'Error / Bug' : _feedbackType == 'suggestion' ? 'Sugerencia / Idea' : 'Consulta General'}
Fecha: ${DateTime.now().toLocal().toString().split('.')[0]}

MENSAJE:
${_messageController.text.trim()}

--- DATOS TÉCNICOS ---
Versión Bíblica: ${translation.toUpperCase()}
Tema: ${visualTheme.name}
Plataforma: Flutter Nativo
--------------------------------------------''';
  }

  Future<void> _sendFeedback() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Escribe tu comentario o sugerencia'),
          backgroundColor: Colors.redAccent,
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
    final text = _messageController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Escribe un mensaje antes de copiar'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final fullText = '${_getSubject()}\n\n${_getBodyText()}';
    await Clipboard.setData(ClipboardData(text: fullText));
    setState(() => _copied = true);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Copiado al portapapeles!'),
          backgroundColor: SanctuaryColors.waveNavy,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: theme.scaffoldBackgroundColor,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 380),
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header: Icon + Title + Close Button
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SanctuaryColors.sunOrange.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    LucideIcons.messageSquareHeart,
                    color: SanctuaryColors.sunOrange,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Feedback',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.x, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                  tooltip: 'Cerrar',
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Category Selector: Minimalist Icon Buttons
            Row(
              children: [
                Expanded(
                  child: _buildIconButton(
                    type: 'bug',
                    label: 'Error',
                    icon: LucideIcons.bug,
                    color: const Color(0xFFE11D48),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildIconButton(
                    type: 'suggestion',
                    label: 'Idea',
                    icon: LucideIcons.lightbulb,
                    color: SanctuaryColors.sunOrange,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildIconButton(
                    type: 'general',
                    label: 'Mensaje',
                    icon: LucideIcons.messageCircle,
                    color: SanctuaryColors.waveNavy,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Message TextField
            TextField(
              controller: _messageController,
              maxLines: 4,
              textInputAction: TextInputAction.newline,
              decoration: InputDecoration(
                hintText: _feedbackType == 'bug'
                    ? '¿Qué error ocurrió?...'
                    : _feedbackType == 'suggestion'
                        ? '¿Qué idea o mejora propones?...'
                        : 'Escribe tu consulta o mensaje...',
                hintStyle: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                ),
                filled: true,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.2),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.2),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(
                    color: SanctuaryColors.sunOrange,
                    width: 1.5,
                  ),
                ),
              ),
              style: GoogleFonts.inter(fontSize: 13),
            ),

            const SizedBox(height: 14),

            // Action Buttons: Icon-forward
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _copyToClipboard,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      side: BorderSide(
                        color: theme.colorScheme.outline.withValues(alpha: 0.25),
                      ),
                    ),
                    icon: Icon(
                      _copied ? LucideIcons.check : LucideIcons.copy,
                      size: 16,
                      color: _copied ? const Color(0xFF10B981) : null,
                    ),
                    label: Text(
                      _copied ? 'Copiado' : 'Copiar',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: _copied ? const Color(0xFF10B981) : null,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  flex: 2,
                  child: FilledButton.icon(
                    onPressed: _sendFeedback,
                    style: FilledButton.styleFrom(
                      backgroundColor: SanctuaryColors.sunOrange,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(LucideIcons.send, size: 16),
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
    );
  }

  Widget _buildIconButton({
    required String type,
    required String label,
    required IconData icon,
    required Color color,
  }) {
    final isSelected = _feedbackType == type;
    final theme = Theme.of(context);

    return InkWell(
      onTap: () => setState(() => _feedbackType = type),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? color.withValues(alpha: 0.12)
              : theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? color
                : theme.colorScheme.outline.withValues(alpha: 0.15),
            width: isSelected ? 1.8 : 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected
                  ? color
                  : theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected
                    ? color
                    : theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
