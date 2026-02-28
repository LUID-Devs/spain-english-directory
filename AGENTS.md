# TaskLuid Web - Agent Context

This is **TaskLuid**, a project management application. This file helps you work effectively with the codebase.

## Project Overview

TaskLuid is a feature-rich project management platform with:
- Task and project management with priorities (Urgent → Backlog)
- Team collaboration with workspaces and organizations
- Real-time updates via WebSocket
- Custom workflows with status management
- Time tracking and analytics
- Mobile app generation capability

## Tech Stack

| Category | Technology |
|----------|------------|
| Build Tool | Vite 6.x |
| Framework | React 18 + TypeScript 5 |
| Router | React Router DOM 6 |
| UI Library | Material-UI (MUI) 6.x + Radix UI primitives |
| Styling | Tailwind CSS 3.4 |
| State Management | Zustand 5 (persisted) |
| Data Fetching | TanStack Query (React Query) 5 |
| Auth | AWS Amplify 6 + Cognito |
| Rich Text | TipTap editor |
| Charts | Recharts |
| Testing | Vitest 3 |

## Project Structure

```
src/
├── app/                    # App-level providers and wrappers
│   ├── authProvider.tsx    # AWS Cognito auth context
│   ├── dashboardWrapper.tsx # Dashboard layout wrapper
│   └── dashboard/          # Dashboard sub-pages (lazy-loaded)
├── pages/                  # Route-level pages
│   ├── landing/            # Marketing pages (LuidSuite, LuidKit, etc.)
│   ├── auth/               # Login, register, OAuth
│   ├── dashboard/          # Main app pages
│   │   ├── projects/       # Project management
│   │   ├── tasks/          # Task views (kanban, list, etc.)
│   │   ├── teams/          # Team management
│   │   ├── timeline/       # Gantt timeline view
│   │   ├── goals/          # Goal tracking
│   │   ├── automation/     # Workflow automation
│   │   └── analytics/      # Dashboard analytics
│   └── legal/              # Privacy, terms
├── components/             # Reusable components
│   ├── ComponentName/      # Each component has its own folder
│   │   ├── index.tsx       # Main component
│   │   └── types.ts        # Component types (if needed)
│   └── [55+ component folders]
├── services/               # API and external services
│   ├── apiService.ts       # Main API client (93KB, extensive!)
│   ├── asanaService.ts     # Asana integration
│   └── gitReviewService.ts # Git integration
├── stores/                 # Zustand state stores
│   └── globalStore.ts      # Theme, sidebar state
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts (UndoProvider, etc.)
├── lib/                    # Utilities and helpers
└── config/                 # App configuration
```

## Key Patterns

### Adding a New Page
1. Create page in `src/pages/[section]/PageName.tsx`
2. Add route in `src/App.tsx` (use `React.lazy()` for dashboard pages)
3. Dashboard pages use `DashboardWrapper` for layout

### Adding a Component
1. Create folder: `src/components/ComponentName/`
2. Export from `index.tsx`
3. Use MUI components as base, Tailwind for utilities

### API Calls
- Use `apiService.ts` for all backend communication
- Return types are defined in the service (e.g., `Project`, `Task`)
- Priority mapping: Frontend (Urgent/High/Medium/Low/Backlog) ↔ API (P0/P1/P2/P3)

### State Management
- **Global UI state**: Zustand (`src/stores/globalStore.ts`)
- **Server state**: TanStack Query (caching, refetching)
- **Local component state**: React `useState`/`useReducer`

### Authentication
- All dashboard routes require auth (handled by `AuthProvider`)
- Landing/legal pages are public
- OAuth callbacks handled separately

## Important Conventions

1. **Imports**: Use `@/` path alias (e.g., `import { Button } from '@/components/Button'`)
2. **Types**: Define interfaces near usage; shared types in `src/lib/types.ts`
3. **Styling**: Combine MUI components with Tailwind utilities via `className` + `sx` prop
4. **Error Handling**: Use `ErrorBoundary` wrapper; toast errors via `sonner`
5. **Loading States**: Use `Suspense` with fallback skeletons

## Common Commands

```bash
npm run dev              # Start dev server (port 5173)
npm run build            # Production build	npm run lint             # ESLint check
npm run test             # Run Vitest tests
npm run test:coverage    # Coverage report
```

## Backend Integration

- API base URL: Configured via env var (see `.env.example`)
- Authentication: AWS Cognito JWT tokens
- Real-time: WebSocket at `/ws` for live updates
- File uploads: Direct to S3 with presigned URLs

## Testing

- Unit tests: Vitest + Happy DOM
- E2E: Playwright (in `/e2e/` folder)
- Mock API calls in tests using `msw` or manual mocks

## Troubleshooting

- **Auth issues**: Check `AuthDebug.tsx` component output
- **Build failures**: Ensure all MUI imports use `@mui/material`
- **Type errors**: Run `npm run lint` first
- **Missing routes**: Check `App.tsx` route definitions

---

## Memory Guidelines (If You're an AI Agent)

- Update `memory/YYYY-MM-DD.md` for daily work logs
- Document decisions in `docs/decisions/` for significant choices
- The `README.md` has detailed architecture docs if you need deep dives
