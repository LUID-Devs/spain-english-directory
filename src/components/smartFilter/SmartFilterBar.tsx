import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, X, AlertTriangle, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SmartFilterCriteria,
  parseSmartFilter,
  generateFilterChips,
  getSmartFilterSuggestions,
} from '@/lib/smartFilter';

export interface SmartFilterBarProps {
  value: string;
  onApply: (criteria: SmartFilterCriteria, filterCount: number, query: string) => void;
  onClear: () => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  isActive?: boolean;
  activeFilterCount?: number;
  currentUserId?: number;
}

export const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  value,
  onApply,
  onClear,
  onChange,
  placeholder = 'Try "my high priority tasks due this week" or "assignee:me is:in-progress"',
  isActive = false,
  activeFilterCount = 0,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [parsedResult, setParsedResult] = useState<ReturnType<typeof parseSmartFilter> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
    if (value) {
      setParsedResult(parseSmartFilter(value));
    } else {
      setParsedResult(null);
    }
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    if (newValue) {
      const parsed = parseSmartFilter(newValue);
      setParsedResult(parsed);
      setShowSuggestions(true);
    } else {
      setParsedResult(null);
      setShowSuggestions(false);
    }
  }, [onChange]);

  const handleApply = useCallback(() => {
    if (parsedResult && parsedResult.filterCount > 0) {
      onApply(parsedResult.criteria, parsedResult.filterCount, inputValue);
      setShowSuggestions(false);
    }
  }, [parsedResult, onApply]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setParsedResult(null);
    setShowSuggestions(false);
    onClear();
  }, [onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [handleApply]);

  const handleRemoveChip = useCallback((type: string, value: string) => {
    if (!parsedResult) return;
    
    const criteria = { ...parsedResult.criteria };
    
    if (type === 'text') {
      delete criteria.text;
    } else if (criteria[type as keyof SmartFilterCriteria]) {
      const arr = criteria[type as keyof SmartFilterCriteria] as string[];
      const filtered = arr.filter((v: string) => v !== value);
      if (filtered.length === 0) {
        delete (criteria as any)[type];
      } else {
        (criteria as any)[type] = filtered;
      }
    }
    
    const chips = generateFilterChips(criteria);
    const newQuery = chips.map((c: {type: string; value: string; label: string}) => {
      if (c.type === 'text') return c.value;
      if (c.type === 'assignee') return c.value === 'me' ? 'assignee:me' : `assignee:${c.value}`;
      if (c.type === 'status') return `is:${c.value.toLowerCase().replace(/\s+/g, '-')}`;
      if (c.type === 'priority') return `priority:${c.value.toLowerCase()}`;
      if (c.type === 'project') return `project:"${c.value}"`;
      if (c.type === 'label') return `label:${c.value}`;
      if (c.type === 'due') return `due:${c.value}`;
      return '';
    }).filter(Boolean).join(' ');
    
    setInputValue(newQuery);
    onChange?.(newQuery);
    
    if (chips.length > 0) {
      onApply(criteria, chips.length, newQuery);
    } else {
      onClear();
    }
  }, [parsedResult, onApply, onClear, onChange]);

  const suggestions = showSuggestions && !isActive ? getSmartFilterSuggestions(inputValue) : [];
  const chips = parsedResult && isActive ? generateFilterChips(parsedResult.criteria) : [];

  const inputContainerClasses = `
    relative rounded-lg border bg-background transition-all duration-200
    ${isFocused ? 'ring-2 ring-primary/20 border-primary' : 'border-input'}
    ${isActive ? 'border-primary/50 bg-primary/5' : ''}
  `;

  const iconContainerClasses = `
    flex-shrink-0 p-1.5 rounded-md transition-colors
    ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
  `;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>AI-powered smart filtering</span>
        <span className="text-xs">— Type naturally or use operators like assignee:me</span>
      </div>
      
      <div className={inputContainerClasses}>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className={iconContainerClasses}>
            <Sparkles className="h-4 w-4" />
          </div>

          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex items-center gap-1">
            {inputValue && !isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApply}
                disabled={!parsedResult || parsedResult.filterCount === 0}
                className="h-8 gap-1"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Apply
              </Button>
            )}
            
            {(inputValue || isActive) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-1 shadow-md"
            >
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Try these filters
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newValue = inputValue ? `${inputValue} ${suggestion.text}` : suggestion.text;
                    setInputValue(newValue);
                    onChange?.(newValue);
                    const parsed = parseSmartFilter(newValue);
                    setParsedResult(parsed);
                    onApply(parsed.criteria, parsed.filterCount, newValue);
                    setShowSuggestions(false);
                  }}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <span className="text-muted-foreground">
                    {suggestion.icon === 'user' && '👤'}
                    {suggestion.icon === 'clock' && '⏰'}
                    {suggestion.icon === 'calendar' && '📅'}
                    {suggestion.icon === 'flag' && '🚩'}
                    {suggestion.icon === 'alert' && '⚠️'}
                    {suggestion.icon === 'circle' && '⭕'}
                    {suggestion.icon === 'alert-circle' && '❗'}
                    {suggestion.icon === 'user-x' && '👤❌'}
                  </span>
                  <span className="font-medium">{suggestion.text}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{suggestion.description}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {chips.map((chip, index) => (
              <motion.div
                key={`${chip.type}-${chip.value}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  variant="secondary"
                  className={`gap-1 cursor-pointer hover:bg-destructive/10 group ${
                    chip.type === 'priority' && chip.value === 'Urgent' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''
                  } ${
                    chip.type === 'priority' && chip.value === 'High' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''
                  }`}
                  onClick={() => handleRemoveChip(chip.type, chip.value)}
                >
                  {chip.label}
                  <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </Badge>
              </motion.div>
            ))}
            
            {parsedResult?.wasInterpreted && (
              <Badge variant="outline" className="gap-1 text-xs" title={`Interpreted as: ${parsedResult.normalizedQuery}`}>
                <Sparkles className="h-3 w-3" />
                AI interpreted
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {parsedResult?.warnings && parsedResult.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 text-sm text-amber-600"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              {parsedResult.warnings.map((warning, index) => (
                <p key={index}>{warning}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartFilterBar;
