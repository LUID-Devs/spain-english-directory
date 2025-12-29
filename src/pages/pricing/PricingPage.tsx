import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const PricingPage = () => {
  useEffect(() => {
    // Redirect to LuidHub pricing page
    window.location.href = 'https://luidhub.com/pricing';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to LuidHub pricing...</p>
      </div>
    </div>
  );
};

export default PricingPage;