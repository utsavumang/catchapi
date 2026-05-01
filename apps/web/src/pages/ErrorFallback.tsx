import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export const ErrorFallback = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const getErrorMessage = (): string => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return 'This page does not exist.';
      if (error.status === 401)
        return 'You are not authorised to view this page.';
      return `Something went wrong (${error.status}).`;
    }

    if (error instanceof Error) {
      return import.meta.env.DEV
        ? error.message
        : 'An unexpected error occurred.';
    }

    return 'An unexpected error occurred.';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm">{getErrorMessage()}</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
            Go to Dashboard
          </Button>
        </div>

        {/* stack trace in dev only */}
        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <details className="text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Stack trace
            </summary>
            <pre className="mt-2 text-xs font-mono text-muted-foreground bg-secondary p-4 rounded-lg overflow-auto text-left whitespace-pre-wrap break-all">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
