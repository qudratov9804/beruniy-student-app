import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

const mockUser: User = {
  id: 1,
  name: 'Test User',
  phone: '+998901234567',
  email: null,
  avatar: null,
  bio: null,
  headline: null,
  website: null,
  role: 'student',
  is_active: true,
  is_instructor_verified: false,
  has_password: false,
  phone_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
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
    expect(result.current.token).toBeNull();
  });

  it('setUser does not change isAuthenticated', async () => {
    const { result } = await renderHook(() => useAuthStore());
    await act(async () => {
      result.current.setUser(mockUser);
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
