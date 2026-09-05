import 'package:in_app_review/in_app_review.dart';

import 'debug_log_service.dart';

/// Requests a native review only after a meaningful positive interaction.
class RatingService {
  RatingService({
    InAppReview? review,
    DebugLogService? logger,
  })  : _review = review ?? InAppReview.instance,
        _logger = logger ?? DebugLogService.instance;

  final InAppReview _review;
  final DebugLogService _logger;
  int _positiveInteractions = 0;
  bool _hasRequestedReview = false;

  Future<bool> recordPositiveInteraction() async {
    _positiveInteractions++;
    if (_hasRequestedReview || _positiveInteractions < 5) return false;

    try {
      if (!await _review.isAvailable()) return false;
      await _review.requestReview();
      _hasRequestedReview = true;
      return true;
    } catch (error, stackTrace) {
      _logger.warning(
        'Native review request failed',
        error: error,
        stackTrace: stackTrace,
      );
      return false;
    }
  }
}
