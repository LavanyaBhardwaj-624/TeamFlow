import React, { useState } from 'react';
import { Check, Mail, Save, User as UserIcon, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { mockUsers } from '@/config/mockData';

export const ProfilePage: React.FC = () => {
  const { user, switchMockUser } = useAuthStore();
  const { workspace, role } = useCurrentWorkspace();

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      user.name = name;
      user.title = title;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-2 border-b border-line">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
          User Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Manage your account credentials, workspace profile, and demo persona.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/10 p-3 text-xs text-brand font-medium">
          <Check className="w-4 h-4" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-line">
          <Avatar name={user?.name || 'User'} src={user?.image} size="xl" />
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-lg font-bold text-ink font-heading">{user?.name}</h2>
            <p className="text-xs text-ink-muted">{user?.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge variant="primary" size="sm">
                {user?.title}
              </Badge>
              <Badge variant={role === 'ADMIN' ? 'roleAdmin' : 'roleMember'} size="sm">
                {role} in {workspace?.name}
              </Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            hint="Email cannot be changed in mock demo mode."
          />

          <Input
            label="Job Title / Role"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Switch Mock Persona Section */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-subtle space-y-4">
        <div className="pb-3 border-b border-line">
          <h3 className="text-sm font-semibold text-ink font-heading flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-brand" />
            <span>Interactive Persona Switcher</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Switch mock accounts on the fly to test ADMIN vs MEMBER role-gated buttons (Invite Member, Delete Task).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {mockUsers.map((persona) => {
            const isCurrent = persona.id === user?.id;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => {
                  switchMockUser(persona);
                  setName(persona.name);
                  setTitle(persona.title || " Hey I am A developer");
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-brand bg-brand/5 ring-1 ring-brand'
                    : 'border-line bg-surface hover:bg-surface-secondary'
                }`}
              >
                <Avatar name={persona.name} src={persona.image} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink truncate">{persona.name}</p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-brand">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">{persona.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

