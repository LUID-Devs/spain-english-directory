import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  RotateCcw, 
  Info, 
  ChevronDown,
  Check,
  Code,
  Pen,
  Zap,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import { AI_MODELS, AIModel, formatCost, getModelConfig } from '@/types/aiModels';
import { useAIModelStore } from '@/stores/aiModelStore';

// Icon mapping
const IconMap = {
  Sparkles,
  Code,
  Brain,
  Zap,
  Pen,
};

interface ModelCardProps {
  model: typeof AI_MODELS[0];
  isSelected: boolean;
  onSelect: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected, onSelect }) => {
  const Icon = IconMap[model.icon as keyof typeof IconMap] || Brain;
  
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
                <BarChart3 className="w-3 h-3" />
                ~{formatCost(model.costPer1KTokens * 10)}/10K tokens
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export const AIModelSettings: React.FC = () => {
  const store = useAIModelStore();
  const [showDetails, setShowDetails] = useState(false);
  
  const defaultModelConfig = getModelConfig(store.defaultModel);
  const FallbackIcon = IconMap[defaultModelConfig.icon as keyof typeof IconMap] || Sparkles;

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
                  <FallbackIcon 
                    className="w-4 h-4" 
                    style={{ color: defaultModelConfig.color }}
                  />
                  {defaultModelConfig.name}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-sm">
              <DropdownMenuLabel>Choose a model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AI_MODELS.map((model) => {
                const Icon = IconMap[model.icon as keyof typeof IconMap] || Brain;
                return (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => store.setDefaultModel(model.id)}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer',
                      store.defaultModel === model.id && 'bg-primary/10'
                    )}
                  >
                    <Icon className="w-4 h-4" style={{ color: model.color }} />
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.id === 'auto' ? 'Auto-select' : formatCost(model.costPer1KTokens) + '/1K tokens'}
                      </span>
                    </div>
                    {store.defaultModel === model.id && (
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
          {AI_MODELS.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={store.defaultModel === model.id}
              onSelect={() => store.setDefaultModel(model.id)}
            />
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mode" className="text-sm font-medium flex items-center gap-2">
                Auto Mode
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Auto Mode</DialogTitle>
                      <DialogDescription>
                        When enabled, TaskLuid automatically selects the best model for each task:
                      </DialogDescription>
                    </DialogHeader>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2 mt-4">
                      <li><strong>Code/Technical:</strong> GPT-4.1</li>
                      <li><strong>Writing:</strong> Claude 3.5 Sonnet</li>
                      <li><strong>Analysis:</strong> Claude 3 Opus</li>
                      <li><strong>Reasoning/Research:</strong> Gemini 1.5 Pro</li>
                      <li><strong>General:</strong> Claude 3.5 Sonnet</li>
                    </ul>
                  </DialogContent>
                </Dialog>
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically select the best model based on task type
              </p>
            </div>
            <Switch
              id="auto-mode"
              checked={store.autoModeEnabled}
              onCheckedChange={(checked) => store.setDefaultModel(checked ? 'auto' : 'claude-3.5-sonnet')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cost-estimates" className="text-sm font-medium">
                Show Cost Estimates
              </Label>
              <p className="text-xs text-muted-foreground">
                Display approximate token costs in AI-powered features
              </p>
            </div>
            <Switch
              id="cost-estimates"
              checked={store.showCostEstimates}
              onCheckedChange={store.toggleCostEstimates}
            />
          </div>
        </div>

        {/* Usage Stats */}
        {store.sessionTokensUsed > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Session: {store.sessionTokensUsed.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatCost(store.sessionCostEstimate)} est.
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={store.resetUsage}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Section */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={store.resetAllPreferences}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset AI Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIModelSettings;
