/**
 * ProfileDossier - Personnel file style profile page
 * Replaces ProfileSettings with new dossier aesthetic
 */

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, Share2, Settings, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

import { PortraitFrame } from './PortraitFrame';
import { RankLadder, getRankInfo } from './RankLadder';
import { StatsStrip, UserStats } from './StatsStrip';
import { StreakCalendar, DayStatus } from './StreakCalendar';
import { ActivityFeed, ActivityItem } from './ActivityFeed';
import { CampaignCard, CampaignInfo } from './CampaignCard';
import { Medal, MedalTier } from '@/components/ui/Medal';
import { Trophy } from '@/components/trophy';

interface ProfileDossierProps {
  user: {
    id: string;
    displayName: string;
    handle?: string;
    pronouns?: string;
    avatarUrl?: string;
    avatarEmoji?: string;
    bio?: string;
    favoriteEras?: string[];
    memberSince?: string;
    daysAtAcademy?: number;
  };
  stats: UserStats;
  campaigns: CampaignInfo[];
  recentTrophies?: Trophy[];
  recentActivities?: ActivityItem[];
  weekDays?: DayStatus[];
  onBack?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
  onTrophyRoom?: () => void;
  onCampaignClick?: (campaignId: string) => void;
  className?: string;
}

export function ProfileDossier({
  user,
  stats,
  campaigns,
  recentTrophies = [],
  recentActivities = [],
  weekDays,
  onBack,
  onSettings,
  onShare,
  onTrophyRoom,
  onCampaignClick,
  className,
}: ProfileDossierProps) {
  const rankInfo = getRankInfo(stats.totalXp);

  return (
    <div className={cn('profile-dossier min-h-screen bg-void flex flex-col', className)}>
      {/* Header */}
      <header className="relative bg-ink border-b border-off-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-1 text-off-white/60 hover:text-off-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="text-center">
            <div className="font-mono text-[8px] tracking-[0.25em] text-off-white/50 uppercase font-semibold">
              Personnel File
            </div>
            <h1 className="font-serif text-[16px] font-bold text-off-white italic">
              HA-001
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 text-off-white/60 hover:text-off-white transition-colors"
              >
                <Share2 size={18} />
              </button>
            )}
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2 text-off-white/60 hover:text-off-white transition-colors"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="px-4 py-6 text-center border-b border-off-white/[0.06]">
          {/* Portrait */}
          <div className="flex justify-center mb-4">
            <PortraitFrame
              avatarUrl={user.avatarUrl}
              avatarEmoji={user.avatarEmoji}
              userName={user.displayName}
              size="lg"
            />
          </div>

          {/* Name & Handle */}
          <h2 className="font-serif text-2xl font-bold italic text-off-white mb-1">
            {user.displayName}
          </h2>
          {(user.handle || user.pronouns) && (
            <div className="font-mono text-[11px] text-text-3">
              {user.handle && `@${user.handle}`}
              {user.handle && user.pronouns && ' · '}
              {user.pronouns}
            </div>
          )}

          {/* Current Rank */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Star size={14} className="text-gold-2" fill="currentColor" />
            <span className="font-mono text-[11px] text-gold-2 font-semibold tracking-wide">
              {rankInfo.currentRank.name}
            </span>
          </div>

          {/* Member info */}
          {(user.memberSince || user.daysAtAcademy) && (
            <div className="font-mono text-[9px] text-text-3 mt-2">
              {user.memberSince && <span className="font-semibold">Est. {user.memberSince}</span>}
              {user.daysAtAcademy && ` · ${user.daysAtAcademy} days at the Academy`}
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <p className="font-body text-[13px] text-text-2 mt-3 max-w-sm mx-auto leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Favorite Eras */}
          {user.favoriteEras && user.favoriteEras.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {user.favoriteEras.slice(0, 3).map((era, i) => (
                <span
                  key={era}
                  className={cn(
                    'font-mono text-[9px] px-2 py-1 rounded border',
                    i < 2
                      ? 'bg-gold-2/10 text-gold-2 border-gold-2/20'
                      : 'bg-off-white/5 text-text-3 border-off-white/10'
                  )}
                >
                  {i < 2 && '◆ '}{era}
                </span>
              ))}
              {user.favoriteEras.length > 3 && (
                <span className="font-mono text-[9px] text-text-3 px-2 py-1">
                  +{user.favoriteEras.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Strip */}
        <div className="px-4 py-4 border-b border-off-white/[0.06]">
          <StatsStrip stats={stats} compact />
        </div>

        {/* Rank Progression */}
        <div className="px-4 py-4 border-b border-off-white/[0.06]">
          <RankLadder currentXp={stats.totalXp} compact />
        </div>

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <div className="py-4 border-b border-off-white/[0.06]">
            <div className="px-4 sec-header mb-3">
              <div>
                <div className="sec-kick">Enlisted · {campaigns.length} Active</div>
                <div className="sec-title">
                  Active <em>Campaigns</em>
                </div>
              </div>
              <button className="sec-header-link">
                All <ChevronRight size={10} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClick={() => onCampaignClick?.(campaign.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trophy Highlights */}
        {recentTrophies.length > 0 && (
          <div className="py-4 border-b border-off-white/[0.06]">
            <div className="px-4 sec-header mb-3">
              <div>
                <div className="sec-kick">The Hall · Most Recent</div>
                <div className="sec-title">
                  Trophy <em>Highlights</em>
                </div>
              </div>
              <button onClick={onTrophyRoom} className="sec-header-link">
                Trophy Room <ChevronRight size={10} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {recentTrophies.map((trophy) => (
                <TrophyHighlightCard key={trophy.id} trophy={trophy} />
              ))}
            </div>
          </div>
        )}

        {/* Streak Calendar */}
        <div className="px-4 py-4 border-b border-off-white/[0.06]">
          <StreakCalendar
            streak={stats.streak}
            weekDays={weekDays}
            nextMilestone={14}
            milestoneReward={200}
          />
        </div>

        {/* Activity Feed */}
        {recentActivities.length > 0 && (
          <div className="px-4 py-4 border-b border-off-white/[0.06]">
            <ActivityFeed activities={recentActivities} maxItems={5} />
          </div>
        )}

        {/* Settings Link */}
        {onSettings && (
          <div className="px-4 py-4">
            <button
              onClick={onSettings}
              className="w-full flex items-center justify-between px-4 py-3 bg-ink-lift rounded-xl border border-border-gold hover:border-gold-2/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-text-3" />
                <span className="font-mono text-[11px] text-off-white uppercase tracking-wide">
                  Settings
                </span>
              </div>
              <ChevronRight size={16} className="text-text-3" />
            </button>
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}

// Mini trophy card for horizontal scroll
function TrophyHighlightCard({ trophy }: { trophy: Trophy }) {
  return (
    <div className="flex-shrink-0 w-[120px] bg-ink-lift rounded-xl border border-border-gold p-3 text-center">
      <div className="flex justify-center mb-2">
        <Medal tier={trophy.tier} icon={trophy.icon} size="sm" />
      </div>
      <h4 className="font-serif text-[11px] font-bold italic text-off-white leading-tight mb-1 line-clamp-1">
        {trophy.name}
      </h4>
      <div className="font-mono text-[7px] text-text-3 uppercase tracking-wide">
        {trophy.earnedDate}
      </div>
    </div>
  );
}

export default ProfileDossier;
