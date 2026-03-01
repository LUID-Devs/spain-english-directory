import React from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AI_MODELS, AIModel, formatCost } from '@/types/aiModels';

interface ModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
  showLabel?: boolean;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Sparkles: ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
    </svg>
  ),
  Code: ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Brain: ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z" />
    </svg>
  ),
  Zap: ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Pen: ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  showLabel = true,
  size = 'default',
  className,
}) => {
  const selectedModel = AI_MODELS.find(m => m.id === value) || AI_MODELS[0];
  const SelectedIcon = iconMap[selectedModel.icon] || Sparkles;

  const sizeClasses = {
    sm: 'h-7 text-xs',
    default: 'h-9 text-sm',
    lg: 'h-11 text-base',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 px-3',
            sizeClasses[size],
            className
          )}
        >
          <SelectedIcon
            className="w-4 h-4"
            style={{ color: selectedModel.color }}
          />
          {showLabel && <span>{selectedModel.name}</span>}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {AI_MODELS.map((model) => {
          const Icon = iconMap[model.icon] || Sparkles;
          const isSelected = value === model.id;
          
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onChange(model.id)}
              className={cn(
                'flex items-start gap-3 py-3 cursor-pointer',
                isSelected && 'bg-primary/10'
              )}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${model.color}20` }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: model.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {model.description}
                </p>
                {model.id !== 'auto' && (
                  <span className="text-xs text-muted-foreground">
                    ~{formatCost(model.costPer1KTokens * 10)}/10K tokens
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
