import WidgetKit
import SwiftUI

// MARK: - Digital Sanctuary Design System Colors
extension Color {
    /// Parchment Light background (#F9F6F0)
    static let sanctuaryParchment = Color(red: 249 / 255.0, green: 246 / 255.0, blue: 240 / 255.0)
    /// Deep Navy Blue primary text (#002147)
    static let sanctuaryNavy = Color(red: 0 / 255.0, green: 33 / 255.0, blue: 71 / 255.0)
    /// Soft Gold reference & accent color (#D4AF37)
    static let sanctuaryGold = Color(red: 212 / 255.0, green: 175 / 255.0, blue: 55 / 255.0)
    /// Subtle Parchment Border (#E8E0D2)
    static let sanctuaryBorder = Color(red: 232 / 255.0, green: 224 / 255.0, blue: 210 / 255.0)
    /// Muted Navy for captions (#5D6B7D)
    static let sanctuaryMuted = Color(red: 93 / 255.0, green: 107 / 255.0, blue: 125 / 255.0)
}

// MARK: - Shared Configuration & Constants
struct VerseWidgetConfig {
    static let appGroupId = "group.com.tuempresa.bibliainteligente"
    static let keyVerseReference = "verse_reference"
    static let keyVerseText = "verse_text"
    static let keyVerseBookId = "verse_book_id"
    static let keyVerseChapter = "verse_chapter"
    static let keyVerseNumber = "verse_number"
    static let legacyKeyReference = "votd_reference"
    static let legacyKeyText = "votd_text"
    static let deepLinkUrl = "sanctuary://verse_of_the_day"

    static let defaultReference = "Salmos 119:105"
    static let defaultVerseText = "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
    static let defaultBookId = "PSA"
    static let defaultChapter = 119
    static let defaultVerseNumber = 105
}

// MARK: - Timeline Entry
struct VerseEntry: TimelineEntry {
    let date: Date
    let reference: String
    let verseText: String
    let bookId: String
    let chapter: Int
    let verseNumber: Int

    var deepLinkUrl: URL {
        URL(string: "sanctuary://read?book=\(bookId)&chapter=\(chapter)&verse=\(verseNumber)")
            ?? URL(string: VerseWidgetConfig.deepLinkUrl)!
    }

    static var placeholder: VerseEntry {
        VerseEntry(
            date: Date(),
            reference: VerseWidgetConfig.defaultReference,
            verseText: VerseWidgetConfig.defaultVerseText,
            bookId: VerseWidgetConfig.defaultBookId,
            chapter: VerseWidgetConfig.defaultChapter,
            verseNumber: VerseWidgetConfig.defaultVerseNumber
        )
    }
}

// MARK: - Timeline Provider
struct VerseTimelineProvider: TimelineProvider {
    typealias Entry = VerseEntry

    func placeholder(in context: Context) -> VerseEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(loadCurrentVerseEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let entry = loadCurrentVerseEntry()

        // Schedule next automatic refresh in 1 hour or at next midnight
        let calendar = Calendar.current
        let nextUpdate = calendar.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    /// Reads shared data from App Group UserDefaults populated by Flutter
    private func loadCurrentVerseEntry() -> VerseEntry {
        guard let userDefaults = UserDefaults(suiteName: VerseWidgetConfig.appGroupId) else {
            return .placeholder
        }

        let reference = userDefaults.string(forKey: VerseWidgetConfig.keyVerseReference)
            ?? userDefaults.string(forKey: VerseWidgetConfig.legacyKeyReference)
            ?? VerseWidgetConfig.defaultReference

        let text = userDefaults.string(forKey: VerseWidgetConfig.keyVerseText)
            ?? userDefaults.string(forKey: VerseWidgetConfig.legacyKeyText)
            ?? VerseWidgetConfig.defaultVerseText

        let bookId = userDefaults.string(forKey: VerseWidgetConfig.keyVerseBookId)
            ?? VerseWidgetConfig.defaultBookId

        let rawChapter = userDefaults.integer(forKey: VerseWidgetConfig.keyVerseChapter)
        let chapter = rawChapter > 0 ? rawChapter : VerseWidgetConfig.defaultChapter

        let rawVerse = userDefaults.integer(forKey: VerseWidgetConfig.keyVerseNumber)
        let verseNumber = rawVerse > 0 ? rawVerse : VerseWidgetConfig.defaultVerseNumber

        return VerseEntry(
            date: Date(),
            reference: reference,
            verseText: text,
            bookId: bookId,
            chapter: chapter,
            verseNumber: verseNumber
        )
    }
}

// MARK: - iOS 16+ Lock Screen Rectangular Widget View
@available(iOS 16.0, *)
struct VerseAccessoryRectangularView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            // Header with Scripture icon and reference
            HStack(spacing: 4) {
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 10, weight: .bold))
                Text(entry.reference)
                    .font(.system(size: 11, weight: .bold))
                    .lineLimit(1)
            }
            .widgetAccentable()

            // Scripture quotation text clamped for Lock Screen constraints
            Text("«\(entry.verseText)»")
                .font(.system(size: 11, weight: .regular))
                .lineLimit(3)
                .multilineTextAlignment(.leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - iOS 16+ Lock Screen Inline Widget View
@available(iOS 16.0, *)
struct VerseAccessoryInlineView: View {
    let entry: VerseEntry

    var body: some View {
        Label(entry.reference, systemImage: "book.fill")
            .font(.caption)
    }
}

// MARK: - Home Screen System Small Widget View (2x2)
struct VerseSystemSmallView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header: Golden Sanctuary pill badge
            HStack(spacing: 4) {
                Image(systemName: "sparkle")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.sanctuaryGold)
                Text("VERSÍCULO DEL DÍA")
                    .font(.system(size: 8, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(.sanctuaryGold)
                Spacer()
            }

            // Scripture text in Deep Navy
            Text("«\(entry.verseText)»")
                .font(.system(size: 12, weight: .regular, design: .serif))
                .foregroundColor(.sanctuaryNavy)
                .lineSpacing(2)
                .lineLimit(4)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .topLeading)

            Spacer(minLength: 0)

            // Bottom reference in Soft Gold
            HStack {
                Rectangle()
                    .fill(Color.sanctuaryGold)
                    .frame(width: 24, height: 1.5)
                Spacer()
                Text(entry.reference)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.sanctuaryGold)
                    .lineLimit(1)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.sanctuaryParchment)
    }
}

// MARK: - Home Screen System Medium Widget View (4x2)
struct VerseSystemMediumView: View {
    let entry: VerseEntry

    var body: some View {
        HStack(spacing: 12) {
            // Gold vertical accent bar
            RoundedRectangle(cornerRadius: 2)
                .fill(Color.sanctuaryGold)
                .frame(width: 3.5)
                .padding(.vertical, 8)

            VStack(alignment: .leading, spacing: 6) {
                // Header row
                HStack {
                    HStack(spacing: 4) {
                        Image(systemName: "book.fill")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.sanctuaryGold)
                        Text("SANTUARIO DIGITAL")
                            .font(.system(size: 9, weight: .bold))
                            .tracking(0.6)
                            .foregroundColor(.sanctuaryGold)
                    }

                    Spacer()

                    // Reference badge
                    Text(entry.reference)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.sanctuaryNavy)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Color.sanctuaryGold.opacity(0.18))
                        )
                }

                // Main verse quote
                Text("«\(entry.verseText)»")
                    .font(.system(size: 13, weight: .regular, design: .serif))
                    .foregroundColor(.sanctuaryNavy)
                    .lineSpacing(3)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Spacer(minLength: 0)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.sanctuaryParchment)
    }
}

// MARK: - Entry View Routing based on WidgetFamily
struct VerseWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: VerseEntry

    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                VerseSystemSmallView(entry: entry)
            case .systemMedium:
                VerseSystemMediumView(entry: entry)
            case .accessoryRectangular:
                if #available(iOS 16.0, *) {
                    VerseAccessoryRectangularView(entry: entry)
                } else {
                    VerseSystemSmallView(entry: entry)
                }
            case .accessoryInline:
                if #available(iOS 16.0, *) {
                    VerseAccessoryInlineView(entry: entry)
                } else {
                    VerseSystemSmallView(entry: entry)
                }
            default:
                VerseSystemSmallView(entry: entry)
            }
        }
        .widgetURL(entry.deepLinkUrl)
    }
}

// MARK: - Main Widget Declaration
public struct VerseWidget: Widget {
    public let kind: String = "VerseWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: VerseTimelineProvider()
        ) { entry in
            if #available(iOS 17.0, *) {
                VerseWidgetEntryView(entry: entry)
                    .containerBackground(Color.sanctuaryParchment, for: .widget)
            } else {
                VerseWidgetEntryView(entry: entry)
            }
        }
        .configurationDisplayName("Versículo del Día")
        .description("Muestra el versículo diario de tu Santuario Digital en la pantalla de inicio y bloqueo.")
        .supportedFamilies(supportedFamilies)
    }

    private var supportedFamilies: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline]
        } else {
            return [.systemSmall, .systemMedium]
        }
    }
}

// MARK: - Widget Bundle (For Native Widget Extension Target)
@main
struct VerseWidgetBundle: WidgetBundle {
    var body: some Widget {
        VerseWidget()
    }
}
