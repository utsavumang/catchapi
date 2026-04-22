import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@catchapi/shared';
import { User, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { FormField } from '@/components/common/FormField';

export const RegisterForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const { setCredentials } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const response = await api.post<{
        _id: string;
        name: string;
        email: string;
        token: string;
      }>('/auth/register', data);

      setCredentials(response.data.token, {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      });

      navigate('/dashboard');
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setServerError(error.response.data.message || 'Registration failed');
      } else {
        setServerError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-2xl border border-border">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Create Account
        </h2>
        <p className="text-muted-foreground">
          Join CatchAPI to manage your webhooks.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive-foreground text-sm text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="Full Name"
          icon={<User className="h-5 w-5 text-muted-foreground" />}
          error={errors.name?.message}
        >
          <input
            {...register('name')}
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </FormField>

        <FormField
          label="Email Address"
          icon={<Mail className="h-5 w-5 text-muted-foreground" />}
          error={errors.email?.message}
        >
          <input
            {...register('email')}
            type="email"
            className="block w-full pl-10 pr-3 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </FormField>

        <FormField
          label="Password"
          icon={<Lock className="h-5 w-5 text-muted-foreground" />}
          error={errors.password?.message}
        >
          <input
            {...register('password')}
            type="password"
            className="block w-full pl-10 pr-3 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};
