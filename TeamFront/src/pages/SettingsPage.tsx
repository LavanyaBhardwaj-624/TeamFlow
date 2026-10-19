import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  Users,
} from 'lucide-react';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useThemeStore } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useAppShell } from '@/components/layout/AppShell';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { workspace, isAdmin, role } = useCurrentWorkspace();
  const { theme, setTheme } = useThemeStore();
  const { openInviteMemberModal } = useAppShell();

  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspace) {
      workspace.name = name;
      workspace.description = description;
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace.id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-2 border-b border-line">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
          Workspace Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Manage general metadata, access control, and client preferences for {workspace?.name}.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/10 p-3 text-xs text-brand font-medium">
          <Check className="w-4 h-4" />
          <span>Workspace settings updated successfully.</span>
        </div>
      )}

      {/* Workspace General Info Form */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div>
            <h3 className="text-sm font-semibold text-ink font-heading">General Information</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Identifiable workspace name and URL slug.
            </p>
          </div>
          <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm">
            {role} Permissions
          </Badge>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            hint={!isAdmin ? 'Only workspace admins can rename the workspace.' : undefined}
          />

          <Textarea
            label="Workspace Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isAdmin}
            rows={3}
          />

          <Input
            label="Workspace Slug (URL Prefix)"
            value={`teamflow.io/workspace/${workspace?.slug || 'core-platform'}`}
            disabled
            hint="Slugs are assigned upon workspace provisioning."
          />

          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Theme & Display Preferences */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-6">
        <div className="pb-4 border-b border-line">
          <h3 className="text-sm font-semibold text-ink font-heading flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand" />
            <span>Theme & Visual Styling</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Calibrated light and soft-dark themes with deep green accents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              theme === 'light'
                ? 'border-brand bg-brand/5 ring-1 ring-brand'
                : 'border-line bg-surface hover:bg-surface-secondary'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary text-ink border border-line">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Light Theme</p>
              <p className="text-[11px] text-ink-muted">Paper bg `#FAFAF9`, surface `#FFFFFF`</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              theme === 'dark'
                ? 'border-brand bg-brand/5 ring-1 ring-brand'
                : 'border-line bg-surface hover:bg-surface-secondary'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary text-ink border border-line">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Soft Dark Theme</p>
              <p className="text-[11px] text-ink-muted">Charcoal bg `#0F1115`, surface `#171A20`</p>
            </div>
          </button>
        </div>
      </div>

      {/* Role & Permissions Info */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="text-sm font-semibold text-ink font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand" />
              <span>Roles & Access Matrix</span>
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Permissions enforced across boards, modals, and endpoints.
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={openInviteMemberModal}>
              Invite Member
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border border-line p-3 bg-surface-secondary/40 space-y-1.5">
            <Badge variant="roleAdmin" size="sm">
              ADMIN Role
            </Badge>
            <ul className="text-ink-muted space-y-1 list-disc list-inside text-[11px] pt-1">
              <li>Invite new members & assign roles</li>
              <li>Delete tasks across all columns</li>
              <li>Edit workspace metadata and configurations</li>
              <li>Access full audit activities</li>
            </ul>
          </div>

          <div className="rounded-lg border border-line p-3 bg-surface-secondary/40 space-y-1.5">
            <Badge variant="roleMember" size="sm">
              MEMBER Role
            </Badge>
            <ul className="text-ink-muted space-y-1 list-disc list-inside text-[11px] pt-1">
              <li>Create and assign tasks</li>
              <li>Drag and drop tasks on Kanban board</li>
              <li>Participate in chat channels</li>
              <li>Restricted: Cannot delete tasks or invite members</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

