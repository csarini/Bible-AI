import 'package:home_widget/home_widget.dart';

/// Service managing Home and Lock Screen Widgets for Verse of the Day
class HomeWidgetService {
  HomeWidgetService._();

  static const String appGroupId = 'group.com.santuario.biblia';
  static const String androidWidgetName = 'VerseOfTheDayWidgetProvider';

  static Future<void> initialize() async {
    await HomeWidget.setAppGroupId(appGroupId);
  }

  static Future<void> updateVerseOfTheDayWidget({
    required String reference,
    required String text,
  }) async {
    await HomeWidget.saveWidgetData<String>('votd_reference', reference);
    await HomeWidget.saveWidgetData<String>('votd_text', text);
    await HomeWidget.updateWidget(
      name: androidWidgetName,
      iOSName: 'VerseOfTheDayWidget',
    );
  }
}
