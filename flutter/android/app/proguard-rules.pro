# ==============================================================================
# ProGuard / R8 Rules for Biblia Inteligente (Digital Sanctuary)
# ==============================================================================

# Flutter Core & Plugins
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Application Specific Code & Native Kotlin Classes
-keep class com.elshaddai.biblia_inteligente.** { *; }

# AppWidget / HomeWidget Provider
-keep class com.elshaddai.biblia_inteligente.VerseWidgetProvider { *; }
-keep class es.antonborri.home_widget.** { *; }

# Google Play Core (In-App Review & In-App Update)
-keep class com.google.android.play.core.** { *; }
-dontwarn com.google.android.play.core.**

# SQLite3 & Drift Native FFI Libraries
-keep class org.sqlite.** { *; }
-dontwarn org.sqlite.**

# Preserve annotations, line numbers and stacktrace metadata for debugging
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepattributes SourceFile,LineNumberTable
-dontwarn okhttp3.**
-dontwarn okio.**
