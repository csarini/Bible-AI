import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'sanctuary_colors.dart';

/// Extension de Tema para soportar tokens semánticos específicos de El-Shaddai
@immutable
class SanctuaryThemeExtension extends ThemeExtension<SanctuaryThemeExtension> {
  final Color surfaceElevated;
  final Color textSecondary;
  final Color activeState;
  final Color border;
  final Color brandNavy;
  final Color brandOrange;
  final Color brandCyan;
  final Color brandAmber;
  final Color brandPurple;
  final Color brandGreen;

  const SanctuaryThemeExtension({
    required this.surfaceElevated,
    required this.textSecondary,
    required this.activeState,
    required this.border,
    required this.brandNavy,
    required this.brandOrange,
    required this.brandCyan,
    required this.brandAmber,
    required this.brandPurple,
    required this.brandGreen,
  });

  @override
  SanctuaryThemeExtension copyWith({
    Color? surfaceElevated,
    Color? textSecondary,
    Color? activeState,
    Color? border,
    Color? brandNavy,
    Color? brandOrange,
    Color? brandCyan,
    Color? brandAmber,
    Color? brandPurple,
    Color? brandGreen,
  }) {
    return SanctuaryThemeExtension(
      surfaceElevated: surfaceElevated ?? this.surfaceElevated,
      textSecondary: textSecondary ?? this.textSecondary,
      activeState: activeState ?? this.activeState,
      border: border ?? this.border,
      brandNavy: brandNavy ?? this.brandNavy,
      brandOrange: brandOrange ?? this.brandOrange,
      brandCyan: brandCyan ?? this.brandCyan,
      brandAmber: brandAmber ?? this.brandAmber,
      brandPurple: brandPurple ?? this.brandPurple,
      brandGreen: brandGreen ?? this.brandGreen,
    );
  }

  @override
  SanctuaryThemeExtension lerp(
      ThemeExtension<SanctuaryThemeExtension>? other, double t) {
    if (other is! SanctuaryThemeExtension) return this;
    return SanctuaryThemeExtension(
      surfaceElevated: Color.lerp(surfaceElevated, other.surfaceElevated, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      activeState: Color.lerp(activeState, other.activeState, t)!,
      border: Color.lerp(border, other.border, t)!,
      brandNavy: Color.lerp(brandNavy, other.brandNavy, t)!,
      brandOrange: Color.lerp(brandOrange, other.brandOrange, t)!,
      brandCyan: Color.lerp(brandCyan, other.brandCyan, t)!,
      brandAmber: Color.lerp(brandAmber, other.brandAmber, t)!,
      brandPurple: Color.lerp(brandPurple, other.brandPurple, t)!,
      brandGreen: Color.lerp(brandGreen, other.brandGreen, t)!,
    );
  }
}

extension SanctuaryThemeContext on BuildContext {
  SanctuaryThemeExtension get sanctuaryTokens =>
      Theme.of(this).extension<SanctuaryThemeExtension>() ??
      const SanctuaryThemeExtension(
        surfaceElevated: SanctuaryColors.lightSurfaceElevated,
        textSecondary: SanctuaryColors.lightTextSecondary,
        activeState: SanctuaryColors.waveNavy,
        border: SanctuaryColors.lightBorder,
        brandNavy: SanctuaryColors.waveNavy,
        brandOrange: SanctuaryColors.sunOrange,
        brandCyan: SanctuaryColors.cyanAccent,
        brandAmber: SanctuaryColors.amberGold,
        brandPurple: SanctuaryColors.brandPurple,
        brandGreen: SanctuaryColors.emeraldGreen,
      );
}

class SanctuaryTheme {
  SanctuaryTheme._();

  // ===========================================================================
  // MODO CLARO (LIGHT)
  // Background: #FAF8F5, Surface: #FFFFFF, Surface Elevated: #F8F6F2
  // Text Primary: #1B1C19, Text Secondary: #454652, Border: rgba(11, 43, 104, 0.15)
  // ===========================================================================
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
        surfaceContainerHighest: SanctuaryColors.lightSurfaceElevated,
      ),
      extensions: const [
        SanctuaryThemeExtension(
          surfaceElevated: SanctuaryColors.lightSurfaceElevated,
          textSecondary: SanctuaryColors.lightTextSecondary,
          activeState: SanctuaryColors.waveNavy,
          border: SanctuaryColors.lightBorder,
          brandNavy: SanctuaryColors.waveNavy,
          brandOrange: SanctuaryColors.sunOrange,
          brandCyan: SanctuaryColors.cyanAccent,
          brandAmber: SanctuaryColors.amberGold,
          brandPurple: SanctuaryColors.brandPurple,
          brandGreen: SanctuaryColors.emeraldGreen,
        ),
      ],
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
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.lightBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: SanctuaryColors.lightBackground,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: SanctuaryColors.lightSurface,
        indicatorColor: SanctuaryColors.waveNavy.withValues(alpha: 0.12),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? SanctuaryColors.waveNavy
                : SanctuaryColors.lightTextSecondary,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: isSelected
                ? SanctuaryColors.waveNavy
                : SanctuaryColors.lightTextSecondary,
            size: 20,
          );
        }),
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
        labelStyle:
            GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: SanctuaryColors.sunOrange,
          foregroundColor: Colors.white,
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle:
              GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: SanctuaryColors.waveNavy,
          side: const BorderSide(color: SanctuaryColors.lightBorder),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
          textStyle:
              GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SanctuaryColors.lightSurfaceElevated,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SanctuaryColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SanctuaryColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              const BorderSide(color: SanctuaryColors.waveNavy, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(
            color: SanctuaryColors.lightTextSecondary, fontSize: 14),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected))
            return SanctuaryColors.sunOrange;
          return SanctuaryColors.lightTextSecondary;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected))
            return SanctuaryColors.sunOrange.withValues(alpha: 0.35);
          return SanctuaryColors.lightSurfaceElevated;
        }),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: SanctuaryColors.sunOrange,
        thumbColor: SanctuaryColors.sunOrange,
        inactiveTrackColor: SanctuaryColors.lightBorder,
      ),
      textTheme: _buildTextTheme(
        textColor: SanctuaryColors.lightTextPrimary,
        secondaryColor: SanctuaryColors.lightTextSecondary,
      ),
    );
  }

  // ===========================================================================
  // MODO SEPIA (CÁLIDO)
  // Background: #F5EFE6, Surface: #FAF6EF, Surface Elevated: #EFE7D8
  // Text Primary: #2D2319, Text Secondary: #705335, Active State: #5C4228
  // ===========================================================================
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
        surfaceContainerHighest: SanctuaryColors.sepiaSurfaceElevated,
      ),
      extensions: const [
        SanctuaryThemeExtension(
          surfaceElevated: SanctuaryColors.sepiaSurfaceElevated,
          textSecondary: SanctuaryColors.sepiaTextSecondary,
          activeState: SanctuaryColors.sepiaActive,
          border: SanctuaryColors.sepiaBorder,
          brandNavy: SanctuaryColors.waveNavy,
          brandOrange: SanctuaryColors.sunOrange,
          brandCyan: SanctuaryColors.cyanAccent,
          brandAmber: SanctuaryColors.amberGold,
          brandPurple: SanctuaryColors.brandPurple,
          brandGreen: SanctuaryColors.emeraldGreen,
        ),
      ],
      appBarTheme: AppBarTheme(
        backgroundColor: SanctuaryColors.sepiaBackground,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme:
            const IconThemeData(color: SanctuaryColors.sepiaTextSecondary),
        titleTextStyle: GoogleFonts.inter(
          color: SanctuaryColors.sepiaTextPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: SanctuaryColors.sepiaSurface,
        elevation: 0,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.sepiaBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: SanctuaryColors.sepiaBackground,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: SanctuaryColors.sepiaSurface,
        indicatorColor: SanctuaryColors.sepiaActive.withValues(alpha: 0.15),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? SanctuaryColors.sepiaActive
                : SanctuaryColors.sepiaTextSecondary,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: isSelected
                ? SanctuaryColors.sepiaActive
                : SanctuaryColors.sepiaTextSecondary,
            size: 20,
          );
        }),
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
        labelStyle:
            GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: SanctuaryColors.sepiaActive,
          foregroundColor: SanctuaryColors.sepiaSurface,
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle:
              GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: SanctuaryColors.sepiaTextPrimary,
          side: const BorderSide(color: SanctuaryColors.sepiaBorder),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
          textStyle:
              GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SanctuaryColors.sepiaSurfaceElevated,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SanctuaryColors.sepiaBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SanctuaryColors.sepiaBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              const BorderSide(color: SanctuaryColors.sepiaActive, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(
            color: SanctuaryColors.sepiaTextSecondary, fontSize: 14),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected))
            return SanctuaryColors.sepiaActive;
          return SanctuaryColors.sepiaTextSecondary;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected))
            return SanctuaryColors.sepiaActive.withValues(alpha: 0.35);
          return SanctuaryColors.sepiaSurfaceElevated;
        }),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: SanctuaryColors.sepiaActive,
        thumbColor: SanctuaryColors.sepiaActive,
        inactiveTrackColor: SanctuaryColors.sepiaBorder,
      ),
      textTheme: _buildTextTheme(
        textColor: SanctuaryColors.sepiaTextPrimary,
        secondaryColor: SanctuaryColors.sepiaTextSecondary,
      ),
    );
  }

  // ===========================================================================
  // MODO OSCURO (DARK)
  // Background: #0B0F19, Surface: #131722, Surface Elevated: #1C2337
  // Text Primary: #F1F3F9, Text Secondary: #9AA5C2, Active State: #2B3990
  // ===========================================================================
  static ThemeData dark() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: SanctuaryColors.darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: SanctuaryColors.sunOrange,
        secondary: SanctuaryColors.cyanAccent,
        tertiary: SanctuaryColors.darkActive,
        surface: SanctuaryColors.darkSurface,
        onSurface: SanctuaryColors.darkTextPrimary,
        outline: SanctuaryColors.darkBorder,
        outlineVariant: SanctuaryColors.darkBorderStrong,
        surfaceContainerHighest: SanctuaryColors.darkSurfaceElevated,
      ),
      extensions: const [
        SanctuaryThemeExtension(
          surfaceElevated: SanctuaryColors.darkSurfaceElevated,
          textSecondary: SanctuaryColors.darkTextSecondary,
          activeState: SanctuaryColors.darkActive,
          border: SanctuaryColors.darkBorder,
          brandNavy: SanctuaryColors.waveNavy,
          brandOrange: SanctuaryColors.sunOrange,
          brandCyan: SanctuaryColors.cyanAccent,
          brandAmber: SanctuaryColors.amberGold,
          brandPurple: SanctuaryColors.brandPurple,
          brandGreen: SanctuaryColors.emeraldGreen,
        ),
      ],
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
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SanctuaryColors.darkBorder),
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: SanctuaryColors.darkBackground,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: SanctuaryColors.darkSurface,
        indicatorColor: SanctuaryColors.darkActive.withValues(alpha: 0.4),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? SanctuaryColors.sunOrange
                : SanctuaryColors.darkTextSecondary,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: isSelected
                ? SanctuaryColors.sunOrange
                : SanctuaryColors.darkTextSecondary,
            size: 20,
          );
        }),
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
        labelStyle:
            GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: SanctuaryColors.sunOrange,
          foregroundColor: Colors.white,
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle:
              GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: SanctuaryColors.darkTextPrimary,
          side: const BorderSide(color: SanctuaryColors.darkBorder),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
          textStyle:
              GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SanctuaryColors.darkSurfaceElevated,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SanctuaryColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SanctuaryColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              const BorderSide(color: SanctuaryColors.sunOrange, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(
            color: SanctuaryColors.darkTextSecondary, fontSize: 14),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected))
            return SanctuaryColors.sunOrange;
          return SanctuaryColors.darkTextSecondary;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected))
            return SanctuaryColors.sunOrange.withValues(alpha: 0.35);
          return SanctuaryColors.darkSurfaceElevated;
        }),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: SanctuaryColors.sunOrange,
        thumbColor: SanctuaryColors.sunOrange,
        inactiveTrackColor: SanctuaryColors.darkBorder,
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
