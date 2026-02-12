"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary
 * This is the error boundary of last resort for the entire application.
 * It catches errors that occur in the root layout and can't be caught by
 * regular error.tsx files.
 * 
 * Note: global-error.tsx replaces the root layout when active, so it must
 * include its own <html> and <body> tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global Error Boundary caught an error:", error);
    
    // Send to error tracking in production
    if (process.env.NODE_ENV === "production") {
      // Example: sendToErrorTracking(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card border border-destructive/50 rounded-lg shadow-lg p-8">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Critical Application Error
                </h1>
                <p className="text-muted-foreground">
                  The application has encountered a critical error and cannot continue.
                  Please try reloading the page.
                </p>
              </div>

              {/* Error Details */}
              <div className="rounded-lg bg-muted p-4 text-left">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Bug className="h-4 w-4" />
                  <span>Error Details</span>
                </div>
                <div className="text-sm font-mono text-destructive bg-background rounded p-3 overflow-x-auto">
                  {error.message || "Unknown error"}
                </div>
                {process.env.NODE_ENV === "development" && error.stack && (
                  <details className="text-xs mt-2">
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
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-muted-foreground">
                If this error persists, please contact support with the error ID above.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
