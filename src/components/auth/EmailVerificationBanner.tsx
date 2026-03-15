/**
 * EmailVerificationBanner - Shows when user's email is not verified
 * Provides option to resend verification email
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function EmailVerificationBanner() {
  const { user, emailVerified, sendVerificationEmail, reloadUser, isConfigured } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Don't show if not configured, no user, verified, or dismissed
  if (!isConfigured || !user || emailVerified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    setMessage(null);
    try {
      await sendVerificationEmail();
      setMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to send email',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      await reloadUser();
      // If still not verified after reload
      if (!user.emailVerified) {
        setMessage({
          type: 'error',
          text: 'Email not verified yet. Please check your inbox.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Could not check verification status. Please try again.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Mail size={20} className="text-amber-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Verify your email
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Please verify <span className="text-foreground">{user.email}</span> to secure your account.
            </p>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs mt-2 ${
                  message.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {message.text}
              </motion.p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-xs font-medium disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={12} />
                    Resend email
                  </>
                )}
              </button>

              <button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors text-xs font-medium disabled:opacity-50"
              >
                {isChecking ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} />
                    I've verified
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
