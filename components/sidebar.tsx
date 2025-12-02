'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, Settings, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { List } from '@/types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [lists, setLists] = React.useState<List[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedList, setSelectedList] = React.useState<List | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📋',
  });

  const fetchLists = React.useCallback(async () => {
    try {
      const response = await fetch('/api/lists');
      const data = await response.json();
      if (data.success) {
        setLists(data.data);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setLists([...lists, data.data]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', color: '#3b82f6', icon: '📋' });
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;
    try {
      const response = await fetch(`/api/lists/${selectedList._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setLists(lists.filter((l) => l._id !== selectedList._id));
        setShowDeleteModal(false);
        setSelectedList(null);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex h-screen w-16 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center p-4">
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2 p-2">
          {lists.map((list) => (
            <Link
              key={list._id.toString()}
              href={`/lists/${list._id}`}
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              title={list.name}
            >
              <span className="text-xl">{list.icon}</span>
            </Link>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCreateModal(true)}
            title="Create new list"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            My Workspace
          </h1>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Lists
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="px-2 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No lists yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-1">
              {lists.map((list) => (
                <div
                  key={list._id.toString()}
                  className="group relative flex items-center"
                >
                  <Link
                    href={`/lists/${list._id}`}
                    className={`flex flex-1 items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      pathname === `/lists/${list._id}`
                        ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{list.icon}</span>
                    <span className="flex-1 truncate">{list.name}</span>
                  </Link>
                  <button
                    className="absolute right-2 hidden rounded p-1 hover:bg-gray-200 group-hover:block dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedList(list);
                      setShowDeleteModal(true);
                    }}
                    title="Delete list"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', description: '', color: '#3b82f6', icon: '📋' });
        }}
        title="Create New List"
      >
        <form onSubmit={handleCreateList} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icon
            </label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="📋"
              maxLength={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Project"
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
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create List
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ name: '', description: '', color: '#3b82f6', icon: '📋' });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedList(null);
        }}
        title="Delete List"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{selectedList?.name}</strong>? This will also
            delete all tasks and custom fields in this list. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteList} className="flex-1">
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedList(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
