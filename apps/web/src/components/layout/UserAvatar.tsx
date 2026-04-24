import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  className?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const UserAvatar = ({ name, className }: UserAvatarProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0',
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};
