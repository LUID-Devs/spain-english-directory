# Third-Party Integrations Framework

This document describes the comprehensive Third-Party Integrations Framework implemented for TaskLuid, enabling seamless connectivity with external productivity tools.

## Overview

The Integration Framework provides a unified architecture for connecting TaskLuid with external tools, supporting:

- **OAuth-based Authentication** - Secure connections with third-party services
- **Bidirectional Sync** - Two-way data synchronization between TaskLuid and external tools
- **Import Wizard** - Guided migration from competitor tools
- **Webhook Support** - Real-time updates via webhook endpoints
- **Field Mapping** - Customizable field-to-field mapping between systems
- **Conflict Resolution** - Smart handling of data conflicts

## Supported Integrations

### Currently Implemented
- **Asana** - Full bidirectional sync, import/export, webhooks
- **Jira** - Full bidirectional sync, issue tracking, sprint management
- **Linear** - Full bidirectional sync, cycle management

### Framework Ready (Backend Implementation Required)
- Monday.com
- Trello
- GitHub
- GitLab
- ClickUp
- Notion
- Slack
- Microsoft Teams
- Zapier

## Architecture

### Core Types (`src/types/integrations.ts`)

```typescript
// Key interfaces
interface IntegrationConfig {
  id: number;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  settings: IntegrationSettings;
  syncConfig: SyncConfiguration;
  webhookConfig?: WebhookConfiguration;
}

interface SyncConfiguration {
  direction: SyncDirection;
  interval: 'realtime' | '5min' | '15min' | '30min' | '1hour' | 'manual';
  autoSync: boolean;
  conflictResolution: ConflictResolutionStrategy;
  syncFields: SyncFieldConfig;
}
```

### Service Layer (`src/services/integrationFrameworkService.ts`)

The service layer provides a comprehensive API for:
- Integration CRUD operations
- OAuth flow management
- Sync job control
- Import/export operations
- Webhook management
- Health monitoring

### React Hook (`src/hooks/useIntegrationFramework.ts`)

A unified hook for managing integrations:

```typescript
const {
  integrations,
  providers,
  connectedIntegrations,
  startSync,
  startImport,
  createWebhookEndpoint,
  // ... more actions
} = useIntegrationFramework();
```

## Components

### 1. Import Wizard (`src/components/integrations/ImportWizard.tsx`)

A step-by-step wizard for migrating data from competitor tools:

1. **Source Selection** - Choose the tool to import from
2. **Options Configuration** - Set import preferences
3. **Preview** - Review data before import
4. **Import Execution** - Track import progress

Features:
- Support for 7+ competitor tools
- Conflict detection and resolution
- User mapping
- Project creation options
- Progress tracking

### 2. Webhook Manager (`src/components/integrations/WebhookManager.tsx`)

Manage webhook endpoints for real-time updates:

- Create/configure webhook endpoints
- Subscribe to specific events
- View delivery history
- Regenerate secrets
- Test endpoints

Supported Events:
- `task.created` - New task created
- `task.updated` - Task modified
- `task.deleted` - Task removed
- `task.status_changed` - Status transition
- `task.assigned` - Assignment change
- `comment.added` - New comment
- `attachment.added` - File uploaded
- `project.created` - New project
- `project.updated` - Project modified

### 3. Integration Settings Panel (`src/components/integrations/IntegrationSettingsPanel.tsx`)

Configure sync behavior:

- Sync direction (import/export/bidirectional)
- Sync schedule (real-time, interval, manual)
- Conflict resolution strategy
- Field selection for sync
- Batch size configuration

### 4. Enhanced Integration Hub (`src/pages/dashboard/integrations/IntegrationHubPage.tsx`)

Central management interface with:

- Overview dashboard
- Connected integrations list
- Quick connect dialog
- Import wizard launcher
- Webhook management
- Real-time status monitoring

## Usage

### Connecting a New Integration

```typescript
import { useIntegrationFramework } from '@/hooks/useIntegrationFramework';

function ConnectButton() {
  const { connectOAuth } = useIntegrationFramework();
  
  return (
    <button onClick={() => connectOAuth('asana')}>
      Connect Asana
    </button>
  );
}
```

### Starting a Sync

```typescript
const { startSync } = useIntegrationFramework();

// Start bidirectional sync
await startSync(integrationId, 'bidirectional');

// Import only
await startSync(integrationId, 'to_taskluid');

// Export only
await startSync(integrationId, 'from_taskluid');
```

### Using the Import Wizard

```typescript
import { ImportWizard } from '@/components/integrations';

function ImportPage() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Import from External Tool
      </button>
      <ImportWizard 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
```

### Managing Webhooks

```typescript
const { 
  webhookEndpoints,
  createWebhookEndpoint,
  regenerateWebhookSecret 
} = useIntegrationFramework();

// Create new endpoint
await createWebhookEndpoint({
  name: 'My Webhook',
  url: 'https://api.example.com/webhook',
  events: ['task.created', 'task.updated'],
  isActive: true,
  secret: '',
  organizationId: 0,
});
```

## API Endpoints (Backend Requirements)

The framework expects the following API endpoints:

### Integration Management
- `GET /integrations` - List integrations
- `POST /integrations` - Create integration
- `GET /integrations/:id` - Get integration details
- `PUT /integrations/:id` - Update integration
- `DELETE /integrations/:id` - Delete integration
- `POST /integrations/:id/test` - Test connection
- `POST /integrations/:id/disconnect` - Disconnect

### OAuth
- `GET /integrations/oauth/:provider/authorize` - Get auth URL
- `POST /integrations/oauth/:provider/callback` - OAuth callback

### Sync
- `POST /integrations/:id/sync` - Start sync
- `GET /integrations/:id/sync-jobs` - List sync jobs
- `GET /sync-jobs/:id` - Get job details
- `POST /sync-jobs/:id/cancel` - Cancel job
- `PUT /integrations/:id/sync-config` - Update config

### Import
- `POST /integrations/import/preview` - Preview import
- `POST /integrations/import` - Start import
- `GET /import-jobs/:id` - Get import status
- `POST /import-jobs/:id/cancel` - Cancel import
- `GET /integrations/import/sources` - List sources

### Webhooks
- `GET /webhooks/endpoints` - List endpoints
- `POST /webhooks/endpoints` - Create endpoint
- `PUT /webhooks/endpoints/:id` - Update endpoint
- `DELETE /webhooks/endpoints/:id` - Delete endpoint
- `POST /webhooks/endpoints/:id/regenerate-secret` - Regenerate secret

## Configuration

### Environment Variables

```env
# API Base URL
VITE_API_BASE_URL=https://api.taskluid.com

# OAuth Redirect URL
VITE_OAUTH_REDIRECT_URL=https://app.taskluid.com/integrations/callback
```

### Provider Configuration

Each provider is configured in the backend with:

```typescript
interface IntegrationProviderInfo {
  id: IntegrationProvider;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  authType: 'oauth2' | 'api_key' | 'token';
  oauthConfig?: {
    authorizeUrl: string;
    scope: string[];
  };
  features: {
    bidirectionalSync: boolean;
    webhooks: boolean;
    import: boolean;
    export: boolean;
    realTimeSync: boolean;
  };
}
```

## Security Considerations

1. **OAuth Tokens** - Stored securely, never exposed to client
2. **Webhook Secrets** - Used to verify webhook signatures
3. **API Keys** - Server-side only, never in client code
4. **HTTPS Required** - All webhook URLs must use HTTPS
5. **Signature Verification** - Webhook payloads include HMAC signatures

## Future Enhancements

- [ ] Zapier/Make.com native integration
- [ ] Custom integration builder
- [ ] Sync conflict UI
- [ ] Historical sync logs
- [ ] Integration analytics
- [ ] Bulk operations
- [ ] Scheduled maintenance windows

## Acceptance Criteria Completed

- ✅ Integration framework architecture with types, services, and hooks
- ✅ OAuth-based authentication flow
- ✅ Bidirectional sync configuration
- ✅ Asana integration (competitive parity)
- ✅ Import wizard for migrating from competitors
- ✅ Webhook support for real-time updates
- ✅ Field mapping capabilities
- ✅ Conflict resolution strategies
- ✅ Health monitoring and status tracking
