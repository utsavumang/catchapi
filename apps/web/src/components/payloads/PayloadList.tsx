import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { PayloadSkeleton } from '@/components/payloads/PayloadSkeleton';
import { MethodFilter } from '@/components/payloads/MethodFilter';
import { useGetPayloads } from '@/hooks/usePayloads';
import { UI } from '@/lib/constants';
import { MethodFilter, HttpMethod } from '@/components/payloads/MethodFilter';

interface PayloadListProps {
  endpointId: string;
}

export const PayloadList = ({ endpointId }: PayloadListProps) => {
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod | undefined>(
    undefined
  );

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetPayloads({
    endpointId,
    method: selectedMethod,
    limit: UI.PAYLOAD_PAGE_SIZE,
  });

  const payloads = data?.payloads ?? [];
  const hasMore = data?.hasMore ?? false;

  return (
    <div className="space-y-4">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Incoming Payloads
          </h2>
          <p className="text-sm text-muted-foreground">
            Requests received by this endpoint
          </p>
        </div>
      </div>

      {/* ─── Method Filter ─────────────────────────────────────────── */}
      <MethodFilter selected={selectedMethod} onChange={setSelectedMethod} />

      {/* ─── Loading State ─────────────────────────────────────────── */}
      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <PayloadSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ─── Error State ───────────────────────────────────────────── */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Failed to load payloads.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* ─── Empty State ───────────────────────────────────────────── */}
      {!isPending && !isError && payloads.length === 0 && (
        <EmptyState
          icon={<Inbox className="w-10 h-10" />}
          title="No payloads yet"
          description={
            selectedMethod
              ? `No ${selectedMethod} requests received yet. Clear the filter to see all payloads.`
              : 'Send a request to your webhook URL to see it appear here.'
          }
        />
      )}

      {/* ─── Payload List ──────────────────────────────────────────── */}
      {!isPending && !isError && payloads.length > 0 && (
        <div className="space-y-2">
          {payloads.map((payload) => (
            // PayloadCard built in Part 7.3 — placeholder for now
            <div
              key={payload._id}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card text-sm text-muted-foreground"
            >
              <span className="font-mono font-semibold text-xs">
                {payload.method}
              </span>
              <span className="truncate">{payload._id}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Load More ─────────────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
};
