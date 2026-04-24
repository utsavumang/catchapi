import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@catchapi/shared';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';

import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/useAuth';

export const LoginForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    login(data, {
      onError: (error) => {
        if (isAxiosError(error) && error.response) {
          setServerError(error.response.data.message || 'Login failed');
        } else {
          setServerError('An unexpected error occurred');
        }
      },
    });
  };

  return (
    <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-2xl border border-border">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome Back
        </h2>
        <p className="text-muted-foreground">
          Sign in to your CatchAPI dashboard.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive-foreground text-sm text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="Email Address"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          error={errors.email?.message}
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="pl-10"
          />
        </FormField>

        <FormField
          label="Password"
          icon={<Lock className="h-4 w-4 text-muted-foreground" />}
          error={errors.password?.message}
        >
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="pl-10"
          />
        </FormField>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-primary hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
};
