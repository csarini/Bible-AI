import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Production-grade service encapsulating encrypted, hardware-backed
/// native key-value storage for sensitive credentials.
///
/// Security architecture:
/// - Android: Hardware Keystore via AndroidX EncryptedSharedPreferences.
/// - iOS: Apple Keychain secured with `first_unlock` accessibility.
class SecureStorageService {
  final FlutterSecureStorage _storage;

  // Strict constant keys to prevent typos and collisions across environments
  static const String _keyAuthToken = 'auth_token';
  static const String _keyUserId = 'user_id';
  static const String _keyBibleApiKey = 'api_bible_key';
  static const String _keyGeminiApiKey = 'gemini_api_key';

  /// Preconfigured default API.Bible key provided for scripture fetching
  static const String defaultBibleApiKey = 'pLy50et8lZi3FhERvwh_D';

  /// Standard Android options enforcing EncryptedSharedPreferences (Hardware Keystore)
  static AndroidOptions _getAndroidOptions() => const AndroidOptions(
        encryptedSharedPreferences: true,
        resetOnError: true,
      );

  /// Standard iOS options enforcing KeychainAccessibility.first_unlock
  static IOSOptions _getIOSOptions() => const IOSOptions(
        accessibility: KeychainAccessibility.first_unlock,
      );

  /// Constructor allowing dependency injection (useful for mock unit testing)
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            FlutterSecureStorage(
              aOptions: _getAndroidOptions(),
              iOptions: _getIOSOptions(),
            );

  // ==========================================
  // 1. JWT Session Authentication Token
  // ==========================================

  /// Securely persists the JWT Bearer token after cloud login or guest reconciliation.
  Future<void> saveAuthToken(String token) async {
    try {
      await _storage.write(key: _keyAuthToken, value: token.trim());
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error saving auth token: $e\n$stack');
      rethrow;
    }
  }

  /// Retrieves the persisted JWT Bearer token, or null if unauthenticated or expired.
  Future<String?> getAuthToken() async {
    try {
      final token = await _storage.read(key: _keyAuthToken);
      return (token != null && token.isNotEmpty) ? token : null;
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error reading auth token: $e\n$stack');
      return null;
    }
  }

  /// Deletes the JWT Bearer token on logout or session invalidation.
  Future<void> deleteAuthToken() async {
    try {
      await _storage.delete(key: _keyAuthToken);
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error deleting auth token: $e\n$stack');
    }
  }

  // ==========================================
  // 2. Unique User Identifier
  // ==========================================

  /// Securely saves the unique remote user ID assigned upon authentication.
  Future<void> saveUserId(String id) async {
    try {
      await _storage.write(key: _keyUserId, value: id.trim());
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error saving user ID: $e\n$stack');
      rethrow;
    }
  }

  /// Retrieves the authenticated remote user ID.
  Future<String?> getUserId() async {
    try {
      return await _storage.read(key: _keyUserId);
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error reading user ID: $e\n$stack');
      return null;
    }
  }

  /// Deletes the remote user ID.
  Future<void> deleteUserId() async {
    try {
      await _storage.delete(key: _keyUserId);
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error deleting user ID: $e\n$stack');
    }
  }

  // ==========================================
  // 3. API.Bible Dynamic Header Key
  // ==========================================

  /// Securely stores dynamic API.Bible credentials for scripture fetching.
  Future<void> saveBibleApiKey(String key) async {
    try {
      await _storage.write(key: _keyBibleApiKey, value: key.trim());
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error saving API.Bible key: $e\n$stack');
      rethrow;
    }
  }

  /// Retrieves the dynamic API.Bible key from secure storage, falling back to
  /// environment variables or the preconfigured default key.
  Future<String> getBibleApiKey() async {
    try {
      final key = await _storage.read(key: _keyBibleApiKey);
      if (key != null && key.isNotEmpty) return key;
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error reading API.Bible key: $e\n$stack');
    }
    return const String.fromEnvironment('BIBLE_API_KEY', defaultValue: defaultBibleApiKey);
  }

  /// Deletes the API.Bible key.
  Future<void> deleteBibleApiKey() async {
    try {
      await _storage.delete(key: _keyBibleApiKey);
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error deleting API.Bible key: $e\n$stack');
    }
  }

  // ==========================================
  // 4. Gemini AI Dynamic API Key
  // ==========================================

  /// Securely saves the private Gemini API key in hardware-backed storage.
  Future<void> saveGeminiApiKey(String key) async {
    try {
      await _storage.write(key: _keyGeminiApiKey, value: key.trim());
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error saving Gemini API key: $e\n$stack');
      rethrow;
    }
  }

  /// Retrieves the persisted Gemini API key, or null if none is saved.
  Future<String?> getGeminiApiKey() async {
    try {
      final key = await _storage.read(key: _keyGeminiApiKey);
      return (key != null && key.isNotEmpty) ? key : null;
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error reading Gemini API key: $e\n$stack');
      return null;
    }
  }

  /// Deletes the Gemini API key from secure storage.
  Future<void> deleteGeminiApiKey() async {
    try {
      await _storage.delete(key: _keyGeminiApiKey);
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error deleting Gemini API key: $e\n$stack');
    }
  }

  // ==========================================
  // 5. Session & Storage Reset
  // ==========================================

  /// Securely flushes all credentials from Hardware Keystore / Keychain.
  /// Typically invoked during user logout to prevent session leakage.
  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
    } catch (e, stack) {
      debugPrint('[SecureStorageService] Error clearing secure storage: $e\n$stack');
      // Fallback: individually delete critical keys if deleteAll fails
      await deleteAuthToken();
      await deleteUserId();
      await deleteBibleApiKey();
      await deleteGeminiApiKey();
    }
  }
}
