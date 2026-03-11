/**
 * LeaveConfirmDialog - Confirmation dialog when user tries to leave mid-lesson
 * Prevents accidental progress loss
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface LeaveConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function LeaveConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Leave Lesson?",
  message = "Your progress will be saved, but you'll need to resume from your last checkpoint.",
  confirmText = "Leave",
  cancelText = "Stay",
}: LeaveConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-2 text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Warning icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center"
              >
                <AlertTriangle size={32} className="text-amber-400" />
              </motion.div>

              {/* Title */}
              <h2 className="font-editorial text-xl font-bold text-white mb-2">
                {title}
              </h2>

              {/* Message */}
              <p className="text-white/60 text-sm mb-6">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LeaveConfirmDialog;
