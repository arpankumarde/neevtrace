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
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Package, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Plus,
  RefreshCw,
  Calendar,
  BarChart3,
  QrCode,
  FileText,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Home
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

type SortField = 'batchNumber' | 'productName' | 'quantity' | 'status' | 'manufacturedAt' | 'carbonFootprint';
type SortOrder = 'asc' | 'desc';

const statusColors = {
  CREATED: 'bg-blue-100 text-blue-800',
  IN_PRODUCTION: 'bg-yellow-100 text-yellow-800',
  QUALITY_CHECK: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  RECALLED: 'bg-red-100 text-red-800',
};

const statusIcons = {
  CREATED: Clock,
  IN_PRODUCTION: RefreshCw,
  QUALITY_CHECK: AlertTriangle,
  COMPLETED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  RECALLED: X,
};

export default function BatchManagementPage() {
  const { batches, removeBatch, updateBatch } = useAppStore();
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('manufacturedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Generate some sample batches if none exist
  React.useEffect(() => {
    if (batches.length === 0) {
      const sampleBatches = [
        {
          id: 'BT-2024-001',
          batchNumber: 'BT-2024-001',
          productName: 'Premium Steel Components',
          productCode: 'PSC-001',
          description: 'High-grade steel components for automotive industry',
          quantity: 500,
          unit: 'kg',
          status: 'COMPLETED' as const,
          manufacturedAt: new Date('2024-01-15'),
          expiryDate: new Date('2025-01-15'),
          qualityGrade: 'A+',
          carbonFootprint: 125.5,
          complianceDocuments: [
            {
              id: '1',
              type: 'ISO',
              documentUrl: '#',
              status: 'APPROVED' as const,
              uploadedAt: new Date('2024-01-15'),
            }
          ],
        },
        {
          id: 'BT-2024-002', 
          batchNumber: 'BT-2024-002',
          productName: 'Aluminum Alloy Parts',
          productCode: 'AAP-002',
          description: 'Lightweight aluminum alloy components',
          quantity: 250,
          unit: 'pieces',
          status: 'SHIPPED' as const,
          manufacturedAt: new Date('2024-01-20'),
          qualityGrade: 'A',
          carbonFootprint: 87.2,
          complianceDocuments: [],
        },
        {
          id: 'BT-2024-003',
          batchNumber: 'BT-2024-003', 
          productName: 'Eco-Friendly Packaging',
          productCode: 'EFP-003',
          description: 'Sustainable packaging materials',
          quantity: 1000,
          unit: 'boxes',
          status: 'IN_PRODUCTION' as const,
          manufacturedAt: new Date('2024-01-25'),
          qualityGrade: 'B+',
          carbonFootprint: 45.8,
          complianceDocuments: [],
        },
      ];

      sampleBatches.forEach(batch => {
        useAppStore.getState().addBatch(batch);
      });
    }
  }, [batches.length]);

  // Filter and sort batches
  const filteredAndSortedBatches = useMemo(() => {
    let filtered = batches.filter(batch => {
      const matchesSearch = 
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.productCode && batch.productCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort batches
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'manufacturedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [batches, searchTerm, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatches.length === filteredAndSortedBatches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(filteredAndSortedBatches.map(batch => batch.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedBatches.length} batch(es)?`)) {
      selectedBatches.forEach(id => removeBatch(id));
      setSelectedBatches([]);
      toast.success(`${selectedBatches.length} batch(es) deleted successfully`);
    }
  };

  const handleStatusUpdate = (batchId: string, newStatus: string) => {
    updateBatch(batchId, { status: newStatus });
    toast.success('Batch status updated successfully');
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return ArrowUpDown;
    return sortOrder === 'asc' ? ArrowUp : ArrowDown;
  };

  // Statistics
  const stats = useMemo(() => {
    const total = batches.length;
    const completed = batches.filter(b => b.status === 'COMPLETED').length;
    const inProduction = batches.filter(b => b.status === 'IN_PRODUCTION').length;
    const shipped = batches.filter(b => b.status === 'SHIPPED').length;
    const totalCarbonSaved = batches.reduce((sum, b) => sum + (b.carbonFootprint || 0), 0);
    
    return { total, completed, inProduction, shipped, totalCarbonSaved };
  }, [batches]);

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
                <h1 className="text-xl font-bold text-gray-900">Batch Management</h1>
                <p className="text-xs text-muted-foreground">SSSCP Platform</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/manufacturer/batch-registration">
                <Plus className="w-4 h-4 mr-2" />
                New Batch
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Batch Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage your production batches with advanced tracking capabilities.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Batches</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
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
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
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
                    <p className="text-sm text-muted-foreground">In Production</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.inProduction}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-yellow-600" />
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
                    <p className="text-2xl font-bold text-purple-600">{stats.totalCarbonSaved.toFixed(1)} kg</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search Batches</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by batch number, product name, or code..."
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
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                    <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="RECALLED">Recalled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedBatches.length > 0 && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSelectedBatches([])}>
                    Clear Selection
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedBatches.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Batch Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedBatches.length === filteredAndSortedBatches.length && filteredAndSortedBatches.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort('batchNumber')}
                      >
                        Batch Number
                        {React.createElement(getSortIcon('batchNumber'), { className: "ml-2 h-4 w-4" })}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort('productName')}
                      >
                        Product
                        {React.createElement(getSortIcon('productName'), { className: "ml-2 h-4 w-4" })}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity
                        {React.createElement(getSortIcon('quantity'), { className: "ml-2 h-4 w-4" })}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {React.createElement(getSortIcon('status'), { className: "ml-2 h-4 w-4" })}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort('manufacturedAt')}
                      >
                        Manufactured
                        {React.createElement(getSortIcon('manufacturedAt'), { className: "ml-2 h-4 w-4" })}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort('carbonFootprint')}
                      >
                        Carbon (kg)
                        {React.createElement(getSortIcon('carbonFootprint'), { className: "ml-2 h-4 w-4" })}
                      </Button>
                    </TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No batches found</p>
                        <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedBatches.map((batch) => {
                      const StatusIcon = statusIcons[batch.status];
                      
                      return (
                        <TableRow key={batch.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedBatches.includes(batch.id)}
                              onCheckedChange={() => handleSelectBatch(batch.id)}
                            />
                          </TableCell>
                          
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <QrCode className="w-4 h-4 text-muted-foreground" />
                              <span>{batch.batchNumber}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <p className="font-medium">{batch.productName}</p>
                              {batch.productCode && (
                                <p className="text-sm text-muted-foreground">{batch.productCode}</p>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {batch.quantity} {batch.unit}
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={statusColors[batch.status]} variant="secondary">
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {batch.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(batch.manufacturedAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {batch.carbonFootprint ? (
                              <span className="text-sm font-medium">
                                {batch.carbonFootprint.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/product/${batch.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Batch
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download QR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(batch.id, 'IN_PRODUCTION')}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  In Production
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(batch.id, 'COMPLETED')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(batch.id, 'SHIPPED')}>
                                  <Truck className="mr-2 h-4 w-4" />
                                  Shipped
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this batch?')) {
                                      removeBatch(batch.id);
                                      toast.success('Batch deleted successfully');
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Results Summary */}
        {filteredAndSortedBatches.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredAndSortedBatches.length} of {batches.length} batches
            {selectedBatches.length > 0 && ` • ${selectedBatches.length} selected`}
          </div>
        )}
      </div>
    </div>
  );
} 