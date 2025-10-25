'use client';

import { useEffect, useState } from 'react';

export function PerformanceDebug() {
  const [timing, setTiming] = useState<string[]>([]);

  useEffect(() => {
    const startTime = performance.now();
    setTiming(prev => [...prev, `Component mounted: ${Date.now()}`]);

    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      const shortUrl = url.includes('localhost') ? url.split('localhost:8000')[1] : url;
      const requestStart = performance.now();
      setTiming(prev => [...prev, `🔄 API: ${shortUrl} - START`]);
      
      try {
        const response = await originalFetch(...args);
        const requestEnd = performance.now();
        const duration = (requestEnd - requestStart).toFixed(0);
        const status = response.ok ? '✅' : '❌';
        setTiming(prev => [...prev, `${status} API: ${shortUrl} - ${duration}ms`]);
        return response;
      } catch (error) {
        const requestEnd = performance.now();
        const duration = (requestEnd - requestStart).toFixed(0);
        setTiming(prev => [...prev, `💥 API: ${shortUrl} - FAILED (${duration}ms)`]);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
      const endTime = performance.now();
      setTiming(prev => [...prev, `Component unmounted after: ${(endTime - startTime).toFixed(2)}ms`]);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '300px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <h4>Performance Debug</h4>
      {timing.map((entry, index) => (
        <div key={index}>{entry}</div>
      ))}
    </div>
  );
}