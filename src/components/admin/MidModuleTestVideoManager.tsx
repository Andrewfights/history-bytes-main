/**
 * MidModuleTestVideoManager - Admin interface for managing mid-module test videos
 * Similar to ExamVideoManager but for the 5-question mid-module test after Beat 5
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Trash2, Play, Pause, Check, AlertCircle, Save, Edit2, X, Users, Scissors, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import { VideoTrimModal } from './VideoTrimModal';
import {
  subscribeToWW2ModuleAssets,
  updateMidModuleTestVideo,
  updateMidModuleTestQuestions,
  type MidModuleTestVideo,
  type MidModuleTestHostVideos,
  type MidModuleTestQuestion,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

// WW2 Hosts configuration
const WW2_HOSTS = [
  { id: 'sergeant', name: 'Sergeant Mitchell', avatar: '🪖', color: 'bg-green-700' },
  { id: 'journalist', name: 'War Correspondent', avatar: '📰', color: 'bg-amber-500' },
  { id: 'codebreaker', name: 'Code Breaker', avatar: '🔬', color: 'bg-slate-600' },
] as const;

type HostId = typeof WW2_HOSTS[number]['id'];
type VideoStatus = 'missing' | 'ready';

// Default questions
const DEFAULT_QUESTIONS: MidModuleTestQuestion[] = [
  {
    id: 'mmt-q1',
    question: 'How did most Americans first learn about the attack on Pearl Harbor?',
    options: ['Newspapers the next day', 'Radio broadcasts interrupting programs', 'Letters from soldiers', 'Movie theater newsreels'],
    correctIndex: 1,
    explanation: 'Radio networks like CBS, NBC, and MBS interrupted their regular Sunday programming to announce the attack, reaching millions of Americans within minutes.',
    timerDuration: 30,
  },
  {
    id: 'mmt-q2',
    question: 'What made the spread of news about Pearl Harbor unprecedented?',
    options: ['It was the first war ever reported', 'Most Americans had telephones', 'Millions heard it almost instantly via radio', 'It was announced by the military only'],
    correctIndex: 2,
    explanation: 'By 1941, over 30 million American homes had radios. For the first time in history, news of an attack reached the entire nation within hours.',
    timerDuration: 30,
  },
  {
    id: 'mmt-q3',
    question: 'What did radar operators detect on the morning of the attack?',
    options: ['A submarine fleet', 'A small training squadron', 'A large formation of incoming aircraft', 'A weather anomaly'],
    correctIndex: 2,
    explanation: "Privates Lockard and Elliott at Opana Point detected a massive formation of aircraft over 100 miles away, but their warning was dismissed as a scheduled flight of American B-17s.",
    timerDuration: 30,
  },
  {
    id: 'mmt-q4',
    question: 'What key word did Franklin D. Roosevelt add to his speech?',
    options: ['Victory', 'Honor', 'Infamy', 'Freedom'],
    correctIndex: 2,
    explanation: 'FDR personally edited his speech, changing "a date which will live in world history" to "a date which will live in infamy." This single word change made the line iconic.',
    timerDuration: 30,
  },
  {
    id: 'mmt-q5',
    question: "What was the main purpose of Roosevelt's speech to Congress?",
    options: ['To announce a peace agreement', 'To ask Congress to declare war', 'To introduce new military leaders', 'To explain the attack in detail'],
    correctIndex: 1,
    explanation: 'The "Day of Infamy" speech was a formal request for Congress to declare war on Japan. Congress approved the declaration within an hour, with only one dissenting vote.',
    timerDuration: 30,
  },
];

interface QuestionVideoState {
  question: MidModuleTestQuestion;
  hostVideos: Record<HostId, MidModuleTestVideo | null>;
  hostStatuses: Record<HostId, VideoStatus>;
}

export function MidModuleTestVideoManager() {
  const [questions, setQuestions] = useState<MidModuleTestQuestion[]>(DEFAULT_QUESTIONS);
  const [questionVideos, setQuestionVideos] = useState<QuestionVideoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<HostId>('sergeant');
  const [activeHostTab, setActiveHostTab] = useState<HostId>('sergeant');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<MidModuleTestQuestion | null>(null);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  // Trim modal state
  const [trimModalOpen, setTrimModalOpen] = useState(false);
  const [trimVideoData, setTrimVideoData] = useState<{
    questionId: string;
    hostId: HostId;
    video: MidModuleTestVideo;
  } | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const videos = assets?.midModuleTestVideos || {};
      const customQuestions = assets?.midModuleTestQuestions;

      // Use custom questions if available
      const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions : DEFAULT_QUESTIONS;
      setQuestions(activeQuestions);

      // Build question video states
      const states: QuestionVideoState[] = activeQuestions.map((q) => {
        const questionHostVideos = videos[q.id] || {};

        const hostVideos: Record<HostId, MidModuleTestVideo | null> = {
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
          hostStatuses[host.id] = video ? 'ready' : 'missing';
        });

        return {
          question: q,
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

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = async () => {
      const duration = video.duration;

      const videoData: MidModuleTestVideo = {
        questionId: selectedQuestion,
        hostId: selectedHost,
        videoUrl: file.url,
        duration,
      };

      const success = await updateMidModuleTestVideo(selectedQuestion, selectedHost, videoData);

      if (success) {
        const hostName = WW2_HOSTS.find(h => h.id === selectedHost)?.name || selectedHost;
        toast.success(`Video assigned for ${hostName}`);
      } else {
        toast.error('Failed to save video');
      }

      setIsMediaPickerOpen(false);
      setSelectedQuestion(null);
    };

    video.onerror = async () => {
      const videoData: MidModuleTestVideo = {
        questionId: selectedQuestion,
        hostId: selectedHost,
        videoUrl: file.url,
      };

      const success = await updateMidModuleTestVideo(selectedQuestion, selectedHost, videoData);

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
    const success = await updateMidModuleTestVideo(questionId, hostId, null);

    if (success) {
      const hostName = WW2_HOSTS.find(h => h.id === hostId)?.name || hostId;
      toast.success(`Video removed for ${hostName}`);
    } else {
      toast.error('Failed to remove video');
    }
  };

  const handleOpenTrimModal = (questionId: string, hostId: HostId) => {
    const question = questionVideos.find(q => q.question.id === questionId);
    const video = question?.hostVideos[hostId];
    if (!video) return;

    setTrimVideoData({ questionId, hostId, video });
    setTrimModalOpen(true);
  };

  const handleSaveTrim = async (trimStart: number, trimEnd: number) => {
    if (!trimVideoData) return;

    const updatedVideo: MidModuleTestVideo = {
      ...trimVideoData.video,
      trimStart,
      trimEnd,
    };

    const success = await updateMidModuleTestVideo(
      trimVideoData.questionId,
      trimVideoData.hostId,
      updatedVideo
    );

    if (success) {
      toast.success(`Trim saved: ${trimStart.toFixed(1)}s - ${trimEnd.toFixed(1)}s`);
    } else {
      toast.error('Failed to save trim settings');
    }

    setTrimModalOpen(false);
    setTrimVideoData(null);
  };

  const handleSaveQuestion = async (updatedQuestion: MidModuleTestQuestion) => {
    setIsSavingQuestions(true);
    const updatedQuestions = questions.map(q =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );

    const success = await updateMidModuleTestQuestions(updatedQuestions);
    if (success) {
      toast.success('Question saved');
      setEditingQuestion(null);
    } else {
      toast.error('Failed to save question');
    }
    setIsSavingQuestions(false);
  };

  const getHostProgress = (hostId: HostId) => {
    const readyCount = questionVideos.filter(q => q.hostStatuses[hostId] === 'ready').length;
    const missingCount = questionVideos.filter(q => q.hostStatuses[hostId] === 'missing').length;
    return { readyCount, missingCount, total: questionVideos.length };
  };

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
  const activeHostProgress = getHostProgress(activeHostTab);

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
          <h1 className="text-2xl font-bold text-foreground">Knowledge Check Manager</h1>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
            After Beat 5
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <Users size={12} />
            3 Hosts
          </span>
        </div>
        <p className="text-muted-foreground">
          Manage the 5 mid-module test questions. Edit questions, set correct answers, configure timer duration, and upload video clips per host ({totalProgress.totalReady}/{totalProgress.totalVideos} total videos).
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

      {/* Progress Summary */}
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
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Missing: {activeHostProgress.missingCount}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {questionVideos.map((qv, index) => (
          <QuestionVideoCard
            key={qv.question.id}
            questionState={qv}
            questionNumber={index + 1}
            activeHost={activeHostTab}
            onUpload={() => {
              setSelectedQuestion(qv.question.id);
              setSelectedHost(activeHostTab);
              setIsMediaPickerOpen(true);
            }}
            onRemove={() => handleRemoveVideo(qv.question.id, activeHostTab)}
            onTrim={() => handleOpenTrimModal(qv.question.id, activeHostTab)}
            onEditQuestion={() => setEditingQuestion(qv.question)}
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
        title={`Select Video for Q${questionVideos.findIndex(q => q.question.id === selectedQuestion) + 1} - ${WW2_HOSTS.find(h => h.id === selectedHost)?.name || ''}`}
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
          title={`Trim Q${questionVideos.findIndex(q => q.question.id === trimVideoData.questionId) + 1} - ${WW2_HOSTS.find(h => h.id === trimVideoData.hostId)?.name || ''}`}
        />
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(null)}
          isSaving={isSavingQuestions}
        />
      )}
    </div>
  );
}

// Question Video Card Component - Grid style like ExamVideoManager
interface QuestionVideoCardProps {
  questionState: QuestionVideoState;
  questionNumber: number;
  activeHost: HostId;
  onUpload: () => void;
  onRemove: () => void;
  onTrim: () => void;
  onEditQuestion: () => void;
}

function QuestionVideoCard({
  questionState,
  questionNumber,
  activeHost,
  onUpload,
  onRemove,
  onTrim,
  onEditQuestion,
}: QuestionVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const video = questionState.hostVideos[activeHost];
  const status = questionState.hostStatuses[activeHost];
  const { question } = questionState;

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
                questionState.hostVideos[host.id]
                  ? host.id === activeHost
                    ? `${host.color} text-white ring-2 ring-white`
                    : `${host.color} text-white opacity-60`
                  : 'bg-black/50 text-white/50'
              }`}
              title={`${host.name}: ${questionState.hostVideos[host.id] ? 'Has video' : 'No video'}`}
            >
              {host.avatar}
            </div>
          ))}
        </div>

        {/* Timer badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-amber-500/80 text-white text-xs font-medium flex items-center gap-1">
          <Clock size={12} />
          {question.timerDuration || 30}s
        </div>
      </div>

      {/* Question Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-foreground text-lg">Q{questionNumber}</span>
          <span className="flex items-center gap-1 ml-auto text-xs">
            {status === 'ready' ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">Ready</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-red-400">Missing</span>
              </>
            )}
          </span>
        </div>

        {/* Question text */}
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {question.question}
        </p>

        {/* Answer options */}
        <div className="space-y-1 mb-3">
          {question.options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                idx === question.correctIndex
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="truncate">{opt}</span>
              {idx === question.correctIndex && (
                <Check size={12} className="ml-auto shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onUpload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload size={16} />
            {video ? 'Replace' : 'Upload'}
          </button>
          <button
            onClick={onEditQuestion}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
            title="Edit question"
          >
            <Edit2 size={16} />
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

// Question Edit Modal
interface QuestionEditModalProps {
  question: MidModuleTestQuestion;
  onSave: (question: MidModuleTestQuestion) => void;
  onClose: () => void;
  isSaving: boolean;
}

function QuestionEditModal({ question, onSave, onClose, isSaving }: QuestionEditModalProps) {
  const [editedQuestion, setEditedQuestion] = useState<MidModuleTestQuestion>({ ...question });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Edit Question</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Question</label>
            <textarea
              value={editedQuestion.question}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground resize-none"
              rows={2}
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Options (click letter to set as correct answer)</label>
            <div className="space-y-2">
              {editedQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    onClick={() => setEditedQuestion({ ...editedQuestion, correctIndex: idx })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      idx === editedQuestion.correctIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 p-2 bg-muted border border-border rounded-lg text-foreground"
                  />
                  {idx === editedQuestion.correctIndex && (
                    <span className="text-green-400 text-xs font-medium px-2">CORRECT</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Explanation (shown after answering)</label>
            <textarea
              value={editedQuestion.explanation}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground resize-none"
              rows={3}
            />
          </div>

          {/* Timer Duration */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              Timer Duration (seconds)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={120}
                value={editedQuestion.timerDuration || 30}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, timerDuration: parseInt(e.target.value) || 30 })}
                className="w-24 p-2 bg-muted border border-border rounded-lg text-foreground"
              />
              <span className="text-sm text-muted-foreground">
                How long students have to answer this question
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {[15, 20, 30, 45, 60].map(sec => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setEditedQuestion({ ...editedQuestion, timerDuration: sec })}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    (editedQuestion.timerDuration || 30) === sec
                      ? 'bg-amber-500 text-black'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedQuestion)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default MidModuleTestVideoManager;
