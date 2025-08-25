import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { CourseService } from '@/lib/services/courses';
import { UserService } from '@/lib/services/users';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { CacheService } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = 'dashboard:stats';
    const cached = await CacheService.getJSON(cacheKey);
    
    if (cached) {
      return Response.json(cached);
    }

    const courseService = new CourseService();
    const userService = new UserService();
    const supabase = createSupabaseAdminClient();

    // Get content stats (courses)
    const allCourses = await courseService.getAllCourses(true);
    const totalContent = allCourses.length;
    const publishedContent = allCourses.filter(course => course.is_published).length;

    // Get user stats
    const allUsers = await userService.getAllUsers();
    const totalUsers = allUsers.length;
    
    // Get active users (users who were active within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = allUsers.filter(user => {
      const lastActivity = new Date(user.last_activity_at);
      return lastActivity >= thirtyDaysAgo;
    }).length;

    // Get recent lesson completions as events
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentEvents } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', sevenDaysAgo.toISOString())
      .not('completed_at', 'is', null);

    const stats = {
      totalContent,
      publishedContent,
      totalUsers,
      activeUsers,
      recentEvents: recentEvents || 0,
    };

    // Cache for 10 minutes
    await CacheService.setJSON(cacheKey, stats, 600);

    return Response.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}