import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, GraduationCap, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRank, getNextRankXP } from '@/types';
import { TopicChips } from '@/components/home/TopicChips';
import { OrnamentalDivider } from '@/components/shared/OrnamentalDivider';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { DiceButton } from '@/components/shared/DiceButton';
import { LuckyResultModal } from '@/components/shared/LuckyResultModal';
import { ThisDayCard } from '@/components/home/ThisDayCard';
import { GuideSection } from '@/components/home/GuideSection';
import { GuideChatModal } from '@/components/home/GuideChatModal';
import { JourneyCard } from '@/components/home/JourneyCard';
import { JourneyResumeBanner } from '@/components/home/JourneyResumeBanner';
import { RandomResult } from '@/lib/randomizer';
import { Progress } from '@/components/ui/progress';


interface HomeTabProps {
  onStartSession: () => void;
  onPlayDaily: () => void;
  onSelectTopic: (topicId: string) => void;
}

export function HomeTab({ onStartSession, onPlayDaily, onSelectTopic }: HomeTabProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { user, setActiveTab, setPendingLuckyNode, setPendingPearlHarbor, selectedGuideId } = useApp();

  // Handler to enter Pearl Harbor journey
  const handleEnterJourney = () => {
    setPendingPearlHarbor(true);
    setActiveTab('journey');
  };

  // Lucky dice state
  const [luckyResult, setLuckyResult] = useState<RandomResult | null>(null);
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);

  // Guide chat modal
  const [showChatModal, setShowChatModal] = useState(false);

  const handleLuckyResult = (result: RandomResult) => {
    setLuckyResult(result);
    setShowLuckyModal(true);
  };

  const handleReroll = () => {
    setIsRerolling(true);
    setShowLuckyModal(false);
    setTimeout(() => setIsRerolling(false), 100);
  };

  const handleStartLuckyChallenge = () => {
    if (luckyResult) {
      // Find chapter index
      const chapterIndex = luckyResult.arc.chapters.findIndex(c => c.id === luckyResult.chapter.id);

      // Set pending node for JourneyTab to pick up
      setPendingLuckyNode({
        arcId: luckyResult.arc.id,
        chapterId: luckyResult.chapter.id,
        nodeId: luckyResult.node.id,
        chapterIndex: chapterIndex >= 0 ? chapterIndex : 0,
      });

      setShowLuckyModal(false);
      setActiveTab('journey');
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    onSelectTopic(topicId);
  };

  return (
    <div className="px-4 py-6 space-y-5 pb-24">
      {/* Journey Resume Banner - Only shows when in progress */}
      <JourneyResumeBanner onResume={handleEnterJourney} />

      {/* Guide Section - At the Top */}
      {selectedGuideId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GuideSection
            onOpenChat={() => setShowChatModal(true)}
            onStartLesson={onStartSession}
            onContinueJourney={() => setActiveTab('journey')}
            onDailyChallenge={onPlayDaily}
          />
        </motion.div>
      )}

      {/* Hero Carousel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: selectedGuideId ? 0.1 : 0 }}
      >
        <HeroCarousel
          onContinueJourney={() => setActiveTab('explore')}
          onPlayDaily={onPlayDaily}
        />
      </motion.div>

      <OrnamentalDivider variant="compass" />

      {/* Prestigious Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-3 gap-2.5"
      >
        <div className="archival-card relative text-center py-4 px-2">
          <Trophy size={18} className="text-primary mx-auto mb-2" />
          <p className="text-base font-bold leading-none">
            143<sup className="text-xs text-muted-foreground ml-0.5">rd</sup>
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] mt-1.5">Globally</p>
        </div>
        <div className="archival-card relative text-center py-4 px-2 col-span-1">
          <GraduationCap size={18} className="text-secondary mx-auto mb-2" />
          <p className="text-sm font-bold leading-none">{getRank(user.xp)}</p>
          {(() => {
            const { next, threshold, current } = getNextRankXP(user.xp);
            const pct = next ? Math.round(((user.xp - current) / (threshold - current)) * 100) : 100;
            return (
              <div className="mt-1.5">
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-none">
                  {next ? `→ ${next}` : 'Max Rank'}
                </p>
              </div>
            );
          })()}
        </div>
        <div className="archival-card relative text-center py-4 px-2">
          <Sparkles size={18} className="text-secondary mx-auto mb-2" />
          <p className="text-base font-bold leading-none">{user.xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] mt-1.5">Experience</p>
        </div>
      </motion.div>

      {/* Featured Journey */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="space-y-2.5"
      >
        <h2 className="section-plaque">Featured Journey</h2>
        <JourneyCard onEnterJourney={handleEnterJourney} />
      </motion.div>

      <OrnamentalDivider variant="laurel" />

      {/* Daily Challenge & Lucky Dice Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-2.5"
      >
        <h2 className="section-plaque">Daily Challenge</h2>
        <button
          onClick={onPlayDaily}
          className="w-full archival-card relative card-hover flex items-center gap-4 text-left active:scale-[0.99] transition-transform touch-target"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Calendar size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Today's Challenge</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-primary/70 italic">Issued at Dawn</span> · 15 AI-generated questions · Medium
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground" />
        </button>

        {/* I'm Feeling Lucky Card */}
        <DiceButton
          variant="card"
          size="md"
          onResult={handleLuckyResult}
        />
      </motion.div>

      {/* Lucky Result Modal */}
      <LuckyResultModal
        isOpen={showLuckyModal}
        result={luckyResult}
        onStartChallenge={handleStartLuckyChallenge}
        onReroll={handleReroll}
        onClose={() => setShowLuckyModal(false)}
        isRerolling={isRerolling}
      />

      <OrnamentalDivider variant="simple" />

      {/* This Day in History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-2.5"
      >
        <h2 className="section-plaque">This Day in History</h2>
        <ThisDayCard />
      </motion.div>

      <OrnamentalDivider variant="compass" />

      {/* Topics */}
      <TopicChips selectedTopic={selectedTopic} onSelect={handleTopicSelect} />

      {/* Guide Chat Modal */}
      <GuideChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </div>
  );
}
