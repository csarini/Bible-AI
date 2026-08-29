import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

/// Centralized Native Share Service with Branding Attribution
class ShareService {
  ShareService._();

  static Future<void> shareScripture({
    required BuildContext context,
    required String reference,
    required String text,
    String? customTitle,
    String? personalReflection,
  }) async {
    final buffer = StringBuffer();

    if (customTitle != null && customTitle.trim().isNotEmpty) {
      buffer.writeln('🕊️ ${customTitle.trim()}\n');
    }

    buffer.writeln('"$text"');
    buffer.writeln('— $reference (RVR1909)\n');

    if (personalReflection != null && personalReflection.trim().isNotEmpty) {
      buffer.writeln('Reflexión:');
      buffer.writeln(personalReflection.trim());
      buffer.writeln();
    }

    buffer.writeln('Compartido desde Biblia Inteligente (Digital Sanctuary)');

    final box = context.findRenderObject() as RenderBox?;

    await Share.share(
      buffer.toString(),
      subject: customTitle?.isNotEmpty == true ? customTitle : reference,
      sharePositionOrigin: box != null ? box.localToGlobal(Offset.zero) & box.size : null,
    );
  }
}
