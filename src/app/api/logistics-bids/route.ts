import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // Fetch logistics bids for the specific batch
    const logisticsBids = await prisma.logisticsBid.findMany({
      where: {
        batchId: batchId
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
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      bids: logisticsBids
    });

  } catch (error) {
    console.error('Error fetching logistics bids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logistics bids' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}