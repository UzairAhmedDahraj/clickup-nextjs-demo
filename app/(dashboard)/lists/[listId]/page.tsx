'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Plus, Settings, Loader2, ChevronDown, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TaskTable } from '@/components/task-table';
import { TaskModal } from '@/components/task-modal';
import { CustomFieldsModal } from '@/components/custom-fields-modal';
import { toast } from 'sonner';
import type { List, Task, CustomFieldDefinition, TaskStatus, Priority } from '@/types';

export default function ListPage() {
  const params = useParams();
  const listId = params.listId as string;

  const [list, setList] = React.useState<List | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [customFields, setCustomFields] = React.useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [showFieldsModal, setShowFieldsModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchListData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch list details
      const listRes = await fetch(`/api/lists/${listId}`);
      const listData = await listRes.json();
      if (listData.success) {
        setList(listData.data);
      }

      // Fetch custom fields
      const fieldsRes = await fetch(`/api/lists/${listId}/fields`);
      const fieldsData = await fieldsRes.json();
      if (fieldsData.success) {
        setCustomFields(fieldsData.data);
      }

      // Fetch tasks with filters
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const tasksRes = await fetch(`/api/lists/${listId}/tasks?${params.toString()}`);
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setTasks(tasksData.data);
      }
    } catch (error) {
      console.error('Error fetching list data:', error);
      toast.error('Failed to load list data');
    } finally {
      setLoading(false);
    }
  }, [listId, statusFilter, priorityFilter, searchQuery]);

  React.useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  const handleTaskCreated = (task: Task) => {
    setTasks([...tasks, task]);
    setShowTaskModal(false);
    toast.success('Task created successfully');
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    setShowTaskModal(false);
    setEditingTask(null);
    toast.success('Task updated successfully');
  };

  const handleTaskDeleted = async (taskId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setTasks(tasks.filter((t) => t._id.toString() !== taskId));
        toast.success('Task deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleFieldsUpdated = () => {
    fetchListData();
    setShowFieldsModal(false);
    toast.success('Custom fields updated');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">List not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{list.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {list.name}
            </h1>
            {list.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {list.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFieldsModal(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Custom Fields
          </Button>
          <Button onClick={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Statuses</option>
          <option value="to-do">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </Select>
        {(statusFilter || priorityFilter || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Task Table */}
      <div className="flex-1 overflow-hidden">
        <TaskTable
          tasks={tasks}
          customFields={customFields}
          onEditTask={handleEditTask}
          onDeleteTask={handleTaskDeleted}
          onTaskUpdated={handleTaskUpdated}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          listId={listId}
          task={editingTask}
          customFields={customFields}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* Custom Fields Modal */}
      {showFieldsModal && (
        <CustomFieldsModal
          isOpen={showFieldsModal}
          onClose={() => setShowFieldsModal(false)}
          listId={listId}
          fields={customFields}
          onFieldsUpdated={handleFieldsUpdated}
        />
      )}
    </div>
  );
}
