import { apiClient } from './client';
import type {
  ApiResponse,
  AuthResponse,
  User,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types';

export const authService = {
  login: async (data: LoginRequest) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data);
    return res.data.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
    return res.data.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
    return res.data.data;
  },

  updateProfile: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatar'>>) => {
    const res = await apiClient.patch<ApiResponse<User>>('/auth/me', data);
    return res.data.data;
  },
};
