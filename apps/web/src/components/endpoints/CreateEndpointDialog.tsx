import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEndpointSchema, CreateEndpointInput } from '@catchapi/shared';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateEndpoint } from '@/hooks/useEndpoints';

interface CreateEndpointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEndpointDialog = ({
  open,
  onOpenChange,
}: CreateEndpointDialogProps) => {
  const { mutate: createEndpoint, isPending } = useCreateEndpoint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEndpointInput>({
    resolver: zodResolver(createEndpointSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Reset form whenever dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: CreateEndpointInput) => {
    const payload: CreateEndpointInput = {
      name: data.name?.trim() || undefined,
      description: data.description?.trim() || undefined,
    };

    createEndpoint(payload, {
      onSuccess: (newEndpoint) => {
        toast.success(`Endpoint "${newEndpoint.name}" created`);
        onOpenChange(false);
      },
      onError: () => {
        toast.error('Failed to create endpoint');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Endpoint</DialogTitle>
          <DialogDescription>
            Create a webhook endpoint to start catching incoming requests. Name
            and description are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. GitHub Webhooks"
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="e.g. Receives push and PR events"
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Endpoint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
