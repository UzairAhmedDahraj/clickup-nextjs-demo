import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { List, Task, CustomFieldDefinition } from '@/lib/models';
import { ApiResponse } from '@/types';

/**
 * GET /api/lists/[listId]
 * Get a specific list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const list = await List.findById(listId).lean();

    if (!list) {
      const response: ApiResponse = {
        success: false,
        error: 'List not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: list,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/lists/[listId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch list',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/lists/[listId]
 * Update a list
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const body = await request.json();
    const { name, description, color, icon, order } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;

    const list = await List.findByIdAndUpdate(listId, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!list) {
      const response: ApiResponse = {
        success: false,
        error: 'List not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: list,
      message: 'List updated successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in PUT /api/lists/[listId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to update list',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/lists/[listId]
 * Delete a list and all associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const list = await List.findById(listId);

    if (!list) {
      const response: ApiResponse = {
        success: false,
        error: 'List not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete all associated tasks
    await Task.deleteMany({ listId });

    // Delete all associated custom field definitions
    await CustomFieldDefinition.deleteMany({ listId });

    // Delete the list
    await list.deleteOne();

    const response: ApiResponse = {
      success: true,
      message: 'List and all associated data deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in DELETE /api/lists/[listId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to delete list',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
