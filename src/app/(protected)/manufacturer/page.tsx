"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  FileCheck, 
  Truck, 
  Leaf, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useAppStore } from '@/lib/store';

// Mock data for development
const mockMetrics = {
  totalBatches: 156,
  activeBatches: 23,
  completedBatches: 133,
  totalCarbonSaved: 2.4, // tons
  esgScore: 85,
  complianceRate: 94,
  avgDeliveryTime: 5.2, // days
};

const mockChartData = [
  { month: 'Jan', batches: 12, carbon: 1.2, compliance: 89 },
  { month: 'Feb', batches: 19, carbon: 1.8, compliance: 92 },
  { month: 'Mar', batches: 23, carbon: 2.1, compliance: 88 },
  { month: 'Apr', batches: 18, carbon: 1.9, compliance: 95 },
  { month: 'May', batches: 21, carbon: 2.4, compliance: 94 },
  { month: 'Jun', batches: 25, carbon: 2.8, compliance: 96 },
];

const mockStatusData = [
  { name: 'Completed', value: 133, color: '#10B981' },
  { name: 'In Transit', value: 18, color: '#3B82F6' },
  { name: 'Created', value: 5, color: '#F59E0B' },
];

const mockRecentActivities = [
  { id: 1, type: 'batch_created', message: 'New batch BT-2024-001 created', time: '2 hours ago' },
  { id: 2, type: 'document_verified', message: 'ISO certificate verified for batch BT-2024-002', time: '4 hours ago' },
  { id: 3, type: 'shipment_started', message: 'Batch BT-2024-003 picked up by LogiCorp', time: '6 hours ago' },
  { id: 4, type: 'compliance_check', message: 'Compliance check completed for supplier SU-456', time: '8 hours ago' },
];

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

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  description 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color: string;
  description?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{change}</span> from last month
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
        <motion.div
          className={`absolute inset-0 opacity-5 bg-gradient-to-br ${color.replace('text-', 'from-').replace('-600', '-400')} to-transparent`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
      </Card>
    </motion.div>
  );
}

export default function ManufacturerDashboard() {
  const { batches, sustainabilityMetrics } = useAppStore();

  return (
    <motion.div 
      className="flex-1 space-y-4 p-4 md:p-8 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manufacturing Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your supply chain today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
                        <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Batch (Coming Soon)
              </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Batches"
          value={mockMetrics.totalBatches}
          change="12%"
          icon={Package}
          color="text-blue-600"
          description="Lifetime production batches"
        />
        <MetricCard
          title="Carbon Saved"
          value={`${mockMetrics.totalCarbonSaved}t CO₂`}
          change="18%"
          icon={Leaf}
          color="text-green-600"
          description="Environmental impact reduction"
        />
        <MetricCard
          title="ESG Score"
          value={`${mockMetrics.esgScore}/100`}
          change="5%"
          icon={TrendingUp}
          color="text-purple-600"
          description="Sustainability performance"
        />
        <MetricCard
          title="Compliance Rate"
          value={`${mockMetrics.complianceRate}%`}
          change="2%"
          icon={FileCheck}
          color="text-orange-600"
          description="Document verification success"
        />
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Production Trends Chart */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Production & Impact Trends</CardTitle>
                  <CardDescription>
                    Monthly batch production and carbon footprint data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="batches" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Batches Produced"
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="carbon" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Carbon Saved (t)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Batch Status Distribution</CardTitle>
                  <CardDescription>
                    Current status of all production batches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest updates from your supply chain operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        {activity.type === 'batch_created' && <Package className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'document_verified' && <FileCheck className="h-4 w-4 text-green-600" />}
                        {activity.type === 'shipment_started' && <Truck className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'compliance_check' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.message}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockMetrics.activeBatches}</div>
                  <p className="text-xs text-muted-foreground">Currently in production or transit</p>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/manufacturer/batches">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockMetrics.avgDeliveryTime} days</div>
                  <p className="text-xs text-muted-foreground">From production to delivery</p>
                  <div className="mt-4">
                    <Progress value={75} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">25% faster than industry avg</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Badge variant="secondary">Premium</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">9.2/10</div>
                  <p className="text-xs text-muted-foreground">Based on compliance & feedback</p>
                  <div className="mt-4">
                    <Progress value={92} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sustainability" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Carbon Footprint Reduction</CardTitle>
                  <CardDescription>Monthly progress towards net-zero goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="carbon" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ESG Goals Progress</CardTitle>
                  <CardDescription>Environmental, Social & Governance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Carbon Reduction</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Renewable Energy</span>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Waste Reduction</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <Progress value={82} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Social Impact</span>
                      <span className="text-sm text-muted-foreground">71%</span>
                    </div>
                    <Progress value={71} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents Verified</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">147</div>
                  <p className="text-xs text-muted-foreground">Out of 156 total documents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">9</div>
                  <p className="text-xs text-muted-foreground">Awaiting verification</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <p className="text-xs text-muted-foreground">Certificates need renewal</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Timeline</CardTitle>
                <CardDescription>Recent compliance activities and upcoming deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Compliance Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}