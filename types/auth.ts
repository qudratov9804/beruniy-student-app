export interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  headline: string | null;
  website: string | null;
  role: 'student' | 'instructor' | 'admin';
  is_active: boolean;
  is_instructor_verified: boolean;
  has_password: boolean;
  phone_verified_at: string | null;
  created_at: string;
}

// OTP flow
export interface SendOtpRequest {
  phone: string;
  type: 'login' | 'register' | 'reset';
}

export interface SendOtpResponse {
  expires_in: number;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  type: 'login' | 'register' | 'reset';
}

export interface VerifyOtpResponse {
  exists: boolean;
  token: string | null;
  registration_token: string | null;
}

export interface RegisterCompleteRequest {
  registration_token: string;
  name: string;
  role: 'student' | 'instructor';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Password-based login (alternative flow)
export interface PasswordLoginRequest {
  phone: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  bio?: string;
  headline?: string;
  website?: string;
}

export interface SetPasswordRequest {
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}
