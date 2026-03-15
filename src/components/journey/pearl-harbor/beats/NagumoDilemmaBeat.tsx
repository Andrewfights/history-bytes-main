/**
 * Beat 6: Nagumo's Dilemma - The Third Wave
 * Format: Branching Decision
 * XP: 55 | Duration: 6-7 min
 *
 * Narrative: What if Japan had launched a third wave?
 * Explore the strategic decision that shaped the war.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Anchor, AlertTriangle, Target, Shield } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'intro' | 'situation' | 'arguments' | 'decision' | 'consequences' | 'myth-check' | 'completion';
const SCREENS: Screen[] = ['intro', 'situation', 'arguments', 'decision', 'consequences', 'myth-check', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-6',
  xpReward: 55,
};

type Decision = 'third-wave' | 'withdraw' | 'compromise';

interface Argument {
  side: 'attack' | 'withdraw';
  speaker: string;
  role: string;
  argument: string;
  icon: string;
}

const ARGUMENTS: Argument[] = [
  {
    side: 'attack',
    speaker: 'Minoru Genda',
    role: 'Air Operations Officer',
    argument: '"The fuel tanks are exposed! One incendiary pass could ignite 4.5 million barrels of oil. The American fleet would have to retreat to San Francisco!"',
    icon: '🔥',
  },
  {
    side: 'attack',
    speaker: 'Mitsuo Fuchida',
    role: 'Air Group Commander',
    argument: '"The dry docks are intact. The submarine base untouched. We leave now, we leave them the tools to rebuild. Strike again!"',
    icon: '⚔️',
  },
  {
    side: 'withdraw',
    speaker: 'Chuichi Nagumo',
    role: 'Fleet Commander',
    argument: '"We have achieved our objective. Our carriers are at risk. The American carriers are unaccounted for - they could be moving to intercept us right now."',
    icon: '🚢',
  },
  {
    side: 'withdraw',
    speaker: 'Ryunosuke Kusaka',
    role: 'Chief of Staff',
    argument: '"We\'ve lost 29 aircraft. Our pilots are exhausted. A third strike would face alerted defenses. The risk outweighs the gain."',
    icon: '📋',
  },
];

const CONSEQUENCES: Record<Decision, { title: string; outcome: string[]; historical: boolean }> = {
  'third-wave': {
    title: 'The Third Wave Launches',
    outcome: [
      'Your aircraft target the fuel storage facilities. 4.5 million barrels of oil ignite in a massive fireball visible for miles.',
      'The dry docks are hit, collapsing repair capabilities. The submarine base is heavily damaged.',
      'BUT: American anti-aircraft fire is now fully alert. You lose 60+ more aircraft.',
      'The carriers Lexington and Enterprise are still at sea. They launch a counterattack on your return journey.',
      'Result: Pearl Harbor is devastated, but your carrier losses force Japan to operate with reduced naval aviation for the crucial Battle of Midway.',
    ],
    historical: false,
  },
  'withdraw': {
    title: 'What Actually Happened',
    outcome: [
      'Nagumo ordered the fleet to withdraw. The fuel tanks remained intact.',
      'Those 4.5 million barrels of oil kept the Pacific Fleet operational.',
      'The dry docks repaired damaged ships - USS Yorktown was famously patched in just 72 hours before Midway.',
      'Admiral Chester Nimitz later said: "The Japanese made three mistakes... leaving the fuel tanks, leaving the dry docks, and not finding our carriers."',
      'The facilities Nagumo left intact became the foundation of America\'s Pacific counteroffensive.',
    ],
    historical: true,
  },
  'compromise': {
    title: 'Limited Third Strike',
    outcome: [
      'You launch a smaller third wave focused solely on the fuel tanks.',
      'Some storage is destroyed, but defenses are now alert. Losses mount quickly.',
      'The dry docks remain intact, and repair facilities continue operating.',
      'Japan gains a tactical advantage but not a decisive one.',
      'The delay allows American carriers to close distance, creating a running battle on your withdrawal.',
    ],
    historical: false,
  },
};

interface NagumoDilemmaBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function NagumoDilemmaBeat({ host, onComplete, onSkip, onBack }: NagumoDilemmaBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [showAttackArgs, setShowAttackArgs] = useState(true);
  const [skipped, setSkipped] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

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

  const handleDecision = (decision: Decision) => {
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
          <h1 className="text-white font-bold">Nagumo's Dilemma</h1>
          <p className="text-white/50 text-xs">Beat 6 of 10</p>
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Anchor size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">The Third Wave</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  It's 9:45 AM. The second wave has returned to the carriers. Admiral Nagumo faces the most consequential decision of his career.
                </p>
                <p className="text-amber-400 font-medium max-w-sm">
                  Should Japan launch a third strike against Pearl Harbor?
                </p>
              </div>
              <div className="space-y-3">
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  See the Situation
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* SITUATION BRIEFING */}
          {screen === 'situation' && (
            <motion.div key="situation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-2">Situation Report</h3>
                <p className="text-white/60 text-sm">What has been achieved - and what remains</p>
              </div>

              <div className="flex-1 space-y-4">
                {/* Damage dealt */}
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                    <Target size={18} /> Objectives Achieved
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-white/80">
                      <span className="text-green-400 font-bold">8</span> battleships damaged/sunk
                    </div>
                    <div className="text-white/80">
                      <span className="text-green-400 font-bold">188</span> aircraft destroyed
                    </div>
                    <div className="text-white/80">
                      <span className="text-green-400 font-bold">2,403</span> casualties inflicted
                    </div>
                    <div className="text-white/80">
                      <span className="text-green-400 font-bold">29</span> aircraft lost (Japan)
                    </div>
                  </div>
                </div>

                {/* What's left */}
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                  <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} /> Still Standing
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🛢️</span>
                      <div>
                        <span className="text-red-400 font-bold">4.5 million barrels</span>
                        <p className="text-white/60">Fuel storage tanks - EXPOSED</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔧</span>
                      <div>
                        <span className="text-red-400 font-bold">Dry Docks</span>
                        <p className="text-white/60">Ship repair facilities - INTACT</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚢</span>
                      <div>
                        <span className="text-red-400 font-bold">Submarine Base</span>
                        <p className="text-white/60">Sub pens and supplies - UNTOUCHED</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unknown threat */}
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                  <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                    <Shield size={18} /> The Unknown
                  </h4>
                  <p className="text-white/70 text-sm">
                    American carriers <strong>Lexington</strong> and <strong>Enterprise</strong> are at sea. Their location is unknown. Are they hunting us?
                  </p>
                </div>
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Hear the Arguments
              </button>
            </motion.div>
          )}

          {/* ARGUMENTS */}
          {screen === 'arguments' && (
            <motion.div key="arguments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-2">The Debate</h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowAttackArgs(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showAttackArgs ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}`}
                  >
                    🔥 Attack
                  </button>
                  <button
                    onClick={() => setShowAttackArgs(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!showAttackArgs ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'}`}
                  >
                    🛡️ Withdraw
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {ARGUMENTS.filter((a) => (showAttackArgs ? a.side === 'attack' : a.side === 'withdraw')).map((arg, index) => (
                  <motion.div
                    key={arg.speaker}
                    initial={{ opacity: 0, x: showAttackArgs ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-xl p-4 border ${showAttackArgs ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{arg.icon}</span>
                      <div>
                        <p className="text-white font-bold">{arg.speaker}</p>
                        <p className={`text-xs mb-2 ${showAttackArgs ? 'text-red-400' : 'text-blue-400'}`}>{arg.role}</p>
                        <p className="text-white/80 text-sm italic">{arg.argument}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Make Your Decision
              </button>
            </motion.div>
          )}

          {/* DECISION */}
          {screen === 'decision' && (
            <motion.div key="decision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">What Do You Order?</h2>
                <p className="text-white/60 text-sm">You are Admiral Nagumo. History awaits your decision.</p>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-4">
                <motion.button
                  onClick={() => handleDecision('third-wave')}
                  className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500 rounded-xl text-left transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <h3 className="text-white font-bold mb-1">Launch Third Wave</h3>
                      <p className="text-white/60 text-sm">Target the fuel tanks, dry docks, and submarine base. Finish what we started.</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleDecision('withdraw')}
                  className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/50 hover:border-blue-500 rounded-xl text-left transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">⚓</span>
                    <div>
                      <h3 className="text-white font-bold mb-1">Withdraw Now</h3>
                      <p className="text-white/60 text-sm">We've achieved our objective. Preserve our forces for the battles ahead.</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleDecision('compromise')}
                  className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 hover:border-amber-500 rounded-xl text-left transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">⚖️</span>
                    <div>
                      <h3 className="text-white font-bold mb-1">Limited Strike</h3>
                      <p className="text-white/60 text-sm">Launch a smaller wave focused only on the fuel tanks. Minimize risk.</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CONSEQUENCES */}
          {screen === 'consequences' && selectedDecision && (
            <motion.div key="consequences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 overflow-y-auto">
                <div className={`rounded-2xl p-6 mb-4 ${CONSEQUENCES[selectedDecision].historical ? 'bg-amber-500/10 border-2 border-amber-500' : 'bg-white/5 border border-white/10'}`}>
                  {CONSEQUENCES[selectedDecision].historical && (
                    <div className="flex items-center gap-2 text-amber-400 mb-3">
                      <span className="text-sm font-bold uppercase">What Actually Happened</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-4">{CONSEQUENCES[selectedDecision].title}</h3>
                  <div className="space-y-3">
                    {CONSEQUENCES[selectedDecision].outcome.map((paragraph, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="text-white/80 text-sm"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                One More Thing...
              </button>
            </motion.div>
          )}

          {/* MYTH CHECK */}
          {screen === 'myth-check' && (
            <motion.div key="myth-check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Historical Footnote</h3>
                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10">
                  <p className="text-white/80 text-sm mb-3">
                    Much of what we "know" about this debate comes from <strong className="text-amber-400">Mitsuo Fuchida's</strong> postwar accounts.
                  </p>
                  <p className="text-white/80 text-sm mb-3">
                    Historians now believe Fuchida embellished his role and the intensity of the third-wave argument.
                  </p>
                  <p className="text-white/80 text-sm">
                    The 1945 U.S. Strategic Bombing Survey interviews paint a different picture than Fuchida's 1963 accounts to historian Gordon Prange.
                  </p>
                </div>
                <p className="text-white/50 text-sm text-center mt-4 max-w-sm italic">
                  Even eyewitnesses reshape history. Always check the sources.
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Beat 6
              </button>
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">⚓</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 6 Complete!</h2>
                <p className="text-white/60 mb-6">Nagumo's Dilemma - The Third Wave</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Fact or Myth? - Challenge common misconceptions
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
