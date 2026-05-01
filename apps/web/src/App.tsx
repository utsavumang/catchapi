import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { SilentRefresh } from '@/components/common/SilentRefresh';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PublicRoute } from '@/components/common/PublicRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { EndpointsPage } from '@/pages/EndpointsPage';
import { EndpointDetailPage } from '@/pages/EndpointDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorFallback } from '@/pages/ErrorFallback';

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
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  return (
    <>
      <SilentRefresh />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
