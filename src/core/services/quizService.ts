import {
  doc, getDoc, setDoc, writeBatch,
  collection, query, orderBy, limit, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Question, QuizCategory, UserProgress, LeaderboardEntry, QuizSessionResult } from '../models/quiz';
import { QUESTIONS } from '../../data/questions';
import { calcLevel, calcStreak, emptyDailyQuizzes, defaultProgress } from './progressUtils';
import { checkFloodGuard, DAILY_XP_CAP } from './floodGuard';

export { calcLevel, calcStreak } from './progressUtils';
export { checkFloodGuard } from './floodGuard';

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
  return shuffleArray(filtered).slice(0, count);
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
    };
  }
  const progress = defaultProgress(uid, displayName);
  await setDoc(ref, { ...progress, updatedAt: serverTimestamp() });
  return progress;
}

export async function saveQuizResult(
  uid: string,
  result: QuizSessionResult,
  displayName: string,
  nowMs: number = Date.now()
): Promise<UserProgress> {
  const current = await getUserProgress(uid, displayName);
  const today = new Date(nowMs).toISOString().split('T')[0];

  const isNewDailyXPDay = current.dailyXPDate !== today;
  const isNewDailyQuizDay = current.dailyQuizzesDate !== today;

  const prevDailyXP = isNewDailyXPDay ? 0 : (current.dailyXP ?? 0);
  const prevCategoryCount = isNewDailyQuizDay
    ? 0
    : (current.dailyQuizzesByCategory?.[result.category] ?? 0);

  const allowedXP = Math.max(0, DAILY_XP_CAP - prevDailyXP);
  const clampedXP = Math.min(result.xpEarned, allowedXP);
  const newXP = current.totalXP + clampedXP;
  const catStats = current.categoryStats[result.category];
  const prevDailyQuizzes = isNewDailyQuizDay
    ? emptyDailyQuizzes()
    : (current.dailyQuizzesByCategory ?? emptyDailyQuizzes());

  const updated: UserProgress = {
    ...current,
    totalXP: newXP,
    level: calcLevel(newXP),
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
    dailyXP: prevDailyXP + clampedXP,
    dailyXPDate: today,
    dailyQuizzesByCategory: { ...prevDailyQuizzes, [result.category]: prevCategoryCount + 1 },
    dailyQuizzesDate: today,
  };

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

  return updated;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('totalXP', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}
