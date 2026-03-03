/**
 * Integration Settings Component
 * Configure sync settings, field mappings, and filters for integrations
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { IntegrationConfig, SyncConfiguration, FieldMapping, IntegrationProvider } from '@/types/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Settings,
  RefreshCw,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

interface IntegrationSettingsProps {
  integration: IntegrationConfig;
  onUpdate: (updates: Partial<IntegrationConfig>) => Promise<boolean>;
  isUpdating: boolean;
}

const syncIntervals = [
  { value: 'realtime', label: 'Real-time (via webhooks)', disabled: false },
  { value: '5min', label: 'Every 5 minutes', disabled: false },
  { value: '15min', label: 'Every 15 minutes', disabled: false },
  { value: '30min', label: 'Every 30 minutes', disabled: false },
  { value: '1hour', label: 'Every hour', disabled: false },
  { value: 'manual', label: 'Manual only', disabled: false },
];

const conflictResolutions = [
  { value: 'taskluid_wins', label: 'TaskLuid always wins', description: 'External changes are ignored' },
  { value: 'external_wins', label: 'External tool always wins', description: 'TaskLuid changes are overwritten' },
  { value: 'newer_wins', label: 'Newer timestamp wins', description: 'Most recent change takes precedence' },
  { value: 'manual', label: 'Manual resolution', description: 'Conflicts are flagged for manual review' },
];

const providerNames: Record<IntegrationProvider, string> = {
  asana: 'Asana',
  jira: 'Jira',
  linear: 'Linear',
  monday: 'Monday.com',
  trello: 'Trello',
  github: 'GitHub',
  gitlab: 'GitLab',
  slack: 'Slack',
  teams: 'Microsoft Teams',
  notion: 'Notion',
  clickup: 'ClickUp',
  zapier: 'Zapier',
};

export const IntegrationSettingsPanel: React.FC<IntegrationSettingsProps> = ({
  integration,
  onUpdate,
  isUpdating,
}) => {
  const [syncConfig, setSyncConfig] = useState<SyncConfiguration>(integration.syncConfig);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSyncConfig(integration.syncConfig);
      setHasChanges(false);
    });
  }, [integration]);

  const handleSyncConfigChange = (updates: Partial<SyncConfiguration>) => {
    setSyncConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await onUpdate({ syncConfig });
    if (success) {
      setHasChanges(false);
    }
  };

  const getDirectionIcon = () => {
    switch (syncConfig.direction) {
      case 'to_taskluid':
        return <ArrowLeft className="h-4 w-4" />;
      case 'from_taskluid':
        return <ArrowRight className="h-4 w-4" />;
      case 'bidirectional':
        return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  const getDirectionLabel = () => {
    switch (syncConfig.direction) {
      case 'to_taskluid':
        return 'Import only (External → TaskLuid)';
      case 'from_taskluid':
        return 'Export only (TaskLuid → External)';
      case 'bidirectional':
        return 'Two-way sync';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure sync behavior for {providerNames[integration.provider]}
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Sync Direction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Sync Direction
          </CardTitle>
          <CardDescription>
            Control how data flows between TaskLuid and {providerNames[integration.provider]}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={syncConfig.direction}
            onValueChange={(value: SyncConfiguration['direction']) =>
              handleSyncConfigChange({ direction: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to_taskluid">
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Import only
                </span>
              </SelectItem>
              <SelectItem value="from_taskluid">
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Export only
                </span>
              </SelectItem>
              <SelectItem value="bidirectional">
                <span className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Two-way sync
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getDirectionIcon()}
            <span>{getDirectionLabel()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sync Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sync Schedule
          </CardTitle>
          <CardDescription>
            Configure how often data should be synchronized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-sync</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync data at regular intervals
              </p>
            </div>
            <Switch
              checked={syncConfig.autoSync}
              onCheckedChange={(checked) =>
                handleSyncConfigChange({ autoSync: checked })
              }
            />
          </div>

          {syncConfig.autoSync && (
            <div className="space-y-2">
              <Label>Sync Interval</Label>
              <Select
                value={syncConfig.interval}
                onValueChange={(value: SyncConfiguration['interval']) =>
                  handleSyncConfigChange({ interval: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syncIntervals.map((interval) => (
                    <SelectItem
                      key={interval.value}
                      value={interval.value}
                      disabled={interval.disabled}
                    >
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflict Resolution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Conflict Resolution
          </CardTitle>
          <CardDescription>
            How to handle when the same data is modified in both systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={syncConfig.conflictResolution}
            onValueChange={(value: SyncConfiguration['conflictResolution']) =>
              handleSyncConfigChange({ conflictResolution: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conflictResolutions.map((resolution) => (
                <SelectItem key={resolution.value} value={resolution.value}>
                  <div className="flex flex-col items-start">
                    <span>{resolution.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {resolution.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Field Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fields to Sync</CardTitle>
          <CardDescription>
            Select which task fields should be synchronized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(syncConfig.syncFields).map(([field, enabled]) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field}`}
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    handleSyncConfigChange({
                      syncFields: {
                        ...syncConfig.syncFields,
                        [field]: checked as boolean,
                      },
                    })
                  }
                />
                <Label htmlFor={`field-${field}`} className="capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Accordion type="single" collapsible>
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Settings</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchSize">Batch Size</Label>
              <Select
                value={syncConfig.batchSize.toString()}
                onValueChange={(value) =>
                  handleSyncConfigChange({ batchSize: parseInt(value) })
                }
              >
                <SelectTrigger id="batchSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 items per batch</SelectItem>
                  <SelectItem value="25">25 items per batch</SelectItem>
                  <SelectItem value="50">50 items per batch</SelectItem>
                  <SelectItem value="100">100 items per batch</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Larger batches are faster but use more memory
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasChanges && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>You have unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettingsPanel;
