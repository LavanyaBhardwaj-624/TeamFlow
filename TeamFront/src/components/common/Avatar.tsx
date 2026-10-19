import React, { useState } from 'react';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  showOnline,
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-block shrink-0 select-none', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-medium overflow-hidden border border-line bg-surface-secondary text-ink',
          sizeClasses[size]
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-surface" />
      )}
    </div>
  );
};

