import { Activity, Task, User, Workspace } from '@/types';

// ============================================================================
// BACKEND CONTRACT REFERENCE & INITIAL MOCK DATA
// ============================================================================

/**
 * Endpoint Contract:
 * GET /api/users -> { data: User[], total: number }
 * GET /api/users/:id -> { data: User }
 * GET /api/auth/me -> { data: User }
 */
export const initialUsers: User[] = [
  {
    id: 'user_1',
    name: 'Elena Rostova',
    email: 'elena@teamflow.io',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Product Lead & Founder',
  },
  {
    id: 'user_2',
    name: 'Marcus Chen',
    email: 'marcus@teamflow.io',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Frontend Architect',
  },
  {
    id: 'user_3',
    name: 'Sarah Jenkins',
    email: 'sarah@teamflow.io',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Product Designer',
  },
  {
    id: 'user_4',
    name: 'David Okafor',
    email: 'david@teamflow.io',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Backend & Infrastructure Engineer',
  },
  {
    id: 'user_5',
    name: 'Aria Takahashi',
    email: 'aria@teamflow.io',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Developer Relations & QA',
  },
];

/**
 * Endpoint Contract:
 * GET /api/workspaces -> { data: Workspace[], total: number }
 * GET /api/workspaces/:id -> { data: Workspace }
 * POST /api/workspaces -> { data: Workspace }
 * PATCH /api/workspaces/:id -> { data: Workspace }
 */
export const initialWorkspaces: Workspace[] = [
  {
    id: 'ws_core_eng',
    name: 'Core Platform Engineering',
    slug: 'core-platform',
    description: 'High-throughput microservices, edge routing, real-time sync engine, and API gateways.',
    ownerId: 'user_1',
    createdAt: '2026-01-10T08:00:00.000Z',
    members: [
      { userId: 'user_1', role: 'ADMIN', joinedAt: '2026-01-10T08:00:00.000Z' },
      { userId: 'user_2', role: 'ADMIN', joinedAt: '2026-01-12T09:30:00.000Z' },
      { userId: 'user_4', role: 'MEMBER', joinedAt: '2026-01-15T10:15:00.000Z' },
      { userId: 'user_5', role: 'MEMBER', joinedAt: '2026-01-20T14:00:00.000Z' },
    ],
  },
  {
    id: 'ws_growth_design',
    name: 'Growth & Product Design',
    slug: 'growth-design',
    description: 'Design systems, marketing conversion funnels, onboarding experiments, and customer journeys.',
    ownerId: 'user_3',
    createdAt: '2026-01-15T11:00:00.000Z',
    members: [
      { userId: 'user_3', role: 'ADMIN', joinedAt: '2026-01-15T11:00:00.000Z' },
      { userId: 'user_1', role: 'MEMBER', joinedAt: '2026-01-16T12:00:00.000Z' },
      { userId: 'user_2', role: 'MEMBER', joinedAt: '2026-01-18T16:20:00.000Z' },
    ],
  },
];

/**
 * Endpoint Contract:
 * GET /api/workspaces/:workspaceId/tasks -> { data: Task[], total: number }
 * GET /api/tasks/:id -> { data: Task }
 * POST /api/workspaces/:workspaceId/tasks -> { data: Task }
 * PATCH /api/tasks/:id -> { data: Task }
 * DELETE /api/tasks/:id -> { message: string }
 */
export const initialTasks: Task[] = [
  // Workspace 1: Core Platform Engineering
  {
    id: 'task_101',
    title: 'Migrate connection pool to PgBouncer cluster',
    description: 'Reduce connection overhead under burst loads and optimize idle client teardown timings.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-10-24T18:00:00.000Z',
    tags: ['Database', 'Infra', 'Performance'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_1',
    assigneeId: 'user_4',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-05T14:30:00.000Z',
  },
  {
    id: 'task_102',
    title: 'Implement distributed rate limiter using Redis token bucket',
    description: 'Enforce per-workspace API quotas across multi-region ingress gateways with burst allowances.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-10-28T18:00:00.000Z',
    tags: ['Security', 'API', 'Redis'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_2',
    assigneeId: 'user_4',
    createdAt: '2026-10-02T11:20:00.000Z',
    updatedAt: '2026-10-02T11:20:00.000Z',
  },
  {
    id: 'task_103',
    title: 'Socket.IO event contract definition and heartbeat monitoring',
    description: 'Establish standard typing for workspace broadcast channels and reconnect backoff strategy.',
    status: 'TODO',
    priority: 'LOW',
    dueDate: '2026-11-02T18:00:00.000Z',
    tags: ['WebSockets', 'Architecture'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_2',
    assigneeId: 'user_2',
    createdAt: '2026-10-03T10:00:00.000Z',
    updatedAt: '2026-10-03T10:00:00.000Z',
  },
  {
    id: 'task_104',
    title: 'Refactor TanStack Query cache invalidation keys',
    description: 'Normalize hierarchical keys across workspace and task mutation hooks for atomic optimistic UI.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-10-20T18:00:00.000Z',
    tags: ['Frontend', 'State', 'Optimization'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_1',
    assigneeId: 'user_2',
    createdAt: '2026-10-04T08:30:00.000Z',
    updatedAt: '2026-10-10T16:45:00.000Z',
  },
  {
    id: 'task_105',
    title: 'Benchmark end-to-end task drag mutation latency',
    description: 'Profile 60fps framerate during rapid sortable drag re-ordering on low-spec hardware.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-10-22T18:00:00.000Z',
    tags: ['QA', 'Performance', 'Kanban'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_2',
    assigneeId: 'user_5',
    createdAt: '2026-10-06T13:15:00.000Z',
    updatedAt: '2026-10-11T09:10:00.000Z',
  },
  {
    id: 'task_106',
    title: 'Fix critical race condition in token renewal interceptor',
    description: 'Concurrent refresh requests caused 401 logout spikes during bulk mutation runs.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dueDate: '2026-10-16T18:00:00.000Z',
    tags: ['Auth', 'Bug', 'Urgent'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_1',
    assigneeId: 'user_2',
    createdAt: '2026-10-08T15:00:00.000Z',
    updatedAt: '2026-10-12T17:30:00.000Z',
  },
  {
    id: 'task_107',
    title: 'Deploy zero-downtime database migration for workspace roles',
    description: 'Added composite foreign keys and enum constraints without locking the production workspace table.',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: '2026-10-10T18:00:00.000Z',
    tags: ['Database', 'Postgres', 'Migration'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_1',
    assigneeId: 'user_4',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-10-09T18:00:00.000Z',
  },
  {
    id: 'task_108',
    title: 'Setup automated TypeScript declaration generation in CI',
    description: 'Contract types now generate automatically on PR builds, ensuring strict parity with backend models.',
    status: 'DONE',
    priority: 'LOW',
    dueDate: '2026-10-08T18:00:00.000Z',
    tags: ['CI/CD', 'TypeScript', 'DevEx'],
    workspaceId: 'ws_core_eng',
    creatorId: 'user_2',
    assigneeId: 'user_5',
    createdAt: '2026-09-25T14:00:00.000Z',
    updatedAt: '2026-10-07T11:20:00.000Z',
  },

  // Workspace 2: Growth & Product Design
  {
    id: 'task_201',
    title: 'Deliver interactive design system tokens in Figma & CSS',
    description: 'Finalize harmonious semantic tokens for light and dark modes with calibrated deep green brand accents.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-10-25T18:00:00.000Z',
    tags: ['Design System', 'Tokens', 'Figma'],
    workspaceId: 'ws_growth_design',
    creatorId: 'user_3',
    assigneeId: 'user_3',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'task_202',
    title: 'A/B test onboarding workspace selector copy',
    description: 'Measure trial-to-active conversion metrics between guided presets versus empty slate prompts.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-10-30T18:00:00.000Z',
    tags: ['Growth', 'Experiments', 'Analytics'],
    workspaceId: 'ws_growth_design',
    creatorId: 'user_3',
    assigneeId: 'user_1',
    createdAt: '2026-10-04T12:00:00.000Z',
    updatedAt: '2026-10-04T12:00:00.000Z',
  },
  {
    id: 'task_203',
    title: 'Audit WCAG 2.1 AA keyboard navigation across modal dialogs',
    description: 'Verify focus trapping, Escape dismissals, and screen reader announcements on task side sheets.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-10-18T18:00:00.000Z',
    tags: ['A11y', 'Auditing', 'Compliance'],
    workspaceId: 'ws_growth_design',
    creatorId: 'user_3',
    assigneeId: 'user_2',
    createdAt: '2026-10-05T09:30:00.000Z',
    updatedAt: '2026-10-12T14:15:00.000Z',
  },
  {
    id: 'task_204',
    title: 'Illustrate empty state SVG assets for workspace boards',
    description: 'Create calm, line-art vector compositions representing pristine boards and no-search results.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    dueDate: '2026-10-21T18:00:00.000Z',
    tags: ['Illustration', 'Assets', 'UI'],
    workspaceId: 'ws_growth_design',
    creatorId: 'user_3',
    assigneeId: 'user_3',
    createdAt: '2026-10-07T11:00:00.000Z',
    updatedAt: '2026-10-11T16:00:00.000Z',
  },
  {
    id: 'task_205',
    title: 'Design pricing tiers comparison grid and FAQ accordion',
    description: 'Craft asymmetric, distraction-free tiers showcasing Free, Pro, and Team capabilities with clear value.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: '2026-10-09T18:00:00.000Z',
    tags: ['Pricing', 'Landing', 'Marketing'],
    workspaceId: 'ws_growth_design',
    creatorId: 'user_1',
    assigneeId: 'user_3',
    createdAt: '2026-09-29T14:30:00.000Z',
    updatedAt: '2026-10-08T17:45:00.000Z',
  },
  {
    id: 'task_206',
    title: 'Conduct user interview sessions on multi-tenant workspace switching',
    description: 'Gathered feedback from 8 cross-functional team leaders on cognitive load when managing 3+ workspaces.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: '2026-10-06T18:00:00.000Z',
    tags: ['Research', 'Interviews'],
    workspaceId: 'ws_growth_design',
    creatorId: 'user_3',
    assigneeId: 'user_1',
    createdAt: '2026-09-22T09:00:00.000Z',
    updatedAt: '2026-10-05T15:00:00.000Z',
  },
];

/**
 * Endpoint Contract:
 * GET /api/workspaces/:workspaceId/activities -> { data: Activity[], total: number }
 * POST /api/workspaces/:workspaceId/activities -> { data: Activity }
 */
export const initialActivities: Activity[] = [
  {
    id: 'act_1',
    type: 'TASK_MOVED',
    description: 'moved "Refactor TanStack Query cache invalidation keys" to In Progress',
    workspaceId: 'ws_core_eng',
    userId: 'user_2',
    taskId: 'task_104',
    createdAt: '2026-10-14T06:15:00.000Z',
  },
  {
    id: 'act_2',
    type: 'TASK_CREATED',
    description: 'created urgent issue "Fix critical race condition in token renewal interceptor"',
    workspaceId: 'ws_core_eng',
    userId: 'user_1',
    taskId: 'task_106',
    createdAt: '2026-10-14T04:45:00.000Z',
  },
  {
    id: 'act_3',
    type: 'TASK_UPDATED',
    description: 'assigned "Benchmark end-to-end task drag mutation latency" to Aria Takahashi',
    workspaceId: 'ws_core_eng',
    userId: 'user_2',
    taskId: 'task_105',
    createdAt: '2026-10-13T16:20:00.000Z',
  },
  {
    id: 'act_4',
    type: 'TASK_MOVED',
    description: 'marked "Deploy zero-downtime database migration for workspace roles" as Completed',
    workspaceId: 'ws_core_eng',
    userId: 'user_4',
    taskId: 'task_107',
    createdAt: '2026-10-12T18:10:00.000Z',
  },
  {
    id: 'act_5',
    type: 'MEMBER_JOINED',
    description: 'joined Core Platform Engineering as Member',
    workspaceId: 'ws_core_eng',
    userId: 'user_5',
    createdAt: '2026-10-11T11:00:00.000Z',
  },
  {
    id: 'act_6',
    type: 'TASK_CREATED',
    description: 'created "Audit WCAG 2.1 AA keyboard navigation across modal dialogs"',
    workspaceId: 'ws_growth_design',
    userId: 'user_3',
    taskId: 'task_203',
    createdAt: '2026-10-14T05:30:00.000Z',
  },
  {
    id: 'act_7',
    type: 'TASK_MOVED',
    description: 'shipped "Design pricing tiers comparison grid and FAQ accordion"',
    workspaceId: 'ws_growth_design',
    userId: 'user_3',
    taskId: 'task_205',
    createdAt: '2026-10-13T14:10:00.000Z',
  },
  {
    id: 'act_8',
    type: 'TASK_CREATED',
    description: 'created "A/B test onboarding workspace selector copy"',
    workspaceId: 'ws_growth_design',
    userId: 'user_3',
    taskId: 'task_202',
    createdAt: '2026-10-12T09:40:00.000Z',
  },
  {
    id: 'act_9',
    type: 'MEMBER_JOINED',
    description: 'added Marcus Chen to Growth & Product Design',
    workspaceId: 'ws_growth_design',
    userId: 'user_3',
    createdAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'act_10',
    type: 'WORKSPACE_CREATED',
    description: 'created the workspace "Growth & Product Design"',
    workspaceId: 'ws_growth_design',
    userId: 'user_3',
    createdAt: '2026-10-09T08:00:00.000Z',
  },
];

// ============================================================================
// MUTABLE IN-MEMORY STORES (Provides reactive persistence during user session)
// ============================================================================

export let mockUsers: User[] = [...initialUsers];
export let mockWorkspaces: Workspace[] = JSON.parse(JSON.stringify(initialWorkspaces));
export let mockTasks: Task[] = JSON.parse(JSON.stringify(initialTasks));
export let mockActivities: Activity[] = JSON.parse(JSON.stringify(initialActivities));

/**
 * Resets in-memory mocks back to original initial values.
 */
export const resetMockDatabase = () => {
  mockUsers = [...initialUsers];
  mockWorkspaces = JSON.parse(JSON.stringify(initialWorkspaces));
  mockTasks = JSON.parse(JSON.stringify(initialTasks));
  mockActivities = JSON.parse(JSON.stringify(initialActivities));
};

