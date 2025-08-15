'use client';

import { useEffect } from 'react';

export function LoggingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalError = window.console.error;
      const originalWarn = window.console.warn;
      const originalLog = window.console.log;

      window.console.error = (...args: any[]) => {
        originalError.apply(console, args);
        
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: args.join(' '),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {});
      };

      window.console.warn = (...args: any[]) => {
        originalWarn.apply(console, args);
        
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'warn',
            message: args.join(' '),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {});
      };

      return () => {
        window.console.error = originalError;
        window.console.warn = originalWarn;
        window.console.log = originalLog;
      };
    }
  }, []);

  return <>{children}</>;
}