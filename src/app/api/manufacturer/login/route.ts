import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find and update manufacturer's last login time
    const manufacturer = await db.manufacturer.findUnique({
      where: {
        email: email
      }
    })


    return NextResponse.json({ 
      success: true, 
      manufacturer,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      error: 'Login failed' 
    }, { status: 500 })
  }
}