import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { workspaceService } from '@/services/workspace.service';
import { Role } from '@/types';

export function useCurrentWorkspace() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['workspace', activeWorkspaceId],
    queryFn: () => workspaceService.getWorkspaceById(activeWorkspaceId),
    // Only fetch when there IS an active workspace (not null)
    enabled: Boolean(activeWorkspaceId),
  });

  const workspace = query.data?.data;

  // Determine current user's role in this workspace
  let role: Role = 'MEMBER';
  if (workspace && user) {
    const member = workspace.members.find((m) => m.userId === user.id);
    if (member) {
      role = member.role;
    } else if (workspace.ownerId === user.id) {
      role = 'ADMIN';
    }
  }

  const isAdmin = role === 'ADMIN';

  return {
    ...query,
    workspace,
    role,
    isAdmin,
  };
}
