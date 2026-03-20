/**
 * Beat 2: The Radar Blip - 7:02 AM
 * Format: Branching Decision
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Step into Private Lockard's shoes at Opana Point
 * when he detected the incoming Japanese attack on radar.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radio, Sparkles, Award, AlertTriangle } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'intro' | 'radar-setup' | 'blip-appears' | 'decision' | 'outcome' | 'legacy' | 'completion';
const SCREENS: Screen[] = ['intro', 'radar-setup', 'blip-appears', 'decision', 'outcome', 'legacy', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-2',
  xpReward: 50,
};

type DecisionOption = 'report-normal' | 'escalate' | 'dismiss';

const DECISION_OPTIONS = [
  {
    id: 'report-normal' as const,
    label: 'Report Through Channels',
    description: 'Call the Information Center and report the blip to whoever is on duty.',
    icon: '📞',
  },
  {
    id: 'escalate' as const,
    label: 'Escalate to Command',
    description: 'This is too big to ignore. Try to reach someone higher up immediately.',
    icon: '⚠️',
  },
  {
    id: 'dismiss' as const,
    label: 'Dismiss as Routine',
    description: 'Probably just a flock of birds or equipment malfunction. Log it and move on.',
    icon: '📋',
  },
];

const OUTCOMES: Record<DecisionOption, { title: string; content: string; isHistorical: boolean }> = {
  'report-normal': {
    title: 'What Actually Happened',
    content: `You called the Information Center at Fort Shafter. Lieutenant Kermit Tyler, a pilot with minimal training on his second day at the center, answered.

"Don't worry about it," he said.

Tyler assumed the blip was a flight of B-17 bombers expected from California. He didn't know the radar could track planes 137 miles away. He didn't raise an alarm.

53 minutes of warning. Zero response.`,
    isHistorical: true,
  },
  'escalate': {
    title: 'A Different Path',
    content: `If Lockard had bypassed normal channels and reached a senior officer directly, history might have been different.

With 53 minutes warning, anti-aircraft crews could have been alerted. Planes could have been scrambled. Ships could have prepared for attack.

But the chain of command existed for a reason, and a 19-year-old private couldn't know that this Sunday would be different from any other.`,
    isHistorical: false,
  },
  'dismiss': {
    title: 'Ignored Warning',
    content: `Dismissing the largest radar contact in history would have been a catastrophic error in judgment.

But consider: Lockard had never seen anything like this. The equipment was new and often unreliable. And who would believe that Japan would attack on a peaceful Sunday morning?

The real tragedy is that even when reported, the warning was dismissed anyway.`,
    isHistorical: false,
  },
};

interface RadarBlipBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function RadarBlipBeat({ host, onComplete, onSkip, onBack }: RadarBlipBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedDecision, setSelectedDecision] = useState<DecisionOption | null>(null);
  const [radarPulse, setRadarPulse] = useState(0);
  const [skipped, setSkipped] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Radar animation
  useEffect(() => {
    if (screen === 'radar-setup' || screen === 'blip-appears') {
      const interval = setInterval(() => {
        setRadarPulse((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Restore checkpoint
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.selectedDecision) {
          setSelectedDecision(checkpoint.state.selectedDecision);
        }
      }
    }
  }, []);

  // Save checkpoint
  useEffect(() => {
    if (screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { selectedDecision },
      });
    }
  }, [screen, selectedDecision, saveCheckpoint]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      setScreen(SCREENS[currentIndex + 1]);
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete]);

  const handleDecision = (decision: DecisionOption) => {
    setSelectedDecision(decision);
    nextScreen();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">The Radar Blip</h1>
          <p className="text-white/50 text-xs">Beat 2 of 10</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img src={host.avatarUrl || '/assets/hosts/default.png'} alt={host.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-amber-500" animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <Radio size={40} className="text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">7:02 AM</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  December 7, 1941. You are Private Joseph Lockard, 19 years old, manning an experimental radar station at Opana Point, Hawaii.
                </p>
                <div className="bg-green-500/10 rounded-xl p-4 max-w-sm border border-green-500/30">
                  <p className="text-green-300 text-sm italic">
                    "We had been told to shut down at 7:00 AM, but the truck to pick us up was late. I decided to keep the radar running for practice..."
                  </p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Continue
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* RADAR SETUP */}
          {screen === 'radar-setup' && (
            <motion.div key="radar-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Radar Display */}
                <div className="relative w-64 h-64 rounded-full bg-black border-4 border-green-900 mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(0,50,0,0.3)_100%)]" />
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-green-900/50" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-green-900/50" />
                  </div>
                  {/* Sweep line */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left"
                    style={{ rotate: radarPulse }}
                  />
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400" />
                  {/* Static noise */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-green-400"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Opana Point Radar Station</h3>
                <p className="text-white/60 text-center max-w-sm mb-4">
                  The SCR-270 radar was experimental technology. Most officers didn't trust it. You've been trained for only a few months.
                </p>
                <div className="bg-white/5 rounded-xl p-4 max-w-sm">
                  <p className="text-white/70 text-sm">
                    <strong className="text-amber-400">Time:</strong> 7:02 AM<br />
                    <strong className="text-amber-400">Status:</strong> Scheduled shutdown passed<br />
                    <strong className="text-amber-400">Visibility:</strong> Clear morning
                  </p>
                </div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Keep Watching...
                </button>
              </div>
            </motion.div>
          )}

          {/* BLIP APPEARS */}
          {screen === 'blip-appears' && (
            <motion.div key="blip-appears" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Radar with blip */}
                <div className="relative w-64 h-64 rounded-full bg-black border-4 border-green-900 mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(0,50,0,0.3)_100%)]" />
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-green-900/50" /></div>
                  <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px bg-green-900/50" /></div>
                  <motion.div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left" style={{ rotate: radarPulse }} />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400" />
                  {/* THE BLIP - Large contact */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-[20%] left-[45%] w-6 h-6 rounded-full bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]"
                  />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-3">
                    <AlertTriangle size={24} />
                    <span className="font-bold text-lg">MASSIVE CONTACT DETECTED</span>
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-4 max-w-sm border border-red-500/30 mb-4">
                    <p className="text-white font-mono text-sm">
                      <span className="text-red-400">BEARING:</span> Due North<br />
                      <span className="text-red-400">RANGE:</span> 137 miles<br />
                      <span className="text-red-400">SIZE:</span> Largest contact ever seen<br />
                      <span className="text-red-400">ESTIMATE:</span> 50+ aircraft... maybe 180+
                    </p>
                  </div>
                  <p className="text-white/70 text-sm max-w-sm">
                    This is no flock of birds. This is bigger than anything you've ever seen on the scope. Your heart races as you double-check the readings.
                  </p>
                </motion.div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors">
                  What Do You Do?
                </button>
              </div>
            </motion.div>
          )}

          {/* DECISION */}
          {screen === 'decision' && (
            <motion.div key="decision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">You Have 53 Minutes</h2>
                <p className="text-white/60 text-sm">The largest radar contact in history. What's your move?</p>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {DECISION_OPTIONS.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleDecision(option.id)}
                    className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-xl text-left transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <h3 className="text-white font-bold mb-1">{option.label}</h3>
                      <p className="text-white/60 text-sm">{option.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* OUTCOME */}
          {screen === 'outcome' && selectedDecision && (
            <motion.div key="outcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className={`w-full max-w-sm rounded-2xl p-6 mb-6 ${OUTCOMES[selectedDecision].isHistorical ? 'bg-amber-500/10 border-2 border-amber-500' : 'bg-white/5 border border-white/10'}`}>
                  {OUTCOMES[selectedDecision].isHistorical && (
                    <div className="flex items-center gap-2 text-amber-400 mb-3">
                      <span className="text-sm font-bold uppercase">Historical Path</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-4">{OUTCOMES[selectedDecision].title}</h3>
                  <p className="text-white/80 whitespace-pre-line leading-relaxed">{OUTCOMES[selectedDecision].content}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 max-w-sm">
                  <p className="text-center text-white/60 text-sm">
                    <strong className="text-red-400">7:55 AM:</strong> First bombs fall on Pearl Harbor<br />
                    <strong className="text-amber-400">2,403</strong> Americans killed
                  </p>
                </div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  What Happened to Lockard?
                </button>
              </div>
            </motion.div>
          )}

          {/* LEGACY */}
          {screen === 'legacy' && (
            <motion.div key="legacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Award size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Joseph Lockard's Legacy</h2>
                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <div className="space-y-4 text-left">
                    <div>
                      <p className="text-amber-400 font-bold">Distinguished Service Medal</p>
                      <p className="text-white/60 text-sm">For his actions on December 7, 1941</p>
                    </div>
                    <div>
                      <p className="text-amber-400 font-bold">Career in Electronics</p>
                      <p className="text-white/60 text-sm">Earned 35+ patents after the war</p>
                    </div>
                    <div>
                      <p className="text-amber-400 font-bold">Lifelong Advocate</p>
                      <p className="text-white/60 text-sm">Spoke about the importance of heeding warnings</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/70 max-w-sm italic">
                  "I did my job. I reported what I saw. The failure was in the system, not the soldiers."
                </p>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Complete Beat 2
                </button>
              </div>
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">📡</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 2 Complete!</h2>
                <p className="text-white/60 mb-6">The Radar Blip - 7:02 AM</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Tora! Tora! Tora! - Experience the attack minute by minute
                </p>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
