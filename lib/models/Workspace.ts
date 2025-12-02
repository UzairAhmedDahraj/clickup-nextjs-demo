import mongoose, { Schema, model, models } from 'mongoose';
import { IWorkspace, PermissionLevel, TaskStatus, Priority } from '@/types';

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: Object.values(PermissionLevel),
          default: PermissionLevel.MEMBER,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      defaultTaskStatus: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.TODO,
      },
      defaultPriority: {
        type: String,
        enum: Object.values(Priority),
        default: Priority.NORMAL,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.userId': 1 });

export const Workspace = models.Workspace || model<IWorkspace>('Workspace', WorkspaceSchema);
