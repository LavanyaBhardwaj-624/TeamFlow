import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
  width?: 'md' | 'lg' | 'xl';
}

const widthMap = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  width = 'lg',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex bg-ink/35 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={cn(
          'relative flex h-full w-full flex-col border-line bg-surface shadow-modal transition-transform duration-200',
          side === 'right' ? 'ml-auto border-l animate-in slide-in-from-right' : 'mr-auto border-r animate-in slide-in-from-left',
          widthMap[width]
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
            {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

