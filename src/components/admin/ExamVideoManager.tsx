/**
 * ExamVideoManager - Admin interface for managing exam question videos
 * Allows uploading 10-second video clips for each of the 15 exam questions
 * Supports multiple hosts (3 videos per question - one for each host)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Trash2, Play, Pause, Check, AlertCircle, Clock, RefreshCw, X, Users, Scissors, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import { VideoTrimModal } from './VideoTrimModal';
import { ExamQuestionPreview } from './ExamQuestionPreview';
import { FINAL_EXAM_QUESTIONS } from '../journey/pearl-harbor/exam/examQuestions';
import {
  subscribeToWW2ModuleAssets,
  updateExamQuestionVideo,
  updateExamMilestoneVideo,
  type ExamQuestionVideo,
  type ExamQuestionHostVideos,
  type ExamMilestoneVideo,
  type ExamMilestoneType,
  type ExamMilestoneHostVideos,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

// WW2 Hosts configuration for exam videos
// Note: Uses 'sergeant' for the soldier host to match Firestore storage
// In FinalExamBeat, 'soldier' (from host.id) is mapped to 'sergeant' for video lookup
const WW2_HOSTS = [
  { id: 'sergeant', name: 'Sergeant Mitchell', avatar: '🪖', color: 'bg-green-700' },
  { id: 'journalist', name: 'War Correspondent', avatar: '📰', color: 'bg-amber-500' },
  { id: 'codebreaker', name: 'Code Breaker', avatar: '🔬', color: 'bg-slate-600' },
] as const;

type HostId = typeof WW2_HOSTS[number]['id'];
type VideoStatus = 'missing' | 'ready' | 'wrong-duration';

// Milestone video configuration
const EXAM_MILESTONES: { type: ExamMilestoneType; label: string; description: string; icon: string }[] = [
  { type: 'after-q5', label: 'After Question 5', description: 'Transition from Easy to Medium tier', icon: '🔄' },
  { type: 'after-q10', label: 'After Question 10', description: 'Transition from Medium to Hard tier', icon: '🔥' },
  { type: 'completion', label: 'Exam Complete', description: 'Congratulations before showing results', icon: '🎉' },
];

interface MilestoneVideoState {
  milestoneType: ExamMilestoneType;
  label: string;
  description: string;
  icon: string;
  hostVideos: Record<HostId, ExamMilestoneVideo | null>;
  hostStatuses: Record<HostId, VideoStatus>;
}

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
  const [milestoneVideos, setMilestoneVideos] = useState<MilestoneVideoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ExamMilestoneType | null>(null);
  const [selectedHost, setSelectedHost] = useState<HostId>('sergeant');
  const [activeHostTab, setActiveHostTab] = useState<HostId>('sergeant');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isMilestonePickerOpen, setIsMilestonePickerOpen] = useState(false);

  // Trim modal state
  const [trimModalOpen, setTrimModalOpen] = useState(false);
  const [trimVideoData, setTrimVideoData] = useState<{
    type: 'question' | 'milestone';
    questionId?: string;
    milestoneType?: ExamMilestoneType;
    hostId: HostId;
    video: ExamQuestionVideo | ExamMilestoneVideo;
  } | null>(null);

  // Preview modal state
  const [previewQuestion, setPreviewQuestion] = useState<QuestionVideoState | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const examVideos = assets?.examQuestionVideos || {};
      const milestoneVids = assets?.examMilestoneVideos || {};

      // Build question video states
      const states: QuestionVideoState[] = FINAL_EXAM_QUESTIONS.map((q) => {
        const questionHostVideos = examVideos[q.id] || {};

        // Build host videos and statuses for each host
        const hostVideos: Record<HostId, ExamQuestionVideo | null> = {
          sergeant: null,
          journalist: null,
          codebreaker: null,
        };
        const hostStatuses: Record<HostId, VideoStatus> = {
          sergeant: 'missing',
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

      // Build milestone video states
      const milestoneStates: MilestoneVideoState[] = EXAM_MILESTONES.map((m) => {
        const milestoneHostVideos = milestoneVids[m.type] || {};

        const hostVideos: Record<HostId, ExamMilestoneVideo | null> = {
          sergeant: null,
          journalist: null,
          codebreaker: null,
        };
        const hostStatuses: Record<HostId, VideoStatus> = {
          sergeant: 'missing',
          journalist: 'missing',
          codebreaker: 'missing',
        };

        WW2_HOSTS.forEach(host => {
          const video = milestoneHostVideos[host.id] || null;
          hostVideos[host.id] = video as ExamMilestoneVideo | null;

          if (video) {
            hostStatuses[host.id] = 'ready';
          } else {
            hostStatuses[host.id] = 'missing';
          }
        });

        return {
          milestoneType: m.type,
          label: m.label,
          description: m.description,
          icon: m.icon,
          hostVideos,
          hostStatuses,
        };
      });

      setQuestionVideos(states);
      setMilestoneVideos(milestoneStates);
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

  // Handle milestone video selection
  const handleSelectMilestoneVideo = async (file: MediaFile) => {
    if (!selectedMilestone || !selectedHost) return;

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = async () => {
      const duration = video.duration;

      const videoData: ExamMilestoneVideo = {
        milestoneType: selectedMilestone,
        hostId: selectedHost,
        videoUrl: file.url,
        duration,
      };

      const success = await updateExamMilestoneVideo(selectedMilestone, selectedHost, videoData);

      if (success) {
        const hostName = WW2_HOSTS.find(h => h.id === selectedHost)?.name || selectedHost;
        const milestoneLabel = EXAM_MILESTONES.find(m => m.type === selectedMilestone)?.label || selectedMilestone;
        toast.success(`Milestone video assigned for ${hostName} - ${milestoneLabel}`);
      } else {
        toast.error('Failed to save milestone video');
      }

      setIsMilestonePickerOpen(false);
      setSelectedMilestone(null);
    };

    video.onerror = async () => {
      const videoData: ExamMilestoneVideo = {
        milestoneType: selectedMilestone,
        hostId: selectedHost,
        videoUrl: file.url,
      };

      const success = await updateExamMilestoneVideo(selectedMilestone, selectedHost, videoData);

      if (success) {
        toast.success('Milestone video assigned (duration unknown)');
      } else {
        toast.error('Failed to save milestone video');
      }

      setIsMilestonePickerOpen(false);
      setSelectedMilestone(null);
    };

    video.src = file.url;
  };

  const handleRemoveMilestoneVideo = async (milestoneType: ExamMilestoneType, hostId: HostId) => {
    const success = await updateExamMilestoneVideo(milestoneType, hostId, null);

    if (success) {
      const hostName = WW2_HOSTS.find(h => h.id === hostId)?.name || hostId;
      toast.success(`Milestone video removed for ${hostName}`);
    } else {
      toast.error('Failed to remove milestone video');
    }
  };

  // Handle opening trim modal for question videos
  const handleOpenTrimModal = (questionId: string, hostId: HostId) => {
    const question = questionVideos.find(q => q.questionId === questionId);
    const video = question?.hostVideos[hostId];
    if (!video) return;

    setTrimVideoData({
      type: 'question',
      questionId,
      hostId,
      video,
    });
    setTrimModalOpen(true);
  };

  // Handle opening trim modal for milestone videos
  const handleOpenMilestoneTrimModal = (milestoneType: ExamMilestoneType, hostId: HostId) => {
    const milestone = milestoneVideos.find(m => m.milestoneType === milestoneType);
    const video = milestone?.hostVideos[hostId];
    if (!video) return;

    setTrimVideoData({
      type: 'milestone',
      milestoneType,
      hostId,
      video,
    });
    setTrimModalOpen(true);
  };

  // Handle saving trim settings
  const handleSaveTrim = async (trimStart: number, trimEnd: number) => {
    if (!trimVideoData) return;

    if (trimVideoData.type === 'question' && trimVideoData.questionId) {
      const updatedVideo: ExamQuestionVideo = {
        ...(trimVideoData.video as ExamQuestionVideo),
        trimStart,
        trimEnd,
      };

      const success = await updateExamQuestionVideo(
        trimVideoData.questionId,
        trimVideoData.hostId,
        updatedVideo
      );

      if (success) {
        toast.success(`Trim saved: ${trimStart.toFixed(1)}s - ${trimEnd.toFixed(1)}s`);
      } else {
        toast.error('Failed to save trim settings');
      }
    } else if (trimVideoData.type === 'milestone' && trimVideoData.milestoneType) {
      const updatedVideo: ExamMilestoneVideo = {
        ...(trimVideoData.video as ExamMilestoneVideo),
        trimStart,
        trimEnd,
      };

      const success = await updateExamMilestoneVideo(
        trimVideoData.milestoneType,
        trimVideoData.hostId,
        updatedVideo
      );

      if (success) {
        toast.success(`Trim saved: ${trimStart.toFixed(1)}s - ${trimEnd.toFixed(1)}s`);
      } else {
        toast.error('Failed to save trim settings');
      }
    }

    setTrimModalOpen(false);
    setTrimVideoData(null);
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
            onTrim={() => handleOpenTrimModal(question.questionId, activeHostTab)}
            onPreviewExam={() => setPreviewQuestion(question)}
          />
        ))}
      </div>

      {/* Milestone Videos Section */}
      <div className="mt-10 border-t border-border pt-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-foreground">Milestone Videos</h2>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
              Optional
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Transition videos that play between question tiers and after the exam completes.
            Each milestone can have a different video per host.
          </p>
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {milestoneVideos.map((milestone) => (
            <MilestoneVideoCard
              key={milestone.milestoneType}
              milestone={milestone}
              activeHost={activeHostTab}
              onUpload={() => {
                setSelectedMilestone(milestone.milestoneType);
                setSelectedHost(activeHostTab);
                setIsMilestonePickerOpen(true);
              }}
              onRemove={() => handleRemoveMilestoneVideo(milestone.milestoneType, activeHostTab)}
              onTrim={() => handleOpenMilestoneTrimModal(milestone.milestoneType, activeHostTab)}
            />
          ))}
        </div>
      </div>

      {/* Media Picker Modal for Questions */}
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

      {/* Media Picker Modal for Milestones */}
      <MediaPicker
        isOpen={isMilestonePickerOpen}
        onClose={() => {
          setIsMilestonePickerOpen(false);
          setSelectedMilestone(null);
        }}
        onSelect={handleSelectMilestoneVideo}
        allowedTypes={['video']}
        title={`Select Milestone Video - ${EXAM_MILESTONES.find(m => m.type === selectedMilestone)?.label || ''} - ${WW2_HOSTS.find(h => h.id === selectedHost)?.name || ''}`}
      />

      {/* Video Trim Modal */}
      {trimVideoData && (
        <VideoTrimModal
          isOpen={trimModalOpen}
          onClose={() => {
            setTrimModalOpen(false);
            setTrimVideoData(null);
          }}
          videoUrl={trimVideoData.video.videoUrl}
          currentTrimStart={trimVideoData.video.trimStart}
          currentTrimEnd={trimVideoData.video.trimEnd}
          videoDuration={trimVideoData.video.duration}
          onSave={handleSaveTrim}
          title={
            trimVideoData.type === 'question'
              ? `Trim Q${questionVideos.find(q => q.questionId === trimVideoData.questionId)?.questionNumber || ''} - ${WW2_HOSTS.find(h => h.id === trimVideoData.hostId)?.name || ''}`
              : `Trim ${EXAM_MILESTONES.find(m => m.type === trimVideoData.milestoneType)?.label || ''} - ${WW2_HOSTS.find(h => h.id === trimVideoData.hostId)?.name || ''}`
          }
        />
      )}

      {/* Exam Question Preview Modal */}
      {previewQuestion && (
        <ExamQuestionPreview
          isOpen={!!previewQuestion}
          onClose={() => setPreviewQuestion(null)}
          question={{
            questionId: previewQuestion.questionId,
            questionNumber: previewQuestion.questionNumber,
            prompt: previewQuestion.prompt,
            difficulty: previewQuestion.difficulty,
            options: FINAL_EXAM_QUESTIONS.find(q => q.id === previewQuestion.questionId)?.type === 'multiple-choice'
              ? (FINAL_EXAM_QUESTIONS.find(q => q.id === previewQuestion.questionId) as any)?.options
              : undefined,
            category: (FINAL_EXAM_QUESTIONS.find(q => q.id === previewQuestion.questionId) as any)?.category,
            hostDirection: (FINAL_EXAM_QUESTIONS.find(q => q.id === previewQuestion.questionId) as any)?.hostDirection,
          }}
          hostVideos={previewQuestion.hostVideos}
          initialHost={activeHostTab}
        />
      )}
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
  onTrim: () => void;
  onPreviewExam: () => void;
}

function QuestionVideoCard({
  question,
  activeHost,
  getDifficultyColor,
  getStatusIcon,
  getStatusText,
  onUpload,
  onRemove,
  onTrim,
  onPreviewExam,
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
            {/* Duration / Trim info badge */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {video.trimStart !== undefined && video.trimEnd !== undefined ? (
                <div className="px-2 py-1 rounded bg-primary/80 text-white text-xs font-medium">
                  ✂️ {video.trimStart.toFixed(1)}s - {video.trimEnd.toFixed(1)}s
                </div>
              ) : video.duration ? (
                <div className="px-2 py-1 rounded bg-black/70 text-white text-xs">
                  {video.duration.toFixed(1)}s
                </div>
              ) : null}
            </div>
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
          {/* Preview button - shows if any host has a video */}
          {(question.hostVideos.sergeant || question.hostVideos.journalist || question.hostVideos.codebreaker) && (
            <button
              onClick={onPreviewExam}
              className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              title="Preview question as exam"
            >
              <Eye size={16} />
            </button>
          )}
          {video && (
            <>
              <button
                onClick={onTrim}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                title="Trim video to 10 seconds"
              >
                <Scissors size={16} />
              </button>
              <button
                onClick={onRemove}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove video"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Milestone Video Card Component
interface MilestoneVideoCardProps {
  milestone: MilestoneVideoState;
  activeHost: HostId;
  onUpload: () => void;
  onRemove: () => void;
  onTrim: () => void;
}

function MilestoneVideoCard({
  milestone,
  activeHost,
  onUpload,
  onRemove,
  onTrim,
}: MilestoneVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const video = milestone.hostVideos[activeHost];
  const status = milestone.hostStatuses[activeHost];

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
            {/* Duration / Trim info badge */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {video.trimStart !== undefined && video.trimEnd !== undefined ? (
                <div className="px-2 py-1 rounded bg-primary/80 text-white text-xs font-medium">
                  ✂️ {video.trimStart.toFixed(1)}s - {video.trimEnd.toFixed(1)}s
                </div>
              ) : video.duration ? (
                <div className="px-2 py-1 rounded bg-black/70 text-white text-xs">
                  {video.duration.toFixed(1)}s
                </div>
              ) : null}
            </div>
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

        {/* Milestone icon badge */}
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-lg">
          {milestone.icon}
        </div>

        {/* Host video indicator */}
        <div className="absolute top-2 right-2 flex gap-1">
          {WW2_HOSTS.map(host => (
            <div
              key={host.id}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                milestone.hostVideos[host.id]
                  ? host.id === activeHost
                    ? `${host.color} text-white ring-2 ring-white`
                    : `${host.color} text-white opacity-60`
                  : 'bg-black/50 text-white/50'
              }`}
              title={`${host.name}: ${milestone.hostVideos[host.id] ? 'Has video' : 'No video'}`}
            >
              {host.avatar}
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-foreground">{milestone.label}</span>
          <span className="flex items-center gap-1 ml-auto text-xs">
            {status === 'ready' ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">Ready</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Not Set</span>
              </>
            )}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {milestone.description}
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
            <>
              <button
                onClick={onTrim}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                title="Trim video"
              >
                <Scissors size={16} />
              </button>
              <button
                onClick={onRemove}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove video"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ExamVideoManager;
