"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  Calendar,
  CurrencyDollar,
  Shield,
  Sparkle,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Spinner,
  Target,
  Lightning,
  Medal
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import axios from 'axios';

interface LogisticsBid {
  id: string;
  bidPrice: number;
  estimatedTime: number;
  pickupDate: string;
  deliveryDate: string;
  vehicleType: string;
  capacity: string;
  route?: string;
  specialHandling?: string;
  insurance: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  remarks?: string;
  pros?: string;
  cons?: string;
  emission?: string;
  validUntil?: string;
  submittedAt: string;
  logistics: {
    name: string;
    email: string;
    fleetSize?: number;
    serviceAreas?: string[];
    transportTypes?: string[];
  };
}

interface AIRecommendation {
  optimalBidId: string;
  optimalBidReason: string;
  shortestBidId: string;
  shortestBidReason: string;
}

interface LogisticsBiddingProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchNumber: string;
  manufacturerId: string;
  selectedLogisticsBidId?: string;
}

const LogisticsBidding: React.FC<LogisticsBiddingProps> = ({
  isOpen,
  onClose,
  batchId,
  batchNumber,
  manufacturerId,
  selectedLogisticsBidId
}) => {
  const [bids, setBids] = useState<LogisticsBid[]>([]);
  const [selectedBid, setSelectedBid] = useState<LogisticsBid | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState('bids');

  // Load logistics bids
  useEffect(() => {
    if (isOpen && batchId) {
      loadLogisticsBids();
    }
  }, [isOpen, batchId]);

  // Load AI recommendations when bids are loaded
  useEffect(() => {
    if (bids.length > 0) {
      loadAIRecommendations();
    }
  }, [bids]);

  const loadLogisticsBids = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/logistics-bids?batchId=${batchId}`);
      if (response.ok) {
        const data = await response.json();
        setBids(data.bids || []);
      } else {
        throw new Error('Failed to load logistics bids');
      }
    } catch (error) {
      console.error('Error loading logistics bids:', error);
      toast.error('Failed to load logistics bids');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    try {
      // Transform bids to match AI API format
      const bidData = bids.map(bid => ({
        bidId: bid.id,
        route: bid.route || `${bid.vehicleType} transport - ${bid.capacity}`,
        estimatedDistanceKm: Math.floor(Math.random() * 2000) + 500, // Mock data
        estimatedDurationHrs: bid.estimatedTime,
        estimatedCostINR: bid.bidPrice // Changed from USD to INR
      }));

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://neevpy.sandbox.feebook.in/logistic-recommender',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: bidData
      };

      const response = await axios.request(config);
      setAiRecommendations(response.data);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      // Set mock recommendations if API fails
      if (bids.length > 0) {
        setAiRecommendations({
          optimalBidId: bids[0].id,
          optimalBidReason: 'Best cost-efficiency balance',
          shortestBidId: bids[0].id,
          shortestBidReason: 'Shortest delivery time'
        });
      }
    }
  };

  const handleApproveBid = async (bidId: string, action: 'ACCEPT' | 'REJECT') => {
    setIsApproving(true);
    try {
      const response = await fetch('/api/manufacturer/approve-logistics-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidId,
          manufacturerId,
          action
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve bid');
      }

      const data = await response.json();
      toast.success(data.message);
      
      // Reload bids to reflect changes
      await loadLogisticsBids();
      
      if (action === 'ACCEPT') {
        onClose(); // Close modal after successful approval
      }
    } catch (error) {
      console.error('Error approving bid:', error);
      toast.error('Failed to approve bid');
    } finally {
      setIsApproving(false);
    }
  };

  const getBidRecommendationType = (bidId: string): 'optimal' | 'shortest' | null => {
    if (!aiRecommendations) return null;
    if (aiRecommendations.optimalBidId === bidId && aiRecommendations.shortestBidId === bidId) {
      return 'optimal'; // If both, prioritize optimal
    }
    if (aiRecommendations.optimalBidId === bidId) return 'optimal';
    if (aiRecommendations.shortestBidId === bidId) return 'shortest';
    return null;
  };

  const getBidRecommendationReason = (bidId: string): string | null => {
    if (!aiRecommendations) return null;
    const type = getBidRecommendationType(bidId);
    if (type === 'optimal') return aiRecommendations.optimalBidReason;
    if (type === 'shortest') return aiRecommendations.shortestBidReason;
    return null;
  };

  const sortedBids = [...bids].sort((a, b) => {
    // Show accepted bids first, then pending, then rejected
    const statusOrder = { ACCEPTED: 0, PENDING: 1, REJECTED: 2, WITHDRAWN: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const getRecommendedBids = () => {
    if (!aiRecommendations) return [];
    const recommendedBids = [];
    
    const optimalBid = bids.find(bid => bid.id === aiRecommendations.optimalBidId);
    if (optimalBid) {
      recommendedBids.push({
        bid: optimalBid,
        type: 'optimal' as const,
        reason: aiRecommendations.optimalBidReason
      });
    }
    
    const shortestBid = bids.find(bid => bid.id === aiRecommendations.shortestBidId);
    if (shortestBid && shortestBid.id !== aiRecommendations.optimalBidId) {
      recommendedBids.push({
        bid: shortestBid,
        type: 'shortest' as const,
        reason: aiRecommendations.shortestBidReason
      });
    }
    
    return recommendedBids;
  };

  const sortedRecommendations = getRecommendedBids();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl xl:max-w-[90vw] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="pb-4 px-6 pt-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck size={20} className="text-blue-600" weight="duotone" />
            </div>
            Logistics Bidding - {batchNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="bids" className="flex items-center gap-2">
                <Package size={16} weight="duotone" />
                Logistics Bids ({bids.length})
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Sparkle size={16} weight="duotone" />
                AI Recommendations
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="bids" className="h-full mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Spinner size={32} className="text-blue-600 animate-spin mb-4" />
                      <p className="text-slate-600">Loading logistics bids...</p>
                    </div>
                  </div>
                ) : bids.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Truck size={48} className="text-slate-300 mx-auto mb-4" weight="duotone" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No Logistics Bids</h3>
                      <p className="text-slate-500">No logistics providers have submitted bids for this batch yet.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] pr-4">
                    <AnimatePresence>
                      {sortedBids.map((bid, index) => {
                        const recommendationType = getBidRecommendationType(bid.id);
                        const recommendationReason = getBidRecommendationReason(bid.id);
                        const isSelected = selectedBid?.id === bid.id;
                        const isApproved = bid.status === 'ACCEPTED' || selectedLogisticsBidId === bid.id;
                        
                        return (
                          <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedBid(isSelected ? null : bid)}
                            className={`cursor-pointer transition-all duration-300 group ${
                              isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : ''
                            }`}
                            whileHover={{ 
                              y: -4, 
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card className={`h-full transition-all duration-300 group-hover:shadow-xl relative overflow-hidden ${
                              isApproved ? 'border-green-200 bg-green-50/30' : 'border-slate-200 group-hover:border-blue-300'
                            }`}>
                              {/* Hover gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/20 group-hover:to-purple-50/20 transition-all duration-300 pointer-events-none" />
                              
                              <CardHeader className="pb-2 relative z-10">
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-base text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                                      {bid.logistics.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Truck size={12} className="text-slate-400" />
                                      <span className="text-xs text-slate-500">{bid.vehicleType}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {recommendationType && (
                                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-1.5 py-0.5">
                                        <Medal size={10} className="mr-1" />
                                        {recommendationType === 'optimal' ? 'Optimal' : 'Shortest'}
                                      </Badge>
                                    )}
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs px-1.5 py-0.5 ${
                                        bid.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' :
                                        bid.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        'bg-red-50 text-red-700 border-red-200'
                                      }`}
                                    >
                                      {bid.status}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-3 pt-0 relative z-10">
                                {/* Price and Duration */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-slate-100 group-hover:bg-white/90 transition-all">
                                    <div className="p-1 bg-green-100 rounded group-hover:bg-green-200 transition-colors">
                                      <CurrencyDollar size={12} className="text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">Cost</p>
                                      <p className="font-bold text-slate-900">₹{bid.bidPrice.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-slate-100 group-hover:bg-white/90 transition-all">
                                    <div className="p-1 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                                      <Clock size={12} className="text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">Duration</p>
                                      <p className="font-bold text-slate-900">{bid.estimatedTime}h</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Capacity */}
                                <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-slate-100 group-hover:bg-white/90 transition-all">
                                  <div className="p-1 bg-orange-100 rounded group-hover:bg-orange-200 transition-colors">
                                    <Package size={12} className="text-orange-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-slate-500">Capacity</p>
                                    <p className="font-medium text-slate-900">{bid.capacity}</p>
                                  </div>
                                </div>

                                {/* Pickup and Delivery */}
                                <div className="relative p-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 group-hover:from-blue-50 group-hover:to-purple-50 transition-all">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex flex-col items-center">
                                      <div className="p-1.5 bg-blue-100 rounded-full mb-1 group-hover:bg-blue-200 transition-colors">
                                        <MapPin size={10} className="text-blue-600" />
                                      </div>
                                      <span className="text-slate-600 font-medium">Pickup</span>
                                      <span className="text-slate-500">{format(new Date(bid.pickupDate), 'MMM dd')}</span>
                                    </div>
                                    
                                    <div className="flex-1 mx-3 flex items-center justify-center">
                                      <div className="h-0.5 bg-slate-300 rounded-full flex-1"></div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center">
                                      <div className="p-1.5 bg-green-100 rounded-full mb-1 group-hover:bg-green-200 transition-colors">
                                        <MapPin size={10} className="text-green-600" />
                                      </div>
                                      <span className="text-slate-600 font-medium">Delivery</span>
                                      <span className="text-slate-500">{format(new Date(bid.deliveryDate), 'MMM dd')}</span>
                                    </div>
                                  </div>
                                </div>

                                {bid.specialHandling && (
                                  <motion.div 
                                    className="p-2 bg-blue-50 rounded-lg border border-blue-100"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <p className="text-xs text-blue-700 flex items-center gap-1">
                                      <Shield size={10} />
                                      {bid.specialHandling}
                                    </p>
                                  </motion.div>
                                )}

                                {recommendationReason && (
                                  <motion.div 
                                    className="p-2 bg-purple-50 rounded-lg border border-purple-100"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <p className="text-xs text-purple-700 flex items-center gap-1">
                                      <Sparkle size={10} />
                                      <span className="font-medium">AI:</span> {recommendationReason}
                                    </p>
                                  </motion.div>
                                )}

                                {/* Pros and Cons */}
                                <AnimatePresence>
                                  {isSelected && (bid.pros || bid.cons) && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-1.5 pt-2 border-t border-slate-200"
                                    >
                                      {bid.pros && (
                                        <motion.div 
                                          className="flex items-start gap-2 p-1.5 bg-green-50 rounded"
                                          initial={{ x: -10, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: 0.1 }}
                                        >
                                          <ThumbsUp size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                                          <p className="text-xs text-slate-700">{bid.pros}</p>
                                        </motion.div>
                                      )}
                                      {bid.cons && (
                                        <motion.div 
                                          className="flex items-start gap-2 p-1.5 bg-red-50 rounded"
                                          initial={{ x: -10, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: 0.2 }}
                                        >
                                          <ThumbsDown size={12} className="text-red-600 mt-0.5 flex-shrink-0" />
                                          <p className="text-xs text-slate-700">{bid.cons}</p>
                                        </motion.div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Action Buttons */}
                                {bid.status === 'PENDING' && !selectedLogisticsBidId && (
                                  <motion.div 
                                    className="flex gap-2 pt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                  >
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApproveBid(bid.id, 'ACCEPT');
                                      }}
                                      disabled={isApproving}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-8 hover:scale-105 transition-transform"
                                    >
                                      {isApproving ? (
                                        <Spinner size={12} className="animate-spin" />
                                      ) : (
                                        <CheckCircle size={12} />
                                      )}
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApproveBid(bid.id, 'REJECT');
                                      }}
                                      disabled={isApproving}
                                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-8 hover:scale-105 transition-transform"
                                    >
                                      Reject
                                    </Button>
                                  </motion.div>
                                )}

                                {isApproved && (
                                  <motion.div 
                                    className="flex items-center justify-center gap-2 py-2 bg-green-100 rounded-lg"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                  >
                                    <CheckCircle size={14} className="text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Approved</span>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="h-full mt-0">
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Lightning size={20} className="text-purple-600" weight="duotone" />
                    <h3 className="text-lg font-semibold">AI Recommendations</h3>
                  </div>

                  {sortedRecommendations.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkle size={48} className="text-slate-300 mx-auto mb-4" weight="duotone" />
                      <p className="text-slate-500">AI recommendations will appear here once bids are loaded.</p>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${
                      sortedRecommendations.length === 1 
                        ? 'grid-cols-1 max-w-2xl mx-auto px-8' 
                        : 'grid-cols-1 lg:grid-cols-2'
                    }`}>
                      {sortedRecommendations.map((rec, index) => {
                        const isOptimal = rec.type === 'optimal';
                        const badge = isOptimal ? 'Optimal Choice' : 'Shortest Route';
                        const badgeColor = isOptimal ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-200';
                        const cardBorder = isOptimal ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50/30';

                        return (
                          <motion.div
                            key={rec.bid.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className={`p-4 ${cardBorder}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-slate-900">{rec.bid.logistics.name}</h4>
                                  <p className="text-sm text-slate-600">{rec.bid.vehicleType} - {rec.bid.capacity}</p>
                                </div>
                                <Badge className={badgeColor}>
                                  {isOptimal ? <Target size={12} className="mr-1" /> : <Lightning size={12} className="mr-1" />}
                                  {badge}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-slate-500">Cost</span>
                                  <p className="font-semibold">₹{rec.bid.bidPrice.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Duration</span>
                                  <p className="font-semibold">{rec.bid.estimatedTime}h</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Status</span>
                                  <p className={`font-semibold ${
                                    rec.bid.status === 'ACCEPTED' ? 'text-green-600' :
                                    rec.bid.status === 'PENDING' ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>
                                    {rec.bid.status}
                                  </p>
                                </div>
                              </div>

                              <div className="p-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-700 flex items-start gap-2">
                                  <Sparkle size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                                  <span><strong>AI Analysis:</strong> {rec.reason}</span>
                                </p>
                              </div>

                              <div className="flex gap-2 mt-3">
                                <div className="text-xs text-slate-500">
                                  Pickup: {format(new Date(rec.bid.pickupDate), 'MMM dd, yyyy')}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Delivery: {format(new Date(rec.bid.deliveryDate), 'MMM dd, yyyy')}
                                </div>
                              </div>

                              {rec.bid.status === 'PENDING' && !selectedLogisticsBidId && (
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveBid(rec.bid.id, 'ACCEPT')}
                                    disabled={isApproving}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    {isApproving ? (
                                      <Spinner size={14} className="animate-spin" />
                                    ) : (
                                      <CheckCircle size={14} />
                                    )}
                                    Approve Recommended Bid
                                  </Button>
                                </div>
                              )}
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogisticsBidding;