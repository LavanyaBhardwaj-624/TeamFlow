import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { WorkspaceCard } from '@/components/dashboard/WorkspaceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/common/Avatar';
import { useAppShell } from '@/components/layout/AppShell';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { workspaceService } from '@/services/workspace.service';
import { taskService } from '@/services/task.service';
import { formatRelativeTime } from '@/lib/utils';
import { TASK_PRIORITY_CONFIG } from '@/config/constants';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { openCreateTaskModal, openCreateWorkspaceModal, openInviteMemberModal } = useAppShell();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { workspace, isAdmin, role } = useCurrentWorkspace();

  const { data: workspacesData, isLoading: loadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces(),
  });

  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', activeWorkspaceId],
    queryFn: () => taskService.getTasksByWorkspace(activeWorkspaceId),
    enabled: Boolean(activeWorkspaceId),
  });

  const allWorkspaces = workspacesData?.data || [];
  const currentTasks = tasksData?.data || [];

  // Metrics computation
  const totalTasks = currentTasks.length;
  const completedTasks = currentTasks.filter((t) => t.status === 'DONE').length;
  const pendingTasks = currentTasks.filter((t) => t.status !== 'DONE').length;
  const inProgressTasks = currentTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const memberCount = workspace?.members?.length || 0;

  // Urgent & high priority items for spotlight
  const urgentTasks = currentTasks
    .filter((t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE')
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
              Workspace Overview
            </h1>
            <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm">
              {role}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Viewing <span className="font-semibold text-ink">{workspace?.name || 'Workspace'}</span> sprint metrics and cross-team actions.
          </p>
        </div>

        <QuickActions
          onCreateTask={openCreateTaskModal}
          onCreateWorkspace={openCreateWorkspaceModal}
          onInviteMember={openInviteMemberModal}
        />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={loadingTasks ? '—' : totalTasks}
          subtext="Across active sprint board"
          icon={Layers}
          colorVariant="default"
        />
        <StatCard
          label="Completed"
          value={loadingTasks ? '—' : completedTasks}
          subtext={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% of workload shipped` : '0%'}
          icon={CheckCircle2}
          colorVariant="brand"
          trend={completedTasks > 0 ? '+12% this week' : undefined}
        />
        <StatCard
          label="In Progress"
          value={loadingTasks ? '—' : inProgressTasks}
          subtext={`${pendingTasks} total pending action`}
          icon={Clock}
          colorVariant="warning"
        />
        <StatCard
          label="Collaborators"
          value={loadingWorkspaces ? '—' : memberCount}
          subtext={isAdmin ? 'You have admin permissions' : 'Member permissions'}
          icon={Users}
          colorVariant="info"
        />
      </div>

      {/* Two Column Grid: Left Workspaces & Urgent Tasks, Right Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Workspaces Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink tracking-tight font-heading">
                  All Workspaces
                </h2>
                <p className="text-xs text-ink-muted">
                  Switch between tenants to load segregated tasks, members, and channels.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreateWorkspaceModal}
              >
                + New Workspace
              </Button>
            </div>

            {loadingWorkspaces ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-44 w-full rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allWorkspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    tasks={currentTasks}
                    isActive={ws.id === activeWorkspaceId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* High Priority & Urgent Attention Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink tracking-tight font-heading flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>High Priority Tasks</span>
                </h2>
                <p className="text-xs text-ink-muted">
                  Critical roadmap deliverables requiring immediate focus.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/workspace/${activeWorkspaceId}/tasks`)}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View Kanban Board
              </Button>
            </div>

            {loadingTasks ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : urgentTasks.length === 0 ? (
              <div className="rounded-xl border border-line bg-surface p-6 text-center text-xs text-ink-muted">
                No high-priority or urgent tasks pending in this workspace. All clear!
              </div>
            ) : (
              <div className="divide-y divide-line rounded-xl border border-line bg-surface overflow-hidden">
                {urgentTasks.map((task) => {
                  const priorityMeta = TASK_PRIORITY_CONFIG[task.priority];
                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/workspace/${activeWorkspaceId}/tasks`)}
                      className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-surface-secondary/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${priorityMeta.dotColor}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-ink truncate">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={task.priority === 'URGENT' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {priorityMeta.label}
                        </Badge>
                        <span className="text-[11px] text-ink-subtle hidden sm:inline">
                          Due {formatRelativeTime(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink tracking-tight font-heading flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span>Team Activity</span>
            </h2>
            <p className="text-xs text-ink-muted">
              Live audit stream of creations, status transitions, and member actions.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4 shadow-subtle">
            <ActivityFeed workspaceId={activeWorkspaceId} limit={7} />
          </div>

          {/* Quick Workspace Members Card */}
          <div className="rounded-xl border border-line bg-surface p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">
                Workspace Members ({workspace?.members.length || 0})
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={openInviteMemberModal}
                  className="text-[11px] font-medium text-brand hover:underline"
                >
                  + Invite
                </button>
              )}
            </div>
            <div className="space-y-2">
              {workspace?.members.slice(0, 5).map((member) => (
                <div key={member.userId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      name={member.user?.name || 'Member'}
                      src={member.user?.image}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{member.user?.name}</p>
                      <p className="truncate text-[10px] text-ink-muted">{member.user?.title}</p>
                    </div>
                  </div>
                  <Badge variant={member.role === 'ADMIN' ? 'roleAdmin' : 'roleMember'} size="sm">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

