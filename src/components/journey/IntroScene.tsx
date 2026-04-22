import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface IntroSceneProps {
  /** Beat/lesson title shown in header */
  headerTitle: string;
  /** Beat number indicator (e.g. "Beat 5 of 10") */
  beatIndicator?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Host avatar URL */
  avatarUrl?: string;
  /** Icon to display in the body (React node) */
  icon?: React.ReactNode;
  /** Main title displayed prominently */
  title: string;
  /** Subtitle or secondary title (optional) */
  subtitle?: string;
  /** Body text describing the scene */
  bodyText: string;
  /** Timestamp to display */
  timestamp?: {
    time: string;
    subtitle?: string;
  };
  /** CTA button text */
  ctaText: string;
  /** Called when CTA button is clicked */
  onCta: () => void;
  /** Called when skip link is clicked (optional) */
  onSkip?: () => void;
  /** Called when back button is clicked */
  onBack: () => void;
  /** Skip button text */
  skipText?: string;
}

export function IntroScene({
  headerTitle,
  beatIndicator,
  progress = 0,
  avatarUrl,
  icon,
  title,
  subtitle,
  bodyText,
  timestamp,
  ctaText,
  onCta,
  onSkip,
  onBack,
  skipText = 'Skip this beat',
}: IntroSceneProps) {
  return (
    <div className="fixed inset-0 bg-void flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-off-white/5 border border-off-white/10 flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-off-white" />
          </button>

          {/* Title and beat indicator */}
          <div className="flex-1 text-center px-4">
            <h1 className="font-serif text-base font-bold text-off-white">{headerTitle}</h1>
            {beatIndicator && (
              <p className="font-mono text-[10px] text-off-white/50 uppercase tracking-wider mt-0.5">
                {beatIndicator}
              </p>
            )}
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-ink-lift border border-off-white/10 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gold-2/20 to-gold-3/20" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-off-white/[0.06]">
          <motion.div
            className="h-full bg-ha-red"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Body content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* Icon */}
        {icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-ink-lift border border-gold-2/20 flex items-center justify-center text-gold-2 mb-6"
          >
            {icon}
          </motion.div>
        )}

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display text-4xl md:text-5xl font-bold uppercase text-off-white leading-tight mb-4"
        >
          {title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < title.split('\n').length - 1 && <br />}
            </span>
          ))}
        </motion.h2>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-lg italic text-gold-2 mb-4"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-body text-off-white/70 text-base leading-relaxed max-w-md mb-6"
        >
          {bodyText}
        </motion.p>

        {/* Timestamp */}
        {timestamp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-4 rounded-xl bg-ink-lift border border-off-white/[0.06]"
          >
            <div className="font-mono text-xl font-bold text-gold-2 mb-1">
              {timestamp.time}
            </div>
            {timestamp.subtitle && (
              <div className="font-mono text-[10px] text-off-white/50 uppercase tracking-wider">
                {timestamp.subtitle}
              </div>
            )}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onCta}
          className="btn-ha-red px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.15em] mb-4"
        >
          {ctaText}
        </motion.button>

        {/* Skip link */}
        {onSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onSkip}
            className="font-mono text-xs text-off-white/40 hover:text-off-white/60 uppercase tracking-wider transition-colors"
          >
            {skipText}
          </motion.button>
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-16 left-4 w-6 h-6 border-l border-t border-gold-2/15 rounded-tl pointer-events-none" />
      <div className="absolute top-16 right-4 w-6 h-6 border-r border-t border-gold-2/15 rounded-tr pointer-events-none" />
      <div className="absolute bottom-20 left-4 w-6 h-6 border-l border-b border-gold-2/15 rounded-bl pointer-events-none" />
      <div className="absolute bottom-20 right-4 w-6 h-6 border-r border-b border-gold-2/15 rounded-br pointer-events-none" />
    </div>
  );
}
