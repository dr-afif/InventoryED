import { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  Database, 
  Server, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SignIn = () => {
  const { signIn, isSupabaseConnected } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDemoHelp, setShowDemoHelp] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (err) throw err;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google login.');
      setIsLoading(false);
    }
  };

  // Variants for framer-motion animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center bg-slate-950 overflow-hidden text-slate-100 py-12 px-4 selection:bg-primary-500/30 selection:text-primary-200">
      
      {/* Premium Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[130px]" />
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md relative z-10">
        
        {/* System Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/20 mb-4 relative"
          >
            ED
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-950"></span>
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="font-bold text-2xl tracking-tight text-white mb-1.5"
          >
            Inventory<span className="text-cyan-400">ED</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-semibold text-slate-400 tracking-widest uppercase flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-cyan-400" />
            Clinical Access Terminal
          </motion.p>
        </div>

        {/* Auth Panel Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)] w-full relative overflow-hidden"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-200">System Sign-In</h2>
              <p className="text-xs text-slate-400 mt-1">Authenticate to access emergency medicine logs and storage</p>
            </div>

            {/* Error Notification */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="font-semibold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isLoading || success}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Passcode / Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading || success}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={isLoading || success}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-primary-600 hover:from-cyan-500 hover:to-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : success ? (
                  <span>Access Granted...</span>
                ) : (
                  <span>Access Terminal</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              <div className="absolute inset-x-0 h-px bg-slate-800/80"></div>
              <span className="relative px-3 bg-slate-900/60 backdrop-blur-md">Or Connect Via</span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              disabled={isLoading || success}
              onClick={handleGoogleSignIn}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Demo helper and Connection indicators */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-4 mt-8">
        
        {/* Connection status badge */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Server size={13} className="text-slate-400" />
            <span>Platform: <span className="text-slate-300 font-bold">Vite+TS</span></span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Database size={13} className={isSupabaseConnected ? 'text-emerald-500' : 'text-amber-500'} />
            <span className="flex items-center gap-1">
              Data: 
              <span className={isSupabaseConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {isSupabaseConnected ? 'Supabase Live' : 'Offline Sandbox'}
              </span>
            </span>
          </div>
        </div>

        {/* Demo credentials helper drawer */}
        <div className="w-full bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md">
          <button 
            onClick={() => setShowDemoHelp(prev => !prev)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-900/40 transition-colors text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={15} className="text-cyan-400 animate-pulse" />
              <span>Clinical Test Accounts</span>
            </div>
            {showDemoHelp ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          
          <AnimatePresence>
            {showDemoHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-slate-800/40 bg-slate-950/40 px-5 py-4 text-slate-400 text-xs font-medium space-y-2.5"
              >
                <p className="text-[11px] text-slate-500 mb-1 leading-snug">
                  Click a card to auto-fill the login form for testing clinical roles:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutofill('sarah@inventoryed.com', 'staff123')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="block font-bold text-white text-[11px]">Sarah Jenkins (Staff)</span>
                      <span className="block text-slate-500 text-[10px]">sarah@inventoryed.com</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/20 px-2 py-0.5 rounded font-bold">staff123</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleAutofill('robert@inventoryed.com', 'super123')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="block font-bold text-white text-[11px]">Dr. Robert Chen (Supervisor)</span>
                      <span className="block text-slate-500 text-[10px]">robert@inventoryed.com</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/30 border border-amber-800/20 px-2 py-0.5 rounded font-bold">super123</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofill('admin@inventoryed.com', 'admin123')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="block font-bold text-white text-[11px]">Admin User (Admin)</span>
                      <span className="block text-slate-500 text-[10px]">admin@inventoryed.com</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 bg-red-950/30 border border-red-800/20 px-2 py-0.5 rounded font-bold">admin123</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
