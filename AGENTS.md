# TaskLuid - AGENTS.md (Optimized)

## Quick Start
- **Project**: TaskLuid - Project management app with multi-agent architecture
- **Stack**: Vite + React 18 + TypeScript + MUI + Zustand + TanStack Query
- **Auth**: AWS Cognito
- **API**: REST + WebSocket

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route-level components
├── stores/        # Zustand state management
├── hooks/         # Custom React hooks
├── services/      # API calls (apiService.ts)
├── utils/         # Helper functions
└── types/         # TypeScript types
```

## Key Patterns

### Adding a Component
1. Create in `src/components/[ComponentName]/`
2. Export from `src/components/index.ts`
3. Use MUI components, follow existing patterns

### Adding a Page
1. Create in `src/pages/[PageName].tsx`
2. Add route in `src/App.tsx`
3. Use `ProtectedRoute` for auth-required pages

### API Calls
```typescript
// Use apiService
import { apiService } from '@/services/apiService';
const data = await apiService.get('/endpoint');
```

### State Management
- **Server state**: TanStack Query (caching, sync)
- **Client state**: Zustand (UI state, auth)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
```

## Critical Rules
1. **Never commit** `.env` files with real credentials
2. **Always type** API responses with interfaces
3. **Use existing patterns** - copy from similar components
4. **Check Zustand store** before adding new state

## Common Issues
- CORS errors → Check API URL in `.env`
- Auth issues → Verify Cognito config
- Build fails → Check for circular imports
