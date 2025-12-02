import mongoose, { Schema, model, models } from 'mongoose';
import { ICustomFieldDefinition, FieldType } from '@/types';

const SelectOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    color: { type: String },
  },
  { _id: false }
);

const CustomFieldDefinitionSchema = new Schema<ICustomFieldDefinition>(
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
      required: [true, 'Field name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(FieldType),
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [SelectOptionSchema],
    defaultValue: {
      type: Schema.Types.Mixed,
    },
    settings: {
      min: Number,
      max: Number,
      format: String,
      placeholder: String,
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

// Indexes (single field indexes removed to avoid duplication)
CustomFieldDefinitionSchema.index({ listId: 1, order: 1 });
CustomFieldDefinitionSchema.index({ workspaceId: 1 });

export const CustomFieldDefinition =
  models.CustomFieldDefinition ||
  model<ICustomFieldDefinition>('CustomFieldDefinition', CustomFieldDefinitionSchema);
