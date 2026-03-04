import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Brain, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiService, AgentContextConfig, AgentContextDecision, AgentContextStats } from "@/services/apiService";
import { useAuth } from "@/app/authProvider";

const STRATEGIES = [
  { value: "none", label: "None" },
  { value: "minimal", label: "Minimal" },
  { value: "full", label: "Full" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "routine_ops", label: "Routine Ops" },
  { value: "research", label: "Research" },
  { value: "implementation", label: "Implementation" },
  { value: "bug_fix", label: "Bug Fix" },
  { value: "code_review", label: "Code Review" },
  { value: "documentation", label: "Documentation" },
] as const;

const DEFAULT_CONFIG: AgentContextConfig = {
  defaultStrategy: "none",
  enforceJustification: true,
  categoriesRequiringContext: ["implementation", "research"],
  abTestConfig: {
    enabled: true,
    experimentPercentage: 50,
    controlStrategy: "none",
    experimentalStrategy: "full",
  },
};

type PreviewFormState = {
  taskTitle: string;
  taskDescription: string;
  hasDeepConventions: boolean;
  isMultiStep: boolean;
  estimatedFileChanges: number;
  explicitContextStrategy: "auto" | "none" | "minimal" | "full";
  contextJustification: string;
};

const DEFAULT_PREVIEW: PreviewFormState = {
  taskTitle: "",
  taskDescription: "",
  hasDeepConventions: false,
  isMultiStep: false,
  estimatedFileChanges: 1,
  explicitContextStrategy: "auto",
  contextJustification: "",
};

const AgentContextSettings: React.FC = () => {
  const { activeOrganization } = useAuth();
  const [config, setConfig] = useState<AgentContextConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<AgentContextStats | null>(null);
  const [preview, setPreview] = useState<AgentContextDecision | null>(null);
  const [previewForm, setPreviewForm] = useState<PreviewFormState>(DEFAULT_PREVIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abTestEnabled = Boolean(config.abTestConfig?.enabled);
  const organizationReady = Boolean(activeOrganization?.id);

  const canSave = useMemo(() => config.defaultStrategy && organizationReady, [config.defaultStrategy, organizationReady]);

  const fetchConfigAndStats = async () => {
    if (!organizationReady) return;
    setIsLoading(true);
    setError(null);
    try {
      const [configResponse, statsResponse] = await Promise.all([
        apiService.getAgentContextConfig(),
        apiService.getAgentContextStats(),
      ]);
      setConfig({
        ...DEFAULT_CONFIG,
        ...configResponse.data,
        abTestConfig: configResponse.data.abTestConfig ?? DEFAULT_CONFIG.abTestConfig,
      });
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load agent context settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization?.id]);

  const handleCategoryToggle = (category: AgentContextConfig["categoriesRequiringContext"][number]) => {
    setConfig((prev) => {
      const categories = new Set(prev.categoriesRequiringContext);
      if (categories.has(category)) {
        categories.delete(category);
      } else {
        categories.add(category);
      }
      return {
        ...prev,
        categoriesRequiringContext: Array.from(categories) as AgentContextConfig["categoriesRequiringContext"],
      };
    });
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await apiService.updateAgentContextConfig(config);
      setConfig({
        ...DEFAULT_CONFIG,
        ...response.data,
        abTestConfig: response.data.abTestConfig ?? DEFAULT_CONFIG.abTestConfig,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to save agent context settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!previewForm.taskTitle.trim()) {
      setError("Task title is required to preview.");
      return;
    }
    setIsPreviewing(true);
    setError(null);
    try {
      const response = await apiService.previewAgentContextDecision({
        taskTitle: previewForm.taskTitle,
        taskDescription: previewForm.taskDescription || undefined,
        hasDeepConventions: previewForm.hasDeepConventions,
        isMultiStep: previewForm.isMultiStep,
        estimatedFileChanges: Number(previewForm.estimatedFileChanges) || 0,
        explicitContextStrategy:
          previewForm.explicitContextStrategy === "auto"
            ? undefined
            : previewForm.explicitContextStrategy,
        contextJustification: previewForm.contextJustification || undefined,
      });
      setPreview(response.data);
    } catch (err: any) {
      setError(err?.message || "Failed to preview context decision.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleClearHistory = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await apiService.clearAgentContextHistory();
      const statsResponse = await apiService.getAgentContextStats();
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(err?.message || "Failed to clear history.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Brain className="h-5 w-5" />
          Agent Context Gate
        </CardTitle>
        <CardDescription className="text-sm">
          Control when AGENTS.md context is loaded and track strategy performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Default Strategy</Label>
              <p className="text-xs text-muted-foreground">
                Used when no explicit strategy or category override is present.
              </p>
            </div>
            <Select
              value={config.defaultStrategy}
              onValueChange={(value) =>
                setConfig((prev) => ({ ...prev, defaultStrategy: value as AgentContextConfig["defaultStrategy"] }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enforce-justification" className="text-sm font-medium">
                Require Justification
              </Label>
              <p className="text-xs text-muted-foreground">
                Requires context justification when using minimal or full context.
              </p>
            </div>
            <Switch
              id="enforce-justification"
              checked={config.enforceJustification}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, enforceJustification: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Categories Requiring Context</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <label key={category.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={config.categoriesRequiringContext.includes(
                      category.value as AgentContextConfig["categoriesRequiringContext"][number]
                    )}
                    onCheckedChange={() => handleCategoryToggle(category.value)}
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">A/B Test Allocation</Label>
              <p className="text-xs text-muted-foreground">
                Split tasks between two strategies for experimentation.
              </p>
            </div>
            <Switch
              checked={abTestEnabled}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  abTestConfig: {
                    ...(prev.abTestConfig || DEFAULT_CONFIG.abTestConfig!),
                    enabled: checked,
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Experiment %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={config.abTestConfig?.experimentPercentage ?? 0}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    abTestConfig: {
                      ...(prev.abTestConfig || DEFAULT_CONFIG.abTestConfig!),
                      experimentPercentage: Number(event.target.value) || 0,
                    },
                  }))
                }
                disabled={!abTestEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Control Strategy</Label>
              <Select
                value={config.abTestConfig?.controlStrategy ?? "none"}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    abTestConfig: {
                      ...(prev.abTestConfig || DEFAULT_CONFIG.abTestConfig!),
                      controlStrategy: value as AgentContextConfig["defaultStrategy"],
                    },
                  }))
                }
                disabled={!abTestEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Control" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Experimental Strategy</Label>
              <Select
                value={config.abTestConfig?.experimentalStrategy ?? "full"}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    abTestConfig: {
                      ...(prev.abTestConfig || DEFAULT_CONFIG.abTestConfig!),
                      experimentalStrategy: value as AgentContextConfig["defaultStrategy"],
                    },
                  }))
                }
                disabled={!abTestEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Experimental" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={fetchConfigAndStats} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={handleClearHistory} disabled={isSaving}>
            Clear History
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Usage Snapshot (30 days)</Label>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">Total Runs: {stats?.totalRuns ?? 0}</Badge>
            <Badge variant="secondary">None: {stats?.runsByStrategy.none ?? 0}</Badge>
            <Badge variant="secondary">Minimal: {stats?.runsByStrategy.minimal ?? 0}</Badge>
            <Badge variant="secondary">Full: {stats?.runsByStrategy.full ?? 0}</Badge>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <Label className="text-sm font-medium">Preview Strategy Decision</Label>
            <p className="text-xs text-muted-foreground">
              Test how the gate will classify a task before you run an agent.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Task Title</Label>
              <Input
                value={previewForm.taskTitle}
                onChange={(event) =>
                  setPreviewForm((prev) => ({ ...prev, taskTitle: event.target.value }))
                }
                placeholder="Fix onboarding regression in billing flow"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Task Description</Label>
              <Textarea
                value={previewForm.taskDescription}
                onChange={(event) =>
                  setPreviewForm((prev) => ({ ...prev, taskDescription: event.target.value }))
                }
                placeholder="Optional details to influence category classification."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Estimated File Changes</Label>
              <Input
                type="number"
                min={0}
                value={previewForm.estimatedFileChanges}
                onChange={(event) =>
                  setPreviewForm((prev) => ({
                    ...prev,
                    estimatedFileChanges: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Explicit Strategy</Label>
              <Select
                value={previewForm.explicitContextStrategy}
                onValueChange={(value) =>
                  setPreviewForm((prev) => ({
                    ...prev,
                    explicitContextStrategy: value as PreviewFormState["explicitContextStrategy"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  {STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={previewForm.isMultiStep}
                onCheckedChange={(checked) =>
                  setPreviewForm((prev) => ({ ...prev, isMultiStep: Boolean(checked) }))
                }
              />
              <Label className="text-sm">Multi-step task</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={previewForm.hasDeepConventions}
                onCheckedChange={(checked) =>
                  setPreviewForm((prev) => ({ ...prev, hasDeepConventions: Boolean(checked) }))
                }
              />
              <Label className="text-sm">Requires deep conventions</Label>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Context Justification</Label>
              <Input
                value={previewForm.contextJustification}
                onChange={(event) =>
                  setPreviewForm((prev) => ({ ...prev, contextJustification: event.target.value }))
                }
                placeholder="Needed to follow internal billing rules."
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePreview} disabled={isPreviewing}>
              {isPreviewing ? "Previewing..." : "Preview Decision"}
            </Button>
            <Button variant="outline" onClick={() => setPreviewForm(DEFAULT_PREVIEW)}>
              Reset
            </Button>
          </div>
          {preview && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Category: {preview.category}</Badge>
                <Badge variant="outline">Strategy: {preview.decision.strategy}</Badge>
                {preview.decision.isABTest && preview.decision.abTestGroup && (
                  <Badge variant="outline">A/B: {preview.decision.abTestGroup}</Badge>
                )}
              </div>
              <p className="mt-2 text-muted-foreground">{preview.decision.reason}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentContextSettings;
