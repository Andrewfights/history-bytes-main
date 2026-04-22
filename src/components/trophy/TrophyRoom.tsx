/**
 * TrophyRoom - Medal Hall display for earned trophies
 * Replaces the Pantheon "glass vitrine" aesthetic with Medal Hall design
 * Features: Campaign tabs, stats band, featured trophy, trophy grid
 */

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, Share2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Medal, MedalTier } from '@/components/ui/Medal';
import { TrophyCard, Trophy } from './TrophyCard';
import { CampaignSelector, Campaign } from './CampaignSelector';

interface TrophyRoomProps {
  campaigns: Campaign[];
  trophies: Record<string, Trophy[]>; // campaignId -> trophies
  onBack: () => void;
  onShareTrophy?: (trophy: Trophy) => void;
  className?: string;
}

// Calculate tier breakdown
function getTierBreakdown(trophies: Trophy[]) {
  const breakdown = { gold: 0, silver: 0, bronze: 0, platinum: 0 };
  trophies.forEach((t) => {
    if (t.tier !== 'locked' && t.tier in breakdown) {
      breakdown[t.tier as keyof typeof breakdown]++;
    }
  });
  return breakdown;
}

export function TrophyRoom({
  campaigns,
  trophies,
  onBack,
  onShareTrophy,
  className,
}: TrophyRoomProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const campaignTrophies = trophies[selectedCampaignId] || [];
  const earnedTrophies = campaignTrophies.filter((t) => t.tier !== 'locked');
  const lockedTrophies = campaignTrophies.filter((t) => t.tier === 'locked');
  const latestEarned = earnedTrophies[earnedTrophies.length - 1];
  const tierBreakdown = getTierBreakdown(campaignTrophies);
  const progressPercent = selectedCampaign
    ? (selectedCampaign.earned / selectedCampaign.total) * 100
    : 0;

  return (
    <div className={cn('min-h-screen bg-void flex flex-col', className)}>
      {/* Header */}
      <header className="relative bg-ink border-b border-off-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-1 text-off-white/60 hover:text-off-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <div className="font-mono text-[8px] tracking-[0.25em] text-off-white/50 uppercase font-semibold">
              Your Hall
            </div>
            <h1 className="font-serif text-[18px] font-bold text-off-white italic">
              Trophy Room
            </h1>
          </div>

          <div className="font-mono text-[10px] text-gold-2 font-bold">
            {selectedCampaign?.earned || 0}/{selectedCampaign?.total || 0}
          </div>
        </div>
      </header>

      {/* Campaign Hero */}
      <div className="px-4 py-4 bg-ink border-b border-off-white/[0.06]">
        <div className="sec-kick mb-1">{selectedCampaign?.era || 'Campaign'}</div>
        <h2 className="sec-title">
          {selectedCampaign?.name?.split(' ')[0]}{' '}
          <em>{selectedCampaign?.name?.split(' ').slice(1).join(' ')}</em>
        </h2>
        <p className="font-body text-[12px] text-text-2 mt-1.5 leading-relaxed">
          Medals earned in this campaign. Each one pinned to a moment.
        </p>
      </div>

      {/* Campaign Selector */}
      <div className="py-3 bg-void border-b border-off-white/[0.06]">
        <CampaignSelector
          campaigns={campaigns}
          selectedId={selectedCampaignId}
          onSelect={setSelectedCampaignId}
        />
      </div>

      {/* Stats Band */}
      <div className="px-4 py-3 bg-ink-lift border-b border-off-white/[0.06]">
        {/* Progress row */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="font-mono text-[8px] text-text-3 tracking-wide uppercase">
              {selectedCampaign?.name} · Earned
            </div>
            <div className="font-serif text-lg font-bold text-off-white">
              {selectedCampaign?.earned}
              <span className="text-text-3 text-sm font-normal">
                /{selectedCampaign?.total}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[8px] text-text-3 tracking-wide uppercase">
              Progress
            </div>
            <div className="font-serif text-lg font-bold text-gold-2">
              {Math.round(progressPercent)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="prog-bar mb-3">
          <motion.div
            className="prog-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Tier breakdown */}
        <div className="flex justify-between">
          <TierStat tier="gold" count={tierBreakdown.gold} label="Gold" />
          <TierStat tier="silver" count={tierBreakdown.silver} label="Silver" />
          <TierStat tier="bronze" count={tierBreakdown.bronze} label="Bronze" />
          <TierStat tier="platinum" count={tierBreakdown.platinum} label="Plat" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Featured Trophy (Latest Earned) */}
        {latestEarned && (
          <>
            <div className="sec-header mb-3">
              <div>
                <div className="sec-kick">Latest Earned</div>
                <div className="sec-title">
                  Most <em>Recent</em>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <FeaturedTrophy trophy={latestEarned} onShare={onShareTrophy} />
            </div>
          </>
        )}

        {/* All Trophies Grid */}
        <div className="sec-header mb-3">
          <div>
            <div className="sec-kick">The Hall</div>
            <div className="sec-title">
              All <em>Medals</em>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Show earned first, then locked */}
          {[...earnedTrophies, ...lockedTrophies].map((trophy) => (
            <TrophyCard key={trophy.id} trophy={trophy} />
          ))}
        </div>

        {/* Bottom padding */}
        <div className="h-20" />
      </div>
    </div>
  );
}

// Tier stat component
function TierStat({
  tier,
  count,
  label,
}: {
  tier: 'gold' | 'silver' | 'bronze' | 'platinum';
  count: number;
  label: string;
}) {
  const colors: Record<string, string> = {
    gold: 'text-gold-2 bg-gold-2/10 border-gold-2/20',
    silver: 'text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/20',
    bronze: 'text-[#D4A574] bg-[#D4A574]/10 border-[#D4A574]/20',
    platinum: 'text-[#E5E4E2] bg-[#E5E4E2]/10 border-[#E5E4E2]/20',
  };

  return (
    <div
      className={cn(
        'flex-1 text-center py-2 px-1 rounded border',
        colors[tier]
      )}
    >
      <div className="font-serif text-base font-bold">{count}</div>
      <div className="font-mono text-[7px] tracking-wider uppercase opacity-70">
        {label}
      </div>
    </div>
  );
}

// Featured trophy card (larger, more detail)
function FeaturedTrophy({
  trophy,
  onShare,
}: {
  trophy: Trophy;
  onShare?: (trophy: Trophy) => void;
}) {
  return (
    <div className="bg-ink-lift border border-border-gold rounded-xl p-4 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-2/5 to-transparent pointer-events-none" />

      <div className="relative flex gap-4">
        {/* Medal */}
        <div className="flex-shrink-0">
          <Medal tier={trophy.tier} icon={trophy.icon} size="lg" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Tier tag */}
          <div className="font-mono text-[8px] tracking-[0.2em] uppercase font-bold text-gold-2 mb-1">
            {trophy.tier.charAt(0).toUpperCase() + trophy.tier.slice(1)} · Mastery
          </div>

          {/* Name */}
          <h3 className="font-serif text-[18px] font-bold italic text-off-white leading-tight mb-1">
            {trophy.name}
          </h3>

          {/* Quote/description */}
          <p className="font-serif text-[11px] italic text-text-2 mb-2">
            "{trophy.description}"
          </p>

          {/* Meta row */}
          <div className="flex gap-4 mb-3">
            <div>
              <div className="font-serif text-sm font-bold text-gold-2">
                +{trophy.xpReward} XP
              </div>
              <div className="font-mono text-[7px] text-text-3 uppercase tracking-wide">
                Reward
              </div>
            </div>
            <div>
              <div className="font-serif text-sm font-bold text-off-white">
                {trophy.earnedDate}
              </div>
              <div className="font-mono text-[7px] text-text-3 uppercase tracking-wide">
                Earned
              </div>
            </div>
            <div>
              <div className="font-serif text-sm font-bold text-off-white">
                0.8%
              </div>
              <div className="font-mono text-[7px] text-text-3 uppercase tracking-wide">
                Of Users
              </div>
            </div>
          </div>

          {/* Share button */}
          {onShare && (
            <button
              onClick={() => onShare(trophy)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-off-white/20 text-off-white/70 hover:border-gold-2 hover:text-gold-2 transition-all"
            >
              <Share2 size={12} />
              <span className="font-mono text-[9px] tracking-wide uppercase">
                Share Medal
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrophyRoom;
