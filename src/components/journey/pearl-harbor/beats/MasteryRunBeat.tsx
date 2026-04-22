/**
 * Beat 10: Mastery Run - Pearl Harbor Final Challenge
 * Format: Timed Challenge (Quiz Gauntlet)
 * XP: 75 (max) | Duration: 6-8 min
 *
 * Narrative: Prove your mastery with 12 questions covering
 * all aspects of the Pearl Harbor curriculum.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Trophy, Target, Award, Star } from 'lucide-react';
import { WW2Host } from '@/types';
import { TimedChallenge, TimedQuestion, PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { MASTERY_SCORING } from '@/data/pearlHarborLessons';

type Screen = 'pre-video' | 'intro' | 'quiz' | 'results' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'quiz', 'results', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-12',
  xpReward: 75, // Max XP for perfect score
};

// 12 questions covering all beats
const MASTERY_QUESTIONS: TimedQuestion[] = [
  // Beat 1: Road to War
  {
    id: 'q1',
    question: 'What percentage of Japan\'s oil came from the United States before the embargo?',
    options: ['About 40%', 'About 60%', 'Over 80%', '100%'],
    correctIndex: 2,
    explanation: 'Japan depended on the U.S. for over 80% of its oil supply.',
    category: 'Geopolitical',
  },
  // Beat 2: Radar Blip
  {
    id: 'q2',
    question: 'How many minutes before the attack did radar operators detect the incoming planes?',
    options: ['15 minutes', '30 minutes', '53 minutes', '90 minutes'],
    correctIndex: 2,
    explanation: 'Privates Lockard and Elliott detected the planes at 7:02 AM, 53 minutes before the attack began.',
    category: 'Radar',
  },
  // Beat 3: Tora Tora Tora
  {
    id: 'q3',
    question: 'How many aircraft were in the first wave of the attack?',
    options: ['89', '183', '250', '353'],
    correctIndex: 1,
    explanation: 'The first wave consisted of 183 aircraft: 49 bombers, 51 dive bombers, 40 torpedo planes, and 43 fighters.',
    category: 'Tactical',
  },
  // Beat 4: Voices
  {
    id: 'q4',
    question: 'Who was the first African American to receive the Navy Cross?',
    options: ['Jesse Owens', 'Doris Miller', 'Benjamin Davis', 'Joe Louis'],
    correctIndex: 1,
    explanation: 'Doris Miller received the Navy Cross for his heroic actions during the Pearl Harbor attack.',
    category: 'Human',
  },
  // Beat 5: Breaking News
  {
    id: 'q5',
    question: 'What percentage of Americans approved of declaring war on December 8, 1941?',
    options: ['76%', '85%', '91%', '97%'],
    correctIndex: 3,
    explanation: 'After Pearl Harbor, 97% of Americans approved of the war declaration - up from 88% opposing war in January 1940.',
    category: 'Opinion',
  },
  // Beat 6: Nagumo's Dilemma
  {
    id: 'q6',
    question: 'How many barrels of fuel were in Pearl Harbor\'s exposed storage tanks?',
    options: ['500,000', '1.5 million', '4.5 million', '10 million'],
    correctIndex: 2,
    explanation: 'The 4.5 million barrels of exposed fuel could have crippled the Pacific Fleet if destroyed.',
    category: 'Third Wave',
  },
  // Beat 7: Fact or Myth
  {
    id: 'q7',
    question: 'Did the US break Japan\'s military codes before Pearl Harbor?',
    options: ['Yes, all codes', 'Only naval codes', 'Only the Purple diplomatic code', 'No codes were broken'],
    correctIndex: 2,
    explanation: 'The US broke the Purple diplomatic code (MAGIC), not Japan\'s military codes. This is a common misconception.',
    category: 'Myths',
  },
  // Beat 8: Day of Infamy
  {
    id: 'q8',
    question: 'What word did FDR change "world history" to in his famous speech?',
    options: ['Tragedy', 'Infamy', 'Shame', 'Disgrace'],
    correctIndex: 1,
    explanation: 'FDR changed "world history" to "infamy" - a single edit that made the speech unforgettable.',
    category: 'Primary Source',
  },
  // More comprehensive questions
  {
    id: 'q9',
    question: 'What was the final vote in the House for declaring war?',
    options: ['388-1', '420-0', '350-25', '400-10'],
    correctIndex: 0,
    explanation: 'The House voted 388-1, with Jeannette Rankin casting the only "no" vote.',
    category: 'Political',
  },
  // Beat 9: Arsenal of Democracy
  {
    id: 'q10',
    question: 'By 1944, what percentage of world munitions did the US produce?',
    options: ['20%', '30%', '40%', '50%'],
    correctIndex: 2,
    explanation: 'The United States produced approximately 40% of the world\'s munitions by 1944.',
    category: 'Legacy',
  },
  {
    id: 'q11',
    question: 'How many Japanese Americans were forcibly relocated to internment camps?',
    options: ['50,000', '80,000', '120,000', '200,000'],
    correctIndex: 2,
    explanation: 'Executive Order 9066 led to the internment of approximately 120,000 Japanese Americans.',
    category: 'Legacy',
  },
  {
    id: 'q12',
    question: 'Which battleship was the only one to get underway during the attack?',
    options: ['USS Arizona', 'USS Oklahoma', 'USS Nevada', 'USS California'],
    correctIndex: 2,
    explanation: 'The USS Nevada was the only battleship to get underway, but was deliberately grounded to avoid blocking the harbor channel.',
    category: 'Tactical',
  },
];

interface MasteryRunBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function MasteryRunBeat({ host, onComplete, onSkip, onBack, isPreview = false }: MasteryRunBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [score, setScore] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
      }
    }
  }, []);

  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { score },
      });
    }
  }, [hasLoadedConfig, screen, score, saveCheckpoint]);

  // Subscribe to Firestore for pre-module and post-module video config
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }
      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        setPostModuleVideoConfig(postModuleVideo);
      } else {
        setPostModuleVideoConfig(null);
      }
      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // Set initial screen based on pre-module video availability
  useEffect(() => {
    if (hasLoadedConfig && screen === 'intro') {
      const checkpoint = getCheckpoint();
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextIndex = currentIndex + 1;
      // Skip post-video if not configured
      if (SCREENS[nextIndex] === 'post-video' && !postModuleVideoConfig) {
        nextIndex++;
      }
      setScreen(SCREENS[nextIndex]);
    } else {
      clearCheckpoint();
      const earnedXP = skipped ? 0 : calculateXP();
      onComplete(earnedXP);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, score, postModuleVideoConfig]);

  const handleQuizComplete = (finalScore: number, total: number, streak: number) => {
    setScore(finalScore);
    setMaxStreak(streak);
    nextScreen();
  };

  const calculateXP = () => {
    if (score >= MASTERY_SCORING.perfect.minCorrect) return MASTERY_SCORING.perfect.xp;
    if (score >= MASTERY_SCORING.excellent.minCorrect) return MASTERY_SCORING.excellent.xp;
    if (score >= MASTERY_SCORING.good.minCorrect) return MASTERY_SCORING.good.xp;
    return MASTERY_SCORING.needsWork.xp;
  };

  const getScoreTier = () => {
    if (score >= MASTERY_SCORING.perfect.minCorrect) return { tier: 'Perfect!', color: 'text-amber-400', bg: 'bg-amber-500/20', badge: MASTERY_SCORING.perfect.badge };
    if (score >= MASTERY_SCORING.excellent.minCorrect) return { tier: 'Excellent!', color: 'text-green-400', bg: 'bg-green-500/20', badge: null };
    if (score >= MASTERY_SCORING.good.minCorrect) return { tier: 'Good Work!', color: 'text-blue-400', bg: 'bg-blue-500/20', badge: null };
    return { tier: 'Keep Learning', color: 'text-white/60', bg: 'bg-white/10', badge: null };
  };

  const tierInfo = getScoreTier();
  const earnedXP = calculateXP();

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Mastery Run</h1>
          <p className="text-white/50 text-xs">Beat 10 of 10</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img src={host.imageUrl || '/assets/hosts/default.png'} alt={host.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-amber-500" animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Mastery Run"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative overflow-hidden">
              {/* Gold/red atmospheric background */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 50% 30%, rgba(230,171,42,0.15) 0%, transparent 55%),
                    radial-gradient(ellipse at 50% 100%, rgba(205,14,20,0.15) 0%, transparent 55%),
                    linear-gradient(180deg, #140a04 0%, #0a0503 50%, #050201 100%)
                  `
                }}
              />

              {/* Faded diploma decorations */}
              <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.08]">
                <div
                  className="absolute w-[140px] h-[180px] bg-[#F5ECD2]"
                  style={{ top: '15%', left: '8%', transform: 'rotate(-8deg)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
                <div
                  className="absolute w-[140px] h-[180px] bg-[#F5ECD2]"
                  style={{ bottom: '15%', right: '8%', transform: 'rotate(6deg)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
              </div>

              {/* Grain overlay */}
              <div className="absolute inset-0 z-[5] opacity-35 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='ng'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0 0.15 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ng)'/%3E%3C/svg%3E")`
                }}
              />

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto relative z-10">
                <div className="flex flex-col items-center text-center px-6 py-8 min-h-full">
                  {/* Kick label */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 mb-4"
                  >
                    <div className="w-6 h-px bg-ha-red" />
                    <span className="font-mono text-[10px] tracking-[0.4em] text-ha-red font-bold uppercase">
                      ◆ Pearl Harbor · Final Examination
                    </span>
                    <div className="w-6 h-px bg-ha-red" />
                  </motion.div>

                  {/* Exam Seal */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-[96px] h-[96px] mb-5"
                  >
                    {/* Outer ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 50% 35%, #3a2a14, #1a1008 55%, #0a0604)',
                        border: '2px solid var(--gold, #E6AB2A)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 40px rgba(230,171,42,0.3)'
                      }}
                    />
                    {/* Inner dashed border with glow */}
                    <div
                      className="absolute inset-[6px] rounded-full flex items-center justify-center"
                      style={{
                        border: '1.5px dashed rgba(230,171,42,0.45)',
                        background: 'radial-gradient(circle at 50% 40%, rgba(230,171,42,0.08), transparent 70%)'
                      }}
                    >
                      <div className="text-center leading-none">
                        <span
                          className="block font-playfair italic text-[30px] font-bold mb-0.5"
                          style={{
                            background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          XII
                        </span>
                        <span className="font-oswald text-[8px] tracking-[0.28em] text-gold font-bold uppercase">
                          Questions
                        </span>
                      </div>
                    </div>
                    {/* Top star */}
                    <span className="absolute top-[10%] left-1/2 -translate-x-1/2 text-gold text-[10px] z-[2]">◆</span>
                    {/* Bottom star */}
                    <span className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-gold text-[10px] z-[2]">◆</span>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-playfair italic text-[42px] sm:text-[54px] font-bold text-off-white leading-[0.95] tracking-tight mb-4"
                    style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
                  >
                    The <em className="text-gold">final exam.</em>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-cormorant italic text-lg text-off-white/70 max-w-[520px] leading-relaxed mb-5"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                  >
                    One more sitting stands between you and the Pearl Harbor diploma. Your instructor has a few last words before you begin.
                  </motion.p>

                  {/* Instructor briefing card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative w-full max-w-[560px] rounded p-5 mb-5 text-left"
                    style={{
                      background: 'rgba(20,14,8,0.78)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(230,171,42,0.3)'
                    }}
                  >
                    {/* Gold top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-dp via-gold-br to-gold-dp" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3.5 pb-3 border-b border-dashed border-off-white/[0.08] gap-2.5">
                      {/* Instructor */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 rounded-full flex-shrink-0"
                          style={{
                            background: 'radial-gradient(circle at 40% 35%, rgba(180,140,95,0.55), rgba(60,40,25,0.85) 55%, rgba(20,12,6,0.95))',
                            border: '1px solid var(--gold, #E6AB2A)'
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-playfair italic text-[13px] font-bold text-off-white truncate">Sgt. J. Mitchell</p>
                          <p className="font-mono text-[8px] tracking-[0.22em] text-gold uppercase font-semibold mt-0.5">◆ Proctor · ETO 1944</p>
                        </div>
                      </div>
                      {/* Sealed badge */}
                      <span
                        className="font-mono text-[8px] tracking-[0.28em] text-ha-red font-bold py-1 px-2 rounded-sm flex-shrink-0 whitespace-nowrap"
                        style={{
                          border: '1px solid rgba(205,14,20,0.3)',
                          background: 'rgba(205,14,20,0.06)'
                        }}
                      >
                        Sealed Until Finished
                      </span>
                    </div>

                    {/* Briefing text */}
                    <p className="font-cormorant italic text-[15.5px] text-off-white/70 leading-relaxed mb-3.5">
                      Twelve questions, thirty seconds each. No hints. You won't know if you're right until the last answer is locked. Lock in{' '}
                      <span className="text-gold font-bold italic">ten</span> to earn the bronze,{' '}
                      <span className="text-gold font-bold italic">eleven</span> for silver,{' '}
                      <span className="text-gold font-bold italic">all twelve</span> for gold.
                    </p>

                    {/* Signature */}
                    <p className="font-cormorant italic text-sm text-gold text-right pt-2.5 border-t border-dashed border-off-white/[0.08] tracking-wide">
                      — J. Mitchell, USA (ret.)
                    </p>
                  </motion.div>

                  {/* Exam specs strip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative w-full max-w-[560px] rounded overflow-hidden mb-4"
                    style={{
                      background: 'rgba(15,10,6,0.6)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(230,171,42,0.15)'
                    }}
                  >
                    {/* Gold top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />

                    <div className="grid grid-cols-4">
                      {[
                        { label: 'Questions', value: '12' },
                        { label: 'Per Q', value: '30s' },
                        { label: 'Total', value: '6:00' },
                        { label: 'Attempts', value: '∞' },
                      ].map((spec, i) => (
                        <div key={i} className="py-3 px-3 text-center flex flex-col gap-0.5 border-r border-off-white/[0.08] last:border-r-0">
                          <span className="font-mono text-[7.5px] tracking-[0.28em] text-off-white/50 uppercase font-semibold mb-1">{spec.label}</span>
                          <span className="font-playfair italic text-[20px] font-bold text-gold leading-none">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Difficulty chips */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex gap-2.5 flex-wrap justify-center mb-4"
                  >
                    {[
                      { label: 'Easy', range: '1–4', color: 'text-green-400', borderColor: 'rgba(61,214,122,0.35)' },
                      { label: 'Medium', range: '5–8', color: 'text-gold', borderColor: 'rgba(230,171,42,0.35)' },
                      { label: 'Hard', range: '9–12', color: 'text-ha-red', borderColor: 'rgba(205,14,20,0.35)' },
                    ].map((chip) => (
                      <span
                        key={chip.label}
                        className={`py-1.5 px-3.5 rounded-full font-mono text-[9px] tracking-[0.16em] uppercase font-bold inline-flex items-center gap-1.5 ${chip.color}`}
                        style={{ border: `1px solid ${chip.borderColor}`, background: 'rgba(0,0,0,0.3)' }}
                      >
                        {chip.label} <span className="opacity-70 font-semibold">{chip.range}</span>
                      </span>
                    ))}
                  </motion.div>

                  {/* Spacer for scroll */}
                  <div className="h-8 flex-shrink-0" />
                </div>
              </div>

              {/* Bottom CTA - Fixed at bottom */}
              <div className="relative z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-[#0a0503] via-[#0a0503]/95 to-transparent backdrop-blur-sm border-t border-off-white/[0.06] flex-shrink-0">
                <div className="flex flex-col items-center gap-3.5 max-w-sm mx-auto">
                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={nextScreen}
                    className="relative w-full py-4 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[13px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3"
                  >
                    {/* Corner brackets */}
                    <span className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px] border-l-[1.5px] border-t-[1.5px] border-gold" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px] border-r-[1.5px] border-b-[1.5px] border-gold" />
                    Begin Exam
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </motion.button>

                  {/* Skip link */}
                  <button
                    onClick={() => { setSkipped(true); onSkip(); }}
                    className="font-mono text-[9.5px] tracking-[0.28em] text-off-white/35 uppercase font-semibold hover:text-off-white/50 transition-colors py-1 px-2.5"
                  >
                    Review the campaign first
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUIZ */}
          {screen === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <TimedChallenge
                questions={MASTERY_QUESTIONS}
                timeLimit={360} // 6 minutes total
                perQuestionTime={30}
                onComplete={handleQuizComplete}
                showStreak
                showProgress
              />
            </motion.div>
          )}

          {/* RESULTS */}
          {screen === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Trophy/Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className={`w-24 h-24 rounded-full ${tierInfo.bg} flex items-center justify-center mb-6`}
                >
                  {tierInfo.badge ? (
                    <Award size={48} className={tierInfo.color} />
                  ) : (
                    <Trophy size={48} className={tierInfo.color} />
                  )}
                </motion.div>

                <h2 className={`text-3xl font-bold ${tierInfo.color} mb-2`}>{tierInfo.tier}</h2>

                {/* Score display */}
                <div className="bg-white/5 rounded-2xl p-6 max-w-sm w-full border border-white/10 mb-6">
                  <div className="text-center mb-4">
                    <span className="text-5xl font-bold text-white">{score}</span>
                    <span className="text-2xl text-white/40">/{MASTERY_QUESTIONS.length}</span>
                  </div>

                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <p className="text-amber-400 font-bold text-xl">{maxStreak}</p>
                      <p className="text-white/40 text-xs">Max Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-xl">{Math.round((score / MASTERY_QUESTIONS.length) * 100)}%</p>
                      <p className="text-white/40 text-xs">Accuracy</p>
                    </div>
                  </div>
                </div>

                {/* Badge earned */}
                {tierInfo.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-4 border border-amber-500/50 mb-6 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="text-amber-400" size={20} />
                      <span className="text-amber-400 font-bold">Badge Earned!</span>
                      <Star className="text-amber-400" size={20} />
                    </div>
                    <p className="text-white font-bold">{tierInfo.badge}</p>
                  </motion.div>
                )}

                {/* XP earned */}
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{earnedXP} XP</span>
                </div>
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Journey
              </button>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Mastery Run"
              onComplete={nextScreen}
            />
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onAnimationComplete={() => {
                  if (!skipped) {
                    playXPSound();
                  }
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
              >
                <Trophy size={48} className="text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2 text-center">Pearl Harbor Journey Complete!</h2>
              <p className="text-white/60 mb-6 text-center">You've completed all 10 beats</p>

              <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6 text-center">
                <p className="text-white/70 text-sm leading-relaxed">
                  From the Road to War through the Arsenal of Democracy, you've explored one of the most pivotal days in American history.
                </p>
                <p className="text-amber-400 mt-4 font-medium">
                  December 7, 1941 - Never Forget
                </p>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : earnedXP} XP</span>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={nextScreen}
                  className="w-full max-w-sm py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/30"
                >
                  Take the Final Exam
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
