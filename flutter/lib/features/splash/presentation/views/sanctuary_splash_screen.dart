import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/services/bible_data_import_service.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/sanctuary_church_logo.dart';

class SanctuarySplashScreen extends ConsumerStatefulWidget {
  final AppDatabase database;
  final VoidCallback onComplete;

  const SanctuarySplashScreen({
    super.key,
    required this.database,
    required this.onComplete,
  });

  @override
  ConsumerState<SanctuarySplashScreen> createState() =>
      _SanctuarySplashScreenState();
}

class _SanctuarySplashScreenState extends ConsumerState<SanctuarySplashScreen>
    with SingleTickerProviderStateMixin {
  late final BibleDataImportService _importService;
  late final AnimationController _animController;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;

  double _progress = 0.0;
  String _statusMessage = 'Abriendo Santuario de las Escrituras...';

  @override
  void initState() {
    super.initState();
    _importService = BibleDataImportService(database: widget.database);

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOut,
    );

    _scaleAnimation = Tween<double>(begin: 0.96, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    _animController.forward();
    _startInitialization();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _startInitialization() async {
    final needsImport = await _importService.isImportNeeded();

    if (!needsImport) {
      // Si ya está importado, cerrar de inmediato
      if (mounted) {
        widget.onComplete();
      }
      return;
    }

    // Si aún no se importó: esperar 3 segundos para que realice la importación y cerrar el splashscreen
    try {
      await Future.wait([
        _importService.importAllBibleData(
          onProgress: (progress, message) {
            if (mounted) {
              setState(() {
                _progress = progress;
                _statusMessage = message;
              });
            }
          },
        ),
        Future.delayed(const Duration(seconds: 3)),
      ]);
    } catch (e) {
      debugPrint('Error during Bible data import: $e');
    }

    if (!mounted) return;
    setState(() {
      _progress = 1.0;
      _statusMessage = '¡Bienvenido al Santuario Digital!';
    });

    // Cierre y transición de salida
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) {
      await _animController.reverse();
    }
    if (mounted) {
      widget.onComplete();
    }
  }

  @override
  Widget build(BuildContext context) {
    final visualTheme = ref.watch(appVisualThemeModeProvider);
    final isDark = visualTheme == AppVisualTheme.dark;
    final isSepia = visualTheme == AppVisualTheme.sepia;

    // Background Gradient matching React SplashScreen.tsx
    final bgGradient = isDark
        ? const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0B0F19), Color(0xFF131722), Color(0xFF1C2337)],
          )
        : isSepia
            ? const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFF5EFE6),
                  Color(0xFFEAE0D0),
                  Color(0xFFDFD3BF)
                ],
              )
            : const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFFFFFFF),
                  Color(0xFFFAF8F5),
                  Color(0xFFF5EFEB)
                ],
              );

    final cardBgColor = isSepia
        ? const Color(0xFFFAF6EF).withValues(alpha: 0.94)
        : Colors.white.withValues(alpha: 0.94);

    final cardBorderColor = isDark
        ? const Color(0xFFFED65B).withValues(alpha: 0.35)
        : isSepia
            ? const Color(0xFF705335).withValues(alpha: 0.20)
            : SanctuaryColors.waveNavy.withValues(alpha: 0.12);

    final topLabelColor = isDark
        ? const Color(0xFFFED65B).withValues(alpha: 0.85)
        : isSepia
            ? const Color(0xFF705335).withValues(alpha: 0.80)
            : SanctuaryColors.waveNavy.withValues(alpha: 0.70);

    final quoteTextColor = isDark
        ? const Color(0xFFF1F3F9)
        : isSepia
            ? const Color(0xFF3B2D1F)
            : SanctuaryColors.waveNavy;

    final citationColor = isDark
        ? SanctuaryColors.sunOrange
        : isSepia
            ? const Color(0xFFC25400)
            : SanctuaryColors.sunOrange;

    final progressBarTrack = isDark
        ? Colors.white.withValues(alpha: 0.12)
        : isSepia
            ? const Color(0xFF705335).withValues(alpha: 0.20)
            : SanctuaryColors.waveNavy.withValues(alpha: 0.10);

    final progressBarGradient = isDark
        ? const [Color(0xFFF47B20), Color(0xFFFED65B), Color(0xFF00A3E0)]
        : isSepia
            ? const [Color(0xFFF47B20), Color(0xFF0080C8), Color(0xFF2B3990)]
            : const [Color(0xFFF47B20), Color(0xFF00A3E0), Color(0xFF0B2B68)];

    final progressLabelColor = isDark
        ? Colors.white.withValues(alpha: 0.70)
        : isSepia
            ? const Color(0xFF705335).withValues(alpha: 0.80)
            : SanctuaryColors.waveNavy.withValues(alpha: 0.70);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: bgGradient),
        child: SafeArea(
          child: AnimatedBuilder(
            animation: _animController,
            builder: (context, child) {
              return FadeTransition(
                opacity: _fadeAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: child,
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Subtle Label
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          LucideIcons.sparkles,
                          size: 15,
                          color: SanctuaryColors.sunOrange,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'BIBLIA INTELIGENTE',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2.0,
                            color: topLabelColor,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Center Emblem & Motto
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Card Container
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 28,
                          vertical: 24,
                        ),
                        decoration: BoxDecoration(
                          color: cardBgColor,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: cardBorderColor),
                          boxShadow: [
                            BoxShadow(
                              color: isDark
                                  ? Colors.black54
                                  : Colors.black.withValues(alpha: 0.06),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const SanctuaryChurchLogo(
                          size: 80,
                          variant: LogoVariant.full,
                          showText: true,
                          showSubtitle: true,
                          isDark: false,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Biblical Motto Quote
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          '"Yo soy el Dios Todopoderoso; anda delante de mí y sé perfecto."',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.playfairDisplay(
                            fontStyle: FontStyle.italic,
                            fontSize: 16.5,
                            height: 1.45,
                            color: quoteTextColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Scripture Citation
                      Text(
                        'GÉNESIS 17:1 • EL-SHADDAI',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.6,
                          color: citationColor,
                        ),
                      ),
                    ],
                  ),

                  // Bottom Loading Progress Bar & Status
                  Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(maxWidth: 320),
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Custom Gradient Progress Bar
                        Container(
                          height: 6,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: progressBarTrack,
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: _progress.clamp(0.05, 1.0),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              curve: Curves.easeOut,
                              decoration: BoxDecoration(
                                gradient:
                                    LinearGradient(colors: progressBarGradient),
                                borderRadius: BorderRadius.circular(3),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Progress Message
                        Text(
                          _statusMessage,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.4,
                            color: progressLabelColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
