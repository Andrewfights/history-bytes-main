/**
 * WhatIfSim - Hook 6: What if the radar warning had been relayed?
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radio, AlertTriangle, CheckCircle } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface WhatIfSimProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface SimChoice {
  id: string;
  text: string;
  isHistorical: boolean;
  outcome: string;
  nextStageId: string;
}

interface SimStage {
  id: string;
  time: string;
  location: string;
  narration: string;
  imageEmoji: string;
  choices?: SimChoice[];
}

const SIM_STAGES: SimStage[] = [
  {
    id: 'radar-contact',
    time: '7:02 AM',
    location: 'Opana Point Radar Station',
    narration: "Private George Elliott sees a massive blip on the radar screen - the largest he's ever seen. It's 136 miles out, approaching from the north.",
    imageEmoji: '📡',
    choices: [
      {
        id: 'report',
        text: 'Report immediately to Fort Shafter',
        isHistorical: true,
        outcome: 'You call the Information Center at Fort Shafter.',
        nextStageId: 'call-shafter',
      },
      {
        id: 'ignore',
        text: 'Dismiss it as equipment malfunction',
        isHistorical: false,
        outcome: 'The contact grows larger. This is no malfunction.',
        nextStageId: 'call-shafter',
      },
    ],
  },
  {
    id: 'call-shafter',
    time: '7:10 AM',
    location: 'Information Center, Fort Shafter',
    narration: "Lieutenant Kermit Tyler answers your call. You report the massive formation approaching from the north. He thinks for a moment...",
    imageEmoji: '📞',
    choices: [
      {
        id: 'dismiss',
        text: '"Don\'t worry about it" - It\'s probably B-17s from California',
        isHistorical: true,
        outcome: 'Lt. Tyler dismisses the warning. A flight of B-17s was expected from the mainland.',
        nextStageId: 'historical-outcome',
      },
      {
        id: 'alert',
        text: '"Sound the alarm!" - Scramble all fighters immediately',
        isHistorical: false,
        outcome: 'The warning is taken seriously. The alarm spreads across Oahu.',
        nextStageId: 'alternate-outcome',
      },
    ],
  },
  {
    id: 'historical-outcome',
    time: '7:48 AM',
    location: 'Pearl Harbor',
    narration: "The first bombs fall on Ford Island and Hickam Field. 183 Japanese aircraft have achieved complete surprise. The radar warning was ignored.",
    imageEmoji: '💥',
  },
  {
    id: 'alternate-outcome',
    time: '7:30 AM',
    location: 'Wheeler Field',
    narration: "P-40 and P-36 fighters scramble from Wheeler Field. Anti-aircraft crews man their positions. The element of surprise is lost.",
    imageEmoji: '✈️',
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

export function WhatIfSim({ onComplete, onBack, host = DEFAULT_HOST }: WhatIfSimProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentStageId, setCurrentStageId] = useState('radar-contact');
  const [path, setPath] = useState<string[]>([]);
  const [followedHistory, setFollowedHistory] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dialogue = getHostDialogue(host.id, 'what-if') || getHostDialogue('soldier', 'what-if')!;

  const currentStage = SIM_STAGES.find(s => s.id === currentStageId)!;
  const isEndStage = currentStage.id === 'historical-outcome' || currentStage.id === 'alternate-outcome';

  const handleChoice = (choice: SimChoice) => {
    setPath(prev => [...prev, choice.id]);

    if (!choice.isHistorical) {
      setFollowedHistory(false);
    }

    if (choice.isHistorical) {
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
    } else {
      setFeedback(dialogue.encouragement[Math.floor(Math.random() * dialogue.encouragement.length)]);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentStageId(choice.nextStageId);

      // Check if we've reached an end stage
      const nextStage = SIM_STAGES.find(s => s.id === choice.nextStageId);
      if (nextStage && !nextStage.choices) {
        setTimeout(() => {
          setGameState('results');
        }, 4000);
      }
    }, 2500);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="What If...?"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    const wasAlternate = currentStageId === 'alternate-outcome';

    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="What If...?"
        stats={{
          score: followedHistory ? 100 : 50,
          total: 100,
          xpEarned: 40,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentStageId('radar-contact');
          setPath([]);
          setFollowedHistory(true);
          setGameState('playing');
        }}
        customMessage={
          wasAlternate
            ? "You changed history. With 30+ minutes warning, defenses could have been raised. Casualties may have been significantly lower."
            : "You followed the tragic historical path. The warning was dismissed as friendly aircraft, and 2,403 Americans paid the ultimate price."
        }
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
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">What If...?</h1>
          <p className="text-xs text-amber-400">{currentStage.time}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Timeline */}
      <div className="px-4 py-2 bg-black/30">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>7:02 AM</span>
          <span>7:48 AM</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full mt-1">
          <motion.div
            className="h-full bg-amber-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: currentStageId === 'radar-contact' ? '10%' :
                currentStageId === 'call-shafter' ? '50%' : '100%'
            }}
          />
        </div>
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
            <HostFeedback
              host={host}
              text={feedback}
              type={followedHistory ? 'info' : 'correct'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          key={currentStage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm mb-4">
            <Radio size={14} />
            <span>{currentStage.location}</span>
          </div>

          {/* Visual */}
          <motion.div
            animate={isEndStage ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: isEndStage ? Infinity : 0 }}
            className="text-7xl mb-6"
          >
            {currentStage.imageEmoji}
          </motion.div>

          {/* Narration */}
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            {currentStage.narration}
          </p>

          {/* Choices */}
          {currentStage.choices && !feedback && (
            <div className="space-y-3">
              {currentStage.choices.map((choice) => (
                <motion.button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {choice.isHistorical ? (
                      <AlertTriangle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-white/90">{choice.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* End stage message */}
          {isEndStage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className={`mt-6 p-4 rounded-xl ${
                currentStageId === 'alternate-outcome'
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
            >
              <p className="text-white/80 text-sm">
                {currentStageId === 'alternate-outcome'
                  ? "You chose to change history. Would the outcome have been different?"
                  : "This is what actually happened. The warning was dismissed."
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Host indicator */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-center gap-2">
        <span className="text-lg">{host.avatar}</span>
        <span className="text-white/60 text-sm">
          {followedHistory ? "Following history..." : "Rewriting history..."}
        </span>
      </div>
    </div>
  );
}
