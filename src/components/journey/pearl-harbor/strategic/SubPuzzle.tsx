/**
 * SubPuzzle - Hook 9: Assemble the midget submarine puzzle with audio logs
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw, Volume2, VolumeX, Lightbulb } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface SubPuzzleProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  label: string;
  emoji: string;
}

interface AudioLog {
  id: string;
  title: string;
  text: string;
  duration: number;
}

const AUDIO_LOGS: AudioLog[] = [
  {
    id: '1',
    title: 'Pre-Dawn Launch',
    text: "We launched from the mother sub at 0300. The harbor entrance is ahead. Our orders are clear - penetrate the harbor and attack the battleships.",
    duration: 8,
  },
  {
    id: '2',
    title: 'Detection',
    text: "The American destroyer has spotted us. We're diving deep. The torpedoes are armed. If we can just reach Battleship Row...",
    duration: 7,
  },
  {
    id: '3',
    title: 'Final Moments',
    text: "The depth charges are close. Our gyrocompass is failing. We will not return home, but we will complete our mission.",
    duration: 7,
  },
];

const INITIAL_PIECES: PuzzlePiece[] = [
  { id: 1, correctPosition: 0, currentPosition: 2, label: 'Bow', emoji: '🔺' },
  { id: 2, correctPosition: 1, currentPosition: 5, label: 'Forward Hull', emoji: '🔹' },
  { id: 3, correctPosition: 2, currentPosition: 0, label: 'Conning Tower', emoji: '🔷' },
  { id: 4, correctPosition: 3, currentPosition: 4, label: 'Mid Hull', emoji: '🔹' },
  { id: 5, correctPosition: 4, currentPosition: 1, label: 'Engine', emoji: '⚙️' },
  { id: 6, correctPosition: 5, currentPosition: 3, label: 'Stern', emoji: '🔻' },
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

export function SubPuzzle({ onComplete, onBack, host = DEFAULT_HOST }: SubPuzzleProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'audio' | 'results'>('intro');
  const [pieces, setPieces] = useState<PuzzlePiece[]>(INITIAL_PIECES);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [currentLog, setCurrentLog] = useState(0);
  const [logProgress, setLogProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const dialogue = getHostDialogue(host.id, 'sub-puzzle') || getHostDialogue('soldier', 'sub-puzzle')!;

  const isPuzzleComplete = pieces.every(p => p.currentPosition === p.correctPosition);

  // Check for puzzle completion
  useEffect(() => {
    if (isPuzzleComplete && gameState === 'playing') {
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
      setTimeout(() => {
        setFeedback(null);
        setGameState('audio');
        setIsPlaying(true);
      }, 2000);
    }
  }, [isPuzzleComplete, gameState]);

  // Audio log playback simulation
  useEffect(() => {
    if (!isPlaying || gameState !== 'audio') return;

    const log = AUDIO_LOGS[currentLog];
    const timer = setInterval(() => {
      setLogProgress(prev => {
        if (prev >= log.duration) {
          clearInterval(timer);
          if (currentLog < AUDIO_LOGS.length - 1) {
            setCurrentLog(prev => prev + 1);
            setLogProgress(0);
          } else {
            setIsPlaying(false);
            setTimeout(() => setGameState('results'), 1500);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentLog, gameState]);

  const handlePieceClick = (pieceId: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else {
      // Swap pieces
      const piece1 = pieces.find(p => p.id === selectedPiece)!;
      const piece2 = pieces.find(p => p.id === pieceId)!;

      setPieces(prev => prev.map(p => {
        if (p.id === selectedPiece) {
          return { ...p, currentPosition: piece2.currentPosition };
        }
        if (p.id === pieceId) {
          return { ...p, currentPosition: piece1.currentPosition };
        }
        return p;
      }));

      setMoves(prev => prev + 1);
      setSelectedPiece(null);
    }
  };

  const resetPuzzle = () => {
    setPieces(INITIAL_PIECES);
    setMoves(0);
    setSelectedPiece(null);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Submarine Puzzle"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Submarine Puzzle"
        stats={{
          score: Math.max(0, 100 - moves * 5),
          total: 100,
          xpEarned: 25,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setPieces(INITIAL_PIECES);
          setMoves(0);
          setCurrentLog(0);
          setLogProgress(0);
          setGameState('playing');
        }}
        customMessage="Five Type A midget submarines were deployed. None returned. Their sacrifice revealed Japan's commitment to the attack."
      />
    );
  }

  if (gameState === 'audio') {
    const log = AUDIO_LOGS[currentLog];
    const progress = (logProgress / log.duration) * 100;

    return (
      <div className="h-screen flex flex-col bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-editorial text-lg font-bold text-white">Crew Logs</h1>
          <div className="text-white/60 text-sm">{currentLog + 1}/{AUDIO_LOGS.length}</div>
        </div>

        {/* Progress */}
        <div className="px-4 py-2">
          <div className="flex gap-1">
            {AUDIO_LOGS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < currentLog ? 'bg-green-500' : i === currentLog ? 'bg-amber-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Audio Log Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Sub visual */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl"
              >
                🛥️
              </motion.div>
              <p className="text-amber-400 text-sm mt-2">Type A Midget Submarine</p>
            </div>

            {/* Log card */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                {isPlaying ? (
                  <Volume2 size={18} className="text-amber-400 animate-pulse" />
                ) : (
                  <VolumeX size={18} className="text-white/40" />
                )}
                <span className="text-amber-400 font-medium">{log.title}</span>
              </div>

              <p className="text-white/80 text-lg leading-relaxed italic">
                "{log.text}"
              </p>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-2">{logProgress}s / {log.duration}s</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Host indicator */}
        <div className="px-4 py-3 bg-black/50 flex items-center justify-center gap-2">
          <span className="text-lg">{host.avatar}</span>
          <span className="text-white/60 text-sm">Recovered audio logs...</span>
        </div>
      </div>
    );
  }

  // Puzzle state
  const sortedByPosition = [...pieces].sort((a, b) => a.currentPosition - b.currentPosition);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Submarine Puzzle</h1>
        <button onClick={resetPuzzle} className="p-2 text-white/60 hover:text-white">
          <RotateCw size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 bg-black/30 flex items-center justify-between">
        <span className="text-white/60 text-sm">Moves: {moves}</span>
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 text-amber-400 text-sm"
        >
          <Lightbulb size={14} />
          <span>Hint</span>
        </button>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-amber-500/10"
          >
            <p className="text-amber-300 text-sm">
              Arrange the submarine from bow (front) to stern (back): Bow, Forward Hull, Conning Tower, Mid Hull, Engine, Stern
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 mt-2"
          >
            <HostFeedback host={host} text={feedback} type="correct" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Puzzle Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Submarine outline */}
          <div className="text-center mb-4">
            <p className="text-white/50 text-sm">Type A Midget Submarine</p>
            <p className="text-white/30 text-xs">Two-man crew, 2 torpedoes</p>
          </div>

          {/* Reference image */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl">🔺</span>
              <span className="text-2xl">🔹</span>
              <span className="text-2xl">🔷</span>
              <span className="text-2xl">🔹</span>
              <span className="text-2xl">⚙️</span>
              <span className="text-2xl">🔻</span>
            </div>
            <p className="text-center text-white/40 text-xs mt-2">Complete submarine</p>
          </div>

          {/* Puzzle pieces */}
          <div className="grid grid-cols-6 gap-2">
            {sortedByPosition.map((piece) => {
              const isSelected = selectedPiece === piece.id;
              const isCorrect = piece.currentPosition === piece.correctPosition;

              return (
                <motion.button
                  key={piece.id}
                  onClick={() => handlePieceClick(piece.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500/30 border-amber-500'
                      : isCorrect
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span className="text-2xl">{piece.emoji}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Labels */}
          <div className="grid grid-cols-6 gap-2 mt-2">
            {sortedByPosition.map((piece) => (
              <div key={piece.id} className="text-center">
                <span className="text-white/50 text-xs">{piece.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <p className="text-center text-white/40 text-sm mt-6">
            {selectedPiece ? 'Tap another piece to swap' : 'Tap a piece to select it'}
          </p>
        </div>
      </div>

      {/* Facts */}
      <div className="px-4 py-3 bg-black/50">
        <p className="text-white/50 text-xs text-center">
          78 feet long, carried by larger I-class submarines to within 10 miles of Pearl Harbor.
        </p>
      </div>
    </div>
  );
}
