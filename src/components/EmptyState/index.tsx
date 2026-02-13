import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional custom content to render below description */
  children?: React.ReactNode;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Icon className for custom styling */
  iconClassName?: string;
}

/**
 * Reusable EmptyState component for pages with no data
 * 
 * Usage:
 * <EmptyState
 *   icon={FolderOpen}
 *   title="No projects yet"
 *   description="Get started by creating your first project"
 *   action={{ label: "Create Project", onClick: () => {} }}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  compact = false,
  className,
  iconClassName,
}) => {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent
        className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "py-8 px-4" : "py-12 px-6"
        )}
      >
        {/* Icon Container */}
        <div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center mb-4",
            compact ? "w-12 h-12" : "w-16 h-16",
            iconClassName
          )}
        >
          <Icon
            className={cn(
              "text-muted-foreground",
              compact ? "h-6 w-6" : "h-8 w-8"
            )}
          />
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-medium text-foreground mb-2",
            compact ? "text-base" : "text-lg"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-muted-foreground mb-4 max-w-sm",
            compact ? "text-sm" : "text-base"
          )}
        >
          {description}
        </p>

        {/* Custom Content */}
        {children}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || "default"}
                size={compact ? "sm" : "default"}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                size={compact ? "sm" : "default"}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
