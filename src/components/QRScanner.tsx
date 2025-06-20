'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, QrCode, Package, MapPin, Calendar, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { scanQRCode, getBatchInfo, getCurrentLocation, getTransitHistory, initializeWeb3, getCurrentAccount } from '@/lib/web3';

interface BatchInfo {
  id: string;
  productType: string;
  quantity: string;
  manufacturer: string;
  origin: string;
  createdAt: Date;
  status: number;
  qrCode: string;
  metadataURI: string;
}

interface LocationInfo {
  nodeId: string;
  nodeName: string;
  location: string;
}

interface TransitRecord {
  nodeId: string;
  batchId: string;
  timestamp: Date;
  scanner: string;
  notes: string;
  isEntryPoint: boolean;
  isExitPoint: boolean;
  verificationHash: string;
}

const statusLabels = ['Created', 'In Transit', 'Delivered', 'Completed'];
const statusColors = ['gray', 'blue', 'orange', 'green'];

export const QRScanner: React.FC = () => {
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [transitHistory, setTransitHistory] = useState<TransitRecord[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [web3Connected, setWeb3Connected] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      const connected = await initializeWeb3();
      setWeb3Connected(connected);
      if (connected) {
        const currentAccount = await getCurrentAccount();
        setAccount(currentAccount);
      }
    };
    initializeConnection();
  }, []);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    if (!web3Connected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsScanning(true);
    setError(null);
    setBatchInfo(null);
    setCurrentLocation(null);
    setTransitHistory([]);

    try {
      // Scan QR code to get batch ID
      const scanResult = await scanQRCode(qrCode.trim());
      if (!scanResult.success) {
        throw new Error(scanResult.error || 'Failed to scan QR code');
      }

      const batchId = scanResult.batchId;

      // Get batch information
      const batchResult = await getBatchInfo(batchId);
      if (!batchResult.success) {
        throw new Error(batchResult.error || 'Failed to get batch information');
      }

      if (batchResult.batch) {
        setBatchInfo(batchResult.batch);
      }

      // Get current location
      const locationResult = await getCurrentLocation(batchId);
      if (locationResult.success && locationResult.location) {
        setCurrentLocation(locationResult.location);
      }

      // Get transit history
      const historyResult = await getTransitHistory(batchId);
      if (historyResult.success) {
        setTransitHistory(historyResult.history);
      }

    } catch (error: any) {
      setError(error.message || 'An error occurred while scanning');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectWallet = async () => {
    const connected = await initializeWeb3();
    setWeb3Connected(connected);
    if (connected) {
      const currentAccount = await getCurrentAccount();
      setAccount(currentAccount);
    } else {
      setError('Failed to connect wallet. Please install MetaMask.');
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            NeevTrace QR Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!web3Connected ? (
            <div className="text-center">
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your wallet to scan QR codes and track batches.
                </AlertDescription>
              </Alert>
              <Button onClick={handleConnectWallet}>
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Connected: {account ? formatAddress(account) : 'Unknown'}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter QR code (e.g., NEEV-1-123456789-1672531200)"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />
                <Button onClick={handleScan} disabled={isScanning}>
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Scan'
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {batchInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              Batch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Batch ID</label>
                <p className="text-lg font-mono">{batchInfo.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Product Type</label>
                <p className="text-lg">{batchInfo.productType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quantity</label>
                <p className="text-lg">{batchInfo.quantity} units</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant={statusColors[batchInfo.status] as any}>
                  {statusLabels[batchInfo.status]}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                <p className="text-lg font-mono">{formatAddress(batchInfo.manufacturer)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Origin</label>
                <p className="text-lg">{batchInfo.origin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-lg">{batchInfo.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">QR Code</label>
                <p className="text-sm font-mono text-gray-600">{batchInfo.qrCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentLocation && currentLocation.nodeId !== '0' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Node</label>
                <p className="text-lg">{currentLocation.nodeName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-lg">{currentLocation.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Node ID</label>
                <p className="text-sm font-mono text-gray-600">{currentLocation.nodeId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {transitHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Transit History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transitHistory.map((record, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={record.isEntryPoint ? 'default' : 'secondary'}>
                        {record.isEntryPoint ? 'Entry' : 'Exit'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Node {record.nodeId}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {record.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm"><strong>Notes:</strong> {record.notes}</p>
                    <p className="text-sm"><strong>Scanner:</strong> {formatAddress(record.scanner)}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      <strong>Verification Hash:</strong> {record.verificationHash}
                    </p>
                  </div>
                  
                  {index < transitHistory.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {batchInfo && transitHistory.length === 0 && (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            This batch has been created but has not entered the supply chain yet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 