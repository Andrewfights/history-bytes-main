import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface VideoIntroScreenProps {
  videoUrl: string;
  title: string;
  hostName?: string;
  hostAvatar?: string;
  hostMessage?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function VideoIntroScreen({
  videoUrl,
  title,
  hostName,
  hostAvatar,
  hostMessage,
  onComplete,
  onSkip,
}: VideoIntroScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  // YouTube embed URL with autoplay
  const embedUrl = isPlaying
    ? `${videoUrl}&autoplay=1&mute=${isMuted ? 1 : 0}`
    : videoUrl;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {hostAvatar && (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              {hostAvatar}
            </div>
          )}
          <div>
            <h2 className="font-editorial text-lg font-bold">{title}</h2>
            {hostName && (
              <p className="text-xs text-muted-foreground">Presented by {hostName}</p>
            )}
          </div>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipForward size={16} />
          Skip
        </button>
      </div>

      {/* Host message bubble */}
      {hostMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-4 mt-4 p-4 rounded-lg bg-card border border-border"
        >
          <p className="text-sm text-muted-foreground italic">"{hostMessage}"</p>
        </motion.div>
      )}

      {/* Video container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden bg-black border border-border">
          {!isPlaying ? (
            // Play button overlay
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handlePlay}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 hover:bg-black/40 transition-colors group"
            >
              <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors mb-4">
                <Play size={32} className="text-primary-foreground ml-1" fill="currentColor" />
              </div>
              <p className="text-white text-sm">Watch Introduction</p>
            </motion.button>
          ) : null}

          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>

          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Continue to Lesson
          </button>
        </div>
      </div>
    </motion.div>
  );
}
