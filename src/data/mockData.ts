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
    name: 'Adrenaline 1mg/10ml',
    genericName: 'Epinephrine',
    strength: '1mg/10ml',
    form: 'Min-I-Jet',
    route: 'IV',
    unit: 'syringes',
    minStockLevel: 5,
  },
  {
    id: 'm2',
    name: 'Atropine 600mcg',
    genericName: 'Atropine Sulfate',
    strength: '600mcg',
    form: 'Ampoule',
    route: 'IV/IM',
    unit: 'ampoules',
    minStockLevel: 10,
  },
  {
    id: 'm3',
    name: 'Midazolam 5mg/5ml',
    genericName: 'Midazolam',
    strength: '5mg/5ml',
    form: 'Ampoule',
    route: 'IV',
    unit: 'ampoules',
    minStockLevel: 5,
  },
  {
    id: 'm4',
    name: 'Ketamine 50mg/5ml',
    genericName: 'Ketamine',
    strength: '50mg/5ml',
    form: 'Vial',
    route: 'IV/IM',
    unit: 'vials',
    minStockLevel: 3,
  },
  {
    id: 'm5',
    name: 'Tranexamic Acid 500mg',
    genericName: 'Tranexamic Acid',
    strength: '500mg',
    form: 'Ampoule',
    route: 'IV',
    unit: 'ampoules',
    minStockLevel: 6,
  },
  {
    id: 'm6',
    name: 'Ceftriaxone 1g',
    genericName: 'Ceftriaxone',
    strength: '1g',
    form: 'Vial (Powder)',
    route: 'IV',
    unit: 'vials',
    minStockLevel: 10,
  },
  {
    id: 'm7',
    name: 'Paracetamol 1g/100ml',
    genericName: 'Paracetamol',
    brandName: 'Perfalgan',
    strength: '1g/100ml',
    form: 'Infusion Bottle',
    route: 'IV',
    unit: 'bottles',
    minStockLevel: 20,
  },
  {
    id: 'm8',
    name: 'Salbutamol 2.5mg/2.5ml',
    genericName: 'Salbutamol',
    strength: '2.5mg/2.5ml',
    form: 'Nebule',
    route: 'Inhalation',
    unit: 'nebules',
    minStockLevel: 30,
  },
];

const generateMockInventory = (): InventoryItem[] => {
  const items: InventoryItem[] = [];
  let idCounter = 1;
  
  // Resus Bay 1 Trolley
  items.push({ id: `inv_${idCounter++}`, locationId: 'l1', medicationId: 'm1', quantity: 6, expiryDate: '2027-05-01', lastCheckedAt: new Date(Date.now() - 86400000).toISOString() });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l1', medicationId: 'm2', quantity: 12, expiryDate: '2026-10-15', lastCheckedAt: new Date(Date.now() - 86400000).toISOString() });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l1', medicationId: 'm3', quantity: 4, expiryDate: '2026-08-20', lastCheckedAt: new Date(Date.now() - 86400000).toISOString() });
  
  // Resus Bay 2 Trolley
  items.push({ id: `inv_${idCounter++}`, locationId: 'l2', medicationId: 'm1', quantity: 5, expiryDate: '2027-01-10', lastCheckedAt: new Date(Date.now() - 172800000).toISOString() });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l2', medicationId: 'm2', quantity: 9, expiryDate: '2026-06-30' }); // Expiring somewhat soon
  items.push({ id: `inv_${idCounter++}`, locationId: 'l2', medicationId: 'm4', quantity: 3, expiryDate: '2028-02-15' });

  // Red Zone
  items.push({ id: `inv_${idCounter++}`, locationId: 'l3', medicationId: 'm5', quantity: 10, expiryDate: '2026-11-01' });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l3', medicationId: 'm6', quantity: 25, expiryDate: '2027-03-15' });
  items.push({ id: `inv_${idCounter++}`, locationId: 'l3', medicationId: 'm7', quantity: 15, expiryDate: '2025-08-10' }); // Expiring very soon!
  
  // Fridge
  // (Assuming some meds need fridge, e.g. Ceftriaxone reconstituted, or others)
  // We'll put some generic stuff there for demo
  items.push({ id: `inv_${idCounter++}`, locationId: 'l4', medicationId: 'm3', quantity: 10, expiryDate: '2026-12-01' });

  return items;
};

export const mockInventory = generateMockInventory();
