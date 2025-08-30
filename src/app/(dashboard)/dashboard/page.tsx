import { requireAuth } from '@/lib/auth';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { ContentManagement } from '@/components/dashboard/ContentManagement';
import { CourseNavigationTable } from '@/components/dashboard/CourseNavigationTable';

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your Spoken Admin Portal</p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <StatsCards />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Analytics Dashboard */}
        <div>
          <AnalyticsDashboard />
        </div>

        {/* Content Management */}
        <div>
          <ContentManagement />
        </div>
      </div>

      {/* Course Navigation Table */}
      <div className="mb-8">
        <CourseNavigationTable />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-12 gap-6">
        {/* Total Courses */}
        <div className="col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="flex flex-col h-full p-5">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500/10">
                <svg className="w-5 h-5 fill-violet-500" viewBox="0 0 20 20">
                  <path d="M8.864 1.5a.6.6 0 0 0-.728 0L1.5 5.85a.6.6 0 0 0 0 .9l6.636 4.35a.6.6 0 0 0 .728 0l6.636-4.35a.6.6 0 0 0 0-.9L8.864 1.5Z" />
                  <path d="M2.5 8.3L8.5 12l6-3.7v3.2a.6.6 0 0 1-.24.48L8.76 15.2a.6.6 0 0 1-.52 0L2.74 11.98a.6.6 0 0 1-.24-.48V8.3Z" />
                </svg>
              </div>
            </div>
            <div className="grow flex flex-col justify-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Total Courses</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">24</div>
              <div className="text-xs text-green-500">+12% from last month</div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="flex flex-col h-full p-5">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500/10">
                <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 20 20">
                  <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.918 14c.77 0 1.366-.702 1.09-1.424a7.502 7.502 0 0 0-14.016 0C2.716 13.298 3.312 14 4.082 14h11.836Z" />
                </svg>
              </div>
            </div>
            <div className="grow flex flex-col justify-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Active Users</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">1,234</div>
              <div className="text-xs text-green-500">+8% from last month</div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="flex flex-col h-full p-5">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
                <svg className="w-5 h-5 fill-green-500" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm1 3v6h2V7H5Zm4 0v6h2V7H9Zm4 0v6h2V7h-2Z" />
                </svg>
              </div>
            </div>
            <div className="grow flex flex-col justify-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Lessons</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">456</div>
              <div className="text-xs text-green-500">+15% from last month</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="flex flex-col h-full p-5">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10">
                <svg className="w-5 h-5 fill-yellow-500" viewBox="0 0 20 20">
                  <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.738 6.262-4.5 4.5a1 1 0 0 1-1.414 0l-2.25-2.25a1 1 0 1 1 1.414-1.414L8.75 10.06l3.79-3.79a1 1 0 1 1 1.414 1.414Z" />
                </svg>
              </div>
            </div>
            <div className="grow flex flex-col justify-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Completion Rate</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">89%</div>
              <div className="text-xs text-green-500">+5% from last month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}