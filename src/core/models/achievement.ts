export type AchievementId =
  | 'first_quiz'
  | 'level_2'
  | 'perfect_quiz'
  | 'level_5'
  | 'first_category'
  | 'level_10';

import { MaterialIcons } from '@expo/vector-icons';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_quiz: {
    id: 'first_quiz',
    title: 'Primeiro Passo',
    description: 'Complete seu primeiro quiz',
    icon: 'play-circle-filled',
  },
  level_2: {
    id: 'level_2',
    title: 'Em Ascensão',
    description: 'Alcance o nível 2',
    icon: 'trending-up',
  },
  perfect_quiz: {
    id: 'perfect_quiz',
    title: 'Perfeição',
    description: 'Acerte todas as questões em um quiz',
    icon: 'military-tech',
  },
  level_5: {
    id: 'level_5',
    title: 'Mago das Finanças',
    description: 'Alcance o nível 5',
    icon: 'workspace-premium',
  },
  first_category: {
    id: 'first_category',
    title: 'Especialista',
    description: 'Complete 5 quizzes na mesma categoria',
    icon: 'category',
  },
  level_10: {
    id: 'level_10',
    title: 'Supremo',
    description: 'Alcance o nível 10',
    icon: 'emoji-events',
  },
};
