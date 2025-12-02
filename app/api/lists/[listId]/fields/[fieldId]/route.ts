import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { CustomFieldDefinition } from '@/lib/models';
import { ApiResponse } from '@/types';

/**
 * GET /api/lists/[listId]/fields/[fieldId]
 * Get a specific custom field
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; fieldId: string }> }
) {
  try {
    await dbConnect();
    const { listId, fieldId } = await params;

    const field = await CustomFieldDefinition.findOne({
      _id: fieldId,
      listId,
    }).lean();

    if (!field) {
      const response: ApiResponse = {
        success: false,
        error: 'Custom field not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: field,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/lists/[listId]/fields/[fieldId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch custom field',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/lists/[listId]/fields/[fieldId]
 * Update a custom field
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; fieldId: string }> }
) {
  try {
    await dbConnect();
    const { listId, fieldId } = await params;

    const body = await request.json();
    const { name, type, required, options, defaultValue, settings, order } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (required !== undefined) updateData.required = required;
    if (options !== undefined) updateData.options = options;
    if (defaultValue !== undefined) updateData.defaultValue = defaultValue;
    if (settings !== undefined) updateData.settings = settings;
    if (order !== undefined) updateData.order = order;

    // Validate options for select/multi-select fields
    if (type && (type === 'select' || type === 'multi-select')) {
      if (!options || options.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Options are required for select and multi-select fields',
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const field = await CustomFieldDefinition.findOneAndUpdate(
      { _id: fieldId, listId },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!field) {
      const response: ApiResponse = {
        success: false,
        error: 'Custom field not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: field,
      message: 'Custom field updated successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in PUT /api/lists/[listId]/fields/[fieldId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to update custom field',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/lists/[listId]/fields/[fieldId]
 * Delete a custom field
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; fieldId: string }> }
) {
  try {
    await dbConnect();
    const { listId, fieldId } = await params;

    const field = await CustomFieldDefinition.findOneAndDelete({
      _id: fieldId,
      listId,
    });

    if (!field) {
      const response: ApiResponse = {
        success: false,
        error: 'Custom field not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Note: Task custom field values are not automatically deleted
    // They will remain in the task documents but won't be displayed
    // This allows for data recovery if the field is recreated

    const response: ApiResponse = {
      success: true,
      message: 'Custom field deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in DELETE /api/lists/[listId]/fields/[fieldId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to delete custom field',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
