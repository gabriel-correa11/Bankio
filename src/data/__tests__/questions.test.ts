import { QUESTIONS } from '../questions';
import { QuizCategory, Difficulty } from '../../core/models/quiz';

const VALID_CATEGORIES: QuizCategory[] = ['poupanca', 'investimentos', 'credito', 'orcamento'];
const VALID_DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil'];
const VALID_XP = [10, 15, 20];

describe('Banco de questões', () => {
  it('deve conter exatamente 60 questões', () => {
    expect(QUESTIONS).toHaveLength(60);
  });

  it('deve ter 15 questões por categoria', () => {
    VALID_CATEGORIES.forEach((cat) => {
      const count = QUESTIONS.filter((q) => q.category === cat).length;
      expect(count).toBe(15);
    });
  });

  it('deve ter 5 questões por dificuldade por categoria', () => {
    VALID_CATEGORIES.forEach((cat) => {
      VALID_DIFFICULTIES.forEach((diff) => {
        const count = QUESTIONS.filter((q) => q.category === cat && q.difficulty === diff).length;
        expect(count).toBe(5);
      });
    });
  });

  it('todos os IDs devem ser únicos', () => {
    const ids = QUESTIONS.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(QUESTIONS.length);
  });

  it('todas as questões devem ter exatamente 4 opções', () => {
    QUESTIONS.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  it('correctIndex deve estar entre 0 e 3', () => {
    QUESTIONS.forEach((q) => {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    });
  });

  it('xpReward deve ser um valor válido (10, 15 ou 20)', () => {
    QUESTIONS.forEach((q) => {
      expect(VALID_XP).toContain(q.xpReward);
    });
  });

  it('questões fáceis devem ter xpReward 10', () => {
    QUESTIONS.filter((q) => q.difficulty === 'facil').forEach((q) => {
      expect(q.xpReward).toBe(10);
    });
  });

  it('questões médias devem ter xpReward 15', () => {
    QUESTIONS.filter((q) => q.difficulty === 'medio').forEach((q) => {
      expect(q.xpReward).toBe(15);
    });
  });

  it('questões difíceis devem ter xpReward 20', () => {
    QUESTIONS.filter((q) => q.difficulty === 'dificil').forEach((q) => {
      expect(q.xpReward).toBe(20);
    });
  });

  it('nenhuma questão deve ter texto vazio', () => {
    QUESTIONS.forEach((q) => {
      expect(q.text.trim().length).toBeGreaterThan(0);
    });
  });

  it('nenhuma opção deve ter texto vazio', () => {
    QUESTIONS.forEach((q) => {
      q.options.forEach((opt) => {
        expect(opt.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('todas as categorias devem ser válidas', () => {
    QUESTIONS.forEach((q) => {
      expect(VALID_CATEGORIES).toContain(q.category);
    });
  });

  it('todas as dificuldades devem ser válidas', () => {
    QUESTIONS.forEach((q) => {
      expect(VALID_DIFFICULTIES).toContain(q.difficulty);
    });
  });
});
