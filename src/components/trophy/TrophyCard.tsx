/**
 * TrophyCard - Individual trophy/medal display card
 * Shows medal, name, description, tier badge, XP reward, and earned date
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Medal, MedalTier } from '@/components/ui/Medal';
import { Star, Lock, Check, Clock, Eye, Zap, Shield, Award } from 'lucide-react';

export interface Trophy {
  id: string;
  name: string;
  description: string;
  tier: MedalTier;
  icon?: React.ReactNode;
  xpReward: number;
  earnedDate?: string;
  progress?: string; // For locked trophies: "12 / 18 read"
}

interface TrophyCardProps {
  trophy: Trophy;
  onClick?: () => void;
  className?: string;
}

// Tier display names and colors
const tierConfig: Record<MedalTier, { label: string; color: string }> = {
  bronze: { label: 'Bronze', color: 'text-[#D4A574]' },
  silver: { label: 'Silver', color: 'text-[#C0C0C0]' },
  gold: { label: 'Gold', color: 'text-gold-2' },
  platinum: { label: 'Platinum', color: 'text-[#E5E4E2]' },
  locked: { label: 'Locked', color: 'text-text-3' },
};

// Default icons for different trophy types
const defaultIcons: Record<string, React.ReactNode> = {
  star: <Star className="w-full h-full" fill="currentColor" />,
  check: <Check className="w-full h-full" />,
  clock: <Clock className="w-full h-full" />,
  eye: <Eye className="w-full h-full" />,
  zap: <Zap className="w-full h-full" fill="currentColor" />,
  shield: <Shield className="w-full h-full" fill="currentColor" />,
  award: <Award className="w-full h-full" />,
};

export function TrophyCard({ trophy, onClick, className }: TrophyCardProps) {
  const { tier, name, description, xpReward, earnedDate, progress, icon } = trophy;
  const isEarned = tier !== 'locked';
  const config = tierConfig[tier];

  return (
    <div
      onClick={onClick}
      className={cn(
        'trophy-card relative bg-ink-lift border rounded-lg p-3 transition-all duration-200',
        isEarned
          ? 'border-border-gold hover:border-border-gold-hi cursor-pointer'
          : 'border-off-white/10 opacity-70',
        onClick && isEarned && 'hover:transform hover:-translate-y-0.5',
        className
      )}
    >
      {/* Medal */}
      <div className="flex justify-center mb-2">
        <Medal tier={tier} icon={icon} size="md" />
      </div>

      {/* Tier badge */}
      <div className="flex justify-center mb-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 font-mono text-[8px] tracking-[0.2em] uppercase font-bold',
            config.color
          )}
        >
          {tier === 'locked' ? (
            <>
              <Lock size={8} />
              {config.label}
            </>
          ) : (
            <>
              <span className="text-[10px]">&#9670;</span>
              {config.label}
            </>
          )}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-serif text-[13px] font-bold italic text-off-white text-center leading-tight mb-1">
        {name}
      </h3>

      {/* Description */}
      <p className="font-body text-[10px] text-text-2 text-center leading-snug mb-2 line-clamp-2">
        {description}
      </p>

      {/* Footer: Date/Progress + XP */}
      <div className="flex justify-between items-center pt-2 border-t border-divider">
        <span className="font-mono text-[8px] text-text-3 tracking-wide">
          {isEarned ? earnedDate : progress || 'Not started'}
        </span>
        <span className="font-mono text-[9px] text-gold-2 font-bold">
          +{xpReward}
        </span>
      </div>
    </div>
  );
}

export default TrophyCard;
