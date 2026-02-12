import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * RouteErrorBoundary
 * A lighter error boundary specifically for wrapping route components.
 * Provides a simpler UI suitable for section-level error handling.
 */
class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`RouteErrorBoundary (${this.props.componentName || 'Unknown'}) caught an error:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              This section failed to load
            </h2>
            <p className="text-muted-foreground max-w-md">
              {this.props.componentName 
                ? `The "${this.props.componentName}" section encountered an error.` 
                : 'This section encountered an error.'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <code className="block p-3 bg-muted rounded text-sm text-destructive font-mono max-w-md overflow-x-auto">
                {this.state.error.message}
              </code>
            )}
            <Button 
              onClick={this.handleReset}
              variant="outline"
              className="gap-2 mt-4"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
