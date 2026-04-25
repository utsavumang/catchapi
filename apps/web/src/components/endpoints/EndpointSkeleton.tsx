import { Skeleton } from '@/components/ui/skeleton';

export const EndpointSkeleton = () => {
  return (
    <div className="p-5 rounded-lg border border-border bg-card space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
};
