'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { trackEvent } from '@/lib/analytics';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      trackEvent('dashboard_viewed', {
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🇫🇷 Spoken
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </p>
              <p className="text-sm text-gray-500">
                Admin
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-300 active:scale-95"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}