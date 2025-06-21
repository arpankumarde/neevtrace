import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { bidId, manufacturerId, action } = await request.json();

    if (!bidId || !manufacturerId || !action) {
      return NextResponse.json({
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return NextResponse.json({
        error: 'Invalid action. Must be ACCEPT or REJECT'
      }, { status: 400 });
    }

    // Start transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Get the logistics bid with related data
      const bid = await prisma.logisticsBid.findUnique({
        where: { id: bidId },
        include: {
          batch: {
            include: {
              manufacturer: true
            }
          },
          logistics: true
        }
      });

      if (!bid) {
        throw new Error('Logistics bid not found');
      }

      // Verify manufacturer owns this batch
      if (bid.batch.manufacturerId !== manufacturerId) {
        throw new Error('Unauthorized: You can only approve bids for your own batches');
      }

      if (bid.status !== 'PENDING') {
        throw new Error('Bid has already been processed');
      }

      // Update the logistics bid status
      const updatedBid = await prisma.logisticsBid.update({
        where: { id: bidId },
        data: {
          status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
          updatedAt: new Date()
        }
      });

      if (action === 'ACCEPT') {
        // Update batch to link selected logistics bid and change status
        await prisma.batch.update({
          where: { id: bid.batchId },
          data: {
            selectedLogisticsBidId: bidId,
            status: 'IN_TRANSIT', // Batch is now ready for shipping
            updatedAt: new Date()
          }
        });

        // Reject all other logistics bids for this batch
        await prisma.logisticsBid.updateMany({
          where: {
            batchId: bid.batchId,
            id: { not: bidId },
            status: 'PENDING'
          },
          data: {
            status: 'REJECTED',
            updatedAt: new Date()
          }
        });

        // Create initial shipment record
        const shipment = await prisma.shipment.create({
          data: {
            shipmentNumber: `SH-${Date.now()}-${bid.batch.batchNumber}`,
            batchId: bid.batchId,
            logisticsId: bid.logisticsId,
            fromAddress: bid.batch.manufacturer.address || 'Manufacturer Location',
            toAddress: bid.batch.destinationAddress || 'Destination Address',
            estimatedDelivery: bid.deliveryDate,
            status: 'PENDING',
            weight: null, // To be filled by logistics provider
            volume: null, // To be filled by logistics provider
            temperature: bid.specialHandling || null,
            specialNotes: bid.remarks || null,
            transportModes: bid.vehicleType ? [bid.vehicleType.toLowerCase()] : []
          }
        });

        console.log(`Shipment ${shipment.shipmentNumber} created for batch ${bid.batch.batchNumber}`);
      }

      return {
        updatedBid,
        batch: bid.batch,
        logistics: bid.logistics
      };
    });

    // Send notifications
    if (action === 'ACCEPT') {
      console.log(`Logistics bid accepted: ${result.logistics.name} will handle shipping for batch ${result.batch.batchNumber}`);
      console.log(`Batch ${result.batch.batchNumber} is now ready for pickup and shipping`);
    } else {
      console.log(`Logistics bid rejected: ${result.logistics.name}'s bid for batch ${result.batch.batchNumber} was declined`);
    }

    return NextResponse.json({
      success: true,
      message: `Logistics bid ${action.toLowerCase()}ed successfully`,
      bid: result.updatedBid,
      readyForShipping: action === 'ACCEPT'
    });

  } catch (error) {
    console.error('Logistics bid approval error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process logistics bid approval'
    }, { status: 500 });
  }
}

// Get all logistics bids for manufacturer's batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get('manufacturerId');
    const batchId = searchParams.get('batchId');

    if (!manufacturerId) {
      return NextResponse.json({
        error: 'manufacturerId is required'
      }, { status: 400 });
    }

    let whereClause: any = {
      batch: {
        manufacturerId: manufacturerId
      }
    };

    if (batchId) {
      whereClause.batchId = batchId;
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
            transportTypes: true,
            warehouseCapacity: true
          }
        },
        batch: {
          select: {
            batchNumber: true,
            productName: true,
            quantity: true,
            unit: true,
            destinationAddress: true,
            status: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Group bids by batch
    const groupedBids = bids.reduce((acc: any, bid) => {
      const batchId = bid.batchId;
      if (!acc[batchId]) {
        acc[batchId] = {
          batch: bid.batch,
          bids: []
        };
      }
      acc[batchId].bids.push(bid);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      groupedBids: Object.values(groupedBids),
      totalBids: bids.length
    });

  } catch (error) {
    console.error('Error fetching logistics bids:', error);
    return NextResponse.json({
      error: 'Failed to fetch logistics bids'
    }, { status: 500 });
  }
}