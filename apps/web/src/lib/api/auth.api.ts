import { api } from '@/lib/axios';
import {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '@catchapi/shared';

interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface MeResponse {
  status: 'success';
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
    };
  };
}

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const registerUser = async (
  data: RegisterInput
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await api.post<{ token: string }>('/auth/refresh');
  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>('/auth/me');
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileInput
): Promise<{ _id: string; name: string; email: string }> => {
  const response = await api.patch<{
    status: string;
    data: { user: { _id: string; name: string; email: string } };
  }>('/auth/profile', data);
  return response.data.data.user;
};

export const changePassword = async (
  data: ChangePasswordInput
): Promise<void> => {
  await api.patch('/auth/password', data);
};
