"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Users Page Error Boundary
 * Handles errors specifically in the users management pages
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Users Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <UserCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Failed to Load Users
        </h2>
        <p className="text-muted-foreground">
          There was an error loading the user list. Please try again.
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
        </div>
      </div>
    </div>
  );
}
