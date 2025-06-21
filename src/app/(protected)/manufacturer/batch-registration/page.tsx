"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { AIEnhanceButton } from '@/components/ui/ai-enhance-button';
import { 
  Package, 
  Plus, 
  Minus,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  Truck,
  Users,
  ShoppingCart,
  Calendar,
  MapPin,
  DollarSign,
  Factory,
  Leaf,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import FileUploadComponent from '@/components/ui/file-upload';
import { useAppStore } from '@/lib/store';

interface BatchFormData {
  batchNumber: string;
  productName: string;
  productCode: string;
  description: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  expiryDate: string;
  storageTemp: string;
  handlingNotes: string;
  destinationAddress: string;
}

interface MaterialRequest {
  id: string;
  materialName: string;
  description: string;
  quantity: number;
  unit: string;
  budgetRange: string;
  specifications: string;
  qualityStandards: string[];
  certificationReq: string[];
  closingDate: string;
}

interface ComplianceDocument {
  type: string;
  url: string;
  name: string;
  expiryDate?: string;
  issuer?: string;
  certificateNumber?: string;
}

const BATCH_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'tonnes', label: 'Tonnes' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'units', label: 'Units' },
  { value: 'meters', label: 'Meters (m)' },
  { value: 'cm', label: 'Centimeters (cm)' },
];

const QUALITY_GRADES = [
  { value: 'A+', label: 'Grade A+ (Premium)' },
  { value: 'A', label: 'Grade A (High Quality)' },
  { value: 'B+', label: 'Grade B+ (Good)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Basic)' },
];

const DOCUMENT_TYPES = [
  { value: 'ISO', label: 'ISO Certificate' },
  { value: 'BIS', label: 'BIS Certificate' },
  { value: 'ROHS', label: 'RoHS Certificate' },
  { value: 'CIIPL', label: 'CIIPL Certificate' },
];

const QUALITY_STANDARDS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'BIS', 'CE Marking', 'RoHS', 'FCC',
  'UL', 'GMP', 'FDA', 'HACCP', 'FSSAI', 'OHSAS 18001', 'SA8000'
];

const CERTIFICATION_REQUIREMENTS = [
  'Quality Management Certificate', 'Environmental Management Certificate',
  'Safety Compliance Certificate', 'Organic Certification', 'Fair Trade Certificate',
  'Sustainability Certificate', 'Carbon Neutral Certificate'
];

export default function BatchRegistrationPage() {
  const router = useRouter();
  const { addBatch } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [batchData, setBatchData] = useState<BatchFormData>({
    batchNumber: '',
    productName: '',
    productCode: '',
    description: '',
    quantity: 0,
    unit: '',
    qualityGrade: '',
    expiryDate: '',
    storageTemp: '',
    handlingNotes: '',
    destinationAddress: '',
  });

  const [enableMaterialRequests, setEnableMaterialRequests] = useState(false);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>([]);

  // Generate batch number on component mount
  useEffect(() => {
    // Let the database generate the unique batch number with UUID
    // We'll set a temporary display number for the form
    const timestamp = Date.now();
    const displayNumber = `BT-${new Date().getFullYear()}-TMP-${timestamp.toString().slice(-4)}`;
    setBatchData(prev => ({ ...prev, batchNumber: displayNumber }));
  }, []);

  const handleInputChange = (field: keyof BatchFormData, value: string | number) => {
    setBatchData(prev => ({ ...prev, [field]: value }));
  };

  const addMaterialRequest = () => {
    const newRequest: MaterialRequest = {
      id: Date.now().toString(),
      materialName: '',
      description: '',
      quantity: 0,
      unit: '',
      budgetRange: '',
      specifications: '',
      qualityStandards: [],
      certificationReq: [],
      closingDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 7 days from now
    };
    setMaterialRequests(prev => [...prev, newRequest]);
  };

  const removeMaterialRequest = (id: string) => {
    setMaterialRequests(prev => prev.filter(req => req.id !== id));
  };

  const updateMaterialRequest = (id: string, field: keyof MaterialRequest, value: any) => {
    setMaterialRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, [field]: value } : req
      )
    );
  };

  const handleDocumentUpload = (documentType: string, urls: string[]) => {
    const newDoc: ComplianceDocument = {
      type: documentType,
      url: urls[0],
      name: urls[0].split('/').pop() || '',
    };
    setComplianceDocuments(prev => [...prev, newDoc]);
  };

  const removeDocument = (index: number) => {
    setComplianceDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          batchData.batchNumber &&
          batchData.productName &&
          batchData.quantity > 0 &&
          batchData.unit &&
          batchData.qualityGrade
        );
      case 2:
        if (!enableMaterialRequests) return true;
        return materialRequests.every(req => 
          req.materialName && req.quantity > 0 && req.unit && req.budgetRange
        );
      case 3:
        return complianceDocuments.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push('/manufacturer/batches');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare the request payload
      const requestPayload = {
        batchData: {
          batchNumber: batchData.batchNumber,
          productName: batchData.productName,
          productCode: batchData.productCode || null,
          description: batchData.description || null,
          quantity: batchData.quantity,
          unit: batchData.unit,
          qualityGrade: batchData.qualityGrade,
          expiryDate: batchData.expiryDate || null,
          storageTemp: batchData.storageTemp || null,
          handlingNotes: batchData.handlingNotes || null,
          destinationAddress: batchData.destinationAddress || null
        },
        materialRequests: enableMaterialRequests ? materialRequests.map(req => ({
          materialName: req.materialName,
          description: req.description || null,
          quantity: req.quantity,
          unit: req.unit,
          budgetRange: req.budgetRange,
          specifications: req.specifications || null,
          qualityStandards: req.qualityStandards || [],
          certificationReq: req.certificationReq || [],
          closingDate: req.closingDate
        })) : [],
        complianceDocuments: complianceDocuments.map(doc => ({
          type: doc.type,
          url: doc.url,
          name: doc.name,
          expiryDate: doc.expiryDate || null,
          issuer: doc.issuer || null,
          certificateNumber: doc.certificateNumber || null
        })),
        manufacturerId: "manufacturer-123" // This should be the actual manufacturer ID from auth
      };

      // Call the batch registration API
      const response = await fetch('/api/batch/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register batch');
      }

      const result = await response.json();

      // Create local batch object for immediate UI update
      const newBatch = {
        id: result.batch.id,
        batchNumber: result.batch.batchNumber,
        productName: result.batch.productName,
        productCode: result.batch.productCode,
        description: result.batch.description,
        quantity: result.batch.quantity,
        unit: result.batch.unit,
        status: result.batch.status,
        qualityGrade: result.batch.qualityGrade,
        expiryDate: result.batch.expiryDate ? new Date(result.batch.expiryDate) : undefined,
        storageTemp: result.batch.storageTemp,
        handlingNotes: result.batch.handlingNotes,
        destinationAddress: result.batch.destinationAddress,
        manufacturedAt: new Date(result.batch.createdAt),
        carbonFootprint: Math.random() * 100 + 50, // Mock carbon footprint - would be calculated based on materials
        complianceDocuments: complianceDocuments.map((doc, index) => ({
          id: (index + 1).toString(),
          type: doc.type,
          documentUrl: doc.url,
          status: 'PENDING' as const,
          uploadedAt: new Date(),
        })),
      };

      // Add batch to local store for immediate UI feedback
      addBatch(newBatch);

      // Show success messages based on what was created
      toast.success('Batch registered successfully!');

      if (enableMaterialRequests && materialRequests.length > 0) {
        setTimeout(() => {
          toast.success(`${result.materialRequests.length} material request(s) created! Suppliers will be notified to submit bids.`);
        }, 1000);
        
        setTimeout(() => {
          toast.info('Once you approve supplier bids, logistics providers will automatically be invited to bid on shipping.');
        }, 2500);
      } else {
        // No material requests - logistics bidding opens immediately
        setTimeout(() => {
          toast.info('Logistics providers have been notified and can now submit bids for shipping your batch.');
        }, 1500);
      }

      // Redirect to batch management page
      setTimeout(() => {
        router.push('/manufacturer/batches');
      }, 3500);

    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Basic Batch Information</h3>
                <p className="text-sm text-muted-foreground mt-1">Enter the essential details for your new batch</p>
              </div>
              <Button variant="outline" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Batches
              </Button>
            </div>
            
            {/* Compact grid layout with better spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batchNumber" className="text-sm font-medium">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={batchData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Auto-generated"
                    disabled
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="productName" className="text-sm font-medium">Product Name *</Label>
                  <Input
                    id="productName"
                    value={batchData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Enter product name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="productCode" className="text-sm font-medium">Product Code</Label>
                  <Input
                    id="productCode"
                    value={batchData.productCode}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                    placeholder="Enter product code"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={batchData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qualityGrade" className="text-sm font-medium">Quality Grade *</Label>
                  <Select value={batchData.qualityGrade} onValueChange={(value) => handleInputChange('qualityGrade', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select quality grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_GRADES.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={batchData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="1"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit" className="text-sm font-medium">Unit *</Label>
                    <Select value={batchData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATCH_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="storageTemp" className="text-sm font-medium">Storage Temperature</Label>
                  <Input
                    id="storageTemp"
                    value={batchData.storageTemp}
                    onChange={(e) => handleInputChange('storageTemp', e.target.value)}
                    placeholder="e.g., 2-8°C, Room temperature"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm font-medium">Product Description</Label>
                    <AIEnhanceButton
                      fieldType="description"
                      currentText={batchData.description}
                      contextData={{
                        productName: batchData.productName,
                        productCode: batchData.productCode,
                        quantity: batchData.quantity,
                        unit: batchData.unit,
                        qualityGrade: batchData.qualityGrade
                      }}
                      onEnhanced={(enhancedText) => handleInputChange('description', enhancedText)}
                      disabled={!batchData.productName}
                    />
                  </div>
                  <Textarea
                    id="description"
                    value={batchData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="handlingNotes" className="text-sm font-medium">Handling Notes</Label>
                    <AIEnhanceButton
                      fieldType="handlingNotes"
                      currentText={batchData.handlingNotes}
                      contextData={{
                        productName: batchData.productName,
                        productCode: batchData.productCode,
                        quantity: batchData.quantity,
                        unit: batchData.unit,
                        qualityGrade: batchData.qualityGrade,
                        storageTemp: batchData.storageTemp
                      }}
                      onEnhanced={(enhancedText) => handleInputChange('handlingNotes', enhancedText)}
                      disabled={!batchData.productName}
                    />
                  </div>
                  <Textarea
                    id="handlingNotes"
                    value={batchData.handlingNotes}
                    onChange={(e) => handleInputChange('handlingNotes', e.target.value)}
                    placeholder="Special handling requirements..."
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="destinationAddress" className="text-sm font-medium">Destination Address</Label>
                  <Textarea
                    id="destinationAddress"
                    value={batchData.destinationAddress}
                    onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                    placeholder="Enter delivery destination address..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Material Requirements</h3>
                <p className="text-sm text-muted-foreground mt-1">Request materials from suppliers if needed</p>
              </div>
              <Button variant="outline" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="enableRequests"
                      checked={enableMaterialRequests}
                      onCheckedChange={setEnableMaterialRequests}
                    />
                    <div>
                      <Label htmlFor="enableRequests" className="text-base font-medium">
                        Request materials from suppliers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable this to create material requests and invite supplier bids
                      </p>
                    </div>
                  </div>
                  {enableMaterialRequests && (
                    <Button onClick={addMaterialRequest} size="sm" variant="default">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Request
                    </Button>
                  )}
                </div>

                {enableMaterialRequests ? (
                  <div className="space-y-4">
                    {materialRequests.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="font-medium">No material requests yet</p>
                        <p className="text-sm">Click "Add Request" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {materialRequests.map((request, index) => (
                          <Card key={request.id} className="relative">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <Badge variant="secondary">Request #{index + 1}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMaterialRequest(request.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Material Name *</Label>
                                  <Input
                                    value={request.materialName}
                                    onChange={(e) => updateMaterialRequest(request.id, 'materialName', e.target.value)}
                                    placeholder="Enter material name"
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Budget Range *</Label>
                                  <Input
                                    value={request.budgetRange}
                                    onChange={(e) => updateMaterialRequest(request.id, 'budgetRange', e.target.value)}
                                    placeholder="₹50,000 - ₹75,000"
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Quantity *</Label>
                                  <Input
                                    type="number"
                                    value={request.quantity}
                                    onChange={(e) => updateMaterialRequest(request.id, 'quantity', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="1"
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Unit *</Label>
                                  <Select 
                                    value={request.unit} 
                                    onValueChange={(value) => updateMaterialRequest(request.id, 'unit', value)}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {BATCH_UNITS.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>
                                          {unit.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Closing Date</Label>
                                  <Input
                                    type="date"
                                    value={request.closingDate}
                                    onChange={(e) => updateMaterialRequest(request.id, 'closingDate', e.target.value)}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="md:col-span-2 lg:col-span-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <AIEnhanceButton
                                      fieldType="materialDescription"
                                      currentText={request.description}
                                      contextData={{
                                        productName: batchData.productName,
                                        materialName: request.materialName,
                                        quantity: request.quantity,
                                        unit: request.unit,
                                        budgetRange: request.budgetRange
                                      }}
                                      onEnhanced={(enhancedText) => updateMaterialRequest(request.id, 'description', enhancedText)}
                                      disabled={!request.materialName}
                                    />
                                  </div>
                                  <Textarea
                                    value={request.description}
                                    onChange={(e) => updateMaterialRequest(request.id, 'description', e.target.value)}
                                    placeholder="Describe the material requirements..."
                                    rows={2}
                                    className="mt-1 resize-none"
                                  />
                                </div>

                                <div className="md:col-span-2 lg:col-span-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Technical Specifications</Label>
                                    <AIEnhanceButton
                                      fieldType="specifications"
                                      currentText={request.specifications}
                                      contextData={{
                                        productName: batchData.productName,
                                        materialName: request.materialName,
                                        quantity: request.quantity,
                                        unit: request.unit,
                                        budgetRange: request.budgetRange
                                      }}
                                      onEnhanced={(enhancedText) => updateMaterialRequest(request.id, 'specifications', enhancedText)}
                                      disabled={!request.materialName}
                                    />
                                  </div>
                                  <Textarea
                                    value={request.specifications}
                                    onChange={(e) => updateMaterialRequest(request.id, 'specifications', e.target.value)}
                                    placeholder="Enter technical specifications..."
                                    rows={2}
                                    className="mt-1 resize-none"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Skip material requests?</strong> If you already have all materials, 
                      logistics providers will be automatically invited to bid on shipping your batch.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Compliance Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload required compliance certificates</p>
              </div>
              <Button variant="outline" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {DOCUMENT_TYPES.map((docType) => (
                <Card key={docType.value} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">{docType.label}</h4>
                      <Badge variant="outline" className="text-xs">{docType.value}</Badge>
                    </div>
                    
                    <FileUploadComponent
                      documentType={docType.value}
                      userId="manufacturer-123"
                      onUploadComplete={(urls) => handleDocumentUpload(docType.value, urls)}
                      maxFiles={1}
                      acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
                      maxFileSize="10MB"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {complianceDocuments.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Uploaded Documents ({complianceDocuments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {complianceDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-green-800">{doc.type}</span>
                            <p className="text-xs text-green-600">{doc.name}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Required:</strong> Please upload at least one compliance document to proceed with batch registration.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold">Review & Confirm</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Review your batch details before submitting
                </p>
              </div>
              <Button variant="outline" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Batch Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Package className="w-4 h-4" />
                      <span>Batch Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Batch Number:</span>
                        <p className="font-medium truncate">{batchData.batchNumber}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Product:</span>
                        <p className="font-medium truncate">{batchData.productName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <p className="font-medium">{batchData.quantity} {batchData.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Grade:</span>
                        <p className="font-medium">{batchData.qualityGrade}</p>
                      </div>
                    </div>
                    {batchData.description && (
                      <div>
                        <span className="text-muted-foreground text-sm">Description:</span>
                        <p className="text-sm mt-1 line-clamp-2">{batchData.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documents Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <FileText className="w-4 h-4" />
                      <span>Documents ({complianceDocuments.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {complianceDocuments.map((doc, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                          <span className="font-medium">{doc.type}</span>
                          <Badge variant="outline" className="text-xs">Uploaded</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Material Requests Summary */}
                {enableMaterialRequests && materialRequests.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Material Requests ({materialRequests.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {materialRequests.map((req, index) => (
                          <div key={req.id} className="p-2 bg-muted rounded text-sm">
                            <div className="flex justify-between items-start">
                              <span className="font-medium truncate">{req.materialName}</span>
                              <Badge variant="secondary" className="text-xs ml-2">#{index + 1}</Badge>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1">
                              {req.quantity} {req.unit} • {req.budgetRange}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong className="text-blue-900">What happens next:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      {enableMaterialRequests && materialRequests.length > 0 && (
                        <li>• Suppliers will receive invitations to bid on materials</li>
                      )}
                      <li>• Logistics providers will be invited to bid on shipping</li>
                      <li>• You'll receive notifications when bids are submitted</li>
                      <li>• Review and approve bids from your dashboard</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return CheckCircle;
    if (step === currentStep) return Clock;
    return AlertTriangle;
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Registration Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Compact Step Indicators */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[
            { step: 1, title: 'Details', icon: Package },
            { step: 2, title: 'Materials', icon: ShoppingCart },
            { step: 3, title: 'Documents', icon: FileText },
            { step: 4, title: 'Review', icon: CheckCircle },
          ].map(({ step, title, icon: Icon }) => {
            const StepIcon = getStepIcon(step);
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center space-y-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-blue-600' :
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Compact Navigation Buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="min-w-[120px]"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !validateStep(currentStep)}
              className="min-w-[160px]"
            >
              {loading ? 'Creating Batch...' : 'Submit & Create Batch'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}