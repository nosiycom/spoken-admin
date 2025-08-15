import { NextRequest } from 'next/server';
import { PostHog } from 'posthog-node';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Analytics } from '@/models/Analytics';

const posthogNode = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event, properties, contentId, sessionId, deviceInfo } = body;

    // Track in PostHog
    posthogNode.capture({
      distinctId: userId,
      event,
      properties: {
        ...properties,
        contentId,
        sessionId,
        ...deviceInfo,
      },
    });

    // Store in MongoDB for custom analytics
    await connectToDatabase();
    const analyticsEntry = new Analytics({
      userId,
      eventType: event,
      eventData: properties,
      contentId,
      sessionId,
      deviceInfo,
      timestamp: new Date(),
    });

    await analyticsEntry.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');

    await connectToDatabase();

    const query: any = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (eventType) {
      query.eventType = eventType;
    }

    const analytics = await Analytics.find(query)
      .sort({ timestamp: -1 })
      .limit(1000);

    return Response.json({ analytics });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}