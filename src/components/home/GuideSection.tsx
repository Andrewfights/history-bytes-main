import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Play, Volume2, VolumeX, Sparkles, ChevronRight, BookOpen, Compass, Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLiveGuide } from '@/hooks/useLiveData';

interface GuideSectionProps {
  onOpenChat: () => void;
  onStartLesson?: () => void;
  onContinueJourney?: () => void;
  onDailyChallenge?: () => void;
}

export function GuideSection({
  onOpenChat,
  onStartLesson,
  onContinueJourney,
  onDailyChallenge,
}: GuideSectionProps) {
  const { selectedGuideId } = useApp();
  const guide = useLiveGuide(selectedGuideId || '');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rotate catchphrases periodically
  useEffect(() => {
    if (!guide?.catchphrases?.length) return;
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % guide.catchphrases.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [guide?.catchphrases?.length]);

  if (!guide || !guide.name) {
    return null;
  }

  // History Academy colors: gold, red, off-white
  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; gradient: string }> = {
    gold: { bg: 'bg-gold-2/10', border: 'border-gold-2/30', text: 'text-gold-2', glow: 'shadow-gold-2/20', gradient: 'from-gold-2/15 to-ink-lift' },
    amber: { bg: 'bg-gold-2/10', border: 'border-gold-2/30', text: 'text-gold-2', glow: 'shadow-gold-2/20', gradient: 'from-gold-2/15 to-ink-lift' },
    red: { bg: 'bg-ha-red/10', border: 'border-ha-red/30', text: 'text-ha-red', glow: 'shadow-ha-red/20', gradient: 'from-ha-red/15 to-ink-lift' },
    slate: { bg: 'bg-off-white/5', border: 'border-off-white/20', text: 'text-off-white/70', glow: 'shadow-off-white/10', gradient: 'from-off-white/10 to-ink-lift' },
    emerald: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', glow: 'shadow-success/20', gradient: 'from-success/15 to-ink-lift' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20', gradient: 'from-purple-500/15 to-ink-lift' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', glow: 'shadow-rose-500/20', gradient: 'from-rose-500/15 to-ink-lift' },
  };

  const colors = colorMap[guide.primaryColor] || colorMap.gold;
  const hasVideo = !!guide.introVideoUrl;
  const currentQuote = guide.catchphrases?.[currentQuoteIndex] || guide.introQuote;

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const quickActions = [
    { label: 'Start a Lesson', icon: BookOpen, action: onStartLesson },
    { label: 'Continue Journey', icon: Compass, action: onContinueJourney },
    { label: 'Daily Challenge', icon: Trophy, action: onDailyChallenge },
  ].filter(a => a.action);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border ${colors.border} bg-ink-lift p-3 sm:p-4`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${guide.primaryColor === 'red' ? 'bg-ha-red' : 'bg-gold-2'} rounded-l-xl`} />

      {/* Background sparkles */}
      <div className="absolute top-2 right-4 pointer-events-none">
        <Sparkles className={`${colors.text} opacity-30`} size={16} />
      </div>

      <div className="flex items-start gap-3 sm:gap-4">
        {/* Guide Avatar/Video */}
        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ${colors.bg} border-2 ${colors.border} flex-shrink-0`}>
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                src={guide.introVideoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                loop
                onEnded={() => setIsPlaying(false)}
              />
              {isPlaying && (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-0.5 right-0.5 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                >
                  {isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
                </button>
              )}
              {!isPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={14} className="text-primary ml-0.5" fill="currentColor" />
                  </div>
                </button>
              )}
            </>
          ) : guide.imageUrl ? (
            <img src={guide.imageUrl} alt={guide.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">{guide.avatar}</span>
            </div>
          )}

          {/* Breathing animation ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${colors.border}`}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Guide Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <h3 className="font-display font-semibold text-sm sm:text-base text-off-white uppercase tracking-wide truncate">{guide.name}</h3>
            <span className="text-base sm:text-lg">{guide.avatar}</span>
          </div>
          <p className={`font-serif italic text-[10px] sm:text-xs ${colors.text} mb-1.5 sm:mb-2`}>{guide.title}</p>

          {/* Animated Quote */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="font-serif text-xs sm:text-sm text-off-white/60 italic line-clamp-2"
            >
              "{currentQuote}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
        {/* Chat Button - Primary */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenChat}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-ha-red text-off-white font-mono text-xs sm:text-sm uppercase tracking-wide"
        >
          <MessageCircle size={14} className="sm:w-4 sm:h-4" />
          Talk to {guide.name.split(' ')[0]}
        </motion.button>

        {/* Quick Actions Dropdown */}
        {quickActions.length > 0 && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`w-full sm:w-auto flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border ${colors.border} ${colors.bg} font-mono text-xs sm:text-sm text-off-white/80`}
            >
              Quick Actions
              <ChevronRight
                size={12}
                className={`transition-transform sm:w-3.5 sm:h-3.5 ${showQuickActions ? 'rotate-90' : ''}`}
              />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 sm:w-48 bg-ink-lift border border-off-white/[0.06] rounded-xl shadow-lg overflow-hidden z-20"
                >
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        action.action?.();
                        setShowQuickActions(false);
                      }}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-off-white/[0.04] transition-colors text-xs sm:text-sm text-left text-off-white/80"
                    >
                      <action.icon size={14} className={`${colors.text} sm:w-4 sm:h-4`} />
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showQuickActions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </motion.div>
  );
}

export default GuideSection;
