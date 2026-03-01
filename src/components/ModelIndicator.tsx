import React from 'react';
import { Sparkles, Brain, Code, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AIModel, getModelConfig } from '@/types/aiModels';
import { useAIModelStore } from '@/stores/aiModelStore';

const iconMap = {
  Sparkles,
  Brain,
  Code,
  Zap,
};

interface ModelIndicatorProps {
  model?: AIModel;
  workspaceId?: number;
  chatId?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'subtle' | 'dot';
  className?: string;
}

export const ModelIndicator: React.FC<ModelIndicatorProps> = ({
  model,
  workspaceId,
  chatId,
  showTooltip = true,
  size = 'default',
  variant = 'default',
  className = '',
}) => {
  const store = useAIModelStore();
  const showIndicator = store.showModelIndicator;
  
  if (!showIndicator) return null;
  
  const effectiveModel = model || store.getEffectiveModel(workspaceId, chatId);
  const modelConfig = getModelConfig(effectiveModel);
  const Icon = iconMap[modelConfig.icon as keyof typeof iconMap] || Sparkles;

  const sizeClasses = {
    sm: {
      badge: 'text-[10px] px-1.5 py-0 h-5',
      icon: 'h-3 w-3',
      dot: 'w-1.5 h-1.5',
    },
    default: {
      badge: 'text-xs px-2 py-0.5 h-6',
      icon: 'h-3.5 w-3.5',
      dot: 'w-2 h-2',
    },
    lg: {
      badge: 'text-sm px-2.5 py-1 h-7',
      icon: 'h-4 w-4',
      dot: 'w-2.5 h-2.5',
    },
  };

  const sizes = sizeClasses[size];

  // Dot variant - minimal indicator
  if (variant === 'dot') {
    const indicator = (
      <span
        className={`inline-block rounded-full ${sizes.dot}`}
        style={{ backgroundColor: modelConfig.color }}
        title={`Using ${modelConfig.name}`}
      />
    );

    if (!showTooltip) return indicator;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {indicator}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{modelConfig.name}</p>
            <p className="text-xs text-muted-foreground">{modelConfig.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Subtle variant - just icon
  if (variant === 'subtle') {
    const indicator = (
      <span className={`inline-flex items-center gap-1 text-muted-foreground ${className}`}>
        <Icon 
          className={sizes.icon} 
          style={{ color: modelConfig.color }}
        />
        <span className={size === 'sm' ? 'hidden' : 'text-xs'}>{modelConfig.name}</span>
      </span>
    );

    if (!showTooltip) return indicator;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {indicator}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{modelConfig.name}</p>
            <p className="text-xs text-muted-foreground">{modelConfig.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant - badge with icon and text
  const indicator = (
    <Badge
      variant="secondary"
      className={`inline-flex items-center gap-1.5 font-medium ${sizes.badge} ${className}`}
      style={{ 
        backgroundColor: `${modelConfig.color}15`,
        color: modelConfig.color,
        borderColor: `${modelConfig.color}30`,
      }}
    >
      <Icon className={sizes.icon} />
      {modelConfig.name}
    </Badge>
  );

  if (!showTooltip) return indicator;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{modelConfig.name}</p>
            <p className="text-xs text-muted-foreground">{modelConfig.description}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {modelConfig.strengths.map((strength) => (
                <span 
                  key={strength}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ModelIndicator;
