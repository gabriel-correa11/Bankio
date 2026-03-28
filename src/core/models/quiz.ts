export type QuizCategory = 'poupanca' | 'investimentos' | 'credito' | 'orcamento';
export type Difficulty = 'facil' | 'medio' | 'dificil';

export interface Question {
  id: string;
  category: QuizCategory;
  text: string;
  options: string[];
  correctIndex: number;
  xpReward: number;
  difficulty: Difficulty;
}

export interface CategoryStats {
  played: number;
  correct: number;
}

export type DailyQuizzesByCategory = Record<QuizCategory, number>;

export interface UserProgress {
  uid: string;
  displayName: string;
  totalXP: number;
  level: number;
  streak: number;
  lastPlayedDate: string;
  completedQuizzes: number;
  categoryStats: Record<QuizCategory, CategoryStats>;
  lastQuizCompletedAt: number;
  dailyXP: number;
  dailyXPDate: string;
  dailyQuizzesByCategory: DailyQuizzesByCategory;
  dailyQuizzesDate: string;
}

export type FloodBlockReason = 'cooldown' | 'dailyXPCap' | 'categoryDailyLimit' | null;

export interface FloodCheckResult {
  blocked: boolean;
  reason: FloodBlockReason;
  cooldownSecondsLeft?: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  totalXP: number;
  level: number;
  streak: number;
}

export interface QuizSessionResult {
  category: QuizCategory;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeTaken: number;
}
