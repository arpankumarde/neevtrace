import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const batchData = await request.json();
    const batchId = (await params)?.id;

    // Update batch in database
    const updatedBatch = await db.batch.update({
      where: { id: batchId },
      data: {
        productName: batchData.productName,
        productCode: batchData.productCode,
        description: batchData.description,
        quantity: batchData.quantity,
        unit: batchData.unit,
        qualityGrade: batchData.qualityGrade,
        storageTemp: batchData.storageTemp,
        handlingNotes: batchData.handlingNotes,
        destinationAddress: batchData.destinationAddress,
        expiryDate: batchData.expiryDate
          ? new Date(batchData.expiryDate)
          : null,
        updatedAt: new Date(),
      },
      include: {
        manufacturer: true,
        materialRequests: true,
        complianceDocuments: true,
      },
    });

    return NextResponse.json({
      message: "Batch updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const batchId = (await params)?.id;

    // Delete batch from database
    await db.batch.delete({
      where: { id: batchId },
    });

    return NextResponse.json({
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 }
    );
  }
}
