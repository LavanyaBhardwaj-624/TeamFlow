import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';
import { useAppShell } from '@/components/layout/AppShell';
import { taskService } from '@/services/task.service';
import { TASK_PRIORITY_CONFIG } from '@/config/constants';

export const CalendarPage: React.FC = () => {
  const { workspace } = useCurrentWorkspace();
  const { openCreateTaskModal } = useAppShell();
  const [currentMonth, setCurrentMonth] = useState('October 2026');

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', workspace?.id],
    queryFn: () => (workspace ? taskService.getTasksByWorkspace(workspace.id) : null),
    enabled: Boolean(workspace?.id),
  });

  const tasks = tasksData?.data || [];

  // Sample calendar grid for October 2026 (starts on Thursday)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const leadingBlanks = [null, null, null]; // Oct 1, 2026 starts on Thursday (Mon=0, Tue=1, Wed=2, Thu=3)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
              Sprint Calendar
            </h1>
            <Badge variant="secondary" size="sm">
              Schedule
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Due dates, sprint milestones, and release schedules for {workspace?.name || 'Workspace'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg border border-line bg-surface p-1">
            <button
              type="button"
              className="p-1 text-ink-muted hover:text-ink rounded transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-ink">{currentMonth}</span>
            <button
              type="button"
              className="p-1 text-ink-muted hover:text-ink rounded transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            onClick={openCreateTaskModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-subtle">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-line bg-surface-secondary/50 text-center text-xs font-semibold text-ink-muted py-2.5">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-line">
          {leadingBlanks.map((_, idx) => (
            <div key={`blank-${idx}`} className="h-28 bg-surface-secondary/20 p-2 text-ink-subtle text-xs" />
          ))}

          {daysInMonth.map((day) => {
            // Find tasks matching day in October 2026
            const dayTasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              const d = new Date(t.dueDate);
              return d.getDate() === day;
            });

            const isToday = day === 16;

            return (
              <div
                key={day}
                className={`h-28 p-2 transition-colors hover:bg-surface-secondary/30 flex flex-col justify-between ${
                  isToday ? 'bg-brand/5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? 'bg-brand text-white font-bold'
                        : 'text-ink'
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-ink-subtle font-semibold">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                  {dayTasks.slice(0, 2).map((t) => {
                    const priorityMeta = TASK_PRIORITY_CONFIG[t.priority];
                    return (
                      <div
                        key={t.id}
                        className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium bg-surface-secondary text-ink border border-line"
                        title={t.title}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${priorityMeta.dotColor}`} />
                        {t.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-ink-subtle text-right font-medium">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

