import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { inviteMemberSchema, InviteMemberFormValues } from '../schemas';
import { workspaceService } from '@/services/workspace.service';
import { authService } from '@/services/auth.service';
import { useCurrentWorkspace } from '../useCurrentWorkspaceRole';
import { useAuthStore } from '@/modules/auth/useAuthStore';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { workspace } = useCurrentWorkspace();
  const { user } = useAuthStore();

  // Fetch all known users (for the select dropdown)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getAllUsers(),
  });
  const allUsers = usersData?.data || [];

  // Current workspace members
  const currentMemberIds = new Set(workspace?.members.map((m) => m.userId) || []);

  // Fetch pending invitations for this workspace (now returns PaginatedResponse<WorkspaceInvitation>)
  const { data: pendingInvitesData, isLoading: loadingPending } = useQuery({
    queryKey: ['workspace-pending-invites', workspace?.id],
    queryFn: () => workspaceService.getPendingInvitedUserIds(workspace?.id || '', 1, 100),
    enabled: Boolean(workspace?.id),
  });

  // Extract the set of already-invited user IDs from the full invitation objects
  const pendingIds = new Set(
    (pendingInvitesData?.data || [])
      .filter((inv) => inv.status === 'PENDING')
      .map((inv) => {
        // Backend may return invitedUserId or email; extract what's available
        // WorkspaceInvitation type has `email` field – we match by email when userId not available
        return (inv as any).invitedUserId ?? inv.email;
      }),
  );

  // Filter to users not yet in workspace and not already invited
  const availableUsers = allUsers.filter(
    (u) =>
      !currentMemberIds.has(u.id) &&
      !pendingIds.has(u.id) &&
      !pendingIds.has(u.email),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      userId: '',
      role: 'MEMBER',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: InviteMemberFormValues) => {
      if (!workspace) throw new Error('No workspace selected');
      return workspaceService.sendInvitation(
        workspace.id,
        workspace.slug,
        { userId: values.userId, role: values.role },
        user?.id || '',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace?.id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-pending-invites', workspace?.id] });
      reset();
    },
  });

  const onSubmit = (values: InviteMemberFormValues) => {
    mutation.reset();
    mutation.mutate(values);
  };

  const handleClose = () => {
    mutation.reset();
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Team Member"
      description={`Add a collaborator to "${workspace?.name || 'Workspace'}".`}
      maxWidth="md"
    >
      {/* Success feedback */}
      {mutation.isSuccess && mutation.data?.message && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-xs text-green-700 dark:text-green-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{mutation.data.message}</span>
        </div>
      )}

      {/* Error feedback */}
      {mutation.error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-700 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Unable to send invitation. Please try again.'}
          </span>
        </div>
      )}

      {/* Pending invites info badge */}
      {!loadingPending && (pendingInvitesData?.data?.length ?? 0) > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <MailCheck className="h-4 w-4 shrink-0" />
          <span>
            {pendingInvitesData!.data.length} pending invitation
            {pendingInvitesData!.data.length !== 1 ? 's' : ''} already sent for this workspace.
          </span>
        </div>
      )}

      {availableUsers.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <MailCheck className="h-8 w-8 mx-auto text-ink-subtle" />
          <p className="text-xs font-medium text-ink-muted">
            All known team members are already in this workspace or have pending invitations.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Select Team Member"
            error={errors.userId?.message}
            {...register('userId')}
          >
            <option value="">— Select a team member —</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}{u.title ? ` (${u.title})` : ''}
              </option>
            ))}
          </Select>

          <Select
            label="Workspace Role"
            error={errors.role?.message}
            hint="Admins can invite members, delete tasks, and modify workspace settings."
            {...register('role')}
          >
            <option value="MEMBER">Member (Create &amp; edit assigned tasks)</option>
            <option value="ADMIN">Admin (Full workspace permissions &amp; task deletion)</option>
          </Select>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
