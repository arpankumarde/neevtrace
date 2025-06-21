'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@civic/auth/react'

export default function ManufacturerLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAlreadyRegisteredMessage, setShowAlreadyRegisteredMessage] = useState(false)

  // Use Civic Auth hook
  const { user, isLoading, signIn } = useUser()

  // Check for redirect message
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'already-registered') {
      setShowAlreadyRegisteredMessage(true)
    }
  }, [searchParams])

  // Handle authenticated user
  useEffect(() => {
    const handleAuthenticatedUser = async () => {
      if (!user) return

      try {
        // Check if manufacturer exists in database
        const response = await fetch('/api/manufacturer/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email, userId: user.id }) // Use 'id' instead of 'userId'
        })

        const data = await response.json()

        if (response.ok && data.manufacturer) {
          if (true) {
            // Update last login time
            await fetch('/api/manufacturer/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: user.email })
            })

            toast.success('Login successful!')
            router.push('/manufacturer')
          } else {
            setError('Your account is inactive. Please contact support.')
          }
        } else {
          setError('Manufacturer account not found. Please register first.')
        }
      } catch (error) {
        console.error('Login check failed:', error)
        setError('Login failed. Please try again.')
      }
    }

    if (user) {
      handleAuthenticatedUser()
    }
  }, [user, router])

  // Handle Civic authentication
  const handleCivicAuth = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await signIn()
    } catch (error) {
      console.error('Authentication failed:', error)
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Manufacturer Login
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sign in with Civic to access your dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {showAlreadyRegisteredMessage && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                You're already registered! Please sign in below to access your manufacturer dashboard.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center">
            <Button 
              onClick={handleCivicAuth}
              disabled={loading || isLoading}
              size="lg"
              className="w-full"
            >
              {loading || isLoading ? 'Signing in...' : 'Sign in with Civic'}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => router.push('/auth/manufacturer/register')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact support at{' '}
              <a href="mailto:support@neevtrace.com" className="text-blue-600 hover:text-blue-800">
                support@neevtrace.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}