import { useStore } from '../store/useStore';
import { Package, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { inventory, medications } = useStore();

  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Stats
  const totalItemsCount = inventory.length;
  
  const lowStockItems = inventory.filter(inv => {
    return inv.currentQuantity <= inv.minStockLevel;
  });

  const expiringSoonItems = inventory.filter(inv => new Date(inv.expiryDate) <= ninetyDaysFromNow);

  // Central ED check status
  const isCheckedToday = inventory.every(i => {
    if (!i.lastCheckedAt) return false;
    const hoursSinceCheck = (now.getTime() - new Date(i.lastCheckedAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCheck <= 24;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
      {!useStore(state => state.isSupabaseConnected) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={20} />
          <div>
            <h3 className="font-bold text-sm">Supabase Not Connected</h3>
            <p className="text-xs mt-1">
              You are currently using the local mock database. To connect to Supabase, create an <code>.env.local</code> file with your URL and Anon Key, and run the SQL schema.
            </p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
        <p className="text-slate-500">Status of your Central ED Inventory</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-white border-l-4 border-primary-500">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Package size={18} />
            <span className="text-sm font-medium">Total Items</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalItemsCount}</p>
        </div>
        
        <div className="card p-4 bg-white border-l-4 border-danger">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <AlertTriangle size={18} className="text-danger" />
            <span className="text-sm font-medium">Low Stock</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{lowStockItems.length}</p>
        </div>

        <div className="card p-4 bg-white border-l-4 border-warning">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock size={18} className="text-warning" />
            <span className="text-sm font-medium">Expiring Soon</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{expiringSoonItems.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Action Required: Checks */}
        <div className="card overflow-hidden">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Daily Inventory Check</h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 h-full">
            {isCheckedToday ? (
              <>
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">All Good!</p>
                  <p className="text-sm text-slate-500">Inventory was verified today.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-warning/10 text-warning-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Check Pending</p>
                  <p className="text-sm text-slate-500">Daily inventory count is required.</p>
                </div>
                <Link to="/check" className="btn-primary w-full max-w-[200px] mt-2 py-2">
                  Start Check
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Alerts: Low Stock */}
        <div className="card overflow-hidden">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Action Required: Low Stock</h3>
            <Link to="/inventory" className="text-sm text-primary-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No low stock items!</div>
            ) : (
              lowStockItems.map(inv => {
                const med = medications.find(m => m.id === inv.medicationId);
                return (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{med?.name}</p>
                      <p className="text-xs text-slate-500">{med?.genericName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-danger">{inv.currentQuantity} <span className="text-xs font-normal">left</span></p>
                      <p className="text-xs text-slate-500">Min: {inv.minStockLevel}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
