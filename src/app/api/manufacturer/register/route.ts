import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const manufacturerData = await request.json()

    // Validate required fields
    if (!manufacturerData.companyName) {
      return NextResponse.json({ 
        error: 'Company name is required' 
      }, { status: 400 })
    }

    // Validate required documents
    if (!manufacturerData.companyDocUrl || !manufacturerData.certDocUrl) {
      return NextResponse.json({ 
        error: 'Both company document and certification document are required' 
      }, { status: 400 })
    }

    // Check if manufacturer already exists
    const existingManufacturer = await db.manufacturer.findFirst({
      where: {
        OR: [
          { email: manufacturerData.email },
          { registrationNumber: manufacturerData.registrationNumber }
        ]
      }
    })

    if (existingManufacturer) {
      return NextResponse.json({ 
        error: 'Manufacturer with this email or registration number already exists' 
      }, { status: 400 })
    }

    // Create manufacturer record
    const manufacturer = await db.manufacturer.create({
      data: {
        userId: manufacturerData.userId,
        email: manufacturerData.email,
        phone: manufacturerData.phone,
        name: manufacturerData.companyName,
        address: manufacturerData.address,
        city: manufacturerData.city,
        state: manufacturerData.state,
        country: manufacturerData.country,
        pincode: manufacturerData.pincode,
        registrationNumber: manufacturerData.registrationNumber,
        website: manufacturerData.website || null,
        productionCapacity: manufacturerData.productionCapacity,
        certifications: manufacturerData.certifications || [],
        specializations: manufacturerData.specializations || [],
        companyDocName: manufacturerData.companyDocName,
        companyDocUrl: manufacturerData.companyDocUrl,
        certDocName: manufacturerData.certDocName,
        certDocUrl: manufacturerData.certDocUrl,
      }
    })

   

    return NextResponse.json({
      success: true,
      manufacturer
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      error: 'Registration failed. Please try again.' 
    }, { status: 500 })
  }
}