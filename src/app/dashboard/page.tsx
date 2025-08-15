import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ContentManagement } from '@/components/dashboard/ContentManagement';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Spoken Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage content and monitor analytics for your AI-powered French learning app
              </p>
            </div>

            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentManagement />
              <AnalyticsDashboard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}