'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { trackEvent } from '@/lib/analytics';
import { useEffect } from 'react';

export function DashboardHeader() {
  const { user } = useUser();

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
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Admin
              </p>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
              showName={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
}