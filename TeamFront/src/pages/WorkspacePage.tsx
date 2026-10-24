import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  Kanban,
  Layers,
  Settings,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { workspaceService } from '@/services/workspace.service';
import { taskService } from '@/services/task.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useAppShell } from '@/components/layout/AppShell';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openInviteMemberModal, openCreateTaskModal } = useAppShell();
  const { isAdmin, role } = useCurrentWorkspace();

  // Use the route param; null means the URL had no :id which shouldn't happen in practice
  const workspaceId = id ?? null;

  const {
    data: wsData,
    isLoading: loadingWs,
    error: wsError,
    refetch,
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceService.getWorkspaceById(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: () => taskService.getTasksByWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const workspace = wsData?.data;
  const tasks = tasksData?.data || [];

  if (loadingWs) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (wsError || !workspace) {
    return (
      <div className="p-8">
        <ErrorState
          title="Workspace not found"
          message={`Unable to load workspace with identifier "${workspaceId}".`}
          onRetry={refetch}
        />
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Workspace Hero Header */}
      <div className="rounded-xl border border-line bg-surface p-6 sm:p-8 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-white font-heading font-bold text-xl shadow-subtle">
              {workspace.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
                  {workspace.name}
                </h1>
                <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm">
                  {role}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-subtle">
                Slug: <span className="font-mono text-ink">/{workspace.slug}</span> • Created {workspace.createdAt ? formatDate(workspace.createdAt) : 'Recently'}
              </p>
              <p className="mt-3 text-xs sm:text-sm text-ink-muted max-w-2xl leading-relaxed">
                {workspace.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate(`/workspace/${workspace.id}/tasks`)}
              leftIcon={<Kanban className="w-4 h-4" />}
            >
              Open Kanban Board
            </Button>

            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={openInviteMemberModal}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Invite Member
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/workspace/${workspace.id}/settings`)}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase">
            <span>Team Members</span>
            <Users className="w-4 h-4 text-ink-subtle" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink font-heading">{workspace.members.length}</p>
          <p className="text-[11px] text-ink-muted mt-1">Cross-functional engineers & designers</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase">
            <span>Sprint Tasks</span>
            <Layers className="w-4 h-4 text-ink-subtle" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink font-heading">{tasks.length}</p>
          <p className="text-[11px] text-ink-muted mt-1">{inProgressCount} currently under active review</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase">
            <span>Completed Rate</span>
            <CheckCircle2 className="w-4 h-4 text-brand" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink font-heading">
            {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '0%'}
          </p>
          <p className="text-[11px] text-ink-muted mt-1">{completedCount} of {tasks.length} items shipped</p>
        </div>
      </div>

      {/* Two Column Grid: Members Directory & Workspace Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members Directory (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight font-heading flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <span>Workspace Members</span>
              </h2>
              <p className="text-xs text-ink-muted">
                Collaborators with verified access to this tenant.
              </p>
            </div>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={openInviteMemberModal}>
                + Add Member
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-subtle">
            <div className="divide-y divide-line">
              {workspace.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-4 hover:bg-surface-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={member.user?.name || 'Member'}
                      src={member.user?.image}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-ink truncate">
                        {member.user?.name}
                      </p>
                      <p className="text-[11px] text-ink-muted truncate">
                        {member.user?.email} • {member.user?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-ink-subtle hidden sm:inline">
                      Joined {member.joinedAt ? formatRelativeTime(member.joinedAt) : 'recently'}
                    </span>
                    <Badge
                      variant={member.role === 'ADMIN' ? 'roleAdmin' : 'roleMember'}
                      size="sm"
                    >
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace Activity Feed */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink tracking-tight font-heading">
              Workspace Activity
            </h2>
            <p className="text-xs text-ink-muted">
              Audit log filtered to this workspace.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4 shadow-subtle">
            <ActivityFeed workspaceId={workspace.id} limit={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

