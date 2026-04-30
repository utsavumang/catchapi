import { cn } from '@/lib/utils';
import { HttpMethod } from '@/components/payloads/MethodFilter';

const methodStyles: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const defaultStyle = 'bg-secondary text-muted-foreground border-border';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export const MethodBadge = ({ method, className }: MethodBadgeProps) => {
  const style = methodStyles[method as HttpMethod] ?? defaultStyle;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-semibold rounded border shrink-0',
        style,
        className
      )}
    >
      {method}
    </span>
  );
};
