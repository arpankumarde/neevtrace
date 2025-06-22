import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    // If specific batch requested
    if (batchId) {
      const batch = await db.batch.findUnique({
        where: { id: batchId },
        select: {
          id: true,
          selectedLogisticsBidId: true,
          selectedLogisticsBid: {
            select: {
              emission: true,
            },
          },
        },
      });

      if (!batch) {
        return NextResponse.json(
          {
            error: "Batch not found",
          },
          { status: 404 }
        );
      }

      const logisticsEmission = batch.selectedLogisticsBid?.emission
        ? parseFloat(batch.selectedLogisticsBid.emission)
        : 0;

      return NextResponse.json({
        success: true,
        emissions: {
          [batchId]: {
            production: 0, // No production emissions in current schema
            logistics: logisticsEmission,
            total: logisticsEmission,
            hasLogisticsBid: !!batch.selectedLogisticsBidId,
          },
        },
      });
    }

    // Get all batches with their selected logistics bids
    const batches = await db.batch.findMany({
      select: {
        id: true,
        selectedLogisticsBidId: true,
        selectedLogisticsBid: {
          select: {
            emission: true,
          },
        },
      },
    });

    // Create emissions mapping
    const emissionsData: Record<string, any> = {};

    batches.forEach((batch) => {
      const logisticsEmission = batch.selectedLogisticsBid?.emission
        ? parseFloat(batch.selectedLogisticsBid.emission)
        : 0;

      emissionsData[batch.id] = {
        production: 0, // No production emissions in current schema
        logistics: logisticsEmission,
        total: logisticsEmission,
        hasLogisticsBid: !!batch.selectedLogisticsBidId,
      };
    });

    return NextResponse.json({
      success: true,
      emissions: emissionsData,
    });
  } catch (error) {
    console.error("Error fetching batch emissions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch emissions data",
      },
      { status: 500 }
    );
  }
}
