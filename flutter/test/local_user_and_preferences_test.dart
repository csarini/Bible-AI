import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:smart_bible/core/services/local_user_service.dart';
import 'package:smart_bible/core/storage/app_database.dart';

void main() {
  late AppDatabase database;

  setUp(() {
    database = AppDatabase(NativeDatabase.memory());
  });

  tearDown(() async {
    await database.close();
  });

  test('crea y reutiliza un unico usuario invitado', () async {
    final service = LocalUserService(database);

    final firstUser = await service.getOrCreateGuest();
    final secondUser = await service.getOrCreateGuest();

    expect(firstUser.id, isNotEmpty);
    expect(firstUser.authType, 'guest');
    expect(firstUser.displayName, 'Invitado');
    expect(secondUser.id, firstUser.id);
    expect((await database.getGuestUser())?.id, firstUser.id);
  });

  test('persiste preferencias asociadas al usuario', () async {
    final user = await LocalUserService(database).getOrCreateGuest();

    await database.saveUserPreference(
      userId: user.id,
      key: 'theme',
      value: 'sepia',
    );
    await database.saveUserPreference(
      userId: user.id,
      key: 'fontSize',
      value: 'large',
    );

    final preferences = await database.getUserPreferences(user.id);

    expect(preferences, {'theme': 'sepia', 'fontSize': 'large'});
  });
}
