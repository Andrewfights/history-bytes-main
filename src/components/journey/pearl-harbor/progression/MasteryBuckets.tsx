/**
 * MasteryBuckets - Progress tracking for Quiz, Stories, and Maps buckets
 */

import { motion } from 'framer-motion';
import { PearlHarborMasteryBuckets } from '@/types';

interface MasteryBucketsProps {
  buckets: PearlHarborMasteryBuckets;
}

export function MasteryBuckets({ buckets }: MasteryBucketsProps) {
  const bucketConfig = [
    {
      key: 'quizzes' as const,
      label: 'Quizzes',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20',
    },
    {
      key: 'stories' as const,
      label: 'Stories',
      icon: '🎙️',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20',
    },
    {
      key: 'maps' as const,
      label: 'Maps',
      icon: '🗺️',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20',
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase text-white/50 tracking-wider">
        Mastery Buckets
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {bucketConfig.map((config) => {
          const bucket = buckets[config.key];
          const progress = bucket.progress;

          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 rounded-xl ${config.bgColor} border border-white/10`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className="text-xs text-white/60 mb-2">{config.label}</div>

                {/* Circular Progress */}
                <div className="relative w-12 h-12 mx-auto">
                  <svg className="w-12 h-12 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/10"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{progress}%</span>
                  </div>
                </div>

                <p className="text-xs text-white/40 mt-1">
                  {bucket.completedItems.length}/{bucket.items.length}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
