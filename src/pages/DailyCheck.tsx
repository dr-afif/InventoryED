import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, AlertTriangle, Search, Filter, Minus, Plus, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const DailyCheck = () => {
  const { inventory, medications, submitDailyCheck, draftDailyCheck, setDraftDailyCheck } = useStore();
  
  const checkedItems = draftDailyCheck;
  const setCheckedItems = setDraftDailyCheck;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unchecked' | 'checked' | 'discrepancy'>('all');

  const locationItems = inventory;
  const totalItemsCount = locationItems.length;
  const checkedItemsCount = Object.keys(checkedItems).length;
  const progressPercentage = totalItemsCount > 0 ? Math.round((checkedItemsCount / totalItemsCount) * 100) : 0;
  
  const isComplete = totalItemsCount > 0 && checkedItemsCount === totalItemsCount;

  // Derive filtered items
  const filteredItems = useMemo(() => {
    return locationItems.filter(item => {
      const med = medications.find(m => m.id === item.medicationId);
      if (!med) return false;

      // Search match
      const searchMatch = (med.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (med.genericName || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;

      // Filter match
      const isChecked = checkedItems[item.id] !== undefined;
      const isDiscrepancy = isChecked && checkedItems[item.id] !== item.currentQuantity;

      switch (filterTab) {
        case 'unchecked': return !isChecked;
        case 'checked': return isChecked && !isDiscrepancy;
        case 'discrepancy': return isDiscrepancy;
        default: return true;
      }
    });
  }, [locationItems, medications, searchQuery, filterTab, checkedItems]);

  const handleUpdateQty = (invId: string, delta: number, currentQty: number, expectedQty: number) => {
    const baseQty = checkedItems[invId] !== undefined ? checkedItems[invId] : currentQty;
    const newQty = Math.max(0, baseQty + delta);
    setCheckedItems(prev => ({ ...prev, [invId]: newQty }));
  };

  const handleSetCorrect = (invId: string, expectedQty: number) => {
    setCheckedItems(prev => ({ ...prev, [invId]: expectedQty }));
  };

  const handleMarkDiscrepancy = (invId: string, expectedQty: number) => {
    // If it's already a discrepancy, don't do anything special, otherwise just set it to 0 so the user is forced to correct it
    if (checkedItems[invId] === expectedQty || checkedItems[invId] === undefined) {
      setCheckedItems(prev => ({ ...prev, [invId]: 0 }));
    }
  };

  const finishCheck = async () => {
    setIsSubmitting(true);
    
    const submitData = locationItems.map(item => ({
      inventoryId: item.id,
      expectedQty: item.currentQuantity,
      actualQty: checkedItems[item.id] ?? item.currentQuantity,
    }));

    await submitDailyCheck(submitData);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const reset = () => {
    setCheckedItems({});
    setIsSuccess(false);
    setSearchQuery('');
    setFilterTab('all');
  };

  if (isSuccess) {
    return (
      <div className="p-6 md:p-12 flex flex-col items-center justify-center h-full text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Check Complete</h2>
          <p className="text-slate-500 mt-2">Central ED Inventory has been verified.</p>
        </div>
        <button onClick={reset} className="btn-primary w-full md:w-auto">
          Start Another Check
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-[100px] md:pb-[80px]">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 sticky top-0 z-20 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">Daily Stock Check</h2>
          
          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-500" 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs font-bold text-slate-500 w-16 text-right">
              {checkedItemsCount} / {totalItemsCount}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search medications..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'unchecked', 'checked', 'discrepancy'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors",
                filterTab === tab 
                  ? "bg-slate-800 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* LIST CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {filteredItems.map(item => {
              const med = medications.find(m => m.id === item.medicationId);
              if (!med) return null;

              const expectedQty = item.currentQuantity;
              const actualQty = checkedItems[item.id];
              const isChecked = actualQty !== undefined;
              const isDiscrepancy = isChecked && actualQty !== expectedQty;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={clsx(
                    "p-4 rounded-2xl border transition-all duration-300",
                    isDiscrepancy ? "bg-danger/5 border-danger/30" : 
                    isChecked ? "bg-success/5 border-success/30 opacity-70 hover:opacity-100" : 
                    "bg-white border-slate-200 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">
                        {med.displayName || med.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Expected: <span className="font-bold">{expectedQty}</span>
                      </p>
                    </div>
                    
                    {isDiscrepancy && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-danger bg-danger/10 px-2 py-1 rounded-md">
                        <AlertOctagon size={12} /> Discrepancy
                      </span>
                    )}
                    {isChecked && !isDiscrepancy && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-success bg-success/10 px-2 py-1 rounded-md">
                        <CheckCircle2 size={12} /> Checked
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Input Controls */}
                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex-1 max-w-[160px]">
                      <button 
                        onClick={() => handleUpdateQty(item.id, -1, expectedQty, expectedQty)}
                        className="p-3 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      
                      <div className="flex-1 text-center font-bold text-lg text-slate-800 bg-white py-2 border-x border-slate-200">
                        {actualQty !== undefined ? actualQty : expectedQty}
                      </div>
                      
                      <button 
                        onClick={() => handleUpdateQty(item.id, 1, expectedQty, expectedQty)}
                        className="p-3 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 flex-1">
                      <button 
                        onClick={() => handleSetCorrect(item.id, expectedQty)}
                        className={clsx(
                          "flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors",
                          isChecked && !isDiscrepancy 
                            ? "bg-success text-white" 
                            : "bg-slate-100 text-slate-600 hover:bg-success hover:text-white"
                        )}
                      >
                        <CheckCircle2 size={16} /> Correct
                      </button>
                      <button 
                        onClick={() => handleMarkDiscrepancy(item.id, expectedQty)}
                        className={clsx(
                          "flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors",
                          isDiscrepancy
                            ? "bg-danger text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-danger hover:text-white"
                        )}
                      >
                        <AlertTriangle size={16} /> Mark Disc.
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="text-center p-8 text-slate-500">
              <Filter size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No medications match your filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* STICKY BOTTOM SUBMIT BAR */}
      <div className="fixed bottom-0 left-0 right-0 md:pl-64 bg-white border-t border-slate-200 p-4 pb-safe z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1 hidden md:block">
            <p className="text-sm font-bold text-slate-800">{checkedItemsCount} items checked</p>
            <p className="text-xs text-slate-500">{totalItemsCount - checkedItemsCount} remaining</p>
          </div>
          <button 
            onClick={finishCheck}
            disabled={isSubmitting || checkedItemsCount === 0}
            className="btn-primary flex-1 py-3.5 shadow-md shadow-primary-500/20"
          >
            {isSubmitting ? 'Submitting...' : isComplete ? 'Complete Check' : 'Submit Partial Check'}
          </button>
        </div>
      </div>

    </div>
  );
};
