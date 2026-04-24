import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">This page does not exist.</p>
      <Link to={ROUTES.HOME} className="text-primary hover:underline text-sm">
        Go home
      </Link>
    </div>
  );
};
