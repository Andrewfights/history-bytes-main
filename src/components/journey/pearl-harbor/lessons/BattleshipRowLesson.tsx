/**
 * BattleshipRowLesson - Lesson 5: Battleship Row
 *
 * Screens:
 * 1. Intro - "The heart of the Pacific Fleet"
 * 2. Before/After - See the destruction with slider
 * 3. Ship Details - Tap ships to learn their fates
 * 4. Challenge - "Tap the two ships that were total losses"
 * 5. Completion - Statistics and memorial info
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward, Ship, Timer, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { WW2Host } from '@/types';

interface BattleshipRowLessonProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'intro' | 'beforeafter' | 'details' | 'challenge' | 'completion';

// Lesson content
const LESSON_DATA = {
  title: 'Battleship Row',
  subtitle: 'The heart of the Pacific Fleet',
  xpReward: 50,
  ships: [
    {
      id: 'arizona',
      name: 'USS Arizona',
      position: { x: 25, y: 35 },
      fate: 'Sunk',
      status: 'total-loss',
      casualties: 1177,
      details: 'A bomb penetrated the forward magazine, causing a catastrophic explosion. The ship sank in less than 9 minutes. She remains a memorial where she fell.',
      color: '#ef4444',
    },
    {
      id: 'oklahoma',
      name: 'USS Oklahoma',
      position: { x: 40, y: 40 },
      fate: 'Capsized',
      status: 'total-loss',
      casualties: 429,
      details: 'Hit by multiple torpedoes, she rolled over and sank. Though later raised, she was too damaged to repair and sank while being towed to the mainland.',
      color: '#ef4444',
    },
    {
      id: 'west-virginia',
      name: 'USS West Virginia',
      position: { x: 55, y: 45 },
      fate: 'Sunk - Later Raised',
      status: 'repaired',
      casualties: 106,
      details: 'Hit by multiple torpedoes and bombs, she sank upright. After extensive repairs, she returned to service and was present at Japan\'s surrender.',
      color: '#f59e0b',
    },
    {
      id: 'california',
      name: 'USS California',
      position: { x: 70, y: 50 },
      fate: 'Sunk - Later Raised',
      status: 'repaired',
      casualties: 100,
      details: 'Torpedoed and bombed, she slowly flooded and sank over three days. After repairs, she returned to fight in the Philippines.',
      color: '#f59e0b',
    },
    {
      id: 'nevada',
      name: 'USS Nevada',
      position: { x: 35, y: 55 },
      fate: 'Damaged',
      status: 'repaired',
      casualties: 60,
      details: 'The only battleship to get underway during the attack. Intentionally beached to avoid blocking the harbor channel. Repaired and returned to service.',
      color: '#22c55e',
    },
    {
      id: 'tennessee',
      name: 'USS Tennessee',
      position: { x: 50, y: 60 },
      fate: 'Damaged',
      status: 'repaired',
      casualties: 5,
      details: 'Protected by the USS West Virginia, she suffered minimal damage. Quickly repaired and returned to service.',
      color: '#22c55e',
    },
    {
      id: 'maryland',
      name: 'USS Maryland',
      position: { x: 65, y: 55 },
      fate: 'Damaged',
      status: 'repaired',
      casualties: 4,
      details: 'Shielded by the USS Oklahoma, she was lightly damaged by bombs. The first battleship to return to service after the attack.',
      color: '#22c55e',
    },
    {
      id: 'pennsylvania',
      name: 'USS Pennsylvania',
      position: { x: 80, y: 45 },
      fate: 'Damaged',
      status: 'repaired',
      casualties: 9,
      details: 'In drydock during the attack, she was hit by one bomb but suffered relatively light damage. Quickly returned to service.',
      color: '#22c55e',
    },
  ],
  totalLosses: ['arizona', 'oklahoma'],
  statistics: {
    battleships: 8,
    sunk: 4,
    damaged: 4,
    totalLoss: 2,
    repaired: 6,
    casualties: 1890,
  },
};

export function BattleshipRowLesson({ host, onComplete, onSkip, onBack }: BattleshipRowLessonProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [viewedShips, setViewedShips] = useState<string[]>([]);
  const [challengeTaps, setChallengeTaps] = useState<string[]>([]);
  const [challengeResult, setChallengeResult] = useState<'success' | 'fail' | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());

  // Challenge timer
  useEffect(() => {
    if (screen === 'challenge' && challengeStarted && timeLeft > 0 && !challengeResult) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setChallengeResult('fail');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, challengeStarted, timeLeft, challengeResult]);

  // Check challenge completion
  useEffect(() => {
    if (challengeTaps.length === 2 && !challengeResult) {
      const isCorrect = LESSON_DATA.totalLosses.every(id => challengeTaps.includes(id));
      setChallengeResult(isCorrect ? 'success' : 'fail');
    }
  }, [challengeTaps, challengeResult]);

  const handleShipTap = (shipId: string) => {
    if (screen === 'details') {
      setSelectedShip(shipId);
      if (!viewedShips.includes(shipId)) {
        setViewedShips(prev => [...prev, shipId]);
      }
    } else if (screen === 'challenge' && challengeStarted && !challengeResult) {
      if (!challengeTaps.includes(shipId)) {
        setChallengeTaps(prev => [...prev, shipId]);
      }
    }
  };

  const nextScreen = (wasSkipped: boolean = false) => {
    if (wasSkipped) {
      setSkippedScreens(prev => new Set([...prev, screen]));
    }

    // Reset state
    setSelectedShip(null);

    const screens: Screen[] = ['intro', 'beforeafter', 'details', 'challenge', 'completion'];
    const currentIndex = screens.indexOf(screen);
    if (currentIndex < screens.length - 1) {
      setScreen(screens[currentIndex + 1]);
    }
  };

  const handleComplete = () => {
    if (skippedScreens.size > 0 || challengeResult !== 'success') {
      onSkip();
    } else {
      onComplete(LESSON_DATA.xpReward);
    }
  };

  const handleSkipLesson = () => {
    onSkip();
  };

  const currentShip = LESSON_DATA.ships.find(s => s.id === selectedShip);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 5</h1>
          <p className="text-xs text-amber-400">{LESSON_DATA.title}</p>
        </div>
        {screen !== 'completion' && screen !== 'intro' ? (
          <button
            onClick={handleSkipLesson}
            className="text-white/50 hover:text-white/80 text-sm font-medium"
          >
            Skip All
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'intro' ? '0%' :
                   screen === 'beforeafter' ? '25%' :
                   screen === 'details' ? '50%' :
                   screen === 'challenge' ? '75%' :
                   '100%'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-900/50 to-blue-800/30 flex items-center justify-center mb-6"
              >
                <Ship size={64} className="text-blue-400" />
              </motion.div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-6">
                {LESSON_DATA.subtitle}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm text-left">
                <p className="text-white/80 text-sm mb-3">
                  On the morning of December 7, 1941, eight battleships were moored along Ford Island in Pearl Harbor.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-red-500/20 rounded-lg p-2 text-center">
                    <span className="text-red-400 font-bold">4</span>
                    <span className="text-white/60 ml-1">Sunk</span>
                  </div>
                  <div className="bg-amber-500/20 rounded-lg p-2 text-center">
                    <span className="text-amber-400 font-bold">4</span>
                    <span className="text-white/60 ml-1">Damaged</span>
                  </div>
                </div>
              </div>

              {/* Host message */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-8 max-w-sm">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: host.primaryColor }}
                >
                  {host.avatar}
                </div>
                <p className="text-white/70 text-sm text-left">
                  "Battleship Row was the primary target. Let's see what happened to each ship."
                </p>
              </div>

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-blue-500 text-white font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See the Damage
              </motion.button>
            </motion.div>
          )}

          {/* Before/After Screen */}
          {screen === 'beforeafter' && (
            <motion.div
              key="beforeafter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-6"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-2 text-center">
                Before & After
              </h2>
              <p className="text-white/60 text-sm mb-4 text-center">
                Slide to see the destruction
              </p>

              {/* Before/After Slider */}
              <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-800 min-h-[300px]">
                {/* Before layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
                  <div className="text-center">
                    <Ship size={64} className="text-blue-400/50 mx-auto mb-2" />
                    <span className="text-blue-300/70 text-sm">BEFORE</span>
                    <p className="text-white/50 text-xs mt-1">8 Battleships at rest</p>
                  </div>
                </div>

                {/* After layer (clips based on slider) */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-orange-900/30 flex items-center justify-center"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <div className="text-center">
                    <AlertCircle size={64} className="text-red-400/50 mx-auto mb-2" />
                    <span className="text-red-300/70 text-sm">AFTER</span>
                    <p className="text-white/50 text-xs mt-1">4 Sunk, 4 Damaged</p>
                  </div>
                </div>

                {/* Slider handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-slate-800">↔</span>
                  </div>
                </div>

                {/* Slider control */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />
              </div>

              <motion.button
                onClick={() => nextScreen()}
                className="mt-6 px-8 py-4 rounded-full bg-blue-500 text-white font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn About Each Ship
              </motion.button>
            </motion.div>
          )}

          {/* Ship Details Screen */}
          {screen === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-6"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-2 text-center">
                The Ships of Battleship Row
              </h2>
              <p className="text-white/60 text-sm mb-4 text-center">
                Tap each ship to learn its fate ({viewedShips.length}/8 viewed)
              </p>

              {/* Ship map */}
              <div className="flex-1 relative bg-blue-900/20 rounded-xl overflow-hidden">
                {LESSON_DATA.ships.map((ship) => (
                  <motion.button
                    key={ship.id}
                    onClick={() => handleShipTap(ship.id)}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      viewedShips.includes(ship.id)
                        ? 'bg-opacity-100'
                        : 'bg-opacity-50 animate-pulse'
                    }`}
                    style={{
                      left: `${ship.position.x}%`,
                      top: `${ship.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: ship.color,
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Ship size={20} className="text-white" />
                  </motion.button>
                ))}
              </div>

              {/* Ship detail modal */}
              <AnimatePresence>
                {selectedShip && currentShip && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-x-4 bottom-24 bg-slate-800 rounded-xl p-4 border-2"
                    style={{ borderColor: currentShip.color }}
                  >
                    <button
                      onClick={() => setSelectedShip(null)}
                      className="absolute top-2 right-2 text-white/60 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="font-bold text-white mb-1">{currentShip.name}</h3>
                    <p className="text-sm font-bold mb-2" style={{ color: currentShip.color }}>
                      {currentShip.fate} • {currentShip.casualties} casualties
                    </p>
                    <p className="text-white/70 text-sm">{currentShip.details}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => nextScreen()}
                className="mt-4 px-8 py-4 rounded-full bg-blue-500 text-white font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Take the Challenge
              </motion.button>
            </motion.div>
          )}

          {/* Challenge Screen */}
          {screen === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-6"
            >
              {!challengeStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Timer size={48} className="text-amber-400 mb-4" />
                  <h2 className="font-editorial text-xl font-bold text-white mb-2">
                    Timed Challenge
                  </h2>
                  <p className="text-white/60 mb-6 max-w-sm">
                    Tap the <strong>two battleships that were total losses</strong> - meaning they were never repaired or returned to service.
                  </p>
                  <p className="text-amber-400 font-bold mb-8">
                    You have 15 seconds!
                  </p>
                  <motion.button
                    onClick={() => setChallengeStarted(true)}
                    className="px-8 py-4 rounded-full bg-amber-500 text-black font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Challenge
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Timer size={20} className={timeLeft <= 5 ? 'text-red-400' : 'text-amber-400'} />
                    <span className={`font-bold text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                      {timeLeft}s
                    </span>
                  </div>

                  <p className="text-white/60 text-sm mb-4 text-center">
                    Tap the two total losses ({challengeTaps.length}/2)
                  </p>

                  {/* Ship grid for challenge */}
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    {LESSON_DATA.ships.map((ship) => {
                      const isTapped = challengeTaps.includes(ship.id);
                      const isCorrect = LESSON_DATA.totalLosses.includes(ship.id);

                      return (
                        <motion.button
                          key={ship.id}
                          onClick={() => handleShipTap(ship.id)}
                          disabled={isTapped || challengeResult !== null}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${
                            challengeResult !== null
                              ? isCorrect
                                ? 'bg-green-500/30 border-2 border-green-500'
                                : isTapped
                                ? 'bg-red-500/30 border-2 border-red-500'
                                : 'bg-white/5 opacity-50'
                              : isTapped
                              ? 'bg-blue-500/30 border-2 border-blue-500'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                          whileHover={!isTapped && !challengeResult ? { scale: 1.05 } : {}}
                          whileTap={!isTapped && !challengeResult ? { scale: 0.95 } : {}}
                        >
                          <Ship size={24} className="text-white mb-1" />
                          <span className="text-white text-xs text-center leading-tight">
                            {ship.name.replace('USS ', '')}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Challenge result */}
                  {challengeResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl mt-4 ${
                        challengeResult === 'success'
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      <p className={`font-bold mb-1 ${challengeResult === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {challengeResult === 'success' ? 'Correct!' : 'Not quite'}
                      </p>
                      <p className="text-white/70 text-sm">
                        The USS Arizona and USS Oklahoma were the only total losses. The Arizona remains a memorial; the Oklahoma sank while being towed away.
                      </p>
                    </motion.div>
                  )}
                </>
              )}

              {challengeResult && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen()}
                  className="mt-4 px-8 py-4 rounded-full bg-blue-500 text-white font-bold"
                >
                  Continue
                </motion.button>
              )}

              {!challengeStarted && (
                <button
                  onClick={() => nextScreen(true)}
                  className="mt-4 px-4 py-2 rounded-full bg-white/10 text-white/60 text-sm hover:bg-white/20"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip Challenge
                </button>
              )}
            </motion.div>
          )}

          {/* Completion Screen */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              {skippedScreens.size === 0 && challengeResult === 'success' ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Lesson Complete!
                  </h2>

                  <p className="text-blue-400 font-bold mb-6">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="text-left bg-white/5 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm mb-3">Battleship Row Summary:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-red-400 font-bold">{LESSON_DATA.statistics.totalLoss}</span>
                        <span className="text-white/60 ml-1">Total Losses</span>
                      </div>
                      <div>
                        <span className="text-green-400 font-bold">{LESSON_DATA.statistics.repaired}</span>
                        <span className="text-white/60 ml-1">Repaired</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-white font-bold">{LESSON_DATA.statistics.casualties.toLocaleString()}</span>
                        <span className="text-white/60 ml-1">Casualties</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6"
                  >
                    <SkipForward size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Lesson Unlocked
                  </h2>

                  <p className="text-orange-400 font-medium mb-4">
                    {challengeResult === 'fail' ? 'Challenge not passed' : 'You skipped some content'}
                  </p>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm">
                      Come back to complete the challenge and earn <span className="text-blue-400 font-bold">+{LESSON_DATA.xpReward} XP</span>.
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <span>Progress:</span>
                <span className={`font-bold ${skippedScreens.size === 0 && challengeResult === 'success' ? 'text-blue-400' : 'text-orange-400'}`}>
                  5 of 7 {skippedScreens.size > 0 || challengeResult !== 'success' ? '(incomplete)' : ''}
                </span>
              </div>

              <motion.button
                onClick={handleComplete}
                className={`px-8 py-4 rounded-full font-bold text-lg ${
                  skippedScreens.size === 0 && challengeResult === 'success'
                    ? 'bg-blue-500 text-white'
                    : 'bg-orange-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {skippedScreens.size === 0 && challengeResult === 'success' ? 'Next Lesson' : 'Continue Anyway'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
