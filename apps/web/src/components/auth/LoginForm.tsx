import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@catchapi/shared';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { isAxiosError } from 'axios';

export const LoginForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const { setCredentials } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const response = await api.post<{
        _id: string;
        name: string;
        email: string;
        token: string;
      }>('/auth/login', data);

      setCredentials(response.data.token, {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      });

      // TODO: navigate('/dashboard')
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setServerError(error.response.data.message || 'Login failed');
      } else {
        setServerError('An unexpected error occurred');
      }
    }
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="block w-full pl-10 pr-3 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              {...register('password')}
              type="password"
              className="block w-full pl-10 pr-3 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};
