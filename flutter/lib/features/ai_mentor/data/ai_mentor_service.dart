import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../../../core/storage/app_database.dart';
import '../../reader/presentation/state/reader_state_notifier.dart';

/// Service responsible for theological contextual AI guidance, strictly aligned
/// with biblical studies and backed by local Drift SQLite persistence.
class AiMentorService {
  final AppDatabase database;
  final String? apiKey;
  final GenerativeModel? modelOverride;

  /// Strict refusal message mandated when questions fall outside biblical/theological topics.
  static const String refusalResponse =
      'Solo puedo responder preguntas relacionadas con el estudio bíblico y teológico.';

  /// Strict theological system instruction for Gemini.
  static const String theologicalSystemPrompt = '''
Eres el "Mentor IA" de "Biblia Inteligente (Digital Sanctuary)".
Tu única función y propósito es guiar al usuario en el estudio riguroso, devocional y teológico de las Sagradas Escrituras.

REGLAS ESTRICTAS DE ALINEACIÓN TEOLÓGICA:
1. ALCANCE TEMÁTICO: Responde EXCLUSIVAMENTE sobre:
   - Teología bíblica, patrística, sistemática y devocional.
   - Contexto histórico, cultural, arqueológico y geográfico de los pasajes de la Biblia.
   - Análisis lingüístico y etimológico de las lenguas bíblicas originales (hebreo, arameo y griego koiné: p. ej. Hesed, Shalom, Agape, Logos).
   - Hermenéutica, exégesis bíblica y aplicación espiritual o ética en la vida diaria del creyente.
2. REGLA DE RECHAZO ESTRICTA (REFUSAL RULE): Si la pregunta del usuario es de carácter secular, no-bíblica, tecnológica mundana, deportiva, política no relacionada con el texto sagrado, entretenimiento general, o ajena a las Sagradas Escrituras y el estudio espiritual, debes negarte categórica y cortésmente respondiendo ÚNICA Y EXACTAMENTE:
"Solo puedo responder preguntas relacionadas con el estudio bíblico y teológico."
3. TONO Y ESTILO: Reverente, pastoral, erudito, claro, cristocéntrico y esperanzador.
''';

  AiMentorService({
    required this.database,
    this.apiKey,
    this.modelOverride,
  });

  /// Sends a theological query with scripture context to Gemini,
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

    String mentorAnswer;
    try {
      final key = apiKey ?? const String.fromEnvironment('GEMINI_API_KEY');

      if (key.isNotEmpty) {
        final model = modelOverride ??
            GenerativeModel(
              model: 'gemini-1.5-flash',
              apiKey: key,
              systemInstruction: Content.system(theologicalSystemPrompt),
            );

        // Prepend scripture context dynamically
        final buffer = StringBuffer();
        if (cleanRef.isNotEmpty) {
          buffer.writeln('CONTEXTO BÍBLICO ACTIVO:');
          buffer.writeln('Pasaje de Referencia: $cleanRef');
          if (verseText != null && verseText.trim().isNotEmpty) {
            buffer.writeln('Texto Bíblico: "${verseText.trim()}"');
          }
          buffer.writeln('----------------------------------------');
        }
        buffer.writeln('CONSULTA DEL USUARIO:');
        buffer.writeln(cleanQuestion);

        final response = await model.generateContent([
          Content.text(buffer.toString()),
        ]);

        final reply = response.text?.trim();
        if (reply != null && reply.isNotEmpty) {
          mentorAnswer = reply;
        } else {
          mentorAnswer = _generateTheologicalContextFallback(
            cleanQuestion,
            cleanRef,
            verseText,
          );
        }
      } else {
        // Contextual biblical theological fallback when API key is not configured
        mentorAnswer = _generateTheologicalContextFallback(
          cleanQuestion,
          cleanRef,
          verseText,
        );
      }
    } catch (e) {
      mentorAnswer = _generateTheologicalContextFallback(
        cleanQuestion,
        cleanRef,
        verseText,
      );
    }

    // 3. Persist mentor response in Drift SQLite
    await database.insertChatMessage(
      verseReference: cleanRef.isNotEmpty ? cleanRef : null,
      sender: 'mentor',
      messageText: mentorAnswer,
    );

    return mentorAnswer;
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

  /// Generates an edifying theological and contextual reflection based on scripture context.
  String _generateTheologicalContextFallback(
    String question,
    String reference,
    String? text,
  ) {
    final refDisplay = reference.isNotEmpty ? reference : 'las Escrituras';

    if (reference.toLowerCase().contains('juan 3:16')) {
      return 'En $refDisplay, Jesús revela a Nicodemo el núcleo redentor del Evangelio. '
          'El vocablo griego para amor aquí es **"Agapē"** (ἀγάπη), denotando entrega sacrificial incondicional. '
          'La expresión **"Monogenēs"** (μονογενής) destaca la singularidad única del Hijo eterno, enviado no para condenar al mundo, '
          'sino para abrir el camino de salvación por medio de la fe viva y transformadora.';
    }

    if (reference.toLowerCase().contains('salmo 23')) {
      return 'En el Salmo 23, David acude a la figura del pastor del antiguo Oriente Próximo. '
          'La declaración "Jehová es mi pastor, nada me faltará" (*Yahweh Rohi*) proclama el cuidado providencial y solícito de Dios. '
          'En los valles de sombra, la vara y el cayado no son instrumentos de castigo, sino símbolos de defensa contra depredadores '
          'y guía amorosa para el rebaño.';
    }

    if (text != null && text.trim().isNotEmpty) {
      return 'Al profundizar en $refDisplay: "$text", la hermenéutica bíblica nos invita a examinar la fidelidad del pacto de Dios. '
          'Respecto a tu consulta ("$question"), el pasaje enfatiza la soberanía divina y la gracia salvífica, llamando a todo creyente '
          'a una fe arraigada en la verdad eterna y en la comunión diaria con el Señor.';
    }

    return 'Al reflexionar sobre $refDisplay y tu consulta ("$question"), la revelación bíblica nos enseña '
        'a cimentar nuestra confianza en las promesas del Todopoderoso (*El-Shaddai*). '
        'La Palabra viva es lámpara a nuestros pies (Salmo 119:105), guiándonos con sabiduría, discernimiento y esperanza renovada.';
  }
}

/// Riverpod provider for [AiMentorService]
final aiMentorServiceProvider = Provider<AiMentorService>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return AiMentorService(database: db);
});
