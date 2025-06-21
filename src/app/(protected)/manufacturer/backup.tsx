'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@civic/auth/react'

interface Manufacturer {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function ManufacturerDashboard() {
  const router = useRouter()
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null)
  const [loading, setLoading] = useState(true)

  // Use Civic Auth hook
  const { user, isLoading, signOut } = useUser()

  useEffect(() => {
    const verifyManufacturer = async () => {
      if (!user) {
        router.push('/auth/manufacturer/login')
        return
      }

      try {
        // Verify manufacturer exists in database
        const response = await fetch('/api/manufacturer/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email, userId: user.id })
        })

        const data = await response.json()
        
        if (response.ok && data.manufacturer) {
          setManufacturer(data.manufacturer)
        } else {
          toast.error('Account not found')
          router.push('/auth/manufacturer/register')
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        router.push('/auth/manufacturer/login')
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading) {
      verifyManufacturer()
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/auth/manufacturer/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!manufacturer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Unable to load manufacturer data. Please try logging in again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">NeevTrace</h1>
              <Badge variant="secondary" className="ml-3">Manufacturer</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {manufacturer?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Registered:</span>
                <span className="text-sm">
                  {manufacturer?.createdAt 
                    ? new Date(manufacturer.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Company:</span>
                  <p className="font-medium">{manufacturer?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="text-sm">{manufacturer?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
              >
                Create New Batch
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
              >
                View Batches
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
              >
                Material Requests
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No recent activity. Start by creating your first batch.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}