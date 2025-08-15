import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  userId: string;
  eventType: string;
  eventData: any;
  contentId?: string;
  sessionId?: string;
  deviceInfo: {
    platform: string;
    version: string;
    locale: string;
  };
  timestamp: Date;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  eventData: {
    type: Schema.Types.Mixed,
  },
  contentId: {
    type: String,
    index: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  deviceInfo: {
    platform: { type: String, required: true },
    version: { type: String, required: true },
    locale: { type: String, required: true },
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create compound indexes for common queries
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ contentId: 1, timestamp: -1 });

export const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);