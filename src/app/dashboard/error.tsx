"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard Error Boundary
 * Catches errors specifically in the dashboard layout and routes
 * Provides a contextual error message for dashboard-specific issues
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard Error Boundary caught an error:", error);
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Dashboard Error
        </h2>
        <p className="text-muted-foreground">
          Something went wrong while loading the dashboard. Your data is safe.
        </p>
        {process.env.NODE_ENV === "development" && (
          <code className="block p-3 bg-muted rounded text-sm text-destructive font-mono max-w-md overflow-x-auto">
            {error.message}
          </code>
        )}
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button 
            onClick={reset}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button 
            onClick={handleReload}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
