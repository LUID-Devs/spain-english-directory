import React, { useState } from 'react';
import { 
  Sparkles, 
  Code, 
  Pen, 
  Brain, 
  Zap,
  ChevronDown,
  Info,
  Check,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  useAISettingsStore, 
  AI_MODELS, 
  AIModel, 
  ModelInfo,
  formatCost
} from '@/stores/aiSettingsStore';

const ICON_MAP = {
  sparkles: Sparkles,
  code: Code,
  pen: Pen,
  brain: Brain,
  zap: Zap,
};

interface AIModelCardProps {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: () => void;
}

const AIModelCard: React.FC<AIModelCardProps> = ({ model, isSelected, onSelect }) => {
  const Icon = ICON_MAP[model.icon as keyof typeof ICON_MAP] || Cpu;
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${model.color}20` }}
        >
          <Icon 
            className="w-6 h-6" 
            style={{ color: model.color }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{model.name}</span>
            {model.id === 'auto' && (
              <Badge variant="default" className="bg-gradient-to-r from-violet-500 to-purple-600">
                <Sparkles className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            )}
            {isSelected && (
              <Badge variant="outline" className="text-primary border-primary">
                <Check className="w-3 h-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {model.strengths.map((strength) => (
              <Badge 
                key={strength} 
                variant="secondary" 
                className="text-xs font-normal"
              >
                {strength}
              </Badge>
            ))}
          </div>
          
          {model.id !== 'auto' && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                ~{formatCost(model.costPer1KTokens * 10)}/10K tokens
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export const AIModelSelector: React.FC = () => {
  const { 
    selectedModel, 
    showTokenEstimates, 
    enableAutoMode,
    estimatedTokensUsed,
    estimatedCost,
    setSelectedModel,
    setShowTokenEstimates,
    setEnableAutoMode,
    resetUsage
  } = useAISettingsStore();

  const [showDetails, setShowDetails] = useState(false);
  
  const currentModel = AI_MODELS[selectedModel];
  const CurrentIcon = ICON_MAP[currentModel?.icon as keyof typeof ICON_MAP] || Cpu;

  const handleModelSelect = (modelId: AIModel) => {
    setSelectedModel(modelId);
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Brain className="h-5 w-5" />
          AI Model Selection
        </CardTitle>
        <CardDescription className="text-sm">
          Choose your preferred AI model for task analysis, search parsing, and automation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-6">
        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <Label className="text-sm font-medium mb-2 block">Selected Model</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <CurrentIcon 
                    className="w-4 h-4" 
                    style={{ color: currentModel?.color }}
                  />
                  {currentModel?.name}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-sm">
              <DropdownMenuLabel>Choose a model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(AI_MODELS) as AIModel[]).map((modelId) => {
                const model = AI_MODELS[modelId];
                const Icon = ICON_MAP[model.icon as keyof typeof ICON_MAP] || Cpu;
                return (
                  <DropdownMenuItem
                    key={modelId}
                    onClick={() => handleModelSelect(modelId)}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer',
                      selectedModel === modelId && 'bg-primary/10'
                    )}
                  >
                    <Icon className="w-4 h-4" style={{ color: model.color }} />
                    <span>{model.name}</span>
                    {selectedModel === modelId && (
                      <Check className="w-4 h-4 ml-auto text-primary" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(Object.keys(AI_MODELS) as AIModel[]).map((modelId) => (
            <AIModelCard
              key={modelId}
              model={AI_MODELS[modelId]}
              isSelected={selectedModel === modelId}
              onSelect={() => handleModelSelect(modelId)}
            />
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mode" className="text-sm font-medium">
                Auto Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically select the best model based on task type
              </p>
            </div>
            <Switch
              id="auto-mode"
              checked={enableAutoMode}
              onCheckedChange={setEnableAutoMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="token-estimates" className="text-sm font-medium">
                Show Cost Estimates
              </Label>
              <p className="text-xs text-muted-foreground">
                Display approximate token costs in AI-powered features
              </p>
            </div>
            <Switch
              id="token-estimates"
              checked={showTokenEstimates}
              onCheckedChange={setShowTokenEstimates}
            />
          </div>
        </div>

        {/* Usage Stats */}
        {estimatedTokensUsed > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Session Usage: {estimatedTokensUsed.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatCost(estimatedCost)} est.
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetUsage}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Learn More */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-xs">
              Learn more about AI models
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Model Selection Guide</DialogTitle>
              <DialogDescription>
                Understanding the different AI models available in TaskLuid
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Auto Mode (Recommended)</h4>
                <p className="text-sm text-muted-foreground">
                  When enabled, TaskLuid automatically selects the most appropriate model based on your task:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li><strong>Writing/Analysis:</strong> Claude 3.5 Sonnet for natural language tasks</li>
                  <li><strong>Code/Generation:</strong> GPT-4.1 for technical tasks</li>
                  <li><strong>Reasoning:</strong> Gemini 1.5 Pro for complex logic</li>
                  <li><strong>Deep Analysis:</strong> Claude 3 Opus for research</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Cost Considerations</h4>
                <p className="text-sm text-muted-foreground">
                  Token costs are estimates based on typical usage. Actual costs depend on the complexity of your requests.
                  TaskLuid AI features use credits that reset monthly based on your subscription plan.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Data Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  Your task data is processed securely. We do not use your data to train AI models.
                  All processing complies with our Privacy Policy and SOC 2 requirements.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Compact dropdown for use in other contexts (e.g., AI input areas)
export const AIModelDropdown: React.FC<{ className?: string }> = ({ className }) => {
  const { selectedModel, setSelectedModel } = useAISettingsStore();
  const currentModel = AI_MODELS[selectedModel];
  const CurrentIcon = ICON_MAP[currentModel?.icon as keyof typeof ICON_MAP] || Cpu;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn('h-8 gap-2', className)}
        >
          <CurrentIcon 
            className="w-4 h-4" 
            style={{ color: currentModel?.color }}
          />
          <span className="hidden sm:inline">{currentModel?.name}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>AI Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(AI_MODELS) as AIModel[]).map((modelId) => {
          const model = AI_MODELS[modelId];
          const Icon = ICON_MAP[model.icon as keyof typeof ICON_MAP] || Cpu;
          return (
            <DropdownMenuItem
              key={modelId}
              onClick={() => setSelectedModel(modelId)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                selectedModel === modelId && 'bg-primary/10'
              )}
            >
              <Icon className="w-4 h-4" style={{ color: model.color }} />
              <div className="flex flex-col">
                <span className="text-sm">{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  {model.id === 'auto' ? 'Auto-select' : `${formatCost(model.costPer1KTokens)}/1K tokens`}
                </span>
              </div>
              {selectedModel === modelId && (
                <Check className="w-4 h-4 ml-auto text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AIModelSelector;
