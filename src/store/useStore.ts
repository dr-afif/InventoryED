import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Medication, Location, InventoryItem, AuditLog, User } from '../types';
import { mockMedications, mockLocations, mockInventory, mockUsers } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface AppState {
  currentUser: User | null;
  users: User[];
  medications: Medication[];
  locations: Location[];
  inventory: InventoryItem[];
  auditLogs: AuditLog[];
  isSupabaseConnected: boolean;
  isLoading: boolean;
  draftDailyCheck: Record<string, number>;

  // Helpers
  getCentralLocation: () => Location | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  addUser: (user: { name: string; email: string; password?: string; role: 'admin' | 'supervisor' | 'staff'; initials: string }) => Promise<{ success: boolean; error: string | null }>;
  updateUser: (email: string, user: { name: string; role: 'admin' | 'supervisor' | 'staff'; initials: string }) => Promise<{ success: boolean; error: string | null }>;
  deleteUser: (email: string, id?: string) => Promise<{ success: boolean; error: string | null }>;
  fetchInitialData: () => Promise<void>;
  
  // Daily Check Actions
  setDraftDailyCheck: (draft: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  clearDraftDailyCheck: () => void;
  submitDailyCheck: (
    checkedItems: { inventoryId: string, expectedQty: number, actualQty: number }[]
  ) => Promise<void>;

  // Inventory Management
  updateInventory: (inventoryId: string, newQuantity: number, reason: string) => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addBulkMedications: (medications: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>[], updateExisting: boolean) => Promise<{ imported: number, updated: number }>;
  addStock: (medicationId: string, quantity: number, expiryDate: string, batchNumber?: string) => Promise<void>;
}

const mapMedication = (data: any): Medication => ({
  id: data.id,
  displayName: data.display_name || data.name || '',
  normalizedName: data.normalized_name || '',
  genericName: data.generic_name,
  brandName: data.brand_name,
  strength: data.strength,
  form: data.form,
  route: data.route,
  unit: data.unit,
  maxStockLevel: data.max_stock_level || 0,
  minStockLevel: data.min_stock_level || 0,
  reorderLevel: data.reorder_level,
  category: data.category,
  isHighAlert: data.is_high_alert,
  isEmergencyDrug: data.is_emergency_drug,
  isColdChain: data.is_cold_chain,
  isControlledDrug: data.is_controlled_drug,
  active: data.active ?? true,
  barcode: data.barcode,
  notes: data.notes,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString(),
});

const mapInventoryItem = (data: any): InventoryItem => ({
  id: data.id,
  locationId: data.location_id,
  medicationId: data.medication_id,
  currentQuantity: data.current_quantity || data.quantity || 0,
  maxStockLevel: data.max_stock_level || 0,
  minStockLevel: data.min_stock_level || 0,
  expiryDate: data.expiry_date,
  batchNumber: data.batch_number,
  lastCheckedAt: data.last_checked_at,
  lastCheckedBy: data.last_checked_by,
  updatedAt: data.updated_at || new Date().toISOString(),
});

const mapAuditLog = (data: any): AuditLog => ({
  id: data.id,
  userId: data.user_id,
  timestamp: data.timestamp,
  action: data.action,
  medicationId: data.medication_id,
  locationId: data.location_id,
  quantityChange: data.quantity_change,
  reason: data.reason,
  notes: data.notes,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      medications: mockMedications,
      locations: mockLocations,
      inventory: mockInventory,
      auditLogs: [],
      isSupabaseConnected: false,
      isLoading: false,
      draftDailyCheck: {},

      getCentralLocation: () => {
        const locs = get().locations;
        return locs.length > 0 ? locs[0] : null;
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      signIn: async (email, password) => {
        if (!isSupabaseConfigured()) {
          // Local Mock Auth
          const mockUser = mockUsers.find(u => {
            const mockEmail = u.id === 'u1' ? 'sarah@inventoryed.com' : u.id === 'u2' ? 'robert@inventoryed.com' : 'admin@inventoryed.com';
            const mockPass = u.role === 'admin' ? 'admin123' : u.role === 'supervisor' ? 'super123' : 'staff123';
            return mockEmail === email.toLowerCase() && mockPass === password;
          });
          
          if (mockUser) {
            set({ currentUser: mockUser });
            return { success: true, error: null };
          } else {
            return { 
              success: false, 
              error: 'Invalid credentials. Try sarah@inventoryed.com / staff123' 
            };
          }
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          if (data.user) {
            // Fetch profile from profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const loggedInUser: User = {
              id: data.user.id,
              name: profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Unknown User',
              role: (profile?.role || data.user.user_metadata?.role || 'staff') as 'admin' | 'supervisor' | 'staff',
              initials: profile?.initials || data.user.user_metadata?.initials || data.user.email?.slice(0, 2).toUpperCase() || 'US',
              email: data.user.email,
            };

            set({ currentUser: loggedInUser });
            return { success: true, error: null };
          }
          return { success: false, error: 'Authentication failed.' };
        } catch (err: any) {
          console.error('Sign in error:', err);
          return { success: false, error: err.message || 'An error occurred during sign in.' };
        }
      },

      signOut: async () => {
        if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
        }
        set({ currentUser: null });
      },

      addUser: async (newUser) => {
        if (!isSupabaseConfigured()) {
          // Local Mock mode
          const generatedId = `u_${Date.now()}`;
          const mockUserObj: User = {
            id: generatedId,
            name: newUser.name,
            role: newUser.role,
            initials: newUser.initials,
            email: newUser.email,
          };
          
          set((state) => ({ users: [...state.users, mockUserObj] }));
          return { success: true, error: null };
        }

        try {
          // 1. Insert into allowed_users table
          const { error: allowedError } = await supabase.from('allowed_users').insert([{
            email: newUser.email.toLowerCase(),
            name: newUser.name,
            role: newUser.role,
            initials: newUser.initials
          }]);

          if (allowedError) throw allowedError;

          let authId = `allowed_${newUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

          // 2. If password provided, sign up using secondary client
          if (newUser.password) {
            const tempClient = createClient(
              import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
              import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key',
              {
                auth: {
                  persistSession: false,
                  autoRefreshToken: false,
                  detectSessionInUrl: false
                }
              }
            );

            const { data, error } = await tempClient.auth.signUp({
              email: newUser.email,
              password: newUser.password,
              options: {
                data: {
                  name: newUser.name,
                  role: newUser.role,
                  initials: newUser.initials
                }
              }
            });

            if (error) {
              // Rollback allowed_users insert if auth signup fails
              await supabase.from('allowed_users').delete().eq('email', newUser.email.toLowerCase());
              throw error;
            }

            if (data.user) {
              authId = data.user.id;
            }
          }

          const addedUser: User = {
            id: authId,
            name: newUser.name,
            role: newUser.role,
            initials: newUser.initials,
            email: newUser.email.toLowerCase()
          };

          set((state) => ({ users: [...state.users, addedUser] }));
          return { success: true, error: null };
        } catch (err: any) {
          console.error('Error adding user:', err);
          return { success: false, error: err.message || 'An error occurred.' };
        }
      },

      updateUser: async (email, updatedFields) => {
        if (!isSupabaseConfigured()) {
          // Local Mock Mode
          set((state) => ({
            users: state.users.map((u) => {
              const mockEmail = u.id === 'u1' ? 'sarah@inventoryed.com' : u.id === 'u2' ? 'robert@inventoryed.com' : 'admin@inventoryed.com';
              if (mockEmail === email || u.id === email || u.email === email) {
                return { ...u, name: updatedFields.name, role: updatedFields.role, initials: updatedFields.initials };
              }
              return u;
            })
          }));
          return { success: true, error: null };
        }

        try {
          // 1. Update allowed_users
          const { error: allowedError } = await supabase
            .from('allowed_users')
            .update({
              name: updatedFields.name,
              role: updatedFields.role,
              initials: updatedFields.initials
            })
            .eq('email', email.toLowerCase());

          if (allowedError) throw allowedError;

          // 2. Try to update profiles table if it exists
          const { users } = get();
          const targetUser = users.find(u => u.id === email || u.name === updatedFields.name);
          if (targetUser && targetUser.id && !targetUser.id.startsWith('allowed_') && targetUser.id !== email) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                name: updatedFields.name,
                role: updatedFields.role,
                initials: updatedFields.initials
              })
              .eq('id', targetUser.id);
              
            if (profileError) {
              console.warn("Updated whitelist but profiles update failed:", profileError);
            }
          }

          // Update local state list
          set((state) => ({
            users: state.users.map((u) => {
              if (u.id === email || (targetUser && u.id === targetUser.id) || u.email === email) {
                return { ...u, name: updatedFields.name, role: updatedFields.role, initials: updatedFields.initials };
              }
              return u;
            })
          }));

          return { success: true, error: null };
        } catch (err: any) {
          console.error('Error updating user:', err);
          return { success: false, error: err.message || 'An error occurred.' };
        }
      },

      deleteUser: async (email, id) => {
        if (!isSupabaseConfigured()) {
          // Local Mock Mode
          set((state) => ({
            users: state.users.filter((u) => {
              const mockEmail = u.id === 'u1' ? 'sarah@inventoryed.com' : u.id === 'u2' ? 'robert@inventoryed.com' : 'admin@inventoryed.com';
              return mockEmail !== email && u.email !== email;
            })
          }));
          return { success: true, error: null };
        }

        try {
          // 1. Delete from allowed_users
          const { error: allowedError } = await supabase
            .from('allowed_users')
            .delete()
            .eq('email', email.toLowerCase());

          if (allowedError) throw allowedError;

          // 2. Delete from profiles (if UUID is available)
          if (id && !id.startsWith('allowed_') && id !== email) {
            const { error: profileError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', id);

            if (profileError) {
              console.warn("Deleted from whitelist but profiles delete failed:", profileError);
            }
          }

          // Update local state list
          set((state) => ({
            users: state.users.filter((u) => u.id !== email && u.id !== id && u.email !== email)
          }));

          return { success: true, error: null };
        } catch (err: any) {
          console.error('Error deleting user:', err);
          return { success: false, error: err.message || 'An error occurred.' };
        }
      },

      fetchInitialData: async () => {
        if (!isSupabaseConfigured()) {
          console.warn("Supabase not configured. Using local mock data.");
          // Ensure we only have one location in mock data to simulate centralization
          set({ locations: [mockLocations[0]] });
          return;
        }

        set({ isLoading: true });
        try {
          // Restore session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Verify if user is still allowed
            const { data: allowedUser } = await supabase
              .from('allowed_users')
              .select('*')
              .eq('email', session.user.email?.toLowerCase())
              .single();

            if (!allowedUser) {
              console.warn("Logged in user is no longer on the whitelist. Revoking session.");
              await supabase.auth.signOut();
              set({ currentUser: null });
            } else {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              const loggedInUser: User = {
                id: session.user.id,
                name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Unknown User',
                role: (profile?.role || session.user.user_metadata?.role || 'staff') as 'admin' | 'supervisor' | 'staff',
                initials: profile?.initials || session.user.user_metadata?.initials || session.user.email?.slice(0, 2).toUpperCase() || 'US',
                email: session.user.email,
              };
              set({ currentUser: loggedInUser });
            }
          }

          const [locRes, medRes, invRes, logRes] = await Promise.all([
            supabase.from('locations').select('*').limit(1), // Force single location logic
            supabase.from('medications').select('*'),
            supabase.from('inventory_items').select('*'),
            supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50)
          ]);

          let dbUsers: User[] = [];
          try {
            // Try fetching from allowed_users first
            const { data: allowedList } = await supabase.from('allowed_users').select('*');
            if (allowedList && allowedList.length > 0) {
              dbUsers = allowedList.map(a => ({
                id: a.email,
                name: a.name,
                role: a.role as 'admin' | 'supervisor' | 'staff',
                initials: a.initials,
                email: a.email,
              }));
            } else {
              // Fallback to profiles if allowed_users is empty
              const { data: profiles } = await supabase.from('profiles').select('*');
              if (profiles && profiles.length > 0) {
                dbUsers = profiles.map(p => ({
                  id: p.id,
                  name: p.name,
                  role: p.role as 'admin' | 'supervisor' | 'staff',
                  initials: p.initials,
                  email: p.email || undefined,
                }));
              }
            }
          } catch (err) {
            // Try profiles table if allowed_users fetch throws (e.g. table not created yet)
            try {
              const { data: profiles } = await supabase.from('profiles').select('*');
              if (profiles && profiles.length > 0) {
                dbUsers = profiles.map(p => ({
                  id: p.id,
                  name: p.name,
                  role: p.role as 'admin' | 'supervisor' | 'staff',
                  initials: p.initials,
                  email: p.email || undefined,
                }));
              }
            } catch (profileErr) {
              console.warn("Could not fetch allowed_users or profiles table from database. Fallback to mock users:", profileErr);
            }
          }

          let centralLoc = locRes.data?.[0];
          
          // Auto-seed a central location if none exists
          if (!centralLoc && isSupabaseConfigured()) {
            const { data } = await supabase.from('locations').insert([{
              name: 'Central ED Inventory',
              category: 'pharmacy',
              description: 'Main ED medication storage'
            }]).select();
            if (data && data.length > 0) centralLoc = data[0];
          }

          if (medRes.data && invRes.data) {
            set({
              locations: centralLoc ? [centralLoc] : [],
              medications: medRes.data.map(mapMedication),
              inventory: invRes.data.map(mapInventoryItem),
              auditLogs: logRes.data ? logRes.data.map(mapAuditLog) : [],
              isSupabaseConnected: true,
              users: dbUsers.length > 0 ? dbUsers : mockUsers
            });
          }
        } catch (error) {
          console.error("Error fetching from Supabase:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      setDraftDailyCheck: (draft) => set((state) => ({ 
        draftDailyCheck: typeof draft === 'function' ? draft(state.draftDailyCheck) : draft 
      })),

      clearDraftDailyCheck: () => set({ draftDailyCheck: {} }),

      submitDailyCheck: async (checkedItems) => {
        const { currentUser, inventory, addAuditLog, getCentralLocation } = get();
        if (!currentUser) return;
        const centralLoc = getCentralLocation();
        const locId = centralLoc ? centralLoc.id : 'unknown';

        const now = new Date().toISOString();
        const updatedInventory = [...inventory];

        for (const item of checkedItems) {
          const invIndex = updatedInventory.findIndex((i) => i.id === item.inventoryId);
          if (invIndex >= 0) {
            const invItem = updatedInventory[invIndex];
            
            if (item.expectedQty !== item.actualQty) {
              await addAuditLog({
                userId: currentUser.id,
                action: 'check',
                medicationId: invItem.medicationId,
                locationId: locId,
                quantityChange: item.actualQty - item.expectedQty,
                reason: 'Daily check discrepancy',
              });
            }

            updatedInventory[invIndex] = {
              ...invItem,
              currentQuantity: item.actualQty,
              lastCheckedAt: now,
              lastCheckedBy: currentUser.id,
              updatedAt: now,
            };

            if (isSupabaseConfigured()) {
              await supabase.from('inventory_items').update({
                current_quantity: item.actualQty,
                last_checked_at: now,
                last_checked_by: currentUser.id,
                updated_at: now
              }).eq('id', item.inventoryId);
            }
          }
        }

        set({ inventory: updatedInventory });
      },

      updateInventory: async (inventoryId, newQuantity, reason) => {
        const { currentUser, inventory, addAuditLog } = get();
        if (!currentUser) return;

        const updatedInventory = [...inventory];
        const invIndex = updatedInventory.findIndex((i) => i.id === inventoryId);
        
        if (invIndex >= 0) {
          const invItem = updatedInventory[invIndex];
          const diff = newQuantity - invItem.currentQuantity;
          
          await addAuditLog({
            userId: currentUser.id,
            action: 'adjust',
            medicationId: invItem.medicationId,
            locationId: invItem.locationId,
            quantityChange: diff,
            reason,
          });

          updatedInventory[invIndex] = {
            ...invItem,
            currentQuantity: newQuantity,
            updatedAt: new Date().toISOString()
          };

          if (isSupabaseConfigured()) {
            await supabase.from('inventory_items').update({
              current_quantity: newQuantity,
              updated_at: new Date().toISOString()
            }).eq('id', inventoryId);
          }

          set({ inventory: updatedInventory });
        }
      },

      addAuditLog: async (log) => {
        const newLog: AuditLog = {
          ...log,
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('audit_logs').insert([{
            user_id: log.userId,
            action: log.action,
            medication_id: log.medicationId,
            location_id: log.locationId,
            quantity_change: log.quantityChange,
            reason: log.reason,
            notes: log.notes
          }]).select();

          if (data && data[0]) {
            newLog.id = data[0].id;
          }
        }

        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },

      addMedication: async (medication) => {
        const now = new Date().toISOString();
        const newMed = { ...medication, id: `med_${Date.now()}`, createdAt: now, updatedAt: now } as Medication;
        
        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('medications').insert([{
            display_name: medication.displayName,
            normalized_name: medication.normalizedName,
            generic_name: medication.genericName,
            brand_name: medication.brandName,
            strength: medication.strength,
            form: medication.form,
            route: medication.route,
            unit: medication.unit,
            max_stock_level: medication.maxStockLevel,
            min_stock_level: medication.minStockLevel,
            active: medication.active,
            created_at: now,
            updated_at: now
          }]).select();
          
          if (data && data[0]) {
            newMed.id = data[0].id;
          }
        }
        
        set((state) => ({ medications: [...state.medications, newMed] }));
      },

      addBulkMedications: async (meds, updateExisting) => {
        const { medications, inventory, getCentralLocation } = get();
        const centralLoc = getCentralLocation();
        const locId = centralLoc ? centralLoc.id : 'unknown';
        const now = new Date().toISOString();
        
        let importedCount = 0;
        let updatedCount = 0;
        const newMeds: Medication[] = [];
        const newInvs: InventoryItem[] = [];
        let updatedMeds = [...medications];
        let updatedInventory = [...inventory];

        // 1. Process local state updates
        for (const med of meds) {
          const existingMedIndex = updatedMeds.findIndex(m => m.normalizedName === med.normalizedName);
          let finalMedId = '';

          if (existingMedIndex >= 0) {
            finalMedId = updatedMeds[existingMedIndex].id;
            if (updateExisting) {
              updatedMeds[existingMedIndex] = {
                ...updatedMeds[existingMedIndex],
                ...med,
                updatedAt: now
              };
              updatedCount++;
            }
            // We no longer `continue` here because we want to ensure the inventory row exists below.
          } else {
            const medId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            finalMedId = medId;
            const newMed: Medication = {
              ...med,
              id: medId,
              createdAt: now,
              updatedAt: now
            };
            newMeds.push(newMed);
            updatedMeds.push(newMed);
            importedCount++;
          }

          // Ensure Central ED Inventory stock row exists for this medication
          if (finalMedId) {
             const existingInv = updatedInventory.find(i => i.medicationId === finalMedId && i.locationId === locId);
             if (!existingInv) {
                const newInv: InventoryItem = {
                  id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  locationId: locId,
                  medicationId: finalMedId,
                  currentQuantity: med.maxStockLevel,
                  maxStockLevel: med.maxStockLevel,
                  minStockLevel: med.minStockLevel,
                  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
                  updatedAt: now
                };
                newInvs.push(newInv);
                updatedInventory.push(newInv);
             }
          }
        }

        // 2. Perform Supabase operations if connected
        if (isSupabaseConfigured() && (newMeds.length > 0 || updateExisting || newInvs.length > 0)) {
           // For simplicity in this demo, we'll update supabase one by one if updating, 
           // and insert many if inserting
           if (newMeds.length > 0) {
             const { data: dbMeds } = await supabase.from('medications').insert(
               newMeds.map(m => ({
                 display_name: m.displayName,
                 normalized_name: m.normalizedName,
                 max_stock_level: m.maxStockLevel,
                 min_stock_level: m.minStockLevel,
                 active: true,
                 created_at: m.createdAt,
                 updated_at: m.updatedAt
               }))
             ).select();
             
             // If we really wanted to map back the UUIDs we'd need to match on normalized_name,
             // but for local UI consistency we will just use the ones we generated or fetch later
           }

           if (newInvs.length > 0) {
              await supabase.from('inventory_items').insert(
                newInvs.map(i => ({
                  location_id: i.locationId,
                  medication_id: i.medicationId,
                  current_quantity: i.currentQuantity,
                  max_stock_level: i.maxStockLevel,
                  min_stock_level: i.minStockLevel,
                  expiry_date: i.expiryDate,
                  updated_at: i.updatedAt
                }))
              );
           }
        }

        set({ medications: updatedMeds, inventory: updatedInventory });
        return { imported: importedCount, updated: updatedCount };
      },

      addStock: async (medicationId, quantity, expiryDate, batchNumber) => {
        const { currentUser, inventory, getCentralLocation, addAuditLog } = get();
        if (!currentUser) return;
        const centralLoc = getCentralLocation();
        const locId = centralLoc ? centralLoc.id : 'unknown';

        const existingInvIndex = inventory.findIndex(i => i.medicationId === medicationId && i.locationId === locId);
        let updatedInventory = [...inventory];

        await addAuditLog({
          userId: currentUser.id,
          action: 'add',
          medicationId,
          locationId: locId,
          quantityChange: quantity,
          reason: 'Restocked',
        });

        if (existingInvIndex >= 0) {
          // Update existing
          const invItem = updatedInventory[existingInvIndex];
          const newQty = invItem.currentQuantity + quantity;
          
          updatedInventory[existingInvIndex] = {
            ...invItem,
            currentQuantity: newQty,
            expiryDate, // Update to the newly restocked expiry (simplified logic)
            batchNumber,
            updatedAt: new Date().toISOString()
          };

          if (isSupabaseConfigured()) {
            await supabase.from('inventory_items').update({
              current_quantity: newQty,
              expiry_date: expiryDate,
              batch_number: batchNumber,
              updated_at: new Date().toISOString()
            }).eq('id', invItem.id);
          }
        } else {
          // Insert new
          const med = get().medications.find(m => m.id === medicationId);
          const newItem: InventoryItem = {
            id: `inv_${Date.now()}`,
            locationId: locId,
            medicationId,
            currentQuantity: quantity,
            maxStockLevel: med?.maxStockLevel || 0,
            minStockLevel: med?.minStockLevel || 0,
            expiryDate,
            batchNumber,
            updatedAt: new Date().toISOString()
          };

          if (isSupabaseConfigured()) {
            const { data } = await supabase.from('inventory_items').insert([{
              location_id: locId,
              medication_id: medicationId,
              current_quantity: quantity,
              max_stock_level: med?.maxStockLevel || 0,
              min_stock_level: med?.minStockLevel || 0,
              expiry_date: expiryDate,
              batch_number: batchNumber,
              updated_at: new Date().toISOString()
            }]).select();

            if (data && data[0]) {
              newItem.id = data[0].id;
            }
          }
          updatedInventory.push(newItem);
        }

        set({ inventory: updatedInventory });
      },
    }),
    {
      name: 'inventory-ed-storage',
      partialize: (state) => ({
        inventory: state.inventory,
        auditLogs: state.auditLogs,
        currentUser: state.currentUser,
        medications: state.medications, // Persist medications for mock mode offline
      }),
    }
  )
);
