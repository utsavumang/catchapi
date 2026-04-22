import { cn } from '@/lib/utils';

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
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        {children}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
