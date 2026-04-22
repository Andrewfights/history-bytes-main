import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { OrnamentalDivider } from '@/components/shared/OrnamentalDivider';
import { DiceButton } from '@/components/shared/DiceButton';
import { LuckyResultModal } from '@/components/shared/LuckyResultModal';
import { ThisDayCard } from '@/components/home/ThisDayCard';
import { GuideSection } from '@/components/home/GuideSection';
import { GuideChatModal } from '@/components/home/GuideChatModal';
import { JourneyResumeBanner } from '@/components/home/JourneyResumeBanner';
import { FeaturedEraHero } from '@/components/home/FeaturedEraHero';
import { EraCarousel } from '@/components/home/EraCarousel';
import { RandomResult } from '@/lib/randomizer';
import { getEraById, getComingSoonEras, HistoricalEra } from '@/data/historicalEras';
import { usePearlHarborProgress } from '@/components/journey/pearl-harbor/hooks/usePearlHarborProgress';
import { PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';
import { subscribeToJourneyUIAssets, FirestoreJourneyUIAssets } from '@/lib/firestore';


interface HomeTabProps {
  onStartSession: () => void;
  onPlayDaily: () => void;
  onSelectTopic: (topicId: string) => void;
}

export function HomeTab({ onStartSession, onPlayDaily, onSelectTopic }: HomeTabProps) {
  const { setActiveTab, setPendingLuckyNode, setPendingPearlHarbor, selectedGuideId } = useApp();

  // Get WW2 era data
  const ww2Era = getEraById('ww2');
  const comingSoonEras = getComingSoonEras();

  // Get Pearl Harbor progress for featured hero
  const { progress, totalXP } = usePearlHarborProgress();
  const completedLessons = progress.completedActivities.filter(
    id => id.startsWith('ph-beat-')
  ).length;
  const totalLessons = PEARL_HARBOR_LESSONS.length;

  // Subscribe to Firebase Journey UI Assets (for Pearl Harbor artwork)
  const [journeyUIAssets, setJourneyUIAssets] = useState<FirestoreJourneyUIAssets | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToJourneyUIAssets((assets) => {
      setJourneyUIAssets(assets);
    });
    return () => unsubscribe();
  }, []);

  // Handler to enter Pearl Harbor journey
  const handleEnterJourney = () => {
    setPendingPearlHarbor(true);
    setActiveTab('journey');
  };

  // Coming Soon modal state
  const [showComingSoon, setShowComingSoon] = useState<HistoricalEra | null>(null);

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
      const chapterIndex = luckyResult.arc.chapters.findIndex(c => c.id === luckyResult.chapter.id);
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

  const handleSelectEra = (eraId: string) => {
    if (eraId === 'ww2') {
      handleEnterJourney();
    } else {
      const era = getEraById(eraId);
      if (era) {
        setShowComingSoon(era);
      }
    }
  };

  return (
    <div className="px-4 py-6 space-y-5 pb-24">
      {/* Journey Resume Banner - Only shows when in progress */}
      <JourneyResumeBanner onResume={handleEnterJourney} />

      {/* FEATURED: WW2/Pearl Harbor Hero - Large key art */}
      {ww2Era && (
        <FeaturedEraHero
          era={ww2Era}
          progress={{
            completed: completedLessons,
            total: totalLessons,
            xp: totalXP,
          }}
          onStart={handleEnterJourney}
        />
      )}

      {/* Guide Section */}
      {selectedGuideId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GuideSection
            onOpenChat={() => setShowChatModal(true)}
            onStartLesson={onStartSession}
            onContinueJourney={() => setActiveTab('journey')}
            onDailyChallenge={onPlayDaily}
          />
        </motion.div>
      )}

      <OrnamentalDivider variant="compass" />

      {/* Coming Soon Eras Carousel */}
      <EraCarousel
        title="More Campaigns"
        subtitle="Coming soon to History Academy"
        eras={comingSoonEras}
        onSelectEra={handleSelectEra}
      />

      <OrnamentalDivider variant="simple" />

      {/* Daily Challenge & Lucky Dice Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-3"
      >
        {/* Section header with red underline */}
        <div>
          <h2 className="font-serif text-xl text-off-white">Daily Challenge</h2>
          <div className="w-12 h-0.5 bg-ha-red mt-1.5" />
        </div>

        <button
          onClick={onPlayDaily}
          className="w-full relative flex items-center gap-4 text-left p-4 rounded-xl bg-ink-lift border border-off-white/[0.06] hover:border-gold-2/20 active:scale-[0.99] transition-all touch-target"
        >
          {/* Left gold accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2 rounded-l-xl" />

          <div className="w-12 h-12 rounded-lg bg-gold-2/10 flex items-center justify-center border border-gold-2/20">
            <Calendar size={22} className="text-gold-2" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-sm text-off-white">Today's Challenge</h3>
            <p className="font-mono text-[10px] tracking-wide text-off-white/50 mt-0.5 uppercase">
              <span className="text-gold-2/70 normal-case italic">Issued at Dawn</span> · 15 Questions · Medium
            </p>
          </div>
          <ArrowRight size={16} className="text-off-white/40" />
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
        className="space-y-3"
      >
        {/* Section header with red underline */}
        <div>
          <h2 className="font-serif text-xl text-off-white">This Day in History</h2>
          <div className="w-12 h-0.5 bg-ha-red mt-1.5" />
        </div>
        <ThisDayCard />
      </motion.div>

      {/* Guide Chat Modal */}
      <GuideChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <ComingSoonModal
            era={showComingSoon}
            onClose={() => setShowComingSoon(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Coming Soon Modal Component
function ComingSoonModal({
  era,
  onClose,
}: {
  era: HistoricalEra;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-[calc(100%-2rem)] sm:w-full sm:max-w-sm mx-auto bg-ink-lift rounded-2xl overflow-hidden border border-off-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Era Image/Gradient Background */}
        <div
          className="relative h-32 sm:h-40"
          style={{
            background: `linear-gradient(135deg, ${era.accentColor}60 0%, ${era.accentColor}20 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-ink-lift via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-void/50 flex items-center justify-center text-off-white/70 hover:text-off-white transition-colors"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 text-center">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-off-white mb-1">{era.name}</h3>
          <p className="font-mono text-off-white/50 text-[10px] sm:text-xs uppercase tracking-wider mb-3 sm:mb-4">{era.dateRange}</p>

          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gold-2/15 rounded-lg mb-3 sm:mb-4 border border-gold-2/20">
            <span className="font-mono text-gold-2 text-xs sm:text-sm font-medium uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          <p className="text-off-white/60 text-xs sm:text-sm mb-3 sm:mb-4">{era.subtitle}</p>

          <button
            onClick={onClose}
            className="mt-4 sm:mt-5 w-full py-2.5 sm:py-3 bg-off-white/10 hover:bg-off-white/15 rounded-xl text-off-white text-sm sm:text-base font-medium transition-colors border border-off-white/[0.06]"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
