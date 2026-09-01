import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/theme/sanctuary_colors.dart';

class GuideStep {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String tag;

  const GuideStep({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.tag,
  });
}

const List<GuideStep> kGuideSteps = [
  GuideStep(
    title: '1. Inicio & Devocional Diario',
    description: 'Encuentra versículos diarios seleccionados por temática (Paz, Esperanza, Fortaleza, Sabiduría) con reflexiones espirituales, oraciones guiadas y audio TTS.',
    icon: LucideIcons.home,
    color: SanctuaryColors.sunOrange,
    tag: 'ESPIRITUALIDAD',
  ),
  GuideStep(
    title: '2. Lector Bíblico & Versículos',
    description: 'Lee los 66 libros canónicos con ajuste de tamaño de letra, fuentes (Merriweather, Playfair, Jakarta), interlineado, resaltador multicolor y notas personales.',
    icon: LucideIcons.bookOpen,
    color: SanctuaryColors.waveNavy,
    tag: 'CANON BÍBLICO',
  ),
  GuideStep(
    title: '3. Biblioteca & Búsqueda Rápida',
    description: 'Filtra rápidamente por Antiguo y Nuevo Testamento. Escribe referencias directas como "Juan 3:16" o "Mateo 4" para saltar al versículo al instante.',
    icon: LucideIcons.search,
    color: SanctuaryColors.cyanAccent,
    tag: 'NAVEGACIÓN',
  ),
  GuideStep(
    title: '4. Mapas Bíblicos Interactivos',
    description: 'Explora los 4 viajes misioneros del apóstol Pablo, la ruta del Éxodo por el Mar Rojo y el Monte Sinaí con detalles geográficos e históricos.',
    icon: LucideIcons.map,
    color: SanctuaryColors.waveNavy,
    tag: 'GEOGRAFÍA BÍBLICA',
  ),
  GuideStep(
    title: '5. Prédicas & Modo Púlpito HD',
    description: 'Diseñado para pastores y predicadores: vista de alto contraste para proyección, temporizador de mensaje, notas de sermón y control de tipografía grande.',
    icon: LucideIcons.mic,
    color: SanctuaryColors.brandPurple,
    tag: 'MINISTERIO',
  ),
  GuideStep(
    title: '6. Mentor Teológico IA',
    description: 'Consulta dudas doctrinales, contexto histórico y pasajes paralelos con asistencia de IA responsable basada estrictamente en las Sagradas Escrituras.',
    icon: LucideIcons.sparkles,
    color: Color(0xFF10B981),
    tag: 'ESTUDIO BÍBLICO',
  ),
  GuideStep(
    title: '7. Ajustes, 3 Temas & Respaldo JSON',
    description: 'Alterna al instante entre modo Claro (Pergamino), Sepia (Cálido) y Oscuro (Noche). Exporta e importa copias de seguridad de todas tus notas en formato JSON.',
    icon: LucideIcons.settings,
    color: Color(0xFF705335),
    tag: 'PERSONALIZACIÓN',
  ),
];

class CoachMarkGuideDialog extends StatefulWidget {
  final Function(int targetTab)? onNavigateToSection;

  const CoachMarkGuideDialog({super.key, this.onNavigateToSection});

  static void show(BuildContext context, {Function(int targetTab)? onNavigate}) {
    showDialog(
      context: context,
      builder: (_) => CoachMarkGuideDialog(onNavigateToSection: onNavigate),
    );
  }

  @override
  State<CoachMarkGuideDialog> createState() => _CoachMarkGuideDialogState();
}

class _CoachMarkGuideDialogState extends State<CoachMarkGuideDialog> {
  int _currentStepIndex = 0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final step = kGuideSteps[_currentStepIndex];
    final isLastStep = _currentStepIndex == kGuideSteps.length - 1;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: theme.colorScheme.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 520),
        padding: const EdgeInsets.all(22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: step.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    step.tag,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                      color: step.color,
                    ),
                  ),
                ),
                Text(
                  'Paso ${_currentStepIndex + 1} de ${kGuideSteps.length}',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // Step Visual Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: step.color.withOpacity(0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: step.color.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: step.color,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(step.icon, size: 28, color: Colors.white),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      step.title,
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Description
            Text(
              step.description,
              style: GoogleFonts.inter(
                fontSize: 13.5,
                height: 1.6,
                color: theme.colorScheme.onSurface.withOpacity(0.85),
              ),
            ),

            const SizedBox(height: 22),

            // Step Indicators Dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(kGuideSteps.length, (index) {
                final isCurrent = index == _currentStepIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isCurrent ? 24 : 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: isCurrent ? SanctuaryColors.waveNavy : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),

            const SizedBox(height: 20),

            // Actions (Previous / Next / Finish)
            Row(
              children: [
                if (_currentStepIndex > 0)
                  TextButton(
                    onPressed: () => setState(() => _currentStepIndex--),
                    child: const Text('Anterior'),
                  )
                else
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Omitir'),
                  ),
                const Spacer(),
                FilledButton.icon(
                  onPressed: () {
                    if (isLastStep) {
                      Navigator.pop(context);
                    } else {
                      setState(() => _currentStepIndex++);
                    }
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: SanctuaryColors.waveNavy,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: Icon(isLastStep ? LucideIcons.check : LucideIcons.arrowRight, size: 16),
                  label: Text(isLastStep ? '¡Comenzar!' : 'Siguiente'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
