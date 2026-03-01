/**
 * Import Wizard Component
 * Step-by-step wizard for importing tasks from competitor tools
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIntegrationFramework } from '@/hooks/useIntegrationFramework';
import type { IntegrationProvider, ImportOptions, ImportPreview } from '@/types/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  RefreshCw,
  Users,
  FolderKanban,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialProvider?: IntegrationProvider;
}

type WizardStep = 'source' | 'options' | 'preview' | 'importing' | 'complete';

const providerIcons: Record<IntegrationProvider, React.ReactNode> = {
  asana: <div className="w-5 h-5 rounded bg-[#F06A6A] flex items-center justify-center text-white text-xs font-bold">A</div>,
  jira: <div className="w-5 h-5 rounded bg-[#0052CC] flex items-center justify-center text-white text-xs font-bold">J</div>,
  linear: <div className="w-5 h-5 rounded bg-[#5E6AD2] flex items-center justify-center text-white text-xs font-bold">L</div>,
  monday: <div className="w-5 h-5 rounded bg-[#FF3D57] flex items-center justify-center text-white text-xs font-bold">M</div>,
  trello: <div className="w-5 h-5 rounded bg-[#0079BF] flex items-center justify-center text-white text-xs font-bold">T</div>,
  github: <div className="w-5 h-5 rounded bg-[#24292E] flex items-center justify-center text-white text-xs font-bold">G</div>,
  gitlab: <div className="w-5 h-5 rounded bg-[#FC6D26] flex items-center justify-center text-white text-xs font-bold">G</div>,
  slack: <div className="w-5 h-5 rounded bg-[#4A154B] flex items-center justify-center text-white text-xs font-bold">S</div>,
  teams: <div className="w-5 h-5 rounded bg-[#6264A7] flex items-center justify-center text-white text-xs font-bold">T</div>,
  notion: <div className="w-5 h-5 rounded bg-[#000000] flex items-center justify-center text-white text-xs font-bold">N</div>,
  clickup: <div className="w-5 h-5 rounded bg-[#7B68EE] flex items-center justify-center text-white text-xs font-bold">C</div>,
  zapier: <div className="w-5 h-5 rounded bg-[#FF4A00] flex items-center justify-center text-white text-xs font-bold">Z</div>,
};

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

const supportedImportProviders: IntegrationProvider[] = ['asana', 'jira', 'linear', 'monday', 'trello', 'clickup', 'github'];

export const ImportWizard: React.FC<ImportWizardProps> = ({
  isOpen,
  onClose,
  initialProvider,
}) => {
  const {
    providers,
    connectedIntegrations,
    getImportPreview,
    startImport,
    importPreview,
    isImporting,
  } = useIntegrationFramework();

  const [currentStep, setCurrentStep] = useState<WizardStep>('source');
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(initialProvider || null);
  const [importOptions, setImportOptions] = useState<Partial<ImportOptions>>({
    createProjects: true,
    mapUsers: true,
    importComments: true,
    importAttachments: false,
    importArchived: false,
    onConflict: 'skip',
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importId, setImportId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const availableProviders = providers.filter(p => supportedImportProviders.includes(p.id));
  
  const isProviderConnected = (providerId: IntegrationProvider) => {
    return connectedIntegrations.some(ci => ci.config.provider === providerId);
  };

  const handleSelectProvider = (provider: IntegrationProvider) => {
    setSelectedProvider(provider);
  };

  const handleNext = useCallback(async () => {
    if (currentStep === 'source' && selectedProvider) {
      setCurrentStep('options');
    } else if (currentStep === 'options') {
      // Generate preview
      if (selectedProvider) {
        const success = await getImportPreview(selectedProvider, importOptions);
        if (success) {
          setCurrentStep('preview');
        }
      }
    } else if (currentStep === 'preview') {
      // Start import
      if (selectedProvider) {
        setCurrentStep('importing');
        const id = await startImport(selectedProvider, importOptions as ImportOptions);
        if (id) {
          setImportId(id);
          // Simulate progress updates
          let progress = 0;
          intervalRef.current = setInterval(() => {
            progress += 10;
            setImportProgress(progress);
            if (progress >= 100) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              setCurrentStep('complete');
            }
          }, 500);
        } else {
          setCurrentStep('preview');
        }
      }
    }
  }, [currentStep, selectedProvider, importOptions, getImportPreview, startImport]);

  const handleBack = () => {
    if (currentStep === 'options') {
      setCurrentStep('source');
    } else if (currentStep === 'preview') {
      setCurrentStep('options');
    }
  };

  const handleClose = () => {
    setCurrentStep('source');
    setSelectedProvider(null);
    setImportOptions({
      createProjects: true,
      mapUsers: true,
      importComments: true,
      importAttachments: false,
      importArchived: false,
      onConflict: 'skip',
    });
    setImportProgress(0);
    setImportId(null);
    onClose();
  };

  const renderSourceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Select Import Source</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the tool you want to import tasks from
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {availableProviders.map((provider) => {
          const connected = isProviderConnected(provider.id);
          return (
            <button
              key={provider.id}
              onClick={() => handleSelectProvider(provider.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedProvider === provider.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${!connected ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                {providerIcons[provider.id]}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{providerNames[provider.id]}</span>
                    {!connected && (
                      <Badge variant="outline" className="text-[10px]">Not Connected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {provider.description}
                  </p>
                </div>
                {selectedProvider === provider.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!selectedProvider && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <FileJson className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-sm font-medium">Import from File</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a JSON or CSV file exported from your tool
          </p>
          <Button variant="outline" size="sm" className="mt-3">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Select File
          </Button>
        </div>
      )}
    </div>
  );

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Import Options</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how you want to import your data from {selectedProvider && providerNames[selectedProvider]}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createProjects"
                checked={importOptions.createProjects}
                onCheckedChange={(checked) =>
                  setImportOptions(prev => ({ ...prev, createProjects: checked as boolean }))
                }
              />
              <Label htmlFor="createProjects">
                Create new projects for imported data
              </Label>
            </div>
            {!importOptions.createProjects && (
              <div className="pl-6">
                <Label className="text-xs text-muted-foreground">Import into project:</Label>
                <Select
                  value={importOptions.targetProjectId?.toString()}
                  onValueChange={(value) =>
                    setImportOptions(prev => ({ ...prev, targetProjectId: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Default Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users & Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mapUsers"
                checked={importOptions.mapUsers}
                onCheckedChange={(checked) =>
                  setImportOptions(prev => ({ ...prev, mapUsers: checked as boolean }))
                }
              />
              <Label htmlFor="mapUsers">
                Try to match external users to TaskLuid users
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Data to Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="importComments"
                checked={importOptions.importComments}
                onCheckedChange={(checked) =>
                  setImportOptions(prev => ({ ...prev, importComments: checked as boolean }))
                }
              />
              <Label htmlFor="importComments">Import comments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="importAttachments"
                checked={importOptions.importAttachments}
                onCheckedChange={(checked) =>
                  setImportOptions(prev => ({ ...prev, importAttachments: checked as boolean }))
                }
              />
              <Label htmlFor="importAttachments">Import attachments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="importArchived"
                checked={importOptions.importArchived}
                onCheckedChange={(checked) =>
                  setImportOptions(prev => ({ ...prev, importArchived: checked as boolean }))
                }
              />
              <Label htmlFor="importArchived">Include archived/completed items</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflict Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={importOptions.onConflict}
              onValueChange={(value) =>
                setImportOptions(prev => ({ ...prev, onConflict: value as ImportOptions['onConflict'] }))
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="skip" id="skip" />
                <Label htmlFor="skip">Skip duplicates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="create_duplicate" id="create_duplicate" />
                <Label htmlFor="create_duplicate">Create duplicates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update_existing" id="update_existing" />
                <Label htmlFor="update_existing">Update existing tasks</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (!importPreview) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Import Preview</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Review what will be imported before proceeding
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{importPreview.totalTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{importPreview.totalProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">
                ~{Math.ceil(importPreview.estimatedImportTime / 60)}m
              </div>
              <div className="text-xs text-muted-foreground mt-1">Est. Time</div>
            </CardContent>
          </Card>
        </div>

        {importPreview.conflicts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Potential Issues ({importPreview.conflicts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {importPreview.conflicts.slice(0, 5).map((conflict, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span className="text-amber-700 dark:text-amber-400">{conflict.message}</span>
                  </li>
                ))}
                {importPreview.conflicts.length > 5 && (
                  <li className="text-xs text-muted-foreground">
                    And {importPreview.conflicts.length - 5} more...
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {Object.keys(importPreview.tasksByProject).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tasks by Project</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Tasks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(importPreview.tasksByProject)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([project, count]) => (
                      <TableRow key={project}>
                        <TableCell className="font-medium">{project}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
        <h3 className="text-lg font-medium">Importing Data...</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This may take a few minutes depending on the amount of data
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{importProgress}%</span>
        </div>
        <Progress value={importProgress} className="h-2" />
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Import ID: {importId}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div>
        <h3 className="text-lg font-medium">Import Complete!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your data has been successfully imported into TaskLuid
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        <Button onClick={() => navigate('/dashboard/projects')}>
          View Projects
        </Button>
      </div>
    </div>
  );

  const canProceed = () => {
    if (currentStep === 'source') return selectedProvider !== null;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Tasks from External Tool</DialogTitle>
          <DialogDescription>
            Migrate your tasks from {selectedProvider ? providerNames[selectedProvider] : 'external tools'} to TaskLuid
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        {currentStep !== 'importing' && currentStep !== 'complete' && (
          <div className="flex items-center gap-2 mb-6">
            {(['source', 'options', 'preview'] as WizardStep[]).map((step, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : idx < ['source', 'options', 'preview'].indexOf(currentStep)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="capitalize">{step}</span>
                </div>
                {idx < 2 && <Separator className="flex-1" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'source' && renderSourceStep()}
        {currentStep === 'options' && renderOptionsStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'importing' && renderImportingStep()}
        {currentStep === 'complete' && renderCompleteStep()}

        {/* Navigation Buttons */}
        {currentStep !== 'importing' && currentStep !== 'complete' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'source'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isImporting}
            >
              {currentStep === 'preview' ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Import
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportWizard;
