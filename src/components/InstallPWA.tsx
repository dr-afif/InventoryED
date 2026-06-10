import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('pwaPromptDismissed') === 'true'
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // On mobile, to avoid clashing with the bottom nav bar, we place it slightly higher
  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-[80px] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-slate-800 text-white p-4 rounded-2xl shadow-2xl z-[60] flex items-center gap-3"
      >
        <div className="bg-primary-500 p-2 rounded-xl shrink-0">
          <Download size={20} className="text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-sm leading-tight">Install InventoryED</h3>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">Add to home screen for quick offline access.</p>
        </div>
        
        <div className="flex flex-col gap-1 shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Install
          </button>
          <button 
            onClick={handleDismiss}
            className="text-[10px] text-slate-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
