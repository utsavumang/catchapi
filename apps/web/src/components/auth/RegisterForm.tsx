import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@catchapi/shared';
import { User, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';

import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRegister } from '@/hooks/useAuth';

export const RegisterForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: registerMutation, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    setServerError(null);
    registerMutation(data, {
      onError: (error) => {
        if (isAxiosError(error) && error.response) {
          setServerError(error.response.data.message || 'Registration failed');
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
          icon={<User className="h-4 w-4 text-muted-foreground" />}
          error={errors.name?.message}
        >
          <Input
            {...register('name')}
            type="text"
            placeholder="John Doe"
            className="pl-10"
          />
        </FormField>

        <FormField
          label="Email Address"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          error={errors.email?.message}
        >
          <Input
            {...registerField('email')}
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
            {...registerField('password')}
            type="password"
            placeholder="••••••••"
            className="pl-10"
          />
        </FormField>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Creating account...' : 'Sign Up'}
        </Button>
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
