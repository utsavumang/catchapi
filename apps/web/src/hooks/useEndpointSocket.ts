import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/constants';
import { SOCKET_EVENTS } from '@catchapi/shared';
import { Payload, PaginatedPayloads } from '@/types';
import { InfiniteData } from '@tanstack/react-query';

interface UseEndpointSocketOptions {
  urlId: string;
  endpointId: string;
  onNewPayload?: (payload: Payload) => void;
}

export const useEndpointSocket = ({
  urlId,
  endpointId,
  onNewPayload,
}: UseEndpointSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = useAuthStore.getState().token;

    if (!token || !urlId || !endpointId) return;

    const socket = io(import.meta.env.VITE_API_URL.replace('/api/v1', ''), {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit(SOCKET_EVENTS.JOIN_ENDPOINT, urlId);
    });

    socket.on(SOCKET_EVENTS.JOINED, ({ room }: { room: string }) => {
      console.info(`Socket joined room: ${room}`);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on(SOCKET_EVENTS.PAYLOAD_NEW, (payload: Payload) => {
      queryClient.setQueryData<InfiniteData<PaginatedPayloads>>(
        queryKeys.payloads.byEndpoint(endpointId),
        (oldData) => {
          if (!oldData) return oldData;

          const firstPage = oldData.pages[0];
          const updatedFirstPage: PaginatedPayloads = {
            ...firstPage,
            data: [payload, ...firstPage.data],
            results: firstPage.results + 1,
          };

          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          };
        }
      );

      onNewPayload?.(payload);
    });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ENDPOINT, urlId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [urlId, endpointId, onNewPayload]);

  return { socket: socketRef.current };
};
