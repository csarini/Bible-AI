class BibleBookInfo {
  final int number;
  final String id;
  final String name;
  final int totalChapters;
  final bool isNewTestament;

  const BibleBookInfo({
    required this.number,
    required this.id,
    required this.name,
    required this.totalChapters,
    required this.isNewTestament,
  });

  /// Short abbreviation (e.g. 'Gén', 'Éxo', 'Mt', 'Jn')
  String get abbreviation => id;
}

const List<BibleBookInfo> kBibleBooks = [
  // Antiguo Testamento
  BibleBookInfo(number: 1, id: 'GEN', name: 'Génesis', totalChapters: 50, isNewTestament: false),
  BibleBookInfo(number: 2, id: 'EXO', name: 'Éxodo', totalChapters: 40, isNewTestament: false),
  BibleBookInfo(number: 3, id: 'LEV', name: 'Levítico', totalChapters: 27, isNewTestament: false),
  BibleBookInfo(number: 4, id: 'NUM', name: 'Números', totalChapters: 36, isNewTestament: false),
  BibleBookInfo(number: 5, id: 'DEU', name: 'Deuteronomio', totalChapters: 34, isNewTestament: false),
  BibleBookInfo(number: 6, id: 'JOS', name: 'Josué', totalChapters: 24, isNewTestament: false),
  BibleBookInfo(number: 7, id: 'JDG', name: 'Jueces', totalChapters: 21, isNewTestament: false),
  BibleBookInfo(number: 8, id: 'RUT', name: 'Rut', totalChapters: 4, isNewTestament: false),
  BibleBookInfo(number: 9, id: '1SA', name: '1 Samuel', totalChapters: 31, isNewTestament: false),
  BibleBookInfo(number: 10, id: '2SA', name: '2 Samuel', totalChapters: 24, isNewTestament: false),
  BibleBookInfo(number: 11, id: '1KI', name: '1 Reyes', totalChapters: 22, isNewTestament: false),
  BibleBookInfo(number: 12, id: '2KI', name: '2 Reyes', totalChapters: 25, isNewTestament: false),
  BibleBookInfo(number: 13, id: '1CH', name: '1 Crónicas', totalChapters: 29, isNewTestament: false),
  BibleBookInfo(number: 14, id: '2CH', name: '2 Crónicas', totalChapters: 36, isNewTestament: false),
  BibleBookInfo(number: 15, id: 'EZR', name: 'Esdras', totalChapters: 10, isNewTestament: false),
  BibleBookInfo(number: 16, id: 'NEH', name: 'Nehemías', totalChapters: 13, isNewTestament: false),
  BibleBookInfo(number: 17, id: 'EST', name: 'Ester', totalChapters: 10, isNewTestament: false),
  BibleBookInfo(number: 18, id: 'JOB', name: 'Job', totalChapters: 42, isNewTestament: false),
  BibleBookInfo(number: 19, id: 'PSA', name: 'Salmos', totalChapters: 150, isNewTestament: false),
  BibleBookInfo(number: 20, id: 'PRO', name: 'Proverbios', totalChapters: 31, isNewTestament: false),
  BibleBookInfo(number: 21, id: 'ECC', name: 'Eclesiastés', totalChapters: 12, isNewTestament: false),
  BibleBookInfo(number: 22, id: 'SNG', name: 'Cantares', totalChapters: 8, isNewTestament: false),
  BibleBookInfo(number: 23, id: 'ISA', name: 'Isaías', totalChapters: 66, isNewTestament: false),
  BibleBookInfo(number: 24, id: 'JER', name: 'Jeremías', totalChapters: 52, isNewTestament: false),
  BibleBookInfo(number: 25, id: 'LAM', name: 'Lamentaciones', totalChapters: 5, isNewTestament: false),
  BibleBookInfo(number: 26, id: 'EZK', name: 'Ezequiel', totalChapters: 48, isNewTestament: false),
  BibleBookInfo(number: 27, id: 'DAN', name: 'Daniel', totalChapters: 12, isNewTestament: false),
  BibleBookInfo(number: 28, id: 'HOS', name: 'Oseas', totalChapters: 14, isNewTestament: false),
  BibleBookInfo(number: 29, id: 'JOL', name: 'Joel', totalChapters: 3, isNewTestament: false),
  BibleBookInfo(number: 30, id: 'AMO', name: 'Amós', totalChapters: 9, isNewTestament: false),
  BibleBookInfo(number: 31, id: 'OBA', name: 'Abdías', totalChapters: 1, isNewTestament: false),
  BibleBookInfo(number: 32, id: 'JON', name: 'Jonás', totalChapters: 4, isNewTestament: false),
  BibleBookInfo(number: 33, id: 'MIC', name: 'Miqueas', totalChapters: 7, isNewTestament: false),
  BibleBookInfo(number: 34, id: 'NAM', name: 'Nahúm', totalChapters: 3, isNewTestament: false),
  BibleBookInfo(number: 35, id: 'HAB', name: 'Habacuc', totalChapters: 3, isNewTestament: false),
  BibleBookInfo(number: 36, id: 'ZEP', name: 'Sofonías', totalChapters: 3, isNewTestament: false),
  BibleBookInfo(number: 37, id: 'HAG', name: 'Hageo', totalChapters: 2, isNewTestament: false),
  BibleBookInfo(number: 38, id: 'ZEC', name: 'Zacarías', totalChapters: 14, isNewTestament: false),
  BibleBookInfo(number: 39, id: 'MAL', name: 'Malaquías', totalChapters: 4, isNewTestament: false),

  // Nuevo Testamento
  BibleBookInfo(number: 40, id: 'MAT', name: 'San Mateo', totalChapters: 28, isNewTestament: true),
  BibleBookInfo(number: 41, id: 'MRK', name: 'San Marcos', totalChapters: 16, isNewTestament: true),
  BibleBookInfo(number: 42, id: 'LUK', name: 'San Lucas', totalChapters: 24, isNewTestament: true),
  BibleBookInfo(number: 43, id: 'JHN', name: 'San Juan', totalChapters: 21, isNewTestament: true),
  BibleBookInfo(number: 44, id: 'ACT', name: 'Hechos', totalChapters: 28, isNewTestament: true),
  BibleBookInfo(number: 45, id: 'ROM', name: 'Romanos', totalChapters: 16, isNewTestament: true),
  BibleBookInfo(number: 46, id: '1CO', name: '1 Corintios', totalChapters: 16, isNewTestament: true),
  BibleBookInfo(number: 47, id: '2CO', name: '2 Corintios', totalChapters: 13, isNewTestament: true),
  BibleBookInfo(number: 48, id: 'GAL', name: 'Gálatas', totalChapters: 6, isNewTestament: true),
  BibleBookInfo(number: 49, id: 'EPH', name: 'Efesios', totalChapters: 6, isNewTestament: true),
  BibleBookInfo(number: 50, id: 'PHP', name: 'Filipenses', totalChapters: 4, isNewTestament: true),
  BibleBookInfo(number: 51, id: 'COL', name: 'Colosenses', totalChapters: 4, isNewTestament: true),
  BibleBookInfo(number: 52, id: '1TH', name: '1 Tesalonicenses', totalChapters: 5, isNewTestament: true),
  BibleBookInfo(number: 53, id: '2TH', name: '2 Tesalonicenses', totalChapters: 3, isNewTestament: true),
  BibleBookInfo(number: 54, id: '1TI', name: '1 Timoteo', totalChapters: 6, isNewTestament: true),
  BibleBookInfo(number: 55, id: '2TI', name: '2 Timoteo', totalChapters: 4, isNewTestament: true),
  BibleBookInfo(number: 56, id: 'TIT', name: 'Tito', totalChapters: 3, isNewTestament: true),
  BibleBookInfo(number: 57, id: 'PHM', name: 'Filemón', totalChapters: 1, isNewTestament: true),
  BibleBookInfo(number: 58, id: 'HEB', name: 'Hebreos', totalChapters: 13, isNewTestament: true),
  BibleBookInfo(number: 59, id: 'JAS', name: 'Santiago', totalChapters: 5, isNewTestament: true),
  BibleBookInfo(number: 60, id: '1PE', name: '1 Pedro', totalChapters: 5, isNewTestament: true),
  BibleBookInfo(number: 61, id: '2PE', name: '2 Pedro', totalChapters: 3, isNewTestament: true),
  BibleBookInfo(number: 62, id: '1JN', name: '1 Juan', totalChapters: 5, isNewTestament: true),
  BibleBookInfo(number: 63, id: '2JN', name: '2 Juan', totalChapters: 1, isNewTestament: true),
  BibleBookInfo(number: 64, id: '3JN', name: '3 Juan', totalChapters: 1, isNewTestament: true),
  BibleBookInfo(number: 65, id: 'JUD', name: 'Judas', totalChapters: 1, isNewTestament: true),
  BibleBookInfo(number: 66, id: 'REV', name: 'Apocalipsis', totalChapters: 22, isNewTestament: true),
];
