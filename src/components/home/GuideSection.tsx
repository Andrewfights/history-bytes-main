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

  if (!guide) {
    return null;
  }

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; gradient: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20', gradient: 'from-blue-500/20 to-blue-900/40' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300', glow: 'shadow-slate-400/20', gradient: 'from-slate-500/20 to-slate-900/40' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20', gradient: 'from-amber-500/20 to-amber-900/40' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20', gradient: 'from-purple-500/20 to-purple-900/40' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20', gradient: 'from-emerald-500/20 to-emerald-900/40' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20', gradient: 'from-red-500/20 to-red-900/40' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', glow: 'shadow-rose-500/20', gradient: 'from-rose-500/20 to-rose-900/40' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20', gradient: 'from-cyan-500/20 to-cyan-900/40' },
  };

  const colors = colorMap[guide.primaryColor] || colorMap.amber;
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
      className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-4 shadow-lg ${colors.glow}`}
    >
      {/* Background sparkles */}
      <div className="absolute top-2 right-4 pointer-events-none">
        <Sparkles className={`${colors.text} opacity-30`} size={16} />
      </div>

      <div className="flex items-start gap-4">
        {/* Guide Avatar/Video */}
        <div className={`relative w-20 h-20 rounded-full overflow-hidden ${colors.bg} border-2 ${colors.border} flex-shrink-0`}>
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
              <span className="text-3xl">{guide.avatar}</span>
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{guide.name}</h3>
            <span className="text-lg">{guide.avatar}</span>
          </div>
          <p className={`text-xs ${colors.text} mb-2`}>{guide.title}</p>

          {/* Animated Quote */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground italic line-clamp-2"
            >
              "{currentQuote}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {/* Chat Button - Primary */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenChat}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
        >
          <MessageCircle size={16} />
          Talk to {guide.name.split(' ')[0]}
        </motion.button>

        {/* Quick Actions Dropdown */}
        {quickActions.length > 0 && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`flex items-center justify-center gap-1 px-4 py-3 rounded-xl border ${colors.border} ${colors.bg} font-medium text-sm`}
            >
              Quick Actions
              <ChevronRight
                size={14}
                className={`transition-transform ${showQuickActions ? 'rotate-90' : ''}`}
              />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                >
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        action.action?.();
                        setShowQuickActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-left"
                    >
                      <action.icon size={16} className={colors.text} />
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
