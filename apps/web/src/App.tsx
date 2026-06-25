import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PublicRoute } from '@/components/common/PublicRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { EndpointsPage } from '@/pages/EndpointsPage';
import { EndpointDetailPage } from '@/pages/EndpointDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorFallback } from '@/pages/ErrorFallback';
import { SettingsPage } from '@/pages/SettingsPage';
import { useAuthStore } from '@/store/auth.store';
import { refreshToken } from '@/lib/api/auth.api';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ErrorFallback />,
  },

  {
    element: <PublicRoute />,
    errorElement: <ErrorFallback />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    errorElement: <ErrorFallback />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <EndpointsPage /> },
          { path: '/dashboard/:urlId', element: <EndpointDetailPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  useEffect(() => {
    const attemptRefresh = async () => {
      const { token, user, setToken, setLoading, logout } =
        useAuthStore.getState();

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

  return <RouterProvider router={router} />;
}

export default App;
