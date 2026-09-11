import 'dart:async';
import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';

import '../../../core/network/api_client.dart';
import '../../../core/services/secure_storage_service.dart';
import '../../../core/storage/app_database.dart';

/// Models the session state returned from cloud login or guest reconciliation.
class AuthSession {
  final String token;
  final String userId;
  final String email;
  final String? displayName;
  final bool isReconciled;

  const AuthSession({
    required this.token,
    required this.userId,
    required this.email,
    this.displayName,
    this.isReconciled = false,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      token: json['token'] as String? ?? json['jwt'] as String? ?? '',
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      displayName: json['displayName'] as String? ?? json['name'] as String?,
      isReconciled: json['reconciled'] as bool? ?? false,
    );
  }
}

/// Authentication and Reconciliation Repository for "Biblia Inteligente".
///
/// Architecture & Security:
/// - Injects [SecureStorageService] to persist sensitive credentials (JWT, User ID, API Keys)
///   in hardware-backed KeyStore (Android) / Apple Keychain (iOS).
/// - Injects [AppDatabase] (Drift/SQLite) to preserve offline bookmarks, reading progress,
///   and user profile state locally.
/// - Injects [ApiClient] for authenticated HTTP calls with Bearer token auto-attachment.
class AuthRepository {
  final SecureStorageService _secureStorage;
  final AppDatabase _database;
  final ApiClient _apiClient;

  AuthRepository({
    required SecureStorageService secureStorage,
    required AppDatabase database,
    required ApiClient apiClient,
  })  : _secureStorage = secureStorage,
        _database = database,
        _apiClient = apiClient;

  /// Checks if there is an active hardware-encrypted JWT session token.
  Future<bool> isAuthenticated() async {
    final token = await _secureStorage.getAuthToken();
    return token != null && token.isNotEmpty;
  }

  /// Returns the current remote User ID stored in encrypted storage.
  Future<String?> getCurrentUserId() async {
    return await _secureStorage.getUserId();
  }

  /// Logs in an existing user with credentials, saves JWT securely,
  /// and synchronizes the local Drift user table.
  Future<AuthSession> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        '/api/v1/auth/login',
        body: {
          'email': email.trim().toLowerCase(),
          'password': password,
        },
        requiresAuth: false,
      );

      if (response.statusCode != 200) {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Credenciales inválidas o error de autenticación.');
      }

      final data = json.decode(response.body) as Map<String, dynamic>;
      final session = AuthSession.fromJson(data);

      if (session.token.isEmpty) {
        throw Exception('El servidor no retornó un token de sesión válido.');
      }

      // 1. Persist sensitive credentials in Hardware Keystore / Keychain
      await _secureStorage.saveAuthToken(session.token);
      await _secureStorage.saveUserId(session.userId);

      // 2. Update local Drift SQLite user record without clearing offline data
      await _syncLocalUserRecord(
        userId: session.userId,
        email: session.email,
        displayName: session.displayName,
      );

      return session;
    } catch (e, stack) {
      debugPrint('[AuthRepository] Login error: $e\n$stack');
      rethrow;
    }
  }

  /// Reconciles guest device data with an authenticated account.
  ///
  /// Endpoint: `POST /api/v1/sync/reconcile`
  /// 1. Collects unsynced local bookmarks and events created while offline as guest.
  /// 2. Posts payload to the cloud service.
  /// 3. Securely stores the new JWT token and user identifier.
  /// 4. Marks local SQLite records as synced without wiping local databases.
  Future<AuthSession> reconcileGuestAccount({
    required String localGuestId,
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      // Collect unsynced local guest data
      final unsyncedBookmarks = await _database.getUnsyncedBookmarks();
      final unsyncedEvents = await _database.getUnsyncedEvents();

      final payload = {
        'guestId': localGuestId,
        'email': email.trim().toLowerCase(),
        'password': password,
        'displayName': displayName,
        'bookmarks': unsyncedBookmarks.map((b) => {
          'id': b.id,
          'bookId': b.bookId,
          'chapter': b.chapter,
          'verse': b.verse,
          'verseText': b.verseText,
          'colorHex': b.colorHex,
          'customTitle': b.customTitle,
          'personalNote': b.personalNote,
          'createdAt': b.createdAt.toIso8601String(),
        }).toList(),
        'events': unsyncedEvents.map((e) => {
          'id': e.id,
          'title': e.title,
          'description': e.description,
          'startTime': e.startTime.toIso8601String(),
          'endTime': e.endTime.toIso8601String(),
        }).toList(),
      };

      final response = await _apiClient.post(
        '/api/v1/sync/reconcile',
        body: payload,
        requiresAuth: false,
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Fallo en la reconciliación de la cuenta de invitado.');
      }

      final data = json.decode(response.body) as Map<String, dynamic>;
      final session = AuthSession.fromJson(data);

      // 1. Save credentials in encrypted secure storage
      await _secureStorage.saveAuthToken(session.token);
      await _secureStorage.saveUserId(session.userId);

      // 2. Mark local records as synced in Drift/SQLite
      for (final bookmark in unsyncedBookmarks) {
        await _database.markBookmarkSynced(bookmark.id);
      }
      for (final event in unsyncedEvents) {
        await _database.markEventSynced(event.id);
      }

      // 3. Link local user account
      await _database.saveUser(
        LocalUsersCompanion(
          id: Value(localGuestId),
          authType: const Value('email'),
          remoteUserId: Value(session.userId),
          email: Value(email),
          displayName: Value(displayName ?? session.displayName),
          lastSeenAt: Value(DateTime.now()),
        ),
      );

      return session;
    } catch (e, stack) {
      debugPrint('[AuthRepository] Guest reconciliation error: $e\n$stack');
      rethrow;
    }
  }

  /// Securely logs out the user:
  /// - Flushes JWT, user IDs, and secure keys from Hardware Keystore/Keychain.
  /// - CRITICAL RULE: DOES NOT delete or wipe the local Drift SQLite database,
  ///   preserving downloaded scripture, canonical chapters, and device preferences.
  Future<void> logout() async {
    try {
      // 1. Optional: notify backend of logout if token is still valid
      try {
        await _apiClient.post('/api/v1/auth/logout', requiresAuth: true);
      } catch (_) {
        // Silently ignore network failures on logout
      }

      // 2. Flush sensitive credentials from FlutterSecureStorage
      await _secureStorage.clearAll();

      // 3. Re-mark current user as guest or unauthenticated in Drift SQLite
      // Note: All Bible chapters, offline indexes, bookmarks, and notes are PRESERVED!
      final guest = await _database.getGuestUser();
      if (guest != null) {
        await _database.touchUser(guest.id);
      }

      debugPrint('[AuthRepository] User logged out securely. SQLite local database preserved.');
    } catch (e, stack) {
      debugPrint('[AuthRepository] Error during logout: $e\n$stack');
      // Ensure encrypted storage is cleared regardless
      await _secureStorage.clearAll();
    }
  }

  /// Updates or links local Drift user table with remote session details.
  Future<void> _syncLocalUserRecord({
    required String userId,
    required String email,
    String? displayName,
  }) async {
    final existingUser = await _database.getUser(userId);
    if (existingUser == null) {
      await _database.saveUser(
        LocalUsersCompanion.insert(
          id: userId,
          authType: 'email',
          email: Value(email),
          displayName: Value(displayName),
          remoteUserId: Value(userId),
          lastSeenAt: Value(DateTime.now()),
        ),
      );
    } else {
      await _database.saveUser(
        LocalUsersCompanion(
          id: Value(userId),
          authType: const Value('email'),
          email: Value(email),
          displayName: Value(displayName),
          remoteUserId: Value(userId),
          lastSeenAt: Value(DateTime.now()),
        ),
      );
    }
  }
}
