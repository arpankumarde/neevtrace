'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import FileUploadComponent from '@/components/ui/file-upload'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@civic/auth/react'

// Document types for manufacturer - simplified to two categories
const COMPANY_DOCUMENT_TYPES = [
  { value: 'GST_CERTIFICATE', label: 'GST Certificate' },
  { value: 'PAN_CARD', label: 'PAN Card' },
  { value: 'TRADE_LICENSE', label: 'Trade License' },
  { value: 'INCORPORATION_CERTIFICATE', label: 'Certificate of Incorporation' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof' }
]

const CERTIFICATION_DOCUMENT_TYPES = [
  { value: 'ISO', label: 'ISO Certificate' },
  { value: 'BIS', label: 'BIS Certificate' },
  { value: 'ROHS', label: 'RoHS Certificate' },
  { value: 'CIIPL', label: 'CIIPL' }
]

// Common certification options for manufacturers
const CERTIFICATION_OPTIONS = [
  { value: 'ISO_9001', label: 'ISO 9001 - Quality Management System' },
  { value: 'ISO_14001', label: 'ISO 14001 - Environmental Management' },
  { value: 'ISO_45001', label: 'ISO 45001 - Occupational Health & Safety' },
  { value: 'BIS', label: 'BIS - Bureau of Indian Standards' },
  { value: 'CE_MARKING', label: 'CE Marking' },
  { value: 'ROHS', label: 'RoHS - Restriction of Hazardous Substances' },
  { value: 'FCC', label: 'FCC - Federal Communications Commission' },
  { value: 'UL', label: 'UL - Underwriters Laboratories' },
  { value: 'GMP', label: 'GMP - Good Manufacturing Practice' },
  { value: 'FDA', label: 'FDA Approved' },
  { value: 'HACCP', label: 'HACCP - Hazard Analysis Critical Control Points' },
  { value: 'FSSAI', label: 'FSSAI - Food Safety and Standards Authority' },
  { value: 'OHSAS_18001', label: 'OHSAS 18001 - Occupational Health & Safety' },
  { value: 'SA8000', label: 'SA8000 - Social Accountability' },
  { value: 'WRAP', label: 'WRAP - Worldwide Responsible Accredited Production' },
  { value: 'GREENGUARD', label: 'GREENGUARD - Low Chemical Emissions' },
  { value: 'ENERGY_STAR', label: 'ENERGY STAR' },
  { value: 'LEED', label: 'LEED - Leadership in Energy and Environmental Design' },
  { value: 'FSC', label: 'FSC - Forest Stewardship Council' },
  { value: 'ORGANIC', label: 'Organic Certification' },
  { value: 'FAIR_TRADE', label: 'Fair Trade Certified' },
  { value: 'OTHER', label: 'Other (Custom)' }
]

interface ManufacturerFormData {
  companyName: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  pincode: string
  registrationNumber: string
  website: string
  productionCapacity: string
  certifications: string[]
  specializations: string[]
}

interface DocumentUpload {
  type: 'company' | 'certification'
  docType: string
  url: string
  name: string
}

export default function ManufacturerRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Use Civic Auth hook
  const { user, isLoading, signIn } = useUser()
  
  const [formData, setFormData] = useState<ManufacturerFormData>({
    companyName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    registrationNumber: '',
    website: '',
    productionCapacity: '',
    certifications: [],
    specializations: []
  })

  const [companyDoc, setCompanyDoc] = useState<{ docType: string; url: string; name: string }>({
    docType: '',
    url: '',
    name: ''
  })
  
  const [certDoc, setCertDoc] = useState<{ docType: string; url: string; name: string }>({
    docType: '',
    url: '',
    name: ''
  })

  const [selectedCertification, setSelectedCertification] = useState('')
  const [customCertification, setCustomCertification] = useState('')
  const [newSpecialization, setNewSpecialization] = useState('')

  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      checkExistingUser()
    }
  }, [user])

  // Check if user already exists in database
  const checkExistingUser = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/manufacturer/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.manufacturer) {
          // User already exists, redirect to login with message
          toast.success('You are already registered! Redirecting to login...')
          setTimeout(() => {
            router.push('/auth/manufacturer/login?message=already-registered')
          }, 2000)
          return
        }
      }
      
      // User doesn't exist, proceed to step 2
      setCurrentStep(2)
    } catch (error) {
      console.error('Error checking existing user:', error)
      // If check fails, proceed to step 2 anyway
      setCurrentStep(2)
    }
  }

  // Handle Civic authentication
  const handleCivicAuth = async () => {
    setLoading(true)
    try {
      await signIn()
      toast.success('Authentication successful!')
    } catch (error) {
      console.error('Authentication failed:', error)
      toast.error('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ManufacturerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Add certification
  const addCertification = () => {
    const cert = selectedCertification.trim() === 'OTHER' ? customCertification.trim() : selectedCertification.trim()
    if (cert && !formData.certifications.includes(cert)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert]
      }))
      setSelectedCertification('')
      setCustomCertification('')
    }
  }

  // Remove certification
  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }))
  }

  // Add specialization
  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  // Remove specialization
  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }))
  }

  // Handle company document upload completion
  const handleCompanyDocUpload = (urls: string[]) => {
    setCompanyDoc(prev => ({
      ...prev,
      url: urls[0],
      name: urls[0].split('/').pop() || ''
    }))
  }

  // Handle certification document upload completion
  const handleCertDocUpload = (urls: string[]) => {
    setCertDoc(prev => ({
      ...prev,
      url: urls[0],
      name: urls[0].split('/').pop() || ''
    }))
  }

  // Submit registration
  const handleSubmit = async () => {
    if (!user) return

    // Check if both documents are uploaded
    if (!companyDoc.url || !certDoc.url) {
      toast.error('Both company document and certification document are required!')
      return
    }

    setLoading(true)
    try {
      // Prepare manufacturer data with document URLs
      const manufacturerData = {
        ...formData,
        email: user.email,
        userId: user.id,
        productionCapacity: parseInt(formData.productionCapacity) || null,
        companyDocName: companyDoc.name || null,
        companyDocUrl: companyDoc.url || null,
        companyDocType: companyDoc.docType || null,
        certDocName: certDoc.name || null,
        certDocUrl: certDoc.url || null,
        certDocType: certDoc.docType || null
      }

      const response = await fetch('/api/manufacturer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manufacturerData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      toast.success('Registration successful! Please wait for approval.')
      router.push('/auth/manufacturer/login')
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Validate step 2 form - now includes mandatory document uploads
  const isStep2Valid = () => {
    return formData.companyName && formData.phone && formData.registrationNumber && 
           formData.address && formData.city && formData.state && formData.pincode &&
           companyDoc.url && certDoc.url // Both documents are required
  }

  // Step 1: Simple Authentication
  if (currentStep === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Manufacturer Registration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Sign up with Civic to get started
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button 
                onClick={handleCivicAuth}
                disabled={loading || isLoading}
                size="lg"
                className="w-full"
              >
                {loading || isLoading ? 'Authenticating...' : 'Sign up with Civic'}
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => router.push('/auth/manufacturer/login')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Complete Registration with Mandatory Documents
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
            <p className="text-gray-600">
              Authenticated as: <span className="font-medium">{user?.email}</span>
            </p>
            
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Important:</strong> You must upload both a company document and a certification document to complete your registration. These documents are required for verification and approval.
              </AlertDescription>
            </Alert>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productionCapacity">Production Capacity (units/month)</Label>
                <Input
                  id="productionCapacity"
                  type="number"
                  value={formData.productionCapacity}
                  onChange={(e) => handleInputChange('productionCapacity', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Document Uploads - Now Mandatory */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Documents *</h3>
                <p className="text-gray-600 mb-4">
                  Both documents are mandatory for registration. Please ensure you have valid company documents and certifications ready to upload.
                </p>
              </div>

              {/* Company Document Upload - MANDATORY */}
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-blue-700">Company Document *</h4>
                    {companyDoc.url && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✓ Uploaded
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload one of your company's official documents for verification
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Document Type *</Label>
                      <Select
                        value={companyDoc.docType}
                        onValueChange={(value) => setCompanyDoc(prev => ({ ...prev, docType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {companyDoc.docType && user && (
                    <div>
                      <Label>Upload File *</Label>
                      <FileUploadComponent
                        documentType="company"
                        userId={user.id}
                        onUploadComplete={handleCompanyDocUpload}
                        maxFiles={1}
                        acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
                        maxFileSize="10MB"
                      />
                    </div>
                  )}

                  {companyDoc.url && (
                    <div>
                      <Label>Uploaded File:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-50">
                          📎 {companyDoc.name}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Certification Document Upload - MANDATORY */}
              <Card className="p-4 border-l-4 border-l-red-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-red-700">Certification Document *</h4>
                    {certDoc.url && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✓ Uploaded
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload a valid certification document that validates your company's compliance and quality standards
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Document Type *</Label>
                      <Select
                        value={certDoc.docType}
                        onValueChange={(value) => setCertDoc(prev => ({ ...prev, docType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select certification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CERTIFICATION_DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {certDoc.docType && user && (
                    <div>
                      <Label>Upload File *</Label>
                      <FileUploadComponent
                        documentType="certification"
                        userId={user.id}
                        onUploadComplete={handleCertDocUpload}
                        maxFiles={1}
                        acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
                        maxFileSize="10MB"
                      />
                    </div>
                  )}

                  {certDoc.url && (
                    <div>
                      <Label>Uploaded File:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-50">
                          📎 {certDoc.name}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Separator />

            {/* Specializations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specializations (Optional)</h3>
              <p className="text-sm text-gray-600">
                Add the types of goods or product categories your company specializes in manufacturing (e.g., Electronics, FMCG, Textiles, Automotive Parts, Pharmaceuticals, etc.)
              </p>
              <div className="flex space-x-2">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="e.g., Electronics, FMCG, Textiles"
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                />
                <Button type="button" onClick={addSpecialization}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialization(spec)}>
                    {spec} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/manufacturer/login')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !isStep2Valid()}
                size="lg"
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </Button>
            </div>

            {/* Form validation message */}
            {!isStep2Valid() && (
              <Alert className="mt-4">
                <AlertDescription>
                  Please fill in all required fields (Company Name, Phone, Registration Number, Address, City, State, Pincode) and upload both company document and certification document to proceed.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}