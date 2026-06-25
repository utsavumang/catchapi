import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateProfileSchema,
  UpdateProfileInput,
  changePasswordSchema,
  ChangePasswordInput,
} from '@catchapi/shared';
import { User, Lock } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateProfile, useChangePassword } from '@/hooks/useAuth';

// Update Profile Form
const ProfileForm = () => {
  const user = useAuthStore((state) => state.user);
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    setServerError(null);
    updateProfileMutation(data, {
      onSuccess: (updatedUser) => {
        toast.success('Profile updated');
        reset({ name: updatedUser.name });
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response) {
          setServerError(
            error.response.data.message || 'Failed to update profile'
          );
        } else {
          setServerError('An unexpected error occurred');
        }
      },
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your display name.
        </p>
      </div>
      <Separator />
      {serverError && (
        <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive-foreground text-sm">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Name"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
          error={errors.name?.message}
        >
          <Input
            {...register('name')}
            placeholder="Your display name"
            className="pl-10"
            disabled={isPending}
          />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

// Change Password Form

const PasswordForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: changePasswordMutation, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordInput) => {
    setServerError(null);
    changePasswordMutation(data, {
      onSuccess: () => {
        // Toast appears briefly before logout and redirect
        toast.success('Password changed. Please log in again.');
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response) {
          setServerError(
            error.response.data.message || 'Failed to change password'
          );
        } else {
          setServerError('An unexpected error occurred');
        }
      },
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Password</h2>
        <p className="text-sm text-muted-foreground">
          Changing your password will sign you out of all active sessions.
        </p>
      </div>
      <Separator />
      {serverError && (
        <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive-foreground text-sm">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Current Password"
          icon={<Lock className="h-4 w-4 text-muted-foreground" />}
          error={errors.currentPassword?.message}
        >
          <Input
            {...register('currentPassword')}
            type="password"
            placeholder="••••••••"
            className="pl-10"
            disabled={isPending}
          />
        </FormField>
        <FormField
          label="New Password"
          icon={<Lock className="h-4 w-4 text-muted-foreground" />}
          error={errors.newPassword?.message}
        >
          <Input
            {...register('newPassword')}
            type="password"
            placeholder="••••••••"
            className="pl-10"
            disabled={isPending}
          />
        </FormField>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
};

// Page

export const SettingsPage = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings."
      />
      <ProfileForm />
      <PasswordForm />
    </div>
  );
};
