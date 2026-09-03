import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:drift/drift.dart' as drift;
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';
import 'pulpit_presentation_view.dart';

/// Available icon keys matching React's AVAILABLE_ICONS
const List<Map<String, dynamic>> kCategoryIconOptions = [
  {'key': 'BookOpen', 'label': 'Libro', 'icon': LucideIcons.bookOpen},
  {'key': 'Mic', 'label': 'Prédica', 'icon': LucideIcons.mic},
  {'key': 'HeartHandshake', 'label': 'Familia', 'icon': LucideIcons.heart},
  {'key': 'Users', 'label': 'Comunidad', 'icon': LucideIcons.users},
  {'key': 'Flame', 'label': 'Fuego', 'icon': LucideIcons.flame},
  {'key': 'Sparkles', 'label': 'Especial', 'icon': LucideIcons.sparkles},
  {'key': 'Calendar', 'label': 'Calendario', 'icon': LucideIcons.calendar},
  {'key': 'FileText', 'label': 'Apuntes', 'icon': LucideIcons.fileText},
];

/// Institutional color palette matching El-Shaddai specs
const List<String> kCategoryColorOptions = [
  '#0B2B68', // Wave Navy
  '#F25C05', // Sun Orange
  '#00A3E0', // Cyan Accent
  '#FED65B', // Amber Gold
  '#4E53A4', // Brand Purple
  '#10B981', // Emerald Green
  '#DC2626', // Crimson
  '#DB2777', // Rose
];

/// Preset gallery images matching React's EVENT_IMAGE_PRESETS
const List<Map<String, String>> kEventImagePresets = [
  {
    'label': 'Culto Dominical',
    'url':
        'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
  },
  {
    'label': 'Conferencia & Prédica',
    'url':
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
  },
  {
    'label': 'Matrimonios & Familia',
    'url':
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
  },
  {
    'label': 'Alabanza & Adoración',
    'url':
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
  },
  {
    'label': 'Jóvenes & Campamento',
    'url':
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
  },
  {
    'label': 'Vigilia & Oración',
    'url':
        'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80',
  },
];

const String kDefaultChurchLocation = 'Salón Principal (Brown 1285, San Juan)';

/// Helper class to encapsulate extended metadata stored in foodServiceDetails (JSON)
class EventDetailsMetadata {
  final String? location;
  final String? startTime;
  final String? endTime;
  final String? imageUrl;
  final String? price;
  final List<String> tags;

  EventDetailsMetadata({
    this.location,
    this.startTime,
    this.endTime,
    this.imageUrl,
    this.price,
    this.tags = const [],
  });

  Map<String, dynamic> toJson() => {
        'location': location,
        'startTime': startTime,
        'endTime': endTime,
        'imageUrl': imageUrl,
        'price': price,
        'tags': tags,
      };

  factory EventDetailsMetadata.fromJson(Map<String, dynamic> json) =>
      EventDetailsMetadata(
        location: json['location'] as String?,
        startTime: json['startTime'] as String?,
        endTime: json['endTime'] as String?,
        imageUrl: json['imageUrl'] as String?,
        price: json['price'] as String?,
        tags: (json['tags'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [],
      );

  static EventDetailsMetadata fromRawString(String? raw) {
    if (raw == null || raw.trim().isEmpty) return EventDetailsMetadata();
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) {
        return EventDetailsMetadata.fromJson(decoded);
      }
    } catch (_) {}
    return EventDetailsMetadata(location: raw);
  }
}

class SanctuaryEventsView extends StatefulWidget {
  final AppDatabase database;

  const SanctuaryEventsView({super.key, required this.database});

  @override
  State<SanctuaryEventsView> createState() => _SanctuaryEventsViewState();
}

class _SanctuaryEventsViewState extends State<SanctuaryEventsView> {
  String _selectedCategoryFilter = 'ALL';
  String _searchQuery = '';
  final Set<String> _expandedEventIds = {};

  IconData _getCategoryIcon(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'bookopen':
      case 'book-open':
      case 'book':
        return LucideIcons.bookOpen;
      case 'mic':
        return LucideIcons.mic;
      case 'hearthandshake':
      case 'handshake':
      case 'heart':
        return LucideIcons.heart;
      case 'users':
        return LucideIcons.users;
      case 'flame':
        return LucideIcons.flame;
      case 'sparkles':
        return LucideIcons.sparkles;
      case 'calendar':
        return LucideIcons.calendar;
      case 'filetext':
      case 'file-text':
        return LucideIcons.fileText;
      case 'sun':
        return LucideIcons.sun;
      default:
        return LucideIcons.bookOpen;
    }
  }

  Color _parseHexColor(String hexString,
      {Color fallback = SanctuaryColors.waveNavy}) {
    try {
      final hex = hexString.replaceAll('#', '').trim();
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      } else if (hex.length == 8) {
        return Color(int.parse(hex, radix: 16));
      }
    } catch (_) {}
    return fallback;
  }

  List<String> _parseLinkedVerses(String raw) {
    if (raw.trim().isEmpty) return [];
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded.map((e) => e.toString()).toList();
      }
    } catch (_) {}
    return [];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.calendar,
                size: 20, color: SanctuaryColors.sunOrange),
            const SizedBox(width: 8),
            Text(
              'Prédicas & Eventos',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
        actions: [
          // New Category button
          IconButton(
            icon: const Icon(LucideIcons.folderPlus,
                color: SanctuaryColors.sunOrange),
            tooltip: 'Nueva Categoría',
            onPressed: () => _showAddCategoryDialog(context),
          ),
          // New Sermon/Event button
          IconButton(
            icon: const Icon(LucideIcons.plusCircle,
                color: SanctuaryColors.waveNavy),
            tooltip: 'Nuevo Apunte / Prédica',
            onPressed: () => _openEventFormSheet(context),
          ),
          // QuickSettings button
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
      ),
      body: StreamBuilder<List<EventCategoryEntry>>(
        stream: widget.database.watchAllCategories(),
        builder: (context, catSnapshot) {
          final categories = catSnapshot.data ?? [];

          return StreamBuilder<List<UserEventEntry>>(
            stream: widget.database.watchAllEvents(),
            builder: (context, eventSnapshot) {
              final allEvents = eventSnapshot.data ?? [];

              // Filter events by selected category and search query
              final filteredEvents = allEvents.filter((evt) {
                final matchesCategory = _selectedCategoryFilter == 'ALL' ||
                    evt.categoryId == _selectedCategoryFilter;

                final q = _searchQuery.toLowerCase().trim();
                if (q.isEmpty) return matchesCategory;

                final meta =
                    EventDetailsMetadata.fromRawString(evt.foodServiceDetails);
                final verses = _parseLinkedVerses(evt.linkedVersesJson);

                final matchesSearch = evt.title.toLowerCase().contains(q) ||
                    evt.description.toLowerCase().contains(q) ||
                    verses.any((v) => v.toLowerCase().contains(q)) ||
                    meta.tags.any((t) => t.toLowerCase().contains(q)) ||
                    (meta.location?.toLowerCase().contains(q) ?? false) ||
                    (meta.price?.toLowerCase().contains(q) ?? false);

                return matchesCategory && matchesSearch;
              }).toList();

              // Calculate total linked verses
              int totalVerses = 0;
              for (final e in allEvents) {
                totalVerses += _parseLinkedVerses(e.linkedVersesJson).length;
              }

              return CustomScrollView(
                slivers: [
                  // Top Banner & Micro stats
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF131B2E)
                            : const Color(0xFFF1F5F9),
                        border: Border(
                          bottom: BorderSide(
                            color: theme.colorScheme.outline
                                .withValues(alpha: 0.2),
                          ),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: SanctuaryColors.waveNavy,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'BITÁCORA ECLESIAL',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.inter(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                          letterSpacing: 0.8,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Prédicas & Eventos',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.playfairDisplay(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (allEvents.isNotEmpty)
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                PulpitPresentationView(
                                              event: allEvents.first,
                                            ),
                                          ),
                                        );
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            SanctuaryColors.emeraldGreen,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 8),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                        elevation: 0,
                                      ),
                                      icon: const Icon(LucideIcons.play,
                                          size: 13),
                                      label: Text(
                                        'Iniciar',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.inter(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  if (allEvents.isNotEmpty)
                                    const SizedBox(width: 6),
                                  ElevatedButton.icon(
                                    onPressed: () =>
                                        _openEventFormSheet(context),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: SanctuaryColors.waveNavy,
                                      foregroundColor:
                                          SanctuaryColors.sunOrange,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 8),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      elevation: 0,
                                    ),
                                    icon:
                                        const Icon(LucideIcons.plus, size: 14),
                                    label: Text(
                                      'Nuevo Apunte',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          // Stats row wrapped safely
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: [
                              _buildStatBadge(
                                icon: LucideIcons.mic,
                                label: '${allEvents.length} notas',
                                color: SanctuaryColors.waveNavy,
                                theme: theme,
                              ),
                              _buildStatBadge(
                                icon: LucideIcons.folderPlus,
                                label: '${categories.length} categorías',
                                color: SanctuaryColors.sunOrange,
                                theme: theme,
                              ),
                              _buildStatBadge(
                                icon: LucideIcons.bookOpen,
                                label: '$totalVerses citas',
                                color: SanctuaryColors.electricCyan,
                                theme: theme,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Search Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText:
                              'Buscar prédicas, temas o pasajes bíblicos...',
                          hintStyle: GoogleFonts.inter(fontSize: 13),
                          prefixIcon: const Icon(LucideIcons.search, size: 18),
                          suffixIcon: _searchQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(LucideIcons.x, size: 16),
                                  onPressed: () =>
                                      setState(() => _searchQuery = ''),
                                )
                              : null,
                          filled: true,
                          fillColor:
                              isDark ? const Color(0xFF1E293B) : Colors.white,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.3),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.2),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Category Filter Horizontal Scroll
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 44,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: [
                          // "Todos" Chip
                          Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () =>
                                  setState(() => _selectedCategoryFilter = 'ALL'),
                              borderRadius: BorderRadius.circular(20),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: _selectedCategoryFilter == 'ALL'
                                      ? SanctuaryColors.waveNavy
                                      : theme.colorScheme.surface,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: _selectedCategoryFilter == 'ALL'
                                        ? SanctuaryColors.waveNavy
                                        : theme.colorScheme.outline
                                            .withValues(alpha: 0.25),
                                    width: 1.1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      LucideIcons.sparkles,
                                      size: 13,
                                      color: _selectedCategoryFilter == 'ALL'
                                          ? Colors.white
                                          : theme.colorScheme.onSurface,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Todos',
                                      style: TextStyle(
                                        color: _selectedCategoryFilter == 'ALL'
                                            ? Colors.white
                                            : theme.colorScheme.onSurface,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: _selectedCategoryFilter == 'ALL'
                                            ? Colors.white.withValues(alpha: 0.25)
                                            : theme.colorScheme.onSurface
                                                .withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        '${allEvents.length}',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: _selectedCategoryFilter == 'ALL'
                                              ? Colors.white
                                              : theme.colorScheme.onSurface,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),

                          // Dynamic Categories Chips
                          ...categories.map((cat) {
                            final isSelected =
                                _selectedCategoryFilter == cat.id;
                            final count = allEvents
                                .where((e) => e.categoryId == cat.id)
                                .length;
                            final catColor = _parseHexColor(cat.colorHex);
                            final catIcon = _getCategoryIcon(cat.iconName);

                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: () => setState(
                                      () => _selectedCategoryFilter = cat.id),
                                  borderRadius: BorderRadius.circular(20),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? SanctuaryColors.waveNavy
                                          : theme.colorScheme.surface,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: isSelected
                                            ? SanctuaryColors.waveNavy
                                            : theme.colorScheme.outline
                                                .withValues(alpha: 0.25),
                                        width: 1.1,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: BoxDecoration(
                                            color: catColor,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 5),
                                        Icon(
                                          catIcon,
                                          size: 13,
                                          color: isSelected
                                              ? Colors.white
                                              : theme.colorScheme.onSurface,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          cat.name,
                                          style: TextStyle(
                                            color: isSelected
                                                ? Colors.white
                                                : theme.colorScheme.onSurface,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 12,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 5, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? Colors.white
                                                    .withValues(alpha: 0.25)
                                                : theme.colorScheme.onSurface
                                                    .withValues(alpha: 0.1),
                                            borderRadius:
                                                BorderRadius.circular(10),
                                          ),
                                          child: Text(
                                            '$count',
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: isSelected
                                                  ? Colors.white
                                                  : theme.colorScheme.onSurface,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }),

                          // Quick Action: Add Category Button
                          ActionChip(
                            avatar: const Icon(LucideIcons.folderPlus,
                                size: 14, color: SanctuaryColors.sunOrange),
                            label: Text(
                              '+ Nueva Categoría',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: SanctuaryColors.sunOrange,
                              ),
                            ),
                            backgroundColor: SanctuaryColors.sunOrange
                                .withValues(alpha: 0.1),
                            side: BorderSide(
                              color: SanctuaryColors.sunOrange
                                  .withValues(alpha: 0.3),
                            ),
                            onPressed: () => _showAddCategoryDialog(context),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 8)),

                  // Events List Feed
                  if (filteredEvents.isEmpty)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(18),
                                decoration: BoxDecoration(
                                  color: SanctuaryColors.sunOrange
                                      .withValues(alpha: 0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  LucideIcons.bookOpen,
                                  size: 40,
                                  color: SanctuaryColors.sunOrange,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                _searchQuery.isNotEmpty
                                    ? 'No hay resultados para "$_searchQuery"'
                                    : 'Sin prédicas ni notas en esta sección',
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Registra bosquejos, versículos bíblicos clave, horarios y apuntes litúrgicos.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.65),
                                ),
                              ),
                              const SizedBox(height: 20),
                              FilledButton.icon(
                                onPressed: () => _openEventFormSheet(context),
                                style: FilledButton.styleFrom(
                                  backgroundColor: SanctuaryColors.waveNavy,
                                  foregroundColor: SanctuaryColors.amberGold,
                                ),
                                icon: const Icon(LucideIcons.plus, size: 16),
                                label: const Text('Agregar Nueva Prédica'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final item = filteredEvents[index];
                            final cat = categories.firstWhere(
                              (c) => c.id == item.categoryId,
                              orElse: () => EventCategoryEntry(
                                id: 'cat_default',
                                name: 'General',
                                colorHex: '#0B2B68',
                                iconName: 'BookOpen',
                                createdAt: DateTime.now(),
                              ),
                            );

                            final meta = EventDetailsMetadata.fromRawString(
                                item.foodServiceDetails);
                            final verses =
                                _parseLinkedVerses(item.linkedVersesJson);
                            final catColor = _parseHexColor(cat.colorHex);
                            final catIcon = _getCategoryIcon(cat.iconName);
                            final isExpanded =
                                _expandedEventIds.contains(item.id);

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 0,
                              clipBehavior: Clip.antiAlias,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(
                                  color: theme.colorScheme.outline
                                      .withValues(alpha: 0.25),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Color accent top strip
                                  Container(
                                    height: 4,
                                    width: double.infinity,
                                    color: catColor,
                                  ),

                                  // Optional Banner Image
                                  if (meta.imageUrl != null &&
                                      meta.imageUrl!.trim().isNotEmpty)
                                    Stack(
                                      children: [
                                        Image.network(
                                          meta.imageUrl!,
                                          height: 130,
                                          width: double.infinity,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) =>
                                              const SizedBox.shrink(),
                                        ),
                                        if (meta.price != null &&
                                            meta.price!.trim().isNotEmpty)
                                          Positioned(
                                            bottom: 8,
                                            right: 8,
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 4),
                                              decoration: BoxDecoration(
                                                color: SanctuaryColors
                                                    .emeraldGreen
                                                    .withValues(alpha: 0.9),
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(LucideIcons.ticket,
                                                      size: 12,
                                                      color: Colors.white),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    meta.price!,
                                                    style: GoogleFonts.inter(
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.w800,
                                                      color: Colors.white,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),

                                  Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        // Top Row: Category badge & Date
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Align(
                                                alignment: Alignment.centerLeft,
                                                child: Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                          horizontal: 8,
                                                          vertical: 3),
                                                  decoration: BoxDecoration(
                                                    color: catColor.withValues(
                                                        alpha: 0.12),
                                                    borderRadius:
                                                        BorderRadius.circular(8),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      Icon(catIcon,
                                                          size: 13,
                                                          color: catColor),
                                                      const SizedBox(width: 5),
                                                      Flexible(
                                                        child: Text(
                                                          cat.name,
                                                          maxLines: 1,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              GoogleFonts.inter(
                                                            fontSize: 11.5,
                                                            fontWeight:
                                                                FontWeight.w700,
                                                            color: catColor,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(LucideIcons.calendar,
                                                    size: 13,
                                                    color: SanctuaryColors
                                                        .sunOrange),
                                                const SizedBox(width: 4),
                                                Text(
                                                  item.eventDate
                                                      .toLocal()
                                                      .toString()
                                                      .split(' ')[0],
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: GoogleFonts.inter(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w700,
                                                    color: SanctuaryColors
                                                        .sunOrange,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),

                                        const SizedBox(height: 10),

                                        // Sermon Title
                                        Text(
                                          item.title,
                                          style: GoogleFonts.playfairDisplay(
                                            fontSize: 17,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),

                                        // Schedule & Location if available
                                        if ((meta.startTime != null &&
                                                meta.startTime!.isNotEmpty) ||
                                            (meta.location != null &&
                                                meta.location!.isNotEmpty)) ...[
                                          const SizedBox(height: 6),
                                          Wrap(
                                            spacing: 12,
                                            runSpacing: 4,
                                            children: [
                                              if (meta.startTime != null &&
                                                  meta.startTime!.isNotEmpty)
                                                Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    const Icon(
                                                        LucideIcons.clock,
                                                        size: 12,
                                                        color: SanctuaryColors
                                                            .electricCyan),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      meta.endTime != null &&
                                                              meta.endTime!
                                                                  .isNotEmpty
                                                          ? '${meta.startTime} - ${meta.endTime}'
                                                          : meta.startTime!,
                                                      style: GoogleFonts.inter(
                                                        fontSize: 11.5,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        color: SanctuaryColors
                                                            .electricCyan,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              if (meta.location != null &&
                                                  meta.location!.isNotEmpty)
                                                Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    const Icon(
                                                        LucideIcons.mapPin,
                                                        size: 12,
                                                        color: SanctuaryColors
                                                            .sunOrange),
                                                    const SizedBox(width: 4),
                                                    Flexible(
                                                      child: Text(
                                                        meta.location!,
                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        style:
                                                            GoogleFonts.inter(
                                                          fontSize: 11.5,
                                                          color: theme
                                                              .colorScheme
                                                              .onSurface
                                                              .withValues(
                                                                  alpha: 0.7),
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                            ],
                                          ),
                                        ],

                                        // Linked verses
                                        if (verses.isNotEmpty) ...[
                                          const SizedBox(height: 8),
                                          Wrap(
                                            spacing: 6,
                                            runSpacing: 4,
                                            children: verses.map((v) {
                                              return Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 8,
                                                        vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: SanctuaryColors
                                                      .waveNavy
                                                      .withValues(alpha: 0.08),
                                                  borderRadius:
                                                      BorderRadius.circular(6),
                                                  border: Border.all(
                                                    color: SanctuaryColors
                                                        .waveNavy
                                                        .withValues(alpha: 0.2),
                                                  ),
                                                ),
                                                child: Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    const Icon(
                                                        LucideIcons.bookOpen,
                                                        size: 11,
                                                        color: SanctuaryColors
                                                            .waveNavy),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      v,
                                                      style: GoogleFonts.inter(
                                                        fontSize: 11,
                                                        fontWeight:
                                                            FontWeight.w700,
                                                        color: SanctuaryColors
                                                            .waveNavy,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              );
                                            }).toList(),
                                          ),
                                        ],

                                        // Tags
                                        if (meta.tags.isNotEmpty) ...[
                                          const SizedBox(height: 6),
                                          Wrap(
                                            spacing: 5,
                                            children: meta.tags.map((t) {
                                              return Text(
                                                '#$t',
                                                style: GoogleFonts.inter(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                  color:
                                                      SanctuaryColors.sunOrange,
                                                ),
                                              );
                                            }).toList(),
                                          ),
                                        ],

                                        // Description / Notes
                                        if (item.description.isNotEmpty) ...[
                                          const SizedBox(height: 8),
                                          Text(
                                            item.description,
                                            maxLines: isExpanded ? 50 : 3,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.inter(
                                              fontSize: 13,
                                              height: 1.5,
                                              color: theme.colorScheme.onSurface
                                                  .withValues(alpha: 0.8),
                                            ),
                                          ),
                                          if (item.description.length > 150)
                                            GestureDetector(
                                              onTap: () {
                                                setState(() {
                                                  if (isExpanded) {
                                                    _expandedEventIds
                                                        .remove(item.id);
                                                  } else {
                                                    _expandedEventIds
                                                        .add(item.id);
                                                  }
                                                });
                                              },
                                              child: Padding(
                                                padding: const EdgeInsets.only(
                                                    top: 4),
                                                child: Text(
                                                  isExpanded
                                                      ? 'Ver menos'
                                                      : 'Ver más...',
                                                  style: GoogleFonts.inter(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w700,
                                                    color: SanctuaryColors
                                                        .electricCyan,
                                                  ),
                                                ),
                                              ),
                                            ),
                                        ],

                                        const SizedBox(height: 12),
                                        const Divider(height: 1),
                                        const SizedBox(height: 8),

                                        // Actions Row
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            // Pulpit mode button
                                            Flexible(
                                              child: FilledButton.tonalIcon(
                                                onPressed: () {
                                                  Navigator.of(context).push(
                                                    MaterialPageRoute(
                                                      builder: (_) =>
                                                          PulpitPresentationView(
                                                        event: item,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                style: FilledButton.styleFrom(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 10,
                                                      vertical: 6),
                                                  backgroundColor:
                                                      SanctuaryColors.waveNavy
                                                          .withValues(
                                                              alpha: 0.1),
                                                ),
                                                icon: const Icon(
                                                    LucideIcons.presentation,
                                                    size: 13,
                                                    color: SanctuaryColors
                                                        .waveNavy),
                                                label: Text(
                                                  'Modo Púlpito',
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: GoogleFonts.inter(
                                                    fontSize: 11.5,
                                                    fontWeight: FontWeight.w800,
                                                    color: SanctuaryColors
                                                        .waveNavy,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                // Share button
                                                IconButton(
                                                  visualDensity:
                                                      VisualDensity.compact,
                                                  padding: EdgeInsets.zero,
                                                  constraints:
                                                      const BoxConstraints(
                                                          minWidth: 34,
                                                          minHeight: 34),
                                                  icon: const Icon(
                                                      LucideIcons.share2,
                                                      size: 16),
                                                  tooltip: 'Compartir apunte',
                                                  onPressed: () => _shareEvent(
                                                      context,
                                                      item,
                                                      cat.name,
                                                      verses),
                                                ),
                                                // Edit button
                                                IconButton(
                                                  visualDensity:
                                                      VisualDensity.compact,
                                                  padding: EdgeInsets.zero,
                                                  constraints:
                                                      const BoxConstraints(
                                                          minWidth: 34,
                                                          minHeight: 34),
                                                  icon: const Icon(
                                                      LucideIcons.edit3,
                                                      size: 16),
                                                  tooltip: 'Editar prédica',
                                                  onPressed: () =>
                                                      _openEventFormSheet(
                                                          context,
                                                          event: item),
                                                ),
                                                // Delete button
                                                IconButton(
                                                  visualDensity:
                                                      VisualDensity.compact,
                                                  padding: EdgeInsets.zero,
                                                  constraints:
                                                      const BoxConstraints(
                                                          minWidth: 34,
                                                          minHeight: 34),
                                                  icon: const Icon(
                                                      LucideIcons.trash2,
                                                      size: 16,
                                                      color: Colors.redAccent),
                                                  tooltip: 'Eliminar',
                                                  onPressed: () =>
                                                      _confirmDeleteEvent(
                                                          context, item),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                          childCount: filteredEvents.length,
                        ),
                      ),
                    ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildStatBadge({
    required IconData icon,
    required String label,
    required Color color,
    required ThemeData theme,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // ADD / EDIT EVENT FORM MODAL (FULL EXPERIENCE)
  // ===========================================================================
  void _openEventFormSheet(BuildContext context, {UserEventEntry? event}) {
    final titleController = TextEditingController(text: event?.title ?? '');
    final notesController =
        TextEditingController(text: event?.description ?? '');
    final verseInputController = TextEditingController();
    final tagInputController = TextEditingController();

    final existingMeta =
        EventDetailsMetadata.fromRawString(event?.foodServiceDetails);
    final locationController = TextEditingController(
        text: existingMeta.location ?? kDefaultChurchLocation);
    final startTimeController =
        TextEditingController(text: existingMeta.startTime ?? '');
    final endTimeController =
        TextEditingController(text: existingMeta.endTime ?? '');
    final imageUrlController =
        TextEditingController(text: existingMeta.imageUrl ?? '');
    final priceController =
        TextEditingController(text: existingMeta.price ?? '');

    DateTime selectedDate = event?.eventDate ?? DateTime.now();
    String selectedCategoryId = event?.categoryId ?? 'cat_predica';
    List<String> linkedVerses =
        event != null ? _parseLinkedVerses(event.linkedVersesJson) : [];
    List<String> tags = List.from(existingMeta.tags);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final theme = Theme.of(ctx);
            final isDark = theme.brightness == Brightness.dark;

            return Container(
              height: MediaQuery.of(ctx).size.height * 0.92,
              decoration: BoxDecoration(
                color:
                    isDark ? const Color(0xFF0F172A) : const Color(0xFFFAF8F5),
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Modal Header
                  Container(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF1E293B)
                          : const Color(0xFFF1F5F9),
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(24)),
                      border: Border(
                        bottom: BorderSide(
                          color:
                              theme.colorScheme.outline.withValues(alpha: 0.2),
                        ),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(LucideIcons.arrowLeft, size: 20),
                                onPressed: () => Navigator.of(ctx).pop(),
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      event != null
                                          ? 'Editar Apunte / Prédica'
                                          : 'Nueva Prédica o Devocional',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 16,
                                      ),
                                    ),
                                    Text(
                                      'Bitácora litúrgica eclesial',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        color: theme.colorScheme.onSurface
                                            .withValues(alpha: 0.6),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        FilledButton.icon(
                          onPressed: () async {
                            if (titleController.text.trim().isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Escribe un título para la prédica.')),
                              );
                              return;
                            }

                            final metaToSave = EventDetailsMetadata(
                              location: locationController.text.trim().isEmpty
                                  ? null
                                  : locationController.text.trim(),
                              startTime: startTimeController.text.trim().isEmpty
                                  ? null
                                  : startTimeController.text.trim(),
                              endTime: endTimeController.text.trim().isEmpty
                                  ? null
                                  : endTimeController.text.trim(),
                              imageUrl: imageUrlController.text.trim().isEmpty
                                  ? null
                                  : imageUrlController.text.trim(),
                              price: priceController.text.trim().isEmpty
                                  ? null
                                  : priceController.text.trim(),
                              tags: tags,
                            );

                            final id = event?.id ??
                                'event_${DateTime.now().millisecondsSinceEpoch}';

                            await widget.database.insertOrUpdateEvent(
                              UserEventsCompanion.insert(
                                id: id,
                                categoryId: selectedCategoryId,
                                title: titleController.text.trim(),
                                description: notesController.text.trim(),
                                linkedVersesJson:
                                    drift.Value(jsonEncode(linkedVerses)),
                                eventDate: selectedDate,
                                hasFoodService: const drift.Value(false),
                                foodServiceDetails: drift.Value(
                                    jsonEncode(metaToSave.toJson())),
                                hasChildCare: const drift.Value(false),
                                hasBookSales: const drift.Value(false),
                              ),
                            );

                            if (ctx.mounted) {
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(event != null
                                      ? 'Prédica actualizada con éxito'
                                      : '¡Prédica registrada en tu bitácora!'),
                                  backgroundColor: SanctuaryColors.waveNavy,
                                ),
                              );
                            }
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: SanctuaryColors.waveNavy,
                            foregroundColor: SanctuaryColors.amberGold,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          icon: const Icon(LucideIcons.save, size: 15),
                          label: const Text('Guardar'),
                        ),
                      ],
                    ),
                  ),

                  // Form Body
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category Selector & Quick "+ Nueva categoría"
                          StreamBuilder<List<EventCategoryEntry>>(
                            stream: widget.database.watchAllCategories(),
                            builder: (context, catSnapshot) {
                              final cats = catSnapshot.data ?? [];
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'CATEGORÍA',
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.8,
                                          color: SanctuaryColors.sunOrange,
                                        ),
                                      ),
                                      TextButton.icon(
                                        onPressed: () =>
                                            _showAddCategoryDialog(context),
                                        icon: const Icon(LucideIcons.folderPlus,
                                            size: 13),
                                        label: const Text(
                                          '+ Nueva Categoría',
                                          style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: cats.map((cat) {
                                      final isSelected =
                                          selectedCategoryId == cat.id;
                                      final color =
                                          _parseHexColor(cat.colorHex);
                                      final icon =
                                          _getCategoryIcon(cat.iconName);

                                      return InkWell(
                                        onTap: () {
                                          setModalState(() {
                                            selectedCategoryId = cat.id;
                                          });
                                        },
                                        borderRadius: BorderRadius.circular(10),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 7),
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? SanctuaryColors.waveNavy
                                                : (isDark
                                                    ? const Color(0xFF1E293B)
                                                    : Colors.white),
                                            borderRadius:
                                                BorderRadius.circular(10),
                                            border: Border.all(
                                              color: isSelected
                                                  ? SanctuaryColors.waveNavy
                                                  : theme.colorScheme.outline
                                                      .withValues(alpha: 0.2),
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: BoxDecoration(
                                                  color: color,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                              const SizedBox(width: 6),
                                              Icon(
                                                icon,
                                                size: 13,
                                                color: isSelected
                                                    ? Colors.white
                                                    : color,
                                              ),
                                              const SizedBox(width: 5),
                                              Text(
                                                cat.name,
                                                style: GoogleFonts.inter(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                  color: isSelected
                                                      ? Colors.white
                                                      : theme.colorScheme
                                                          .onSurface,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ],
                              );
                            },
                          ),

                          const SizedBox(height: 16),

                          // Date & Title Fields
                          Row(
                            children: [
                              // Date Picker button
                              InkWell(
                                onTap: () async {
                                  final picked = await showDatePicker(
                                    context: ctx,
                                    initialDate: selectedDate,
                                    firstDate: DateTime(2000),
                                    lastDate: DateTime(2100),
                                  );
                                  if (picked != null) {
                                    setModalState(() => selectedDate = picked);
                                  }
                                },
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? const Color(0xFF1E293B)
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: theme.colorScheme.outline
                                          .withValues(alpha: 0.3),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.calendar,
                                          size: 16,
                                          color: SanctuaryColors.sunOrange),
                                      const SizedBox(width: 6),
                                      Text(
                                        selectedDate
                                            .toLocal()
                                            .toString()
                                            .split(' ')[0],
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              // Title input
                              Expanded(
                                child: TextField(
                                  controller: titleController,
                                  decoration: const InputDecoration(
                                    labelText: 'Título del Tema o Sermón *',
                                    hintText: 'Ej: La Gracia Redentora',
                                    border: OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.all(Radius.circular(12)),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),

                          // Schedule & Location Card
                          _buildSectionCard(
                            theme: theme,
                            isDark: isDark,
                            title: 'HORARIO & UBICACIÓN (OPCIONALES)',
                            icon: LucideIcons.mapPin,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: startTimeController,
                                        decoration: const InputDecoration(
                                          labelText: 'Hora de Inicio',
                                          hintText: '10:00 AM',
                                          prefixIcon:
                                              Icon(LucideIcons.clock, size: 16),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(10)),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: TextField(
                                        controller: endTimeController,
                                        decoration: const InputDecoration(
                                          labelText: 'Hora de Fin',
                                          hintText: '12:00 PM',
                                          prefixIcon:
                                              Icon(LucideIcons.clock, size: 16),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(10)),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                // Duration presets
                                Wrap(
                                  spacing: 6,
                                  children: [
                                    _buildPresetChip('+1 hora', () {
                                      startTimeController.text = '10:00';
                                      endTimeController.text = '11:00';
                                      setModalState(() {});
                                    }),
                                    _buildPresetChip('+1h 30m', () {
                                      startTimeController.text = '10:00';
                                      endTimeController.text = '11:30';
                                      setModalState(() {});
                                    }),
                                    _buildPresetChip('+2 horas', () {
                                      startTimeController.text = '10:00';
                                      endTimeController.text = '12:00';
                                      setModalState(() {});
                                    }),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                TextField(
                                  controller: locationController,
                                  decoration: InputDecoration(
                                    labelText: 'Lugar o Ubicación',
                                    hintText: 'Ej: Salón Principal, Zoom...',
                                    prefixIcon: const Icon(LucideIcons.mapPin,
                                        size: 16),
                                    suffixIcon: IconButton(
                                      icon: const Icon(LucideIcons.navigation,
                                          size: 16,
                                          color: SanctuaryColors.electricCyan),
                                      tooltip: 'Ubicación Salón Principal',
                                      onPressed: () {
                                        locationController.text =
                                            kDefaultChurchLocation;
                                        setModalState(() {});
                                      },
                                    ),
                                    border: const OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.all(Radius.circular(10)),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Wrap(
                                  spacing: 6,
                                  children: [
                                    _buildPresetChip('Salón Principal', () {
                                      locationController.text =
                                          kDefaultChurchLocation;
                                      setModalState(() {});
                                    }),
                                    _buildPresetChip('Auditorio Central', () {
                                      locationController.text =
                                          'Auditorio Central';
                                      setModalState(() {});
                                    }),
                                    _buildPresetChip('Online / Transmisión',
                                        () {
                                      locationController.text =
                                          'Online / Transmisión Zoom';
                                      setModalState(() {});
                                    }),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 14),

                          // Image & Poster Card
                          _buildSectionCard(
                            theme: theme,
                            isDark: isDark,
                            title: 'IMAGEN / AFICHE DEL EVENTO (OPCIONAL)',
                            icon: LucideIcons.image,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextField(
                                  controller: imageUrlController,
                                  onChanged: (_) => setModalState(() {}),
                                  decoration: InputDecoration(
                                    labelText: 'Enlace de Imagen (URL)',
                                    hintText: 'https://...',
                                    prefixIcon:
                                        const Icon(LucideIcons.link, size: 16),
                                    suffixIcon:
                                        imageUrlController.text.isNotEmpty
                                            ? IconButton(
                                                icon: const Icon(LucideIcons.x,
                                                    size: 16),
                                                onPressed: () {
                                                  imageUrlController.clear();
                                                  setModalState(() {});
                                                },
                                              )
                                            : null,
                                    border: const OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.all(Radius.circular(10)),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Plantillas sugeridas:',
                                  style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 6),
                                SizedBox(
                                  height: 65,
                                  child: ListView.separated(
                                    scrollDirection: Axis.horizontal,
                                    itemCount: kEventImagePresets.length,
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(width: 8),
                                    itemBuilder: (ctx, idx) {
                                      final preset = kEventImagePresets[idx];
                                      final isSelected =
                                          imageUrlController.text ==
                                              preset['url'];

                                      return GestureDetector(
                                        onTap: () {
                                          imageUrlController.text =
                                              preset['url']!;
                                          setModalState(() {});
                                        },
                                        child: Container(
                                          width: 90,
                                          decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(8),
                                            border: Border.all(
                                              color: isSelected
                                                  ? SanctuaryColors.electricCyan
                                                  : Colors.transparent,
                                              width: 2,
                                            ),
                                          ),
                                          clipBehavior: Clip.antiAlias,
                                          child: Stack(
                                            fit: StackFit.expand,
                                            children: [
                                              Image.network(
                                                preset['url']!,
                                                fit: BoxFit.cover,
                                              ),
                                              Container(
                                                color: Colors.black
                                                    .withValues(alpha: 0.4),
                                                padding:
                                                    const EdgeInsets.all(4),
                                                alignment:
                                                    Alignment.bottomCenter,
                                                child: Text(
                                                  preset['label']!,
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 8.5,
                                                    fontWeight: FontWeight.w800,
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  maxLines: 2,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 14),

                          // Scripture Key Verses Card
                          _buildSectionCard(
                            theme: theme,
                            isDark: isDark,
                            title: 'PASAJES BÍBLICOS CLAVE',
                            icon: LucideIcons.bookOpen,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: verseInputController,
                                        decoration: const InputDecoration(
                                          hintText:
                                              'Ej: Juan 3:16 o Salmos 23:1',
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(10)),
                                          ),
                                          contentPadding: EdgeInsets.symmetric(
                                              horizontal: 12, vertical: 8),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        final txt =
                                            verseInputController.text.trim();
                                        if (txt.isNotEmpty &&
                                            !linkedVerses.contains(txt)) {
                                          setModalState(() {
                                            linkedVerses.add(txt);
                                            verseInputController.clear();
                                          });
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            SanctuaryColors.electricCyan,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 10),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                      ),
                                      icon: const Icon(LucideIcons.plus,
                                          size: 14),
                                      label: const Text('Vincular'),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  children: [
                                    'Juan 3:16',
                                    'Salmos 23:1',
                                    'Romanos 8:28',
                                    'Filipenses 4:13'
                                  ].map((sug) {
                                    return _buildPresetChip('+ $sug', () {
                                      if (!linkedVerses.contains(sug)) {
                                        setModalState(
                                            () => linkedVerses.add(sug));
                                      }
                                    });
                                  }).toList(),
                                ),
                                if (linkedVerses.isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  Wrap(
                                    spacing: 6,
                                    runSpacing: 6,
                                    children: linkedVerses.map((v) {
                                      return Chip(
                                        label: Text(v,
                                            style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w700)),
                                        deleteIcon:
                                            const Icon(LucideIcons.x, size: 14),
                                        onDeleted: () {
                                          setModalState(
                                              () => linkedVerses.remove(v));
                                        },
                                        backgroundColor: SanctuaryColors
                                            .waveNavy
                                            .withValues(alpha: 0.12),
                                      );
                                    }).toList(),
                                  ),
                                ],
                              ],
                            ),
                          ),

                          const SizedBox(height: 14),

                          // Thematic Tags Card
                          _buildSectionCard(
                            theme: theme,
                            isDark: isDark,
                            title: 'ETIQUETAS TEMÁTICAS',
                            icon: LucideIcons.tag,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: tagInputController,
                                        decoration: const InputDecoration(
                                          hintText:
                                              'Ej: Fe, Familia, Santidad...',
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(10)),
                                          ),
                                          contentPadding: EdgeInsets.symmetric(
                                              horizontal: 12, vertical: 8),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    OutlinedButton(
                                      onPressed: () {
                                        final txt = tagInputController.text
                                            .trim()
                                            .replaceAll('#', '');
                                        if (txt.isNotEmpty &&
                                            !tags.contains(txt)) {
                                          setModalState(() {
                                            tags.add(txt);
                                            tagInputController.clear();
                                          });
                                        }
                                      },
                                      child: const Text('+ Tag'),
                                    ),
                                  ],
                                ),
                                if (tags.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Wrap(
                                    spacing: 6,
                                    children: tags.map((t) {
                                      return Chip(
                                        label: Text('#$t',
                                            style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600)),
                                        deleteIcon:
                                            const Icon(LucideIcons.x, size: 14),
                                        onDeleted: () {
                                          setModalState(() => tags.remove(t));
                                        },
                                      );
                                    }).toList(),
                                  ),
                                ],
                              ],
                            ),
                          ),

                          const SizedBox(height: 14),

                          // Sermon Notes / Outline Textarea
                          Text(
                            'APUNTES, BOSQUEJO & REFLEXIÓN',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                              color: SanctuaryColors.waveNavy,
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: notesController,
                            maxLines: 8,
                            style:
                                GoogleFonts.inter(fontSize: 13.5, height: 1.6),
                            decoration: const InputDecoration(
                              hintText:
                                  'Escribe aquí los puntos principales del sermón, versículos de apoyo, aplicaciones prácticas para la semana o notas del predicador...',
                              border: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.all(Radius.circular(12)),
                              ),
                            ),
                          ),

                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSectionCard({
    required ThemeData theme,
    required bool isDark,
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: SanctuaryColors.sunOrange),
              const SizedBox(width: 6),
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.7,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  Widget _buildPresetChip(String label, VoidCallback onTap) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 11)),
      padding: EdgeInsets.zero,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      onPressed: onTap,
    );
  }

  // ===========================================================================
  // ADD CATEGORY DIALOG (FULL COLOR & ICON PICKER)
  // ===========================================================================
  void _showAddCategoryDialog(BuildContext context) {
    final catNameController = TextEditingController();
    String selectedIconKey = 'BookOpen';
    String selectedColorHex = '#0B2B68';

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            final theme = Theme.of(ctx);
            final isDark = theme.brightness == Brightness.dark;

            return AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: [
                  const Icon(LucideIcons.folderPlus,
                      size: 20, color: SanctuaryColors.sunOrange),
                  const SizedBox(width: 8),
                  Text(
                    'Nueva Categoría',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 17,
                    ),
                  ),
                ],
              ),
              content: SizedBox(
                width: 360,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: catNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nombre de la Categoría *',
                          hintText: 'Ej: Vigilia, Misiones, Conferencia',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Icon Selector
                      Text(
                        'ÍCONO DISTINTIVO',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.7,
                        ),
                      ),
                      const SizedBox(height: 8),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          mainAxisSpacing: 6,
                          crossAxisSpacing: 6,
                          childAspectRatio: 1.3,
                        ),
                        itemCount: kCategoryIconOptions.length,
                        itemBuilder: (ctx, idx) {
                          final item = kCategoryIconOptions[idx];
                          final isSelected = selectedIconKey == item['key'];

                          return InkWell(
                            onTap: () {
                              setDialogState(() {
                                selectedIconKey = item['key'] as String;
                              });
                            },
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? SanctuaryColors.waveNavy
                                    : (isDark
                                        ? const Color(0xFF1E293B)
                                        : const Color(0xFFF1F5F9)),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected
                                      ? SanctuaryColors.waveNavy
                                      : Colors.transparent,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    item['icon'] as IconData,
                                    size: 16,
                                    color: isSelected
                                        ? Colors.white
                                        : theme.colorScheme.onSurface,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item['label'] as String,
                                    style: TextStyle(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w600,
                                      color: isSelected
                                          ? Colors.white
                                          : theme.colorScheme.onSurface,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 14),

                      // Color Palette
                      Text(
                        'COLOR DISTINTIVO',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.7,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 10,
                        runSpacing: 8,
                        children: kCategoryColorOptions.map((hex) {
                          final color = _parseHexColor(hex);
                          final isSelected = selectedColorHex == hex;

                          return GestureDetector(
                            onTap: () {
                              setDialogState(() {
                                selectedColorHex = hex;
                              });
                            },
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: color,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected
                                      ? Colors.white
                                      : Colors.transparent,
                                  width: 2,
                                ),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: color.withValues(alpha: 0.6),
                                          blurRadius: 6,
                                          spreadRadius: 2,
                                        ),
                                      ]
                                    : null,
                              ),
                              child: isSelected
                                  ? const Icon(LucideIcons.check,
                                      size: 16, color: Colors.white)
                                  : null,
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogCtx).pop(),
                  child: const Text('Cancelar'),
                ),
                FilledButton(
                  onPressed: () async {
                    final name = catNameController.text.trim();
                    if (name.isEmpty) return;

                    final id = 'cat_${DateTime.now().millisecondsSinceEpoch}';
                    await widget.database.insertCategory(
                      EventCategoriesCompanion.insert(
                        id: id,
                        name: name,
                        colorHex: selectedColorHex,
                        iconName: selectedIconKey,
                      ),
                    );

                    setState(() {
                      _selectedCategoryFilter = id;
                    });

                    if (dialogCtx.mounted) {
                      Navigator.of(dialogCtx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Categoría "$name" creada con éxito'),
                          backgroundColor: SanctuaryColors.waveNavy,
                        ),
                      );
                    }
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: SanctuaryColors.waveNavy,
                    foregroundColor: SanctuaryColors.amberGold,
                  ),
                  child: const Text('Crear Categoría'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // ===========================================================================
  // SHARE EVENT NOTE
  // ===========================================================================
  void _shareEvent(BuildContext context, UserEventEntry item,
      String categoryName, List<String> verses) {
    final meta = EventDetailsMetadata.fromRawString(item.foodServiceDetails);
    final buffer = StringBuffer();
    buffer.writeln('📖 *${item.title}*');
    buffer.writeln('📂 Categoría: $categoryName');
    buffer.writeln(
        '📅 Fecha: ${item.eventDate.toLocal().toString().split(' ')[0]}');
    if (meta.startTime != null) {
      buffer.writeln(
          '⏰ Horario: ${meta.startTime} ${meta.endTime != null ? "- ${meta.endTime}" : ""}');
    }
    if (meta.location != null) {
      buffer.writeln('📍 Lugar: ${meta.location}');
    }
    if (verses.isNotEmpty) {
      buffer.writeln('📜 Pasajes Bíblicos: ${verses.join(", ")}');
    }
    if (meta.tags.isNotEmpty) {
      buffer.writeln('🏷️ Etiquetas: ${meta.tags.map((t) => "#$t").join(" ")}');
    }
    buffer.writeln('\n✍️ *Apuntes & Bosquejo:*');
    buffer.writeln(item.description);
    buffer.writeln('\n_Santuario Digital - Notas de Prédica_');

    final shareText = buffer.toString();
    Clipboard.setData(ClipboardData(text: shareText));

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Row(
            children: [
              const Icon(LucideIcons.share2,
                  size: 20, color: SanctuaryColors.waveNavy),
              const SizedBox(width: 8),
              const Text('Compartir Prédica'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '¡El apunte completo ha sido copiado a tu portapapeles!',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  shareText,
                  maxLines: 6,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12),
                ),
              ),
            ],
          ),
          actions: [
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Entendido'),
            ),
          ],
        );
      },
    );
  }

  // ===========================================================================
  // CONFIRM DELETE
  // ===========================================================================
  void _confirmDeleteEvent(BuildContext context, UserEventEntry item) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('¿Eliminar apunte?'),
          content: Text(
              '¿Estás seguro de que deseas borrar "${item.title}" de tu bitácora?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
              onPressed: () async {
                await widget.database.deleteEvent(item.id);
                if (ctx.mounted) {
                  Navigator.of(ctx).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Registro eliminado')),
                  );
                }
              },
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );
  }
}

extension IterableExtension<T> on Iterable<T> {
  Iterable<T> filter(bool Function(T element) test) => where(test);
}
