import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EndpointHeader } from '@/components/endpoints/EndpointHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetEndpoint } from '@/hooks/useEndpoints';
import { ROUTES } from '@/lib/constants';

export const EndpointDetailPage = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const navigate = useNavigate();
  const { data: endpoint, isPending, isError } = useGetEndpoint(urlId ?? '');

  useEffect(() => {
    if (isError) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isError, navigate]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ─── Loading State ───────────────────────────────────────────── */}
      {isPending && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {/* ─── Endpoint Header ─────────────────────────────────────────── */}
      {!isPending && endpoint && <EndpointHeader endpoint={endpoint} />}

      {/* ─── Payload section placeholder ─────────────────────────────── */}
      {!isPending && endpoint && (
        <div className="border-t border-border pt-6">
          <p className="text-muted-foreground text-sm">
            Payload list coming in Part 7.2
          </p>
        </div>
      )}
    </div>
  );
};
