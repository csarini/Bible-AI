import { SermonNote } from '../types';

const SERMONS_STORAGE_KEY = 'biblia_inteligente_sermons_v1';
const ACTIVE_PULPIT_SERMON_KEY = 'biblia_inteligente_active_pulpit_sermon_id_v1';

export const INITIAL_SERMONS: SermonNote[] = [
  {
    id: 'sermon_001',
    scope: 'general',
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    title: 'La Fidelidad Inmutable de El-Shaddai en Tiempos de Incertidumbre',
    speaker: 'Pastor David Ben-David',
    mainScripture: 'Génesis 17:1-7 & Hebreos 6:13-20',
    theme: 'Pactos Eternos, Soberanía Divina y Fe Inconmovible',
    date: new Date().toISOString().split('T')[0],
    targetDurationMinutes: 40,
    points: [
      {
        id: 'p1',
        title: 'I. La Revelación de El-Shaddai: El Dios Suficiente (Gn 17:1-2)',
        notes:
          'A Abram a los noventa y nueve años, cuando todas las fuerzas naturales se habían agotado, Dios se revela como "El-Shaddai" (Dios Todopoderoso y Omnisuficiente). La orden es clara: "Anda delante de mí y sé perfecto". Nuestra suficiencia nunca descansa en recursos humanos, sino en el carácter inquebrantable de Dios.',
        scriptureRef: 'Génesis 17:1-2',
        passageText:
          'Era Abram de edad de noventa y nueve años, cuando le apareció Jehová y le dijo: Yo soy el Dios Todopoderoso; anda delante de mí y sé perfecto. Y pondré mi pacto entre mí y ti, y te multiplicaré en gran manera.',
      },
      {
        id: 'p2',
        title: 'II. El Cambio de Nombre y la Identidad del Reino (Gn 17:5)',
        notes:
          'De Abram (padre enaltecido) a Abraham (padre de multitudes). Dios redefine nuestra identidad a la luz de Su promesa y propósito eterno, no de nuestra limitación presente. Los pactos divinos transforman no solo nuestro destino, sino nuestra naturaleza diaria.',
        scriptureRef: 'Génesis 17:5',
        passageText:
          'Y no se llamará más tu nombre Abram, sino que será tu nombre Abraham, porque te he puesto por padre de muchedumbre de gentes.',
      },
      {
        id: 'p3',
        title: 'III. El Ancla Firme y Segura del Alma (Hebreos 6:17-19)',
        notes:
          'Por cuanto Dios no podía jurar por otro mayor, juró por Sí mismo. Tenemos dos cosas inmutables: la promesa y el juramento divino en el cual es imposible que Dios mienta. La esperanza cristiana no es un deseo vago; es un ancla echada en el Lugar Santísimo.',
        scriptureRef: 'Hebreos 6:18-19',
        passageText:
          'Para que por dos cosas inmutables, en las cuales es imposible que Dios mienta, tengamos un fortísimo consuelo los que hemos acudido para asirnos de la esperanza puesta delante de nosotros. La cual tenemos como segura y firme ancla del alma...',
      },
    ],
    conclusion:
      'Llamado al altar: Aquellos que hoy atraviesan valles de imposibilidad recuerden que el Dios de Abram sigue siendo El-Shaddai hoy. Entreguemos nuestras cargas y descansemos en Su fidelidad.',
  },
  {
    id: 'sermon_002',
    scope: 'sede',
    scopeTargetId: 'sede_norte',
    scopeName: 'Sede Norte - Campus Esperanza',
    title: 'Transformados por la Renovación del Entendimiento',
    speaker: 'Pastor Asociado Marcos Silva',
    mainScripture: 'Romanos 12:1-2',
    theme: 'Vida Cristiana Práctica, Consagración y Mente del Reino',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    targetDurationMinutes: 35,
    points: [
      {
        id: 's2_p1',
        title: 'I. El Sacrificio Vivo: Un Culto Racional (Rom 12:1)',
        notes:
          'Bajo el Antiguo Pacto, los sacrificios eran animales muertos sobre el altar. Bajo el Nuevo Pacto en Cristo Jesús, el sacrificio es una persona viva consagrada diariamente en santidad y gratitud.',
        scriptureRef: 'Romanos 12:1',
        passageText:
          'Así que, hermanos, os ruego por las misericordias de Dios, que presentéis vuestros cuerpos en sacrificio vivo, santo, agradable a Dios, que es vuestro culto racional.',
      },
      {
        id: 's2_p2',
        title: 'II. Rompiendo con el Molde de este Siglo (Rom 12:2a)',
        notes:
          'El mundo ejerce una presión constante para amoldar nuestros pensamientos, valores y prioridades a su estándar caído. La resistencia no es pasiva, sino una transformación activa mediante la Palabra viva.',
        scriptureRef: 'Romanos 12:2',
        passageText:
          'No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento...',
      },
      {
        id: 's2_p3',
        title: 'III. Comprobando la Voluntad de Dios (Rom 12:2b)',
        notes:
          'La voluntad de Dios no es un misterio inalcanzable: es buena, agradable y perfecta. Solo una mente lavada y renovada por las Escrituras puede discernirla con claridad en cada encrucijada de la vida.',
        scriptureRef: 'Romanos 12:2',
        passageText:
          '...para que comprobéis cuál sea la buena voluntad de Dios, agradable y perfecta.',
      },
    ],
    conclusion:
      'Llamado a la consagración: Renovemos hoy nuestra mente, renunciando a patrones de desánimo y cinismo, y abrazando la plenitud de la mente de Cristo.',
  },
  {
    id: 'sermon_003',
    title: 'Caminando sobre las Aguas: Superando la Tormenta con Fe',
    speaker: 'Pastor David Ben-David',
    mainScripture: 'Mateo 14:22-33',
    theme: 'Fe Audaz, Enfoque en Cristo y Victoria sobre el Temor',
    date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    targetDurationMinutes: 45,
    points: [
      {
        id: 's3_p1',
        title: 'I. La Orden en Medio de la Noche: "¡Ven!" (Mt 14:28-29)',
        notes:
          'Pedro no saltó por temeridad; pidió la palabra de Jesús: "Manda que yo vaya a ti sobre las aguas". La verdadera fe no es presunción humana; siempre se apoya en una palabra que sale de la boca del Maestro.',
        scriptureRef: 'Mateo 14:28-29',
        passageText:
          'Entonces le respondió Pedro, y dijo: Señor, si eres tú, manda que yo vaya a ti sobre las aguas. Y él dijo: Ven. Y descendiendo Pedro de la barca, andaba sobre las aguas para ir a Jesús.',
      },
      {
        id: 's3_p2',
        title: 'II. El Peligro del Enfoque Dividido (Mt 14:30)',
        notes:
          'Mientras Pedro miraba a Jesús, las leyes de la física quedaron subordinadas a la soberanía del Creador. Al mirar la fuerza del viento, el temor reemplazó a la fe y comenzó a hundirse.',
        scriptureRef: 'Mateo 14:30',
        passageText:
          'Pero al ver el fuerte viento, tuvo miedo; y comenzando a hundirse, dio voces, diciendo: ¡Señor, sálvame!',
      },
      {
        id: 's3_p3',
        title: 'III. La Mano Inmediata del Salvador (Mt 14:31)',
        notes:
          'Jesús no esperó a que Pedro se ahogara para darle una lección teórica. Inmediatamente extendió la mano y lo asió. Dios nunca rechaza el clamor sincero de auxilio.',
        scriptureRef: 'Mateo 14:31',
        passageText:
          'Al momento Jesús, extendiendo la mano, asió de él, y le dijo: ¡Hombre de poca fe! ¿Por qué dudaste?',
      },
    ],
    conclusion:
      'Oración por aquellos que sienten que se hunden bajo presiones familiares, económicas o emocionales. La mano de Cristo está extendida hoy.',
  },
];

export const sermonsService = {
  getSermons(): SermonNote[] {
    try {
      const raw = localStorage.getItem(SERMONS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(SERMONS_STORAGE_KEY, JSON.stringify(INITIAL_SERMONS));
        return INITIAL_SERMONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SERMONS;
    }
  },

  getSermonById(id: string): SermonNote | undefined {
    const list = this.getSermons();
    return list.find((s) => s.id === id);
  },

  saveSermon(sermon: SermonNote): SermonNote {
    const list = this.getSermons();
    const index = list.findIndex((s) => s.id === sermon.id);
    let updated: SermonNote[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = sermon;
    } else {
      updated = [sermon, ...list];
    }
    localStorage.setItem(SERMONS_STORAGE_KEY, JSON.stringify(updated));
    return sermon;
  },

  deleteSermon(id: string): boolean {
    const list = this.getSermons();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(SERMONS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  getActivePulpitSermonId(): string {
    return localStorage.getItem(ACTIVE_PULPIT_SERMON_KEY) || 'sermon_001';
  },

  setActivePulpitSermonId(id: string): void {
    localStorage.setItem(ACTIVE_PULPIT_SERMON_KEY, id);
  },

  getActivePulpitSermon(): SermonNote {
    const activeId = this.getActivePulpitSermonId();
    const found = this.getSermonById(activeId);
    return found || this.getSermons()[0] || INITIAL_SERMONS[0];
  },
};
