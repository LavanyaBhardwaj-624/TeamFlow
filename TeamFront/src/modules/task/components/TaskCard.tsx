import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import { Task, User } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/common/Avatar';
import { TASK_PRIORITY_CONFIG } from '@/config/constants';
import { formatShortDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  assignee?: User;
  isAdmin: boolean;
  onClick: () => void;
  onDelete?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  isAdmin,
  onClick,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const priorityMeta = TASK_PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border border-line bg-surface p-4 shadow-subtle transition-all cursor-grab active:cursor-grabbing hover:border-brand/50 select-none',
        isDragging && 'opacity-40 border-dashed border-brand shadow-modal scale-[1.02]'
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Priority and Admin Quick Delete */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge
          variant={
            task.priority === 'URGENT'
              ? 'danger'
              : task.priority === 'HIGH'
              ? 'warning'
              : task.priority === 'MEDIUM'
              ? 'primary'
              : 'default'
          }
          size="sm"
          dotColor={priorityMeta.dotColor}
        >
          {priorityMeta.label}
        </Badge>

        <div className="flex items-center gap-1">
          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  onDelete(task.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-ink-subtle hover:text-red-500 rounded transition-all"
              title="Delete task (Admin only)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h4 className="text-xs sm:text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover:text-brand transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] text-ink-muted border border-line/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Due Date and Assignee */}
      <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-line/60">
        <div className="flex items-center gap-1 text-[11px] text-ink-subtle">
          <Calendar className="w-3 h-3" />
          <span>{formatShortDate(task.dueDate)}</span>
        </div>

        {assignee ? (
          <Avatar
            name={assignee.name}
            src={assignee.image}
            size="xs"
            className="ring-1 ring-line"
          />
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-line text-[10px] flex items-center justify-center text-ink-subtle">
            ?
          </div>
        )}
      </div>
    </div>
  );
};

