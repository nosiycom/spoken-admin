'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TemplateButton } from '@/components/template/button';

interface Course {
  _id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'exercise' | 'vocabulary';
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Sample data for now
const sampleCourses: Course[] = [
  {
    _id: '1',
    title: 'French Greetings and Introductions',
    description: 'Learn basic French greetings, how to introduce yourself, and common polite expressions.',
    type: 'lesson',
    level: 'beginner',
    category: 'Basics',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: '2',
    title: 'French Pronunciation Quiz',
    description: 'Test your French pronunciation skills with audio exercises.',
    type: 'quiz',
    level: 'beginner',
    category: 'Pronunciation',
    status: 'published',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    _id: '3',
    title: 'French Verb Conjugations - Present Tense',
    description: 'Master the present tense conjugations of regular and irregular French verbs.',
    type: 'lesson',
    level: 'intermediate',
    category: 'Grammar',
    status: 'published',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    _id: '4',
    title: 'Restaurant Vocabulary',
    description: 'Essential French vocabulary for dining out and ordering food.',
    type: 'vocabulary',
    level: 'intermediate',
    category: 'Practical French',
    status: 'published',
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
  },
  {
    _id: '5',
    title: 'French Literature Analysis',
    description: 'Advanced analysis techniques for French literary works.',
    type: 'lesson',
    level: 'advanced',
    category: 'Literature',
    status: 'draft',
    createdAt: '2024-01-19T16:20:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
  },
  {
    _id: '6',
    title: 'Subjunctive Mood Exercise',
    description: 'Practice exercises for mastering the French subjunctive mood.',
    type: 'exercise',
    level: 'advanced',
    category: 'Grammar',
    status: 'published',
    createdAt: '2024-01-20T13:10:00Z',
    updatedAt: '2024-01-20T13:10:00Z',
  },
];

function getStatusBadgeVariant(status: Course['status']) {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getTypeBadgeVariant(type: Course['type']) {
  switch (type) {
    case 'lesson':
      return 'default';
    case 'quiz':
      return 'secondary';
    case 'exercise':
      return 'outline';
    case 'vocabulary':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getLevelBadgeVariant(level: Course['level']) {
  switch (level) {
    case 'beginner':
      return 'secondary';
    case 'intermediate':
      return 'default';
    case 'advanced':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function CourseNavigationTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        } else {
          // Fallback to sample data if API fails
          setCourses(sampleCourses);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        // Fallback to sample data on error
        setCourses(sampleCourses);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Content
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your French learning course content
          </p>
        </div>
        <TemplateButton>
          + Add New Course
        </TemplateButton>
      </div>

      <div className="rounded-lg bg-white shadow ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {course.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeBadgeVariant(course.type)}>
                    {course.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getLevelBadgeVariant(course.level)}>
                    {course.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {course.category}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(course.status)}>
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(course.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          Showing {courses.length} of {courses.length} courses
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}