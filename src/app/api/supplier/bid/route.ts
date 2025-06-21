import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const bidData = await request.json();
    
    const {
      materialRequestId,
      supplierId,
      bidPrice,
      deliveryTimeline,
      proposedDate,
      validUntil,
      remarks,
      certifications = [],
      complianceDocUrls = [],
      paymentTerms,
      warrantyPeriod
    } = bidData;

    // Validate required fields
    if (!materialRequestId || !supplierId || !bidPrice || !deliveryTimeline || !proposedDate || !validUntil) {
      return NextResponse.json({
        error: 'Missing required bid information'
      }, { status: 400 });
    }

    // Check if material request exists and is still open
    const materialRequest = await db.materialRequest.findUnique({
      where: { id: materialRequestId },
      include: { batch: true }
    });

    if (!materialRequest) {
      return NextResponse.json({
        error: 'Material request not found'
      }, { status: 404 });
    }

    if (materialRequest.status !== 'OPEN') {
      return NextResponse.json({
        error: 'Material request is no longer accepting bids'
      }, { status: 400 });
    }

    // Check if supplier already submitted a bid for this material request
    const existingBid = await db.supplierBid.findUnique({
      where: {
        materialRequestId_supplierId: {
          materialRequestId,
          supplierId
        }
      }
    });

    if (existingBid) {
      return NextResponse.json({
        error: 'You have already submitted a bid for this material request'
      }, { status: 400 });
    }

    // Create the bid
    const bid = await db.supplierBid.create({
      data: {
        materialRequestId,
        supplierId,
        bidPrice: parseFloat(bidPrice),
        deliveryTimeline: parseInt(deliveryTimeline),
        proposedDate: new Date(proposedDate),
        validUntil: new Date(validUntil),
        remarks: remarks || null,
        certifications,
        complianceDocUrls,
        paymentTerms: paymentTerms || null,
        warrantyPeriod: warrantyPeriod ? parseInt(warrantyPeriod) : null,
        status: 'PENDING'
      },
      include: {
        supplier: {
          select: {
            name: true,
            email: true
          }
        },
        materialRequest: {
          select: {
            materialName: true,
            batch: {
              select: {
                batchNumber: true,
                productName: true
              }
            }
          }
        }
      }
    });

    // TODO: Notify manufacturer about new bid
    console.log(`New bid submitted by ${bid.supplier.name} for material request ${materialRequest.materialName} in batch ${materialRequest.batch.batchNumber}`);

    return NextResponse.json({
      success: true,
      bid,
      message: 'Bid submitted successfully'
    });

  } catch (error) {
    console.error('Supplier bid submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit bid. Please try again.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const materialRequestId = searchParams.get('materialRequestId');

    if (!supplierId && !materialRequestId) {
      return NextResponse.json({
        error: 'Either supplierId or materialRequestId is required'
      }, { status: 400 });
    }

    let bids;

    if (supplierId) {
      // Get all bids by a specific supplier
      bids = await db.supplierBid.findMany({
        where: { supplierId },
        include: {
          materialRequest: {
            include: {
              batch: {
                select: {
                  batchNumber: true,
                  productName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (materialRequestId) {
      // Get all bids for a specific material request
      bids = await db.supplierBid.findMany({
        where: { materialRequestId },
        include: {
          supplier: {
            select: {
              name: true,
              email: true,
              suppliedProducts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({
      success: true,
      bids
    });

  } catch (error) {
    console.error('Error fetching supplier bids:', error);
    return NextResponse.json({
      error: 'Failed to fetch bids'
    }, { status: 500 });
  }
}