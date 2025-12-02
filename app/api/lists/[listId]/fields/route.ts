import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { CustomFieldDefinition } from '@/lib/models';
import { ApiResponse } from '@/types';

const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace';
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

/**
 * GET /api/lists/[listId]/fields
 * Get all custom fields for a list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const fields = await CustomFieldDefinition.find({ listId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const response: ApiResponse = {
      success: true,
      data: fields,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/lists/[listId]/fields:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch custom fields',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/lists/[listId]/fields
 * Create a new custom field
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    await dbConnect();
    const { listId } = await params;

    const body = await request.json();
    const { name, type, required, options, defaultValue, settings } = body;

    if (!name || name.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Field name is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!type) {
      const response: ApiResponse = {
        success: false,
        error: 'Field type is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate options for select/multi-select fields
    if ((type === 'select' || type === 'multi-select') && (!options || options.length === 0)) {
      const response: ApiResponse = {
        success: false,
        error: 'Options are required for select and multi-select fields',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get the highest order number
    const lastField = await CustomFieldDefinition.findOne({ listId })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const newOrder = lastField ? lastField.order + 1 : 0;

    const field = await CustomFieldDefinition.create({
      listId,
      workspaceId: DEFAULT_WORKSPACE_ID,
      name: name.trim(),
      type,
      required: required || false,
      options: options || [],
      defaultValue,
      settings: settings || {},
      order: newOrder,
      createdBy: DEFAULT_USER_ID,
    });

    const response: ApiResponse = {
      success: true,
      data: JSON.parse(JSON.stringify(field)),
      message: 'Custom field created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/lists/[listId]/fields:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create custom field',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
