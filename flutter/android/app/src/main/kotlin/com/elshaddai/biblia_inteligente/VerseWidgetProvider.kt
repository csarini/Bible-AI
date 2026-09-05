package com.elshaddai.biblia_inteligente

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetLaunchIntent
import es.antonborri.home_widget.HomeWidgetProvider

/**
 * Production-ready AppWidgetProvider for Biblia Inteligente (Digital Sanctuary)
 *
 * Implements Android 12+ Home Screen Widget showing the Verse of the Day.
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
            val views = RemoteViews(context.packageName, R.layout.verse_widget).apply {
                // 1. Retrieve Verse Reference (Primary key: verse_reference, Fallback: votd_reference)
                val reference = widgetData.getString(KEY_VERSE_REFERENCE, null)
                    ?: widgetData.getString(LEGACY_KEY_REFERENCE, null)
                    ?: context.getString(R.string.widget_default_reference)

                // 2. Retrieve Verse Text (Primary key: verse_text, Fallback: votd_text)
                val rawText = widgetData.getString(KEY_VERSE_TEXT, null)
                    ?: widgetData.getString(LEGACY_KEY_TEXT, null)
                    ?: context.getString(R.string.widget_default_text)

                // Format quote with typography quotes if needed
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
