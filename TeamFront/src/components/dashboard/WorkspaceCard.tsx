import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Users } from 'lucide-react';
import { Workspace, Task } from '@/types';
import { AvatarGroup } from '@/components/common/AvatarGroup';
import { Button } from '@/components/ui/Button';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { cn } from '@/lib/utils';

export interface WorkspaceCardProps {
  workspace: Workspace;
  tasks: Task[];
  isActive: boolean;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  tasks,
  isActive,
}) => {
  const navigate = useNavigate();
  const { setActiveWorkspaceId } = useWorkspaceStore();

  const workspaceTasks = tasks.filter((t) => t.workspaceId === workspace.id);
  const totalTasks = workspaceTasks.length;
  const completedTasks = workspaceTasks.filter((t) => t.status === 'DONE').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleOpenWorkspace = () => {
    setActiveWorkspaceId(workspace.id);
    navigate(`/workspace/${workspace.id}/tasks`);
  };

  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-xl border bg-surface p-5 shadow-subtle transition-all duration-150',
        isActive
          ? 'border-brand ring-1 ring-brand/30'
          : 'border-line hover:border-brand/40'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground font-heading font-bold text-sm shadow-subtle">
              {workspace.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">
                  {workspace.name}
                </h3>
                {isActive && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted">/{workspace.slug}</p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-muted line-clamp-2 leading-relaxed">
          {workspace.description}
        </p>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-brand" />
              <span>
                {completedTasks}/{totalTasks} completed
              </span>
            </span>
            <span className="font-semibold text-ink">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-1.5">
          <AvatarGroup
            users={workspace.members.map((m) => m.user)}
            max={3}
            size="xs"
          />
          <span className="text-[11px] text-ink-muted ml-1">
            {workspace.members.length} members
          </span>
        </div>

        <Button
          size="sm"
          variant={isActive ? 'default' : 'secondary'}
          onClick={handleOpenWorkspace}
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
        >
          {isActive ? 'Go to Board' : 'Switch'}
        </Button>
      </div>
    </div>
  );
};

