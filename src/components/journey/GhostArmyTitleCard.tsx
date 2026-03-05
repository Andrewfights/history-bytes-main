import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GhostArmyTitleCardProps {
  onComplete: () => void;
}

export function GhostArmyTitleCard({ onComplete }: GhostArmyTitleCardProps) {
  const [phase, setPhase] = useState<'fade-in' | 'hold' | 'fade-out'>('fade-in');

  useEffect(() => {
    // Fade in for 1 second
    const holdTimer = setTimeout(() => setPhase('hold'), 1000);
    // Hold for 2 seconds, then fade out
    const fadeOutTimer = setTimeout(() => setPhase('fade-out'), 3000);
    // Complete after fade out
    const completeTimer = setTimeout(onComplete, 3800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: phase === 'fade-out' ? 0 : 1,
      }}
      transition={{ duration: phase === 'fade-out' ? 0.8 : 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {/* Subtle film grain */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: phase === 'fade-out' ? 0 : 1,
          scale: 1,
        }}
        transition={{
          duration: 1.5,
          ease: 'easeOut',
        }}
        className="font-editorial text-4xl md:text-5xl font-bold text-white tracking-[0.2em] text-center px-8"
      >
        THE GHOST ARMY
      </motion.h1>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: phase === 'fade-out' ? 0 : 1,
          opacity: phase === 'fade-out' ? 0 : 1,
        }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-1/2 translate-y-16 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </motion.div>
  );
}
