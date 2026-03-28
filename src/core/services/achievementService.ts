import { AchievementId } from '../models/achievement';
import { UserProgress, QuizSessionResult } from '../models/quiz';

export function checkNewAchievements(
  before: UserProgress,
  after: UserProgress,
  result: QuizSessionResult,
): AchievementId[] {
  const alreadyUnlocked = new Set(before.unlockedAchievements ?? []);
  const newlyUnlocked: AchievementId[] = [];

  function check(id: AchievementId, condition: boolean) {
    if (!alreadyUnlocked.has(id) && condition) {
      newlyUnlocked.push(id);
    }
  }

  check('first_quiz', after.completedQuizzes >= 1);
  check('level_2', after.level >= 2);
  check('perfect_quiz', result.correctAnswers === result.totalQuestions);
  check('level_5', after.level >= 5);
  check('first_category', (after.categoryQuizCounts?.[result.category] ?? 0) >= 5);
  check('level_10', after.level >= 10);

  return newlyUnlocked;
}

export function mergeAchievements(existing: string[], newIds: AchievementId[]): string[] {
  const set = new Set(existing);
  newIds.forEach((id) => set.add(id));
  return Array.from(set);
}
