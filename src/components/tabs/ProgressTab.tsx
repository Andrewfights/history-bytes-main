import { motion } from 'framer-motion';
import { Leaderboard } from '@/components/progress/Leaderboard';
import { UserStats } from '@/components/progress/UserStats';

export function ProgressTab() {
  return (
    <div className="px-4 py-6 space-y-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-editorial text-2xl font-bold">Progress</h1>
      </motion.div>

      <Leaderboard />
      <UserStats />
    </div>
  );
}
