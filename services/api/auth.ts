import { apiClient } from './client';
import type {
  ApiResponse,
  User,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RegisterCompleteRequest,
  AuthResponse,
  PasswordLoginRequest,
  UpdateProfileRequest,
  SetPasswordRequest,
  ChangePasswordRequest,
} from '@/types';

export const authService = {
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const res = await apiClient.post<ApiResponse<SendOtpResponse>>('/auth/send-otp', data);
    return res.data.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const res = await apiClient.post<ApiResponse<VerifyOtpResponse>>('/auth/verify-otp', data);
    return res.data.data;
  },

  registerComplete: async (data: RegisterCompleteRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register/complete', data);
    return res.data.data;
  },

  loginWithPassword: async (data: PasswordLoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login/password', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },

  setPassword: async (data: SetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/password/set', data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/password/change', data);
  },
};
