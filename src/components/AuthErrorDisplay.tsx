import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/app/authProvider';

/**
 * AuthErrorDisplay - Shows authentication errors with retry functionality
 * Use this in your app to display auth errors to users
 */
export const AuthErrorDisplay: React.FC = () => {
  const navigate = useNavigate();
  const { error, clearError, refreshAuth } = useAuth();

  if (!error) return null;

  const handleRetry = async () => {
    clearError();
    await refreshAuth();
  };

  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="h-6 w-6 text-amber-500" />;
      case 'auth':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full border-destructive/20 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">Authentication Error</CardTitle>
          </div>
          <CardDescription>
            We encountered a problem while checking your authentication status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          
          <div className="flex gap-3">
            {error.retryable && (
              <Button 
                onClick={handleRetry}
                className="flex-1 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth/login')}
              className="flex-1"
            >
              Go to Login
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthErrorDisplay;
