import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/constants/bible_books.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';
import '../../data/ai_mentor_service.dart';

/// Interactive theological AI chat view with local Drift SQLite persistence,
/// active scripture context injection, and strict alignment to biblical studies.
class SanctuaryAiMentorView extends ConsumerStatefulWidget {
  final AppDatabase? database;
  final String? initialVerseReference;
  final String? initialVerseText;

  const SanctuaryAiMentorView({
    super.key,
    this.database,
    this.initialVerseReference,
    this.initialVerseText,
  });

  @override
  ConsumerState<SanctuaryAiMentorView> createState() =>
      _SanctuaryAiMentorViewState();
}

class _SanctuaryAiMentorViewState extends ConsumerState<SanctuaryAiMentorView> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  int _queriesUsedToday = 0;
  final int _dailyLimit = 15;

  String? _activeReference;
  String? _activeVerseText;

  @override
  void initState() {
    super.initState();
    _activeReference = widget.initialVerseReference;
    _activeVerseText = widget.initialVerseText;
  }

  final List<String> _suggestedPrompts = [
    '¿Qué dice la Biblia sobre la amistad?',
    '¿Qué dice la Biblia sobre el perdón y la reconciliación?',
    'Analiza Juan 3:16 y qué significa para mi vida',
    '¿Qué significa «Shālôm» (שָׁלוֹם) en su raíz hebrea?',
    '¿Cuál es el significado del pacto en Génesis 17:1?',
    '¿Qué significa «Qāvāh» (קָוāh) en Isaías 40:31?',
  ];

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage({
    required AppDatabase db,
    required String query,
    required String activeReference,
    String? activeVerseText,
  }) async {
    final cleanQuery = query.trim();
    if (cleanQuery.isEmpty || _isLoading) return;

    final customKey = await db.getSetting('ai_api_key') ??
        await db.getSetting('ai_gemini_key') ??
        AiMentorService.defaultGeminiApiKey;
    final hasCustomKey = customKey.trim().isNotEmpty;

    if (!hasCustomKey && _queriesUsedToday >= _dailyLimit) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'Límite de prueba alcanzado. Configura tus credenciales para consultas ilimitadas.',
          ),
          backgroundColor: SanctuaryColors.sunOrange,
          action: SnackBarAction(
            label: 'Configurar',
            textColor: Colors.white,
            onPressed: () => _showAiSettingsDialog(db),
          ),
        ),
      );
      return;
    }

    _inputController.clear();
    setState(() {
      _isLoading = true;
      _queriesUsedToday++;
    });
    _scrollToBottom();

    try {
      final service = AiMentorService(database: db);
      await service.askMentorWithContext(
        question: cleanQuery,
        verseReference: activeReference,
        verseText: activeVerseText,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al consultar al Mentor IA: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _scrollToBottom();
      }
    }
  }

  Future<void> _confirmClearChat(AppDatabase db) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(LucideIcons.trash2, color: Colors.redAccent, size: 20),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                'Limpiar conversación',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Text(
          '¿Deseas eliminar todo el historial de conversaciones con el Mentor IA de tu dispositivo?',
          style: GoogleFonts.inter(fontSize: 13.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              'Cancelar',
              style: GoogleFonts.inter(color: Colors.grey),
            ),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: Text(
              'Eliminar',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await db.clearChatMessages();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Historial del Mentor IA borrado con éxito.'),
          backgroundColor: SanctuaryColors.waveNavy,
        ),
      );
    }
  }

  Future<void> _showAiSettingsDialog(AppDatabase db) async {
    final currentProvider = await db.getSetting('ai_provider') ?? 'gemini';
    final currentKey = await db.getSetting('ai_api_key') ??
        await db.getSetting('ai_gemini_key') ??
        AiMentorService.defaultGeminiApiKey;
    final currentModel = await db.getSetting('ai_model') ?? '';
    final currentEndpoint = await db.getSetting('ai_endpoint') ?? '';

    String selectedProvider = currentProvider;
    final keyController = TextEditingController(text: currentKey);
    final modelController = TextEditingController(text: currentModel);
    final endpointController = TextEditingController(text: currentEndpoint);
    bool obscureKey = true;

    if (!mounted) return;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: Row(
              children: [
                const Icon(LucideIcons.bot, color: SanctuaryColors.sunOrange, size: 22),
                const SizedBox(width: 8),
                Text(
                  'Ajustes del Mentor IA',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 17),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Configura tus credenciales para usar Gemini, ChatGPT o Qwen con respuestas bíblicas en tiempo real.',
                    style: GoogleFonts.inter(fontSize: 12.5, color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Proveedor de IA:',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: selectedProvider,
                    isExpanded: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'gemini',
                        child: Text('Google Gemini (Recomendado - Gratuito)'),
                      ),
                      DropdownMenuItem(
                        value: 'openai',
                        child: Text('OpenAI (ChatGPT gpt-4o-mini)'),
                      ),
                      DropdownMenuItem(
                        value: 'qwen',
                        child: Text('Qwen (OpenRouter / DeepSeek)'),
                      ),
                      DropdownMenuItem(
                        value: 'custom',
                        child: Text('Servidor Local / Proxy'),
                      ),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          selectedProvider = val;
                          if (val == 'gemini' && modelController.text.isEmpty) {
                            modelController.text = 'gemini-3.6-flash';
                          } else if (val == 'openai' && modelController.text.isEmpty) {
                            modelController.text = 'gpt-4o-mini';
                          } else if (val == 'qwen' && modelController.text.isEmpty) {
                            modelController.text = 'qwen/qwen-2.5-72b-instruct';
                          }
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Clave API ($selectedProvider):',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: keyController,
                    obscureText: obscureKey,
                    decoration: InputDecoration(
                      hintText: selectedProvider == 'gemini'
                          ? 'AIzaSy...'
                          : selectedProvider == 'openai'
                              ? 'sk-proj-...'
                              : 'sk-or-v1-...',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscureKey ? LucideIcons.eyeOff : LucideIcons.eye,
                          size: 18,
                        ),
                        onPressed: () {
                          setDialogState(() {
                            obscureKey = !obscureKey;
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Modelo (opcional):',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: modelController,
                    decoration: InputDecoration(
                      hintText: selectedProvider == 'gemini'
                          ? 'gemini-3.6-flash'
                          : selectedProvider == 'openai'
                              ? 'gpt-4o-mini'
                              : 'qwen/qwen-2.5-72b-instruct',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  if (selectedProvider == 'qwen' || selectedProvider == 'custom') ...[
                    const SizedBox(height: 14),
                    Text(
                      'URL Endpoint / Proxy (opcional):',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: endpointController,
                      decoration: InputDecoration(
                        hintText: 'https://openrouter.ai/api/v1/chat/completions',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: () async {
                  await db.saveSetting('ai_provider', selectedProvider);
                  await db.saveSetting('ai_api_key', keyController.text.trim());
                  await db.saveSetting('ai_gemini_key', keyController.text.trim());
                  if (modelController.text.trim().isNotEmpty) {
                    await db.saveSetting('ai_model', modelController.text.trim());
                  }
                  if (endpointController.text.trim().isNotEmpty) {
                    await db.saveSetting('ai_endpoint', endpointController.text.trim());
                  }
                  if (ctx.mounted) {
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('✓ Credenciales y proveedor de IA guardados exitosamente.'),
                        backgroundColor: SanctuaryColors.waveNavy,
                      ),
                    );
                  }
                },
                style: FilledButton.styleFrom(backgroundColor: SanctuaryColors.waveNavy),
                child: const Text('Guardar Credenciales'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final AppDatabase effectiveDb =
        widget.database ?? ref.watch(appSettingsControllerProvider).database;

    // Active scripture context (only if explicitly set by user or passed as initial context)
    final hasActiveReference =
        _activeReference != null && _activeReference!.trim().isNotEmpty;
    final String activeReference =
        hasActiveReference ? _activeReference!.trim() : '';

    final remainingQueries = _dailyLimit - _queriesUsedToday;

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
            Flexible(
              child: Text(
                'Mentor Teológico IA',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  fontSize: 16.5,
                ),
              ),
            ),
          ],
        ),
        actions: [
          // Clear History Action Button
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 18),
            tooltip: 'Borrar historial',
            onPressed: () => _confirmClearChat(effectiveDb),
          ),
          // Quota Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            decoration: BoxDecoration(
              color: remainingQueries > 0
                  ? const Color(0xFF10B981).withValues(alpha: 0.15)
                  : Colors.redAccent.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: remainingQueries > 0
                    ? const Color(0xFF10B981).withValues(alpha: 0.4)
                    : Colors.redAccent.withValues(alpha: 0.4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  LucideIcons.zap,
                  size: 12,
                  color: remainingQueries > 0
                      ? const Color(0xFF10B981)
                      : Colors.redAccent,
                ),
                const SizedBox(width: 4),
                Text(
                  '$remainingQueries/$_dailyLimit',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800,
                    fontSize: 10.5,
                    color: remainingQueries > 0
                        ? const Color(0xFF10B981)
                        : Colors.redAccent,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.bot),
            tooltip: 'Ajustes de IA (Gemini / ChatGPT / Qwen)',
            onPressed: () => _showAiSettingsDialog(effectiveDb),
          ),
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Active Biblical Context Bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0B2B68).withValues(alpha: 0.08),
              border: Border(
                bottom: BorderSide(
                  color: const Color(0xFF0B2B68).withValues(alpha: 0.15),
                ),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  hasActiveReference
                      ? LucideIcons.bookOpen
                      : LucideIcons.messageSquare,
                  size: 15,
                  color: SanctuaryColors.waveNavy,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: RichText(
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    text: TextSpan(
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: theme.colorScheme.onSurface,
                      ),
                      children: [
                        TextSpan(
                          text: hasActiveReference
                              ? 'Contexto activo: '
                              : 'Contexto: ',
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                        TextSpan(
                          text: hasActiveReference
                              ? activeReference
                              : 'Consulta Temática Libre (Sin versículo predefinido)',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            color: hasActiveReference
                                ? SanctuaryColors.waveNavy
                                : theme.colorScheme.onSurface
                                    .withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (hasActiveReference) ...[
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: () {
                      setState(() {
                        _activeReference = null;
                        _activeVerseText = null;
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.x,
                              size: 12, color: SanctuaryColors.sunOrange),
                          const SizedBox(width: 2),
                          Text(
                            'Quitar',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: SanctuaryColors.sunOrange,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.zap,
                          size: 11, color: Color(0xFF10B981)),
                      const SizedBox(width: 3),
                      Text(
                        'Respuestas Resumidas',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Messages List connected to SQLite Drift Stream
          Expanded(
            child: StreamBuilder<List<AiChatMessageEntry>>(
              stream: effectiveDb.watchChatMessages(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting &&
                    !snapshot.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                final messages = snapshot.data ?? [];

                if (messages.isEmpty) {
                  return _buildEmptyState(
                    theme: theme,
                    activeReference: activeReference,
                    onPromptSelected: (prompt) => _sendMessage(
                      db: effectiveDb,
                      query: prompt,
                      activeReference: activeReference,
                    ),
                  );
                }

                // Scroll to bottom when new message arrives
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (_scrollController.hasClients) {
                    _scrollController.jumpTo(
                      _scrollController.position.maxScrollExtent,
                    );
                  }
                });

                return ListView.separated(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isUser = msg.sender.toLowerCase() == 'user';

                    return Align(
                      alignment:
                          isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.86,
                        ),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isUser
                              ? SanctuaryColors.waveNavy
                              : theme.cardTheme.color ?? theme.cardColor,
                          borderRadius: BorderRadius.circular(16).copyWith(
                            bottomRight:
                                isUser ? const Radius.circular(3) : null,
                            bottomLeft:
                                !isUser ? const Radius.circular(3) : null,
                          ),
                          border: !isUser
                              ? Border.all(
                                  color: theme.colorScheme.outline
                                      .withValues(alpha: 0.25),
                                )
                              : null,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header badge with Role and Verse Reference
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isUser
                                      ? LucideIcons.user
                                      : LucideIcons.sparkles,
                                  size: 13,
                                  color: isUser
                                      ? Colors.white70
                                      : const Color(0xFF10B981),
                                ),
                                const SizedBox(width: 5),
                                Flexible(
                                  child: Text(
                                    isUser ? 'Tú' : 'Mentor Teológico',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: isUser
                                          ? Colors.white70
                                          : const Color(0xFF10B981),
                                    ),
                                  ),
                                ),
                                if (msg.verseReference != null &&
                                    msg.verseReference!.isNotEmpty) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isUser
                                          ? Colors.white.withValues(alpha: 0.15)
                                          : SanctuaryColors.waveNavy
                                              .withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          LucideIcons.bookmark,
                                          size: 10,
                                          color: isUser
                                              ? Colors.white
                                              : SanctuaryColors.waveNavy,
                                        ),
                                        const SizedBox(width: 3),
                                        Flexible(
                                          child: Text(
                                            msg.verseReference!,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.inter(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w600,
                                              color: isUser
                                                  ? Colors.white
                                                  : SanctuaryColors.waveNavy,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 8),
                            // Message Content
                            SelectableText(
                              msg.messageText,
                              style: GoogleFonts.inter(
                                fontSize: 13.5,
                                height: 1.5,
                                color: isUser
                                    ? Colors.white
                                    : theme.colorScheme.onSurface,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Loading status indicator
          if (_isLoading)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: SanctuaryColors.sunOrange.withValues(alpha: 0.08),
              child: Row(
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: SanctuaryColors.sunOrange,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Flexible(
                    child: Text(
                      'Consultando fuentes teológicas, hebreo y griego...',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: SanctuaryColors.sunOrange,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Suggested Prompts Quick Carousel
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            margin: const EdgeInsets.only(top: 4, bottom: 4),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _suggestedPrompts.length,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (context, idx) {
                final prompt = _suggestedPrompts[idx];
                return ActionChip(
                  avatar: const Icon(LucideIcons.sparkle,
                      size: 12, color: Color(0xFF10B981)),
                  label: Text(
                    prompt,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  onPressed: _isLoading
                      ? null
                      : () => _sendMessage(
                            db: effectiveDb,
                            query: prompt,
                            activeReference: activeReference,
                          ),
                );
              },
            ),
          ),

          // Input Bar with Defensive Tokens
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.scaffoldBackgroundColor,
              border: Border(
                top: BorderSide(
                  color: theme.colorScheme.outline.withValues(alpha: 0.25),
                ),
              ),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      decoration: InputDecoration(
                        hintText: remainingQueries > 0
                            ? (activeReference.isNotEmpty
                                ? 'Pregunta sobre teología o $activeReference...'
                                : 'Pregunta sobre temas bíblicos (amistad, perdón, fe)...')
                            : 'Cupo diario agotado por hoy',
                        hintStyle: GoogleFonts.inter(fontSize: 12.5),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 11,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(
                            color: theme.colorScheme.outline
                                .withValues(alpha: 0.3),
                          ),
                        ),
                        enabled: remainingQueries > 0 && !_isLoading,
                      ),
                      onSubmitted: (text) => _sendMessage(
                        db: effectiveDb,
                        query: text,
                        activeReference: activeReference,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: (remainingQueries > 0 && !_isLoading)
                        ? () => _sendMessage(
                              db: effectiveDb,
                              query: _inputController.text,
                              activeReference: activeReference,
                            )
                        : null,
                    style: IconButton.styleFrom(
                      backgroundColor: SanctuaryColors.waveNavy,
                    ),
                    icon: const Icon(LucideIcons.send, size: 18),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required ThemeData theme,
    required String activeReference,
    required ValueChanged<String> onPromptSelected,
  }) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF10B981).withValues(alpha: 0.12),
              border: Border.all(
                color: const Color(0xFF10B981).withValues(alpha: 0.3),
              ),
            ),
            child: const Icon(
              LucideIcons.sparkles,
              size: 32,
              color: Color(0xFF10B981),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Mentor Teológico Digital',
            textAlign: TextAlign.center,
            style: GoogleFonts.cinzel(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Acompañamiento doctrinal riguroso, exégesis en lenguas originales y hermenéutica fiel a las Sagradas Escrituras. Tus diálogos se guardan localmente en tu Santuario.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 13,
                height: 1.5,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.75),
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Active Context Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: theme.cardTheme.color ?? theme.cardColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: theme.colorScheme.outline.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  activeReference.isNotEmpty
                      ? LucideIcons.bookMarked
                      : LucideIcons.messageSquare,
                  size: 18,
                  color: SanctuaryColors.waveNavy,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activeReference.isNotEmpty
                            ? 'Pasaje de Estudio Seleccionado'
                            : 'Modo de Estudio Libre',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: SanctuaryColors.waveNavy,
                        ),
                      ),
                      Text(
                        activeReference.isNotEmpty
                            ? activeReference
                            : 'Consulta Temática (Sin versículo predefinido)',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Preguntas Teológicas Sugeridas:',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
          ),
          const SizedBox(height: 10),
          ..._suggestedPrompts.map(
            (prompt) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => onPromptSelected(prompt),
                style: OutlinedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  alignment: Alignment.centerLeft,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  side: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      LucideIcons.helpCircle,
                      size: 14,
                      color: SanctuaryColors.waveNavy,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        prompt,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                    const Icon(LucideIcons.chevronRight, size: 14),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
