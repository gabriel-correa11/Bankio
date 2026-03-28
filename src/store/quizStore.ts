import { create } from 'zustand';
import {
  QuizCategory, Question, UserProgress, LeaderboardEntry,
  QuizSessionResult, FloodCheckResult,
} from '../core/models/quiz';
import {
  getQuestionsForCategory, getUserProgress, saveQuizResult,
  getLeaderboard, checkFloodGuard,
} from '../core/services/quizService';

interface QuizStore {
  userProgress: UserProgress | null;
  isLoadingProgress: boolean;
  leaderboard: LeaderboardEntry[];
  activeCategory: QuizCategory | null;
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  sessionStartTime: number;
  floodBlock: FloodCheckResult | null;
  loadUserProgress: (uid: string, displayName?: string) => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  checkCanStartQuiz: (category: QuizCategory) => FloodCheckResult;
  startQuiz: (category: QuizCategory) => void;
  answerQuestion: (optionIndex: number) => void;
  nextQuestion: () => void;
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
  floodBlock: null,

  loadUserProgress: async (uid, displayName = '') => {
    set({ isLoadingProgress: true });
    try {
      const progress = await getUserProgress(uid, displayName);
      set({ userProgress: progress });
    } finally {
      set({ isLoadingProgress: false });
    }
  },

  loadLeaderboard: async () => {
    const entries = await getLeaderboard();
    set({ leaderboard: entries });
  },

  checkCanStartQuiz: (category) => {
    const { userProgress } = get();
    if (!userProgress) return { blocked: false, reason: null };
    const result = checkFloodGuard(userProgress, category);
    set({ floodBlock: result });
    return result;
  },

  startQuiz: (category) => {
    const questions = getQuestionsForCategory(category, 10);
    set({
      activeCategory: category,
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      sessionStartTime: Date.now(),
      floodBlock: null,
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

  finishQuiz: async (uid, displayName) => {
    const { questions, answers, activeCategory, sessionStartTime } = get();
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

    const updated = await saveQuizResult(uid, result, displayName);
    set({ userProgress: updated });

    return result;
  },

  resetSession: () => {
    set({
      activeCategory: null,
      questions: [],
      currentIndex: 0,
      answers: [],
      sessionStartTime: 0,
    });
  },
}));
