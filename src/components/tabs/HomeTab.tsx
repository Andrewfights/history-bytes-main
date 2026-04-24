/**
 * HomeTab - Main home page
 * Design: History Academy Dark v2 - Home Page
 * Sections: Greeting, Hero (Continue), Today (Dispatch + TDIH), Declassified, Quick Access
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Gamepad2, Trophy, X, BookOpen, Calendar, MapPin, User, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePearlHarborProgress } from '@/components/journey/pearl-harbor/hooks/usePearlHarborProgress';
import { PEARL_HARBOR_LESSONS, getLessonById } from '@/data/pearlHarborLessons';
import { subscribeToWW2ModuleAssets, FirestoreWW2ModuleAssets } from '@/lib/firestore';
import { cn } from '@/lib/utils';

interface HomeTabProps {
  onStartSession: () => void;
  onPlayDaily: () => void;
  onSelectTopic: (topicId: string) => void;
}

// This Day in History data
interface HistoryEvent {
  year: string;
  title: string;
  tag: string;
  description: string;
  fullDescription: string;
  location: string;
  significance: string;
}

const thisDayEvents: HistoryEvent[] = [
  {
    year: '1915',
    title: 'Second Battle of Ypres begins',
    tag: 'WWI',
    description: '168 tons of chlorine gas along a 6 km line in Belgium. The first large-scale use of poison gas in warfare.',
    fullDescription: 'On this day in 1915, the German Army launched the first large-scale use of chemical weapons in warfare near the Belgian city of Ypres. At 5:00 PM, German troops opened approximately 6,000 cylinders containing 168 tons of chlorine gas along a 6-kilometer front. The greenish-yellow cloud drifted toward French and Algerian troops, causing mass panic and approximately 6,000 casualties. This attack marked a turning point in military history, introducing a new and terrifying form of warfare that would define much of the First World War.',
    location: 'Ypres, Belgium',
    significance: 'First large-scale use of chemical weapons in warfare',
  },
  {
    year: '1945',
    title: 'U.S. troops liberate Flossenburg',
    tag: 'WWII',
    description: 'The 90th and 97th Infantry Divisions reach the concentration camp in Bavaria.',
    fullDescription: 'On April 22, 1945, soldiers from the U.S. 90th and 97th Infantry Divisions liberated Flossenbürg concentration camp in Bavaria, Germany. The camp had been established in 1938 and held primarily political prisoners and Jews. Over 30,000 people had died in the camp and its subcamps. Among those executed just weeks before liberation was Dietrich Bonhoeffer, the German theologian and anti-Nazi dissident. The liberating soldiers found approximately 1,500 prisoners too weak to have been sent on death marches.',
    location: 'Bavaria, Germany',
    significance: 'Liberation of a major Nazi concentration camp',
  },
  {
    year: '1970',
    title: 'The first Earth Day',
    tag: 'Cultural',
    description: 'Twenty million Americans demonstrate for environmental protection.',
    fullDescription: 'On April 22, 1970, an estimated 20 million Americans participated in the first Earth Day, making it the largest single-day protest in human history at that time. Organized by Senator Gaylord Nelson of Wisconsin and activist Denis Hayes, the event united people from all walks of life to protest environmental degradation. Earth Day 1970 led directly to the creation of the Environmental Protection Agency (EPA) and passage of the Clean Air, Clean Water, and Endangered Species Acts. Today, Earth Day is observed by more than a billion people in 192 countries.',
    location: 'United States',
    significance: 'Launched the modern environmental movement',
  },
];

// Newly Declassified campaigns
const newReleases = [
  {
    id: 'cold-war',
    era: '1947 · Iron Curtain',
    title: 'Berlin & the Wall',
    description: 'The city split in two for forty years. Airlift, stand-off, fall.',
    instructor: 'Col. Harding',
    lessons: 12,
    status: 'new' as const,
    date: 'Available',
    romanNum: 'VI',
    bgClass: 'cold-war',
  },
  {
    id: 'norman',
    era: '1066 · Conquest',
    title: 'The Norman Conquest',
    description: 'One battle that rewrote an island\'s language, law, and bloodline for a thousand years.',
    instructor: 'Brother Anselm',
    lessons: 8,
    status: 'soon' as const,
    date: 'May 20',
    romanNum: 'III',
    bgClass: 'medieval-norm',
  },
  {
    id: 'crusade',
    era: '1095 · Holy War',
    title: 'The First Crusade',
    description: 'From Clermont to Jerusalem. Four years of faith, famine, and iron.',
    instructor: 'Dr. Aleynikov',
    lessons: 10,
    status: 'soon' as const,
    date: 'Jun 3',
    romanNum: 'III',
    bgClass: 'medieval-crus',
  },
  {
    id: 'plague',
    era: '1347 · The Plague',
    title: 'The Black Death',
    description: 'The century Europe lost a third of itself. Contagion, collapse, and recovery.',
    instructor: 'Dr. Moretti',
    lessons: 14,
    status: 'soon' as const,
    date: 'Jul 15',
    romanNum: 'III',
    bgClass: 'plague',
  },
];

export function HomeTab({ onStartSession, onPlayDaily, onSelectTopic }: HomeTabProps) {
  const { user, setActiveTab, setPendingPearlHarbor, selectedHost } = useApp();

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Pearl Harbor progress
  const { progress, totalXP, checkpoint } = usePearlHarborProgress();
  const completedLessons = progress.completedActivities.filter(
    id => id.startsWith('ph-beat-')
  ).length;
  const totalLessons = PEARL_HARBOR_LESSONS.length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Get current lesson info
  const currentLessonIndex = completedLessons;
  const currentLesson = PEARL_HARBOR_LESSONS[currentLessonIndex];
  const nextLesson = PEARL_HARBOR_LESSONS[currentLessonIndex + 1];

  // WW2 Module assets from Firestore
  const [ww2Assets, setWw2Assets] = useState<FirestoreWW2ModuleAssets | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setWw2Assets(assets);
    });
    return () => unsubscribe();
  }, []);

  // Get host name
  const hostName = selectedHost?.name || 'Sgt. J. Mitchell';

  // Current date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);
  const shortDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Handler to enter Pearl Harbor journey
  const handleContinue = () => {
    setPendingPearlHarbor(true);
    setActiveTab('journey');
  };

  return (
    <div className="min-h-screen bg-void pb-24">
      {/* ═══════════ GREETING STRIP ═══════════ */}
      <section className="px-4 md:px-10 pt-6 pb-3 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          {/* Left: Date + Welcome */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-5 h-px bg-ha-red" />
              <span className="font-mono text-[10px] tracking-[0.35em] text-ha-red uppercase font-bold">
                {formattedDate}
              </span>
            </div>
            <h1 className="font-serif text-[32px] md:text-[42px] font-bold italic text-off-white leading-none tracking-[-0.01em]">
              Welcome back, <em className="text-gold-2">{user.displayName || 'Historian'}.</em>
            </h1>
          </div>

          {/* Right: Stat chips */}
          <div className="flex gap-2.5 flex-shrink-0">
            <StatChip label="Streak" value={`${user.streak}`} suffix="days" fire />
            <StatChip label="XP This Week" value={`+${totalXP || 442}`} />
            <StatChip label="Rank" value="Archive" suffix="Apprentice" small />
          </div>
        </div>
      </section>

      {/* ═══════════ HERO: CONTINUE WHERE YOU LEFT OFF ═══════════ */}
      <section className="px-4 md:px-10 py-4 max-w-[1280px] mx-auto">
        <div className="relative rounded-xl overflow-hidden border border-gold-2/30 min-h-[380px] md:min-h-[440px] flex shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          {/* Gold top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3 z-10" />

          {/* Background */}
          <div className="absolute inset-0 z-0">
            {/* Atmospheric layers */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 65% 25%, rgba(220,80,30,0.35) 0%, transparent 42%),
                  radial-gradient(ellipse at 25% 65%, rgba(120,80,40,0.4) 0%, transparent 55%),
                  linear-gradient(180deg, #3a2818 0%, #1a1008 40%, #050302 100%)
                `,
              }}
            />
            {/* Ship silhouette */}
            <div
              className="absolute bottom-[22%] right-[8%] w-[36%] h-[22%] opacity-75"
              style={{
                background: 'linear-gradient(180deg, rgba(40,30,22,0.9) 0%, rgba(15,10,6,0.95) 60%, rgba(8,5,3,1) 100%)',
                clipPath: 'polygon(0 65%, 12% 55%, 22% 35%, 28% 28%, 36% 25%, 55% 28%, 64% 30%, 70% 22%, 76% 35%, 84% 40%, 92% 42%, 100% 48%, 100% 100%, 0 100%)',
              }}
            />
            {/* Smoke */}
            <div
              className="absolute top-[10%] right-[12%] w-[45%] h-[45%] blur-[18px]"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(40,30,25,0.5) 0%, transparent 60%)',
              }}
            />
            {/* Flash */}
            <div
              className="absolute top-[24%] right-[14%] w-2 h-2 bg-[rgba(255,180,60,0.9)] rounded-full shadow-[0_0_30px_10px_rgba(255,140,40,0.55)]"
              style={{ animation: 'flicker 3s infinite' }}
            />
            {/* Scrim */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(10,6,4,0.88) 0%, rgba(10,6,4,0.72) 40%, rgba(10,6,4,0.45) 65%, rgba(10,6,4,0.2) 100%)',
              }}
            />
          </div>

          {/* ═══ LEFT CONTENT ═══ */}
          <div className="flex-1 p-6 md:p-10 relative z-10 flex flex-col max-w-[720px]">
            {/* Kick label */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 bg-ha-red rounded-full shadow-[0_0_10px_var(--ha-red)]" style={{ animation: 'pulse 2s infinite' }} />
              <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">
                Active Briefing
              </span>
              <span className="text-text-3">·</span>
              <span className="font-mono text-[9px] tracking-[0.25em] text-gold-2 uppercase font-semibold">
                Pearl Harbor · Day of Infamy
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-[36px] md:text-[64px] font-bold italic text-off-white leading-[0.95] tracking-[-0.015em] mb-3 text-shadow-lg">
              {currentLesson?.title || 'Voices from'} <em className="text-gold-2">{currentLesson?.subtitle || 'the Harbor.'}</em>
            </h2>

            {/* Description */}
            <p className="font-calligraphy text-[15px] md:text-[19px] italic text-text-2 leading-[1.4] max-w-[520px] mb-5 text-shadow">
              {currentLesson?.description || 'Three survivor testimonies from the morning of December 7. Firsthand accounts you won\'t find in the official record.'}
            </p>

            {/* Instructor chip - clickable for backstory */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-2.5 px-3 py-2 bg-[rgba(20,14,8,0.7)] backdrop-blur-[10px] border border-gold-2/30 rounded-full mb-5 self-start hover:border-gold-2/60 hover:bg-[rgba(30,20,12,0.8)] transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgba(180,140,95,0.6)] to-[rgba(60,40,25,0.85)] border border-gold-2 overflow-hidden group-hover:border-gold-1 transition-colors">
                {selectedHost?.imageUrl && (
                  <img
                    src={selectedHost.imageUrl}
                    alt={hostName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[7.5px] tracking-[0.3em] text-text-3 uppercase font-bold">Your Guide</span>
                <span className="font-serif text-[13px] font-bold italic text-off-white group-hover:text-gold-2 transition-colors">{hostName}</span>
              </div>
              <ChevronRight size={14} className="text-gold-2/50 group-hover:text-gold-2 transition-colors ml-1" />
            </button>

            {/* Progress bar */}
            <div className="max-w-[420px] mb-5">
              <div className="flex justify-between font-mono text-[9px] text-text-3 uppercase tracking-[0.22em] font-bold mb-1.5">
                <span>Pearl Harbor · <span className="text-gold-2">{completedLessons} of {totalLessons}</span></span>
                <span>+{totalXP || 442} XP accumulated</span>
              </div>
              <div className="h-[3px] bg-off-white/15 rounded-sm overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-3 to-gold-1 rounded-sm relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gold-1 rounded-full shadow-[0_0_12px_var(--gold-1)]" />
                </motion.div>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-3 mt-auto">
              <button
                onClick={handleContinue}
                className="btn-ha-red flex items-center gap-2.5"
              >
                Continue Lesson
                <ArrowRight size={14} />
              </button>
              <div className="flex flex-col gap-0.5 pl-2">
                <span className="font-mono text-[7.5px] tracking-[0.28em] text-text-3 uppercase font-bold">Time · Reward</span>
                <span className="font-mono text-[11px] text-gold-2 font-bold tracking-[0.08em]">7 min · +65 XP</span>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT SIDEBAR (Desktop) ═══ */}
          <div className="hidden md:flex w-[280px] flex-shrink-0 p-10 pl-0 flex-col gap-3 relative z-10">
            {/* Next up card */}
            <div className="bg-[rgba(15,10,6,0.65)] backdrop-blur-[10px] border border-gold-2/15 rounded-xl p-4 relative">
              <div className="absolute top-0 left-4 w-5 h-0.5 bg-gold-2" />
              <div className="font-mono text-[8px] tracking-[0.3em] text-text-3 uppercase font-bold mt-1.5 mb-1">Next up after this</div>
              <div className="font-serif text-[17px] font-bold italic text-off-white leading-tight mb-1.5">
                {nextLesson?.title || 'Second Wave'}
              </div>
              <div className="font-mono text-[8px] tracking-[0.15em] text-gold-2 uppercase font-bold">
                Ford Island · 09:00 · 6 min
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-[rgba(15,10,6,0.65)] backdrop-blur-[10px] border border-gold-2/15 rounded-xl p-4">
              <HeroStat label="Lessons Left" value={totalLessons - completedLessons} />
              <HeroStat label="To Diploma" value={`${100 - progressPercent}%`} />
              <HeroStat label="Accuracy" value="94%" />
              <HeroStat label="Est. Finish" value="Apr 30" isLast />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TODAY: DAILY DISPATCH + THIS DAY ═══════════ */}
      <section className="px-4 md:px-10 pt-6 max-w-[1280px] mx-auto">
        {/* Section header */}
        <div className="flex justify-between items-end border-b border-off-white/[0.08] pb-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-6 h-px bg-ha-red" />
              <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">
                03 · Today's Report
              </span>
            </div>
            <h2 className="font-display text-[24px] font-bold text-off-white uppercase tracking-[-0.005em] leading-none">
              The <em className="text-gold-2 font-serif italic normal-case font-bold">daily dispatch</em>.
            </h2>
          </div>
          <span className="font-mono text-[9.5px] tracking-[0.2em] text-text-3 uppercase font-semibold">
            Issued at Dawn · Expires in 11h 43m
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4">
          {/* Daily Dispatch Card */}
          <div className="bg-ink-lift border border-gold-2/15 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-ha-red rounded-full shadow-[0_0_6px_var(--ha-red)]" style={{ animation: 'pulse 2s infinite' }} />
              <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">
                Today's Challenge · {shortDate}
              </span>
            </div>

            <h3 className="font-serif text-[26px] md:text-[30px] font-bold italic text-off-white leading-none mb-1 tracking-[-0.01em]">
              Fifteen questions. <em className="text-gold-2">Any era.</em>
            </h3>
            <p className="font-calligraphy text-[14px] italic text-text-2 leading-[1.45] max-w-[480px] mb-5">
              Today's dispatch draws from all fifteen eras — Egypt through Cold War. Medium difficulty. Answer twelve correctly to keep your streak alive.
            </p>

            {/* Meta strip */}
            <div className="flex bg-ink border border-gold-2/15 rounded-lg overflow-hidden mb-5">
              <MetaCell label="Questions" value="15" />
              <MetaCell label="Difficulty" value="Medium" />
              <MetaCell label="Time per Q" value="10s" />
              <MetaCell label="Reward" value="+120 XP" />
              <MetaCell label="Expires" value="11h 43m" isLast />
            </div>

            {/* CTAs */}
            <div className="flex gap-2.5">
              <button onClick={onPlayDaily} className="btn-ha-gold-outline flex items-center gap-2">
                Begin Dispatch
                <ArrowRight size={11} />
              </button>
              <button className="px-4 py-2.5 bg-ink border border-gold-2/15 rounded-full font-mono text-[10px] font-semibold tracking-[0.18em] text-off-white uppercase flex items-center gap-2 hover:text-gold-2 hover:border-gold-2/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[11px] h-[11px]">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 8v4l3 2"/>
                </svg>
                I'm Feeling Lucky
              </button>
            </div>
          </div>

          {/* This Day in History */}
          <div className="bg-ink-lift border border-gold-2/15 rounded-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-ha-red" />

            <div className="flex justify-between items-center p-5 pb-3 border-b border-dashed border-gold-2/15">
              <div>
                <div className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold mb-0.5">This Day in History</div>
                <div className="font-serif text-[20px] font-bold italic text-off-white">Three moments.</div>
              </div>
              <span className="font-mono text-[9.5px] text-gold-2 font-bold tracking-[0.15em] uppercase px-2 py-1 bg-gold-2/[0.08] border border-gold-2/30 rounded">
                {shortDate}
              </span>
            </div>

            <div className="flex-1">
              {thisDayEvents.map((event, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEvent(event)}
                  className={cn(
                    'flex gap-3.5 px-5 py-3 cursor-pointer hover:bg-ink transition-colors w-full text-left group',
                    i < thisDayEvents.length - 1 && 'border-b border-dashed border-off-white/[0.05]'
                  )}
                >
                  <div className="font-serif text-[20px] font-bold italic text-gold-2 leading-none flex-shrink-0 w-[72px] tracking-[-0.01em]">
                    {event.year}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-[13px] font-semibold text-off-white leading-tight mb-0.5 group-hover:text-gold-2 transition-colors">
                      {event.title}
                      <span className="inline-block font-mono text-[7.5px] tracking-[0.22em] text-gold-2 uppercase font-bold px-1.5 py-0.5 bg-gold-2/[0.08] border border-gold-2/15 rounded ml-1.5 align-middle">
                        {event.tag}
                      </span>
                    </div>
                    <div className="font-body text-[11.5px] text-text-3 leading-[1.4]">
                      {event.description}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-4 group-hover:text-gold-2 transition-colors flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ NEWLY DECLASSIFIED ═══════════ */}
      <section className="px-4 md:px-10 pt-8 max-w-[1280px] mx-auto">
        {/* Section header */}
        <div className="flex justify-between items-end border-b border-off-white/[0.08] pb-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-6 h-px bg-ha-red" />
              <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">
                04 · Newly Declassified
              </span>
            </div>
            <h2 className="font-display text-[24px] font-bold text-off-white uppercase tracking-[-0.005em] leading-none">
              Opening <em className="text-gold-2 font-serif italic normal-case font-bold">this week</em>.
            </h2>
          </div>
          <span className="font-mono text-[9.5px] tracking-[0.2em] text-text-3 uppercase font-semibold">
            Four new campaigns · Full archive →
          </span>
        </div>

        {/* Mobile: horizontal scroll / Desktop: 4-column grid */}
        <div className="flex md:grid md:grid-cols-4 gap-3.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {newReleases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </div>
      </section>

      {/* ═══════════ QUICK ACCESS ═══════════ */}
      <section className="px-4 md:px-10 pt-8 pb-8 max-w-[1280px] mx-auto">
        {/* Section header */}
        <div className="flex justify-between items-end border-b border-off-white/[0.08] pb-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-6 h-px bg-ha-red" />
              <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">
                05 · Five Minutes or Less
              </span>
            </div>
            <h2 className="font-display text-[24px] font-bold text-off-white uppercase tracking-[-0.005em] leading-none">
              Quick <em className="text-gold-2 font-serif italic normal-case font-bold">hits</em>.
            </h2>
          </div>
          <span className="font-mono text-[9.5px] tracking-[0.2em] text-text-3 uppercase font-semibold">
            Small moments between the big ones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <QuickCard
            type="arcade"
            label="Arcade · Today"
            title="Guess the Year"
            description="Today's portrait: Churchill at the window, September 1940. Ten guesses, ten seconds each."
            meta="5 min"
            metaHighlight="Live"
            highlightColor="red"
            icon={<Gamepad2 size={16} />}
            onClick={onPlayDaily}
          />
          <QuickCard
            type="watch"
            label="Watch · 90 seconds"
            title="The man who invented radar"
            description="Robert Watson-Watt, 1935 — the ninety seconds that changed Pearl Harbor forever."
            meta="1:28"
            metaHighlight="Related"
            highlightColor="gold"
            icon={<Play size={16} fill="currentColor" />}
          />
          <QuickCard
            type="trophy"
            label="Within Reach"
            title="Pearl Harbor Bronze"
            description="One more lesson unlocks the bronze medal for Beat V. You're closer than you think."
            meta="1 lesson away"
            metaHighlight="+50 XP"
            highlightColor="gold"
            icon={<Trophy size={16} />}
          />
        </div>
      </section>

      {/* ═══════════ THIS DAY IN HISTORY MODAL ═══════════ */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-ink border border-gold-2/30 rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            >
              {/* Gold top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

              {/* Header */}
              <div className="relative p-5 border-b border-gold-2/15">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ink-lift border border-gold-2/20 flex items-center justify-center text-text-3 hover:text-off-white hover:border-gold-2/40 transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-ha-red" />
                  <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">
                    This Day in History
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-[42px] font-bold italic text-gold-2 leading-none tracking-[-0.02em]">
                    {selectedEvent.year}
                  </span>
                  <span className="font-mono text-[8px] tracking-[0.25em] text-gold-2 uppercase font-bold px-2 py-1 bg-gold-2/[0.08] border border-gold-2/20 rounded">
                    {selectedEvent.tag}
                  </span>
                </div>

                <h3 className="font-serif text-[24px] font-bold italic text-off-white leading-tight mt-2">
                  {selectedEvent.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="font-body text-[14px] text-text-2 leading-[1.65]">
                  {selectedEvent.fullDescription}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-lift border border-gold-2/15 rounded-lg">
                    <MapPin size={12} className="text-gold-2" />
                    <span className="font-mono text-[9px] tracking-[0.15em] text-text-2 uppercase font-semibold">
                      {selectedEvent.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-lift border border-gold-2/15 rounded-lg">
                    <BookOpen size={12} className="text-gold-2" />
                    <span className="font-mono text-[9px] tracking-[0.15em] text-text-2 uppercase font-semibold">
                      {selectedEvent.significance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-3 bg-gold-2 text-void font-display text-[11px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-gold-1 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ GUIDE BACKSTORY MODAL ═══════════ */}
      <AnimatePresence>
        {showGuideModal && selectedHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGuideModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-ink border border-gold-2/30 rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            >
              {/* Gold top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />

              {/* Close button */}
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-gold-2/20 flex items-center justify-center text-text-3 hover:text-off-white hover:border-gold-2/40 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Hero image */}
              <div className="relative h-48 bg-gradient-to-b from-[#2a1810] to-ink overflow-hidden">
                {selectedHost.imageUrl ? (
                  <img
                    src={selectedHost.imageUrl}
                    alt={selectedHost.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgba(180,140,95,0.6)] to-[rgba(60,40,25,0.85)] border-2 border-gold-2 flex items-center justify-center">
                      <User size={48} className="text-gold-2/60" />
                    </div>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

                {/* Name overlay */}
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-px bg-gold-2" />
                    <span className="font-mono text-[8px] tracking-[0.35em] text-gold-2 uppercase font-bold">
                      Your Guide
                    </span>
                  </div>
                  <h3 className="font-serif text-[28px] font-bold italic text-off-white leading-none">
                    {selectedHost.name}
                  </h3>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-1">
                    {selectedHost.title}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Info chips */}
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-ink-lift border border-gold-2/15 rounded-lg">
                    <span className="font-mono text-[8px] tracking-[0.2em] text-text-3 uppercase font-semibold">Era</span>
                    <p className="font-serif text-[13px] font-bold italic text-gold-2">{selectedHost.era}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-ink-lift border border-gold-2/15 rounded-lg">
                    <span className="font-mono text-[8px] tracking-[0.2em] text-text-3 uppercase font-semibold">Specialty</span>
                    <p className="font-serif text-[13px] font-bold italic text-gold-2">{selectedHost.specialty}</p>
                  </div>
                </div>

                {/* Description/Backstory */}
                <div>
                  <h4 className="font-mono text-[9px] tracking-[0.3em] text-ha-red uppercase font-bold mb-2">
                    Backstory
                  </h4>
                  <p className="font-body text-[14px] text-text-2 leading-[1.65]">
                    {selectedHost.description || 'A seasoned guide ready to take you through the pivotal moments of history. With years of experience and firsthand knowledge, they bring the past to life in ways that textbooks never could.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-3 bg-gold-2 text-void font-display text-[11px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-gold-1 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════

function StatChip({
  label,
  value,
  suffix,
  fire,
  small,
}: {
  label: string;
  value: string;
  suffix?: string;
  fire?: boolean;
  small?: boolean;
}) {
  return (
    <div className={cn(
      'bg-ink-lift border border-gold-2/15 rounded-xl px-3.5 py-2.5 relative min-w-[96px]',
      fire && 'border-gold-2/30'
    )}>
      <div className={cn(
        'absolute top-0 left-3.5 w-[18px] h-0.5',
        fire ? 'bg-gradient-to-r from-ha-red to-gold-1' : 'bg-gold-2'
      )} />
      <div className="font-mono text-[7.5px] tracking-[0.25em] text-text-3 uppercase font-semibold mt-1 mb-0.5">
        {label}
      </div>
      <div className={cn(
        'font-serif font-bold italic leading-none tracking-[-0.01em]',
        fire ? 'text-gold-1' : 'text-gold-2',
        small ? 'text-[15px]' : 'text-[22px]'
      )}>
        {value}
        {suffix && (
          <span className={cn('text-text-3', small ? 'text-[11px] block mt-0.5' : 'text-[13px] ml-1')}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function HeroStat({ label, value, isLast }: { label: string; value: string | number; isLast?: boolean }) {
  return (
    <div className={cn(
      'flex justify-between items-center py-1.5 font-mono text-[9px] tracking-[0.15em] text-text-3 uppercase font-semibold',
      !isLast && 'border-b border-dashed border-off-white/[0.08]'
    )}>
      <span>{label}</span>
      <span className="text-gold-2 font-bold">{value}</span>
    </div>
  );
}

function MetaCell({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={cn(
      'flex-1 py-2.5 px-3 text-center',
      !isLast && 'border-r border-off-white/[0.08]'
    )}>
      <div className="font-mono text-[7.5px] tracking-[0.28em] text-text-3 uppercase font-semibold mb-1">{label}</div>
      <div className="font-serif text-[18px] font-bold italic text-gold-2 leading-none">{value}</div>
    </div>
  );
}

const releaseBgs: Record<string, string> = {
  'cold-war': 'radial-gradient(ellipse at 70% 40%, rgba(180,30,40,0.15), transparent 50%), linear-gradient(180deg, #1a1a22 0%, #050510 100%)',
  'medieval-norm': 'radial-gradient(ellipse at 40% 40%, rgba(140,140,170,0.15), transparent 50%), linear-gradient(180deg, #1a1a28 0%, #0a0a14 100%)',
  'medieval-crus': 'radial-gradient(ellipse at 60% 30%, rgba(180,120,40,0.2), transparent 50%), linear-gradient(180deg, #2a1810 0%, #0a0604 100%)',
  'plague': 'radial-gradient(ellipse at 50% 60%, rgba(80,40,60,0.25), transparent 55%), linear-gradient(180deg, #1a1220 0%, #05020a 100%)',
};

function ReleaseCard({ release }: { release: typeof newReleases[0] }) {
  const isNew = release.status === 'new';

  return (
    <div className="flex-shrink-0 w-[220px] md:w-auto bg-ink-lift border border-gold-2/15 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-gold-2/30 transition-all relative flex flex-col">
      {/* Top bar */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5 z-10',
        isNew ? 'bg-ha-red' : 'bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3'
      )} />

      {/* Media */}
      <div className="aspect-[16/10] relative overflow-hidden" style={{ background: releaseBgs[release.bgClass] }}>
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.3 0 0 0 0 0.1 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n3)'/%3E%3C/svg%3E")`,
        }} />

        {/* Stamp */}
        <div className={cn(
          'absolute top-2.5 right-2.5 px-2 py-1 font-mono text-[8px] tracking-[0.25em] uppercase font-bold rounded flex items-center gap-1 backdrop-blur-[6px]',
          isNew
            ? 'bg-ha-red/25 text-off-white border border-ha-red/50'
            : 'bg-black/70 text-gold-2 border border-gold-2/30'
        )}>
          {isNew && <span className="w-1.5 h-1.5 bg-ha-red rounded-full shadow-[0_0_5px_var(--ha-red)]" style={{ animation: 'pulse 2s infinite' }} />}
          {isNew ? 'Now Open' : 'Coming'}
        </div>

        {/* Date */}
        <div className="absolute bottom-2.5 left-2.5 font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-gold-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm border border-gold-2/30 rounded">
          {release.date}
        </div>

        {/* Roman numeral */}
        <div className="absolute bottom-2 right-3 font-serif text-[36px] font-bold italic text-gold-2/35 leading-none tracking-[-0.02em] text-shadow-lg">
          {release.romanNum}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-mono text-[8px] tracking-[0.28em] text-gold-3 uppercase font-bold mb-1">{release.era}</div>
        <div className="font-serif text-[19px] font-bold italic text-off-white leading-tight mb-1.5 tracking-[-0.005em]">{release.title}</div>
        <div className="font-body text-[11.5px] text-text-2 leading-[1.45] flex-1 mb-2.5">{release.description}</div>
        <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-off-white/[0.08] font-mono text-[8px] tracking-[0.15em] text-text-3 uppercase font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-3" />
            {release.instructor}
          </div>
          <span className="text-gold-2 font-bold">{release.lessons} lessons</span>
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  type,
  label,
  title,
  description,
  meta,
  metaHighlight,
  highlightColor,
  icon,
  onClick,
}: {
  type: 'arcade' | 'watch' | 'trophy';
  label: string;
  title: string;
  description: string;
  meta: string;
  metaHighlight: string;
  highlightColor: 'red' | 'gold';
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const isArcade = type === 'arcade';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-ink-lift border border-gold-2/15 rounded-xl p-4 relative flex flex-col gap-2 min-h-[160px] cursor-pointer hover:-translate-y-1 hover:border-gold-2/30 hover:bg-ink transition-all',
      )}
    >
      {/* Top bar */}
      {type === 'arcade' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ha-red to-gold-2" />}
      {type === 'watch' && <div className="absolute top-0 left-5 w-5 h-0.5 bg-ha-red" />}
      {type === 'trophy' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-2" />}

      <div className="flex justify-between items-start gap-2.5">
        <div className={cn(
          'w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 mt-1.5',
          isArcade
            ? 'bg-ha-red/[0.08] border-ha-red/30 text-ha-red'
            : 'bg-gold-2/[0.08] border-gold-2/30 text-gold-2'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className={cn(
            'font-mono text-[8.5px] tracking-[0.3em] uppercase font-bold mb-1',
            isArcade ? 'text-ha-red' : 'text-gold-2'
          )}>
            {label}
          </div>
          <div className="font-serif text-[19px] font-bold italic text-off-white leading-tight mb-1">{title}</div>
          <div className="font-body text-[11.5px] text-text-2 leading-[1.45]">{description}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-off-white/[0.08] mt-auto font-mono text-[8.5px] tracking-[0.18em] text-text-3 uppercase font-bold">
        <span>
          {meta} · <span className={highlightColor === 'red' ? 'text-ha-red' : 'text-gold-2'}>{metaHighlight}</span>
        </span>
        <div className="w-5 h-5 rounded-full bg-ink border border-gold-2/30 flex items-center justify-center text-gold-2">
          <ArrowRight size={10} />
        </div>
      </div>
    </div>
  );
}
