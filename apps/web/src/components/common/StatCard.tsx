import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export const StatCard = ({ label, value, className }: StatCardProps) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg px-5 py-4',
        className
      )}
    >
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
};
