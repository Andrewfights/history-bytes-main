/**
 * SpeechReactionGame - Hook 2: React to FDR's Day of Infamy speech
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface SpeechReactionGameProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface ReactionMoment {
  id: string;
  timestamp: number;
  text: string;
  expectedReaction: 'anger' | 'determination' | 'sorrow' | 'unity';
  context: string;
}

const SPEECH_MOMENTS: ReactionMoment[] = [
  {
    id: '1',
    timestamp: 10,
    text: '"...a date which will live in infamy..."',
    expectedReaction: 'anger',
    context: 'The nation learns of the surprise attack',
  },
  {
    id: '2',
    timestamp: 25,
    text: '"...suddenly and deliberately attacked..."',
    expectedReaction: 'anger',
    context: 'FDR emphasizes the treacherous nature of the attack',
  },
  {
    id: '3',
    timestamp: 40,
    text: '"...very many American lives have been lost..."',
    expectedReaction: 'sorrow',
    context: 'The cost of the attack becomes clear',
  },
  {
    id: '4',
    timestamp: 55,
    text: '"...the American people in their righteous might..."',
    expectedReaction: 'determination',
    context: 'FDR rallies the nation',
  },
  {
    id: '5',
    timestamp: 70,
    text: '"...will win through to absolute victory."',
    expectedReaction: 'unity',
    context: 'A promise to prevail',
  },
];

const REACTIONS = [
  { id: 'anger', emoji: '😠', label: 'Outrage' },
  { id: 'determination', emoji: '💪', label: 'Resolve' },
  { id: 'sorrow', emoji: '😢', label: 'Grief' },
  { id: 'unity', emoji: '🤝', label: 'Unity' },
];

const DEFAULT_HOST: WW2Host = {
  id: 'soldier',
  name: 'Sergeant Mitchell',
  title: 'U.S. Army Infantryman',
  era: '1941-1945',
  specialty: 'Combat Veteran',
  primaryColor: '#3d5c3d',
  avatar: '🪖',
  voiceStyle: 'determined',
  description: '',
};

export function SpeechReactionGame({ onComplete, onBack, host = DEFAULT_HOST }: SpeechReactionGameProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReactionPrompt, setShowReactionPrompt] = useState(false);
  const [score, setScore] = useState(0);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef(0);

  const dialogue = getHostDialogue(host.id, 'speech-reaction') || getHostDialogue('soldier', 'speech-reaction')!;

  const currentMoment = SPEECH_MOMENTS[currentMomentIndex];

  // Simulate speech playback and trigger reaction prompts
  useEffect(() => {
    if (!isPlaying || gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      currentTimeRef.current += 1;

      // Check if we've hit a reaction moment
      if (currentMoment && currentTimeRef.current >= currentMoment.timestamp && !showReactionPrompt) {
        setIsPlaying(false);
        setShowReactionPrompt(true);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameState, currentMoment, showReactionPrompt]);

  const handleStartGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    currentTimeRef.current = 0;
  };

  const handleReaction = (reactionId: string) => {
    if (!currentMoment) return;

    const correct = reactionId === currentMoment.expectedReaction;
    setUserReactions(prev => [...prev, reactionId]);

    if (correct) {
      setScore(prev => prev + 1);
      setFeedback({
        text: dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)],
        correct: true,
      });
    } else {
      setFeedback({
        text: `Most Americans felt ${REACTIONS.find(r => r.id === currentMoment.expectedReaction)?.label.toLowerCase()}`,
        correct: false,
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setShowReactionPrompt(false);

      if (currentMomentIndex < SPEECH_MOMENTS.length - 1) {
        setCurrentMomentIndex(prev => prev + 1);
        setIsPlaying(true);
      } else {
        setGameState('results');
      }
    }, 2000);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="FDR Speech Reaction"
        onStart={handleStartGame}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="FDR Speech Reaction"
        stats={{
          score,
          total: SPEECH_MOMENTS.length,
          xpEarned: 25,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentMomentIndex(0);
          setScore(0);
          setUserReactions([]);
          currentTimeRef.current = 0;
          handleStartGame();
        }}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Day of Infamy</h1>
        <div className="text-white/60 text-sm">{currentMomentIndex + 1}/{SPEECH_MOMENTS.length}</div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="flex gap-1">
          {SPEECH_MOMENTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentMomentIndex ? 'bg-green-500' :
                i === currentMomentIndex ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Speech Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* FDR Image/Speaker */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-900/50 to-slate-800 flex items-center justify-center mb-6 border-4 border-amber-500/30"
        >
          <span className="text-6xl">🎙️</span>
        </motion.div>

        {/* Speech Text */}
        <AnimatePresence mode="wait">
          {!showReactionPrompt ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-white/60 text-sm mb-2">President Franklin D. Roosevelt</p>
              <p className="text-white/40 text-xs mb-4">December 8, 1941</p>

              {isPlaying ? (
                <div className="flex items-center gap-2 text-amber-400">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                  <span className="text-sm">Speech playing...</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400"
                >
                  <Play size={16} />
                  <span>Continue Speech</span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reaction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <p className="text-xl text-white italic mb-2">{currentMoment?.text}</p>
              <p className="text-white/50 text-sm mb-6">{currentMoment?.context}</p>

              {!feedback && (
                <>
                  <p className="text-amber-400 text-sm mb-4">How did Americans react?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {REACTIONS.map((reaction) => (
                      <motion.button
                        key={reaction.id}
                        onClick={() => handleReaction(reaction.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        <span className="text-3xl">{reaction.emoji}</span>
                        <span className="text-white/80 text-sm">{reaction.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <HostFeedback
                host={host}
                text={feedback.text}
                type={feedback.correct ? 'correct' : 'info'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Host indicator */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-center gap-2">
        <span className="text-lg">{host.avatar}</span>
        <span className="text-white/60 text-sm">{host.name} is guiding you</span>
      </div>
    </div>
  );
}
