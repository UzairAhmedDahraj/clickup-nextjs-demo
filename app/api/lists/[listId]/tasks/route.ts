import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { ApiResponse, TaskFilter } from '@/types';

const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace';
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

/**
 * GET /api/lists/[listId]/tasks
 * Get all tasks for a list with optional filtering and sorting
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const { searchParams } = new URL(request.url);
    
    // Build query
    const query: any = { listId };

    // Filtering
    const status = searchParams.get('status');
    if (status) {
      query.status = status.includes(',') ? { $in: status.split(',') } : status;
    }

    const priority = searchParams.get('priority');
    if (priority) {
      query.priority = priority.includes(',') ? { $in: priority.split(',') } : priority;
    }

    const search = searchParams.get('search');
    if (search) {
      query.$text = { $search: search };
    }

    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) query.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) query.dueDate.$lte = new Date(dueDateTo);
    }

    // Sorting
    const sortField = searchParams.get('sortField') || 'order';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;
    const sort: any = { [sortField]: sortOrder };
    
    // Always secondary sort by createdAt for consistency
    if (sortField !== 'createdAt') {
      sort.createdAt = 1;
    }

    const tasks = await Task.find(query)
      .sort(sort)
      .populate('assignees', 'name email avatar')
      .lean();

    const response: ApiResponse = {
      success: true,
      data: tasks,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/lists/[listId]/tasks:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch tasks',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/lists/[listId]/tasks
 * Create a new task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const body = await request.json();
    const {
      name,
      description,
      status,
      priority,
      dueDate,
      customFields,
      assignees,
    } = body;

    if (!name || name.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Task name is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get the highest order number
    const lastTask = await Task.findOne({ listId })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      listId,
      workspaceId: DEFAULT_WORKSPACE_ID,
      name: name.trim(),
      description: description?.trim(),
      status: status || 'to-do',
      priority: priority || 'normal',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      customFields: customFields || [],
      assignees: assignees || [],
      order: newOrder,
      createdBy: DEFAULT_USER_ID,
      updatedBy: DEFAULT_USER_ID,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .lean();

    const response: ApiResponse = {
      success: true,
      data: populatedTask,
      message: 'Task created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/lists/[listId]/tasks:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
