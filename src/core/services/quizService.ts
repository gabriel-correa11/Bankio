import {
  doc, getDoc, setDoc, writeBatch,
  collection, query, orderBy, limit, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Question, QuizCategory, UserProgress, LeaderboardEntry, QuizSessionResult } from '../models/quiz';
import { AchievementId } from '../models/achievement';
import { QUESTIONS } from '../../data/questions';
import { calcLevel, calcStreak, emptyDailyQuizzes, defaultProgress } from './progressUtils';
import { checkFloodGuard, DAILY_XP_CAP } from './floodGuard';
import { checkNewAchievements, mergeAchievements } from './achievementService';

export { calcLevel, calcStreak } from './progressUtils';
export { checkFloodGuard } from './floodGuard';

export interface QuizSaveResult {
  progress: UserProgress;
  newAchievements: AchievementId[];
  leveledUp: boolean;
  previousLevel: number;
  effectiveXP: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getQuestionsForCategory(category: QuizCategory, count = 10): Question[] {
  const filtered = QUESTIONS.filter((q) => q.category === category);
  return shuffleArray(filtered).slice(0, count).map((q) => {
    const indices = shuffleArray([0, 1, 2, 3]);
    return {
      ...q,
      options: indices.map((i) => q.options[i]),
      correctIndex: indices.indexOf(q.correctIndex),
    };
  });
}

export async function getUserProgress(uid: string, displayName = ''): Promise<UserProgress> {
  const ref = doc(db, 'userProgress', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as UserProgress;
    return {
      ...data,
      lastQuizCompletedAt: data.lastQuizCompletedAt ?? 0,
      dailyXP: data.dailyXP ?? 0,
      dailyXPDate: data.dailyXPDate ?? '',
      dailyQuizzesByCategory: data.dailyQuizzesByCategory ?? emptyDailyQuizzes(),
      dailyQuizzesDate: data.dailyQuizzesDate ?? '',
      unlockedAchievements: data.unlockedAchievements ?? [],
      categoryQuizCounts: data.categoryQuizCounts ?? {
        poupanca: 0, investimentos: 0, credito: 0, orcamento: 0,
      },
    };
  }
  const progress = defaultProgress(uid, displayName);
  await setDoc(ref, { ...progress, updatedAt: serverTimestamp() });
  return progress;
}

/**
 * Pure local computation — no network.
 * Calculates the new UserProgress and achievements from a completed quiz.
 */
export function computeQuizSave(
  current: UserProgress,
  result: QuizSessionResult,
  nowMs: number = Date.now(),
): QuizSaveResult {
  const today = new Date(nowMs).toISOString().split('T')[0];

  const isNewDailyXPDay = current.dailyXPDate !== today;
  const isNewDailyQuizDay = current.dailyQuizzesDate !== today;

  const prevCategoryQuizCounts = current.categoryQuizCounts ?? {
    poupanca: 0, investimentos: 0, credito: 0, orcamento: 0,
  };
  const isFirstCompletion = (prevCategoryQuizCounts[result.category] ?? 0) === 0;
  const baseXP = isFirstCompletion ? result.xpEarned : Math.floor(result.xpEarned / 2);

  const prevDailyXP = isNewDailyXPDay ? 0 : (current.dailyXP ?? 0);
  const prevCategoryCount = isNewDailyQuizDay
    ? 0
    : (current.dailyQuizzesByCategory?.[result.category] ?? 0);

  const allowedXP = Math.max(0, DAILY_XP_CAP - prevDailyXP);
  const effectiveXP = Math.min(baseXP, allowedXP);
  const newXP = current.totalXP + effectiveXP;
  const oldLevel = current.level;
  const newLevel = calcLevel(newXP);

  const catStats = current.categoryStats[result.category];
  const prevDailyQuizzes = isNewDailyQuizDay
    ? emptyDailyQuizzes()
    : (current.dailyQuizzesByCategory ?? emptyDailyQuizzes());

  const newCategoryQuizCounts = {
    ...prevCategoryQuizCounts,
    [result.category]: (prevCategoryQuizCounts[result.category] ?? 0) + 1,
  };

  const updated: UserProgress = {
    ...current,
    totalXP: newXP,
    level: newLevel,
    streak: calcStreak(current.lastPlayedDate, current.streak),
    lastPlayedDate: today,
    completedQuizzes: current.completedQuizzes + 1,
    categoryStats: {
      ...current.categoryStats,
      [result.category]: {
        played: catStats.played + result.totalQuestions,
        correct: catStats.correct + result.correctAnswers,
      },
    },
    lastQuizCompletedAt: nowMs,
    dailyXP: prevDailyXP + effectiveXP,
    dailyXPDate: today,
    dailyQuizzesByCategory: { ...prevDailyQuizzes, [result.category]: prevCategoryCount + 1 },
    dailyQuizzesDate: today,
    categoryQuizCounts: newCategoryQuizCounts,
    unlockedAchievements: current.unlockedAchievements ?? [],
  };

  const newAchievements = checkNewAchievements(current, updated, result);
  updated.unlockedAchievements = mergeAchievements(
    current.unlockedAchievements ?? [],
    newAchievements,
  );

  return {
    progress: updated,
    newAchievements,
    leveledUp: newLevel > oldLevel,
    previousLevel: oldLevel,
    effectiveXP,
  };
}

/**
 * Persists the already-computed progress to Firestore.
 * Called in background — callers should not await this for UX purposes.
 */
export async function persistQuizProgress(
  uid: string,
  displayName: string,
  updated: UserProgress,
): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, 'userProgress', uid), { ...updated, updatedAt: serverTimestamp() });
  batch.set(doc(db, 'leaderboard', uid), {
    uid,
    displayName,
    totalXP: updated.totalXP,
    level: updated.level,
    streak: updated.streak,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('totalXP', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}
