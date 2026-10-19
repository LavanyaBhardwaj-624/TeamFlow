import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Filter,
  Kanban as KanbanIcon,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { KanbanColumn } from '@/modules/task/components/KanbanColumn';
import { TaskCard } from '@/modules/task/components/TaskCard';
import { TaskDetailSheet } from '@/modules/task/components/TaskDetailSheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { useAppShell } from '@/components/layout/AppShell';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { taskService } from '@/services/task.service';
import { authService } from '@/services/auth.service';
import { Task, TaskPriority, TaskStatus } from '@/types';

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export const TasksPage: React.FC = () => {
  const { id: routeWorkspaceId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { openCreateTaskModal } = useAppShell();
  const { workspace, isAdmin, role } = useCurrentWorkspace();
  const { user } = useAuthStore();

  const activeId = routeWorkspaceId || workspace?.id || 'ws_core_eng';

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

  // Active Drag & Detail Sheet States
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // TanStack Query for Tasks
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', activeId],
    queryFn: () => taskService.getTasksByWorkspace(activeId),
    enabled: Boolean(activeId),
  });

  // Query for Users (for assignee mapping)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getAllUsers(),
  });

  const allTasks = tasksData?.data || [];
  const users = usersData?.data || [];

  // Drag-and-drop sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Status Update Mutation
  const statusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) =>
      taskService.updateTaskStatus(taskId, newStatus, user?.id || 'user_1'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Delete Mutation (Admin only)
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId, user?.id || 'user_1'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const currentTask = allTasks.find((t) => t.id === activeTaskId);
    if (!currentTask) return;

    // Determine target status
    let targetStatus: TaskStatus | null = null;

    if (COLUMNS.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus;
    } else {
      // Over a task in another column
      const overTask = allTasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && targetStatus !== currentTask.status) {
      // Optimistic cache update for immediate visual feedback
      queryClient.setQueryData(['tasks', activeId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((t: Task) =>
            t.id === activeTaskId ? { ...t, status: targetStatus } : t
          ),
        };
      });

      statusMutation.mutate({ taskId: activeTaskId, newStatus: targetStatus });
    }
  };

  // Filter tasks based on search and selected filters
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'ALL' || task.assigneeId === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
              Sprint Board
            </h1>
            <Badge variant={isAdmin ? 'roleAdmin' : 'roleMember'} size="sm">
              {role}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Drag and drop tasks between columns to update sprint progression in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={openCreateTaskModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-subtle" />
          <input
            type="text"
            placeholder="Filter tasks by name, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-ink-muted font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-ink-muted font-medium">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer max-w-[150px]"
            >
              <option value="ALL">All Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Area */}
      {loadingTasks ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col space-y-3 rounded-xl border border-line p-4 bg-surface-secondary/30">
              <Skeleton className="h-6 w-1/3 rounded" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0 overflow-x-auto pb-4">
            {COLUMNS.map((colStatus) => {
              const columnTasks = filteredTasks.filter((t) => t.status === colStatus);
              return (
                <KanbanColumn
                  key={colStatus}
                  status={colStatus}
                  tasks={columnTasks}
                  users={users}
                  isAdmin={isAdmin}
                  onTaskClick={handleTaskClick}
                  onAddTaskClick={() => openCreateTaskModal()}
                  onDeleteTask={(taskId) => deleteMutation.mutate(taskId)}
                />
              );
            })}
          </div>

          {/* Drag Overlay for smooth preview during drag */}
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                assignee={users.find((u) => u.id === activeTask.assigneeId)}
                isAdmin={isAdmin}
                onClick={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Detail Slide-out Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        users={users}
        isAdmin={isAdmin}
      />
    </div>
  );
};

