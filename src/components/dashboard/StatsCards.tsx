'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  totalContent: number;
  publishedContent: number;
  totalUsers: number;
  activeUsers: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    publishedContent: 0,
    totalUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const cards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: '📚',
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Published Content',
      value: stats.publishedContent,
      icon: '✅',
      bgColor: 'bg-green-500',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      bgColor: 'bg-purple-500',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: '🎯',
      bgColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="rounded-lg bg-white px-6 py-4 shadow ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm/6 font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">{card.icon}</div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +20.1% from last month
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}