import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { TasksPage } from '@/pages/TasksPage';
import { ChatPage } from '@/pages/ChatPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: ROUTES.HOME,
    element: <LandingPage />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.SIGNUP,
    element: <SignupPage />,
  },

  // Protected Authenticated Routes wrapped in ProtectedRoute & AppShell
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.WORKSPACE_OVERVIEW,
            element: <WorkspacePage />,
          },
          {
            path: ROUTES.WORKSPACE_TASKS,
            element: <TasksPage />,
          },
          {
            path: ROUTES.WORKSPACE_CHAT,
            element: <ChatPage />,
          },
          {
            path: ROUTES.WORKSPACE_CALENDAR,
            element: <CalendarPage />,
          },
          {
            path: ROUTES.WORKSPACE_SETTINGS,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);

