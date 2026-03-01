# Cross-Platform Integrations (TASK-684)

This feature implements cross-platform integrations with Asana, Linear, and Jira, allowing TaskLuid users to:
- Connect multiple external task management tools
- Search across all connected platforms from a unified interface
- Link external tasks to TaskLuid tasks with bi-directional sync
- View tasks from external tools in a centralized dashboard

## Overview

**Strategic Context:** Notion shipped Asana integration on Feb 4, 2026, allowing users to search Asana tasks directly from Notion. This is a competitive response to ensure TaskLuid remains a central hub for task management.

**Benefits:**
- Reduces context switching between tools
- Makes TaskLuid a central hub for all task management
- Defensive play against Notion expansion
- Enables unified task search and discovery

## Implemented Features

### 1. Integration Hub (`IntegrationHubPage.tsx`)
Central location to manage all integrations:
- Connect/disconnect Asana, Linear, and Jira
- View connection status for each integration
- Access external tool API documentation
- Quick links to integration settings

### 2. Service Layer

#### Asana Service (`asanaService.ts`)
- Get workspaces, projects, sections, users
- Search tasks
- Link/unlink tasks
- Bi-directional sync
- OAuth connection handling

#### Linear Service (`linearService.ts`)
- Get organizations, teams, projects, users
- Get states, labels, cycles
- Search issues
- Link/unlink issues
- Bi-directional sync
- OAuth connection handling

#### Jira Service (`jiraService.ts`)
- Get sites, projects, issue types
- Get statuses, priorities, sprints, components
- Search issues
- Link/unlink issues
- Bi-directional sync
- OAuth connection handling

#### Unified Search Service (`unifiedSearchService.ts`)
- Search across all connected integrations
- Get search suggestions
- Get recent external tasks
- Get tasks assigned to current user
- Link external tasks to TaskLuid tasks
- Format unified search results

### 3. React Hooks

- `useAsana.ts` - React hook for Asana integration state and actions
- `useLinear.ts` - React hook for Linear integration state and actions
- `useJira.ts` - React hook for Jira integration state and actions
- `useUnifiedSearch.ts` - React hook for cross-platform search

### 4. UI Components

#### UnifiedSearch Component (`UnifiedSearch.tsx`)
- Command palette-style search interface
- Source filtering (Asana/Linear/Jira)
- Real-time suggestions
- Task linking functionality
- Result cards with source badges

#### IntegrationHubPage (`IntegrationHubPage.tsx`)
- Connection status cards for each integration
- OAuth connect buttons
- Refresh status functionality
- Connected integration overview
- Cross-tool search interface placeholder

### 5. Command Palette Integration
Updated Command Palette to:
- Show external task suggestions during search
- Navigate to Integration Hub
- Quick access to external tasks

## API Endpoints (Backend Contract)

### Asana
- `GET /integrations/asana/status` - Connection status
- `GET /integrations/asana/connect` - OAuth flow initiation
- `GET /integrations/asana/workspaces` - List workspaces
- `GET /integrations/asana/workspaces/:id/projects` - List projects
- `GET /integrations/asana/projects/:id/sections` - List sections
- `GET /integrations/asana/workspaces/:id/users` - List users
- `GET /integrations/asana/search` - Search tasks
- `DELETE /integrations/asana/disconnect` - Disconnect

### Linear
- `GET /integrations/linear/status` - Connection status
- `GET /integrations/linear/connect` - OAuth flow initiation
- `GET /integrations/linear/organizations` - List organizations
- `GET /integrations/linear/organizations/:id/teams` - List teams
- `GET /integrations/linear/teams/:id/projects` - List projects
- `GET /integrations/linear/teams/:id/states` - List states
- `GET /integrations/linear/teams/:id/labels` - List labels
- `GET /integrations/linear/teams/:id/cycles` - List cycles
- `GET /integrations/linear/organizations/:id/users` - List users
- `GET /integrations/linear/search` - Search issues
- `DELETE /integrations/linear/disconnect` - Disconnect

### Jira
- `GET /integrations/jira/status` - Connection status
- `GET /integrations/jira/connect` - OAuth flow initiation
- `GET /integrations/jira/sites` - List sites
- `GET /integrations/jira/sites/:id/projects` - List projects
- `GET /integrations/jira/projects/:id/issue-types` - List issue types
- `GET /integrations/jira/projects/:id/statuses` - List statuses
- `GET /integrations/jira/sites/:id/priorities` - List priorities
- `GET /integrations/jira/sites/:id/users` - List users
- `GET /integrations/jira/projects/:id/sprints` - List sprints
- `GET /integrations/jira/projects/:id/components` - List components
- `GET /integrations/jira/search` - Search issues
- `DELETE /integrations/jira/disconnect` - Disconnect

### Unified Search
- `POST /integrations/search` - Search across all tools
- `GET /integrations/search/suggestions` - Get search suggestions
- `GET /integrations/status` - Get connected integrations status
- `GET /integrations/recent` - Get recent tasks from all tools
- `GET /integrations/my-tasks` - Get my tasks from all tools

## Usage

### Connecting an Integration
1. Navigate to `/dashboard/integrations`
2. Click "Connect" for the desired integration
3. Complete OAuth flow
4. Return to TaskLuid

### Searching External Tasks
1. Use the UnifiedSearch component or Command Palette (Cmd+K)
2. Type search query (2+ characters)
3. View suggestions from all connected tools
4. Click to open external task

### Linking External Tasks
1. Open a TaskLuid task
2. Use the UnifiedSearch component with `taskIdToLink` prop
3. Search for the external task
4. Click "Link" to establish connection

## Future Enhancements

- [ ] Real-time sync webhooks
- [ ] Batch operations for linking multiple tasks
- [ ] Field mapping customization UI
- [ ] Conflict resolution interface
- [ ] Sync history and logs
- [ ] Import/export integrations
- [ ] Team-level integration settings
- [ ] Custom field sync
- [ ] Comment sync between platforms
- [ ] Attachment sync

## Technical Notes

- All services follow the same pattern as existing Asana integration
- Error handling uses toast notifications
- Loading states are per-operation to prevent race conditions
- OAuth flows redirect to backend endpoints
- External links open in new tabs

## Acceptance Criteria (From Task)

- [x] Research Asana API for task search
- [x] Research Linear API integration
- [x] Research Jira API integration
- [x] Design unified search interface
- [x] Implement OAuth for each integration
- [x] Display external tasks in TaskLuid views

## Files Added/Modified

### New Files
- `src/services/linearService.ts` - Linear API service
- `src/services/jiraService.ts` - Jira API service
- `src/services/unifiedSearchService.ts` - Unified search service
- `src/hooks/useLinear.ts` - Linear React hook
- `src/hooks/useJira.ts` - Jira React hook
- `src/hooks/useUnifiedSearch.ts` - Unified search React hook
- `src/components/integrations/UnifiedSearch.tsx` - Unified search UI
- `src/components/integrations/index.ts` - Integration exports

### Modified Files
- `src/pages/dashboard/integrations/IntegrationHubPage.tsx` - Updated to support all integrations
- `src/components/CommandPalette/CommandPalette.tsx` - Added external search results
