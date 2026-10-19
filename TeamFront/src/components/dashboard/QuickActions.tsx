import React from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCurrentWorkspace } from '@/modules/workspace/useCurrentWorkspaceRole';

export interface QuickActionsProps {
  onCreateTask: () => void;
  onCreateWorkspace: () => void;
  onInviteMember: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateTask,
  onCreateWorkspace,
  onInviteMember,
}) => {
  const { isAdmin } = useCurrentWorkspace();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        size="sm"
        onClick={onCreateTask}
        leftIcon={<Plus className="h-3.5 w-3.5" />}
      >
        New Task
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={onCreateWorkspace}
        leftIcon={<Plus className="h-3.5 w-3.5" />}
      >
        New Workspace
      </Button>

      {isAdmin && (
        <Button
          size="sm"
          variant="outline"
          onClick={onInviteMember}
          leftIcon={<UserPlus className="h-3.5 w-3.5" />}
        >
          Invite Member
        </Button>
      )}
    </div>
  );
};

