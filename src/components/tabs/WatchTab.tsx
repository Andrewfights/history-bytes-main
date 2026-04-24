import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Maximize, Volume2,
  Heart, Bookmark, Share2, Info, ChevronRight, Clock, Globe, List
} from 'lucide-react';
import { watchCategories, isYouTubeUrl } from '@/data/watchData';

// Mock series data for program rows
const MOCK_SERIES = [
  {
    id: 'ancient-world',
    title: 'The Ancient World',
    subtitle: 'Empires of the Nile',
    era: 'Ancient',
    episodes: 10,
    thumbnail: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&h=225&fit=crop',
    progress: 30,
  },
  {
    id: 'gods-mortals',
    title: 'Gods & Mortals',
    subtitle: 'Mythology',
    era: 'Classical',
    episodes: 8,
    thumbnail: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=225&fit=crop',
    progress: 0,
  },
  {
    id: 'rise-of-rome',
    title: 'Rise of Rome',
    subtitle: 'From Republic to Empire',
    era: 'Classical',
    episodes: 12,
    thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=225&fit=crop',
    progress: 75,
  },
  {
    id: 'medieval-europe',
    title: 'Medieval Europe',
    subtitle: 'Castles & Crusades',
    era: 'Medieval',
    episodes: 10,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop',
    progress: 0,
  },
  {
    id: 'renaissance-masters',
    title: 'Renaissance Masters',
    subtitle: 'Art & Innovation',
    era: 'Renaissance',
    episodes: 6,
    thumbnail: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=400&h=225&fit=crop',
    progress: 50,
  },
];

// Format view count
function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
}

export function WatchTab() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(33);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentCategory = watchCategories[categoryIndex];
  const currentVideo = currentCategory?.videos[videoIndex];

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  // Go to next/prev video
  const goToVideo = useCallback((index: number) => {
    if (index >= 0 && index < currentCategory.videos.length) {
      setVideoIndex(index);
      setIsPlaying(false);
      setProgress(0);
    }
  }, [currentCategory]);

  // Toggle like
  const toggleLike = useCallback(() => {
    if (!currentVideo) return;
    setIsLiked(prev => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }));
  }, [currentVideo]);

  // Toggle save
  const toggleSave = useCallback(() => {
    if (!currentVideo) return;
    setIsSaved(prev => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }));
  }, [currentVideo]);

  if (!currentVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <p className="text-off-white/50 font-mono text-sm">No videos available</p>
      </div>
    );
  }

  const isYouTube = isYouTubeUrl(currentVideo.videoUrl);

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-off-white/[0.08] bg-gradient-to-b from-[#131009] to-[#0a0805]">
        {/* Top bar */}
        <div className="px-4 lg:px-6 pt-4 pb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-ha-red" />
                <span className="font-mono text-[9px] lg:text-[10px] font-bold tracking-[0.4em] text-ha-red uppercase">
                  Cinema Hall
                </span>
              </div>
              <h1 className="font-display text-xl lg:text-[32px] font-black text-off-white uppercase tracking-tight leading-none">
                The <span className="text-gold-2">Theater</span><span className="text-gold-2">.</span>
              </h1>
            </div>
          </div>

          {/* Stats (desktop only) */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-[8px] tracking-[0.3em] text-off-white/40 uppercase font-bold">Programs</span>
              <span className="font-serif italic text-lg text-gold-2">{watchCategories.reduce((sum, cat) => sum + cat.videos.length, 0)}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-[8px] tracking-[0.3em] text-off-white/40 uppercase font-bold">Categories</span>
              <span className="font-serif italic text-lg text-gold-2">{watchCategories.length}</span>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 px-4 lg:px-6 pb-3 overflow-x-auto scrollbar-hide">
          {watchCategories.map((cat, idx) => {
            const isActive = idx === categoryIndex;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryIndex(idx);
                  setVideoIndex(0);
                  setIsPlaying(false);
                }}
                className={`relative flex items-center gap-2 px-3 py-2 rounded font-display text-[10px] lg:text-[11px] font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-[#1a0b02] shadow-[0_3px_10px_rgba(230,171,42,0.25)]'
                    : 'bg-[rgba(20,14,8,0.7)] border border-gold-2/15 text-off-white/50 hover:text-gold-2 hover:border-gold-2/35'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                  border: '1px solid #B2641F',
                } : undefined}
              >
                {isActive && (
                  <>
                    <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-ha-red" />
                    <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-ha-red" />
                  </>
                )}
                {cat.name}
                <span className={`font-mono text-[9px] tracking-[0.12em] ${isActive ? 'opacity-75' : 'opacity-60'}`}>
                  {cat.videos.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 lg:p-6">
        {/* Watch grid - player + up next */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-5 mb-6">
          {/* Player */}
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #131009, #0a0805)',
              border: '1px solid rgba(230,171,42,0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(230,171,42,0.1)',
            }}
          >
            {/* Corner brackets */}
            <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-gold-2 z-10 pointer-events-none" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-gold-2 z-10 pointer-events-none" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-gold-2 z-10 pointer-events-none" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-gold-2 z-10 pointer-events-none" />

            {/* Top chrome */}
            <div className="absolute top-0 left-0 right-0 p-3 lg:p-4 flex items-center justify-between z-20 pointer-events-none bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center gap-3 pointer-events-auto">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-sm font-mono text-[8px] lg:text-[9px] tracking-[0.32em] text-[#E84046] uppercase font-bold"
                  style={{
                    background: 'rgba(138,10,14,0.15)',
                    border: '1px solid rgba(205,14,20,0.4)',
                  }}
                >
                  <span className="w-[5px] h-[5px] rounded-full bg-ha-red animate-pulse shadow-[0_0_6px_var(--ha-red)]" />
                  Ep {String(videoIndex + 1).padStart(2, '0')} of {currentCategory.videos.length}
                </div>
                <span className="hidden lg:block font-display italic font-bold text-[11px] tracking-[0.05em] text-gold-2 uppercase">
                  {currentCategory.name}
                </span>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button className="w-8 h-8 flex items-center justify-center rounded-sm bg-[rgba(20,14,8,0.75)] border border-gold-2/15 text-off-white/50 hover:text-gold-2 hover:border-gold-2/35 transition-colors backdrop-blur-sm">
                  <Maximize size={14} />
                </button>
              </div>
            </div>

            {/* Video surface */}
            <div className="relative aspect-video bg-[#050302]">
              {isYouTube ? (
                <iframe
                  ref={iframeRef}
                  src={currentVideo.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentVideo.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onClick={togglePlay}
                />
              )}

              {/* Play overlay (for non-YouTube) */}
              {!isYouTube && !isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.45)_75%)] cursor-pointer"
                  onClick={togglePlay}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle at 35% 25%, #fef0d0 0%, #E6AB2A 50%, #B2641F 100%)',
                      border: '2px solid #1a0b02',
                      boxShadow: '0 0 36px rgba(230,171,42,0.55), 0 6px 16px rgba(0,0,0,0.5)',
                    }}
                  >
                    <Play size={28} fill="#1a0b02" className="text-[#1a0b02] ml-1" />
                  </motion.div>
                </motion.div>
              )}

              {/* Thumbnail overlay for YouTube */}
              {isYouTube && (
                <img
                  src={currentVideo.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0"
                />
              )}
            </div>

            {/* Bottom chrome */}
            <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 z-20 pointer-events-none bg-gradient-to-t from-black/80 to-transparent">
              {/* Progress bar */}
              <div className="relative h-1 bg-off-white/20 rounded-full mb-3 cursor-pointer pointer-events-auto">
                <div
                  className="absolute top-0 left-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(230,171,42,0.5)]"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #B2641F, #E6AB2A)',
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F6E355] border-2 border-[#1a0b02] shadow-[0_0_10px_rgba(230,171,42,0.6)]"
                  style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={() => goToVideo(videoIndex - 1)}
                  disabled={videoIndex === 0}
                  className="w-9 h-9 flex items-center justify-center text-off-white hover:text-gold-2 disabled:opacity-30 disabled:hover:text-off-white transition-colors"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 flex items-center justify-center text-off-white hover:text-gold-2 transition-colors"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button
                  onClick={() => goToVideo(videoIndex + 1)}
                  disabled={videoIndex >= currentCategory.videos.length - 1}
                  className="w-9 h-9 flex items-center justify-center text-off-white hover:text-gold-2 disabled:opacity-30 disabled:hover:text-off-white transition-colors"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>
                <span className="font-mono text-[11px] tracking-[0.08em] text-off-white font-semibold">
                  <span className="text-[#F6E355]">5:42</span> / {currentVideo.duration}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button className="w-9 h-9 flex items-center justify-center text-off-white/50 hover:text-gold-2 transition-colors">
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Up Next rail */}
          <div
            className="rounded-lg overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #131009, #0a0805)',
              border: '1px solid rgba(230,171,42,0.15)',
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-off-white/[0.08] flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[1px] bg-[#E84046]" />
                <span className="font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">
                  Up Next
                </span>
              </div>
              <h3 className="font-serif italic font-bold text-[17px] text-off-white leading-tight">
                {currentCategory.name} <span className="text-gold-2">Series</span>
              </h3>
              {/* Progress bar */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-[3px] bg-gold-2/15 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((videoIndex + 1) / currentCategory.videos.length) * 100}%`,
                      background: 'linear-gradient(90deg, #B2641F, #E6AB2A)',
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] tracking-[0.2em] text-off-white/50 uppercase font-bold">
                  <span className="text-gold-2">{videoIndex + 1}</span>/{currentCategory.videos.length}
                </span>
              </div>
            </div>

            {/* Episode list */}
            <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-[560px]">
              {currentCategory.videos.map((video, idx) => {
                const isCurrent = idx === videoIndex;
                return (
                  <button
                    key={video.id}
                    onClick={() => goToVideo(idx)}
                    className={`w-full grid grid-cols-[100px_1fr] gap-3 p-3 text-left border-b border-off-white/[0.04] relative transition-colors ${
                      isCurrent
                        ? 'bg-gold-2/[0.08]'
                        : 'hover:bg-gold-2/[0.04]'
                    }`}
                  >
                    {/* Current indicator */}
                    {isCurrent && (
                      <span
                        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r"
                        style={{ background: 'linear-gradient(180deg, #F6E355, #B2641F)' }}
                      />
                    )}

                    {/* Thumbnail */}
                    <div className={`relative aspect-video rounded-sm overflow-hidden bg-[#0a0805] ${isCurrent ? 'border border-gold-2' : 'border border-gold-2/20'}`}>
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm bg-[rgba(10,8,5,0.8)] font-mono text-[8px] tracking-[0.18em] text-[#F6E355] uppercase font-bold backdrop-blur-sm">
                        Ep {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-sm bg-[rgba(10,8,5,0.85)] font-mono text-[8px] text-off-white font-semibold backdrop-blur-sm">
                        {video.duration}
                      </span>
                      {isCurrent && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,8,5,0.5)]">
                          <Play size={22} fill="#F6E355" className="text-[#F6E355]" />
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col justify-center gap-1 min-w-0">
                      <h4 className={`font-display font-semibold text-[12.5px] leading-tight line-clamp-2 ${isCurrent ? 'text-[#F6E355] font-bold' : 'text-off-white'}`}>
                        {video.title}
                      </h4>
                      <p className={`font-serif italic text-[12px] leading-tight line-clamp-1 ${isCurrent ? 'text-off-white/70' : 'text-off-white/50'}`}>
                        {formatViews(video.views)} views
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-off-white/[0.08] bg-[rgba(10,8,5,0.5)]">
              <button className="w-full flex items-center justify-between font-mono text-[9.5px] tracking-[0.3em] text-gold-2 uppercase font-bold hover:text-[#F6E355] transition-colors">
                View All Episodes
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Metadata panel */}
        <div
          className="relative rounded-lg p-5 lg:p-6 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #131009, #0a0805)',
            border: '1px solid rgba(230,171,42,0.15)',
          }}
        >
          {/* Corner accents */}
          <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-gold-2/40" />
          <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-gold-2/40" />

          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-[1px] bg-[#E84046]" />
            <span className="font-mono text-[9.5px] tracking-[0.38em] text-[#E84046] uppercase font-bold">
              Now Playing · <span className="text-gold-2">Ep {String(videoIndex + 1).padStart(2, '0')}</span>
            </span>
          </div>

          <h2 className="font-serif italic font-bold text-xl lg:text-[28px] text-off-white leading-tight mb-3">
            {currentVideo.title.split(':')[0]}
            {currentVideo.title.includes(':') && (
              <span className="text-gold-2">: {currentVideo.title.split(':')[1]}</span>
            )}
          </h2>

          {/* Meta bits */}
          <div className="flex flex-wrap gap-3 lg:gap-4 mb-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-off-white/50 uppercase font-semibold">
              <Clock size={12} className="opacity-75" />
              <span className="text-gold-2">{currentVideo.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-off-white/50 uppercase font-semibold">
              <Globe size={12} className="opacity-75" />
              {currentCategory.name}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-off-white/50 uppercase font-semibold">
              <span className="text-gold-2">{formatViews(currentVideo.views)}</span> views
            </div>
          </div>

          <p className="font-serif italic text-[15px] text-off-white/70 leading-relaxed max-w-3xl mb-4">
            {currentVideo.description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed border-off-white/[0.08]">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded font-display text-[10.5px] font-bold tracking-[0.18em] uppercase transition-all ${
                isLiked[currentVideo.id]
                  ? 'bg-gold-2/10 border border-gold-2 text-[#F6E355]'
                  : 'bg-[rgba(20,14,8,0.6)] border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/35'
              }`}
            >
              <Heart size={13} fill={isLiked[currentVideo.id] ? 'currentColor' : 'none'} />
              Like
              <span className="font-mono text-[9.5px] opacity-80">2.4K</span>
            </button>
            <button
              onClick={toggleSave}
              className={`flex items-center gap-2 px-3 py-2 rounded font-display text-[10.5px] font-bold tracking-[0.18em] uppercase transition-all ${
                isSaved[currentVideo.id]
                  ? 'bg-gold-2/10 border border-gold-2 text-[#F6E355]'
                  : 'bg-[rgba(20,14,8,0.6)] border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/35'
              }`}
            >
              <Bookmark size={13} fill={isSaved[currentVideo.id] ? 'currentColor' : 'none'} />
              Save
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded font-display text-[10.5px] font-bold tracking-[0.18em] uppercase bg-[rgba(20,14,8,0.6)] border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/35 transition-all">
              <Share2 size={13} />
              Share
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded font-display text-[10.5px] font-bold tracking-[0.18em] uppercase bg-[rgba(20,14,8,0.6)] border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/35 transition-all">
              <List size={13} />
              Transcript
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded font-display text-[10.5px] font-bold tracking-[0.18em] uppercase bg-[rgba(20,14,8,0.6)] border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/35 transition-all">
              <Info size={13} />
              Facts
            </button>
          </div>
        </div>

        {/* Program rows */}
        <div className="space-y-8">
          {/* Continue Watching */}
          <section>
            <div className="flex items-baseline justify-between gap-4 mb-3 px-1">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-[1px] bg-[#E84046]" />
                  <span className="font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">
                    Continue Watching
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg lg:text-xl text-off-white tracking-tight">
                  Pick Up Where You <span className="text-gold-2 italic">Left Off</span>
                </h3>
              </div>
              <button className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold hover:text-[#F6E355] transition-colors flex-shrink-0">
                View All
                <ChevronRight size={11} />
              </button>
            </div>

            <div className="flex gap-3.5 overflow-x-auto pb-3 scrollbar-hide">
              {MOCK_SERIES.filter(s => s.progress > 0).map((series) => (
                <div
                  key={series.id}
                  className="flex-shrink-0 w-[220px] lg:w-[260px] rounded-md overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(230,171,42,0.1)]"
                  style={{
                    background: 'linear-gradient(180deg, #131009, #0a0805)',
                    border: '1px solid rgba(230,171,42,0.15)',
                  }}
                >
                  <div className="relative aspect-video bg-[#050302] overflow-hidden">
                    <img src={series.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm font-mono text-[8.5px] tracking-[0.28em] text-[#F6E355] uppercase font-bold bg-[rgba(10,8,5,0.85)] border border-gold-2/30 backdrop-blur-sm">
                      ◆ {series.era}
                    </span>
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm font-mono text-[9px] text-off-white font-bold bg-[rgba(10,8,5,0.85)] backdrop-blur-sm">
                      <List size={10} />
                      {series.episodes}
                    </span>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-off-white/15">
                      <div
                        className="h-full"
                        style={{
                          width: `${series.progress}%`,
                          background: 'linear-gradient(90deg, #B2641F, #E6AB2A)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <span className="font-mono text-[8.5px] tracking-[0.3em] text-gold-2 uppercase font-bold">
                      Series
                    </span>
                    <h4 className="font-serif italic font-bold text-[14px] lg:text-[15.5px] text-off-white leading-tight mt-1">
                      {series.title}
                    </h4>
                    <p className="font-serif italic text-[12px] lg:text-[12.5px] text-off-white/50 mt-0.5">
                      {series.subtitle} <span className="text-gold-2/50">·</span> {series.episodes} episodes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Series */}
          <section>
            <div className="flex items-baseline justify-between gap-4 mb-3 px-1">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-[1px] bg-[#E84046]" />
                  <span className="font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">
                    Featured Programs
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg lg:text-xl text-off-white tracking-tight">
                  Explore the <span className="text-gold-2 italic">Archives</span>
                </h3>
                <p className="font-serif italic text-sm text-off-white/50 mt-0.5">
                  Curated documentary series spanning millennia
                </p>
              </div>
              <button className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold hover:text-[#F6E355] transition-colors flex-shrink-0">
                Browse All
                <ChevronRight size={11} />
              </button>
            </div>

            <div className="flex gap-3.5 overflow-x-auto pb-3 scrollbar-hide">
              {MOCK_SERIES.map((series) => (
                <div
                  key={series.id}
                  className="flex-shrink-0 w-[220px] lg:w-[260px] rounded-md overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(230,171,42,0.1)]"
                  style={{
                    background: 'linear-gradient(180deg, #131009, #0a0805)',
                    border: '1px solid rgba(230,171,42,0.15)',
                  }}
                >
                  <div className="relative aspect-video bg-[#050302] overflow-hidden">
                    <img src={series.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm font-mono text-[8.5px] tracking-[0.28em] text-[#F6E355] uppercase font-bold bg-[rgba(10,8,5,0.85)] border border-gold-2/30 backdrop-blur-sm">
                      ◆ {series.era}
                    </span>
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm font-mono text-[9px] text-off-white font-bold bg-[rgba(10,8,5,0.85)] backdrop-blur-sm">
                      <List size={10} />
                      {series.episodes}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="font-mono text-[8.5px] tracking-[0.3em] text-gold-2 uppercase font-bold">
                      Series
                    </span>
                    <h4 className="font-serif italic font-bold text-[14px] lg:text-[15.5px] text-off-white leading-tight mt-1">
                      {series.title}
                    </h4>
                    <p className="font-serif italic text-[12px] lg:text-[12.5px] text-off-white/50 mt-0.5">
                      {series.subtitle} <span className="text-gold-2/50">·</span> {series.episodes} episodes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* By Era sections */}
          {watchCategories.slice(0, 3).map((category) => (
            <section key={category.id}>
              <div className="flex items-baseline justify-between gap-4 mb-3 px-1">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-[1px] bg-[#E84046]" />
                    <span className="font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">
                      {category.icon} {category.name}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg lg:text-xl text-off-white tracking-tight">
                    {category.name} <span className="text-gold-2 italic">Collection</span>
                  </h3>
                </div>
                <button className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold hover:text-[#F6E355] transition-colors flex-shrink-0">
                  All {category.videos.length}
                  <ChevronRight size={11} />
                </button>
              </div>

              <div className="flex gap-3.5 overflow-x-auto pb-3 scrollbar-hide">
                {category.videos.slice(0, 6).map((video, idx) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setCategoryIndex(watchCategories.indexOf(category));
                      setVideoIndex(idx);
                      setIsPlaying(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-shrink-0 w-[200px] lg:w-[240px] rounded-md overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(230,171,42,0.1)]"
                    style={{
                      background: 'linear-gradient(180deg, #131009, #0a0805)',
                      border: '1px solid rgba(230,171,42,0.15)',
                    }}
                  >
                    <div className="relative aspect-video bg-[#050302] overflow-hidden">
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-sm font-mono text-[9px] text-off-white font-semibold bg-[rgba(10,8,5,0.9)] backdrop-blur-sm">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="font-mono text-[8.5px] tracking-[0.3em] text-gold-2 uppercase font-bold">
                        Episode {idx + 1}
                      </span>
                      <h4 className="font-serif italic font-bold text-[13px] lg:text-[14px] text-off-white leading-tight mt-1 line-clamp-2 min-h-[36px]">
                        {video.title}
                      </h4>
                      <p className="font-serif italic text-[11px] lg:text-[12px] text-off-white/50 mt-0.5 line-clamp-1">
                        {formatViews(video.views)} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Safe area padding for mobile */}
      <div className="h-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
}
