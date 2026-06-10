import { useStore } from '../store/useStore';
import { Package, AlertTriangle, Clock, CheckCircle2, ClipboardCheck, AlertOctagon, History, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { inventory, medications, auditLogs, isSupabaseConnected } = useStore();
  const navigate = useNavigate();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // General Stats
  const totalItemsCount = inventory.length;
  
  const lowStockItems = inventory.filter(inv => {
    return inv.currentQuantity <= inv.minStockLevel;
  });

  const expiringSoonItems = inventory.filter(inv => new Date(inv.expiryDate) <= ninetyDaysFromNow);

  // Daily Check Stats
  const checkedTodayCount = inventory.filter(inv => {
    if (!inv.lastCheckedAt) return false;
    return new Date(inv.lastCheckedAt) >= todayStart;
  }).length;

  const uncheckedCount = totalItemsCount - checkedTodayCount;
  const isCheckedToday = totalItemsCount > 0 && uncheckedCount === 0;

  const discrepancyCountToday = auditLogs.filter(log => {
    return log.action === 'daily_check' && log.quantityChange !== 0 && new Date(log.timestamp) >= todayStart;
  }).length;

  const dailyCheckProgress = totalItemsCount > 0 ? Math.round((checkedTodayCount / totalItemsCount) * 100) : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
      {!isSupabaseConnected && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={20} />
          <div>
            <h3 className="font-bold text-sm">Supabase Not Connected</h3>
            <p className="text-xs mt-1">
              You are currently using the local mock database. To connect to Supabase, configure your environment variables.
            </p>
          </div>
        </div>
      )}

      {/* TOP HERO CARD - DAILY CHECK STATUS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ClipboardCheck size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md ${isCheckedToday ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning-700'}`}>
                {isCheckedToday ? 'Completed' : 'Pending'}
              </span>
              <span className="text-sm font-bold text-slate-500">Today's Check</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-1">
              Central ED Inventory
            </h2>
            <p className="text-slate-500">
              {checkedTodayCount} of {totalItemsCount} medications verified.
            </p>
            
            {!isCheckedToday && totalItemsCount > 0 && (
              <div className="mt-4 flex items-center gap-3 max-w-sm">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${dailyCheckProgress}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-400">{dailyCheckProgress}%</span>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto shrink-0">
            {isCheckedToday ? (
              <div className="flex items-center gap-3 bg-success/5 text-success px-6 py-4 rounded-xl border border-success/20">
                <CheckCircle2 size={24} />
                <span className="font-bold">All caught up!</span>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/check')}
                className="btn-primary w-full md:w-auto py-4 px-8 text-lg shadow-lg shadow-primary-500/30"
              >
                {checkedTodayCount > 0 ? 'Continue Check' : 'Start Daily Check'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* URGENT ALERTS */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 px-1 flex items-center gap-2">
          <AlertTriangle size={18} className="text-danger" /> Urgent Alerts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 bg-white border-l-4 border-danger hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/inventory')}>
            <p className="text-sm font-medium text-slate-500 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-slate-800">{lowStockItems.length}</p>
          </div>
          <div className="card p-4 bg-white border-l-4 border-amber-500 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 mb-1">Unchecked Today</p>
            <p className="text-2xl font-bold text-slate-800">{uncheckedCount}</p>
          </div>
          <div className="card p-4 bg-white border-l-4 border-rose-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/logs')}>
            <p className="text-sm font-medium text-slate-500 mb-1">Discrepancies</p>
            <p className="text-2xl font-bold text-slate-800">{discrepancyCountToday}</p>
          </div>
          <div className="card p-4 bg-white border-l-4 border-warning hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-slate-800">{expiringSoonItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* QUICK ACTIONS */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="font-bold text-slate-800 mb-3 px-1">Quick Actions</h3>
          
          <Link to="/check" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg group-hover:bg-primary-200 transition-colors">
                <ClipboardCheck size={20} />
              </div>
              <span className="font-bold text-slate-700">Daily Check</span>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
          </Link>
          
          <Link to="/admin" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Package size={20} />
              </div>
              <span className="font-bold text-slate-700">Restock / Add Items</span>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link to="/inventory" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <AlertOctagon size={20} />
              </div>
              <span className="font-bold text-slate-700">View Master Inventory</span>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </Link>
          
          <Link to="/logs" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-200 transition-colors">
                <History size={20} />
              </div>
              <span className="font-bold text-slate-700">Audit Logs</span>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </Link>
        </div>

        {/* LOW STOCK LIST PREVIEW */}
        <div className="md:col-span-2">
          <div className="card overflow-hidden h-full">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Critical Low Stock</h3>
              <Link to="/inventory" className="text-sm text-primary-600 font-bold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {lowStockItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No critical low stock items!</div>
              ) : (
                lowStockItems.map(inv => {
                  const med = medications.find(m => m.id === inv.medicationId);
                  return (
                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{med?.displayName || med?.name}</p>
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
    </div>
  );
};
