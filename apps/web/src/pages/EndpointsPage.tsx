import { useState } from 'react';
import { Webhook } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { EndpointCard } from '@/components/endpoints/EndpointCard';
import { EndpointSkeleton } from '@/components/endpoints/EndpointSkeleton';
import { CreateEndpointDialog } from '@/components/endpoints/CreateEndpointDialog';
import { Button } from '@/components/ui/button';
import { useGetEndpoints } from '@/hooks/useEndpoints';
import { StatCard } from '@/components/common/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

export const EndpointsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isPending, isError, refetch } = useGetEndpoints();

  const endpoints = data?.data ?? [];

  const totalPayloads = endpoints.reduce((sum, ep) => sum + ep.payloadCount, 0);
  const mostActive = [...endpoints].sort(
    (a, b) => b.payloadCount - a.payloadCount
  )[0];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Endpoints"
        description="Manage your webhook endpoints and inspect incoming payloads."
        action={
          <Button onClick={() => setCreateOpen(true)}>New Endpoint</Button>
        }
      />
      {/* Stats Bar */}
      {isPending && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {!isPending && !isError && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Endpoints" value={endpoints.length} />
          <StatCard label="Total Payloads" value={totalPayloads} />
          <StatCard
            label="Most Active"
            value={
              mostActive && mostActive.payloadCount > 0 ? mostActive.name : '—'
            }
          />
        </div>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <EndpointSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground">Failed to load endpoints.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isPending && !isError && endpoints.length === 0 && (
        <EmptyState
          icon={<Webhook className="w-12 h-12" />}
          title="No endpoints yet"
          description="Create your first webhook endpoint to start catching incoming requests."
          action={
            <Button onClick={() => setCreateOpen(true)}>New Endpoint</Button>
          }
        />
      )}

      {/* Endpoints List */}
      {!isPending && !isError && endpoints.length > 0 && (
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <EndpointCard key={endpoint._id} endpoint={endpoint} />
          ))}
        </div>
      )}

      <CreateEndpointDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};
