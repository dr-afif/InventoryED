import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, Package, History, Settings, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SignIn } from './SignIn';
import { PullToRefresh } from './PullToRefresh';
import clsx from 'clsx';

const baseNavItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: ClipboardCheck, label: 'Weekly Check', path: '/check' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: History, label: 'Logs', path: '/logs' },
];

import { PendingApproval } from './PendingApproval';
import { ProfileModal } from './ProfileModal';

export const Layout = () => {
  const { currentUser, signOut } = useStore();
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!currentUser) {
    return <SignIn />;
  }

  if (currentUser.status === 'pending') {
    return <PendingApproval />;
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'supervisor';
  
  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ icon: Settings, label: 'Manage', path: '/admin' }] : []),
  ];



  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            ED
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">InventoryED</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium',
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex-1 flex items-center gap-3 px-2 py-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
            title="Profile Settings"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              {currentUser?.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser?.role}</p>
            </div>
          </button>
          
          <button onClick={signOut} className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors ml-2 shrink-0" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ED
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800">InventoryED</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full transition-colors" title="Profile Settings">
              <div className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                {currentUser?.initials}
              </div>
              <span className="text-xs font-bold uppercase hidden sm:inline">Profile</span>
            </button>
            
            <button onClick={signOut} className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full transition-colors" title="Sign Out">
              <LogOut size={13} className="text-rose-500" />
              <span className="text-xs font-bold uppercase hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content wrapped with PullToRefresh */}
        <PullToRefresh onRefresh={async () => {
          // If you want a full PWA reload instead of just data fetch:
          window.location.reload();
        }}>
          <div className="pb-20 md:pb-0 min-h-full">
            <Outlet />
          </div>
        </PullToRefresh>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pb-safe z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors',
                  isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon size={22} className={isActive ? 'text-primary-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx("text-[10px] font-medium", isActive ? "font-bold" : "")}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </main>

      {/* Profile & Settings Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};
