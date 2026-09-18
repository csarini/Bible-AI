/// Model representing a Bible translation in offline mode.
class BibleTranslationConfig {
  final String id;
  final String abbreviation;
  final String name;
  final String subtitle;
  final String badge;
  final bool isOffline;

  const BibleTranslationConfig({
    required this.id,
    required this.abbreviation,
    required this.name,
    required this.subtitle,
    required this.badge,
    required this.isOffline,
  });
}

/// Official catalog of translations available in Biblia Inteligente
class BibleTranslationsCatalog {
  static const List<BibleTranslationConfig> allTranslations = [
    BibleTranslationConfig(
      id: 'rvr1960',
      abbreviation: 'rvr1960',
      name: 'Biblia Reina Valera 1960',
      subtitle: 'Reina-Valera 1960 con números de Strong',
      badge: '100% Offline',
      isOffline: true,
    ),
    BibleTranslationConfig(
      id: 'rva2015',
      abbreviation: 'rva2015',
      name: 'Reina Valera Actualizada (2015)',
      subtitle: 'Reina-Valera 2015 con números de Strong',
      badge: '100% Offline',
      isOffline: true,
    ),
  ];

  static BibleTranslationConfig findById(String id) {
    final clean = id.toLowerCase().trim();
    return allTranslations.firstWhere(
      (t) => t.id == clean || t.abbreviation.toLowerCase() == clean,
      orElse: () => allTranslations.first,
    );
  }

  static bool isBuiltInOffline(String translationKey) {
    return true;
  }
}
