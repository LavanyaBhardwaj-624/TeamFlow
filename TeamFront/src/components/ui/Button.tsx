import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-brand text-brand-foreground hover:bg-brand-hover shadow-subtle active:translate-y-[0.5px]',
        secondary: 'bg-surface-secondary text-ink hover:bg-surface-hover border border-line active:translate-y-[0.5px]',
        outline: 'border border-line bg-transparent text-ink hover:bg-surface-secondary active:translate-y-[0.5px]',
        ghost: 'text-ink hover:bg-surface-hover hover:text-ink',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:translate-y-[0.5px]',
        subtleBrand: 'bg-brand/10 text-brand hover:bg-brand/15 active:translate-y-[0.5px]',
      },
      size: {
        sm: 'h-8 px-2.5 text-xs gap-1.5',
        md: 'h-9 px-3.5 text-sm gap-2',
        lg: 'h-11 px-5 text-base gap-2.5',
        icon: 'h-9 w-9 p-0',
        iconSm: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

