import React from 'react';
import { Brain, Sparkles, RotateCcw, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AI_MODELS, getModelConfig, AIModel } from '@/types/aiModels';
import { useAIModelStore } from '@/stores/aiModelStore';
import { ModelSelector } from './ModelSelector';

const iconMap = {
  Sparkles: Sparkles,
  Brain: Brain,
  Code: require('lucide-react').Code,
  Zap: require('lucide-react').Zap,
};

interface AIModelSettingsProps {
  className?: string;
}

export const AIModelSettings: React.FC<AIModelSettingsProps> = ({ className = '' }) => {
  const store = useAIModelStore();
  const defaultModelConfig = getModelConfig(store.defaultModel);
  const FallbackIcon = iconMap[defaultModelConfig.icon as keyof typeof iconMap] || Sparkles;

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Default Model Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Default AI Model
            </CardTitle>
            <CardDescription>
              Choose your preferred AI model for all tasks. This can be overridden per-workspace or per-chat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Selection */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${defaultModelConfig.color}20` }}
                >
                  <FallbackIcon style={{ color: defaultModelConfig.color }} className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{defaultModelConfig.name}</p>
                  <p className="text-sm text-muted-foreground">{defaultModelConfig.description}</p>
                </div>
              </div>
              <ModelSelector 
                value={store.defaultModel}
                onChange={(model) => store.setDefaultModel(model)}
                showLabel={true}
                size="default"
              />
            </div>

            {/* Auto Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-mode" className="flex items-center gap-2">
                  Auto Mode
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>When enabled, LuidGPT automatically selects the best model based on the task type.</p>
                      <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                        <li>Coding tasks → Claude 3.5 Sonnet</li>
                        <li>Creative writing → GPT-4o</li>
                        <li>Research tasks → Gemini 1.5 Pro</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically select the best model for each task
                </p>
              </div>
              <Switch
                id="auto-mode"
                checked={store.autoModeEnabled}
                onCheckedChange={(checked) => {
                  // Store doesn't have this action yet, we'll add it
                  store.setDefaultModel(checked ? 'auto' : 'gpt-4o');
                }}
              />
            </div>

            <Separator />

            {/* Model Indicator Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-indicator">Show Model Indicator</Label>
                <p className="text-sm text-muted-foreground">
                  Display the current AI model in the interface
                </p>
              </div>
              <Switch
                id="show-indicator"
                checked={store.showModelIndicator}
                onCheckedChange={store.toggleModelIndicator}
              />
            </div>
          </CardContent>
        </Card>

        {/* Available Models Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Available Models
            </CardTitle>
            <CardDescription>
              Overview of all AI models available in LuidGPT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AI_MODELS.map((model) => {
                const Icon = iconMap[model.icon as keyof typeof iconMap] || Sparkles;
                const isSelected = store.defaultModel === model.id;
                
                return (
                  <div
                    key={model.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${model.color}15` }}
                    >
                      <Icon style={{ color: model.color }} className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{model.name}</p>
                        {isSelected && (
                          <Badge variant="default" className="text-[10px]">Default</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {model.provider}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {model.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {model.strengths.map((strength) => (
                          <Badge
                            key={strength}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {!isSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => store.setDefaultModel(model.id)}
                        className="flex-shrink-0"
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>          </CardContent>
        </Card>

        {/* Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <RotateCcw className="h-5 w-5" />
              Reset Preferences
            </CardTitle>
            <CardDescription>
              Reset all AI model preferences to their default values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={store.resetAllPreferences}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All AI Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AIModelSettings;
