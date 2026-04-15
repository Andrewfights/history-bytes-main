/**
 * WW2HostGreeting - Welcome back screen for returning users
 */

import { motion } from 'framer-motion';
import { Play, RefreshCw } from 'lucide-react';
import { WW2Host } from '@/types';
import { useState } from 'react';

interface WW2HostGreetingProps {
  host: WW2Host;
  onContinue: () => void;
  onChangeGuide: () => void;
}

export function WW2HostGreeting({ host, onContinue, onChangeGuide }: WW2HostGreetingProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 sm:px-6"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center w-full max-w-sm sm:max-w-md px-2">
        {/* Host Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-6"
          style={{ backgroundColor: host.primaryColor }}
        >
          {host.avatar}
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-editorial text-xl sm:text-2xl font-bold text-white mb-2">
            Welcome back, soldier!
          </h1>
          <p className="text-white/60 text-sm sm:text-base mb-4 sm:mb-6">
            {host.name} is ready to continue your journey through World War II.
          </p>
        </motion.div>

        {/* Video Section (if available) */}
        {host.welcomeVideoUrl && !isPlayingVideo && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setIsPlayingVideo(true)}
            className="flex items-center justify-center gap-2 mx-auto mb-6 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          >
            <Play size={16} className="fill-current" />
            <span>Play Welcome Message</span>
          </motion.button>
        )}

        {isPlayingVideo && host.welcomeVideoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 aspect-video rounded-xl overflow-hidden bg-black"
          >
            <video
              src={host.welcomeVideoUrl}
              autoPlay
              controls
              className="w-full h-full object-contain"
              onEnded={() => setIsPlayingVideo(false)}
            />
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-2 sm:gap-3"
        >
          <button
            onClick={onContinue}
            className="w-full py-3 sm:py-4 px-6 sm:px-8 rounded-xl bg-white text-black font-bold text-base sm:text-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </button>

          <button
            onClick={onChangeGuide}
            className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-white/10 text-white/70 text-sm sm:text-base hover:bg-white/20 hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
            <span>Change Guide</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
