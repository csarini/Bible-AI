/**
 * Mentor IA Quota Service
 * Manages query limits (2 queries) that reset 24 hours after the last query.
 * Persists in local storage so closing and reopening the app retains the counter.
 * Avoids excessive AI API costs while in test mode (Modo Prueba).
 */

const STORAGE_KEY = 'el_shaddai_mentor_daily_quota_v1';
export const MENTOR_DAILY_LIMIT = 2;
export const RESET_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface MentorQuotaInfo {
  used: number;
  remaining: number;
  limit: number;
  canQuery: boolean;
  lastQueryTime: number | null;
  resetTimestamp: number | null;
  formattedResetTime: string;
  timeRemainingText: string;
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'menos de 1 minuto';
  const totalMinutes = Math.ceil(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

export function getMentorQuota(): MentorQuotaInfo {
  const now = Date.now();
  let used = 0;
  let lastQueryTime: number | null = null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lastQueryTime === 'number') {
        const elapsed = now - parsed.lastQueryTime;
        if (elapsed >= RESET_WINDOW_MS) {
          // 24 hours have passed since the last query - reset
          used = 0;
          lastQueryTime = null;
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ used: 0, lastQueryTime: null }));
        } else {
          used = typeof parsed.used === 'number' ? Math.max(0, parsed.used) : 0;
          lastQueryTime = parsed.lastQueryTime;
        }
      } else if (parsed && typeof parsed.used === 'number') {
        // Migration from old date format: if used without timestamp, reset now
        used = 0;
        lastQueryTime = null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ used: 0, lastQueryTime: null }));
      }
    }
  } catch (error) {
    console.warn('[MentorQuotaService] Error reading quota from localStorage:', error);
  }

  const remaining = Math.max(0, MENTOR_DAILY_LIMIT - used);
  const canQuery = used < MENTOR_DAILY_LIMIT;

  let resetTimestamp: number | null = null;
  let formattedResetTime = '24 hs tras tu última consulta';
  let timeRemainingText = '';

  if (lastQueryTime && used > 0) {
    resetTimestamp = lastQueryTime + RESET_WINDOW_MS;
    const remainingMs = resetTimestamp - now;
    if (remainingMs > 0) {
      timeRemainingText = formatTimeRemaining(remainingMs);
      formattedResetTime = `dentro de 24 hs (restante: ${timeRemainingText})`;
    }
  }

  return {
    used,
    remaining,
    limit: MENTOR_DAILY_LIMIT,
    canQuery,
    lastQueryTime,
    resetTimestamp,
    formattedResetTime,
    timeRemainingText
  };
}

export function consumeMentorQuery(): MentorQuotaInfo {
  const now = Date.now();
  const current = getMentorQuota();
  if (!current.canQuery) {
    return current;
  }

  const newUsed = current.used + 1;
  const lastQueryTime = now;
  const resetTimestamp = lastQueryTime + RESET_WINDOW_MS;
  const remainingMs = resetTimestamp - now;
  const timeRemainingText = formatTimeRemaining(remainingMs);
  const formattedResetTime = `dentro de 24 hs (restante: ${timeRemainingText})`;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ used: newUsed, lastQueryTime })
    );
  } catch (error) {
    console.warn('[MentorQuotaService] Error updating quota:', error);
  }

  const newQuota: MentorQuotaInfo = {
    used: newUsed,
    remaining: Math.max(0, MENTOR_DAILY_LIMIT - newUsed),
    limit: MENTOR_DAILY_LIMIT,
    canQuery: newUsed < MENTOR_DAILY_LIMIT,
    lastQueryTime,
    resetTimestamp,
    formattedResetTime,
    timeRemainingText
  };

  // Notify any active components across tabs or views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mentor-quota-updated', {
      detail: newQuota
    }));
  }

  return newQuota;
}

