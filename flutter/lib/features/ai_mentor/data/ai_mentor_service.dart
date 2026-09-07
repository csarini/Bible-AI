import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../core/storage/app_database.dart';
import '../../reader/presentation/state/reader_state_notifier.dart';

/// Service responsible for theological contextual AI guidance, strictly aligned
/// with biblical studies and backed by local Drift SQLite persistence.
/// Supports Google Gemini, OpenAI (ChatGPT), Qwen (OpenRouter), and local/remote proxies.
class AiMentorService {
  final AppDatabase database;
  final String? apiKey;
  final String? provider;
  final String? model;
  final String? endpoint;

  /// Strict refusal message mandated when questions fall outside biblical/theological topics.
  static const String refusalResponse =
      'Solo puedo responder preguntas relacionadas con el estudio bíblico y teológico.';

  /// Default Google Gemini API key configured for theological mentoring
  static const String defaultGeminiApiKey = 'AQ.Ab8RN6I_vopKgtr88G9_2H0StDa0yjJIJNP6I9YRUl43AelVfQ';

  /// Strict theological system instruction for all AI models.
  static const String theologicalSystemPrompt = '''
Eres el "Mentor Teológico IA" de "Biblia Inteligente (Digital Sanctuary)".
Tu propósito fundamental es guiar y ayudar al usuario en el estudio riguroso, devocional, exegético y pastoral de las Sagradas Escrituras.

DIRECTIVAS CRÍTICAS DE RESPUESTA:
1. CONSULTAS TEMÁTICAS (ej: "¿Qué dice la Biblia sobre la amistad?", "el perdón", "la paciencia", "el matrimonio", "la ansiedad", etc.):
   - Responde de forma completa, estructurada y fundamentada sólidamente en las Sagradas Escrituras.
   - Cita pasajes bíblicos clave del Antiguo y Nuevo Testamento con libro, capítulo y versículo (por ejemplo, para la amistad: Proverbios 17:17, Proverbios 18:24, Eclesiastés 4:9-10, Juan 15:12-15).
   - Incluye ejemplos bíblicos vivos (ej. el pacto de amistad entre David y Jonatán, la entrega de Cristo por sus amigos).
   - Desarrolla: (1) Fundamento bíblico profundo, (2) Pasajes y contexto histórico-cultural, (3) Raíces hebreas/griegas enriquecedoras si aplica (ej. Re'a, Philia, Agapē), (4) Aplicación espiritual y práctica para la vida diaria.

2. ANÁLISIS DE VERSÍCULOS ESPECÍFICOS (ej: "¿Qué piensas de Juan 3:16?", "¿Qué significa Romanos 8:28?", o versículos seleccionados):
   - Realiza un análisis exegético y contextual claro:
     * Contexto histórico y redentor del libro o pasaje.
     * Términos clave en su idioma original (hebreo, arameo o griego koiné) y su riqueza teológica.
     * Propósito del autor bíblico e implicaciones cristocéntricas.
     * Aplicación pastoral y personal para el creyente.

3. REGLA ESTRICTA CONTRA RESPUESTAS AUTOMÁTICAS PREFABRICADAS:
   - NUNCA devuelvas respuestas prefabricadas, vacías, evasivas o genéricas. Responde directa, minuciosa y específicamente a la pregunta formulada por el usuario.

4. ALCANCE BÍBLICO Y ÉTICO:
   - El enfoque exclusivo es el estudio bíblico, la teología, la historia de la salvación y la vida espiritual.
   - Si la consulta es totalmente mundana, deportiva, entretenimiento profano o ajena a la fe o ética (ej. recetas de cocina, resultados deportivos de fútbol, programación de código o especulación financiera), declina amablemente diciendo: "Solo puedo responder preguntas relacionadas con el estudio bíblico, teológico y la vida espiritual."
''';

  AiMentorService({
    required this.database,
    this.apiKey,
    this.provider,
    this.model,
    this.endpoint,
  });

  /// Sends a theological query with scripture context to the configured AI provider,
  /// saves both user query and AI response into [database], and returns the response.
  Future<String> askMentorWithContext({
    required String question,
    required String verseReference,
    String? verseText,
  }) async {
    final cleanQuestion = question.trim();
    final cleanRef = verseReference.trim();

    // 1. Persist user question in Drift SQLite
    await database.insertChatMessage(
      verseReference: cleanRef.isNotEmpty ? cleanRef : null,
      sender: 'user',
      messageText: cleanQuestion,
    );

    // 2. Evaluate refusal filter for completely secular/out-of-scope topics
    if (_isClearlyNonBiblical(cleanQuestion)) {
      await database.insertChatMessage(
        verseReference: cleanRef.isNotEmpty ? cleanRef : null,
        sender: 'mentor',
        messageText: refusalResponse,
      );
      return refusalResponse;
    }

    // 3. Load active AI credentials and preferences from SQLite
    final activeProvider = provider ??
        await database.getSetting('ai_provider') ??
        'gemini';
    final activeApiKey = apiKey ??
        await database.getSetting('ai_api_key') ??
        await database.getSetting('ai_gemini_key') ??
        (const String.fromEnvironment('GEMINI_API_KEY').isNotEmpty
            ? const String.fromEnvironment('GEMINI_API_KEY')
            : defaultGeminiApiKey);
    final activeModel = model ??
        await database.getSetting('ai_model');
    final activeEndpoint = endpoint ??
        await database.getSetting('ai_endpoint');
    final activeServerUrl = await database.getSetting('ai_server_url');

    // 4. Build contextual prompt
    final buffer = StringBuffer();
    if (cleanRef.isNotEmpty) {
      buffer.writeln('Versículo de referencia: $cleanRef');
      if (verseText != null && verseText.trim().isNotEmpty) {
        buffer.writeln('Texto Bíblico: "${verseText.trim()}"');
      }
      buffer.writeln('----------------------------------------');
      buffer.writeln('Pregunta o consulta del usuario: $cleanQuestion');
    } else {
      buffer.writeln('Consulta bíblica / teológica: $cleanQuestion');
    }
    final fullQuery = buffer.toString();

    String mentorAnswer;

    // 5. Try calling local/remote backend server proxy if configured
    if (activeServerUrl != null && activeServerUrl.trim().isNotEmpty) {
      try {
        final serverBase = activeServerUrl.trim().replaceAll(RegExp(r'/+$'), '');
        final response = await http.post(
          Uri.parse('$serverBase/api/mentor/chat'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'prompt': cleanQuestion,
            'selectedVerse': cleanRef.isNotEmpty
                ? {'reference': cleanRef, 'text': verseText ?? ''}
                : null,
            'provider': activeProvider,
            'apiKey': activeApiKey,
            'model': activeModel,
          }),
        ).timeout(const Duration(seconds: 35));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final reply = (data['text'] ?? data['reply'])?.toString().trim();
          if (reply != null && reply.isNotEmpty) {
            mentorAnswer = reply;
            await _persistAndReturn(cleanRef, mentorAnswer);
            return mentorAnswer;
          }
        }
      } catch (e) {
        // Fall back to direct API
      }
    }

    // 6. Direct Provider Execution
    try {
      if (activeProvider == 'openai' || activeProvider == 'chatgpt') {
        mentorAnswer = await _callOpenAi(
          apiKey: activeApiKey,
          model: activeModel ?? 'gpt-4o-mini',
          prompt: fullQuery,
        );
      } else if (activeProvider == 'qwen' || activeProvider == 'openrouter') {
        mentorAnswer = await _callOpenRouter(
          apiKey: activeApiKey,
          model: activeModel ?? 'qwen/qwen-2.5-72b-instruct',
          endpoint: activeEndpoint,
          prompt: fullQuery,
        );
      } else {
        // Default: Google Gemini
        mentorAnswer = await _callGemini(
          apiKey: activeApiKey,
          model: activeModel ?? 'gemini-3.6-flash',
          prompt: fullQuery,
        );
      }
    } catch (e) {
      mentorAnswer = '⚠️ **Error de conexión con el modelo de IA ($activeProvider)**\n\n'
          'Detalle: $e\n\n'
          'Por favor verifica tu conexión a internet o ingresa tus credenciales en los **Ajustes de IA** en la parte superior.';
    }

    await _persistAndReturn(cleanRef, mentorAnswer);
    return mentorAnswer;
  }

  Future<void> _persistAndReturn(String reference, String answer) async {
    await database.insertChatMessage(
      verseReference: reference.isNotEmpty ? reference : null,
      sender: 'mentor',
      messageText: answer,
    );
  }

  /// Calls Google Gemini via direct HTTP REST endpoint
  Future<String> _callGemini({
    required String apiKey,
    required String model,
    required String prompt,
  }) async {
    if (apiKey.trim().isEmpty) {
      return '⚠️ **Clave de Gemini no configurada**\n\n'
          'Para que el Mentor IA responda dinámicamente a tus preguntas bíblicas (como la amistad, el perdón o el análisis de versículos) necesitas ingresar tu clave API de Gemini:\n\n'
          '1. Toca el botón de **Ajustes de IA** (arriba a la derecha).\n'
          '2. Selecciona **Google Gemini**.\n'
          '3. Pega tu API Key de Google AI Studio (gratis) y presiona **Guardar**.';
    }

    final candidateModels = [
      model,
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    String? lastError;
    for (final m in candidateModels) {
      try {
        final url = Uri.parse(
          'https://generativelanguage.googleapis.com/v1beta/models/$m:generateContent?key=$apiKey',
        );

        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'system_instruction': {
              'parts': [
                {'text': theologicalSystemPrompt}
              ]
            },
            'contents': [
              {
                'parts': [
                  {'text': prompt}
                ]
              }
            ],
            'generationConfig': {
              'temperature': 0.3,
            }
          }),
        ).timeout(const Duration(seconds: 30));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final candidates = data['candidates'] as List?;
          if (candidates != null && candidates.isNotEmpty) {
            final content = candidates[0]['content'];
            final parts = content?['parts'] as List?;
            if (parts != null && parts.isNotEmpty) {
              final text = parts[0]['text']?.toString().trim();
              if (text != null && text.isNotEmpty) {
                return text;
              }
            }
          }
        } else {
          final errBody = jsonDecode(response.body);
          lastError = errBody['error']?['message'] ?? 'HTTP ${response.statusCode}';
        }
      } catch (e) {
        lastError = e.toString();
      }
    }

    throw Exception(lastError ?? 'No se pudo obtener respuesta de Google Gemini.');
  }

  /// Calls OpenAI (ChatGPT) via direct HTTP REST endpoint
  Future<String> _callOpenAi({
    required String apiKey,
    required String model,
    required String prompt,
  }) async {
    if (apiKey.trim().isEmpty) {
      return '⚠️ **Clave de OpenAI no configurada**\n\n'
          'Para utilizar ChatGPT en el Mentor IA, ingresa tu clave de OpenAI en **Ajustes de IA**.';
    }

    final url = Uri.parse('https://api.openai.com/v1/chat/completions');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({
        'model': model,
        'temperature': 0.3,
        'messages': [
          {'role': 'system', 'content': theologicalSystemPrompt},
          {'role': 'user', 'content': prompt}
        ]
      }),
    ).timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final choices = data['choices'] as List?;
      if (choices != null && choices.isNotEmpty) {
        final reply = choices[0]['message']?['content']?.toString().trim();
        if (reply != null && reply.isNotEmpty) {
          return reply;
        }
      }
    }

    final errBody = jsonDecode(response.body);
    throw Exception(errBody['error']?['message'] ?? 'HTTP ${response.statusCode} de OpenAI');
  }

  /// Calls Qwen via OpenRouter or custom OpenAI-compatible endpoint
  Future<String> _callOpenRouter({
    required String apiKey,
    required String model,
    String? endpoint,
    required String prompt,
  }) async {
    if (apiKey.trim().isEmpty) {
      return '⚠️ **Clave de Qwen / OpenRouter no configurada**\n\n'
          'Para utilizar el modelo Qwen en el Mentor IA, ingresa tu API Key en **Ajustes de IA**.';
    }

    final targetUrl = endpoint?.trim().isNotEmpty == true
        ? endpoint!.trim()
        : 'https://openrouter.ai/api/v1/chat/completions';

    final response = await http.post(
      Uri.parse(targetUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({
        'model': model,
        'temperature': 0.3,
        'messages': [
          {'role': 'system', 'content': theologicalSystemPrompt},
          {'role': 'user', 'content': prompt}
        ]
      }),
    ).timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final choices = data['choices'] as List?;
      if (choices != null && choices.isNotEmpty) {
        final reply = choices[0]['message']?['content']?.toString().trim();
        if (reply != null && reply.isNotEmpty) {
          return reply;
        }
      }
    }

    final errBody = jsonDecode(response.body);
    throw Exception(errBody['error']?['message'] ?? 'HTTP ${response.statusCode} de OpenRouter');
  }

  /// Fast heuristic to reject non-biblical/secular questions immediately
  bool _isClearlyNonBiblical(String text) {
    final lower = text.toLowerCase();
    final secularForbiddenPatterns = [
      'receta de cocina',
      'quien gano el partido',
      'futbol',
      'fútbol',
      'criptomoneda',
      'bitcoin',
      'comprar acciones',
      'pronostico del clima',
      'pronóstico del clima',
      'horoscopo',
      'horóscopo',
      'signo zodiacal',
      'reparar motor',
      'programar en python',
      'codigo javascript',
      'código javascript',
      'restaurante de sushi',
      'precio del dolar',
      'precio del dólar',
      'ganar la loteria',
      'ganar la lotería',
      'jugar ruleta',
      'pelicula de accion',
      'película de acción',
    ];
    for (final pattern in secularForbiddenPatterns) {
      if (lower.contains(pattern)) {
        return true;
      }
    }
    return false;
  }
}

/// Riverpod provider for [AiMentorService]
final aiMentorServiceProvider = Provider<AiMentorService>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return AiMentorService(database: db);
});
