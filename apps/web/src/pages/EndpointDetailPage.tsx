import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { EndpointHeader } from '@/components/endpoints/EndpointHeader';
import { PayloadList } from '@/components/payloads/PayloadList';
import { PayloadInspector } from '@/components/payloads/PayloadInspector';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetEndpoint } from '@/hooks/useEndpoints';
import { useEndpointSocket } from '@/hooks/useEndpointSocket';
import { Payload } from '@/types';
import { ROUTES } from '@/lib/constants';

export const EndpointDetailPage = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const navigate = useNavigate();
  const { data: endpoint, isPending, isError } = useGetEndpoint(urlId ?? '');
  const [selectedPayload, setSelectedPayload] = useState<Payload | null>(null);
  const [newPayloadId, setNewPayloadId] = useState<string | null>(null);

  const handleNewPayload = useCallback((payload: Payload) => {
    setNewPayloadId(payload._id);
    setTimeout(() => setNewPayloadId(null), 2000);
  }, []);

  const { connectionStatus } = useEndpointSocket({
    urlId: urlId ?? '',
    endpointId: endpoint?._id ?? '',
    onNewPayload: handleNewPayload,
  });

  useEffect(() => {
    if (isError) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isError, navigate]);

  useEffect(() => {
    setSelectedPayload(null);
  }, [urlId]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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

      {!isPending && endpoint && (
        <>
          <EndpointHeader endpoint={endpoint} />
          <Separator />

          <div
            className={
              selectedPayload
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'
                : 'block'
            }
          >
            <div>
              <PayloadList
                endpointId={endpoint._id}
                selectedPayload={selectedPayload}
                onSelectPayload={setSelectedPayload}
                newPayloadId={newPayloadId}
                connectionStatus={connectionStatus}
              />
            </div>

            {selectedPayload && (
              <div className="lg:sticky lg:top-6">
                <PayloadInspector
                  payload={selectedPayload}
                  onClose={() => setSelectedPayload(null)}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
