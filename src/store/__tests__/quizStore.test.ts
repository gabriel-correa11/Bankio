import { act } from 'react';
import { useQuizStore } from '../quizStore';
import * as quizService from '../../core/services/quizService';
import { Question, UserProgress } from '../../core/models/quiz';

jest.mock('../../core/services/quizService');

const mockQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
  id: `q_${i}`,
  category: 'poupanca' as const,
  text: `Pergunta ${i}`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
  xpReward: 10,
  difficulty: 'facil' as const,
}));

const mockProgress: UserProgress = {
  uid: 'user123',
  displayName: 'Teste',
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
  dailyQuizzesByCategory: { poupanca: 0, investimentos: 0, credito: 0, orcamento: 0 },
  dailyQuizzesDate: '',
  unlockedAchievements: [],
  categoryQuizCounts: { poupanca: 0, investimentos: 0, credito: 0, orcamento: 0 },
};

beforeEach(() => {
  useQuizStore.setState({
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
  });
  jest.clearAllMocks();
});

describe('startQuiz', () => {
  it('deve carregar questões e iniciar sessão', () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);

    act(() => {
      useQuizStore.getState().startQuiz('poupanca');
    });

    const state = useQuizStore.getState();
    expect(state.activeCategory).toBe('poupanca');
    expect(state.questions).toHaveLength(10);
    expect(state.currentIndex).toBe(0);
    expect(state.answers).toHaveLength(10);
    expect(state.answers.every((a) => a === null)).toBe(true);
    expect(state.sessionStartTime).toBeGreaterThan(0);
  });
});

describe('answerQuestion', () => {
  it('deve registrar a resposta no índice atual', () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);

    act(() => {
      useQuizStore.getState().startQuiz('poupanca');
      useQuizStore.getState().answerQuestion(2);
    });

    expect(useQuizStore.getState().answers[0]).toBe(2);
  });

  it('não deve afetar outras respostas ao responder', () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);

    act(() => {
      useQuizStore.getState().startQuiz('poupanca');
      useQuizStore.getState().answerQuestion(1);
    });

    const answers = useQuizStore.getState().answers;
    expect(answers[0]).toBe(1);
    for (let i = 1; i < answers.length; i++) {
      expect(answers[i]).toBeNull();
    }
  });
});

describe('nextQuestion', () => {
  it('deve avançar para o próximo índice', () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);

    act(() => {
      useQuizStore.getState().startQuiz('poupanca');
      useQuizStore.getState().nextQuestion();
    });

    expect(useQuizStore.getState().currentIndex).toBe(1);
  });

  it('não deve ultrapassar o número de questões', () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);

    act(() => {
      useQuizStore.getState().startQuiz('poupanca');
      // Avança até o último
      for (let i = 0; i < 15; i++) {
        useQuizStore.getState().nextQuestion();
      }
    });

    expect(useQuizStore.getState().currentIndex).toBe(9); // max = length - 1
  });
});

describe('finishQuiz', () => {
  it('deve calcular XP corretamente (todas certas)', async () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);
    const updatedProgress = { ...mockProgress, totalXP: 100, completedQuizzes: 1 };
    (quizService.computeQuizSave as jest.Mock).mockReturnValue({
      progress: updatedProgress,
      newAchievements: [],
      leveledUp: false,
      previousLevel: 1,
      effectiveXP: 100,
    });
    (quizService.persistQuizProgress as jest.Mock).mockResolvedValue(undefined);

    act(() => {
      useQuizStore.setState({ userProgress: mockProgress });
      useQuizStore.getState().startQuiz('poupanca');
      // Responde todas corretas (correctIndex = 0)
      for (let i = 0; i < 10; i++) {
        useQuizStore.getState().answerQuestion(0);
        if (i < 9) useQuizStore.getState().nextQuestion();
      }
    });

    let result: any;
    await act(async () => {
      result = await useQuizStore.getState().finishQuiz('user123', 'Teste');
    });

    expect(result.correctAnswers).toBe(10);
    expect(result.xpEarned).toBe(100); // effectiveXP do computeQuizSave
    expect(result.totalQuestions).toBe(10);
  });

  it('deve calcular XP corretamente (nenhuma certa)', async () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);
    (quizService.computeQuizSave as jest.Mock).mockReturnValue({
      progress: mockProgress,
      newAchievements: [],
      leveledUp: false,
      previousLevel: 1,
      effectiveXP: 0,
    });
    (quizService.persistQuizProgress as jest.Mock).mockResolvedValue(undefined);

    act(() => {
      useQuizStore.setState({ userProgress: mockProgress });
      useQuizStore.getState().startQuiz('poupanca');
      // Responde todas erradas (correctIndex = 0, responde 1)
      for (let i = 0; i < 10; i++) {
        useQuizStore.getState().answerQuestion(1);
        if (i < 9) useQuizStore.getState().nextQuestion();
      }
    });

    let result: any;
    await act(async () => {
      result = await useQuizStore.getState().finishQuiz('user123', 'Teste');
    });

    expect(result.correctAnswers).toBe(0);
    expect(result.xpEarned).toBe(0);
  });

  it('deve atualizar userProgress no store após finish', async () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);
    const updatedProgress = { ...mockProgress, totalXP: 50 };
    (quizService.computeQuizSave as jest.Mock).mockReturnValue({
      progress: updatedProgress,
      newAchievements: [],
      leveledUp: false,
      previousLevel: 1,
      effectiveXP: 50,
    });
    (quizService.persistQuizProgress as jest.Mock).mockResolvedValue(undefined);

    act(() => {
      useQuizStore.setState({ userProgress: mockProgress });
      useQuizStore.getState().startQuiz('poupanca');
    });

    await act(async () => {
      await useQuizStore.getState().finishQuiz('user123', 'Teste');
    });

    expect(useQuizStore.getState().userProgress?.totalXP).toBe(50);
  });
});

describe('resetSession', () => {
  it('deve limpar todos os dados da sessão', () => {
    (quizService.getQuestionsForCategory as jest.Mock).mockReturnValue(mockQuestions);

    act(() => {
      useQuizStore.getState().startQuiz('poupanca');
      useQuizStore.getState().resetSession();
    });

    const state = useQuizStore.getState();
    expect(state.activeCategory).toBeNull();
    expect(state.questions).toHaveLength(0);
    expect(state.currentIndex).toBe(0);
    expect(state.answers).toHaveLength(0);
  });
});

describe('loadUserProgress', () => {
  it('deve atualizar userProgress no store', async () => {
    (quizService.getUserProgress as jest.Mock).mockResolvedValue(mockProgress);

    await act(async () => {
      await useQuizStore.getState().loadUserProgress('user123', 'Teste');
    });

    expect(useQuizStore.getState().userProgress).toEqual(mockProgress);
    expect(useQuizStore.getState().isLoadingProgress).toBe(false);
  });

  it('deve definir isLoadingProgress como false mesmo em caso de erro', async () => {
    (quizService.getUserProgress as jest.Mock).mockRejectedValue(new Error('Falha'));

    await act(async () => {
      try {
        await useQuizStore.getState().loadUserProgress('user123');
      } catch {}
    });

    expect(useQuizStore.getState().isLoadingProgress).toBe(false);
  });
});
