import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BatchStatus = 
  | 'CREATED' 
  | 'IN_PRODUCTION' 
  | 'QUALITY_CHECK' 
  | 'COMPLETED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'RECALLED';

export interface ComplianceDocument {
  id: string;
  type: string;
  documentUrl: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  uploadedAt: Date;
}

export interface Batch {
  id: string;
  batchNumber: string;
  productName: string;
  productCode?: string;
  description?: string;
  quantity: number;
  unit: string;
  status: BatchStatus;
  manufacturedAt: Date;
  expiryDate?: Date;
  qualityGrade?: string;
  storageTemp?: string;
  handlingNotes?: string;
  destinationAddress?: string;
  carbonFootprint?: number;
  complianceDocuments: ComplianceDocument[];
}

interface AppState {
  batches: Batch[];
  sustainabilityMetrics?: {
    totalCarbonSaved: number;
    esgScore: number;
    renewableEnergy: number;
    wasteReduction: number;
  };
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  removeBatch: (id: string) => void;
  setBatches: (batches: Batch[]) => void; // Add this function
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      batches: [],
      addBatch: (batch) =>
        set((state) => ({
          batches: [...state.batches, batch],
        })),
      updateBatch: (id, updates) =>
        set((state) => ({
          batches: state.batches.map((batch) =>
            batch.id === id ? { ...batch, ...updates } : batch
          ),
        })),
      removeBatch: (id) =>
        set((state) => ({
          batches: state.batches.filter((batch) => batch.id !== id),
        })),
      setBatches: (batches) => set({ batches }), // Implement setBatches
    }),
    {
      name: 'neev-trace-storage-v2', // Changed key to force fresh start
      storage: createJSONStorage(() => localStorage),
    }
  )
);