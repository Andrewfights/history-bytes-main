import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { mockLeaderboard } from '@/data/mockData';

export function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={18} className="text-primary" />;
      case 2:
        return <Medal size={18} className="text-secondary" />;
      case 3:
        return <Award size={18} className="text-muted" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
        Weekly Leaderboard
      </h2>

      <div className="lesson-card space-y-1">
        {mockLeaderboard.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              entry.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-card'
            }`}
          >
            <div className="w-8 text-center">
              {getRankIcon(entry.rank) || (
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${
                entry.isCurrentUser ? 'text-primary' : ''
              }`}>
                {entry.displayName}
                {entry.isCurrentUser && (
                  <span className="text-xs text-muted-foreground ml-2">(You)</span>
                )}
              </p>
            </div>

            <div className="text-right">
              <span className="font-semibold text-secondary">
                {entry.xp.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground ml-1">XP</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
