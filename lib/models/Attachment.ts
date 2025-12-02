import mongoose, { Schema, model, models } from 'mongoose';
import { IAttachment } from '@/types';

const AttachmentSchema = new Schema<IAttachment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (removed single field indexes where covered by compound indexes or unique constraint)
AttachmentSchema.index({ taskId: 1, createdAt: -1 });
AttachmentSchema.index({ workspaceId: 1 });

export const Attachment = models.Attachment || model<IAttachment>('Attachment', AttachmentSchema);
