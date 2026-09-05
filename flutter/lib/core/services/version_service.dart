import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:in_app_update/in_app_update.dart';
import 'package:package_info_plus/package_info_plus.dart';

import 'debug_log_service.dart';

enum SanctuaryUpdateUrgency { none, flexible, immediate }

class VersionCheckResult {
  const VersionCheckResult({
    required this.installedVersion,
    this.latestVersion,
    this.minimumRequiredVersion,
    required this.urgency,
    this.playUpdateAvailable = false,
  });

  final String installedVersion;
  final String? latestVersion;
  final String? minimumRequiredVersion;
  final SanctuaryUpdateUrgency urgency;
  final bool playUpdateAvailable;

  bool get isBlocked => urgency == SanctuaryUpdateUrgency.immediate;
}

/// Coordinates Play Store updates and an optional remote JSON fallback.
///
/// The JSON endpoint must return at least `latest_version` and may return
/// `min_required_version`. Versions follow semantic `major.minor.patch` syntax;
/// build metadata after `+` is ignored for ordering.
class VersionService {
  VersionService({
    http.Client? httpClient,
    this.remoteConfigUri,
    DebugLogService? logger,
  })  : _httpClient = httpClient ?? http.Client(),
        _logger = logger ?? DebugLogService.instance;

  final http.Client _httpClient;
  final Uri? remoteConfigUri;
  final DebugLogService _logger;

  Future<VersionCheckResult> check() async {
    final packageInfo = await PackageInfo.fromPlatform();
    var result = VersionCheckResult(
      installedVersion: packageInfo.version,
      urgency: SanctuaryUpdateUrgency.none,
    );

    try {
      final playInfo = await InAppUpdate.checkForUpdate();
      final playAvailable =
          playInfo.updateAvailability == UpdateAvailability.updateAvailable;
      if (playAvailable) {
        result = VersionCheckResult(
          installedVersion: packageInfo.version,
          urgency: playInfo.immediateUpdateAllowed
              ? SanctuaryUpdateUrgency.immediate
              : SanctuaryUpdateUrgency.flexible,
          playUpdateAvailable: true,
        );
      }
    } catch (error, stackTrace) {
      _logger.warning(
        'Play Store update check unavailable',
        error: error,
        stackTrace: stackTrace,
      );
    }

    final remote = await _checkRemote(packageInfo.version);
    if (remote != null && remote.urgency.index > result.urgency.index) {
      return remote;
    }
    return result.latestVersion == null && remote != null ? remote : result;
  }

  Future<VersionCheckResult?> _checkRemote(String installedVersion) async {
    final uri = remoteConfigUri;
    if (uri == null) return null;

    try {
      final response =
          await _httpClient.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        _logger
            .warning('Remote version endpoint returned ${response.statusCode}');
        return null;
      }
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final latest = json['latest_version'] as String?;
      final minimum = json['min_required_version'] as String?;
      if (latest == null && minimum == null) return null;

      final blocked =
          minimum != null && _compare(installedVersion, minimum) < 0;
      final newer = latest != null && _compare(installedVersion, latest) < 0;
      return VersionCheckResult(
        installedVersion: installedVersion,
        latestVersion: latest,
        minimumRequiredVersion: minimum,
        urgency: blocked
            ? SanctuaryUpdateUrgency.immediate
            : newer
                ? SanctuaryUpdateUrgency.flexible
                : SanctuaryUpdateUrgency.none,
      );
    } catch (error, stackTrace) {
      _logger.warning('Remote version check failed',
          error: error, stackTrace: stackTrace);
      return null;
    }
  }

  Future<bool> apply(VersionCheckResult result) async {
    if (!result.playUpdateAvailable) return false;
    try {
      if (result.urgency == SanctuaryUpdateUrgency.immediate) {
        await InAppUpdate.performImmediateUpdate();
        return true;
      }
      await InAppUpdate.startFlexibleUpdate();
      await InAppUpdate.completeFlexibleUpdate();
      return true;
    } catch (error, stackTrace) {
      _logger.error('Applying Play Store update failed',
          error: error, stackTrace: stackTrace);
      return false;
    }
  }

  void dispose() => _httpClient.close();

  int _compare(String left, String right) {
    final a = _Version.parse(left);
    final b = _Version.parse(right);
    for (var index = 0; index < 3; index++) {
      if (a[index] != b[index]) return a[index].compareTo(b[index]);
    }
    return 0;
  }
}

class _Version {
  static List<int> parse(String value) {
    final core = value.split('+').first.split('-').first;
    final parts = core.split('.');
    return List<int>.generate(
      3,
      (index) => index < parts.length ? int.tryParse(parts[index]) ?? 0 : 0,
    );
  }
}
