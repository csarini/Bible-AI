import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

/// Centralized Native Share Service with Branding Attribution
class ShareService {
  ShareService._();

  static const String _appAttribution = '\n\n— Compartido desde Biblia Inteligente 📖✨';

  /// Shares a single Scripture verse with reference, optional translation and personal reflection note.
  static Future<void> shareScripture({
    BuildContext? context,
    required String reference,
    required String text,
    String? customTitle,
    String? personalReflection,
    String? translation,
  }) async {
    final versionStr = translation != null ? ' ($translation)' : ' (RVR1909)';
    final buffer = StringBuffer();

    if (customTitle != null && customTitle.trim().isNotEmpty) {
      buffer.writeln('🕊️ ${customTitle.trim()}\n');
    }

    buffer.writeln('"$text"');
    buffer.writeln('— $reference$versionStr');

    if (personalReflection != null && personalReflection.trim().isNotEmpty) {
      buffer.writeln('\n📝 Mi Reflexión:\n${personalReflection.trim()}');
    }

    buffer.write(_appAttribution);

    RenderBox? box;
    if (context != null) {
      box = context.findRenderObject() as RenderBox?;
    }

    await Share.share(
      buffer.toString(),
      subject: customTitle?.isNotEmpty == true ? customTitle : reference,
      sharePositionOrigin: box != null ? box.localToGlobal(Offset.zero) & box.size : null,
    );
  }

  /// Shares a categorized church event, sermon outline, or study guide.
  static Future<void> shareEvent({
    BuildContext? context,
    required String title,
    required String categoryName,
    required DateTime eventDate,
    required String description,
    List<String>? linkedVerses,
  }) async {
    final buffer = StringBuffer();
    buffer.writeln('📅 $title');
    buffer.writeln('Categoría: $categoryName');
    buffer.writeln('Fecha: ${eventDate.day}/${eventDate.month}/${eventDate.year}');
    buffer.writeln('\n$description');

    if (linkedVerses != null && linkedVerses.isNotEmpty) {
      buffer.writeln('\n📜 Pasajes Bíblicos: ${linkedVerses.join(', ')}');
    }

    buffer.write(_appAttribution);

    RenderBox? box;
    if (context != null) {
      box = context.findRenderObject() as RenderBox?;
    }

    await Share.share(
      buffer.toString(),
      subject: title,
      sharePositionOrigin: box != null ? box.localToGlobal(Offset.zero) & box.size : null,
    );
  }
}
