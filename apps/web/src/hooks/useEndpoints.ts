import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getEndpoints,
  createEndpoint,
  deleteEndpoint,
} from '@/lib/api/endpoints.api';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/constants';
import { CreateEndpointInput } from '@catchapi/shared';

export const useGetEndpoints = () => {
  return useQuery({
    queryKey: queryKeys.endpoints.list(),
    queryFn: getEndpoints,
  });
};

export const useCreateEndpoint = () => {
  return useMutation({
    mutationFn: (data: CreateEndpointInput) => createEndpoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.endpoints.list(),
      });
    },
  });
};

export const useDeleteEndpoint = () => {
  return useMutation({
    mutationFn: (id: string) => deleteEndpoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.endpoints.list(),
      });
    },
  });
};
