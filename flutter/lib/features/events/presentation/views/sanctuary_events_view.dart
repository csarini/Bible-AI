import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';
import 'pulpit_presentation_view.dart';

class SanctuaryEventsView extends StatefulWidget {
  final AppDatabase database;

  const SanctuaryEventsView({super.key, required this.database});

  @override
  State<SanctuaryEventsView> createState() => _SanctuaryEventsViewState();
}

class _SanctuaryEventsViewState extends State<SanctuaryEventsView> {
  String _selectedCategory = 'all';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
              'Prédicas & Cuaderno',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plusCircle,
                color: SanctuaryColors.sunOrange),
            onPressed: () => _showAddEventDialog(context),
            tooltip: 'Registrar nueva prédica o evento',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          StreamBuilder<List<EventCategoryEntry>>(
            stream: widget.database.watchAllCategories(),
            builder: (context, snapshot) {
              final categories = snapshot.data ?? [];
              return Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ChoiceChip(
                      label: const Text('Todos'),
                      selected: _selectedCategory == 'all',
                      selectedColor: SanctuaryColors.waveNavy,
                      labelStyle: TextStyle(
                        color: _selectedCategory == 'all'
                            ? Colors.white
                            : theme.colorScheme.onSurface,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                      onSelected: (_) =>
                          setState(() => _selectedCategory = 'all'),
                    ),
                    const SizedBox(width: 8),
                    ...categories.map((cat) {
                      final isSelected = _selectedCategory == cat.id;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat.name),
                          selected: isSelected,
                          selectedColor: SanctuaryColors.waveNavy,
                          labelStyle: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : theme.colorScheme.onSurface,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                          onSelected: (_) =>
                              setState(() => _selectedCategory = cat.id),
                        ),
                      );
                    }),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 8),

          // Events Stream List
          Expanded(
            child: StreamBuilder<List<UserEventEntry>>(
              stream: _selectedCategory == 'all'
                  ? widget.database.watchAllEvents()
                  : widget.database.watchEventsByCategory(_selectedCategory),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final events = snapshot.data ?? [];

                if (events.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color:
                                  SanctuaryColors.sunOrange.withOpacity(0.12),
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
                            'Sin prédicas ni notas registradas',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Toca el botón + para registrar apuntes de sermones, pasajes bíblicos y reuniones eclesiales.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color:
                                  theme.colorScheme.onSurface.withOpacity(0.65),
                            ),
                          ),
                          const SizedBox(height: 20),
                          FilledButton.icon(
                            onPressed: () => _showAddEventDialog(context),
                            style: FilledButton.styleFrom(
                              backgroundColor: SanctuaryColors.waveNavy,
                            ),
                            icon: const Icon(LucideIcons.plus, size: 16),
                            label: const Text('Agregar Prédica'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: events.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = events[index];
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: theme.colorScheme.outline.withOpacity(0.3),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(LucideIcons.calendar,
                                        size: 14,
                                        color: SanctuaryColors.sunOrange),
                                    const SizedBox(width: 6),
                                    Text(
                                      item.eventDate
                                          .toLocal()
                                          .toString()
                                          .split(' ')[0],
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: SanctuaryColors.sunOrange,
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    // Pulpit Mode Quick Button
                                    TextButton.icon(
                                      onPressed: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                PulpitPresentationView(
                                                    event: item),
                                          ),
                                        );
                                      },
                                      style: TextButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 4),
                                        backgroundColor: SanctuaryColors
                                            .waveNavy
                                            .withOpacity(0.1),
                                      ),
                                      icon: const Icon(LucideIcons.presentation,
                                          size: 14,
                                          color: SanctuaryColors.waveNavy),
                                      label: Text(
                                        'Púlpito',
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: SanctuaryColors.waveNavy,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(LucideIcons.trash2,
                                          size: 16, color: Colors.redAccent),
                                      onPressed: () async {
                                        await widget.database
                                            .deleteEvent(item.id);
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(
                                            const SnackBar(
                                                content:
                                                    Text('Nota eliminada.')),
                                          );
                                        }
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              item.title,
                              style: GoogleFonts.playfairDisplay(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item.description,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: 13.5,
                                height: 1.5,
                                color: theme.colorScheme.onSurface
                                    .withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showAddEventDialog(BuildContext context) {
    final titleController = TextEditingController();
    final notesController = TextEditingController();
    String categoryId = 'cat_predica';

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text(
            'Nueva Nota / Prédica',
            style: GoogleFonts.inter(
                fontWeight: FontWeight.w700, fontSize: 17),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Título del Sermón o Reunión',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Puntos principales y pasajes bíblicos',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                if (titleController.text.trim().isEmpty) return;

                final id = 'event_${DateTime.now().millisecondsSinceEpoch}';
                await widget.database.insertOrUpdateEvent(
                  UserEventsCompanion.insert(
                    id: id,
                    categoryId: categoryId,
                    title: titleController.text.trim(),
                    description: notesController.text.trim(),
                    eventDate: DateTime.now(),
                    hasFoodService: const drift.Value(false),
                    hasChildCare: const drift.Value(false),
                    hasBookSales: const drift.Value(false),
                  ),
                );

                if (ctx.mounted) {
                  Navigator.of(ctx).pop();
                }
              },
              style: FilledButton.styleFrom(
                  backgroundColor: SanctuaryColors.waveNavy),
              child: const Text('Guardar'),
            ),
          ],
        );
      },
    );
  }
}
