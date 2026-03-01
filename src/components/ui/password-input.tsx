import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
  toggleButtonClassName?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, containerClassName, toggleButtonClassName, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={cn("relative", containerClassName)}>
        <input
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            "transition-all duration-300 pr-12",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800/50",
            className
          )}
          ref={ref}
          {...props}
        />
        <motion.button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground",
            "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md",
            toggleButtonClassName
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
