// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $LocalBookmarksTable extends LocalBookmarks
    with TableInfo<$LocalBookmarksTable, LocalBookmarkEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalBookmarksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<String> bookId = GeneratedColumn<String>(
      'book_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _bookNameMeta =
      const VerificationMeta('bookName');
  @override
  late final GeneratedColumn<String> bookName = GeneratedColumn<String>(
      'book_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _chapterMeta =
      const VerificationMeta('chapter');
  @override
  late final GeneratedColumn<int> chapter = GeneratedColumn<int>(
      'chapter', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _verseMeta = const VerificationMeta('verse');
  @override
  late final GeneratedColumn<int> verse = GeneratedColumn<int>(
      'verse', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _verseTextMeta =
      const VerificationMeta('verseText');
  @override
  late final GeneratedColumn<String> verseText = GeneratedColumn<String>(
      'verse_text', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _colorHexMeta =
      const VerificationMeta('colorHex');
  @override
  late final GeneratedColumn<String> colorHex = GeneratedColumn<String>(
      'color_hex', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _customTitleMeta =
      const VerificationMeta('customTitle');
  @override
  late final GeneratedColumn<String> customTitle = GeneratedColumn<String>(
      'custom_title', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _personalNoteMeta =
      const VerificationMeta('personalNote');
  @override
  late final GeneratedColumn<String> personalNote = GeneratedColumn<String>(
      'personal_note', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        bookId,
        bookName,
        chapter,
        verse,
        verseText,
        colorHex,
        customTitle,
        personalNote,
        isSynced,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_bookmarks';
  @override
  VerificationContext validateIntegrity(Insertable<LocalBookmarkEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('book_id')) {
      context.handle(_bookIdMeta,
          bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta));
    } else if (isInserting) {
      context.missing(_bookIdMeta);
    }
    if (data.containsKey('book_name')) {
      context.handle(_bookNameMeta,
          bookName.isAcceptableOrUnknown(data['book_name']!, _bookNameMeta));
    } else if (isInserting) {
      context.missing(_bookNameMeta);
    }
    if (data.containsKey('chapter')) {
      context.handle(_chapterMeta,
          chapter.isAcceptableOrUnknown(data['chapter']!, _chapterMeta));
    } else if (isInserting) {
      context.missing(_chapterMeta);
    }
    if (data.containsKey('verse')) {
      context.handle(
          _verseMeta, verse.isAcceptableOrUnknown(data['verse']!, _verseMeta));
    } else if (isInserting) {
      context.missing(_verseMeta);
    }
    if (data.containsKey('verse_text')) {
      context.handle(_verseTextMeta,
          verseText.isAcceptableOrUnknown(data['verse_text']!, _verseTextMeta));
    } else if (isInserting) {
      context.missing(_verseTextMeta);
    }
    if (data.containsKey('color_hex')) {
      context.handle(_colorHexMeta,
          colorHex.isAcceptableOrUnknown(data['color_hex']!, _colorHexMeta));
    } else if (isInserting) {
      context.missing(_colorHexMeta);
    }
    if (data.containsKey('custom_title')) {
      context.handle(
          _customTitleMeta,
          customTitle.isAcceptableOrUnknown(
              data['custom_title']!, _customTitleMeta));
    }
    if (data.containsKey('personal_note')) {
      context.handle(
          _personalNoteMeta,
          personalNote.isAcceptableOrUnknown(
              data['personal_note']!, _personalNoteMeta));
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalBookmarkEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalBookmarkEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      bookId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}book_id'])!,
      bookName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}book_name'])!,
      chapter: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}chapter'])!,
      verse: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}verse'])!,
      verseText: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}verse_text'])!,
      colorHex: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}color_hex'])!,
      customTitle: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}custom_title']),
      personalNote: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}personal_note']),
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $LocalBookmarksTable createAlias(String alias) {
    return $LocalBookmarksTable(attachedDatabase, alias);
  }
}

class LocalBookmarkEntry extends DataClass
    implements Insertable<LocalBookmarkEntry> {
  final String id;
  final String bookId;
  final String bookName;
  final int chapter;
  final int verse;
  final String verseText;
  final String colorHex;
  final String? customTitle;
  final String? personalNote;
  final bool isSynced;
  final DateTime createdAt;
  const LocalBookmarkEntry(
      {required this.id,
      required this.bookId,
      required this.bookName,
      required this.chapter,
      required this.verse,
      required this.verseText,
      required this.colorHex,
      this.customTitle,
      this.personalNote,
      required this.isSynced,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['book_id'] = Variable<String>(bookId);
    map['book_name'] = Variable<String>(bookName);
    map['chapter'] = Variable<int>(chapter);
    map['verse'] = Variable<int>(verse);
    map['verse_text'] = Variable<String>(verseText);
    map['color_hex'] = Variable<String>(colorHex);
    if (!nullToAbsent || customTitle != null) {
      map['custom_title'] = Variable<String>(customTitle);
    }
    if (!nullToAbsent || personalNote != null) {
      map['personal_note'] = Variable<String>(personalNote);
    }
    map['is_synced'] = Variable<bool>(isSynced);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  LocalBookmarksCompanion toCompanion(bool nullToAbsent) {
    return LocalBookmarksCompanion(
      id: Value(id),
      bookId: Value(bookId),
      bookName: Value(bookName),
      chapter: Value(chapter),
      verse: Value(verse),
      verseText: Value(verseText),
      colorHex: Value(colorHex),
      customTitle: customTitle == null && nullToAbsent
          ? const Value.absent()
          : Value(customTitle),
      personalNote: personalNote == null && nullToAbsent
          ? const Value.absent()
          : Value(personalNote),
      isSynced: Value(isSynced),
      createdAt: Value(createdAt),
    );
  }

  factory LocalBookmarkEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalBookmarkEntry(
      id: serializer.fromJson<String>(json['id']),
      bookId: serializer.fromJson<String>(json['bookId']),
      bookName: serializer.fromJson<String>(json['bookName']),
      chapter: serializer.fromJson<int>(json['chapter']),
      verse: serializer.fromJson<int>(json['verse']),
      verseText: serializer.fromJson<String>(json['verseText']),
      colorHex: serializer.fromJson<String>(json['colorHex']),
      customTitle: serializer.fromJson<String?>(json['customTitle']),
      personalNote: serializer.fromJson<String?>(json['personalNote']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'bookId': serializer.toJson<String>(bookId),
      'bookName': serializer.toJson<String>(bookName),
      'chapter': serializer.toJson<int>(chapter),
      'verse': serializer.toJson<int>(verse),
      'verseText': serializer.toJson<String>(verseText),
      'colorHex': serializer.toJson<String>(colorHex),
      'customTitle': serializer.toJson<String?>(customTitle),
      'personalNote': serializer.toJson<String?>(personalNote),
      'isSynced': serializer.toJson<bool>(isSynced),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  LocalBookmarkEntry copyWith(
          {String? id,
          String? bookId,
          String? bookName,
          int? chapter,
          int? verse,
          String? verseText,
          String? colorHex,
          Value<String?> customTitle = const Value.absent(),
          Value<String?> personalNote = const Value.absent(),
          bool? isSynced,
          DateTime? createdAt}) =>
      LocalBookmarkEntry(
        id: id ?? this.id,
        bookId: bookId ?? this.bookId,
        bookName: bookName ?? this.bookName,
        chapter: chapter ?? this.chapter,
        verse: verse ?? this.verse,
        verseText: verseText ?? this.verseText,
        colorHex: colorHex ?? this.colorHex,
        customTitle: customTitle.present ? customTitle.value : this.customTitle,
        personalNote:
            personalNote.present ? personalNote.value : this.personalNote,
        isSynced: isSynced ?? this.isSynced,
        createdAt: createdAt ?? this.createdAt,
      );
  LocalBookmarkEntry copyWithCompanion(LocalBookmarksCompanion data) {
    return LocalBookmarkEntry(
      id: data.id.present ? data.id.value : this.id,
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      bookName: data.bookName.present ? data.bookName.value : this.bookName,
      chapter: data.chapter.present ? data.chapter.value : this.chapter,
      verse: data.verse.present ? data.verse.value : this.verse,
      verseText: data.verseText.present ? data.verseText.value : this.verseText,
      colorHex: data.colorHex.present ? data.colorHex.value : this.colorHex,
      customTitle:
          data.customTitle.present ? data.customTitle.value : this.customTitle,
      personalNote: data.personalNote.present
          ? data.personalNote.value
          : this.personalNote,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalBookmarkEntry(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('bookName: $bookName, ')
          ..write('chapter: $chapter, ')
          ..write('verse: $verse, ')
          ..write('verseText: $verseText, ')
          ..write('colorHex: $colorHex, ')
          ..write('customTitle: $customTitle, ')
          ..write('personalNote: $personalNote, ')
          ..write('isSynced: $isSynced, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, bookId, bookName, chapter, verse,
      verseText, colorHex, customTitle, personalNote, isSynced, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalBookmarkEntry &&
          other.id == this.id &&
          other.bookId == this.bookId &&
          other.bookName == this.bookName &&
          other.chapter == this.chapter &&
          other.verse == this.verse &&
          other.verseText == this.verseText &&
          other.colorHex == this.colorHex &&
          other.customTitle == this.customTitle &&
          other.personalNote == this.personalNote &&
          other.isSynced == this.isSynced &&
          other.createdAt == this.createdAt);
}

class LocalBookmarksCompanion extends UpdateCompanion<LocalBookmarkEntry> {
  final Value<String> id;
  final Value<String> bookId;
  final Value<String> bookName;
  final Value<int> chapter;
  final Value<int> verse;
  final Value<String> verseText;
  final Value<String> colorHex;
  final Value<String?> customTitle;
  final Value<String?> personalNote;
  final Value<bool> isSynced;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const LocalBookmarksCompanion({
    this.id = const Value.absent(),
    this.bookId = const Value.absent(),
    this.bookName = const Value.absent(),
    this.chapter = const Value.absent(),
    this.verse = const Value.absent(),
    this.verseText = const Value.absent(),
    this.colorHex = const Value.absent(),
    this.customTitle = const Value.absent(),
    this.personalNote = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalBookmarksCompanion.insert({
    required String id,
    required String bookId,
    required String bookName,
    required int chapter,
    required int verse,
    required String verseText,
    required String colorHex,
    this.customTitle = const Value.absent(),
    this.personalNote = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        bookId = Value(bookId),
        bookName = Value(bookName),
        chapter = Value(chapter),
        verse = Value(verse),
        verseText = Value(verseText),
        colorHex = Value(colorHex);
  static Insertable<LocalBookmarkEntry> custom({
    Expression<String>? id,
    Expression<String>? bookId,
    Expression<String>? bookName,
    Expression<int>? chapter,
    Expression<int>? verse,
    Expression<String>? verseText,
    Expression<String>? colorHex,
    Expression<String>? customTitle,
    Expression<String>? personalNote,
    Expression<bool>? isSynced,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (bookId != null) 'book_id': bookId,
      if (bookName != null) 'book_name': bookName,
      if (chapter != null) 'chapter': chapter,
      if (verse != null) 'verse': verse,
      if (verseText != null) 'verse_text': verseText,
      if (colorHex != null) 'color_hex': colorHex,
      if (customTitle != null) 'custom_title': customTitle,
      if (personalNote != null) 'personal_note': personalNote,
      if (isSynced != null) 'is_synced': isSynced,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalBookmarksCompanion copyWith(
      {Value<String>? id,
      Value<String>? bookId,
      Value<String>? bookName,
      Value<int>? chapter,
      Value<int>? verse,
      Value<String>? verseText,
      Value<String>? colorHex,
      Value<String?>? customTitle,
      Value<String?>? personalNote,
      Value<bool>? isSynced,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return LocalBookmarksCompanion(
      id: id ?? this.id,
      bookId: bookId ?? this.bookId,
      bookName: bookName ?? this.bookName,
      chapter: chapter ?? this.chapter,
      verse: verse ?? this.verse,
      verseText: verseText ?? this.verseText,
      colorHex: colorHex ?? this.colorHex,
      customTitle: customTitle ?? this.customTitle,
      personalNote: personalNote ?? this.personalNote,
      isSynced: isSynced ?? this.isSynced,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (bookId.present) {
      map['book_id'] = Variable<String>(bookId.value);
    }
    if (bookName.present) {
      map['book_name'] = Variable<String>(bookName.value);
    }
    if (chapter.present) {
      map['chapter'] = Variable<int>(chapter.value);
    }
    if (verse.present) {
      map['verse'] = Variable<int>(verse.value);
    }
    if (verseText.present) {
      map['verse_text'] = Variable<String>(verseText.value);
    }
    if (colorHex.present) {
      map['color_hex'] = Variable<String>(colorHex.value);
    }
    if (customTitle.present) {
      map['custom_title'] = Variable<String>(customTitle.value);
    }
    if (personalNote.present) {
      map['personal_note'] = Variable<String>(personalNote.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalBookmarksCompanion(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('bookName: $bookName, ')
          ..write('chapter: $chapter, ')
          ..write('verse: $verse, ')
          ..write('verseText: $verseText, ')
          ..write('colorHex: $colorHex, ')
          ..write('customTitle: $customTitle, ')
          ..write('personalNote: $personalNote, ')
          ..write('isSynced: $isSynced, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $EventCategoriesTable extends EventCategories
    with TableInfo<$EventCategoriesTable, EventCategoryEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $EventCategoriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _colorHexMeta =
      const VerificationMeta('colorHex');
  @override
  late final GeneratedColumn<String> colorHex = GeneratedColumn<String>(
      'color_hex', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _iconNameMeta =
      const VerificationMeta('iconName');
  @override
  late final GeneratedColumn<String> iconName = GeneratedColumn<String>(
      'icon_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, name, colorHex, iconName, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'event_categories';
  @override
  VerificationContext validateIntegrity(Insertable<EventCategoryEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('color_hex')) {
      context.handle(_colorHexMeta,
          colorHex.isAcceptableOrUnknown(data['color_hex']!, _colorHexMeta));
    } else if (isInserting) {
      context.missing(_colorHexMeta);
    }
    if (data.containsKey('icon_name')) {
      context.handle(_iconNameMeta,
          iconName.isAcceptableOrUnknown(data['icon_name']!, _iconNameMeta));
    } else if (isInserting) {
      context.missing(_iconNameMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  EventCategoryEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return EventCategoryEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      colorHex: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}color_hex'])!,
      iconName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}icon_name'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $EventCategoriesTable createAlias(String alias) {
    return $EventCategoriesTable(attachedDatabase, alias);
  }
}

class EventCategoryEntry extends DataClass
    implements Insertable<EventCategoryEntry> {
  final String id;
  final String name;
  final String colorHex;
  final String iconName;
  final DateTime createdAt;
  const EventCategoryEntry(
      {required this.id,
      required this.name,
      required this.colorHex,
      required this.iconName,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['color_hex'] = Variable<String>(colorHex);
    map['icon_name'] = Variable<String>(iconName);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  EventCategoriesCompanion toCompanion(bool nullToAbsent) {
    return EventCategoriesCompanion(
      id: Value(id),
      name: Value(name),
      colorHex: Value(colorHex),
      iconName: Value(iconName),
      createdAt: Value(createdAt),
    );
  }

  factory EventCategoryEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return EventCategoryEntry(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      colorHex: serializer.fromJson<String>(json['colorHex']),
      iconName: serializer.fromJson<String>(json['iconName']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'colorHex': serializer.toJson<String>(colorHex),
      'iconName': serializer.toJson<String>(iconName),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  EventCategoryEntry copyWith(
          {String? id,
          String? name,
          String? colorHex,
          String? iconName,
          DateTime? createdAt}) =>
      EventCategoryEntry(
        id: id ?? this.id,
        name: name ?? this.name,
        colorHex: colorHex ?? this.colorHex,
        iconName: iconName ?? this.iconName,
        createdAt: createdAt ?? this.createdAt,
      );
  EventCategoryEntry copyWithCompanion(EventCategoriesCompanion data) {
    return EventCategoryEntry(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      colorHex: data.colorHex.present ? data.colorHex.value : this.colorHex,
      iconName: data.iconName.present ? data.iconName.value : this.iconName,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('EventCategoryEntry(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('colorHex: $colorHex, ')
          ..write('iconName: $iconName, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, colorHex, iconName, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is EventCategoryEntry &&
          other.id == this.id &&
          other.name == this.name &&
          other.colorHex == this.colorHex &&
          other.iconName == this.iconName &&
          other.createdAt == this.createdAt);
}

class EventCategoriesCompanion extends UpdateCompanion<EventCategoryEntry> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> colorHex;
  final Value<String> iconName;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const EventCategoriesCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.colorHex = const Value.absent(),
    this.iconName = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  EventCategoriesCompanion.insert({
    required String id,
    required String name,
    required String colorHex,
    required String iconName,
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        colorHex = Value(colorHex),
        iconName = Value(iconName);
  static Insertable<EventCategoryEntry> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? colorHex,
    Expression<String>? iconName,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (colorHex != null) 'color_hex': colorHex,
      if (iconName != null) 'icon_name': iconName,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  EventCategoriesCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String>? colorHex,
      Value<String>? iconName,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return EventCategoriesCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      colorHex: colorHex ?? this.colorHex,
      iconName: iconName ?? this.iconName,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (colorHex.present) {
      map['color_hex'] = Variable<String>(colorHex.value);
    }
    if (iconName.present) {
      map['icon_name'] = Variable<String>(iconName.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('EventCategoriesCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('colorHex: $colorHex, ')
          ..write('iconName: $iconName, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $UserEventsTable extends UserEvents
    with TableInfo<$UserEventsTable, UserEventEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UserEventsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _categoryIdMeta =
      const VerificationMeta('categoryId');
  @override
  late final GeneratedColumn<String> categoryId = GeneratedColumn<String>(
      'category_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES event_categories (id)'));
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _linkedVersesJsonMeta =
      const VerificationMeta('linkedVersesJson');
  @override
  late final GeneratedColumn<String> linkedVersesJson = GeneratedColumn<String>(
      'linked_verses_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _eventDateMeta =
      const VerificationMeta('eventDate');
  @override
  late final GeneratedColumn<DateTime> eventDate = GeneratedColumn<DateTime>(
      'event_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _hasFoodServiceMeta =
      const VerificationMeta('hasFoodService');
  @override
  late final GeneratedColumn<bool> hasFoodService = GeneratedColumn<bool>(
      'has_food_service', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("has_food_service" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _foodServiceDetailsMeta =
      const VerificationMeta('foodServiceDetails');
  @override
  late final GeneratedColumn<String> foodServiceDetails =
      GeneratedColumn<String>('food_service_details', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _hasChildCareMeta =
      const VerificationMeta('hasChildCare');
  @override
  late final GeneratedColumn<bool> hasChildCare = GeneratedColumn<bool>(
      'has_child_care', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("has_child_care" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _hasBookSalesMeta =
      const VerificationMeta('hasBookSales');
  @override
  late final GeneratedColumn<bool> hasBookSales = GeneratedColumn<bool>(
      'has_book_sales', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("has_book_sales" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        categoryId,
        title,
        description,
        linkedVersesJson,
        eventDate,
        hasFoodService,
        foodServiceDetails,
        hasChildCare,
        hasBookSales,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'user_events';
  @override
  VerificationContext validateIntegrity(Insertable<UserEventEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('category_id')) {
      context.handle(
          _categoryIdMeta,
          categoryId.isAcceptableOrUnknown(
              data['category_id']!, _categoryIdMeta));
    } else if (isInserting) {
      context.missing(_categoryIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('linked_verses_json')) {
      context.handle(
          _linkedVersesJsonMeta,
          linkedVersesJson.isAcceptableOrUnknown(
              data['linked_verses_json']!, _linkedVersesJsonMeta));
    }
    if (data.containsKey('event_date')) {
      context.handle(_eventDateMeta,
          eventDate.isAcceptableOrUnknown(data['event_date']!, _eventDateMeta));
    } else if (isInserting) {
      context.missing(_eventDateMeta);
    }
    if (data.containsKey('has_food_service')) {
      context.handle(
          _hasFoodServiceMeta,
          hasFoodService.isAcceptableOrUnknown(
              data['has_food_service']!, _hasFoodServiceMeta));
    }
    if (data.containsKey('food_service_details')) {
      context.handle(
          _foodServiceDetailsMeta,
          foodServiceDetails.isAcceptableOrUnknown(
              data['food_service_details']!, _foodServiceDetailsMeta));
    }
    if (data.containsKey('has_child_care')) {
      context.handle(
          _hasChildCareMeta,
          hasChildCare.isAcceptableOrUnknown(
              data['has_child_care']!, _hasChildCareMeta));
    }
    if (data.containsKey('has_book_sales')) {
      context.handle(
          _hasBookSalesMeta,
          hasBookSales.isAcceptableOrUnknown(
              data['has_book_sales']!, _hasBookSalesMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  UserEventEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return UserEventEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      categoryId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      linkedVersesJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}linked_verses_json'])!,
      eventDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}event_date'])!,
      hasFoodService: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}has_food_service'])!,
      foodServiceDetails: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}food_service_details']),
      hasChildCare: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}has_child_care'])!,
      hasBookSales: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}has_book_sales'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $UserEventsTable createAlias(String alias) {
    return $UserEventsTable(attachedDatabase, alias);
  }
}

class UserEventEntry extends DataClass implements Insertable<UserEventEntry> {
  final String id;
  final String categoryId;
  final String title;
  final String description;
  final String linkedVersesJson;
  final DateTime eventDate;
  final bool hasFoodService;
  final String? foodServiceDetails;
  final bool hasChildCare;
  final bool hasBookSales;
  final DateTime createdAt;
  const UserEventEntry(
      {required this.id,
      required this.categoryId,
      required this.title,
      required this.description,
      required this.linkedVersesJson,
      required this.eventDate,
      required this.hasFoodService,
      this.foodServiceDetails,
      required this.hasChildCare,
      required this.hasBookSales,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['category_id'] = Variable<String>(categoryId);
    map['title'] = Variable<String>(title);
    map['description'] = Variable<String>(description);
    map['linked_verses_json'] = Variable<String>(linkedVersesJson);
    map['event_date'] = Variable<DateTime>(eventDate);
    map['has_food_service'] = Variable<bool>(hasFoodService);
    if (!nullToAbsent || foodServiceDetails != null) {
      map['food_service_details'] = Variable<String>(foodServiceDetails);
    }
    map['has_child_care'] = Variable<bool>(hasChildCare);
    map['has_book_sales'] = Variable<bool>(hasBookSales);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  UserEventsCompanion toCompanion(bool nullToAbsent) {
    return UserEventsCompanion(
      id: Value(id),
      categoryId: Value(categoryId),
      title: Value(title),
      description: Value(description),
      linkedVersesJson: Value(linkedVersesJson),
      eventDate: Value(eventDate),
      hasFoodService: Value(hasFoodService),
      foodServiceDetails: foodServiceDetails == null && nullToAbsent
          ? const Value.absent()
          : Value(foodServiceDetails),
      hasChildCare: Value(hasChildCare),
      hasBookSales: Value(hasBookSales),
      createdAt: Value(createdAt),
    );
  }

  factory UserEventEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return UserEventEntry(
      id: serializer.fromJson<String>(json['id']),
      categoryId: serializer.fromJson<String>(json['categoryId']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String>(json['description']),
      linkedVersesJson: serializer.fromJson<String>(json['linkedVersesJson']),
      eventDate: serializer.fromJson<DateTime>(json['eventDate']),
      hasFoodService: serializer.fromJson<bool>(json['hasFoodService']),
      foodServiceDetails:
          serializer.fromJson<String?>(json['foodServiceDetails']),
      hasChildCare: serializer.fromJson<bool>(json['hasChildCare']),
      hasBookSales: serializer.fromJson<bool>(json['hasBookSales']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'categoryId': serializer.toJson<String>(categoryId),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String>(description),
      'linkedVersesJson': serializer.toJson<String>(linkedVersesJson),
      'eventDate': serializer.toJson<DateTime>(eventDate),
      'hasFoodService': serializer.toJson<bool>(hasFoodService),
      'foodServiceDetails': serializer.toJson<String?>(foodServiceDetails),
      'hasChildCare': serializer.toJson<bool>(hasChildCare),
      'hasBookSales': serializer.toJson<bool>(hasBookSales),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  UserEventEntry copyWith(
          {String? id,
          String? categoryId,
          String? title,
          String? description,
          String? linkedVersesJson,
          DateTime? eventDate,
          bool? hasFoodService,
          Value<String?> foodServiceDetails = const Value.absent(),
          bool? hasChildCare,
          bool? hasBookSales,
          DateTime? createdAt}) =>
      UserEventEntry(
        id: id ?? this.id,
        categoryId: categoryId ?? this.categoryId,
        title: title ?? this.title,
        description: description ?? this.description,
        linkedVersesJson: linkedVersesJson ?? this.linkedVersesJson,
        eventDate: eventDate ?? this.eventDate,
        hasFoodService: hasFoodService ?? this.hasFoodService,
        foodServiceDetails: foodServiceDetails.present
            ? foodServiceDetails.value
            : this.foodServiceDetails,
        hasChildCare: hasChildCare ?? this.hasChildCare,
        hasBookSales: hasBookSales ?? this.hasBookSales,
        createdAt: createdAt ?? this.createdAt,
      );
  UserEventEntry copyWithCompanion(UserEventsCompanion data) {
    return UserEventEntry(
      id: data.id.present ? data.id.value : this.id,
      categoryId:
          data.categoryId.present ? data.categoryId.value : this.categoryId,
      title: data.title.present ? data.title.value : this.title,
      description:
          data.description.present ? data.description.value : this.description,
      linkedVersesJson: data.linkedVersesJson.present
          ? data.linkedVersesJson.value
          : this.linkedVersesJson,
      eventDate: data.eventDate.present ? data.eventDate.value : this.eventDate,
      hasFoodService: data.hasFoodService.present
          ? data.hasFoodService.value
          : this.hasFoodService,
      foodServiceDetails: data.foodServiceDetails.present
          ? data.foodServiceDetails.value
          : this.foodServiceDetails,
      hasChildCare: data.hasChildCare.present
          ? data.hasChildCare.value
          : this.hasChildCare,
      hasBookSales: data.hasBookSales.present
          ? data.hasBookSales.value
          : this.hasBookSales,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('UserEventEntry(')
          ..write('id: $id, ')
          ..write('categoryId: $categoryId, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('linkedVersesJson: $linkedVersesJson, ')
          ..write('eventDate: $eventDate, ')
          ..write('hasFoodService: $hasFoodService, ')
          ..write('foodServiceDetails: $foodServiceDetails, ')
          ..write('hasChildCare: $hasChildCare, ')
          ..write('hasBookSales: $hasBookSales, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      categoryId,
      title,
      description,
      linkedVersesJson,
      eventDate,
      hasFoodService,
      foodServiceDetails,
      hasChildCare,
      hasBookSales,
      createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is UserEventEntry &&
          other.id == this.id &&
          other.categoryId == this.categoryId &&
          other.title == this.title &&
          other.description == this.description &&
          other.linkedVersesJson == this.linkedVersesJson &&
          other.eventDate == this.eventDate &&
          other.hasFoodService == this.hasFoodService &&
          other.foodServiceDetails == this.foodServiceDetails &&
          other.hasChildCare == this.hasChildCare &&
          other.hasBookSales == this.hasBookSales &&
          other.createdAt == this.createdAt);
}

class UserEventsCompanion extends UpdateCompanion<UserEventEntry> {
  final Value<String> id;
  final Value<String> categoryId;
  final Value<String> title;
  final Value<String> description;
  final Value<String> linkedVersesJson;
  final Value<DateTime> eventDate;
  final Value<bool> hasFoodService;
  final Value<String?> foodServiceDetails;
  final Value<bool> hasChildCare;
  final Value<bool> hasBookSales;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const UserEventsCompanion({
    this.id = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.linkedVersesJson = const Value.absent(),
    this.eventDate = const Value.absent(),
    this.hasFoodService = const Value.absent(),
    this.foodServiceDetails = const Value.absent(),
    this.hasChildCare = const Value.absent(),
    this.hasBookSales = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UserEventsCompanion.insert({
    required String id,
    required String categoryId,
    required String title,
    required String description,
    this.linkedVersesJson = const Value.absent(),
    required DateTime eventDate,
    this.hasFoodService = const Value.absent(),
    this.foodServiceDetails = const Value.absent(),
    this.hasChildCare = const Value.absent(),
    this.hasBookSales = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        categoryId = Value(categoryId),
        title = Value(title),
        description = Value(description),
        eventDate = Value(eventDate);
  static Insertable<UserEventEntry> custom({
    Expression<String>? id,
    Expression<String>? categoryId,
    Expression<String>? title,
    Expression<String>? description,
    Expression<String>? linkedVersesJson,
    Expression<DateTime>? eventDate,
    Expression<bool>? hasFoodService,
    Expression<String>? foodServiceDetails,
    Expression<bool>? hasChildCare,
    Expression<bool>? hasBookSales,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (categoryId != null) 'category_id': categoryId,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (linkedVersesJson != null) 'linked_verses_json': linkedVersesJson,
      if (eventDate != null) 'event_date': eventDate,
      if (hasFoodService != null) 'has_food_service': hasFoodService,
      if (foodServiceDetails != null)
        'food_service_details': foodServiceDetails,
      if (hasChildCare != null) 'has_child_care': hasChildCare,
      if (hasBookSales != null) 'has_book_sales': hasBookSales,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UserEventsCompanion copyWith(
      {Value<String>? id,
      Value<String>? categoryId,
      Value<String>? title,
      Value<String>? description,
      Value<String>? linkedVersesJson,
      Value<DateTime>? eventDate,
      Value<bool>? hasFoodService,
      Value<String?>? foodServiceDetails,
      Value<bool>? hasChildCare,
      Value<bool>? hasBookSales,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return UserEventsCompanion(
      id: id ?? this.id,
      categoryId: categoryId ?? this.categoryId,
      title: title ?? this.title,
      description: description ?? this.description,
      linkedVersesJson: linkedVersesJson ?? this.linkedVersesJson,
      eventDate: eventDate ?? this.eventDate,
      hasFoodService: hasFoodService ?? this.hasFoodService,
      foodServiceDetails: foodServiceDetails ?? this.foodServiceDetails,
      hasChildCare: hasChildCare ?? this.hasChildCare,
      hasBookSales: hasBookSales ?? this.hasBookSales,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<String>(categoryId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (linkedVersesJson.present) {
      map['linked_verses_json'] = Variable<String>(linkedVersesJson.value);
    }
    if (eventDate.present) {
      map['event_date'] = Variable<DateTime>(eventDate.value);
    }
    if (hasFoodService.present) {
      map['has_food_service'] = Variable<bool>(hasFoodService.value);
    }
    if (foodServiceDetails.present) {
      map['food_service_details'] = Variable<String>(foodServiceDetails.value);
    }
    if (hasChildCare.present) {
      map['has_child_care'] = Variable<bool>(hasChildCare.value);
    }
    if (hasBookSales.present) {
      map['has_book_sales'] = Variable<bool>(hasBookSales.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UserEventsCompanion(')
          ..write('id: $id, ')
          ..write('categoryId: $categoryId, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('linkedVersesJson: $linkedVersesJson, ')
          ..write('eventDate: $eventDate, ')
          ..write('hasFoodService: $hasFoodService, ')
          ..write('foodServiceDetails: $foodServiceDetails, ')
          ..write('hasChildCare: $hasChildCare, ')
          ..write('hasBookSales: $hasBookSales, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $FoodCourtMenusTable extends FoodCourtMenus
    with TableInfo<$FoodCourtMenusTable, FoodCourtMenuEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $FoodCourtMenusTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _churchIdMeta =
      const VerificationMeta('churchId');
  @override
  late final GeneratedColumn<String> churchId = GeneratedColumn<String>(
      'church_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('default_church'));
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _priceMeta = const VerificationMeta('price');
  @override
  late final GeneratedColumn<double> price = GeneratedColumn<double>(
      'price', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _shiftMeta = const VerificationMeta('shift');
  @override
  late final GeneratedColumn<String> shift = GeneratedColumn<String>(
      'shift', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isAvailableMeta =
      const VerificationMeta('isAvailable');
  @override
  late final GeneratedColumn<bool> isAvailable = GeneratedColumn<bool>(
      'is_available', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("is_available" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, churchId, title, description, price, shift, isAvailable, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'food_court_menus';
  @override
  VerificationContext validateIntegrity(Insertable<FoodCourtMenuEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('church_id')) {
      context.handle(_churchIdMeta,
          churchId.isAcceptableOrUnknown(data['church_id']!, _churchIdMeta));
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('price')) {
      context.handle(
          _priceMeta, price.isAcceptableOrUnknown(data['price']!, _priceMeta));
    } else if (isInserting) {
      context.missing(_priceMeta);
    }
    if (data.containsKey('shift')) {
      context.handle(
          _shiftMeta, shift.isAcceptableOrUnknown(data['shift']!, _shiftMeta));
    } else if (isInserting) {
      context.missing(_shiftMeta);
    }
    if (data.containsKey('is_available')) {
      context.handle(
          _isAvailableMeta,
          isAvailable.isAcceptableOrUnknown(
              data['is_available']!, _isAvailableMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  FoodCourtMenuEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return FoodCourtMenuEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      churchId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}church_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      price: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}price'])!,
      shift: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}shift'])!,
      isAvailable: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_available'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $FoodCourtMenusTable createAlias(String alias) {
    return $FoodCourtMenusTable(attachedDatabase, alias);
  }
}

class FoodCourtMenuEntry extends DataClass
    implements Insertable<FoodCourtMenuEntry> {
  final String id;
  final String churchId;
  final String title;
  final String description;
  final double price;
  final String shift;
  final bool isAvailable;
  final DateTime createdAt;
  const FoodCourtMenuEntry(
      {required this.id,
      required this.churchId,
      required this.title,
      required this.description,
      required this.price,
      required this.shift,
      required this.isAvailable,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['church_id'] = Variable<String>(churchId);
    map['title'] = Variable<String>(title);
    map['description'] = Variable<String>(description);
    map['price'] = Variable<double>(price);
    map['shift'] = Variable<String>(shift);
    map['is_available'] = Variable<bool>(isAvailable);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  FoodCourtMenusCompanion toCompanion(bool nullToAbsent) {
    return FoodCourtMenusCompanion(
      id: Value(id),
      churchId: Value(churchId),
      title: Value(title),
      description: Value(description),
      price: Value(price),
      shift: Value(shift),
      isAvailable: Value(isAvailable),
      createdAt: Value(createdAt),
    );
  }

  factory FoodCourtMenuEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return FoodCourtMenuEntry(
      id: serializer.fromJson<String>(json['id']),
      churchId: serializer.fromJson<String>(json['churchId']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String>(json['description']),
      price: serializer.fromJson<double>(json['price']),
      shift: serializer.fromJson<String>(json['shift']),
      isAvailable: serializer.fromJson<bool>(json['isAvailable']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'churchId': serializer.toJson<String>(churchId),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String>(description),
      'price': serializer.toJson<double>(price),
      'shift': serializer.toJson<String>(shift),
      'isAvailable': serializer.toJson<bool>(isAvailable),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  FoodCourtMenuEntry copyWith(
          {String? id,
          String? churchId,
          String? title,
          String? description,
          double? price,
          String? shift,
          bool? isAvailable,
          DateTime? createdAt}) =>
      FoodCourtMenuEntry(
        id: id ?? this.id,
        churchId: churchId ?? this.churchId,
        title: title ?? this.title,
        description: description ?? this.description,
        price: price ?? this.price,
        shift: shift ?? this.shift,
        isAvailable: isAvailable ?? this.isAvailable,
        createdAt: createdAt ?? this.createdAt,
      );
  FoodCourtMenuEntry copyWithCompanion(FoodCourtMenusCompanion data) {
    return FoodCourtMenuEntry(
      id: data.id.present ? data.id.value : this.id,
      churchId: data.churchId.present ? data.churchId.value : this.churchId,
      title: data.title.present ? data.title.value : this.title,
      description:
          data.description.present ? data.description.value : this.description,
      price: data.price.present ? data.price.value : this.price,
      shift: data.shift.present ? data.shift.value : this.shift,
      isAvailable:
          data.isAvailable.present ? data.isAvailable.value : this.isAvailable,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('FoodCourtMenuEntry(')
          ..write('id: $id, ')
          ..write('churchId: $churchId, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('price: $price, ')
          ..write('shift: $shift, ')
          ..write('isAvailable: $isAvailable, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, churchId, title, description, price, shift, isAvailable, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is FoodCourtMenuEntry &&
          other.id == this.id &&
          other.churchId == this.churchId &&
          other.title == this.title &&
          other.description == this.description &&
          other.price == this.price &&
          other.shift == this.shift &&
          other.isAvailable == this.isAvailable &&
          other.createdAt == this.createdAt);
}

class FoodCourtMenusCompanion extends UpdateCompanion<FoodCourtMenuEntry> {
  final Value<String> id;
  final Value<String> churchId;
  final Value<String> title;
  final Value<String> description;
  final Value<double> price;
  final Value<String> shift;
  final Value<bool> isAvailable;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const FoodCourtMenusCompanion({
    this.id = const Value.absent(),
    this.churchId = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.price = const Value.absent(),
    this.shift = const Value.absent(),
    this.isAvailable = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  FoodCourtMenusCompanion.insert({
    required String id,
    this.churchId = const Value.absent(),
    required String title,
    required String description,
    required double price,
    required String shift,
    this.isAvailable = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        title = Value(title),
        description = Value(description),
        price = Value(price),
        shift = Value(shift);
  static Insertable<FoodCourtMenuEntry> custom({
    Expression<String>? id,
    Expression<String>? churchId,
    Expression<String>? title,
    Expression<String>? description,
    Expression<double>? price,
    Expression<String>? shift,
    Expression<bool>? isAvailable,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (churchId != null) 'church_id': churchId,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (price != null) 'price': price,
      if (shift != null) 'shift': shift,
      if (isAvailable != null) 'is_available': isAvailable,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  FoodCourtMenusCompanion copyWith(
      {Value<String>? id,
      Value<String>? churchId,
      Value<String>? title,
      Value<String>? description,
      Value<double>? price,
      Value<String>? shift,
      Value<bool>? isAvailable,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return FoodCourtMenusCompanion(
      id: id ?? this.id,
      churchId: churchId ?? this.churchId,
      title: title ?? this.title,
      description: description ?? this.description,
      price: price ?? this.price,
      shift: shift ?? this.shift,
      isAvailable: isAvailable ?? this.isAvailable,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (churchId.present) {
      map['church_id'] = Variable<String>(churchId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (price.present) {
      map['price'] = Variable<double>(price.value);
    }
    if (shift.present) {
      map['shift'] = Variable<String>(shift.value);
    }
    if (isAvailable.present) {
      map['is_available'] = Variable<bool>(isAvailable.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('FoodCourtMenusCompanion(')
          ..write('id: $id, ')
          ..write('churchId: $churchId, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('price: $price, ')
          ..write('shift: $shift, ')
          ..write('isAvailable: $isAvailable, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalBibleBooksTable extends LocalBibleBooks
    with TableInfo<$LocalBibleBooksTable, BibleBookEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalBibleBooksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _translationKeyMeta =
      const VerificationMeta('translationKey');
  @override
  late final GeneratedColumn<String> translationKey = GeneratedColumn<String>(
      'translation_key', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _bookNumberMeta =
      const VerificationMeta('bookNumber');
  @override
  late final GeneratedColumn<int> bookNumber = GeneratedColumn<int>(
      'book_number', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _bookCodeMeta =
      const VerificationMeta('bookCode');
  @override
  late final GeneratedColumn<String> bookCode = GeneratedColumn<String>(
      'book_code', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _totalChaptersMeta =
      const VerificationMeta('totalChapters');
  @override
  late final GeneratedColumn<int> totalChapters = GeneratedColumn<int>(
      'total_chapters', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _isNewTestamentMeta =
      const VerificationMeta('isNewTestament');
  @override
  late final GeneratedColumn<bool> isNewTestament = GeneratedColumn<bool>(
      'is_new_testament', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("is_new_testament" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _urlMeta = const VerificationMeta('url');
  @override
  late final GeneratedColumn<String> url = GeneratedColumn<String>(
      'url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _shaMeta = const VerificationMeta('sha');
  @override
  late final GeneratedColumn<String> sha = GeneratedColumn<String>(
      'sha', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        translationKey,
        bookNumber,
        bookCode,
        name,
        totalChapters,
        isNewTestament,
        url,
        sha,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_bible_books';
  @override
  VerificationContext validateIntegrity(Insertable<BibleBookEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('translation_key')) {
      context.handle(
          _translationKeyMeta,
          translationKey.isAcceptableOrUnknown(
              data['translation_key']!, _translationKeyMeta));
    } else if (isInserting) {
      context.missing(_translationKeyMeta);
    }
    if (data.containsKey('book_number')) {
      context.handle(
          _bookNumberMeta,
          bookNumber.isAcceptableOrUnknown(
              data['book_number']!, _bookNumberMeta));
    } else if (isInserting) {
      context.missing(_bookNumberMeta);
    }
    if (data.containsKey('book_code')) {
      context.handle(_bookCodeMeta,
          bookCode.isAcceptableOrUnknown(data['book_code']!, _bookCodeMeta));
    } else if (isInserting) {
      context.missing(_bookCodeMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('total_chapters')) {
      context.handle(
          _totalChaptersMeta,
          totalChapters.isAcceptableOrUnknown(
              data['total_chapters']!, _totalChaptersMeta));
    } else if (isInserting) {
      context.missing(_totalChaptersMeta);
    }
    if (data.containsKey('is_new_testament')) {
      context.handle(
          _isNewTestamentMeta,
          isNewTestament.isAcceptableOrUnknown(
              data['is_new_testament']!, _isNewTestamentMeta));
    }
    if (data.containsKey('url')) {
      context.handle(
          _urlMeta, url.isAcceptableOrUnknown(data['url']!, _urlMeta));
    }
    if (data.containsKey('sha')) {
      context.handle(
          _shaMeta, sha.isAcceptableOrUnknown(data['sha']!, _shaMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BibleBookEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BibleBookEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      translationKey: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}translation_key'])!,
      bookNumber: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}book_number'])!,
      bookCode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}book_code'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      totalChapters: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}total_chapters'])!,
      isNewTestament: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_new_testament'])!,
      url: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}url']),
      sha: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sha']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $LocalBibleBooksTable createAlias(String alias) {
    return $LocalBibleBooksTable(attachedDatabase, alias);
  }
}

class BibleBookEntry extends DataClass implements Insertable<BibleBookEntry> {
  final String id;
  final String translationKey;
  final int bookNumber;
  final String bookCode;
  final String name;
  final int totalChapters;
  final bool isNewTestament;
  final String? url;
  final String? sha;
  final DateTime createdAt;
  const BibleBookEntry(
      {required this.id,
      required this.translationKey,
      required this.bookNumber,
      required this.bookCode,
      required this.name,
      required this.totalChapters,
      required this.isNewTestament,
      this.url,
      this.sha,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['translation_key'] = Variable<String>(translationKey);
    map['book_number'] = Variable<int>(bookNumber);
    map['book_code'] = Variable<String>(bookCode);
    map['name'] = Variable<String>(name);
    map['total_chapters'] = Variable<int>(totalChapters);
    map['is_new_testament'] = Variable<bool>(isNewTestament);
    if (!nullToAbsent || url != null) {
      map['url'] = Variable<String>(url);
    }
    if (!nullToAbsent || sha != null) {
      map['sha'] = Variable<String>(sha);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  LocalBibleBooksCompanion toCompanion(bool nullToAbsent) {
    return LocalBibleBooksCompanion(
      id: Value(id),
      translationKey: Value(translationKey),
      bookNumber: Value(bookNumber),
      bookCode: Value(bookCode),
      name: Value(name),
      totalChapters: Value(totalChapters),
      isNewTestament: Value(isNewTestament),
      url: url == null && nullToAbsent ? const Value.absent() : Value(url),
      sha: sha == null && nullToAbsent ? const Value.absent() : Value(sha),
      createdAt: Value(createdAt),
    );
  }

  factory BibleBookEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BibleBookEntry(
      id: serializer.fromJson<String>(json['id']),
      translationKey: serializer.fromJson<String>(json['translationKey']),
      bookNumber: serializer.fromJson<int>(json['bookNumber']),
      bookCode: serializer.fromJson<String>(json['bookCode']),
      name: serializer.fromJson<String>(json['name']),
      totalChapters: serializer.fromJson<int>(json['totalChapters']),
      isNewTestament: serializer.fromJson<bool>(json['isNewTestament']),
      url: serializer.fromJson<String?>(json['url']),
      sha: serializer.fromJson<String?>(json['sha']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'translationKey': serializer.toJson<String>(translationKey),
      'bookNumber': serializer.toJson<int>(bookNumber),
      'bookCode': serializer.toJson<String>(bookCode),
      'name': serializer.toJson<String>(name),
      'totalChapters': serializer.toJson<int>(totalChapters),
      'isNewTestament': serializer.toJson<bool>(isNewTestament),
      'url': serializer.toJson<String?>(url),
      'sha': serializer.toJson<String?>(sha),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  BibleBookEntry copyWith(
          {String? id,
          String? translationKey,
          int? bookNumber,
          String? bookCode,
          String? name,
          int? totalChapters,
          bool? isNewTestament,
          Value<String?> url = const Value.absent(),
          Value<String?> sha = const Value.absent(),
          DateTime? createdAt}) =>
      BibleBookEntry(
        id: id ?? this.id,
        translationKey: translationKey ?? this.translationKey,
        bookNumber: bookNumber ?? this.bookNumber,
        bookCode: bookCode ?? this.bookCode,
        name: name ?? this.name,
        totalChapters: totalChapters ?? this.totalChapters,
        isNewTestament: isNewTestament ?? this.isNewTestament,
        url: url.present ? url.value : this.url,
        sha: sha.present ? sha.value : this.sha,
        createdAt: createdAt ?? this.createdAt,
      );
  BibleBookEntry copyWithCompanion(LocalBibleBooksCompanion data) {
    return BibleBookEntry(
      id: data.id.present ? data.id.value : this.id,
      translationKey: data.translationKey.present
          ? data.translationKey.value
          : this.translationKey,
      bookNumber:
          data.bookNumber.present ? data.bookNumber.value : this.bookNumber,
      bookCode: data.bookCode.present ? data.bookCode.value : this.bookCode,
      name: data.name.present ? data.name.value : this.name,
      totalChapters: data.totalChapters.present
          ? data.totalChapters.value
          : this.totalChapters,
      isNewTestament: data.isNewTestament.present
          ? data.isNewTestament.value
          : this.isNewTestament,
      url: data.url.present ? data.url.value : this.url,
      sha: data.sha.present ? data.sha.value : this.sha,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BibleBookEntry(')
          ..write('id: $id, ')
          ..write('translationKey: $translationKey, ')
          ..write('bookNumber: $bookNumber, ')
          ..write('bookCode: $bookCode, ')
          ..write('name: $name, ')
          ..write('totalChapters: $totalChapters, ')
          ..write('isNewTestament: $isNewTestament, ')
          ..write('url: $url, ')
          ..write('sha: $sha, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, translationKey, bookNumber, bookCode,
      name, totalChapters, isNewTestament, url, sha, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BibleBookEntry &&
          other.id == this.id &&
          other.translationKey == this.translationKey &&
          other.bookNumber == this.bookNumber &&
          other.bookCode == this.bookCode &&
          other.name == this.name &&
          other.totalChapters == this.totalChapters &&
          other.isNewTestament == this.isNewTestament &&
          other.url == this.url &&
          other.sha == this.sha &&
          other.createdAt == this.createdAt);
}

class LocalBibleBooksCompanion extends UpdateCompanion<BibleBookEntry> {
  final Value<String> id;
  final Value<String> translationKey;
  final Value<int> bookNumber;
  final Value<String> bookCode;
  final Value<String> name;
  final Value<int> totalChapters;
  final Value<bool> isNewTestament;
  final Value<String?> url;
  final Value<String?> sha;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const LocalBibleBooksCompanion({
    this.id = const Value.absent(),
    this.translationKey = const Value.absent(),
    this.bookNumber = const Value.absent(),
    this.bookCode = const Value.absent(),
    this.name = const Value.absent(),
    this.totalChapters = const Value.absent(),
    this.isNewTestament = const Value.absent(),
    this.url = const Value.absent(),
    this.sha = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalBibleBooksCompanion.insert({
    required String id,
    required String translationKey,
    required int bookNumber,
    required String bookCode,
    required String name,
    required int totalChapters,
    this.isNewTestament = const Value.absent(),
    this.url = const Value.absent(),
    this.sha = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        translationKey = Value(translationKey),
        bookNumber = Value(bookNumber),
        bookCode = Value(bookCode),
        name = Value(name),
        totalChapters = Value(totalChapters);
  static Insertable<BibleBookEntry> custom({
    Expression<String>? id,
    Expression<String>? translationKey,
    Expression<int>? bookNumber,
    Expression<String>? bookCode,
    Expression<String>? name,
    Expression<int>? totalChapters,
    Expression<bool>? isNewTestament,
    Expression<String>? url,
    Expression<String>? sha,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (translationKey != null) 'translation_key': translationKey,
      if (bookNumber != null) 'book_number': bookNumber,
      if (bookCode != null) 'book_code': bookCode,
      if (name != null) 'name': name,
      if (totalChapters != null) 'total_chapters': totalChapters,
      if (isNewTestament != null) 'is_new_testament': isNewTestament,
      if (url != null) 'url': url,
      if (sha != null) 'sha': sha,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalBibleBooksCompanion copyWith(
      {Value<String>? id,
      Value<String>? translationKey,
      Value<int>? bookNumber,
      Value<String>? bookCode,
      Value<String>? name,
      Value<int>? totalChapters,
      Value<bool>? isNewTestament,
      Value<String?>? url,
      Value<String?>? sha,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return LocalBibleBooksCompanion(
      id: id ?? this.id,
      translationKey: translationKey ?? this.translationKey,
      bookNumber: bookNumber ?? this.bookNumber,
      bookCode: bookCode ?? this.bookCode,
      name: name ?? this.name,
      totalChapters: totalChapters ?? this.totalChapters,
      isNewTestament: isNewTestament ?? this.isNewTestament,
      url: url ?? this.url,
      sha: sha ?? this.sha,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (translationKey.present) {
      map['translation_key'] = Variable<String>(translationKey.value);
    }
    if (bookNumber.present) {
      map['book_number'] = Variable<int>(bookNumber.value);
    }
    if (bookCode.present) {
      map['book_code'] = Variable<String>(bookCode.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (totalChapters.present) {
      map['total_chapters'] = Variable<int>(totalChapters.value);
    }
    if (isNewTestament.present) {
      map['is_new_testament'] = Variable<bool>(isNewTestament.value);
    }
    if (url.present) {
      map['url'] = Variable<String>(url.value);
    }
    if (sha.present) {
      map['sha'] = Variable<String>(sha.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalBibleBooksCompanion(')
          ..write('id: $id, ')
          ..write('translationKey: $translationKey, ')
          ..write('bookNumber: $bookNumber, ')
          ..write('bookCode: $bookCode, ')
          ..write('name: $name, ')
          ..write('totalChapters: $totalChapters, ')
          ..write('isNewTestament: $isNewTestament, ')
          ..write('url: $url, ')
          ..write('sha: $sha, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalBibleTranslationsTable extends LocalBibleTranslations
    with TableInfo<$LocalBibleTranslationsTable, BibleTranslationEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalBibleTranslationsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _abbreviationMeta =
      const VerificationMeta('abbreviation');
  @override
  late final GeneratedColumn<String> abbreviation = GeneratedColumn<String>(
      'abbreviation', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _languageMeta =
      const VerificationMeta('language');
  @override
  late final GeneratedColumn<String> language = GeneratedColumn<String>(
      'language', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Spanish'));
  static const VerificationMeta _directionMeta =
      const VerificationMeta('direction');
  @override
  late final GeneratedColumn<String> direction = GeneratedColumn<String>(
      'direction', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('LTR'));
  static const VerificationMeta _distributionAbbreviationMeta =
      const VerificationMeta('distributionAbbreviation');
  @override
  late final GeneratedColumn<String> distributionAbbreviation =
      GeneratedColumn<String>('distribution_abbreviation', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _urlMeta = const VerificationMeta('url');
  @override
  late final GeneratedColumn<String> url = GeneratedColumn<String>(
      'url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        abbreviation,
        description,
        language,
        direction,
        distributionAbbreviation,
        url,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_bible_translations';
  @override
  VerificationContext validateIntegrity(
      Insertable<BibleTranslationEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('abbreviation')) {
      context.handle(
          _abbreviationMeta,
          abbreviation.isAcceptableOrUnknown(
              data['abbreviation']!, _abbreviationMeta));
    } else if (isInserting) {
      context.missing(_abbreviationMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('language')) {
      context.handle(_languageMeta,
          language.isAcceptableOrUnknown(data['language']!, _languageMeta));
    }
    if (data.containsKey('direction')) {
      context.handle(_directionMeta,
          direction.isAcceptableOrUnknown(data['direction']!, _directionMeta));
    }
    if (data.containsKey('distribution_abbreviation')) {
      context.handle(
          _distributionAbbreviationMeta,
          distributionAbbreviation.isAcceptableOrUnknown(
              data['distribution_abbreviation']!,
              _distributionAbbreviationMeta));
    }
    if (data.containsKey('url')) {
      context.handle(
          _urlMeta, url.isAcceptableOrUnknown(data['url']!, _urlMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BibleTranslationEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BibleTranslationEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      abbreviation: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}abbreviation'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
      language: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}language'])!,
      direction: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}direction'])!,
      distributionAbbreviation: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}distribution_abbreviation']),
      url: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}url']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $LocalBibleTranslationsTable createAlias(String alias) {
    return $LocalBibleTranslationsTable(attachedDatabase, alias);
  }
}

class BibleTranslationEntry extends DataClass
    implements Insertable<BibleTranslationEntry> {
  final String id;
  final String name;
  final String abbreviation;
  final String? description;
  final String language;
  final String direction;
  final String? distributionAbbreviation;
  final String? url;
  final DateTime createdAt;
  const BibleTranslationEntry(
      {required this.id,
      required this.name,
      required this.abbreviation,
      this.description,
      required this.language,
      required this.direction,
      this.distributionAbbreviation,
      this.url,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['abbreviation'] = Variable<String>(abbreviation);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    map['language'] = Variable<String>(language);
    map['direction'] = Variable<String>(direction);
    if (!nullToAbsent || distributionAbbreviation != null) {
      map['distribution_abbreviation'] =
          Variable<String>(distributionAbbreviation);
    }
    if (!nullToAbsent || url != null) {
      map['url'] = Variable<String>(url);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  LocalBibleTranslationsCompanion toCompanion(bool nullToAbsent) {
    return LocalBibleTranslationsCompanion(
      id: Value(id),
      name: Value(name),
      abbreviation: Value(abbreviation),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      language: Value(language),
      direction: Value(direction),
      distributionAbbreviation: distributionAbbreviation == null && nullToAbsent
          ? const Value.absent()
          : Value(distributionAbbreviation),
      url: url == null && nullToAbsent ? const Value.absent() : Value(url),
      createdAt: Value(createdAt),
    );
  }

  factory BibleTranslationEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BibleTranslationEntry(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      abbreviation: serializer.fromJson<String>(json['abbreviation']),
      description: serializer.fromJson<String?>(json['description']),
      language: serializer.fromJson<String>(json['language']),
      direction: serializer.fromJson<String>(json['direction']),
      distributionAbbreviation:
          serializer.fromJson<String?>(json['distributionAbbreviation']),
      url: serializer.fromJson<String?>(json['url']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'abbreviation': serializer.toJson<String>(abbreviation),
      'description': serializer.toJson<String?>(description),
      'language': serializer.toJson<String>(language),
      'direction': serializer.toJson<String>(direction),
      'distributionAbbreviation':
          serializer.toJson<String?>(distributionAbbreviation),
      'url': serializer.toJson<String?>(url),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  BibleTranslationEntry copyWith(
          {String? id,
          String? name,
          String? abbreviation,
          Value<String?> description = const Value.absent(),
          String? language,
          String? direction,
          Value<String?> distributionAbbreviation = const Value.absent(),
          Value<String?> url = const Value.absent(),
          DateTime? createdAt}) =>
      BibleTranslationEntry(
        id: id ?? this.id,
        name: name ?? this.name,
        abbreviation: abbreviation ?? this.abbreviation,
        description: description.present ? description.value : this.description,
        language: language ?? this.language,
        direction: direction ?? this.direction,
        distributionAbbreviation: distributionAbbreviation.present
            ? distributionAbbreviation.value
            : this.distributionAbbreviation,
        url: url.present ? url.value : this.url,
        createdAt: createdAt ?? this.createdAt,
      );
  BibleTranslationEntry copyWithCompanion(
      LocalBibleTranslationsCompanion data) {
    return BibleTranslationEntry(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      abbreviation: data.abbreviation.present
          ? data.abbreviation.value
          : this.abbreviation,
      description:
          data.description.present ? data.description.value : this.description,
      language: data.language.present ? data.language.value : this.language,
      direction: data.direction.present ? data.direction.value : this.direction,
      distributionAbbreviation: data.distributionAbbreviation.present
          ? data.distributionAbbreviation.value
          : this.distributionAbbreviation,
      url: data.url.present ? data.url.value : this.url,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BibleTranslationEntry(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('abbreviation: $abbreviation, ')
          ..write('description: $description, ')
          ..write('language: $language, ')
          ..write('direction: $direction, ')
          ..write('distributionAbbreviation: $distributionAbbreviation, ')
          ..write('url: $url, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, abbreviation, description, language,
      direction, distributionAbbreviation, url, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BibleTranslationEntry &&
          other.id == this.id &&
          other.name == this.name &&
          other.abbreviation == this.abbreviation &&
          other.description == this.description &&
          other.language == this.language &&
          other.direction == this.direction &&
          other.distributionAbbreviation == this.distributionAbbreviation &&
          other.url == this.url &&
          other.createdAt == this.createdAt);
}

class LocalBibleTranslationsCompanion
    extends UpdateCompanion<BibleTranslationEntry> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> abbreviation;
  final Value<String?> description;
  final Value<String> language;
  final Value<String> direction;
  final Value<String?> distributionAbbreviation;
  final Value<String?> url;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const LocalBibleTranslationsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.abbreviation = const Value.absent(),
    this.description = const Value.absent(),
    this.language = const Value.absent(),
    this.direction = const Value.absent(),
    this.distributionAbbreviation = const Value.absent(),
    this.url = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalBibleTranslationsCompanion.insert({
    required String id,
    required String name,
    required String abbreviation,
    this.description = const Value.absent(),
    this.language = const Value.absent(),
    this.direction = const Value.absent(),
    this.distributionAbbreviation = const Value.absent(),
    this.url = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        abbreviation = Value(abbreviation);
  static Insertable<BibleTranslationEntry> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? abbreviation,
    Expression<String>? description,
    Expression<String>? language,
    Expression<String>? direction,
    Expression<String>? distributionAbbreviation,
    Expression<String>? url,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (abbreviation != null) 'abbreviation': abbreviation,
      if (description != null) 'description': description,
      if (language != null) 'language': language,
      if (direction != null) 'direction': direction,
      if (distributionAbbreviation != null)
        'distribution_abbreviation': distributionAbbreviation,
      if (url != null) 'url': url,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalBibleTranslationsCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String>? abbreviation,
      Value<String?>? description,
      Value<String>? language,
      Value<String>? direction,
      Value<String?>? distributionAbbreviation,
      Value<String?>? url,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return LocalBibleTranslationsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      abbreviation: abbreviation ?? this.abbreviation,
      description: description ?? this.description,
      language: language ?? this.language,
      direction: direction ?? this.direction,
      distributionAbbreviation:
          distributionAbbreviation ?? this.distributionAbbreviation,
      url: url ?? this.url,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (abbreviation.present) {
      map['abbreviation'] = Variable<String>(abbreviation.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (language.present) {
      map['language'] = Variable<String>(language.value);
    }
    if (direction.present) {
      map['direction'] = Variable<String>(direction.value);
    }
    if (distributionAbbreviation.present) {
      map['distribution_abbreviation'] =
          Variable<String>(distributionAbbreviation.value);
    }
    if (url.present) {
      map['url'] = Variable<String>(url.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalBibleTranslationsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('abbreviation: $abbreviation, ')
          ..write('description: $description, ')
          ..write('language: $language, ')
          ..write('direction: $direction, ')
          ..write('distributionAbbreviation: $distributionAbbreviation, ')
          ..write('url: $url, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalBibleChaptersTable extends LocalBibleChapters
    with TableInfo<$LocalBibleChaptersTable, BibleChapterEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalBibleChaptersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _translationKeyMeta =
      const VerificationMeta('translationKey');
  @override
  late final GeneratedColumn<String> translationKey = GeneratedColumn<String>(
      'translation_key', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _bookNumberMeta =
      const VerificationMeta('bookNumber');
  @override
  late final GeneratedColumn<int> bookNumber = GeneratedColumn<int>(
      'book_number', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _bookCodeMeta =
      const VerificationMeta('bookCode');
  @override
  late final GeneratedColumn<String> bookCode = GeneratedColumn<String>(
      'book_code', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _bookNameMeta =
      const VerificationMeta('bookName');
  @override
  late final GeneratedColumn<String> bookName = GeneratedColumn<String>(
      'book_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _chapterMeta =
      const VerificationMeta('chapter');
  @override
  late final GeneratedColumn<int> chapter = GeneratedColumn<int>(
      'chapter', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _versesJsonMeta =
      const VerificationMeta('versesJson');
  @override
  late final GeneratedColumn<String> versesJson = GeneratedColumn<String>(
      'verses_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _verseCountMeta =
      const VerificationMeta('verseCount');
  @override
  late final GeneratedColumn<int> verseCount = GeneratedColumn<int>(
      'verse_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        translationKey,
        bookNumber,
        bookCode,
        bookName,
        chapter,
        versesJson,
        verseCount,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_bible_chapters';
  @override
  VerificationContext validateIntegrity(Insertable<BibleChapterEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('translation_key')) {
      context.handle(
          _translationKeyMeta,
          translationKey.isAcceptableOrUnknown(
              data['translation_key']!, _translationKeyMeta));
    } else if (isInserting) {
      context.missing(_translationKeyMeta);
    }
    if (data.containsKey('book_number')) {
      context.handle(
          _bookNumberMeta,
          bookNumber.isAcceptableOrUnknown(
              data['book_number']!, _bookNumberMeta));
    } else if (isInserting) {
      context.missing(_bookNumberMeta);
    }
    if (data.containsKey('book_code')) {
      context.handle(_bookCodeMeta,
          bookCode.isAcceptableOrUnknown(data['book_code']!, _bookCodeMeta));
    } else if (isInserting) {
      context.missing(_bookCodeMeta);
    }
    if (data.containsKey('book_name')) {
      context.handle(_bookNameMeta,
          bookName.isAcceptableOrUnknown(data['book_name']!, _bookNameMeta));
    } else if (isInserting) {
      context.missing(_bookNameMeta);
    }
    if (data.containsKey('chapter')) {
      context.handle(_chapterMeta,
          chapter.isAcceptableOrUnknown(data['chapter']!, _chapterMeta));
    } else if (isInserting) {
      context.missing(_chapterMeta);
    }
    if (data.containsKey('verses_json')) {
      context.handle(
          _versesJsonMeta,
          versesJson.isAcceptableOrUnknown(
              data['verses_json']!, _versesJsonMeta));
    } else if (isInserting) {
      context.missing(_versesJsonMeta);
    }
    if (data.containsKey('verse_count')) {
      context.handle(
          _verseCountMeta,
          verseCount.isAcceptableOrUnknown(
              data['verse_count']!, _verseCountMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BibleChapterEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BibleChapterEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      translationKey: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}translation_key'])!,
      bookNumber: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}book_number'])!,
      bookCode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}book_code'])!,
      bookName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}book_name'])!,
      chapter: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}chapter'])!,
      versesJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}verses_json'])!,
      verseCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}verse_count'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $LocalBibleChaptersTable createAlias(String alias) {
    return $LocalBibleChaptersTable(attachedDatabase, alias);
  }
}

class BibleChapterEntry extends DataClass
    implements Insertable<BibleChapterEntry> {
  final String id;
  final String translationKey;
  final int bookNumber;
  final String bookCode;
  final String bookName;
  final int chapter;
  final String versesJson;
  final int verseCount;
  final DateTime createdAt;
  const BibleChapterEntry(
      {required this.id,
      required this.translationKey,
      required this.bookNumber,
      required this.bookCode,
      required this.bookName,
      required this.chapter,
      required this.versesJson,
      required this.verseCount,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['translation_key'] = Variable<String>(translationKey);
    map['book_number'] = Variable<int>(bookNumber);
    map['book_code'] = Variable<String>(bookCode);
    map['book_name'] = Variable<String>(bookName);
    map['chapter'] = Variable<int>(chapter);
    map['verses_json'] = Variable<String>(versesJson);
    map['verse_count'] = Variable<int>(verseCount);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  LocalBibleChaptersCompanion toCompanion(bool nullToAbsent) {
    return LocalBibleChaptersCompanion(
      id: Value(id),
      translationKey: Value(translationKey),
      bookNumber: Value(bookNumber),
      bookCode: Value(bookCode),
      bookName: Value(bookName),
      chapter: Value(chapter),
      versesJson: Value(versesJson),
      verseCount: Value(verseCount),
      createdAt: Value(createdAt),
    );
  }

  factory BibleChapterEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BibleChapterEntry(
      id: serializer.fromJson<String>(json['id']),
      translationKey: serializer.fromJson<String>(json['translationKey']),
      bookNumber: serializer.fromJson<int>(json['bookNumber']),
      bookCode: serializer.fromJson<String>(json['bookCode']),
      bookName: serializer.fromJson<String>(json['bookName']),
      chapter: serializer.fromJson<int>(json['chapter']),
      versesJson: serializer.fromJson<String>(json['versesJson']),
      verseCount: serializer.fromJson<int>(json['verseCount']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'translationKey': serializer.toJson<String>(translationKey),
      'bookNumber': serializer.toJson<int>(bookNumber),
      'bookCode': serializer.toJson<String>(bookCode),
      'bookName': serializer.toJson<String>(bookName),
      'chapter': serializer.toJson<int>(chapter),
      'versesJson': serializer.toJson<String>(versesJson),
      'verseCount': serializer.toJson<int>(verseCount),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  BibleChapterEntry copyWith(
          {String? id,
          String? translationKey,
          int? bookNumber,
          String? bookCode,
          String? bookName,
          int? chapter,
          String? versesJson,
          int? verseCount,
          DateTime? createdAt}) =>
      BibleChapterEntry(
        id: id ?? this.id,
        translationKey: translationKey ?? this.translationKey,
        bookNumber: bookNumber ?? this.bookNumber,
        bookCode: bookCode ?? this.bookCode,
        bookName: bookName ?? this.bookName,
        chapter: chapter ?? this.chapter,
        versesJson: versesJson ?? this.versesJson,
        verseCount: verseCount ?? this.verseCount,
        createdAt: createdAt ?? this.createdAt,
      );
  BibleChapterEntry copyWithCompanion(LocalBibleChaptersCompanion data) {
    return BibleChapterEntry(
      id: data.id.present ? data.id.value : this.id,
      translationKey: data.translationKey.present
          ? data.translationKey.value
          : this.translationKey,
      bookNumber:
          data.bookNumber.present ? data.bookNumber.value : this.bookNumber,
      bookCode: data.bookCode.present ? data.bookCode.value : this.bookCode,
      bookName: data.bookName.present ? data.bookName.value : this.bookName,
      chapter: data.chapter.present ? data.chapter.value : this.chapter,
      versesJson:
          data.versesJson.present ? data.versesJson.value : this.versesJson,
      verseCount:
          data.verseCount.present ? data.verseCount.value : this.verseCount,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BibleChapterEntry(')
          ..write('id: $id, ')
          ..write('translationKey: $translationKey, ')
          ..write('bookNumber: $bookNumber, ')
          ..write('bookCode: $bookCode, ')
          ..write('bookName: $bookName, ')
          ..write('chapter: $chapter, ')
          ..write('versesJson: $versesJson, ')
          ..write('verseCount: $verseCount, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, translationKey, bookNumber, bookCode,
      bookName, chapter, versesJson, verseCount, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BibleChapterEntry &&
          other.id == this.id &&
          other.translationKey == this.translationKey &&
          other.bookNumber == this.bookNumber &&
          other.bookCode == this.bookCode &&
          other.bookName == this.bookName &&
          other.chapter == this.chapter &&
          other.versesJson == this.versesJson &&
          other.verseCount == this.verseCount &&
          other.createdAt == this.createdAt);
}

class LocalBibleChaptersCompanion extends UpdateCompanion<BibleChapterEntry> {
  final Value<String> id;
  final Value<String> translationKey;
  final Value<int> bookNumber;
  final Value<String> bookCode;
  final Value<String> bookName;
  final Value<int> chapter;
  final Value<String> versesJson;
  final Value<int> verseCount;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const LocalBibleChaptersCompanion({
    this.id = const Value.absent(),
    this.translationKey = const Value.absent(),
    this.bookNumber = const Value.absent(),
    this.bookCode = const Value.absent(),
    this.bookName = const Value.absent(),
    this.chapter = const Value.absent(),
    this.versesJson = const Value.absent(),
    this.verseCount = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalBibleChaptersCompanion.insert({
    required String id,
    required String translationKey,
    required int bookNumber,
    required String bookCode,
    required String bookName,
    required int chapter,
    required String versesJson,
    this.verseCount = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        translationKey = Value(translationKey),
        bookNumber = Value(bookNumber),
        bookCode = Value(bookCode),
        bookName = Value(bookName),
        chapter = Value(chapter),
        versesJson = Value(versesJson);
  static Insertable<BibleChapterEntry> custom({
    Expression<String>? id,
    Expression<String>? translationKey,
    Expression<int>? bookNumber,
    Expression<String>? bookCode,
    Expression<String>? bookName,
    Expression<int>? chapter,
    Expression<String>? versesJson,
    Expression<int>? verseCount,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (translationKey != null) 'translation_key': translationKey,
      if (bookNumber != null) 'book_number': bookNumber,
      if (bookCode != null) 'book_code': bookCode,
      if (bookName != null) 'book_name': bookName,
      if (chapter != null) 'chapter': chapter,
      if (versesJson != null) 'verses_json': versesJson,
      if (verseCount != null) 'verse_count': verseCount,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalBibleChaptersCompanion copyWith(
      {Value<String>? id,
      Value<String>? translationKey,
      Value<int>? bookNumber,
      Value<String>? bookCode,
      Value<String>? bookName,
      Value<int>? chapter,
      Value<String>? versesJson,
      Value<int>? verseCount,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return LocalBibleChaptersCompanion(
      id: id ?? this.id,
      translationKey: translationKey ?? this.translationKey,
      bookNumber: bookNumber ?? this.bookNumber,
      bookCode: bookCode ?? this.bookCode,
      bookName: bookName ?? this.bookName,
      chapter: chapter ?? this.chapter,
      versesJson: versesJson ?? this.versesJson,
      verseCount: verseCount ?? this.verseCount,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (translationKey.present) {
      map['translation_key'] = Variable<String>(translationKey.value);
    }
    if (bookNumber.present) {
      map['book_number'] = Variable<int>(bookNumber.value);
    }
    if (bookCode.present) {
      map['book_code'] = Variable<String>(bookCode.value);
    }
    if (bookName.present) {
      map['book_name'] = Variable<String>(bookName.value);
    }
    if (chapter.present) {
      map['chapter'] = Variable<int>(chapter.value);
    }
    if (versesJson.present) {
      map['verses_json'] = Variable<String>(versesJson.value);
    }
    if (verseCount.present) {
      map['verse_count'] = Variable<int>(verseCount.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalBibleChaptersCompanion(')
          ..write('id: $id, ')
          ..write('translationKey: $translationKey, ')
          ..write('bookNumber: $bookNumber, ')
          ..write('bookCode: $bookCode, ')
          ..write('bookName: $bookName, ')
          ..write('chapter: $chapter, ')
          ..write('versesJson: $versesJson, ')
          ..write('verseCount: $verseCount, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalUsersTable extends LocalUsers
    with TableInfo<$LocalUsersTable, LocalUserEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalUsersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _authTypeMeta =
      const VerificationMeta('authType');
  @override
  late final GeneratedColumn<String> authType = GeneratedColumn<String>(
      'auth_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
      'email', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _remoteUserIdMeta =
      const VerificationMeta('remoteUserId');
  @override
  late final GeneratedColumn<String> remoteUserId = GeneratedColumn<String>(
      'remote_user_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _displayNameMeta =
      const VerificationMeta('displayName');
  @override
  late final GeneratedColumn<String> displayName = GeneratedColumn<String>(
      'display_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _lastSeenAtMeta =
      const VerificationMeta('lastSeenAt');
  @override
  late final GeneratedColumn<DateTime> lastSeenAt = GeneratedColumn<DateTime>(
      'last_seen_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, authType, email, remoteUserId, displayName, createdAt, lastSeenAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_users';
  @override
  VerificationContext validateIntegrity(Insertable<LocalUserEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('auth_type')) {
      context.handle(_authTypeMeta,
          authType.isAcceptableOrUnknown(data['auth_type']!, _authTypeMeta));
    } else if (isInserting) {
      context.missing(_authTypeMeta);
    }
    if (data.containsKey('email')) {
      context.handle(
          _emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));
    }
    if (data.containsKey('remote_user_id')) {
      context.handle(
          _remoteUserIdMeta,
          remoteUserId.isAcceptableOrUnknown(
              data['remote_user_id']!, _remoteUserIdMeta));
    }
    if (data.containsKey('display_name')) {
      context.handle(
          _displayNameMeta,
          displayName.isAcceptableOrUnknown(
              data['display_name']!, _displayNameMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('last_seen_at')) {
      context.handle(
          _lastSeenAtMeta,
          lastSeenAt.isAcceptableOrUnknown(
              data['last_seen_at']!, _lastSeenAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalUserEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalUserEntry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      authType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}auth_type'])!,
      email: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}email']),
      remoteUserId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_user_id']),
      displayName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}display_name']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      lastSeenAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_seen_at'])!,
    );
  }

  @override
  $LocalUsersTable createAlias(String alias) {
    return $LocalUsersTable(attachedDatabase, alias);
  }
}

class LocalUserEntry extends DataClass implements Insertable<LocalUserEntry> {
  final String id;
  final String authType;
  final String? email;
  final String? remoteUserId;
  final String? displayName;
  final DateTime createdAt;
  final DateTime lastSeenAt;
  const LocalUserEntry(
      {required this.id,
      required this.authType,
      this.email,
      this.remoteUserId,
      this.displayName,
      required this.createdAt,
      required this.lastSeenAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['auth_type'] = Variable<String>(authType);
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || remoteUserId != null) {
      map['remote_user_id'] = Variable<String>(remoteUserId);
    }
    if (!nullToAbsent || displayName != null) {
      map['display_name'] = Variable<String>(displayName);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['last_seen_at'] = Variable<DateTime>(lastSeenAt);
    return map;
  }

  LocalUsersCompanion toCompanion(bool nullToAbsent) {
    return LocalUsersCompanion(
      id: Value(id),
      authType: Value(authType),
      email:
          email == null && nullToAbsent ? const Value.absent() : Value(email),
      remoteUserId: remoteUserId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteUserId),
      displayName: displayName == null && nullToAbsent
          ? const Value.absent()
          : Value(displayName),
      createdAt: Value(createdAt),
      lastSeenAt: Value(lastSeenAt),
    );
  }

  factory LocalUserEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalUserEntry(
      id: serializer.fromJson<String>(json['id']),
      authType: serializer.fromJson<String>(json['authType']),
      email: serializer.fromJson<String?>(json['email']),
      remoteUserId: serializer.fromJson<String?>(json['remoteUserId']),
      displayName: serializer.fromJson<String?>(json['displayName']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      lastSeenAt: serializer.fromJson<DateTime>(json['lastSeenAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'authType': serializer.toJson<String>(authType),
      'email': serializer.toJson<String?>(email),
      'remoteUserId': serializer.toJson<String?>(remoteUserId),
      'displayName': serializer.toJson<String?>(displayName),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'lastSeenAt': serializer.toJson<DateTime>(lastSeenAt),
    };
  }

  LocalUserEntry copyWith(
          {String? id,
          String? authType,
          Value<String?> email = const Value.absent(),
          Value<String?> remoteUserId = const Value.absent(),
          Value<String?> displayName = const Value.absent(),
          DateTime? createdAt,
          DateTime? lastSeenAt}) =>
      LocalUserEntry(
        id: id ?? this.id,
        authType: authType ?? this.authType,
        email: email.present ? email.value : this.email,
        remoteUserId:
            remoteUserId.present ? remoteUserId.value : this.remoteUserId,
        displayName: displayName.present ? displayName.value : this.displayName,
        createdAt: createdAt ?? this.createdAt,
        lastSeenAt: lastSeenAt ?? this.lastSeenAt,
      );
  LocalUserEntry copyWithCompanion(LocalUsersCompanion data) {
    return LocalUserEntry(
      id: data.id.present ? data.id.value : this.id,
      authType: data.authType.present ? data.authType.value : this.authType,
      email: data.email.present ? data.email.value : this.email,
      remoteUserId: data.remoteUserId.present
          ? data.remoteUserId.value
          : this.remoteUserId,
      displayName:
          data.displayName.present ? data.displayName.value : this.displayName,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      lastSeenAt:
          data.lastSeenAt.present ? data.lastSeenAt.value : this.lastSeenAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalUserEntry(')
          ..write('id: $id, ')
          ..write('authType: $authType, ')
          ..write('email: $email, ')
          ..write('remoteUserId: $remoteUserId, ')
          ..write('displayName: $displayName, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastSeenAt: $lastSeenAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, authType, email, remoteUserId, displayName, createdAt, lastSeenAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalUserEntry &&
          other.id == this.id &&
          other.authType == this.authType &&
          other.email == this.email &&
          other.remoteUserId == this.remoteUserId &&
          other.displayName == this.displayName &&
          other.createdAt == this.createdAt &&
          other.lastSeenAt == this.lastSeenAt);
}

class LocalUsersCompanion extends UpdateCompanion<LocalUserEntry> {
  final Value<String> id;
  final Value<String> authType;
  final Value<String?> email;
  final Value<String?> remoteUserId;
  final Value<String?> displayName;
  final Value<DateTime> createdAt;
  final Value<DateTime> lastSeenAt;
  final Value<int> rowid;
  const LocalUsersCompanion({
    this.id = const Value.absent(),
    this.authType = const Value.absent(),
    this.email = const Value.absent(),
    this.remoteUserId = const Value.absent(),
    this.displayName = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastSeenAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalUsersCompanion.insert({
    required String id,
    required String authType,
    this.email = const Value.absent(),
    this.remoteUserId = const Value.absent(),
    this.displayName = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastSeenAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        authType = Value(authType);
  static Insertable<LocalUserEntry> custom({
    Expression<String>? id,
    Expression<String>? authType,
    Expression<String>? email,
    Expression<String>? remoteUserId,
    Expression<String>? displayName,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? lastSeenAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (authType != null) 'auth_type': authType,
      if (email != null) 'email': email,
      if (remoteUserId != null) 'remote_user_id': remoteUserId,
      if (displayName != null) 'display_name': displayName,
      if (createdAt != null) 'created_at': createdAt,
      if (lastSeenAt != null) 'last_seen_at': lastSeenAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalUsersCompanion copyWith(
      {Value<String>? id,
      Value<String>? authType,
      Value<String?>? email,
      Value<String?>? remoteUserId,
      Value<String?>? displayName,
      Value<DateTime>? createdAt,
      Value<DateTime>? lastSeenAt,
      Value<int>? rowid}) {
    return LocalUsersCompanion(
      id: id ?? this.id,
      authType: authType ?? this.authType,
      email: email ?? this.email,
      remoteUserId: remoteUserId ?? this.remoteUserId,
      displayName: displayName ?? this.displayName,
      createdAt: createdAt ?? this.createdAt,
      lastSeenAt: lastSeenAt ?? this.lastSeenAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (authType.present) {
      map['auth_type'] = Variable<String>(authType.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (remoteUserId.present) {
      map['remote_user_id'] = Variable<String>(remoteUserId.value);
    }
    if (displayName.present) {
      map['display_name'] = Variable<String>(displayName.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (lastSeenAt.present) {
      map['last_seen_at'] = Variable<DateTime>(lastSeenAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalUsersCompanion(')
          ..write('id: $id, ')
          ..write('authType: $authType, ')
          ..write('email: $email, ')
          ..write('remoteUserId: $remoteUserId, ')
          ..write('displayName: $displayName, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastSeenAt: $lastSeenAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $UserPreferencesTable extends UserPreferences
    with TableInfo<$UserPreferencesTable, UserPreferenceEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UserPreferencesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
      'user_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
      'key', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _valueMeta = const VerificationMeta('value');
  @override
  late final GeneratedColumn<String> value = GeneratedColumn<String>(
      'value', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [userId, key, value];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'user_preferences';
  @override
  VerificationContext validateIntegrity(
      Insertable<UserPreferenceEntry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('user_id')) {
      context.handle(_userIdMeta,
          userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta));
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('key')) {
      context.handle(
          _keyMeta, key.isAcceptableOrUnknown(data['key']!, _keyMeta));
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('value')) {
      context.handle(
          _valueMeta, value.isAcceptableOrUnknown(data['value']!, _valueMeta));
    } else if (isInserting) {
      context.missing(_valueMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {userId, key};
  @override
  UserPreferenceEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return UserPreferenceEntry(
      userId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}user_id'])!,
      key: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}key'])!,
      value: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}value'])!,
    );
  }

  @override
  $UserPreferencesTable createAlias(String alias) {
    return $UserPreferencesTable(attachedDatabase, alias);
  }
}

class UserPreferenceEntry extends DataClass
    implements Insertable<UserPreferenceEntry> {
  final String userId;
  final String key;
  final String value;
  const UserPreferenceEntry(
      {required this.userId, required this.key, required this.value});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['user_id'] = Variable<String>(userId);
    map['key'] = Variable<String>(key);
    map['value'] = Variable<String>(value);
    return map;
  }

  UserPreferencesCompanion toCompanion(bool nullToAbsent) {
    return UserPreferencesCompanion(
      userId: Value(userId),
      key: Value(key),
      value: Value(value),
    );
  }

  factory UserPreferenceEntry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return UserPreferenceEntry(
      userId: serializer.fromJson<String>(json['userId']),
      key: serializer.fromJson<String>(json['key']),
      value: serializer.fromJson<String>(json['value']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'userId': serializer.toJson<String>(userId),
      'key': serializer.toJson<String>(key),
      'value': serializer.toJson<String>(value),
    };
  }

  UserPreferenceEntry copyWith({String? userId, String? key, String? value}) =>
      UserPreferenceEntry(
        userId: userId ?? this.userId,
        key: key ?? this.key,
        value: value ?? this.value,
      );
  UserPreferenceEntry copyWithCompanion(UserPreferencesCompanion data) {
    return UserPreferenceEntry(
      userId: data.userId.present ? data.userId.value : this.userId,
      key: data.key.present ? data.key.value : this.key,
      value: data.value.present ? data.value.value : this.value,
    );
  }

  @override
  String toString() {
    return (StringBuffer('UserPreferenceEntry(')
          ..write('userId: $userId, ')
          ..write('key: $key, ')
          ..write('value: $value')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(userId, key, value);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is UserPreferenceEntry &&
          other.userId == this.userId &&
          other.key == this.key &&
          other.value == this.value);
}

class UserPreferencesCompanion extends UpdateCompanion<UserPreferenceEntry> {
  final Value<String> userId;
  final Value<String> key;
  final Value<String> value;
  final Value<int> rowid;
  const UserPreferencesCompanion({
    this.userId = const Value.absent(),
    this.key = const Value.absent(),
    this.value = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UserPreferencesCompanion.insert({
    required String userId,
    required String key,
    required String value,
    this.rowid = const Value.absent(),
  })  : userId = Value(userId),
        key = Value(key),
        value = Value(value);
  static Insertable<UserPreferenceEntry> custom({
    Expression<String>? userId,
    Expression<String>? key,
    Expression<String>? value,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (userId != null) 'user_id': userId,
      if (key != null) 'key': key,
      if (value != null) 'value': value,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UserPreferencesCompanion copyWith(
      {Value<String>? userId,
      Value<String>? key,
      Value<String>? value,
      Value<int>? rowid}) {
    return UserPreferencesCompanion(
      userId: userId ?? this.userId,
      key: key ?? this.key,
      value: value ?? this.value,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (value.present) {
      map['value'] = Variable<String>(value.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UserPreferencesCompanion(')
          ..write('userId: $userId, ')
          ..write('key: $key, ')
          ..write('value: $value, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $LocalBookmarksTable localBookmarks = $LocalBookmarksTable(this);
  late final $EventCategoriesTable eventCategories =
      $EventCategoriesTable(this);
  late final $UserEventsTable userEvents = $UserEventsTable(this);
  late final $FoodCourtMenusTable foodCourtMenus = $FoodCourtMenusTable(this);
  late final $LocalBibleBooksTable localBibleBooks =
      $LocalBibleBooksTable(this);
  late final $LocalBibleTranslationsTable localBibleTranslations =
      $LocalBibleTranslationsTable(this);
  late final $LocalBibleChaptersTable localBibleChapters =
      $LocalBibleChaptersTable(this);
  late final $LocalUsersTable localUsers = $LocalUsersTable(this);
  late final $UserPreferencesTable userPreferences =
      $UserPreferencesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        localBookmarks,
        eventCategories,
        userEvents,
        foodCourtMenus,
        localBibleBooks,
        localBibleTranslations,
        localBibleChapters,
        localUsers,
        userPreferences
      ];
}

typedef $$LocalBookmarksTableCreateCompanionBuilder = LocalBookmarksCompanion
    Function({
  required String id,
  required String bookId,
  required String bookName,
  required int chapter,
  required int verse,
  required String verseText,
  required String colorHex,
  Value<String?> customTitle,
  Value<String?> personalNote,
  Value<bool> isSynced,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$LocalBookmarksTableUpdateCompanionBuilder = LocalBookmarksCompanion
    Function({
  Value<String> id,
  Value<String> bookId,
  Value<String> bookName,
  Value<int> chapter,
  Value<int> verse,
  Value<String> verseText,
  Value<String> colorHex,
  Value<String?> customTitle,
  Value<String?> personalNote,
  Value<bool> isSynced,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$LocalBookmarksTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalBookmarksTable,
    LocalBookmarkEntry,
    $$LocalBookmarksTableFilterComposer,
    $$LocalBookmarksTableOrderingComposer,
    $$LocalBookmarksTableCreateCompanionBuilder,
    $$LocalBookmarksTableUpdateCompanionBuilder> {
  $$LocalBookmarksTableTableManager(
      _$AppDatabase db, $LocalBookmarksTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalBookmarksTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$LocalBookmarksTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> bookId = const Value.absent(),
            Value<String> bookName = const Value.absent(),
            Value<int> chapter = const Value.absent(),
            Value<int> verse = const Value.absent(),
            Value<String> verseText = const Value.absent(),
            Value<String> colorHex = const Value.absent(),
            Value<String?> customTitle = const Value.absent(),
            Value<String?> personalNote = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBookmarksCompanion(
            id: id,
            bookId: bookId,
            bookName: bookName,
            chapter: chapter,
            verse: verse,
            verseText: verseText,
            colorHex: colorHex,
            customTitle: customTitle,
            personalNote: personalNote,
            isSynced: isSynced,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String bookId,
            required String bookName,
            required int chapter,
            required int verse,
            required String verseText,
            required String colorHex,
            Value<String?> customTitle = const Value.absent(),
            Value<String?> personalNote = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBookmarksCompanion.insert(
            id: id,
            bookId: bookId,
            bookName: bookName,
            chapter: chapter,
            verse: verse,
            verseText: verseText,
            colorHex: colorHex,
            customTitle: customTitle,
            personalNote: personalNote,
            isSynced: isSynced,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalBookmarksTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalBookmarksTable> {
  $$LocalBookmarksTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get bookId => $state.composableBuilder(
      column: $state.table.bookId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get bookName => $state.composableBuilder(
      column: $state.table.bookName,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get chapter => $state.composableBuilder(
      column: $state.table.chapter,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get verse => $state.composableBuilder(
      column: $state.table.verse,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get verseText => $state.composableBuilder(
      column: $state.table.verseText,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get colorHex => $state.composableBuilder(
      column: $state.table.colorHex,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get customTitle => $state.composableBuilder(
      column: $state.table.customTitle,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get personalNote => $state.composableBuilder(
      column: $state.table.personalNote,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get isSynced => $state.composableBuilder(
      column: $state.table.isSynced,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalBookmarksTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalBookmarksTable> {
  $$LocalBookmarksTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get bookId => $state.composableBuilder(
      column: $state.table.bookId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get bookName => $state.composableBuilder(
      column: $state.table.bookName,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get chapter => $state.composableBuilder(
      column: $state.table.chapter,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get verse => $state.composableBuilder(
      column: $state.table.verse,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get verseText => $state.composableBuilder(
      column: $state.table.verseText,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get colorHex => $state.composableBuilder(
      column: $state.table.colorHex,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get customTitle => $state.composableBuilder(
      column: $state.table.customTitle,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get personalNote => $state.composableBuilder(
      column: $state.table.personalNote,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get isSynced => $state.composableBuilder(
      column: $state.table.isSynced,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$EventCategoriesTableCreateCompanionBuilder = EventCategoriesCompanion
    Function({
  required String id,
  required String name,
  required String colorHex,
  required String iconName,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$EventCategoriesTableUpdateCompanionBuilder = EventCategoriesCompanion
    Function({
  Value<String> id,
  Value<String> name,
  Value<String> colorHex,
  Value<String> iconName,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$EventCategoriesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $EventCategoriesTable,
    EventCategoryEntry,
    $$EventCategoriesTableFilterComposer,
    $$EventCategoriesTableOrderingComposer,
    $$EventCategoriesTableCreateCompanionBuilder,
    $$EventCategoriesTableUpdateCompanionBuilder> {
  $$EventCategoriesTableTableManager(
      _$AppDatabase db, $EventCategoriesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$EventCategoriesTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$EventCategoriesTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> colorHex = const Value.absent(),
            Value<String> iconName = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              EventCategoriesCompanion(
            id: id,
            name: name,
            colorHex: colorHex,
            iconName: iconName,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String name,
            required String colorHex,
            required String iconName,
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              EventCategoriesCompanion.insert(
            id: id,
            name: name,
            colorHex: colorHex,
            iconName: iconName,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$EventCategoriesTableFilterComposer
    extends FilterComposer<_$AppDatabase, $EventCategoriesTable> {
  $$EventCategoriesTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get colorHex => $state.composableBuilder(
      column: $state.table.colorHex,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get iconName => $state.composableBuilder(
      column: $state.table.iconName,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ComposableFilter userEventsRefs(
      ComposableFilter Function($$UserEventsTableFilterComposer f) f) {
    final $$UserEventsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $state.db.userEvents,
        getReferencedColumn: (t) => t.categoryId,
        builder: (joinBuilder, parentComposers) =>
            $$UserEventsTableFilterComposer(ComposerState($state.db,
                $state.db.userEvents, joinBuilder, parentComposers)));
    return f(composer);
  }
}

class $$EventCategoriesTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $EventCategoriesTable> {
  $$EventCategoriesTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get colorHex => $state.composableBuilder(
      column: $state.table.colorHex,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get iconName => $state.composableBuilder(
      column: $state.table.iconName,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$UserEventsTableCreateCompanionBuilder = UserEventsCompanion Function({
  required String id,
  required String categoryId,
  required String title,
  required String description,
  Value<String> linkedVersesJson,
  required DateTime eventDate,
  Value<bool> hasFoodService,
  Value<String?> foodServiceDetails,
  Value<bool> hasChildCare,
  Value<bool> hasBookSales,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$UserEventsTableUpdateCompanionBuilder = UserEventsCompanion Function({
  Value<String> id,
  Value<String> categoryId,
  Value<String> title,
  Value<String> description,
  Value<String> linkedVersesJson,
  Value<DateTime> eventDate,
  Value<bool> hasFoodService,
  Value<String?> foodServiceDetails,
  Value<bool> hasChildCare,
  Value<bool> hasBookSales,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$UserEventsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $UserEventsTable,
    UserEventEntry,
    $$UserEventsTableFilterComposer,
    $$UserEventsTableOrderingComposer,
    $$UserEventsTableCreateCompanionBuilder,
    $$UserEventsTableUpdateCompanionBuilder> {
  $$UserEventsTableTableManager(_$AppDatabase db, $UserEventsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$UserEventsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$UserEventsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> categoryId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> linkedVersesJson = const Value.absent(),
            Value<DateTime> eventDate = const Value.absent(),
            Value<bool> hasFoodService = const Value.absent(),
            Value<String?> foodServiceDetails = const Value.absent(),
            Value<bool> hasChildCare = const Value.absent(),
            Value<bool> hasBookSales = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UserEventsCompanion(
            id: id,
            categoryId: categoryId,
            title: title,
            description: description,
            linkedVersesJson: linkedVersesJson,
            eventDate: eventDate,
            hasFoodService: hasFoodService,
            foodServiceDetails: foodServiceDetails,
            hasChildCare: hasChildCare,
            hasBookSales: hasBookSales,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String categoryId,
            required String title,
            required String description,
            Value<String> linkedVersesJson = const Value.absent(),
            required DateTime eventDate,
            Value<bool> hasFoodService = const Value.absent(),
            Value<String?> foodServiceDetails = const Value.absent(),
            Value<bool> hasChildCare = const Value.absent(),
            Value<bool> hasBookSales = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UserEventsCompanion.insert(
            id: id,
            categoryId: categoryId,
            title: title,
            description: description,
            linkedVersesJson: linkedVersesJson,
            eventDate: eventDate,
            hasFoodService: hasFoodService,
            foodServiceDetails: foodServiceDetails,
            hasChildCare: hasChildCare,
            hasBookSales: hasBookSales,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$UserEventsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $UserEventsTable> {
  $$UserEventsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get title => $state.composableBuilder(
      column: $state.table.title,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get linkedVersesJson => $state.composableBuilder(
      column: $state.table.linkedVersesJson,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get eventDate => $state.composableBuilder(
      column: $state.table.eventDate,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get hasFoodService => $state.composableBuilder(
      column: $state.table.hasFoodService,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get foodServiceDetails => $state.composableBuilder(
      column: $state.table.foodServiceDetails,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get hasChildCare => $state.composableBuilder(
      column: $state.table.hasChildCare,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get hasBookSales => $state.composableBuilder(
      column: $state.table.hasBookSales,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  $$EventCategoriesTableFilterComposer get categoryId {
    final $$EventCategoriesTableFilterComposer composer =
        $state.composerBuilder(
            composer: this,
            getCurrentColumn: (t) => t.categoryId,
            referencedTable: $state.db.eventCategories,
            getReferencedColumn: (t) => t.id,
            builder: (joinBuilder, parentComposers) =>
                $$EventCategoriesTableFilterComposer(ComposerState($state.db,
                    $state.db.eventCategories, joinBuilder, parentComposers)));
    return composer;
  }
}

class $$UserEventsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $UserEventsTable> {
  $$UserEventsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get title => $state.composableBuilder(
      column: $state.table.title,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get linkedVersesJson => $state.composableBuilder(
      column: $state.table.linkedVersesJson,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get eventDate => $state.composableBuilder(
      column: $state.table.eventDate,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get hasFoodService => $state.composableBuilder(
      column: $state.table.hasFoodService,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get foodServiceDetails => $state.composableBuilder(
      column: $state.table.foodServiceDetails,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get hasChildCare => $state.composableBuilder(
      column: $state.table.hasChildCare,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get hasBookSales => $state.composableBuilder(
      column: $state.table.hasBookSales,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  $$EventCategoriesTableOrderingComposer get categoryId {
    final $$EventCategoriesTableOrderingComposer composer =
        $state.composerBuilder(
            composer: this,
            getCurrentColumn: (t) => t.categoryId,
            referencedTable: $state.db.eventCategories,
            getReferencedColumn: (t) => t.id,
            builder: (joinBuilder, parentComposers) =>
                $$EventCategoriesTableOrderingComposer(ComposerState($state.db,
                    $state.db.eventCategories, joinBuilder, parentComposers)));
    return composer;
  }
}

typedef $$FoodCourtMenusTableCreateCompanionBuilder = FoodCourtMenusCompanion
    Function({
  required String id,
  Value<String> churchId,
  required String title,
  required String description,
  required double price,
  required String shift,
  Value<bool> isAvailable,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$FoodCourtMenusTableUpdateCompanionBuilder = FoodCourtMenusCompanion
    Function({
  Value<String> id,
  Value<String> churchId,
  Value<String> title,
  Value<String> description,
  Value<double> price,
  Value<String> shift,
  Value<bool> isAvailable,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$FoodCourtMenusTableTableManager extends RootTableManager<
    _$AppDatabase,
    $FoodCourtMenusTable,
    FoodCourtMenuEntry,
    $$FoodCourtMenusTableFilterComposer,
    $$FoodCourtMenusTableOrderingComposer,
    $$FoodCourtMenusTableCreateCompanionBuilder,
    $$FoodCourtMenusTableUpdateCompanionBuilder> {
  $$FoodCourtMenusTableTableManager(
      _$AppDatabase db, $FoodCourtMenusTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$FoodCourtMenusTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$FoodCourtMenusTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> churchId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<double> price = const Value.absent(),
            Value<String> shift = const Value.absent(),
            Value<bool> isAvailable = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              FoodCourtMenusCompanion(
            id: id,
            churchId: churchId,
            title: title,
            description: description,
            price: price,
            shift: shift,
            isAvailable: isAvailable,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            Value<String> churchId = const Value.absent(),
            required String title,
            required String description,
            required double price,
            required String shift,
            Value<bool> isAvailable = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              FoodCourtMenusCompanion.insert(
            id: id,
            churchId: churchId,
            title: title,
            description: description,
            price: price,
            shift: shift,
            isAvailable: isAvailable,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$FoodCourtMenusTableFilterComposer
    extends FilterComposer<_$AppDatabase, $FoodCourtMenusTable> {
  $$FoodCourtMenusTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get churchId => $state.composableBuilder(
      column: $state.table.churchId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get title => $state.composableBuilder(
      column: $state.table.title,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get price => $state.composableBuilder(
      column: $state.table.price,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get shift => $state.composableBuilder(
      column: $state.table.shift,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get isAvailable => $state.composableBuilder(
      column: $state.table.isAvailable,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$FoodCourtMenusTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $FoodCourtMenusTable> {
  $$FoodCourtMenusTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get churchId => $state.composableBuilder(
      column: $state.table.churchId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get title => $state.composableBuilder(
      column: $state.table.title,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get price => $state.composableBuilder(
      column: $state.table.price,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get shift => $state.composableBuilder(
      column: $state.table.shift,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get isAvailable => $state.composableBuilder(
      column: $state.table.isAvailable,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$LocalBibleBooksTableCreateCompanionBuilder = LocalBibleBooksCompanion
    Function({
  required String id,
  required String translationKey,
  required int bookNumber,
  required String bookCode,
  required String name,
  required int totalChapters,
  Value<bool> isNewTestament,
  Value<String?> url,
  Value<String?> sha,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$LocalBibleBooksTableUpdateCompanionBuilder = LocalBibleBooksCompanion
    Function({
  Value<String> id,
  Value<String> translationKey,
  Value<int> bookNumber,
  Value<String> bookCode,
  Value<String> name,
  Value<int> totalChapters,
  Value<bool> isNewTestament,
  Value<String?> url,
  Value<String?> sha,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$LocalBibleBooksTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalBibleBooksTable,
    BibleBookEntry,
    $$LocalBibleBooksTableFilterComposer,
    $$LocalBibleBooksTableOrderingComposer,
    $$LocalBibleBooksTableCreateCompanionBuilder,
    $$LocalBibleBooksTableUpdateCompanionBuilder> {
  $$LocalBibleBooksTableTableManager(
      _$AppDatabase db, $LocalBibleBooksTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalBibleBooksTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$LocalBibleBooksTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> translationKey = const Value.absent(),
            Value<int> bookNumber = const Value.absent(),
            Value<String> bookCode = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<int> totalChapters = const Value.absent(),
            Value<bool> isNewTestament = const Value.absent(),
            Value<String?> url = const Value.absent(),
            Value<String?> sha = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBibleBooksCompanion(
            id: id,
            translationKey: translationKey,
            bookNumber: bookNumber,
            bookCode: bookCode,
            name: name,
            totalChapters: totalChapters,
            isNewTestament: isNewTestament,
            url: url,
            sha: sha,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String translationKey,
            required int bookNumber,
            required String bookCode,
            required String name,
            required int totalChapters,
            Value<bool> isNewTestament = const Value.absent(),
            Value<String?> url = const Value.absent(),
            Value<String?> sha = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBibleBooksCompanion.insert(
            id: id,
            translationKey: translationKey,
            bookNumber: bookNumber,
            bookCode: bookCode,
            name: name,
            totalChapters: totalChapters,
            isNewTestament: isNewTestament,
            url: url,
            sha: sha,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalBibleBooksTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalBibleBooksTable> {
  $$LocalBibleBooksTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get translationKey => $state.composableBuilder(
      column: $state.table.translationKey,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get bookNumber => $state.composableBuilder(
      column: $state.table.bookNumber,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get bookCode => $state.composableBuilder(
      column: $state.table.bookCode,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get totalChapters => $state.composableBuilder(
      column: $state.table.totalChapters,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get isNewTestament => $state.composableBuilder(
      column: $state.table.isNewTestament,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get url => $state.composableBuilder(
      column: $state.table.url,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get sha => $state.composableBuilder(
      column: $state.table.sha,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalBibleBooksTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalBibleBooksTable> {
  $$LocalBibleBooksTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get translationKey => $state.composableBuilder(
      column: $state.table.translationKey,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get bookNumber => $state.composableBuilder(
      column: $state.table.bookNumber,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get bookCode => $state.composableBuilder(
      column: $state.table.bookCode,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get totalChapters => $state.composableBuilder(
      column: $state.table.totalChapters,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get isNewTestament => $state.composableBuilder(
      column: $state.table.isNewTestament,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get url => $state.composableBuilder(
      column: $state.table.url,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get sha => $state.composableBuilder(
      column: $state.table.sha,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$LocalBibleTranslationsTableCreateCompanionBuilder
    = LocalBibleTranslationsCompanion Function({
  required String id,
  required String name,
  required String abbreviation,
  Value<String?> description,
  Value<String> language,
  Value<String> direction,
  Value<String?> distributionAbbreviation,
  Value<String?> url,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$LocalBibleTranslationsTableUpdateCompanionBuilder
    = LocalBibleTranslationsCompanion Function({
  Value<String> id,
  Value<String> name,
  Value<String> abbreviation,
  Value<String?> description,
  Value<String> language,
  Value<String> direction,
  Value<String?> distributionAbbreviation,
  Value<String?> url,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$LocalBibleTranslationsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalBibleTranslationsTable,
    BibleTranslationEntry,
    $$LocalBibleTranslationsTableFilterComposer,
    $$LocalBibleTranslationsTableOrderingComposer,
    $$LocalBibleTranslationsTableCreateCompanionBuilder,
    $$LocalBibleTranslationsTableUpdateCompanionBuilder> {
  $$LocalBibleTranslationsTableTableManager(
      _$AppDatabase db, $LocalBibleTranslationsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer: $$LocalBibleTranslationsTableFilterComposer(
              ComposerState(db, table)),
          orderingComposer: $$LocalBibleTranslationsTableOrderingComposer(
              ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> abbreviation = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String> language = const Value.absent(),
            Value<String> direction = const Value.absent(),
            Value<String?> distributionAbbreviation = const Value.absent(),
            Value<String?> url = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBibleTranslationsCompanion(
            id: id,
            name: name,
            abbreviation: abbreviation,
            description: description,
            language: language,
            direction: direction,
            distributionAbbreviation: distributionAbbreviation,
            url: url,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String name,
            required String abbreviation,
            Value<String?> description = const Value.absent(),
            Value<String> language = const Value.absent(),
            Value<String> direction = const Value.absent(),
            Value<String?> distributionAbbreviation = const Value.absent(),
            Value<String?> url = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBibleTranslationsCompanion.insert(
            id: id,
            name: name,
            abbreviation: abbreviation,
            description: description,
            language: language,
            direction: direction,
            distributionAbbreviation: distributionAbbreviation,
            url: url,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalBibleTranslationsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalBibleTranslationsTable> {
  $$LocalBibleTranslationsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get abbreviation => $state.composableBuilder(
      column: $state.table.abbreviation,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get language => $state.composableBuilder(
      column: $state.table.language,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get direction => $state.composableBuilder(
      column: $state.table.direction,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get distributionAbbreviation =>
      $state.composableBuilder(
          column: $state.table.distributionAbbreviation,
          builder: (column, joinBuilders) =>
              ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get url => $state.composableBuilder(
      column: $state.table.url,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalBibleTranslationsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalBibleTranslationsTable> {
  $$LocalBibleTranslationsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get abbreviation => $state.composableBuilder(
      column: $state.table.abbreviation,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get language => $state.composableBuilder(
      column: $state.table.language,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get direction => $state.composableBuilder(
      column: $state.table.direction,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get distributionAbbreviation =>
      $state.composableBuilder(
          column: $state.table.distributionAbbreviation,
          builder: (column, joinBuilders) =>
              ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get url => $state.composableBuilder(
      column: $state.table.url,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$LocalBibleChaptersTableCreateCompanionBuilder
    = LocalBibleChaptersCompanion Function({
  required String id,
  required String translationKey,
  required int bookNumber,
  required String bookCode,
  required String bookName,
  required int chapter,
  required String versesJson,
  Value<int> verseCount,
  Value<DateTime> createdAt,
  Value<int> rowid,
});
typedef $$LocalBibleChaptersTableUpdateCompanionBuilder
    = LocalBibleChaptersCompanion Function({
  Value<String> id,
  Value<String> translationKey,
  Value<int> bookNumber,
  Value<String> bookCode,
  Value<String> bookName,
  Value<int> chapter,
  Value<String> versesJson,
  Value<int> verseCount,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$LocalBibleChaptersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalBibleChaptersTable,
    BibleChapterEntry,
    $$LocalBibleChaptersTableFilterComposer,
    $$LocalBibleChaptersTableOrderingComposer,
    $$LocalBibleChaptersTableCreateCompanionBuilder,
    $$LocalBibleChaptersTableUpdateCompanionBuilder> {
  $$LocalBibleChaptersTableTableManager(
      _$AppDatabase db, $LocalBibleChaptersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalBibleChaptersTableFilterComposer(ComposerState(db, table)),
          orderingComposer: $$LocalBibleChaptersTableOrderingComposer(
              ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> translationKey = const Value.absent(),
            Value<int> bookNumber = const Value.absent(),
            Value<String> bookCode = const Value.absent(),
            Value<String> bookName = const Value.absent(),
            Value<int> chapter = const Value.absent(),
            Value<String> versesJson = const Value.absent(),
            Value<int> verseCount = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBibleChaptersCompanion(
            id: id,
            translationKey: translationKey,
            bookNumber: bookNumber,
            bookCode: bookCode,
            bookName: bookName,
            chapter: chapter,
            versesJson: versesJson,
            verseCount: verseCount,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String translationKey,
            required int bookNumber,
            required String bookCode,
            required String bookName,
            required int chapter,
            required String versesJson,
            Value<int> verseCount = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalBibleChaptersCompanion.insert(
            id: id,
            translationKey: translationKey,
            bookNumber: bookNumber,
            bookCode: bookCode,
            bookName: bookName,
            chapter: chapter,
            versesJson: versesJson,
            verseCount: verseCount,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalBibleChaptersTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalBibleChaptersTable> {
  $$LocalBibleChaptersTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get translationKey => $state.composableBuilder(
      column: $state.table.translationKey,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get bookNumber => $state.composableBuilder(
      column: $state.table.bookNumber,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get bookCode => $state.composableBuilder(
      column: $state.table.bookCode,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get bookName => $state.composableBuilder(
      column: $state.table.bookName,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get chapter => $state.composableBuilder(
      column: $state.table.chapter,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get versesJson => $state.composableBuilder(
      column: $state.table.versesJson,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get verseCount => $state.composableBuilder(
      column: $state.table.verseCount,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalBibleChaptersTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalBibleChaptersTable> {
  $$LocalBibleChaptersTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get translationKey => $state.composableBuilder(
      column: $state.table.translationKey,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get bookNumber => $state.composableBuilder(
      column: $state.table.bookNumber,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get bookCode => $state.composableBuilder(
      column: $state.table.bookCode,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get bookName => $state.composableBuilder(
      column: $state.table.bookName,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get chapter => $state.composableBuilder(
      column: $state.table.chapter,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get versesJson => $state.composableBuilder(
      column: $state.table.versesJson,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get verseCount => $state.composableBuilder(
      column: $state.table.verseCount,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$LocalUsersTableCreateCompanionBuilder = LocalUsersCompanion Function({
  required String id,
  required String authType,
  Value<String?> email,
  Value<String?> remoteUserId,
  Value<String?> displayName,
  Value<DateTime> createdAt,
  Value<DateTime> lastSeenAt,
  Value<int> rowid,
});
typedef $$LocalUsersTableUpdateCompanionBuilder = LocalUsersCompanion Function({
  Value<String> id,
  Value<String> authType,
  Value<String?> email,
  Value<String?> remoteUserId,
  Value<String?> displayName,
  Value<DateTime> createdAt,
  Value<DateTime> lastSeenAt,
  Value<int> rowid,
});

class $$LocalUsersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalUsersTable,
    LocalUserEntry,
    $$LocalUsersTableFilterComposer,
    $$LocalUsersTableOrderingComposer,
    $$LocalUsersTableCreateCompanionBuilder,
    $$LocalUsersTableUpdateCompanionBuilder> {
  $$LocalUsersTableTableManager(_$AppDatabase db, $LocalUsersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalUsersTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$LocalUsersTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> authType = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<String?> remoteUserId = const Value.absent(),
            Value<String?> displayName = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> lastSeenAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalUsersCompanion(
            id: id,
            authType: authType,
            email: email,
            remoteUserId: remoteUserId,
            displayName: displayName,
            createdAt: createdAt,
            lastSeenAt: lastSeenAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String authType,
            Value<String?> email = const Value.absent(),
            Value<String?> remoteUserId = const Value.absent(),
            Value<String?> displayName = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> lastSeenAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalUsersCompanion.insert(
            id: id,
            authType: authType,
            email: email,
            remoteUserId: remoteUserId,
            displayName: displayName,
            createdAt: createdAt,
            lastSeenAt: lastSeenAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalUsersTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalUsersTable> {
  $$LocalUsersTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get authType => $state.composableBuilder(
      column: $state.table.authType,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get email => $state.composableBuilder(
      column: $state.table.email,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get remoteUserId => $state.composableBuilder(
      column: $state.table.remoteUserId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get displayName => $state.composableBuilder(
      column: $state.table.displayName,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get lastSeenAt => $state.composableBuilder(
      column: $state.table.lastSeenAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalUsersTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalUsersTable> {
  $$LocalUsersTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get authType => $state.composableBuilder(
      column: $state.table.authType,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get email => $state.composableBuilder(
      column: $state.table.email,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get remoteUserId => $state.composableBuilder(
      column: $state.table.remoteUserId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get displayName => $state.composableBuilder(
      column: $state.table.displayName,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get lastSeenAt => $state.composableBuilder(
      column: $state.table.lastSeenAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$UserPreferencesTableCreateCompanionBuilder = UserPreferencesCompanion
    Function({
  required String userId,
  required String key,
  required String value,
  Value<int> rowid,
});
typedef $$UserPreferencesTableUpdateCompanionBuilder = UserPreferencesCompanion
    Function({
  Value<String> userId,
  Value<String> key,
  Value<String> value,
  Value<int> rowid,
});

class $$UserPreferencesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $UserPreferencesTable,
    UserPreferenceEntry,
    $$UserPreferencesTableFilterComposer,
    $$UserPreferencesTableOrderingComposer,
    $$UserPreferencesTableCreateCompanionBuilder,
    $$UserPreferencesTableUpdateCompanionBuilder> {
  $$UserPreferencesTableTableManager(
      _$AppDatabase db, $UserPreferencesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$UserPreferencesTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$UserPreferencesTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> userId = const Value.absent(),
            Value<String> key = const Value.absent(),
            Value<String> value = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UserPreferencesCompanion(
            userId: userId,
            key: key,
            value: value,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String userId,
            required String key,
            required String value,
            Value<int> rowid = const Value.absent(),
          }) =>
              UserPreferencesCompanion.insert(
            userId: userId,
            key: key,
            value: value,
            rowid: rowid,
          ),
        ));
}

class $$UserPreferencesTableFilterComposer
    extends FilterComposer<_$AppDatabase, $UserPreferencesTable> {
  $$UserPreferencesTableFilterComposer(super.$state);
  ColumnFilters<String> get userId => $state.composableBuilder(
      column: $state.table.userId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get key => $state.composableBuilder(
      column: $state.table.key,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get value => $state.composableBuilder(
      column: $state.table.value,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$UserPreferencesTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $UserPreferencesTable> {
  $$UserPreferencesTableOrderingComposer(super.$state);
  ColumnOrderings<String> get userId => $state.composableBuilder(
      column: $state.table.userId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get key => $state.composableBuilder(
      column: $state.table.key,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get value => $state.composableBuilder(
      column: $state.table.value,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$LocalBookmarksTableTableManager get localBookmarks =>
      $$LocalBookmarksTableTableManager(_db, _db.localBookmarks);
  $$EventCategoriesTableTableManager get eventCategories =>
      $$EventCategoriesTableTableManager(_db, _db.eventCategories);
  $$UserEventsTableTableManager get userEvents =>
      $$UserEventsTableTableManager(_db, _db.userEvents);
  $$FoodCourtMenusTableTableManager get foodCourtMenus =>
      $$FoodCourtMenusTableTableManager(_db, _db.foodCourtMenus);
  $$LocalBibleBooksTableTableManager get localBibleBooks =>
      $$LocalBibleBooksTableTableManager(_db, _db.localBibleBooks);
  $$LocalBibleTranslationsTableTableManager get localBibleTranslations =>
      $$LocalBibleTranslationsTableTableManager(
          _db, _db.localBibleTranslations);
  $$LocalBibleChaptersTableTableManager get localBibleChapters =>
      $$LocalBibleChaptersTableTableManager(_db, _db.localBibleChapters);
  $$LocalUsersTableTableManager get localUsers =>
      $$LocalUsersTableTableManager(_db, _db.localUsers);
  $$UserPreferencesTableTableManager get userPreferences =>
      $$UserPreferencesTableTableManager(_db, _db.userPreferences);
}
