'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Trash2, Edit, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { Task, CustomFieldDefinition, TaskStatus, Priority, FieldType } from '@/types';

interface TaskTableProps {
  tasks: Task[];
  customFields: CustomFieldDefinition[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskUpdated: (task: Task) => void;
}

export function TaskTable({
  tasks,
  customFields,
  onEditTask,
  onDeleteTask,
  onTaskUpdated,
}: TaskTableProps) {
  const getStatusBadge = (status: TaskStatus) => {
    const styles = {
      'to-do': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'in-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'done': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'blocked': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const handleQuickUpdate = async (taskId: string, field: string, value: any) => {
    try {
      const task = tasks.find((t) => t._id.toString() === taskId);
      if (!task) return;

      const response = await fetch(`/api/lists/${task.listId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();
      if (data.success) {
        onTaskUpdated(data.data);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const renderCustomFieldValue = (task: Task, field: CustomFieldDefinition) => {
    const fieldValue = task.customFields?.find(
      (cf) => cf.fieldId.toString() === field._id.toString()
    );

    if (!fieldValue || fieldValue.value === null || fieldValue.value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    const value = fieldValue.value;

    switch (field.type) {
      case 'checkbox':
        return value ? '✓' : '✗';
      case 'date':
        return value ? format(new Date(value), 'MMM dd, yyyy') : '-';
      case 'select':
        const option = field.options?.find((opt) => opt.value === value);
        return option ? (
          <span
            className="inline-flex rounded px-2 py-1 text-xs font-medium"
            style={{
              backgroundColor: option.color ? `${option.color}20` : undefined,
              color: option.color || undefined,
            }}
          >
            {option.label}
          </span>
        ) : value;
      case 'multi-select':
        const values = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((val: string, idx: number) => {
              const opt = field.options?.find((o) => o.value === val);
              return opt ? (
                <span
                  key={idx}
                  className="inline-flex rounded px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: opt.color ? `${opt.color}20` : undefined,
                    color: opt.color || undefined,
                  }}
                >
                  {opt.label}
                </span>
              ) : null;
            })}
          </div>
        );
      case 'url':
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Link
          </a>
        ) : '-';
      case 'priority':
        return getPriorityBadge(value);
      case 'status':
        return getStatusBadge(value);
      default:
        return value?.toString() || '-';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          No tasks yet. Click "New Task" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Task Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Due Date
            </th>
            {customFields.map((field) => (
              <th
                key={field._id.toString()}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {field.name}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <tr
              key={task._id.toString()}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditTask(task)}
                    className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                  >
                    {task.name}
                  </button>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Select
                  value={task.status}
                  onChange={(e) =>
                    handleQuickUpdate(task._id.toString(), 'status', e.target.value)
                  }
                  className="w-32 h-8 text-xs"
                >
                  <option value="to-do">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Select
                  value={task.priority}
                  onChange={(e) =>
                    handleQuickUpdate(task._id.toString(), 'priority', e.target.value)
                  }
                  className="w-28 h-8 text-xs"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </Select>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
              </td>
              {customFields.map((field) => (
                <td
                  key={field._id.toString()}
                  className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                >
                  {renderCustomFieldValue(task, field)}
                </td>
              ))}
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditTask(task)}
                    title="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={() => onDeleteTask(task._id.toString())}
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
