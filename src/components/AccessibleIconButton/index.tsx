import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Copy, MoreVertical, Pencil, Trash2, Key, ExternalLink } from "lucide-react";

/**
 * AccessibleIconButton - A wrapper for icon-only buttons with proper accessibility
 * 
 * This component ensures all icon-only buttons have:
 * - aria-label attribute (required)
 * - title attribute for tooltip on hover
 * - focus-visible styles for keyboard navigation
 * 
 * Usage:
 * <AccessibleIconButton
 *   icon={<Pencil className="h-4 w-4" />}
 *   ariaLabel="Edit item"
 *   title="Edit"
 *   onClick={handleEdit}
 * />
 */
interface AccessibleIconButtonProps {
  icon: React.ReactNode;
  ariaLabel: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
  icon,
  ariaLabel,
  title,
  onClick,
  variant = "ghost",
  size = "icon",
  className = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      title={title || ariaLabel}
    >
      {icon}
    </Button>
  );
};

export default AccessibleIconButton;
