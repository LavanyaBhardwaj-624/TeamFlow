import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Task, TaskStatus, User } from '@/types';
import { TaskCard } from './TaskCard';
import { TASK_STATUS_CONFIG } from '@/config/constants';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  users: User[];
  isAdmin: boolean;
  onTaskClick: (task: Task) => void;
  onAddTaskClick: (status: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  users,
  isAdmin,
  onTaskClick,
  onAddTaskClick,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const config = TASK_STATUS_CONFIG[status];
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl bg-surface-secondary/40 border border-line p-3 min-w-[280px] sm:min-w-[320px] flex-1 transition-colors duration-150',
        isOver && 'bg-brand/5 border-brand/50'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-line/60 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-heading">
            {config.label}
          </h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-secondary text-[11px] font-semibold text-ink-muted border border-line">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTaskClick(status)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors"
          title={`Add task to ${config.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Task List (Sortable Area) */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[300px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={userMap.get(task.assigneeId)}
              isAdmin={isAdmin}
              onClick={() => onTaskClick(task)}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-line/70 rounded-lg">
            <p className="text-xs text-ink-muted font-medium">No tasks here</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">
              Drag a task here or click + to add one
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

