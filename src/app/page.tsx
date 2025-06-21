"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Factory, 
  Truck, 
  Users, 
  Leaf, 
  ShieldCheck, 
  QrCode,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { UserButton } from "@civic/auth/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const features = [
  {
    icon: Factory,
    title: "Smart Manufacturing",
    description: "Digital batch registration with compliance tracking and QR generation",
    color: "text-blue-600"
  },
  {
    icon: Truck,
    title: "Intelligent Logistics",
    description: "Carbon-aware transport optimization with real-time tracking",
    color: "text-orange-600"
  },
  {
    icon: Leaf,
    title: "Sustainability Insights",
    description: "AI-powered ESG scoring and carbon footprint reduction",
    color: "text-green-600"
  },
  {
    icon: ShieldCheck,
    title: "Compliance Automation",
    description: "Automated document verification and regulatory compliance",
    color: "text-purple-600"
  }
];

const stats = [
  { label: "Carbon Saved", value: "2.4t CO₂", icon: Leaf },
  { label: "Batches Processed", value: "156+", icon: Factory },
  { label: "ESG Score", value: "85/100", icon: BarChart3 },
  { label: "Compliance Rate", value: "94%", icon: CheckCircle },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NeevTrace</h1>
                <p className="text-xs text-muted-foreground">Smart Sustainable Supply Chain</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/product/BT-2024-001">Demo QR Scan</Link>
              </Button>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🌟 Enterprise Supply Chain Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Sustainable
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Supply Chain Platform
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Digitize, verify, and optimize global supply chains through AI-augmented, 
            blockchain-backed platform with complete traceability and sustainability insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-green-600">
              <Link href="/manufacturer">
                <Factory className="mr-2 h-5 w-5" />
                Launch Manufacturer Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/logistics">
                <Truck className="mr-2 h-5 w-5" />
                Logistics Module
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Platform Modules */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Modules</h2>
            <p className="text-lg text-muted-foreground">
              Role-specific dashboards designed for every stakeholder in your supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Manufacturer Module */}
            <motion.div variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href="/manufacturer">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <Factory className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      Manufacturer
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription>
                      Batch registration, compliance tracking, and digital passport generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Multi-step batch wizard</li>
                      <li>• Document management</li>
                      <li>• QR code generation</li>
                      <li>• Supplier mapping</li>
                    </ul>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>

            {/* Logistics Module */}
            <motion.div variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href="/logistics">
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      Logistics
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription>
                      Real-time tracking, route optimization, and emission monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• QR scanning system</li>
                      <li>• Route tracking</li>
                      <li>• Carbon footprint</li>
                      <li>• Delivery optimization</li>
                    </ul>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>

            {/* Supplier Module */}
            <motion.div variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href="/supplier">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      Supplier
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription>
                      ESG scoring, compliance management, and material sourcing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• ESG assessment</li>
                      <li>• Material catalog</li>
                      <li>• Certification tracking</li>
                      <li>• Performance metrics</li>
                    </ul>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>

            {/* Sustainability Module */}
            <motion.div variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href="/sustainability">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      Sustainability
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription>
                      AI-powered insights, carbon tracking, and ESG reporting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• AI recommendations</li>
                      <li>• Carbon analytics</li>
                      <li>• ESG reporting</li>
                      <li>• Impact visualization</li>
                    </ul>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground">
              Enterprise-grade capabilities built for modern supply chains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Demo Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardContent className="p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-4">Try Product Verification</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Experience our consumer-facing product verification system. 
                Scan QR codes to view complete product traceability and sustainability metrics.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/product/BT-2024-001">
                  <QrCode className="mr-2 h-5 w-5" />
                  Demo Product Verification
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>Powered by Next.js, AI, and Blockchain Technology</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
