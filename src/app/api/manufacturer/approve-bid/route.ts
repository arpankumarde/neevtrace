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
      // Get the bid with related data
      const bid = await prisma.supplierBid.findUnique({
        where: { id: bidId },
        include: {
          materialRequest: {
            include: {
              batch: {
                include: {
                  manufacturer: true
                }
              }
            }
          },
          supplier: true
        }
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      // Verify manufacturer owns this bid's batch
      if (bid.materialRequest.batch.manufacturerId !== manufacturerId) {
        throw new Error('Unauthorized: You can only approve bids for your own batches');
      }

      if (bid.status !== 'PENDING') {
        throw new Error('Bid has already been processed');
      }

      // Update the bid status
      const updatedBid = await prisma.supplierBid.update({
        where: { id: bidId },
        data: {
          status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
          updatedAt: new Date()
        }
      });

      if (action === 'ACCEPT') {
        // Update material request to closed and link selected bid
        await prisma.materialRequest.update({
          where: { id: bid.materialRequestId },
          data: {
            status: 'CLOSED',
            selectedBidId: bidId,
            updatedAt: new Date()
          }
        });

        // Reject all other bids for this material request
        await prisma.supplierBid.updateMany({
          where: {
            materialRequestId: bid.materialRequestId,
            id: { not: bidId },
            status: 'PENDING'
          },
          data: {
            status: 'REJECTED',
            updatedAt: new Date()
          }
        });

        // Check if all material requests for this batch are now closed
        const pendingRequests = await prisma.materialRequest.findMany({
          where: {
            batchId: bid.materialRequest.batchId,
            status: 'OPEN'
          }
        });

        // If no more pending material requests, automatically create logistics bid
        if (pendingRequests.length === 0) {
          // Update batch status to ready for logistics
          await prisma.batch.update({
            where: { id: bid.materialRequest.batchId },
            data: {
              status: 'COMPLETED', // All materials sourced, ready for shipping
              updatedAt: new Date()
            }
          });

          // The logistics bidding is now open - logistics providers can bid
          // In a real system, you'd notify logistics providers here
          console.log(`Batch ${bid.materialRequest.batch.batchNumber} is now ready for logistics bidding`);
        }
      }

      return {
        updatedBid,
        batch: bid.materialRequest.batch,
        materialRequest: bid.materialRequest,
        supplier: bid.supplier
      };
    });

    // Send notifications
    if (action === 'ACCEPT') {
      console.log(`Bid accepted: ${result.supplier.name} will supply ${result.materialRequest.materialName} for batch ${result.batch.batchNumber}`);
      
      // Check if logistics bidding should start
      const allMaterialRequests = await db.materialRequest.findMany({
        where: { batchId: result.batch.id }
      });
      
      const allClosed = allMaterialRequests.every(req => req.status === 'CLOSED');
      
      if (allClosed) {
        console.log(`All materials secured for batch ${result.batch.batchNumber}. Logistics providers can now submit bids.`);
      }
    } else {
      console.log(`Bid rejected: ${result.supplier.name}'s bid for ${result.materialRequest.materialName} was declined`);
    }

    return NextResponse.json({
      success: true,
      message: `Bid ${action.toLowerCase()}ed successfully`,
      bid: result.updatedBid,
      logisticsBiddingReady: action === 'ACCEPT' // Indicates if logistics bidding can start
    });

  } catch (error) {
    console.error('Bid approval error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process bid approval'
    }, { status: 500 });
  }
}

// Get all bids for manufacturer's batches
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
      materialRequest: {
        manufacturerId: manufacturerId
      }
    };

    if (batchId) {
      whereClause.materialRequest.batchId = batchId;
    }

    const bids = await db.supplierBid.findMany({
      where: whereClause,
      include: {
        supplier: {
          select: {
            name: true,
            email: true,
            suppliedProducts: true,
            minOrderValue: true,
            paymentTerms: true,
            leadTime: true
          }
        },
        materialRequest: {
          include: {
            batch: {
              select: {
                batchNumber: true,
                productName: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group bids by material request
    const groupedBids = bids.reduce((acc: any, bid) => {
      const requestId = bid.materialRequestId;
      if (!acc[requestId]) {
        acc[requestId] = {
          materialRequest: bid.materialRequest,
          bids: []
        };
      }
      acc[requestId].bids.push(bid);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      groupedBids: Object.values(groupedBids),
      totalBids: bids.length
    });

  } catch (error) {
    console.error('Error fetching manufacturer bids:', error);
    return NextResponse.json({
      error: 'Failed to fetch bids'
    }, { status: 500 });
  }
}