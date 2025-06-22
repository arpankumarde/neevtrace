"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  User,
  Calendar,
  CurrencyDollar,
  Clock,
  CheckCircle,
  X,
  Warning,
  File,
  Truck,
  Spinner,
  Star,
  Certificate,
  Shield,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MaterialRequest {
  id: string;
  materialName: string;
  description?: string;
  quantity: number;
  unit?: string;
  budgetRange?: string;
  specifications?: any;
  status: string;
  createdAt: string;
  closingDate: string;
  qualityStandards?: string[];
  certificationReq?: string[];
}

interface SupplierBid {
  id: string;
  materialRequestId: string;
  bidPrice: number;
  deliveryTimeline: number;
  proposedDate: string;
  validUntil: string;
  status: string;
  remarks?: string;
  certifications: string[];
  complianceDocUrls: string[];
  paymentTerms?: string;
  warrantyPeriod?: number;
  createdAt: string;
  updatedAt: string;
  supplier: {
    name: string;
    email: string;
    suppliedProducts?: string[];
    minOrderValue?: number;
    paymentTerms?: string;
    leadTime?: number;
  };
  materialRequest: {
    materialName: string;
    batch: {
      batchNumber: string;
      productName: string;
    };
  };
}

interface GroupedBids {
  materialRequest: MaterialRequest;
  bids: SupplierBid[];
}

interface SupplierBiddingProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchNumber: string;
  manufacturerId: string;
}

const statusColors = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  WITHDRAWN: "bg-gray-50 text-gray-700 border-gray-200",
};

const statusIcons = {
  PENDING: Clock,
  ACCEPTED: CheckCircle,
  REJECTED: X,
  WITHDRAWN: Warning,
};

export default function SupplierBidding({
  isOpen,
  onClose,
  batchId,
  batchNumber,
  manufacturerId,
}: SupplierBiddingProps) {
  const [groupedBids, setGroupedBids] = useState<GroupedBids[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBids();
    }
  }, [isOpen, batchId, manufacturerId]);

  const fetchBids = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/manufacturer/approve-bid?manufacturerId=${manufacturerId}&batchId=${batchId}`
      );
      if (response.ok) {
        const data = await response.json();
        setGroupedBids(data.groupedBids || []);
      } else {
        toast.error("Failed to fetch supplier bids");
      }
    } catch (error) {
      console.error("Error fetching supplier bids:", error);
      toast.error("Failed to fetch supplier bids");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBidAction = async (bidId: string, action: "ACCEPT" | "REJECT") => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/manufacturer/approve-bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bidId,
          manufacturerId,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        await fetchBids(); // Refresh the bids
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to process bid");
      }
    } catch (error) {
      console.error("Error processing bid:", error);
      toast.error("Failed to process bid");
    } finally {
      setIsProcessing(false);
    }
  };

  const BidCard = ({ bid }: { bid: SupplierBid }) => {
    const StatusIcon = statusIcons[bid.status as keyof typeof statusIcons];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <User size={18} className="text-blue-600" weight="duotone" />
              <h4 className="font-semibold text-slate-900">
                {bid.supplier.name}
              </h4>
              <Badge
                className={`${statusColors[bid.status as keyof typeof statusColors]} text-xs`}
                variant="outline"
              >
                <StatusIcon size={12} className="mr-1" />
                {bid.status}
              </Badge>
            </div>
            {bid.supplier.email && (
              <p className="text-sm text-slate-500 mb-3">{bid.supplier.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CurrencyDollar size={16} className="text-green-600" weight="duotone" />
              <span className="text-sm font-medium text-slate-700">Bid Price</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ₹{bid.bidPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-600" weight="duotone" />
              <span className="text-sm font-medium text-slate-700">Timeline</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {bid.deliveryTimeline} days
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} weight="duotone" />
            <span>Proposed: {format(new Date(bid.proposedDate), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} weight="duotone" />
            <span>Valid until: {format(new Date(bid.validUntil), "MMM dd, yyyy")}</span>
          </div>
        </div>

        {bid.certifications.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Certificate size={16} className="text-purple-600" weight="duotone" />
              <span className="text-sm font-medium text-slate-700">Certifications</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {bid.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {bid.remarks && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <File size={16} className="text-slate-600" weight="duotone" />
              <span className="text-sm font-medium text-slate-700">Remarks</span>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              {bid.remarks}
            </p>
          </div>
        )}

        {bid.paymentTerms && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollar size={16} className="text-green-600" weight="duotone" />
              <span className="text-sm font-medium text-slate-700">Payment Terms</span>
            </div>
            <p className="text-sm text-slate-600">{bid.paymentTerms}</p>
          </div>
        )}

        {bid.status === "PENDING" && (
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBidAction(bid.id, "REJECT")}
              disabled={isProcessing}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <X size={14} className="mr-2" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => handleBidAction(bid.id, "ACCEPT")}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Spinner size={14} className="mr-2 animate-spin" />
              ) : (
                <CheckCircle size={14} className="mr-2" />
              )}
              Accept
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package size={24} className="text-blue-600" weight="duotone" />
            <div>
              <span className="text-xl font-bold">Supplier Bids</span>
              <p className="text-sm font-normal text-slate-500">
                Batch: {batchNumber}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Spinner size={32} className="text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600">Loading supplier bids...</p>
              </div>
            </div>
          ) : groupedBids.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="text-slate-300 mx-auto mb-4" weight="duotone" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No supplier bids found
              </h3>
              <p className="text-slate-500">
                No material requests or bids available for this batch.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {groupedBids.map((group, index) => (
                <motion.div
                  key={group.materialRequest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package size={20} className="text-blue-600" weight="duotone" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {group.materialRequest.materialName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {group.materialRequest.quantity} {group.materialRequest.unit}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {group.bids.length} bid{group.bids.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      {group.materialRequest.description && (
                        <p className="text-sm text-slate-600 mt-2">
                          {group.materialRequest.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {group.bids.map((bid) => (
                          <BidCard key={bid.id} bid={bid} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}