import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Attachment } from '@/lib/models';
import { uploadToCloudinary, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/cloudinary';
import { ApiResponse } from '@/types';

const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace';
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

/**
 * GET /api/tasks/[taskId]/attachments
 * Get all attachments for a task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    await dbConnect();

    const attachments = await Attachment.find({ taskId: params.taskId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email avatar')
      .lean();

    const response: ApiResponse = {
      success: true,
      data: attachments,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/tasks/[taskId]/attachments:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch attachments',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/tasks/[taskId]/attachments
 * Upload a new attachment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response: ApiResponse = {
        success: false,
        error: 'No file provided',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const response: ApiResponse = {
        success: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const response: ApiResponse = {
        success: false,
        error: 'File type not allowed',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      buffer,
      file.name,
      `clickup-demo/tasks/${params.taskId}`
    );

    // Save attachment record to database
    const attachment = await Attachment.create({
      taskId: params.taskId,
      workspaceId: DEFAULT_WORKSPACE_ID,
      name: file.name,
      originalName: file.name,
      url,
      cloudinaryId: publicId,
      type: file.type,
      size: file.size,
      uploadedBy: DEFAULT_USER_ID,
    });

    const populatedAttachment = await Attachment.findById(attachment._id)
      .populate('uploadedBy', 'name email avatar')
      .lean();

    const response: ApiResponse = {
      success: true,
      data: populatedAttachment,
      message: 'File uploaded successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/tasks/[taskId]/attachments:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to upload file',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
