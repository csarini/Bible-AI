import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/sanctuary_colors.dart';

enum LogoVariant { full, symbol, horizontal }

/// Official El-Shaddai Church Emblem & Branding Widget
/// Matches the provided logos for light and dark themes:
/// - Light Theme: Vibrant Sunburst + Navy/Cyan waves + Navy "El-Shaddai" & "DIOS TODOPODEROSO"
/// - Dark Theme: Vibrant Sunburst + Navy/Cyan waves + White "El-Shaddai" & Sun Orange "DIOS TODOPODEROSO"
class SanctuaryChurchLogo extends StatelessWidget {
  final double size;
  final LogoVariant variant;
  final bool showText;
  final bool showSubtitle;
  final bool? isDark;

  const SanctuaryChurchLogo({
    super.key,
    this.size = 48.0,
    this.variant = LogoVariant.full,
    this.showText = true,
    this.showSubtitle = true,
    this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveIsDark =
        isDark ?? (Theme.of(context).brightness == Brightness.dark);
    final titleColor =
        effectiveIsDark ? Colors.white : SanctuaryColors.waveNavy;
    final subtitleColor =
        effectiveIsDark ? SanctuaryColors.sunOrange : SanctuaryColors.waveNavy;

    final emblemHeight = size * (1172.0 / 2081.0);

    final emblem = Image.asset(
      'assets/images/shaddai-emblem.png',
      width: size,
      height: emblemHeight,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      errorBuilder: (context, error, stackTrace) {
        return CustomPaint(
          size: Size(size, emblemHeight),
          painter: _ElShaddaiEmblemPainter(),
        );
      },
    );

    if (variant == LogoVariant.symbol) {
      return SizedBox(
        width: size,
        height: emblemHeight,
        child: emblem,
      );
    }

    if (variant == LogoVariant.horizontal) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: size,
            height: emblemHeight,
            child: emblem,
          ),
          if (showText) ...[
            const SizedBox(width: 10),
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'El-Shaddai',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: size * 0.42,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                    color: titleColor,
                    letterSpacing: -0.5,
                    height: 1.0,
                  ),
                ),
                if (showSubtitle) ...[
                  const SizedBox(height: 2),
                  Text(
                    'DIOS TODOPODEROSO',
                    style: GoogleFonts.inter(
                      fontSize: size * 0.18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.4,
                      color: subtitleColor,
                      height: 1.0,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: size,
          height: emblemHeight,
          child: emblem,
        ),
        if (showText) ...[
          const SizedBox(height: 8),
          Text(
            'El-Shaddai',
            style: GoogleFonts.playfairDisplay(
              fontSize: size * 0.45,
              fontWeight: FontWeight.bold,
              fontStyle: FontStyle.italic,
              color: titleColor,
              letterSpacing: -0.5,
              height: 1.0,
            ),
          ),
          if (showSubtitle) ...[
            const SizedBox(height: 4),
            Text(
              'DIOS TODOPODEROSO',
              style: GoogleFonts.inter(
                fontSize: size * 0.19,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.8,
                color: subtitleColor,
              ),
            ),
          ],
        ],
      ],
    );
  }
}

class _ElShaddaiEmblemPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Sunburst Radiant Gradient Paint
    final sunPaint = Paint()
      ..shader = const RadialGradient(
        center: Alignment(0.0, 0.7),
        radius: 0.8,
        colors: [
          SanctuaryColors.sunOrange,
          Color(0xFFE65100),
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    // Navy Wave Gradient Paint
    final navyWavePaint = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFF1C276E),
          SanctuaryColors.waveNavy,
          SanctuaryColors.brandPurple,
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    // Vivid Cyan Wave Gradient Paint
    final cyanWavePaint = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFF0080C8),
          SanctuaryColors.cyanAccent,
          Color(0xFF38BDF8),
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    // Scale reference coordinates 500x350
    final sx = w / 500.0;
    final sy = h / 350.0;

    // Draw Sunburst Rays with Cross Negative Space
    final ray1 = Path()
      ..moveTo(45 * sx, 220 * sy)
      ..quadraticBezierTo(80 * sx, 150 * sy, 150 * sx, 100 * sy)
      ..lineTo(195 * sx, 145 * sy)
      ..quadraticBezierTo(125 * sx, 195 * sy, 80 * sx, 230 * sy)
      ..close();
    canvas.drawPath(ray1, sunPaint);

    final ray2 = Path()
      ..moveTo(120 * sx, 115 * sy)
      ..quadraticBezierTo(190 * sx, 60 * sy, 260 * sx, 40 * sy)
      ..lineTo(250 * sx, 110 * sy)
      ..quadraticBezierTo(180 * sx, 138 * sy, 145 * sx, 168 * sy)
      ..close();
    canvas.drawPath(ray2, sunPaint);

    final ray3 = Path()
      ..moveTo(215 * sx, 45 * sy)
      ..lineTo(240 * sx, 40 * sy)
      ..lineTo(240 * sx, 85 * sy)
      ..lineTo(205 * sx, 85 * sy)
      ..lineTo(205 * sx, 105 * sy)
      ..lineTo(240 * sx, 105 * sy)
      ..lineTo(240 * sx, 240 * sy)
      ..lineTo(195 * sx, 235 * sy)
      ..close();
    canvas.drawPath(ray3, sunPaint);

    final ray4 = Path()
      ..moveTo(285 * sx, 45 * sy)
      ..lineTo(260 * sx, 40 * sy)
      ..lineTo(260 * sx, 85 * sy)
      ..lineTo(295 * sx, 85 * sy)
      ..lineTo(295 * sx, 105 * sy)
      ..lineTo(260 * sx, 105 * sy)
      ..lineTo(260 * sx, 240 * sy)
      ..lineTo(305 * sx, 235 * sy)
      ..close();
    canvas.drawPath(ray4, sunPaint);

    final ray5 = Path()
      ..moveTo(380 * sx, 115 * sy)
      ..quadraticBezierTo(310 * sx, 60 * sy, 240 * sx, 40 * sy)
      ..lineTo(250 * sx, 110 * sy)
      ..quadraticBezierTo(320 * sx, 138 * sy, 355 * sx, 168 * sy)
      ..close();
    canvas.drawPath(ray5, sunPaint);

    final ray6 = Path()
      ..moveTo(455 * sx, 220 * sy)
      ..quadraticBezierTo(420 * sx, 150 * sy, 350 * sx, 100 * sy)
      ..lineTo(305 * sx, 145 * sy)
      ..quadraticBezierTo(375 * sx, 195 * sy, 420 * sx, 230 * sy)
      ..close();
    canvas.drawPath(ray6, sunPaint);

    // Primary Deep Navy Wave Ribbon
    final waveNavy = Path()
      ..moveTo(15 * sx, 200 * sy)
      ..cubicTo(65 * sx, 260 * sy, 175 * sx, 250 * sy, 260 * sx, 235 * sy)
      ..cubicTo(350 * sx, 220 * sy, 430 * sx, 245 * sy, 485 * sx, 270 * sy)
      ..cubicTo(440 * sx, 285 * sy, 340 * sx, 260 * sy, 260 * sx, 270 * sy)
      ..cubicTo(170 * sx, 282 * sy, 80 * sx, 270 * sy, 15 * sx, 200 * sy)
      ..close();
    canvas.drawPath(waveNavy, navyWavePaint);

    // Secondary Vivid Cyan Wave Ribbon
    final waveCyan = Path()
      ..moveTo(125 * sx, 285 * sy)
      ..cubicTo(200 * sx, 295 * sy, 305 * sx, 280 * sy, 380 * sx, 275 * sy)
      ..cubicTo(425 * sx, 272 * sy, 445 * sx, 282 * sy, 460 * sx, 295 * sy)
      ..cubicTo(430 * sx, 308 * sy, 370 * sx, 290 * sy, 300 * sx, 295 * sy)
      ..cubicTo(220 * sx, 300 * sy, 160 * sx, 298 * sy, 125 * sx, 285 * sy)
      ..close();
    canvas.drawPath(waveCyan, cyanWavePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
