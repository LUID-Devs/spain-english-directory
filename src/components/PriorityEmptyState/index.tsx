import React from "react";
import { Priority } from "@/services/apiService";
import { getPriorityTheme, getPriorityButtonClasses, getPriorityGradientClasses, getPriorityGradientOverlay, getPriorityShadowClasses } from "@/lib/priorityThemes";
import { Plus } from "lucide-react";

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
    return (
      <div className="relative mb-4 sm:mb-6">
        {/* Background gradient circle with improved styling */}
        <div className={`relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full ${getPriorityGradientClasses(priority)} ${getPriorityShadowClasses(priority)} flex items-center justify-center`}>
          {/* Gradient overlay for better contrast */}
          <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-full`}></div>
          <div className="relative z-10 w-18 h-18 sm:w-24 sm:h-24 bg-background rounded-full flex items-center justify-center shadow-inner">
            <span className="text-4xl sm:text-6xl drop-shadow-sm" role="img" aria-label={`${priority} priority icon`}>
              {theme.emptyStateIcon}
            </span>
          </div>
        </div>

        {/* Enhanced floating accent elements - hidden on very small screens */}
        <div className="hidden sm:block absolute top-4 left-8 w-3 h-3 rounded-full opacity-40 shadow-sm animate-pulse" style={{ backgroundColor: theme.primaryColor, animationDelay: '0s' }}></div>
        <div className="hidden sm:block absolute bottom-8 right-6 w-2 h-2 rounded-full opacity-30 shadow-sm animate-pulse" style={{ backgroundColor: theme.accentColor, animationDelay: '1s' }}></div>
        <div className="hidden sm:block absolute top-12 right-12 w-1.5 h-1.5 rounded-full opacity-35 shadow-sm animate-pulse" style={{ backgroundColor: theme.secondaryColor, animationDelay: '2s' }}></div>
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
    <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[400px] p-4 sm:p-8 text-center">
      {renderIllustration()}

      <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {content.title}
        </h2>

        <p className="text-foreground/80 text-sm sm:text-lg font-medium px-2">
          {content.message}
        </p>

        {totalTasks > 0 && (
          <div className="bg-muted rounded-lg p-3 sm:p-4 mx-auto max-w-xs border border-border">
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              You have <span className="font-bold" style={{ color: theme.primaryColor }}>{totalTasks}</span> total tasks
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              None with {priority.toLowerCase()} priority
            </p>
          </div>
        )}

        <p className="text-xs sm:text-sm font-semibold italic px-2" style={{ color: theme.primaryColor }}>
          {content.motivation}
        </p>

        <div className="pt-2 sm:pt-4">
          <button
            onClick={onCreateTask}
            className={`${getPriorityButtonClasses(priority)} px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg inline-flex items-center gap-2 w-full sm:w-auto justify-center`}
            style={{
              backgroundColor: getPriorityTheme(priority).primaryColor,
              borderColor: getPriorityTheme(priority).primaryColor
            }}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            {content.buttonText}
          </button>
        </div>

        {/* Subtle decoration - hidden on mobile */}
        <div className="hidden sm:flex justify-center space-x-2 pt-6">
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
