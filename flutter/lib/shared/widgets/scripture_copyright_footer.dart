import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/services/copyright_guard_service.dart';
import '../../core/theme/sanctuary_colors.dart';

/// ScriptureCopyrightFooter
/// Renders legal attribution, standard copyright citation,
/// and non-commercial disclaimer for biblical translations.
/// Styled according to the "Digital Sanctuary" Design System.
class ScriptureCopyrightFooter extends StatelessWidget {
  final String? translation;
  final bool isCompact;

  const ScriptureCopyrightFooter({
    super.key,
    this.translation,
    this.isCompact = false,
  });

  Future<void> _openUrl(BuildContext context, String urlString) async {
    try {
      final uri = Uri.parse(urlString);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('No se pudo abrir el enlace: $urlString'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    // Only display footer if required by translation
    if (!CopyrightGuardService.isApiBibleTranslation(translation)) {
      return const SizedBox.shrink();
    }

    final info = CopyrightGuardService.getCopyrightInfo(translation);
    final isProtected = info.isCopyrightProtected;

    // Digital Sanctuary Colors: Parchment #F9F6F0, Deep Navy #002147
    const parchmentBg = Color(0xFFF9F6F0);
    const deepNavy = Color(0xFF002147);

    return Container(
      margin: const EdgeInsets.only(top: 24, bottom: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: parchmentBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: deepNavy.withValues(alpha: isProtected ? 0.18 : 0.10),
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            children: [
              const Icon(
                LucideIcons.shieldCheck,
                size: 16,
                color: SanctuaryColors.sunOrange,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${info.abbreviation} • AVISO LEGAL Y DERECHOS DE AUTOR',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                    color: deepNavy,
                  ),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                decoration: BoxDecoration(
                  color: isProtected
                      ? SanctuaryColors.sunOrange.withValues(alpha: 0.12)
                      : deepNavy.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isProtected
                        ? SanctuaryColors.sunOrange.withValues(alpha: 0.3)
                        : Colors.transparent,
                  ),
                ),
                child: Text(
                  isProtected ? 'Derechos Reservados' : 'Dominio Público',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isProtected ? SanctuaryColors.sunOrange : deepNavy,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0x1F002147)),
          const SizedBox(height: 10),

          // Standard Citation Text
          Text(
            '"${info.standardCitation}"',
            style: GoogleFonts.merriweather(
              fontSize: 12.5,
              height: 1.55,
              fontStyle: FontStyle.italic,
              color: deepNavy.withValues(alpha: 0.95),
            ),
          ),
          const SizedBox(height: 10),

          // Mandatory Direct Link for Biblica and Publishers
          if (info.directLinkUrl != null) ...[
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 12,
              runSpacing: 6,
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(6),
                  onTap: () => _openUrl(context, info.directLinkUrl!),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          info.directLinkAnchorText ?? 'Visitar sitio oficial',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: deepNavy,
                            decoration: TextDecoration.underline,
                            decorationColor: SanctuaryColors.sunOrange,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          LucideIcons.externalLink,
                          size: 13,
                          color: SanctuaryColors.sunOrange,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],

          // Legal & Non-Commercial Terms Summary
          if (!isCompact) ...[
            const Divider(height: 1, color: Color(0x1F002147)),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  LucideIcons.info,
                  size: 14,
                  color: Color(0x99002147),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Acuerdo Estrictamente No Comercial: Biblia Inteligente es de acceso libre y gratuito para edificación cristiana. No contiene compras integradas ni suscripciones.',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      height: 1.45,
                      color: deepNavy.withValues(alpha: 0.8),
                    ),
                  ),
                ),
              ],
            ),
            if (isProtected) ...[
              const SizedBox(height: 6),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    LucideIcons.alertTriangle,
                    size: 14,
                    color: SanctuaryColors.sunOrange,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Restricciones Legales (Bíblica, Inc. / Licencias): Prohibida la conversión de texto a audio, scraping masivo de libros o procesamiento de textos con derechos de autor en modelos de IA generativa.',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        height: 1.45,
                        color: deepNavy.withValues(alpha: 0.75),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ],
      ),
    );
  }
}
