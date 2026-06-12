import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, AlertTriangle, PackagePlus, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Inventory = () => {
  const { inventory, medications, addStock, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [medSearch, setMedSearch] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);

  const filteredInventory = useMemo(() => {
    return inventory.filter(inv => {
      const med = medications.find(m => m.id === inv.medicationId);
      return (med?.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
             (med?.genericName || '').toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [inventory, medications, searchQuery]);

  const handleRestock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const medicationId = selectedMedId;
    const quantity = Number(formData.get('quantity'));
    const expiryDate = formData.get('expiryDate') as string;
    const batchNumber = formData.get('batchNumber') as string;

    if (!medicationId || !quantity || !expiryDate) return;

    await addStock(medicationId, quantity, expiryDate, batchNumber);
    setSuccessMessage('Stock successfully added!');
    setTimeout(() => setSuccessMessage(''), 3000);
    e.currentTarget.reset();
    setSelectedMedId('');
    setMedSearch('');
  };

  const isAdminOrSupervisor = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* HEADER & SEARCH */}
      <div className="bg-white px-4 md:px-8 py-6 border-b border-slate-200 sticky top-0 z-20 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Inventory Master</h2>
          {isAdminOrSupervisor && (
            <button 
              onClick={() => setShowRestockForm(!showRestockForm)}
              className={`btn-primary flex items-center gap-2 text-sm px-4 py-2 ${showRestockForm ? 'bg-slate-800 hover:bg-slate-700' : ''}`}
            >
              {showRestockForm ? <X size={18} /> : <PackagePlus size={18} />}
              <span className="hidden sm:inline">{showRestockForm ? 'Close Restock' : 'Restock Item'}</span>
            </button>
          )}
        </div>
        
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

      {/* LIST & RESTOCK SECTION */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-success/10 border border-success/30 text-success p-4 rounded-xl flex items-center gap-3 font-bold"
              >
                <CheckCircle2 size={20} />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESTOCK FORM */}
          <AnimatePresence>
            {showRestockForm && isAdminOrSupervisor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="card p-6 mb-6 border border-primary-100 shadow-md shadow-primary-500/5">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <PackagePlus className="text-primary-600" size={20} />
                    <h3 className="font-bold text-slate-800">Add Stock</h3>
                  </div>
                  
                  <form onSubmit={handleRestock} className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Select Medication</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search and select medication..."
                          value={selectedMedId ? medications.find(m => m.id === selectedMedId)?.displayName || medSearch : medSearch}
                          onChange={(e) => {
                            setMedSearch(e.target.value);
                            setSelectedMedId('');
                            setShowMedDropdown(true);
                          }}
                          onFocus={() => setShowMedDropdown(true)}
                          onBlur={() => setTimeout(() => setShowMedDropdown(false), 200)}
                          className={`w-full pl-9 pr-4 py-3 rounded-xl border ${selectedMedId ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-slate-200 bg-slate-50'} focus:border-primary-500 outline-none transition-colors font-medium`}
                          required={!selectedMedId}
                        />
                      </div>
                      
                      {showMedDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-60 overflow-y-auto">
                          {medications
                            .filter(med => 
                              med.displayName.toLowerCase().includes(medSearch.toLowerCase()) || 
                              (med.genericName || '').toLowerCase().includes(medSearch.toLowerCase())
                            )
                            .map(med => (
                              <div 
                                key={med.id} 
                                className="px-4 py-2.5 hover:bg-primary-50 cursor-pointer border-b last:border-0 border-slate-100 flex flex-col"
                                onClick={() => {
                                  setSelectedMedId(med.id);
                                  setMedSearch('');
                                  setShowMedDropdown(false);
                                }}
                              >
                                <span className="font-bold text-sm text-slate-800">{med.displayName}</span>
                                {med.genericName && <span className="text-xs text-slate-500">{med.genericName}</span>}
                              </div>
                            ))}
                          {medications.filter(med => 
                              med.displayName.toLowerCase().includes(medSearch.toLowerCase()) || 
                              (med.genericName || '').toLowerCase().includes(medSearch.toLowerCase())
                            ).length === 0 && (
                              <div className="px-4 py-3 text-sm text-slate-500 text-center">No medications found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Quantity Received</label>
                        <input type="number" name="quantity" required min="1" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date</label>
                        <input type="date" name="expiryDate" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Batch Number (Optional)</label>
                      <input type="text" name="batchNumber" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button type="button" onClick={() => setShowRestockForm(false)} className="btn-secondary flex-1">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary flex-1">
                        Confirm Restock
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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

                const isLowStock = inv.currentQuantity <= inv.minStockLevel;

                return (
                  <div key={inv.id} className="p-4 md:px-6 md:py-4 hover:bg-slate-50 transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
                    
                    <div className="md:col-span-8 flex flex-col">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{med.displayName}</h3>
                      <p className="text-xs text-slate-500 mt-1">{med.genericName || ''} {med.form ? `• ${med.form}` : ''}</p>
                    </div>

                    <div className="flex items-center justify-between md:contents">
                      <div className="md:col-span-2 flex items-center gap-2 md:block md:text-right">
                        <span className="md:hidden text-[10px] text-slate-500 uppercase font-bold">Stock</span>
                        <span className="font-bold text-lg text-slate-800">{inv.currentQuantity}</span>
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
    </div>
  );
};
