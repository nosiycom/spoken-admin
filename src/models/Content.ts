import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  type: 'lesson' | 'quiz' | 'vocabulary' | 'grammar' | 'pronunciation';
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  content: any; // Flexible content structure
  metadata: {
    duration?: number; // in minutes
    difficulty: number; // 1-10
    tags: string[];
    prerequisites?: string[];
  };
  status: 'draft' | 'published' | 'archived';
  createdBy: string; // User ID
  updatedBy?: string; // User ID
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

const ContentSchema = new Schema<IContent>({
  type: {
    type: String,
    enum: ['lesson', 'quiz', 'vocabulary', 'grammar', 'pronunciation'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  content: {
    type: Schema.Types.Mixed,
    required: true,
  },
  metadata: {
    duration: { type: Number },
    difficulty: { type: Number, min: 1, max: 10, required: true },
    tags: [{ type: String }],
    prerequisites: [{ type: String }],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  publishedAt: {
    type: Date,
  },
});

ContentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Content = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);