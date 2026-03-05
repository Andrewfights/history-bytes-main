/**
 * EscapeTheBlaze - Hook 5: Choice-based survival game on the USS Arizona
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface EscapTheBlazeProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface Stage {
  id: string;
  narration: string;
  imageEmoji: string;
  timeLimit: number;
  choices: {
    id: string;
    text: string;
    outcome: 'survive' | 'injury' | 'death';
    resultText: string;
    nextStageId?: string;
  }[];
}

const STAGES: Stage[] = [
  {
    id: 'start',
    narration: "The Arizona shudders violently. The forward magazine has been hit. Flames are everywhere. You're on the main deck - smoke is filling your lungs.",
    imageEmoji: '🔥',
    timeLimit: 10,
    choices: [
      {
        id: 'jump',
        text: 'Jump overboard immediately',
        outcome: 'injury',
        resultText: 'The water below is covered in burning oil. You suffer burns but survive.',
        nextStageId: 'water',
      },
      {
        id: 'below',
        text: 'Run below deck to help trapped crewmates',
        outcome: 'death',
        resultText: 'The ship is taking on water fast. You become trapped below deck.',
      },
      {
        id: 'aft',
        text: 'Run toward the stern (back of ship)',
        outcome: 'survive',
        resultText: 'You make it to the less damaged aft section.',
        nextStageId: 'stern',
      },
    ],
  },
  {
    id: 'stern',
    narration: "You've reached the stern. The ship is listing badly. Other sailors are abandoning ship. An explosion rocks the deck - fire is spreading your way.",
    imageEmoji: '💨',
    timeLimit: 8,
    choices: [
      {
        id: 'swim',
        text: 'Dive into the water and swim for Ford Island',
        outcome: 'survive',
        resultText: 'You swim through the chaos and reach safety at Ford Island.',
        nextStageId: 'escape',
      },
      {
        id: 'line',
        text: 'Grab a mooring line and climb down',
        outcome: 'survive',
        resultText: 'The line holds. You make it down safely.',
        nextStageId: 'escape',
      },
      {
        id: 'stay',
        text: 'Stay and fight the fires',
        outcome: 'death',
        resultText: 'A secondary explosion claims more of the ship. There was no stopping it.',
      },
    ],
  },
  {
    id: 'water',
    narration: "You're in the water, but oil fires are spreading on the surface. Other men are screaming. A rescue boat is 50 yards away.",
    imageEmoji: '🌊',
    timeLimit: 8,
    choices: [
      {
        id: 'boat',
        text: 'Swim underwater toward the rescue boat',
        outcome: 'survive',
        resultText: 'You hold your breath and swim beneath the flames. The boat pulls you aboard.',
        nextStageId: 'escape',
      },
      {
        id: 'float',
        text: 'Float on your back to conserve energy',
        outcome: 'injury',
        resultText: 'The flames spread over you briefly before rescue arrives. You suffer burns.',
        nextStageId: 'escape',
      },
      {
        id: 'back',
        text: 'Try to climb back onto the ship',
        outcome: 'death',
        resultText: 'The ship is sinking. Going back was impossible.',
      },
    ],
  },
  {
    id: 'escape',
    narration: "You've made it to safety. You look back at the harbor - the Arizona is sinking, taking 1,177 men with her. You survived, but many friends did not.",
    imageEmoji: '🙏',
    timeLimit: 0,
    choices: [],
  },
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

export function EscapeTheBlaze({ onComplete, onBack, host = DEFAULT_HOST }: EscapTheBlazeProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentStageId, setCurrentStageId] = useState('start');
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [survived, setSurvived] = useState(true);
  const [injuries, setInjuries] = useState(0);
  const [path, setPath] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dialogue = getHostDialogue(host.id, 'escape-choice') || getHostDialogue('soldier', 'escape-choice')!;

  const currentStage = STAGES.find(s => s.id === currentStageId)!;

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showResult || !currentStage || currentStage.timeLimit === 0) return;

    setTimeLeft(currentStage.timeLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time ran out - automatic death
          clearInterval(timerRef.current!);
          handleChoice(currentStage.choices[currentStage.choices.length - 1]); // Pick worst option
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentStageId, showResult]);

  const handleChoice = (choice: typeof currentStage.choices[0]) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoice(choice.id);
    setShowResult(true);
    setPath(prev => [...prev, choice.id]);

    if (choice.outcome === 'death') {
      setSurvived(false);
      setFeedback(dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)]);
    } else if (choice.outcome === 'injury') {
      setInjuries(prev => prev + 1);
      setFeedback(dialogue.encouragement[Math.floor(Math.random() * dialogue.encouragement.length)]);
    } else {
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
    }

    setTimeout(() => {
      setFeedback(null);
      setShowResult(false);
      setSelectedChoice(null);

      if (choice.outcome === 'death' || !choice.nextStageId) {
        setGameState('results');
      } else {
        setCurrentStageId(choice.nextStageId);
      }
    }, 3000);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Escape the Blaze"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Escape the Blaze"
        stats={{
          score: survived ? (injuries === 0 ? 100 : 75) : 0,
          total: 100,
          xpEarned: survived ? 50 : 25,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentStageId('start');
          setSurvived(true);
          setInjuries(0);
          setPath([]);
          setTimeLeft(10);
          setGameState('playing');
        }}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header with Timer */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Escape the Blaze</h1>
        {currentStage.timeLimit > 0 && !showResult && (
          <div className={`flex items-center gap-1 ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
            <Clock size={16} />
            <span className="font-mono font-bold">{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 mt-2"
          >
            <HostFeedback host={host} text={feedback} type={survived ? 'correct' : 'incorrect'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          key={currentStage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          {/* Scene visual */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            {currentStage.imageEmoji}
          </motion.div>

          {/* Narration */}
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            {showResult
              ? currentStage.choices.find(c => c.id === selectedChoice)?.resultText
              : currentStage.narration
            }
          </p>

          {/* Choices */}
          {!showResult && currentStage.choices.length > 0 && (
            <div className="space-y-3">
              {currentStage.choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleChoice(choice)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-left transition-colors"
                >
                  <span className="text-white/90">{choice.text}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Final stage - no choices */}
          {currentStage.choices.length === 0 && !showResult && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => setGameState('results')}
              className="px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
            >
              Continue
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{host.avatar}</span>
          <span className="text-white/60 text-sm">{host.name}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {injuries > 0 && (
            <span className="text-yellow-400">Injuries: {injuries}</span>
          )}
          <span className="text-white/40">Choices: {path.length}</span>
        </div>
      </div>
    </div>
  );
}
