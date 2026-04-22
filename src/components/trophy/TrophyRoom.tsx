/**
 * TrophyRoom - Medal Hall display for earned trophies
 * Design: History Academy Dark v2 - Hall of Honor
 * Features: Campaign tabs, stats band, featured trophy, trophy grid
 */

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, Share2, ChevronRight, Shield, Landmark, Pyramid, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Medal, MedalTier } from '@/components/ui/Medal';

// Types
export interface Campaign {
  id: string;
  name: string;
  era: string;
  icon?: React.ReactNode;
  earned: number;
  total: number;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  tier: MedalTier;
  icon?: React.ReactNode;
  xpReward: number;
  earnedDate?: string;
  progress?: string;
  rarity?: string; // e.g., "0.8%"
}

interface TrophyRoomProps {
  campaigns: Campaign[];
  trophies: Record<string, Trophy[]>;
  onBack: () => void;
  onShareTrophy?: (trophy: Trophy) => void;
  className?: string;
}

// Default era icons
const eraIcons: Record<string, React.ReactNode> = {
  modern: <Shield size={14} />,
  ww2: <Shield size={14} />,
  classical: <Landmark size={14} />,
  ancient: <Pyramid size={14} />,
  revolution: <Flag size={14} />,
};

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

// Calculate total potential XP from locked trophies
function getLockedXPTotal(trophies: Trophy[]) {
  return trophies
    .filter((t) => t.tier === 'locked')
    .reduce((sum, t) => sum + t.xpReward, 0);
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
  const lockedXP = getLockedXPTotal(campaignTrophies);

  return (
    <div className={cn('min-h-screen bg-void flex flex-col', className)}>
      {/* Ambient glow background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-[60%]" style={{
          background: `
            radial-gradient(ellipse at 30% 10%, rgba(230,171,42,0.12), transparent 40%),
            radial-gradient(ellipse at 70% 20%, rgba(246,227,85,0.08), transparent 40%)
          `
        }} />
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-10 bg-void border-b border-off-white/[0.06] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center text-off-white/70 hover:text-off-white transition-colors"
          >
            <ArrowLeft size={14} />
          </button>

          <div className="text-center flex-1 px-3">
            <div className="font-mono text-[7.5px] tracking-[0.28em] text-text-3 uppercase font-bold mb-0.5">
              Your Hall
            </div>
            <h1 className="font-display text-[13px] font-bold text-off-white tracking-[0.05em] uppercase">
              Trophy Room
            </h1>
          </div>

          <div className="w-7 h-7 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center font-mono text-[9px] font-bold text-gold-2">
            {selectedCampaign?.earned || 0}/{selectedCampaign?.total || 0}
          </div>
        </div>
      </header>

      {/* ═══════════ HERO HEADER ═══════════ */}
      <div className="relative z-10 px-4 py-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-px bg-ha-red" />
          <span className="font-mono text-[9px] tracking-[0.4em] text-ha-red uppercase font-bold">
            {selectedCampaign?.era || 'Campaign'}
          </span>
        </div>
        <h2 className="font-display text-[40px] font-bold text-off-white leading-[0.92] tracking-[-0.02em] uppercase">
          {selectedCampaign?.name?.split(' ')[0]}{' '}
          <em className="font-serif italic font-bold text-gold-2 normal-case">
            {selectedCampaign?.name?.split(' ').slice(1).join(' ') || 'Room'}
          </em>
        </h2>
        <p className="font-body text-[12px] text-text-2 mt-2 leading-[1.5]">
          Medals earned in this campaign. Each one pinned to a moment.
        </p>
      </div>

      {/* ═══════════ CAMPAIGN PILLS ═══════════ */}
      <div className="relative z-10 px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {campaigns.map((campaign) => {
          const isSelected = campaign.id === selectedCampaignId;
          const icon = campaign.icon || eraIcons[campaign.era.toLowerCase()] || <Shield size={14} />;

          return (
            <button
              key={campaign.id}
              onClick={() => setSelectedCampaignId(campaign.id)}
              className={cn(
                'campaign-pill',
                isSelected && 'active'
              )}
            >
              <span className="text-gold-2">{icon}</span>
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-off-white">
                {campaign.name.split(' ')[0]}
              </span>
              <span className={cn(
                'font-mono text-[8.5px] tracking-[0.1em] font-semibold',
                isSelected ? 'text-gold-2' : 'text-text-3'
              )}>
                {campaign.earned}/{campaign.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══════════ PROGRESS ROW ═══════════ */}
      <div className="relative z-10 mx-4 mb-4 bg-ink-lift border border-off-white/10 rounded-xl p-3 overflow-hidden">
        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="font-mono text-[8px] tracking-[0.3em] text-text-3 uppercase font-semibold">
              {selectedCampaign?.name} · Earned
            </div>
            <div className="font-display text-[22px] font-bold text-off-white leading-none mt-1">
              {selectedCampaign?.earned}
              <span className="text-text-3 text-[14px]">/{selectedCampaign?.total}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[8px] tracking-[0.3em] text-text-3 uppercase font-semibold">
              Progress
            </div>
            <div className="font-display text-[22px] font-bold text-gold-2 leading-none mt-1">
              {Math.round(progressPercent)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-off-white/[0.08] rounded-sm overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-3 to-gold-2 rounded-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="flex justify-between font-mono text-[8.5px] tracking-[0.15em] text-text-2 uppercase font-semibold">
          <span>
            {lockedTrophies.length} more to <span className="text-gold-2">complete</span>
          </span>
          <span className="text-gold-2">+{lockedXP.toLocaleString()} XP</span>
        </div>
      </div>

      {/* ═══════════ TIER BREAKDOWN ═══════════ */}
      <div className="relative z-10 mx-4 mb-5 grid grid-cols-4 gap-1.5">
        <TierStat tier="gold" count={tierBreakdown.gold} label="Gold" />
        <TierStat tier="silver" count={tierBreakdown.silver} label="Silver" />
        <TierStat tier="bronze" count={tierBreakdown.bronze} label="Bronze" />
        <TierStat tier="plat" count={tierBreakdown.platinum} label="Plat" />
      </div>

      {/* ═══════════ SCROLLABLE CONTENT ═══════════ */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 relative z-10">
        {/* Latest Earned (Featured) */}
        {latestEarned && (
          <>
            <div className="mb-3">
              <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-1">
                Latest Earned
              </div>
              <div className="font-display text-[18px] font-bold text-off-white uppercase tracking-[-0.005em]">
                Most Recent
              </div>
            </div>

            <FeaturedTrophy trophy={latestEarned} onShare={onShareTrophy} />
          </>
        )}

        {/* All Trophies Grid */}
        <div className="mb-3 mt-6">
          <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-1">
            The Hall
          </div>
          <div className="font-display text-[18px] font-bold text-off-white uppercase tracking-[-0.005em]">
            All <em className="font-serif italic font-bold text-gold-2 normal-case">Medals</em>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[...earnedTrophies, ...lockedTrophies].map((trophy) => (
            <TrophyCard key={trophy.id} trophy={trophy} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════ TIER STAT COMPONENT ═══════════
function TierStat({
  tier,
  count,
  label,
}: {
  tier: 'gold' | 'silver' | 'bronze' | 'plat';
  count: number;
  label: string;
}) {
  return (
    <div className={cn('tier-stat relative rounded-lg p-2.5 text-center overflow-hidden', tier)}>
      <div className="font-display text-[20px] font-bold leading-none mt-1">{count}</div>
      <div className="font-mono text-[7px] tracking-[0.18em] uppercase font-semibold mt-1 opacity-70">
        {label}
      </div>
    </div>
  );
}

// ═══════════ FEATURED TROPHY COMPONENT ═══════════
function FeaturedTrophy({
  trophy,
  onShare,
}: {
  trophy: Trophy;
  onShare?: (trophy: Trophy) => void;
}) {
  return (
    <div className="featured-trophy mb-4">
      {/* Medal showcase area */}
      <div className="featured-trophy-media flex justify-center items-center py-6 px-4">
        <Medal tier={trophy.tier} icon={trophy.icon} size="lg" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tier tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-2/10 border border-gold-2/30 rounded-full mb-3">
          <span className="w-1 h-1 bg-gold-2 rounded-full shadow-[0_0_6px_var(--gold-2)]" />
          <span className="font-mono text-[8px] tracking-[0.28em] uppercase font-bold text-gold-2">
            {trophy.tier.charAt(0).toUpperCase() + trophy.tier.slice(1)} · Mastery
          </span>
        </div>

        {/* Name */}
        <h3 className="font-serif text-[22px] font-bold italic text-off-white leading-none mb-1">
          {trophy.name}
        </h3>

        {/* Subtitle quote */}
        <p className="font-calligraphy text-[12px] italic text-gold-2 mb-3">
          "Awarded for extraordinary performance."
        </p>

        {/* Description */}
        <p className="font-body text-[11.5px] text-text-2 leading-[1.5] mb-4">
          {trophy.description}
        </p>

        {/* Meta row */}
        <div className="flex gap-4 py-2 border-t border-b border-off-white/[0.08] mb-3">
          <div>
            <div className="font-display text-[13px] font-bold text-gold-2 leading-none">
              +{trophy.xpReward} XP
            </div>
            <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-1">
              Reward
            </div>
          </div>
          <div>
            <div className="font-display text-[13px] font-bold text-off-white leading-none">
              {trophy.earnedDate || 'Jan 18'}
            </div>
            <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-1">
              Earned
            </div>
          </div>
          <div>
            <div className="font-display text-[13px] font-bold text-off-white leading-none">
              {trophy.rarity || '0.8%'}
            </div>
            <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-1">
              Of Users
            </div>
          </div>
        </div>

        {/* Share button */}
        {onShare && (
          <button
            onClick={() => onShare(trophy)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink-lift border border-off-white/10 rounded-full text-off-white hover:border-gold-2 hover:text-gold-2 transition-all"
          >
            <Share2 size={12} />
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase font-semibold">
              Share Medal
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════ TROPHY CARD COMPONENT ═══════════
function TrophyCard({ trophy }: { trophy: Trophy }) {
  const { tier, name, description, xpReward, earnedDate, progress } = trophy;
  const isEarned = tier !== 'locked';

  const tierColors: Record<MedalTier, string> = {
    gold: 'text-gold-2',
    silver: 'text-[#E8E8EE]',
    bronze: 'text-[#D4A574]',
    platinum: 'text-[#F5F5FF]',
    locked: 'text-text-3',
  };

  return (
    <div className={cn(
      'trophy-card relative bg-ink-lift border rounded-xl p-3.5 overflow-hidden',
      isEarned ? 'border-off-white/10' : 'border-off-white/[0.06] opacity-55',
      tier
    )}>
      {/* Medal */}
      <div className="flex justify-center mb-2">
        <Medal tier={tier} icon={trophy.icon} size="md" />
      </div>

      {/* Tier badge */}
      <div className="flex justify-center mb-2">
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[7px] tracking-[0.22em] uppercase font-bold',
          tierColors[tier],
          tier === 'locked' ? 'bg-ink-lift border border-off-white/10' : `bg-${tier === 'gold' ? 'gold-2' : tier}/10 border border-current/20`
        )}>
          {tier === 'locked' ? `Locked` : tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      </div>

      {/* Name */}
      <h3 className={cn(
        'font-serif text-[12px] font-bold italic text-center leading-tight mb-1',
        isEarned ? 'text-off-white' : 'text-text-3'
      )}>
        {name}
      </h3>

      {/* Description */}
      <p className={cn(
        'font-body text-[9.5px] text-center leading-[1.35] mb-2 min-h-[38px]',
        isEarned ? 'text-text-2' : 'text-text-3'
      )}>
        {description}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-off-white/[0.08]">
        <span className={cn(
          'font-mono text-[7.5px] tracking-[0.08em] uppercase font-semibold',
          isEarned ? 'text-off-white' : 'text-text-3'
        )}>
          {isEarned ? earnedDate : progress || 'Not started'}
        </span>
        <span className={cn(
          'font-mono text-[7.5px] tracking-[0.08em] uppercase font-bold',
          isEarned ? 'text-gold-2' : 'text-text-3'
        )}>
          +{xpReward}
        </span>
      </div>
    </div>
  );
}

export default TrophyRoom;
export type { Trophy, Campaign };
