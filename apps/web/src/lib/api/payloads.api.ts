import { api } from '@/lib/axios';
import { GetPayloadsQuery } from '@catchapi/shared';
import { PaginatedPayloads } from '@/types';

export const getPayloads = async (
  endpointId: string,
  params: Partial<GetPayloadsQuery> & { cursor?: string }
): Promise<PaginatedPayloads> => {
  const response = await api.get<PaginatedPayloads>(
    `/endpoints/${endpointId}/payloads`,
    { params }
  );
  return response.data;
};
