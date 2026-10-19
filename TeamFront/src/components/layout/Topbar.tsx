import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useThemeStore } from '@/lib/theme';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/Badge';
import { mockUsers } from '@/config/mockData';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onOpenCreateTask?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle, onOpenCreateTask }) => {
  const navigate = useNavigate();
  const { user, logout, switchMockUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { workspace, role, isAdmin } = useCurrentWorkspace();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur-md">
      {/* Left section: mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-secondary md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm tracking-tight text-ink hidden sm:inline">
            TeamFlow
          </span>
          <span className="text-ink-subtle hidden sm:inline">/</span>
          <span className="text-xs font-semibold text-ink truncate max-w-[160px] sm:max-w-none">
            {workspace?.name || 'Workspace'}
          </span>
          <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm">
            {role}
          </Badge>
        </div>
      </div>

      {/* Middle section: Global quick search */}
      <div className="hidden lg:flex items-center w-80">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search tasks, members... (Type /)"
            className="w-full rounded-lg border border-line bg-surface-secondary/70 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-subtle focus:border-brand focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {/* Right section: theme toggle, notifications, user avatar */}
      <div className="flex items-center gap-2" ref={menuRef}>
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-line bg-surface p-3 shadow-dropdown animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <span className="text-xs font-semibold text-ink">Notifications</span>
                <span className="text-[10px] text-brand font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-2 space-y-2">
                <div className="rounded-lg p-2 bg-surface-secondary/60 text-xs text-ink">
                  <p className="font-medium text-ink">PgBouncer migration scheduled</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Assigned to David Okafor • 2h ago</p>
                </div>
                <div className="rounded-lg p-2 hover:bg-surface-secondary text-xs text-ink">
                  <p className="font-medium text-ink">New activity in Core Platform</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Elena updated task status • 4h ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-secondary transition-colors"
          >
            <Avatar
              name={user?.name || 'User'}
              src={user?.image}
              size="sm"
              showOnline
            />
            <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-line bg-surface p-2 shadow-dropdown animate-in fade-in zoom-in-95 duration-100">
              {/* User summary */}
              <div className="flex items-center gap-3 p-2 border-b border-line">
                <Avatar name={user?.name || 'User'} src={user?.image} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{user?.name}</p>
                  <p className="truncate text-[11px] text-ink-muted">{user?.email}</p>
                  <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm" className="mt-1">
                    {role} in current workspace
                  </Badge>
                </div>
              </div>

              {/* Persona Switcher (For testing ADMIN vs MEMBER roles seamlessly) */}
              <div className="p-2 border-b border-line">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-brand" />
                  <span>Switch Mock Persona</span>
                </p>
                <div className="space-y-1">
                  {mockUsers.map((u) => {
                    const isCurrent = u.id === user?.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchMockUser(u);
                          setUserMenuOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors',
                          isCurrent
                            ? 'bg-brand/10 text-brand font-semibold'
                            : 'text-ink hover:bg-surface-secondary'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={u.name} src={u.image} size="xs" />
                          <div className="text-left min-w-0">
                            <p className="truncate text-xs">{u.name}</p>
                            <p className="truncate text-[10px] text-ink-muted">{u.title}</p>
                          </div>
                        </div>
                        {isCurrent && <span className="text-[10px] text-brand font-bold">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(ROUTES.PROFILE);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-ink hover:bg-surface-secondary transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-ink-muted" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

