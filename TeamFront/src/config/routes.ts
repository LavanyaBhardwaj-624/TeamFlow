export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  WORKSPACE_OVERVIEW: '/workspace/:id',
  WORKSPACE_TASKS: '/workspace/:id/tasks',
  WORKSPACE_CHAT: '/workspace/:id/chat',
  WORKSPACE_CALENDAR: '/workspace/:id/calendar',
  WORKSPACE_SETTINGS: '/workspace/:id/settings',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export const buildWorkspaceRoute = (id: string, subpath: 'overview' | 'tasks' | 'chat' | 'calendar' | 'settings' = 'overview') => {
  if (subpath === 'overview') return `/workspace/${id}`;
  return `/workspace/${id}/${subpath}`;
};

