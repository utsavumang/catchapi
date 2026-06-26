import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { getPayloads, replayPayload } from '@/lib/api/payloads.api';
import { queryKeys } from '@/lib/constants';
import { Payload } from '@/types';

interface UseGetPayloadsParams {
  endpointId: string;
  method?: string;
  limit?: number;
}

export const useGetPayloads = ({
  endpointId,
  method,
  limit = 50,
}: UseGetPayloadsParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.payloads.byEndpoint(endpointId, method),
    queryFn: ({ pageParam }) =>
      getPayloads(endpointId, {
        cursor: pageParam as string | undefined,
        method,
        limit,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // return cursor if more pages
      return lastPage.hasMore && lastPage.nextCursor
        ? lastPage.nextCursor
        : undefined;
    },
    // flatten all pages
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      payloads: data.pages.flatMap((page) => page.data as Payload[]),
      hasMore: data.pages[data.pages.length - 1]?.hasMore ?? false,
      nextCursor: data.pages[data.pages.length - 1]?.nextCursor ?? undefined,
    }),
  });
};

export const useReplayPayload = () => {
  return useMutation({
    mutationFn: ({
      endpointId,
      payloadId,
      targetUrl,
    }: {
      endpointId: string;
      payloadId: string;
      targetUrl: string;
    }) => replayPayload(endpointId, payloadId, targetUrl),
  });
};
