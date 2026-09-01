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
        outlineVariant: SanctuaryColors.lightBorderStrong,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SanctuaryColors.lightBackground,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: SanctuaryColors.waveNavy),
        titleTextStyle: GoogleFonts.inter(
          color: SanctuaryColors.waveNavy,
          fontSize: 17,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: SanctuaryColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.lightBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: SanctuaryColors.lightBackground,
        elevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SanctuaryColors.lightSurface,
        selectedItemColor: SanctuaryColors.waveNavy,
        unselectedItemColor: SanctuaryColors.lightTextSecondary,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: SanctuaryColors.lightSurface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: SanctuaryColors.lightBorder),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: SanctuaryColors.lightSurfaceElevated,
        selectedColor: SanctuaryColors.waveNavy,
        side: const BorderSide(color: SanctuaryColors.lightBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      textTheme: _buildTextTheme(
        textColor: SanctuaryColors.lightTextPrimary,
        secondaryColor: SanctuaryColors.lightTextSecondary,
      ),
    );
  }

  static ThemeData sepia() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: SanctuaryColors.sepiaBackground,
      colorScheme: const ColorScheme.light(
        primary: SanctuaryColors.sepiaActive,
        secondary: SanctuaryColors.sunOrange,
        tertiary: SanctuaryColors.cyanAccent,
        surface: SanctuaryColors.sepiaSurface,
        onSurface: SanctuaryColors.sepiaTextPrimary,
        outline: SanctuaryColors.sepiaBorder,
        outlineVariant: SanctuaryColors.sepiaBorderStrong,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SanctuaryColors.sepiaBackground,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: SanctuaryColors.sepiaTextSecondary),
        titleTextStyle: GoogleFonts.inter(
          color: SanctuaryColors.sepiaTextPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: SanctuaryColors.sepiaSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.sepiaBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: SanctuaryColors.sepiaBackground,
        elevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SanctuaryColors.sepiaSurface,
        selectedItemColor: SanctuaryColors.sepiaActive,
        unselectedItemColor: SanctuaryColors.sepiaTextSecondary,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: SanctuaryColors.sepiaSurface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: SanctuaryColors.sepiaBorder),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: SanctuaryColors.sepiaSurfaceElevated,
        selectedColor: SanctuaryColors.sepiaActive,
        side: const BorderSide(color: SanctuaryColors.sepiaBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      textTheme: _buildTextTheme(
        textColor: SanctuaryColors.sepiaTextPrimary,
        secondaryColor: SanctuaryColors.sepiaTextSecondary,
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
        outlineVariant: SanctuaryColors.darkBorderStrong,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SanctuaryColors.darkBackground,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: SanctuaryColors.darkTextPrimary),
        titleTextStyle: GoogleFonts.inter(
          color: SanctuaryColors.darkTextPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: SanctuaryColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.darkBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: SanctuaryColors.darkBackground,
        elevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SanctuaryColors.darkSurface,
        selectedItemColor: SanctuaryColors.sunOrange,
        unselectedItemColor: SanctuaryColors.darkTextSecondary,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: SanctuaryColors.darkSurface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: SanctuaryColors.darkBorder),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: SanctuaryColors.darkSurfaceElevated,
        selectedColor: SanctuaryColors.sunOrange,
        side: const BorderSide(color: SanctuaryColors.darkBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
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
      // Scripture Body Text (Literata - High Legibility Serif)
      bodyLarge: GoogleFonts.literata(
        fontSize: 17.5,
        height: 1.68,
        fontWeight: FontWeight.w400,
        color: textColor,
        letterSpacing: 0.15,
      ),
      // General UI Body (Inter)
      bodyMedium: GoogleFonts.inter(
        fontSize: 15.0,
        height: 1.5,
        color: textColor,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 13.0,
        height: 1.4,
        color: secondaryColor,
      ),
      // Display Titles (Playfair Display)
      displaySmall: GoogleFonts.playfairDisplay(
        fontSize: 24.0,
        fontWeight: FontWeight.w700,
        color: textColor,
      ),
      headlineMedium: GoogleFonts.playfairDisplay(
        fontSize: 20.0,
        fontWeight: FontWeight.w700,
        color: textColor,
      ),
      titleLarge: GoogleFonts.playfairDisplay(
        fontSize: 20.0,
        fontWeight: FontWeight.w700,
        color: textColor,
      ),
      // UI Subtitles & Headings (Inter)
      titleMedium: GoogleFonts.inter(
        fontSize: 16.0,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: 14.0,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      labelLarge: GoogleFonts.inter(
        fontSize: 13.0,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: 12.0,
        fontWeight: FontWeight.w600,
        color: secondaryColor,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11.0,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
        color: secondaryColor,
      ),
    );
  }
}
