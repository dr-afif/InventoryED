import { useState, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Check, Edit2 } from 'lucide-react';
import type { Medication, InventoryItem } from '../types';
import clsx from 'clsx';

interface Props {
  item: InventoryItem;
  medication: Medication;
  onConfirm: (actualQty: number) => void;
  onEdit: () => void;
}

export const SwipeableCheckItem = ({ item, medication, onConfirm, onEdit }: Props) => {
  const [isChecked, setIsChecked] = useState(false);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background colors based on swipe distance
  const bgOpacity = useTransform(x, [-100, 0, 100], [1, 0, 1]);
  const bgColor = useTransform(
    x,
    [-100, 0, 100],
    ['rgb(239, 68, 68)', 'rgb(248, 250, 252)', 'rgb(16, 185, 129)'] // Red -> Slate50 -> Emerald
  );

  const handleDragEnd = async (_event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      // Swipe Right -> Correct
      setIsChecked(true);
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onConfirm(item.currentQuantity);
    } else if (offset < -100 || velocity < -500) {
      // Swipe Left -> Edit/Discrepancy
      await controls.start({ x: 0, transition: { type: 'spring', bounce: 0.5 } });
      onEdit();
    } else {
      // Reset
      controls.start({ x: 0, transition: { type: 'spring', bounce: 0.5 } });
    }
  };

  if (isChecked) return null;

  return (
    <div className="relative w-full mb-3 rounded-xl overflow-hidden bg-slate-100" ref={containerRef}>
      {/* Background Actions */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-between px-6"
        style={{ opacity: bgOpacity, backgroundColor: bgColor }}
      >
        <div className="flex items-center gap-2 text-white font-bold">
          <Edit2 size={24} />
          <span>Edit Qty</span>
        </div>
        <div className="flex items-center gap-2 text-white font-bold">
          <span>Correct</span>
          <Check size={24} />
        </div>
      </motion.div>

      {/* Swipeable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }} // Snap back unless dragged far enough
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{medication.name}</h3>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Expected</p>
              <p className="font-bold text-xl text-slate-800">{item.currentQuantity}</p>
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{medication.form}</span>
            <span>•</span>
            <span className={clsx("text-xs font-medium", 
              new Date(item.expiryDate) < new Date(Date.now() + 90 * 86400000) ? 'text-warning' : 'text-slate-500'
            )}>
              Exp: {new Date(item.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
