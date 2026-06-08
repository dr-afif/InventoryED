import { useState } from 'react';
import { useStore } from '../store/useStore';
import { SwipeableCheckItem } from '../components/SwipeableCheckItem';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DailyCheck = () => {
  const { inventory, medications, submitDailyCheck } = useStore();
  
  // Checking State
  const [checkedItems, setCheckedItems] = useState<Record<string, number>>({});
  const [editingItem, setEditingItem] = useState<{ invId: string, currentQty: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Since we use a centralized inventory, we check all items
  const locationItems = inventory;

  const itemsLeftToCheck = locationItems.filter(item => checkedItems[item.id] === undefined);
  const isComplete = locationItems.length > 0 && itemsLeftToCheck.length === 0;

  const handleConfirmQty = (invId: string, qty: number) => {
    setCheckedItems(prev => ({ ...prev, [invId]: qty }));
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const qty = Number(formData.get('quantity'));
    if (editingItem) {
      handleConfirmQty(editingItem.invId, qty);
      setEditingItem(null);
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
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* HEADER */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">Central ED Inventory Check</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isComplete ? 'All items checked' : `${itemsLeftToCheck.length} items remaining`}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-xl mx-auto pb-24">
          
          {/* INSTRUCTIONS */}
          {!isComplete && itemsLeftToCheck.length === locationItems.length && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 flex gap-3 text-sm border border-blue-100">
              <AlertTriangle size={20} className="shrink-0 text-blue-600" />
              <p><strong>Swipe right</strong> to confirm correct quantity. <strong>Swipe left</strong> to report a discrepancy or edit.</p>
            </motion.div>
          )}

          {/* LIST */}
          <AnimatePresence>
            {itemsLeftToCheck.map((item) => {
              const med = medications.find(m => m.id === item.medicationId);
              if (!med) return null;
              return (
                <SwipeableCheckItem
                  key={item.id}
                  item={item}
                  medication={med}
                  onConfirm={qty => handleConfirmQty(item.id, qty)}
                  onEdit={() => setEditingItem({ invId: item.id, currentQty: item.currentQuantity })}
                />
              );
            })}
          </AnimatePresence>

          {/* COMPLETION STATE */}
          {isComplete && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4 border-success/30 bg-success/5 mt-8">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Ready to Submit</h3>
              <p className="text-slate-600 text-sm">All medications have been verified.</p>
              
              <button 
                onClick={finishCheck} 
                disabled={isSubmitting}
                className="btn-primary w-full mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Daily Check'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center"
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Edit Quantity</h3>
                <p className="text-slate-500 mb-6 text-sm">Enter the actual quantity counted for this medication.</p>
                
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Actual Quantity</label>
                    <input 
                      type="number" 
                      name="quantity"
                      defaultValue={editingItem.currentQty}
                      autoFocus
                      min={0}
                      className="w-full text-center text-3xl font-bold py-4 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn-primary flex-1">Confirm</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
