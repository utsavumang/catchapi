import { useState, useCallback } from 'react';
import { Inbox, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { PayloadSkeleton } from '@/components/payloads/PayloadSkeleton';
import { MethodFilter, HttpMethod } from '@/components/payloads/MethodFilter';
import { PayloadCard } from '@/components/payloads/PayloadCard';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useGetPayloads } from '@/hooks/usePayloads';
import { useEndpointSocket } from '@/hooks/useEndpointSocket';
import { exportPayloadsToJson } from '@/lib/export';
import { cn } from '@/lib/utils';
import { Payload } from '@/types';
import { UI } from '@/lib/constants';

interface PayloadListProps {
  endpointId: string;
  urlId: string;
  endpointName: string;
  selectedPayload: Payload | null;
  onSelectPayload: (payload: Payload) => void;
}

export const PayloadList = ({
  endpointId,
  urlId,
  endpointName,
  selectedPayload,
  onSelectPayload,
}: PayloadListProps) => {
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod | undefined>(
    undefined
  );
  const [newPayloadId, setNewPayloadId] = useState<string | null>(null);

  // stable reference
  const handleNewPayload = useCallback((payload: Payload) => {
    setNewPayloadId(payload._id);
    setTimeout(() => setNewPayloadId(null), 2000);
  }, []);

  const { connectionStatus, reconnectAttempt, reconnect } = useEndpointSocket({
    urlId,
    endpointId,
    onNewPayload: handleNewPayload,
  });

  const {
    data,
    isPending,
    isFetching,
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
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Incoming Payloads
            </h2>
            <ConnectionStatus
              status={connectionStatus}
              reconnectAttempt={reconnectAttempt}
              onReconnect={reconnect}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Requests received by this endpoint
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportPayloadsToJson(payloads, endpointName)}
          disabled={payloads.length === 0}
          className="shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Method Filter */}
      <MethodFilter selected={selectedMethod} onChange={setSelectedMethod} />

      {/* Loading State */}
      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <PayloadSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
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

      {/* Empty State */}
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

      {/* Payload List */}
      {!isPending && !isError && payloads.length > 0 && (
        <div
          className={cn(
            'space-y-2 transition-opacity duration-200',
            isFetching && !isFetchingNextPage ? 'opacity-50' : 'opacity-100'
          )}
        >
          {payloads.map((payload) => (
            <PayloadCard
              key={payload._id}
              payload={payload}
              isSelected={selectedPayload?._id === payload._id}
              onSelect={onSelectPayload}
              isNew={newPayloadId === payload._id}
            />
          ))}
        </div>
      )}

      {/* Load More */}
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
