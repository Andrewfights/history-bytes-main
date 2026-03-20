/**
 * ExamQuestionPreview - Preview modal for testing exam questions with different hosts
 * Shows how a question will appear during the actual exam
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, SkipForward, Clock } from 'lucide-react';
import type { ExamQuestionVideo, ExamMilestoneVideo } from '@/lib/firestore';

// WW2 Hosts configuration
const WW2_HOSTS = [
  { id: 'sergeant', name: 'Sergeant Mitchell', avatar: '🪖', color: 'bg-green-700' },
  { id: 'journalist', name: 'War Correspondent', avatar: '📰', color: 'bg-amber-500' },
  { id: 'codebreaker', name: 'Code Breaker', avatar: '🔬', color: 'bg-slate-600' },
] as const;

type HostId = typeof WW2_HOSTS[number]['id'];

interface QuestionData {
  questionId: string;
  questionNumber: number;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  category?: string;
  hostDirection?: string;
}

interface ExamQuestionPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionData;
  hostVideos: Record<HostId, ExamQuestionVideo | null>;
  initialHost?: HostId;
}

export function ExamQuestionPreview({
  isOpen,
  onClose,
  question,
  hostVideos,
  initialHost = 'sergeant',
}: ExamQuestionPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedHost, setSelectedHost] = useState<HostId>(initialHost);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  const currentVideo = hostVideos[selectedHost];

  // Reset state when modal opens or host changes
  useEffect(() => {
    if (isOpen) {
      setSelectedHost(initialHost);
      setIsPlaying(false);
      setShowTimer(false);
      setTimeRemaining(10);
    }
  }, [isOpen, initialHost]);

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      setCurrentTime(video.currentTime);

      // Check trim bounds
      if (currentVideo?.trimEnd && video.currentTime >= currentVideo.trimEnd) {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle video loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Seek to trim start if set
      if (currentVideo?.trimStart) {
        videoRef.current.currentTime = currentVideo.trimStart;
      }
    }
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Start from trim start if at beginning
        if (currentVideo?.trimStart && videoRef.current.currentTime < currentVideo.trimStart) {
          videoRef.current.currentTime = currentVideo.trimStart;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Simulate exam timer
  const startExamSimulation = () => {
    setShowTimer(true);
    setTimeRemaining(10);

    // Play video
    if (videoRef.current) {
      if (currentVideo?.trimStart) {
        videoRef.current.currentTime = currentVideo.trimStart;
      } else {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }

    // Start countdown
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Get effective playback range
  const trimStart = currentVideo?.trimStart || 0;
  const trimEnd = currentVideo?.trimEnd || duration;
  const clipDuration = trimEnd - trimStart;

  // Format time
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">Q{question.questionNumber}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              {question.category && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-white/10 text-white/60">
                  {question.category}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Host Selector */}
          <div className="px-6 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-sm mr-2">Preview as:</span>
              {WW2_HOSTS.map((host) => {
                const hasVideo = hostVideos[host.id] !== null;
                const isSelected = selectedHost === host.id;
                return (
                  <button
                    key={host.id}
                    onClick={() => {
                      setSelectedHost(host.id);
                      setIsPlaying(false);
                      setShowTimer(false);
                    }}
                    disabled={!hasVideo}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                      isSelected
                        ? `${host.color} text-white`
                        : hasVideo
                        ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-lg">{host.avatar}</span>
                    <span className="text-sm">{host.name}</span>
                    {!hasVideo && <span className="text-xs text-red-400">(no video)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Video Section */}
            <div className="relative aspect-video bg-black">
              {currentVideo ? (
                <>
                  <video
                    ref={videoRef}
                    key={currentVideo.videoUrl} // Force reload on host change
                    src={currentVideo.videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    muted={isMuted}
                  />

                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                    >
                      {isPlaying ? (
                        <Pause size={28} className="text-white" />
                      ) : (
                        <Play size={28} className="text-white ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Timer Overlay (Exam Simulation) */}
                  {showTimer && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm">
                      <Clock size={18} className={timeRemaining <= 3 ? 'text-red-400' : 'text-white'} />
                      <span className={`text-xl font-bold font-mono ${timeRemaining <= 3 ? 'text-red-400' : 'text-white'}`}>
                        {timeRemaining}s
                      </span>
                    </div>
                  )}

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-3">
                      {/* Progress bar */}
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white transition-all"
                          style={{ width: `${((currentTime - trimStart) / clipDuration) * 100}%` }}
                        />
                      </div>

                      {/* Time */}
                      <span className="text-white/70 text-xs font-mono">
                        {formatTime(currentTime - trimStart)} / {formatTime(clipDuration)}
                      </span>

                      {/* Mute button */}
                      <button
                        onClick={toggleMute}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>

                    {/* Trim indicator */}
                    {(currentVideo.trimStart !== undefined || currentVideo.trimEnd !== undefined) && (
                      <div className="mt-2 text-xs text-amber-400/80">
                        ✂️ Trimmed: {formatTime(trimStart)} - {formatTime(trimEnd)}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                  <span className="text-4xl mb-2">🎬</span>
                  <span>No video for {WW2_HOSTS.find(h => h.id === selectedHost)?.name}</span>
                </div>
              )}
            </div>

            {/* Question Content */}
            <div className="p-6 space-y-4">
              {/* Host Direction */}
              {question.hostDirection && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/50 text-xs mb-1">Host Direction:</p>
                  <p className="text-white/80 text-sm italic">"{question.hostDirection}"</p>
                </div>
              )}

              {/* Question */}
              <div>
                <p className="text-white text-lg font-medium">{question.prompt}</p>
              </div>

              {/* Answer Options */}
              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-white/90">{option}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={startExamSimulation}
              disabled={!currentVideo}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-white/30 text-black font-medium rounded-lg transition-colors"
            >
              <Clock size={16} />
              Simulate 10s Exam
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ExamQuestionPreview;
