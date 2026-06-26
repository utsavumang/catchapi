import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Copy, Check, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useReplayPayload } from '@/hooks/usePayloads';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MethodBadge } from '@/components/payloads/MethodBadge';
import { Payload } from '@/types';
import { Highlight, themes } from 'prism-react-renderer';

interface PayloadInspectorProps {
  payload: Payload;
  onClose: () => void;
}

const JsonViewer = ({ data }: { data: unknown }) => {
  const isEmpty =
    data === null ||
    data === undefined ||
    (typeof data === 'object' && Object.keys(data as object).length === 0);

  if (isEmpty) {
    return <p className="text-xs text-muted-foreground italic p-4">Empty</p>;
  }

  const json = JSON.stringify(data, null, 2);

  return (
    <Highlight theme={themes.vsDark} code={json} language="json">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className="text-xs font-mono p-4 overflow-auto whitespace-pre-wrap break-all"
          style={{ ...style, background: 'transparent', margin: 0 }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export const PayloadInspector = ({
  payload,
  onClose,
}: PayloadInspectorProps) => {
  const [copied, setCopied] = useState(false);

  const [replayOpen, setReplayOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const {
    mutate: replay,
    isPending: isReplaying,
    data: replayResult,
    reset: resetReplay,
  } = useReplayPayload();

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
      {/* Inspector Header */}
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
            title="Copy raw payload"
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
            title="Replay payload"
            onClick={() => {
              setReplayOpen((prev) => !prev);
              setTargetUrl('');
              resetReplay();
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
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

      {/* Replay Row */}
      {replayOpen && (
        <div className="px-4 py-2 border-b border-border bg-secondary/30 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="https://your-server.com/webhook"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="h-7 text-xs"
              disabled={isReplaying}
            />
            <Button
              size="sm"
              className="h-7 text-xs shrink-0"
              disabled={!targetUrl.trim() || isReplaying}
              onClick={() => {
                try {
                  new URL(targetUrl);
                } catch {
                  toast.error('Enter a valid URL');
                  return;
                }
                replay({
                  endpointId: payload.endpointId,
                  payloadId: payload._id,
                  targetUrl,
                });
              }}
            >
              {isReplaying ? 'Sending...' : 'Send'}
            </Button>
          </div>
          {replayResult && (
            <p
              className={`text-xs font-mono ${
                replayResult.ok ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {replayResult.ok ? '✓' : '✗'} {replayResult.statusCode}{' '}
              {replayResult.statusText}
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
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
          <JsonViewer data={payload.body} />
        </TabsContent>

        <TabsContent
          value="headers"
          className="flex-1 overflow-auto m-0 bg-background/50"
        >
          <JsonViewer data={payload.headers} />
        </TabsContent>

        <TabsContent
          value="query"
          className="flex-1 overflow-auto m-0 bg-background/50"
        >
          <JsonViewer data={payload.query} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
