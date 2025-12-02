import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { ApiResponse } from '@/types';

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

/**
 * GET /api/lists/[listId]/tasks/[taskId]
 * Get a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; taskId: string }> }
) {
  try {
    await dbConnect();
    const { listId, taskId } = await params;

    const task = await Task.findOne({
      _id: taskId,
      listId,
    })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar')
      .lean();

    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: task,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/lists/[listId]/tasks/[taskId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/lists/[listId]/tasks/[taskId]
 * Update a task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; taskId: string }> }
) {
  try {
    await dbConnect();
    const { listId, taskId } = await params;

    const body = await request.json();
    const {
      name,
      description,
      status,
      priority,
      dueDate,
      customFields,
      assignees,
      order,
      completedAt,
    } = body;

    const updateData: any = {
      updatedBy: DEFAULT_USER_ID,
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (status !== undefined) {
      updateData.status = status;
      // Auto-set completedAt when status changes to 'done'
      if (status === 'done' && !completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'done') {
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (customFields !== undefined) updateData.customFields = customFields;
    if (assignees !== undefined) updateData.assignees = assignees;
    if (order !== undefined) updateData.order = order;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, listId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignees', 'name email avatar')
      .lean();

    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in PUT /api/lists/[listId]/tasks/[taskId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to update task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/lists/[listId]/tasks/[taskId]
 * Delete a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; taskId: string }> }
) {
  try {
    await dbConnect();
    const { listId, taskId } = await params;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      listId,
    });

    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Note: Attachments are not automatically deleted
    // You may want to add a cleanup job or cascade delete

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in DELETE /api/lists/[listId]/tasks/[taskId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to delete task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
