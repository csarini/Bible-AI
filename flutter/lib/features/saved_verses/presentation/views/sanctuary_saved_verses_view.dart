import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart' as drift;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/services/share_service.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class SanctuarySavedVersesView extends ConsumerStatefulWidget {
  final AppDatabase database;

  const SanctuarySavedVersesView({super.key, required this.database});

  @override
  ConsumerState<SanctuarySavedVersesView> createState() =>
      _SanctuarySavedVersesViewState();
}

class _SanctuarySavedVersesViewState extends ConsumerState<SanctuarySavedVersesView> {
  String _searchQuery = '';
  String? _selectedColorFilter;

  void _editBookmark(LocalBookmarkEntry bookmark) {
    final titleController =
        TextEditingController(text: bookmark.customTitle ?? '');
    final noteController =
        TextEditingController(text: bookmark.personalNote ?? '');
    String selectedHex = bookmark.colorHex;

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Editar ${bookmark.bookName} ${bookmark.chapter}:${bookmark.verse}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Color de resaltado:',
                    style:
                        TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: SanctuaryColors.pastelPalette.map((col) {
                    final hex = SanctuaryColors.colorToHex(col);
                    final isChosen = selectedHex == hex;
                    return GestureDetector(
                      onTap: () => setDialogState(() => selectedHex = hex),
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: col,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isChosen
                                ? SanctuaryColors.waveNavy
                                : Colors.black26,
                            width: isChosen ? 2.5 : 1,
                          ),
                        ),
                        child: isChosen
                            ? const Icon(Icons.check,
                                size: 16, color: SanctuaryColors.waveNavy)
                            : null,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: titleController,
                  decoration: InputDecoration(
                    labelText: 'Título Personal',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: noteController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Reflexión / Nota',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: SanctuaryColors.waveNavy,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                await widget.database.insertOrUpdateBookmark(
                  LocalBookmarksCompanion.insert(
                    id: bookmark.id,
                    bookId: bookmark.bookId,
                    bookName: bookmark.bookName,
                    chapter: bookmark.chapter,
                    verse: bookmark.verse,
                    verseText: bookmark.verseText,
                    colorHex: selectedHex,
                    customTitle: drift.Value(titleController.text.trim().isEmpty
                        ? null
                        : titleController.text.trim()),
                    personalNote: drift.Value(noteController.text.trim().isEmpty
                        ? null
                        : noteController.text.trim()),
                  ),
                );
                Navigator.pop(dialogCtx);
              },
              child: const Text('Guardar'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: Navigator.canPop(context)
            ? const BackButton()
            : IconButton(
                icon: const Icon(LucideIcons.menu),
                tooltip: 'Menú Lateral',
                onPressed: openSanctuaryDrawer,
              ),
        title: const Text(
          'Santuario de Guardados',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter & Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 4),
            child: TextField(
              onChanged: (val) =>
                  setState(() => _searchQuery = val.toLowerCase()),
              decoration: InputDecoration(
                hintText: 'Buscar por libro, pasaje, título o nota...',
                prefixIcon: const Icon(LucideIcons.search, size: 18),
                filled: true,
                contentPadding:
                    const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Pastel Color Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('Todos'),
                  selected: _selectedColorFilter == null,
                  onSelected: (_) =>
                      setState(() => _selectedColorFilter = null),
                ),
                const SizedBox(width: 6),
                ...SanctuaryColors.pastelPalette.map((col) {
                  final hex = SanctuaryColors.colorToHex(col);
                  final isSelected = _selectedColorFilter == hex;
                  final categoryLabel = SanctuaryColors.getHighlightLabel(hex);

                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: FilterChip(
                      avatar: CircleAvatar(backgroundColor: col, radius: 8),
                      label: Text(categoryLabel),
                      selected: isSelected,
                      onSelected: (selected) {
                        setState(() {
                          _selectedColorFilter = selected ? hex : null;
                        });
                      },
                    ),
                  );
                }),
              ],
            ),
          ),

          Expanded(
            child: StreamBuilder<List<LocalBookmarkEntry>>(
              stream: widget.database.watchAllBookmarks(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                      child: CircularProgressIndicator(
                          color: SanctuaryColors.waveNavy));
                }

                final allBookmarks = snapshot.data ?? [];
                final filtered = allBookmarks.where((b) {
                  final matchesQuery = b.bookName
                          .toLowerCase()
                          .contains(_searchQuery) ||
                      b.verseText.toLowerCase().contains(_searchQuery) ||
                      (b.customTitle?.toLowerCase().contains(_searchQuery) ??
                          false) ||
                      (b.personalNote?.toLowerCase().contains(_searchQuery) ??
                          false);

                  final matchesColor = _selectedColorFilter == null ||
                      b.colorHex.toUpperCase() ==
                          _selectedColorFilter!.toUpperCase();

                  return matchesQuery && matchesColor;
                }).toList();

                if (filtered.isEmpty) {
                  return _buildEmptyState();
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(14, 8, 14, 24),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = filtered[index];
                    return _buildBookmarkCard(item);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookmarkCard(LocalBookmarkEntry item) {
    final highlightColor = SanctuaryColors.getHighlightColor(item.colorHex);

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          ref.read(appSelectedBookProvider.notifier).state = item.bookId;
          ref.read(appSelectedChapterProvider.notifier).state = item.chapter;
          ref.read(appSelectedVerseProvider.notifier).state = item.verse;
          ref.read(selectedTabProvider.notifier).state = 1; // Reader tab
          if (Navigator.canPop(context)) {
            Navigator.pop(context);
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: highlightColor,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${item.bookName} ${item.chapter}:${item.verse}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints:
                            const BoxConstraints(minWidth: 36, minHeight: 36),
                        icon: const Icon(LucideIcons.edit2, size: 17),
                        tooltip: 'Editar Nota / Color',
                        onPressed: () => _editBookmark(item),
                      ),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints:
                            const BoxConstraints(minWidth: 36, minHeight: 36),
                        icon: const Icon(LucideIcons.share2, size: 17),
                        tooltip: 'Compartir',
                        onPressed: () {
                          ShareService.shareScripture(
                            context: context,
                            reference:
                                '${item.bookName} ${item.chapter}:${item.verse}',
                            text: item.verseText,
                            customTitle: item.customTitle,
                            personalReflection: item.personalNote,
                          );
                        },
                      ),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints:
                            const BoxConstraints(minWidth: 36, minHeight: 36),
                        icon: const Icon(LucideIcons.trash2,
                            size: 17, color: Colors.redAccent),
                        tooltip: 'Eliminar',
                        onPressed: () => widget.database.deleteBookmark(item.id),
                      ),
                    ],
                  ),
                ],
              ),
              if (item.customTitle != null && item.customTitle!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  item.customTitle!,
                  style:
                      const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                ),
              ],
              const SizedBox(height: 6),
              Text(
                '"${item.verseText}"',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontStyle: FontStyle.italic,
                      height: 1.45,
                    ),
              ),
              if (item.personalNote != null && item.personalNote!.isNotEmpty) ...[
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: SanctuaryColors.waveNavy.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'Reflexión: ${item.personalNote}',
                    style: const TextStyle(fontSize: 12.5),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.bookmark,
                size: 48, color: SanctuaryColors.waveNavy.withOpacity(0.3)),
            const SizedBox(height: 12),
            const Text(
              'No hay versículos guardados',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 6),
            const Text(
              'Toca cualquier versículo mientras lees para resaltarlo, asignarle un título y escribir tu reflexión.',
              style: TextStyle(fontSize: 13, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
