/**
 * ExamVideoManager - Admin interface for managing exam question videos
 * Allows uploading 10-second video clips for each of the 15 exam questions
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Trash2, Play, Pause, Check, AlertCircle, Clock, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import { FINAL_EXAM_QUESTIONS } from '../journey/pearl-harbor/exam/examQuestions';
import {
  subscribeToWW2ModuleAssets,
  updateExamQuestionVideo,
  type ExamQuestionVideo,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

type VideoStatus = 'missing' | 'ready' | 'wrong-duration';

interface QuestionVideoState {
  questionId: string;
  questionNumber: number;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  video: ExamQuestionVideo | null;
  status: VideoStatus;
}

export function ExamVideoManager() {
  const [questionVideos, setQuestionVideos] = useState<QuestionVideoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const examVideos = assets?.examQuestionVideos || {};

      const states: QuestionVideoState[] = FINAL_EXAM_QUESTIONS.map((q) => {
        const video = examVideos[q.id] || null;
        let status: VideoStatus = 'missing';

        if (video) {
          if (video.duration !== undefined && (video.duration < 8 || video.duration > 12)) {
            status = 'wrong-duration';
          } else {
            status = 'ready';
          }
        }

        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          prompt: q.prompt,
          difficulty: q.difficulty,
          video,
          status,
        };
      });

      setQuestionVideos(states);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectVideo = async (file: MediaFile) => {
    if (!selectedQuestion) return;

    // Create video element to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = async () => {
      const duration = video.duration;

      const videoData: ExamQuestionVideo = {
        questionId: selectedQuestion,
        videoUrl: file.url,
        duration,
      };

      const success = await updateExamQuestionVideo(selectedQuestion, videoData);

      if (success) {
        toast.success('Video assigned to question');

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
        videoUrl: file.url,
      };

      const success = await updateExamQuestionVideo(selectedQuestion, videoData);

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

  const handleRemoveVideo = async (questionId: string) => {
    const success = await updateExamQuestionVideo(questionId, null);

    if (success) {
      toast.success('Video removed');
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

  const readyCount = questionVideos.filter(q => q.status === 'ready').length;
  const totalCount = questionVideos.length;

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
        <h1 className="text-2xl font-bold text-foreground mb-2">Exam Video Manager</h1>
        <p className="text-muted-foreground">
          Upload 10-second video clips for each of the 15 final exam questions.
          These videos play during the game show countdown timer.
        </p>
      </div>

      {/* Progress Summary */}
      <div className="mb-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Video Coverage</span>
          <span className="text-sm text-muted-foreground">{readyCount}/{totalCount} questions</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(readyCount / totalCount) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Ready: {questionVideos.filter(q => q.status === 'ready').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Wrong Duration: {questionVideos.filter(q => q.status === 'wrong-duration').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Missing: {questionVideos.filter(q => q.status === 'missing').length}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionVideos.map((question) => (
          <QuestionVideoCard
            key={question.questionId}
            question={question}
            getDifficultyColor={getDifficultyColor}
            getStatusIcon={getStatusIcon}
            getStatusText={getStatusText}
            onUpload={() => {
              setSelectedQuestion(question.questionId);
              setIsMediaPickerOpen(true);
            }}
            onRemove={() => handleRemoveVideo(question.questionId)}
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
        title={`Select Video for Q${questionVideos.find(q => q.questionId === selectedQuestion)?.questionNumber || ''}`}
      />
    </div>
  );
}

interface QuestionVideoCardProps {
  question: QuestionVideoState;
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
        {question.video ? (
          <>
            <video
              ref={videoRef}
              src={question.video.videoUrl}
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
            {question.video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                {question.video.duration.toFixed(1)}s
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
      </div>

      {/* Question Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-foreground">Q{question.questionNumber}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="flex items-center gap-1 ml-auto text-xs">
            {getStatusIcon(question.status)}
            <span className={
              question.status === 'ready' ? 'text-green-400' :
              question.status === 'wrong-duration' ? 'text-amber-400' :
              'text-red-400'
            }>
              {getStatusText(question.status)}
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
            {question.video ? 'Replace' : 'Upload'}
          </button>
          {question.video && (
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
