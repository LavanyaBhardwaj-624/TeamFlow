import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createWorkspaceSchema, CreateWorkspaceFormValues } from '../schemas';
import { workspaceService } from '@/services/workspace.service';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setActiveWorkspaceId } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateWorkspaceFormValues) =>
      workspaceService.createWorkspace({
        name: values.name,
        description: values.description,
        ownerId: user?.id || 'user_1',
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setActiveWorkspaceId(res.data.id);
      reset();
      onClose();
    },
  });

  const onSubmit = (values: CreateWorkspaceFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Workspace"
      description="Create a dedicated space for your team to organize tasks, communicate, and track progress."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Workspace Name"
          placeholder="e.g. Infrastructure & DevOps"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Description"
          placeholder="What is this workspace focused on?"
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};

