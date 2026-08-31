/**
 * Mentor IA Quota Service
 * Manages daily query limits (2 queries per day) with automatic midnight reset.
 * Avoids excessive AI API costs while in test mode (Modo Prueba).
 */

const STORAGE_KEY = 'el_shaddai_mentor_daily_quota_v1';
export const MENTOR_DAILY_LIMIT = 2;

export interface MentorQuotaInfo {
  used: number;
  remaining: number;
  limit: number;
  canQuery: boolean;
  date: string;
  formattedResetTime: string;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMentorQuota(): MentorQuotaInfo {
  const today = getTodayDateString();
  let used = 0;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === today) {
        used = typeof parsed.used === 'number' ? Math.max(0, parsed.used) : 0;
      } else {
        // Different day - reset automatically
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: 0 }));
        used = 0;
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: 0 }));
    }
  } catch (error) {
    console.warn('[MentorQuotaService] Error reading quota from localStorage:', error);
  }

  const remaining = Math.max(0, MENTOR_DAILY_LIMIT - used);
  const canQuery = used < MENTOR_DAILY_LIMIT;

  return {
    used,
    remaining,
    limit: MENTOR_DAILY_LIMIT,
    canQuery,
    date: today,
    formattedResetTime: '00:00 hs (medianoche)'
  };
}

export function consumeMentorQuery(): MentorQuotaInfo {
  const current = getMentorQuota();
  if (!current.canQuery) {
    return current;
  }

  const newUsed = current.used + 1;
  const today = getTodayDateString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: newUsed }));
  } catch (error) {
    console.warn('[MentorQuotaService] Error updating quota:', error);
  }

  // Notify any active components across tabs or views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mentor-quota-updated', {
      detail: { used: newUsed, remaining: Math.max(0, MENTOR_DAILY_LIMIT - newUsed) }
    }));
  }

  return {
    used: newUsed,
    remaining: Math.max(0, MENTOR_DAILY_LIMIT - newUsed),
    limit: MENTOR_DAILY_LIMIT,
    canQuery: newUsed < MENTOR_DAILY_LIMIT,
    date: today,
    formattedResetTime: '00:00 hs (medianoche)'
  };
}
