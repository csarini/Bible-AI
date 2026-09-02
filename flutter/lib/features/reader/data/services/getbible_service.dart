// Local Bible Scripture Service (Replaces remote GetBible.net with 100% Local SQLite Persistence)
// All books, translations, and verses are imported from .json directly into Drift/SQLite
// and queried directly from the local DB.

import '../../../../core/storage/app_database.dart';
import 'local_bible_service.dart';

export 'local_bible_service.dart';

// Alias for existing references
class GetBibleService extends LocalBibleService {
  GetBibleService({required AppDatabase database})
      : super(database: database);
}
