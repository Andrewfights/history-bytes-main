/**
 * Beat 5: Breaking News - America Learns
 * Format: Audio Experience + Drag-and-Drop
 * XP: 45 | Duration: 4-5 min
 *
 * Narrative: How America heard the news on that Sunday -
 * radio interruptions, newspaper headlines, and the dramatic shift in public opinion.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Radio, Newspaper, ArrowRight } from 'lucide-react';
import { WW2Host } from '@/types';
import { DragAndDropSorter, SortableItem } from '../shared';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'intro' | 'radio-dial' | 'newspaper' | 'opinion-shift' | 'tsukiyama' | 'completion';
const SCREENS: Screen[] = ['intro', 'radio-dial', 'newspaper', 'opinion-shift', 'tsukiyama', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-5',
  xpReward: 45,
};

interface RadioStation {
  id: string;
  name: string;
  program: string;
  announcement: string;
  time: string;
}

const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cbs',
    name: 'CBS',
    program: 'New York Philharmonic',
    announcement: '"We interrupt this program to bring you a special news bulletin. The Japanese have attacked Pearl Harbor, Hawaii, by air, President Roosevelt has just announced..."',
    time: '2:26 PM EST',
  },
  {
    id: 'nbc',
    name: 'NBC',
    program: 'Football: Giants vs. Dodgers',
    announcement: '"Flash! Washington. The White House announces Japanese attack on Pearl Harbor..."',
    time: '2:29 PM EST',
  },
  {
    id: 'mutual',
    name: 'MBS',
    program: 'Double or Nothing Quiz Show',
    announcement: '"We interrupt this broadcast to bring you this important bulletin from the United Press..."',
    time: '2:30 PM EST',
  },
];

// Items for the BEFORE/AFTER sorting challenge
const OPINION_ITEMS: SortableItem[] = [
  { id: 'oppose-88', label: '88% opposed war', icon: '📊' },
  { id: 'afc-800k', label: 'America First: 800,000 members', icon: '🏛️' },
  { id: 'lindbergh', label: 'Lindbergh: "Keep out of war"', icon: '🎤' },
  { id: 'approve-97', label: '97% approved declaration', icon: '📊' },
  { id: 'afc-disbanded', label: 'America First disbanded (Dec 11)', icon: '🏛️' },
  { id: 'enlistment', label: 'Millions volunteered to enlist', icon: '🎖️' },
];

const OPINION_CATEGORIES = [
  { id: 'before', label: 'BEFORE Dec 7' },
  { id: 'after', label: 'AFTER Dec 7' },
];

const CORRECT_CATEGORIES: Record<string, string> = {
  'oppose-88': 'before',
  'afc-800k': 'before',
  'lindbergh': 'before',
  'approve-97': 'after',
  'afc-disbanded': 'after',
  'enlistment': 'after',
};

interface BreakingNewsBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function BreakingNewsBeat({ host, onComplete, onSkip, onBack }: BreakingNewsBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [stationsListened, setStationsListened] = useState<Set<string>>(new Set());
  const [sortingComplete, setSortingComplete] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.stationsListened) {
          setStationsListened(new Set(checkpoint.state.stationsListened));
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
        state: {
          stationsListened: Array.from(stationsListened),
        },
      });
    }
  }, [screen, stationsListened, saveCheckpoint]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      setScreen(SCREENS[currentIndex + 1]);
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete]);

  const handleStationSelect = (station: RadioStation) => {
    setSelectedStation(station);
    setStationsListened((prev) => new Set([...prev, station.id]));
  };

  const handleSortingComplete = (score: number, total: number) => {
    setSortingComplete(true);
  };

  const allStationsListened = stationsListened.size >= 2; // Require at least 2

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Breaking News</h1>
          <p className="text-white/50 text-xs">Beat 5 of 10</p>
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
                  <Radio size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">America Learns</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  December 7, 1941 was a quiet Sunday afternoon across America. Families gathered around radios for football games and symphony concerts. Then everything changed.
                </p>
                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10">
                  <p className="text-white/60 text-sm">
                    <strong className="text-amber-400">2:26 PM Eastern Time</strong><br />
                    The first bulletins interrupted regular programming
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Tune In
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* RADIO DIAL */}
          {screen === 'radio-dial' && (
            <motion.div key="radio-dial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-2">Turn the Dial</h3>
                <p className="text-white/60 text-sm">Select a station to hear how they broke the news</p>
              </div>

              {/* Vintage Radio */}
              <div className="bg-gradient-to-b from-amber-900/40 to-amber-950/60 rounded-3xl p-6 border-2 border-amber-800/50 mb-6">
                {/* Radio display */}
                <div className="bg-black/50 rounded-xl p-4 mb-4 border border-amber-700/30">
                  {selectedStation ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-400 font-mono font-bold">{selectedStation.name}</span>
                        <span className="text-amber-400/60 text-xs">{selectedStation.time}</span>
                      </div>
                      <p className="text-green-400/80 text-xs mb-2">Interrupted: {selectedStation.program}</p>
                      <p className="text-amber-100 text-sm italic leading-relaxed">
                        {selectedStation.announcement}
                      </p>
                    </motion.div>
                  ) : (
                    <p className="text-amber-400/50 text-center text-sm">Select a station below...</p>
                  )}
                </div>

                {/* Station buttons */}
                <div className="flex justify-center gap-4">
                  {RADIO_STATIONS.map((station) => (
                    <motion.button
                      key={station.id}
                      onClick={() => handleStationSelect(station)}
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                        selectedStation?.id === station.id
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : stationsListened.has(station.id)
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-black/30 border-amber-700/50 text-amber-400/60 hover:border-amber-500'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {station.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="text-center text-white/40 text-sm mb-4">
                {stationsListened.size}/{RADIO_STATIONS.length} stations heard
              </div>

              <button
                onClick={nextScreen}
                disabled={!allStationsListened}
                className={`w-full py-4 font-bold rounded-xl transition-colors ${allStationsListened ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/10 text-white/30'}`}
              >
                {allStationsListened ? 'See the Headlines' : 'Listen to more stations'}
              </button>
            </motion.div>
          )}

          {/* NEWSPAPER */}
          {screen === 'newspaper' && (
            <motion.div key="newspaper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <Newspaper size={32} className="text-amber-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-6">December 8, 1941</h3>

                {/* Newspaper front page mockup */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-amber-50 rounded-lg p-4 max-w-sm w-full shadow-xl"
                >
                  <div className="text-center border-b-2 border-black pb-2 mb-3">
                    <p className="text-black font-serif text-xs">THE NEW YORK TIMES</p>
                  </div>
                  <h2 className="text-black font-serif font-bold text-xl text-center mb-2">
                    JAPAN WARS ON U.S. AND BRITAIN
                  </h2>
                  <p className="text-black font-serif text-sm text-center mb-3">
                    MAKES SUDDEN ATTACK ON HAWAII;<br />
                    HEAVY FIGHTING AT SEA REPORTED
                  </p>
                  <div className="border-t border-black pt-2 text-black text-xs font-serif space-y-1">
                    <p>• Congress to Vote War Declaration Today</p>
                    <p>• Pacific Fleet Damaged in Surprise Raid</p>
                    <p>• Japanese Also Attack Philippines, Guam</p>
                    <p>• President Roosevelt to Address Nation</p>
                  </div>
                </motion.div>

                <p className="text-white/60 text-sm text-center mt-4 max-w-sm">
                  Newspapers printed EXTRA editions throughout the night. By morning, every American knew their world had changed.
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                See the Shift
              </button>
            </motion.div>
          )}

          {/* OPINION SHIFT - DRAG AND DROP */}
          {screen === 'opinion-shift' && (
            <motion.div key="opinion-shift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative">
              {!sortingComplete ? (
                <DragAndDropSorter
                  mode="categorize"
                  items={OPINION_ITEMS}
                  categories={OPINION_CATEGORIES}
                  correctCategories={CORRECT_CATEGORIES}
                  onComplete={handleSortingComplete}
                  title="The Great Shift"
                  instructions="Sort these facts into BEFORE or AFTER Pearl Harbor"
                />
              ) : (
                <div className="flex flex-col h-full p-6">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                      <ArrowRight size={40} className="text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-4">Overnight Transformation</h2>
                    <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-center">
                          <p className="text-red-400 text-2xl font-bold">88%</p>
                          <p className="text-white/50 text-xs">Opposed War</p>
                          <p className="text-white/30 text-xs">Jan 1940</p>
                        </div>
                        <ArrowRight className="text-amber-400" />
                        <div className="text-center">
                          <p className="text-green-400 text-2xl font-bold">97%</p>
                          <p className="text-white/50 text-xs">Approved War</p>
                          <p className="text-white/30 text-xs">Dec 8 1941</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                    One More Story
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TSUKIYAMA STORY */}
          {screen === 'tsukiyama' && (
            <motion.div key="tsukiyama" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-3xl mb-4">🎖️</div>
                <h3 className="text-xl font-bold text-white mb-2">Ted Tsukiyama</h3>
                <p className="text-amber-400 text-sm mb-6">Nisei ROTC Student</p>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 space-y-4">
                  <p className="text-white/80 text-sm">
                    Ted Tsukiyama was a University of Hawaii ROTC student, an American of Japanese ancestry — a "Nisei."
                  </p>
                  <p className="text-white/80 text-sm">
                    On December 7, he was called to active duty to defend his homeland. He answered the call proudly.
                  </p>
                  <p className="text-white/80 text-sm">
                    On <strong className="text-red-400">January 19, 1942</strong>, he was dismissed from service — solely because of his ancestry.
                  </p>
                  <p className="text-white/80 text-sm">
                    Later, Tsukiyama fought to prove his loyalty and served with the legendary <strong className="text-amber-400">442nd Regimental Combat Team</strong>, the most decorated unit in U.S. military history.
                  </p>
                </div>

                <p className="text-white/50 text-sm text-center mt-4 max-w-sm italic">
                  "We had to prove we were Americans. We did it on the battlefield."
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Beat 5
              </button>
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 items-center justify-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">📻</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Beat 5 Complete!</h2>
              <p className="text-white/60 mb-6">Breaking News - America Learns</p>
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
              </div>
              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Nagumo's Dilemma - What if Japan had launched a third wave?
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
