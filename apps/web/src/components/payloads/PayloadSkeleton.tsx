import { Skeleton } from '@/components/ui/skeleton';

export const PayloadSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card">
      <Skeleton className="h-5 w-14 rounded-md shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
};
