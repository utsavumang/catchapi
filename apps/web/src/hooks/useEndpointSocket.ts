import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/constants';
import { SOCKET_EVENTS } from '@catchapi/shared';
import { Payload, PaginatedPayloads } from '@/types';
import { InfiniteData } from '@tanstack/react-query';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseEndpointSocketOptions {
  urlId: string;
  endpointId: string;
  onNewPayload?: (payload: Payload) => void;
}

interface UseEndpointSocketReturn {
  connectionStatus: ConnectionStatus;
}

export const useEndpointSocket = ({
  urlId,
  endpointId,
  onNewPayload,
}: UseEndpointSocketOptions): UseEndpointSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const token = useAuthStore.getState().token;

    if (!token || !urlId || !endpointId) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    const socket = io(import.meta.env.VITE_API_URL.replace('/api/v1', ''), {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit(SOCKET_EVENTS.JOIN_ENDPOINT, urlId);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    socket.on(SOCKET_EVENTS.JOINED, ({ room }: { room: string }) => {
      console.info(`Socket joined room: ${room}`);
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
      setConnectionStatus('disconnected');
    };
  }, [urlId, endpointId, onNewPayload]);

  return { connectionStatus };
};
