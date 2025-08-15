'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalEvents: number;
  topEvents: Array<{
    eventType: string;
    count: number;
  }>;
  userActivity: Array<{
    date: string;
    count: number;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEvents: 0,
    topEvents: [],
    userActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const response = await fetch(
        `/api/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Process analytics data
        const processedData = processAnalyticsData(data.analytics || []);
        setAnalytics(processedData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (rawData: any[]): AnalyticsData => {
    const eventCounts: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};

    rawData.forEach((event) => {
      // Count events by type
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;

      // Count daily activity
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    const topEvents = Object.entries(eventCounts)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const userActivity = Object.entries(dailyActivity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalEvents: rawData.length,
      topEvents,
      userActivity,
    };
  };

  const timeRanges = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Analytics Overview
          </h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Total Events: {analytics.totalEvents.toLocaleString()}
              </h4>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Top Events
              </h4>
              <div className="space-y-2">
                {analytics.topEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No events recorded</p>
                ) : (
                  analytics.topEvents.map((event, index) => (
                    <div
                      key={event.eventType}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {event.eventType}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Daily Activity
              </h4>
              <div className="space-y-1">
                {analytics.userActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">No activity data</p>
                ) : (
                  analytics.userActivity.map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">
                        {day.count} events
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}