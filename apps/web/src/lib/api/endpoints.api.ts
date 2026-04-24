import { api } from '@/lib/axios';
import { CreateEndpointInput } from '@catchapi/shared';
import { EndpointWithUrl, ListResponse } from '@/types';

export const getEndpoints = async (): Promise<
  ListResponse<EndpointWithUrl>
> => {
  const response = await api.get<ListResponse<EndpointWithUrl>>('/endpoints');
  return response.data;
};

export const createEndpoint = async (
  data: CreateEndpointInput
): Promise<EndpointWithUrl> => {
  const response = await api.post<{ status: string; data: EndpointWithUrl }>(
    '/endpoints',
    data
  );
  return response.data.data;
};

export const deleteEndpoint = async (id: string): Promise<void> => {
  await api.delete(`/endpoints/${id}`);
};
