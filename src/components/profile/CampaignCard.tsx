/**
 * CampaignCard - Compact campaign progress card for profile carousel
 * Shows era, title, progress bar, lesson count, and XP earned
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface CampaignInfo {
  id: string;
  title: string;
  era: string;
  progress: number; // 0-100
  lessonsCompleted: number;
  totalLessons: number;
  xpEarned: number;
  isComplete?: boolean;
  backgroundClass?: string; // 'ww2', 'egy', 'rom', etc.
}

interface CampaignCardProps {
  campaign: CampaignInfo;
  onClick?: () => void;
  className?: string;
}

// Era background gradients
const eraBackgrounds: Record<string, string> = {
  ww2: 'from-[#2a3a4a] to-[#1a2530]',
  egy: 'from-[#4a3a2a] to-[#2a1a10]',
  rom: 'from-[#3a2a3a] to-[#1a101a]',
  cw: 'from-[#3a3a2a] to-[#1a1a10]',
  grc: 'from-[#2a3a3a] to-[#101a1a]',
  default: 'from-[#2a2a2a] to-[#1a1a1a]',
};

export function CampaignCard({ campaign, onClick, className }: CampaignCardProps) {
  const {
    title,
    era,
    progress,
    lessonsCompleted,
    totalLessons,
    xpEarned,
    isComplete,
    backgroundClass,
  } = campaign;

  const bgGradient = eraBackgrounds[backgroundClass || 'default'] || eraBackgrounds.default;

  return (
    <div
      onClick={onClick}
      className={cn(
        'campaign-card relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200',
        'hover:transform hover:-translate-y-0.5 hover:shadow-lg',
        'min-w-[200px] w-[200px]',
        className
      )}
    >
      {/* Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', bgGradient)} />

      {/* Media area with era + progress */}
      <div className="relative h-20 p-3 flex flex-col justify-between">
        {/* Era tag */}
        <div className="flex justify-between items-start">
          <span className="font-mono text-[8px] tracking-[0.15em] text-gold-2/90 uppercase font-bold">
            &#9670; {era}
          </span>
          <span className="font-serif text-lg font-bold text-off-white/90">
            {progress}%
          </span>
        </div>

        {/* Complete badge */}
        {isComplete && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-success/20 border border-success/30">
            <Check size={10} className="text-success" />
            <span className="font-mono text-[7px] text-success uppercase tracking-wide">Complete</span>
          </div>
        )}

        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/%3E%3C/svg%3E')]" />
      </div>

      {/* Content */}
      <div className="relative bg-ink-lift p-3 border-t border-gold-2/10">
        {/* Red accent line */}
        <div className="absolute top-0 left-0 w-4 h-0.5 bg-ha-red" />

        {/* Title */}
        <h3 className="font-serif text-[13px] font-bold italic text-off-white leading-tight mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Footer */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[9px] text-text-3">
            {lessonsCompleted}/{totalLessons} lessons
          </span>
          <span className="font-mono text-[9px] text-gold-2 font-bold">
            +{xpEarned} XP
          </span>
        </div>

        {/* Progress bar */}
        <div className="prog-bar h-1">
          <motion.div
            className="prog-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

export default CampaignCard;
