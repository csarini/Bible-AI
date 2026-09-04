import 'dart:math';

import 'package:drift/drift.dart';

import '../storage/app_database.dart';

class LocalUserService {
  final AppDatabase _database;

  const LocalUserService(this._database);

  Future<LocalUserEntry> getOrCreateGuest() async {
    final existing = await _database.getGuestUser();
    if (existing != null) {
      await _database.touchUser(existing.id);
      return existing;
    }

    final guest = LocalUsersCompanion.insert(
      id: _createUuid(),
      authType: 'guest',
      displayName: const Value('Invitado'),
    );
    await _database.saveUser(guest);
    return (await _database.getUser(guest.id.value))!;
  }

  Future<void> linkToEmailAccount({
    required String localUserId,
    required String remoteUserId,
    required String email,
    String? displayName,
  }) async {
    await _database.saveUser(
      LocalUsersCompanion(
        id: Value(localUserId),
        authType: const Value('email'),
        remoteUserId: Value(remoteUserId),
        email: Value(email),
        displayName: Value(displayName),
        lastSeenAt: Value(DateTime.now()),
      ),
    );
  }

  String _createUuid() {
    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    final hex =
        bytes.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join();
    return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-'
        '${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}';
  }
}
