import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { inviteMemberSchema, InviteMemberFormValues } from '../schemas';
import { workspaceService } from '@/services/workspace.service';
import { authService } from '@/services/auth.service';
import { useCurrentWorkspace } from '../useCurrentWorkspaceRole';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { workspace } = useCurrentWorkspace();

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getAllUsers(),
  });
  const allUsers = usersData?.data || [];

  // Filter out members who are already in the workspace
  const currentMemberIds = new Set(workspace?.members.map((m) => m.userId) || []);
  const availableUsers = allUsers.filter((u) => !currentMemberIds.has(u.id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      userId: availableUsers[0]?.id || '',
      role: 'MEMBER',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: InviteMemberFormValues) => {
      if (!workspace) throw new Error('No workspace selected');
      return workspaceService.addMember(workspace.id, {
        userId: values.userId,
        role: values.role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace?.id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (values: InviteMemberFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description={`Add a collaborator to "${workspace?.name || 'Workspace'}".`}
      maxWidth="md"
    >
      {availableUsers.length === 0 ? (
        <div className="py-6 text-center text-xs text-ink-muted">
          All team directory users are already members of this workspace.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Select Team Member"
            error={errors.userId?.message}
            {...register('userId')}
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email} ({u.title})
              </option>
            ))}
          </Select>

          <Select
            label="Workspace Role"
            error={errors.role?.message}
            hint="Admins can invite members, delete tasks, and modify workspace settings."
            {...register('role')}
          >
            <option value="MEMBER">Member (Create & edit assigned tasks)</option>
            <option value="ADMIN">Admin (Full workspace permissions & task deletion)</option>
          </Select>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Add to Workspace
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

