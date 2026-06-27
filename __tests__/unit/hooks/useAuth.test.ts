import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/authStore';

const mockUser = {
  id: '1',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student' as const,
  xp: 0,
  streak: 0,
  level: 1,
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useAuthStore', () => {
  it('starts unauthenticated', async () => {
    const { result } = await renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('setUser updates user', async () => {
    const { result } = await renderHook(() => useAuthStore());
    await act(async () => {
      result.current.setUser(mockUser);
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it('clearAuth resets state', async () => {
    const { result } = await renderHook(() => useAuthStore());
    await act(async () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    });
    await act(async () => {
      await result.current.clearAuth();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
  });

  it('setUser does not change isAuthenticated', async () => {
    const { result } = await renderHook(() => useAuthStore());
    await act(async () => {
      result.current.setUser(mockUser);
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
