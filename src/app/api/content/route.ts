import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { CourseService } from '@/lib/services/courses';
import { CacheService } from '@/lib/redis';
import type { CourseInsert } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const cacheKey = `content:${level || 'all'}:${status || 'all'}:${page}:${limit}`;
    const cached = await CacheService.getJSON(cacheKey);
    
    if (cached) {
      return Response.json(cached);
    }

    const courseService = new CourseService();
    let courses;

    if (level && level !== 'all') {
      courses = await courseService.getCoursesByLevel(level as 'beginner' | 'intermediate' | 'advanced');
    } else {
      courses = await courseService.getAllCourses(true); // Include unpublished for admin
    }

    // Apply status filtering
    if (status && status !== 'all') {
      if (status === 'published') {
        courses = courses.filter(course => course.is_published);
      } else if (status === 'draft') {
        courses = courses.filter(course => !course.is_published);
      }
    }

    // Apply pagination
    const total = courses.length;
    const startIndex = (page - 1) * limit;
    const paginatedCourses = courses.slice(startIndex, startIndex + limit);

    const result = {
      content: paginatedCourses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes
    await CacheService.setJSON(cacheKey, result, 300);

    return Response.json(result);
  } catch (error) {
    console.error('Content fetch error:', error);
    return Response.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, level, category, estimated_duration_hours, status } = body;

    if (!title || !level || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const courseService = new CourseService();

    const courseData: CourseInsert = {
      title,
      description,
      level,
      category,
      estimated_duration_hours: estimated_duration_hours || 1,
      is_published: status === 'published',
      created_by: user.id,
    };

    const newCourse = await courseService.createCourse(courseData);

    // Invalidate content cache
    await CacheService.invalidatePattern('content:*');

    return Response.json({ content: newCourse, message: 'Content created successfully' });
  } catch (error) {
    console.error('Content creation error:', error);
    return Response.json({ error: 'Failed to create content' }, { status: 500 });
  }
}