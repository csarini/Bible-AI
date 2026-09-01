import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class DailyVerseData {
  final String id;
  final String bookId;
  final String bookName;
  final int chapter;
  final int verse;
  final String reference;
  final String text;
  final String theme;
  final String prayer;
  final IconData icon;

  const DailyVerseData({
    required this.id,
    required this.bookId,
    required this.bookName,
    required this.chapter,
    required this.verse,
    required this.reference,
    required this.text,
    required this.theme,
    required this.prayer,
    required this.icon,
  });
}

const List<DailyVerseData> kDailyVersesPool = [
  DailyVerseData(
    id: 'php-4-6',
    bookId: 'PHP',
    bookName: 'Filipenses',
    chapter: 4,
    verse: 6,
    reference: 'Filipenses 4:6-7',
    text:
        'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
    theme: 'Paz',
    prayer:
        'Señor Jesús, hoy rindo ante Tu presencia cada preocupación e incertidumbre. Llena mi corazón de Tu paz perfecta que sobrepasa todo entendimiento humano. Amén.',
    icon: LucideIcons.heart,
  ),
  DailyVerseData(
    id: 'jer-29-11',
    bookId: 'JER',
    bookName: 'Jeremías',
    chapter: 29,
    verse: 11,
    reference: 'Jeremías 29:11',
    text:
        'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    theme: 'Esperanza',
    prayer:
        'Padre Celestial, renuevo hoy mi confianza en Tus promesas eternas. Guíame a caminar con gozo y firmeza, sabiendo que mi futuro está seguro en Tus manos. Amén.',
    icon: LucideIcons.sun,
  ),
  DailyVerseData(
    id: 'isa-40-31',
    bookId: 'ISA',
    bookName: 'Isaías',
    chapter: 40,
    verse: 31,
    reference: 'Isaías 40:29-31',
    text:
        'Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas... los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.',
    theme: 'Fortaleza',
    prayer:
        'Amado Dios, cuando mis fuerzas decaigan, recuérdame que Tu poder se perfecciona en mi debilidad. Levanto mis ojos a Ti y recibo nuevo vigor hoy. Amén.',
    icon: LucideIcons.shield,
  ),
  DailyVerseData(
    id: '1co-13-4',
    bookId: '1CO',
    bookName: '1 Corintios',
    chapter: 13,
    verse: 4,
    reference: '1 Corintios 13:4-7',
    text:
        'El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece; no hace nada indebido, no busca lo suyo, no se irrita, no guarda rencor.',
    theme: 'Amor',
    prayer:
        'Señor, derrama Tu amor en mi corazón para que pueda perdonar, servir y edificar a quienes me rodean, siendo un instrumento genuino de Tu gracia. Amén.',
    icon: LucideIcons.sparkles,
  ),
  DailyVerseData(
    id: 'jas-1-5',
    bookId: 'JAS',
    bookName: 'Santiago',
    chapter: 1,
    verse: 5,
    reference: 'Santiago 1:5',
    text:
        'Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.',
    theme: 'Sabiduría',
    prayer:
        'Dios todopoderoso, concédeme discernimiento y sabiduría del cielo para tomar cada decisión conforme a Tu santa voluntad en este día. Amén.',
    icon: LucideIcons.bookOpen,
  ),
  DailyVerseData(
    id: 'psa-119-105',
    bookId: 'PSA',
    bookName: 'Salmos',
    chapter: 119,
    verse: 105,
    reference: 'Salmos 119:105',
    text:
        'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
    theme: 'Guía',
    prayer:
        'Señor, guía cada uno de mis pasos en este día con la luz viva y eterna de tus Santas Escrituras. Amén.',
    icon: LucideIcons.compass,
  ),
  DailyVerseData(
    id: 'isa-41-10',
    bookId: 'ISA',
    bookName: 'Isaías',
    chapter: 41,
    verse: 10,
    reference: 'Isaías 41:10',
    text:
        'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.',
    theme: 'Protección',
    prayer:
        'Padre amado, gracias por sostenerme firmemente con Tu diestra justa y librarme de todo temor. Amén.',
    icon: LucideIcons.shieldAlert,
  ),
  DailyVerseData(
    id: 'php-4-13',
    bookId: 'PHP',
    bookName: 'Filipenses',
    chapter: 4,
    verse: 13,
    reference: 'Filipenses 4:13',
    text: 'Todo lo puedo en Cristo que me fortalece.',
    theme: 'Victoria',
    prayer:
        'Jesús amado, deposito todas mis debilidades en Tus manos y confío plenamente en Tu poder soberano. Amén.',
    icon: LucideIcons.trophy,
  ),
  DailyVerseData(
    id: 'pro-3-5',
    bookId: 'PRO',
    bookName: 'Proverbios',
    chapter: 3,
    verse: 5,
    reference: 'Proverbios 3:5-6',
    text:
        'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
    theme: 'Confianza',
    prayer:
        'Dios misericordioso, entrego mis anhelos e incertidumbres a Tu soberana sabiduría y dirección. Amén.',
    icon: LucideIcons.anchor,
  ),
  DailyVerseData(
    id: 'rom-8-28',
    bookId: 'ROM',
    bookName: 'Romanos',
    chapter: 8,
    verse: 28,
    reference: 'Romanos 8:28',
    text:
        'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
    theme: 'Propósito',
    prayer:
        'Padre bueno, descanso en la certeza de que obras todas las cosas para mi bienestar y Tu gloria. Amén.',
    icon: LucideIcons.flame,
  ),
  DailyVerseData(
    id: 'jhn-14-27',
    bookId: 'JHN',
    bookName: 'San Juan',
    chapter: 14,
    verse: 27,
    reference: 'Juan 14:27',
    text:
        'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
    theme: 'Paz',
    prayer:
        'Príncipe de Paz, llena mi mente y espíritu con la serenidad celestial que solo Tú puedes otorgar. Amén.',
    icon: LucideIcons.heart,
  ),
  DailyVerseData(
    id: 'psa-23-1',
    bookId: 'PSA',
    bookName: 'Salmos',
    chapter: 23,
    verse: 1,
    reference: 'Salmos 23:1-3',
    text:
        'Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará. Confortará mi alma.',
    theme: 'Protección',
    prayer:
        'Señor Jesús, gracias por ser mi pastor fiel. En Ti confío, en Ti encuentro refrigerio y reposo. Amén.',
    icon: LucideIcons.shield,
  ),
  DailyVerseData(
    id: 'jos-1-9',
    bookId: 'JOS',
    bookName: 'Josué',
    chapter: 1,
    verse: 9,
    reference: 'Josué 1:9',
    text:
        'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
    theme: 'Fortaleza',
    prayer:
        'Señor, revísteme de valor y fortaleza espiritual para glorificarte en cada paso que dé hoy. Amén.',
    icon: LucideIcons.shield,
  ),
  DailyVerseData(
    id: 'mat-11-28',
    bookId: 'MAT',
    bookName: 'San Mateo',
    chapter: 11,
    verse: 28,
    reference: 'Mateo 11:28',
    text:
        'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
    theme: 'Gracia',
    prayer:
        'Señor Jesús, entrego todo afán y cansancio a Tus pies y recibo Tu dulce descanso. Amén.',
    icon: LucideIcons.feather,
  ),
  DailyVerseData(
    id: 'psa-46-1',
    bookId: 'PSA',
    bookName: 'Salmos',
    chapter: 46,
    verse: 1,
    reference: 'Salmos 46:1',
    text:
        'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.',
    theme: 'Refugio',
    prayer:
        'Señor Dios todopoderoso, me refugio bajo la sombra de Tus alas y confío en Tu auxilio oportuno. Amén.',
    icon: LucideIcons.shield,
  ),
  DailyVerseData(
    id: 'jhn-3-16',
    bookId: 'JHN',
    bookName: 'San Juan',
    chapter: 3,
    verse: 16,
    reference: 'Juan 3:16',
    text:
        'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
    theme: 'Salvación',
    prayer:
        'Padre celestial, gracias por Tu infinito amor manifestado en Cristo Jesús, mi Salvador y Señor. Amén.',
    icon: LucideIcons.sparkles,
  ),
];

DailyVerseData getRandomDailyVerse({String? themeFilter, String? excludeId}) {
  final random = Random();
  List<DailyVerseData> pool = kDailyVersesPool;

  if (themeFilter != null && themeFilter != 'Todos') {
    final filtered = pool
        .where((v) => v.theme.toLowerCase() == themeFilter.toLowerCase())
        .toList();
    if (filtered.isNotEmpty) {
      pool = filtered;
    }
  }

  if (excludeId != null && pool.length > 1) {
    final withoutExcluded = pool.where((v) => v.id != excludeId).toList();
    if (withoutExcluded.isNotEmpty) {
      pool = withoutExcluded;
    }
  }

  return pool[random.nextInt(pool.length)];
}
