/**
 * ProfileTab - Personnel Dossier style profile page
 * Design: History Academy Dark v2 - Personnel file aesthetic
 * Sections: Hero, Rank Ladder, Stats Strip, Campaigns, Trophies, Certificates, Streak, Activity, Settings
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Settings, ChevronRight, ChevronDown, ChevronUp, Star, Flame,
  BookOpen, Trophy, Award, Gamepad2, User, LogOut, Eye, EyeOff
} from 'lucide-react';
import { useApp, type TabType } from '@/context/AppContext';
import { getNextRankXP } from '@/types';
import { isAdminUser } from '@/components/admin/AdminRoute';
import { cn } from '@/lib/utils';
import { StudyNotes } from '@/components/profile/StudyNotes';
import { ApiKeySettings } from '@/components/profile/ApiKeySettings';

// Rank data
const RANKS = [
  { name: 'Time Tourist', minXp: 0, icon: Star },
  { name: 'Archive Apprentice', minXp: 10000, icon: BookOpen },
  { name: 'Field Researcher', minXp: 25000, icon: Trophy },
  { name: 'Archive Master', minXp: 50000, icon: Award },
  { name: 'Grand Historian', minXp: 100000, icon: Star },
];

// Sample data (in real app, this would come from context/API)
const sampleCampaigns = [
  { id: 'ww2', title: 'Road to Victory', era: 'WW2', progress: 57, lessonsCompleted: 8, totalLessons: 14, xpEarned: 4200, theme: 'ww2' },
  { id: 'egypt', title: 'Pharaoh\'s Legacy', era: 'Egypt', progress: 24, lessonsCompleted: 3, totalLessons: 12, xpEarned: 1800, theme: 'egy' },
  { id: 'rome', title: 'Rise of the Empire', era: 'Rome', progress: 8, lessonsCompleted: 1, totalLessons: 12, xpEarned: 600, theme: 'rom' },
];

const sampleTrophies = [
  { id: '1', name: 'Summa Cum Laude', tier: 'gold' as const, context: 'WW2', date: 'Jan 18' },
  { id: '2', name: 'First Blood', tier: 'silver' as const, context: 'Quiz Master', date: 'Jan 15' },
  { id: '3', name: 'Explorer', tier: 'bronze' as const, context: 'Ancient Egypt', date: 'Jan 12' },
  { id: '4', name: 'Speed Demon', tier: 'gold' as const, context: 'Arcade', date: 'Jan 10' },
];

const sampleCertificates = [
  { id: '1', title: 'Introduction to Ancient Egypt', instructor: 'Dr. Khalid', date: 'March 12, 2026' },
  { id: '2', title: 'The Greek Polis', instructor: 'Prof. Aurelia', date: 'February 28, 2026' },
  { id: '3', title: 'Foundations of WW2', instructor: 'Sgt. Mitchell', date: 'January 18, 2026' },
];

const sampleActivities = [
  { type: 'trophy', text: 'Earned Summa Cum Laude', highlight: 'Gold Trophy', time: '3h ago' },
  { type: 'cert', text: 'Certificate awarded', highlight: 'Introduction to Egypt', time: '3h ago' },
  { type: 'lesson', text: 'Completed Lesson 14', highlight: 'Pearl Harbor Campaign', time: '4h ago' },
  { type: 'game', text: 'New high score', highlight: 'Chrono Clash · 2,450 pts', time: '5h ago' },
  { type: 'rank', text: 'Ranked up to', highlight: 'Time Tourist II', time: 'Yesterday' },
];

// Week days for streak calendar
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ProfileTab() {
  const { user, updateUser, crownedCount, signOut, userEmail, studyNotes, setActiveTab, setPendingTrophyRoom } = useApp();
  const [showStudyNotes, setShowStudyNotes] = useState(false);

  const handleTrophyRoomClick = () => {
    setPendingTrophyRoom(true);
    setActiveTab('journey');
  };

  // Get rank info
  const { next, threshold, current } = getNextRankXP(user.xp);
  const currentRankIdx = RANKS.findIndex((r, i) =>
    user.xp >= r.minXp && (i === RANKS.length - 1 || user.xp < RANKS[i + 1].minXp)
  );
  const currentRank = RANKS[currentRankIdx] || RANKS[0];
  const nextRank = RANKS[currentRankIdx + 1];
  const progressPct = nextRank
    ? Math.round(((user.xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100)
    : 100;

  // Simulate streak days (last 7 days)
  const streakDays = [true, true, true, true, true, false, false]; // M-F active, S-S future

  return (
    <div className="min-h-screen bg-void">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <div className="relative bg-ink overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(230,171,42,0.08), transparent 45%), radial-gradient(ellipse at 85% 60%, rgba(205,14,20,0.04), transparent 45%)'
        }} />

        {/* File strip header */}
        <div className="relative z-10 px-4 py-2 flex justify-between items-center border-b border-off-white/[0.06] bg-void/40">
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.35em] text-gold-2 uppercase font-bold">
            <span className="w-[6px] h-[6px] bg-success rounded-full shadow-[0_0_8px_var(--success)]" />
            Active · Personnel File · HA-001
          </div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-text-3 uppercase font-semibold">
            Member <span className="text-gold-2">#4,820</span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-4 py-6 flex gap-5 items-start">
          {/* Portrait Frame */}
          <div className="relative w-[110px] h-[128px] flex-shrink-0">
            <div className="absolute inset-0 border-2 border-gold-3 bg-gradient-to-b from-[#1a1008] to-[#0a0604] p-[6px]">
              <div className="absolute inset-[3px] border border-gold-2/20 pointer-events-none" />
              <div className="relative w-full h-[calc(100%-18px)] overflow-hidden bg-gradient-to-b from-[#2a1810] to-[#0a0604]" style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(230,171,42,0.15), transparent 55%), linear-gradient(180deg, #2a1810 0%, #0a0604 100%)'
              }}>
                {/* Silhouette */}
                <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-[70%] h-full rounded-[45%_45%_10%_10%]" style={{
                  background: 'radial-gradient(ellipse at 50% 20%, rgba(180,140,95,0.55), rgba(60,40,25,0.85) 50%, rgba(20,12,6,0.95) 90%)'
                }}>
                  <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[40%] h-[30%] rounded-full" style={{
                    background: 'radial-gradient(circle at 50% 30%, rgba(210,170,130,0.55), rgba(90,60,35,0.4) 70%, transparent)'
                  }} />
                </div>
              </div>
              <div className="absolute bottom-0 left-[6px] right-[6px] h-[14px] bg-void border-t border-gold-2/20 flex items-center justify-center">
                <span className="font-mono text-[6px] tracking-[0.4em] text-gold-2 uppercase font-bold">◆ FILE ◆</span>
              </div>
            </div>
            {/* Corner flourishes */}
            <div className="absolute -top-[1px] -left-[1px] w-[10px] h-[10px] border-t-2 border-l-2 border-gold-2" />
            <div className="absolute -top-[1px] -right-[1px] w-[10px] h-[10px] border-t-2 border-r-2 border-gold-2" />
            <div className="absolute -bottom-[1px] -left-[1px] w-[10px] h-[10px] border-b-2 border-l-2 border-gold-2" />
            <div className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] border-b-2 border-r-2 border-gold-2" />
          </div>

          {/* Hero body */}
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="font-serif text-[28px] font-bold italic text-off-white leading-[0.95] mb-1">
              {user.displayName}
            </h1>
            <div className="font-mono text-[10px] text-text-3 tracking-wide mb-3">
              @{user.displayName.toLowerCase().replace(/\s/g, '')} · they/them
            </div>

            {/* Rank badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-b from-gold-2/12 to-gold-3/6 border border-gold-2/30 rounded-full mb-3">
              <Star size={12} className="text-gold-2" fill="currentColor" />
              <span className="font-display text-[11px] text-gold-2 font-bold tracking-[0.15em] uppercase">
                {currentRank.name}
              </span>
            </div>

            {/* Tenure */}
            <div className="font-calligraphy text-[12px] italic text-text-2 mb-3">
              <span className="font-mono text-[9px] text-gold-2 font-bold tracking-[0.15em] uppercase not-italic mr-1">Est. MMXXV</span>
              127 days at the Academy
            </div>

            {/* Era tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-gold-2/8 border border-gold-2/20 rounded-full font-mono text-[8px] tracking-[0.2em] text-gold-2 uppercase font-semibold">◆ WW2</span>
              <span className="px-2 py-1 bg-gold-2/8 border border-gold-2/20 rounded-full font-mono text-[8px] tracking-[0.2em] text-gold-2 uppercase font-semibold">◆ Egypt</span>
              <span className="px-2 py-1 bg-off-white/5 border border-off-white/10 rounded-full font-mono text-[8px] tracking-[0.2em] text-text-3 uppercase font-semibold">Rome</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button className="p-2.5 bg-ink-lift border border-border-gold rounded-full text-text-3 hover:text-gold-2 hover:border-gold-2/30 transition-colors">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ RANK LADDER ═══════════ */}
      <div className="px-4 py-4">
        <div className="bg-ink-lift border border-border-gold rounded-xl p-4 relative overflow-hidden">
          {/* Gold bar top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold mb-1">Rank Progression</div>
              <div className="font-display text-lg font-bold text-off-white uppercase tracking-tight">
                The <span className="text-gold-2">road</span> to Grand Historian.
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold text-gold-2 leading-none">
                {user.xp.toLocaleString()}<span className="text-text-3 text-sm"> / {(nextRank?.minXp || 100000).toLocaleString()} XP</span>
              </div>
              {nextRank && (
                <div className="font-mono text-[9px] text-text-2 tracking-[0.2em] uppercase font-semibold mt-1">
                  {(nextRank.minXp - user.xp).toLocaleString()} XP to <span className="text-gold-2">{nextRank.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ladder visual */}
          <div className="relative py-3">
            {/* Track line */}
            <div className="absolute top-[27px] left-[40px] right-[40px] h-[2px] bg-off-white/8 rounded">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-3 to-gold-2 rounded"
                style={{ width: `${Math.min(progressPct + (currentRankIdx * 25), 100)}%` }}
              />
            </div>

            {/* Nodes */}
            <div className="flex justify-between relative">
              {RANKS.map((rank, i) => {
                const isCompleted = i < currentRankIdx;
                const isCurrent = i === currentRankIdx;
                const isLocked = i > currentRankIdx;
                const RankIcon = rank.icon;

                return (
                  <div key={rank.name} className="flex flex-col items-center gap-2 w-[54px]">
                    <div className={cn(
                      'w-[42px] h-[42px] rounded-full flex items-center justify-center relative z-10',
                      isCurrent && 'bg-gradient-to-br from-gold-1 to-gold-3 border-2 border-gold-2 shadow-[0_0_24px_rgba(230,171,42,0.4)]',
                      isCompleted && 'bg-gradient-to-b from-gold-3 to-gold-deep border-2 border-gold-3',
                      isLocked && 'bg-ink-lift border-2 border-border-gold opacity-60'
                    )}>
                      <RankIcon size={16} className={cn(
                        isCurrent && 'text-void',
                        isCompleted && 'text-gold-1',
                        isLocked && 'text-text-3'
                      )} fill={isCurrent || isCompleted ? 'currentColor' : 'none'} />
                      {isCurrent && (
                        <div className="absolute -inset-[6px] border border-dashed border-gold-2 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        'font-display text-[9px] font-bold uppercase tracking-wide leading-tight',
                        isCurrent ? 'text-gold-2' : isLocked ? 'text-text-3' : 'text-off-white'
                      )}>
                        {rank.name.split(' ').map((w, wi) => <div key={wi}>{w}</div>)}
                      </div>
                      {isCurrent && (
                        <div className="font-mono text-[7px] tracking-[0.25em] text-ha-red uppercase font-bold mt-1">You</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          <StatCard value={user.xp.toLocaleString()} label="Total XP" highlight />
          <StatCard value={user.streak.toString()} label="Day Streak" valueColor="text-gold-2" />
          <StatCard value="94%" label="Accuracy" valueColor="text-success" />
          <StatCard value={crownedCount.toString()} label="Trophies" />
        </div>
      </div>

      {/* ═══════════ ACTIVE CAMPAIGNS ═══════════ */}
      <div className="pb-4">
        <SectionHeader kick="Enlisted" title="Active" em="Campaigns" count={sampleCampaigns.length} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {sampleCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      </div>

      {/* ═══════════ TROPHY HIGHLIGHTS ═══════════ */}
      <div className="pb-4">
        <SectionHeader kick="The Hall" title="Trophy" em="Highlights" action="Trophy Room →" onAction={handleTrophyRoomClick} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {sampleTrophies.map((trophy) => (
            <TrophyCard key={trophy.id} trophy={trophy} />
          ))}
        </div>
      </div>

      {/* ═══════════ CERTIFICATES ═══════════ */}
      <div className="pb-4">
        <SectionHeader kick="Diplomas" title="Earned" em="Certificates" />
        <div className="px-4 flex flex-col gap-2">
          {sampleCertificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      </div>

      {/* ═══════════ STREAK CALENDAR ═══════════ */}
      <div className="px-4 pb-4">
        <div className="bg-ink-lift border border-border-gold rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-gold-1 to-gold-3 flex items-center justify-center">
              <Flame size={18} className="text-void" />
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[0.3em] text-text-3 uppercase font-bold">Current Streak</div>
              <div className="font-serif text-[22px] font-bold italic text-gold-2 leading-none mt-0.5">{user.streak} days</div>
            </div>
          </div>

          <div className="flex justify-between font-mono text-[8px] tracking-[0.25em] text-text-3 uppercase font-semibold mb-2">
            {weekDays.map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {streakDays.map((active, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded-sm flex items-center justify-center font-mono text-[8px] font-semibold',
                  active && i < 5 && 'bg-gradient-to-br from-gold-3 to-gold-2 text-void',
                  i === 4 && 'bg-ha-red text-off-white shadow-[0_0_8px_rgba(205,14,20,0.4)]',
                  !active && i >= 5 && 'bg-transparent border border-off-white/8'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-off-white/8 text-center font-mono text-[9px] tracking-[0.15em] text-text-2 uppercase font-semibold">
            <span className="text-gold-2">7 more days</span> to unlock 200 XP bonus
          </div>
        </div>
      </div>

      {/* ═══════════ ACTIVITY FEED ═══════════ */}
      <div className="px-4 pb-4">
        <div className="bg-ink-lift border border-border-gold rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-off-white/8">
            <div className="font-mono text-[9px] tracking-[0.3em] text-ha-red uppercase font-bold mb-1">Timeline</div>
            <div className="font-serif text-[15px] font-bold italic text-off-white">Recent Activity</div>
          </div>

          <div className="divide-y divide-off-white/8">
            {sampleActivities.map((act, i) => (
              <ActivityItem key={i} activity={act} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ SETTINGS SECTION ═══════════ */}
      <div className="px-4 pb-6">
        <SectionHeader kick="Account" title="Settings" em="& Admin" />

        <div className="space-y-2">
          {/* Anonymous toggle */}
          <button
            onClick={() => updateUser({ anonLeaderboard: !user.anonLeaderboard })}
            className="w-full bg-ink-lift border border-border-gold rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {user.anonLeaderboard ? <EyeOff size={18} className="text-text-3" /> : <Eye size={18} className="text-gold-2" />}
              <div className="text-left">
                <p className="font-mono text-[11px] text-off-white uppercase tracking-wide">Anonymous on Leaderboard</p>
                <p className="font-mono text-[9px] text-text-3">{user.anonLeaderboard ? 'Your name is hidden' : 'Your name is visible'}</p>
              </div>
            </div>
            <div className={cn('w-10 h-5 rounded-full transition-colors', user.anonLeaderboard ? 'bg-gold-2' : 'bg-off-white/10')}>
              <motion.div
                className="w-4 h-4 bg-off-white rounded-full mt-0.5"
                animate={{ x: user.anonLeaderboard ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>

          {/* Account info */}
          {userEmail && (
            <div className="w-full bg-ink-lift border border-border-gold rounded-xl p-4 flex items-center gap-3">
              <User size={18} className="text-text-3" />
              <div className="text-left">
                <p className="font-mono text-[11px] text-off-white uppercase tracking-wide">Account</p>
                <p className="font-mono text-[9px] text-text-3">{userEmail}</p>
              </div>
            </div>
          )}

          {/* Study Notes */}
          <div>
            <button
              onClick={() => setShowStudyNotes(!showStudyNotes)}
              className="w-full bg-ink-lift border border-border-gold rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-gold-2" />
                <span className="font-mono text-[11px] text-off-white uppercase tracking-wide">Study Notes</span>
                {studyNotes.length > 0 && (
                  <span className="font-mono text-[9px] bg-gold-2/20 text-gold-2 px-2 py-0.5 rounded-full">
                    {studyNotes.length}
                  </span>
                )}
              </div>
              {showStudyNotes ? <ChevronUp size={16} className="text-text-3" /> : <ChevronDown size={16} className="text-text-3" />}
            </button>

            <AnimatePresence>
              {showStudyNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-xl border border-border-gold bg-ink-lift overflow-hidden">
                    <StudyNotes />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* API Keys */}
          <ApiKeySettings />

          {/* Sign Out */}
          <button
            onClick={signOut}
            className="w-full bg-ink-lift border border-border-gold rounded-xl p-4 flex items-center gap-3 text-ha-red"
          >
            <LogOut size={18} />
            <span className="font-mono text-[11px] uppercase tracking-wide">Sign Out</span>
          </button>

          {/* Admin Panel Link - Only shown to admin users */}
          {isAdminUser(userEmail) && (
            <Link to="/admin">
              <div className="w-full bg-ink-lift border border-gold-2/30 rounded-xl p-4 flex items-center gap-3 text-gold-2">
                <Settings size={18} />
                <span className="font-mono text-[11px] uppercase tracking-wide">Admin Panel</span>
                <ChevronRight size={14} className="ml-auto" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom padding for nav */}
      <div className="h-24" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════

function StatCard({ value, label, highlight, valueColor }: { value: string; label: string; highlight?: boolean; valueColor?: string }) {
  return (
    <div className="bg-ink-lift border border-border-gold rounded-lg px-2 py-3 text-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gold-2" />
      <div className={cn('font-display text-lg font-bold leading-none mt-1', valueColor || (highlight ? 'text-gold-2' : 'text-off-white'))}>
        {value}
      </div>
      <div className="font-mono text-[7px] tracking-[0.18em] text-text-3 uppercase font-semibold mt-1">{label}</div>
    </div>
  );
}

function SectionHeader({ kick, title, em, count, action, onAction }: { kick: string; title: string; em?: string; count?: number; action?: string; onAction?: () => void }) {
  return (
    <div className="px-4 pb-3 flex justify-between items-end">
      <div>
        <div className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold mb-1">
          {kick}{count !== undefined && ` · ${count}`}
        </div>
        <div className="font-display text-lg font-bold text-off-white uppercase tracking-tight leading-none">
          {title} {em && <span className="text-gold-2">{em}</span>}
        </div>
      </div>
      {action && (
        <button onClick={onAction} className="font-mono text-[9px] tracking-[0.18em] text-gold-2 uppercase font-semibold hover:text-gold-1 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

const campaignThemes: Record<string, string> = {
  ww2: 'bg-gradient-to-br from-[#3a2818] to-[#0a0604]',
  egy: 'bg-gradient-to-br from-[#6a4820] to-[#2a1a08]',
  rom: 'bg-gradient-to-br from-[#4a2814] to-[#1a0804]',
  cw: 'bg-gradient-to-br from-[#1a2030] to-[#08101a]',
};

function CampaignCard({ campaign }: { campaign: typeof sampleCampaigns[0] }) {
  return (
    <div className="flex-shrink-0 w-[200px] bg-ink-lift border border-border-gold rounded-xl overflow-hidden">
      <div className={cn('h-[80px] relative', campaignThemes[campaign.theme] || campaignThemes.ww2)}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        <div className="absolute top-2 left-2 font-mono text-[7px] tracking-[0.25em] text-gold-2 uppercase font-bold z-10">
          {campaign.era}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-gold-2 px-2 py-0.5 font-mono text-[8px] font-bold tracking-wide border border-border-gold rounded-sm z-10">
          {campaign.progress}%
        </div>
      </div>
      <div className="p-3 relative">
        <div className="absolute top-0 left-3 w-[18px] h-[1.5px] bg-ha-red" />
        <h3 className="font-serif text-[13px] font-bold italic text-off-white leading-tight mb-2 line-clamp-2 min-h-[30px] mt-2">
          {campaign.title}
        </h3>
        <div className="h-[2px] bg-off-white/8 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gold-2 rounded-full" style={{ width: `${campaign.progress}%` }} />
        </div>
        <div className="font-mono text-[8px] text-text-3 tracking-wide">
          {campaign.lessonsCompleted}/{campaign.totalLessons} · <span className="text-gold-2">{campaign.xpEarned.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  );
}

const tierGradients = {
  gold: 'bg-gradient-to-br from-[#FFEC8B] via-gold-2 to-gold-3',
  silver: 'bg-gradient-to-br from-white via-[#B5B5BC] to-[#707078]',
  bronze: 'bg-gradient-to-br from-[#F5D4A8] via-[#B2641F] to-[#6A3A12]',
};

const tierTopBars = {
  gold: 'bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3',
  silver: 'bg-gradient-to-r from-[#707078] via-[#E8E8EE] to-[#707078]',
  bronze: 'bg-gradient-to-r from-[#6A3A12] via-[#D4A574] to-[#6A3A12]',
};

function TrophyCard({ trophy }: { trophy: typeof sampleTrophies[0] }) {
  return (
    <div className="flex-shrink-0 w-[120px] bg-ink-lift border border-border-gold rounded-xl p-3 text-center relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', tierTopBars[trophy.tier])} />

      {/* Medal */}
      <div className="flex justify-center mb-2 mt-2">
        <div className="relative">
          {/* Ribbon */}
          <div className="relative w-[22px] h-[18px] mx-auto">
            <div className="absolute top-0 left-0 w-[9px] h-[18px] bg-ha-red-deep" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', transform: 'skewX(5deg)' }} />
            <div className="absolute top-0 right-0 w-[9px] h-[18px] bg-ha-red-deep" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', transform: 'skewX(-5deg)' }} />
            <div className="absolute top-0 left-[6px] w-[10px] h-[14px] bg-ha-red z-10" />
          </div>
          {/* Disc */}
          <div className={cn('w-[42px] h-[42px] rounded-full -mt-2 mx-auto flex items-center justify-center', tierGradients[trophy.tier])} style={{
            boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(0,0,0,0.3)'
          }}>
            <div className="w-[34px] h-[34px] rounded-full border border-dashed border-black/35 flex items-center justify-center">
              <Award size={14} className="text-black/55" />
            </div>
          </div>
        </div>
      </div>

      <h4 className="font-serif text-[11px] font-bold italic text-off-white leading-tight mb-1 line-clamp-1">{trophy.name}</h4>
      <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mb-1">{trophy.context}</div>
      <div className="font-mono text-[8px] text-gold-2 tracking-[0.15em] font-bold">{trophy.date}</div>
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: typeof sampleCertificates[0] }) {
  return (
    <div className="bg-ink-lift border border-gold-2/30 rounded-xl p-3 flex gap-3 items-center relative overflow-hidden">
      {/* Corner flourishes */}
      <div className="absolute top-[5px] left-[5px] w-[7px] h-[7px] border-l-[1.5px] border-t-[1.5px] border-gold-2 pointer-events-none" />
      <div className="absolute bottom-[5px] right-[5px] w-[7px] h-[7px] border-r-[1.5px] border-b-[1.5px] border-gold-2 pointer-events-none" />

      {/* Wax seal */}
      <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-radial from-[#d91a1a] to-ha-red-deep border-[1.5px] border-gold-2" style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 0 6px rgba(0,0,0,0.3)'
      }}>
        <span className="font-serif text-[15px] font-bold italic text-gold-1 drop-shadow">H</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[7px] tracking-[0.28em] text-gold-2 uppercase font-bold mb-0.5">Certificate</div>
        <h4 className="font-serif text-[12px] font-bold italic text-off-white leading-tight line-clamp-1 mb-0.5">{certificate.title}</h4>
        <div className="font-mono text-[8px] text-text-3 tracking-wide font-semibold">
          {certificate.instructor} · {certificate.date}
        </div>
      </div>
    </div>
  );
}

const activityIcons: Record<string, { icon: typeof Trophy; bg: string; color: string; border: string }> = {
  trophy: { icon: Trophy, bg: 'bg-gradient-to-br from-gold-2/15 to-gold-3/8', color: 'text-gold-2', border: 'border-gold-2/30' },
  cert: { icon: Award, bg: 'bg-gold-2/8', color: 'text-gold-2', border: 'border-border-gold' },
  lesson: { icon: BookOpen, bg: 'bg-success/8', color: 'text-success', border: 'border-success/20' },
  game: { icon: Gamepad2, bg: 'bg-[#4A9FFF]/8', color: 'text-[#4A9FFF]', border: 'border-[#4A9FFF]/20' },
  rank: { icon: Star, bg: 'bg-ha-red/8', color: 'text-ha-red', border: 'border-ha-red/20' },
};

function ActivityItem({ activity }: { activity: typeof sampleActivities[0] }) {
  const config = activityIcons[activity.type] || activityIcons.lesson;
  const Icon = config.icon;

  return (
    <div className="px-4 py-3 flex gap-3 items-start">
      <div className={cn('w-[24px] h-[24px] rounded-md flex items-center justify-center flex-shrink-0 border', config.bg, config.border)}>
        <Icon size={11} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[11px] text-off-white leading-tight mb-0.5">
          {activity.text} <span className="text-gold-2 font-semibold">{activity.highlight}</span>
        </p>
        <p className="font-mono text-[7.5px] tracking-[0.15em] text-text-3 uppercase font-semibold">{activity.time}</p>
      </div>
    </div>
  );
}

export default ProfileTab;
