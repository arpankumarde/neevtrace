import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Fetch all batches from database
    const batches = await db.batch.findMany({
      include: {
        manufacturer: true,
        materialRequests: true,
        complianceDocuments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      message: "Batches fetched successfully",
      batches: batches,
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const batchData = await request.json();

    // Create new batch in database
    const newBatch = await db.batch.create({
      data: {
        batchNumber: batchData.batchNumber,
        productName: batchData.productName,
        productCode: batchData.productCode,
        description: batchData.description,
        quantity: batchData.quantity,
        unit: batchData.unit,
        status: batchData.status || 'CREATED',
        manufacturedAt: new Date(batchData.manufacturedAt),
        expiryDate: batchData.expiryDate ? new Date(batchData.expiryDate) : null,
        qualityGrade: batchData.qualityGrade,
        storageTemp: batchData.storageTemp,
        handlingNotes: batchData.handlingNotes,
        destinationAddress: batchData.destinationAddress,
        carbonFootprint: batchData.carbonFootprint,
        manufacturerId: batchData.manufacturerId,
      },
      include: {
        manufacturer: true,
        materialRequests: true,
        complianceDocuments: true,
      },
    });

    return NextResponse.json({
      message: "Batch created successfully",
      batch: newBatch,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}