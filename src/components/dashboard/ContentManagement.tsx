'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  level: string;
  status: string;
  createdAt: string;
}

export function ContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchContent();
  }, [selectedType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const query = selectedType !== 'all' ? `?type=${selectedType}` : '';
      const response = await fetch(`/api/content${query}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    trackEvent('create_content_clicked', {
      timestamp: new Date().toISOString(),
    });
    
    // Navigate to create content page (would be implemented)
    console.log('Navigate to create content');
  };

  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'lesson', label: 'Lessons' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'pronunciation', label: 'Pronunciation' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Content Management
          </h3>
          <button
            onClick={handleCreateContent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ➕ Create Content
          </button>
        </div>

        <div className="mb-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading content...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No content found</p>
              <button
                onClick={handleCreateContent}
                className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Create your first content
              </button>
            </div>
          ) : (
            content.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {item.type} • {item.level} • {item.status}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-500 text-sm">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-500 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}