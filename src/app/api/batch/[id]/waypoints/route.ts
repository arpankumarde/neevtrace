import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // Fetch waypoints for the batch
    const waypoints = await db.waypoint.findMany({
      where: {
        batchId: batchId
      },
      orderBy: {
        sequence: 'asc'
      },
      include: {
        logistics: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform the data to match the frontend interface
    const transformedWaypoints = waypoints.map(waypoint => ({
      id: waypoint.id,
      sequence: waypoint.sequence,
      address: waypoint.address,
      modeOfTransport: waypoint.modeOfTransport,
      estimatedArrival: waypoint.estimatedArrival,
      actualArrival: waypoint.actualArrival,
      status: waypoint.status,
      logisticsName: waypoint.logistics.name
    }));

    return NextResponse.json({
      success: true,
      waypoints: transformedWaypoints
    });

  } catch (error) {
    console.error('Error fetching waypoints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waypoints' },
      { status: 500 }
    );
  }
}