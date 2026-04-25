import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Copy, Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDeleteEndpoint } from '@/hooks/useEndpoints';
import { EndpointWithUrl } from '@/types';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface EndpointCardProps {
  endpoint: EndpointWithUrl;
}

export const EndpointCard = ({ endpoint }: EndpointCardProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { mutate: deleteEndpoint, isPending: isDeleting } = useDeleteEndpoint();

  const handleCopy = async (e: React.MouseEvent) => {
    // Stop propagation so clicking copy doesn't navigate to the detail page
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(endpoint.fullUrl);
      setCopied(true);
      toast.success('Webhook URL copied to clipboard');
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteEndpoint(endpoint._id, {
      onSuccess: () => {
        toast.success('Endpoint deleted successfully');
        setDeleteOpen(false);
        // If currently viewing this endpoint's detail page, navigate back
        if (pathname.includes(endpoint.urlId)) {
          navigate(ROUTES.DASHBOARD);
        }
      },
      onError: () => {
        toast.error('Failed to delete endpoint');
        setDeleteOpen(false);
      },
    });
  };

  return (
    <>
      <div
        onClick={() => navigate(ROUTES.ENDPOINT_DETAIL(endpoint.urlId))}
        className="group p-5 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer space-y-3"
      >
        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {endpoint.name}
            </h3>
            {endpoint.description && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {endpoint.description}
              </p>
            )}
          </div>
          {/* Delete button — only visible on hover */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'shrink-0 text-muted-foreground transition-opacity',
              'opacity-0 group-hover:opacity-100',
              'hover:text-destructive hover:bg-destructive/10'
            )}
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* ─── Webhook URL ───────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <code className="flex-1 text-xs text-muted-foreground font-mono truncate">
            {endpoint.fullUrl}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground">
          Created{' '}
          {formatDistanceToNow(new Date(endpoint.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete endpoint"
        description={`Delete "${endpoint.name}"? All associated payloads will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  );
};
