import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createTaskSchema, CreateTaskFormValues } from '../schemas';
import { taskService } from '@/services/task.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultStatus = 'TODO',
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getAllUsers(),
  });
  const users = usersData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assigneeId: user?.id || 'user_1',
      tagsString: 'Design, Frontend',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateTaskFormValues) => {
      const tags = values.tagsString
        ? values.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
        : ['General'];

      return taskService.createTask({
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: new Date(values.dueDate).toISOString(),
        tags,
        workspaceId: activeWorkspaceId,
        creatorId: user?.id || 'user_1',
        assigneeId: values.assigneeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (values: CreateTaskFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Add a task to the current workspace sprint board."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Implement distributed rate limiter"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Provide technical context, requirements, or acceptance criteria..."
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Priority"
            error={errors.priority?.message}
            {...register('priority')}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>

          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assignee"
            error={errors.assigneeId?.message}
            {...register('assigneeId')}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.title})
              </option>
            ))}
          </Select>

          <Input
            label="Tags (comma-separated)"
            placeholder="Frontend, API, Bug"
            error={errors.tagsString?.message}
            {...register('tagsString')}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

