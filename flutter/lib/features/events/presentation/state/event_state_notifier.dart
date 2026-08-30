import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/app_database.dart';
import '../../data/repositories/event_repository_impl.dart';
import '../../domain/repositories/event_repository.dart';

enum EventStatus { initial, loading, loaded, error }

class EventState {
  final EventStatus status;
  final List<UserEventEntry> events;
  final List<EventCategoryEntry> categories;
  final List<FoodCourtMenuEntry> foodMenus;
  final String selectedCategoryId;
  final String? errorMessage;

  const EventState({
    this.status = EventStatus.initial,
    this.events = const [],
    this.categories = const [],
    this.foodMenus = const [],
    this.selectedCategoryId = 'all',
    this.errorMessage,
  });

  EventState copyWith({
    EventStatus? status,
    List<UserEventEntry>? events,
    List<EventCategoryEntry>? categories,
    List<FoodCourtMenuEntry>? foodMenus,
    String? selectedCategoryId,
    String? errorMessage,
  }) {
    return EventState(
      status: status ?? this.status,
      events: events ?? this.events,
      categories: categories ?? this.categories,
      foodMenus: foodMenus ?? this.foodMenus,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class EventNotifier extends StateNotifier<EventState> {
  final EventRepository _repository;
  StreamSubscription? _eventsSubscription;
  StreamSubscription? _categoriesSubscription;
  StreamSubscription? _foodMenusSubscription;

  EventNotifier(this._repository) : super(const EventState()) {
    init();
  }

  void init() {
    state = state.copyWith(status: EventStatus.loading);

    _categoriesSubscription = _repository.watchCategories().listen((cats) {
      state = state.copyWith(categories: cats);
    });

    _foodMenusSubscription = _repository.watchFoodMenus().listen((menus) {
      state = state.copyWith(foodMenus: menus);
    });

    _subscribeEvents(state.selectedCategoryId);
  }

  void filterByCategory(String categoryId) {
    state = state.copyWith(selectedCategoryId: categoryId, status: EventStatus.loading);
    _subscribeEvents(categoryId);
  }

  void _subscribeEvents(String categoryId) {
    _eventsSubscription?.cancel();
    _eventsSubscription = _repository.watchEvents(categoryId: categoryId).listen(
      (evts) {
        state = state.copyWith(events: evts, status: EventStatus.loaded);
      },
      onError: (err) {
        state = state.copyWith(status: EventStatus.error, errorMessage: err.toString());
      },
    );
  }

  Future<void> createCategory({
    required String name,
    required String colorHex,
    required String iconName,
  }) async {
    try {
      await _repository.createCategory(
        name: name,
        colorHex: colorHex,
        iconName: iconName,
      );
    } catch (e) {
      state = state.copyWith(errorMessage: 'No se pudo crear la categoría: $e');
    }
  }

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
    try {
      await _repository.saveEvent(
        id: id,
        categoryId: categoryId,
        title: title,
        description: description,
        eventDate: eventDate,
        linkedVerses: linkedVerses,
        hasFoodService: hasFoodService,
        foodServiceDetails: foodServiceDetails,
        hasChildCare: hasChildCare,
        hasBookSales: hasBookSales,
      );
    } catch (e) {
      state = state.copyWith(errorMessage: 'No se pudo guardar el evento: $e');
    }
  }

  Future<void> deleteEvent(String eventId) async {
    try {
      await _repository.deleteEvent(eventId);
    } catch (e) {
      state = state.copyWith(errorMessage: 'No se pudo eliminar el evento: $e');
    }
  }

  @override
  void dispose() {
    _eventsSubscription?.cancel();
    _categoriesSubscription?.cancel();
    _foodMenusSubscription?.cancel();
    super.dispose();
  }
}
