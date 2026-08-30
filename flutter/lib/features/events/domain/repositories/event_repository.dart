import '../../../../core/storage/app_database.dart';

abstract class EventRepository {
  Stream<List<EventCategoryEntry>> watchCategories();
  Future<List<EventCategoryEntry>> getCategories();
  Future<void> createCategory({required String name, required String colorHex, required String iconName});
  Future<void> deleteCategory(String categoryId);

  Stream<List<UserEventEntry>> watchEvents({String? categoryId});
  Future<void> saveEvent({
    String? id,
    required String categoryId,
    required String title,
    required String description,
    required DateTime eventDate,
    List<String> linkedVerses = const [],
    bool hasFoodService = false,
    String? foodServiceDetails,
    bool hasChildCare = false,
    bool hasBookSales = false,
  });
  Future<void> deleteEvent(String eventId);

  Stream<List<FoodCourtMenuEntry>> watchFoodMenus();
  Future<void> saveFoodMenu({
    String? id,
    required String title,
    required String description,
    required double price,
    required String shift,
    bool isAvailable = true,
  });
  Future<void> deleteFoodMenu(String menuId);
}
