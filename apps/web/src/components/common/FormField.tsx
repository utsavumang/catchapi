import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  icon,
  error,
  children,
  className,
}: FormFieldProps) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label className="text-foreground">{label}</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          {icon}
        </div>
        {children}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
