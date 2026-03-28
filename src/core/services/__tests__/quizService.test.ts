import { getQuestionsForCategory, calcLevel, calcStreak, checkFloodGuard } from '../quizService';
import { QUESTIONS } from '../../../data/questions';
import { UserProgress } from '../../models/quiz';

// Firebase e firebaseConfig são mockados via moduleNameMapper no jest config

describe('getQuestionsForCategory', () => {
  it('deve retornar 10 questões por padrão', () => {
    const result = getQuestionsForCategory('poupanca');
    expect(result).toHaveLength(10);
  });

  it('deve retornar questões somente da categoria solicitada', () => {
    const result = getQuestionsForCategory('investimentos');
    result.forEach((q) => expect(q.category).toBe('investimentos'));
  });

  it('deve respeitar o parâmetro count', () => {
    const result = getQuestionsForCategory('credito', 5);
    expect(result).toHaveLength(5);
  });

  it('deve retornar array vazio se count for 0', () => {
    const result = getQuestionsForCategory('orcamento', 0);
    expect(result).toHaveLength(0);
  });

  it('deve embaralhar as questões (resultado diferente em múltiplas chamadas)', () => {
    const results = Array.from({ length: 10 }, () =>
      getQuestionsForCategory('poupanca', 15).map((q) => q.id)
    );
    const allSame = results.every((r) => JSON.stringify(r) === JSON.stringify(results[0]));
    // Com 15! combinações possíveis, a chance de todas serem iguais é ínfima
    expect(allSame).toBe(false);
  });

  it('não deve retornar questões duplicadas', () => {
    const result = getQuestionsForCategory('orcamento', 15);
    const ids = result.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('deve funcionar para todas as categorias', () => {
    const categories = ['poupanca', 'investimentos', 'credito', 'orcamento'] as const;
    categories.forEach((cat) => {
      const result = getQuestionsForCategory(cat);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe('calcLevel', () => {
  it('0 XP deve ser nível 1', () => {
    expect(calcLevel(0)).toBe(1);
  });

  it('99 XP deve ser nível 1', () => {
    expect(calcLevel(99)).toBe(1);
  });

  it('100 XP deve ser nível 2', () => {
    expect(calcLevel(100)).toBe(2);
  });

  it('199 XP deve ser nível 2', () => {
    expect(calcLevel(199)).toBe(2);
  });

  it('200 XP deve ser nível 3', () => {
    expect(calcLevel(200)).toBe(3);
  });

  it('1000 XP deve ser nível 11', () => {
    expect(calcLevel(1000)).toBe(11);
  });

  it('deve crescer linearmente a cada 100 XP', () => {
    for (let i = 0; i < 20; i++) {
      expect(calcLevel(i * 100)).toBe(i + 1);
    }
  });
});

describe('calcStreak', () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

  it('deve manter streak se já jogou hoje', () => {
    expect(calcStreak(today, 5)).toBe(5);
  });

  it('deve incrementar streak se jogou ontem', () => {
    expect(calcStreak(yesterday, 3)).toBe(4);
  });

  it('deve resetar streak para 1 se última partida foi há 2 dias', () => {
    expect(calcStreak(twoDaysAgo, 10)).toBe(1);
  });

  it('deve resetar streak para 1 se nunca jogou (data vazia)', () => {
    expect(calcStreak('', 0)).toBe(1);
  });

  it('deve resetar streak para 1 se data for muito antiga', () => {
    expect(calcStreak('2020-01-01', 100)).toBe(1);
  });

  it('deve incrementar de 0 para 1 no primeiro dia', () => {
    expect(calcStreak(yesterday, 0)).toBe(1);
  });
});

describe('checkFloodGuard', () => {
  const NOW = 1_700_000_000_000;
  const TODAY = new Date(NOW).toISOString().split('T')[0];

  const base: UserProgress = {
    uid: 'u1',
    displayName: 'Test',
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

  it('permite quiz sem restrições', () => {
    expect(checkFloodGuard(base, 'poupanca', NOW).blocked).toBe(false);
  });

  it('bloqueia dentro do cooldown de 30s', () => {
    const p = { ...base, lastQuizCompletedAt: NOW - 20_000 };
    const r = checkFloodGuard(p, 'poupanca', NOW);
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe('cooldown');
    expect(r.cooldownSecondsLeft).toBe(10);
  });

  it('permite exatamente no limite de 30s', () => {
    const p = { ...base, lastQuizCompletedAt: NOW - 30_000 };
    expect(checkFloodGuard(p, 'poupanca', NOW).blocked).toBe(false);
  });

  it('bloqueia quando limite diário de XP (500) é atingido', () => {
    const p = { ...base, dailyXP: 500, dailyXPDate: TODAY };
    const r = checkFloodGuard(p, 'poupanca', NOW);
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe('dailyXPCap');
  });

  it('ignora cap de XP diário se a data mudou (novo dia)', () => {
    const p = { ...base, dailyXP: 500, dailyXPDate: '2000-01-01' };
    expect(checkFloodGuard(p, 'poupanca', NOW).blocked).toBe(false);
  });

  it('bloqueia quando limite de 3 quizzes por categoria é atingido', () => {
    const p = {
      ...base,
      dailyQuizzesByCategory: { poupanca: 3, investimentos: 0, credito: 0, orcamento: 0 },
      dailyQuizzesDate: TODAY,
    };
    const r = checkFloodGuard(p, 'poupanca', NOW);
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe('categoryDailyLimit');
  });

  it('não bloqueia categoria diferente da que atingiu o limite', () => {
    const p = {
      ...base,
      dailyQuizzesByCategory: { poupanca: 3, investimentos: 0, credito: 0, orcamento: 0 },
      dailyQuizzesDate: TODAY,
    };
    expect(checkFloodGuard(p, 'investimentos', NOW).blocked).toBe(false);
  });

  it('ignora limite de categoria se a data mudou (novo dia)', () => {
    const p = {
      ...base,
      dailyQuizzesByCategory: { poupanca: 3, investimentos: 0, credito: 0, orcamento: 0 },
      dailyQuizzesDate: '2000-01-01',
    };
    expect(checkFloodGuard(p, 'poupanca', NOW).blocked).toBe(false);
  });

  it('cooldown tem prioridade sobre o cap diário de XP', () => {
    const p = { ...base, lastQuizCompletedAt: NOW - 5_000, dailyXP: 500, dailyXPDate: TODAY };
    expect(checkFloodGuard(p, 'poupanca', NOW).reason).toBe('cooldown');
  });

  it('cooldown seconsdLeft diminui corretamente', () => {
    const p = { ...base, lastQuizCompletedAt: NOW - 25_000 };
    const r = checkFloodGuard(p, 'poupanca', NOW);
    expect(r.cooldownSecondsLeft).toBe(5);
  });
});
