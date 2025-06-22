import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const bidData = await request.json();
    
    const {
      batchId,
      logisticsId,
      bidPrice,
      estimatedTime,
      pickupDate,
      deliveryDate,
      vehicleType,
      capacity,
      route,
      specialHandling,
      insurance = false,
      remarks,
      validUntil
    } = bidData;

    // Validate required fields
    if (!batchId || !logisticsId || !bidPrice || !estimatedTime || !pickupDate || !deliveryDate || !validUntil) {
      return NextResponse.json({
        error: 'Missing required bid information'
      }, { status: 400 });
    }

    // Check if batch exists and is ready for logistics bidding
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      include: {
        manufacturer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!batch) {
      return NextResponse.json({
        error: 'Batch not found'
      }, { status: 404 });
    }

    // Check if batch is ready for logistics (completed or has no material requests)
    const materialRequests = await db.materialRequest.findMany({
      where: { batchId }
    });

    const hasOpenMaterialRequests = materialRequests.some(req => req.status === 'OPEN');
    
    if (hasOpenMaterialRequests) {
      return NextResponse.json({
        error: 'Batch is not ready for logistics bidding. Material requests are still pending.'
      }, { status: 400 });
    }

    // Check if logistics provider already submitted a bid for this batch
    const existingBid = await db.logisticsBid.findUnique({
      where: {
        batchId_logisticsId: {
          batchId,
          logisticsId
        }
      }
    });

    if (existingBid) {
      return NextResponse.json({
        error: 'You have already submitted a bid for this batch'
      }, { status: 400 });
    }

    // Create the logistics bid
    const bid = await db.logisticsBid.create({
      data: {
        batchId,
        logisticsId,
        bidPrice: parseFloat(bidPrice),
        estimatedTime: parseInt(estimatedTime),
        pickupDate: new Date(pickupDate),
        deliveryDate: new Date(deliveryDate),
        vehicleType: vehicleType || null,
        capacity: capacity || null,
        route: route || null,
        specialHandling: specialHandling || null,
        insurance,
        remarks: remarks || null,
        validUntil: new Date(validUntil),
        status: 'PENDING'
      },
      include: {
        logistics: {
          select: {
            name: true,
            email: true,
            fleetSize: true,
            serviceAreas: true,
            transportTypes: true
          }
        },
        batch: {
          select: {
            batchNumber: true,
            productName: true,
            quantity: true,
            unit: true,
            destinationAddress: true
          }
        }
      }
    });

    // TODO: Notify manufacturer about new logistics bid
    console.log(`New logistics bid submitted by ${bid.logistics.name} for batch ${batch.batchNumber}`);

    return NextResponse.json({
      success: true,
      bid,
      message: 'Logistics bid submitted successfully'
    });

  } catch (error) {
    console.error('Logistics bid submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit logistics bid. Please try again.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logisticsId = searchParams.get('logisticsId');
    const batchId = searchParams.get('batchId');
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const status = searchParams.get('status'); // Add status filter

    let whereClause: any = {};

    if (logisticsId) {
      whereClause.logisticsId = logisticsId;
    }

    if (batchId) {
      whereClause.batchId = batchId;
    }

    // Add status filter for accepted bids
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (availableOnly) {
      // Get batches that are ready for logistics bidding
      const readyBatches = await db.batch.findMany({
        where: {
          OR: [
            { status: 'COMPLETED' }, // All materials sourced
            { 
              materialRequests: {
                none: {} // No material requests at all
              }
            }
          ],
          selectedLogisticsBidId: null // No logistics provider selected yet
        },
        include: {
          manufacturer: {
            select: {
              name: true,
              city: true,
              state: true
            }
          },
          materialRequests: {
            where: { status: 'OPEN' }
          },
          logisticsBids: {
            select: {
              id: true,
              logisticsId: true,
              bidPrice: true,
              status: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        availableBatches: readyBatches
      });
    }

    const bids = await db.logisticsBid.findMany({
      where: whereClause,
      include: {
        logistics: {
          select: {
            name: true,
            email: true,
            fleetSize: true,
            serviceAreas: true,
            transportTypes: true
          }
        },
        batch: {
          select: {
            batchNumber: true,
            productName: true,
            quantity: true,
            unit: true,
            destinationAddress: true,
            manufacturer: {
              select: {
                name: true,
                city: true,
                state: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      bids
    });

  } catch (error) {
    console.error('Error fetching logistics bids:', error);
    return NextResponse.json({
      error: 'Failed to fetch logistics bids'
    }, { status: 500 });
  }
}