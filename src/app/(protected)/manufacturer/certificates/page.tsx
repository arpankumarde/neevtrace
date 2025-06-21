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
  FileText, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  Globe,
  Award,
  Home
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

const certificateTypes = [
  { value: 'ISO_9001', label: 'ISO 9001 - Quality Management' },
  { value: 'ISO_14001', label: 'ISO 14001 - Environmental Management' },
  { value: 'ISO_45001', label: 'ISO 45001 - Occupational Health & Safety' },
  { value: 'BIS', label: 'BIS - Bureau of Indian Standards' },
  { value: 'ROHS', label: 'RoHS - Restriction of Hazardous Substances' },
  { value: 'CE_MARKING', label: 'CE Marking - European Conformity' },
  { value: 'CIIPL', label: 'CIIPL - Confederation of Indian Industry' },
  { value: 'GST_CERTIFICATE', label: 'GST Registration Certificate' },
  { value: 'TRADE_LICENSE', label: 'Trade License' },
  { value: 'INCORPORATION', label: 'Certificate of Incorporation' },
  { value: 'PAN_CARD', label: 'PAN Card' },
  { value: 'ESG_CERTIFICATION', label: 'ESG Compliance Certificate' },
];

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  UNDER_REVIEW: { color: 'bg-blue-100 text-blue-800', icon: FileText },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: X },
  EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
};

// Mock certificate data
const mockCertificates = [
  {
    id: '1',
    type: 'ISO_9001',
    documentName: 'ISO 9001:2015 Quality Management Certificate',
    issueDate: new Date('2023-06-15'),
    expiryDate: new Date('2026-06-14'),
    issuingAuthority: 'Bureau Veritas',
    certificateNumber: 'IN-2023-ISO9001-0158',
    status: 'APPROVED' as const,
    documentUrl: '#',
    uploadedAt: new Date('2023-06-20'),
    lastVerified: new Date('2024-01-15'),
  },
  {
    id: '2', 
    type: 'ISO_14001',
    documentName: 'ISO 14001:2015 Environmental Management Certificate',
    issueDate: new Date('2023-08-10'),
    expiryDate: new Date('2026-08-09'),
    issuingAuthority: 'SGS India Pvt Ltd',
    certificateNumber: 'IN-2023-ISO14001-0245',
    status: 'APPROVED' as const,
    documentUrl: '#',
    uploadedAt: new Date('2023-08-15'),
    lastVerified: new Date('2024-01-15'),
  },
  {
    id: '3',
    type: 'BIS',
    documentName: 'BIS Standard Mark License',
    issueDate: new Date('2023-09-01'),
    expiryDate: new Date('2024-08-31'),
    issuingAuthority: 'Bureau of Indian Standards',
    certificateNumber: 'BIS-2023-STD-1597',
    status: 'EXPIRED' as const,
    documentUrl: '#',
    uploadedAt: new Date('2023-09-05'),
    lastVerified: new Date('2024-01-15'),
  },
  {
    id: '4',
    type: 'ROHS',
    documentName: 'RoHS Compliance Certificate',
    issueDate: new Date('2024-01-15'),
    expiryDate: new Date('2025-01-14'),
    issuingAuthority: 'Intertek India Pvt Ltd',
    certificateNumber: 'ROHS-2024-IN-0089',
    status: 'UNDER_REVIEW' as const,
    documentUrl: '#',
    uploadedAt: new Date('2024-01-20'),
    lastVerified: null,
  },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState(mockCertificates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('certificates');

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = 
        cert.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      const matchesType = typeFilter === 'all' || cert.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [certificates, searchTerm, statusFilter, typeFilter]);

  // Certificate statistics
  const stats = useMemo(() => {
    const total = certificates.length;
    const approved = certificates.filter(c => c.status === 'APPROVED').length;
    const pending = certificates.filter(c => c.status === 'PENDING').length;
    const expired = certificates.filter(c => c.status === 'EXPIRED').length;
    const expiringThisMonth = certificates.filter(c => {
      if (!c.expiryDate) return false;
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return c.expiryDate <= thirtyDaysFromNow && c.expiryDate >= today;
    }).length;
    
    return { total, approved, pending, expired, expiringThisMonth };
  }, [certificates]);

  // File upload handler
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    acceptedFiles.forEach(file => {
      // Simulate upload process
      setTimeout(() => {
        const newCertificate = {
          id: Date.now().toString(),
          type: 'ISO_9001', // Default type, user can change
          documentName: file.name,
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          issuingAuthority: 'To be updated',
          certificateNumber: 'TBU-' + Date.now(),
          status: 'PENDING' as const,
          documentUrl: URL.createObjectURL(file),
          uploadedAt: new Date(),
          lastVerified: null,
        };
        
        setCertificates(prev => [...prev, newCertificate]);
        toast.success(`Certificate ${file.name} uploaded successfully`);
      }, 1000);
    });
    
    setTimeout(() => setIsUploading(false), 1500);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: true,
  });

  const updateCertificateStatus = (id: string, status: string) => {
    setCertificates(prev => 
      prev.map(cert => 
        cert.id === id 
          ? { ...cert, status: status as any, lastVerified: new Date() }
          : cert
      )
    );
    toast.success('Certificate status updated successfully');
  };

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
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Certificates</h1>
                <p className="text-xs text-muted-foreground">SSSCP Platform</p>
              </div>
            </div>
            <Button onClick={() => setSelectedTab('upload')}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Certificate
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Certificate Management</h2>
          <p className="text-muted-foreground">
            Manage your compliance certificates and documentation with automated verification tracking.
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
                    <p className="text-sm text-muted-foreground">Total Certificates</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
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
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
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
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold text-red-600">{stats.expiringThisMonth}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Certificates List */}
          <TabsContent value="certificates" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Certificates</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, number, or authority..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <Label>Type Filter</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {certificateTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label.split(' - ')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Authority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCertificates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No certificates found</p>
                            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCertificates.map((cert) => {
                          const StatusIcon = statusConfig[cert.status].icon;
                          const statusColor = statusConfig[cert.status].color;
                          
                          return (
                            <TableRow key={cert.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{cert.documentName}</p>
                                  <p className="text-sm text-muted-foreground">{cert.certificateNumber}</p>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <Badge variant="outline">
                                  {certificateTypes.find(t => t.value === cert.type)?.label.split(' - ')[0] || cert.type}
                                </Badge>
                              </TableCell>
                              
                              <TableCell>
                                <Badge className={statusColor} variant="secondary">
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {cert.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {format(cert.issueDate, 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {format(cert.expiryDate, 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Building className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{cert.issuingAuthority}</span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
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

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Certificate</CardTitle>
                <CardDescription>
                  Upload compliance certificates in PDF or image format (max 10MB per file).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse and select files
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, PNG, JPG, JPEG (max 10MB each)
                  </p>
                  
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Upload Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Upload Templates</CardTitle>
                <CardDescription>
                  Common certificates for manufacturing businesses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificateTypes.slice(0, 6).map((type) => (
                    <div key={type.value} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Award className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{type.label.split(' - ')[0]}</h4>
                          <p className="text-sm text-muted-foreground">
                            {type.label.split(' - ')[1] || 'Required certificate'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Approved</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{stats.approved}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending Review</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{stats.pending}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expired</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(stats.expired / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{stats.expired}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Renewals</CardTitle>
                  <CardDescription>Certificates expiring in the next 90 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certificates
                      .filter(cert => {
                        const today = new Date();
                        const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
                        return cert.expiryDate <= ninetyDaysFromNow && cert.expiryDate >= today;
                      })
                      .slice(0, 5)
                      .map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{cert.documentName}</p>
                            <p className="text-xs text-muted-foreground">
                              Expires: {format(cert.expiryDate, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {Math.ceil((cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                          </Badge>
                        </div>
                      ))}
                    {certificates.filter(cert => {
                      const today = new Date();
                      const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
                      return cert.expiryDate <= ninetyDaysFromNow && cert.expiryDate >= today;
                    }).length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <p className="text-muted-foreground">No certificates expiring soon</p>
                      </div>
                    )}
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