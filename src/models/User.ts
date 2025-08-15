import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin',
  },
  permissions: [{
    type: String,
  }],
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);