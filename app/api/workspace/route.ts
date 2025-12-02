import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Workspace, User } from '@/lib/models';
import { ApiResponse } from '@/types';
import { PermissionLevel } from '@/types';

/**
 * GET /api/workspace
 * Get or create default workspace
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const defaultWorkspaceId = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace';
    const defaultUserId = process.env.DEFAULT_USER_ID || 'default-user';

    // Check if default user exists
    let user = await User.findOne({ email: 'default@clickup-demo.com' });
    if (!user) {
      user = await User.create({
        _id: defaultUserId,
        email: 'default@clickup-demo.com',
        name: 'Default User',
      });
    }

    // Check if default workspace exists
    let workspace = await Workspace.findOne({ _id: defaultWorkspaceId });
    if (!workspace) {
      workspace = await Workspace.create({
        _id: defaultWorkspaceId,
        name: 'My Workspace',
        description: 'Default workspace for task management',
        ownerId: user._id,
        members: [
          {
            userId: user._id,
            role: PermissionLevel.OWNER,
            joinedAt: new Date(),
          },
        ],
        settings: {
          defaultTaskStatus: 'to-do',
          defaultPriority: 'normal',
        },
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        workspace: JSON.parse(JSON.stringify(workspace)),
        user: JSON.parse(JSON.stringify(user)),
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/workspace:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to get workspace',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/workspace
 * Update workspace settings
 */
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, settings } = body;

    const defaultWorkspaceId = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace';

    const workspace = await Workspace.findByIdAndUpdate(
      defaultWorkspaceId,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(settings && { settings }),
      },
      { new: true, runValidators: true }
    );

    if (!workspace) {
      const response: ApiResponse = {
        success: false,
        error: 'Workspace not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: JSON.parse(JSON.stringify(workspace)),
      message: 'Workspace updated successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in PUT /api/workspace:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to update workspace',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
