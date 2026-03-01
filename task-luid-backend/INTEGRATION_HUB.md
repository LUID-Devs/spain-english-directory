# Third-Party Integration Hub

The Integration Hub allows TaskLuid users to connect and sync tasks with external platforms like Asana and Linear, positioning TaskLuid as a central work hub similar to Notion's recent Asana integration (Feb 2026).

## Features

- **OAuth-based Connections**: Secure authentication with external providers
- **Asana Integration**: Sync tasks assigned to you from Asana workspaces
- **Linear Integration**: Sync issues assigned to you from Linear teams
- **Unified Search**: Search across all integrated tools from one place
- **Real-time Sync**: Manual sync with automatic background sync capability
- **Extensible Architecture**: Easy to add new providers (GitHub, Jira, Trello)

## Supported Providers

| Provider | Status | Features |
|----------|--------|----------|
| Asana | ✅ Ready | Read tasks, projects, assignee info |
| Linear | ✅ Ready | Read issues, states, priorities |
| GitHub | 📝 Planned | Issues, PRs |
| Jira | 📝 Planned | Issues, sprints |
| Trello | 📝 Planned | Cards, boards |

## API Endpoints

### Provider Management
```
GET  /api/integrations/providers          # List available providers
GET  /api/integrations                    # List connected integrations
POST /api/integrations/:provider/auth     # Initiate OAuth flow
POST /api/integrations/:provider/callback # Complete OAuth connection
DELETE /api/integrations/:integrationId   # Disconnect integration
POST /api/integrations/:integrationId/sync # Manual sync
```

### Integrated Tasks
```
GET /api/integrated-tasks                 # List synced tasks
GET /api/integrations/search?query=xxx    # Unified search
```

## Setup

### 1. Configure OAuth Credentials

Add to your `.env` file:

```env
# Asana - https://app.asana.com/0/developer-console
ASANA_CLIENT_ID=your_asana_client_id
ASANA_CLIENT_SECRET=your_asana_client_secret

# Linear - https://linear.app/settings/api
LINEAR_CLIENT_ID=your_linear_client_id
LINEAR_CLIENT_SECRET=your_linear_client_secret
```

### 2. Run Database Migration

```bash
npx prisma migrate dev --name add_integrations
```

### 3. Configure OAuth Redirect URIs

In your OAuth app settings, add the redirect URI:
```
https://your-app.com/api/integrations/{provider}/callback
```

## Usage Flow

### 1. Connect an Integration (Frontend)

```typescript
// Initiate OAuth
const response = await fetch('/api/integrations/asana/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    redirectUri: 'https://your-app.com/integrations/callback'
  })
});

const { authorizationUrl } = await response.json();
window.location.href = authorizationUrl;

// After user authorizes, handle callback
const callbackResponse = await fetch('/api/integrations/asana/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, state })
});
```

### 2. List Connected Integrations

```typescript
const integrations = await fetch('/api/integrations').then(r => r.json());
```

### 3. Search Across Integrations

```typescript
const results = await fetch('/api/integrations/search?query=overdue').then(r => r.json());
```

## Database Schema

### Integration Model
- Stores OAuth tokens (encrypted)
- Tracks sync status and errors
- Links to organization and user

### IntegratedTask Model
- Mirrors tasks from external providers
- Stores raw provider data as JSON
- Links to local tasks (optional)

## Security Considerations

1. **Token Encryption**: OAuth tokens are encrypted at rest
2. **Organization Isolation**: Integrations are scoped to organizations
3. **User Ownership**: Each user manages their own integrations
4. **No Write Operations**: Current implementation is read-only for safety

## Future Enhancements

- [ ] Two-way sync (push TaskLuid tasks to external tools)
- [ ] Webhook support for real-time updates
- [ ] AI-powered natural language querying
- [ ] Permission mapping from source tools
- [ ] Bulk import/export operations
