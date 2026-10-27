import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useThemeStore } from '@/lib/theme';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/config/routes';
import { workspaceService } from '@/services/workspace.service';

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onOpenCreateTask?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle, onOpenCreateTask }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch invitations for the current user (with pagination defaults)
  const { data: invitationData } = useQuery({
    queryKey: ['workspace-invitations', user?.id],
    queryFn: () => workspaceService.getInvitationsForUser(user?.id || '', 1, 20),
    enabled: Boolean(user?.id),
  });

  // Only show PENDING invitations in the notification bell
  const invitations = (invitationData?.data || []).filter((inv) => inv.status === 'PENDING');

  const respondToInvitation = useMutation({
    mutationFn: ({ id, response }: { id: string; response: 'ACCEPTED' | 'DECLINED' }) =>
      workspaceService.respondToInvitation(id, user?.id || '', response),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const { theme, toggleTheme } = useThemeStore();
  const { workspace, role, isAdmin } = useCurrentWorkspace();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
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
          <span className="text-xs font-semibold text-ink truncate max-w-[140px] sm:max-w-[220px]">
            {workspace?.name || 'No Workspace'}
          </span>
          {workspace && <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm">{role}</Badge>}
        </div>
      </div>

      {/* Right section: theme toggle, notifications, user avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
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

        {/* Notifications / Invitations Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setUserMenuOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {invitations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-1.5rem))] sm:w-96 rounded-xl border border-line bg-surface shadow-dropdown animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <span className="text-xs font-semibold text-ink">Notifications & Invitations</span>
                {invitations.length > 0 && (
                  <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded-full">
                    {invitations.length} pending
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {/* Action result feedback */}
                {respondToInvitation.isSuccess && respondToInvitation.data?.message && (
                  <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{respondToInvitation.data.message}</span>
                  </div>
                )}
                {respondToInvitation.isError && (
                  <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {respondToInvitation.error instanceof Error
                        ? respondToInvitation.error.message
                        : 'Unable to respond. Please try again.'}
                    </span>
                  </div>
                )}

                {/* Invitation cards */}
                <div className="p-3 space-y-2">
                  {invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                      <BellOff className="h-8 w-8 text-ink-subtle" />
                      <p className="text-xs font-medium text-ink-muted">
                        You have no pending notifications.
                      </p>
                      <p className="text-[11px] text-ink-subtle">
                        Workspace invitations will appear here.
                      </p>
                    </div>
                  ) : (
                    invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="rounded-lg border border-brand/15 bg-brand/5 p-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink truncate">
                              {invitation.inviterName} invited you
                            </p>
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              Join{' '}
                              <span className="font-medium text-ink">
                                {invitation.workspaceName}
                              </span>{' '}
                              as{' '}
                              <Badge
                                variant={invitation.role === 'ADMIN' ? 'roleAdmin' : 'roleMember'}
                                size="sm"
                              >
                                {invitation.role}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex gap-2">
                          <button
                            type="button"
                            disabled={respondToInvitation.isPending}
                            className="flex-1 rounded-md bg-brand px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
                            onClick={() =>
                              respondToInvitation.mutate({ id: invitation.id, response: 'ACCEPTED' })
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={respondToInvitation.isPending}
                            className="flex-1 rounded-md border border-line px-2 py-1.5 text-[11px] text-ink-muted hover:bg-surface-secondary disabled:opacity-50 transition-colors"
                            onClick={() =>
                              respondToInvitation.mutate({ id: invitation.id, response: 'DECLINED' })
                            }
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-surface-secondary transition-colors"
          >
            <Avatar
              name={user?.name || 'User'}
              src={user?.image}
              size="sm"
              showOnline
            />
            <ChevronDown className="h-3.5 w-3.5 text-ink-muted hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-line bg-surface p-2 shadow-dropdown animate-in fade-in zoom-in-95 duration-100">
              {/* User summary */}
              <div className="flex items-center gap-3 p-2 border-b border-line">
                <Avatar name={user?.name || 'User'} src={user?.image} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{user?.name}</p>
                  <p className="truncate text-[11px] text-ink-muted">{user?.email}</p>
                  {workspace && <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm" className="mt-1">{role} in current workspace</Badge>}
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
