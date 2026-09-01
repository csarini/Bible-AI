import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';

class PulpitPresentationView extends StatefulWidget {
  final UserEventEntry event;

  const PulpitPresentationView({
    super.key,
    required this.event,
  });

  @override
  State<PulpitPresentationView> createState() => _PulpitPresentationViewState();
}

class _PulpitPresentationViewState extends State<PulpitPresentationView> {
  double _fontSize = 20.0;
  bool _isHighContrastDark = true;
  Timer? _timer;
  int _secondsElapsed = 0;
  bool _isTimerRunning = true;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isTimerRunning) {
        setState(() {
          _secondsElapsed++;
        });
      }
    });
  }

  String _formatTimer(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final bgColor =
        _isHighContrastDark ? const Color(0xFF0F1117) : const Color(0xFFFAF8F5);
    final textColor =
        _isHighContrastDark ? const Color(0xFFF1F3F9) : const Color(0xFF1B1C19);
    final subColor =
        _isHighContrastDark ? const Color(0xFF9E9EA7) : const Color(0xFF705335);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: textColor),
          onPressed: () => Navigator.of(context).pop(),
          tooltip: 'Salir del Modo Púlpito',
        ),
        title: Text(
          'Modo Presentación (Púlpito)',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: textColor,
          ),
        ),
        actions: [
          // Stopwatch pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            margin: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: SanctuaryColors.sunOrange..withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: SanctuaryColors.sunOrange..withValues(alpha: 0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(LucideIcons.clock,
                    size: 14, color: SanctuaryColors.sunOrange),
                const SizedBox(width: 6),
                Text(
                  _formatTimer(_secondsElapsed),
                  style: GoogleFonts.plusJakartaSans(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    color: SanctuaryColors.sunOrange,
                  ),
                ),
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _isTimerRunning = !_isTimerRunning;
                    });
                  },
                  child: Icon(
                    _isTimerRunning ? LucideIcons.pause : LucideIcons.play,
                    size: 14,
                    color: SanctuaryColors.sunOrange,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Theme contrast toggle
          IconButton(
            icon: Icon(
              _isHighContrastDark ? LucideIcons.sun : LucideIcons.moon,
              color: textColor,
            ),
            onPressed: () {
              setState(() {
                _isHighContrastDark = !_isHighContrastDark;
              });
            },
            tooltip: 'Cambiar contraste',
          ),

          // Font size adjustments
          IconButton(
            icon: Icon(LucideIcons.minus, size: 16, color: textColor),
            onPressed: () {
              if (_fontSize > 14) {
                setState(() => _fontSize -= 2);
              }
            },
            tooltip: 'Reducir letra',
          ),
          IconButton(
            icon: Icon(LucideIcons.plus, size: 16, color: textColor),
            onPressed: () {
              if (_fontSize < 32) {
                setState(() => _fontSize += 2);
              }
            },
            tooltip: 'Aumentar letra',
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sermon Title
            Text(
              widget.event.title,
              style: GoogleFonts.merriweather(
                fontSize: _fontSize * 1.35,
                fontWeight: FontWeight.w800,
                color: textColor,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 12),

            // Metadata Row
            Row(
              children: [
                Icon(LucideIcons.calendar, size: 14, color: subColor),
                const SizedBox(width: 6),
                Text(
                  widget.event.eventDate.toLocal().toString().split(' ')[0],
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: subColor,
                  ),
                ),
                if (widget.event.foodServiceDetails != null) ...[
                  const SizedBox(width: 16),
                  Icon(LucideIcons.utensils,
                      size: 14, color: SanctuaryColors.sunOrange),
                  const SizedBox(width: 4),
                  Text(
                    'Cafetería activa',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: SanctuaryColors.sunOrange,
                    ),
                  ),
                ],
              ],
            ),

            const SizedBox(height: 24),
            Divider(color: subColor..withValues(alpha: 0.3)),
            const SizedBox(height: 16),

            // Sermon Notes / Scripture Body
            Text(
              widget.event.description,
              style: GoogleFonts.merriweather(
                fontSize: _fontSize,
                height: 1.8,
                color: textColor,
              ),
            ),

            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }
}
