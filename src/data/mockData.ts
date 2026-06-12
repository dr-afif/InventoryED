import type { Medication, Location, InventoryItem, User } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Jenkins', role: 'staff', initials: 'SJ', email: 'sarah@inventoryed.com', pin: '1234' },
  { id: 'u2', name: 'Dr. Robert Chen', role: 'supervisor', initials: 'RC', email: 'robert@inventoryed.com', pin: '5678' },
  { id: 'u3', name: 'Admin User', role: 'admin', initials: 'AD', email: 'admin@inventoryed.com', pin: '0000' },
];

export const mockLocations: Location[] = [
  { id: 'l1', name: 'Resus Bay 1 Trolley', category: 'resus' },
  { id: 'l2', name: 'Resus Bay 2 Trolley', category: 'resus' },
  { id: 'l3', name: 'Red Zone Cupboard', category: 'ward' },
  { id: 'l4', name: 'Medication Fridge 1', category: 'fridge' },
  { id: 'l5', name: 'Treatment Room A', category: 'procedure' },
];

export const mockMedications: Medication[] = [
  {
    id: 'm1',
    displayName: 'Adrenaline 1mg/10ml',
    normalizedName: 'adrenaline1mg10ml',
    genericName: 'Epinephrine',
    strength: '1mg/10ml',
    form: 'Min-I-Jet',
    route: 'IV',
    unit: 'syringes',
    maxStockLevel: 20,
    minStockLevel: 6,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm2',
    displayName: 'Atropine 600mcg',
    normalizedName: 'atropine600mcg',
    genericName: 'Atropine Sulfate',
    strength: '600mcg',
    form: 'Ampoule',
    route: 'IV/IM',
    unit: 'ampoules',
    maxStockLevel: 30,
    minStockLevel: 9,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm3',
    displayName: 'Midazolam 5mg/5ml',
    normalizedName: 'midazolam5mg5ml',
    genericName: 'Midazolam',
    strength: '5mg/5ml',
    form: 'Ampoule',
    route: 'IV',
    unit: 'ampoules',
    maxStockLevel: 15,
    minStockLevel: 5,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm4',
    displayName: 'Ketamine 50mg/5ml',
    normalizedName: 'ketamine50mg5ml',
    genericName: 'Ketamine',
    strength: '50mg/5ml',
    form: 'Vial',
    route: 'IV/IM',
    unit: 'vials',
    maxStockLevel: 10,
    minStockLevel: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm5',
    displayName: 'Tranexamic Acid 500mg',
    normalizedName: 'tranexamicacid500mg',
    genericName: 'Tranexamic Acid',
    strength: '500mg',
    form: 'Ampoule',
    route: 'IV',
    unit: 'ampoules',
    maxStockLevel: 20,
    minStockLevel: 6,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm6',
    displayName: 'Ceftriaxone 1g',
    normalizedName: 'ceftriaxone1g',
    genericName: 'Ceftriaxone',
    strength: '1g',
    form: 'Vial (Powder)',
    route: 'IV',
    unit: 'vials',
    maxStockLevel: 30,
    minStockLevel: 9,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm7',
    displayName: 'Paracetamol 1g/100ml',
    normalizedName: 'paracetamol1g100ml',
    genericName: 'Paracetamol',
    brandName: 'Perfalgan',
    strength: '1g/100ml',
    form: 'Infusion Bottle',
    route: 'IV',
    unit: 'bottles',
    maxStockLevel: 60,
    minStockLevel: 18,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm8',
    displayName: 'Salbutamol 2.5mg/2.5ml',
    normalizedName: 'salbutamol25mg25ml',
    genericName: 'Salbutamol',
    strength: '2.5mg/2.5ml',
    form: 'Nebule',
    route: 'Inhalation',
    unit: 'nebules',
    maxStockLevel: 100,
    minStockLevel: 30,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const generateMockInventory = (): InventoryItem[] => {
  const items: InventoryItem[] = [];
  let idCounter = 1;
  const now = new Date().toISOString();
  
  // Helper to find min/max stock
  const getLevels = (medId: string) => {
    const med = mockMedications.find(m => m.id === medId);
    return {
      maxStockLevel: med?.maxStockLevel || 10,
      minStockLevel: med?.minStockLevel || 3
    };
  };

  // Resus Bay 1 Trolley
  items.push({ id: `inv_${idCounter++}`, locationId: 'l1', medicationId: 'm1', currentQuantity: 0, ...getLevels('m1'), expiryDate: '2027-05-01', lastCheckedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: now });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l1', medicationId: 'm2', currentQuantity: 0, ...getLevels('m2'), expiryDate: '2026-10-15', lastCheckedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: now });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l1', medicationId: 'm3', currentQuantity: 0, ...getLevels('m3'), expiryDate: '2026-08-20', lastCheckedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: now });
  
  // Resus Bay 2 Trolley
  items.push({ id: `inv_${idCounter++}`, locationId: 'l2', medicationId: 'm1', currentQuantity: 0, ...getLevels('m1'), expiryDate: '2027-01-10', lastCheckedAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: now });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l2', medicationId: 'm2', currentQuantity: 0, ...getLevels('m2'), expiryDate: '2026-06-30', updatedAt: now }); // Expiring somewhat soon
  items.push({ id: `inv_${idCounter++}`, locationId: 'l2', medicationId: 'm4', currentQuantity: 0, ...getLevels('m4'), expiryDate: '2028-02-15', updatedAt: now });

  // Red Zone
  items.push({ id: `inv_${idCounter++}`, locationId: 'l3', medicationId: 'm5', currentQuantity: 0, ...getLevels('m5'), expiryDate: '2026-11-01', updatedAt: now });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l3', medicationId: 'm6', currentQuantity: 0, ...getLevels('m6'), expiryDate: '2027-03-15', updatedAt: now });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l3', medicationId: 'm7', currentQuantity: 0, ...getLevels('m7'), expiryDate: '2025-08-10', updatedAt: now }); // Expiring very soon!
  
  // Fridge
  items.push({ id: `inv_${idCounter++}`, locationId: 'l4', medicationId: 'm3', currentQuantity: 0, ...getLevels('m3'), expiryDate: '2026-12-01', updatedAt: now });

  return items;
};

export const mockInventory = generateMockInventory();
