import { BibleBook, BibleVerse, DailyVerse } from '../types';
import {
  getLocalBooksSync,
  getBooksFromDB,
  fetchChapterVerses,
  getBookByIdOrNumber,
  StoredBibleBook
} from '../services/bibleDatabaseService';

// Default books list (Reina Valera 1909) read from the JSON schema
export const BIBLE_BOOKS: BibleBook[] = getLocalBooksSync('valera');

// Dynamic query to get books for any translation from local DB or synchronous memory cache
export function getBibleBooks(translation: string = 'valera'): BibleBook[] {
  return getLocalBooksSync(translation);
}

export async function fetchBibleBooksAsync(translation: string = 'valera'): Promise<BibleBook[]> {
  return await getBooksFromDB(translation);
}

// Daily Verses for Widget & Home
export const DAILY_VERSES: DailyVerse[] = [
  {
    id: 'psa-119-105',
    reference: 'Salmos 119:105',
    book: 'Salmos',
    bookId: 'PSA',
    chapter: 119,
    verse: 105,
    text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
    theme: 'Guía',
    reflection: 'La Palabra de Dios no siempre ilumina todo el sendero de una vez, sino el siguiente paso necesario para caminar con fe.',
    prayer: 'Señor, guía cada uno de mis pasos en este día con la luz viva de tus Escrituras. Amén.'
  },
  {
    id: 'isa-41-10',
    reference: 'Isaías 41:10',
    book: 'Isaías',
    bookId: 'ISA',
    chapter: 41,
    verse: 10,
    text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.',
    theme: 'Fortaleza',
    reflection: 'En momentos de incertidumbre, su presencia constante disipa el temor y renueva nuestras fuerzas.',
    prayer: 'Padre celestial, gracias por sostener mi vida en tu diestra victoriosa y llenarme de paz. Amén.'
  },
  {
    id: 'php-4-13',
    reference: 'Filipenses 4:13',
    book: 'Filipenses',
    bookId: 'PHP',
    chapter: 4,
    verse: 13,
    text: 'Todo lo puedo en Cristo que me fortalece.',
    theme: 'Victoria',
    reflection: 'Nuestra capacidad no proviene de recursos propios, sino de la gracia infinita que habita en nosotros.',
    prayer: 'Jesús amado, deposito mis debilidades en tus manos y confío en tu fortaleza inagotable. Amén.'
  },
  {
    id: 'pro-3-5',
    reference: 'Proverbios 3:5',
    book: 'Proverbios',
    bookId: 'PRO',
    chapter: 3,
    verse: 5,
    text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.',
    theme: 'Confianza',
    reflection: 'Entregar nuestros planes a Dios nos libra de la ansiedad de intentar controlarlo todo.',
    prayer: 'Dios misericordioso, entrego mis anhelos e incertidumbres a tu sabia soberanía. Amén.'
  },
  {
    id: 'rom-8-28',
    reference: 'Romanos 8:28',
    book: 'Romanos',
    bookId: 'ROM',
    chapter: 8,
    verse: 28,
    text: 'Y sabemos que a los que a Dios aman, todas las cosas les ayudan a bien, es a saber, a los que conforme al propósito son llamados.',
    theme: 'Esperanza',
    reflection: 'Incluso los momentos difíciles están entretejidos en el perfecto propósito de bendición para nuestras vidas.',
    prayer: 'Padre bueno, descanso en la promesa de que obras todas las cosas para mi bienestar eterno. Amén.'
  },
  {
    id: 'jhn-14-27',
    reference: 'Juan 14:27',
    book: 'Juan',
    bookId: 'JHN',
    chapter: 14,
    verse: 27,
    text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
    theme: 'Paz',
    reflection: 'La paz de Cristo no depende de las circunstancias externas, sino de la certeza de su amor inmutable.',
    prayer: 'Príncipe de Paz, llena mi mente y mi espíritu con la calma que solo tú puedes dar. Amén.'
  }
];

// Fetch chapter verses: Queries IndexedDB local first, then GetBible, caching result in local DB
export async function fetchBibleChapter(
  bookId: string,
  chapter: number,
  translation: string = 'valera'
): Promise<BibleVerse[]> {
  return await fetchChapterVerses(bookId, chapter, translation);
}
