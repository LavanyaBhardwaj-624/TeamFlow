import React from 'react';
import { Avatar } from './Avatar';
import { User } from '@/types';
import { cn } from '@/lib/utils';

export interface AvatarGroupProps {
  users: (User | undefined)[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 3,
  size = 'sm',
  className,
}) => {
  const validUsers = users.filter((u): u is User => Boolean(u));
  const visibleUsers = validUsers.slice(0, max);
  const remainingCount = validUsers.length - max;

  return (
    <div className={cn('flex items-center -space-x-2 overflow-hidden', className)}>
      {visibleUsers.map((user) => (
        <Avatar
          key={user.id}
          name={user.name}
          src={user.image}
          size={size}
          className="ring-2 ring-surface"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-secondary text-ink-muted ring-2 ring-surface border border-line font-medium',
            size === 'xs' ? 'w-6 h-6 text-[10px]' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

