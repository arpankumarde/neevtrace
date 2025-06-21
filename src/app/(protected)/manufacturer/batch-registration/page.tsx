"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  FileText, 
  Users, 
  Truck, 
  QrCode, 
  Upload,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Leaf,
  AlertCircle,
  Eye,
  Download,
  Home
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import QRCode from 'qrcode';
import Link from 'next/link';
import { toast } from 'sonner';

// Form validation schema
const batchRegistrationSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productCode: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  manufacturedAt: z.string().min(1, "Manufacturing date is required"),
  expiryDate: z.string().optional(),
  qualityGrade: z.string().optional(),
  storageTemp: z.string().optional(),
  handlingNotes: z.string().optional(),
  estimatedCarbonFootprint: z.number().optional(),
});

type BatchRegistrationForm = z.infer<typeof batchRegistrationSchema>;

const steps = [
  { id: 1, title: 'Product Details', description: 'Basic product information' },
  { id: 2, title: 'Documents', description: 'Compliance certificates' },
  { id: 3, title: 'Suppliers', description: 'Component mapping' },
  { id: 4, title: 'Logistics', description: 'Transport partners' },
  { id: 5, title: 'QR Generation', description: 'Digital passport' },
];

const documentTypes = [
  'CIIPL', 'ISO', 'BIS', 'ROHS', 'GST_CERTIFICATE', 
  'PAN_CARD', 'TRADE_LICENSE', 'INCORPORATION_CERTIFICATE'
];

const units = ['kg', 'g', 'lbs', 'tons', 'pieces', 'liters', 'ml', 'boxes'];
const qualityGrades = ['A+', 'A', 'B+', 'B', 'C'];

// Mock suppliers and logistics data
const mockSuppliers = [
  { id: '1', companyName: 'GreenMetal Co.', email: 'contact@greenmetal.com', country: 'India', esgScore: 85, suppliedProducts: ['Steel', 'Aluminum'], certifications: ['ISO 9001', 'ISO 14001'] },
  { id: '2', companyName: 'SustainAlloy Ltd.', email: 'info@sustainalloy.com', country: 'India', esgScore: 78, suppliedProducts: ['Alloys', 'Components'], certifications: ['ROHS', 'ISO 9001'] },
  { id: '3', companyName: 'EcoMaterials Inc.', email: 'sales@ecomaterials.com', country: 'Germany', esgScore: 92, suppliedProducts: ['Eco Materials', 'Composites'], certifications: ['ISO 14001', 'OHSAS 18001'] },
];

const mockLogistics = [
  { id: '1', companyName: 'EcoLogistics', email: 'ops@ecologistics.com', fleetSize: 50, serviceAreas: ['Mumbai', 'Delhi', 'Bangalore'], carbonFootprintPerKm: 2.3, sustainabilityCertifications: ['Green Fleet', 'Carbon Neutral'] },
  { id: '2', companyName: 'GreenTransport Ltd.', email: 'info@greentransport.com', fleetSize: 30, serviceAreas: ['Chennai', 'Kolkata', 'Pune'], carbonFootprintPerKm: 1.8, sustainabilityCertifications: ['EV Fleet', 'ISO 14001'] },
  { id: '3', companyName: 'SustainShip Co.', email: 'contact@sustainship.com', fleetSize: 75, serviceAreas: ['All India'], carbonFootprintPerKm: 2.1, sustainabilityCertifications: ['BioDiesel Fleet', 'Carbon Offset'] },
];

export default function BatchRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedLogistics, setSelectedLogistics] = useState<string>('');
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addBatch, setSuppliers, setLogisticsHandlers } = useAppStore();

  // Initialize mock data
  React.useEffect(() => {
    setSuppliers(mockSuppliers);
    setLogisticsHandlers(mockLogistics);
  }, [setSuppliers, setLogisticsHandlers]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<BatchRegistrationForm>({
    resolver: zodResolver(batchRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      quantity: 1,
    }
  });

  const watchedValues = watch();

  // Generate batch ID on component mount
  React.useEffect(() => {
    const newBatchId = `BT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    setBatchId(newBatchId);
  }, []);

  // Document upload handler
  const onDocumentDrop = React.useCallback((acceptedFiles: File[], documentType: string) => {
    const newDocuments = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: documentType,
      status: 'pending',
      uploadedAt: new Date(),
    }));
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    toast.success(`${acceptedFiles.length} document(s) uploaded for ${documentType}`);
  }, []);

  // QR Code generation
  const generateQRCode = async (batchData: any) => {
    const qrData = {
      batchId: batchId,
      productName: batchData.productName,
      productCode: batchData.productCode,
      manufacturedAt: batchData.manufacturedAt,
      expiryDate: batchData.expiryDate,
      quantity: batchData.quantity,
      unit: batchData.unit,
      qualityGrade: batchData.qualityGrade,
      suppliers: selectedSuppliers,
      logistics: selectedLogistics,
      documents: uploadedDocuments.map(doc => ({
        type: doc.type,
        status: doc.status
      })),
      carbonFootprint: batchData.estimatedCarbonFootprint,
      verificationUrl: `${window.location.origin}/product/${batchId}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      setGeneratedQR(qrCodeDataURL);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      return null;
    }
  };

  const onSubmit = async (data: BatchRegistrationForm) => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate QR code first
      const qrCode = await generateQRCode(data);
      
      // Create batch data
      const batchData = {
        id: batchId,
        batchNumber: batchId,
        ...data,
        status: 'CREATED' as const,
        manufacturedAt: new Date(data.manufacturedAt),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        carbonFootprint: data.estimatedCarbonFootprint,
        complianceDocuments: uploadedDocuments.map(doc => ({
          id: doc.id.toString(),
          type: doc.type,
          documentUrl: URL.createObjectURL(doc.file),
          status: 'PENDING' as const,
          uploadedAt: doc.uploadedAt,
        })),
      };

      // Save to store
      addBatch(batchData);
      
      toast.success('Batch registered successfully!');
      
      // Auto-redirect after success
      setTimeout(() => {
        window.location.href = '/manufacturer';
      }, 2000);
      
    } catch (error) {
      console.error('Error registering batch:', error);
      toast.error('Failed to register batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href="/manufacturer">← Back to Dashboard</Link>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Batch Registration</h1>
                <p className="text-xs text-muted-foreground">SSSCP Platform</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Batch ID: {batchId}
            </Badge>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Batch Registration</h2>
          <p className="text-muted-foreground">
            Create a new production batch with digital passport and compliance tracking.
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</span>
            </div>
            <Progress value={progress} className="w-full mb-4" />
            
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep 
                      ? 'bg-green-100 text-green-600' 
                      : step.id === currentStep
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Product Details */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Product Details</span>
                    </CardTitle>
                    <CardDescription>
                      Enter the basic information about your product batch.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name *</Label>
                        <Controller
                          name="productName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="e.g., Premium Steel Components"
                              className={errors.productName ? 'border-red-500' : ''}
                            />
                          )}
                        />
                        {errors.productName && (
                          <p className="text-sm text-red-500">{errors.productName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productCode">Product Code</Label>
                        <Controller
                          name="productCode"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="e.g., PSC-2024-001" />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Controller
                          name="quantity"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className={errors.quantity ? 'border-red-500' : ''}
                            />
                          )}
                        />
                        {errors.quantity && (
                          <p className="text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit *</Label>
                        <Controller
                          name="unit"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.unit && (
                          <p className="text-sm text-red-500">{errors.unit.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manufacturedAt">Manufacturing Date *</Label>
                        <Controller
                          name="manufacturedAt"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="date"
                              className={errors.manufacturedAt ? 'border-red-500' : ''}
                            />
                          )}
                        />
                        {errors.manufacturedAt && (
                          <p className="text-sm text-red-500">{errors.manufacturedAt.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Controller
                          name="expiryDate"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} type="date" />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="qualityGrade">Quality Grade</Label>
                        <Controller
                          name="qualityGrade"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {qualityGrades.map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    Grade {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedCarbonFootprint">
                          <Leaf className="inline w-4 h-4 mr-1" />
                          Estimated Carbon Footprint (kg CO₂)
                        </Label>
                        <Controller
                          name="estimatedCarbonFootprint"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="e.g., 12.5"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Detailed product description, specifications, or notes..."
                            rows={3}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="storageTemp">Storage Temperature</Label>
                        <Controller
                          name="storageTemp"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="e.g., 15-25°C" />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="handlingNotes">Handling Notes</Label>
                        <Controller
                          name="handlingNotes"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Special handling instructions"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Compliance Documents</span>
                    </CardTitle>
                    <CardDescription>
                      Upload compliance certificates and documentation for this batch.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {documentTypes.map((docType) => (
                        <DocumentUploadSection
                          key={docType}
                          documentType={docType}
                          onDrop={onDocumentDrop}
                          uploadedDocs={uploadedDocuments.filter(doc => doc.type === docType)}
                        />
                      ))}
                    </div>
                    
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3">Uploaded Documents</h4>
                        <div className="space-y-2">
                          {uploadedDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium">{doc.file.name}</p>
                                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                                </div>
                              </div>
                              <Badge variant={doc.status === 'pending' ? 'secondary' : 'default'}>
                                {doc.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Suppliers */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Supplier & Component Mapping</span>
                    </CardTitle>
                    <CardDescription>
                      Map the suppliers and components used in this batch for complete traceability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Select the suppliers who provided materials or components for this batch:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockSuppliers.map((supplier) => (
                          <div
                            key={supplier.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedSuppliers.includes(supplier.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setSelectedSuppliers(prev =>
                                prev.includes(supplier.id)
                                  ? prev.filter(id => id !== supplier.id)
                                  : [...prev, supplier.id]
                              );
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{supplier.companyName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {supplier.suppliedProducts.slice(0, 2).join(', ')}
                                  {supplier.suppliedProducts.length > 2 && '...'}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline">ESG: {supplier.esgScore}</Badge>
                                  <Badge variant="outline">{supplier.country}</Badge>
                                </div>
                              </div>
                              {selectedSuppliers.includes(supplier.id) && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Logistics */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="w-5 h-5" />
                      <span>Logistics Partner Selection</span>
                    </CardTitle>
                    <CardDescription>
                      Choose a logistics partner for transportation and delivery.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockLogistics.map((handler) => (
                          <div
                            key={handler.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedLogistics === handler.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedLogistics(handler.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{handler.companyName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Fleet: {handler.fleetSize} vehicles
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline">
                                    Areas: {handler.serviceAreas.length}
                                  </Badge>
                                  <Badge variant="outline">
                                    CO₂: {handler.carbonFootprintPerKm} kg/km
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {handler.sustainabilityCertifications.map((cert) => (
                                    <Badge key={cert} variant="secondary" className="text-xs">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {selectedLogistics === handler.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: QR Generation & Review */}
              {currentStep === 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <QrCode className="w-5 h-5" />
                      <span>Digital Batch Passport</span>
                    </CardTitle>
                    <CardDescription>
                      Review your batch details and generate the QR code for digital passport.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Batch Summary */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Batch Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Batch ID:</span>
                            <span className="text-sm font-medium">{batchId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Product:</span>
                            <span className="text-sm font-medium">{watchedValues.productName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Quantity:</span>
                            <span className="text-sm font-medium">{watchedValues.quantity} {watchedValues.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Manufacturing Date:</span>
                            <span className="text-sm font-medium">
                              {watchedValues.manufacturedAt ? format(new Date(watchedValues.manufacturedAt), 'PPP') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Documents:</span>
                            <span className="text-sm font-medium">{uploadedDocuments.length} uploaded</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Suppliers:</span>
                            <span className="text-sm font-medium">{selectedSuppliers.length} selected</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Carbon Footprint:</span>
                            <span className="text-sm font-medium">
                              {watchedValues.estimatedCarbonFootprint || 'N/A'} kg CO₂
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Display */}
                      <div className="flex flex-col items-center space-y-4">
                        <h4 className="font-medium">QR Code Preview</h4>
                        {generatedQR ? (
                          <div className="space-y-4">
                            <img src={generatedQR} alt="Batch QR Code" className="w-48 h-48 border rounded-lg" />
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/product/${batchId}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                const link = document.createElement('a');
                                link.download = `batch-${batchId}-qr.png`;
                                link.href = generatedQR;
                                link.click();
                              }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <QrCode className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">QR will be generated on submit</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verification URL */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900">Verification URL</h5>
                          <p className="text-sm text-blue-700 mt-1">
                            Consumers can scan this QR code or visit: <br />
                            <code className="bg-white px-2 py-1 rounded text-xs">
                              {window.location.origin}/product/{batchId}
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === 1 && !isValid}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Register Batch
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Document Upload Component
function DocumentUploadSection({ 
  documentType, 
  onDrop, 
  uploadedDocs 
}: {
  documentType: string;
  onDrop: (files: File[], type: string) => void;
  uploadedDocs: any[];
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, documentType),
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 5,
  });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{documentType.replace('_', ' ')}</Label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop files here' : 'Click or drag files'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
      </div>
      {uploadedDocs.length > 0 && (
        <div className="text-xs text-green-600">
          {uploadedDocs.length} file(s) uploaded
        </div>
      )}
    </div>
  );
} 