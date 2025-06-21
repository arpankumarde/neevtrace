"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Plus,
  Eye,
  Phone,
  Mail,
  Globe,
  Leaf,
  BarChart3,
  Package,
  Route,
  Home
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

const shipmentStatuses = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  IN_TRANSIT: { color: 'bg-blue-100 text-blue-800', icon: Truck },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  DELAYED: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

// Mock logistics partners data
const mockLogisticsPartners = [
  {
    id: '1',
    companyName: 'EcoLogistics',
    contactPerson: 'Rajesh Kumar',
    email: 'ops@ecologistics.com',
    phone: '+91-9876543210',
    website: 'www.ecologistics.com',
    fleetSize: 50,
    serviceAreas: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
    carbonFootprintPerKm: 2.3,
    sustainabilityCertifications: ['Green Fleet', 'Carbon Neutral'],
    rating: 4.5,
    totalShipments: 145,
    onTimeDelivery: 96.2,
    status: 'ACTIVE',
  },
  {
    id: '2',
    companyName: 'GreenTransport Ltd.',
    contactPerson: 'Priya Sharma',
    email: 'info@greentransport.com',
    phone: '+91-9876543211',
    website: 'www.greentransport.com',
    fleetSize: 30,
    serviceAreas: ['Chennai', 'Kolkata', 'Pune', 'Hyderabad'],
    carbonFootprintPerKm: 1.8,
    sustainabilityCertifications: ['EV Fleet', 'ISO 14001'],
    rating: 4.7,
    totalShipments: 89,
    onTimeDelivery: 98.1,
    status: 'ACTIVE',
  },
  {
    id: '3',
    companyName: 'SustainShip Co.',
    contactPerson: 'Amit Patel',
    email: 'contact@sustainship.com',
    phone: '+91-9876543212',
    website: 'www.sustainship.com',
    fleetSize: 75,
    serviceAreas: ['All India'],
    carbonFootprintPerKm: 2.1,
    sustainabilityCertifications: ['BioDiesel Fleet', 'Carbon Offset'],
    rating: 4.3,
    totalShipments: 203,
    onTimeDelivery: 94.7,
    status: 'ACTIVE',
  },
];

// Mock shipments data
const mockShipments = [
  {
    id: 'SH-2024-001',
    batchId: 'BT-2024-001',
    logisticsPartnerId: '1',
    logisticsPartnerName: 'EcoLogistics',
    origin: 'Mumbai, MH',
    destination: 'Delhi, DL',
    status: 'IN_TRANSIT',
    scheduledDelivery: new Date('2024-02-15'),
    actualDelivery: null,
    trackingNumber: 'ECO-2024-TRK-001',
    estimatedCarbonFootprint: 15.2,
    distance: 1400,
  },
  {
    id: 'SH-2024-002',
    batchId: 'BT-2024-002',
    logisticsPartnerId: '2',
    logisticsPartnerName: 'GreenTransport Ltd.',
    origin: 'Chennai, TN',
    destination: 'Bangalore, KA',
    status: 'DELIVERED',
    scheduledDelivery: new Date('2024-02-12'),
    actualDelivery: new Date('2024-02-12'),
    trackingNumber: 'GT-2024-TRK-002',
    estimatedCarbonFootprint: 8.7,
    distance: 350,
  },
  {
    id: 'SH-2024-003',
    batchId: 'BT-2024-003',
    logisticsPartnerId: '3',
    logisticsPartnerName: 'SustainShip Co.',
    origin: 'Pune, MH',
    destination: 'Kolkata, WB',
    status: 'PENDING',
    scheduledDelivery: new Date('2024-02-18'),
    actualDelivery: null,
    trackingNumber: 'SS-2024-TRK-003',
    estimatedCarbonFootprint: 28.5,
    distance: 1600,
  },
];

export default function LogisticsPage() {
  const [logisticsPartners, setLogisticsPartners] = useState(mockLogisticsPartners);
  const [shipments, setShipments] = useState(mockShipments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('partners');

  // Filter logistics partners
  const filteredPartners = useMemo(() => {
    return logisticsPartners.filter(partner => 
      partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.serviceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [logisticsPartners, searchTerm]);

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const matchesSearch = 
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.logisticsPartnerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalPartners = logisticsPartners.length;
    const activeShipments = shipments.filter(s => s.status === 'IN_TRANSIT').length;
    const deliveredThisMonth = shipments.filter(s => 
      s.status === 'DELIVERED' && 
      s.actualDelivery && 
      new Date(s.actualDelivery).getMonth() === new Date().getMonth()
    ).length;
    const totalCarbonFootprint = shipments.reduce((sum, s) => sum + s.estimatedCarbonFootprint, 0);
    const avgOnTimeDelivery = logisticsPartners.reduce((sum, p) => sum + p.onTimeDelivery, 0) / logisticsPartners.length;
    
    return { totalPartners, activeShipments, deliveredThisMonth, totalCarbonFootprint, avgOnTimeDelivery };
  }, [logisticsPartners, shipments]);

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
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Logistics</h1>
                <p className="text-xs text-muted-foreground">SSSCP Platform</p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Logistics Management</h2>
          <p className="text-muted-foreground">
            Manage your logistics partners and track shipments with sustainability insights.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Partners</p>
                    <p className="text-2xl font-bold">{stats.totalPartners}</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Shipments</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeShipments}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered This Month</p>
                    <p className="text-2xl font-bold text-green-600">{stats.deliveredThisMonth}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalCarbonFootprint.toFixed(1)} kg</p>
                  </div>
                  <Leaf className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.avgOnTimeDelivery.toFixed(1)}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="partners">Logistics Partners</TabsTrigger>
            <TabsTrigger value="shipments">Active Shipments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Logistics Partners */}
          <TabsContent value="partners" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Partners</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by company name, contact person, or service areas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{partner.companyName}</CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {partner.status}
                        </Badge>
                      </div>
                      <CardDescription>{partner.contactPerson}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fleet Size</p>
                          <p className="font-medium">{partner.fleetSize} vehicles</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <p className="font-medium">{partner.rating}/5.0 ⭐</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">On-Time Delivery</p>
                          <p className="font-medium text-green-600">{partner.onTimeDelivery}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Carbon/km</p>
                          <p className="font-medium">{partner.carbonFootprintPerKm} kg</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Service Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {partner.serviceAreas.slice(0, 3).map((area) => (
                            <Badge key={area} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {partner.serviceAreas.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.serviceAreas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Sustainability</p>
                        <div className="flex flex-wrap gap-1">
                          {partner.sustainabilityCertifications.map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs bg-green-100 text-green-800">
                              <Leaf className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        </div>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Active Shipments */}
          <TabsContent value="shipments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
                  <div className="flex-1">
                    <Label htmlFor="search-shipments">Search Shipments</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search-shipments"
                        placeholder="Search by shipment ID, batch ID, or partner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <Label>Status Filter</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="DELAYED">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipments Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shipment ID</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled Delivery</TableHead>
                        <TableHead>Carbon (kg)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShipments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No shipments found</p>
                            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredShipments.map((shipment) => {
                          const StatusIcon = shipmentStatuses[shipment.status as keyof typeof shipmentStatuses].icon;
                          const statusColor = shipmentStatuses[shipment.status as keyof typeof shipmentStatuses].color;
                          
                          return (
                            <TableRow key={shipment.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{shipment.id}</TableCell>
                              
                              <TableCell>
                                <Badge variant="outline">{shipment.batchId}</Badge>
                              </TableCell>
                              
                              <TableCell>{shipment.logisticsPartnerName}</TableCell>
                              
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {shipment.origin} → {shipment.destination}
                                  </span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <Badge className={statusColor} variant="secondary">
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {shipment.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {format(shipment.scheduledDelivery, 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <span className="text-sm font-medium">
                                  {shipment.estimatedCarbonFootprint.toFixed(1)}
                                </span>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Route className="w-4 h-4 mr-1" />
                                    Track
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Partners</CardTitle>
                  <CardDescription>Based on on-time delivery and rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logisticsPartners
                      .sort((a, b) => (b.onTimeDelivery + b.rating * 10) - (a.onTimeDelivery + a.rating * 10))
                      .slice(0, 5)
                      .map((partner, index) => (
                        <div key={partner.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{partner.companyName}</p>
                              <p className="text-sm text-muted-foreground">
                                {partner.onTimeDelivery}% on-time • {partner.rating}/5.0 rating
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{partner.totalShipments} shipments</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sustainability Metrics</CardTitle>
                  <CardDescription>Environmental impact of logistics operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Carbon Footprint</span>
                      <span className="text-sm text-muted-foreground">
                        {(stats.totalCarbonFootprint / shipments.length).toFixed(2)} kg per shipment
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Green Certified Partners</span>
                      <span className="text-sm text-muted-foreground">
                        {logisticsPartners.filter(p => 
                          p.sustainabilityCertifications.some(cert => 
                            cert.includes('Green') || cert.includes('Carbon') || cert.includes('EV')
                          )
                        ).length} of {logisticsPartners.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Distance Covered</span>
                      <span className="text-sm text-muted-foreground">
                        {shipments.reduce((sum, s) => sum + s.distance, 0).toLocaleString()} km
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 