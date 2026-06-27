import { Link } from 'react-router-dom';
import { Webhook, Check } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ROUTES } from '@/lib/constants';

const features = [
  'Generate webhook endpoint URLs instantly',
  'Inspect headers, body, and query params in real time',
  'Filter by HTTP method & export payloads as JSON',
];

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* left panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-card border-r border-border shrink-0">
        {/* logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 w-fit">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Webhook className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">
            Catch<span className="text-primary">API</span>
          </span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground leading-snug">
              Start catching webhooks
              <br />
              in under a minute.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create a free account and get your first endpoint URL immediately.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Built with TypeScript · React · Socket.io · MongoDB
        </p>
      </div>

      {/* right Panel form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <RegisterForm />
      </div>
    </div>
  );
};
