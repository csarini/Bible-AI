# Biblia Inteligente: production readiness

## Implemented locally

- `DebugLogService` keeps a bounded 250-entry diagnostic buffer and exposes a
  bottom-sheet console for physical-device debugging.
- `main.dart` installs `FlutterError.onError`, `runZonedGuarded`, and a
  Digital Sanctuary `ErrorWidget`.
- `VersionService` reads the installed semantic version, checks Google Play
  In-App Updates, and optionally checks JSON with `latest_version` and
  `min_required_version`.
- `RatingService` requests the native review dialog after five positive
  interactions, with availability and failure handling.
- Drift schema version 3 adds `is_synced` to user events and food menus.
  Existing tables are preserved; the migration only adds columns.
- `DataReconciliationService` uploads unsynced bookmarks, events, and menus
  through an injected gateway and marks each row synced only after success.
- Android release builds now require `android/key.properties` and no longer
  use the debug signing key.

## Drift migration rules

1. Never delete or recreate an existing table in `onUpgrade`.
2. Increment `schemaVersion` for every schema change.
3. Guard every migration with `if (from < N)` so upgrades are progressive.
4. Use `Value<T?>` for nullable Companion fields, for example:

```dart
LocalBookmarksCompanion(
  id: const Value('bookmark-id'),
  customTitle: Value<String?>(customTitle),
  personalNote: Value<String?>(personalNote),
)
```

5. Regenerate after schema changes:

```powershell
dart run build_runner build --delete-conflicting-outputs
```

## Overflow audit checklist

- Put dynamic text inside `Expanded` or `Flexible` when it shares a `Row`.
- Use `mainAxisSize: MainAxisSize.min` for inner rows and action groups.
- Prefer `Padding`, `ConstrainedBox`, `LayoutBuilder`, and `AspectRatio` over
  fixed widths and heights.
- Add `maxLines` and `TextOverflow.ellipsis` to titles, names, translations,
  event labels, and remote data.
- Use `Wrap` for variable-length chips and action collections.
- Keep icon buttons at stable dimensions and give adjacent text the flexible
  slot.
- Test narrow Android devices, large font settings, landscape, long Spanish
  names, empty states, and accessibility text scaling.
- Treat every `Row` found by the audit as suspect until its text constraints
  are explicit.

## Remote version JSON

The endpoint supplied to `VersionService(remoteConfigUri: ...)` must return:

```json
{
  "latest_version": "1.1.0",
  "min_required_version": "1.0.5"
}
```

A lower installed version than `min_required_version` is immediate/blocked;
a newer `latest_version` is flexible. Play Store availability takes precedence
when it reports an immediate update.

## Play signing

Copy `android/key.properties.example` to `android/key.properties`, replace all
values, and keep the real file and keystore out of source control:

```properties
storePassword=...
keyPassword=...
keyAlias=upload
storeFile=../upload-keystore.jks
```

The manifest already has no `package` attribute; the active Groovy module owns
`namespace` and `applicationId`.

## Release sequence

```powershell
flutter clean
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter build appbundle --release --obfuscate --split-debug-info=build/app/outputs/symbols
```

The release command intentionally fails until a real upload keystore is
configured.

## External integrations still required

Firebase Analytics, Crashlytics, and Firebase Auth require a Firebase project,
`google-services.json`, iOS `GoogleService-Info.plist`, `firebase_core`, and
explicit `Firebase.initializeApp()` startup. Supabase requires a project URL,
public anon key, auth provider setup, and a concrete `DataSyncGateway`. Those
credentials and backend choices are not present in this workspace, so the app
keeps clean injectable boundaries instead of shipping fake endpoints or
secrets. After selecting a provider:

1. Add its official Flutter packages and native configuration.
2. Initialize it before `runApp` inside the guarded startup zone.
3. Implement the provider as `DataSyncGateway`.
4. Inject analytics and crash reporting adapters through Riverpod.
5. Add integration tests for guest-to-user reconciliation and retry behavior.

Guest mode remains the default and local reading/bookmarks continue to work
without network or authentication.
