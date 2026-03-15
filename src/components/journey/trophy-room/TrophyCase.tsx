/**
 * TrophyCase - Animated trophy display component
 * Shows golden animated trophy when completed, greyed silhouette when not
 */

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface TrophyCaseProps {
  isCompleted: boolean;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TrophyCase({ isCompleted, icon, size = 'md' }: TrophyCaseProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  if (isCompleted) {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/40 to-yellow-500/40 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Trophy container */}
        <motion.div
          className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          {/* Shine animation */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* Icon or trophy */}
          {icon ? (
            <span className="text-4xl drop-shadow-lg">{icon}</span>
          ) : (
            <Trophy size={iconSizes[size]} className="text-amber-900/80 drop-shadow-lg" />
          )}
        </motion.div>

        {/* Sparkles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              top: `${20 + i * 25}%`,
              left: `${10 + i * 30}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    );
  }

  // Incomplete - greyed silhouette
  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-2 border-slate-600/50 opacity-50">
        {icon ? (
          <span className="text-4xl grayscale opacity-30">{icon}</span>
        ) : (
          <Trophy size={iconSizes[size]} className="text-slate-500" />
        )}
      </div>

      {/* Lock overlay hint */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs text-slate-500 font-medium mt-8">Locked</div>
      </div>
    </div>
  );
}
