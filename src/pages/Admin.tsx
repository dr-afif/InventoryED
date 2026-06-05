import { useState } from 'react';
import { useStore } from '../store/useStore';
import { PackagePlus, PlusSquare, AlertTriangle, CheckCircle2, Users, UserPlus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';

export const Admin = () => {
  const { medications, addStock, addMedication, currentUser, users } = useStore();
  
  const [activeTab, setActiveTab] = useState<'restock' | 'new_med' | 'users'>('restock');
  const [successMessage, setSuccessMessage] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleUserFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserLoading(true);
    setUserError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const initials = (formData.get('initials') as string).toUpperCase();
    const role = formData.get('role') as 'admin' | 'supervisor' | 'staff';

    if (editingUser) {
      // Edit Mode
      const email = editingUser.email || editingUser.id;
      const { updateUser } = useStore.getState();
      const res = await updateUser(email, { name, role, initials });
      setUserLoading(false);
      if (res.success) {
        showSuccess('User account successfully updated!');
        setEditingUser(null);
      } else {
        setUserError(res.error || 'Failed to update user.');
      }
    } else {
      // Create Mode
      const email = formData.get('email') as string;
      const password = formData.get('password') as string || undefined;

      if (!name || !initials || !email || !role) {
        setUserError('Name, initials, email, and role are required.');
        setUserLoading(false);
        return;
      }

      const { addUser } = useStore.getState();
      const res = await addUser({ name, email, password, role, initials });
      setUserLoading(false);

      if (res.success) {
        showSuccess('User account successfully created!');
        e.currentTarget.reset();
      } else {
        setUserError(res.error || 'Failed to create user.');
      }
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    const userEmail = userToDelete.email || userToDelete.id;
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name} (${userEmail})? This will revoke their access.`)) {
      setUserLoading(true);
      setUserError(null);
      const { deleteUser } = useStore.getState();
      const res = await deleteUser(userEmail, userToDelete.id);
      setUserLoading(false);
      if (res.success) {
        showSuccess('User account deleted.');
        if (editingUser?.id === userToDelete.id) {
          setEditingUser(null);
        }
      } else {
        setUserError(res.error || 'Failed to delete user.');
      }
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRestock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const medicationId = formData.get('medicationId') as string;
    const quantity = Number(formData.get('quantity'));
    const expiryDate = formData.get('expiryDate') as string;
    const batchNumber = formData.get('batchNumber') as string;

    if (!medicationId || !quantity || !expiryDate) return;

    await addStock(medicationId, quantity, expiryDate, batchNumber);
    showSuccess('Stock successfully added!');
    e.currentTarget.reset();
  };

  const handleNewMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await addMedication({
      name: formData.get('name') as string,
      genericName: formData.get('genericName') as string,
      brandName: formData.get('brandName') as string,
      strength: formData.get('strength') as string,
      form: formData.get('form') as string,
      route: formData.get('route') as string,
      unit: formData.get('unit') as string,
      minStockLevel: Number(formData.get('minStockLevel')),
    });

    showSuccess('New medication registered!');
    e.currentTarget.reset();
  };

  if (currentUser?.role === 'staff') {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle size={48} className="mx-auto mb-4 text-warning" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p>You must be an Administrator or Supervisor to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 md:px-8 py-6 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Management Console</h2>
        <p className="text-slate-500 text-sm">Add new inventory and register medications.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* TABS */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('restock')}
              className={`flex-1 py-2.5 px-2 md:px-4 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'restock' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PackagePlus size={18} /> <span className="hidden sm:inline">Restock Item</span><span className="sm:hidden">Restock</span>
            </button>
            <button
              onClick={() => setActiveTab('new_med')}
              className={`flex-1 py-2.5 px-2 md:px-4 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'new_med' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PlusSquare size={18} /> <span className="hidden sm:inline">Register Medication</span><span className="sm:hidden">Medication</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2.5 px-2 md:px-4 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'users' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={18} /> <span className="hidden sm:inline">User Accounts</span><span className="sm:hidden">Users</span>
            </button>
          </div>

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
          {activeTab === 'restock' && (
            <motion.div
              key="restock"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <form onSubmit={handleRestock} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Medication</label>
                  <select name="medicationId" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                    <option value="">-- Choose Medication --</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>{med.name} ({med.genericName})</option>
                    ))}
                  </select>
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

                <button type="submit" className="btn-primary w-full mt-6">
                  Add Stock
                </button>
              </form>
            </motion.div>
          )}

          {/* NEW MEDICATION FORM */}
          {activeTab === 'new_med' && (
            <motion.div
              key="new_med"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <form onSubmit={handleNewMedication} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Display Name</label>
                  <input type="text" name="name" required placeholder="e.g. Adrenaline 1mg/10ml" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Generic Name</label>
                    <input type="text" name="genericName" required placeholder="e.g. Epinephrine" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Brand Name (Optional)</label>
                    <input type="text" name="brandName" placeholder="e.g. EpiPen" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Strength</label>
                    <input type="text" name="strength" required placeholder="e.g. 1mg/10ml" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Form</label>
                    <select name="form" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                      <option value="Ampoule">Ampoule</option>
                      <option value="Vial">Vial</option>
                      <option value="Syringe">Syringe</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Nebule">Nebule</option>
                      <option value="Infusion">Infusion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Route</label>
                    <input type="text" name="route" required placeholder="IV/IM" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Unit</label>
                    <input type="text" name="unit" required placeholder="vials" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Min Stock</label>
                    <input type="number" name="minStockLevel" required min="1" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-6">
                  Register Medication
                </button>
              </form>
            </motion.div>
          )}

          {/* USER ACCOUNTS PANEL */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Left Side: Users List */}
              <div className="md:col-span-7 space-y-4">
                <div className="card p-5">
                  <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Users size={18} className="text-primary-600" />
                    Clinical Profiles ({users.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {users.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-slate-300/30 text-sm">
                            {u.initials}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm leading-snug">{u.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono select-all">UID: {u.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : u.role === 'supervisor' 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                          }`}>
                            {u.role}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === currentUser?.id || u.email === currentUser?.email}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.id === currentUser?.id || u.email === currentUser?.email
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={u.id === currentUser?.id || u.email === currentUser?.email ? "Self-deletion disabled" : "Delete User"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Add/Edit User Form */}
              <div className="md:col-span-5 space-y-4">
                <div className="card p-5">
                  <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    {editingUser ? (
                      <>
                        <Pencil size={18} className="text-primary-600" />
                        Edit Account
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} className="text-primary-600" />
                        Register Account
                      </>
                    )}
                  </h3>

                  {userError && (
                    <div className="p-3 mb-4 bg-rose-50/60 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0" />
                      <span>{userError}</span>
                    </div>
                  )}

                  <form key={editingUser ? editingUser.id : 'new'} onSubmit={handleUserFormSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        defaultValue={editingUser?.name || ''} 
                        placeholder="e.g. Jane Doe" 
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white text-sm transition-colors" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Initials</label>
                        <input 
                          type="text" 
                          name="initials" 
                          required 
                          maxLength={3} 
                          defaultValue={editingUser?.initials || ''} 
                          placeholder="e.g. JD" 
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white text-sm transition-colors uppercase" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Role</label>
                        <select 
                          name="role" 
                          required 
                          defaultValue={editingUser?.role || 'staff'} 
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white text-sm transition-colors"
                        >
                          <option value="staff">Staff</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        defaultValue={editingUser?.email || editingUser?.id || ''} 
                        readOnly={!!editingUser} 
                        placeholder="name@hospital.com" 
                        className={`w-full p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm transition-colors ${
                          editingUser 
                            ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none' 
                            : 'bg-slate-50 focus:bg-white'
                        }`} 
                      />
                    </div>

                    {!editingUser && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Password (Optional)</label>
                        <input 
                          type="password" 
                          name="password" 
                          minLength={6} 
                          placeholder="Leave blank for Google OAuth only" 
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-slate-50 focus:bg-white text-sm transition-colors" 
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {editingUser && (
                        <button 
                          type="button" 
                          onClick={() => setEditingUser(null)} 
                          className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <X size={15} /> Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        disabled={userLoading} 
                        className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {userLoading ? (
                          editingUser ? 'Saving...' : 'Creating...'
                        ) : (
                          editingUser ? 'Save Changes' : 'Register User'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
