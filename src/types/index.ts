export interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandName?: string;
  strength: string;
  form: string; // e.g., 'ampoule', 'vial', 'tablet', 'nebule'
  route: string; // e.g., 'IV', 'IM', 'PO', 'Inhalation'
  unit: string;
  minStockLevel: number;
  barcode?: string;
  notes?: string;
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
  quantity: number;
  expiryDate: string; // ISO date string
  batchNumber?: string;
  lastCheckedAt?: string;
  lastCheckedBy?: string;
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
}

