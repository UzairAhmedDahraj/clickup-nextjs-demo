import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Attachment } from '@/lib/models';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { ApiResponse } from '@/types';

/**
 * GET /api/tasks/[taskId]/attachments/[attachmentId]
 * Get a specific attachment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; attachmentId: string }> }
) {
  try {
    await dbConnect();
    const { taskId, attachmentId } = await params;

    const attachment = await Attachment.findOne({
      _id: attachmentId,
      taskId,
    })
      .populate('uploadedBy', 'name email avatar')
      .lean();

    if (!attachment) {
      const response: ApiResponse = {
        success: false,
        error: 'Attachment not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: attachment,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/tasks/[taskId]/attachments/[attachmentId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch attachment',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[taskId]/attachments/[attachmentId]
 * Delete an attachment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; attachmentId: string }> }
) {
  try {
    await dbConnect();
    const { taskId, attachmentId } = await params;

    const attachment = await Attachment.findOne({
      _id: attachmentId,
      taskId,
    });

    if (!attachment) {
      const response: ApiResponse = {
        success: false,
        error: 'Attachment not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete from Cloudinary
    const deleted = await deleteFromCloudinary(attachment.cloudinaryId);
    
    if (!deleted) {
      console.warn(`Failed to delete file from Cloudinary: ${attachment.cloudinaryId}`);
    }

    // Delete from database
    await attachment.deleteOne();

    const response: ApiResponse = {
      success: true,
      message: 'Attachment deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in DELETE /api/tasks/[taskId]/attachments/[attachmentId]:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to delete attachment',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
