import { motion } from 'framer-motion';
import { Trophy, Zap, Award } from 'lucide-react';

interface BossChallengeProps {
  actTitle: string;
  onBegin: () => void;
  onBack: () => void;
}

const rounds = [
  { name: 'Chrono Order', description: 'Arrange events oldest → newest' },
  { name: 'Who Am I?', description: 'Identify the historical figure' },
  { name: 'MapLock', description: 'Place events on the map' },
];

export function BossChallenge({ actTitle, onBegin, onBack }: BossChallengeProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-yellow">
          <Trophy size={36} className="text-primary" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground">Boss Challenge</p>
        <h1 className="font-editorial text-2xl font-bold mt-1">{actTitle}</h1>
      </motion.div>

      <div className="w-full max-w-sm space-y-3 mb-8">
        {rounds.map((round, i) => (
          <motion.div
            key={round.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-sm">{round.name}</p>
              <p className="text-xs text-muted-foreground">{round.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Zap size={14} className="text-primary" /> +75 XP</span>
          <span className="flex items-center gap-1"><Award size={14} className="text-secondary" /> Badge</span>
        </div>

        <button
          onClick={onBegin}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-95"
        >
          Begin Challenge
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm transition-all hover:text-foreground"
        >
          Back
        </button>
      </div>
    </div>
  );
}
