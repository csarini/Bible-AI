import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'sanctuary_colors.dart';

class SanctuaryTheme {
  SanctuaryTheme._();

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: SanctuaryColors.lightBackground,
      colorScheme: const ColorScheme.light(
        primary: SanctuaryColors.waveNavy,
        secondary: SanctuaryColors.sunOrange,
        tertiary: SanctuaryColors.cyanAccent,
        surface: SanctuaryColors.lightSurface,
        onSurface: SanctuaryColors.lightTextPrimary,
        outline: SanctuaryColors.lightBorder,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SanctuaryColors.lightBackground,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: SanctuaryColors.waveNavy),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: SanctuaryColors.waveNavy,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardTheme(
        color: SanctuaryColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.lightBorder),
        ),
      ),
      textTheme: _buildTextTheme(
        textColor: SanctuaryColors.lightTextPrimary,
        secondaryColor: SanctuaryColors.lightTextSecondary,
      ),
    );
  }

  static ThemeData dark() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: SanctuaryColors.darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: SanctuaryColors.sunOrange,
        secondary: SanctuaryColors.cyanAccent,
        surface: SanctuaryColors.darkSurface,
        onSurface: SanctuaryColors.darkTextPrimary,
        outline: SanctuaryColors.darkBorder,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SanctuaryColors.darkBackground,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: SanctuaryColors.sunOrange),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: SanctuaryColors.darkTextPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardTheme(
        color: SanctuaryColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.darkBorder),
        ),
      ),
      textTheme: _buildTextTheme(
        textColor: SanctuaryColors.darkTextPrimary,
        secondaryColor: SanctuaryColors.darkTextSecondary,
      ),
    );
  }

  static TextTheme _buildTextTheme({
    required Color textColor,
    required Color secondaryColor,
  }) {
    return TextTheme(
      // Scripture Body Text (High Legibility Serif)
      bodyLarge: GoogleFonts.merriweather(
        fontSize: 17.5,
        height: 1.68,
        fontWeight: FontWeight.w400,
        color: textColor,
        letterSpacing: 0.15,
      ),
      bodyMedium: GoogleFonts.plusJakartaSans(
        fontSize: 15.0,
        height: 1.5,
        color: textColor,
      ),
      bodySmall: GoogleFonts.plusJakartaSans(
        fontSize: 13.0,
        height: 1.4,
        color: secondaryColor,
      ),
      titleLarge: GoogleFonts.merriweather(
        fontSize: 22.0,
        fontWeight: FontWeight.w700,
        color: textColor,
      ),
      titleMedium: GoogleFonts.plusJakartaSans(
        fontSize: 16.0,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      labelSmall: GoogleFonts.plusJakartaSans(
        fontSize: 11.0,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
        color: secondaryColor,
      ),
    );
  }
}
