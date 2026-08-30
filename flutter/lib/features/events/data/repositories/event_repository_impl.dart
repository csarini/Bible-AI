import 'dart:convert';
import 'package:drift/drift.dart';
import '../../../../core/storage/app_database.dart';
import '../../domain/repositories/event_repository.dart';

class EventRepositoryImpl implements EventRepository {
  final AppDatabase _db;

  EventRepositoryImpl(this._db);

  @override
  Stream<List<EventCategoryEntry>> watchCategories() => _db.watchAllCategories();

  @override
  Future<List<EventCategoryEntry>> getCategories() => _db.getAllCategories();

  @override
  Future<void> createCategory({
    required String name,
    required String colorHex,
    required String iconName,
  }) async {
    final catId = 'cat_${DateTime.now().millisecondsSinceEpoch}';
    await _db.insertCategory(
      EventCategoriesCompanion.insert(
        id: catId,
        name: name,
        colorHex: colorHex,
        iconName: iconName,
      ),
    );
  }

  @override
  Future<void> deleteCategory(String categoryId) => _db.deleteCategory(categoryId);

  @override
  Stream<List<UserEventEntry>> watchEvents({String? categoryId}) {
    if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') {
      return _db.watchEventsByCategory(categoryId);
    }
    return _db.watchAllEvents();
  }

  @override
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
  }) async {
    final eventId = id ?? 'evt_${DateTime.now().millisecondsSinceEpoch}';
    await _db.insertOrUpdateEvent(
      UserEventsCompanion(
        id: Value(eventId),
        categoryId: Value(categoryId),
        title: Value(title),
        description: Value(description),
        linkedVersesJson: Value(json.encode(linkedVerses)),
        eventDate: Value(eventDate),
        hasFoodService: Value(hasFoodService),
        foodServiceDetails: Value(foodServiceDetails),
        hasChildCare: Value(hasChildCare),
        hasBookSales: Value(hasBookSales),
      ),
    );
  }

  @override
  Future<void> deleteEvent(String eventId) => _db.deleteEvent(eventId);

  @override
  Stream<List<FoodCourtMenuEntry>> watchFoodMenus() => _db.watchAvailableMenus();

  @override
  Future<void> saveFoodMenu({
    String? id,
    required String title,
    required String description,
    required double price,
    required String shift,
    bool isAvailable = true,
  }) async {
    final menuId = id ?? 'menu_${DateTime.now().millisecondsSinceEpoch}';
    await _db.insertOrUpdateMenu(
      FoodCourtMenusCompanion(
        id: Value(menuId),
        title: Value(title),
        description: Value(description),
        price: Value(price),
        shift: Value(shift),
        isAvailable: Value(isAvailable),
      ),
    );
  }

  @override
  Future<void> deleteFoodMenu(String menuId) => _db.deleteMenu(menuId);
}
