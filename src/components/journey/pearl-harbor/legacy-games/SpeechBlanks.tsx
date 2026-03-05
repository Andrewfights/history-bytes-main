/**
 * SpeechBlanks - Hook 11: Fill in the blanks of FDR's Day of Infamy speech
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2 } from 'lucide-react';

interface SpeechBlanksProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Blank {
  id: string;
  correctWord: string;
  position: number;
}

const SPEECH_PARTS = [
  { text: 'Yesterday, December 7th, 1941 — a date which will live in ', isBlank: false },
  { text: '', isBlank: true, blankId: 'infamy' },
  { text: ' — the United States of America was suddenly and ', isBlank: false },
  { text: '', isBlank: true, blankId: 'deliberately' },
  { text: ' attacked by naval and air forces of the Empire of ', isBlank: false },
  { text: '', isBlank: true, blankId: 'japan' },
  { text: '.', isBlank: false },
  { text: '\n\nThe United States was at ', isBlank: false },
  { text: '', isBlank: true, blankId: 'peace' },
  { text: ' with that nation...', isBlank: false },
  { text: '\n\nNo matter how long it may take us to overcome this premeditated ', isBlank: false },
  { text: '', isBlank: true, blankId: 'invasion' },
  { text: ', the American people in their righteous might will win through to absolute ', isBlank: false },
  { text: '', isBlank: true, blankId: 'victory' },
  { text: '.', isBlank: false },
];

const BLANKS: Blank[] = [
  { id: 'infamy', correctWord: 'infamy', position: 0 },
  { id: 'deliberately', correctWord: 'deliberately', position: 1 },
  { id: 'japan', correctWord: 'Japan', position: 2 },
  { id: 'peace', correctWord: 'peace', position: 3 },
  { id: 'invasion', correctWord: 'invasion', position: 4 },
  { id: 'victory', correctWord: 'victory', position: 5 },
];

const WORD_BANK = [
  'infamy', 'deliberately', 'Japan', 'peace', 'invasion', 'victory',
  'history', 'quickly', 'Germany', 'war', 'battle', 'defeat',
];

export function SpeechBlanks({ onComplete, onBack }: SpeechBlanksProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const correctCount = BLANKS.filter(
    blank => filledBlanks[blank.id]?.toLowerCase() === blank.correctWord.toLowerCase()
  ).length;

  const allFilled = Object.keys(filledBlanks).length === BLANKS.length;

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
  };

  const handleBlankClick = (blankId: string) => {
    if (selectedWord) {
      setFilledBlanks(prev => ({ ...prev, [blankId]: selectedWord }));
      setSelectedWord(null);
    }
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
    setTimeout(() => {
      setGameState('results');
    }, 2000);
  };

  const startGame = () => {
    setGameState('playing');
    setFilledBlanks({});
    setSelectedWord(null);
    setShowResults(false);
  };

  // Intro screen
  if (gameState === 'intro') {
    return (
      <div className="h-screen flex flex-col bg-slate-950">
        <Header onBack={onBack} />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl mb-6"
          >
            🎙️
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">Day of Infamy Speech</h2>
          <p className="text-white/60 mb-6">December 8, 1941 - President Franklin D. Roosevelt</p>

          <div className="max-w-sm text-white/50 text-sm mb-8">
            <p className="mb-4">
              The day after the attack, FDR addressed Congress and asked for
              a declaration of war against Japan.
            </p>
            <p>
              <strong className="text-white">Fill in the blanks</strong> to complete
              the famous speech.
            </p>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-colors"
          >
            Start Activity
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const accuracy = Math.round((correctCount / BLANKS.length) * 100);

    return (
      <div className="h-screen flex flex-col bg-slate-950">
        <Header onBack={onBack} />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-6xl mb-6"
          >
            {accuracy >= 80 ? '🎖️' : accuracy >= 50 ? '📜' : '📝'}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-6">Speech Complete!</h2>

          <div className="w-full max-w-xs mb-6">
            <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <div className="text-3xl font-bold text-amber-400">{correctCount}/{BLANKS.length}</div>
              <div className="text-sm text-amber-400/70">Words Correct</div>
            </div>
          </div>

          <p className="text-white/60 mb-8">Accuracy: {accuracy}%</p>

          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
            >
              Continue (+30 XP)
            </button>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <Header onBack={onBack} />

      {/* Audio Control */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 border-b border-white/10">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span className="text-sm">{isPlaying ? 'Pause' : 'Play Speech'}</span>
        </button>
        <Volume2 size={20} className="text-white/40" />
      </div>

      {/* Speech Text */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto">
          <p className="text-lg leading-loose text-white/90">
            {SPEECH_PARTS.map((part, index) => {
              if (part.isBlank && part.blankId) {
                const filled = filledBlanks[part.blankId];
                const isCorrect = showResults &&
                  filled?.toLowerCase() === BLANKS.find(b => b.id === part.blankId)?.correctWord.toLowerCase();
                const isWrong = showResults && filled && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleBlankClick(part.blankId!)}
                    className={`inline-block min-w-[80px] px-2 py-1 mx-1 rounded-lg border-2 border-dashed transition-all ${
                      filled
                        ? isCorrect
                          ? 'bg-green-500/30 border-green-500 text-green-400'
                          : isWrong
                          ? 'bg-red-500/30 border-red-500 text-red-400'
                          : 'bg-amber-500/30 border-amber-500 text-amber-400'
                        : selectedWord
                        ? 'border-amber-500 text-white cursor-pointer hover:bg-amber-500/20'
                        : 'border-white/30 text-white/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filled || '______'}
                  </motion.button>
                );
              }
              return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</span>;
            })}
          </p>
        </div>
      </div>

      {/* Word Bank */}
      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-white/50 mb-2 text-center">Tap a word, then tap a blank</p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {WORD_BANK.map((word) => {
            const isUsed = Object.values(filledBlanks).includes(word);
            return (
              <motion.button
                key={word}
                onClick={() => !isUsed && handleWordSelect(word)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedWord === word
                    ? 'bg-amber-500 text-white'
                    : isUsed
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                whileHover={{ scale: isUsed ? 1 : 1.05 }}
                whileTap={{ scale: isUsed ? 1 : 0.95 }}
                disabled={isUsed}
              >
                {word}
              </motion.button>
            );
          })}
        </div>

        {allFilled && !showResults && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleCheckAnswers}
            className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
          >
            Check Answers
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="font-editorial text-lg font-bold text-white">Day of Infamy</h1>
      <div className="w-10" />
    </div>
  );
}
