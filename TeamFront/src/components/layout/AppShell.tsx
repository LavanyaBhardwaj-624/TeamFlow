import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CreateTaskModal } from '@/modules/task/components/CreateTaskModal';
import { CreateWorkspaceModal } from '@/modules/workspace/components/CreateWorkspaceModal';
import { InviteMemberModal } from '@/modules/workspace/components/InviteMemberModal';

interface AppShellContextType {
  openCreateTaskModal: () => void;
  openCreateWorkspaceModal: () => void;
  openInviteMemberModal: () => void;
}

const AppShellContext = createContext<AppShellContextType | null>(null);

export const useAppShell = () => {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShell must be used within an AppShell');
  }
  return ctx;
};

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Modals State
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);

  const contextValue: AppShellContextType = {
    openCreateTaskModal: () => setCreateTaskOpen(true),
    openCreateWorkspaceModal: () => setCreateWorkspaceOpen(true),
    openInviteMemberModal: () => setInviteMemberOpen(true),
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden bg-bg text-ink">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onCreateWorkspaceClick={() => setCreateWorkspaceOpen(true)}
          />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="h-full w-72 bg-surface shadow-modal animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                collapsed={false}
                setCollapsed={() => {}}
                onCreateWorkspaceClick={() => {
                  setMobileOpen(false);
                  setCreateWorkspaceOpen(true);
                }}
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Topbar
            onMobileMenuToggle={() => setMobileOpen(true)}
            onOpenCreateTask={() => setCreateTaskOpen(true)}
          />

          <main className="flex-1 overflow-y-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
      />
      <CreateWorkspaceModal
        isOpen={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />
      <InviteMemberModal
        isOpen={inviteMemberOpen}
        onClose={() => setInviteMemberOpen(false)}
      />
    </AppShellContext.Provider>
  );
};

