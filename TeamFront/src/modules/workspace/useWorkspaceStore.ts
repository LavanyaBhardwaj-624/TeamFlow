import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';
import { Activity, Task, Workspace } from '@/types';
import { WorkspaceMemberSummary } from '@/services/workspace.service';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  members: WorkspaceMemberSummary[];
  tasks: Task[];
  activities: Activity[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  setMembers: (members: WorkspaceMemberSummary[]) => void;
  setTasks: (tasks: Task[]) => void;
  setActivities: (activities: Activity[]) => void;
  setActiveWorkspaceId: (id: string | null) => void;
}

/**
 * Returns the last active workspace ID from localStorage,
 * or null if nothing is stored (e.g., brand-new user with no workspaces).
 * Never falls back to mock / fake data.
 */
const getStoredWorkspaceId = (): string | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
  return stored || null;
};

const getStoredWorkspaces = (): Workspace[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSPACES) ?? '[]') as Workspace[]; } catch { return []; }
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: getStoredWorkspaces(),
  activeWorkspaceId: getStoredWorkspaceId(),
  members: [],
  tasks: [],
  activities: [],
  setWorkspaces: (workspaces) => { localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces)); set({ workspaces }); },
  addWorkspace: (workspace) => set((state) => { const workspaces = [workspace, ...state.workspaces.filter((item) => item.id !== workspace.id)]; localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces)); return { workspaces }; }),
  setMembers: (members) => set({ members }),
  setTasks: (tasks) => set({ tasks }),
  setActivities: (activities) => set({ activities }),
  setActiveWorkspaceId: (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    }
    set({ activeWorkspaceId: id });
  },
}));
