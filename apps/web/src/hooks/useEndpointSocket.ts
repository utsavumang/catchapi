import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/constants';
import { SOCKET_EVENTS } from '@catchapi/shared';
import { InfiniteData } from '@tanstack/react-query';
import {
  Payload,
  PaginatedPayloads,
  EndpointWithUrl,
  ListResponse,
} from '@/types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseEndpointSocketOptions {
  urlId: string;
  endpointId: string;
  onNewPayload?: (payload: Payload) => void;
}

interface UseEndpointSocketReturn {
  connectionStatus: ConnectionStatus;
  reconnectAttempt: number;
  reconnect: () => void;
}

const createSocket = (token: string): Socket => {
  return io(import.meta.env.VITE_API_URL.replace('/api/v1', ''), {
    auth: { token },
    transports: ['websocket'],

    reconnection: false,
  });
};

export const useEndpointSocket = ({
  urlId,
  endpointId,
  onNewPayload,
}: UseEndpointSocketOptions): UseEndpointSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const isFirstConnect = useRef(true);

  const bindSocketEvents = useCallback(
    (socket: Socket) => {
      socket.on('connect', () => {
        setConnectionStatus('connected');
        setReconnectAttempt(0);
        socket.emit(SOCKET_EVENTS.JOIN_ENDPOINT, urlId);

        if (!isFirstConnect.current) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.payloads.byEndpoint(endpointId),
          });
        }
        isFirstConnect.current = false;
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
            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  data: [payload, ...firstPage.data],
                  results: firstPage.results + 1,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        );

        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey as unknown[];
            return (
              key[0] === 'payloads' && key[1] === endpointId && key.length > 2 // has a method filter
            );
          },
        });

        queryClient.setQueryData<ListResponse<EndpointWithUrl>>(
          queryKeys.endpoints.list(),
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((ep) =>
                ep._id === endpointId
                  ? {
                      ...ep,
                      payloadCount: ep.payloadCount + 1,
                      lastReceivedAt: new Date().toISOString(),
                    }
                  : ep
              ),
            };
          }
        );

        queryClient.setQueryData<EndpointWithUrl>(
          queryKeys.endpoints.detail(urlId),
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              payloadCount: oldData.payloadCount + 1,
              lastReceivedAt: new Date().toISOString(),
            };
          }
        );

        onNewPayload?.(payload);
      });
    },
    [urlId, endpointId, onNewPayload]
  );

  useEffect(() => {
    const token = useAuthStore.getState().token;

    if (!token || !urlId || !endpointId) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    const socket = createSocket(token);
    socketRef.current = socket;
    bindSocketEvents(socket);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ENDPOINT, urlId);
      socket.disconnect();
      socketRef.current = null;
      setConnectionStatus('disconnected');
    };
  }, [urlId, endpointId, bindSocketEvents]);

  const reconnect = useCallback(() => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ENDPOINT, urlId);
      socketRef.current.disconnect();
    }

    setConnectionStatus('connecting');
    setReconnectAttempt((prev) => prev + 1);

    const socket = createSocket(token);
    socketRef.current = socket;
    bindSocketEvents(socket);
  }, [urlId, bindSocketEvents]);

  return { connectionStatus, reconnectAttempt, reconnect };
};
