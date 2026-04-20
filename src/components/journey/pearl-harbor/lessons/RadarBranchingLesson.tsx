/**
 * RadarBranchingLesson - Lesson 2: Radar Warning
 *
 * Screens:
 * 1. Intro - Host explains the Opana Point radar station context
 * 2. Radar - Interactive radar with natural sweep animation
 * 3. Detection - Confirm the large signal detected
 * 4. Decision - A/B/C branching choice: What would you do?
 * 5. Outcome - Historical result of the actual decision made
 * 6. Reflection Quiz - MCQ about what happened and why
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward, Radio, AlertTriangle, Phone, Clock, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { WW2Host } from '@/types';
import { useSoundEffects, useAmbientSound } from '@/hooks/useAudio';
import { usePearlHarborProgress, LessonCheckpoint } from '../hooks/usePearlHarborProgress';
import { LeaveConfirmDialog } from '@/components/shared/LeaveConfirmDialog';

interface RadarBranchingLessonProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'intro' | 'radar' | 'detection' | 'decision' | 'outcome' | 'quiz' | 'completion';

const LESSON_ID = 'ph-lesson-2';
const SCREENS: Screen[] = ['intro', 'radar', 'detection', 'decision', 'outcome', 'quiz', 'completion'];

// Lesson content
const LESSON_DATA = {
  title: 'Radar Warning',
  subtitle: 'Opana Point, Hawaii - December 7, 1941',
  xpReward: 45,
  context: {
    time: '7:02 AM',
    date: 'December 7, 1941',
    location: 'Opana Point Mobile Radar Station',
    operators: 'Privates George Elliott & Joseph Lockard',
  },
  blips: [
    { id: 'wave1', x: 30, y: 25, angle: 315, distance: 137, label: 'Large formation', size: 'large' },
    { id: 'wave2', x: 35, y: 28, angle: 320, distance: 130, label: 'Multiple aircraft', size: 'medium' },
  ],
  decisions: [
    {
      id: 'report',
      label: 'Report to headquarters immediately',
      icon: '📞',
      description: 'This is unprecedented - command needs to know right away.',
    },
    {
      id: 'assume',
      label: 'Assume it\'s the expected B-17 flight',
      icon: '✈️',
      description: 'We were told to expect bombers from the mainland today.',
    },
    {
      id: 'verify',
      label: 'Try to verify before reporting',
      icon: '🔍',
      description: 'Double-check the equipment and wait for more data.',
    },
  ],
  outcomes: {
    report: {
      title: 'Good instinct, but...',
      text: 'You chose to report immediately. Unfortunately, this is exactly what the real operators did - and they were told "Don\'t worry about it." Lieutenant Kermit Tyler, the only officer on duty, assumed it was the expected B-17 bombers from California.',
      isHistorical: false,
    },
    assume: {
      title: 'This is what happened',
      text: 'When Pvt. Lockard called the Information Center, Lt. Kermit Tyler told him "Don\'t worry about it." Tyler knew B-17 bombers were expected from California and assumed that\'s what the radar was picking up. The Japanese first wave arrived 55 minutes later.',
      isHistorical: true,
    },
    verify: {
      title: 'No time for that',
      text: 'You chose to verify first. While caution is wise, there simply wasn\'t time. The radar showed the largest signal ever seen - over 50 aircraft, 137 miles north and closing fast. By the time you could verify, it would be too late.',
      isHistorical: false,
    },
  },
  quiz: {
    question: 'Why was the radar warning ignored?',
    choices: [
      'The radar equipment was malfunctioning',
      'The officer assumed it was expected B-17 bombers',
      'The operators didn\'t report what they saw',
      'Pearl Harbor\'s defenses were already on high alert',
    ],
    correctIndex: 1,
    explanation: 'Lt. Kermit Tyler knew that B-17 bombers were expected to arrive from California that morning. When he received the report of a large formation approaching from the north, he assumed it was the American planes and told the operators "Don\'t worry about it."',
  },
};

export function RadarBranchingLesson({ host, onComplete, onSkip, onBack }: RadarBranchingLessonProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [radarAngle, setRadarAngle] = useState(0);
  const [detectedBlips, setDetectedBlips] = useState<string[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());
  const [blipOpacity, setBlipOpacity] = useState<Record<string, number>>({});
  const [decisionTimer, setDecisionTimer] = useState(30); // 30 second countdown for decision
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [isRestoringCheckpoint, setIsRestoringCheckpoint] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const radarRef = useRef<HTMLDivElement>(null);

  // Checkpoint system
  const { saveCheckpoint, clearCheckpoint, getCheckpointForLesson } = usePearlHarborProgress();

  // Audio hooks
  const { play: playSfx, isMuted, toggleMute } = useSoundEffects();
  const { fadeIn: startAmbient, fadeOut: stopAmbient } = useAmbientSound('tensionLoop', { volume: 0.2 });

  // Play blip detection sound when new blip detected
  const playBlipSound = useCallback(() => {
    playSfx('blipDetect', 0.6);
  }, [playSfx]);

  // Restore from checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpointForLesson(LESSON_ID);
    if (checkpoint) {
      console.log('[Radar Lesson] Restoring from checkpoint:', checkpoint.screen);
      setScreen(checkpoint.screen as Screen);
      // Restore lesson-specific state
      if (checkpoint.state.detectedBlips) {
        setDetectedBlips(checkpoint.state.detectedBlips);
      }
      if (checkpoint.state.selectedDecision) {
        setSelectedDecision(checkpoint.state.selectedDecision);
      }
      if (checkpoint.state.skippedScreens) {
        setSkippedScreens(new Set(checkpoint.state.skippedScreens as Screen[]));
      }
    }
    setIsRestoringCheckpoint(false);
  }, []);

  // Save checkpoint on screen change
  useEffect(() => {
    if (isRestoringCheckpoint) return; // Don't save while restoring
    if (screen === 'completion') return; // Don't checkpoint on completion

    const screenIndex = SCREENS.indexOf(screen);
    saveCheckpoint(LESSON_ID, screen, screenIndex, {
      detectedBlips,
      selectedDecision: selectedDecision || undefined,
      skippedScreens: Array.from(skippedScreens),
    });
  }, [screen, detectedBlips, selectedDecision, skippedScreens, isRestoringCheckpoint, saveCheckpoint]);

  // Start ambient sound on radar/decision screens, stop on others
  useEffect(() => {
    if (screen === 'radar' || screen === 'decision') {
      startAmbient();
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
  }, [screen, startAmbient, stopAmbient]);

  // Decision timer countdown
  useEffect(() => {
    if (screen !== 'decision' || selectedDecision !== null) return;

    const timer = setInterval(() => {
      setDecisionTimer(prev => {
        if (prev <= 1) {
          // Time's up - auto-select the historical choice
          clearInterval(timer);
          handleDecision('assume');
          return 0;
        }
        // Warning at 10 seconds
        if (prev === 10) {
          setShowTimerWarning(true);
          playSfx('timerWarning', 0.5);
        }
        // Tick sound in last 5 seconds
        if (prev <= 5) {
          playSfx('tick', 0.3);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, selectedDecision, playSfx]);

  // Radar sweep animation - 6 second rotation for educational clarity
  useEffect(() => {
    if (screen !== 'radar') return;

    const interval = setInterval(() => {
      setRadarAngle(prev => {
        const newAngle = (prev + 1) % 360;

        // Check if sweep passes over any blips
        LESSON_DATA.blips.forEach(blip => {
          const blipAngle = blip.angle;
          const diff = Math.abs(newAngle - blipAngle);
          if (diff < 15 || diff > 345) {
            // Blip is being swept - increase opacity
            setBlipOpacity(prev => ({
              ...prev,
              [blip.id]: 1,
            }));
            // Auto-detect after a moment
            setTimeout(() => {
              setDetectedBlips(prev => {
                if (prev.includes(blip.id)) return prev;
                // Play blip detection sound
                playBlipSound();
                return [...prev, blip.id];
              });
            }, 500);
          }
        });

        return newAngle;
      });

      // Fade blips over time (afterglow effect)
      setBlipOpacity(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = Math.max(0.2, updated[key] - 0.02);
        });
        return updated;
      });
    }, 16.67); // ~60fps, 6 seconds per rotation (360 degrees / 6 seconds = 60 degrees/sec, 1 degree per 16.67ms)

    return () => clearInterval(interval);
  }, [screen]);

  // Auto-advance from radar when both blips detected
  useEffect(() => {
    if (screen === 'radar' && detectedBlips.length >= 2) {
      setTimeout(() => {
        setScreen('detection');
      }, 1500);
    }
  }, [detectedBlips, screen]);

  const nextScreen = (wasSkipped: boolean = false) => {
    if (wasSkipped) {
      setSkippedScreens(prev => new Set([...prev, screen]));
    }

    const screens: Screen[] = ['intro', 'radar', 'detection', 'decision', 'outcome', 'quiz', 'completion'];
    const currentIndex = screens.indexOf(screen);
    if (currentIndex < screens.length - 1) {
      setScreen(screens[currentIndex + 1]);
    }
  };

  const handleDecision = (decisionId: string) => {
    setSelectedDecision(decisionId);
    playSfx('select', 0.5);
    setTimeout(() => nextScreen(), 500);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    const correct = index === LESSON_DATA.quiz.correctIndex;
    setIsAnswerCorrect(correct);
    playSfx(correct ? 'correct' : 'incorrect', 0.6);
  };

  const handleComplete = () => {
    // Clear checkpoint when lesson is complete
    clearCheckpoint();

    if (skippedScreens.size > 0 || isAnswerCorrect === false) {
      onSkip();
    } else {
      playSfx('complete', 0.7);
      onComplete(LESSON_DATA.xpReward);
    }
  };

  const handleSkipLesson = () => {
    clearCheckpoint();
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLeaveConfirm(true)} className="p-2 -ml-2 text-white/60 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={toggleMute}
            className="p-2 text-white/60 hover:text-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 2</h1>
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
          className="h-full bg-green-500"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'intro' ? '0%' :
                   screen === 'radar' ? '15%' :
                   screen === 'detection' ? '30%' :
                   screen === 'decision' ? '50%' :
                   screen === 'outcome' ? '70%' :
                   screen === 'quiz' ? '85%' :
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
                className="w-32 h-32 rounded-full bg-gradient-to-br from-green-900/50 to-green-800/30 flex items-center justify-center mb-6 relative"
              >
                <Radio size={64} className="text-green-400" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-6">
                {LESSON_DATA.subtitle}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{LESSON_DATA.context.time}</span>
                </div>
                <p className="text-white/80 text-sm mb-2">
                  At the {LESSON_DATA.context.location}, two Army privates are about to see something unprecedented on their radar screen...
                </p>
                <p className="text-white/60 text-sm">
                  The largest radar signal ever detected - and a warning that would go unheeded.
                </p>
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
                  "Put yourself in their shoes. What would you do when you see 50+ aircraft approaching?"
                </p>
              </div>

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-green-500 text-white font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Radar
              </motion.button>
            </motion.div>
          )}

          {/* Radar Screen */}
          {screen === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6"
            >
              <p className="text-green-400 font-bold mb-4 text-center">
                Watch the radar sweep... what do you see?
              </p>

              {/* Radar Display */}
              <div
                ref={radarRef}
                className="relative w-72 h-72 rounded-full overflow-hidden"
                style={{
                  background: 'radial-gradient(circle, #0a2e1a 0%, #051a0d 70%, #000 100%)',
                  boxShadow: '0 0 30px rgba(34, 197, 94, 0.2), inset 0 0 50px rgba(0,0,0,0.5)',
                }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0">
                  {/* Horizontal and vertical lines */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-green-500/20" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-500/20" />
                  {/* Diagonal lines */}
                  <div className="absolute top-1/2 left-1/2 w-full h-px bg-green-500/10 origin-left -rotate-45" style={{ transform: 'translate(-50%, -50%) rotate(45deg)', width: '141%' }} />
                  <div className="absolute top-1/2 left-1/2 w-full h-px bg-green-500/10 origin-left rotate-45" style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', width: '141%' }} />
                </div>

                {/* Concentric circles */}
                {[20, 40, 60, 80].map((size, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-green-500/20"
                    style={{
                      width: `${size}%`,
                      height: `${size}%`,
                      top: `${50 - size/2}%`,
                      left: `${50 - size/2}%`,
                    }}
                  />
                ))}

                {/* Distance markers */}
                <span className="absolute top-[15%] left-1/2 -translate-x-1/2 text-green-500/40 text-xs">137 mi</span>
                <span className="absolute top-[35%] left-1/2 -translate-x-1/2 text-green-500/30 text-xs">100 mi</span>
                <span className="absolute top-[55%] left-1/2 -translate-x-1/2 text-green-500/30 text-xs">50 mi</span>

                {/* Radar sweep */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from ${radarAngle}deg, transparent 0deg, rgba(34, 197, 94, 0.3) 20deg, rgba(34, 197, 94, 0.1) 40deg, transparent 60deg)`,
                  }}
                />

                {/* Blips */}
                {LESSON_DATA.blips.map((blip) => {
                  const opacity = blipOpacity[blip.id] || 0;
                  const isDetected = detectedBlips.includes(blip.id);

                  return (
                    <motion.div
                      key={blip.id}
                      className="absolute"
                      style={{
                        left: `${blip.x}%`,
                        top: `${blip.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: opacity,
                        scale: isDetected ? 1 : opacity,
                      }}
                    >
                      {/* Blip glow */}
                      <div
                        className={`rounded-full ${blip.size === 'large' ? 'w-6 h-6' : 'w-4 h-4'}`}
                        style={{
                          background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
                          boxShadow: '0 0 10px #22c55e',
                        }}
                      />
                      {/* Detection indicator */}
                      {isDetected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border border-green-400"
                        />
                      )}
                    </motion.div>
                  );
                })}

                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-green-500 -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Detection status */}
              <div className="mt-6 flex gap-2">
                {LESSON_DATA.blips.map((blip) => (
                  <div
                    key={blip.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      detectedBlips.includes(blip.id)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {detectedBlips.includes(blip.id) ? '✓ ' : '○ '}
                    {blip.label}
                  </div>
                ))}
              </div>

              <p className="text-white/50 text-sm mt-4">
                {detectedBlips.length === 0 && 'Watching for signals...'}
                {detectedBlips.length === 1 && 'Signal detected! Keep watching...'}
                {detectedBlips.length >= 2 && 'Multiple signals detected!'}
              </p>

              {/* Skip button */}
              <button
                onClick={() => nextScreen(true)}
                className="mt-6 px-4 py-2 rounded-full bg-white/10 text-white/60 text-sm hover:bg-white/20"
              >
                <SkipForward size={16} className="inline mr-2" />
                Skip
              </button>
            </motion.div>
          )}

          {/* Detection Screen */}
          {screen === 'detection' && (
            <motion.div
              key="detection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
              >
                <AlertTriangle size={40} className="text-red-400" />
              </motion.div>

              <h2 className="font-editorial text-2xl font-bold text-white mb-4">
                Signal Detected!
              </h2>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 max-w-sm">
                <p className="text-red-400 font-bold mb-2">Radar Report:</p>
                <ul className="text-white/80 text-sm text-left space-y-2">
                  <li>• <strong>50+ aircraft</strong> detected</li>
                  <li>• Distance: <strong>137 miles north</strong></li>
                  <li>• Bearing: <strong>3 degrees east of north</strong></li>
                  <li>• Status: <strong>Approaching fast</strong></li>
                </ul>
              </div>

              <p className="text-white/60 text-sm mb-6 max-w-sm">
                This is the largest radar signal ever seen at this station. Private Lockard has never seen anything like it.
              </p>

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-amber-500 text-black font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                What Do You Do?
              </motion.button>
            </motion.div>
          )}

          {/* Decision Screen */}
          {screen === 'decision' && (
            <motion.div
              key="decision"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              {/* Timer Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">Time to decide</span>
                  <span className={`text-sm font-bold ${decisionTimer <= 10 ? 'text-red-400' : 'text-amber-400'}`}>
                    {decisionTimer}s
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${decisionTimer <= 10 ? 'bg-red-500' : 'bg-amber-500'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(decisionTimer / 30) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {showTimerWarning && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs mt-1 text-center"
                  >
                    They're closing in fast!
                  </motion.p>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Phone size={24} className="text-amber-400" />
                <div>
                  <h2 className="font-editorial text-xl font-bold text-white">
                    Make the Call
                  </h2>
                  <p className="text-white/60 text-sm">
                    You've detected 50+ aircraft. What do you do?
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {LESSON_DATA.decisions.map((decision, index) => (
                  <motion.button
                    key={decision.id}
                    onClick={() => handleDecision(decision.id)}
                    disabled={selectedDecision !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDecision === decision.id
                        ? 'border-amber-400 bg-amber-400/20'
                        : selectedDecision !== null
                        ? 'border-white/10 bg-white/5 opacity-50'
                        : 'border-white/20 bg-white/5 hover:border-amber-400/50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={selectedDecision === null ? { scale: 1.02 } : {}}
                    whileTap={selectedDecision === null ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{decision.icon}</span>
                      <div>
                        <p className="text-white font-bold">{decision.label}</p>
                        <p className="text-white/60 text-sm mt-1">{decision.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => nextScreen(true)}
                className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors mt-4"
              >
                <SkipForward size={16} className="inline mr-2" />
                Skip Decision
              </button>
            </motion.div>
          )}

          {/* Outcome Screen */}
          {screen === 'outcome' && (
            <motion.div
              key="outcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              {selectedDecision && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                      LESSON_DATA.outcomes[selectedDecision as keyof typeof LESSON_DATA.outcomes].isHistorical
                        ? 'bg-amber-500/20'
                        : 'bg-blue-500/20'
                    }`}
                  >
                    <span className="text-4xl">
                      {LESSON_DATA.outcomes[selectedDecision as keyof typeof LESSON_DATA.outcomes].isHistorical ? '📜' : '🤔'}
                    </span>
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-4">
                    {LESSON_DATA.outcomes[selectedDecision as keyof typeof LESSON_DATA.outcomes].title}
                  </h2>

                  {LESSON_DATA.outcomes[selectedDecision as keyof typeof LESSON_DATA.outcomes].isHistorical && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1 mb-4">
                      <span className="text-amber-400 text-sm font-bold">HISTORICAL OUTCOME</span>
                    </div>
                  )}

                  <p className="text-white/80 max-w-sm mb-8">
                    {LESSON_DATA.outcomes[selectedDecision as keyof typeof LESSON_DATA.outcomes].text}
                  </p>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 max-w-sm">
                    <p className="text-red-400 text-sm">
                      <strong>55 minutes later:</strong> The first wave of 183 Japanese aircraft reached Pearl Harbor. The attack that followed killed 2,403 Americans.
                    </p>
                  </div>
                </>
              )}

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-green-500 text-white font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {/* Quiz Screen */}
          {screen === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-6 text-center">
                {LESSON_DATA.quiz.question}
              </h2>

              <div className="space-y-3 flex-1">
                {LESSON_DATA.quiz.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectedAnswer === null && handleQuizAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === null
                        ? 'border-white/20 bg-white/5 hover:border-green-400/50'
                        : selectedAnswer === index
                          ? isAnswerCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : index === LESSON_DATA.quiz.correctIndex
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5 opacity-50'
                    }`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <span className="text-white">{choice}</span>
                  </motion.button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isAnswerCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-4 ${
                      isAnswerCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    <p className={`font-bold mb-1 ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isAnswerCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {LESSON_DATA.quiz.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswerCorrect !== null ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen()}
                  className="w-full py-4 rounded-full bg-green-500 text-white font-bold"
                >
                  Next
                </motion.button>
              ) : (
                <button
                  onClick={() => nextScreen(true)}
                  className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip Question
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
              {skippedScreens.size === 0 && isAnswerCorrect ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Lesson Complete!
                  </h2>

                  <p className="text-green-400 font-bold mb-6">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="text-left bg-white/5 rounded-xl p-4 mb-8 max-w-sm">
                    <p className="text-white/80 text-sm mb-2">Key takeaways:</p>
                    <ul className="text-white/60 text-sm space-y-1">
                      <li>• Radar detected the attack 55 minutes early</li>
                      <li>• The warning was dismissed as expected B-17s</li>
                      <li>• Communication failures had tragic consequences</li>
                    </ul>
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
                    You skipped some content
                  </p>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm">
                      You can proceed to the next lesson, but come back to complete this one to earn <span className="text-green-400 font-bold">+{LESSON_DATA.xpReward} XP</span>.
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <span>Progress:</span>
                <span className={`font-bold ${skippedScreens.size === 0 && isAnswerCorrect ? 'text-green-400' : 'text-orange-400'}`}>
                  2 of 7 {skippedScreens.size > 0 || !isAnswerCorrect ? '(incomplete)' : ''}
                </span>
              </div>

              <motion.button
                onClick={handleComplete}
                className={`px-8 py-4 rounded-full font-bold text-lg ${
                  skippedScreens.size === 0 && isAnswerCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {skippedScreens.size === 0 && isAnswerCorrect ? 'Next Lesson' : 'Continue Anyway'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leave Confirmation Dialog */}
      <LeaveConfirmDialog
        isOpen={showLeaveConfirm}
        onConfirm={() => {
          // Save checkpoint before leaving so user can resume
          const screenIndex = SCREENS.indexOf(screen);
          saveCheckpoint(LESSON_ID, screen, screenIndex, {
            detectedBlips,
            selectedDecision: selectedDecision || undefined,
            skippedScreens: Array.from(skippedScreens),
          });
          onBack();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
}
