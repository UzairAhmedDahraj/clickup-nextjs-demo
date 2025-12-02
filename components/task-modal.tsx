'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { AttachmentUpload } from '@/components/attachment-upload';
import { toast } from 'sonner';
import type { Task, CustomFieldDefinition, CustomFieldValue, FieldType } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  task: Task | null;
  customFields: CustomFieldDefinition[];
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
}

export function TaskModal({
  isOpen,
  onClose,
  listId,
  task,
  customFields,
  onTaskCreated,
  onTaskUpdated,
}: TaskModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    status: 'to-do',
    priority: 'normal',
    dueDate: '',
    customFields: [] as CustomFieldValue[],
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        customFields: task.customFields || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'to-do',
        priority: 'normal',
        dueDate: '',
        customFields: [],
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = task
        ? `/api/lists/${listId}/tasks/${task._id}`
        : `/api/lists/${listId}/tasks`;
      
      const method = task ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (task) {
          onTaskUpdated(data.data);
        } else {
          onTaskCreated(data.data);
        }
      } else {
        toast.error(data.error || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomField = (fieldId: string, value: any) => {
    const existingIndex = formData.customFields.findIndex(
      (cf) => cf.fieldId.toString() === fieldId
    );

    if (existingIndex >= 0) {
      const updated = [...formData.customFields];
      updated[existingIndex] = { fieldId: fieldId as any, value };
      setFormData({ ...formData, customFields: updated });
    } else {
      setFormData({
        ...formData,
        customFields: [
          ...formData.customFields,
          { fieldId: fieldId as any, value },
        ],
      });
    }
  };

  const getCustomFieldValue = (fieldId: string) => {
    const field = formData.customFields.find(
      (cf) => cf.fieldId.toString() === fieldId
    );
    return field?.value;
  };

  const renderCustomFieldInput = (field: CustomFieldDefinition) => {
    const value = getCustomFieldValue(field._id.toString());

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            placeholder={field.settings?.placeholder || field.name}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            min={field.settings?.min}
            max={field.settings?.max}
            required={field.required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateCustomField(field._id.toString(), e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.settings?.placeholder || 'Check if applicable'}
            </span>
          </label>
        );

      case 'url':
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            placeholder="https://example.com"
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            required={field.required}
            title={`Select ${field.name}`}
          >
            <option value="">Select {field.name}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateCustomField(field._id.toString(), [...selectedValues, opt.value]);
                    } else {
                      updateCustomField(
                        field._id.toString(),
                        selectedValues.filter((v: string) => v !== opt.value)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'priority':
        return (
          <Select
            value={value || 'normal'}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            required={field.required}
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </Select>
        );

      case 'status':
        return (
          <Select
            value={value || 'to-do'}
            onChange={(e) => updateCustomField(field._id.toString(), e.target.value)}
            required={field.required}
          >
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter task name"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add task description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Date
          </label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Custom Fields
            </h3>
            {customFields.map((field) => (
              <div key={field._id.toString()}>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.name} {field.required && '*'}
                </label>
                {renderCustomFieldInput(field)}
              </div>
            ))}
          </div>
        )}

        {/* Attachments */}
        {task && (
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <AttachmentUpload taskId={task._id.toString()} />
          </div>
        )}

        <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
