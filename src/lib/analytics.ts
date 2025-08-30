// Analytics tracking utility
// This module provides client-side analytics tracking functionality

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isClient = typeof window !== 'undefined';

  // Track an event
  trackEvent(name: string, properties: Record<string, any> = {}, userId?: string) {
    const event: AnalyticsEvent = {
      name,
      properties,
      userId,
      timestamp: new Date()
    };

    // Store event locally
    this.events.push(event);

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // In a real application, you would send this to your analytics service
    // e.g., Google Analytics, Mixpanel, PostHog, etc.
    if (this.isClient) {
      this.sendToAnalyticsService(event);
    }
  }

  // Track page view
  trackPageView(path: string, title?: string, userId?: string) {
    this.trackEvent('page_view', {
      path,
      title: title || document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }, userId);
  }

  // Track user action
  trackUserAction(action: string, element: string, properties: Record<string, any> = {}, userId?: string) {
    this.trackEvent('user_action', {
      action,
      element,
      ...properties
    }, userId);
  }

  // Track error
  trackError(error: Error | string, context: Record<string, any> = {}, userId?: string) {
    const errorInfo = typeof error === 'string' ? { message: error } : {
      message: error.message,
      stack: error.stack,
      name: error.name
    };

    this.trackEvent('error', {
      ...errorInfo,
      ...context
    }, userId);
  }

  // Get recent events (for debugging)
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clearEvents(): void {
    this.events = [];
  }

  // Send to analytics service (placeholder)
  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // This is where you would integrate with your analytics service
      // For now, we'll just store in sessionStorage for development
      if (this.isClient && window.sessionStorage) {
        const existingEvents = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
        existingEvents.push(event);
        sessionStorage.setItem('analytics_events', JSON.stringify(existingEvents));
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }
}

// Create a singleton instance
const analytics = new Analytics();

// Export commonly used functions
export const trackEvent = analytics.trackEvent.bind(analytics);
export const trackPageView = analytics.trackPageView.bind(analytics);
export const trackUserAction = analytics.trackUserAction.bind(analytics);
export const trackError = analytics.trackError.bind(analytics);

// Export the full analytics instance
export default analytics;

// React hook for analytics
export function useAnalytics() {
  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    getEvents: analytics.getEvents.bind(analytics),
    clearEvents: analytics.clearEvents.bind(analytics)
  };
}