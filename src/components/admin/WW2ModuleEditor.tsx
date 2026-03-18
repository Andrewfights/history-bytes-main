/**
 * WW2ModuleEditor - Comprehensive admin view of the WW2 module
 * Shows all beats, questions, flows, and media in user progression order
 * Includes preview functionality for testing beats as admin
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Star,
  Trophy,
  Crown,
  Target,
  BookOpen,
  Swords,
  CheckCircle2,
  Play,
  Image as ImageIcon,
  Video,
  Upload,
  HelpCircle,
  MessageSquare,
  Layers,
  FileQuestion,
  Users,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { PEARL_HARBOR_LESSONS, TOTAL_XP, FINAL_EXAM_SCORING } from '@/data/pearlHarborLessons';
import { ARENA_QUESTIONS, ARENA_TIERS, RECOGNITION_TIERS } from '@/data/arenaQuestions';
import { FINAL_EXAM_QUESTIONS } from '@/components/journey/pearl-harbor/exam/examQuestions';
import { WW2_HOSTS } from '@/data/ww2Hosts';
import type { WW2Host } from '@/types';

// Import beat components for preview
import {
  RoadToWarBeat,
  RadarBlipBeat,
  ToraToraToraBeat,
  VoicesFromHarborBeat,
  BreakingNewsBeat,
  NagumoDilemmaBeat,
  FactOrMythBeat,
  DayOfInfamyBeat,
  ArsenalDemocracyBeat,
  MasteryRunBeat,
  FinalExamBeat,
} from '@/components/journey/pearl-harbor/beats';
import { PearlHarborArena } from '@/components/journey/pearl-harbor/arena';

// ============================================================
// BEAT CONTENT DATA - All questions, statements, and flows
// ============================================================

interface BeatQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  category?: string;
}

interface BeatStatement {
  id: string;
  statement: string;
  isFact: boolean;
  explanation: string;
}

interface BeatHotspot {
  id: string;
  label: string;
  description: string;
}

interface BeatContent {
  screens: string[];
  questions?: BeatQuestion[];
  statements?: BeatStatement[];
  hotspots?: BeatHotspot[];
  mediaNeeded?: {
    type: 'image' | 'video' | 'audio';
    description: string;
    path?: string;
  }[];
}

// Beat 1: Road to War - Data
const BEAT_1_CONTENT: BeatContent = {
  screens: ['intro', 'map-explore', 'timed-challenge', 'reveal', 'completion'],
  hotspots: [
    { id: 'isolationism', label: 'American Isolationism', description: '88% of Americans opposed war in January 1940' },
    { id: 'japan-resources', label: "Japan's Resource Crisis", description: 'Over 80% of Japan\'s oil came from the U.S.' },
    { id: 'diplomatic-escalation', label: 'Diplomatic Escalation', description: 'Oil embargo and Hull Note ultimatum' },
  ],
  questions: [
    { id: 'q1', question: "What percentage of Japan's oil came from the United States?", options: ['About 40%', 'About 60%', 'Over 80%', 'Nearly 100%'], correctAnswer: 'Over 80%', explanation: 'Japan depended on the U.S. for over 80% of its oil supply.', category: 'Resources' },
    { id: 'q2', question: 'In January 1940, what percentage of Americans opposed declaring war?', options: ['52%', '68%', '78%', '88%'], correctAnswer: '88%', explanation: '88% of Americans opposed war in early 1940.', category: 'Isolationism' },
    { id: 'q3', question: 'How many members did the America First Committee have?', options: ['100,000', '400,000', '800,000+', '2 million'], correctAnswer: '800,000+', explanation: 'The America First Committee had over 800,000 members.', category: 'Isolationism' },
    { id: 'q4', question: 'What did the Hull Note (November 26, 1941) demand?', options: ['A peace treaty with China', 'Complete Japanese withdrawal from China', 'Limits on the Japanese Navy', 'Return of Pacific islands'], correctAnswer: 'Complete Japanese withdrawal from China', explanation: 'The Hull Note demanded complete Japanese withdrawal from China.', category: 'Diplomacy' },
    { id: 'q5', question: 'When did the U.S. freeze Japanese assets?', options: ['January 1941', 'July 26, 1941', 'November 1941', 'December 1, 1941'], correctAnswer: 'July 26, 1941', explanation: 'The asset freeze on July 26, 1941 was a turning point.', category: 'Diplomacy' },
  ],
  mediaNeeded: [
    { type: 'image', description: '1941 World Map with hotspot regions', path: '/assets/pearl-harbor/world-map-1941.jpg' },
  ],
};

// Beat 2: Radar Blip
const BEAT_2_CONTENT: BeatContent = {
  screens: ['intro', 'radar-detect', 'decision-point', 'phone-call', 'reveal', 'completion'],
  questions: [],
  mediaNeeded: [],
};

// Beat 3: Tora Tora Tora
const BEAT_3_CONTENT: BeatContent = {
  screens: ['intro', 'first-wave', 'attack-map', 'second-wave', 'completion'],
  questions: [],
  mediaNeeded: [
    { type: 'image', description: 'Pearl Harbor aerial map showing attack routes' },
    { type: 'audio', description: 'Period-accurate attack sounds (optional)' },
  ],
};

// Beat 4: Voices from the Harbor
const BEAT_4_CONTENT: BeatContent = {
  screens: ['intro', 'stratton', 'miller', 'fox', 'abe', 'reflection', 'completion'],
  questions: [],
  mediaNeeded: [
    { type: 'image', description: 'Donald Stratton portrait' },
    { type: 'image', description: 'Doris Miller portrait' },
    { type: 'image', description: 'Annie Fox portrait' },
    { type: 'image', description: 'Zenji Abe portrait' },
  ],
};

// Beat 5: Breaking News
const BEAT_5_CONTENT: BeatContent = {
  screens: ['intro', 'radio-broadcast', 'newspaper-front', 'drag-order', 'completion'],
  questions: [],
  mediaNeeded: [
    { type: 'audio', description: 'CBS radio broadcast clip (optional)' },
    { type: 'audio', description: 'NBC radio broadcast clip (optional)' },
    { type: 'image', description: 'New York Times front page facsimile' },
  ],
};

// Beat 6: Nagumo's Dilemma
const BEAT_6_CONTENT: BeatContent = {
  screens: ['intro', 'situation', 'decision', 'consequences', 'what-if', 'completion'],
  questions: [],
  mediaNeeded: [],
};

// Beat 7: Fact or Myth
const BEAT_7_CONTENT: BeatContent = {
  screens: ['intro', 'swipe-quiz', 'completion'],
  statements: [
    { id: 'warning', statement: 'The United States had absolutely no warning before the attack.', isFact: false, explanation: 'The U.S. had broken Japan\'s diplomatic "Purple" code and radar detected the planes 53 minutes before.' },
    { id: 'kgmb-radio', statement: 'Japanese pilots used Hawaiian radio station KGMB to navigate to Oahu.', isFact: true, explanation: 'Commander Fuchida confirmed that pilots tuned to KGMB\'s signal to home in on Oahu.' },
    { id: 'carriers-targeted', statement: 'The Japanese specifically targeted American aircraft carriers.', isFact: false, explanation: 'Japanese naval doctrine prioritized battleships. Carriers were secondary targets.' },
    { id: 'fdr-conspiracy', statement: 'President Roosevelt knew the attack was coming and let it happen.', isFact: false, explanation: 'This conspiracy theory has been thoroughly debunked by historians.' },
    { id: 'planes-parked', statement: 'American planes were parked wingtip-to-wingtip as an anti-sabotage measure.', isFact: true, explanation: 'Planes were grouped together to make them easier to guard against sabotage.' },
    { id: 'arizona-bomb', statement: 'A single 1,760-pound bomb destroyed the USS Arizona.', isFact: true, explanation: 'A modified 16-inch naval shell penetrated the deck and ignited the ammunition magazines.' },
    { id: 'nevada-grounded', statement: 'The USS Nevada was intentionally run aground to prevent blocking the harbor.', isFact: true, explanation: 'When it became clear she might sink in the channel, she was deliberately beached.' },
    { id: 'japan-aggression', statement: 'Japan attacked Pearl Harbor purely out of military aggression.', isFact: false, explanation: 'The attack was largely a response to the U.S. oil embargo.' },
  ],
  mediaNeeded: [],
};

// Beat 8: Day of Infamy
const BEAT_8_CONTENT: BeatContent = {
  screens: ['intro', 'speech-audio', 'word-choice', 'drag-order', 'impact', 'completion'],
  questions: [],
  mediaNeeded: [
    { type: 'audio', description: 'FDR "Day of Infamy" speech audio (optional)' },
  ],
};

// Beat 9: Arsenal of Democracy
const BEAT_9_CONTENT: BeatContent = {
  screens: ['intro', 'mobilization', 'production-stats', 'timed-challenge', 'completion'],
  questions: [
    { id: 'q1', question: 'By 1944, what percentage of world munitions did the US produce?', options: ['20%', '30%', '40%', '50%'], correctAnswer: '40%', explanation: 'The US produced approximately 40% of world munitions by 1944.', category: 'Production' },
    { id: 'q2', question: 'How many aircraft did the US produce in 1944?', options: ['50,000', '74,000', '96,000', '120,000'], correctAnswer: '96,000', explanation: 'American factories produced 96,000 aircraft in 1944 alone.', category: 'Production' },
  ],
  mediaNeeded: [],
};

// Beat 10: Mastery Run
const BEAT_10_CONTENT: BeatContent = {
  screens: ['intro', 'quiz', 'results', 'completion'],
  questions: [
    { id: 'q1', question: "What percentage of Japan's oil came from the United States?", correctAnswer: 'Over 80%', explanation: 'Japan depended on the U.S. for over 80% of its oil supply.', category: 'Geopolitical' },
    { id: 'q2', question: 'How many minutes before the attack did radar detect incoming planes?', correctAnswer: '53 minutes', explanation: 'Radar detected the planes at 7:02 AM, 53 minutes before the attack.', category: 'Radar' },
    { id: 'q3', question: 'How many aircraft were in the first wave?', correctAnswer: '183', explanation: 'The first wave consisted of 183 aircraft.', category: 'Tactical' },
    { id: 'q4', question: 'Who was the first African American to receive the Navy Cross?', correctAnswer: 'Doris Miller', explanation: 'Doris Miller received the Navy Cross for his heroic actions.', category: 'Human' },
    { id: 'q5', question: 'What percentage of Americans approved declaring war on December 8?', correctAnswer: '97%', explanation: 'After Pearl Harbor, 97% approved the war declaration.', category: 'Opinion' },
    { id: 'q6', question: "How many barrels of fuel were in Pearl Harbor's exposed tanks?", correctAnswer: '4.5 million', explanation: 'The exposed fuel tanks held 4.5 million barrels.', category: 'Third Wave' },
    { id: 'q7', question: 'What code did the US break before Pearl Harbor?', correctAnswer: 'Purple diplomatic code', explanation: 'The US broke the Purple diplomatic code (MAGIC).', category: 'Myths' },
    { id: 'q8', question: "What word did FDR change 'world history' to?", correctAnswer: 'Infamy', explanation: 'FDR changed "world history" to "infamy".', category: 'Primary Source' },
    { id: 'q9', question: 'What was the final vote in the House for declaring war?', correctAnswer: '388-1', explanation: 'The House voted 388-1, with Jeannette Rankin the only "no".', category: 'Political' },
    { id: 'q10', question: 'By 1944, what percentage of world munitions did the US produce?', correctAnswer: '40%', explanation: 'The US produced approximately 40% of world munitions.', category: 'Legacy' },
    { id: 'q11', question: 'How many Japanese Americans were relocated to internment camps?', correctAnswer: '120,000', explanation: 'Executive Order 9066 led to internment of 120,000 Japanese Americans.', category: 'Legacy' },
    { id: 'q12', question: 'Which battleship got underway during the attack?', correctAnswer: 'USS Nevada', explanation: 'The USS Nevada was the only battleship to get underway.', category: 'Tactical' },
  ],
  mediaNeeded: [],
};

const BEAT_CONTENT_MAP: Record<string, BeatContent> = {
  'ph-beat-1': BEAT_1_CONTENT,
  'ph-beat-2': BEAT_2_CONTENT,
  'ph-beat-3': BEAT_3_CONTENT,
  'ph-beat-4': BEAT_4_CONTENT,
  'ph-beat-5': BEAT_5_CONTENT,
  'ph-beat-6': BEAT_6_CONTENT,
  'ph-beat-7': BEAT_7_CONTENT,
  'ph-beat-8': BEAT_8_CONTENT,
  'ph-beat-9': BEAT_9_CONTENT,
  'ph-beat-10': BEAT_10_CONTENT,
};

// ============================================================
// PREVIEW MODAL COMPONENT
// ============================================================

interface PreviewModalProps {
  beatType: string | null;
  host: WW2Host;
  onClose: () => void;
}

function PreviewModal({ beatType, host, onClose }: PreviewModalProps) {
  if (!beatType) return null;

  const handleComplete = (xp: number) => {
    console.log(`[Preview] Beat completed with ${xp} XP`);
    onClose();
  };

  const handleSkip = () => {
    console.log('[Preview] Beat skipped');
    onClose();
  };

  const handleBack = () => {
    onClose();
  };

  const handleArenaComplete = (xp: number, tier: any) => {
    console.log(`[Preview] Arena completed: ${tier} with ${xp} XP`);
    onClose();
  };

  const renderBeat = () => {
    switch (beatType) {
      case 'road-to-war':
        return <RoadToWarBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'radar-blip':
        return <RadarBlipBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'tora-tora-tora':
        return <ToraToraToraBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'voices-harbor':
        return <VoicesFromHarborBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'breaking-news':
        return <BreakingNewsBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'nagumo-dilemma':
        return <NagumoDilemmaBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'fact-or-myth':
        return <FactOrMythBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'day-of-infamy':
        return <DayOfInfamyBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'arsenal-democracy':
        return <ArsenalDemocracyBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'mastery-run':
        return <MasteryRunBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'final-exam':
        return <FinalExamBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
      case 'arena':
        return <PearlHarborArena host={host} onComplete={handleArenaComplete} onDecline={handleBack} onBack={handleBack} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60">Preview not available for this beat type</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Close button overlay */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] p-3 bg-black/80 hover:bg-black rounded-full text-white/80 hover:text-white transition-colors shadow-lg"
        title="Exit Preview"
      >
        <X size={24} />
      </button>

      {/* Preview label */}
      <div className="absolute top-4 left-4 z-[60] px-3 py-1.5 bg-amber-500 text-black text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
        <Eye size={16} />
        PREVIEW MODE
      </div>

      {/* Beat content */}
      <div className="h-full">
        {renderBeat()}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

function ScreenFlowVisualizer({ screens }: { screens: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {screens.map((screen, idx) => (
        <div key={screen} className="flex items-center">
          <div className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
            {screen}
          </div>
          {idx < screens.length - 1 && (
            <ChevronRight size={14} className="text-slate-500 mx-0.5" />
          )}
        </div>
      ))}
    </div>
  );
}

function QuestionList({ questions, title }: { questions: BeatQuestion[]; title?: string }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <FileQuestion size={14} />
        {title || `Questions (${questions.length})`}
      </h4>
      <div className="space-y-2">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm mb-2">{q.question}</p>
                {q.options && (
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`text-xs px-2 py-1 rounded ${
                          opt === q.correctAnswer
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-slate-400 text-xs">{q.explanation}</p>
                {q.category && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded">
                    {q.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatementList({ statements }: { statements: BeatStatement[] }) {
  if (!statements || statements.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <HelpCircle size={14} />
        Fact or Myth Statements ({statements.length})
      </h4>
      <div className="space-y-2">
        {statements.map((s, idx) => (
          <div key={s.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-start gap-2">
              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                s.isFact ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {s.isFact ? 'F' : 'M'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm mb-1">{s.statement}</p>
                <p className="text-slate-400 text-xs">{s.explanation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HotspotList({ hotspots }: { hotspots: BeatHotspot[] }) {
  if (!hotspots || hotspots.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <Target size={14} />
        Map Hotspots ({hotspots.length})
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {hotspots.map((h) => (
          <div key={h.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-white text-sm font-medium mb-1">{h.label}</p>
            <p className="text-slate-400 text-xs">{h.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaUploadSection({ mediaNeeded }: { mediaNeeded?: BeatContent['mediaNeeded'] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!mediaNeeded || mediaNeeded.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-700">
        <p className="text-slate-500 text-sm text-center">No media assets required for this beat</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <ImageIcon size={14} />
        Media Assets Needed ({mediaNeeded.length})
      </h4>
      <div className="space-y-2">
        {mediaNeeded.map((media, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  media.type === 'image' ? 'bg-blue-500/20' :
                  media.type === 'video' ? 'bg-purple-500/20' :
                  'bg-green-500/20'
                }`}>
                  {media.type === 'image' && <ImageIcon size={20} className="text-blue-400" />}
                  {media.type === 'video' && <Video size={20} className="text-purple-400" />}
                  {media.type === 'audio' && <Play size={20} className="text-green-400" />}
                </div>
                <div>
                  <p className="text-white text-sm">{media.description}</p>
                  {media.path && (
                    <p className="text-slate-500 text-xs font-mono">{media.path}</p>
                  )}
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors">
                <Upload size={14} />
                Upload
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamQuestionsList() {
  return (
    <div className="space-y-4">
      {/* Easy Tier */}
      <div>
        <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-xs">E</span>
          Easy Tier (Questions 1-5)
        </h4>
        <div className="space-y-2">
          {FINAL_EXAM_QUESTIONS.filter(q => q.difficulty === 'easy').map((q) => (
            <div key={q.id} className="bg-slate-800/50 rounded-lg p-3 border border-green-500/20">
              <p className="text-white text-sm mb-1">
                <span className="text-green-400 font-mono mr-2">Q{q.questionNumber}.</span>
                {q.prompt}
              </p>
              <p className="text-slate-400 text-xs">{q.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medium Tier */}
      <div>
        <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-xs">M</span>
          Medium Tier (Questions 6-10)
        </h4>
        <div className="space-y-2">
          {FINAL_EXAM_QUESTIONS.filter(q => q.difficulty === 'medium').map((q) => (
            <div key={q.id} className="bg-slate-800/50 rounded-lg p-3 border border-amber-500/20">
              <p className="text-white text-sm mb-1">
                <span className="text-amber-400 font-mono mr-2">Q{q.questionNumber}.</span>
                {q.prompt}
              </p>
              <p className="text-slate-400 text-xs">{q.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hard Tier */}
      <div>
        <h4 className="text-red-400 text-sm font-medium mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-xs">H</span>
          Hard Tier (Questions 11-15)
        </h4>
        <div className="space-y-2">
          {FINAL_EXAM_QUESTIONS.filter(q => q.difficulty === 'hard').map((q) => (
            <div key={q.id} className="bg-slate-800/50 rounded-lg p-3 border border-red-500/20">
              <p className="text-white text-sm mb-1">
                <span className="text-red-400 font-mono mr-2">Q{q.questionNumber}.</span>
                {q.prompt}
              </p>
              <p className="text-slate-400 text-xs">{q.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArenaQuestionsList() {
  return (
    <div className="space-y-4">
      {ARENA_TIERS.map((tier) => {
        const tierQuestions = ARENA_QUESTIONS.filter(q => q.tier === tier.tier);
        const colorClass = tier.tier === 'hard' ? 'amber' : tier.tier === 'harder' ? 'orange' : 'red';

        return (
          <div key={tier.tier}>
            <h4 className={`text-${colorClass}-400 text-sm font-medium mb-2 flex items-center gap-2`}>
              <span className={`w-6 h-6 rounded bg-${colorClass}-500/20 flex items-center justify-center text-xs`}>
                {tier.label[0]}
              </span>
              {tier.label} Tier (Questions {tier.questions[0]}-{tier.questions[tier.questions.length - 1]})
              {tier.checkpointAfter && (
                <span className="text-green-400 text-[10px] flex items-center gap-1">
                  <CheckCircle2 size={10} /> Checkpoint
                </span>
              )}
            </h4>
            <div className="space-y-2">
              {tierQuestions.map((q) => (
                <div key={q.id} className={`bg-slate-800/50 rounded-lg p-3 border border-${colorClass}-500/20`}>
                  <p className="text-white text-sm mb-1">
                    <span className={`text-${colorClass}-400 font-mono mr-2`}>Q{q.questionNumber}.</span>
                    {q.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-xs">{q.topic}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-xs">{q.format.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BeatCard({
  lesson,
  index,
  isExpanded,
  onToggle,
  onPreview,
}: {
  lesson: typeof PEARL_HARBOR_LESSONS[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onPreview: (beatType: string) => void;
}) {
  const content = BEAT_CONTENT_MAP[lesson.id];
  const isExam = lesson.type === 'final-exam';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl border overflow-hidden ${
        isExam
          ? 'bg-slate-800/50 border-blue-500/30'
          : 'bg-slate-800/50 border-slate-700'
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
          isExam ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-700'
        }`}>
          {lesson.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-medium">Beat {lesson.number}</span>
            {isExam && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded">
                Exam
              </span>
            )}
          </div>
          <h3 className="text-white font-bold truncate">{lesson.title}</h3>
          <p className="text-slate-400 text-sm truncate">{lesson.subtitle}</p>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-400">
            <Layers size={14} />
            <span>{content?.screens?.length || lesson.screens} screens</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={14} />
            <span>{lesson.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={14} />
            <span>{lesson.xpReward} XP</span>
          </div>
        </div>

        {/* Preview button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(lesson.type);
          }}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Eye size={14} />
          Preview
        </button>

        <div className="text-slate-400">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-700/50 space-y-4">
              {/* Description */}
              <p className="text-slate-300 text-sm">{lesson.description}</p>

              {/* Mobile stats */}
              <div className="flex md:hidden items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-slate-400">
                  <Layers size={14} />
                  <span>{content?.screens?.length || lesson.screens} screens</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={14} />
                  <span>{lesson.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} />
                  <span>{lesson.xpReward} XP</span>
                </div>
              </div>

              {/* Formats */}
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2">Interactive Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {lesson.formats.map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs rounded"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screen Flow */}
              {content?.screens && (
                <div>
                  <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Play size={14} />
                    Screen Flow
                  </h4>
                  <ScreenFlowVisualizer screens={content.screens} />
                </div>
              )}

              {/* Content Sections */}
              {content?.hotspots && <HotspotList hotspots={content.hotspots} />}
              {content?.questions && content.questions.length > 0 && <QuestionList questions={content.questions} />}
              {content?.statements && <StatementList statements={content.statements} />}

              {/* Final Exam Questions */}
              {isExam && <ExamQuestionsList />}

              {/* Media Upload */}
              <MediaUploadSection mediaNeeded={content?.mediaNeeded} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ArenaCard({
  isExpanded,
  onToggle,
  onPreview,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  onPreview: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-amber-500/30"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center">
          <Crown size={24} className="text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded">
              Elite
            </span>
          </div>
          <h3 className="text-white font-bold">The Arena</h3>
          <p className="text-slate-400 text-sm">Elite Challenge - Risk it all for Rhodes Scholar</p>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-400">
            <FileQuestion size={14} />
            <span>{ARENA_QUESTIONS.length} questions</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={14} />
            <span>Up to 1000 XP</span>
          </div>
        </div>

        {/* Preview button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Eye size={14} />
          Preview
        </button>

        <div className="text-slate-400">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-amber-500/20 space-y-4">
              {/* Mechanics */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Swords size={16} className="text-amber-400" />
                  Arena Mechanics
                </h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong>Two-Strike Rule:</strong> 2 wrong answers = reset to zero</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong>Cash-Out Checkpoints:</strong> After Q5 and Q10</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong>Risk/Reward:</strong> Continue for higher tier or bank progress</span>
                  </li>
                </ul>
              </div>

              {/* Recognition Tiers */}
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2">Recognition Tiers</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(RECOGNITION_TIERS).map(([key, tier]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{tier.icon}</div>
                      <div className="text-white font-medium text-sm">{tier.label}</div>
                      {tier.xpBonus > 0 && (
                        <div className="text-amber-400 text-xs">+{tier.xpBonus} XP</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arena Questions */}
              <ArenaQuestionsList />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WW2ModuleEditor() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [previewBeat, setPreviewBeat] = useState<string | null>(null);

  // Get the first host as the preview host
  const previewHost = WW2_HOSTS[0];

  const handlePreview = (beatType: string) => {
    setPreviewBeat(beatType);
  };

  const closePreview = () => {
    setPreviewBeat(null);
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = [...PEARL_HARBOR_LESSONS.map(l => l.id), 'arena'];
    setExpandedSections(new Set(allIds));
    setShowAll(true);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
    setShowAll(false);
  };

  // Calculate totals
  const totalQuestions =
    BEAT_10_CONTENT.questions!.length + // Mastery Run
    FINAL_EXAM_QUESTIONS.length + // Final Exam
    ARENA_QUESTIONS.length + // Arena
    (BEAT_1_CONTENT.questions?.length || 0) + // Beat 1
    (BEAT_7_CONTENT.statements?.length || 0); // Beat 7 statements

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center">
            <Target size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">WW2 Module Editor</h1>
            <p className="text-slate-400">Pearl Harbor Learning Journey - Complete Content View</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-6 mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Beats</div>
            <div className="text-2xl font-bold text-white">{PEARL_HARBOR_LESSONS.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Questions</div>
            <div className="text-2xl font-bold text-white">{totalQuestions}+</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Base XP</div>
            <div className="text-2xl font-bold text-amber-400">{TOTAL_XP}</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Max XP (with Arena)</div>
            <div className="text-2xl font-bold text-amber-400">{TOTAL_XP + 1000}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen size={20} className="text-slate-400" />
          User Progression Order
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={showAll ? collapseAll : expandAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 rounded-lg transition-colors"
          >
            {showAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {PEARL_HARBOR_LESSONS.map((lesson, index) => (
          <BeatCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            isExpanded={expandedSections.has(lesson.id)}
            onToggle={() => toggleSection(lesson.id)}
            onPreview={handlePreview}
          />
        ))}

        {/* Arena Card */}
        <ArenaCard
          isExpanded={expandedSections.has('arena')}
          onToggle={() => toggleSection('arena')}
          onPreview={() => handlePreview('arena')}
        />
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBeat && (
          <PreviewModal
            beatType={previewBeat}
            host={previewHost}
            onClose={closePreview}
          />
        )}
      </AnimatePresence>

      {/* Footer Summary */}
      <div className="mt-8 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Learning Journey Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Core Lessons</div>
            <div className="text-white font-medium">10 beats</div>
          </div>
          <div>
            <div className="text-slate-500">Final Exam</div>
            <div className="text-white font-medium">15 questions</div>
          </div>
          <div>
            <div className="text-slate-500">Arena</div>
            <div className="text-white font-medium">15 questions</div>
          </div>
          <div>
            <div className="text-slate-500">Total Duration</div>
            <div className="text-white font-medium">~90-120 min</div>
          </div>
          <div>
            <div className="text-slate-500">Media Assets</div>
            <div className="text-white font-medium">8 needed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WW2ModuleEditor;
