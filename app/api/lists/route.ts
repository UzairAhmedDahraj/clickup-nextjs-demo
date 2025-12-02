import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { List } from '@/lib/models';
import { ApiResponse } from '@/types';

const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace';
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

/**
 * GET /api/lists
 * Get all lists in workspace
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const lists = await List.find({ workspaceId: DEFAULT_WORKSPACE_ID })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const response: ApiResponse = {
      success: true,
      data: lists,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/lists:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch lists',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/lists
 * Create a new list
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name || name.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'List name is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get the highest order number
    const lastList = await List.findOne({ workspaceId: DEFAULT_WORKSPACE_ID })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const newOrder = lastList ? lastList.order + 1 : 0;

    const list = await List.create({
      workspaceId: DEFAULT_WORKSPACE_ID,
      name: name.trim(),
      description: description?.trim(),
      color: color || '#3b82f6',
      icon: icon || '📋',
      order: newOrder,
      createdBy: DEFAULT_USER_ID,
    });

    const response: ApiResponse = {
      success: true,
      data: JSON.parse(JSON.stringify(list)),
      message: 'List created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/lists:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create list',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
