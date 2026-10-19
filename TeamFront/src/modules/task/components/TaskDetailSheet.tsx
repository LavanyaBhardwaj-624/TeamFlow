import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Save,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, User as UserType } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/common/Avatar';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { formatRelativeTime, formatShortDate } from '@/lib/utils';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@/config/constants';

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  isAdmin: boolean;
}

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  task,
  isOpen,
  onClose,
  users,
  isAdmin,
}) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsString, setTagsString] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setTagsString(task.tags ? task.tags.join(', ') : '');
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!task || !currentUser) return;
      const tags = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      return taskService.updateTask(
        task.id,
        {
          title,
          description,
          status,
          priority,
          assigneeId,
          dueDate: new Date(dueDate).toISOString(),
          tags,
        },
        currentUser.id
      );
    },
    onSuccess: () => {
      if (task) {
        queryClient.invalidateQueries({ queryKey: ['tasks', task.workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!task || !currentUser) return;
      return taskService.deleteTask(task.id, currentUser.id);
    },
    onSuccess: () => {
      if (task) {
        queryClient.invalidateQueries({ queryKey: ['tasks', task.workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
      onClose();
    },
  });

  if (!task) return null;

  const creator = users.find((u) => u.id === task.creatorId);
  const assignee = users.find((u) => u.id === assigneeId);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      description={`ID: ${task.id}`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Status & Priority Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <Badge
            variant={
              status === 'DONE'
                ? 'success'
                : status === 'IN_PROGRESS'
                ? 'warning'
                : 'secondary'
            }
          >
            {TASK_STATUS_CONFIG[status]?.label}
          </Badge>
          <Badge
            variant={
              priority === 'URGENT'
                ? 'danger'
                : priority === 'HIGH'
                ? 'warning'
                : 'default'
            }
          >
            {TASK_PRIORITY_CONFIG[priority]?.label} Priority
          </Badge>
        </div>

        {/* Title Input */}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />

        {/* Description Textarea */}
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed specs, requirements, or links..."
          rows={4}
        />

        {/* Status, Priority, Due Date Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </Select>

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.title})
              </option>
            ))}
          </Select>

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Tags */}
        <Input
          label="Tags"
          value={tagsString}
          onChange={(e) => setTagsString(e.target.value)}
          placeholder="Comma-separated tags (e.g. Frontend, API, Redis)"
          hint="Separate tags with commas"
        />

        {/* Metadata section */}
        <div className="rounded-xl border border-line bg-surface-secondary/40 p-4 space-y-2 text-xs text-ink-muted">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Created by:</span>
            </span>
            <span className="font-medium text-ink">{creator?.name || 'Team member'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Created:</span>
            </span>
            <span className="text-ink">{task.createdAt ? formatRelativeTime(task.createdAt) : 'Recently'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-line">
          <div>
            {isAdmin ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    deleteMutation.mutate();
                  }
                }}
                isLoading={deleteMutation.isPending}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Task
              </Button>
            ) : (
              <span className="text-[11px] text-ink-subtle">
                Task deletion is restricted to Admins
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};

