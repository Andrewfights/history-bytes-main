/**
 * PearlHarborModule - Main router for Pearl Harbor interactive content
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Flame, Lock, Check, ChevronRight } from 'lucide-react';
import {
  PEARL_HARBOR_SECTIONS,
  PEARL_HARBOR_ACTIVITIES,
  getActivitiesBySection,
  getSectionById,
} from '@/data/pearlHarborData';
import { usePearlHarborProgress } from './hooks/usePearlHarborProgress';
import { PearlHarborSection, PearlHarborActivity, WW2Host } from '@/types';
import { MasteryBuckets } from './progression/MasteryBuckets';
import { StreakTracker } from './progression/StreakTracker';

// Import all game components
// Attack Timeline
import { RadarBlipGame } from './attack-timeline/RadarBlipGame';
import { PlaneWaveTracer } from './attack-timeline/PlaneWaveTracer';
import { WaveDefenseGame } from './attack-timeline/WaveDefenseGame';
import { SpeechReactionGame } from './attack-timeline/SpeechReactionGame';

// Devastation
import { BeforeAfterSlider } from './devastation/BeforeAfterSlider';
import { WreckMatchQuiz } from './devastation/WreckMatchQuiz';
import { VoicedLetterPlayer } from './devastation/VoicedLetterPlayer';

// Survival
import { PanoramaTour } from './survival/PanoramaTour';
import { EscapeTheBlaze } from './survival/EscapeTheBlaze';
import { WhatIfSim } from './survival/WhatIfSim';
import { FirstPersonPOV } from './survival/FirstPersonPOV';

// Strategic
import { CarrierHuntMap } from './strategic/CarrierHuntMap';
import { SubPuzzle } from './strategic/SubPuzzle';

// Legacy Games
import { TorpedoDodge } from './legacy-games/TorpedoDodge';
import { SpeechBlanks } from './legacy-games/SpeechBlanks';

type PearlHarborView = 'overview' | 'section' | 'activity';

interface PearlHarborModuleProps {
  host: WW2Host;
  onBack: () => void;
}

export function PearlHarborModule({ host, onBack }: PearlHarborModuleProps) {
  const [view, setView] = useState<PearlHarborView>('overview');
  const [selectedSection, setSelectedSection] = useState<PearlHarborSection | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<PearlHarborActivity | null>(null);

  const {
    isLoading,
    isActivityCompleted,
    completeActivity,
    getOverallProgress,
    getStreakBonus,
    masteryBuckets,
    currentStreak,
    totalXP,
    hasBattleshipRowBadge,
  } = usePearlHarborProgress();

  const handleSelectSection = (sectionId: PearlHarborSection) => {
    setSelectedSection(sectionId);
    setView('section');
  };

  const handleSelectActivity = (activity: PearlHarborActivity) => {
    setSelectedActivity(activity);
    setView('activity');
  };

  const handleBackToOverview = () => {
    setView('overview');
    setSelectedSection(null);
  };

  const handleBackToSection = () => {
    setView('section');
    setSelectedActivity(null);
  };

  const handleActivityComplete = (activityId: string) => {
    completeActivity(activityId);
    // Optionally show celebration then go back
    setTimeout(() => {
      handleBackToSection();
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-y-auto">
      <AnimatePresence mode="wait">
        {view === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OverviewView
              host={host}
              overallProgress={getOverallProgress()}
              streakBonus={getStreakBonus()}
              masteryBuckets={masteryBuckets}
              currentStreak={currentStreak}
              totalXP={totalXP}
              hasBattleshipRowBadge={hasBattleshipRowBadge}
              isActivityCompleted={isActivityCompleted}
              onSelectSection={handleSelectSection}
              onBack={onBack}
            />
          </motion.div>
        )}

        {view === 'section' && selectedSection && (
          <motion.div
            key="section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SectionView
              section={getSectionById(selectedSection)!}
              activities={getActivitiesBySection(selectedSection)}
              isActivityCompleted={isActivityCompleted}
              onSelectActivity={handleSelectActivity}
              onBack={handleBackToOverview}
            />
          </motion.div>
        )}

        {view === 'activity' && selectedActivity && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-screen"
          >
            <ActivityView
              activity={selectedActivity}
              onComplete={() => handleActivityComplete(selectedActivity.id)}
              onBack={handleBackToSection}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Overview View
interface OverviewViewProps {
  host: WW2Host;
  overallProgress: number;
  streakBonus: number;
  masteryBuckets: any;
  currentStreak: number;
  totalXP: number;
  hasBattleshipRowBadge: boolean;
  isActivityCompleted: (id: string) => boolean;
  onSelectSection: (sectionId: PearlHarborSection) => void;
  onBack: () => void;
}

function OverviewView({
  host,
  overallProgress,
  streakBonus,
  masteryBuckets,
  currentStreak,
  totalXP,
  hasBattleshipRowBadge,
  isActivityCompleted,
  onSelectSection,
  onBack,
}: OverviewViewProps) {
  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-editorial text-xl font-bold text-white">Pearl Harbor</h1>
            <p className="text-sm text-white/60">December 7, 1941 - Day of Infamy</p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-white text-lg">Battleship Row Mastery</h2>
              <p className="text-white/60 text-sm">{totalXP.toLocaleString()} XP earned</p>
            </div>
            {hasBattleshipRowBadge ? (
              <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Trophy size={24} className="text-amber-400" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Trophy size={24} className="text-white/30" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <p className="text-white/50 text-sm mt-2 text-center">
            {overallProgress}% complete
          </p>
        </motion.div>

        {/* Streak Tracker */}
        <StreakTracker
          currentStreak={currentStreak}
          streakBonus={streakBonus}
        />

        {/* Mastery Buckets */}
        <MasteryBuckets buckets={masteryBuckets} />

        {/* Section Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-white/50 tracking-wider">
            Explore Sections
          </h2>
          {PEARL_HARBOR_SECTIONS.map((section, index) => {
            const activities = getActivitiesBySection(section.id);
            const completedCount = activities.filter(a => isActivityCompleted(a.id)).length;

            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                onClick={() => onSelectSection(section.id)}
                className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{section.title}</h3>
                    <p className="text-white/50 text-sm">{section.description}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {completedCount}/{activities.length} completed
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-white/40" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Section View
interface SectionViewProps {
  section: { id: PearlHarborSection; title: string; description: string; icon: string };
  activities: PearlHarborActivity[];
  isActivityCompleted: (id: string) => boolean;
  onSelectActivity: (activity: PearlHarborActivity) => void;
  onBack: () => void;
}

function SectionView({
  section,
  activities,
  isActivityCompleted,
  onSelectActivity,
  onBack,
}: SectionViewProps) {
  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
              {section.icon}
            </div>
            <div>
              <h1 className="font-editorial text-lg font-bold text-white">{section.title}</h1>
              <p className="text-sm text-white/60">{section.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-3">
        {activities.map((activity, index) => {
          const isCompleted = isActivityCompleted(activity.id);

          return (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectActivity(activity)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isCompleted ? 'bg-green-500/20' : 'bg-white/10'
                }`}>
                  {isCompleted ? (
                    <Check size={20} className="text-green-400" />
                  ) : (
                    <span className="text-white/60 text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{activity.title}</h3>
                  <p className="text-white/50 text-sm">{activity.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold text-sm">+{activity.xpReward} XP</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Activity View - Routes to specific game component
interface ActivityViewProps {
  activity: PearlHarborActivity;
  onComplete: () => void;
  onBack: () => void;
}

function ActivityView({ activity, onComplete, onBack }: ActivityViewProps) {
  // Route to appropriate game component based on activity type
  switch (activity.type) {
    // Attack Timeline games
    case 'radar-blip':
      return <RadarBlipGame onComplete={onComplete} onBack={onBack} />;
    case 'plane-tracer':
      return <PlaneWaveTracer onComplete={onComplete} onBack={onBack} />;
    case 'wave-defense':
      return <WaveDefenseGame onComplete={onComplete} onBack={onBack} />;
    case 'speech-reaction':
      return <SpeechReactionGame onComplete={onComplete} onBack={onBack} />;

    // Devastation games
    case 'before-after':
      return <BeforeAfterSlider onComplete={onComplete} onBack={onBack} />;
    case 'wreck-match':
      return <WreckMatchQuiz onComplete={onComplete} onBack={onBack} />;
    case 'voiced-letter':
      return <VoicedLetterPlayer onComplete={onComplete} onBack={onBack} />;

    // Survival games
    case 'panorama-tour':
      return <PanoramaTour onComplete={onComplete} onBack={onBack} />;
    case 'escape-choice':
      return <EscapeTheBlaze onComplete={onComplete} onBack={onBack} />;
    case 'what-if':
      return <WhatIfSim onComplete={onComplete} onBack={onBack} />;
    case 'first-person':
      return <FirstPersonPOV onComplete={onComplete} onBack={onBack} />;

    // Strategic games
    case 'carrier-hunt':
      return <CarrierHuntMap onComplete={onComplete} onBack={onBack} />;
    case 'sub-puzzle':
      return <SubPuzzle onComplete={onComplete} onBack={onBack} />;

    // Legacy games
    case 'torpedo-dodge':
      return <TorpedoDodge onComplete={onComplete} onBack={onBack} />;
    case 'speech-blanks':
      return <SpeechBlanks onComplete={onComplete} onBack={onBack} />;

    default:
      // Fallback for any unrecognized types
      return (
        <div className="h-screen flex flex-col bg-slate-950">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-editorial text-lg font-bold text-white">{activity.title}</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-white/60 mb-6">
              This interactive experience is being developed.
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
            >
              Mark as Complete (Demo)
            </button>
          </div>
        </div>
      );
  }
}
