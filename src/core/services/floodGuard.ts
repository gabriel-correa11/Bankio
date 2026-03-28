import { UserProgress, QuizCategory, FloodCheckResult } from '../models/quiz';

const COOLDOWN_MS = 30_000;
export const DAILY_XP_CAP = 500;
const DAILY_CATEGORY_LIMIT = 3;

export function checkFloodGuard(
  progress: UserProgress,
  category: QuizCategory,
  nowMs: number = Date.now()
): FloodCheckResult {
  const today = new Date(nowMs).toISOString().split('T')[0];

  const msSinceLast = nowMs - (progress.lastQuizCompletedAt ?? 0);
  if (msSinceLast < COOLDOWN_MS) {
    return {
      blocked: true,
      reason: 'cooldown',
      cooldownSecondsLeft: Math.ceil((COOLDOWN_MS - msSinceLast) / 1000),
    };
  }

  const effectiveDailyXP = progress.dailyXPDate === today ? (progress.dailyXP ?? 0) : 0;
  if (effectiveDailyXP >= DAILY_XP_CAP) {
    return { blocked: true, reason: 'dailyXPCap' };
  }

  const effectiveCategoryCount =
    progress.dailyQuizzesDate === today
      ? (progress.dailyQuizzesByCategory?.[category] ?? 0)
      : 0;
  if (effectiveCategoryCount >= DAILY_CATEGORY_LIMIT) {
    return { blocked: true, reason: 'categoryDailyLimit' };
  }

  return { blocked: false, reason: null };
}
