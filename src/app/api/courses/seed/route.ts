import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { CourseService } from '@/lib/services/courses';
import type { CourseInsert } from '@/types/database';

const sampleCourses = [
  {
    title: 'French Greetings and Introductions',
    description: 'Learn basic French greetings, how to introduce yourself, and common polite expressions used in everyday conversations.',
    level: 'beginner' as const,
    category: 'Basics',
    is_published: true,
    estimated_duration_hours: 1,
    sort_order: 1,
  },
  {
    title: 'French Pronunciation Quiz',
    description: 'Test your French pronunciation skills with audio exercises focusing on common sounds and liaisons.',
    level: 'beginner' as const,
    category: 'Pronunciation',
    is_published: true,
    estimated_duration_hours: 1,
    sort_order: 2,
  },
  {
    title: 'French Verb Conjugations - Present Tense',
    description: 'Master the present tense conjugations of regular and irregular French verbs with comprehensive examples.',
    level: 'intermediate' as const,
    category: 'Grammar',
    is_published: true,
    estimated_duration_hours: 2,
    sort_order: 3,
  },
  {
    title: 'Restaurant Vocabulary',
    description: 'Essential French vocabulary for dining out, ordering food, and restaurant conversations.',
    level: 'intermediate' as const,
    category: 'Practical French',
    is_published: true,
    estimated_duration_hours: 1,
    sort_order: 4,
  },
  {
    title: 'French Literature Analysis',
    description: 'Advanced analysis techniques for French literary works, focusing on style, themes, and historical context.',
    level: 'advanced' as const,
    category: 'Literature',
    is_published: false,
    estimated_duration_hours: 3,
    sort_order: 5,
  },
  {
    title: 'Subjunctive Mood Exercise',
    description: 'Practice exercises for mastering the French subjunctive mood in various contexts and expressions.',
    level: 'advanced' as const,
    category: 'Grammar',
    is_published: true,
    estimated_duration_hours: 2,
    sort_order: 6,
  },
];

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseService = new CourseService();

    // Insert sample courses
    const insertedCourses = [];
    
    for (const courseData of sampleCourses) {
      const course: CourseInsert = {
        ...courseData,
        created_by: user.id,
      };
      
      const insertedCourse = await courseService.createCourse(course);
      insertedCourses.push(insertedCourse);
    }

    return Response.json({ 
      message: `Successfully seeded ${insertedCourses.length} courses`,
      courses: insertedCourses.length,
    });
  } catch (error) {
    console.error('Course seeding error:', error);
    return Response.json({ error: 'Failed to seed courses' }, { status: 500 });
  }
}