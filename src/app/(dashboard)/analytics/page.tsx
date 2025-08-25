import { requireAuth } from '@/lib/auth';

export default async function AnalyticsPage() {
  const user = await requireAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track user engagement and learning progress</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* User Activity Chart */}
        <div className="col-span-full lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">User Activity</h2>
          </header>
          <div className="p-5">
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              📊 Chart placeholder - User activity over time
            </div>
          </div>
        </div>

        {/* Course Completion */}
        <div className="col-span-full lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Course Completion</h2>
          </header>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">French Basics</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Conversational French</span>
                <span className="text-sm font-medium">72%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">French Grammar</span>
                <span className="text-sm font-medium">63%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '63%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="col-span-full lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Learning Statistics</h2>
          </header>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Session Time</span>
                <span className="font-medium">24 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Daily Active Users</span>
                <span className="font-medium">432</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="font-medium">73%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                <span className="font-medium">89%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="col-span-full lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Performing Content</h2>
          </header>
          <div className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium">Basic Greetings</span>
                <span className="text-sm text-green-600 dark:text-green-400">+15%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium">Verb Conjugations</span>
                <span className="text-sm text-green-600 dark:text-green-400">+12%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium">Food Vocabulary</span>
                <span className="text-sm text-green-600 dark:text-green-400">+8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}