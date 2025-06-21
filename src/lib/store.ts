import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types
interface Batch {
  id: string
  batchNumber: string
  productName: string
  productCode?: string
  description?: string
  quantity: number
  unit: string
  status: 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED'
  manufacturedAt: Date
  expiryDate?: Date
  qualityGrade?: string
  carbonFootprint?: number
  complianceDocuments: ComplianceDocument[]
}

interface ComplianceDocument {
  id: string
  type: string
  documentUrl: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: Date
  verifiedAt?: Date
  expiryDate?: Date
  issuer?: string
  certificateNumber?: string
}

interface Supplier {
  id: string
  companyName: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  suppliedProducts: string[]
  esgScore?: number
  certifications: string[]
  carbonFootprint?: number
  leadTime?: number
}

interface LogisticsHandler {
  id: string
  companyName: string
  email: string
  phone: string
  fleetSize?: number
  serviceAreas: string[]
  transportTypes: string[]
  carbonFootprintPerKm?: number
  sustainabilityCertifications: string[]
  averageCost?: number
}

interface SustainabilityMetrics {
  totalCarbonSaved: number
  esgScore: number
  sustainabilityGoals: {
    carbonReduction: number
    renewableEnergy: number
    wasteReduction: number
  }
  recommendations: AIRecommendation[]
}

interface AIRecommendation {
  id: string
  type: 'SUPPLIER' | 'LOGISTICS' | 'PROCESS'
  title: string
  description: string
  impact: {
    carbonReduction: number
    costDelta: number
    riskScore: number
  }
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Date
}

// Store interface
interface AppState {
  // Batches
  batches: Batch[]
  selectedBatch: Batch | null
  setBatches: (batches: Batch[]) => void
  setSelectedBatch: (batch: Batch | null) => void
  addBatch: (batch: Batch) => void
  updateBatch: (id: string, updates: Partial<Batch>) => void
  
  // Suppliers
  suppliers: Supplier[]
  selectedSuppliers: string[]
  setSuppliers: (suppliers: Supplier[]) => void
  setSelectedSuppliers: (supplierIds: string[]) => void
  addSupplier: (supplier: Supplier) => void
  
  // Logistics
  logisticsHandlers: LogisticsHandler[]
  selectedLogistics: string | null
  setLogisticsHandlers: (handlers: LogisticsHandler[]) => void
  setSelectedLogistics: (handlerId: string | null) => void
  
  // Sustainability
  sustainabilityMetrics: SustainabilityMetrics
  setSustainabilityMetrics: (metrics: SustainabilityMetrics) => void
  updateRecommendationStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void
  
  // UI State
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  currentWizardStep: number
  setCurrentWizardStep: (step: number) => void
  
  // Filters and Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: {
    status: string[]
    dateRange: { from?: Date; to?: Date }
    suppliers: string[]
  }
  setFilters: (filters: Partial<AppState['filters']>) => void
}

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        batches: [],
        selectedBatch: null,
        suppliers: [],
        selectedSuppliers: [],
        logisticsHandlers: [],
        selectedLogistics: null,
        sustainabilityMetrics: {
          totalCarbonSaved: 0,
          esgScore: 0,
          sustainabilityGoals: {
            carbonReduction: 0,
            renewableEnergy: 0,
            wasteReduction: 0,
          },
          recommendations: [],
        },
        sidebarCollapsed: false,
        currentWizardStep: 0,
        searchQuery: '',
        filters: {
          status: [],
          dateRange: {},
          suppliers: [],
        },

        // Actions
        setBatches: (batches) => set({ batches }),
        setSelectedBatch: (batch) => set({ selectedBatch: batch }),
        addBatch: (batch) => set((state) => ({ 
          batches: [...state.batches, batch] 
        })),
        updateBatch: (id, updates) => set((state) => ({
          batches: state.batches.map(batch => 
            batch.id === id ? { ...batch, ...updates } : batch
          )
        })),

        setSuppliers: (suppliers) => set({ suppliers }),
        setSelectedSuppliers: (supplierIds) => set({ selectedSuppliers: supplierIds }),
        addSupplier: (supplier) => set((state) => ({ 
          suppliers: [...state.suppliers, supplier] 
        })),

        setLogisticsHandlers: (handlers) => set({ logisticsHandlers: handlers }),
        setSelectedLogistics: (handlerId) => set({ selectedLogistics: handlerId }),

        setSustainabilityMetrics: (metrics) => set({ sustainabilityMetrics: metrics }),
        updateRecommendationStatus: (id, status) => set((state) => ({
          sustainabilityMetrics: {
            ...state.sustainabilityMetrics,
            recommendations: state.sustainabilityMetrics.recommendations.map(rec =>
              rec.id === id ? { ...rec, status } : rec
            )
          }
        })),

        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setCurrentWizardStep: (step) => set({ currentWizardStep: step }),

        setSearchQuery: (query) => set({ searchQuery: query }),
        setFilters: (filters) => set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
      }),
      {
        name: 'ssscp-storage',
        partialize: (state) => ({
          batches: state.batches,
          suppliers: state.suppliers,
          logisticsHandlers: state.logisticsHandlers,
          sustainabilityMetrics: state.sustainabilityMetrics,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'SSSCP Store' }
  )
) 