/// Copyright & Scripture Compliance Service for Flutter
/// Strictly enforces Bíblica, Inc. License Agreement, API.Bible Terms of Use,
/// reading volume boundaries (Clause V.F), AI processing restrictions (Clause III.B),
/// and 30-day offline cache revalidation rules.

class ScriptureCopyrightInfo {
  final String translationId;
  final String abbreviation;
  final String fullName;
  final String year;
  final String organization;
  final bool isCopyrightProtected;
  final String standardCitation;
  final String? directLinkUrl;
  final String? directLinkAnchorText;
  final String? apiPlatformUrl;
  final String? apiPlatformName;
  final String licenseSummary;

  const ScriptureCopyrightInfo({
    required this.translationId,
    required this.abbreviation,
    required this.fullName,
    required this.year,
    required this.organization,
    required this.isCopyrightProtected,
    required this.standardCitation,
    this.directLinkUrl,
    this.directLinkAnchorText,
    this.apiPlatformUrl,
    this.apiPlatformName,
    required this.licenseSummary,
  });

  /// Convenient aliases for direct official link
  String? get officialLinkText => directLinkAnchorText;
  String? get officialLinkUrl => directLinkUrl;
}

class CopyrightGuardService {
  /// Maximum days allowed for local caching of protected scripture before revalidation
  static const int cacheTtlDays = 30;

  /// Clause V.F (Bíblica, Inc.): Max 2 chapters or 25 verses, whichever is greater
  static const int maxReadingVolumeChapters = 2;
  static const int maxReadingVolumeVerses = 25;

  static const Map<String, ScriptureCopyrightInfo> _catalog = {
    'nvi': ScriptureCopyrightInfo(
      translationId: 'nvi',
      abbreviation: 'NVI',
      fullName: 'Nueva Versión Internacional',
      year: '1999, 2015, 2022',
      organization: 'Bíblica, Inc.®',
      isCopyrightProtected: true,
      standardCitation:
          'NVI © está tomada de la Santa Biblia, Nueva Versión Internacional® NVI® © 1999, 2015, 2022 por Bíblica, Inc.® Usado con permiso. Todos los derechos reservados mundialmente.',
      directLinkUrl: 'https://www.Biblica.com',
      directLinkAnchorText: 'Visitar sitio oficial de Biblica',
      apiPlatformName: 'API.Bible',
      apiPlatformUrl: 'https://api.bible',
      licenseSummary:
          'Uso estrictamente no comercial. Prohibida la conversión de texto a audio y el procesamiento con modelos de IA generativa (Cláusula III.B).',
    ),
    'nbla': ScriptureCopyrightInfo(
      translationId: 'nbla',
      abbreviation: 'NBLA',
      fullName: 'Nueva Biblia de las Américas',
      year: '2005',
      organization: 'The Lockman Foundation',
      isCopyrightProtected: true,
      standardCitation:
          'NBLA © están tomados de Nueva Biblia de las Américas™ ©, Copyright 2005 por The Lockman Foundation. Usado con permiso. Todos los derechos reservados.',
      directLinkUrl: 'https://www.lockman.org',
      directLinkAnchorText: 'The Lockman Foundation',
      apiPlatformName: 'API.Bible',
      apiPlatformUrl: 'https://api.bible',
      licenseSummary:
          'Traducción protegida por derechos de autor. Cita permitida para fines educativos y devocionales no comerciales.',
    ),
    'bes': ScriptureCopyrightInfo(
      translationId: 'bes',
      abbreviation: 'BES',
      fullName: 'La Biblia en Español Sencillo',
      year: '2019',
      organization: 'Wycliffe Associates',
      isCopyrightProtected: true,
      standardCitation:
          'BES © está tomada de La Biblia en Español Sencillo ©, Wycliffe Associates. Usado con permiso.',
      directLinkUrl: 'https://api.bible',
      directLinkAnchorText: 'API.Bible',
      apiPlatformName: 'API.Bible',
      apiPlatformUrl: 'https://api.bible',
      licenseSummary: 'Traducción de lenguaje sencillo accesible vía API.Bible.',
    ),
    'vbl': ScriptureCopyrightInfo(
      translationId: 'vbl',
      abbreviation: 'VBL',
      fullName: 'Versión Biblia Libre',
      year: '2020',
      organization: 'Dr. Jonathan Gallagher',
      isCopyrightProtected: false,
      standardCitation:
          'VBL: Versión Biblia Libre © 2020 por Dr. Jonathan Gallagher. Licencia abierta Creative Commons (CC BY-SA 4.0).',
      directLinkUrl: 'https://freebibleversion.org',
      directLinkAnchorText: 'Free Bible Version',
      apiPlatformName: 'API.Bible',
      apiPlatformUrl: 'https://api.bible',
      licenseSummary: 'Licencia abierta Creative Commons.',
    ),
    'pddpt': ScriptureCopyrightInfo(
      translationId: 'pddpt',
      abbreviation: 'PdDpt',
      fullName: 'Palabra de Dios para ti',
      year: '2017',
      organization: 'Palabra de Dios para ti',
      isCopyrightProtected: true,
      standardCitation:
          'PdDpt © está tomada de Palabra de Dios para ti © Copyright 2017. Usado con permiso.',
      directLinkUrl: 'https://api.bible',
      directLinkAnchorText: 'API.Bible',
      apiPlatformName: 'API.Bible',
      apiPlatformUrl: 'https://api.bible',
      licenseSummary: 'Citas bíblicas bajo términos de servicio de API.Bible.',
    ),
    'valera': ScriptureCopyrightInfo(
      translationId: 'valera',
      abbreviation: 'RVR1909',
      fullName: 'Reina-Valera 1909',
      year: '1909',
      organization: 'Sociedad Bíblica Británica y Extranjera',
      isCopyrightProtected: false,
      standardCitation:
          'Reina-Valera 1909 (RVR1909): Texto canónico clásico en español, Dominio Público.',
      licenseSummary: 'Texto histórico de dominio público.',
    ),
    'bsb': ScriptureCopyrightInfo(
      translationId: 'bsb',
      abbreviation: 'BSB',
      fullName: 'Berean Standard Bible',
      year: '2023',
      organization: 'Berean Bible',
      isCopyrightProtected: false,
      standardCitation: 'Berean Standard Bible (BSB) © 2023. Dedicated to the Public Domain.',
      licenseSummary: 'Public domain translation.',
    ),
  };

  /// Normalizes translation string identifier
  static String normalizeKey(String? translationId) {
    if (translationId == null || translationId.isEmpty) return 'valera';
    final clean = translationId.toLowerCase().trim().replaceAll(RegExp(r'[^a-z0-9]'), '');
    if (clean.contains('nvi')) return 'nvi';
    if (clean.contains('nbla')) return 'nbla';
    if (clean.contains('bes')) return 'bes';
    if (clean.contains('vbl')) return 'vbl';
    if (clean.contains('pddpt')) return 'pddpt';
    if (clean.contains('bsb')) return 'bsb';
    if (clean.contains('1909') || clean.contains('valera')) return 'valera';
    return clean.isEmpty ? 'valera' : clean;
  }

  /// Whether the translation is consumed from API.Bible
  /// (Offline base translation is 'valera').
  static bool isApiBibleTranslation(String? translationId) {
    if (translationId == null || translationId.isEmpty) return false;
    final key = normalizeKey(translationId);
    // Explicit offline bundled translation
    if (key == 'valera') {
      return false;
    }
    // Catalog entries with API.Bible attribution
    final info = _catalog[key];
    if (info?.apiPlatformName == 'API.Bible') {
      return true;
    }
    // Known API.Bible versions
    const apiBibleKeys = ['nvi', 'nbla', 'bes', 'vbl', 'pddpt', 'bsb'];
    if (apiBibleKeys.contains(key)) {
      return true;
    }
    // API.Bible hash IDs (e.g. ce11b813f9a27e20-01)
    final raw = translationId.toLowerCase().trim();
    if (raw.contains('-01') || raw.contains('-02') || raw.length > 10) {
      return true;
    }
    return false;
  }

  /// Whether the translation is legally protected by copyright
  static bool isCopyrightProtected(String? translationId) {
    final key = normalizeKey(translationId);
    return _catalog[key]?.isCopyrightProtected ?? false;
  }

  /// Gets the complete copyright descriptor
  static ScriptureCopyrightInfo getCopyrightInfo(String? translationId) {
    final key = normalizeKey(translationId);
    return _catalog[key] ??
        ScriptureCopyrightInfo(
          translationId: key,
          abbreviation: key.toUpperCase(),
          fullName: key.toUpperCase(),
          year: '',
          organization: 'Titular de Derechos',
          isCopyrightProtected: true,
          standardCitation: 'Texto provisto conforme a los términos de API.Bible. Usado con permiso.',
          apiPlatformName: 'API.Bible',
          apiPlatformUrl: 'https://api.bible',
          licenseSummary: 'Traducción provista bajo licencia no comercial.',
        );
  }

  /// Validates reading volume according to Clause V.F (Bíblica, Inc.)
  static bool isReadingVolumeAllowed({
    required int requestedChapters,
    required int requestedVerses,
    String? translationId,
  }) {
    if (!isCopyrightProtected(translationId)) return true;

    // Up to 2 chapters allowed
    if (requestedChapters <= maxReadingVolumeChapters) return true;

    // Or up to 25 verses if spanning multiple chapters
    if (requestedVerses <= maxReadingVolumeVerses) return true;

    return false;
  }

  /// Prohibits audio format conversion for copyrighted scripture
  static bool canConvertToAudio(String? translationId) {
    return !isCopyrightProtected(translationId);
  }

  /// Validates if an offline cached entry has exceeded the 30-day limit
  static bool isCacheExpired(DateTime? cachedAt) {
    if (cachedAt == null) return true;
    final age = DateTime.now().difference(cachedAt);
    return age.inDays >= cacheTtlDays;
  }

  /// Sanitizes AI Mentor input (Clause III.B)
  /// If translation is protected, blocks passing raw verse strings to AI models
  static Map<String, dynamic> sanitizeAiMentorPayload({
    required String? verseReference,
    required String? verseText,
    String? translationId,
  }) {
    final isProtected = isCopyrightProtected(translationId);

    if (isProtected && verseText != null && verseText.trim().isNotEmpty) {
      return {
        'reference': verseReference ?? '',
        'text': null,
        'wasSanitized': true,
        'notice':
            'Texto protegido por derechos de autor omitido en el envío a la IA (Cláusula III.B). El análisis se generará usando la referencia canónica.',
      };
    }

    return {
      'reference': verseReference ?? '',
      'text': verseText,
      'wasSanitized': false,
    };
  }
}
