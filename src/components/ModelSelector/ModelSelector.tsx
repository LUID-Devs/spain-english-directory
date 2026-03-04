import React from 'react';
import { Check, ChevronDown, Sparkles, Brain, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AIModel, AI_MODELS, getModelConfig } from '@/types/aiModels';
import { useAIModelStore } from '@/stores/aiModelStore';

const iconMap = {
  Sparkles,
  Brain,
  Code,
  Zap,
};

interface ModelSelectorProps {
  value?: AIModel;
  onChange?: (model: AIModel) => void;
  workspaceId?: number;
  chatId?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  workspaceId,
  chatId,
  showLabel = true,
  size = 'default',
  variant = 'outline',
  className = '',
  disabled = false,
}) => {
  const store = useAIModelStore();
  
  // Use controlled value or get from store
  const selectedModel = value || store.getEffectiveModel(workspaceId, chatId);
  const modelConfig = getModelConfig(selectedModel);
  
  const handleModelChange = (model: AIModel) => {
    if (onChange) {
      onChange(model);
    } else {
      // Update store based on context
      if (chatId) {
        store.setChatModel(chatId, model);
      } else if (workspaceId) {
        store.setWorkspaceModel(workspaceId, model);
      } else {
        store.setDefaultModel(model);
      }
    }
  };

  const SelectedIcon = iconMap[modelConfig.icon as keyof typeof iconMap] || Sparkles;

  const sizeClasses = {
    sm: 'h-7 text-xs px-2',
    default: 'h-9 text-sm px-3',
    lg: 'h-11 text-base px-4',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          disabled={disabled}
          className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
        >
          <SelectedIcon 
            className="h-4 w-4" 
            style={{ color: modelConfig.color }}
          />
          {showLabel && (
            <span className="hidden sm:inline">{modelConfig.name}</span>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Select AI Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {AI_MODELS.map((model) => {
          const Icon = iconMap[model.icon as keyof typeof iconMap] || Sparkles;
          const isSelected = selectedModel === model.id;
          
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelChange(model.id)}
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${model.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: model.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {model.strengths.map((strength) => (
                    <Badge 
                      key={strength} 
                      variant="secondary" 
                      className="text-[10px] px-1 py-0"
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
