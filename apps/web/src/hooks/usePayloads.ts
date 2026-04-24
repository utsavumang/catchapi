import { useInfiniteQuery } from '@tanstack/react-query';
import { getPayloads } from '@/lib/api/payloads.api';
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
    queryKey: queryKeys.payloads.byEndpoint(endpointId),
    queryFn: ({ pageParam }) =>
      getPayloads(endpointId, {
        cursor: pageParam as string | undefined,
        method,
        limit,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // If there are more pages, return the cursor for the next fetch
      return lastPage.hasMore && lastPage.nextCursor
        ? lastPage.nextCursor
        : undefined;
    },
    // Flatten all pages into a single array
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      payloads: data.pages.flatMap((page) => page.data as Payload[]),
      hasMore: data.pages[data.pages.length - 1]?.hasMore ?? false,
      nextCursor: data.pages[data.pages.length - 1]?.nextCursor ?? undefined,
    }),
  });
};
