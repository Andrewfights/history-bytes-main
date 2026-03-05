import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Badge, RARITY_CONFIG, CATEGORY_CONFIG } from '@/types/badges';
import { useApp } from '@/context/AppContext';
import { CelebrationOverlay } from '@/components/journey/CelebrationOverlay';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeUnlockModal({ badge, isOpen, onClose }: BadgeUnlockModalProps) {
  const { markBadgeSeen, addXP } = useApp();

  if (!badge) return null;

  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const categoryConfig = CATEGORY_CONFIG[badge.category];

  const handleContinue = () => {
    markBadgeSeen(badge.id);
    if (badge.xpBonus) {
      addXP(badge.xpBonus);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {/* Celebration particles */}
          <CelebrationOverlay />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative bg-card border border-border rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
          >
            {/* Close button */}
            <button
              onClick={handleContinue}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X size={18} className="text-muted-foreground" />
            </button>

            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
                Achievement Unlocked
              </span>
            </motion.div>

            {/* Badge icon with glow */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="relative mb-6"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 ${rarityConfig.bgColor} rounded-full blur-xl opacity-50 scale-150`} />

              <div
                className={`relative inline-flex items-center justify-center w-28 h-28 rounded-3xl text-7xl ${rarityConfig.bgColor} border-2 ${rarityConfig.color.replace('text-', 'border-')}/30`}
              >
                <motion.span
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  {badge.icon}
                </motion.span>
              </div>
            </motion.div>

            {/* Badge name */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-2xl font-bold mb-2 ${rarityConfig.color}`}
            >
              {badge.name}
            </motion.h2>

            {/* Rarity & Category */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${rarityConfig.bgColor} ${rarityConfig.color}`}>
                {rarityConfig.label}
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-medium ${categoryConfig.color}`}>
                {categoryConfig.icon} {categoryConfig.label}
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground mb-6"
            >
              {badge.description}
            </motion.p>

            {/* XP bonus */}
            {badge.xpBonus && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-bold mb-6"
              >
                <Sparkles size={18} />
                <span>+{badge.xpBonus} XP</span>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleContinue}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
