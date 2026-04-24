import { QueryCache, QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as unknown as { response: { status: number } }).response
          ?.status === 401
      ) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,

      retry: 1,

      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
