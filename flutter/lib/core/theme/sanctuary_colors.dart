import 'package:flutter/material.dart';

/// Paleta de Colores Institucional - Biblia El-Shaddai (AI Studio Specs)
/// Clase oficial requerida por las especificaciones de diseño.
class ElShaddaiColors {
  ElShaddaiColors._();

  // 1. Identidad de Marca (Brand Core)
  static const Color waveNavy = Color(0xFF0B2B68); // Primario, Barras de Navegación, Títulos Fuertes
  static const Color sunOrange = Color(0xFFF25C05); // Acento Principal, CTAs, Botones de Acción, Progreso
  static const Color cyanAccent = Color(0xFF00A3E0); // Terciario, Enlaces, Elementos Informativos
  static const Color cyanSky = Color(0xFF00A3E0); // Alias Cian institucional
  static const Color amberGold = Color(0xFFFED65B); // Iconografía, Medallas de Logros, Resaltados Especiales
  static const Color brandPurple = Color(0xFF4E53A4); // Categorías Secundarias, Etiquetas de Temas
  static const Color emeraldGreen = Color(0xFF10B981); // Éxito, Validaciones, Indicadores Positivos

  // 2. Temas de Lectura (Reading Themes)
  // Modo Claro (Light)
  static const Color lightBackground = Color(0xFFFAF8F5);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFF8F6F2);
  static const Color lightTextPrimary = Color(0xFF1B1C19);
  static const Color lightTextSecondary = Color(0xFF454652);
  static const Color lightBorder = Color(0x260B2B68); // rgba(11, 43, 104, 0.15)

  // Modo Sepia (Cálido)
  static const Color sepiaBackground = Color(0xFFF5EFE6);
  static const Color sepiaSurface = Color(0xFFFAF6EF);
  static const Color sepiaSurfaceElevated = Color(0xFFEFE7D8);
  static const Color sepiaTextPrimary = Color(0xFF2D2319);
  static const Color sepiaTextSecondary = Color(0xFF705335);
  static const Color sepiaActive = Color(0xFF5C4228);
  static const Color sepiaBorder = Color(0x33705335); // rgba(112, 83, 53, 0.20)

  // Modo Oscuro (Dark)
  static const Color darkBackground = Color(0xFF0B0F19);
  static const Color darkSurface = Color(0xFF131722);
  static const Color darkSurfaceElevated = Color(0xFF1C2337);
  static const Color darkTextPrimary = Color(0xFFF1F3F9);
  static const Color darkOnSurface = Color(0xFFF1F3F9);
  static const Color darkTextSecondary = Color(0xFF9AA5C2);
  static const Color darkActive = Color(0xFF2B3990);
  static const Color darkBorder = Color(0xFF252D43);

  // 3. Paleta de Resaltado (Scripture Highlighting)
  static const Color highlightYellow = Color(0xFFFFF2B2); // Favoritos/Promesas
  static const Color highlightGreen = Color(0xFFD2F5D7); // Vida/Crecimiento
  static const Color highlightBlue = Color(0xFFD3E7FF); // Paz/Sabiduría
  static const Color highlightOrange = Color(0xFFFFDFCC); // Advertencia/Importante
  static const Color highlightPurple = Color(0xFFE9E4FF); // Divinidad/Realeza

  static const List<Color> pastelPalette = [
    highlightYellow,
    highlightGreen,
    highlightBlue,
    highlightOrange,
    highlightPurple,
  ];

  static String getHighlightLabel(String hex) {
    final clean = hex.replaceAll('#', '').toUpperCase();
    switch (clean) {
      case 'FFF2B2':
        return 'Favoritos / Promesas';
      case 'D2F5D7':
        return 'Vida / Crecimiento';
      case 'D3E7FF':
        return 'Paz / Sabiduría';
      case 'FFDFCC':
        return 'Advertencia / Importante';
      case 'E9E4FF':
        return 'Divinidad / Realeza';
      default:
        return 'Resaltado';
    }
  }
}

/// Digital Sanctuary Design System Color Tokens (Synchronized with React Reference & ElShaddaiColors)
class SanctuaryColors {
  SanctuaryColors._();

  // --- Brand Identity Palette (Matching El-Shaddai Specs) ---
  static const Color waveNavy = ElShaddaiColors.waveNavy;
  static const Color waveNavySecondary = Color(0xFF243372);
  static const Color sunOrange = ElShaddaiColors.sunOrange;
  static const Color sunOrangeAccent = Color(0xFFF47B20);
  static const Color cyanAccent = ElShaddaiColors.cyanAccent;
  static const Color cyanSky = ElShaddaiColors.cyanAccent;
  static const Color electricCyan = ElShaddaiColors.cyanAccent;
  static const Color amberGold = ElShaddaiColors.amberGold;
  static const Color brandPurple = ElShaddaiColors.brandPurple;
  static const Color emeraldGreen = ElShaddaiColors.emeraldGreen;

  // --- Light Theme (#FAF8F5, #FFFFFF, text #1B1C19) ---
  static const Color lightBackground = ElShaddaiColors.lightBackground;
  static const Color lightSurface = ElShaddaiColors.lightSurface;
  static const Color lightSurfaceElevated = ElShaddaiColors.lightSurfaceElevated;
  static const Color lightBorder = ElShaddaiColors.lightBorder;
  static const Color lightBorderStrong = Color(0xFFEAE8E3);
  static const Color lightTextPrimary = ElShaddaiColors.lightTextPrimary;
  static const Color lightTextSecondary = ElShaddaiColors.lightTextSecondary;

  // --- Sepia Theme (#F5EFE6, #FAF6EF, text #2D2319) ---
  static const Color sepiaBackground = ElShaddaiColors.sepiaBackground;
  static const Color sepiaSurface = ElShaddaiColors.sepiaSurface;
  static const Color sepiaSurfaceElevated = ElShaddaiColors.sepiaSurfaceElevated;
  static const Color parchmentPaper = Color(0xFFF9F6F0);
  static const Color sepiaBorder = ElShaddaiColors.sepiaBorder;
  static const Color sepiaBorderStrong = Color(0xFFD8CCBA);
  static const Color sepiaTextPrimary = ElShaddaiColors.sepiaTextPrimary;
  static const Color sepiaTextSecondary = ElShaddaiColors.sepiaTextSecondary;
  static const Color sepiaActive = ElShaddaiColors.sepiaActive;

  // --- Dark Theme (#0B0F19, #131722, text #F1F3F9) ---
  static const Color darkBackground = ElShaddaiColors.darkBackground;
  static const Color darkSurface = ElShaddaiColors.darkSurface;
  static const Color darkSurfaceElevated = ElShaddaiColors.darkSurfaceElevated;
  static const Color darkBorder = ElShaddaiColors.darkBorder;
  static const Color darkBorderStrong = Color(0xFF2B3964);
  static const Color darkTextPrimary = ElShaddaiColors.darkTextPrimary;
  static const Color darkOnSurface = ElShaddaiColors.darkOnSurface;
  static const Color darkTextSecondary = ElShaddaiColors.darkTextSecondary;
  static const Color darkActive = ElShaddaiColors.darkActive;

  // --- Pastel Highlight Palette (Scripture Highlighting) ---
  static const Color highlightYellow = ElShaddaiColors.highlightYellow;
  static const Color highlightGreen = ElShaddaiColors.highlightGreen;
  static const Color highlightBlue = ElShaddaiColors.highlightBlue;
  static const Color highlightOrange = ElShaddaiColors.highlightOrange;
  static const Color highlightPurple = ElShaddaiColors.highlightPurple;

  static const List<Color> pastelPalette = ElShaddaiColors.pastelPalette;

  static String getHighlightLabel(String hex) => ElShaddaiColors.getHighlightLabel(hex);

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

