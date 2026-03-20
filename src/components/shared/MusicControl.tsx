/**
 * MusicControl - Floating music mute/volume control button
 * Shown during journey exploration and gameplay
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music2 } from 'lucide-react';
import { useAudioContext } from '@/context/AudioContext';

interface MusicControlProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function MusicControl({
  position = 'bottom-left',
  className = '',
}: MusicControlProps) {
  const { isMusicMuted, isMusicPlaying, hasMusic, toggleMusicMute, musicVolume, setMusicVolume } = useAudioContext();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Show if music exists (even if faded/paused) or if muted
  if (!hasMusic && !isMusicMuted) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-24 left-4', // Above tab bar
    'bottom-right': 'bottom-24 right-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed ${positionClasses[position]} z-40 ${className}`}
    >
      <div className="relative">
        {/* Main toggle button */}
        <motion.button
          onClick={toggleMusicMute}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
          whileTap={{ scale: 0.95 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isMusicMuted
              ? 'bg-slate-800 text-white/50'
              : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
          }`}
        >
          {isMusicMuted ? (
            <VolumeX size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </motion.button>

        {/* Volume slider (shown on hover) */}
        <AnimatePresence>
          {showVolumeSlider && !isMusicMuted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-slate-800 rounded-xl shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Music2 size={14} className="text-amber-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-xs text-white/60 w-8">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Minimal music indicator (for compact spaces)
 */
interface MusicIndicatorProps {
  onClick?: () => void;
  className?: string;
}

export function MusicIndicator({ onClick, className = '' }: MusicIndicatorProps) {
  const { isMusicMuted, hasMusic, toggleMusicMute } = useAudioContext();

  // Show if music exists (even if faded/paused) or if muted
  if (!hasMusic && !isMusicMuted) {
    return null;
  }

  return (
    <button
      onClick={onClick || toggleMusicMute}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors ${className}`}
    >
      {isMusicMuted ? (
        <>
          <VolumeX size={14} />
          <span className="text-xs">Muted</span>
        </>
      ) : (
        <>
          <Volume2 size={14} />
          <span className="text-xs">Music</span>
        </>
      )}
    </button>
  );
}

export default MusicControl;
