import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAuthForm } from '../useAuthForm';
import * as authService from '../../../core/services/authService';

jest.mock('../../../core/services/authService');
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe('estado inicial', () => {
  it('deve iniciar no modo login', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.isLogin).toBe(true);
  });

  it('todos os campos devem iniciar vazios', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.name).toBe('');
    expect(result.current.confirmPassword).toBe('');
  });

  it('senha deve iniciar oculta', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.showPassword).toBe(false);
  });
});

// ─── toggleMode ───────────────────────────────────────────────────────────────

describe('toggleMode', () => {
  it('deve alternar de login para cadastro', () => {
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.toggleMode(); });

    expect(result.current.isLogin).toBe(false);
  });

  it('deve alternar de cadastro para login', () => {
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.toggleMode(); });
    act(() => { result.current.toggleMode(); });

    expect(result.current.isLogin).toBe(true);
  });

  it('deve limpar todos os campos ao alternar', () => {
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.setEmail('teste@email.com');
      result.current.setPassword('senha123');
      result.current.setName('João');
    });
    act(() => { result.current.toggleMode(); });

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.name).toBe('');
  });
});

// ─── handleSubmit — validações de login ───────────────────────────────────────

describe('handleSubmit (modo login)', () => {
  it('deve alertar se e-mail estiver vazio', async () => {
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.setPassword('senha123'); });
    await act(async () => { await result.current.handleSubmit(); });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha e-mail e senha.');
    expect(authService.signIn).not.toHaveBeenCalled();
  });

  it('deve alertar se senha estiver vazia', async () => {
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.setEmail('teste@email.com'); });
    await act(async () => { await result.current.handleSubmit(); });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha e-mail e senha.');
    expect(authService.signIn).not.toHaveBeenCalled();
  });

  it('deve chamar signIn com dados válidos', async () => {
    (authService.signIn as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.setEmail('  teste@email.com  ');
      result.current.setPassword('senha123');
    });
    await act(async () => { await result.current.handleSubmit(); });

    expect(authService.signIn).toHaveBeenCalledWith('teste@email.com', 'senha123');
  });

  it('deve alertar erro do Firebase ao falhar', async () => {
    const error = Object.assign(new Error(), { code: 'auth/invalid-credential' });
    (authService.signIn as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.setEmail('teste@email.com');
      result.current.setPassword('senhaerrada');
    });
    await act(async () => { await result.current.handleSubmit(); });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'E-mail ou senha inválidos.');
  });
});

// ─── handleSubmit — validações de cadastro ────────────────────────────────────

describe('handleSubmit (modo cadastro)', () => {
  function setupRegister() {
    const hook = renderHook(() => useAuthForm());
    act(() => { hook.result.current.toggleMode(); }); // → register
    return hook;
  }

  it('deve alertar se nome estiver vazio', async () => {
    const { result } = setupRegister();

    act(() => {
      result.current.setEmail('teste@email.com');
      result.current.setPassword('senha123');
      result.current.setConfirmPassword('senha123');
    });
    await act(async () => { await result.current.handleSubmit(); });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha seu nome.');
    expect(authService.signUp).not.toHaveBeenCalled();
  });

  it('deve alertar se as senhas não coincidirem', async () => {
    const { result } = setupRegister();

    act(() => {
      result.current.setName('João');
      result.current.setEmail('teste@email.com');
      result.current.setPassword('senha123');
      result.current.setConfirmPassword('senhaDiferente');
    });
    await act(async () => { await result.current.handleSubmit(); });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'As senhas não coincidem.');
    expect(authService.signUp).not.toHaveBeenCalled();
  });

  it('deve alertar se a senha tiver menos de 6 caracteres', async () => {
    const { result } = setupRegister();

    act(() => {
      result.current.setName('João');
      result.current.setEmail('teste@email.com');
      result.current.setPassword('123');
      result.current.setConfirmPassword('123');
    });
    await act(async () => { await result.current.handleSubmit(); });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    expect(authService.signUp).not.toHaveBeenCalled();
  });

  it('deve chamar signUp com dados válidos', async () => {
    (authService.signUp as jest.Mock).mockResolvedValue({});
    const { result } = setupRegister();

    act(() => {
      result.current.setName('  João Silva  ');
      result.current.setEmail('  novo@email.com  ');
      result.current.setPassword('senha123');
      result.current.setConfirmPassword('senha123');
    });
    await act(async () => { await result.current.handleSubmit(); });

    expect(authService.signUp).toHaveBeenCalledWith('novo@email.com', 'senha123', 'João Silva');
  });
});

// ─── handlePasswordReset ──────────────────────────────────────────────────────

describe('handlePasswordReset', () => {
  it('deve alertar se e-mail estiver vazio', async () => {
    const { result } = renderHook(() => useAuthForm());

    await act(async () => { await result.current.handlePasswordReset(); });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Digite seu e-mail primeiro.');
    expect(authService.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('deve chamar sendPasswordReset com o e-mail correto', async () => {
    (authService.sendPasswordReset as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.setEmail('  usuario@email.com  '); });
    await act(async () => { await result.current.handlePasswordReset(); });

    expect(authService.sendPasswordReset).toHaveBeenCalledWith('usuario@email.com');
  });

  it('deve alertar sucesso após envio do link', async () => {
    (authService.sendPasswordReset as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.setEmail('usuario@email.com'); });
    await act(async () => { await result.current.handlePasswordReset(); });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Enviado!',
      'Verifique sua caixa de entrada para redefinir a senha.'
    );
  });

  it('deve alertar erro do Firebase ao falhar', async () => {
    const error = Object.assign(new Error(), { code: 'auth/user-not-found' });
    (authService.sendPasswordReset as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useAuthForm());

    act(() => { result.current.setEmail('naoexiste@email.com'); });
    await act(async () => { await result.current.handlePasswordReset(); });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Nenhuma conta encontrada com esse e-mail.');
  });
});
