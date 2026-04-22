/**
 * TrophyRoom - Hall of Honor with desktop and mobile layouts
 * Design: History Academy Dark v2 - Trophy Room
 * Desktop: Nav + hero + campaign cards + stats band + featured (2-col) + 4-col grid
 * Mobile: Header + hero + pills + progress + 4-up stats + featured + 2-col grid
 */

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, Share2, Shield, Landmark, Pyramid, Flag, ChevronRight, Lock, Star, Eye, Zap, Clock, Check } from 'lucide-react';
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
  rarity?: string;
  lockedTier?: MedalTier; // What tier this will be when earned
}

interface TrophyRoomProps {
  campaigns: Campaign[];
  trophies: Record<string, Trophy[]>;
  onBack: () => void;
  onShareTrophy?: (trophy: Trophy) => void;
  className?: string;
}

// Era icons
const eraIcons: Record<string, React.ReactNode> = {
  modern: <Shield size={18} />,
  ww2: <Shield size={18} />,
  '19th century': <Flag size={18} />,
  classical: <Landmark size={18} />,
  ancient: <Pyramid size={18} />,
  revolution: <Flag size={18} />,
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

// Get totals by tier
function getTierTotals(trophies: Trophy[]) {
  const totals = { gold: 0, silver: 0, bronze: 0, platinum: 0 };
  trophies.forEach((t) => {
    const tier = t.tier === 'locked' ? t.lockedTier : t.tier;
    if (tier && tier in totals) {
      totals[tier as keyof typeof totals]++;
    }
  });
  return totals;
}

// Calculate locked XP
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
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const campaignTrophies = trophies[selectedCampaignId] || [];
  const earnedTrophies = campaignTrophies.filter((t) => t.tier !== 'locked');
  const lockedTrophies = campaignTrophies.filter((t) => t.tier === 'locked');
  const latestEarned = earnedTrophies[earnedTrophies.length - 1];
  const tierBreakdown = getTierBreakdown(campaignTrophies);
  const tierTotals = getTierTotals(campaignTrophies);
  const progressPercent = selectedCampaign
    ? (selectedCampaign.earned / selectedCampaign.total) * 100
    : 0;
  const lockedXP = getLockedXPTotal(campaignTrophies);

  const filteredTrophies =
    filter === 'all'
      ? [...earnedTrophies, ...lockedTrophies]
      : filter === 'earned'
      ? earnedTrophies
      : lockedTrophies;

  return (
    <div className={cn('min-h-screen bg-void', className)}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 right-0 h-[60%]"
          style={{
            background: `
              radial-gradient(ellipse at 20% 10%, rgba(230,171,42,0.1), transparent 40%),
              radial-gradient(ellipse at 80% 10%, rgba(230,171,42,0.08), transparent 40%),
              radial-gradient(ellipse at 50% 30%, rgba(246,227,85,0.06), transparent 50%)
            `,
          }}
        />
      </div>

      {/* ═══════════ DESKTOP NAV ═══════════ */}
      <nav className="hidden md:flex relative z-10 items-center justify-between px-10 py-3.5 bg-ink/85 backdrop-blur-xl border-b border-off-white/[0.06]">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-ink-lift border border-gold-2/15 rounded-full text-off-white/70 hover:text-gold-2 hover:border-gold-2/30 transition-all"
          >
            <ArrowLeft size={11} />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-semibold">
              Back to Campaign
            </span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 pl-5 border-l border-off-white/[0.08]">
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 280 280" className="w-6 h-6">
                <defs>
                  <linearGradient id="gl-tr" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F6E355" />
                    <stop offset="100%" stopColor="#B2641F" />
                  </linearGradient>
                  <linearGradient id="gr-tr" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#B2641F" />
                    <stop offset="100%" stopColor="#E6AB2A" />
                  </linearGradient>
                  <linearGradient id="gc-tr" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#F6E355" />
                    <stop offset="100%" stopColor="#E6AB2A" />
                  </linearGradient>
                </defs>
                <polygon points="40,30 105,30 105,250 40,250" fill="url(#gl-tr)" />
                <polygon points="40,30 105,30 120,15 55,15" fill="#F6E355" />
                <polygon points="105,30 105,250 120,235 120,15" fill="#B2641F" />
                <polygon points="175,30 240,30 240,250 175,250" fill="url(#gr-tr)" />
                <polygon points="175,30 240,30 255,15 190,15" fill="#F6E355" />
                <polygon points="175,30 175,250 160,235 160,15 190,15 175,30" fill="#B2641F" />
                <polygon points="105,120 175,120 175,160 105,160" fill="url(#gc-tr)" />
                <polygon points="105,120 175,120 160,105 120,105" fill="#F6E355" />
              </svg>
              <div className="w-6 h-0.5 bg-ha-red" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[13px] font-bold text-off-white tracking-[0.02em] uppercase">
                History
              </span>
              <span className="font-display text-[9px] font-semibold text-off-white tracking-[0.18em] uppercase mt-0.5">
                Academy
              </span>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="font-mono text-[10px] tracking-[0.2em] text-off-white/50 uppercase font-semibold">
            Profile · Trophy Room · <span className="text-gold-2">{selectedCampaign?.name}</span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-deep" />
      </nav>

      {/* ═══════════ MOBILE HEADER ═══════════ */}
      <header className="md:hidden relative z-10 bg-void border-b border-off-white/[0.06] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center text-off-white/70"
          >
            <ArrowLeft size={12} />
          </button>
          <div className="text-center flex-1 px-3">
            <div className="font-mono text-[7.5px] tracking-[0.28em] text-off-white/50 uppercase font-bold mb-0.5">
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

      {/* ═══════════ DESKTOP HERO ═══════════ */}
      <div className="hidden md:block relative z-10 text-center py-9 max-w-[1280px] mx-auto">
        <div className="flex items-center justify-center gap-3 mb-3.5">
          <span className="w-[30px] h-0.5 bg-ha-red" />
          <span className="font-mono text-[11px] tracking-[0.45em] text-ha-red uppercase font-bold">
            Your Hall · {selectedCampaign?.name}
          </span>
          <span className="w-[30px] h-0.5 bg-ha-red" />
        </div>
        <h1 className="font-display text-[72px] font-bold text-off-white leading-[0.92] tracking-[-0.02em] uppercase mb-2.5">
          Trophy <em className="not-italic text-gold-2">Room</em>
        </h1>
        <p className="font-body text-[15px] text-off-white/70 max-w-[520px] mx-auto">
          Medals earned in the {selectedCampaign?.name} campaign. Each one is pinned to a moment — what you did, when you did it, and how well.
        </p>
      </div>

      {/* ═══════════ MOBILE HERO ═══════════ */}
      <div className="md:hidden relative z-10 px-4 py-5">
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
        <p className="font-body text-[12px] text-off-white/70 mt-2 leading-[1.5]">
          Medals earned in this campaign. Each one pinned to a moment.
        </p>
      </div>

      {/* ═══════════ DESKTOP CAMPAIGN SELECTOR ═══════════ */}
      <div className="hidden md:flex relative z-10 justify-center gap-2.5 pb-4 max-w-[1400px] mx-auto px-10 flex-wrap">
        {campaigns.map((campaign) => {
          const isSelected = campaign.id === selectedCampaignId;
          const icon = campaign.icon || eraIcons[campaign.era.toLowerCase()] || <Shield size={18} />;

          return (
            <button
              key={campaign.id}
              onClick={() => setSelectedCampaignId(campaign.id)}
              className={cn(
                'flex items-center gap-3 px-5 py-3.5 bg-ink-lift border rounded-[10px] min-w-[180px] transition-all relative overflow-hidden',
                isSelected
                  ? 'border-gold-2 bg-gradient-to-b from-gold-2/[0.08] to-gold-3/[0.04]'
                  : 'border-gold-2/15 hover:border-gold-2/30 hover:-translate-y-px'
              )}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-2" />
              )}
              <div
                className={cn(
                  'w-[38px] h-[38px] rounded-full border flex items-center justify-center text-gold-2 flex-shrink-0',
                  isSelected
                    ? 'border-gold-2/30 bg-gradient-to-br from-gold-2/20 to-gold-3/15'
                    : 'border-gold-2/15 bg-gradient-to-br from-gold-2/10 to-gold-3/[0.06]'
                )}
              >
                {icon}
              </div>
              <div className="text-left min-w-0">
                <div
                  className={cn(
                    'font-mono text-[8px] tracking-[0.25em] uppercase font-semibold mb-0.5',
                    isSelected ? 'text-gold-2' : 'text-off-white/50'
                  )}
                >
                  {campaign.era}
                </div>
                <div className="font-display text-[13px] font-bold uppercase tracking-[0.02em] text-off-white leading-none mb-1">
                  {campaign.name}
                </div>
                <div className="font-mono text-[9px] tracking-[0.1em] text-off-white/70 font-semibold flex items-center gap-1">
                  <span className="text-gold-2">{campaign.earned}</span> / {campaign.total} earned
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══════════ MOBILE CAMPAIGN PILLS ═══════════ */}
      <div className="md:hidden relative z-10 px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {campaigns.map((campaign) => {
          const isSelected = campaign.id === selectedCampaignId;
          const icon = campaign.icon || eraIcons[campaign.era.toLowerCase()] || <Shield size={12} />;

          return (
            <button
              key={campaign.id}
              onClick={() => setSelectedCampaignId(campaign.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-full border transition-all',
                isSelected
                  ? 'bg-gradient-to-b from-gold-2/10 to-gold-3/[0.05] border-gold-2'
                  : 'bg-ink-lift border-gold-2/15'
              )}
            >
              <span className="text-gold-2">{React.cloneElement(icon as React.ReactElement, { size: 12 })}</span>
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-off-white">
                {campaign.name.split(' ')[0]}
              </span>
              <span
                className={cn(
                  'font-mono text-[8.5px] tracking-[0.1em] font-semibold',
                  isSelected ? 'text-gold-2' : 'text-off-white/50'
                )}
              >
                {campaign.earned}/{campaign.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══════════ DESKTOP STATS BAND ═══════════ */}
      <div className="hidden md:grid relative z-10 max-w-[1280px] mx-auto px-10 py-4 grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3.5">
        {/* Big stat */}
        <div className="bg-ink-lift border border-gold-2/15 rounded-[10px] p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />
          <div className="font-mono text-[9px] tracking-[0.3em] text-off-white/50 uppercase font-semibold mb-1.5">
            {selectedCampaign?.name} · Trophies Earned
          </div>
          <div className="font-display text-[42px] font-bold text-off-white leading-none tracking-[-0.02em]">
            {selectedCampaign?.earned}
            <span className="text-off-white/35 text-[28px]">/{selectedCampaign?.total}</span>
          </div>
          <div className="h-[3px] bg-off-white/[0.08] rounded-sm overflow-hidden mt-2.5 mb-1.5">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-3 to-gold-2 rounded-sm"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="font-mono text-[9px] tracking-[0.15em] text-off-white/70 uppercase font-semibold">
            {lockedTrophies.length} more to <span className="text-gold-2">complete the hall</span>
          </div>
        </div>

        {/* Mini tier stats */}
        <TierStatDesktop tier="gold" count={tierBreakdown.gold} total={tierTotals.gold} label="Mastery" />
        <TierStatDesktop tier="silver" count={tierBreakdown.silver} total={tierTotals.silver} label="Honors" />
        <TierStatDesktop tier="bronze" count={tierBreakdown.bronze} total={tierTotals.bronze} label="Completion" />
        <TierStatDesktop tier="platinum" count={tierBreakdown.platinum} total={tierTotals.platinum} label="Elite" />
      </div>

      {/* ═══════════ MOBILE PROGRESS ROW ═══════════ */}
      <div className="md:hidden relative z-10 mx-4 mb-3.5 bg-ink-lift border border-off-white/10 rounded-[10px] p-3 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="font-mono text-[8px] tracking-[0.3em] text-off-white/50 uppercase font-semibold">
              {selectedCampaign?.name} · Earned
            </div>
            <div className="font-display text-[22px] font-bold text-off-white leading-none mt-1">
              {selectedCampaign?.earned}
              <span className="text-off-white/35 text-[14px]">/{selectedCampaign?.total}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[8px] tracking-[0.3em] text-off-white/50 uppercase font-semibold">
              Progress
            </div>
            <div className="font-display text-[22px] font-bold text-gold-2 leading-none mt-1">
              {Math.round(progressPercent)}%
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-off-white/[0.08] rounded-sm overflow-hidden mb-1.5">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-3 to-gold-2 rounded-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between font-mono text-[8.5px] tracking-[0.15em] text-off-white/70 uppercase font-semibold">
          <span>
            {lockedTrophies.length} more to <span className="text-gold-2">complete</span>
          </span>
          <span className="text-gold-2">+{lockedXP.toLocaleString()} XP</span>
        </div>
      </div>

      {/* ═══════════ MOBILE 4-UP TIER STATS ═══════════ */}
      <div className="md:hidden relative z-10 mx-4 mb-5 grid grid-cols-4 gap-1.5">
        <TierStatMobile tier="gold" count={tierBreakdown.gold} label="Gold" />
        <TierStatMobile tier="silver" count={tierBreakdown.silver} label="Silver" />
        <TierStatMobile tier="bronze" count={tierBreakdown.bronze} label="Bronze" />
        <TierStatMobile tier="platinum" count={tierBreakdown.platinum} label="Plat" />
      </div>

      {/* ═══════════ DESKTOP FEATURED SECTION HEADER ═══════════ */}
      {latestEarned && (
        <div className="hidden md:flex relative z-10 max-w-[1280px] mx-auto px-10 py-2.5 justify-between items-end border-b border-off-white/[0.08] mb-5">
          <div>
            <div className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold mb-1">
              Latest Earned · {latestEarned.earnedDate || 'Recently'}
            </div>
            <div className="font-display text-[28px] font-bold text-off-white uppercase tracking-[-0.005em] leading-none">
              The <em className="not-italic text-gold-2">most recent.</em>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DESKTOP FEATURED TROPHY ═══════════ */}
      {latestEarned && (
        <div className="hidden md:grid relative z-10 max-w-[1280px] mx-auto px-10 mb-8">
          <div className="bg-ink-lift border border-gold-2/30 rounded-[14px] overflow-hidden grid grid-cols-[300px_1fr] relative shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

            {/* Medal showcase */}
            <div
              className="flex items-center justify-center p-8 min-h-[280px] border-r border-gold-2/15"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 30%, rgba(246,227,85,0.15), transparent 60%),
                  radial-gradient(ellipse at 50% 70%, rgba(178,100,31,0.08), transparent 55%),
                  linear-gradient(180deg, #1a1408 0%, #0a0604 100%)
                `,
              }}
            >
              <Medal tier={latestEarned.tier} icon={latestEarned.icon} size="lg" />
            </div>

            {/* Content */}
            <div className="p-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-2/10 border border-gold-2/30 rounded-full w-fit mb-3.5">
                <span className="w-[5px] h-[5px] bg-gold-2 rounded-full shadow-[0_0_8px_var(--gold-2)]" />
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase font-bold text-gold-2">
                  {latestEarned.tier.charAt(0).toUpperCase() + latestEarned.tier.slice(1)} · Mastery
                </span>
              </div>

              <h2 className="font-serif text-[38px] font-bold italic text-off-white leading-[0.95] tracking-[-0.01em] mb-1.5">
                {latestEarned.name}
              </h2>
              <p className="font-calligraphy text-[15px] italic text-gold-2 mb-4">
                "Awarded for extraordinary performance."
              </p>
              <p className="font-body text-[13px] text-off-white/70 leading-[1.55] mb-4.5 max-w-[520px]">
                {latestEarned.description}
              </p>

              <div className="flex gap-5 py-3 border-t border-b border-off-white/[0.08] mb-4">
                <div>
                  <div className="font-display text-[16px] font-bold text-gold-2 leading-none">
                    +{latestEarned.xpReward} XP
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                    Reward
                  </div>
                </div>
                <div>
                  <div className="font-display text-[16px] font-bold text-off-white leading-none">
                    {latestEarned.earnedDate || 'Recently'}
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                    Earned
                  </div>
                </div>
                <div>
                  <div className="font-display text-[16px] font-bold text-off-white leading-none">
                    {latestEarned.rarity || '0.8%'}
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                    Of Users
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                {onShareTrophy && (
                  <button
                    onClick={() => onShareTrophy(latestEarned)}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-charcoal border border-gold-2/15 rounded-full text-off-white hover:border-gold-2 hover:text-gold-2 transition-all"
                  >
                    <Share2 size={11} />
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase font-semibold">
                      Share Medal
                    </span>
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 bg-charcoal border border-gold-2/15 rounded-full text-off-white hover:border-gold-2 hover:text-gold-2 transition-all">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase font-semibold">
                    View Moment
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MOBILE FEATURED SECTION ═══════════ */}
      {latestEarned && (
        <div className="md:hidden relative z-10 px-4 mb-5">
          <div className="mb-2.5">
            <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-1">
              Latest Earned
            </div>
            <div className="font-display text-[18px] font-bold text-off-white uppercase tracking-[-0.005em]">
              Most Recent
            </div>
          </div>

          <div className="bg-ink-lift border border-gold-2/30 rounded-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3 z-10" />

            {/* Medal */}
            <div
              className="flex justify-center items-center py-6 px-4 border-b border-gold-2/15"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 30%, rgba(246,227,85,0.15), transparent 60%),
                  linear-gradient(180deg, #1a1408 0%, #0a0604 100%)
                `,
              }}
            >
              <Medal tier={latestEarned.tier} icon={latestEarned.icon} size="md" />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-2/10 border border-gold-2/30 rounded-full mb-2.5">
                <span className="w-1 h-1 bg-gold-2 rounded-full shadow-[0_0_6px_var(--gold-2)]" />
                <span className="font-mono text-[8px] tracking-[0.28em] uppercase font-bold text-gold-2">
                  {latestEarned.tier.charAt(0).toUpperCase() + latestEarned.tier.slice(1)} · Mastery
                </span>
              </div>

              <h3 className="font-serif text-[22px] font-bold italic text-off-white leading-none mb-1">
                {latestEarned.name}
              </h3>
              <p className="font-calligraphy text-[12px] italic text-gold-2 mb-2.5">
                "Awarded for extraordinary performance."
              </p>
              <p className="font-body text-[11.5px] text-off-white/70 leading-[1.5] mb-3">
                {latestEarned.description}
              </p>

              <div className="flex gap-3.5 py-2 border-t border-b border-off-white/[0.08] mb-2.5">
                <div>
                  <div className="font-display text-[13px] font-bold text-gold-2 leading-none">
                    +{latestEarned.xpReward} XP
                  </div>
                  <div className="font-mono text-[7px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                    Reward
                  </div>
                </div>
                <div>
                  <div className="font-display text-[13px] font-bold text-off-white leading-none">
                    {latestEarned.earnedDate || 'Recently'}
                  </div>
                  <div className="font-mono text-[7px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                    Earned
                  </div>
                </div>
                <div>
                  <div className="font-display text-[13px] font-bold text-off-white leading-none">
                    {latestEarned.rarity || '0.8%'}
                  </div>
                  <div className="font-mono text-[7px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                    Of Users
                  </div>
                </div>
              </div>

              {onShareTrophy && (
                <button
                  onClick={() => onShareTrophy(latestEarned)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-charcoal border border-off-white/10 rounded-full text-off-white"
                >
                  <Share2 size={10} />
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase font-semibold">
                    Share Medal
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DESKTOP GRID SECTION HEADER ═══════════ */}
      <div className="hidden md:flex relative z-10 max-w-[1280px] mx-auto px-10 py-2.5 justify-between items-end border-b border-off-white/[0.08] mb-5">
        <div>
          <div className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold mb-1">
            The Hall
          </div>
          <div className="font-display text-[28px] font-bold text-off-white uppercase tracking-[-0.005em] leading-none">
            All <em className="not-italic text-gold-2">{selectedCampaign?.total} medals.</em>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'earned', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full font-mono text-[9px] tracking-[0.18em] uppercase font-semibold border transition-all',
                filter === f
                  ? 'bg-gold-2 text-void border-gold-2'
                  : 'bg-ink-lift text-off-white/70 border-gold-2/15 hover:border-gold-2/30'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ MOBILE GRID SECTION HEADER ═══════════ */}
      <div className="md:hidden relative z-10 px-4 mb-3">
        <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-1">
          The Hall
        </div>
        <div className="font-display text-[18px] font-bold text-off-white uppercase tracking-[-0.005em]">
          All <em className="font-serif italic font-bold text-gold-2 normal-case">Medals</em>
        </div>
      </div>

      {/* ═══════════ DESKTOP TROPHY GRID (4 columns) ═══════════ */}
      <div className="hidden md:grid relative z-10 max-w-[1280px] mx-auto px-10 pb-10 grid-cols-4 gap-5">
        {filteredTrophies.map((trophy) => (
          <TrophyCardDesktop key={trophy.id} trophy={trophy} />
        ))}
      </div>

      {/* ═══════════ MOBILE TROPHY GRID (2 columns) ═══════════ */}
      <div className="md:hidden relative z-10 px-4 pb-20 grid grid-cols-2 gap-2.5">
        {filteredTrophies.map((trophy) => (
          <TrophyCardMobile key={trophy.id} trophy={trophy} />
        ))}
      </div>
    </div>
  );
}

// ═══════════ DESKTOP TIER STAT ═══════════
function TierStatDesktop({
  tier,
  count,
  total,
  label,
}: {
  tier: 'gold' | 'silver' | 'bronze' | 'platinum';
  count: number;
  total: number;
  label: string;
}) {
  const colors = {
    gold: {
      gradient: 'from-gold-3 via-gold-1 to-gold-3',
      text: 'text-gold-2',
    },
    silver: {
      gradient: 'from-[#707078] via-[#E8E8EE] to-[#707078]',
      text: 'text-[#E8E8EE]',
    },
    bronze: {
      gradient: 'from-[#6A3A12] via-[#D4A574] to-[#6A3A12]',
      text: 'text-[#D4A574]',
    },
    platinum: {
      gradient: 'from-[#8A8A9A] via-[#F5F5FF] to-[#8A8A9A]',
      text: 'text-[#F5F5FF]',
    },
  };

  return (
    <div className="bg-ink-lift border border-gold-2/15 rounded-[10px] p-3.5 relative overflow-hidden flex flex-col justify-between">
      <div className={cn('absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r', colors[tier].gradient)} />
      <div>
        <div className="font-mono text-[8.5px] tracking-[0.28em] text-off-white/50 uppercase font-semibold mb-1">
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </div>
        <div className={cn('font-display text-[30px] font-bold leading-none tracking-[-0.01em]', colors[tier].text)}>
          {count}
          <span className="text-off-white/35 text-[18px]">/{total}</span>
        </div>
      </div>
      <div className="font-mono text-[8px] tracking-[0.18em] text-off-white/50 uppercase font-semibold mt-1.5">
        {label}
      </div>
    </div>
  );
}

// ═══════════ MOBILE TIER STAT ═══════════
function TierStatMobile({
  tier,
  count,
  label,
}: {
  tier: 'gold' | 'silver' | 'bronze' | 'platinum';
  count: number;
  label: string;
}) {
  const colors = {
    gold: {
      gradient: 'from-gold-3 via-gold-1 to-gold-3',
      text: 'text-gold-2',
    },
    silver: {
      gradient: 'from-[#707078] via-[#E8E8EE] to-[#707078]',
      text: 'text-[#E8E8EE]',
    },
    bronze: {
      gradient: 'from-[#6A3A12] via-[#D4A574] to-[#6A3A12]',
      text: 'text-[#D4A574]',
    },
    platinum: {
      gradient: 'from-[#8A8A9A] via-[#F5F5FF] to-[#8A8A9A]',
      text: 'text-[#F5F5FF]',
    },
  };

  return (
    <div className="bg-ink-lift border border-off-white/10 rounded-lg p-2.5 text-center relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', colors[tier].gradient)} />
      <div className={cn('font-display text-[20px] font-bold leading-none mt-1', colors[tier].text)}>{count}</div>
      <div className="font-mono text-[7px] tracking-[0.18em] text-off-white/50 uppercase font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}

// ═══════════ DESKTOP TROPHY CARD ═══════════
function TrophyCardDesktop({ trophy }: { trophy: Trophy }) {
  const { tier, name, description, xpReward, earnedDate, progress, lockedTier } = trophy;
  const isEarned = tier !== 'locked';

  const tierColors: Record<MedalTier, { gradient: string; text: string; bg: string; border: string }> = {
    gold: {
      gradient: 'from-gold-3 via-gold-1 to-gold-3',
      text: 'text-gold-2',
      bg: 'bg-gold-2/10',
      border: 'border-gold-2/30',
    },
    silver: {
      gradient: 'from-[#707078] via-[#E8E8EE] to-[#707078]',
      text: 'text-[#E8E8EE]',
      bg: 'bg-[#B5B5BC]/[0.08]',
      border: 'border-[#B5B5BC]/20',
    },
    bronze: {
      gradient: 'from-[#6A3A12] via-[#D4A574] to-[#6A3A12]',
      text: 'text-[#D4A574]',
      bg: 'bg-[#B2641F]/10',
      border: 'border-[#B2641F]/30',
    },
    platinum: {
      gradient: 'from-[#8A8A9A] via-[#F5F5FF] to-[#8A8A9A]',
      text: 'text-[#F5F5FF]',
      bg: 'bg-[#C8C8D8]/10',
      border: 'border-[#C8C8D8]/20',
    },
    locked: {
      gradient: '',
      text: 'text-off-white/50',
      bg: 'bg-charcoal',
      border: 'border-off-white/10',
    },
  };

  const style = tierColors[tier];
  const displayTier = isEarned ? tier : lockedTier || 'silver';

  return (
    <div
      className={cn(
        'bg-ink-lift border rounded-[10px] p-5 flex flex-col items-center text-center relative overflow-hidden transition-all cursor-pointer',
        isEarned ? 'border-gold-2/15 hover:-translate-y-[3px] hover:border-gold-2/30' : 'border-off-white/[0.06] opacity-55 hover:opacity-75'
      )}
    >
      {/* Tier top bar */}
      {isEarned && (
        <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', style.gradient)} />
      )}

      {/* Medal */}
      <div className="mb-3.5">
        <Medal tier={tier} icon={trophy.icon} size="md" />
      </div>

      {/* Tier pill */}
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] tracking-[0.25em] uppercase font-bold mb-3.5',
          isEarned ? style.bg : 'bg-charcoal',
          isEarned ? style.border : 'border-off-white/10',
          style.text,
          'border'
        )}
      >
        <span>◆</span>
        <span>
          {isEarned ? tier.charAt(0).toUpperCase() + tier.slice(1) : `Locked · ${displayTier.charAt(0).toUpperCase() + displayTier.slice(1)}`}
        </span>
      </div>

      {/* Name */}
      <h3
        className={cn(
          'font-serif text-[17px] font-bold italic leading-[1.1] mb-1.5',
          isEarned ? 'text-off-white' : 'text-off-white/50'
        )}
      >
        {name}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'font-body text-[11.5px] leading-[1.45] mb-3.5 min-h-[33px]',
          isEarned ? 'text-off-white/70' : 'text-off-white/50'
        )}
      >
        {description}
      </p>

      {/* Footer */}
      <div className="w-full pt-3 border-t border-off-white/[0.08] flex justify-between items-center font-mono text-[9px] tracking-[0.1em] uppercase font-semibold">
        <span className={isEarned ? 'text-gold-2' : 'text-off-white/50'}>
          {isEarned ? earnedDate : progress || 'Not started'}
        </span>
        <span className={isEarned ? 'text-gold-2 font-bold' : 'text-off-white/50'}>+{xpReward} XP</span>
      </div>
    </div>
  );
}

// ═══════════ MOBILE TROPHY CARD ═══════════
function TrophyCardMobile({ trophy }: { trophy: Trophy }) {
  const { tier, name, description, xpReward, earnedDate, progress, lockedTier } = trophy;
  const isEarned = tier !== 'locked';

  const tierColors: Record<MedalTier, { gradient: string; text: string; bg: string; border: string }> = {
    gold: {
      gradient: 'from-gold-3 via-gold-1 to-gold-3',
      text: 'text-gold-2',
      bg: 'bg-gold-2/10',
      border: 'border-gold-2/30',
    },
    silver: {
      gradient: 'from-[#707078] via-[#E8E8EE] to-[#707078]',
      text: 'text-[#E8E8EE]',
      bg: 'bg-[#B5B5BC]/[0.08]',
      border: 'border-[#B5B5BC]/20',
    },
    bronze: {
      gradient: 'from-[#6A3A12] via-[#D4A574] to-[#6A3A12]',
      text: 'text-[#D4A574]',
      bg: 'bg-[#B2641F]/10',
      border: 'border-[#B2641F]/30',
    },
    platinum: {
      gradient: 'from-[#8A8A9A] via-[#F5F5FF] to-[#8A8A9A]',
      text: 'text-[#F5F5FF]',
      bg: 'bg-[#C8C8D8]/10',
      border: 'border-[#C8C8D8]/20',
    },
    locked: {
      gradient: '',
      text: 'text-off-white/50',
      bg: 'bg-charcoal',
      border: 'border-off-white/10',
    },
  };

  const style = tierColors[tier];

  return (
    <div
      className={cn(
        'bg-ink-lift border rounded-[10px] p-3.5 flex flex-col items-center text-center relative overflow-hidden',
        isEarned ? 'border-off-white/10' : 'border-off-white/[0.06] opacity-55'
      )}
    >
      {/* Tier top bar */}
      {isEarned && (
        <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', style.gradient)} />
      )}

      {/* Medal */}
      <div className="mb-2.5">
        <Medal tier={tier} icon={trophy.icon} size="sm" />
      </div>

      {/* Tier pill */}
      <div
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[7px] tracking-[0.22em] uppercase font-bold mb-1.5',
          isEarned ? style.bg : 'bg-charcoal',
          isEarned ? style.border : 'border-off-white/10',
          style.text,
          'border'
        )}
      >
        {isEarned ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Locked'}
      </div>

      {/* Name */}
      <h3
        className={cn(
          'font-serif text-[12px] font-bold italic leading-[1.1] mb-1',
          isEarned ? 'text-off-white' : 'text-off-white/50'
        )}
      >
        {name}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'font-body text-[9.5px] leading-[1.35] mb-2 min-h-[38px]',
          isEarned ? 'text-off-white/70' : 'text-off-white/50'
        )}
      >
        {description}
      </p>

      {/* Footer */}
      <div className="w-full pt-2 border-t border-off-white/[0.08] flex justify-between items-center font-mono text-[7.5px] tracking-[0.08em] uppercase font-semibold">
        <span className={isEarned ? 'text-off-white' : 'text-off-white/50'}>
          {isEarned ? earnedDate : progress || 'Not started'}
        </span>
        <span className={isEarned ? 'text-gold-2 font-bold' : 'text-off-white/50'}>+{xpReward}</span>
      </div>
    </div>
  );
}

export default TrophyRoom;
export type { Trophy, Campaign };
