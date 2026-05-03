import { cn } from '@/lib/utils';
import { ConnectionStatus as ConnectionStatusType } from '@/hooks/useEndpointSocket';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  reconnectAttempt?: number;
  onReconnect?: () => void;
  className?: string;
}

const statusConfig: Record<
  ConnectionStatusType,
  { label: string; dotClass: string; textClass: string }
> = {
  connected: {
    label: 'Live',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
  },
  connecting: {
    label: 'Connecting',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-500',
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-red-500',
    textClass: 'text-red-500',
  },
};

export const ConnectionStatus = ({
  status,
  reconnectAttempt = 0,
  onReconnect,
  className,
}: ConnectionStatusProps) => {
  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          {status === 'connected' && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                config.dotClass
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              config.dotClass
            )}
          />
        </span>
        <span className={cn('text-xs font-medium', config.textClass)}>
          {status === 'connecting' && reconnectAttempt > 0
            ? `Reconnecting... (${reconnectAttempt})`
            : config.label}
        </span>
      </div>

      {status === 'disconnected' && onReconnect && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onReconnect}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Reconnect
        </Button>
      )}
    </div>
  );
};
