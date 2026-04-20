/**
 * WW2ModuleEditor - Comprehensive admin view of the WW2 module
 * Shows all beats, questions, flows, and media in user progression order
 * Includes preview functionality for testing beats as admin
 * Supports media upload and question/answer editing
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  EyeOff,
  X,
  Trash2,
  Edit3,
  Save,
  Loader2,
  Check,
  Music,
  Maximize2,
  Minimize2,
  MapPin,
  Archive,
  RotateCcw,
  GripVertical,
} from 'lucide-react';
import { PEARL_HARBOR_LESSONS, TOTAL_XP, FINAL_EXAM_SCORING } from '@/data/pearlHarborLessons';
import { BEAT_1_DEFAULT_IMAGE, BEAT_1_DEFAULT_HOTSPOTS } from '@/data/pearlHarborDefaults';
import { ARENA_QUESTIONS, ARENA_TIERS, RECOGNITION_TIERS } from '@/data/arenaQuestions';
import { FINAL_EXAM_QUESTIONS } from '@/components/journey/pearl-harbor/exam/examQuestions';
import { WW2_HOSTS } from '@/data/ww2Hosts';
import type { WW2Host } from '@/types';
import {
  subscribeToWW2ModuleAssets,
  updateWW2BeatMedia,
  updateWW2BeatQuestions,
  updateWW2BeatStatements,
  updateWW2BeatHotspots,
  updateWW2BeatPreModuleVideo,
  updateWW2BeatPostModuleVideo,
  archiveWW2Beat,
  restoreWW2Beat,
  saveWW2BeatOrder,
  type FirestoreWW2ModuleAssets,
  type WW2BeatQuestion,
  type WW2BeatStatement,
  type WW2BeatHotspot,
  type WW2BeatHotspotConfig,
  type PreModuleVideoConfig,
  type PostModuleVideoConfig,
} from '@/lib/firestore';
import { uploadFile } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase';
import { ImageHotspotEditor } from './ImageHotspotEditor';
import type { ModuleHotspot } from '@/types/moduleTypes';

// Import beat components for preview
import {
  RoadToWarBeat,
  RadarBlipBeat,
  ToraToraToraBeat,
  DamageDoneBeat,
  VoicesFromHarborBeat,
  BreakingNewsBeat,
  MidModuleVideoTestBeat,
  NagumoDilemmaBeat,
  FactOrMythBeat,
  DayOfInfamyBeat,
  EmptyWarChestBeat,
  ArsenalDemocracyBeat,
  MakeItDoBeat,
  LettersHomeBeat,
  ThingsCarriedBeat,
  CodeTalkersBeat,
  MasteryRunBeat,
  FinalExamBeat,
} from '@/components/journey/pearl-harbor/beats';
import { PearlHarborArena } from '@/components/journey/pearl-harbor/arena';
import { TheaterMediaEditor } from './TheaterMediaEditor';

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
  hidden?: boolean;
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
// FINAL EXAM ASSETS
// ============================================================
interface ExamAsset {
  key: string;
  questionNumber: number;
  topic: string;
  type: 'image' | 'audio' | 'video';
  description: string;
}

const FINAL_EXAM_ASSETS: ExamAsset[] = [
  {
    key: 'exam-q3-fdr-speech',
    questionNumber: 3,
    topic: 'FDR "Infamy" Speech',
    type: 'audio',
    description: 'FDR\'s actual "Day of Infamy" speech audio clip',
  },
  {
    key: 'exam-q9-radar-station',
    questionNumber: 9,
    topic: 'Radar Warning Ignored',
    type: 'image',
    description: 'Opana Point radar station photo',
  },
  {
    key: 'exam-q10-newspaper-before',
    questionNumber: 10,
    topic: 'Public Opinion - Before',
    type: 'image',
    description: 'Newspaper headlines showing isolationist sentiment (pre-attack)',
  },
  {
    key: 'exam-q10-newspaper-after',
    questionNumber: 10,
    topic: 'Public Opinion - After',
    type: 'image',
    description: 'Newspaper headlines showing war support (post-attack)',
  },
];

// ============================================================
// ARENA ASSETS
// ============================================================
const ARENA_ASSETS: ExamAsset[] = [
  {
    key: 'arena-q1-harbor-entrance',
    questionNumber: 1,
    topic: 'USS Ward Engagement',
    type: 'image',
    description: 'Pre-dawn harbor entrance illustration with USS Ward silhouette',
  },
  {
    key: 'arena-q2-bomb-plot',
    questionNumber: 2,
    topic: 'Bomb Plot Message',
    type: 'image',
    description: 'Declassified intelligence document with Pearl Harbor grid overlay',
  },
  {
    key: 'arena-q3-red-hill',
    questionNumber: 3,
    topic: 'Red Hill Underground',
    type: 'image',
    description: 'Engineering cross-section of underground fuel tanks',
  },
  {
    key: 'arena-q5-carrier-silhouettes',
    questionNumber: 5,
    topic: 'Carrier Divisions',
    type: 'image',
    description: 'Six carrier silhouettes (Akagi, Kaga, Soryu, Hiryu, Shokaku, Zuikaku)',
  },
  {
    key: 'arena-q7-pacific-map',
    questionNumber: 7,
    topic: 'Kido Butai Route',
    type: 'image',
    description: 'Pacific Ocean map showing route from Hitokappu Bay to Pearl Harbor',
  },
  {
    key: 'arena-q9-radio-static',
    questionNumber: 9,
    topic: 'KGMB Navigation',
    type: 'audio',
    description: 'Vintage radio static with faint Hawaiian music (KGMB recreation)',
  },
  {
    key: 'arena-q10-nisei-soldier',
    questionNumber: 10,
    topic: '442nd Regiment',
    type: 'image',
    description: 'Nisei soldier portrait in uniform with military decorations',
  },
  {
    key: 'arena-q12-battleship-row',
    questionNumber: 12,
    topic: 'Battleship Row F4',
    type: 'image',
    description: 'Mooring diagram showing F1-F6 berths with ship positions',
  },
  {
    key: 'arena-q13-book-cover',
    questionNumber: 13,
    topic: 'Prange/Fuchida Problem',
    type: 'image',
    description: '"At Dawn We Slept" book cover image',
  },
  {
    key: 'arena-q15-logbook',
    questionNumber: 15,
    topic: 'PHNY Logbook',
    type: 'image',
    description: 'Pearl Harbor Navy Yard logbook (weathered document image)',
  },
];

// ============================================================
// PREVIEW MODAL COMPONENT
// ============================================================

interface PreviewModalProps {
  beatType: string | null;
  host: WW2Host;
  onClose: () => void;
}

function PreviewModal({ beatType, host, onClose }: PreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        return <RoadToWarBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'radar-blip':
        return <RadarBlipBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'tora-tora-tora':
        return <ToraToraToraBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'damage-done':
        return <DamageDoneBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'voices-harbor':
        return <VoicesFromHarborBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'breaking-news':
        return <BreakingNewsBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'mid-module-test':
        return <MidModuleVideoTestBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'nagumo-dilemma':
        return <NagumoDilemmaBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'fact-or-myth':
        return <FactOrMythBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'day-of-infamy':
        return <DayOfInfamyBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'empty-war-chest':
        return <EmptyWarChestBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'arsenal-democracy':
        return <ArsenalDemocracyBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'video-montage':
        return <MakeItDoBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'primary-source-audio':
        return <LettersHomeBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'artifact-gallery':
        return <ThingsCarriedBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'audio-vocabulary':
        return <CodeTalkersBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'mastery-run':
        return <MasteryRunBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'final-exam':
        return <FinalExamBeat host={host} onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} isPreview />;
      case 'arena':
        return <PearlHarborArena host={host} onComplete={handleArenaComplete} onDecline={handleBack} onBack={handleBack} />;
      default:
        return (
          <div className="flex items-center justify-center h-full bg-slate-900">
            <p className="text-white/60">Preview not available for this beat type</p>
          </div>
        );
    }
  };

  // Fullscreen mode - same as before but with better z-index control
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        {/* Control bar - always on top */}
        <div className="shrink-0 z-[110] flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="px-3 py-1.5 bg-amber-500 text-black text-sm font-bold rounded-full flex items-center gap-2">
            <Eye size={16} />
            PREVIEW MODE
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              <Minimize2 size={16} />
              Exit Fullscreen
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
              title="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Beat content - flex-1 takes remaining space */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {renderBeat()}
        </div>
      </div>
    );
  }

  // Popup mode - centered modal with phone-like preview
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-[101] w-full max-w-[420px] h-[85vh] max-h-[800px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
      >
        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between p-2 bg-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded flex items-center gap-1.5">
            <Eye size={14} />
            PREVIEW
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded flex items-center gap-1.5 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={14} />
              Fullscreen
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded transition-colors"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview content - transform creates new containing block for fixed children */}
        <div className="absolute inset-0 top-10 overflow-hidden" style={{ transform: 'translateZ(0)' }}>
          {renderBeat()}
        </div>
      </motion.div>
    </motion.div>
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

interface EditableQuestionListProps {
  beatId: string;
  questions: BeatQuestion[];
  title?: string;
  onSave: (beatId: string, questions: WW2BeatQuestion[]) => Promise<void>;
}

function EditableQuestionList({ beatId, questions, title, onSave }: EditableQuestionListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedQuestions, setEditedQuestions] = useState<BeatQuestion[]>(questions);
  const [isSaving, setIsSaving] = useState(false);

  if (!questions || questions.length === 0) return null;

  const hiddenCount = editedQuestions.filter(q => q.hidden).length;
  const visibleCount = editedQuestions.length - hiddenCount;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCancel = () => {
    setEditedQuestions(questions);
    setEditingIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(beatId, editedQuestions as WW2BeatQuestion[]);
      setEditingIndex(null);
    } catch (error) {
      console.error('Failed to save questions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (index: number) => {
    const updated = [...editedQuestions];
    updated[index] = { ...updated[index], hidden: !updated[index].hidden };
    setEditedQuestions(updated);
    // Auto-save visibility changes
    setIsSaving(true);
    try {
      await onSave(beatId, updated as WW2BeatQuestion[]);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Revert on error
      setEditedQuestions(questions);
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestion = (index: number, field: keyof BeatQuestion, value: string | string[]) => {
    setEditedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setEditedQuestions((prev) => {
      const updated = [...prev];
      const options = [...(updated[qIndex].options || [])];
      options[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options };
      return updated;
    });
  };

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <FileQuestion size={14} />
        {title || `Questions (${visibleCount} visible${hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''})`}
        <span className="text-amber-400 text-[10px]">Editable</span>
      </h4>
      <div className="space-y-2">
        {editedQuestions.map((q, idx) => (
          <div key={q.id} className={`bg-slate-800/50 rounded-lg p-3 border ${editingIndex === idx ? 'border-amber-500/50' : 'border-slate-700/50'}`}>
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                {editingIndex === idx ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Question</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                        className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    {q.options && (
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Options</label>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(idx, i, e.target.value)}
                                className={`flex-1 bg-slate-700 text-sm rounded px-2 py-1 border focus:outline-none ${
                                  opt === q.correctAnswer
                                    ? 'text-green-400 border-green-500/50 focus:border-green-500'
                                    : 'text-white border-slate-600 focus:border-amber-500'
                                }`}
                              />
                              <button
                                onClick={() => updateQuestion(idx, 'correctAnswer', opt)}
                                className={`p-1 rounded ${opt === q.correctAnswer ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400 hover:text-white'}`}
                                title="Set as correct answer"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Explanation</label>
                      <textarea
                        value={q.explanation}
                        onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                        className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className={q.hidden ? 'opacity-50' : ''}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm mb-2">{q.question}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleVisibility(idx)}
                          disabled={isSaving}
                          className={`p-1 rounded transition-colors ${
                            q.hidden
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                              : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                          } disabled:opacity-50`}
                          title={q.hidden ? 'Show question to students' : 'Hide question from students'}
                        >
                          {q.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleEdit(idx)}
                          className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Edit question"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>
                    {q.hidden && (
                      <span className="inline-block mb-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded">
                        Hidden from students
                      </span>
                    )}
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
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
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

interface EditableStatementListProps {
  beatId: string;
  statements: BeatStatement[];
  onSave: (beatId: string, statements: WW2BeatStatement[]) => Promise<void>;
}

function EditableStatementList({ beatId, statements, onSave }: EditableStatementListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedStatements, setEditedStatements] = useState<BeatStatement[]>(statements);
  const [isSaving, setIsSaving] = useState(false);

  if (!statements || statements.length === 0) return null;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCancel = () => {
    setEditedStatements(statements);
    setEditingIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(beatId, editedStatements as WW2BeatStatement[]);
      setEditingIndex(null);
    } catch (error) {
      console.error('Failed to save statements:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatement = (index: number, field: keyof BeatStatement, value: string | boolean) => {
    setEditedStatements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <HelpCircle size={14} />
        Fact or Myth Statements ({statements.length})
        <span className="text-amber-400 text-[10px]">Editable</span>
      </h4>
      <div className="space-y-2">
        {editedStatements.map((s, idx) => (
          <div key={s.id} className={`bg-slate-800/50 rounded-lg p-3 border ${editingIndex === idx ? 'border-amber-500/50' : 'border-slate-700/50'}`}>
            <div className="flex items-start gap-2">
              <button
                onClick={() => editingIndex === idx && updateStatement(idx, 'isFact', !s.isFact)}
                disabled={editingIndex !== idx}
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold transition-colors ${
                  s.isFact ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                } ${editingIndex === idx ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                title={editingIndex === idx ? 'Click to toggle Fact/Myth' : undefined}
              >
                {s.isFact ? 'F' : 'M'}
              </button>
              <div className="flex-1 min-w-0">
                {editingIndex === idx ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Statement</label>
                      <textarea
                        value={s.statement}
                        onChange={(e) => updateStatement(idx, 'statement', e.target.value)}
                        className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400">Is this a Fact?</label>
                      <button
                        onClick={() => updateStatement(idx, 'isFact', true)}
                        className={`px-2 py-1 text-xs rounded ${s.isFact ? 'bg-green-500 text-black font-bold' : 'bg-slate-600 text-slate-300'}`}
                      >
                        Fact
                      </button>
                      <button
                        onClick={() => updateStatement(idx, 'isFact', false)}
                        className={`px-2 py-1 text-xs rounded ${!s.isFact ? 'bg-red-500 text-white font-bold' : 'bg-slate-600 text-slate-300'}`}
                      >
                        Myth
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Explanation</label>
                      <textarea
                        value={s.explanation}
                        onChange={(e) => updateStatement(idx, 'explanation', e.target.value)}
                        className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm mb-1">{s.statement}</p>
                      <button
                        onClick={() => handleEdit(idx)}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                        title="Edit statement"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                    <p className="text-slate-400 text-xs">{s.explanation}</p>
                  </>
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

interface EditableHotspotListProps {
  beatId: string;
  hotspots: BeatHotspot[];
  customHotspotConfig?: WW2BeatHotspotConfig;
  uploadedMedia: Record<string, string>;
  onEditHotspots: (beatId: string) => void;
}

function EditableHotspotList({
  beatId,
  hotspots,
  customHotspotConfig,
  uploadedMedia,
  onEditHotspots
}: EditableHotspotListProps) {
  // Use custom hotspots if available, otherwise fall back to default
  const displayHotspots = customHotspotConfig?.hotspots || hotspots || [];
  const hasImage = customHotspotConfig?.imageUrl || Object.keys(uploadedMedia).length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
          <Target size={14} />
          Map Hotspots ({displayHotspots.length})
          <span className="text-amber-400 text-[10px]">Editable</span>
        </h4>
        <button
          onClick={() => onEditHotspots(beatId)}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Edit3 size={12} />
          Edit Hotspots
        </button>
      </div>

      {customHotspotConfig?.imageUrl && (
        <div className="relative rounded-lg overflow-hidden bg-slate-800 mb-2">
          <img
            src={customHotspotConfig.imageUrl}
            alt="Hotspot map"
            className="w-full h-32 object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded">
              {displayHotspots.length} hotspots placed
            </span>
          </div>
        </div>
      )}

      {displayHotspots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {displayHotspots.map((h: BeatHotspot | WW2BeatHotspot) => (
            <div key={h.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium mb-1">{h.label}</p>
                  <p className="text-slate-400 text-xs">{h.description}</p>
                  {'x' in h && 'y' in h && (
                    <p className="text-slate-500 text-[10px] mt-1">
                      Position: ({(h as WW2BeatHotspot).x.toFixed(1)}%, {(h as WW2BeatHotspot).y.toFixed(1)}%)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-700 text-center">
          <p className="text-slate-500 text-sm">No hotspots defined yet</p>
          <p className="text-slate-600 text-xs mt-1">Click "Edit Hotspots" to add locations</p>
        </div>
      )}
    </div>
  );
}

interface MediaUploadSectionProps {
  beatId: string;
  mediaNeeded?: BeatContent['mediaNeeded'];
  uploadedMedia: Record<string, string>;
  onUpload: (beatId: string, mediaKey: string, file: File) => Promise<void>;
  onRemove: (beatId: string, mediaKey: string) => Promise<void>;
}

function MediaUploadSection({ beatId, mediaNeeded, uploadedMedia, onUpload, onRemove }: MediaUploadSectionProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!mediaNeeded || mediaNeeded.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-700">
        <p className="text-slate-500 text-sm text-center">No media assets required for this beat</p>
      </div>
    );
  }

  const getMediaKey = (description: string) => {
    // Convert description to a safe key
    return description.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleUploadClick = (mediaKey: string) => {
    fileInputRefs.current[mediaKey]?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, mediaKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKey(mediaKey);
    try {
      await onUpload(beatId, mediaKey, file);
    } finally {
      setUploadingKey(null);
      // Reset file input
      if (fileInputRefs.current[mediaKey]) {
        fileInputRefs.current[mediaKey]!.value = '';
      }
    }
  };

  const handleRemove = async (mediaKey: string) => {
    setUploadingKey(mediaKey);
    try {
      await onRemove(beatId, mediaKey);
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
        <ImageIcon size={14} />
        Media Assets ({mediaNeeded.length})
      </h4>
      <div className="space-y-2">
        {mediaNeeded.map((media, idx) => {
          const mediaKey = getMediaKey(media.description);
          const currentUrl = uploadedMedia[mediaKey];
          const isUploading = uploadingKey === mediaKey;

          return (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-3">
                {/* Preview or Icon */}
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${
                  media.type === 'image' ? 'bg-blue-500/20' :
                  media.type === 'video' ? 'bg-purple-500/20' :
                  'bg-green-500/20'
                }`}>
                  {currentUrl ? (
                    media.type === 'image' ? (
                      <img src={currentUrl} alt={media.description} className="w-full h-full object-cover" />
                    ) : media.type === 'video' ? (
                      <video src={currentUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Play size={24} className="text-green-400" />
                    )
                  ) : (
                    <>
                      {media.type === 'image' && <ImageIcon size={24} className="text-blue-400" />}
                      {media.type === 'video' && <Video size={24} className="text-purple-400" />}
                      {media.type === 'audio' && <Play size={24} className="text-green-400" />}
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{media.description}</p>
                  {currentUrl ? (
                    <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                      <Check size={12} />
                      Uploaded
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs mt-1">Not uploaded yet</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {currentUrl && (
                    <button
                      onClick={() => handleRemove(mediaKey)}
                      disabled={isUploading}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleUploadClick(mediaKey)}
                    disabled={isUploading}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {currentUrl ? 'Replace' : 'Upload'}
                  </button>
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[mediaKey] = el; }}
                    onChange={(e) => handleFileChange(e, mediaKey)}
                    accept={media.type === 'image' ? 'image/*' : media.type === 'video' ? 'video/*' : 'audio/*'}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PreModuleVideoSectionProps {
  beatId: string;
  config?: PreModuleVideoConfig;
  onSave: (beatId: string, config: PreModuleVideoConfig | null) => Promise<void>;
  onUploadVideo: (beatId: string, mediaKey: string, file: File, onProgress?: (progress: number) => void) => Promise<void>;
  onClearMediaUrl: (beatId: string, mediaKey: string) => Promise<void>;
}

function PreModuleVideoSection({ beatId, config, onSave, onUploadVideo, onClearMediaUrl }: PreModuleVideoSectionProps) {
  const [isEnabled, setIsEnabled] = useState(config?.enabled ?? false);
  const [videoUrl, setVideoUrl] = useState(config?.videoUrl ?? '');
  const [title, setTitle] = useState(config?.title ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when config changes
  useEffect(() => {
    setIsEnabled(config?.enabled ?? false);
    setVideoUrl(config?.videoUrl ?? '');
    setTitle(config?.title ?? '');
  }, [config]);

  const handleToggle = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    if (!newEnabled) {
      // Disable - remove the config
      setIsSaving(true);
      try {
        await onSave(beatId, null);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    if (!videoUrl) return;

    setIsSaving(true);
    try {
      await onSave(beatId, {
        videoUrl,
        enabled: isEnabled,
        title: title || undefined,
        skipAllowed: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (warn if > 100MB)
    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`[PreModuleVideo] Uploading file: ${file.name}, size: ${fileSizeMB.toFixed(2)} MB`);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Upload with a specific key for pre-module videos
      await onUploadVideo(beatId, `pre-module-video`, file, (progress) => {
        console.log(`[PreModuleVideo] Upload progress: ${progress.toFixed(1)}%`);
        setUploadProgress(progress);
      });
      console.log('[PreModuleVideo] Upload complete!');
      // The URL will be available via subscription after upload
    } catch (error) {
      console.error('[PreModuleVideo] Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoUrl) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      // Clear the media URL reference (keeps file in storage for library)
      await onClearMediaUrl(beatId, 'pre-module-video');
      // Clear the config
      await onSave(beatId, null);
      // Reset local state
      setVideoUrl('');
      setTitle('');
      setIsEnabled(false);
    } catch (error) {
      console.error('[PreModuleVideo] Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-3">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Remove Video?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  This will remove the video from this beat. The video file will remain in your library for future use.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
          <Video size={14} />
          Pre-Module Video
          <span className="text-purple-400 text-[10px]">Intro Explainer</span>
        </h4>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isSaving}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-purple-500' : 'bg-slate-600'
          } ${isSaving ? 'opacity-50' : ''}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30 space-y-4">
          <p className="text-slate-400 text-xs">
            This video will play before the module starts, serving as an introduction or explainer for the content.
          </p>

          {/* Title Input */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Video Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Pearl Harbor"
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Video URL Input or Upload */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Video URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="flex-1 bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                disabled={isUploading}
              />
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading video... (large files may take a while)</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Please keep this window open until upload completes.</p>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {uploadError}
              </p>
            </div>
          )}

          {/* Video Preview */}
          {videoUrl && !isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Video Preview</label>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Check size={12} />
                  Video uploaded
                </span>
              </div>
              <div className="rounded-lg overflow-hidden bg-black border border-slate-600">
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-h-64"
                  preload="metadata"
                />
              </div>
              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 border border-red-500/30"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remove Video
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !videoUrl}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface PostModuleVideoSectionProps {
  beatId: string;
  config?: PostModuleVideoConfig;
  onSave: (beatId: string, config: PostModuleVideoConfig | null) => Promise<void>;
  onUploadVideo: (beatId: string, mediaKey: string, file: File, onProgress?: (progress: number) => void) => Promise<void>;
  onClearMediaUrl: (beatId: string, mediaKey: string) => Promise<void>;
}

function PostModuleVideoSection({ beatId, config, onSave, onUploadVideo, onClearMediaUrl }: PostModuleVideoSectionProps) {
  const [isEnabled, setIsEnabled] = useState(config?.enabled ?? false);
  const [videoUrl, setVideoUrl] = useState(config?.videoUrl ?? '');
  const [title, setTitle] = useState(config?.title ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when config changes
  useEffect(() => {
    setIsEnabled(config?.enabled ?? false);
    setVideoUrl(config?.videoUrl ?? '');
    setTitle(config?.title ?? '');
  }, [config]);

  const handleToggle = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    if (!newEnabled) {
      // Disable - remove the config
      setIsSaving(true);
      try {
        await onSave(beatId, null);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    if (!videoUrl) return;

    setIsSaving(true);
    try {
      await onSave(beatId, {
        videoUrl,
        enabled: isEnabled,
        title: title || undefined,
        skipAllowed: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (warn if > 100MB)
    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`[PostModuleVideo] Uploading file: ${file.name}, size: ${fileSizeMB.toFixed(2)} MB`);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Upload with a specific key for post-module videos
      await onUploadVideo(beatId, `post-module-video`, file, (progress) => {
        console.log(`[PostModuleVideo] Upload progress: ${progress.toFixed(1)}%`);
        setUploadProgress(progress);
      });
      console.log('[PostModuleVideo] Upload complete!');
      // The URL will be available via subscription after upload
    } catch (error) {
      console.error('[PostModuleVideo] Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoUrl) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      // Clear the media URL reference (keeps file in storage for library)
      await onClearMediaUrl(beatId, 'post-module-video');
      // Clear the config
      await onSave(beatId, null);
      // Reset local state
      setVideoUrl('');
      setTitle('');
      setIsEnabled(false);
    } catch (error) {
      console.error('[PostModuleVideo] Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-3">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Remove Video?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  This will remove the video from this beat. The video file will remain in your library for future use.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h4 className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-2">
          <Video size={14} />
          Completion Video
          <span className="text-green-400 text-[10px]">Post-Module</span>
        </h4>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isSaving}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-green-500' : 'bg-slate-600'
          } ${isSaving ? 'opacity-50' : ''}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/30 space-y-4">
          <p className="text-slate-400 text-xs">
            This video will play after the module completes, before the XP reward screen. Use it for celebration, summary, or transition content.
          </p>

          {/* Title Input */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Video Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great Job! or Beat Complete!"
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Video URL Input or Upload */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Video URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="flex-1 bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-green-500 focus:outline-none"
                disabled={isUploading}
              />
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading video... (large files may take a while)</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Please keep this window open until upload completes.</p>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {uploadError}
              </p>
            </div>
          )}

          {/* Video Preview */}
          {videoUrl && !isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Video Preview</label>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Check size={12} />
                  Video uploaded
                </span>
              </div>
              <div className="rounded-lg overflow-hidden bg-black border border-slate-600">
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-h-64"
                  preload="metadata"
                />
              </div>
              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 border border-red-500/30"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remove Video
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !videoUrl}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Configuration
            </button>
          </div>
        </div>
      )}
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
  uploadedMedia,
  customHotspotConfig,
  preModuleVideoConfig,
  postModuleVideoConfig,
  onUpload,
  onRemove,
  onSaveQuestions,
  onSaveStatements,
  onEditHotspots,
  onSavePreModuleVideo,
  onSavePostModuleVideo,
  onArchive,
  showDragHandle,
}: {
  lesson: typeof PEARL_HARBOR_LESSONS[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onPreview: (beatType: string) => void;
  uploadedMedia: Record<string, string>;
  customHotspotConfig?: WW2BeatHotspotConfig;
  preModuleVideoConfig?: PreModuleVideoConfig;
  postModuleVideoConfig?: PostModuleVideoConfig;
  onUpload: (beatId: string, mediaKey: string, file: File, onProgress?: (progress: number) => void) => Promise<void>;
  onRemove: (beatId: string, mediaKey: string) => Promise<void>;
  onSaveQuestions: (beatId: string, questions: WW2BeatQuestion[]) => Promise<void>;
  onSaveStatements: (beatId: string, statements: WW2BeatStatement[]) => Promise<void>;
  onEditHotspots: (beatId: string) => void;
  onSavePreModuleVideo: (beatId: string, config: PreModuleVideoConfig | null) => Promise<void>;
  onSavePostModuleVideo: (beatId: string, config: PostModuleVideoConfig | null) => Promise<void>;
  onArchive?: (beatId: string) => void;
  showDragHandle?: boolean;
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
      <div className="flex items-center">
        {/* Drag Handle */}
        {showDragHandle && (
          <div className="pl-2 pr-1 py-4 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300">
            <GripVertical size={20} />
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-1 p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
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

          {/* Archive button */}
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Archive "${lesson.title}"? This will hide it from students.`)) {
                  onArchive(lesson.id);
                }
              }}
              className="px-3 py-1.5 bg-slate-600 hover:bg-red-500/80 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Archive size={14} />
              Archive
            </button>
          )}

          <div className="text-slate-400">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </button>
      </div>

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
              {(content?.hotspots || customHotspotConfig) && (
                <EditableHotspotList
                  beatId={lesson.id}
                  hotspots={content?.hotspots || []}
                  customHotspotConfig={customHotspotConfig}
                  uploadedMedia={uploadedMedia}
                  onEditHotspots={onEditHotspots}
                />
              )}
              {content?.questions && content.questions.length > 0 && (
                <EditableQuestionList
                  beatId={lesson.id}
                  questions={content.questions}
                  onSave={onSaveQuestions}
                />
              )}
              {content?.statements && (
                <EditableStatementList
                  beatId={lesson.id}
                  statements={content.statements}
                  onSave={onSaveStatements}
                />
              )}

              {/* Pre-Module Video - show for all beats except exam */}
              {!isExam && (
                <PreModuleVideoSection
                  beatId={lesson.id}
                  config={preModuleVideoConfig}
                  onSave={onSavePreModuleVideo}
                  onUploadVideo={onUpload}
                  onClearMediaUrl={onRemove}
                />
              )}

              {/* Post-Module Completion Video - show for all beats except exam */}
              {!isExam && (
                <PostModuleVideoSection
                  beatId={lesson.id}
                  config={postModuleVideoConfig}
                  onSave={onSavePostModuleVideo}
                  onUploadVideo={onUpload}
                  onClearMediaUrl={onRemove}
                />
              )}

              {/* Final Exam Questions */}
              {isExam && <ExamQuestionsList />}

              {/* Media Upload */}
              <MediaUploadSection
                beatId={lesson.id}
                mediaNeeded={content?.mediaNeeded}
                uploadedMedia={uploadedMedia}
                onUpload={onUpload}
                onRemove={onRemove}
              />
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
// EXAM/ARENA ASSETS CARD
// ============================================================

function ExamAssetsCard({
  title,
  subtitle,
  icon,
  assetType,
  assets,
  isExpanded,
  onToggle,
  uploadedMedia,
  onUpload,
  onRemove,
}: {
  title: string;
  subtitle: string;
  icon: string;
  assetType: string;
  assets: ExamAsset[];
  isExpanded: boolean;
  onToggle: () => void;
  uploadedMedia: Record<string, string>;
  onUpload: (beatId: string, mediaKey: string, file: File) => Promise<void>;
  onRemove: (beatId: string, mediaKey: string) => Promise<void>;
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, assetKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKey(assetKey);
    try {
      await onUpload(assetType, assetKey, file);
    } finally {
      setUploadingKey(null);
      if (e.target) e.target.value = '';
    }
  };

  const imageAssets = assets.filter(a => a.type === 'image');
  const audioAssets = assets.filter(a => a.type === 'audio');
  const uploadedCount = Object.keys(uploadedMedia).filter(k => uploadedMedia[k]).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden bg-slate-800/50 border-slate-700"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-2xl">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded">
              Assets
            </span>
            {uploadedCount > 0 && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">
                {uploadedCount}/{assets.length} uploaded
              </span>
            )}
          </div>
          <h3 className="text-white font-bold">{title}</h3>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-400">
            <ImageIcon size={14} />
            <span>{imageAssets.length} images</span>
          </div>
          {audioAssets.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <Music size={14} />
              <span>{audioAssets.length} audio</span>
            </div>
          )}
        </div>

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
              {/* Image Assets */}
              {imageAssets.length > 0 && (
                <div>
                  <h4 className="text-white/60 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ImageIcon size={14} />
                    Image Assets ({imageAssets.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {imageAssets.map((asset) => {
                      const isUploading = uploadingKey === asset.key;
                      const currentUrl = uploadedMedia[asset.key];

                      return (
                        <div key={asset.key} className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                          <div className="flex items-start gap-3">
                            {/* Preview */}
                            <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                              {currentUrl ? (
                                <img src={currentUrl} alt={asset.topic} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={24} className="text-slate-500" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-amber-400 text-xs font-mono">Q{asset.questionNumber}</span>
                                <span className="text-white text-sm font-medium truncate">{asset.topic}</span>
                              </div>
                              <p className="text-slate-400 text-xs mb-2 line-clamp-2">{asset.description}</p>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => fileInputRefs.current[asset.key]?.click()}
                                  disabled={isUploading}
                                  className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded flex items-center gap-1 disabled:opacity-50"
                                >
                                  {isUploading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Upload size={12} />
                                  )}
                                  {currentUrl ? 'Replace' : 'Upload'}
                                </button>
                                {currentUrl && (
                                  <button
                                    onClick={() => onRemove(assetType, asset.key)}
                                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded flex items-center gap-1"
                                  >
                                    <Trash2 size={12} />
                                    Remove
                                  </button>
                                )}
                                <input
                                  type="file"
                                  ref={(el) => { fileInputRefs.current[asset.key] = el; }}
                                  onChange={(e) => handleFileChange(e, asset.key)}
                                  accept="image/*"
                                  className="hidden"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Audio Assets */}
              {audioAssets.length > 0 && (
                <div>
                  <h4 className="text-white/60 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Music size={14} />
                    Audio Assets ({audioAssets.length})
                  </h4>
                  <div className="space-y-3">
                    {audioAssets.map((asset) => {
                      const isUploading = uploadingKey === asset.key;
                      const currentUrl = uploadedMedia[asset.key];

                      return (
                        <div key={asset.key} className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                          <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                              <Music size={20} className={currentUrl ? 'text-emerald-400' : 'text-slate-500'} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-amber-400 text-xs font-mono">Q{asset.questionNumber}</span>
                                <span className="text-white text-sm font-medium">{asset.topic}</span>
                                {currentUrl && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">
                                    Uploaded
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 text-xs mb-2">{asset.description}</p>

                              {/* Audio Player */}
                              {currentUrl && (
                                <audio controls className="w-full h-8 mb-2">
                                  <source src={currentUrl} />
                                </audio>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => fileInputRefs.current[asset.key]?.click()}
                                  disabled={isUploading}
                                  className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded flex items-center gap-1 disabled:opacity-50"
                                >
                                  {isUploading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Upload size={12} />
                                  )}
                                  {currentUrl ? 'Replace' : 'Upload'}
                                </button>
                                {currentUrl && (
                                  <button
                                    onClick={() => onRemove(assetType, asset.key)}
                                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded flex items-center gap-1"
                                  >
                                    <Trash2 size={12} />
                                    Remove
                                  </button>
                                )}
                                <input
                                  type="file"
                                  ref={(el) => { fileInputRefs.current[asset.key] = el; }}
                                  onChange={(e) => handleFileChange(e, asset.key)}
                                  accept="audio/*"
                                  className="hidden"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// ARCHIVED BEATS SECTION
// ============================================================

function ArchivedBeatsSection({
  archivedBeatIds,
  lessons,
  onRestore,
}: {
  archivedBeatIds: string[];
  lessons: typeof PEARL_HARBOR_LESSONS;
  onRestore: (beatId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (archivedBeatIds.length === 0) return null;

  const archivedLessons = lessons.filter(l => archivedBeatIds.includes(l.id));

  return (
    <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Archive size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Archived Beats</h3>
            <p className="text-slate-400 text-sm">{archivedBeatIds.length} beat{archivedBeatIds.length !== 1 ? 's' : ''} hidden from students</p>
          </div>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-700/50 space-y-2">
              {archivedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lesson.icon}</span>
                    <div>
                      <span className="text-slate-500 text-xs">Beat {lesson.number}</span>
                      <h4 className="text-white font-medium">{lesson.title}</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Restore "${lesson.title}"? This will make it visible to students again.`)) {
                        onRestore(lesson.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WW2ModuleEditor() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [previewBeat, setPreviewBeat] = useState<string | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<FirestoreWW2ModuleAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the first host as the preview host
  const previewHost = WW2_HOSTS[0];

  // Get archived beat IDs from assets
  const archivedBeatIds = Object.keys(uploadedAssets?.archivedBeats || {});

  // Compute ordered and active (non-archived) beats
  const getOrderedActiveBeats = useCallback(() => {
    const customOrder = uploadedAssets?.beatOrder;
    const activeBeats = PEARL_HARBOR_LESSONS.filter(l => !archivedBeatIds.includes(l.id));

    if (!customOrder || customOrder.length === 0) {
      return activeBeats;
    }

    // Reorder based on customOrder
    const ordered: typeof PEARL_HARBOR_LESSONS = [];
    for (const beatId of customOrder) {
      const beat = activeBeats.find(b => b.id === beatId);
      if (beat) ordered.push(beat);
    }

    // Add any beats not in customOrder at the end
    for (const beat of activeBeats) {
      if (!ordered.find(b => b.id === beat.id)) {
        ordered.push(beat);
      }
    }

    return ordered;
  }, [uploadedAssets?.beatOrder, archivedBeatIds]);

  const [orderedBeats, setOrderedBeats] = useState<typeof PEARL_HARBOR_LESSONS>([]);

  // Update ordered beats when assets change
  useEffect(() => {
    setOrderedBeats(getOrderedActiveBeats());
  }, [getOrderedActiveBeats]);

  // Handle archive beat
  const handleArchiveBeat = useCallback(async (beatId: string) => {
    try {
      await archiveWW2Beat(beatId);
      console.log('Beat archived:', beatId);
    } catch (error) {
      console.error('Error archiving beat:', error);
    }
  }, []);

  // Handle restore beat
  const handleRestoreBeat = useCallback(async (beatId: string) => {
    try {
      await restoreWW2Beat(beatId);
      console.log('Beat restored:', beatId);
    } catch (error) {
      console.error('Error restoring beat:', error);
    }
  }, []);

  // Handle beat reorder
  const handleBeatReorder = useCallback(async (reorderedBeats: typeof PEARL_HARBOR_LESSONS) => {
    setOrderedBeats(reorderedBeats);
    const beatIds = reorderedBeats.map(b => b.id);
    try {
      await saveWW2BeatOrder(beatIds);
      console.log('Beat order saved:', beatIds);
    } catch (error) {
      console.error('Error saving beat order:', error);
    }
  }, []);

  // Subscribe to Firestore for uploaded assets
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setUploadedAssets(assets);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle media upload with progress callback
  const handleUpload = useCallback(async (
    beatId: string,
    mediaKey: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    console.log(`[WW2ModuleEditor] Starting upload for ${beatId}/${mediaKey}, file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Upload to Firebase Storage with progress callback
    const result = await uploadFile(file, onProgress);
    if (!result || !result.url) {
      throw new Error('Failed to upload file - no URL returned');
    }

    console.log(`[WW2ModuleEditor] Upload complete, URL: ${result.url}`);

    // Special handling for pre-module videos - save to correct location
    if (mediaKey === 'pre-module-video') {
      // Save directly to preModuleVideos config
      await updateWW2BeatPreModuleVideo(beatId, {
        videoUrl: result.url,
        enabled: true,
        skipAllowed: true,
      });
      console.log('[WW2ModuleEditor] Pre-module video config saved to Firestore');
    } else {
      // Regular media - save to beatMedia
      await updateWW2BeatMedia(beatId, mediaKey, result.url);
      console.log('[WW2ModuleEditor] Media URL saved to Firestore');
    }
  }, []);

  // Handle media removal
  const handleRemove = useCallback(async (beatId: string, mediaKey: string) => {
    try {
      await updateWW2BeatMedia(beatId, mediaKey, null);
    } catch (error) {
      console.error('Error removing media:', error);
    }
  }, []);

  // Handle saving edited questions
  const handleSaveQuestions = useCallback(async (beatId: string, questions: WW2BeatQuestion[]) => {
    try {
      await updateWW2BeatQuestions(beatId, questions);
      console.log('Questions saved for beat:', beatId);
    } catch (error) {
      console.error('Error saving questions:', error);
      throw error;
    }
  }, []);

  // Handle saving edited statements
  const handleSaveStatements = useCallback(async (beatId: string, statements: WW2BeatStatement[]) => {
    try {
      await updateWW2BeatStatements(beatId, statements);
      console.log('Statements saved for beat:', beatId);
    } catch (error) {
      console.error('Error saving statements:', error);
      throw error;
    }
  }, []);

  // Hotspot editor state
  const [editingHotspotsBeatId, setEditingHotspotsBeatId] = useState<string | null>(null);
  const [editingHotspotsImageUrl, setEditingHotspotsImageUrl] = useState<string>('');

  // Get hotspot config for a beat
  const getHotspotConfig = useCallback((beatId: string): WW2BeatHotspotConfig | undefined => {
    return uploadedAssets?.customHotspots?.[beatId];
  }, [uploadedAssets]);

  // Handle opening hotspot editor
  const handleEditHotspots = useCallback((beatId: string) => {
    const config = uploadedAssets?.customHotspots?.[beatId];
    // Try: 1) custom hotspot image, 2) beat media image, 3) default
    const beatMedia = uploadedAssets?.beatMedia?.[beatId];
    const beatMediaImage = beatMedia ? Object.values(beatMedia)[0] : '';
    const defaultImage = beatId === 'ph-beat-1' ? BEAT_1_DEFAULT_IMAGE : '';
    const imageUrl = config?.imageUrl || beatMediaImage || defaultImage;
    console.log('[WW2ModuleEditor] Opening hotspot editor:', { beatId, imageUrl, config, beatMedia });
    setEditingHotspotsImageUrl(imageUrl);
    setEditingHotspotsBeatId(beatId);
  }, [uploadedAssets]);

  // Handle saving hotspots
  const handleSaveHotspots = useCallback(async (hotspots: ModuleHotspot[]) => {
    if (!editingHotspotsBeatId) return;

    console.log('[WW2ModuleEditor] Saving hotspots:', {
      beatId: editingHotspotsBeatId,
      imageUrl: editingHotspotsImageUrl,
      hotspotCount: hotspots.length,
    });

    try {
      // Convert ModuleHotspot to WW2BeatHotspot
      const ww2Hotspots: WW2BeatHotspot[] = hotspots.map(h => ({
        id: h.id,
        x: h.x,
        y: h.y,
        label: h.label,
        description: h.description,
        revealFact: h.revealFact,
        isCorrect: h.isCorrect,
        order: h.order,
      }));

      const success = await updateWW2BeatHotspots(editingHotspotsBeatId, editingHotspotsImageUrl, ww2Hotspots);
      console.log('[WW2ModuleEditor] Save result:', success);
      setEditingHotspotsBeatId(null);
      setEditingHotspotsImageUrl('');
    } catch (error) {
      console.error('[WW2ModuleEditor] Error saving hotspots:', error);
      throw error;
    }
  }, [editingHotspotsBeatId, editingHotspotsImageUrl]);

  // Get uploaded media for a specific beat
  const getUploadedMedia = useCallback((beatId: string): Record<string, string> => {
    return uploadedAssets?.beatMedia?.[beatId] || {};
  }, [uploadedAssets]);

  // Get pre-module video config for a beat
  // Merges the config with any uploaded video URL from mediaUrls
  const getPreModuleVideoConfig = useCallback((beatId: string): PreModuleVideoConfig | undefined => {
    const config = uploadedAssets?.preModuleVideos?.[beatId];
    const uploadedUrl = uploadedAssets?.mediaUrls?.[beatId]?.['pre-module-video'];

    // If we have an uploaded URL, merge it with the config
    if (uploadedUrl) {
      return {
        videoUrl: uploadedUrl,
        enabled: config?.enabled ?? false,
        title: config?.title,
        skipAllowed: config?.skipAllowed ?? true,
      };
    }

    return config;
  }, [uploadedAssets]);

  // Handle saving pre-module video config
  const handleSavePreModuleVideo = useCallback(async (beatId: string, config: PreModuleVideoConfig | null) => {
    try {
      await updateWW2BeatPreModuleVideo(beatId, config);
      console.log('Pre-module video saved for beat:', beatId);
    } catch (error) {
      console.error('Error saving pre-module video:', error);
      throw error;
    }
  }, []);

  // Get post-module video config for a beat
  // Merges the config with any uploaded video URL from mediaUrls
  const getPostModuleVideoConfig = useCallback((beatId: string): PostModuleVideoConfig | undefined => {
    const config = uploadedAssets?.postModuleVideos?.[beatId];
    const uploadedUrl = uploadedAssets?.mediaUrls?.[beatId]?.['post-module-video'];

    // If we have an uploaded URL, merge it with the config
    if (uploadedUrl) {
      return {
        videoUrl: uploadedUrl,
        enabled: config?.enabled ?? false,
        title: config?.title,
        skipAllowed: config?.skipAllowed ?? true,
      };
    }

    return config;
  }, [uploadedAssets]);

  // Handle saving post-module video config
  const handleSavePostModuleVideo = useCallback(async (beatId: string, config: PostModuleVideoConfig | null) => {
    try {
      await updateWW2BeatPostModuleVideo(beatId, config);
      console.log('Post-module video saved for beat:', beatId);
    } catch (error) {
      console.error('Error saving post-module video:', error);
      throw error;
    }
  }, []);

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
            <div className="text-xs text-slate-400 uppercase tracking-wide">Active Beats</div>
            <div className="text-2xl font-bold text-white">
              {orderedBeats.length}
              {archivedBeatIds.length > 0 && (
                <span className="text-sm text-slate-500 font-normal ml-1">
                  ({archivedBeatIds.length} archived)
                </span>
              )}
            </div>
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

      {/* Content List - Reorderable */}
      <Reorder.Group
        axis="y"
        values={orderedBeats}
        onReorder={handleBeatReorder}
        className="space-y-3"
      >
        {orderedBeats.map((lesson, index) => (
          <Reorder.Item
            key={lesson.id}
            value={lesson}
            className="list-none"
          >
            <BeatCard
              lesson={lesson}
              index={index}
              isExpanded={expandedSections.has(lesson.id)}
              onToggle={() => toggleSection(lesson.id)}
              onPreview={handlePreview}
              uploadedMedia={getUploadedMedia(lesson.id)}
              customHotspotConfig={getHotspotConfig(lesson.id)}
              preModuleVideoConfig={getPreModuleVideoConfig(lesson.id)}
              postModuleVideoConfig={getPostModuleVideoConfig(lesson.id)}
              onUpload={handleUpload}
              onRemove={handleRemove}
              onSaveQuestions={handleSaveQuestions}
              onSaveStatements={handleSaveStatements}
              onEditHotspots={handleEditHotspots}
              onSavePreModuleVideo={handleSavePreModuleVideo}
              onSavePostModuleVideo={handleSavePostModuleVideo}
              onArchive={handleArchiveBeat}
              showDragHandle={true}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Non-reorderable items */}
      <div className="space-y-3 mt-3">
        {/* Arena Card */}
        <ArenaCard
          isExpanded={expandedSections.has('arena')}
          onToggle={() => toggleSection('arena')}
          onPreview={() => handlePreview('arena')}
        />

        {/* Final Exam Assets Card */}
        <ExamAssetsCard
          title="Final Exam Assets"
          subtitle="Media for the 15-question Final Exam"
          icon="📋"
          assetType="final-exam"
          assets={FINAL_EXAM_ASSETS}
          isExpanded={expandedSections.has('final-exam-assets')}
          onToggle={() => toggleSection('final-exam-assets')}
          uploadedMedia={getUploadedMedia('final-exam')}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        {/* Arena Assets Card */}
        <ExamAssetsCard
          title="Arena Assets"
          subtitle="Media for the 15-question Elite Arena"
          icon="🏆"
          assetType="arena"
          assets={ARENA_ASSETS}
          isExpanded={expandedSections.has('arena-assets')}
          onToggle={() => toggleSection('arena-assets')}
          uploadedMedia={getUploadedMedia('arena')}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        {/* Theater Media Settings Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Music size={20} className="text-amber-400" />
            Theater Media Settings
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Configure cinematic entry videos and background music for each theater
          </p>
          <div className="space-y-3">
            <TheaterMediaEditor
              theaterId="pearl-harbor"
              theaterName="Pearl Harbor"
            />
            <TheaterMediaEditor
              theaterId="normandy"
              theaterName="Normandy (D-Day)"
            />
            <TheaterMediaEditor
              theaterId="battle-of-britain"
              theaterName="Battle of Britain"
            />
            <TheaterMediaEditor
              theaterId="stalingrad"
              theaterName="Stalingrad"
            />
          </div>
        </div>

        {/* Archived Beats Section */}
        <ArchivedBeatsSection
          archivedBeatIds={archivedBeatIds}
          lessons={PEARL_HARBOR_LESSONS}
          onRestore={handleRestoreBeat}
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

      {/* Hotspot Editor Modal */}
      <AnimatePresence>
        {editingHotspotsBeatId && (
          <ImageHotspotEditor
            imageUrl={editingHotspotsImageUrl}
            hotspots={(() => {
              const customHotspots = getHotspotConfig(editingHotspotsBeatId)?.hotspots;
              if (customHotspots && customHotspots.length > 0) {
                return customHotspots.map(h => ({
                  id: h.id,
                  x: h.x,
                  y: h.y,
                  label: h.label,
                  description: h.description,
                  revealFact: h.revealFact,
                  isCorrect: h.isCorrect,
                  order: h.order,
                }));
              }
              // Fall back to Beat 1 defaults if no custom hotspots
              if (editingHotspotsBeatId === 'ph-beat-1') {
                return BEAT_1_DEFAULT_HOTSPOTS;
              }
              return [];
            })()}
            onImageChange={setEditingHotspotsImageUrl}
            onHotspotsChange={handleSaveHotspots}
            onClose={() => {
              setEditingHotspotsBeatId(null);
              setEditingHotspotsImageUrl('');
            }}
            title={`Edit Hotspots - ${PEARL_HARBOR_LESSONS.find(l => l.id === editingHotspotsBeatId)?.title || 'Beat'}`}
            instructions="Upload an image and click to place hotspots. Drag to reposition."
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
