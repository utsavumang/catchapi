import { formatDistanceToNow } from 'date-fns';
import { MethodBadge } from '@/components/payloads/MethodBadge';
import { Payload } from '@/types';
import { cn } from '@/lib/utils';

interface PayloadCardProps {
  payload: Payload;
  isSelected: boolean;
  onSelect: (payload: Payload) => void;
  isNew?: boolean;
}

const getBodyPreview = (body: Payload['body']): string => {
  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    return 'No body';
  }
  if (typeof body === 'string') {
    return body.slice(0, 80);
  }
  return JSON.stringify(body).slice(0, 80);
};

export const PayloadCard = ({
  payload,
  isSelected,
  onSelect,
  isNew = false,
}: PayloadCardProps) => {
  return (
    <div
      onClick={() => onSelect(payload)}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-300',
        isSelected
          ? 'border-primary/50 bg-primary/5'
          : isNew
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-border bg-card hover:border-border/80 hover:bg-card/80'
      )}
    >
      <MethodBadge method={payload.method} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground font-mono truncate">
          {getBodyPreview(payload.body)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(payload.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
};
