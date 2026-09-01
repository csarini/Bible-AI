import 'package:flutter/material.dart';

/// Digital Sanctuary Design System Color Tokens
class SanctuaryColors {
  SanctuaryColors._();

  // --- Brand Identity Palette ---
  static const Color sunOrange = Color(0xFFF47B20);
  static const Color waveNavy = Color(0xFF2B3990);
  static const Color brandPurple = Color(0xFF4E53A4);
  static const Color cyanAccent = Color(0xFF00AEEF);

  // --- Light Theme (Soft Parchment Archetype) ---
  static const Color lightBackground = Color(0xFFF9F6F0);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFF2ECE1);
  static const Color lightBorder = Color(0xFFE4DCCE);
  static const Color lightTextPrimary = Color(0xFF1E2028);
  static const Color lightTextSecondary = Color(0xFF6A6D7D);

  // --- Sepia Theme (Warm Parchment Archetype) ---
  static const Color sepiaBackground = Color(0xFFFAF6EF);
  static const Color sepiaSurface = Color(0xFFF4EFE6);
  static const Color sepiaSurfaceElevated = Color(0xFFEAE0D0);
  static const Color sepiaBorder = Color(0xFFD8CCBA);
  static const Color sepiaTextPrimary = Color(0xFF2D2319);
  static const Color sepiaTextSecondary = Color(0xFF705335);

  // --- Dark Theme (Deep Sanctuary Archetype) ---
  static const Color darkBackground = Color(0xFF121318);
  static const Color darkSurface = Color(0xFF1E1F25);
  static const Color darkSurfaceElevated = Color(0xFF282933);
  static const Color darkBorder = Color(0xFF2E303C);
  static const Color darkTextPrimary = Color(0xFFF4F4F6);
  static const Color darkTextSecondary = Color(0xFF9E9EA7);

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
    return '#${color.value.toRadixString(16).substring(2).toUpperCase()}';
  }
}
