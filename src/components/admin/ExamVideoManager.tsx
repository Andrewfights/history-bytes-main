/**
 * ExamVideoManager - Admin interface for managing exam question videos
 * Allows uploading 10-second video clips for each of the 15 exam questions
 * Supports multiple hosts (3 videos per question - one for each host)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Trash2, Play, Pause, Check, AlertCircle, Clock, RefreshCw, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import { FINAL_EXAM_QUESTIONS } from '../journey/pearl-harbor/exam/examQuestions';
import {
  subscribeToWW2ModuleAssets,
  updateExamQuestionVideo,
  type ExamQuestionVideo,
  type ExamQuestionHostVideos,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

// WW2 Hosts configuration
const WW2_HOSTS = [
  { id: 'sergeant', name: 'Sergeant', avatar: '🎖️', color: 'bg-blue-500' },
  { id: 'journalist', name: 'War Correspondent', avatar: '📰', color: 'bg-amber-500' },
  { id: 'codebreaker', name: 'Codebreaker', avatar: '🔐', color: 'bg-purple-500' },
] as const;

type HostId = typeof WW2_HOSTS[number]['id'];
type VideoStatus = 'missing' | 'ready' | 'wrong-duration';

interface QuestionVideoState {
  questionId: string;
  questionNumber: number;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hostVideos: Record<HostId, ExamQuestionVideo | null>;
  hostStatuses: Record<HostId, VideoStatus>;
}

export function ExamVideoManager() {
  const [questionVideos, setQuestionVideos] = useState<QuestionVideoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<HostId>('eisenhower');
  const [activeHostTab, setActiveHostTab] = useState<HostId>('eisenhower');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const examVideos = assets?.examQuestionVideos || {};

      const states: QuestionVideoState[] = FINAL_EXAM_QUESTIONS.map((q) => {
        const questionHostVideos = examVideos[q.id] || {};

        // Build host videos and statuses for each host
        const hostVideos: Record<HostId, ExamQuestionVideo | null> = {
          eisenhower: null,
          journalist: null,
          codebreaker: null,
        };
        const hostStatuses: Record<HostId, VideoStatus> = {
          eisenhower: 'missing',
          journalist: 'missing',
          codebreaker: 'missing',
        };

        WW2_HOSTS.forEach(host => {
          const video = questionHostVideos[host.id] || null;
          hostVideos[host.id] = video;

          if (video) {
            if (video.duration !== undefined && (video.duration < 8 || video.duration > 12)) {
              hostStatuses[host.id] = 'wrong-duration';
            } else {
              hostStatuses[host.id] = 'ready';
            }
          } else {
            hostStatuses[host.id] = 'missing';
          }
        });

        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          prompt: q.prompt,
          difficulty: q.difficulty,
          hostVideos,
          hostStatuses,
        };
      });

      setQuestionVideos(states);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectVideo = async (file: MediaFile) => {
    if (!selectedQuestion || !selectedHost) return;

    // Create video element to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = async () => {
      const duration = video.duration;

      const videoData: ExamQuestionVideo = {
        questionId: selectedQuestion,
        hostId: selectedHost,
        videoUrl: file.url,
        duration,
      };

      const success = await updateExamQuestionVideo(selectedQuestion, selectedHost, videoData);

      if (success) {
        const hostName = WW2_HOSTS.find(h => h.id === selectedHost)?.name || selectedHost;
        toast.success(`Video assigned for ${hostName}`);

        // Warn about duration if not ~10 seconds
        if (duration < 8 || duration > 12) {
          toast.warning(`Video duration is ${duration.toFixed(1)}s - ideally should be ~10s`);
        }
      } else {
        toast.error('Failed to save video');
      }

      setIsMediaPickerOpen(false);
      setSelectedQuestion(null);
    };

    video.onerror = async () => {
      // Still save even if we can't get duration
      const videoData: ExamQuestionVideo = {
        questionId: selectedQuestion,
        hostId: selectedHost,
        videoUrl: file.url,
      };

      const success = await updateExamQuestionVideo(selectedQuestion, selectedHost, videoData);

      if (success) {
        toast.success('Video assigned (duration unknown)');
      } else {
        toast.error('Failed to save video');
      }

      setIsMediaPickerOpen(false);
      setSelectedQuestion(null);
    };

    video.src = file.url;
  };

  const handleRemoveVideo = async (questionId: string, hostId: HostId) => {
    const success = await updateExamQuestionVideo(questionId, hostId, null);

    if (success) {
      const hostName = WW2_HOSTS.find(h => h.id === hostId)?.name || hostId;
      toast.success(`Video removed for ${hostName}`);
    } else {
      toast.error('Failed to remove video');
    }
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getStatusIcon = (status: VideoStatus) => {
    switch (status) {
      case 'ready': return <Check size={16} className="text-green-400" />;
      case 'wrong-duration': return <Clock size={16} className="text-amber-400" />;
      case 'missing': return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  const getStatusText = (status: VideoStatus) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'wrong-duration': return 'Wrong Duration';
      case 'missing': return 'Missing';
    }
  };

  // Calculate progress for the active host tab
  const getHostProgress = (hostId: HostId) => {
    const readyCount = questionVideos.filter(q => q.hostStatuses[hostId] === 'ready').length;
    const wrongDurationCount = questionVideos.filter(q => q.hostStatuses[hostId] === 'wrong-duration').length;
    const missingCount = questionVideos.filter(q => q.hostStatuses[hostId] === 'missing').length;
    return { readyCount, wrongDurationCount, missingCount, total: questionVideos.length };
  };

  const activeHostProgress = getHostProgress(activeHostTab);

  // Calculate total progress across all hosts
  const getTotalProgress = () => {
    let totalReady = 0;
    let totalVideos = questionVideos.length * WW2_HOSTS.length;

    questionVideos.forEach(q => {
      WW2_HOSTS.forEach(host => {
        if (q.hostStatuses[host.id] === 'ready') totalReady++;
      });
    });

    return { totalReady, totalVideos };
  };

  const totalProgress = getTotalProgress();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Exam Video Manager</h1>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <Users size={12} />
            3 Hosts
          </span>
        </div>
        <p className="text-muted-foreground">
          Upload 10-second video clips for each of the 15 final exam questions.
          Each question needs a video for each of the 3 hosts ({totalProgress.totalReady}/{totalProgress.totalVideos} total).
        </p>
      </div>

      {/* Host Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {WW2_HOSTS.map(host => {
            const hostProgress = getHostProgress(host.id);
            const isActive = activeHostTab === host.id;
            return (
              <button
                key={host.id}
                onClick={() => setActiveHostTab(host.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-xl">{host.avatar}</span>
                <span className="hidden sm:inline">{host.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  hostProgress.readyCount === hostProgress.total
                    ? 'bg-green-500/20 text-green-400'
                    : hostProgress.readyCount > 0
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {hostProgress.readyCount}/{hostProgress.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Summary for Active Host */}
      <div className="mb-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="text-lg">{WW2_HOSTS.find(h => h.id === activeHostTab)?.avatar}</span>
            {WW2_HOSTS.find(h => h.id === activeHostTab)?.name} Videos
          </span>
          <span className="text-sm text-muted-foreground">
            {activeHostProgress.readyCount}/{activeHostProgress.total} questions
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(activeHostProgress.readyCount / activeHostProgress.total) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Ready: {activeHostProgress.readyCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Wrong Duration: {activeHostProgress.wrongDurationCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Missing: {activeHostProgress.missingCount}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionVideos.map((question) => (
          <QuestionVideoCard
            key={question.questionId}
            question={question}
            activeHost={activeHostTab}
            getDifficultyColor={getDifficultyColor}
            getStatusIcon={getStatusIcon}
            getStatusText={getStatusText}
            onUpload={() => {
              setSelectedQuestion(question.questionId);
              setSelectedHost(activeHostTab);
              setIsMediaPickerOpen(true);
            }}
            onRemove={() => handleRemoveVideo(question.questionId, activeHostTab)}
            onPreview={() => setPreviewVideoId(question.questionId)}
            isPreviewOpen={previewVideoId === question.questionId}
            onClosePreview={() => setPreviewVideoId(null)}
          />
        ))}
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setSelectedQuestion(null);
        }}
        onSelect={handleSelectVideo}
        allowedTypes={['video']}
        title={`Select Video for Q${questionVideos.find(q => q.questionId === selectedQuestion)?.questionNumber || ''} - ${WW2_HOSTS.find(h => h.id === selectedHost)?.name || ''}`}
      />
    </div>
  );
}

interface QuestionVideoCardProps {
  question: QuestionVideoState;
  activeHost: HostId;
  getDifficultyColor: (difficulty: 'easy' | 'medium' | 'hard') => string;
  getStatusIcon: (status: VideoStatus) => React.ReactNode;
  getStatusText: (status: VideoStatus) => string;
  onUpload: () => void;
  onRemove: () => void;
  onPreview: () => void;
  isPreviewOpen: boolean;
  onClosePreview: () => void;
}

function QuestionVideoCard({
  question,
  activeHost,
  getDifficultyColor,
  getStatusIcon,
  getStatusText,
  onUpload,
  onRemove,
  onPreview,
  isPreviewOpen,
  onClosePreview,
}: QuestionVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get video and status for the active host
  const video = question.hostVideos[activeHost];
  const status = question.hostStatuses[activeHost];

  // Count how many hosts have videos for this question
  const hostVideoCount = WW2_HOSTS.filter(h => question.hostVideos[h.id]).length;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Video Preview / Upload Area */}
      <div className="relative aspect-video bg-muted">
        {video ? (
          <>
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg">
                {isPlaying ? (
                  <Pause size={20} className="text-gray-900" />
                ) : (
                  <Play size={20} className="text-gray-900 ml-0.5" />
                )}
              </div>
            </button>
            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                {video.duration.toFixed(1)}s
              </div>
            )}
          </>
        ) : (
          <button
            onClick={onUpload}
            className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Video size={32} className="mb-2 opacity-50" />
            <span className="text-sm font-medium">Add Video</span>
          </button>
        )}

        {/* Host video indicator */}
        <div className="absolute top-2 left-2 flex gap-1">
          {WW2_HOSTS.map(host => (
            <div
              key={host.id}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                question.hostVideos[host.id]
                  ? host.id === activeHost
                    ? `${host.color} text-white ring-2 ring-white`
                    : `${host.color} text-white opacity-60`
                  : 'bg-black/50 text-white/50'
              }`}
              title={`${host.name}: ${question.hostVideos[host.id] ? 'Has video' : 'No video'}`}
            >
              {host.avatar}
            </div>
          ))}
        </div>
      </div>

      {/* Question Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-foreground">Q{question.questionNumber}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="flex items-center gap-1 ml-auto text-xs">
            {getStatusIcon(status)}
            <span className={
              status === 'ready' ? 'text-green-400' :
              status === 'wrong-duration' ? 'text-amber-400' :
              'text-red-400'
            }>
              {getStatusText(status)}
            </span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {question.prompt}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onUpload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload size={16} />
            {video ? 'Replace' : 'Upload'}
          </button>
          {video && (
            <button
              onClick={onRemove}
              className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Remove video"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ExamVideoManager;
