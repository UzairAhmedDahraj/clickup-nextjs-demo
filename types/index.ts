import { Document, Types } from 'mongoose';

// ============= ENUMS =============

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  CHECKBOX = 'checkbox',
  URL = 'url',
  PRIORITY = 'priority',
  STATUS = 'status',
}

export enum Priority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum TaskStatus {
  TODO = 'to-do',
  IN_PROGRESS = 'in-progress',
  IN_REVIEW = 'in-review',
  DONE = 'done',
  BLOCKED = 'blocked',
}

export enum PermissionLevel {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// ============= USER TYPES =============

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= WORKSPACE TYPES =============

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    role: PermissionLevel;
    joinedAt: Date;
  }[];
  settings: {
    defaultTaskStatus: TaskStatus;
    defaultPriority: Priority;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============= PERMISSION TYPES =============

export interface IPermission {
  resource: 'workspace' | 'list' | 'task' | 'field';
  action: PermissionAction;
  level: PermissionLevel;
}

// ============= LIST TYPES =============

export interface IList extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============= CUSTOM FIELD TYPES =============

export interface SelectOption {
  label: string;
  value: string;
  color?: string;
}

export interface ICustomFieldDefinition extends Document {
  _id: Types.ObjectId;
  listId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  type: FieldType;
  order: number;
  required: boolean;
  options?: SelectOption[]; // For SELECT and MULTI_SELECT
  defaultValue?: any;
  settings?: {
    min?: number; // For NUMBER
    max?: number; // For NUMBER
    format?: string; // For DATE
    placeholder?: string;
  };
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============= TASK TYPES =============

export interface CustomFieldValue {
  fieldId: Types.ObjectId;
  value: any;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  listId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  
  // Built-in fields
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  
  // Custom field values
  customFields: CustomFieldValue[];
  
  // Metadata
  order: number;
  assignees: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============= ATTACHMENT TYPES =============

export interface IAttachment extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  originalName: string;
  url: string;
  cloudinaryId: string;
  type: string; // MIME type
  size: number; // in bytes
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

// ============= CLIENT-SIDE TYPES (without Document) =============

export type User = Omit<IUser, keyof Document> & { _id: string };
export type Workspace = Omit<IWorkspace, keyof Document> & { _id: string };
export type List = Omit<IList, keyof Document> & { _id: string };
export type CustomFieldDefinition = Omit<ICustomFieldDefinition, keyof Document> & { _id: string };
export type Task = Omit<ITask, keyof Document> & { _id: string };
export type Attachment = Omit<IAttachment, keyof Document> & { _id: string };

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============= FORM TYPES =============

export interface CreateListInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateListInput extends Partial<CreateListInput> {
  order?: number;
}

export interface CreateCustomFieldInput {
  name: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  defaultValue?: any;
  settings?: ICustomFieldDefinition['settings'];
}

export interface UpdateCustomFieldInput extends Partial<CreateCustomFieldInput> {
  order?: number;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | string;
  customFields?: CustomFieldValue[];
  assignees?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  order?: number;
  completedAt?: Date;
}

export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  priority?: Priority | Priority[];
  assignees?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
}

export interface TaskSort {
  field: 'name' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'order';
  order: 'asc' | 'desc';
}
