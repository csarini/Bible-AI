import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:in_app_update/in_app_update.dart';

/// Resultado del chequeo de actualización de la aplicación
class AppVersionStatus {
  final String appName;
  final String packageName;
  final String version;
  final String buildNumber;
  final bool isUpdateAvailable;
  final bool immediateAllowed;
  final bool flexibleAllowed;
  final int? availableVersionCode;
  final String? errorMessage;

  const AppVersionStatus({
    required this.appName,
    required this.packageName,
    required this.version,
    required this.buildNumber,
    this.isUpdateAvailable = false,
    this.immediateAllowed = false,
    this.flexibleAllowed = false,
    this.availableVersionCode,
    this.errorMessage,
  });

  String get formattedVersion => 'v$version+$buildNumber';
}

/// Servicio integral para gestión de versiones y Google Play In-App Updates
class VersionService {
  VersionService._();

  static final VersionService instance = VersionService._();

  PackageInfo? _cachedPackageInfo;
  AppUpdateInfo? _cachedUpdateInfo;

  /// Obtiene los metadatos de versión local del paquete
  Future<PackageInfo> getPackageInfo() async {
    if (_cachedPackageInfo != null) return _cachedPackageInfo!;
    _cachedPackageInfo = await PackageInfo.fromPlatform();
    return _cachedPackageInfo!;
  }

  /// Verifica si hay actualizaciones disponibles en Google Play (Android)
  Future<AppVersionStatus> checkForUpdate() async {
    try {
      final info = await getPackageInfo();

      // In-App Update sólo está soportado en Android y plataformas nativas
      if (kIsWeb || !Platform.isAndroid) {
        return AppVersionStatus(
          appName: info.appName,
          packageName: info.packageName,
          version: info.version,
          buildNumber: info.buildNumber,
          isUpdateAvailable: false,
        );
      }

      try {
        final updateInfo = await InAppUpdate.checkForUpdate();
        _cachedUpdateInfo = updateInfo;

        final isAvailable =
            updateInfo.updateAvailability == UpdateAvailability.updateAvailable;

        return AppVersionStatus(
          appName: info.appName,
          packageName: info.packageName,
          version: info.version,
          buildNumber: info.buildNumber,
          isUpdateAvailable: isAvailable,
          immediateAllowed: updateInfo.immediateUpdateAllowed,
          flexibleAllowed: updateInfo.flexibleUpdateAllowed,
          availableVersionCode: updateInfo.availableVersionCode,
        );
      } catch (e) {
        debugPrint('[VersionService] Error al verificar actualización en Play Store: $e');
        return AppVersionStatus(
          appName: info.appName,
          packageName: info.packageName,
          version: info.version,
          buildNumber: info.buildNumber,
          isUpdateAvailable: false,
          errorMessage: e.toString(),
        );
      }
    } catch (e) {
      debugPrint('[VersionService] Error inesperado en PackageInfo: $e');
      return const AppVersionStatus(
        appName: 'Biblia Inteligente',
        packageName: 'com.santuaridigital.biblia',
        version: '1.0.0',
        buildNumber: '1',
      );
    }
  }

  /// Ejecuta una actualización inmediata (bloqueante para parches críticos)
  Future<AppUpdateResult> performImmediateUpdate() async {
    if (kIsWeb || !Platform.isAndroid) return AppUpdateResult.userDeniedUpdate;
    try {
      return await InAppUpdate.performImmediateUpdate();
    } catch (e) {
      debugPrint('[VersionService] Error en performImmediateUpdate: $e');
      return AppUpdateResult.inAppUpdateFailed;
    }
  }

  /// Inicia una actualización flexible (descarga en segundo plano mientras se usa la app)
  Future<AppUpdateResult> startFlexibleUpdate() async {
    if (kIsWeb || !Platform.isAndroid) return AppUpdateResult.userDeniedUpdate;
    try {
      return await InAppUpdate.startFlexibleUpdate();
    } catch (e) {
      debugPrint('[VersionService] Error en startFlexibleUpdate: $e');
      return AppUpdateResult.inAppUpdateFailed;
    }
  }

  /// Completa la actualización flexible reiniciando la aplicación
  Future<void> completeFlexibleUpdate() async {
    if (kIsWeb || !Platform.isAndroid) return;
    try {
      await InAppUpdate.completeFlexibleUpdate();
    } catch (e) {
      debugPrint('[VersionService] Error en completeFlexibleUpdate: $e');
    }
  }
}
