import { motion } from 'framer-motion';
import { LevelData } from '@/types';
import { Mic, Swords } from 'lucide-react';

interface HostIntroScreenProps {
  level: LevelData;
  onBegin: () => void;
  actTitle: string;
}

export function HostIntroScreen({ level, onBegin, actTitle }: HostIntroScreenProps) {
  const isBoss = level.isBoss;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center relative"
    >
      {/* Background glow */}
      <div className={`absolute inset-0 ${isBoss ? 'bg-destructive/5' : 'bg-primary/5'} pointer-events-none`} />

      {/* Act label */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground mb-2"
      >
        {actTitle}
      </motion.p>

      {/* Boss or Host icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 border-2 ${
          isBoss
            ? 'bg-destructive/10 border-destructive/40'
            : 'bg-primary/10 border-primary/40'
        }`}
      >
        {isBoss ? (
          <Swords size={36} className="text-destructive" />
        ) : (
          <Mic size={36} className="text-primary" />
        )}
      </motion.div>

      {/* Host name */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-[11px] uppercase tracking-[0.25em] font-bold mb-1 ${isBoss ? 'text-destructive' : 'text-primary'}`}
      >
        {isBoss ? '⚔ Boss Level' : `${level.hostName} speaks`}
      </motion.p>

      {/* Quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-editorial text-xl leading-relaxed italic mb-8 max-w-sm"
      >
        "{level.hostQuote}"
      </motion.blockquote>

      {/* Level info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="archival-card px-6 py-4 mb-8 text-center"
      >
        <h2 className="font-editorial text-lg font-bold mb-1">{level.title}</h2>
        <p className="text-sm text-muted-foreground">
          {level.rounds.length} Rounds ·{' '}
          <span className={`font-semibold ${isBoss ? 'text-destructive' : 'text-primary'}`}>
            +{level.xpReward} XP {isBoss ? '(2× Boss)' : ''}
          </span>
        </p>
        {isBoss && (
          <p className="text-xs text-destructive/70 mt-1.5 font-semibold">⏱ Time pressure active</p>
        )}
      </motion.div>

      {/* Begin button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onBegin}
        className={`px-10 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
          isBoss
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isBoss ? 'Accept the Challenge ▸' : 'Begin ▸'}
      </motion.button>
    </motion.div>
  );
}
