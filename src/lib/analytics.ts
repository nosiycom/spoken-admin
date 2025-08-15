import posthog from 'posthog-js';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
};

export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview', { $current_url: window.location.href });
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, properties);
  }
};