import mongoose, { Schema, model, models } from 'mongoose';
import { IList } from '@/types';

const ListSchema = new Schema<IList>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#3b82f6', // blue-500
    },
    icon: {
      type: String,
      default: '📋',
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (single field index removed to avoid duplication)
ListSchema.index({ workspaceId: 1, order: 1 });
ListSchema.index({ workspaceId: 1, createdAt: -1 });

export const List = models.List || model<IList>('List', ListSchema);
