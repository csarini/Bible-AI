import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class GuideStep {
  final String title;
  final String description;
  final IconData icon;
  final String tag;
  final int targetIndex; // Índice correspondiente en selectedTabProvider

  const GuideStep({
    required this.title,
    required this.description,
    required this.icon,
    required this.tag,
    required this.targetIndex,
  });
}

const List<GuideStep> kGuideSteps = [
  GuideStep(
    title: '1. Inicio & Devocionales',
    description:
        'Accede al versículo del día, planes devocionales diarios, oraciones temáticas y resumen espiritual de tu jornada.',
    icon: LucideIcons.home,
    tag: 'ESPIRITUALIDAD',
    targetIndex: 0,
  ),
  GuideStep(
    title: '2. Búsqueda & Biblioteca (66 Libros)',
    description:
        'Explora los 66 libros del Antiguo y Nuevo Testamento. Escribe referencias directas (ej. "Juan 3:16") para saltar al texto al instante.',
    icon: LucideIcons.library,
    tag: 'NAVEGACIÓN',
    targetIndex: 2,
  ),
  GuideStep(
    title: '3. Lectura Inmersiva',
    description:
        'Experiencia de lectura inmersiva con selección de tipografías, tamaño de letra, interlineado y resaltador de versículos.',
    icon: LucideIcons.bookOpen,
    tag: 'CANON BÍBLICO',
    targetIndex: 1,
  ),
  GuideStep(
    title: '4. Notas & Versículos Guardados',
    description:
        'Organiza tus versículos marcados, marcadores de lectura y apuntes personales en un solo lugar estructurado.',
    icon: LucideIcons.bookmark,
    tag: 'ESTUDIO PERSONAL',
    targetIndex: 3,
  ),
  GuideStep(
    title: '5. Mentor Teológico IA',
    description:
        'Asistente bíblico con inteligencia artificial para responder consultas doctrinales, contextos históricos y pasajes paralelos.',
    icon: LucideIcons.sparkles,
    tag: 'INTELIGENCIA ARTIFICIAL',
    targetIndex: 6,
  ),
];

class CoachMarkGuideDialog extends StatefulWidget {
  final Function(int targetTab)? onNavigateToSection;

  const CoachMarkGuideDialog({super.key, this.onNavigateToSection});

  static void show(BuildContext context,
      {Function(int targetTab)? onNavigate}) {
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
    final primaryColor = theme.colorScheme.primary;
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
            // Header con Categoría y Progreso
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    step.tag,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                      color: primaryColor,
                    ),
                  ),
                ),
                Text(
                  'Paso ${_currentStepIndex + 1} de ${kGuideSteps.length}',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // Tarjeta del Paso Actual
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: primaryColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: primaryColor.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: primaryColor,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(step.icon,
                        size: 28, color: theme.colorScheme.onPrimary),
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

            // Descripción
            Text(
              step.description,
              style: GoogleFonts.inter(
                fontSize: 13.5,
                height: 1.6,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.85),
              ),
            ),

            const SizedBox(height: 22),

            // Indicadores de Puntos
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
                    color: isCurrent
                        ? primaryColor
                        : theme.colorScheme.outline.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),

            const SizedBox(height: 20),

            // Botones de Navegación
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
                    // Si se pasó una función para cambiar de pantalla al finalizar
                    if (widget.onNavigateToSection != null) {
                      widget.onNavigateToSection!(step.targetIndex);
                    }

                    if (isLastStep) {
                      Navigator.pop(context);
                    } else {
                      setState(() => _currentStepIndex++);
                    }
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: theme.colorScheme.onPrimary,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: Icon(
                      isLastStep ? LucideIcons.check : LucideIcons.arrowRight,
                      size: 16),
                  label: Text(isLastStep ? '¡Entendido!' : 'Siguiente'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
