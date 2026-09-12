/// Model representing a Bible translation in both offline and online modes.
class BibleTranslationConfig {
  final String id;
  final String abbreviation;
  final String name;
  final String subtitle;
  final String badge;
  final bool isOffline;
  final String? bibleId; // API.Bible ID if source is online

  const BibleTranslationConfig({
    required this.id,
    required this.abbreviation,
    required this.name,
    required this.subtitle,
    required this.badge,
    required this.isOffline,
    this.bibleId,
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
      badge: 'Base Offline',
      isOffline: true,
    ),
    BibleTranslationConfig(
      id: 'nvi',
      abbreviation: 'nvi',
      name: 'Nueva Versión Internacional (NVI)',
      subtitle: 'Traducción contemporánea de gran difusión — Biblica',
      badge: 'API.Bible / NVI',
      isOffline: false,
      bibleId: 'nvi',
    ),
    BibleTranslationConfig(
      id: 'nbla',
      abbreviation: 'nbla',
      name: 'Nueva Biblia de las Américas (NBLA)',
      subtitle: 'Traducción fiel y contemporánea en español latinoamericano',
      badge: 'API.Bible / NBLA',
      isOffline: false,
      bibleId: 'ce11b813f9a27e20-01',
    ),
    BibleTranslationConfig(
      id: 'bes',
      abbreviation: 'bes',
      name: 'La Biblia en Español Sencillo (BES)',
      subtitle: 'Lenguaje claro, directo y accesible para todos',
      badge: 'API.Bible / BES',
      isOffline: false,
      bibleId: 'b32b9d1b64b4ef29-01',
    ),
    BibleTranslationConfig(
      id: 'vbl',
      abbreviation: 'vbl',
      name: 'Versión Biblia Libre (VBL)',
      subtitle: 'Traducción contemporánea protestante abierta (AT y NT)',
      badge: 'API.Bible / VBL',
      isOffline: false,
      bibleId: '482ddd53705278cc-02',
    ),
    BibleTranslationConfig(
      id: 'pddpt',
      abbreviation: 'pddpt',
      name: 'Palabra de Dios para ti (PdDpt)',
      subtitle: 'Traducción hispana contemporánea completa',
      badge: 'API.Bible / PdDpt',
      isOffline: false,
      bibleId: '48acedcf8595c754-01',
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
    final clean = translationKey.toLowerCase().trim();
    return clean == 'valera' || clean.contains('1909');
  }
}
