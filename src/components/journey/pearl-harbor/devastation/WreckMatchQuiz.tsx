/**
 * WreckMatchQuiz - Hook 3: Match ships to their casualty counts
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface WreckMatchQuizProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface Ship {
  id: string;
  name: string;
  casualties: number;
  fate: string;
  detail: string;
}

const SHIPS: Ship[] = [
  { id: 'arizona', name: 'USS Arizona', casualties: 1177, fate: 'Sunk', detail: 'Destroyed by bomb in forward magazine. Still lies in Pearl Harbor.' },
  { id: 'oklahoma', name: 'USS Oklahoma', casualties: 429, fate: 'Capsized', detail: 'Hit by 9 torpedoes and capsized within 12 minutes.' },
  { id: 'westvirginia', name: 'USS West Virginia', casualties: 106, fate: 'Sunk', detail: 'Hit by 7 torpedoes but later raised and returned to service.' },
  { id: 'california', name: 'USS California', casualties: 100, fate: 'Sunk', detail: 'Settled to the harbor floor but was repaired.' },
  { id: 'nevada', name: 'USS Nevada', casualties: 60, fate: 'Beached', detail: 'Only battleship to get underway; beached to avoid blocking harbor.' },
  { id: 'maryland', name: 'USS Maryland', casualties: 4, fate: 'Damaged', detail: 'Protected by Oklahoma, sustained minor damage.' },
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

export function WreckMatchQuiz({ onComplete, onBack, host = DEFAULT_HOST }: WreckMatchQuizProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dialogue = getHostDialogue(host.id, 'wreck-match') || getHostDialogue('soldier', 'wreck-match')!;

  const currentShip = SHIPS[currentIndex];

  // Generate answer options (correct + 3 wrong)
  const generateOptions = () => {
    const correctAnswer = currentShip.casualties;
    const options = [correctAnswer];

    // Generate plausible wrong answers
    const variants = [
      Math.max(1, correctAnswer - Math.floor(Math.random() * 200 + 50)),
      correctAnswer + Math.floor(Math.random() * 200 + 50),
      Math.max(1, Math.floor(correctAnswer * (0.3 + Math.random() * 0.4))),
      Math.floor(correctAnswer * (1.5 + Math.random() * 0.5)),
    ].filter(v => v !== correctAnswer);

    while (options.length < 4 && variants.length > 0) {
      const idx = Math.floor(Math.random() * variants.length);
      options.push(variants.splice(idx, 1)[0]);
    }

    // Shuffle
    return options.sort(() => Math.random() - 0.5);
  };

  const [options] = useState(() => generateOptions());
  const [currentOptions, setCurrentOptions] = useState(options);

  useEffect(() => {
    // Regenerate options when ship changes
    const correct = currentShip.casualties;
    const newOptions = [correct];
    const variants = [
      Math.max(1, correct - Math.floor(Math.random() * 200 + 50)),
      correct + Math.floor(Math.random() * 200 + 50),
      Math.max(1, Math.floor(correct * (0.3 + Math.random() * 0.4))),
    ];
    while (newOptions.length < 4 && variants.length > 0) {
      const idx = Math.floor(Math.random() * variants.length);
      newOptions.push(variants.splice(idx, 1)[0]);
    }
    setCurrentOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [currentIndex]);

  const handleAnswer = (answer: number) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentShip.casualties;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
    } else {
      setFeedback(dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)]);
    }

    setTimeout(() => {
      setFeedback(null);
      setShowResult(false);
      setSelectedAnswer(null);

      if (currentIndex < SHIPS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setGameState('results');
      }
    }, 2500);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Wreck Match"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Wreck Match"
        stats={{
          score,
          total: SHIPS.length,
          xpEarned: 30,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentIndex(0);
          setScore(0);
          setGameState('playing');
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
        <h1 className="font-editorial text-lg font-bold text-white">Wreck Match</h1>
        <div className="text-white/60 text-sm">{currentIndex + 1}/{SHIPS.length}</div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex gap-1">
          {SHIPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentIndex ? 'bg-green-500' : i === currentIndex ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <HostFeedback
              host={host}
              text={feedback}
              type={selectedAnswer === currentShip.casualties ? 'correct' : 'incorrect'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ship Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          key={currentShip.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          {/* Ship visual */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-black rounded-2xl p-6 border border-white/10 mb-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🚢</div>
              <h2 className="text-xl font-bold text-white">{currentShip.name}</h2>
              <p className="text-amber-400 text-sm font-medium">{currentShip.fate}</p>
            </div>

            <p className="text-white/60 text-sm text-center leading-relaxed">
              {currentShip.detail}
            </p>
          </div>

          {/* Question */}
          <p className="text-center text-white/80 mb-4">
            How many crew members were lost?
          </p>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentOptions.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentShip.casualties;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    showCorrect
                      ? 'bg-green-500/30 border-green-500'
                      : showWrong
                      ? 'bg-red-500/30 border-red-500'
                      : isSelected
                      ? 'bg-white/20 border-white/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {showCorrect && <Check size={20} className="text-green-400" />}
                    {showWrong && <X size={20} className="text-red-400" />}
                    <span className="text-xl font-bold text-white">{option.toLocaleString()}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Host indicator */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-center gap-2">
        <span className="text-lg">{host.avatar}</span>
        <span className="text-white/60 text-sm">Score: {score}/{currentIndex}</span>
      </div>
    </div>
  );
}
