package com.elshaddai.biblia_inteligente

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProviderInfo
import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetLaunchIntent
import es.antonborri.home_widget.HomeWidgetPlugin
import es.antonborri.home_widget.HomeWidgetProvider

/**
 * Production-ready AppWidgetProvider for Biblia Inteligente (Digital Sanctuary)
 *
 * Implements Android 12+ Home Screen and Lock Screen (Keyguard) Widgets.
 * Reads shared data populated by Flutter via the `home_widget` plugin.
 */
class VerseWidgetProvider : HomeWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
        widgetData: SharedPreferences
    ) {
        appWidgetIds.forEach { widgetId ->
            updateSingleWidget(context, appWidgetManager, widgetId, widgetData)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle?
    ) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
        val widgetData = HomeWidgetPlugin.getData(context)
        updateSingleWidget(context, appWidgetManager, appWidgetId, widgetData)
    }

    private fun updateSingleWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        widgetId: Int,
        widgetData: SharedPreferences
    ) {
        try {
            // Determine if widget is placed on Keyguard (Lock Screen) or Home Screen
            val options = appWidgetManager.getAppWidgetOptions(widgetId)
            val category = options.getInt(
                AppWidgetManager.OPTION_APPWIDGET_HOST_CATEGORY,
                AppWidgetProviderInfo.WIDGET_CATEGORY_HOME_SCREEN
            )
            val isKeyguard = category == AppWidgetProviderInfo.WIDGET_CATEGORY_KEYGUARD
            val maxHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 150)

            // Select layout according to destination & available space
            val layoutId = if (isKeyguard || maxHeight < 110) {
                R.layout.verse_widget_lockscreen
            } else {
                R.layout.verse_widget
            }

            val views = RemoteViews(context.packageName, layoutId).apply {
                // 1. Retrieve Verse Reference
                val reference = widgetData.getString(KEY_VERSE_REFERENCE, null)
                    ?: widgetData.getString(LEGACY_KEY_REFERENCE, null)
                    ?: context.getString(R.string.widget_default_reference)

                // 2. Retrieve Verse Text
                val rawText = widgetData.getString(KEY_VERSE_TEXT, null)
                    ?: widgetData.getString(LEGACY_KEY_TEXT, null)
                    ?: context.getString(R.string.widget_default_text)

                // Format quote with typography quotes
                val formattedText = if (!rawText.startsWith("«") && !rawText.startsWith("\"")) {
                    "«$rawText»"
                } else {
                    rawText
                }

                // 3. Bind data to RemoteViews
                setTextViewText(R.id.widget_verse_reference, reference)
                setTextViewText(R.id.widget_verse_text, formattedText)

                // 4. Configure deep-link click pending intent to launch Digital Sanctuary
                val deepLinkUri = Uri.parse(DEEP_LINK_SCHEME)
                val pendingIntent = HomeWidgetLaunchIntent.getActivity(
                    context,
                    MainActivity::class.java,
                    deepLinkUri
                )
                setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            }

            // 5. Commit update to widget manager
            appWidgetManager.updateAppWidget(widgetId, views)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {
        const val KEY_VERSE_REFERENCE = "verse_reference"
        const val KEY_VERSE_TEXT = "verse_text"
        const val LEGACY_KEY_REFERENCE = "votd_reference"
        const val LEGACY_KEY_TEXT = "votd_text"
        const val DEEP_LINK_SCHEME = "sanctuary://verse_of_the_day"
    }
}
