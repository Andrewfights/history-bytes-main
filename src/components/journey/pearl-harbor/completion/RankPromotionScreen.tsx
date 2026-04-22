/**
 * RankPromotionScreen - Medal ceremony when user crosses a rank threshold
 * Full dramatic reveal with laurel rays, medal icon, new rank title, and unlocks
 */

import { motion } from 'framer-motion';
import { ArrowRight, X, Shield, Unlock } from 'lucide-react';

interface RankPromotionProps {
  newRank: string;
  previousRank: string;
  unlockedFeatures: Array<{
    title: string;
    description?: string;
  }>;
  hostName: string;
  hostMessage: string;
  onAccept: () => void;
  onViewProfile?: () => void;
  onClose?: () => void;
}

export function RankPromotionScreen({
  newRank,
  previousRank,
  unlockedFeatures,
  hostName,
  hostMessage,
  onAccept,
  onViewProfile,
  onClose,
}: RankPromotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-void flex flex-col overflow-y-auto"
    >
      {/* Ceremony background - more dramatic */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 20%, rgba(230,171,42,0.28) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 70%, rgba(178,100,31,0.12) 0%, transparent 45%),
              radial-gradient(ellipse at 80% 70%, rgba(205,14,20,0.1) 0%, transparent 45%)
            `
          }}
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(230,171,42,0.5) 1px, transparent 2px),
              radial-gradient(circle at 85% 15%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 75% 40%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 25% 55%, rgba(230,171,42,0.5) 1px, transparent 2px),
              radial-gradient(circle at 60% 70%, rgba(230,171,42,0.3) 1px, transparent 2px),
              radial-gradient(circle at 10% 85%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 90% 90%, rgba(230,171,42,0.3) 1px, transparent 2px)
            `
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        {onClose && (
          <button onClick={onClose} className="p-2 -ml-2 text-off-white/50 hover:text-off-white">
            <X size={20} />
          </button>
        )}
        <div className="flex-1" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 py-4 text-center">
        {/* Promotion label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px bg-ha-red" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-ha-red uppercase font-bold">
            Promotion
          </span>
          <div className="w-8 h-px bg-ha-red" />
        </motion.div>

        {/* Medal with laurel rays */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 12 }}
          className="relative mb-6"
        >
          {/* Laurel rays (conic gradient) */}
          <div
            className="absolute -inset-10 rounded-full opacity-30"
            style={{
              background: `conic-gradient(from 0deg,
                transparent 0deg 10deg,
                rgba(230,171,42,0.4) 10deg 12deg,
                transparent 12deg 40deg,
                rgba(230,171,42,0.3) 40deg 42deg,
                transparent 42deg 80deg,
                rgba(230,171,42,0.4) 80deg 82deg,
                transparent 82deg 100deg,
                rgba(230,171,42,0.3) 100deg 102deg,
                transparent 102deg 140deg,
                rgba(230,171,42,0.4) 140deg 142deg,
                transparent 142deg 180deg,
                rgba(230,171,42,0.3) 180deg 182deg,
                transparent 182deg 220deg,
                rgba(230,171,42,0.4) 220deg 222deg,
                transparent 222deg 260deg,
                rgba(230,171,42,0.3) 260deg 262deg,
                transparent 262deg 300deg,
                rgba(230,171,42,0.4) 300deg 302deg,
                transparent 302deg 340deg,
                rgba(230,171,42,0.3) 340deg 342deg,
                transparent 342deg 360deg
              )`,
              mask: 'radial-gradient(circle, transparent 55%, black 56%)'
            }}
          />

          {/* Outer medal ring */}
          <div
            className="w-[180px] h-[180px] rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(246,227,85,0.15), transparent 55%),
                linear-gradient(135deg, rgba(230,171,42,0.12), rgba(178,100,31,0.08))
              `,
              border: '3px solid #E6AB2A',
              boxShadow: `
                inset 0 0 40px rgba(230,171,42,0.25),
                0 0 60px rgba(230,171,42,0.25)
              `
            }}
          >
            {/* Inner ring */}
            <div
              className="absolute inset-[14px] rounded-full flex items-center justify-center"
              style={{ border: '1.5px solid #B2641F' }}
            >
              {/* Dashed inner ring */}
              <div
                className="absolute -inset-[6px] rounded-full"
                style={{ border: '1px dashed rgba(230,171,42,0.25)' }}
              />

              {/* Medal icon */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="text-gold-2"
                style={{ filter: 'drop-shadow(0 0 12px rgba(230,171,42,0.4))' }}
              >
                <Shield size={52} strokeWidth={1.5} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* New rank name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h1
            className="font-display text-[34px] font-bold leading-tight uppercase mb-2"
            style={{
              background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            {newRank.split(' ').map((word, i) => (
              <span key={i}>
                {word}
                {i < newRank.split(' ').length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="font-sans text-[11px] text-off-white/50 italic mb-6">
            Promoted from {previousRank}
          </p>
        </motion.div>

        {/* Unlocked features */}
        {unlockedFeatures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-xs space-y-2 mb-5"
          >
            {unlockedFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-ink-lift border border-gold-2/15 rounded-[10px] p-3 flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(230,171,42,0.12)',
                    border: '1px solid rgba(230,171,42,0.3)'
                  }}
                >
                  <Unlock size={12} className="text-gold-2" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-mono text-[8px] tracking-[0.2em] text-gold-2 uppercase font-semibold mb-0.5">
                    ◆ Unlocked
                  </div>
                  <div className="font-sans text-[11px] text-off-white font-medium">
                    {feature.title}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Host message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs bg-ink-lift border border-gold-2/15 rounded-[10px] p-3 mb-6 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ha-red" />

          <div className="flex gap-3 pl-2">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #5a3a1a, #2a1a08)',
                border: '1px solid #6A3A12'
              }}
            />

            <div className="flex-1 text-left">
              <div className="font-mono text-[8px] text-gold-2 tracking-[0.25em] uppercase font-bold mb-1">
                ◆ {hostName}
              </div>
              <p className="font-sans text-[10.5px] text-off-white/70 leading-relaxed italic">
                "{hostMessage}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-xs space-y-2"
        >
          {/* Accept button */}
          <button
            onClick={onAccept}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-8 rounded-[10px] font-display text-sm font-bold uppercase tracking-[0.15em] bg-ha-red text-off-white relative"
          >
            <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
            <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
            Continue
            <ArrowRight size={16} />
          </button>

          {/* View profile button */}
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="w-full py-2 font-mono text-[10px] tracking-[0.2em] text-off-white/70 uppercase font-semibold hover:text-off-white transition-colors"
            >
              View Profile
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
