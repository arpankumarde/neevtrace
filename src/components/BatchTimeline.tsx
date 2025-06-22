"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  CheckCircle,
  Circle,
  Truck,
  Route,
  Package,
  Calendar,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

interface Waypoint {
  id: string;
  sequence: number;
  address: string;
  modeOfTransport?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  status: "PENDING" | "IN_TRANSIT" | "ARRIVED" | "DEPARTED" | "COMPLETED";
}

interface BatchTimelineProps {
  isOpen?: boolean;
  onClose?: () => void;
  batchId?: string;
  batchNumber?: string;
}

const statusConfig = {
  PENDING: { 
    color: "#9CA3AF", 
    bgColor: "rgb(156, 163, 175)", 
    icon: Circle,
    className: "vertical-timeline-element--pending"
  },
  IN_TRANSIT: { 
    color: "#3B82F6", 
    bgColor: "rgb(59, 130, 246)", 
    icon: Truck,
    className: "vertical-timeline-element--in-transit"
  },
  ARRIVED: { 
    color: "#F59E0B", 
    bgColor: "rgb(245, 158, 11)", 
    icon: MapPin,
    className: "vertical-timeline-element--arrived"
  },
  DEPARTED: { 
    color: "#8B5CF6", 
    bgColor: "rgb(139, 92, 246)", 
    icon: Route,
    className: "vertical-timeline-element--departed"
  },
  COMPLETED: { 
    color: "#10B981", 
    bgColor: "rgb(16, 185, 129)", 
    icon: CheckCircle,
    className: "vertical-timeline-element--completed"
  },
};

const BatchTimeline: React.FC<BatchTimelineProps> = ({
  isOpen,
  onClose,
  batchId,
  batchNumber,
}) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && batchId) {
      fetchWaypoints();
    }
  }, [isOpen, batchId]);

  const fetchWaypoints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/batch/${batchId}/waypoints`);
      if (response.ok) {
        const data = await response.json();
        // Sort waypoints by sequence
        const sortedWaypoints = (data.waypoints || []).sort(
          (a: Waypoint, b: Waypoint) => a.sequence - b.sequence
        );
        setWaypoints(sortedWaypoints);
      } else {
        toast.error("Failed to load timeline data");
      }
    } catch (error) {
      console.error("Error fetching waypoints:", error);
      toast.error("Failed to load timeline data");
    } finally {
      setLoading(false);
    }
  };

  const getDateString = (waypoint: Waypoint) => {
    if (waypoint.actualArrival) {
      return format(new Date(waypoint.actualArrival), "MMM dd, yyyy HH:mm");
    }
    if (waypoint.estimatedArrival) {
      return `Est: ${format(new Date(waypoint.estimatedArrival), "MMM dd, yyyy HH:mm")}`;
    }
    return "Pending";
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-600">Loading timeline...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isOpen !== undefined && onClose) {
    // Modal version
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto" style={{ maxWidth: '95vw', width: '95vw' }}>
          <DialogHeader>
            <DialogTitle>
              Batch Timeline - {batchNumber || batchId}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            {waypoints.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Timeline Data
                </h3>
                <p className="text-gray-500">
                  Timeline information will appear here once the shipment starts.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Custom CSS to ensure timeline visibility */}
                <style jsx global>{`
                  .vertical-timeline::before {
                    background: #e5e7eb !important;
                    width: 6px !important;
                  }
                  .vertical-timeline-element-content {
                    max-width: none !important;
                    width: calc(50% - 40px) !important;
                  }
                  .vertical-timeline-element-content-arrow {
                    border-right-color: inherit !important;
                  }
                  @media only screen and (max-width: 1169px) {
                    .vertical-timeline-element-content {
                      width: calc(100% - 80px) !important;
                      margin-left: 80px !important;
                    }
                  }
                `}</style>
                
                <VerticalTimeline lineColor="#e5e7eb">
                  {waypoints.map((waypoint, index) => {
                    const config = statusConfig[waypoint.status];

                    return (
                      <VerticalTimelineElement
                        key={waypoint.id}
                        className={config.className}
                        contentStyle={{
                          background: 'white',
                          color: '#1F2937',
                          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          border: `3px solid ${config.color}`,
                          borderRadius: '16px',
                          padding: '20px',
                          minHeight: '120px',
                          width: 'auto',
                          maxWidth: 'none'
                        }}
                        contentArrowStyle={{
                          borderRight: `7px solid ${config.color}`,
                          borderTop: `7px solid transparent`,
                          borderBottom: `7px solid transparent`
                        }}
                        date={
                          <Badge
                            style={{
                              backgroundColor: config.color,
                              color: 'white',
                              fontSize: '11px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                            }}
                          >
                            {getDateString(waypoint)}
                          </Badge>
                        }
                        dateClassName="flex justify-center"
                        iconStyle={{
                          background: config.bgColor,
                          color: '#fff',
                          boxShadow: `0 0 0 4px ${config.color}20, 0 2px 8px rgba(0, 0, 0, 0.1)`,
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          left: '50%',
                          marginLeft: '-16px'
                        }}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="vertical-timeline-element-title font-bold text-xl text-gray-900 mb-2">
                                Stop {waypoint.sequence}
                              </h3>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <h4 className="vertical-timeline-element-subtitle text-gray-700 font-medium text-base leading-relaxed break-words">
                                  {waypoint.address}
                                </h4>
                              </div>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: `${config.color}15`,
                                color: config.color,
                                border: `2px solid ${config.color}40`,
                                fontSize: '12px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontWeight: '600'
                              }}
                              className="flex-shrink-0"
                            >
                              {waypoint.status.replace("_", " ")}
                            </Badge>
                          </div>

                          {/* Transport Mode */}
                          {waypoint.modeOfTransport && (
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <span className="font-semibold">Transport:</span>
                              <span className="font-medium">{waypoint.modeOfTransport}</span>
                            </div>
                          )}

                          {/* Timing Information */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {waypoint.estimatedArrival && (
                              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm text-blue-700 font-semibold block mb-1">
                                    Estimated Arrival
                                  </span>
                                  <span className="text-gray-800 font-medium text-sm break-words">
                                    {format(
                                      new Date(waypoint.estimatedArrival),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {waypoint.actualArrival && (
                              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm text-green-700 font-semibold block mb-1">
                                    Actual Arrival
                                  </span>
                                  <span className="text-gray-800 font-medium text-sm break-words">
                                    {format(
                                      new Date(waypoint.actualArrival),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </VerticalTimelineElement>
                    );
                  })}

                  {/* End icon */}
                  <VerticalTimelineElement
                    iconStyle={{ 
                      background: 'rgb(16, 204, 82)', 
                      color: '#fff',
                      boxShadow: '0 0 0 4px rgba(16, 204, 82, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
                      width: '32px',
                      height: '32px',
                      left: '50%',
                      marginLeft: '-16px'
                    }}
                  />
                </VerticalTimeline>

                {/* Journey Summary */}
                {waypoints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: waypoints.length * 0.1 + 0.2 }}
                    className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg"
                  >
                    <h4 className="font-bold text-blue-900 mb-6 flex items-center gap-3 text-xl">
                      <Route className="w-6 h-6" />
                      Journey Summary
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-xl shadow-md border border-blue-100">
                        <span className="text-blue-600 font-bold text-3xl block mb-2">
                          {waypoints.length}
                        </span>
                        <span className="text-gray-600 text-sm font-medium">Total Stops</span>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-md border border-green-100">
                        <span className="text-green-600 font-bold text-3xl block mb-2">
                          {waypoints.filter((w) => w.status === "COMPLETED").length}
                        </span>
                        <span className="text-gray-600 text-sm font-medium">Completed</span>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-md border border-orange-100">
                        <span className="text-orange-600 font-bold text-3xl block mb-2">
                          {waypoints.filter((w) => w.status === "IN_TRANSIT" || w.status === "ARRIVED" || w.status === "DEPARTED").length}
                        </span>
                        <span className="text-gray-600 text-sm font-medium">Active</span>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-md border border-gray-100">
                        <span className="text-gray-600 font-bold text-3xl block mb-2">
                          {waypoints.filter((w) => w.status === "PENDING").length}
                        </span>
                        <span className="text-gray-600 text-sm font-medium">Pending</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-6 flex justify-end">
            <Button onClick={onClose} variant="outline" className="px-6 py-2">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default BatchTimeline;