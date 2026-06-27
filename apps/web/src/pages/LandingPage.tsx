import { Link } from 'react-router-dom';
import { Webhook, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants';

const ProductMock = () => (
  <div className="relative">
    <div className="absolute -inset-6 bg-primary/8 blur-3xl rounded-full -z-10" />

    <div className="rounded-xl border border-border bg-card shadow-2xl ring-1 ring-white/5 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-foreground text-sm">
            GitHub Webhooks
          </span>
          <span className="text-xs font-mono bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
            3
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-500 font-medium">Live</span>
        </div>
      </div>

      {/* URL */}
      <div className="px-4 py-2.5 border-b border-border bg-background/50">
        <code className="text-xs text-muted-foreground font-mono">
          https://catchapi.app/w/7c5ebd5fb5
        </code>
      </div>

      {/* rows */}
      {[
        {
          method: 'POST',
          preview: '{"event": "push", "ref": "refs/heads/main"}',
          time: 'just now',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          isNew: true,
        },
        {
          method: 'POST',
          preview: '{"event": "pull_request", "action": "opened"}',
          time: '2 minutes ago',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          isNew: false,
        },
        {
          method: 'GET',
          preview: 'No body',
          time: '5 minutes ago',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          isNew: false,
        },
      ].map((item, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
            item.isNew
              ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500/50'
              : ''
          }`}
        >
          <span
            className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${item.badge}`}
          >
            {item.method}
          </span>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-xs text-muted-foreground font-mono truncate">
              {item.preview}
            </p>
            <p className="text-xs text-muted-foreground/60">{item.time}</p>
          </div>
        </div>
      ))}

      <div className="h-8 bg-gradient-to-b from-transparent to-card" />
    </div>
  </div>
);

const features = [
  {
    icon: <Webhook className="w-5 h-5 text-primary" />,
    title: 'Instant Endpoints',
    description:
      'Generate a webhook URL in one click. Point any service at it immediately. Needs no setup, or configuration.',
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: 'Real-Time Delivery',
    description:
      'Incoming webhooks appear instantly via WebSockets. Watch payloads arrive without refreshing.',
  },
  {
    icon: <Eye className="w-5 h-5 text-primary" />,
    title: 'Full Inspection',
    description:
      'Explore headers, body, and query params. Filter by HTTP method. Export payloads as JSON.',
  },
];

// Landing Page

export const LandingPage = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  const apiDocsUrl = import.meta.env.VITE_API_URL?.replace(
    '/api/v1',
    '/api/docs'
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
              <Webhook className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">
              Catch<span className="text-primary">API</span>
            </span>
          </Link>

          {/* Nav CTAs */}
          <div className="h-9 flex items-center">
            {!isLoading &&
              (isAuthenticated ? (
                <Button asChild>
                  <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" asChild>
                    <Link to={ROUTES.LOGIN}>Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to={ROUTES.REGISTER}>Get Started</Link>
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </header>

      {/*  Hero */}
      <section className="flex-1 flex items-center pt-16">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy and CTAs */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
                Inspect every webhook,{' '}
                <span className="text-primary">in real time.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Generate an endpoint URL, point any service at it, and inspect
                incoming requests as they arrive.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="h-11 flex items-center">
              {!isLoading &&
                (isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button size="lg" asChild>
                      <Link to={ROUTES.REGISTER}>Get Started — it's free</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to={ROUTES.LOGIN}>Sign In</Link>
                    </Button>
                  </div>
                ))}
            </div>

            {/* tech note */}
            <p className="text-sm text-muted-foreground">
              Built with TypeScript, React, Node.js, and Socket.io.{' '}
              <a
                href={apiDocsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                View the API docs →
              </a>
            </p>
          </div>

          {/* product mock in right */}
          <div className="relative">
            <ProductMock />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-6 space-y-3"
              >
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary">
              <Webhook className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Catch<span className="text-primary">API</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/utsavumang/catchapi"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href={apiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
