import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Copy, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDeleteEndpoint } from '@/hooks/useEndpoints';
import { EndpointWithUrl } from '@/types';
import { ROUTES } from '@/lib/constants';

interface EndpointHeaderProps {
  endpoint: EndpointWithUrl;
}

export const EndpointHeader = ({ endpoint }: EndpointHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: deleteEndpoint, isPending: isDeleting } = useDeleteEndpoint();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint.fullUrl);
      setCopied(true);
      toast.success('Webhook URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleConfirmDelete = () => {
    deleteEndpoint(endpoint._id, {
      onSuccess: () => {
        toast.success('Endpoint deleted');
        setDeleteOpen(false);
        navigate(ROUTES.DASHBOARD);
      },
      onError: () => {
        toast.error('Failed to delete endpoint');
        setDeleteOpen(false);
      },
    });
  };

  return (
    <>
      <div className="space-y-4">
        {/* ─── Breadcrumb ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="hover:text-foreground transition-colors"
          >
            Endpoints
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate">
            {endpoint.name}
          </span>
        </div>

        {/* ─── Title Row ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">
              {endpoint.name}
            </h1>
            {endpoint.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {endpoint.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* ─── Webhook URL ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background border border-border cursor-text">
          <code className="flex-1 text-sm text-muted-foreground font-mono truncate">
            {endpoint.fullUrl}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
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
