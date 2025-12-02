import mongoose, { Schema, model, models } from 'mongoose';
import { ITask, TaskStatus, Priority } from '@/types';

const CustomFieldValueSchema = new Schema(
  {
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomFieldDefinition',
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    listId: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.NORMAL,
    },
    dueDate: {
      type: Date,
    },
    customFields: [CustomFieldValueSchema],
    order: {
      type: Number,
      default: 0,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (single field indexes removed to avoid duplication with compound indexes)
TaskSchema.index({ listId: 1, order: 1 });
TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, priority: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1 });
TaskSchema.index({ assignees: 1 });
TaskSchema.index({ createdAt: -1 });

// Text search index
TaskSchema.index({ name: 'text', description: 'text' });

export const Task = models.Task || model<ITask>('Task', TaskSchema);
