import '../storage/app_database.dart';
import 'debug_log_service.dart';

/// Backend boundary for guest-to-user reconciliation.
///
/// Implement this gateway with Firebase, Supabase, or the application's API.
/// The local database remains authoritative until each individual upload
/// completes successfully.
abstract interface class DataSyncGateway {
  Future<void> pushBookmark(
      {required String remoteUserId, required LocalBookmarkEntry bookmark});
  Future<void> pushEvent(
      {required String remoteUserId, required UserEventEntry event});
  Future<void> pushMenu(
      {required String remoteUserId, required FoodCourtMenuEntry menu});
}

class ReconciliationResult {
  const ReconciliationResult({required this.synced, required this.failed});

  final int synced;
  final int failed;
}

/// Reconciles local guest data after authentication without sacrificing offline data.
class DataReconciliationService {
  DataReconciliationService({
    required AppDatabase database,
    required DataSyncGateway gateway,
    DebugLogService? logger,
  })  : _database = database,
        _gateway = gateway,
        _logger = logger ?? DebugLogService.instance;

  final AppDatabase _database;
  final DataSyncGateway _gateway;
  final DebugLogService _logger;

  Future<ReconciliationResult> reconcile(String remoteUserId) async {
    var synced = 0;
    var failed = 0;

    final bookmarks = await _database.getUnsyncedBookmarks();
    for (final bookmark in bookmarks) {
      try {
        await _gateway.pushBookmark(
            remoteUserId: remoteUserId, bookmark: bookmark);
        await _database.markBookmarkSynced(bookmark.id);
        synced++;
      } catch (error, stackTrace) {
        failed++;
        _logger.warning('Bookmark reconciliation failed',
            error: error, stackTrace: stackTrace);
      }
    }

    final events = await _database.getUnsyncedEvents();
    for (final event in events) {
      try {
        await _gateway.pushEvent(remoteUserId: remoteUserId, event: event);
        await _database.markEventSynced(event.id);
        synced++;
      } catch (error, stackTrace) {
        failed++;
        _logger.warning('Event reconciliation failed',
            error: error, stackTrace: stackTrace);
      }
    }

    final menus = await _database.getUnsyncedMenus();
    for (final menu in menus) {
      try {
        await _gateway.pushMenu(remoteUserId: remoteUserId, menu: menu);
        await _database.markMenuSynced(menu.id);
        synced++;
      } catch (error, stackTrace) {
        failed++;
        _logger.warning('Menu reconciliation failed',
            error: error, stackTrace: stackTrace);
      }
    }

    return ReconciliationResult(synced: synced, failed: failed);
  }
}
