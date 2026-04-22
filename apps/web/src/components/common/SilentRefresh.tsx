import { useEffect } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export const SilentRefresh = () => {
  const { token, user, setToken, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const attemptRefresh = async () => {
      if (token) {
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.post<{ token: string }>('/auth/refresh');
        setToken(response.data.token);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    attemptRefresh();
  }, []);

  return null;
};
