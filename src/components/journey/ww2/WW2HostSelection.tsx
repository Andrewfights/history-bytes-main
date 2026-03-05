/**
 * WW2HostSelection - Select a historical guide for WW2 content
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import { WW2_HOSTS, getWW2HostById } from '@/data/ww2Hosts';
import { WW2Host } from '@/types';

interface WW2HostSelectionProps {
  onSelectHost: (hostId: string) => void;
}

export function WW2HostSelection({ onSelectHost }: WW2HostSelectionProps) {
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const handleHostClick = (hostId: string) => {
    setSelectedHost(hostId);
  };

  const handlePlayIntro = (hostId: string) => {
    const host = getWW2HostById(hostId);
    if (host?.introVideoUrl) {
      setPlayingVideo(hostId);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedHost) {
      onSelectHost(selectedHost);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-y-auto"
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="font-editorial text-3xl font-bold text-white mb-2">
            Choose Your Guide
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            Select a historical figure to guide you through World War II
          </p>
        </motion.div>

        {/* Host Cards */}
        <div className="flex-1 flex flex-col gap-4 max-w-lg mx-auto w-full">
          {WW2_HOSTS.map((host, index) => (
            <HostCard
              key={host.id}
              host={host}
              isSelected={selectedHost === host.id}
              isPlaying={playingVideo === host.id}
              onSelect={() => handleHostClick(host.id)}
              onPlayIntro={() => handlePlayIntro(host.id)}
              delay={index * 0.1 + 0.3}
            />
          ))}
        </div>

        {/* Confirm Button */}
        <AnimatePresence>
          {selectedHost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 px-4"
            >
              <button
                onClick={handleConfirmSelection}
                className="w-full max-w-lg mx-auto block py-4 px-8 rounded-xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue with {getWW2HostById(selectedHost)?.name}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingVideo && (
          <VideoModal
            host={getWW2HostById(playingVideo)!}
            onClose={() => setPlayingVideo(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface HostCardProps {
  host: WW2Host;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlayIntro: () => void;
  delay: number;
}

function HostCard({ host, isSelected, onSelect, onPlayIntro, delay }: HostCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onSelect}
      className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all ${
        isSelected
          ? 'border-white bg-white/10'
          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
      }`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: host.primaryColor }}
        >
          {host.avatar}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-lg">{host.name}</h3>
              <p className="text-white/60 text-sm">{host.title}</p>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"
              >
                <Check size={16} className="text-black" />
              </motion.div>
            )}
          </div>

          <p className="text-white/50 text-sm mt-2 line-clamp-2">
            {host.description}
          </p>

          {/* Play Intro Button */}
          {host.introVideoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayIntro();
              }}
              className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Play size={14} className="fill-current" />
              <span>Play Intro</span>
            </button>
          )}
        </div>
      </div>

      {/* Specialty Badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-1 rounded-full bg-white/10 text-white/70 text-xs">
          {host.specialty}
        </span>
        <span className="text-white/40 text-xs">{host.era}</span>
      </div>
    </motion.button>
  );
}

interface VideoModalProps {
  host: WW2Host;
  onClose: () => void;
}

function VideoModal({ host, onClose }: VideoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg aspect-video bg-black rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {host.introVideoUrl ? (
          <video
            src={host.introVideoUrl}
            autoPlay
            controls
            className="w-full h-full object-cover"
            onEnded={onClose}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
            <div className="text-6xl mb-4">{host.avatar}</div>
            <p className="text-center px-4">
              Video coming soon for {host.name}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
