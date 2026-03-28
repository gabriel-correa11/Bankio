import { create } from 'zustand';
import {
  QuizCategory, Question, UserProgress, LeaderboardEntry,
  QuizSessionResult,
} from '../core/models/quiz';
import { AchievementId } from '../core/models/achievement';
import {
  getQuestionsForCategory, getUserProgress, computeQuizSave, persistQuizProgress,
  getLeaderboard,
} from '../core/services/quizService';
import { defaultProgress } from '../core/services/progressUtils';

interface QuizStore {
  userProgress: UserProgress | null;
  isLoadingProgress: boolean;
  leaderboard: LeaderboardEntry[];
  activeCategory: QuizCategory | null;
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  sessionStartTime: number;
  lastQuizAchievements: AchievementId[];
  lastQuizLeveledUp: boolean;
  lastQuizPreviousLevel: number;
  loadUserProgress: (uid: string, displayName?: string) => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  startQuiz: (category: QuizCategory) => void;
  answerQuestion: (optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: (uid: string, displayName: string) => Promise<QuizSessionResult>;
  resetSession: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  userProgress: null,
  isLoadingProgress: false,
  leaderboard: [],
  activeCategory: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  sessionStartTime: 0,
  lastQuizAchievements: [],
  lastQuizLeveledUp: false,
  lastQuizPreviousLevel: 1,

  loadUserProgress: async (uid, displayName = '') => {
    set({ isLoadingProgress: true });
    try {
      const progress = await getUserProgress(uid, displayName);
      set({ userProgress: progress });
    } catch {
      // Offline or Firebase unavailable — use local defaults so the app still works
      set({ userProgress: defaultProgress(uid, displayName) });
    } finally {
      set({ isLoadingProgress: false });
    }
  },

  loadLeaderboard: async () => {
    const entries = await getLeaderboard();
    set({ leaderboard: entries });
  },

  startQuiz: (category) => {
    const questions = getQuestionsForCategory(category, 10);
    set({
      activeCategory: category,
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      sessionStartTime: Date.now(),
    });
  },

  answerQuestion: (optionIndex) => {
    const { answers, currentIndex } = get();
    const updated = [...answers];
    updated[currentIndex] = optionIndex;
    set({ answers: updated });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  finishQuiz: (uid, displayName) => {
    const { questions, answers, activeCategory, sessionStartTime, userProgress } = get();
    const timeTaken = Math.round((Date.now() - sessionStartTime) / 1000);

    let correctAnswers = 0;
    let xpEarned = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        correctAnswers++;
        xpEarned += q.xpReward;
      }
    });

    const result: QuizSessionResult = {
      category: activeCategory!,
      totalQuestions: questions.length,
      correctAnswers,
      xpEarned,
      timeTaken,
    };

    // Compute entirely from local state — no network needed
    const current = userProgress ?? defaultProgress(uid, displayName);
    const saveResult = computeQuizSave(current, result);

    set({
      userProgress: saveResult.progress,
      lastQuizAchievements: saveResult.newAchievements,
      lastQuizLeveledUp: saveResult.leveledUp,
      lastQuizPreviousLevel: saveResult.previousLevel,
    });

    // Persist to Firestore in the background — does not block navigation
    persistQuizProgress(uid, displayName, saveResult.progress).catch(() => {
      // silently ignored — progress is already updated locally
    });

    return Promise.resolve({ ...result, xpEarned: saveResult.effectiveXP });
  },

  resetSession: () => {
    set({
      activeCategory: null,
      questions: [],
      currentIndex: 0,
      answers: [],
      sessionStartTime: 0,
      lastQuizAchievements: [],
      lastQuizLeveledUp: false,
      lastQuizPreviousLevel: 1,
    });
  },
}));
