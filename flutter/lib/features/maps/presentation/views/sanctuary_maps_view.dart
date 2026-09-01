import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class BiblicalRoute {
  final String id;
  final String title;
  final String period;
  final String scriptureReference;
  final String summary;
  final Color themeColor;
  final List<BiblicalWaypoint> waypoints;

  const BiblicalRoute({
    required this.id,
    required this.title,
    required this.period,
    required this.scriptureReference,
    required this.summary,
    required this.themeColor,
    required this.waypoints,
  });
}

class BiblicalWaypoint {
  final String name;
  final String region;
  final String scripture;
  final String description;
  final double latitude;
  final double longitude;

  const BiblicalWaypoint({
    required this.name,
    required this.region,
    required this.scripture,
    required this.description,
    required this.latitude,
    required this.longitude,
  });
}

const List<BiblicalRoute> kBiblicalRoutes = [
  BiblicalRoute(
    id: 'pablo_1',
    title: '1º Viaje Misionero de Pablo',
    period: '46 - 48 d.C.',
    scriptureReference: 'Hechos 13 - 14',
    summary:
        'Pablo y Bernabé parten de Antioquía de Siria, viajan a Chipre y recorren Galacia del Sur (Perge, Antioquía de Pisidia, Iconio, Listra y Derbe), plantando las primeras iglesias gentiles.',
    themeColor: SanctuaryColors.waveNavy,
    waypoints: [
      BiblicalWaypoint(
        name: 'Antioquía de Siria',
        region: 'Siria',
        scripture: 'Hechos 13:1-3',
        description:
            'Punto de partida del equipo misionero tras la dirección del Espíritu Santo y el ayuno de la iglesia.',
        latitude: 36.2021,
        longitude: 36.1606,
      ),
      BiblicalWaypoint(
        name: 'Salamina y Pafos (Chipre)',
        region: 'Chipre',
        scripture: 'Hechos 13:4-12',
        description:
            'Predicación en las sinagogas; confrontación con Elimas el mago y conversión del procónsul Sergio Paulo.',
        latitude: 34.7720,
        longitude: 32.4297,
      ),
      BiblicalWaypoint(
        name: 'Antioquía de Pisidia',
        region: 'Galacia',
        scripture: 'Hechos 13:14-52',
        description:
            'Sermón cristológico de Pablo en la sinagoga. Gran acogida entre gentiles y oposición de líderes locales.',
        latitude: 38.3000,
        longitude: 31.1833,
      ),
      BiblicalWaypoint(
        name: 'Listra',
        region: 'Licaonia',
        scripture: 'Hechos 14:8-20',
        description:
            'Sanidad de un cojo de nacimiento; los lugareños intentan adorarlos como dioses y luego Pablo es apedreado.',
        latitude: 37.5667,
        longitude: 32.2167,
      ),
      BiblicalWaypoint(
        name: 'Derbe',
        region: 'Licaonia',
        scripture: 'Hechos 14:20-21',
        description:
            'Predicación del evangelio donde hicieron muchos discípulos antes de regresar a fortalecer a los hermanos.',
        latitude: 37.3500,
        longitude: 33.3500,
      ),
    ],
  ),
  BiblicalRoute(
    id: 'pablo_2',
    title: '2º Viaje Misionero de Pablo',
    period: '49 - 52 d.C.',
    scriptureReference: 'Hechos 15:36 - 18:22',
    summary:
        'Acompañado por Silas y luego Timoteo, Pablo cruza a Europa respondiendo al llamado del varón macedonio, fundando congregaciones en Filipos, Tesalónica, Berea, Atenas y Corinto.',
    themeColor: SanctuaryColors.sunOrange,
    waypoints: [
      BiblicalWaypoint(
        name: 'Troas',
        region: 'Misia',
        scripture: 'Hechos 16:8-10',
        description:
            'Visión nocturna del varón macedonio pidiendo: «Pasa a Macedonia y ayúdanos».',
        latitude: 39.7500,
        longitude: 26.1667,
      ),
      BiblicalWaypoint(
        name: 'Filipos',
        region: 'Macedonia',
        scripture: 'Hechos 16:11-40',
        description:
            'Conversión de Lidia; cánticos en la cárcel a medianoche, terremoto y salvación del carcelero de Filipos.',
        latitude: 41.0133,
        longitude: 24.2861,
      ),
      BiblicalWaypoint(
        name: 'Tesalónica',
        region: 'Macedonia',
        scripture: 'Hechos 17:1-9',
        description:
            'Exposición bíblica durante tres días de reposo demostrando que el Cristo debía padecer y resucitar.',
        latitude: 40.6401,
        longitude: 22.9444,
      ),
      BiblicalWaypoint(
        name: 'Atenas (Areópago)',
        region: 'Acaya',
        scripture: 'Hechos 17:16-34',
        description:
            'Discurso sobre «Al Dios No Conocido» ante los filósofos estoicos y epicúreos en el Areópago.',
        latitude: 37.9715,
        longitude: 23.7267,
      ),
      BiblicalWaypoint(
        name: 'Corinto',
        region: 'Acaya',
        scripture: 'Hechos 18:1-18',
        description:
            'Pablo permanece un año y seis meses enseñando la Palabra junto a Aquila y Priscila.',
        latitude: 37.9083,
        longitude: 22.8806,
      ),
    ],
  ),
  BiblicalRoute(
    id: 'exodo',
    title: 'La Ruta del Éxodo',
    period: 'Siglo XV - XIII a.C.',
    scriptureReference: 'Éxodo 12 - 19 / Números',
    summary:
        'La liberación del pueblo de Israel de la esclavitud en Egipto, el milagroso cruce del Mar Rojo y la travesía por el desierto hasta el Monte Sinaí donde recibieron la Ley y el Tabernáculo.',
    themeColor: SanctuaryColors.cyanAccent,
    waypoints: [
      BiblicalWaypoint(
        name: 'Ramsés (Gosén)',
        region: 'Egipto',
        scripture: 'Éxodo 12:37',
        description:
            'Partida de los hijos de Israel tras la décima plaga y la celebración de la primera Pascua.',
        latitude: 30.7874,
        longitude: 31.8319,
      ),
      BiblicalWaypoint(
        name: 'Cruce del Mar Rojo',
        region: 'Península de Sinaí',
        scripture: 'Éxodo 14:21-31',
        description:
            'Dios abre las aguas con viento recio; Israel cruza en seco y el ejército del faraón perece.',
        latitude: 29.9668,
        longitude: 32.5498,
      ),
      BiblicalWaypoint(
        name: 'Mara y Elim',
        region: 'Desierto de Shur',
        scripture: 'Éxodo 15:22-27',
        description:
            'Endulzamiento de las aguas amargas de Mara y campamento en Elim junto a 12 fuentes y 70 palmeras.',
        latitude: 29.0500,
        longitude: 33.1333,
      ),
      BiblicalWaypoint(
        name: 'Monte Sinaí (Horeb)',
        region: 'Sinaí',
        scripture: 'Éxodo 19 - 20',
        description:
            'Pacto de la Alianza y entrega de las Tablas de la Ley (Los Diez Mandamientos).',
        latitude: 28.5397,
        longitude: 33.9750,
      ),
    ],
  ),
  BiblicalRoute(
    id: 'jesus_ministerio',
    title: 'Ministerio de Jesús en Galilea y Judea',
    period: '27 - 30 d.C.',
    scriptureReference: 'Evangelios Sinópticos & Juan',
    summary:
        'El ministerio itinerante de Nuestro Señor Jesucristo: milagros en el Mar de Galilea, sermones en los montes y Su entrada triunfal y sacrificio redentor en Jerusalén.',
    themeColor: SanctuaryColors.brandPurple,
    waypoints: [
      BiblicalWaypoint(
        name: 'Nazaret',
        region: 'Galilea',
        scripture: 'Lucas 4:16-30',
        description:
            'Lectura del rollo de Isaías en la sinagoga declarando la unción del Espíritu Santo.',
        latitude: 32.6996,
        longitude: 35.3035,
      ),
      BiblicalWaypoint(
        name: 'Capernaúm & Mar de Galilea',
        region: 'Galilea',
        scripture: 'Mateo 4:13 / Marcos 1:21',
        description:
            'Centro del ministerio galileo; sanidades, el Sermón del Monte y calma de la tempestad.',
        latitude: 32.8803,
        longitude: 35.5753,
      ),
      BiblicalWaypoint(
        name: 'Betania',
        region: 'Judea',
        scripture: 'Juan 11',
        description:
            'Hogar de Marta, María y Lázaro; resurrección milagrosa de Lázaro tras cuatro días.',
        latitude: 31.7719,
        longitude: 35.2608,
      ),
      BiblicalWaypoint(
        name: 'Jerusalén (Gólgota & Tumba Vacía)',
        region: 'Judea',
        scripture: 'Mateo 27 - 28 / Lucas 24',
        description:
            'La Última Cena, crucifixión redentora y la gloriosa resurrección al tercer día.',
        latitude: 31.7767,
        longitude: 35.2345,
      ),
    ],
  ),
];

class SanctuaryMapsView extends StatefulWidget {
  const SanctuaryMapsView({super.key});

  @override
  State<SanctuaryMapsView> createState() => _SanctuaryMapsViewState();
}

class _SanctuaryMapsViewState extends State<SanctuaryMapsView> {
  int _selectedRouteIndex = 0;
  int _selectedWaypointIndex = 0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentRoute = kBiblicalRoutes[_selectedRouteIndex];
    final currentWaypoint = currentRoute.waypoints[_selectedWaypointIndex];

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.map,
                size: 20, color: SanctuaryColors.cyanAccent),
            const SizedBox(width: 8),
            Text(
              'Mapas & Rutas Bíblicas',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Route Selector Tabs
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: kBiblicalRoutes.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final route = kBiblicalRoutes[index];
                final isSelected = index == _selectedRouteIndex;
                return ChoiceChip(
                  label: Text(route.title),
                  selected: isSelected,
                  selectedColor: currentRoute.themeColor,
                  labelStyle: TextStyle(
                    color:
                        isSelected ? Colors.white : theme.colorScheme.onSurface,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedRouteIndex = index;
                        _selectedWaypointIndex = 0;
                      });
                    }
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 8),

          // Route Context Summary Banner
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: currentRoute.themeColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: currentRoute.themeColor.withOpacity(0.25),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  LucideIcons.info,
                  size: 18,
                  color: currentRoute.themeColor,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            currentRoute.period,
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w800,
                              fontSize: 11,
                              color: currentRoute.themeColor,
                            ),
                          ),
                          Text(
                            currentRoute.scriptureReference,
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w800,
                              fontSize: 11,
                              color: currentRoute.themeColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currentRoute.summary,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          height: 1.4,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Map Simulated Viewport / Waypoints Stepper
          Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: theme.cardTheme.color,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: theme.colorScheme.outline.withOpacity(0.3),
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Column(
                  children: [
                    // Visual Header Representation
                    Container(
                      height: 130,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            currentRoute.themeColor.withOpacity(0.85),
                            currentRoute.themeColor,
                          ],
                        ),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.black26,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  'PUNTO ${_selectedWaypointIndex + 1} DE ${currentRoute.waypoints.length}',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              Text(
                                '${currentWaypoint.latitude.toStringAsFixed(2)}° N, ${currentWaypoint.longitude.toStringAsFixed(2)}° E',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                currentWaypoint.name,
                                style: GoogleFonts.playfairDisplay(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                currentWaypoint.region,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: Colors.white.withOpacity(0.85),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Waypoints Horizontal List
                    Container(
                      height: 52,
                      padding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      decoration: BoxDecoration(
                        color:
                            theme.colorScheme.surfaceVariant.withOpacity(0.5),
                        border: Border(
                          bottom: BorderSide(
                            color: theme.colorScheme.outline.withOpacity(0.2),
                          ),
                        ),
                      ),
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: currentRoute.waypoints.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 6),
                        itemBuilder: (context, idx) {
                          final wp = currentRoute.waypoints[idx];
                          final isSelected = idx == _selectedWaypointIndex;
                          return InkWell(
                            onTap: () {
                              setState(() {
                                _selectedWaypointIndex = idx;
                              });
                            },
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? currentRoute.themeColor
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: Text(
                                  '${idx + 1}. ${wp.name}',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: isSelected
                                        ? FontWeight.w800
                                        : FontWeight.w600,
                                    color: isSelected
                                        ? Colors.white
                                        : theme.colorScheme.onSurface,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Waypoint Information & Scripture Excerpt
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(LucideIcons.bookOpen,
                                    size: 16, color: SanctuaryColors.sunOrange),
                                const SizedBox(width: 6),
                                Text(
                                  'Referencia Bíblica:',
                                  style: GoogleFonts.inter(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  currentWaypoint.scripture,
                                  style: GoogleFonts.inter(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                    color: SanctuaryColors.sunOrange,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              currentWaypoint.description,
                              style: GoogleFonts.inter(
                                fontSize: 14.5,
                                height: 1.65,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
