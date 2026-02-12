"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Error Boundary
 * Catches errors in the root layout and all child routes
 * Prevents the entire app from crashing on unhandled errors
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Root Error Boundary caught an error:", error);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: sendToErrorTracking(error);
    }
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full border-destructive/50">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
          <CardDescription>
            The application encountered an unexpected error. Don&apos;t worry, your data is safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bug className="h-4 w-4" />
              <span>Error Details</span>
            </div>
            <div className="text-sm font-mono text-destructive bg-background rounded p-3 overflow-x-auto">
              {error.message || "Unknown error"}
            </div>
            {process.env.NODE_ENV === "development" && error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  View stack trace
                </summary>
                <pre className="mt-2 p-3 bg-background rounded overflow-x-auto text-muted-foreground">
                  {error.stack}
                </pre>
              </details>
            )}
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
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
              Reload Page
            </Button>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Helpful message */}
          <p className="text-xs text-muted-foreground text-center">
            If this error persists, please contact support with the error details above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
