import { cn } from '@/lib/utils';
import { ConnectionStatus as ConnectionStatusType } from '@/hooks/useEndpointSocket';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
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
  className,
}: ConnectionStatusProps) => {
  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="relative flex h-2 w-2">
        {/* Ping animation — only on connected state */}
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
        {config.label}
      </span>
    </div>
  );
};
