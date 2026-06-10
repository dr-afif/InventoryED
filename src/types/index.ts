export interface Medication {
  id: string;
  displayName: string;
  normalizedName: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  form?: string; // e.g., 'ampoule', 'vial', 'tablet', 'nebule'
  route?: string; // e.g., 'IV', 'IM', 'PO', 'Inhalation'
  unit?: string;
  maxStockLevel: number;
  minStockLevel: number;
  reorderLevel?: number;
  category?: string;
  isHighAlert?: boolean;
  isEmergencyDrug?: boolean;
  isColdChain?: boolean;
  isControlledDrug?: boolean;
  active: boolean;
  barcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  category: 'resus' | 'ward' | 'fridge' | 'pharmacy' | 'procedure' | 'custom';
  description?: string;
}

export interface InventoryItem {
  id: string;
  locationId: string;
  medicationId: string;
  currentQuantity: number;
  maxStockLevel: number;
  minStockLevel: number;
  expiryDate: string; // ISO date string
  batchNumber?: string;
  lastCheckedAt?: string;
  lastCheckedBy?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  timestamp: string;
  action: 'add' | 'use' | 'transfer' | 'adjust' | 'check';
  medicationId: string;
  locationId: string;
  quantityChange: number;
  reason?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'supervisor' | 'staff';
  initials: string;
  email?: string;
  pin?: string;
  status?: 'pending' | 'approved' | 'rejected';
}
