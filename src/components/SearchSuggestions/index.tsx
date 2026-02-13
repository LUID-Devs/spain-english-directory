import React, { memo, useMemo } from "react";
import { SearchSuggestion } from "@/hooks/useApi";

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
}

// Memoized suggestion item
interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  onClick: () => void;
}

const SuggestionItem = memo(({ suggestion, onClick }: SuggestionItemProps) => {
  const { icon, label } = useMemo(() => {
    switch (suggestion.type) {
      case 'task':
        return {
          icon: (
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          label: 'Task'
        };
      case 'project':
        return {
          icon: (
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          label: 'Project'
        };
      case 'user':
        return {
          icon: (
            <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          label: 'User'
        };
      default:
        return { icon: null, label: suggestion.type };
    }
  }, [suggestion.type]);

  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
    >
      <div className="flex-shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-foreground truncate">
            {suggestion.title}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
            {label}
          </span>
        </div>
        {suggestion.subtitle && (
          <p className="text-sm text-muted-foreground truncate">
            {suggestion.subtitle}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
});
SuggestionItem.displayName = 'SuggestionItem';

const SearchSuggestions = ({
  suggestions,
  onSuggestionClick,
  loading = false
}: SearchSuggestionsProps) => {
  if (loading) {
    return (
      <div className="bg-background border border-border rounded-md shadow-lg z-50">
        <div className="p-4 text-center text-muted-foreground">
          Loading suggestions...
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  // Limit to max 8 suggestions for performance
  const limitedSuggestions = suggestions.slice(0, 8);

  return (
    <div className="bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
      {limitedSuggestions.map((suggestion, index) => (
        <SuggestionItem
          key={`${suggestion.type}-${suggestion.id}-${index}`}
          suggestion={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
        />
      ))}
    </div>
  );
};

export default memo(SearchSuggestions);
