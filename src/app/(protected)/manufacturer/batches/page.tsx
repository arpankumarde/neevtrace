"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  Plus,
  ArrowsClockwise,
  CalendarBlank,
  Clock,
  CheckCircle,
  Warning,
  X,
  CaretDown,
  CaretRight,
  File,
  Truck,
  Gear,
  DownloadSimple,
  QrCode,
  Leaf,
  ThermometerSimple,
  MapPin,
  Circle,
  Scales,
  Medal,
  Plant,
  Spinner,
  FloppyDisk,
  Sparkle,
  Lightning,
  Target
} from '@phosphor-icons/react';
import { useAppStore, type Batch, type BatchStatus } from '@/lib/store';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusColors: Record<BatchStatus, string> = {
  CREATED: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-blue-100/50',
  IN_PRODUCTION: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-amber-100/50',
  QUALITY_CHECK: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 shadow-purple-100/50',
  COMPLETED: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-100/50',
  SHIPPED: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-100/50',
  DELIVERED: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-green-100/50',
  RECALLED: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-red-100/50',
};

const statusIcons: Record<BatchStatus, React.ComponentType<any>> = {
  CREATED: Clock,
  IN_PRODUCTION: ArrowsClockwise,
  QUALITY_CHECK: Warning,
  COMPLETED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  RECALLED: X,
};

interface BatchCardProps {
  batch: Batch;
  onStatusUpdate: (id: string, status: BatchStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, onStatusUpdate, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cardX = useSpring(0, springConfig);
  const cardY = useSpring(0, springConfig);
  
  const StatusIcon = statusIcons[batch.status];

  const getStatusProgress = (status: BatchStatus) => {
    const statusOrder = ['CREATED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'COMPLETED', 'SHIPPED', 'DELIVERED'];
    return ((statusOrder.indexOf(status) + 1) / statusOrder.length) * 100;
  };

  const handleStatusChange = (newStatus: BatchStatus) => {
    onStatusUpdate(batch.id, newStatus);
    setShowStatusMenu(false);
    toast.success(`Batch status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this batch?')) {
      onDelete(batch.id);
      toast.success('Batch deleted successfully');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    
    cardX.set((e.clientX - centerX) / 25);
    cardY.set((e.clientY - centerY) / 25);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    cardX.set(0);
    cardY.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      style={{ 
        rotateX: cardY, 
        rotateY: cardX,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="group relative overflow-hidden border-0 shadow-md bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:bg-white">
        {/* Lighter Cursor-Tracking Gradient */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.02), transparent 50%)`
          }}
        />
        
        {/* Subtle Static Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        <CardHeader className="relative pb-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/15 to-purple-500/15 blur-md rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <QrCode size={20} className="relative text-slate-600" weight="duotone" />
                </div>
                <span className="font-mono text-sm font-semibold text-slate-800">{batch.batchNumber}</span>
              </div>
              
              <h3 className="font-bold text-lg leading-tight text-slate-900 group-hover:text-blue-900 transition-colors duration-200">{batch.productName}</h3>
              
              {batch.productCode && (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Target size={14} className="text-slate-400" weight="duotone" />
                  {batch.productCode}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`${statusColors[batch.status]} text-xs font-semibold shadow-sm`} variant="outline">
                <StatusIcon size={14} className="mr-2" weight="duotone" />
                {batch.status.replace('_', ' ')}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CaretDown size={16} weight="bold" />
                </motion.div>
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <Progress 
                value={getStatusProgress(batch.status)} 
                className="h-2 bg-slate-100 rounded-full overflow-hidden" 
              />
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getStatusProgress(batch.status)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Lightning size={12} className="text-blue-500" weight="duotone" />
                Progress
              </span>
              <span className="font-semibold">
                {Math.round(getStatusProgress(batch.status))}%
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-0 space-y-6">
          {/* Optimized Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Scales, value: batch.quantity, unit: batch.unit, color: 'blue' },
              { icon: Medal, value: batch.qualityGrade || 'N/A', unit: 'Grade', color: 'amber' },
              { icon: Plant, value: batch.carbonFootprint?.toFixed(1) || '0', unit: 'CO₂ kg', color: 'green' }
            ].map((metric, index) => (
              <motion.div 
                key={index}
                className={`text-center p-4 bg-gradient-to-br from-${metric.color}-50/50 to-${metric.color}-100/50 rounded-xl border border-${metric.color}-200/30 hover:shadow-md transition-all duration-200 group/metric`}
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-${metric.color}-400/10 blur-md rounded-full scale-125`} />
                    <metric.icon size={18} className={`relative text-${metric.color}-600`} weight="duotone" />
                  </div>
                  <div className={`text-xl font-bold text-slate-900 group-hover/metric:text-${metric.color}-900 transition-colors duration-200`}>{metric.value}</div>
                </div>
                <div className="text-xs text-slate-500 font-medium">{metric.unit}</div>
              </motion.div>
            ))}
          </div>

          {/* Optimized Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex-1 text-xs border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <Gear size={14} className="mr-2" weight="duotone" />
              Status
            </Button>
            
            {[
              { icon: PencilSimple, action: () => onEdit(batch.id), color: 'blue' },
              { icon: DownloadSimple, action: () => {}, color: 'green' },
              { icon: Trash, action: handleDelete, color: 'red' }
            ].map((btn, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={btn.action}
                  className={`border-slate-200 hover:border-${btn.color}-300 hover:bg-${btn.color}-50 hover:text-${btn.color}-600 transition-all duration-200`}
                >
                  <btn.icon size={14} weight="duotone" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Optimized Status Menu */}
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
                  {Object.keys(statusColors).map((status, index) => {
                    const StatusIcon = statusIcons[status as BatchStatus];
                    return (
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02, duration: 0.15 }}
                      >
                        <Button
                          variant={batch.status === status ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleStatusChange(status as BatchStatus)}
                          className="w-full justify-start text-xs h-10 transition-all duration-200"
                        >
                          <StatusIcon size={14} className="mr-2" weight="duotone" />
                          {status.replace('_', ' ')}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optimized Expandable Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Separator className="mb-6 bg-slate-200" />
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 h-10 bg-slate-100/50 rounded-xl p-1">
                    {[
                      { value: "details", label: "Details", icon: File },
                      { value: "docs", label: "Documents", icon: File },
                      { value: "tracking", label: "Tracking", icon: MapPin }
                    ].map((tab) => (
                      <TabsTrigger 
                        key={tab.value}
                        value={tab.value} 
                        className="text-xs h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2"
                      >
                        <tab.icon size={12} weight="duotone" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="details" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      {[
                        { 
                          icon: CalendarBlank, 
                          label: 'Manufactured', 
                          value: format(new Date(batch.manufacturedAt), 'MMM dd, yyyy'),
                          color: 'blue'
                        },
                        batch.expiryDate && { 
                          icon: CalendarBlank, 
                          label: 'Expires', 
                          value: format(new Date(batch.expiryDate), 'MMM dd, yyyy'),
                          color: 'amber'
                        },
                        batch.storageTemp && { 
                          icon: ThermometerSimple, 
                          label: 'Storage', 
                          value: batch.storageTemp,
                          color: 'green'
                        }
                      ].filter(Boolean).map((item, index) => (
                        <div 
                          key={index}
                          className="space-y-2 p-3 bg-white/70 rounded-lg border border-slate-100 hover:shadow-sm transition-all duration-200"
                        >
                          <span className="text-slate-500 text-xs flex items-center gap-2 font-medium">
                            <item.icon size={14} className={`text-${item.color}-500`} weight="duotone" />
                            {item.label}
                          </span>
                          <p className="font-semibold text-slate-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    
                    {batch.destinationAddress && (
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                        whileHover={{ scale: 1.01 }}
                      >
                        <span className="text-slate-500 text-xs flex items-center gap-2 mb-2 font-medium">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full scale-150" />
                            <MapPin size={14} className="relative text-blue-600" weight="duotone" />
                          </div>
                          Destination
                        </span>
                        <p className="font-semibold text-slate-900 text-sm">{batch.destinationAddress}</p>
                      </motion.div>
                    )}
                    
                    {/* Enhanced Description and Notes */}
                    {[
                      { key: 'description', label: 'Description', content: batch.description },
                      { key: 'handlingNotes', label: 'Handling Notes', content: batch.handlingNotes }
                    ].filter(item => item.content).map((item, index) => (
                      <motion.div 
                        key={item.key}
                        className="space-y-2 p-4 bg-white/70 rounded-xl border border-slate-100 hover:shadow-sm transition-all duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-slate-500 text-xs font-medium flex items-center gap-2">
                          <Sparkle size={12} className="text-slate-400" weight="duotone" />
                          {item.label}
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>
                      </motion.div>
                    ))}
                  </TabsContent>

                  {/* Enhanced other tabs content... */}
                  {/* ...existing code for docs and tracking tabs... */}
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function BatchManagementPage() {
  const { batches, removeBatch, updateBatch, setBatches } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load batches from database on component mount
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await fetch('/api/batch');
        if (response.ok) {
          const data = await response.json();
          // Transform database batches to match frontend format
          const transformedBatches = data.batches.map((batch: any) => ({
            ...batch,
            manufacturedAt: new Date(batch.manufacturedAt),
            expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : undefined,
            complianceDocuments: batch.complianceDocuments || [],
          }));
          setBatches(transformedBatches);
        }
      } catch (error) {
        console.error('Error loading batches:', error);
        toast.error('Failed to load batches');
      } finally {
        setIsLoading(false);
      }
    };

    loadBatches();
  }, [setBatches]);

  // Filter and sort batches
  const filteredAndSortedBatches = useMemo(() => {
    let filtered = batches.filter((batch: Batch) => {
      const matchesSearch = 
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.productCode && batch.productCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort batches
    filtered.sort((a: Batch, b: Batch) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.manufacturedAt).getTime() - new Date(a.manufacturedAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'name':
          return a.productName.localeCompare(b.productName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [batches, searchTerm, statusFilter, sortBy]);

  // Database integration functions
  const handleStatusUpdate = async (batchId: string, newStatus: BatchStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/batch/${batchId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update batch status');
      }

      // Update local store
      updateBatch(batchId, { status: newStatus });
      toast.success(`Batch status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast.error('Failed to update batch status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/batch/${batchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete batch');
      }

      // Remove from local store
      removeBatch(batchId);
      toast.success('Batch deleted successfully');
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setEditingBatch(batch);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = async (updatedBatch: Partial<Batch>) => {
    if (!editingBatch) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/batch/${editingBatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBatch),
      });

      if (!response.ok) {
        throw new Error('Failed to update batch');
      }

      // Update local store
      updateBatch(editingBatch.id, updatedBatch);
      setIsEditModalOpen(false);
      setEditingBatch(null);
      toast.success('Batch updated successfully');
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Failed to update batch');
    } finally {
      setIsUpdating(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = batches.length;
    const completed = batches.filter((b: Batch) => b.status === 'COMPLETED').length;
    const inProduction = batches.filter((b: Batch) => b.status === 'IN_PRODUCTION').length;
    const shipped = batches.filter((b: Batch) => b.status === 'SHIPPED').length;
    const totalCarbonFootprint = batches.reduce((sum: number, b: Batch) => sum + (b.carbonFootprint || 0), 0);
    
    return { total, completed, inProduction, shipped, totalCarbonFootprint };
  }, [batches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Spinner size={32} className="text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 relative">
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-96 h-96 bg-gradient-to-tr from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Optimized Header */}
        <motion.div 
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Batch Management
            </h1>
            <p className="text-slate-600 text-lg flex items-center gap-2">
              <Sparkle size={16} className="text-blue-500" weight="duotone" />
              Manage your production batches efficiently
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <Link href="/manufacturer/batch-registration">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                <Plus size={18} className="mr-2" weight="bold" />
                New Batch
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Optimized Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {[
            { icon: Package, label: 'Total', value: stats.total, color: 'blue' },
            { icon: CheckCircle, label: 'Completed', value: stats.completed, color: 'emerald' },
            { icon: ArrowsClockwise, label: 'In Production', value: stats.inProduction, color: 'amber' },
            { icon: Truck, label: 'Shipped', value: stats.shipped, color: 'indigo' },
            { icon: Leaf, label: 'CO₂ kg', value: stats.totalCarbonFootprint.toFixed(1), color: 'green' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <Card className="p-6 border-0 shadow-md bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br from-${stat.color}-100/70 to-${stat.color}-200/70 rounded-2xl group-hover:scale-105 transition-transform duration-200`}>
                    <stat.icon size={24} className={`text-${stat.color}-600`} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Optimized Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-8 mb-12 border-0 shadow-md bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="relative group">
                  <MagnifyingGlass size={18} className="absolute left-4 top-3.5 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" weight="duotone" />
                  <Input
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl bg-white/70 transition-all duration-200"
                  />
                </div>
              </div>
              
              {[
                { value: statusFilter, onChange: setStatusFilter, placeholder: "Filter by status", options: [
                  { value: "all", label: "All Statuses" },
                  { value: "CREATED", label: "Created" },
                  { value: "IN_PRODUCTION", label: "In Production" },
                  { value: "QUALITY_CHECK", label: "Quality Check" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "SHIPPED", label: "Shipped" },
                  { value: "DELIVERED", label: "Delivered" }
                ]},
                { value: sortBy, onChange: setSortBy, placeholder: "Sort by", options: [
                  { value: "date", label: "Sort by Date" },
                  { value: "status", label: "Sort by Status" },
                  { value: "name", label: "Sort by Name" }
                ]}
              ].map((select, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                >
                  <Select value={select.value} onValueChange={select.onChange}>
                    <SelectTrigger className="w-full md:w-56 border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                      <SelectValue placeholder={select.placeholder} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 shadow-2xl bg-white/95 backdrop-blur-xl rounded-xl">
                      {select.options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-blue-50 transition-colors duration-200">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Optimized Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedBatches.length === 0 ? (
              <motion.div 
                className="col-span-full flex flex-col items-center justify-center py-24 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative mb-6">
                  <div className="p-6 bg-slate-100 rounded-full">
                    <Package size={48} className="text-slate-400" weight="duotone" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No batches found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              filteredAndSortedBatches.map((batch, index) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Results Summary */}
        {filteredAndSortedBatches.length > 0 && (
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200">
              <Target size={14} className="text-blue-500" weight="duotone" />
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold text-blue-600">{filteredAndSortedBatches.length}</span> of <span className="font-bold">{batches.length}</span> batches
              </p>
            </div>
          </motion.div>
        )}

        {/* Edit Batch Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl p-6 mx-auto rounded-lg shadow-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Edit Batch - {editingBatch?.batchNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName" className="text-sm font-medium text-slate-700">Product Name</Label>
                  <Input
                    id="productName"
                    value={editingBatch?.productName}
                    onChange={(e) => setEditingBatch({ ...editingBatch, productName: e.target.value })}
                    className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="batchNumber" className="text-sm font-medium text-slate-700">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={editingBatch?.batchNumber}
                    onChange={(e) => setEditingBatch({ ...editingBatch, batchNumber: e.target.value })}
                    className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="productCode" className="text-sm font-medium text-slate-700">Product Code</Label>
                  <Input
                    id="productCode"
                    value={editingBatch?.productCode}
                    onChange={(e) => setEditingBatch({ ...editingBatch, productCode: e.target.value })}
                    className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editingBatch?.quantity}
                    onChange={(e) => setEditingBatch({ ...editingBatch, quantity: Number(e.target.value) })}
                    className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-sm font-medium text-slate-700">Unit</Label>
                  <Input
                    id="unit"
                    value={editingBatch?.unit}
                    onChange={(e) => setEditingBatch({ ...editingBatch, unit: e.target.value })}
                    className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">Status</Label>
                  <Select
                    id="status"
                    value={editingBatch?.status}
                    onValueChange={(value) => setEditingBatch({ ...editingBatch, status: value as BatchStatus })}
                    className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREATED">Created</SelectItem>
                      <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                      <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  value={editingBatch?.description}
                  onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })}
                  className="mt-1 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditSave(editingBatch!)}
                  className="bg-blue-600 hover:bg-blue-700 text-sm"
                  disabled={isUpdating}
                >
                  {isUpdating && <Spinner size={16} className="mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}