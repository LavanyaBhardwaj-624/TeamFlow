import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors border select-none',
  {
    variants: {
      variant: {
        default: 'bg-surface-secondary text-ink border-line',
        primary: 'bg-brand/10 text-brand border-brand/20',
        secondary: 'bg-surface-secondary text-ink-muted border-line',
        outline: 'border-line text-ink bg-transparent',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        roleAdmin: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 font-semibold',
        roleMember: 'bg-surface-secondary text-ink-muted border-line',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.2',
        md: 'text-xs px-2 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, size, dotColor, children, ...props }) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dotColor && <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 shrink-0', dotColor)} />}
      {children}
    </span>
  );
};

