"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  TrendingUp, 
  Leaf, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Star,
  Bolt,
  Target,
  Award,
  Zap,
  Shield,
  DollarSign,
  Factory,
  Globe,
  Users,
  Truck,
  BarChart3,
  Send,
  Bot,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import axios from 'axios';

// Mock data for development - will be replaced with real API calls
const mockMetrics = {
  totalBatches: 156,
  activeBatches: 23,
  completedBatches: 133,
  totalCarbonSaved: 2.4, // tons
  esgScore: 85,
  complianceRate: 94,
  avgDeliveryTime: 5.2, // days
};

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
      type: "spring" as const,
      stiffness: 100
    }
  }
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
  bgGradient: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function MetricCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  color,
  bgGradient,
  trend
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div variants={itemVariants}>
      <Card 
        className="group relative overflow-hidden border-0 shadow-md bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Gradient */}
        <motion.div
          className={`absolute inset-0 ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          initial={{ scale: 0 }}
          animate={{ scale: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Subtle Static Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`absolute inset-0 ${color.replace('text-', 'bg-').replace('-600', '-400/20')} blur-md rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                  <div className={`p-3 ${color.replace('text-', 'bg-').replace('-600', '-100/70')} rounded-2xl group-hover:scale-105 transition-transform duration-200`}>
                    <Icon size={24} className={`${color} relative`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                    {trend && (
                      <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Animated Arrow */}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight size={20} className={color} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SectionCardProps {
  title: string;
  items: Array<{
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    action?: string;
  }>;
  sectionIcon: any;
  sectionColor: string;
}

function SectionCard({ title, items, sectionIcon: SectionIcon, sectionColor }: SectionCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden border-0 shadow-md bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`absolute inset-0 ${sectionColor.replace('text-', 'bg-').replace('-600', '-400/20')} blur-lg rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className={`p-3 ${sectionColor.replace('text-', 'bg-').replace('-600', '-100/70')} rounded-2xl group-hover:scale-105 transition-transform duration-200`}>
                <SectionIcon size={24} className={`${sectionColor} relative`} />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-200">
                {title}
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {title === 'Recommendations' ? 'Personalized suggestions for your business' : 'Available government schemes and incentives'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="group/item p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-white/70 hover:bg-blue-50/50 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 ${item.color.replace('text-', 'bg-').replace('-600', '-400/20')} blur-md rounded-full scale-125 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200`} />
                  <div className={`p-2 ${item.bgColor} rounded-lg group-hover/item:scale-105 transition-transform duration-200`}>
                    <item.icon size={20} className={`${item.color} relative`} />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 group-hover/item:text-blue-900 transition-colors duration-200">
                      {item.title}
                    </h4>
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ 
                        x: 0, 
                        opacity: 1
                      }}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"
                    >
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                        {item.action || 'Learn More'}
                      </Badge>
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Typing animation component
function TypingAnimation() {
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg shadow max-w-fit">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Bot size={16} className="text-blue-600" />
      </div>
      <div className="flex gap-1">
        <motion.div
          className="w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2
          }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.4
          }}
        />
      </div>
      <span className="text-xs text-blue-600 font-medium">AI is thinking...</span>
    </div>
  );
}

export default function ManufacturerDashboard() {
  const { batches } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, isBot: boolean}>>([
    { id: '1', text: 'Hello! How can I assist you with your manufacturing needs today?', isBot: true }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalBatches: 0,
    totalCarbonFootprint: 0,
    complianceRate: 0,
    activeLogisticsPartners: 0,
    pendingDocuments: 0,
    completedShipments: 0,
  });

  // Load dashboard metrics
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load batches
        const batchResponse = await fetch('/api/batch');
        let batchData = { batches: [] };
        if (batchResponse.ok) {
          batchData = await batchResponse.json();
        }

        // Load emissions data
        const emissionsResponse = await fetch('/api/batch/emissions');
        let emissionsData = { emissions: {} };
        if (emissionsResponse.ok) {
          emissionsData = await emissionsResponse.json();
        }

        // Calculate metrics
        const batches = batchData.batches || [];
        const emissions = emissionsData.emissions || {};
        
        const totalCarbonFootprint = Object.values(emissions).reduce(
          (sum: number, emission: any) => sum + (emission.total || 0), 
          0
        );

        const completedBatches = batches.filter((b: any) => b.status === 'COMPLETED').length;
        const totalDocuments = batches.reduce((sum: number, batch: any) => 
          sum + (batch.complianceDocuments?.length || 0), 0
        );
        const approvedDocuments = batches.reduce((sum: number, batch: any) => 
          sum + (batch.complianceDocuments?.filter((doc: any) => doc.status === 'APPROVED').length || 0), 0
        );

        setDashboardMetrics({
          totalBatches: batches.length,
          totalCarbonFootprint: totalCarbonFootprint,
          complianceRate: totalDocuments > 0 ? Math.round((approvedDocuments / totalDocuments) * 100) : 0,
          activeLogisticsPartners: new Set(batches.filter((b: any) => b.selectedLogisticsBidId).map((b: any) => b.selectedLogisticsBidId)).size,
          pendingDocuments: totalDocuments - approvedDocuments,
          completedShipments: batches.filter((b: any) => b.status === 'DELIVERED').length,
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Useful metrics for cards
  const usefulMetrics = useMemo(() => [
    {
      title: "Total Production Batches",
      value: dashboardMetrics.totalBatches,
      subtitle: `${dashboardMetrics.completedShipments} delivered successfully`,
      icon: Package,
      color: "text-blue-600",
      bgGradient: "bg-gradient-to-br from-blue-400/10 to-blue-600/10",
      trend: { value: "12%", isPositive: true }
    },
    {
      title: "Environmental Impact",
      value: `${dashboardMetrics.totalCarbonFootprint.toFixed(1)} kg`,
      subtitle: "Combined CO₂ emissions tracked",
      icon: Leaf,
      color: "text-green-600",
      bgGradient: "bg-gradient-to-br from-green-400/10 to-green-600/10",
      trend: { value: "8%", isPositive: false }
    }
  ], [dashboardMetrics]);

  const recommendations = [
    {
      title: "FAME India Scheme",
      description: "Faster Adoption and Manufacturing of Electric Vehicles (FAME) India: If Melexis's products are used in electric vehicles or related infrastructure, they might be eligible for incentives under the FAME India scheme.",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-100/70",
      action: "Apply Now"
    }
  ];

  const schemes = [
    {
      title: "National Mission for Enhanced Energy Efficiency (NMEEE)",
      description: "Under this mission, Melexis could explore schemes like Perform, Achieve and Trade (PAT) for energy efficiency improvements, potentially leading to incentives.",
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-100/70",
      action: "Explore"
    }
  ];

  const sendMessage = async () => {
    if (!currentMessage.trim() || isChatLoading) return;

    const userMessage = { id: Date.now().toString(), text: currentMessage, isBot: false };
    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageToSend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different possible response structures
      let botResponseText = '';
      if (typeof data === 'string') {
        botResponseText = data;
      } else if (data && typeof data === 'object') {
        if (data.response) {
          botResponseText = data.response;
        } else if (data.answer) {
          botResponseText = data.answer;
        } else if (data.result) {
          botResponseText = data.result;
        } else {
          botResponseText = JSON.stringify(data, null, 2);
        }
      } else {
        botResponseText = 'Received response but could not parse it properly.';
      }

      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        text: botResponseText || 'I received your message but could not generate a proper response.', 
        isBot: true 
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error details:', error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: `Error: ${error.message}. Please try again.`, 
        isBot: true 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full scale-150" />
            <div className="relative p-4 bg-blue-100 rounded-full">
              <Package size={32} className="text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
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

      <motion.div 
        className="relative flex-1 space-y-8 p-4 md:p-8 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between space-y-2">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Manufacturing Dashboard
            </h1>
            <p className="text-slate-600 text-lg flex items-center gap-2">
              <Star size={16} className="text-blue-500" />
              Welcome back! Here's what's happening with your supply chain today.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <Link href="/manufacturer/batch-registration">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                <Plus size={18} className="mr-2" />
                New Batch
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Recommendations and Schemes */}
          <div className="space-y-6 md:col-span-2">
            {/* Useful Metrics Cards */}
            <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
              {usefulMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </motion.div>

            {/* Recommendations Section */}
            <SectionCard
              title="Recommendations"
              items={recommendations}
              sectionIcon={Target}
              sectionColor="text-blue-600"
            />

            {/* Schemes Section */}
            <SectionCard
              title="Government Schemes"
              items={schemes}
              sectionIcon={Award}
              sectionColor="text-green-600"
            />
          </div>

          {/* Right Column - AI Chatbot */}
          <div className="hidden md:block bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Neev AI</h2>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 max-h-96">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.isBot ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isBot ? 'bg-blue-100' : 'bg-indigo-100'
                      }`}>
                        {message.isBot ? (
                          <Bot size={16} className="text-blue-600" />
                        ) : (
                          <MessageCircle size={16} className="text-indigo-600" />
                        )}
                      </div>
                      <div className={`max-w-xs p-3 rounded-lg shadow-sm ${
                        message.isBot 
                          ? 'bg-blue-50 text-slate-700 rounded-tl-none' 
                          : 'bg-indigo-500 text-white rounded-tr-none'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <TypingAnimation />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your message here..." 
                  className="flex-1 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={sendMessage}
                  disabled={isChatLoading}
                >
                  {isChatLoading ? <Clock className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}