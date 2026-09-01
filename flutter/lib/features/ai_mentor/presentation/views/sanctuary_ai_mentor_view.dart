import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? originalLanguageNote;

  const ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.originalLanguageNote,
  });
}

class SanctuaryAiMentorView extends StatefulWidget {
  const SanctuaryAiMentorView({super.key});

  @override
  State<SanctuaryAiMentorView> createState() => _SanctuaryAiMentorViewState();
}

class _SanctuaryAiMentorViewState extends State<SanctuaryAiMentorView> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  int _queriesUsedToday = 0;
  final int _dailyLimit = 2;
  bool _isLoading = false;

  final List<ChatMessage> _messages = [
    ChatMessage(
      text:
          '¡Gracia y paz en Cristo Jesús! Soy tu Mentor Teológico. Puedo ayudarte a profundizar en el contexto histórico, exégesis doctrinal y raíces en hebreo y griego bíblico de las Sagradas Escrituras.',
      isUser: false,
      timestamp: DateTime.now(),
      originalLanguageNote:
          'Modo Prueba Activo — 2 consultas por día con reinicio automático a medianoche.',
    ),
  ];

  final List<String> _suggestedPrompts = [
    '¿Qué significa «Shālôm» (שָׁלוֹם) en su raíz hebrea?',
    'Explica el término «Monogenēs» (μονογενής) en Juan 3:16',
    '¿Cuál es el contexto histórico de la carta a los Filipenses?',
    '¿Qué significa «Qāvāh» (קָוָה) en Isaías 40:31?',
  ];

  void _sendMessage(String query) {
    if (query.trim().isEmpty) return;

    if (_queriesUsedToday >= _dailyLimit) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Has alcanzado el límite diario de 2 consultas del Modo Prueba. Se restablece a medianoche (00:00 hs).'),
          backgroundColor: SanctuaryColors.sunOrange,
        ),
      );
      return;
    }

    setState(() {
      _messages.add(ChatMessage(
        text: query,
        isUser: true,
        timestamp: DateTime.now(),
      ));
      _queriesUsedToday++;
      _isLoading = true;
    });

    _inputController.clear();

    // Generate theological exegesis response
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;

      String responseText = '';
      String? rootAnalysis;

      if (query.toLowerCase().contains('shalom') ||
          query.toLowerCase().contains('paz')) {
        responseText =
            'El término hebreo **Shālôm (שָׁלוֹם)** trasciende la simple ausencia de conflicto. Proviene de la raíz *sh-l-m* que connota integridad, plenitud, bienestar holístico, armonía y restauración en la relación del ser humano con Dios, el prójimo y la creación (Números 6:24-26; Isaías 9:6).';
        rootAnalysis =
            'Hebreo: שָׁלוֹם (Shālôm) • Raíz: שָׁלֵם (Shālēm - estar completo, perfeccionado)';
      } else if (query.toLowerCase().contains('monogenes') ||
          query.toLowerCase().contains('juan 3:16') ||
          query.toLowerCase().contains('unigenito')) {
        responseText =
            'En Juan 3:16, el vocablo griego **Monogenēs (μονογενής)** se compone de *monos* (único/singular) y *genos* (clase, linaje o tipo). No significa "nacido", sino **«único en su género, incomparable y supremamente amado»**. Resalta la relación eterna, singular y divina entre el Padre y el Hijo.';
        rootAnalysis =
            'Griego: μονογενής (Monogenēs) • Compuesto: μόνος (único) + γένος (linaje/clase)';
      } else if (query.toLowerCase().contains('qavah') ||
          query.toLowerCase().contains('esperan') ||
          query.toLowerCase().contains('isaias 40')) {
        responseText =
            'En Isaías 40:31, la palabra traducida como «esperan» es el verbo hebreo **Qāvāh (קָוָה)**, cuya etimología alude al acto de torcer, entrelazar firmemente hilos o cuerdas para hacerlas irrompibles. Esperar en Jehová es entrelazar nuestra fragilidad con Su fortaleza todopoderosa.';
        rootAnalysis =
            'Hebreo: קָוָה (Qāvāh) • Sentido literal: trenzar, entrelazar con expectación firme';
      } else {
        responseText =
            'Al examinar «$query», las Escrituras nos enseñan a interpretar el pasaje dentro de su contexto histórico, su pacto correspondiente y la revelación progresiva que culmina en la persona y obra redentora de Jesucristo.';
        rootAnalysis =
            'Hermenéutica bíblica: Contexto histórico-gramatical y teología del pacto';
      }

      setState(() {
        _isLoading = false;
        _messages.add(ChatMessage(
          text: responseText,
          isUser: false,
          timestamp: DateTime.now(),
          originalLanguageNote: rootAnalysis,
        ));
      });

      // Scroll to bottom
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final remaining = _dailyLimit - _queriesUsedToday;

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
            const Icon(LucideIcons.sparkles,
                size: 20, color: Color(0xFF10B981)),
            const SizedBox(width: 8),
            Text(
              'Mentor Teológico IA',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
        actions: [
          // Quota Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: BoxDecoration(
              color: remaining > 0
                  ? const Color(0xFF10B981).withOpacity(0.15)
                  : Colors.redAccent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: remaining > 0
                    ? const Color(0xFF10B981).withOpacity(0.4)
                    : Colors.redAccent.withOpacity(0.4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  LucideIcons.zap,
                  size: 13,
                  color: remaining > 0
                      ? const Color(0xFF10B981)
                      : Colors.redAccent,
                ),
                const SizedBox(width: 4),
                Text(
                  '$remaining/$_dailyLimit hoy',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    color: remaining > 0
                        ? const Color(0xFF10B981)
                        : Colors.redAccent,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Banner of Test Mode
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: SanctuaryColors.sunOrange.withOpacity(0.1),
              border: Border(
                bottom: BorderSide(
                  color: SanctuaryColors.sunOrange.withOpacity(0.25),
                ),
              ),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.info,
                    size: 16, color: SanctuaryColors.sunOrange),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Modo Prueba: 2 consultas/día (reinicio automático a medianoche)',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: SanctuaryColors.sunOrange,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return Align(
                  alignment:
                      msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.85,
                    ),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: msg.isUser
                          ? theme.colorScheme.primary
                          : theme.cardTheme.color,
                      borderRadius: BorderRadius.circular(18).copyWith(
                        bottomRight:
                            msg.isUser ? const Radius.circular(4) : null,
                        bottomLeft:
                            !msg.isUser ? const Radius.circular(4) : null,
                      ),
                      border: !msg.isUser
                          ? Border.all(
                              color: theme.colorScheme.outline.withOpacity(0.3))
                          : null,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg.text,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            height: 1.5,
                            color: msg.isUser
                                ? Colors.white
                                : theme.colorScheme.onSurface,
                          ),
                        ),
                        if (msg.originalLanguageNote != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(LucideIcons.languages,
                                    size: 14, color: Color(0xFF10B981)),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    msg.originalLanguageNote!,
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF10B981),
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
                );
              },
            ),
          ),

          if (_isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Analizando textos originales y contexto...',
                    style: GoogleFonts.inter(
                        fontSize: 12, color: SanctuaryColors.sunOrange),
                  ),
                ],
              ),
            ),

          // Suggested Prompts
          if (_messages.length == 1)
            Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              margin: const EdgeInsets.only(bottom: 8),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _suggestedPrompts.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (context, idx) {
                  final prompt = _suggestedPrompts[idx];
                  return ActionChip(
                    label: Text(
                      prompt,
                      style: GoogleFonts.inter(
                          fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                    onPressed: () => _sendMessage(prompt),
                  );
                },
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.scaffoldBackgroundColor,
              border: Border(
                top: BorderSide(
                  color: theme.colorScheme.outline.withOpacity(0.25),
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    decoration: InputDecoration(
                      hintText: remaining > 0
                          ? 'Pregunta sobre teología, hebreo o griego...'
                          : 'Cupo diario agotado por hoy',
                      hintStyle: GoogleFonts.inter(fontSize: 13),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(
                            color: theme.colorScheme.outline.withOpacity(0.3)),
                      ),
                      enabled: remaining > 0,
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: remaining > 0
                      ? () => _sendMessage(_inputController.text)
                      : null,
                  style: IconButton.styleFrom(
                      backgroundColor: SanctuaryColors.waveNavy),
                  icon: const Icon(LucideIcons.send, size: 18),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
