import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        ownerId: user?.id || '',
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setActiveWorkspaceId(res.data.id);
      const msg = res.message ?? `Workspace "${res.data.name}" created successfully!`;
      setSuccessMessage(msg);
      reset();
      // Auto-close after brief delay so user reads the success message
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1800);
    },
  });

  const onSubmit = (values: CreateWorkspaceFormValues) => {
    setSuccessMessage(null);
    mutation.mutate(values);
  };

  const handleClose = () => {
    setSuccessMessage(null);
    mutation.reset();
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Workspace"
      description="Create a dedicated space for your team to organize tasks, communicate, and track progress."
      maxWidth="md"
    >
      {/* Success Banner */}
      {successMessage && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-xs text-green-700 dark:text-green-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {mutation.error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-700 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Failed to create workspace. Please try again.'}
          </span>
        </div>
      )}

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
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={Boolean(successMessage)}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
