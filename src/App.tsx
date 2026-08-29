import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { TopAppBar } from './components/TopAppBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNavBar } from './components/BottomNavBar';
import { ReaderView } from './components/ReaderView';
import { SearchView } from './components/SearchView';
import { SavedVersesView } from './components/SavedVersesView';
import { AIMentorView } from './components/AIMentorView';
import { LockscreenWidgetView } from './components/LockscreenWidgetView';
import { BiblicalMapsView } from './components/BiblicalMapsView';
import { HomeView } from './components/HomeView';
import { EventsView } from './components/EventsView';
import { SaveVerseModal } from './components/SaveVerseModal';
import { ShareModal } from './components/ShareModal';
import { QuickSettingsModal } from './components/QuickSettingsModal';
import { OfflineDownloadManager } from './components/OfflineDownloadManager';
import { SplashScreen } from './components/SplashScreen';
import { CoachMarkOverlay, COACHMARK_STORAGE_KEY } from './components/CoachMarkOverlay';
import { StorageService } from './services/storageService';
import { ShareContent } from './services/shareService';
import { ActiveTab, BibleVerse, LocalBookmark, ReadingSettings, HighlightColor } from './types';
import { BIBLE_BOOKS } from './data/bibleData';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showCoachMark, setShowCoachMark] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isDrawerOpenMobile, setIsDrawerOpenMobile] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [selectedMapItineraryId, setSelectedMapItineraryId] = useState<string | undefined>(undefined);
  const [selectedMapWaypointId, setSelectedMapWaypointId] = useState<string | undefined>(undefined);

  // Scripture Reading State
  const [currentBookId, setCurrentBookId] = useState<string>('MAT');
  const [currentChapter, setCurrentChapter] = useState<number>(4); // Mateo 4 as in mockups
  const [highlightedVerseNumber, setHighlightedVerseNumber] = useState<number | null>(null);

  // Storage & Bookmarks
  const [bookmarks, setBookmarks] = useState<LocalBookmark[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [settings, setSettings] = useState<ReadingSettings>(StorageService.getSettings());

  // Save Verse Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [targetVerseForSave, setTargetVerseForSave] = useState<{
    text: string;
    reference: string;
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    translation?: string;
    existingBookmark?: LocalBookmark | null;
  } | null>(null);

  // Share Verse Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalContent, setShareModalContent] = useState<ShareContent | null>(null);

  // AI Mentor input verse
  const [mentorVerse, setMentorVerse] = useState<BibleVerse | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load initial stored bookmarks and recent searches
    const bms = StorageService.getBookmarks();
    setBookmarks(bms);
    setRecentSearches(StorageService.getRecentSearches());
  }, []);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  };

  const showToast = (message: string, durationMs = 2800) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
      toastTimerRef.current = null;
    }, durationMs);
  };

  // Handle navigating directly to book & chapter
  const handleSelectBookAndChapter = (bookId: string, chapter: number, verseNum?: number) => {
    setCurrentBookId(bookId);
    setCurrentChapter(chapter);
    if (verseNum) {
      setHighlightedVerseNumber(verseNum);
    } else {
      setHighlightedVerseNumber(null);
    }
    setActiveTab('scripture');
  };

  // Open Save Verse Modal from reader or saved views
  const handleOpenSaveModal = (verse: BibleVerse, existingBookmark?: LocalBookmark) => {
    setTargetVerseForSave({
      text: verse.text,
      reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
      bookId: verse.bookId,
      bookName: verse.bookName,
      chapter: verse.chapter,
      verse: verse.verse,
      translation: settings.translation,
      existingBookmark: existingBookmark || null
    });
    setIsSaveModalOpen(true);
  };

  // Open Save Verse Modal with custom raw text/reference (e.g. from devotional or home)
  const handleOpenSaveModalRaw = (
    text: string,
    reference: string,
    bookId?: string,
    chapter?: number,
    verse?: number,
    translation?: string
  ) => {
    setTargetVerseForSave({
      text,
      reference,
      bookId: bookId || 'JHN',
      bookName: reference.split(' ')[0] || 'Biblia',
      chapter: chapter || 1,
      verse: verse || 1,
      translation: translation || settings.translation,
      existingBookmark: null
    });
    setIsSaveModalOpen(true);
  };

  // Confirm save in Drift / Storage layer
  const handleConfirmSaveBookmark = (data: {
    customTitle: string;
    personalNote: string;
    colorHex: HighlightColor;
    translation?: string;
  }) => {
    if (!targetVerseForSave) return;

    const saved = StorageService.saveBookmark({
      id: targetVerseForSave.existingBookmark?.id,
      book_name: targetVerseForSave.bookName,
      book_id: targetVerseForSave.bookId,
      chapter: targetVerseForSave.chapter,
      verse: targetVerseForSave.verse,
      text: targetVerseForSave.text,
      color_hex: data.colorHex,
      custom_title: data.customTitle,
      personal_note: data.personalNote || null,
      translation: data.translation || targetVerseForSave.translation || settings.translation
    });

    // Refresh state
    setBookmarks(StorageService.getBookmarks());
    showToast(`"${data.customTitle}" (${saved.translation || settings.translation}) guardado en el Santuario`);
  };

  const handleDeleteBookmark = (id: string) => {
    StorageService.deleteBookmark(id);
    setBookmarks(StorageService.getBookmarks());
  };

  const handleEditBookmark = (bm: LocalBookmark) => {
    setTargetVerseForSave({
      text: bm.text,
      reference: `${bm.book_name} ${bm.chapter}:${bm.verse}`,
      bookId: bm.book_id || 'JHN',
      bookName: bm.book_name,
      chapter: bm.chapter,
      verse: bm.verse,
      translation: bm.translation || settings.translation,
      existingBookmark: bm
    });
    setIsSaveModalOpen(true);
  };

  const handleAskAIMentor = (verse: BibleVerse) => {
    setMentorVerse(verse);
    setActiveTab('ai-mentor');
  };

  const handlePerformSearchText = (query: string) => {
    const updated = StorageService.addRecentSearch(query);
    setRecentSearches(updated);

    // If query matches a book name, jump to that book
    const matchedBook = BIBLE_BOOKS.find(
      (b) =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.englishName.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedBook) {
      handleSelectBookAndChapter(matchedBook.id, 1);
      showToast(`Mostrando ${matchedBook.name}`);
    } else {
      showToast(`Búsqueda: "${query}"`);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<ReadingSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      const seen = localStorage.getItem(COACHMARK_STORAGE_KEY);
      if (!seen) {
        setShowCoachMark(true);
      }
    } catch {
      setShowCoachMark(true);
    }
  };

  const isDark = settings.themeMode === 'dark';
  const isSepia = settings.themeMode === 'sepia';

  const appBgClass = isDark
    ? 'bg-[#0B0F19] text-[#F1F3F9]'
    : isSepia
    ? 'bg-[#F5EFE6] text-[#2D2319]'
    : 'bg-[#FAF8F5] text-[#1B1C19]';

  return (
    <div className={`${appBgClass} min-h-screen flex flex-col font-body-ui antialiased selection:bg-[#F25C05] selection:text-white transition-colors duration-200`}>
      {/* El-Shaddai Animated Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={handleSplashComplete}
          currentTheme={settings.themeMode}
        />
      )}

      {/* Top Application Bar */}
      <TopAppBar
        onToggleDrawer={() => setIsDrawerOpenMobile(!isDrawerOpenMobile)}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        savedCount={bookmarks.length}
        currentBookName={BIBLE_BOOKS.find((b) => b.id === currentBookId)?.name || 'Mateo'}
        currentChapter={currentChapter}
        currentTheme={settings.themeMode}
        onOpenSettings={() => setIsQuickSettingsOpen(true)}
        isSettingsOpen={isQuickSettingsOpen}
      />

      {/* Main Layout Area: Desktop Sidebar + Content Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Drawer (Desktop sidebar & Mobile drawer) */}
        <NavigationDrawer
          isOpenMobile={isDrawerOpenMobile}
          onCloseMobile={() => setIsDrawerOpenMobile(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          savedCount={bookmarks.length}
          onOpenCoachMark={() => setShowCoachMark(true)}
          onOpenSettings={() => setIsQuickSettingsOpen(true)}
          currentTheme={settings.themeMode}
          onThemeChange={(theme) => handleUpdateSettings({ themeMode: theme })}
        />

        {/* Content Canvas based on Active Tab */}
        <main
          id="main-content-canvas"
          className="flex-1 overflow-y-auto pb-24 md:pb-8 flex flex-col items-center w-full"
        >
          {activeTab === 'home' && (
            <HomeView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onNavigateScripture={(bookId, chapter, verseNum) =>
                handleSelectBookAndChapter(bookId, chapter, verseNum)
              }
              onOpenSaveModal={handleOpenSaveModalRaw}
              onShareVerse={(content) => {
                setShareModalContent(content);
                setIsShareModalOpen(true);
              }}
              onAskAIMentor={handleAskAIMentor}
              onToast={showToast}
              bookmarksCount={bookmarks.length}
              lastReadBookId={currentBookId}
              lastReadChapter={currentChapter}
              currentTheme={settings.themeMode}
            />
          )}

          {activeTab === 'scripture' && (
            <ReaderView
              currentBookId={currentBookId}
              currentChapter={currentChapter}
              onNavigateChapter={handleSelectBookAndChapter}
              bookmarks={bookmarks}
              onOpenSaveModal={handleOpenSaveModal}
              onAskAIMentor={handleAskAIMentor}
              onToast={showToast}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              highlightedVerseNumber={highlightedVerseNumber}
              onShareVerse={(content) => {
                setShareModalContent(content);
                setIsShareModalOpen(true);
              }}
              onOpenMap={(itineraryId, waypointId) => {
                if (itineraryId) setSelectedMapItineraryId(itineraryId);
                if (waypointId) setSelectedMapWaypointId(waypointId);
                setActiveTab('maps');
              }}
            />
          )}

          {activeTab === 'maps' && (
            <div className="w-full h-full flex-1 flex flex-col">
              <BiblicalMapsView
                initialItineraryId={selectedMapItineraryId}
                initialWaypointId={selectedMapWaypointId}
                onSelectScripture={(bookId, chapter, verse) => {
                  handleSelectBookAndChapter(bookId, chapter, verse);
                }}
                onToast={showToast}
                currentTheme={settings.themeMode}
              />
            </div>
          )}

          {activeTab === 'library' && (
            <SearchView
              onSelectBookAndChapter={handleSelectBookAndChapter}
              recentSearches={recentSearches}
              onPerformSearchText={handlePerformSearchText}
              currentTheme={settings.themeMode}
            />
          )}

          {activeTab === 'saved' && (
            <SavedVersesView
              bookmarks={bookmarks}
              onSelectVerse={(bookId, chapter, verse) =>
                handleSelectBookAndChapter(bookId, chapter, verse)
              }
              onEditBookmark={handleEditBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onNavigateToScripture={() => setActiveTab('scripture')}
              onToast={showToast}
              onShareVerse={(content) => {
                setShareModalContent(content);
                setIsShareModalOpen(true);
              }}
              currentTheme={settings.themeMode}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              settings={settings}
              onNavigateToScripture={(bookNameOrId, chapter, verse) => {
                const matched = BIBLE_BOOKS.find(
                  b => b.name.toLowerCase() === bookNameOrId.toLowerCase() || b.id.toLowerCase() === bookNameOrId.toLowerCase()
                );
                const effectiveBookId = matched ? matched.id : 'MAT';
                handleSelectBookAndChapter(effectiveBookId, chapter, verse);
                setActiveTab('scripture');
              }}
              onShareContent={(title, text, reference) => {
                setShareModalContent({
                  text: text,
                  reference: reference || title,
                  book: 'Biblia Inteligente',
                  chapter: 1,
                  verse: 1,
                  theme: title,
                  reflection: text,
                  prayer: ''
                });
                setIsShareModalOpen(true);
              }}
              onToast={showToast}
            />
          )}

          {(activeTab === 'devotional' || activeTab === 'widgets') && (
            <LockscreenWidgetView
              onNavigateToScripture={(bookId, chapter, verse) =>
                handleSelectBookAndChapter(bookId, chapter, verse)
              }
              onOpenSaveModal={handleOpenSaveModalRaw}
              onToast={showToast}
              onShareVerse={(content) => {
                setShareModalContent(content);
                setIsShareModalOpen(true);
              }}
              currentTheme={settings.themeMode}
            />
          )}

          {activeTab === 'ai-mentor' && (
            <AIMentorView
              initialVerse={mentorVerse}
              onNavigateToVerse={(bookId, chapter, verse) =>
                handleSelectBookAndChapter(bookId, chapter, verse)
              }
              onOpenSaveModal={handleOpenSaveModalRaw}
              currentTheme={settings.themeMode}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        savedCount={bookmarks.length}
        currentTheme={settings.themeMode}
      />

      {/* Modal: Guardar Versículo (Pixel-perfect match to Image 1) */}
      <SaveVerseModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleConfirmSaveBookmark}
        verseText={targetVerseForSave?.text || ''}
        verseReference={targetVerseForSave?.reference || ''}
        initialBookmark={targetVerseForSave?.existingBookmark}
        currentTheme={settings.themeMode}
        translation={targetVerseForSave?.translation || settings.translation}
      />

      {/* Modal: Compartir Versículo Multi-canal (WhatsApp, Telegram, Copiar, Imagen) */}
      <ShareModal
        isOpen={isShareModalOpen}
        content={shareModalContent}
        onClose={() => setIsShareModalOpen(false)}
        onToast={showToast}
        currentTheme={settings.themeMode}
      />

      {/* Modal: Ajustes Rápidos de Lectura, Tipografía y Libro */}
      <QuickSettingsModal
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        currentBookId={currentBookId}
        currentChapter={currentChapter}
        onSelectBookAndChapter={(bookId, chapter) => {
          handleSelectBookAndChapter(bookId, chapter);
          setIsQuickSettingsOpen(false);
        }}
        onToast={showToast}
      />

      {/* First-time Onboarding & Coach Mark Guide Overlay */}
      <CoachMarkOverlay
        isOpen={showCoachMark}
        onClose={() => setShowCoachMark(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Offline Bible Background Synchronizer & Indicator */}
      <OfflineDownloadManager
        onToast={showToast}
        onCloseToast={hideToast}
        currentTranslation={settings.translation}
      />

      {/* Global Toast Notification with auto & manual dismiss */}
      {toastMessage && (
        <div
          id="global-app-toast"
          className="fixed bottom-20 md:bottom-8 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 z-50 bg-[#0B2B68] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-2xl border border-[#F25C05]/60 font-body-ui text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-[#F25C05] animate-ping shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
          <button
            onClick={hideToast}
            className="ml-1 p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Cerrar notificación"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
