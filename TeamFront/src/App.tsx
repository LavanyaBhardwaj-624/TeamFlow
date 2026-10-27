import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/routes';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { useWorkspaceStore } from '@/modules/workspace/useWorkspaceStore';
import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspace.service';
import { taskService } from '@/services/task.service';
import { activityService } from '@/services/activity.service';
import { connectSocket, disconnectSocket, socket } from '@/lib/socket';

const WorkspaceSync: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { activeWorkspaceId, setWorkspaces, setMembers, setTasks, setActivities } = useWorkspaceStore();
  const workspaces = useQuery({ 
    queryKey: ['workspaces', 1, 100], 
    queryFn: () => workspaceService.getWorkspaces(1, 100), 
    enabled: isAuthenticated 
  });
  const members = useQuery({
     queryKey: ['workspace-members', activeWorkspaceId], 
     queryFn: () => workspaceService.getWorkspaceMembers(activeWorkspaceId as string), 
     enabled: isAuthenticated && Boolean(activeWorkspaceId) 
    });
  const tasks = useQuery({
     queryKey: ['tasks', activeWorkspaceId],
      queryFn: () => taskService.getTasksByWorkspace(activeWorkspaceId), 
      enabled: isAuthenticated && Boolean(activeWorkspaceId) 
    });
  const activities = useQuery({ queryKey: ['activities', activeWorkspaceId], 
    queryFn: () => activityService.getActivitiesByWorkspace(activeWorkspaceId as string),
     enabled: isAuthenticated && Boolean(activeWorkspaceId)
     });
    useEffect(() => { 
     if (workspaces.data)
       setWorkspaces(workspaces.data.data); 
      }, [workspaces.data, setWorkspaces]);
  useEffect(() => { if (members.data) setMembers(members.data.data); }, [members.data, setMembers]);
  useEffect(() => { if (tasks.data) setTasks(tasks.data.data); }, [tasks.data, setTasks]);
  useEffect(() => { if (activities.data) setActivities(activities.data.data); }, [activities.data, setActivities]);
  return null;
};

const RealtimeSync: React.FC = () => {
  const { token, isAuthenticated } = useAuthStore();
  const { activeWorkspaceId, addWorkspace, setTasks, setActivities, tasks, activities } = useWorkspaceStore();
  useEffect(() => {
     if (!isAuthenticated || !token){
       disconnectSocket();
        return; 
      }
       connectSocket(token);
        return () => disconnectSocket(); 
  }, [isAuthenticated, token]);
  useEffect(() => { if (activeWorkspaceId && socket.connected) socket.emit('workspace:join', activeWorkspaceId); return () => { if (activeWorkspaceId) socket.emit('workspace:leave', activeWorkspaceId); }; }, [activeWorkspaceId]);
  useEffect(() => { const onWorkspace = (payload: { workspace?: import('@/types').Workspace }) => { if (payload.workspace) addWorkspace(payload.workspace); }; const onTask = (payload: { task?: import('@/types').Task }) => { if (payload.task) setTasks([payload.task, ...tasks.filter((task) => task.id !== payload.task?.id)]); }; const onTaskUpdated = (payload: import('@/types').Task & { deleted?: boolean }) => setTasks(payload.deleted ? tasks.filter((task) => task.id !== payload.id) : tasks.map((task) => task.id === payload.id ? { ...task, ...payload } : task)); const onActivity = (activity: import('@/types').Activity) => setActivities([activity, ...activities.filter((item) => item.id !== activity.id)]); socket.on('workspace:created', onWorkspace); socket.on('task:created', onTask); socket.on('task:updated', onTaskUpdated); socket.on('activity:created', onActivity); return () => { socket.off('workspace:created', onWorkspace); socket.off('task:created', onTask); socket.off('task:updated', onTaskUpdated); socket.off('activity:created', onActivity); }; }, [addWorkspace, setTasks, setActivities, tasks, activities]);
  return null;
};

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <WorkspaceSync />
      <RealtimeSync />
    </QueryClientProvider>
  );
};

export default App;

