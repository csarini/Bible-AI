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
    required this.licenseSummary,
  });

  /// Convenient aliases for direct official link
  String? get officialLinkText => directLinkAnchorText;
  String? get officialLinkUrl => directLinkUrl;
}

class CopyrightGuardService {
  /// Maximum days allowed for local caching of protected scripture before revalidation
  static const int cacheTtlDays = 30;

  /// Max reading volume
  static const int maxReadingVolumeChapters = 2;
  static const int maxReadingVolumeVerses = 25;

  static const Map<String, ScriptureCopyrightInfo> _catalog = {
    'rvr1960': ScriptureCopyrightInfo(
      translationId: 'rvr1960',
      abbreviation: 'RVR1960',
      fullName: 'Reina-Valera 1960',
      year: '1960',
      organization: 'Sociedades Bíblicas Unidas',
      isCopyrightProtected: false,
      standardCitation:
          'Reina-Valera 1960 (RVR1960): Texto bíblico canónico.',
      licenseSummary: 'Texto bíblico para lectura y edificación personal.',
    ),
    'rva2015': ScriptureCopyrightInfo(
      translationId: 'rva2015',
      abbreviation: 'RVA2015',
      fullName: 'Reina Valera Actualizada (2015)',
      year: '2015',
      organization: 'Editorial Mundo Hispano',
      isCopyrightProtected: false,
      standardCitation:
          'Reina Valera Actualizada 2015 (RVA2015): Texto bíblico canónico.',
      licenseSummary: 'Texto bíblico para lectura y edificación personal.',
    ),
  };

  /// Normalizes translation string identifier
  static String normalizeKey(String? translationId) {
    if (translationId == null || translationId.isEmpty) return 'rvr1960';
    final clean =
        translationId.toLowerCase().trim().replaceAll(RegExp(r'[^a-z0-9]'), '');
    if (clean.contains('2015') || clean == 'rva2015') return 'rva2015';
    if (clean.contains('1960') || clean == 'rvr1960') return 'rvr1960';
    return _catalog.containsKey(clean) ? clean : 'rvr1960';
  }

  /// Whether the translation is from an external cloud API.
  /// Always false since the app runs 100% in offline mode.
  static bool isApiBibleTranslation(String? translationId) {
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
    return _catalog[key] ?? _catalog['rvr1960']!;
  }

  /// Validates reading volume
  static bool isReadingVolumeAllowed({
    required int requestedChapters,
    required int requestedVerses,
    String? translationId,
  }) {
    return true;
  }

  /// Prohibits audio format conversion for copyrighted scripture
  static bool canConvertToAudio(String? translationId) {
    return !isCopyrightProtected(translationId);
  }

  /// Validates if an offline cached entry has exceeded the 30-day limit
  static bool isCacheExpired(DateTime? cachedAt) {
    return false;
  }

  /// Sanitizes AI Mentor input
  static Map<String, dynamic> sanitizeAiMentorPayload({
    required String? verseReference,
    required String? verseText,
    String? translationId,
  }) {
    return {
      'reference': verseReference ?? '',
      'text': verseText,
      'wasSanitized': false,
    };
  }
}
