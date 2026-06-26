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

export const replayPayload = async (
  endpointId: string,
  payloadId: string,
  targetUrl: string
): Promise<{ statusCode: number; statusText: string; ok: boolean }> => {
  const response = await api.post<{
    status: string;
    data: { statusCode: number; statusText: string; ok: boolean };
  }>(`/endpoints/${endpointId}/payloads/${payloadId}/replay`, {
    targetUrl,
  });
  return response.data.data;
};
