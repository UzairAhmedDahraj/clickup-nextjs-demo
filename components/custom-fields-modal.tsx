'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import type { CustomFieldDefinition, FieldType, SelectOption } from '@/types';

interface CustomFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  fields: CustomFieldDefinition[];
  onFieldsUpdated: () => void;
}

export function CustomFieldsModal({
  isOpen,
  onClose,
  listId,
  fields,
  onFieldsUpdated,
}: CustomFieldsModalProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    name: string;
    type: FieldType;
    required: boolean;
    options: SelectOption[];
  }>({
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [newOption, setNewOption] = React.useState({ label: '', value: '', color: '#3b82f6' });

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/lists/${listId}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Custom field added');
        setFormData({ name: '', type: 'text', required: false, options: [] });
        setShowAddForm(false);
        onFieldsUpdated();
      } else {
        toast.error(data.error || 'Failed to add field');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('Failed to add field');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}/fields/${fieldId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Custom field deleted');
        onFieldsUpdated();
      } else {
        toast.error(data.error || 'Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  const addOption = () => {
    if (!newOption.label || !newOption.value) {
      toast.error('Please fill in option label and value');
      return;
    }

    setFormData({
      ...formData,
      options: [...formData.options, { ...newOption }],
    });
    setNewOption({ label: '', value: '', color: '#3b82f6' });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const needsOptions = formData.type === 'select' || formData.type === 'multi-select';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Custom Fields" size="lg">
      <div className="space-y-4">
        {/* Existing Fields */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Current Fields
          </h3>
          {fields.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No custom fields yet. Add one below.
            </p>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field._id.toString()}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {field.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Type: {field.type} {field.required && '• Required'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteField(field._id.toString())}
                    title="Delete field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Field */}
        {!showAddForm ? (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Field
          </Button>
        ) : (
          <form onSubmit={handleAddField} className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              New Custom Field
            </h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Department"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Type *
              </label>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as FieldType, options: [] })
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="checkbox">Checkbox</option>
                <option value="url">URL</option>
                <option value="select">Select (Dropdown)</option>
                <option value="multi-select">Multi-Select</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </Select>
            </div>

            {needsOptions && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options *
                </label>
                <div className="space-y-2">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {opt.label}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeOption(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Label"
                      value={newOption.label}
                      onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={newOption.value}
                      onChange={(e) =>
                        setNewOption({
                          ...newOption,
                          value: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        })
                      }
                      className="flex-1"
                    />
                    <Input
                      type="color"
                      value={newOption.color}
                      onChange={(e) => setNewOption({ ...newOption, color: e.target.value })}
                      className="h-10 w-16"
                    />
                    <Button type="button" size="sm" onClick={addOption}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="required"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Required field
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Add Field
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', type: 'text', required: false, options: [] });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
