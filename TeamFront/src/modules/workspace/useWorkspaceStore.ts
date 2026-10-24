import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';

interface WorkspaceState {
  activeWorkspaceId: string | null;
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

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: getStoredWorkspaceId(),
  setActiveWorkspaceId: (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    }
    set({ activeWorkspaceId: id });
  },
}));
