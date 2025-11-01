import React from "react";
import { Priority } from "@/services/apiService";
import { getPriorityTheme, getPriorityButtonClasses, getPriorityGradientClasses, getPriorityGradientOverlay, getPriorityShadowClasses } from "@/lib/priorityThemes";

interface PriorityEmptyStateProps {
  priority: Priority;
  onCreateTask: () => void;
  totalTasks: number;
}

const PriorityEmptyState: React.FC<PriorityEmptyStateProps> = ({
  priority,
  onCreateTask,
  totalTasks
}) => {
  const theme = getPriorityTheme(priority);

  const renderIllustration = () => {
    const iconSize = "text-6xl";
    
    return (
      <div className="relative mb-6">
        {/* Background gradient circle with improved styling */}
        <div className={`relative w-32 h-32 mx-auto rounded-full ${getPriorityGradientClasses(priority)} ${getPriorityShadowClasses(priority)} flex items-center justify-center`}>
          {/* Gradient overlay for better contrast */}
          <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-full`}></div>
          <div className="relative z-10 w-24 h-24 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
            <span className={`${iconSize} drop-shadow-sm`} role="img" aria-label={`${priority} priority icon`}>
              {theme.emptyStateIcon}
            </span>
          </div>
        </div>
        
        {/* Enhanced floating accent elements */}
        <div className="absolute top-4 left-8 w-3 h-3 rounded-full opacity-40 shadow-sm animate-pulse" style={{ backgroundColor: theme.primaryColor, animationDelay: '0s' }}></div>
        <div className="absolute bottom-8 right-6 w-2 h-2 rounded-full opacity-30 shadow-sm animate-pulse" style={{ backgroundColor: theme.accentColor, animationDelay: '1s' }}></div>
        <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full opacity-35 shadow-sm animate-pulse" style={{ backgroundColor: theme.secondaryColor, animationDelay: '2s' }}></div>
      </div>
    );
  };

  const getEmptyStateContent = () => {
    if (totalTasks === 0) {
      return {
        title: "No Tasks Created Yet",
        message: "Start organizing your work by creating your first task!",
        motivation: "Every great project begins with a single task. Let's get started!",
        buttonText: "Create First Task"
      };
    }

    return {
      title: theme.emptyStateTitle,
      message: theme.emptyStateMessage,
      motivation: theme.motivationalMessage,
      buttonText: `Create ${priority} Task`
    };
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      {renderIllustration()}
      
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {content.title}
        </h2>
        
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium">
          {content.message}
        </p>
        
        {totalTasks > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/80 rounded-lg p-4 mx-auto max-w-xs border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              You have <span className="font-bold" style={{ color: theme.primaryColor }}>{totalTasks}</span> total tasks
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
              None with {priority.toLowerCase()} priority
            </p>
          </div>
        )}
        
        <p className="text-sm font-semibold italic" style={{ color: theme.primaryColor }}>
          {content.motivation}
        </p>
        
        <div className="pt-4">
          <button
            onClick={onCreateTask}
            className={`${getPriorityButtonClasses(priority)} px-8 py-3 text-base font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
            style={{ 
              backgroundColor: getPriorityTheme(priority).primaryColor,
              borderColor: getPriorityTheme(priority).primaryColor 
            }}
          >
            <span className="mr-2" role="img" aria-label="add">
              ➕
            </span>
            {content.buttonText}
          </button>
        </div>
        
        {/* Subtle decoration */}
        <div className="flex justify-center space-x-2 pt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full opacity-30 animate-pulse"
              style={{ 
                backgroundColor: theme.primaryColor,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriorityEmptyState;