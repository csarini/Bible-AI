import 'package:home_widget/home_widget.dart';

/// Service managing Home and Lock Screen Widgets for Verse of the Day
class HomeWidgetService {
  HomeWidgetService._();

  static const String appGroupId = 'group.com.santuario.biblia';
  static const String androidWidgetName = 'VerseOfTheDayWidgetProvider';
  static const String iOSWidgetName = 'VerseOfTheDayWidget';

  static Future<void> initialize() async {
    try {
      await HomeWidget.setAppGroupId(appGroupId);
    } catch (e) {
      // Gracefully continue on unsupported environments
    }
  }

  static Future<void> updateVerseOfTheDay({
    required String reference,
    required String verseText,
  }) async {
    try {
      await HomeWidget.saveWidgetData<String>('votd_reference', reference);
      await HomeWidget.saveWidgetData<String>('votd_text', verseText);
      await HomeWidget.updateWidget(
        name: androidWidgetName,
        iOSName: iOSWidgetName,
      );
    } catch (e) {
      // Gracefully continue on unsupported environments
    }
  }

  static Future<void> updateVerseOfTheDayWidget({
    required String reference,
    required String text,
  }) => updateVerseOfTheDay(reference: reference, verseText: text);
}
