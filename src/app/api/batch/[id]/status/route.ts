import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/lib/db';
import { BatchStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const batchId = resolvedParams.id;

    console.log('PATCH /api/batch/[id]/status - Request details:', {
      batchId,
      status,
      validStatuses: Object.values(BatchStatus)
    });

    // Validate status
    const validStatuses = Object.values(BatchStatus);
    if (!validStatuses.includes(status)) {
      console.error('Invalid status provided:', status);
      return NextResponse.json(
        { error: 'Invalid batch status', validStatuses },
        { status: 400 }
      );
    }

    // Check if batch exists
    const existingBatch = await db.batch.findUnique({
      where: { id: batchId }
    });

    if (!existingBatch) {
      console.error('Batch not found:', batchId);
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Update batch status in database
    const updatedBatch = await db.batch.update({
      where: { id: batchId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        manufacturer: true,
        materialRequests: true,
        complianceDocuments: true
      }
    });

    return NextResponse.json({
      message: 'Batch status updated successfully',
      batch: updatedBatch
    });

  } catch (error) {
    console.error('Error updating batch status:', error);
    return NextResponse.json(
      { error: 'Failed to update batch status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}