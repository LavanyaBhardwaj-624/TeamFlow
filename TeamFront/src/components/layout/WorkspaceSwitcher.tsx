import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, FolderKanban, Plus } from 'lucide-react';
import { workspaceService } from '@/services/workspace.service';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface WorkspaceSwitcherProps {
  onCreateWorkspaceClick?: () => void;
  collapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  onCreateWorkspaceClick,
  collapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  const { data } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces(),
  });

  const workspaces = data?.data || [];
  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentWorkspace) {
    return <div className="h-10 animate-pulse rounded-lg bg-surface-secondary" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-line bg-surface p-2 text-left transition-all hover:bg-surface-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          collapsed && 'justify-center p-2'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground font-semibold text-xs shadow-subtle">
            {currentWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink leading-tight">
                {currentWorkspace.name}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {currentWorkspace.members.length} members
              </p>
            </div>
          )}
        </div>
        {!collapsed && <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-muted ml-1" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-dropdown animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            Workspaces
          </div>
          <div className="space-y-1">
            {workspaces.map((ws) => {
              const isSelected = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors',
                    isSelected
                      ? 'bg-brand/10 font-semibold text-brand'
                      : 'text-ink hover:bg-surface-secondary'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold',
                        isSelected
                          ? 'bg-brand text-white'
                          : 'bg-surface-secondary text-ink-muted border border-line'
                      )}
                    >
                      {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-brand ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="my-1.5 border-t border-line" />

          {onCreateWorkspaceClick && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onCreateWorkspaceClick();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Workspace</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

