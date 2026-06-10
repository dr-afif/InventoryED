import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh = ({ children, onRefresh }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const controls = useAnimation();
  
  const pullDistance = useRef(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const dy = currentY - startY.current;

      if (dy > 0 && el.scrollTop <= 0) {
        // Prevent native scrolling behavior when pulling down
        if (e.cancelable) {
          e.preventDefault();
        }
        
        // Apply resistance mapping to make it feel natural
        pullDistance.current = Math.min(dy * 0.4, 120);
        setPullProgress(pullDistance.current);
        controls.set({ y: pullDistance.current });
      } else if (dy < 0) {
        isPulling.current = false;
        pullDistance.current = 0;
        setPullProgress(0);
        controls.start({ y: 0 });
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      // Threshold to trigger refresh
      if (pullDistance.current > 60 && !isRefreshing) {
        setIsRefreshing(true);
        setPullProgress(60);
        controls.start({ y: 60, transition: { type: 'spring', bounce: 0.5 } });
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullProgress(0);
          pullDistance.current = 0;
          controls.start({ y: 0, transition: { type: 'spring', bounce: 0 } });
        }
      } else {
        pullDistance.current = 0;
        setPullProgress(0);
        controls.start({ y: 0, transition: { type: 'spring', bounce: 0 } });
      }
    };

    // Use passive: false so we can preventDefault() and stop the native scroll
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [controls, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto w-full relative touch-pan-y scroll-smooth">
      <motion.div
        animate={controls}
        initial={{ y: 0 }}
        className="min-h-full relative"
      >
        {/* Refresh Indicator Header */}
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 w-full -translate-y-full"
        >
          <div 
            className={`w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? 'scale(1)' : `scale(${Math.min(pullProgress / 60, 1)}) rotate(${pullProgress * 3}deg)`,
              opacity: Math.min(pullProgress / 40, 1)
            }}
          >
            <RefreshCw 
              size={20} 
              className={isRefreshing ? 'text-primary-600' : 'text-slate-400'} 
            />
          </div>
        </div>

        {/* Content */}
        {children}
      </motion.div>
    </div>
  );
};
