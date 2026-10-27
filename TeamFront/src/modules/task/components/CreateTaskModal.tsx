import React, { useState } from 'react';
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
import { workspaceService } from '@/services/workspace.service';
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
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const { data: membersData } = useQuery({
    queryKey: ['workspace-members', activeWorkspaceId],
    queryFn: () => workspaceService.getWorkspaceMembers(activeWorkspaceId as string),
    enabled: isOpen && Boolean(activeWorkspaceId),
  });
  const users = membersData?.data || [];
  const filteredUsers = users.filter((candidate) => `${candidate.name} ${candidate.email}`.toLowerCase().includes(assigneeSearch.trim().toLowerCase()));

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
      assigneeId: user?.id || '',
      tagsString: 'Design, Frontend',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateTaskFormValues) => {
      const tags = values.tagsString
        ? values.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
        : ['General'];

      if (!activeWorkspaceId || !user?.id) throw new Error('Select a workspace and sign in before creating a task.');
      return taskService.createTask({
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: new Date(values.dueDate).toISOString(),
        tags,
        workspaceId: activeWorkspaceId,
        creatorId: user.id,
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
      {!activeWorkspaceId && <p className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-700">Select or create a workspace first.</p>}
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Assignee"
            error={errors.assigneeId?.message}
            {...register('assigneeId')}
          >
            {filteredUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.title || u.email})
              </option>
            ))}
          </Select>

          <Input label="Find assignee" placeholder="Search by name or email" value={assigneeSearch} onChange={(event) => setAssigneeSearch(event.target.value)} />

          <Input
            className="sm:col-span-2"
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
          <Button type="submit" isLoading={mutation.isPending} disabled={!activeWorkspaceId || !user?.id}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

