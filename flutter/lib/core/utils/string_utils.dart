/// Normalizes user-entered search text for accent-insensitive comparisons.
String normalizeSearchText(String input) {
  return input
      .toLowerCase()
      .replaceAllMapped(_accentPattern, (match) => _accentMap[match.group(0)]!)
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

final RegExp _accentPattern = RegExp('[áàäâãåéèëêíìïîóòöôõúùüûñç]');

const Map<String, String> _accentMap = {
  'á': 'a',
  'à': 'a',
  'ä': 'a',
  'â': 'a',
  'ã': 'a',
  'å': 'a',
  'é': 'e',
  'è': 'e',
  'ë': 'e',
  'ê': 'e',
  'í': 'i',
  'ì': 'i',
  'ï': 'i',
  'î': 'i',
  'ó': 'o',
  'ò': 'o',
  'ö': 'o',
  'ô': 'o',
  'õ': 'o',
  'ú': 'u',
  'ù': 'u',
  'ü': 'u',
  'û': 'u',
  'ñ': 'n',
  'ç': 'c',
};
