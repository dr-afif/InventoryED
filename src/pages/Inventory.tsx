import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, AlertTriangle } from 'lucide-react';

export const Inventory = () => {
  const { inventory, medications } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInventory = useMemo(() => {
    return inventory.filter(inv => {
      const med = medications.find(m => m.id === inv.medicationId);
      return med?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             med?.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [inventory, medications, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* HEADER & SEARCH */}
      <div className="bg-white px-4 md:px-8 py-6 border-b border-slate-200 sticky top-0 z-20 space-y-4 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Master</h2>
        
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search medications, generic names..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-0 outline-none bg-slate-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-8">Medication</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredInventory.map(inv => {
              const med = medications.find(m => m.id === inv.medicationId);
              if (!med) return null;

              const isLowStock = inv.quantity <= med.minStockLevel;

              return (
                <div key={inv.id} className="p-4 md:px-6 md:py-4 hover:bg-slate-50 transition-colors flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center">
                  
                  <div className="md:col-span-8 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">{med.name}</h3>
                    <p className="text-xs text-slate-500">{med.genericName} • {med.form}</p>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between md:block md:text-right">
                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Qty</span>
                    <span className="font-bold text-lg text-slate-800">{inv.quantity}</span>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-danger/10 text-danger text-xs font-bold uppercase">
                        <AlertTriangle size={14} /> Low
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-success/10 text-success text-xs font-bold uppercase">
                        OK
                      </span>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredInventory.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <Search size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No inventory items found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
