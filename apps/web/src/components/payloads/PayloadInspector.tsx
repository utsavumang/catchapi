import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MethodBadge } from '@/components/payloads/MethodBadge';
import { Payload } from '@/types';

interface PayloadInspectorProps {
  payload: Payload;
  onClose: () => void;
}

const JsonDisplay = ({ data }: { data: unknown }) => {
  const isEmpty =
    data === null ||
    data === undefined ||
    (typeof data === 'object' && Object.keys(data as object).length === 0);

  if (isEmpty) {
    return <p className="text-xs text-muted-foreground italic p-4">Empty</p>;
  }

  return (
    <pre className="text-xs font-mono text-foreground p-4 overflow-auto whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

export const PayloadInspector = ({
  payload,
  onClose,
}: PayloadInspectorProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      toast.success('Payload copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy payload');
    }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      {/* ─── Inspector Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <MethodBadge method={payload.method} />
            <span className="text-xs text-muted-foreground font-mono truncate">
              {payload._id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(payload.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>·</span>
            <span>
              {format(new Date(payload.createdAt), 'MMM d, yyyy, HH:mm:ss')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopyRaw}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────── */}
      <Tabs defaultValue="body" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent justify-start px-4 h-10 shrink-0">
          <TabsTrigger
            value="body"
            className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Body
          </TabsTrigger>
          <TabsTrigger
            value="headers"
            className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Headers
          </TabsTrigger>
          <TabsTrigger
            value="query"
            className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
          >
            Query
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="body"
          className="flex-1 overflow-auto m-0 bg-background/50"
        >
          <JsonDisplay data={payload.body} />
        </TabsContent>

        <TabsContent
          value="headers"
          className="flex-1 overflow-auto m-0 bg-background/50"
        >
          <JsonDisplay data={payload.headers} />
        </TabsContent>

        <TabsContent
          value="query"
          className="flex-1 overflow-auto m-0 bg-background/50"
        >
          <JsonDisplay data={payload.query} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
