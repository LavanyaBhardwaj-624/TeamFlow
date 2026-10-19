# TeamFlow — Multi-Workspace Team Collaboration Platform (Frontend)

TeamFlow is a production-grade, multi-tenant team collaboration SaaS frontend (Trello + Slack lite) built with **React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, and Zustand**.

All data is structured behind an API-contract-ready service layer with simulated latency. Swapping the mock services for a real Express + Prisma + PostgreSQL backend later requires touching only the `services/` folder.

---

## Tech Stack

- **Runtime & Bundler**: React 18, TypeScript, Vite
- **Routing**: React Router v6 (SPA with Protected Route guards)
- **State & Caching**: TanStack Query (React Query v5) + Zustand (Session & Workspace state)
- **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers`)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Styling**: Tailwind CSS with custom CSS variables (light & soft-dark modes)
- **Typography**: Space Grotesk (headings) & Inter (body)
- **Icons**: Lucide React
- **WebSockets**: Socket.IO client structure stub (`src/lib/socket.ts`, `useSocket` hook)

---

## File Structure

```
src/
  main.tsx                    # Application entry point
  App.tsx                     # Providers & router wiring
  index.css                   # Theme tokens & typography
  routes/
    index.tsx                 # Route definitions table
    ProtectedRoute.tsx        # Auth guard with session check
  pages/
    LandingPage.tsx           # Modern asymmetric landing page with live board preview
    LoginPage.tsx             # Split-screen login with Google SSO mock & demo presets
    SignupPage.tsx            # Split-screen signup with password strength checks
    DashboardPage.tsx         # Multi-workspace stats, cards, quick actions & activity feed
    WorkspacePage.tsx         # /workspace/:id overview, member directory & role badges
    TasksPage.tsx             # /workspace/:id/tasks dnd-kit Kanban board with detail sheet
    ChatPage.tsx              # /workspace/:id/chat channel switcher & message stream
    CalendarPage.tsx          # /workspace/:id/calendar sprint schedule placeholder
    SettingsPage.tsx          # Workspace & app theme preferences
    ProfilePage.tsx           # User profile & interactive mock persona switcher
  modules/
    auth/                     # useAuthStore, schemas, types
    workspace/                # useWorkspaceStore, useCurrentWorkspaceRole, modals, schemas
    task/                     # KanbanColumn, TaskCard, TaskDetailSheet, CreateTaskModal, schemas
    user/                     # User components
  components/
    ui/                       # Button, Input, Textarea, Select, Badge, Modal, Sheet
    layout/                   # AppShell, Sidebar, Topbar, WorkspaceSwitcher
    dashboard/                # StatCard, WorkspaceCard, QuickActions, ActivityFeed
    common/                   # Avatar, AvatarGroup, Skeleton, Loader, EmptyState, ErrorState
  services/
    auth.service.ts           # Login, signup, session restoration, user directory
    task.service.ts           # Task CRUD, column movement, status updates, deletion
    workspace.service.ts      # Workspace listing, detail, creation, member invite
    activity.service.ts       # Workspace activity logs
  lib/
    utils.ts                  # cn(), date formatters, initials generator
    socket.ts                 # Socket.IO client stub & useSocket hook
    queryClient.ts            # TanStack Query Client instance
    theme.ts                  # Theme store with localStorage persistence
  config/
    mockData.ts               # Canonical fake database with documented API endpoints
    routes.ts                 # Route constants & builder helpers
    constants.ts              # Status configurations, priority palettes, app settings
  types/
    index.ts                  # Domain models (User, Workspace, Task, Activity, Role)
```

---

## Key Features & Highlights

1. **Multi-Tenant Workspaces**:
   - Instant switching between workspaces (e.g. *Core Platform Engineering* and *Growth & Product Design*).
   - Switching workspace reactively refreshes the active Kanban board, members list, and activities.
   - Quick workspace creation via Zod-validated modal.

2. **Full Kanban Board with Drag & Drop**:
   - 3 columns: `TO DO`, `IN PROGRESS`, and `COMPLETED`.
   - Built with `@dnd-kit/core` and `@dnd-kit/sortable` for 60fps smooth physics.
   - Optimistic cache update with instant visual feedback.
   - Task detail side sheet for viewing specs, changing priority, reassignment, or updating due dates.
   - Real-time search filter and priority / assignee dropdown filters.

3. **Role-Based Access Control (RBAC)**:
   - Built-in roles: `ADMIN` and `MEMBER`.
   - **Admin permissions**: Can invite new members, delete tasks across all columns, and edit workspace metadata.
   - **Member permissions**: Can create and edit tasks, drag tasks, and participate in channels. Task deletion is restricted.
   - **Built-in Persona Switcher**: In the Topbar and Profile page, you can switch between mock personas (`Elena Rostova` (Admin), `David Okafor` (Member), `Sarah Jenkins` (Admin), etc.) to test permission states immediately.

4. **Activity Stream**:
   - Live audit stream that records when tasks are created, status transitions occur, and new members join.

5. **Eye-Soothing Light & Soft-Dark Modes**:
   - Light: `#FAFAF9` background, `#FFFFFF` surface, `#14171C` ink, `#0B6E4F` deep green accent.
   - Soft Dark: `#0F1115` background, `#171A20` surface, `#ECEEF1` ink, `#10B981` emerald accent.
   - Persisted in `localStorage` and toggled via Topbar / Settings.

6. **Backend-Ready Contract**:
   - `src/config/mockData.ts` documents every endpoint contract (e.g. `// GET /api/workspaces/:id/tasks -> { data: Task[] }`).
   - Every service returns real API shapes (e.g. `{ data: ... }` or `{ data: [...], total: n }`) with a simulated delay.

---

## Getting Started

In the `TeamFront` directory:

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Production build test
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

