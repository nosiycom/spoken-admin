'use client';

import { useState, useEffect } from 'react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${card.bgColor} rounded-md p-3`}>
                  <span className="text-white text-2xl">{card.icon}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {card.value.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}