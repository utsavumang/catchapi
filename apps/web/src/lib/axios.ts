import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  // Success path
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 responses.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      const newToken = response.data.token;

      useAuthStore.getState().setToken(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch {
      // Refresh failed, session is unrecoverable
      useAuthStore.getState().logout();
      window.location.href = ROUTES.LOGIN;
      return Promise.reject(error);
    }
  }
);
