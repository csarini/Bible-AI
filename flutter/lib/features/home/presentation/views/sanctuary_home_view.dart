import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/coachmark_guide_dialog.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../../shared/widgets/sanctuary_church_logo.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class DevotionalTopic {
  final String id;
  final String label;
  final IconData icon;
  final String reference;
  final String verse;
  final String reflection;
  final String prayer;

  const DevotionalTopic({
    required this.id,
    required this.label,
    required this.icon,
    required this.reference,
    required this.verse,
    required this.reflection,
    required this.prayer,
  });
}

const List<DevotionalTopic> kDevotionalTopics = [
  DevotionalTopic(
    id: 'paz',
    label: 'Paz',
    icon: LucideIcons.heart,
    reference: 'Filipenses 4:6-7',
    verse:
        'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
    reflection:
        'La paz de Dios no depende de circunstancias externas favorables, sino de la presencia constante del Espíritu Santo. Al entregar nuestras cargas en oración sincera, Su serenidad inunda nuestra mente.',
    prayer:
        'Señor Jesús, hoy rindo ante Tu presencia cada preocupación e incertidumbre. Llena mi corazón de Tu paz perfecta que sobrepasa todo entendimiento humano. Amén.',
  ),
  DevotionalTopic(
    id: 'esperanza',
    label: 'Esperanza',
    icon: LucideIcons.sun,
    reference: 'Jeremías 29:11',
    verse:
        'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    reflection:
        'Dios tiene trazado un propósito eterno para tu vida. Incluso en medio de temporadas de espera o prueba, Sus designios permanecen inalterables y llenos de bondad.',
    prayer:
        'Padre Celestial, renuevo hoy mi confianza en Tus promesas eternas. Guíame a caminar con gozo y firmeza, sabiendo que mi futuro está seguro en Tus manos. Amén.',
  ),
  DevotionalTopic(
    id: 'fortaleza',
    label: 'Fortaleza',
    icon: LucideIcons.shield,
    reference: 'Isaías 40:29-31',
    verse:
        'Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas... los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.',
    reflection:
        'Nuestras fuerzas humanas se agotan, pero el poder de Jehová es inagotable. Esperar en Dios no es inactividad, sino confianza activa en Su socorro oportuno.',
    prayer:
        'Amado Dios, cuando mis fuerzas decaigan, recuérdame que Tu poder se perfecciona en mi debilidad. Levanto mis ojos a Ti y recibo nuevo vigor hoy. Amén.',
  ),
  DevotionalTopic(
    id: 'amor',
    label: 'Amor',
    icon: LucideIcons.sparkles,
    reference: '1 Corintios 13:4-7',
    verse:
        'El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece; no hace nada indebido, no busca lo suyo, no se irrita, no guarda rencor.',
    reflection:
        'El amor ágape es el mayor testimonio del creyente. No es una emoción pasajera, sino una decisión diaria de reflejar el perdón y la gracia de Cristo hacia nuestro prójimo.',
    prayer:
        'Señor, derrama Tu amor en mi corazón para que pueda perdonar, servir y edificar a quienes me rodean, siendo un instrumento genuino de Tu gracia. Amén.',
  ),
  DevotionalTopic(
    id: 'sabiduria',
    label: 'Sabiduría',
    icon: LucideIcons.bookOpen,
    reference: 'Santiago 1:5',
    verse:
        'Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.',
    reflection:
        'La verdadera sabiduría no proviene de la erudición humana, sino del temor de Dios y la obediencia a Su Palabra. Él responde con generosidad a quien la busca con humildad.',
    prayer:
        'Dios todopoderoso, concédeme discernimiento y sabiduría del cielo para tomar cada decisión conforme a Tu santa voluntad en este día. Amén.',
  ),
];

class SanctuaryHomeView extends ConsumerStatefulWidget {
  final Function(int targetTabIndex) onNavigateTab;

  const SanctuaryHomeView({
    super.key,
    required this.onNavigateTab,
  });

  @override
  ConsumerState<SanctuaryHomeView> createState() => _SanctuaryHomeViewState();
}

class _SanctuaryHomeViewState extends ConsumerState<SanctuaryHomeView> {
  int _selectedTopicIndex = 0;
  String _activeDevotionalTab = 'verse'; // 'verse', 'reflection', 'prayer'
  bool _isPlayingAudio = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final topic = kDevotionalTopics[_selectedTopicIndex];

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
            const SanctuaryChurchLogo(
              size: 26,
              variant: LogoVariant.symbol,
              showText: false,
            ),
            const SizedBox(width: 8),
            Text(
              'Santuario Digital',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w800,
                fontSize: 17,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.search),
            tooltip: 'Buscar en las Escrituras',
            onPressed: () =>
                widget.onNavigateTab(2), // Tab 2: Biblioteca & Búsqueda
          ),
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
          IconButton(
            icon: const Icon(LucideIcons.helpCircle),
            tooltip: 'Guía Rápida',
            onPressed: () => CoachMarkGuideDialog.show(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Daily Topic Selector Chips
            SizedBox(
              height: 42,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: kDevotionalTopics.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final item = kDevotionalTopics[index];
                  final isSelected = index == _selectedTopicIndex;
                  return ChoiceChip(
                    label: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          item.icon,
                          size: 14,
                          color: isSelected
                              ? Colors.white
                              : SanctuaryColors.sunOrange,
                        ),
                        const SizedBox(width: 6),
                        Text(item.label),
                      ],
                    ),
                    selected: isSelected,
                    selectedColor: SanctuaryColors.waveNavy,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : theme.colorScheme.onSurface,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedTopicIndex = index;
                        });
                      }
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            // Devotional Main Card
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: theme.colorScheme.outline.withOpacity(0.3),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Card Header with Sub-tabs
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: SanctuaryColors.sunOrange.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            topic.reference,
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w800,
                              fontSize: 12,
                              color: SanctuaryColors.sunOrange,
                            ),
                          ),
                        ),
                        // Sub-tabs
                        Container(
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surfaceVariant,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              _buildSubTabButton('Versículo', 'verse'),
                              _buildSubTabButton('Reflexión', 'reflection'),
                              _buildSubTabButton('Oración', 'prayer'),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 18),

                    // Devotional Dynamic Content
                    if (_activeDevotionalTab == 'verse') ...[
                      Text(
                        '«${topic.verse}»',
                        style: GoogleFonts.literata(
                          fontSize: 17,
                          height: 1.7,
                          fontStyle: FontStyle.italic,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ] else if (_activeDevotionalTab == 'reflection') ...[
                      Text(
                        topic.reflection,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          height: 1.6,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ] else ...[
                      Text(
                        topic.prayer,
                        style: GoogleFonts.literata(
                          fontSize: 15.5,
                          height: 1.65,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],

                    const SizedBox(height: 18),

                    // Action Buttons
                    Row(
                      children: [
                        IconButton.filledTonal(
                          onPressed: () {
                            setState(() {
                              _isPlayingAudio = !_isPlayingAudio;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(_isPlayingAudio
                                    ? 'Reproduciendo audio devocional...'
                                    : 'Audio pausado.'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          icon: Icon(
                            _isPlayingAudio
                                ? LucideIcons.volumeX
                                : LucideIcons.volume2,
                            color: SanctuaryColors.sunOrange,
                          ),
                          tooltip: 'Escuchar devocional en voz alta',
                        ),
                        const Spacer(),
                        FilledButton.icon(
                          onPressed: () => widget.onNavigateTab(1), // Lector
                          style: FilledButton.styleFrom(
                            backgroundColor: SanctuaryColors.waveNavy,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: const Icon(LucideIcons.bookOpen, size: 16),
                          label: const Text('Abrir en Lector'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Modules Grid Section Title
            Text(
              'Herramientas del Santuario',
              style: GoogleFonts.inter(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 12),

            // Modules Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.15,
              children: [
                _buildModuleCard(
                  title: 'Lector Bíblico',
                  subtitle: '66 Libros y audio TTS',
                  icon: LucideIcons.bookOpen,
                  color: SanctuaryColors.waveNavy,
                  onTap: () => widget.onNavigateTab(1),
                ),
                _buildModuleCard(
                  title: 'Versículos Guardados',
                  subtitle: 'Marcadores y notas',
                  icon: LucideIcons.bookmark,
                  color: SanctuaryColors.sunOrange,
                  onTap: () => widget.onNavigateTab(3),
                ),
                _buildModuleCard(
                  title: 'Mapas Bíblicos',
                  subtitle: 'Viajes de Pablo y Éxodo',
                  icon: LucideIcons.mapPin,
                  color: SanctuaryColors.cyanAccent,
                  onTap: () => widget.onNavigateTab(4),
                ),
                _buildModuleCard(
                  title: 'Prédicas & Eventos',
                  subtitle: 'Modo presentación HD',
                  icon: LucideIcons.mic,
                  color: SanctuaryColors.brandPurple,
                  onTap: () => widget.onNavigateTab(5),
                ),
                _buildModuleCard(
                  title: 'Mentor IA',
                  subtitle: 'Modo Prueba (2/día)',
                  icon: LucideIcons.sparkles,
                  color: SanctuaryColors.emeraldGreen,
                  badge: '2/DÍA',
                  onTap: () => widget.onNavigateTab(6),
                ),
                _buildModuleCard(
                  title: 'Ajustes & Respaldo',
                  subtitle: 'Exportar/Importar JSON',
                  icon: LucideIcons.settings,
                  color: const Color(0xFF705335),
                  onTap: () => widget.onNavigateTab(7),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSubTabButton(String title, String tabKey) {
    final isSelected = _activeDevotionalTab == tabKey;
    return GestureDetector(
      onTap: () {
        setState(() {
          _activeDevotionalTab = tabKey;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? SanctuaryColors.waveNavy : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected
                ? Colors.white
                : Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
          ),
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    String? badge,
  }) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.3),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                if (badge != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: SanctuaryColors.sunOrange,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      badge,
                      style: GoogleFonts.inter(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    fontSize: 13.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: theme.colorScheme.onSurface.withOpacity(0.65),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
