import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity as ActivityIcon,
  CheckCircle2,
  FolderPlus,
  GitCommit,
  PlusCircle,
  UserPlus,
} from 'lucide-react';
import { activityService } from '@/services/activity.service';
import { Avatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/common/Skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { Activity } from '@/types';

interface ActivityFeedProps {
  workspaceId?: string;
  limit?: number;
  showWorkspaceFilter?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ workspaceId, limit = 8 }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', workspaceId || 'all', limit],
    queryFn: () =>
      workspaceId
        ? activityService.getActivitiesByWorkspace(workspaceId, limit)
        : activityService.getRecentActivities(limit),
  });

  const activities = data?.data || [];

  const getActionIcon = (type: Activity['type']) => {
    switch (type) {
      case 'TASK_CREATED':
        return <PlusCircle className="h-3.5 w-3.5 text-brand" />;
      case 'TASK_MOVED':
        return <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />;
      case 'MEMBER_JOINED':
        return <UserPlus className="h-3.5 w-3.5 text-blue-500" />;
      case 'WORKSPACE_CREATED':
        return <FolderPlus className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <GitCommit className="h-3.5 w-3.5 text-ink-muted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-ink-muted">
        No recent workspace activities logged yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-line/60">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-surface-secondary/40 px-2 rounded-lg"
        >
          <div className="relative mt-0.5 shrink-0">
            <Avatar
              name={activity.user?.name || 'User'}
              src={activity.user?.image}
              size="sm"
            />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface border border-line">
              {getActionIcon(activity.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink leading-snug">
              <span className="font-semibold">{activity.user?.name || 'Team member'}</span>{' '}
              <span className="text-ink-muted">{activity.description}</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-subtle">
              {formatRelativeTime(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

