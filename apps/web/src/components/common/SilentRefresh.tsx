import { useEffect } from 'react';

import { refreshToken } from '@/lib/api/auth.api';
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
        const data = await refreshToken();
        setToken(data.token);
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
