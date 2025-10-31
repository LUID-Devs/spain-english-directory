"use client";
import React from "react";
import { SearchSuggestion } from "@/hooks/useApi";

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
}

const SearchSuggestions = ({ 
  suggestions, 
  onSuggestionClick, 
  loading = false 
}: SearchSuggestionsProps) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 dark:bg-gray-800 dark:border-gray-600">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Loading suggestions...
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'project':
        return (
          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'user':
        return (
          <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'project':
        return 'Project';
      case 'user':
        return 'User';
      default:
        return type;
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.type}-${suggestion.id}-${index}`}
          onClick={() => onSuggestionClick(suggestion)}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-700 dark:border-gray-600"
        >
          <div className="flex-shrink-0">
            {getTypeIcon(suggestion.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {suggestion.title}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {getTypeLabel(suggestion.type)}
              </span>
            </div>
            {suggestion.subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {suggestion.subtitle}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchSuggestions;