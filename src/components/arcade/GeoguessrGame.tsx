import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, HelpCircle, Clock, Sparkles, MapPin, Calendar, FileQuestion, Trophy, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  HistoricalScene,
  GeoguessrMode,
  Clue,
  getRandomScenes,
  GEOGUESSR_SCORING,
} from '@/data/geoguessrData';

interface GeoguessrGameProps {
  mode: GeoguessrMode;
  onBack: () => void;
  onComplete: (xp: number) => void;
}

type GamePhase = 'intro' | 'playing' | 'reveal' | 'results';

const modeConfig: Record<GeoguessrMode, { title: string; question: string; icon: React.ReactNode }> = {
  where: {
    title: 'Where in History?',
    question: 'Where did this take place?',
    icon: <MapPin size={20} />,
  },
  when: {
    title: 'When in History?',
    question: 'When did this happen?',
    icon: <Calendar size={20} />,
  },
  what: {
    title: 'What Happened Here?',
    question: 'What event is this?',
    icon: <FileQuestion size={20} />,
  },
};

export function GeoguessrGame({ mode, onBack, onComplete }: GeoguessrGameProps) {
  const { addXP, recordArcadePlay } = useApp();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [scenes, setScenes] = useState<HistoricalScene[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [revealedClues, setRevealedClues] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  const config = modeConfig[mode];
  const currentScene = scenes[currentRound];

  // Initialize game
  useEffect(() => {
    const randomScenes = getRandomScenes(GEOGUESSR_SCORING.ROUNDS_PER_GAME);
    setScenes(randomScenes);
  }, []);

  const startGame = useCallback(() => {
    setPhase('playing');
    setRoundStartTime(Date.now());
  }, []);

  const revealClue = useCallback(() => {
    if (!currentScene) return;
    const unrevealedClue = currentScene.clues.find(c => !revealedClues.includes(c.id));
    if (unrevealedClue) {
      setRevealedClues(prev => [...prev, unrevealedClue.id]);
    }
  }, [currentScene, revealedClues]);

  const getOptions = useCallback(() => {
    if (!currentScene) return [];
    switch (mode) {
      case 'where':
        return currentScene.options.locations || [];
      case 'when':
        return currentScene.options.years || [];
      case 'what':
        return currentScene.options.events || [];
    }
  }, [currentScene, mode]);

  const getCorrectAnswer = useCallback(() => {
    if (!currentScene) return null;
    switch (mode) {
      case 'where':
        return currentScene.location;
      case 'when':
        return currentScene.year;
      case 'what':
        return currentScene.event;
    }
  }, [currentScene, mode]);

  const submitAnswer = useCallback((answer: string | number) => {
    if (!currentScene || selectedAnswer !== null) return;

    const timeTaken = (Date.now() - roundStartTime) / 1000;
    const correct = answer === getCorrectAnswer();

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    // Calculate score
    let roundXP = 0;
    if (correct) {
      roundXP = GEOGUESSR_SCORING.BASE_XP;

      // Time bonus
      if (timeTaken < 30) {
        roundXP += GEOGUESSR_SCORING.TIME_BONUS_FAST;
      } else if (timeTaken < 60) {
        roundXP += GEOGUESSR_SCORING.TIME_BONUS_MEDIUM;
      }

      // Clue penalty
      roundXP -= revealedClues.length * GEOGUESSR_SCORING.CLUE_PENALTY;
    } else {
      roundXP = Math.max(0, GEOGUESSR_SCORING.BASE_XP - GEOGUESSR_SCORING.WRONG_ANSWER_PENALTY);
    }

    roundXP = Math.max(0, roundXP);
    setRoundScores(prev => [...prev, roundXP]);
    setTotalXP(prev => prev + roundXP);

    setPhase('reveal');
  }, [currentScene, selectedAnswer, roundStartTime, getCorrectAnswer, revealedClues.length]);

  const nextRound = useCallback(() => {
    if (currentRound + 1 >= GEOGUESSR_SCORING.ROUNDS_PER_GAME) {
      // Game complete
      addXP(totalXP);
      recordArcadePlay('geoguessr', totalXP);
      setPhase('results');
    } else {
      // Next round
      setCurrentRound(prev => prev + 1);
      setRevealedClues([]);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setRoundStartTime(Date.now());
      setPhase('playing');
    }
  }, [currentRound, totalXP, addXP, recordArcadePlay]);

  const handleComplete = () => {
    onComplete(totalXP);
    onBack();
  };

  if (scenes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading scenes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Exit</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium">
            {config.icon}
            <span>{config.title}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentRound + 1}/{GEOGUESSR_SCORING.ROUNDS_PER_GAME}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <IntroScreen
            key="intro"
            mode={mode}
            config={config}
            onStart={startGame}
          />
        )}

        {phase === 'playing' && currentScene && (
          <PlayingScreen
            key="playing"
            scene={currentScene}
            mode={mode}
            config={config}
            revealedClues={revealedClues}
            onRevealClue={revealClue}
            options={getOptions()}
            onSubmit={submitAnswer}
          />
        )}

        {phase === 'reveal' && currentScene && (
          <RevealScreen
            key="reveal"
            scene={currentScene}
            isCorrect={isCorrect!}
            selectedAnswer={selectedAnswer}
            correctAnswer={getCorrectAnswer()!}
            roundXP={roundScores[currentRound]}
            onContinue={nextRound}
          />
        )}

        {phase === 'results' && (
          <ResultsScreen
            key="results"
            totalXP={totalXP}
            roundScores={roundScores}
            scenes={scenes}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Intro Screen
interface IntroScreenProps {
  mode: GeoguessrMode;
  config: { title: string; question: string; icon: React.ReactNode };
  onStart: () => void;
}

function IntroScreen({ mode, config, onStart }: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-4 py-8 text-center"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-4xl">🗺️</span>
      </div>

      <h1 className="font-editorial text-2xl font-bold mb-2">{config.title}</h1>

      <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
        Study historical images and {mode === 'where' ? 'identify the location' : mode === 'when' ? 'guess the year' : 'name the event'}.
      </p>

      <div className="bg-card rounded-xl p-4 mb-6 max-w-sm mx-auto text-left">
        <h3 className="font-semibold mb-3">How to Play</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">1.</span>
            Study the historical scene
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">2.</span>
            Use clues if you need help (costs XP)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">3.</span>
            Select your answer from the options
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">4.</span>
            Earn bonus XP for fast, accurate answers
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {GEOGUESSR_SCORING.ROUNDS_PER_GAME} rounds
        </span>
        <span className="flex items-center gap-1">
          <Sparkles size={14} />
          Up to {GEOGUESSR_SCORING.MAX_XP_PER_GAME} XP
        </span>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
      >
        Start Game
      </button>
    </motion.div>
  );
}

// Playing Screen
interface PlayingScreenProps {
  scene: HistoricalScene;
  mode: GeoguessrMode;
  config: { title: string; question: string; icon: React.ReactNode };
  revealedClues: string[];
  onRevealClue: () => void;
  options: (string | number)[];
  onSubmit: (answer: string | number) => void;
}

function PlayingScreen({
  scene,
  mode,
  config,
  revealedClues,
  onRevealClue,
  options,
  onSubmit,
}: PlayingScreenProps) {
  const availableClues = scene.clues.filter(c => !revealedClues.includes(c.id));
  const revealedClueObjects = scene.clues.filter(c => revealedClues.includes(c.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20"
    >
      {/* Scene Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
          🖼️
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Analyzing...
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Question */}
        <div className="flex items-center gap-2 mb-4 text-primary">
          {config.icon}
          <span className="font-semibold">{config.question}</span>
        </div>

        {/* Clues Panel */}
        <div className="bg-card rounded-xl border border-border mb-4">
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <span className="text-sm font-medium flex items-center gap-2">
              <HelpCircle size={14} />
              Clues ({revealedClues.length}/{scene.clues.length})
            </span>
            {availableClues.length > 0 && (
              <button
                onClick={onRevealClue}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                Reveal Clue (-{GEOGUESSR_SCORING.CLUE_PENALTY} XP)
              </button>
            )}
          </div>
          <div className="p-3 space-y-2 min-h-[80px]">
            {revealedClueObjects.length > 0 ? (
              revealedClueObjects.map((clue, idx) => (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-primary">•</span>
                  <span>{clue.text}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No clues revealed yet</p>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          {options.map((option, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSubmit(option)}
              className="w-full p-4 rounded-xl bg-card border border-border text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span className="text-sm font-medium">{option}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Reveal Screen
interface RevealScreenProps {
  scene: HistoricalScene;
  isCorrect: boolean;
  selectedAnswer: string | number | null;
  correctAnswer: string | number;
  roundXP: number;
  onContinue: () => void;
}

function RevealScreen({
  scene,
  isCorrect,
  selectedAnswer,
  correctAnswer,
  roundXP,
  onContinue,
}: RevealScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-6"
    >
      {/* Result Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}
      >
        <span className="text-4xl">{isCorrect ? '✓' : '✗'}</span>
      </motion.div>

      <h2 className={`text-center font-editorial text-xl font-bold mb-1 ${
        isCorrect ? 'text-green-400' : 'text-red-400'
      }`}>
        {isCorrect ? 'Correct!' : 'Not Quite!'}
      </h2>

      <p className="text-center text-muted-foreground text-sm mb-4">
        {isCorrect ? 'Great historical knowledge!' : `The answer was: ${correctAnswer}`}
      </p>

      {/* Event Info Card */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-2">{scene.event}</h3>
        <p className="text-sm text-muted-foreground mb-3">{scene.revealText}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{scene.year}</span>
          <span>•</span>
          <span>{scene.location}</span>
        </div>
      </div>

      {/* Fun Fact */}
      <div className="bg-primary/10 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-primary mb-1">Fun Fact</p>
        <p className="text-sm">{scene.funFact}</p>
      </div>

      {/* XP Earned */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles size={18} className="text-primary" />
        <span className="font-bold text-lg text-primary">+{roundXP} XP</span>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold"
      >
        Continue
      </button>
    </motion.div>
  );
}

// Results Screen
interface ResultsScreenProps {
  totalXP: number;
  roundScores: number[];
  scenes: HistoricalScene[];
  onComplete: () => void;
}

function ResultsScreen({ totalXP, roundScores, scenes, onComplete }: ResultsScreenProps) {
  const correctCount = roundScores.filter(s => s >= GEOGUESSR_SCORING.BASE_XP - GEOGUESSR_SCORING.CLUE_PENALTY * 4).length;
  const percentage = Math.round((correctCount / scenes.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
      >
        <Trophy size={48} className="text-primary" />
      </motion.div>

      <h1 className="font-editorial text-2xl font-bold mb-1">Game Complete!</h1>
      <p className="text-muted-foreground mb-6">{correctCount}/{scenes.length} correct ({percentage}%)</p>

      {/* Total XP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 text-primary font-bold text-xl mb-6"
      >
        <Sparkles size={20} />
        <span>+{totalXP} XP</span>
      </motion.div>

      {/* Round Breakdown */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 text-left">
        <h3 className="font-semibold text-sm mb-3">Round Breakdown</h3>
        <div className="space-y-2">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate max-w-[200px]">{scene.event}</span>
              <span className={roundScores[idx] >= GEOGUESSR_SCORING.BASE_XP - GEOGUESSR_SCORING.CLUE_PENALTY * 4 ? 'text-green-400' : 'text-red-400'}>
                +{roundScores[idx]} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold"
      >
        Back to Arcade
      </button>
    </motion.div>
  );
}

export default GeoguessrGame;
