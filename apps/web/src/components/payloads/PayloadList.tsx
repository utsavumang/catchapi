import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { PayloadSkeleton } from '@/components/payloads/PayloadSkeleton';
import { useGetPayloads } from '@/hooks/usePayloads';
import { UI } from '@/lib/constants';
import { MethodFilter, HttpMethod } from '@/components/payloads/MethodFilter';
import { PayloadCard } from '@/components/payloads/PayloadCard';
import { Payload } from '@/types';

interface PayloadListProps {
  endpointId: string;
  selectedPayload: Payload | null;
  onSelectPayload: (payload: Payload) => void;
  newPayloadId: string | null;
}

export const PayloadList = ({
  endpointId,
  selectedPayload,
  onSelectPayload,
  newPayloadId,
}: PayloadListProps) => {
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

      <MethodFilter selected={selectedMethod} onChange={setSelectedMethod} />

      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <PayloadSkeleton key={i} />
          ))}
        </div>
      )}

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

      {!isPending && !isError && payloads.length > 0 && (
        <div className="space-y-2">
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
