import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Content } from '@/models/Content';
import { User } from '@/models/User';
import { Analytics } from '@/models/Analytics';
import { CacheService } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = 'dashboard:stats';
    const cached = await CacheService.getJSON(cacheKey);
    
    if (cached) {
      return Response.json(cached);
    }

    await connectToDatabase();

    // Get content stats
    const totalContent = await Content.countDocuments();
    const publishedContent = await Content.countDocuments({ status: 'published' });

    // Get user stats
    const totalUsers = await User.countDocuments();
    
    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Get recent analytics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEvents = await Analytics.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    const stats = {
      totalContent,
      publishedContent,
      totalUsers,
      activeUsers,
      recentEvents,
    };

    // Cache for 10 minutes
    await CacheService.setJSON(cacheKey, stats, 600);

    return Response.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}