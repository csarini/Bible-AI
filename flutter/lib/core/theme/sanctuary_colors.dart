import 'package:flutter/material.dart';

/// Digital Sanctuary Design System Color Tokens (Synchronized with React Reference)
/// Brand: Iglesia Cristiana El-Shaddai (Navy, Sun Orange, Cyan, Amber Gold)
/// Themes: Light (#FAF8F5), Sepia (#F5EFE6), Dark (#0B0F19)
class SanctuaryColors {
  SanctuaryColors._();

  // --- Brand Identity Palette (Matching El-Shaddai React Specs) ---
  static const Color waveNavy = Color(0xFF0B2B68); // Institutional El-Shaddai Navy
  static const Color waveNavySecondary = Color(0xFF243372);
  static const Color sunOrange = Color(0xFFF25C05); // Institutional El-Shaddai Orange
  static const Color sunOrangeAccent = Color(0xFFF47B20);
  static const Color cyanAccent = Color(0xFF00A3E0); // Institutional El-Shaddai Cyan
  static const Color amberGold = Color(0xFFFED65B); // Institutional El-Shaddai Amber/Gold
  static const Color brandPurple = Color(0xFF4E53A4);
  static const Color emeraldGreen = Color(0xFF10B981);

  // --- Light Theme (Matching React App: #FAF8F5, #FFFFFF, text #1B1C19) ---
  static const Color lightBackground = Color(0xFFFAF8F5);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFF8F6F2);
  static const Color lightBorder = Color(0x260B2B68); // rgba(11, 43, 104, 0.15)
  static const Color lightBorderStrong = Color(0xFFEAE8E3);
  static const Color lightTextPrimary = Color(0xFF1B1C19);
  static const Color lightTextSecondary = Color(0xFF454652);

  // --- Sepia Theme (Matching React App: #F5EFE6, #FAF6EF, text #2D2319) ---
  static const Color sepiaBackground = Color(0xFFF5EFE6);
  static const Color sepiaSurface = Color(0xFFFAF6EF);
  static const Color sepiaSurfaceElevated = Color(0xFFEFE7D8);
  static const Color sepiaBorder = Color(0x33705335); // rgba(112, 83, 53, 0.20)
  static const Color sepiaBorderStrong = Color(0xFFD8CCBA);
  static const Color sepiaTextPrimary = Color(0xFF2D2319);
  static const Color sepiaTextSecondary = Color(0xFF705335);
  static const Color sepiaActive = Color(0xFF5C4228);

  // --- Dark Theme (Matching React App: #0B0F19, #131722, text #F1F3F9) ---
  static const Color darkBackground = Color(0xFF0B0F19);
  static const Color darkSurface = Color(0xFF131722);
  static const Color darkSurfaceElevated = Color(0xFF1C2337);
  static const Color darkBorder = Color(0xFF252D43);
  static const Color darkBorderStrong = Color(0xFF2B3964);
  static const Color darkTextPrimary = Color(0xFFF1F3F9);
  static const Color darkTextSecondary = Color(0xFF9AA5C2);
  static const Color darkActive = Color(0xFF2B3990);

  // --- Pastel Highlight Palette (Scripture Highlighting) ---
  static const Color highlightYellow = Color(0xFFFFF2B2);
  static const Color highlightGreen = Color(0xFFD2F5D7);
  static const Color highlightBlue = Color(0xFFD3E7FF);
  static const Color highlightOrange = Color(0xFFFFDFCC);
  static const Color highlightPurple = Color(0xFFE9E4FF);

  static const List<Color> pastelPalette = [
    highlightYellow,
    highlightGreen,
    highlightBlue,
    highlightOrange,
    highlightPurple,
  ];

  static Color getHighlightColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('0xFF$clean'));
    } catch (_) {
      return highlightYellow;
    }
  }

  static String colorToHex(Color color) {
    return '#${color.toARGB32().toRadixString(16).substring(2).toUpperCase()}';
  }
}
