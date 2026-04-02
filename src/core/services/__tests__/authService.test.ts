import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { signIn, signUp, sendPasswordReset, signOut } from '../authService';

// firebase/auth e firebaseConfig são mockados via moduleNameMapper no jest config

const mockUser = {
  uid: 'user123',
  email: 'teste@email.com',
  displayName: null,
  emailVerified: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── signIn ───────────────────────────────────────────────────────────────────

describe('signIn', () => {
  it('deve chamar signInWithEmailAndPassword com os dados corretos', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

    const result = await signIn('teste@email.com', 'senha123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'teste@email.com',
      'senha123'
    );
    expect(result).toEqual(mockUser);
  });

  it('deve propagar erro quando as credenciais são inválidas', async () => {
    const error = Object.assign(new Error(), { code: 'auth/invalid-credential' });
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

    await expect(signIn('errado@email.com', 'senhaerrada')).rejects.toMatchObject({
      code: 'auth/invalid-credential',
    });
  });

  it('deve propagar erro de usuário não encontrado', async () => {
    const error = Object.assign(new Error(), { code: 'auth/user-not-found' });
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

    await expect(signIn('inexistente@email.com', '123456')).rejects.toMatchObject({
      code: 'auth/user-not-found',
    });
  });
});

// ─── signUp ───────────────────────────────────────────────────────────────────

describe('signUp', () => {
  beforeEach(() => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
    (setDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it('deve criar conta, atualizar perfil e enviar verificação de e-mail', async () => {
    await signUp('novo@email.com', 'senha123', 'João Silva');

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'novo@email.com',
      'senha123'
    );
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'João Silva' });
    expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
  });

  it('deve criar documentos no Firestore para o novo usuário', async () => {
    await signUp('novo@email.com', 'senha123', 'João Silva');

    expect(setDoc).toHaveBeenCalledTimes(2); // users + userProgress
  });

  it('deve retornar o usuário criado', async () => {
    const result = await signUp('novo@email.com', 'senha123', 'João Silva');

    expect(result).toEqual(mockUser);
  });

  it('deve propagar erro se o e-mail já estiver em uso', async () => {
    const error = Object.assign(new Error(), { code: 'auth/email-already-in-use' });
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

    await expect(signUp('existente@email.com', 'senha123', 'Ana')).rejects.toMatchObject({
      code: 'auth/email-already-in-use',
    });
  });

  it('deve propagar erro de senha fraca', async () => {
    const error = Object.assign(new Error(), { code: 'auth/weak-password' });
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

    await expect(signUp('novo@email.com', '123', 'Ana')).rejects.toMatchObject({
      code: 'auth/weak-password',
    });
  });
});

// ─── sendPasswordReset ────────────────────────────────────────────────────────

describe('sendPasswordReset', () => {
  it('deve chamar sendPasswordResetEmail com o e-mail correto', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

    await sendPasswordReset('usuario@email.com');

    expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'usuario@email.com');
  });

  it('deve propagar erro quando o e-mail não é encontrado', async () => {
    const error = Object.assign(new Error(), { code: 'auth/user-not-found' });
    (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

    await expect(sendPasswordReset('naoexiste@email.com')).rejects.toMatchObject({
      code: 'auth/user-not-found',
    });
  });

  it('deve propagar erro de e-mail inválido', async () => {
    const error = Object.assign(new Error(), { code: 'auth/invalid-email' });
    (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

    await expect(sendPasswordReset('emailinvalido')).rejects.toMatchObject({
      code: 'auth/invalid-email',
    });
  });
});

// ─── signOut ──────────────────────────────────────────────────────────────────

describe('signOut', () => {
  it('deve chamar firebaseSignOut', async () => {
    (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

    await signOut();

    expect(firebaseSignOut).toHaveBeenCalledWith({});
  });

  it('deve propagar erro caso o logout falhe', async () => {
    (firebaseSignOut as jest.Mock).mockRejectedValue(new Error('Falha ao sair'));

    await expect(signOut()).rejects.toThrow('Falha ao sair');
  });
});
