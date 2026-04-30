import { cn } from '@/lib/utils';

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof METHODS)[number];

const methodStyles: Record<HttpMethod, string> = {
  GET: 'data-[active=true]:bg-emerald-500/10 data-[active=true]:text-emerald-400 data-[active=true]:border-emerald-500/30',
  POST: 'data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 data-[active=true]:border-blue-500/30',
  PUT: 'data-[active=true]:bg-amber-500/10 data-[active=true]:text-amber-400 data-[active=true]:border-amber-500/30',
  PATCH:
    'data-[active=true]:bg-purple-500/10 data-[active=true]:text-purple-400 data-[active=true]:border-purple-500/30',
  DELETE:
    'data-[active=true]:bg-red-500/10 data-[active=true]:text-red-400 data-[active=true]:border-red-500/30',
};

interface MethodFilterProps {
  selected: HttpMethod | undefined;
  onChange: (method: HttpMethod | undefined) => void;
}

export const MethodFilter = ({ selected, onChange }: MethodFilterProps) => {
  const handleClick = (method: HttpMethod) => {
    // Clicking the active method clears the filter
    onChange(selected === method ? undefined : method);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Filter:</span>
      {METHODS.map((method) => (
        <button
          key={method}
          data-active={selected === method}
          onClick={() => handleClick(method)}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-semibold rounded border transition-colors',
            'border-border text-muted-foreground hover:text-foreground hover:border-border/80',
            methodStyles[method]
          )}
        >
          {method}
        </button>
      ))}
      {selected && (
        <button
          onClick={() => onChange(undefined)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
};
