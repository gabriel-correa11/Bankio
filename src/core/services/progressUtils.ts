import { UserProgress, DailyQuizzesByCategory } from '../models/quiz';

export function calcLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

export function calcStreak(lastPlayedDate: string, currentStreak: number): number {
  const today = new Date().toISOString().split('T')[0];
  if (lastPlayedDate === today) return currentStreak;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastPlayedDate === yesterday) return currentStreak + 1;
  return 1;
}

export function emptyDailyQuizzes(): DailyQuizzesByCategory {
  return { poupanca: 0, investimentos: 0, credito: 0, orcamento: 0 };
}

export function defaultProgress(uid: string, displayName: string): UserProgress {
  return {
    uid,
    displayName,
    totalXP: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: '',
    completedQuizzes: 0,
    categoryStats: {
      poupanca: { played: 0, correct: 0 },
      investimentos: { played: 0, correct: 0 },
      credito: { played: 0, correct: 0 },
      orcamento: { played: 0, correct: 0 },
    },
    lastQuizCompletedAt: 0,
    dailyXP: 0,
    dailyXPDate: '',
    dailyQuizzesByCategory: emptyDailyQuizzes(),
    dailyQuizzesDate: '',
  };
}
