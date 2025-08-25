import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/services/courses';
import { withApiMiddleware } from '@/lib/apiMiddleware';
import { courseValidationSchema, searchValidationSchema, sanitizeHtml } from '@/lib/security';
import type { CourseInsert } from '@/types/database';

const getCourses = withApiMiddleware(
  async ({ userId, req }) => {
    const { searchParams } = new URL(req.url);
    
    // Validate search parameters with proper defaults
    const validatedParams = searchValidationSchema.parse({
      type: searchParams.get('type') || 'all',
      level: searchParams.get('level') || 'all',
      status: searchParams.get('status') || 'all',
      category: searchParams.get('category') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || '',
    });

    const courseService = new CourseService();
    let courses;

    if (validatedParams.search) {
      courses = await courseService.searchCourses(validatedParams.search);
    } else if (validatedParams.level && validatedParams.level !== 'all') {
      courses = await courseService.getCoursesByLevel(validatedParams.level as 'beginner' | 'intermediate' | 'advanced');
    } else if (validatedParams.category && validatedParams.category !== 'all') {
      courses = await courseService.getCoursesByCategory(validatedParams.category);
    } else {
      courses = await courseService.getAllCourses(true); // Include unpublished for admin
    }

    // Apply client-side filtering for status since Supabase queries are simpler
    if (validatedParams.status && validatedParams.status !== 'all') {
      courses = courses.filter(course => {
        if (validatedParams.status === 'published') return course.is_published;
        if (validatedParams.status === 'draft') return !course.is_published;
        return true;
      });
    }

    // Apply pagination
    const total = courses.length;
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    const paginatedCourses = courses.slice(startIndex, startIndex + validatedParams.limit);

    const result = {
      courses: paginatedCourses,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        pages: Math.ceil(total / validatedParams.limit),
      },
      stats: {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.is_published).length,
        draftCourses: courses.filter(c => !c.is_published).length,
        archivedCourses: 0, // TODO: Add archived status to schema if needed
      },
    };

    return NextResponse.json(result);
  },
  {
    requireAuth: true,
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 100 }
  }
);

const createCourse = withApiMiddleware(
  async ({ userId, req }) => {
    const body = await req.json();
    const courseService = new CourseService();

    // Sanitize HTML content
    if (body.description) {
      body.description = sanitizeHtml(body.description);
    }

    const courseData: CourseInsert = {
      title: body.title,
      description: body.description,
      level: body.level,
      category: body.category || 'general',
      image_url: body.image_url,
      is_published: body.is_published || false,
      sort_order: body.sort_order || 0,
      estimated_duration_hours: body.estimated_duration_hours,
      created_by: userId,
    };

    const newCourse = await courseService.createCourse(courseData);

    // Log audit trail
    console.log('AUDIT: Course created', {
      userId,
      courseId: newCourse.id,
      title: newCourse.title,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ 
      course: newCourse, 
      message: 'Course created successfully' 
    }, { status: 201 });
  },
  {
    requireAuth: true,
    validateSchema: courseValidationSchema,
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 20 }
  }
);

export async function GET(req: NextRequest) {
  return getCourses(req);
}

export async function POST(req: NextRequest) {
  return createCourse(req);
}