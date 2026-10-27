import { TaskPriority, TaskStatus } from '@/types';

export const APP_CONFIG = {
  name: 'TeamFlow',
  tagline: 'Multi-Workspace Team Collaboration',
  description: 'A focused, calm, multi-workspace collaboration platform with task boards, role-based controls, and team activity feeds.',
  mockApiDelayMs: 250,
  enableSocketStub: false,
};

export const STORAGE_KEYS = {
  AUTH_SESSION: 'teamflow_auth_session',
  ACTIVE_WORKSPACE_ID: 'teamflow_active_workspace_id',
  WORKSPACES: 'teamflow_workspaces',
  THEME: 'teamflow_theme',
};

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; description: string; color: string; badgeVariant: string }
> = {
  TODO: {
    label: 'To Do',
    description: 'Tasks scheduled or queued for work',
    color: 'bg-surface-secondary text-ink border-line',
    badgeVariant: 'secondary',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Work actively under development or review',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    badgeVariant: 'warning',
  },
  DONE: {
    label: 'Completed',
    description: 'Shipped, reviewed, and finalized tasks',
    color: 'bg-brand/10 text-brand dark:text-brand border-brand/20',
    badgeVariant: 'success',
  },
};

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; dotColor: string }
> = {
  LOW: {
    label: 'Low',
    color: 'bg-surface-secondary text-ink-muted border-line',
    dotColor: 'bg-ink-muted',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    dotColor: 'bg-blue-500',
  },
  HIGH: {
    label: 'High',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    dotColor: 'bg-orange-500',
  },
  URGENT: {
    label: 'Urgent',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    dotColor: 'bg-red-500',
  },
};

