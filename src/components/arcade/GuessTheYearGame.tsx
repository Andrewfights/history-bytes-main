import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Lock, Trophy, Target, Zap, Crown, Flame, Award } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface GuessTheYearProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

interface GameEvent {
  text: string;
  year: number;
  explanation: string;
  emoji: string;
  difficulty: 1 | 2 | 3 | 4;
}

const EVENT_POOL: GameEvent[] = [
  // Difficulty 1 — Famous, wide range
  { text: 'The Moon Landing', year: 1969, explanation: 'Apollo 11 landed on the Moon on July 20, 1969. Neil Armstrong became the first human to walk on its surface.', emoji: '🌙', difficulty: 1 },
  { text: 'Columbus reaches the Americas', year: 1492, explanation: 'Christopher Columbus landed in the Bahamas on October 12, 1492, beginning European exploration of the Americas.', emoji: '⛵', difficulty: 1 },
  { text: 'The Berlin Wall falls', year: 1989, explanation: 'The Berlin Wall fell on November 9, 1989, symbolizing the end of the Cold War and German reunification.', emoji: '🧱', difficulty: 1 },
  { text: 'The Storming of the Bastille', year: 1789, explanation: 'The Bastille was stormed on July 14, 1789, marking the symbolic start of the French Revolution.', emoji: '🏰', difficulty: 1 },
  { text: 'World War II ends', year: 1945, explanation: 'WWII officially ended on September 2, 1945, when Japan signed the instrument of surrender aboard the USS Missouri.', emoji: '🕊️', difficulty: 1 },
  { text: 'Declaration of Independence signed', year: 1776, explanation: 'The United States Declaration of Independence was adopted by the Continental Congress on July 4, 1776.', emoji: '🇺🇸', difficulty: 1 },
  { text: 'Construction of the Great Pyramid', year: -2560, explanation: 'The Great Pyramid of Giza was constructed around 2560 BCE as a tomb for Pharaoh Khufu.', emoji: '🔺', difficulty: 1 },
  // Difficulty 2 — Moderately famous
  { text: 'Gutenberg prints the first Bible', year: 1455, explanation: 'Johannes Gutenberg completed his famous 42-line Bible around 1455, revolutionizing information access.', emoji: '📖', difficulty: 2 },
  { text: 'Signing of the Magna Carta', year: 1215, explanation: 'King John sealed the Magna Carta at Runnymede in 1215, laying foundations for constitutional law.', emoji: '📜', difficulty: 2 },
  { text: 'The Black Death reaches Europe', year: 1347, explanation: 'The bubonic plague arrived in Europe in 1347, killing an estimated 30–60% of the population.', emoji: '💀', difficulty: 2 },
  { text: 'Martin Luther posts the 95 Theses', year: 1517, explanation: 'Luther nailed his theses to the church door in Wittenberg in 1517, sparking the Protestant Reformation.', emoji: '⛪', difficulty: 2 },
  { text: 'Napoleon crowned Emperor', year: 1804, explanation: 'Napoleon Bonaparte crowned himself Emperor of the French on December 2, 1804 at Notre-Dame.', emoji: '👑', difficulty: 2 },
  { text: 'The Wright Brothers\' first flight', year: 1903, explanation: 'Orville and Wilbur Wright achieved powered flight on December 17, 1903 at Kitty Hawk, North Carolina.', emoji: '✈️', difficulty: 2 },
  { text: 'The assassination of Julius Caesar', year: -44, explanation: 'Caesar was assassinated on the Ides of March (March 15), 44 BCE, by a group of Roman senators.', emoji: '🗡️', difficulty: 2 },
  // Difficulty 3 — Less obvious
  { text: 'Fall of Constantinople', year: 1453, explanation: 'The Ottoman Empire captured Constantinople in 1453, ending the Byzantine Empire.', emoji: '⚔️', difficulty: 3 },
  { text: 'The Great Fire of London', year: 1666, explanation: 'The fire raged through London from September 2–6, 1666, destroying over 13,000 houses.', emoji: '🔥', difficulty: 3 },
  { text: 'Treaty of Westphalia signed', year: 1648, explanation: 'The 1648 treaties ended the Thirty Years\' War and established the modern concept of national sovereignty.', emoji: '🤝', difficulty: 3 },
  { text: 'The Spanish Armada defeated', year: 1588, explanation: 'England defeated the Spanish Armada in 1588, establishing English naval dominance.', emoji: '🚢', difficulty: 3 },
  { text: 'Leonardo da Vinci paints the Mona Lisa', year: 1503, explanation: 'Da Vinci began painting the Mona Lisa around 1503. It is now the most famous painting in the world.', emoji: '🎨', difficulty: 3 },
  { text: 'Founding of the Roman Republic', year: -509, explanation: 'Romans overthrew the monarchy in 509 BCE, establishing a republic that lasted nearly 500 years.', emoji: '🏛️', difficulty: 3 },
  { text: 'The Haitian Revolution begins', year: 1791, explanation: 'Enslaved people in Saint-Domingue launched the largest successful slave revolt in 1791.', emoji: '⚡', difficulty: 3 },
  { text: 'Cleopatra becomes Pharaoh', year: -51, explanation: 'Cleopatra VII became pharaoh around 51 BCE and was the last active ruler of the Ptolemaic Kingdom.', emoji: '🐍', difficulty: 3 },
  // Difficulty 4 — Precision required
  { text: 'The Edict of Nantes is signed', year: 1598, explanation: 'Henry IV signed the Edict of Nantes in 1598, granting French Protestants substantial rights.', emoji: '✒️', difficulty: 4 },
  { text: 'The Congress of Vienna concludes', year: 1815, explanation: 'The Congress of Vienna concluded in 1815, redrawing Europe\'s map after Napoleon\'s defeat.', emoji: '🗺️', difficulty: 4 },
  { text: 'The Defenestration of Prague', year: 1618, explanation: 'In 1618, Protestant nobles threw Catholic officials from a window, triggering the Thirty Years\' War.', emoji: '🪟', difficulty: 4 },
  { text: 'The Battle of Hastings', year: 1066, explanation: 'William the Conqueror defeated King Harold II at the Battle of Hastings in 1066, reshaping England.', emoji: '🏹', difficulty: 4 },
  { text: 'The Rosetta Stone is discovered', year: 1799, explanation: 'French soldiers discovered the Rosetta Stone in 1799, eventually unlocking Egyptian hieroglyphs.', emoji: '🪨', difficulty: 4 },
  { text: 'The Partition of India', year: 1947, explanation: 'British India was divided into India and Pakistan in 1947, triggering one of history\'s largest mass migrations.', emoji: '🗾', difficulty: 4 },
];

const TOTAL_ROUNDS = 5;

// Difficulty → slider range width (years from actual)
const DIFFICULTY_RANGE: Record<number, number> = {
  1: 250, // ±250 years → 500 year slider
  2: 150, // ±150 years → 300 year slider
  3: 75,  // ±75 years  → 150 year slider
  4: 40,  // ±40 years  → 80 year slider
};

// Round → difficulty mapping (ramps up)
const ROUND_DIFFICULTY: number[] = [1, 2, 2, 3, 4];

function getSliderRange(event: GameEvent): { min: number; max: number } {
  const halfRange = DIFFICULTY_RANGE[event.difficulty] || 200;
  return {
    min: event.year - halfRange,
    max: event.year + halfRange,
  };
}

function getScore(distance: number): number {
  if (distance === 0) return 100;
  if (distance <= 1) return 95;
  if (distance <= 5) return 85;
  if (distance <= 10) return 70;
  if (distance <= 25) return 50;
  if (distance <= 50) return 30;
  if (distance <= 100) return 10;
  return 0;
}

function getMedal(score: number): { icon: React.ReactNode; label: string; color: string } {
  if (score === 100) return { icon: <Crown size={20} />, label: 'Dead On!', color: 'text-secondary' };
  if (score >= 85) return { icon: <Target size={20} />, label: 'Sharpshooter', color: 'text-success' };
  if (score >= 50) return { icon: <Zap size={20} />, label: 'Close!', color: 'text-primary' };
  if (score >= 10) return { icon: <Trophy size={20} />, label: 'Keep trying', color: 'text-muted-foreground' };
  return { icon: <Trophy size={20} />, label: 'Way off!', color: 'text-destructive' };
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year}`;
}

function getEraLabel(year: number): string {
  if (year < -3000) return 'Prehistoric';
  if (year < -500) return 'Ancient World';
  if (year < 500) return 'Classical Era';
  if (year < 1400) return 'Medieval';
  if (year < 1600) return 'Renaissance';
  if (year < 1800) return 'Early Modern';
  if (year < 1900) return 'Industrial Age';
  if (year < 1950) return 'World Wars';
  if (year < 2000) return 'Cold War Era';
  return 'Modern Era';
}

function getMasteryState(avgScore: number): { label: string; icon: string } {
  if (avgScore >= 90) return { label: 'Crowned', icon: '👑' };
  if (avgScore >= 70) return { label: 'Mastered', icon: '●' };
  if (avgScore >= 50) return { label: 'Accurate', icon: '◐' };
  return { label: 'Played', icon: '○' };
}

function selectRoundsFromPool(): GameEvent[] {
  const selected: GameEvent[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const diff = ROUND_DIFFICULTY[i];
    const pool = EVENT_POOL.filter(e => e.difficulty === diff && !selected.includes(e));
    if (pool.length > 0) {
      selected.push(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      // fallback: pick any unused event
      const remaining = EVENT_POOL.filter(e => !selected.includes(e));
      selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }
  }
  return selected;
}

// --- Achievements ---
interface Achievement {
  id: string;
  emoji: string;
  label: string;
  check: (scores: number[], distances: number[]) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'dead-on', emoji: '🎯', label: 'Dead On — Exact year guessed!', check: (_, d) => d.some(x => x === 0) },
  { id: 'human-timeline', emoji: '🕰', label: 'Human Timeline — All rounds within ±10', check: (s) => s.every(x => x >= 70) },
  { id: 'streak-3', emoji: '🔥', label: 'Hot Streak — 3 close guesses in a row', check: (s) => s.some((_, i) => i >= 2 && s[i] >= 70 && s[i - 1] >= 70 && s[i - 2] >= 70) },
  { id: 'crowned', emoji: '👑', label: 'Chrono King — Average ±5 years', check: (_, d) => d.reduce((a, b) => a + b, 0) / d.length <= 5 },
];

export function GuessTheYearGame({ onBack, onComplete }: GuessTheYearProps) {
  const [events] = useState<GameEvent[]>(() => selectRoundsFromPool());
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState<number>(() => {
    const range = getSliderRange(events[0]);
    return Math.round((range.min + range.max) / 2);
  });
  const [roundResult, setRoundResult] = useState<{ distance: number; score: number } | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [distances, setDistances] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const event = events[round];
  const range = useMemo(() => getSliderRange(event), [event]);

  const handleLockIn = useCallback(() => {
    const distance = Math.abs(guess - event.year);
    const pts = getScore(distance);
    setRoundResult({ distance, score: pts });
    setScores(prev => [...prev, pts]);
    setDistances(prev => [...prev, distance]);
  }, [guess, event]);

  const handleNext = useCallback(() => {
    const nextRound = round + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      setFinished(true);
    } else {
      setRound(nextRound);
      const nextRange = getSliderRange(events[nextRound]);
      setGuess(Math.round((nextRange.min + nextRange.max) / 2));
      setRoundResult(null);
    }
  }, [round, events]);

  // --- Final results screen ---
  if (finished) {
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / TOTAL_ROUNDS);
    const mastery = getMasteryState(avg);

    // Bonuses
    const perfectRoundBonus = scores.every(s => s >= 70) ? 50 : 0;
    // Streak bonus: any 3 consecutive with score >= 70
    let streakBonus = 0;
    for (let i = 2; i < scores.length; i++) {
      if (scores[i] >= 70 && scores[i - 1] >= 70 && scores[i - 2] >= 70) {
        streakBonus = 25;
        break;
      }
    }
    const baseXP = Math.round(total / 5);
    const xp = baseXP + perfectRoundBonus + streakBonus;

    // Earned achievements
    const earned = ACHIEVEMENTS.filter(a => a.check(scores, distances));

    return (
      <div className="px-4 py-6 pb-28">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <p className="text-5xl">{mastery.icon === '👑' ? '👑' : '🕰️'}</p>
          <h1 className="font-editorial text-2xl font-bold">Game Complete!</h1>
          <p className="text-sm text-muted-foreground">
            Mastery: <span className="font-semibold text-foreground">{mastery.icon} {mastery.label}</span>
          </p>

          {/* Round breakdown */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 text-left">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">R{i + 1}</span>
                  <span className="truncate max-w-[160px]">{events[i].text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">±{distances[i]}yr</span>
                  <span className={`font-bold ${s >= 85 ? 'text-success' : s >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex items-center justify-between font-bold">
              <span>Average</span>
              <span className="text-primary">{avg} pts</span>
            </div>
          </div>

          {/* Bonuses */}
          {(perfectRoundBonus > 0 || streakBonus > 0) && (
            <div className="space-y-1.5">
              {perfectRoundBonus > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary">
                  <Award size={16} /> Perfect Accuracy Bonus +{perfectRoundBonus} XP
                </div>
              )}
              {streakBonus > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary">
                  <Flame size={16} /> Streak Bonus +{streakBonus} XP
                </div>
              )}
            </div>
          )}

          {/* Achievements */}
          {earned.length > 0 && (
            <div className="bg-card border border-secondary/30 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Achievements Unlocked</p>
              {earned.map(a => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{a.emoji}</span>
                  <span>{a.label}</span>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-3xl font-bold text-gradient-gold">+{xp} XP</p>

          <button onClick={() => onComplete(xp)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            Back to Arcade
          </button>
        </motion.div>
      </div>
    );
  }

  // --- Active round ---
  const medal = roundResult ? getMedal(roundResult.score) : null;
  const eraLabel = getEraLabel(guess);
  const difficultyLabel = ['', 'Casual', 'Intermediate', 'Advanced', 'Mastery'][event.difficulty];

  return (
    <div className="px-4 py-6 pb-28">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>

      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-editorial text-2xl font-bold">🕰️ Guess the Year</h1>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
          event.difficulty >= 3 ? 'border-secondary/40 text-secondary' : 'border-border text-muted-foreground'
        }`}>{difficultyLabel}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Round {round + 1} of {TOTAL_ROUNDS}</p>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {events.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < round ? (scores[i] >= 70 ? 'bg-success' : scores[i] >= 30 ? 'bg-primary' : 'bg-destructive/50')
            : i === round ? 'bg-primary/50' : 'bg-muted'
          }`} />
        ))}
      </div>

      {/* Event card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-card border border-border rounded-2xl p-5 mb-6"
        >
          <div className="text-4xl mb-3 text-center">{event.emoji}</div>
          <p className="text-lg font-semibold text-center leading-snug">{event.text}</p>
        </motion.div>
      </AnimatePresence>

      {/* Slider or result */}
      {!roundResult ? (
        <div className="space-y-5">
          {/* Era label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={eraLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {eraLabel}
            </motion.p>
          </AnimatePresence>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>{formatYear(range.min)}</span>
              <span>{formatYear(range.max)}</span>
            </div>
            <Slider
              value={[guess]}
              min={range.min}
              max={range.max}
              step={1}
              onValueChange={([v]) => setGuess(v)}
              className="[&_[role=slider]]:h-7 [&_[role=slider]]:w-7 [&_[role=slider]]:border-2 [&_[role=slider]]:border-secondary [&_[role=slider]]:bg-secondary [&_[role=slider]]:shadow-[0_0_12px_hsl(var(--secondary)/0.5)]"
            />
            <motion.p
              key={guess}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-center text-3xl font-bold text-secondary"
            >
              {formatYear(guess)}
            </motion.p>
          </div>

          {/* Nudge buttons */}
          <div className="flex items-center justify-center gap-2">
            {[-5, -1, 1, 5].map(n => (
              <button
                key={n}
                onClick={() => setGuess(g => Math.max(range.min, Math.min(range.max, g + n)))}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-primary/10 active:scale-95 transition-all"
                aria-label={`Nudge ${n > 0 ? '+' : ''}${n} year${Math.abs(n) !== 1 ? 's' : ''}`}
              >
                {n > 0 ? `+${n}` : n}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLockIn}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Lock In Guess
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Result card */}
          <div className={`rounded-2xl p-5 space-y-3 ${
            roundResult.score >= 70 ? 'bg-success/10 border border-success/30' :
            roundResult.score >= 30 ? 'bg-primary/10 border border-primary/30' :
            'bg-destructive/10 border border-destructive/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Your Guess</p>
                <p className="text-xl font-bold">{formatYear(guess)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Correct Year</p>
                <p className="text-xl font-bold text-primary">{formatYear(event.year)}</p>
              </div>
            </div>

            <div className="text-center border-t border-border/50 pt-3">
              <p className="text-sm text-muted-foreground mb-1">
                {roundResult.distance === 0 ? 'Exact match!' : `Off by ${roundResult.distance} year${roundResult.distance !== 1 ? 's' : ''}`}
              </p>
              <div className={`flex items-center justify-center gap-1.5 font-bold text-lg ${medal?.color}`}>
                {medal?.icon}
                <span>+{roundResult.score} pts</span>
              </div>
              <p className={`text-xs mt-1 ${medal?.color}`}>{medal?.label}</p>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-sm text-muted-foreground leading-relaxed">{event.explanation}</p>

          <button onClick={handleNext} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold">
            {round + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Round'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
