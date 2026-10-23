import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';
import { initialWorkspaces } from '@/config/mockData';

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
}

const getStoredWorkspaceId = (): string | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
  if (stored) return stored;
  return initialWorkspaces[0]?.id || null;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: getStoredWorkspaceId(),
  setActiveWorkspaceId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, id);
    set({ activeWorkspaceId: id });
  },
}));

