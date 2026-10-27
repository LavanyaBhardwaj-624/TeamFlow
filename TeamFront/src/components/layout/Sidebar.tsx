import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onCreateWorkspaceClick?: () => void;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  onCreateWorkspaceClick,
  onMobileClose,
}) => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { role, isAdmin } = useCurrentWorkspace();
  const { user } = useAuthStore();

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: ROUTES.DASHBOARD,
    },
    {
      label: 'Tasks Board',
      icon: Kanban,
      to: `/workspace/${activeWorkspaceId}/tasks`,
    },
    {
      label: 'Workspace Overview',
      icon: FolderKanban,
      to: `/workspace/${activeWorkspaceId}`,
    },
    {
      label: 'Team Chat',
      icon: MessageSquare,
      to: `/workspace/${activeWorkspaceId}/chat`,
      badge: 'Beta',
    },
    {
      label: 'Sprint Calendar',
      icon: Calendar,
      to: `/workspace/${activeWorkspaceId}/calendar`,
    },
  ];

  const bottomNavItems = [
    {
      label: 'Workspace Settings',
      icon: Settings,
      to: `/workspace/${activeWorkspaceId}/settings`,
    },
    {
      label: 'My Profile',
      icon: User,
      to: ROUTES.PROFILE,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-line bg-surface transition-all duration-200 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Workspace Switcher Header */}
      <div className="p-3 border-b border-line">
        <WorkspaceSwitcher
          collapsed={collapsed}
          onCreateWorkspaceClick={onCreateWorkspaceClick}
        />
        {!collapsed && (
          <div className="mt-2.5 flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-ink-muted">{activeWorkspaceId ? 'Your Role:' : 'Your Title:'}</span>
            <Badge variant={activeWorkspaceId ? (isAdmin ? 'roleAdmin' : 'roleMember') : 'primary'} size="sm">{activeWorkspaceId ? role : (user?.title || 'Team member')}</Badge>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1.5">
              Workspace
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand font-semibold'
                      : 'text-ink-muted hover:bg-surface-secondary hover:text-ink',
                    collapsed && 'justify-center px-0'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-brand/15 px-1.5 py-0.2 text-[9px] font-semibold text-brand">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1.5">
              Account & System
            </p>
          )}
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand font-semibold'
                      : 'text-ink-muted hover:bg-surface-secondary hover:text-ink',
                    collapsed && 'justify-center px-0'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-line p-2 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};

