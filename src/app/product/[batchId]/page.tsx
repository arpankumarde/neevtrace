"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  MapPin, 
  Leaf, 
  ShieldCheck, 
  Calendar,
  Package,
  Truck,
  Factory,
  Users,
  Award,
  Star,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface ProductData {
  batchId: string;
  productName: string;
  productCode?: string;
  quantity: number;
  unit: string;
  manufacturedAt: Date;
  expiryDate?: Date;
  qualityGrade?: string;
  manufacturer: {
    name: string;
    location: string;
    certifications: string[];
  };
  suppliers: Array<{
    name: string;
    location: string;
    esgScore: number;
  }>;
  logistics: {
    company: string;
    carbonFootprint: number;
    deliveryTime: number;
  };
  sustainability: {
    carbonFootprint: number;
    carbonSaved: number;
    esgScore: number;
    renewableEnergy: number;
    wasteReduction: number;
  };
  compliance: {
    verified: boolean;
    certificates: Array<{
      type: string;
      status: string;
      issuer: string;
      expiryDate?: Date;
    }>;
  };
  journey: Array<{
    stage: string;
    location: string;
    timestamp: Date;
    status: string;
  }>;
}

// Mock data for demonstration
const mockProductData: ProductData = {
  batchId: 'BT-2024-001',
  productName: 'Premium Steel Components',
  productCode: 'PSC-001',
  quantity: 1000,
  unit: 'kg',
  manufacturedAt: new Date('2024-01-15'),
  expiryDate: new Date('2025-01-15'),
  qualityGrade: 'A+',
  manufacturer: {
    name: 'EcoSteel Industries',
    location: 'Mumbai, India',
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
  },
  suppliers: [
    { name: 'GreenMetal Co.', location: 'Gujarat, India', esgScore: 85 },
    { name: 'SustainAlloy Ltd.', location: 'Karnataka, India', esgScore: 78 },
  ],
  logistics: {
    company: 'EcoLogistics',
    carbonFootprint: 2.3,
    deliveryTime: 3,
  },
  sustainability: {
    carbonFootprint: 25.5,
    carbonSaved: 12.3,
    esgScore: 82,
    renewableEnergy: 65,
    wasteReduction: 78,
  },
  compliance: {
    verified: true,
    certificates: [
      { type: 'ISO 9001', status: 'APPROVED', issuer: 'Bureau Veritas', expiryDate: new Date('2025-01-15') },
      { type: 'BIS', status: 'APPROVED', issuer: 'Bureau of Indian Standards', expiryDate: new Date('2025-03-20') },
      { type: 'ROHS', status: 'APPROVED', issuer: 'SGS', expiryDate: new Date('2025-02-10') },
    ],
  },
  journey: [
    { stage: 'Raw Material', location: 'Gujarat, India', timestamp: new Date('2024-01-10'), status: 'COMPLETED' },
    { stage: 'Manufacturing', location: 'Mumbai, India', timestamp: new Date('2024-01-15'), status: 'COMPLETED' },
    { stage: 'Quality Check', location: 'Mumbai, India', timestamp: new Date('2024-01-16'), status: 'COMPLETED' },
    { stage: 'Packaging', location: 'Mumbai, India', timestamp: new Date('2024-01-17'), status: 'COMPLETED' },
    { stage: 'Dispatch', location: 'Mumbai, India', timestamp: new Date('2024-01-18'), status: 'COMPLETED' },
    { stage: 'Delivery', location: 'Delhi, India', timestamp: new Date('2024-01-21'), status: 'COMPLETED' },
  ],
};

export default function ProductVerificationPage({ params }: { params: { batchId: string } }) {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setProductData(mockProductData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params.batchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying product authenticity...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">The product with ID {params.batchId} could not be verified.</p>
        </div>
      </div>
    );
  }

  const carbonEquivalent = (carbon: number) => {
    if (carbon < 10) return `${(carbon * 0.8).toFixed(1)} hours of AC usage`;
    if (carbon < 50) return `${(carbon * 0.2).toFixed(1)} km of car driving`;
    return `${(carbon * 0.1).toFixed(1)} flights within city`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Verification</h1>
                <p className="text-sm text-muted-foreground">Powered by SSSCP</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-800 px-4 py-2 rounded-full border border-green-200">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Verified Authentic Product</span>
          </div>
        </motion.div>

        {/* Product Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {productData.productName}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Batch ID: {productData.batchId}
                    {productData.productCode && ` • ${productData.productCode}`}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="text-lg font-semibold">
                        {productData.quantity.toLocaleString()} {productData.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quality Grade</p>
                      <Badge variant="secondary" className="mt-1">
                        Grade {productData.qualityGrade}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Manufactured</p>
                      <p className="text-lg font-semibold">
                        {format(productData.manufacturedAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expires</p>
                      <p className="text-lg font-semibold">
                        {productData.expiryDate ? format(productData.expiryDate, 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Factory className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{productData.manufacturer.name}</strong> • {productData.manufacturer.location}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-green-600" />
                    Sustainability Impact
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">ESG Score</span>
                        <span className="text-sm font-bold text-green-600">
                          {productData.sustainability.esgScore}/100
                        </span>
                      </div>
                      <Progress value={productData.sustainability.esgScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Carbon Footprint</span>
                        <span className="text-sm font-bold">
                          {productData.sustainability.carbonFootprint} kg CO₂
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Equivalent to {carbonEquivalent(productData.sustainability.carbonFootprint)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          -{productData.sustainability.carbonSaved} kg CO₂
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Carbon saved vs. industry average
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            { id: 'journey', label: 'Journey', icon: MapPin },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
            { id: 'sustainability', label: 'Sustainability', icon: Leaf },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Factory className="w-5 h-5" />
                      <span>Manufacturer</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold">{productData.manufacturer.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {productData.manufacturer.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {productData.manufacturer.certifications.map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Suppliers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {productData.suppliers.map((supplier, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">{supplier.location}</p>
                          </div>
                          <Badge variant="outline">
                            ESG: {supplier.esgScore}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'journey' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Product Journey</span>
                  </CardTitle>
                  <CardDescription>
                    Trace the complete journey of your product from source to destination.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                      {productData.journey.map((step, index) => (
                        <div key={index} className="relative flex items-center space-x-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center z-10">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{step.stage}</p>
                              <Badge variant="secondary">{step.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {step.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(step.timestamp, 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'compliance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Compliance & Certifications</span>
                  </CardTitle>
                  <CardDescription>
                    All compliance documents and certifications verified by authorized bodies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productData.compliance.certificates.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{cert.type}</span>
                          </div>
                          <Badge variant={cert.status === 'APPROVED' ? 'default' : 'secondary'}>
                            {cert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Issued by: {cert.issuer}
                        </p>
                        {cert.expiryDate && (
                          <p className="text-sm text-muted-foreground">
                            Expires: {format(cert.expiryDate, 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'sustainability' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span>Environmental Impact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Carbon Footprint</span>
                        <span className="text-sm font-bold">
                          {productData.sustainability.carbonFootprint} kg CO₂
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {carbonEquivalent(productData.sustainability.carbonFootprint)}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Renewable Energy Usage</span>
                        <span className="text-sm font-bold text-green-600">
                          {productData.sustainability.renewableEnergy}%
                        </span>
                      </div>
                      <Progress value={productData.sustainability.renewableEnergy} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Waste Reduction</span>
                        <span className="text-sm font-bold text-green-600">
                          {productData.sustainability.wasteReduction}%
                        </span>
                      </div>
                      <Progress value={productData.sustainability.wasteReduction} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span>ESG Rating</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {productData.sustainability.esgScore}
                      </div>
                      <div className="text-sm text-muted-foreground">out of 100</div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(productData.sustainability.esgScore / 20)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-800">Sustainability Achievement</span>
                      </div>
                      <p className="text-sm text-green-700">
                        This product has saved <strong>{productData.sustainability.carbonSaved} kg CO₂</strong> compared to industry standards through sustainable practices.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Verified by <strong>Smart Sustainable Supply Chain Platform</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by blockchain technology and AI-driven sustainability insights
          </p>
        </div>
      </div>
    </div>
  );
} 