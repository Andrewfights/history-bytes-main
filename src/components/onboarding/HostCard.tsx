import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, ChevronLeft, ChevronRight, Square, Loader2 } from 'lucide-react';
import type { SpiritGuide } from '@/types';
import { generateSpeech, getVoiceConfigById, isApiKeySet } from '@/lib/elevenlabs';

interface HostCardProps {
  guide: SpiritGuide;
  isActive: boolean;
  onSelect: () => void;
}

export function HostCard({ guide, isActive, onSelect }: HostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Voice preview state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Get sample quotes - intro story first, then catchphrases
  const voiceQuotes = [
    guide.introStory,           // Full intro story (20-30 seconds)
    ...(guide.catchphrases || []),
  ].filter(Boolean) as string[];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
    };
  }, []);

  // Stop voice when switching guides
  useEffect(() => {
    if (!isActive && isPlayingVoice) {
      stopVoice();
    }
  }, [isActive]);

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  };

  const colors = colorMap[guide.primaryColor] || colorMap.amber;
  const hasIntroVideo = !!guide.introVideoUrl;

  const handlePlayVideo = () => {
    if (!hasIntroVideo || !videoRef.current) return;
    setIsPlayingVideo(true);
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(console.error);
  };

  const handleVideoEnded = () => {
    setIsPlayingVideo(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlayingVideo(false);
  };

  // Voice preview functions
  const playVoice = async () => {
    if (isPlayingVoice) {
      stopVoice();
      return;
    }

    const currentQuote = voiceQuotes[currentQuoteIndex];
    if (!currentQuote) return;

    setIsLoadingVoice(true);

    // Try ElevenLabs first if configured
    const voiceConfig = getVoiceConfigById(guide.id);
    console.log('[Voice] Guide:', guide.id, 'Voice config:', voiceConfig);
    console.log('[Voice] API key set:', isApiKeySet());

    if (isApiKeySet() && voiceConfig?.elevenLabsVoiceId) {
      try {
        console.log('[Voice] Generating speech with ElevenLabs voice:', voiceConfig.elevenLabsVoiceId);
        const audioUrl = await generateSpeech({
          voiceId: voiceConfig.elevenLabsVoiceId,
          text: currentQuote,
          stability: voiceConfig.stability,
          similarityBoost: voiceConfig.similarityBoost,
        });

        if (audioUrl) {
          console.log('[Voice] Audio URL generated, playing...');
          voiceAudioRef.current = new Audio(audioUrl);
          voiceAudioRef.current.onended = () => setIsPlayingVoice(false);
          voiceAudioRef.current.onerror = (e) => {
            console.error('[Voice] Audio playback error:', e);
            setIsPlayingVoice(false);
            fallbackToSpeechSynthesis(currentQuote);
          };
          await voiceAudioRef.current.play();
          setIsPlayingVoice(true);
          setIsLoadingVoice(false);
          return;
        } else {
          console.warn('[Voice] No audio URL returned from ElevenLabs');
        }
      } catch (err) {
        console.error('[Voice] ElevenLabs error:', err);
      }
    } else {
      console.log('[Voice] ElevenLabs not available, using fallback. API set:', isApiKeySet(), 'Voice ID:', voiceConfig?.elevenLabsVoiceId);
    }

    // Fallback to browser speech synthesis
    setIsLoadingVoice(false);
    fallbackToSpeechSynthesis(currentQuote);
  };

  const fallbackToSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Try to find a suitable voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
    }
  };

  const stopVoice = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoice(false);
  };

  const nextQuote = () => {
    stopVoice();
    setCurrentQuoteIndex((prev) => (prev + 1) % voiceQuotes.length);
  };

  const prevQuote = () => {
    stopVoice();
    setCurrentQuoteIndex((prev) => (prev - 1 + voiceQuotes.length) % voiceQuotes.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[320px] sm:max-w-sm mx-auto px-2 sm:px-4"
    >
      <div
        className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} p-4 sm:p-6 transition-all duration-300 ${
          isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
        }`}
      >
        {/* Avatar / Portrait / Video */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <motion.div
            animate={isActive && !isPlayingVideo ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ${colors.bg} border-2 ${colors.border}`}
          >
            {/* Video Layer */}
            <AnimatePresence>
              {isPlayingVideo && hasIntroVideo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20"
                >
                  <video
                    ref={videoRef}
                    src={guide.introVideoUrl}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    playsInline
                    onEnded={handleVideoEnded}
                    onClick={stopVideo}
                  />
                  {/* Mute/Unmute button */}
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-1 right-1 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-30"
                  >
                    {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image/Avatar Layer */}
            {guide.imageUrl && !imageError ? (
              <>
                {/* Portrait Image */}
                <img
                  src={guide.imageUrl}
                  alt={guide.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {/* Fallback emoji while loading */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    {guide.avatar}
                  </div>
                )}
                {/* Small emoji badge */}
                {imageLoaded && !isPlayingVideo && (
                  <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg ${colors.bg} border-2 ${colors.border} bg-background z-10`}>
                    {guide.avatar}
                  </div>
                )}
              </>
            ) : (
              /* Fallback to emoji only */
              <div className="w-full h-full flex items-center justify-center text-5xl">
                {guide.avatar}
              </div>
            )}

            {/* Play button overlay for video */}
            {hasIntroVideo && !isPlayingVideo && imageLoaded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0.7 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayVideo();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10"
              >
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play size={20} className="text-primary ml-0.5" fill="currentColor" />
                </div>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Name & Title */}
        <div className="text-center mb-3 sm:mb-4">
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-foreground">
            {guide.name}
          </h3>
          <p className={`text-xs sm:text-sm ${colors.text} font-medium`}>{guide.title}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{guide.era}</p>
        </div>

        {/* Specialty Badge */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {guide.specialty}
          </span>
        </div>

        {/* Voice Preview Section */}
        {voiceQuotes.length > 0 && (
          <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
            {/* Label */}
            <div className="text-center mb-2">
              <span className={`text-xs font-medium ${colors.text}`}>
                {currentQuoteIndex === 0 && guide.introStory ? '📖 My Story' : `💬 Quote ${currentQuoteIndex}`}
              </span>
            </div>

            {/* Quote Text */}
            <div className={`flex items-center justify-center mb-3 ${currentQuoteIndex === 0 && guide.introStory ? 'max-h-[100px] overflow-y-auto' : 'min-h-[60px]'}`}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`text-center italic px-2 ${currentQuoteIndex === 0 && guide.introStory ? 'text-xs text-foreground/90' : 'text-sm text-foreground'}`}
                >
                  "{voiceQuotes[currentQuoteIndex]}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Previous Quote Arrow */}
              {voiceQuotes.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); prevQuote(); }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${colors.bg} border ${colors.border} hover:bg-background/50 transition-colors`}
                  aria-label="Previous quote"
                >
                  <ChevronLeft size={14} className="text-muted-foreground sm:w-4 sm:h-4" />
                </motion.button>
              )}

              {/* Play/Stop Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); playVoice(); }}
                disabled={isLoadingVoice}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlayingVoice
                    ? 'bg-primary text-primary-foreground'
                    : `${colors.bg} border-2 ${colors.border} hover:border-primary/50`
                }`}
                aria-label={isPlayingVoice ? 'Stop' : 'Play voice sample'}
              >
                {isLoadingVoice ? (
                  <Loader2 size={18} className="animate-spin text-muted-foreground sm:w-5 sm:h-5" />
                ) : isPlayingVoice ? (
                  <Square size={14} fill="currentColor" className="sm:w-4 sm:h-4" />
                ) : (
                  <Play size={18} className={`${colors.text} sm:w-5 sm:h-5`} fill="currentColor" />
                )}
              </motion.button>

              {/* Next Quote Arrow */}
              {voiceQuotes.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); nextQuote(); }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${colors.bg} border ${colors.border} hover:bg-background/50 transition-colors`}
                  aria-label="Next quote"
                >
                  <ChevronRight size={14} className="text-muted-foreground sm:w-4 sm:h-4" />
                </motion.button>
              )}
            </div>

            {/* Quote indicator dots */}
            {voiceQuotes.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {voiceQuotes.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); stopVoice(); setCurrentQuoteIndex(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentQuoteIndex
                        ? 'bg-primary w-3'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to quote ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Intro Quote - Only show if no catchphrases */}
        {voiceQuotes.length === 0 && (
          <div className="min-h-[80px] flex items-center justify-center mb-4">
            <motion.blockquote
              key={isActive ? 'active' : 'inactive'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-muted-foreground italic px-2"
            >
              "{isActive ? (
                <TypewriterText text={guide.introQuote} />
              ) : (
                guide.introQuote
              )}"
            </motion.blockquote>
          </div>
        )}

        {/* Select Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelect}
          className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm tracking-wide transition-all hover:bg-primary/90"
        >
          Choose {guide.name.split(' ')[0]}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Typewriter effect component
function TypewriterText({ text }: { text: string }) {
  return (
    <motion.span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02, duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
