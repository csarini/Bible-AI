import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../services/secure_storage_service.dart';

/// Production-ready HTTP Client wrapper / interceptor for communicating
/// with the "Biblia Inteligente" backend services.
///
/// Features:
/// - Intercepts outgoing requests to attach `Authorization: Bearer <token>` automatically
///   from [SecureStorageService].
/// - Enforces timeouts and handles connection/unauthorized errors defensively.
class ApiClient {
  final http.Client _httpClient;
  final SecureStorageService _secureStorage;
  final String baseUrl;
  final Duration timeout;

  ApiClient({
    required SecureStorageService secureStorage,
    http.Client? httpClient,
    this.baseUrl = '',
    this.timeout = const Duration(seconds: 15),
  })  : _secureStorage = secureStorage,
        _httpClient = httpClient ?? http.Client();

  /// Builds normalized headers including content-type and authorization token.
  Future<Map<String, String>> _buildHeaders({
    Map<String, String>? additionalHeaders,
    bool requiresAuth = true,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      final token = await _secureStorage.getAuthToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    if (additionalHeaders != null) {
      headers.addAll(additionalHeaders);
    }

    return headers;
  }

  /// Resolves relative path against `baseUrl` or returns absolute Uri.
  Uri _resolveUri(String endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return Uri.parse(endpoint);
    }
    final normalizedBase = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final normalizedEndpoint =
        endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$normalizedBase$normalizedEndpoint');
  }

  /// Sends a GET request with automatic bearer token injection.
  Future<http.Response> get(
    String endpoint, {
    Map<String, String>? headers,
    bool requiresAuth = true,
  }) async {
    final uri = _resolveUri(endpoint);
    final requestHeaders = await _buildHeaders(
      additionalHeaders: headers,
      requiresAuth: requiresAuth,
    );

    try {
      final response =
          await _httpClient.get(uri, headers: requestHeaders).timeout(timeout);
      _checkResponse(response);
      return response;
    } on SocketException catch (e) {
      debugPrint('[ApiClient] Network error on GET $uri: $e');
      throw const SocketException('No hay conexión a internet.');
    } on TimeoutException {
      debugPrint('[ApiClient] Timeout on GET $uri');
      throw TimeoutException(
          'Tiempo de espera agotado al conectar con el servidor.');
    }
  }

  /// Sends a POST request with automatic bearer token injection.
  Future<http.Response> post(
    String endpoint, {
    Object? body,
    Map<String, String>? headers,
    bool requiresAuth = true,
  }) async {
    final uri = _resolveUri(endpoint);
    final requestHeaders = await _buildHeaders(
      additionalHeaders: headers,
      requiresAuth: requiresAuth,
    );

    final encodedBody =
        (body != null && body is! String) ? json.encode(body) : body as String?;

    try {
      final response = await _httpClient
          .post(uri, headers: requestHeaders, body: encodedBody)
          .timeout(timeout);
      _checkResponse(response);
      return response;
    } on SocketException catch (e) {
      debugPrint('[ApiClient] Network error on POST $uri: $e');
      throw const SocketException('No hay conexión a internet.');
    } on TimeoutException {
      debugPrint('[ApiClient] Timeout on POST $uri');
      throw TimeoutException(
          'Tiempo de espera agotado al conectar con el servidor.');
    }
  }

  /// Sends a PUT request.
  Future<http.Response> put(
    String endpoint, {
    Object? body,
    Map<String, String>? headers,
    bool requiresAuth = true,
  }) async {
    final uri = _resolveUri(endpoint);
    final requestHeaders = await _buildHeaders(
      additionalHeaders: headers,
      requiresAuth: requiresAuth,
    );

    final encodedBody =
        (body != null && body is! String) ? json.encode(body) : body as String?;

    try {
      final response = await _httpClient
          .put(uri, headers: requestHeaders, body: encodedBody)
          .timeout(timeout);
      _checkResponse(response);
      return response;
    } on SocketException catch (e) {
      debugPrint('[ApiClient] Network error on PUT $uri: $e');
      throw const SocketException('No hay conexión a internet.');
    } on TimeoutException {
      debugPrint('[ApiClient] Timeout on PUT $uri');
      throw TimeoutException(
          'Tiempo de espera agotado al conectar con el servidor.');
    }
  }

  /// Sends a DELETE request.
  Future<http.Response> delete(
    String endpoint, {
    Map<String, String>? headers,
    bool requiresAuth = true,
  }) async {
    final uri = _resolveUri(endpoint);
    final requestHeaders = await _buildHeaders(
      additionalHeaders: headers,
      requiresAuth: requiresAuth,
    );

    try {
      final response = await _httpClient
          .delete(uri, headers: requestHeaders)
          .timeout(timeout);
      _checkResponse(response);
      return response;
    } on SocketException catch (e) {
      debugPrint('[ApiClient] Network error on DELETE $uri: $e');
      throw const SocketException('No hay conexión a internet.');
    } on TimeoutException {
      debugPrint('[ApiClient] Timeout on DELETE $uri');
      throw TimeoutException(
          'Tiempo de espera agotado al conectar con el servidor.');
    }
  }

  /// Evaluates response status for automatic token expiration / 401 handling.
  void _checkResponse(http.Response response) {
    if (response.statusCode == 401) {
      debugPrint(
          '[ApiClient] 401 Unauthorized encountered on ${response.request?.url}. Session may be expired.');
    }
  }

  /// Closes the underlying HTTP client.
  void close() {
    _httpClient.close();
  }
}
