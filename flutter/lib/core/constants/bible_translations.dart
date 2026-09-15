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
      id: 'valera',
      abbreviation: 'valera',
      name: 'Reina-Valera 1909 (RVR1909)',
      subtitle: 'Texto canónico en español clásico protestante',
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
