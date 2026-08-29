import { BiblicalItinerary, MapWaypoint } from '../types';

export const BIBLICAL_ITINERARIES: BiblicalItinerary[] = [
  {
    id: 'pablo-2',
    title: 'Segundo Viaje Misionero de Pablo',
    subtitle: 'El Evangelio entra en Europa: De Asia Menor a Grecia',
    period: 'Hechos y Epístolas',
    approxDate: '49 – 52 d.C.',
    totalDistanceKm: 4500,
    themeColor: '#F25C05',
    badge: 'Europa & Grecia',
    description: 'Pablo y Silas viajan por Galacia, reciben la visión del varón macedonio en Troas y plantan iglesias clave en Filipos, Tesalónica, Berea, Atenas y Corinto.',
    historicalOverview: 'Este viaje marca el momento decisivo en que la fe cristiana cruza el mar Egeo e ingresa a las grandes metrópolis intelectuales y comerciales del Imperio Romano (Atenas y Corinto), transitando por la famosa calzada romana Vía Egnatia.',
    keyScriptures: [
      { bookId: 'ACT', chapter: 15, label: 'Hechos 15:36-41' },
      { bookId: 'ACT', chapter: 16, label: 'Hechos 16' },
      { bookId: 'ACT', chapter: 17, label: 'Hechos 17' },
      { bookId: 'ACT', chapter: 18, label: 'Hechos 18' }
    ],
    waypoints: [
      {
        id: 'p2-antioquia-siria',
        order: 1,
        name: 'Antioquía de Siria',
        ancientName: 'Antiocheia ad Orontem',
        modernName: 'Antakya, Turquía',
        region: 'Siria Romana',
        coordinates: [36.2021, 36.1606],
        scriptureReference: 'Hechos 15:36-40',
        scriptureExcerpt: '«Y después de algunos días, Pablo dijo a Bernabé: Volvamos a visitar a los hermanos en todas las ciudades en que hemos anunciado la palabra del Señor... y Pablo escogió a Silas y partió.»',
        bookId: 'ACT',
        chapter: 15,
        verse: 36,
        category: 'city',
        historicalContext: 'Tercera metrópoli más grande del Imperio Romano (detrás de Roma y Alejandría). Sede de la primera iglesia misionera gentil donde por primera vez se llamó "cristianos" a los discípulos.',
        archaeologicalEvidence: 'Se conserva la Gruta de San Pedro en las faldas del monte Silpio y mosaicos romanos del siglo I que demuestran la opulencia cosmopolita de la ciudad.',
        spiritualLesson: 'El punto de partida de toda gran obra es una comunidad de oración e intercesión fiel enviando obreros al mundo.',
        estimatedDaysStay: 'Partida inicial'
      },
      {
        id: 'p2-tarso',
        order: 2,
        name: 'Tarso de Cilicia',
        ancientName: 'Tarsos',
        modernName: 'Tarsus, Turquía',
        region: 'Cilicia',
        coordinates: [36.9167, 34.8953],
        scriptureReference: 'Hechos 15:41',
        scriptureExcerpt: '«Y pasó por Siria y Cilicia, confirmando a las iglesias.»',
        bookId: 'ACT',
        chapter: 15,
        verse: 41,
        category: 'city',
        historicalContext: 'Ciudad natal del apóstol Pablo, afamado centro universitario y de tejeduría de lino y tiendas de campaña de pelo de cabra (cilicium).',
        archaeologicalEvidence: 'Las excavaciones revelan la Calzada Romana de Tarso con alcantarillado subterráneo del siglo I y el Pozo de San Pablo.',
        spiritualLesson: 'Dios usa nuestro trasfondo, formación y raíces culturales para prepararnos como instrumentos de impacto eterno.',
        estimatedDaysStay: '2 semanas'
      },
      {
        id: 'p2-listra',
        order: 3,
        name: 'Listra',
        ancientName: 'Lystra',
        modernName: 'Hatunsaray / Kilistra, Turquía',
        region: 'Licaonia / Galacia',
        coordinates: [37.5833, 32.2167],
        scriptureReference: 'Hechos 16:1-3',
        scriptureExcerpt: '«Llegó también a Derbe y a Listra; y he aquí, había allí cierto discípulo llamado Timoteo... daba buen testimonio de él los hermanos... Quiso Pablo que este fuese con él.»',
        bookId: 'ACT',
        chapter: 16,
        verse: 1,
        category: 'city',
        historicalContext: 'Colonia romana militar fundada por Augusto. En su primer viaje Pablo había sido apedreado aquí; ahora regresa con valentía y discipula al joven Timoteo.',
        archaeologicalEvidence: 'Inscripción en latín descubierta en 1885 que confirma el estatus de Listra como colonia romana («Colonia Iulia Felix Gemina Lystra»).',
        spiritualLesson: 'El discipulado intergeneracional: invertir en la juventud y levantar relevos espirituales comprometidos.',
        estimatedDaysStay: '1 semana'
      },
      {
        id: 'p2-troas',
        order: 4,
        name: 'Troas (Alejandría de Troas)',
        ancientName: 'Alexandria Troas',
        modernName: 'Dalyan / Ezine, Turquía',
        region: 'Misia / Mar Egeo',
        coordinates: [39.7525, 26.1558],
        scriptureReference: 'Hechos 16:8-10',
        scriptureExcerpt: '«Y se le mostró a Pablo una visión de noche: un varón macedonio estaba en pie, rogándole y diciendo: Pasa a Macedonia y ayúdanos. Cuando vio la visión, en seguida procuramos partir para Macedonia.»',
        bookId: 'ACT',
        chapter: 16,
        verse: 9,
        category: 'city',
        historicalContext: 'Puerto estratégico de salida hacia Europa. Aquí Lucas se une al equipo misionero (cambio gramatical del relato a "nosotros").',
        archaeologicalEvidence: 'Extensas murallas de 8 km, acueducto de Herodes Ático y el puerto interior donde atracaban las naves que cruzaban el Egeo.',
        spiritualLesson: 'La guía soberana del Espíritu Santo: cuando Dios cierra una puerta en Asia, abre un continente entero en Europa.',
        estimatedDaysStay: '3 días'
      },
      {
        id: 'p2-filipos',
        order: 5,
        name: 'Filipos',
        ancientName: 'Colonia Augusta Iulia Philippensis',
        modernName: 'Krinides / Kavala, Grecia',
        region: 'Macedonia',
        coordinates: [41.0136, 24.2869],
        scriptureReference: 'Hechos 16:12-40',
        scriptureExcerpt: '«A medianoche, orando Pablo y Silas, cantaban himnos a Dios; y los presos los oían. Entonces sobrevino de repente un gran terremoto... El carcelero dijo: Señores, ¿qué debo hacer para ser salvo? Ellos dijeron: Cree en el Señor Jesucristo, y serás salvo, tú y tu casa.»',
        bookId: 'ACT',
        chapter: 16,
        verse: 25,
        category: 'city',
        historicalContext: 'Primera iglesia plantada en suelo europeo. Ciudad de veteranos romanos exenta de tributos con ciudadanía romana de pleno derecho.',
        archaeologicalEvidence: 'El Foro Romano, la prisión tradicional de Pablo y Silas, la Vía Egnatia intacta y el arroyo Zygaktis donde se bautizó Lidia.',
        spiritualLesson: 'La alabanza en medio de las cadenas y la tribulación desata el poder liberador de Dios y la salvación de familias enteras.',
        estimatedDaysStay: 'Varios meses'
      },
      {
        id: 'p2-tesalonica',
        order: 6,
        name: 'Tesalónica',
        ancientName: 'Thessalonikē',
        modernName: 'Salónica, Grecia',
        region: 'Macedonia',
        coordinates: [40.6401, 22.9444],
        scriptureReference: 'Hechos 17:1-9',
        scriptureExcerpt: '«Y Pablo, como acostumbraba, fue a ellos, y por tres días de reposo discutió con ellos, declarando y exponiendo por medio de las Escrituras, que era necesario que el Cristo padeciese, y resucitase de los muertos.»',
        bookId: 'ACT',
        chapter: 17,
        verse: 2,
        category: 'city',
        historicalContext: 'Capital de la provincia de Macedonia y puerto principal sobre el golfo Termaico, gobernada por magistrados locales llamados "politarcas".',
        archaeologicalEvidence: 'Inscripción del Arco de Vardar conservada en el Museo Británico que menciona explícitamente el título "Politarca", confirmando la exactitud histórica de Lucas.',
        spiritualLesson: 'La solidez bíblica: usar las Escrituras como fundamento inquebrantable para proclamar a Cristo.',
        estimatedDaysStay: '3 a 4 semanas'
      },
      {
        id: 'p2-berea',
        order: 7,
        name: 'Berea',
        ancientName: 'Beroea',
        modernName: 'Veria, Grecia',
        region: 'Macedonia',
        coordinates: [40.5222, 22.2028],
        scriptureReference: 'Hechos 17:10-14',
        scriptureExcerpt: '«Y estos eran más nobles que los que estaban en Tesalónica, pues recibieron la palabra con toda solicitud, escudriñando cada día las Escrituras para ver si estas cosas eran así.»',
        bookId: 'ACT',
        chapter: 17,
        verse: 11,
        category: 'city',
        historicalContext: 'Ciudad pacífica al pie de los montes Bermio donde la sinagoga judía acogió con reverencia y estudio riguroso el mensaje.',
        archaeologicalEvidence: 'Monumento del "Bema de San Pablo" con gradas romanas originales donde la tradición atestigua que Pablo predicó.',
        spiritualLesson: 'El carácter noble de escudriñar diligentemente la Palabra de Dios todos los días para verificar toda enseñanza.',
        estimatedDaysStay: '2 a 3 semanas'
      },
      {
        id: 'p2-atenas',
        order: 8,
        name: 'Atenas (Areópago)',
        ancientName: 'Athēnai',
        modernName: 'Atenas, Grecia',
        region: 'Ática / Acaya',
        coordinates: [37.9715, 23.7257],
        scriptureReference: 'Hechos 17:16-34',
        scriptureExcerpt: '«Pablo, puesto en pie en medio del Areópago, dijo: Varones atenienses, en todo observo que sois muy religiosos; porque pasando y mirando vuestros santuarios, hallé también un altar en el cual estaba esta inscripción: AL DIOS NO CONOCIDO. Al que vosotros adoráis, pues, sin conocerle, es a quien yo os anuncio.»',
        bookId: 'ACT',
        chapter: 17,
        verse: 22,
        category: 'city',
        historicalContext: 'La cuna del pensamiento filosófico (epicúreos y estoicos), el Partenón y la colina rocosa del Areópago donde se juzgaban asuntos morales y religiosos.',
        archaeologicalEvidence: 'La Colina de Ares (Areópago) junto a la Acrópolis, la inscripción del altar al Dios Desconocido registrada por Pausanias.',
        spiritualLesson: 'Contextualización sabia del Evangelio: proclamar al Creador del universo frente al pluralismo intelectual sin negociar la verdad.',
        estimatedDaysStay: '1 mes'
      },
      {
        id: 'p2-corinto',
        order: 9,
        name: 'Corinto',
        ancientName: 'Corinthus',
        modernName: 'Antigua Corinto / Korinthos, Grecia',
        region: 'Acaya / Peloponeso',
        coordinates: [37.9056, 22.8794],
        scriptureReference: 'Hechos 18:1-18',
        scriptureExcerpt: '«Entonces el Señor dijo a Pablo en visión de noche: No temas, sino habla, y no calles; porque yo estoy contigo, y ninguno pondrá sobre ti la mano para hacerte mal, porque yo tengo mucho pueblo en esta ciudad. Y se detuvo allí un año y seis meses.»',
        bookId: 'ACT',
        chapter: 18,
        verse: 9,
        category: 'city',
        historicalContext: 'Gran centro mercantil con dos puertos (Leques y Cencreas), famosa por los Juegos Ístmicos, el Templo de Afrodita y su tribunal público (Bema).',
        archaeologicalEvidence: 'El Bema donde el procónsul Galión escuchó las acusaciones contra Pablo y la famosa inscripción del tesorero "Erasto" («Erastus pro aedilitate s.p. stravit»).',
        spiritualLesson: 'La promesa inquebrantable de la presencia de Dios que infunde valentía para perseverar en ciudades difíciles.',
        estimatedDaysStay: '18 meses (1.5 años)'
      },
      {
        id: 'p2-efeso',
        order: 10,
        name: 'Éfeso',
        ancientName: 'Ephesos',
        modernName: 'Selçuk / Izmir, Turquía',
        region: 'Asia Proconsular',
        coordinates: [37.9405, 27.3414],
        scriptureReference: 'Hechos 18:19-21',
        scriptureExcerpt: '«Y llegó a Éfeso, y los dejó allí; y entrando en la sinagoga, discutía con los judíos, los cuales le rogaban que se quedase con ellos por más tiempo; mas no consintió, sino que se despidió diciendo: Es menester que en todo caso yo haga en Jerusalén la fiesta que viene.»',
        bookId: 'ACT',
        chapter: 18,
        verse: 19,
        category: 'city',
        historicalContext: 'Metrópoli de Asia Menor, hogar del colosal Templo de Artemisa (una de las 7 Maravillas del Mundo Antiguo) y biblioteca de Celso.',
        archaeologicalEvidence: 'El Gran Teatro para 25,000 espectadores, la calle de los Curetes, el Ágora comercial y la Iglesia de San Juan.',
        spiritualLesson: 'Sembrar semillas de fe y preparar el terreno para avivamientos posteriores de gran magnitud.',
        estimatedDaysStay: 'Visita breve'
      },
      {
        id: 'p2-jerusalen',
        order: 11,
        name: 'Jerusalén y Retorno',
        ancientName: 'Hierosolyma',
        modernName: 'Jerusalén, Israel',
        region: 'Judea',
        coordinates: [31.7683, 35.2137],
        scriptureReference: 'Hechos 18:22',
        scriptureExcerpt: '«Habiendo arribado a Cesarea, subió para saludar a la iglesia, y luego descendió a Antioquía.»',
        bookId: 'ACT',
        chapter: 18,
        verse: 22,
        category: 'sanctuary',
        historicalContext: 'El centro espiritual del cristianismo primitivo y la iglesia madre guiada por los apóstoles.',
        archaeologicalEvidence: 'El Monte del Templo, la piscina de Betesda, el estanque de Siloé y murallas herodianas del siglo I.',
        spiritualLesson: 'Rendir cuentas con amor y comunión fraternal a la congregación y dar toda la gloria a Dios por los frutos cosechados.',
        estimatedDaysStay: 'Conclusión del viaje'
      }
    ]
  },
  {
    id: 'exodo',
    title: 'La Ruta del Éxodo y el Monte Sinaí',
    subtitle: 'De la esclavitud en Egipto hacia la Tierra Prometida',
    period: 'Antiguo Testamento',
    approxDate: '1446 a.C. / Siglo XV a.C.',
    totalDistanceKm: 1850,
    themeColor: '#D97706',
    badge: 'Pentateuco & Desierto',
    description: 'La travesía del pueblo de Israel libertado por mano poderosa de Jehová: el cruce del Mar Rojo, la entrega de la Ley en el Monte Sinaí y 40 años en el desierto.',
    historicalOverview: 'El Éxodo es el acontecimiento fundacional del pueblo del pacto. Dios revela Su nombre YHWH («YO SOY EL QUE SOY»), instituye el Tabernáculo y guía a Su pueblo como columna de nube de día y columna de fuego de noche.',
    keyScriptures: [
      { bookId: 'EXO', chapter: 12, label: 'Éxodo 12-14' },
      { bookId: 'EXO', chapter: 19, label: 'Éxodo 19-20' },
      { bookId: 'NUM', chapter: 33, label: 'Números 33' },
      { bookId: 'DEU', chapter: 34, label: 'Deuteronomio 34' }
    ],
    waypoints: [
      {
        id: 'ex-rameses',
        order: 1,
        name: 'Ramesés / Tierra de Gosén',
        ancientName: 'Pi-Ramsés / Avaris (Tell el-Dab\'a)',
        modernName: 'Qantir / Tell el-Dab\'a, Egipto',
        region: 'Delta del Nilo',
        coordinates: [30.7833, 31.8167],
        scriptureReference: 'Éxodo 12:37',
        scriptureExcerpt: '«Partieron los hijos de Israel de Ramesés a Sucot, como seiscientos mil hombres de a pie, sin contar los niños.»',
        bookId: 'EXO',
        chapter: 12,
        verse: 37,
        category: 'city',
        historicalContext: 'Capital deltaica donde los israelitas vivieron en servidumbre fabricando ladrillos. Punto de la noche de Pascua y liberación divina tras las 10 plagas.',
        archaeologicalEvidence: 'Excavaciones de Manfred Bietak en Avaris/Tell el-Dab\'a que demuestran una masiva población semítica asiatica del segundo milenio a.C. con arquitectura cuadrangular.',
        spiritualLesson: 'La sangre del Cordero Pascual como escudo inexpugnable que libra de la muerte y abre el camino de la redención.',
        estimatedDaysStay: 'Punto de partida'
      },
      {
        id: 'ex-mar-rojo',
        order: 2,
        name: 'Cruce del Mar Rojo (Pi-hahirot)',
        ancientName: 'Yam Suph / Mar de Cañas',
        modernName: 'Golfo de Suez / Lagos Amargos, Egipto',
        region: 'Frontera Egipcia',
        coordinates: [29.9668, 32.5498],
        scriptureReference: 'Éxodo 14:21-22',
        scriptureExcerpt: '«Y extendió Moisés su mano sobre el mar, e hizo Jehová que el mar se retirase por recio viento oriental toda aquella noche... y los hijos de Israel fueron por en medio del mar, en seco, teniendo las aguas como muro a su derecha y a su izquierda.»',
        bookId: 'EXO',
        chapter: 14,
        verse: 21,
        category: 'sea_crossing',
        historicalContext: 'Lugar de la encrucijada donde el faraón acorraló a Israel contra el mar. Dios abrió las aguas y sepultó los carros egipcios.',
        archaeologicalEvidence: 'Fortificaciones fronterizas del Imperio Nuevo egipcio a lo largo del "Camino de Horus" (Muro del Príncipe).',
        spiritualLesson: '«No temáis; estad firmes, y ved la salvación que Jehová hará hoy con vosotros... Jehová peleará por vosotros, y vosotros estaréis tranquilos.»',
        estimatedDaysStay: 'Día del Milagro'
      },
      {
        id: 'ex-mara',
        order: 3,
        name: 'Mara (Aguas Amargas)',
        ancientName: 'Marah',
        modernName: 'Bir Marah / Ayun Musa, Península del Sinaí',
        region: 'Desierto de Shur',
        coordinates: [29.5667, 32.7833],
        scriptureReference: 'Éxodo 15:23-26',
        scriptureExcerpt: '«Y llegaron a Mara, y no pudieron beber las aguas de Mara, porque eran amargas... Moisés clamó a Jehová, y Jehová le mostró un árbol; y lo echó en las aguas, y las aguas se endulzaron. Allí les dijo: Yo soy Jehová tu sanador (YHWH Rapha).»',
        bookId: 'EXO',
        chapter: 15,
        verse: 23,
        category: 'desert_oasis',
        historicalContext: 'Manantiales con alta concentración de sales minerales y azufre en el desierto árido tras 3 días de marcha sin agua.',
        archaeologicalEvidence: 'Pozos de agua sulfurosa de Ain Hawarah que conservan hasta el presente alta salinidad característica.',
        spiritualLesson: 'Dios transforma la amargura de nuestras pruebas en manantial de sanidad y revela Su carácter sanador.',
        estimatedDaysStay: '3 días'
      },
      {
        id: 'ex-elim',
        order: 4,
        name: 'Elim (12 Fuentes y 70 Palmeras)',
        ancientName: 'Elim',
        modernName: 'Wadi Gharandal, Egipto',
        region: 'Desierto del Sinaí',
        coordinates: [29.2833, 32.9667],
        scriptureReference: 'Éxodo 15:27',
        scriptureExcerpt: '«Y llegaron a Elim, donde había doce fuentes de aguas, y setenta palmeras; y acamparon allí junto a las aguas.»',
        bookId: 'EXO',
        chapter: 15,
        verse: 27,
        category: 'desert_oasis',
        historicalContext: 'Oasis verde abundante que ofreció descanso tras la aridez del desierto de Shur.',
        archaeologicalEvidence: 'Valle de Wadi Gharandal, célebre por su constante capa freática y exuberantes palmerales en medio del desierto rocoso.',
        spiritualLesson: 'Tras las aguas amargas de Mara, Dios siempre tiene preparado un oasis de refrigerio y restauración para Su pueblo.',
        estimatedDaysStay: '1 semana de descanso'
      },
      {
        id: 'ex-sinai',
        order: 5,
        name: 'Monte Sinaí / Horeb',
        ancientName: 'Har Sinai / Jebel Musa',
        modernName: 'Jabal Musa / Santa Catalina, Sinaí',
        region: 'Península del Sinaí',
        coordinates: [28.5396, 33.9753],
        scriptureReference: 'Éxodo 19:18-20; 20:1-17',
        scriptureExcerpt: '«Todo el monte Sinaí humeaba, porque Jehová había descendido sobre él en fuego... Y habló Dios todas estas palabras, diciendo: Yo soy Jehová tu Dios, que te saqué de la tierra de Egipto, de casa de servidumbre. No tendrás dioses ajenos delante de mí.»',
        bookId: 'EXO',
        chapter: 20,
        verse: 1,
        category: 'mountain',
        elevationMeters: 2285,
        historicalContext: 'Lugar sagrado donde Dios descendió con truenos y relámpagos, entregó las Tablas de la Ley (Decálogo) y el diseño del Tabernáculo.',
        archaeologicalEvidence: 'Monasterio de Santa Catalina (siglo VI) en la base del monte, con manuscritos bíblicos milenarios (Códice Sinaítico) y la llanura de er-Raha.',
        spiritualLesson: 'La santidad de Dios y el llamado a ser un pueblo santo, real sacerdocio y nación consagrada a Su pacto.',
        estimatedDaysStay: '11 meses y 20 días'
      },
      {
        id: 'ex-cades',
        order: 6,
        name: 'Cades-barnea (Ein el-Qudeirat)',
        ancientName: 'Kadesh-Barnea / Meribah Kadesh',
        modernName: 'Ein el-Qudeirat / Néguev',
        region: 'Desierto de Parán / Zin',
        coordinates: [30.6486, 34.4239],
        scriptureReference: 'Números 13:26; 14:6-9',
        scriptureExcerpt: '«Y Josué hijo de Nun y Caleb hijo de Jefone... dijeron: La tierra por donde pasamos para reconocerla, es tierra en gran manera buena. Si Jehová se agradare de nosotros, él nos meterá en esta tierra, y nos la entregará.»',
        bookId: 'NUM',
        chapter: 13,
        verse: 26,
        category: 'desert_oasis',
        historicalContext: 'Oasis principal donde acamparon durante la mayor parte de los 40 años y desde donde Moisés envió a los 12 espías a explorar Canaán.',
        archaeologicalEvidence: 'Fortalezas de la Edad del Bronce y del Hierro descubiertas en Tell el-Qudeirat con grandes cisternas y murallas de casamatas.',
        spiritualLesson: 'La fe frente a la incredulidad: creer a las promesas de Dios por encima de los gigantes visibles.',
        estimatedDaysStay: '38 años en la región'
      },
      {
        id: 'ex-nebo',
        order: 7,
        name: 'Monte Nebo / Llanuras de Moab',
        ancientName: 'Har Nevo / Pisgah',
        modernName: 'Monte Nebo, Jordania',
        region: 'Llanuras de Moab',
        coordinates: [31.7681, 35.7258],
        scriptureReference: 'Deuteronomio 34:1-4',
        scriptureExcerpt: '«Subió Moisés de los campos de Moab al monte Nebo, a la cumbre del Pisga... y le mostró Jehová toda la tierra... Y le dijo Jehová: Esta es la tierra de que juré a Abraham, a Isaac y a Jacob... te he permitido verla con tus ojos, mas no pasarás allá.»',
        bookId: 'DEU',
        chapter: 34,
        verse: 1,
        category: 'mountain',
        elevationMeters: 817,
        historicalContext: 'Cumbre con vista panorámica del valle del Jordán, el Mar Muerto y las colinas de Judea donde Moisés contempló la promesa antes de morir.',
        archaeologicalEvidence: 'Basílica monumental conmemorativa con mosaicos bizantinos del siglo IV y monumento de la Serpiente de Bronce.',
        spiritualLesson: 'La fidelidad de Dios que cumple Sus pactos a través de las generaciones; la gracia que traspasa la estafeta a Josué.',
        estimatedDaysStay: '30 días de luto'
      }
    ]
  },
  {
    id: 'ministerio-jesus',
    title: 'Los Pasos de Jesús: De Galilea a Jerusalén',
    subtitle: 'El ministerio terrenal, milagros y la victoria de la Cruz',
    period: 'Evangelios',
    approxDate: '27 – 30 d.C.',
    totalDistanceKm: 1200,
    themeColor: '#00A3E0',
    badge: 'Tierra Santa & Evangelios',
    description: 'Recorrido por las ciudades, costas y senderos donde el Salvador proclamó el Reino de Dios, sanó a los enfermos, murió por nuestros pecados y resucitó al tercer día.',
    historicalOverview: 'El ministerio de Jesús se desarrolló en el contexto de la Judea y Galilea del siglo I bajo la ocupación romana y las tensiones del Templo de Herodes. Desde las aldeas pesqueras del Mar de Galilea hasta las calles empedradas de Jerusalén.',
    keyScriptures: [
      { bookId: 'MAT', chapter: 4, label: 'Mateo 4:12-25' },
      { bookId: 'MAT', chapter: 5, label: 'Mateo 5-7 (Sermón del Monte)' },
      { bookId: 'JHN', chapter: 4, label: 'Juan 4 (La Samaritana)' },
      { bookId: 'JHN', chapter: 19, label: 'Juan 19-20 (Muerte y Resurrección)' }
    ],
    waypoints: [
      {
        id: 'mj-belen',
        order: 1,
        name: 'Belén de Judea',
        ancientName: 'Beit Lehem (Casa del Pan)',
        modernName: 'Belén, Cisjordania',
        region: 'Judea',
        coordinates: [31.7054, 35.2024],
        scriptureReference: 'Lucas 2:4-7; Miqueas 5:2',
        scriptureExcerpt: '«Y dio a luz a su hijo primogénito, y lo envolvió en pañales, y lo acostó en un pesebre, porque no había lugar para ellos en el mesón.»',
        bookId: 'MAT',
        chapter: 2,
        verse: 1,
        category: 'city',
        historicalContext: 'Pequeña aldea agrícola cuna del rey David donde, conforme a la profecía milenaria de Miqueas, nació el Mesías prometido.',
        archaeologicalEvidence: 'Gruta de la Natividad identificada desde el siglo II por Justino Mártir y Basílica de la Natividad construida por Constantino.',
        spiritualLesson: 'La profunda humildad de Dios que escoge lo pequeño y débil del mundo para manifestar Su gloria.',
        estimatedDaysStay: 'Nacimiento e infancia'
      },
      {
        id: 'mj-nazaret',
        order: 2,
        name: 'Nazaret de Galilea',
        ancientName: 'Natzrat (Vástago / Renuevo)',
        modernName: 'Nazaret, Israel',
        region: 'Baja Galilea',
        coordinates: [32.7019, 35.2979],
        scriptureReference: 'Lucas 4:16-21',
        scriptureExcerpt: '«Vino a Nazaret, donde se había criado; y en el día de reposo entró en la sinagoga... Y enrollando el libro, lo dio al ministro, y se sentó... Y comenzó a decirles: Hoy se ha cumplido esta Escritura delante de vosotros.»',
        bookId: 'MAT',
        chapter: 4,
        verse: 13,
        category: 'city',
        historicalContext: 'Aldea modesta entre colinas donde Jesús creció en sabiduría y gracia, trabajando como carpintero (tekton).',
        archaeologicalEvidence: 'Casas excavadas del siglo I talladas en roca calcárea, prensas de aceite y terrazas agrícolas en Nazaret Village.',
        spiritualLesson: 'El cumplimiento perfecto de la misión mesiánica: dar buenas nuevas a los pobres, libertad a los cautivos y vista a los ciegos.',
        estimatedDaysStay: 'Aproximadamente 30 años'
      },
      {
        id: 'mj-jordan',
        order: 3,
        name: 'Río Jordán (Betábara / Qasr al-Yahud)',
        ancientName: 'Yarden / Bethabara',
        modernName: 'Al-Maghtas / Qasr al-Yahud, Valle del Jordán',
        region: 'Perea / Judea',
        coordinates: [31.8378, 35.5469],
        scriptureReference: 'Mateo 3:16-17',
        scriptureExcerpt: '«Y Jesús, después que fue bautizado, subió luego del agua; y he aquí los cielos le fueron abiertos, y vio al Espíritu de Dios que descendía como paloma, y venía sobre él. Y hubo una voz de los cielos, que decía: Este es mi Hijo amado, en quien tengo complacencia.»',
        bookId: 'MAT',
        chapter: 3,
        verse: 16,
        category: 'sanctuary',
        historicalContext: 'Punto tradicional de paso del río Jordán donde Juan el Bautista predicaba el bautismo de arrepentimiento.',
        archaeologicalEvidence: 'Estructuras bautismales romanas y bizantinas de los siglos IV-VI catalogadas por la UNESCO en Al-Maghtas.',
        spiritualLesson: 'La manifestación trinitaria y la afirmación del Padre que nos capacita para el servicio en el Reino.',
        estimatedDaysStay: 'Bautismo e inicio ministerial'
      },
      {
        id: 'mj-capernaum',
        order: 4,
        name: 'Capernaum (Su Propia Ciudad)',
        ancientName: 'Kfar Nahum (Aldea de Consolación)',
        modernName: 'Kfar Nahum / Capernaum, Mar de Galilea',
        region: 'Galilea',
        coordinates: [32.8806, 35.5753],
        scriptureReference: 'Mateo 4:13; Marcos 2:1-12',
        scriptureExcerpt: '«Dejando a Nazaret, vino y habitó en Capernaum, ciudad marítima... El pueblo asentado en tinieblas vio gran luz... Desde entonces comenzó Jesús a predicar, y a decir: Arrepentíos, porque el reino de los cielos se ha acercado.»',
        bookId: 'MAT',
        chapter: 4,
        verse: 13,
        category: 'city',
        historicalContext: 'Próspera aldea pesquera y aduana fronteriza en la Vía Maris. Cuartel general del ministerio de Jesús en Galilea.',
        archaeologicalEvidence: 'La Casa octagonal de Simón Pedro con grafitis cristianos primitivos ("Jesús Señor") y los cimientos de basalto negro de la Sinagoga del siglo I.',
        spiritualLesson: 'La luz de Cristo disipa las tinieblas más profundas y transforma vidas cotidianas en pescadores de hombres.',
        estimatedDaysStay: 'Centro de operaciones (3 años)'
      },
      {
        id: 'mj-monte-bienaventuranzas',
        order: 5,
        name: 'Monte de las Bienaventuranzas',
        ancientName: 'Colina de Eremos / Tabgha',
        modernName: 'Monte de las Bienaventuranzas, Galilea',
        region: 'Costa Norte del Mar de Galilea',
        coordinates: [32.8819, 35.5558],
        scriptureReference: 'Mateo 5:1-12',
        scriptureExcerpt: '«Viendo la multitud, subió al monte; y sentándose, vinieron a él sus discípulos. Y abriendo su boca les enseñaba, diciendo: Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos.»',
        bookId: 'MAT',
        chapter: 5,
        verse: 1,
        category: 'mountain',
        historicalContext: 'Anfiteatro natural con acústica excepcional que desciende suavemente hacia el Mar de Galilea.',
        archaeologicalEvidence: 'Ruinas de capilla bizantina del siglo IV con vistas a la bahía de Tabgha.',
        spiritualLesson: 'El manifiesto del Reino: los valores celestiales de mansedumbre, misericordia, pureza de corazón y pacificación.',
        estimatedDaysStay: 'Sermón del Monte'
      },
      {
        id: 'mj-sicar',
        order: 6,
        name: 'Sicar (El Pozo de Jacob)',
        ancientName: 'Sychem / Sychar',
        modernName: 'Nablus / Askar, Cisjordania',
        region: 'Samaria',
        coordinates: [32.2094, 35.2783],
        scriptureReference: 'Juan 4:13-14',
        scriptureExcerpt: '«Respondió Jesús y le dijo: Cualquiera que bebiere de esta agua, volverá a tener sed; mas el que bebiere del agua que yo le daré, no tendrá sed jamás; sino que el agua que yo le daré será en él una fuente de agua que salte para vida eterna.»',
        bookId: 'JHN',
        chapter: 4,
        verse: 13,
        category: 'desert_oasis',
        historicalContext: 'Pozo milenario excavado en roca sólida junto al monte Gerizim donde los samaritanos adoraban.',
        archaeologicalEvidence: 'El pozo original de más de 35 metros de profundidad con agua viva subterránea continúa activo dentro de la cripta del templo ortodoxo.',
        spiritualLesson: 'Jesús derriba barreras étnicas, religiosas y de género para ofrecer el agua de vida a todo corazón sediento.',
        estimatedDaysStay: '2 días'
      },
      {
        id: 'mj-jerusalen',
        order: 7,
        name: 'Jerusalén (Getsemaní, Gólgota y Tumba Vacía)',
        ancientName: 'Yerushalayim / Hierosolyma',
        modernName: 'Ciudad Vieja de Jerusalén, Israel',
        region: 'Judea',
        coordinates: [31.7784, 35.2345],
        scriptureReference: 'Mateo 28:5-6; Juan 19:30',
        scriptureExcerpt: '«Mas el ángel, respondiendo, dijo a las mujeres: No temáis vosotras; porque yo sé que buscáis a Jesús, el que fue crucificado. No está aquí, pues ha resucitado, como dijo. Venid, ved el lugar donde fue puesto el Señor.»',
        bookId: 'MAT',
        chapter: 28,
        verse: 5,
        category: 'sanctuary',
        historicalContext: 'La ciudad santa: el Cenáculo de la Última Cena, el Huerto de los Olivos (Getsemaní), el Pretorio de Pilato, el Monte Calvario y la Tumba del Huerto.',
        archaeologicalEvidence: 'Escalones del sur del Templo por donde caminó Jesús, pavimento de piedra del Litóstroto (Enlosado), el estanque de Siloé y tumbas de cámara herodianas.',
        spiritualLesson: '«¡Consumado es!» La victoria definitiva sobre el pecado y la muerte: ¡Cristo ha resucitado con poder y gloria!',
        estimatedDaysStay: 'Semana de Pasión y Resurrección'
      }
    ]
  },
  {
    id: 'pablo-1',
    title: 'Primer Viaje Misionero de Pablo',
    subtitle: 'La primera incursión apostólica en Chipre y Galacia del Sur',
    period: 'Hechos y Epístolas',
    approxDate: '46 – 48 d.C.',
    totalDistanceKm: 2200,
    themeColor: '#10B981',
    badge: 'Chipre & Galacia',
    description: 'Pablo, Bernabé y Juan Marcos son enviados por el Espíritu Santo desde Antioquía de Siria. Evangelizan la isla de Chipre y las ciudades montañosas de Pisidia y Licaonia.',
    historicalOverview: 'Fue la primera misión transfronteriza formal organizada por la iglesia gentil. Estableció el principio de que los gentiles reciben la salvación por gracia mediante la fe sin necesidad de someterse a la circuncisión ritual.',
    keyScriptures: [
      { bookId: 'ACT', chapter: 13, label: 'Hechos 13' },
      { bookId: 'ACT', chapter: 14, label: 'Hechos 14' }
    ],
    waypoints: [
      {
        id: 'p1-antioquia',
        order: 1,
        name: 'Antioquía de Siria',
        ancientName: 'Antiocheia',
        modernName: 'Antakya, Turquía',
        region: 'Siria',
        coordinates: [36.2021, 36.1606],
        scriptureReference: 'Hechos 13:2-3',
        scriptureExcerpt: '«Ministrando estos al Señor, y ayunando, dijo el Espíritu Santo: Apartadme a Bernabé y a Saulo para la obra a que los he llamado. Entonces, habiendo ayunado y orado, les impusieron las manos y los despidieron.»',
        bookId: 'ACT',
        chapter: 13,
        verse: 2,
        category: 'city',
        historicalContext: 'La iglesia modelo que combinó adoración, ayuno y discernimiento del Espíritu para enviar misioneros.',
        archaeologicalEvidence: 'Antiguos cimientos urbanos de la calle columnada romana de Antioquía.',
        spiritualLesson: 'La consagración y sensibilidad a la voz del Espíritu Santo como motor del avance misionero.',
        estimatedDaysStay: 'Envío'
      },
      {
        id: 'p1-pafos',
        order: 2,
        name: 'Pafos (Isla de Chipre)',
        ancientName: 'Paphos',
        modernName: 'Paphos, Chipre',
        region: 'Chipre',
        coordinates: [34.772, 32.4297],
        scriptureReference: 'Hechos 13:6-12',
        scriptureExcerpt: '«Y habiendo atravesado toda la isla hasta Pafos, hallaron a cierto mago, falso profeta, judío, llamado Barjesús... Entonces Saulo, que también es Pablo, lleno del Espíritu Santo... dijo: ¡Oh, lleno de todo engaño!... Entonces el procónsul, viendo lo que había sucedido, creyó, maravillado de la doctrina del Señor.»',
        bookId: 'ACT',
        chapter: 13,
        verse: 6,
        category: 'island',
        historicalContext: 'Capital administrativa de la provincia senatorial de Chipre y residencia del procónsul romano Sergio Paulo.',
        archaeologicalEvidence: 'El Palacio del Procónsul en Nea Paphos con magníficos mosaicos romanos y el Pilar de San Pablo.',
        spiritualLesson: 'El poder del Espíritu Santo desarma toda oposición demoníaca y gana a hombres de influencia para el Reino.',
        estimatedDaysStay: '2 semanas'
      },
      {
        id: 'p1-antioquia-pisidia',
        order: 3,
        name: 'Antioquía de Pisidia',
        ancientName: 'Antiochia Caesarea in Pisidia',
        modernName: 'Yalvaç, Isparta, Turquía',
        region: 'Galacia del Sur / Frigia',
        coordinates: [38.3056, 31.1764],
        scriptureReference: 'Hechos 13:14-48',
        scriptureExcerpt: '«Los gentiles, oyendo esto, se regocijaban y glorificaban la palabra del Señor, y creyeron todos los que estaban ordenados para vida eterna. Y la palabra del Señor se difundía por toda aquella provincia.»',
        bookId: 'ACT',
        chapter: 13,
        verse: 48,
        category: 'city',
        historicalContext: 'Colonia romana situada a 1,100 metros de altitud en las montañas de Tauro, centro de colonos romanos de la Legión V Gallica.',
        archaeologicalEvidence: 'El Templo de Augusto, el acueducto romano y los cimientos de la gran Basílica de San Pablo levantada sobre la sinagoga del siglo I.',
        spiritualLesson: 'La proclamación audaz de la justificación por la fe en Cristo frente al legalismo.',
        estimatedDaysStay: '3 semanas'
      },
      {
        id: 'p1-iconio',
        order: 4,
        name: 'Iconio',
        ancientName: 'Iconium',
        modernName: 'Konya, Turquía',
        region: 'Licaonia',
        coordinates: [37.8746, 32.4932],
        scriptureReference: 'Hechos 14:1-6',
        scriptureExcerpt: '«Aconteció en Iconio que entraron juntos en la sinagoga de los judíos, y hablaron de tal manera que creyó una gran multitud así de judíos como de griegos.»',
        bookId: 'ACT',
        chapter: 14,
        verse: 1,
        category: 'city',
        historicalContext: 'Importante nudo de rutas comerciales en la meseta de Anatolia.',
        archaeologicalEvidence: 'Inscripciones helenísticas y romanas en el montículo arqueológico de Alaeddin.',
        spiritualLesson: 'Perseverar con valentía a pesar de la persecución y los rumores calumniosos.',
        estimatedDaysStay: 'Varios meses'
      },
      {
        id: 'p1-derbe',
        order: 5,
        name: 'Derbe y Retorno',
        ancientName: 'Derbe',
        modernName: 'Kerti Hüyük / Karaman, Turquía',
        region: 'Galacia del Sur',
        coordinates: [37.3467, 33.3644],
        scriptureReference: 'Hechos 14:20-23',
        scriptureExcerpt: '«Y después de anunciar el evangelio a aquella ciudad y de hacer muchos discípulos, volvieron a Listra, a Iconio y a Antioquía, confirmando los ánimos de los discípulos, exhortándoles a que permaneciesen en la fe... Y constituyeron ancianos en cada iglesia.»',
        bookId: 'ACT',
        chapter: 14,
        verse: 21,
        category: 'city',
        historicalContext: 'Ciudad fronteriza del reino de Antíoco de Comagene donde muchos abrazaron la fe sin sufrir motines.',
        archaeologicalEvidence: 'Inscripción fechada en 157 d.C. descubierta por Michael Ballance que identificó con precisión la ubicación de Derbe.',
        spiritualLesson: 'La consolidación pastoral: volver sobre los pasos para fortalecer y ordenar el liderazgo espiritual.',
        estimatedDaysStay: 'Conclusión y vuelta'
      }
    ]
  }
];

// Helper to look up an itinerary by key or by scripture
export function findItineraryForScripture(bookId: string, chapter: number): BiblicalItinerary | null {
  if (bookId === 'EXO' || (bookId === 'NUM' && chapter >= 13) || bookId === 'DEU') {
    return BIBLICAL_ITINERARIES.find((i) => i.id === 'exodo') || null;
  }
  if (bookId === 'MAT' || bookId === 'MRK' || bookId === 'LUK' || bookId === 'JHN') {
    return BIBLICAL_ITINERARIES.find((i) => i.id === 'ministerio-jesus') || null;
  }
  if (bookId === 'ACT') {
    if (chapter >= 13 && chapter <= 14) {
      return BIBLICAL_ITINERARIES.find((i) => i.id === 'pablo-1') || null;
    }
    if (chapter >= 15 && chapter <= 18) {
      return BIBLICAL_ITINERARIES.find((i) => i.id === 'pablo-2') || null;
    }
    return BIBLICAL_ITINERARIES.find((i) => i.id === 'pablo-2') || null;
  }
  return null;
}

export interface DetectedBiblicalPlace extends MapWaypoint {
  cleanName: string;
  itineraryId: string;
  itineraryTitle: string;
  itineraryThemeColor: string;
  matchedVerses: number[];
}

// Remove accents for resilient matching
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Scans a chapter's verses and returns all geographic waypoints linked to this text,
 * either by direct chapter assignment or by keyword mentions in the verse content.
 */
export function detectPlacesInChapter(
  bookId: string,
  chapter: number,
  verses: { verse: number; text: string }[] = []
): DetectedBiblicalPlace[] {
  const detectedMap = new Map<string, DetectedBiblicalPlace>();

  // 1. Direct itinerary waypoints that belong to this book & chapter
  BIBLICAL_ITINERARIES.forEach((itinerary) => {
    itinerary.waypoints.forEach((wp) => {
      if (wp.bookId === bookId && wp.chapter === chapter) {
        const cleanName = wp.name.split(' (')[0].trim();
        const existing = detectedMap.get(wp.id);
        if (!existing) {
          detectedMap.set(wp.id, {
            ...wp,
            cleanName,
            itineraryId: itinerary.id,
            itineraryTitle: itinerary.title,
            itineraryThemeColor: itinerary.themeColor,
            matchedVerses: [wp.verse]
          });
        }
      }
    });
  });

  // 2. Scan verses text for mentions of all known waypoints
  if (verses.length > 0) {
    BIBLICAL_ITINERARIES.forEach((itinerary) => {
      itinerary.waypoints.forEach((wp) => {
        const cleanName = wp.name.split(' (')[0].trim();
        const normName = normalizeText(cleanName);
        const normAncient = wp.ancientName ? normalizeText(wp.ancientName) : '';

        // Check each verse
        verses.forEach((v) => {
          const normVerse = normalizeText(v.text);
          // Match whole word boundaries or clear occurrences
          const regex = new RegExp(`\\b${normName}\\b`, 'i');
          const matches = regex.test(normVerse) || (normAncient && normVerse.includes(normAncient));

          if (matches) {
            const existing = detectedMap.get(wp.id);
            if (existing) {
              if (!existing.matchedVerses.includes(v.verse)) {
                existing.matchedVerses.push(v.verse);
              }
            } else {
              detectedMap.set(wp.id, {
                ...wp,
                cleanName,
                itineraryId: itinerary.id,
                itineraryTitle: itinerary.title,
                itineraryThemeColor: itinerary.themeColor,
                matchedVerses: [v.verse]
              });
            }
          }
        });
      });
    });
  }

  return Array.from(detectedMap.values());
}

