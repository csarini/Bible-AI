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

// Rich curated pool of foundational biblical promises across different themes for immediate sync rendering
const THEMATIC_VERSES_POOL: DailyVerse[] = [
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
    prayer: 'Señor, guía cada uno de mis pasos en este día con la luz viva de tus Escrituras. Amén.',
    tags: ['guía', 'sabiduría', 'camino']
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
    prayer: 'Padre celestial, gracias por sostener mi vida en tu diestra victoriosa y llenarme de paz. Amén.',
    tags: ['fortaleza', 'paz', 'protección']
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
    prayer: 'Jesús amado, deposito mis debilidades en tus manos y confío en tu fortaleza inagotable. Amén.',
    tags: ['fortaleza', 'victoria', 'esperanza']
  },
  {
    id: 'pro-3-5',
    reference: 'Proverbios 3:5',
    book: 'Proverbios',
    bookId: 'PRO',
    chapter: 3,
    verse: 5,
    text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.',
    theme: 'Sabiduría',
    reflection: 'Entregar nuestros planes a Dios nos libra de la ansiedad de intentar controlarlo todo.',
    prayer: 'Dios misericordioso, entrego mis anhelos e incertidumbres a tu sabia soberanía. Amén.',
    tags: ['sabiduría', 'confianza', 'guía']
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
    prayer: 'Padre bueno, descanso en la promesa de que obras todas las cosas para mi bienestar eterno. Amén.',
    tags: ['esperanza', 'propósito', 'amor']
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
    prayer: 'Príncipe de Paz, llena mi mente y mi espíritu con la calma que solo tú puedes dar. Amén.',
    tags: ['paz', 'consuelo', 'protección']
  },
  {
    id: 'psa-23-1',
    reference: 'Salmos 23:1',
    book: 'Salmos',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    text: 'Jehová es mi pastor; nada me faltará.',
    theme: 'Protección',
    reflection: 'Bajo el cuidado del Buen Pastor tenemos provisión plena, reposo verdadero y dirección segura.',
    prayer: 'Señor Jesús, gracias por ser mi pastor fiel. En ti confío y reposo hoy. Amén.',
    tags: ['protección', 'paz', 'confianza']
  },
  {
    id: 'jer-29-11',
    reference: 'Jeremías 29:11',
    book: 'Jeremías',
    bookId: 'JER',
    chapter: 29,
    verse: 11,
    text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    theme: 'Esperanza',
    reflection: 'El futuro no está a merced del azar, sino en las manos amorosas y soberanas de Dios.',
    prayer: 'Padre celestial, pongo mi porvenir en tus manos, confiando en tus planes de bendición y paz. Amén.',
    tags: ['esperanza', 'paz', 'propósito']
  },
  {
    id: 'jos-1-9',
    reference: 'Josué 1:9',
    book: 'Josué',
    bookId: 'JOS',
    chapter: 1,
    verse: 9,
    text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
    theme: 'Fortaleza',
    reflection: 'El valor cristiano no es ausencia de temor, sino la convicción firme de que Dios camina a nuestro lado.',
    prayer: 'Señor, dame valentía y firmeza de espíritu para enfrentar cada desafío de este día. Amén.',
    tags: ['fortaleza', 'protección', 'victoria']
  },
  {
    id: 'mat-11-28',
    reference: 'Mateo 11:28',
    book: 'Mateo',
    bookId: 'MAT',
    chapter: 11,
    verse: 28,
    text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
    theme: 'Paz',
    reflection: 'Cristo nos invita a entregar nuestras cargas pesadas y recibir el reposo que nuestra alma necesita.',
    prayer: 'Señor Jesús, descanso en tu presencia y entrego todo afán a tu inagotable misericordia. Amén.',
    tags: ['paz', 'amor', 'consuelo']
  },
  {
    id: '1co-13-13',
    reference: '1 Corintios 13:13',
    book: '1 Corintios',
    bookId: '1CO',
    chapter: 13,
    verse: 13,
    text: 'Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor.',
    theme: 'Amor',
    reflection: 'El amor de Dios en nuestros corazones es la fuerza suprema que da sentido a toda nuestra vida.',
    prayer: 'Padre Dios, enséñame a amar a mi prójimo con la misma gracia y paciencia con que tú me has amado. Amén.',
    tags: ['amor', 'fe', 'esperanza']
  },
  {
    id: 'isa-40-31',
    reference: 'Isaías 40:31',
    book: 'Isaías',
    bookId: 'ISA',
    chapter: 40,
    verse: 31,
    text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
    theme: 'Fortaleza',
    reflection: 'Esperar en Dios renueva nuestra energía interior cuando las fuerzas humanas se agotan.',
    prayer: 'Dios de poder, renueva hoy mis fuerzas físicas y espirituales para remontar vuelo en tu gracia. Amén.',
    tags: ['fortaleza', 'esperanza', 'paz']
  },
  {
    id: 'psa-46-1',
    reference: 'Salmos 46:1',
    book: 'Salmos',
    bookId: 'PSA',
    chapter: 46,
    verse: 1,
    text: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.',
    theme: 'Protección',
    reflection: 'En medio de las tormentas de la vida, Dios es nuestro refugio inamovible y auxilio oportuno.',
    prayer: 'Señor Dios todopoderoso, me refugio en tus alas y confío en tu protección eterna. Amén.',
    tags: ['protección', 'fortaleza', 'paz']
  },
  {
    id: 'jam-1-5',
    reference: 'Santiago 1:5',
    book: 'Santiago',
    bookId: 'JAS',
    chapter: 1,
    verse: 5,
    text: 'Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.',
    theme: 'Sabiduría',
    reflection: 'Dios responde con generosidad a quien busca sinceramente su dirección para tomar decisiones justas.',
    prayer: 'Dios sabio y bueno, concédeme discernimiento y entendimiento para actuar conforme a tu voluntad. Amén.',
    tags: ['sabiduría', 'guía', 'confianza']
  }
];

// Synchronous random daily verse retrieval
export function getRandomDailyVerseSync(topic?: string, excludeId?: string): DailyVerse {
  let pool = THEMATIC_VERSES_POOL;

  if (topic && topic !== 'all') {
    const topicNorm = topic.toLowerCase();
    const filtered = pool.filter(
      (v) =>
        v.theme.toLowerCase().includes(topicNorm) ||
        v.tags?.some((t) => t.toLowerCase().includes(topicNorm))
    );
    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  if (excludeId && pool.length > 1) {
    const withoutExcluded = pool.filter((v) => v.id !== excludeId);
    if (withoutExcluded.length > 0) {
      pool = withoutExcluded;
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || THEMATIC_VERSES_POOL[0];
}

// Random scripture lookup from the Bible database / GetBible API
export async function getRandomDailyVerse(
  translation: string = 'valera',
  topic?: string,
  excludeId?: string
): Promise<DailyVerse> {
  // If a specific topic is selected, prefer the rich thematic pool
  if (topic && topic !== 'all') {
    return getRandomDailyVerseSync(topic, excludeId);
  }

  // 50% of the time, or when purely randomized, pick an inspiring verse dynamically from the Bible
  try {
    const books = getBibleBooks(translation);
    if (books && books.length > 0) {
      // Pick a random book
      const randomBook = books[Math.floor(Math.random() * books.length)];
      const totalCaps = randomBook.chaptersCount || 1;
      const randomChapter = Math.floor(Math.random() * totalCaps) + 1;

      // Fetch chapter verses
      const verses = await fetchBibleChapter(randomBook.id, randomChapter, translation);
      if (verses && verses.length > 0) {
        const randomVerseObj = verses[Math.floor(Math.random() * verses.length)];
        const ref = `${randomBook.name} ${randomChapter}:${randomVerseObj.verse}`;
        const newId = `${randomBook.id.toLowerCase()}-${randomChapter}-${randomVerseObj.verse}`;

        if (!excludeId || newId !== excludeId) {
          const themeMap: Record<string, string> = {
            Pentateuco: 'Pacto',
            Históricos: 'Fidelidad',
            Poéticos: 'Alabanza',
            'Profetas Mayores': 'Esperanza',
            'Profetas Menores': 'Justicia',
            Evangelios: 'Gracia',
            Historia: 'Misión',
            'Epístolas Paulinas': 'Fe',
            'Epístolas Generales': 'Perseverancia',
            Profecía: 'Victoria'
          };
          const theme = themeMap[randomBook.category || ''] || 'Inspiración';

          return {
            id: newId,
            reference: ref,
            book: randomBook.name,
            bookId: randomBook.id,
            chapter: randomChapter,
            verse: randomVerseObj.verse,
            text: randomVerseObj.text,
            theme,
            reflection: `Medita en las palabras de ${randomBook.name} ${randomChapter}:${randomVerseObj.verse} y cómo iluminan tu andar hoy con gracia y verdad.`,
            prayer: `Señor, permite que la verdad de ${randomBook.name} habite abundantemente en mi corazón en este día. Amén.`,
            tags: [theme.toLowerCase(), randomBook.category?.toLowerCase() || 'biblia']
          };
        }
      }
    }
  } catch (err) {
    console.warn('Fallback a versículo aleatorio temático:', err);
  }

  return getRandomDailyVerseSync(topic, excludeId);
}

// Fetch chapter verses: Queries local IndexedDB offline storage directly
export async function fetchBibleChapter(
  bookId: string,
  chapter: number,
  translation: string = 'valera',
  onNotification?: (msg: string) => void
): Promise<BibleVerse[]> {
  return await fetchChapterVerses(bookId, chapter, translation, onNotification);
}

export async function fetchBibleChapterWithFallback(
  bookId: string,
  chapter: number,
  translation: string = 'valera',
  onNotification?: (msg: string) => void
) {
  const { fetchChapterVersesWithFallback } = await import('../services/bibleDatabaseService');
  return await fetchChapterVersesWithFallback(bookId, chapter, translation, onNotification);
}
