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

## Getting Started

In `TeamFront/`:

```bash
# Start local development server
npm run dev

# Production build
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

