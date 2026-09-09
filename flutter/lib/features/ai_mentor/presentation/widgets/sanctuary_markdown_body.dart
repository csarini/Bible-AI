import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/sanctuary_colors.dart';

/// Renders Theological AI Mentor Markdown text with clean typography,
/// hierarchical headings, styled scripture quotes, and robust inline formatting.
class SanctuaryMarkdownBody extends StatelessWidget {
  final String data;
  final bool isUser;
  final Color? textColor;
  final Color? boldColor;

  const SanctuaryMarkdownBody({
    super.key,
    required this.data,
    this.isUser = false,
    this.textColor,
    this.boldColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveTextColor =
        textColor ?? (isUser ? Colors.white : theme.colorScheme.onSurface);
    final effectiveBoldColor = boldColor ??
        (isUser
            ? Colors.white
            : (theme.brightness == Brightness.dark
                ? SanctuaryColors.amberGold
                : SanctuaryColors.waveNavy));

    if (isUser) {
      return SelectableText(
        data,
        style: GoogleFonts.inter(
          fontSize: 13.5,
          height: 1.5,
          color: effectiveTextColor,
        ),
      );
    }

    final blocks = _parseBlocks(data);

    return SelectionArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: blocks.map((block) {
          return _buildBlockWidget(
            context: context,
            block: block,
            textColor: effectiveTextColor,
            boldColor: effectiveBoldColor,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBlockWidget({
    required BuildContext context,
    required _MarkdownBlock block,
    required Color textColor,
    required Color boldColor,
  }) {
    switch (block.type) {
      case _BlockType.h1:
        return Padding(
          padding: const EdgeInsets.only(top: 8, bottom: 4),
          child: SelectableText(
            block.rawText,
            style: GoogleFonts.cinzel(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: boldColor,
            ),
          ),
        );
      case _BlockType.h2:
        return Padding(
          padding: const EdgeInsets.only(top: 7, bottom: 4),
          child: SelectableText(
            block.rawText,
            style: GoogleFonts.cinzel(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: boldColor,
            ),
          ),
        );
      case _BlockType.h3:
        return Padding(
          padding: const EdgeInsets.only(top: 6, bottom: 3),
          child: SelectableText(
            block.rawText,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: boldColor,
            ),
          ),
        );
      case _BlockType.blockquote:
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 5),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: boldColor.withValues(alpha: 0.06),
            borderRadius: const BorderRadius.horizontal(
              right: Radius.circular(8),
            ),
            border: const Border(
              left: BorderSide(
                color: SanctuaryColors.sunOrange,
                width: 3.5,
              ),
            ),
          ),
          child: RichText(
            text: TextSpan(
              style: GoogleFonts.inter(
                fontSize: 13,
                fontStyle: FontStyle.italic,
                height: 1.45,
                color: textColor.withValues(alpha: 0.9),
              ),
              children: _parseInlineSpans(
                text: block.rawText,
                baseColor: textColor.withValues(alpha: 0.9),
                boldColor: boldColor,
              ),
            ),
          ),
        );
      case _BlockType.bullet:
        return Padding(
          padding: const EdgeInsets.only(bottom: 4, left: 2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 6, right: 8),
                child: Container(
                  width: 5,
                  height: 5,
                  decoration: const BoxDecoration(
                    color: SanctuaryColors.sunOrange,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      height: 1.5,
                      color: textColor,
                    ),
                    children: _parseInlineSpans(
                      text: block.rawText,
                      baseColor: textColor,
                      boldColor: boldColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      case _BlockType.numbered:
        return Padding(
          padding: const EdgeInsets.only(bottom: 4, left: 2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 22,
                child: Text(
                  '${block.prefix ?? "•"} ',
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: SanctuaryColors.waveNavy,
                  ),
                ),
              ),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      height: 1.5,
                      color: textColor,
                    ),
                    children: _parseInlineSpans(
                      text: block.rawText,
                      baseColor: textColor,
                      boldColor: boldColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      case _BlockType.paragraph:
        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: RichText(
            text: TextSpan(
              style: GoogleFonts.inter(
                fontSize: 13.5,
                height: 1.55,
                color: textColor,
              ),
              children: _parseInlineSpans(
                text: block.rawText,
                baseColor: textColor,
                boldColor: boldColor,
              ),
            ),
          ),
        );
    }
  }

  List<_MarkdownBlock> _parseBlocks(String raw) {
    final lines = raw.split('\n');
    final List<_MarkdownBlock> blocks = [];

    for (var i = 0; i < lines.length; i++) {
      final line = lines[i].trim();
      if (line.isEmpty) continue;

      if (line.startsWith('### ')) {
        blocks.add(_MarkdownBlock(
          type: _BlockType.h3,
          rawText: line.substring(4).trim(),
        ));
      } else if (line.startsWith('## ')) {
        blocks.add(_MarkdownBlock(
          type: _BlockType.h2,
          rawText: line.substring(3).trim(),
        ));
      } else if (line.startsWith('# ')) {
        blocks.add(_MarkdownBlock(
          type: _BlockType.h1,
          rawText: line.substring(2).trim(),
        ));
      } else if (line.startsWith('> ')) {
        blocks.add(_MarkdownBlock(
          type: _BlockType.blockquote,
          rawText: line.substring(2).trim(),
        ));
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        blocks.add(_MarkdownBlock(
          type: _BlockType.bullet,
          rawText: line.substring(2).trim(),
        ));
      } else {
        // Check for numbered list e.g. "1. "
        final numMatch = RegExp(r'^(\d+[\.\)])\s+(.*)$').firstMatch(line);
        if (numMatch != null) {
          blocks.add(_MarkdownBlock(
            type: _BlockType.numbered,
            prefix: numMatch.group(1),
            rawText: numMatch.group(2) ?? '',
          ));
        } else {
          blocks.add(_MarkdownBlock(
            type: _BlockType.paragraph,
            rawText: line,
          ));
        }
      }
    }

    return blocks;
  }

  /// Parses inline markdown elements like **bold**, *italic*, ***bold-italic***, and `code`.
  List<InlineSpan> _parseInlineSpans({
    required String text,
    required Color baseColor,
    required Color boldColor,
  }) {
    final List<InlineSpan> spans = [];
    final pattern = RegExp(r'(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)');
    int lastEnd = 0;

    for (final match in pattern.allMatches(text)) {
      if (match.start > lastEnd) {
        spans.add(TextSpan(
          text: text.substring(lastEnd, match.start),
          style: TextStyle(color: baseColor),
        ));
      }

      final matchedStr = match.group(0)!;
      if (matchedStr.startsWith('***') && matchedStr.endsWith('***')) {
        final content = matchedStr.substring(3, matchedStr.length - 3);
        spans.add(TextSpan(
          text: content,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontStyle: FontStyle.italic,
            color: boldColor,
          ),
        ));
      } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
        final content = matchedStr.substring(2, matchedStr.length - 2);
        spans.add(TextSpan(
          text: content,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: boldColor,
          ),
        ));
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        final content = matchedStr.substring(1, matchedStr.length - 1);
        spans.add(TextSpan(
          text: content,
          style: TextStyle(
            fontStyle: FontStyle.italic,
            color: baseColor,
          ),
        ));
      } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
        final content = matchedStr.substring(1, matchedStr.length - 1);
        spans.add(WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: boldColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              content,
              style: GoogleFonts.robotoMono(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: boldColor,
              ),
            ),
          ),
        ));
      }

      lastEnd = match.end;
    }

    if (lastEnd < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastEnd),
        style: TextStyle(color: baseColor),
      ));
    }

    return spans;
  }
}

enum _BlockType {
  h1,
  h2,
  h3,
  blockquote,
  bullet,
  numbered,
  paragraph,
}

class _MarkdownBlock {
  final _BlockType type;
  final String rawText;
  final String? prefix;

  _MarkdownBlock({
    required this.type,
    required this.rawText,
    this.prefix,
  });
}
