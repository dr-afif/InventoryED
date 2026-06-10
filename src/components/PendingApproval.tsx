import { useStore } from '../store/useStore';
import { LogOut, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const PendingApproval = () => {
  const { signOut, currentUser } = useStore();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background styling similar to SignIn */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-6">
          <Clock size={32} />
        </div>

        <h2 className="text-2xl font-bold text-slate-200 mb-2">Pending Approval</h2>
        <p className="text-sm text-slate-400 mb-6">
          Hello <strong>{currentUser?.name || 'User'}</strong>,<br/>
          Your account registration is currently pending review. An administrator must approve your clinical access before you can use the system.
        </p>

        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-8 text-left flex gap-3">
          <ShieldAlert size={20} className="text-cyan-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            Please allow up to 24 hours for account verification. If you need immediate access, contact the ED supervisor on duty.
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
};
