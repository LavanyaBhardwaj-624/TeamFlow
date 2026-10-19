import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this resource. Please check your connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-red-500/20 bg-red-500/5 rounded-xl max-w-lg mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 border border-red-500/20">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

