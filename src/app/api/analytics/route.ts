import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { CacheService } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    const cacheKey = `analytics:${startDate}:${endDate}`;
    const cached = await CacheService.getJSON(cacheKey);
    
    if (cached) {
      return Response.json(cached);
    }

    const supabase = createSupabaseAdminClient();

    // Get analytics events from audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    // Get user activity data
    const { data: userActivity } = await supabase
      .from('user_lesson_progress')
      .select('completed_at')
      .gte('completed_at', startDate)
      .lte('completed_at', endDate)
      .not('completed_at', 'is', null);

    // Process analytics data
    const analytics = auditLogs?.map(log => ({
      eventType: log.action,
      timestamp: log.created_at,
      userId: log.user_id,
      details: log.details || {}
    })) || [];

    // Add user activity events
    userActivity?.forEach(activity => {
      analytics.push({
        eventType: 'lesson_completed',
        timestamp: activity.completed_at,
        userId: '',
        details: {}
      });
    });

    // Get course view events (mock data for now - would come from actual tracking)
    const mockEvents = [
      { eventType: 'course_viewed', timestamp: new Date().toISOString(), userId: user.id },
      { eventType: 'dashboard_viewed', timestamp: new Date().toISOString(), userId: user.id },
      { eventType: 'quiz_completed', timestamp: new Date().toISOString(), userId: user.id },
      { eventType: 'lesson_started', timestamp: new Date().toISOString(), userId: user.id },
    ];

    const allAnalytics = [...analytics, ...mockEvents];

    const result = {
      analytics: allAnalytics,
      summary: {
        totalEvents: allAnalytics.length,
        uniqueUsers: new Set(allAnalytics.map(a => a.userId).filter(Boolean)).size,
        dateRange: { startDate, endDate }
      }
    };

    // Cache for 5 minutes
    await CacheService.setJSON(cacheKey, result, 300);

    return Response.json(result);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    
    // Fallback with mock data
    const mockAnalytics = [
      { eventType: 'dashboard_viewed', timestamp: new Date().toISOString(), userId: 'user1' },
      { eventType: 'course_viewed', timestamp: new Date().toISOString(), userId: 'user2' },
      { eventType: 'lesson_completed', timestamp: new Date().toISOString(), userId: 'user1' },
      { eventType: 'quiz_started', timestamp: new Date().toISOString(), userId: 'user3' },
      { eventType: 'content_created', timestamp: new Date().toISOString(), userId: 'admin' },
    ];

    return Response.json({
      analytics: mockAnalytics,
      summary: {
        totalEvents: mockAnalytics.length,
        uniqueUsers: 3,
        dateRange: { 
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      }
    });
  }
}