import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface FunnelExitDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onExit: () => void;
}

export function FunnelExitDialog({ isOpen, onContinue, onExit }: FunnelExitDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onContinue}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-amber-400" />
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg text-center mb-2">
                You are in the middle of a classified operation.
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Your progress will be saved and you can resume later.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onExit}
                  className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Exit Anyway
                </button>
                <button
                  onClick={onContinue}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue Mission
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
