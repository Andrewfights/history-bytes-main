import { motion } from 'framer-motion';
import { Target, CheckCircle, TrendingUp } from 'lucide-react';

export function UserStats() {
  const stats = [
    { label: 'Sessions', value: 12, icon: CheckCircle, color: 'text-success' },
    { label: 'Accuracy', value: '82%', icon: Target, color: 'text-primary' },
    { label: 'Best Streak', value: 7, icon: TrendingUp, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
        Your Stats
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="lesson-card text-center py-6"
          >
            <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
