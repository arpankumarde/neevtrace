import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId } = body

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId are required' }, { status: 400 })
    }

    // Find manufacturer by email or userId
    const manufacturer = await db.manufacturer.findFirst({
      where: {
        OR: [
          { email: email },
          { userId: userId }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true, // Company name
        createdAt: true
      }
    })

    if (manufacturer) {
      return NextResponse.json({ 
        success: true, 
        manufacturer 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Manufacturer not found' 
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Check manufacturer error:', error)
    return NextResponse.json({ 
      error: 'Failed to check manufacturer' 
    }, { status: 500 })
  }
}