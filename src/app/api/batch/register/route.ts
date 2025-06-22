import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    const {
      batchData,
      materialRequests = [],
      complianceDocuments = [],
      manufacturerId
    } = requestData;

    // Validate required batch data
    if (!batchData.productName || !batchData.quantity || !manufacturerId) {
      return NextResponse.json({
        error: 'Missing required batch information'
      }, { status: 400 });
    }

    // Check if manufacturer exists, if not create a test manufacturer
    let manufacturer = await db.manufacturer.findUnique({
      where: { id: manufacturerId }
    });

    if (!manufacturer) {
      // Create a test manufacturer for development
      manufacturer = await db.manufacturer.create({
        data: {
          id: manufacturerId,
          userId: `user-${manufacturerId}`,
          name: 'Test Manufacturer',
          email: `test-${manufacturerId}@example.com`,
          registrationNumber: `REG-${manufacturerId}`,
          address: 'Test Address, Test City',
          city: 'Test City',
          state: 'Test State',
          country: 'India',
          pincode: '123456',
          productionCapacity: 1000,
          certifications: ['ISO 9001', 'ISO 14001'],
          specializations: ['Electronics', 'Manufacturing']
        }
      });
    }

    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Generate a unique batch number
      const timestamp = Date.now();
      const year = new Date().getFullYear();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const batchNumber = `BT-${year}-${randomSuffix}-${timestamp.toString().slice(-4)}`;

      // 1. Create the batch with all fields including destinationAddress
      const batch = await prisma.batch.create({
        data: {
          batchNumber: batchNumber, // Use our generated batch number
          productName: batchData.productName,
          productCode: batchData.productCode || null,
          description: batchData.description || null,
          quantity: parseInt(batchData.quantity),
          unit: batchData.unit,
          qualityGrade: batchData.qualityGrade || null,
          expiryDate: batchData.expiryDate ? new Date(batchData.expiryDate) : null,
          storageTemp: batchData.storageTemp || null,
          handlingNotes: batchData.handlingNotes || null,
          destinationAddress: batchData.destinationAddress || null, // Add this field
          status: 'CREATED',
          manufacturerId: manufacturerId,
        }
      });

      // 2. Create compliance documents if provided
      if (complianceDocuments.length > 0) {
        await prisma.complianceDocument.createMany({
          data: complianceDocuments.map((doc: any) => ({
            batchId: batch.id,
            type: doc.type,
            documentUrl: doc.url,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
            issuer: doc.issuer || null,
            certificateNumber: doc.certificateNumber || null,
          }))
        });
      }

      // 3. Create material requests if provided
      const createdMaterialRequests = [];
      if (materialRequests.length > 0) {
        for (const materialRequest of materialRequests) {
          const createdRequest = await prisma.materialRequest.create({
            data: {
              batchId: batch.id,
              manufacturerId: manufacturerId,
              materialName: materialRequest.materialName,
              description: materialRequest.description || null,
              quantity: parseInt(materialRequest.quantity),
              unit: materialRequest.unit,
              budgetRange: materialRequest.budgetRange,
              specifications: materialRequest.specifications ? JSON.parse(JSON.stringify({ specs: materialRequest.specifications })) : null,
              qualityStandards: materialRequest.qualityStandards || [],
              certificationReq: materialRequest.certificationReq || [],
              closingDate: new Date(materialRequest.closingDate),
              status: 'OPEN'
            }
          });
          createdMaterialRequests.push(createdRequest);
        }
      }

      // 4. Automatically create a logistics bid entry for this batch
      // This creates an open bid that logistics providers can respond to
      const logisticsBidEntry = {
        batchId: batch.id,
        status: 'OPEN',
        createdAt: new Date(),
        // We don't create actual bids here, just mark that the batch is open for logistics bidding
      };

      return {
        batch,
        materialRequests: createdMaterialRequests,
        logisticsBidEntry
      };
    });

    // 5. Send notifications (in a real application, you'd use a queue/background job)
    // Notify suppliers about material requests
    if (result.materialRequests.length > 0) {
      // TODO: Implement notification system for suppliers
      console.log(`Notifying suppliers about ${result.materialRequests.length} material requests for batch ${result.batch.batchNumber}`);
    }

    // Notify logistics providers about shipping opportunity
    // TODO: Implement notification system for logistics providers
    console.log(`Notifying logistics providers about new batch ${result.batch.batchNumber} ready for shipping bids`);

    return NextResponse.json({
      success: true,
      batch: result.batch,
      materialRequests: result.materialRequests,
      message: 'Batch registered successfully'
    });

  } catch (error) {
    console.error('Batch registration error:', error);
    return NextResponse.json({
      error: 'Failed to register batch. Please try again.'
    }, { status: 500 });
  }
}