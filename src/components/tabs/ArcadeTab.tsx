/**
 * ArcadeTab - The Cabinet
 * Fast play games, daily challenges, leaderboards, achievements
 * Design: Dark academy discipline, green accent for "fresh today"
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Clock, MapPin, Calendar, User, Trophy, Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Data and utilities
import {
  ARCADE_GAMES,
  ArcadeGame,
  XP_CAP_PLAYS,
  getDailyFeaturedGame,
  getPopularGames,
  getGameImageUrl,
} from '@/data/arcadeGames';
import { useLiveGameThumbnails } from '@/hooks/useLiveData';
import { useApp } from '@/context/AppContext';

// Game components
import { WordleGame } from '@/components/arcade/WordleGame';
import { GuessTheYearGame } from '@/components/arcade/GuessTheYearGame';
import { TwoTruthsGame } from '@/components/arcade/TwoTruthsGame';
import { AnachronismGame } from '@/components/arcade/AnachronismGame';
import { ConnectionsGame } from '@/components/arcade/ConnectionsGame';
import { MapMysteryGame } from '@/components/arcade/MapMysteryGame';
import { ArtifactGame } from '@/components/arcade/ArtifactGame';
import { CauseEffectGame } from '@/components/arcade/CauseEffectGame';
import { GeoguessrGame } from '@/components/arcade/GeoguessrGame';

// ============================================
// GAME DATA (preserved from original)
// ============================================

const chronoEvents: { id: string; text: string; year: number }[][] = [
  [
    { id: 'e1', text: 'Construction of the Great Pyramid', year: -2560 },
    { id: 'e2', text: 'Fall of the Roman Empire', year: 476 },
    { id: 'e3', text: 'Signing of the Magna Carta', year: 1215 },
    { id: 'e4', text: 'French Revolution begins', year: 1789 },
  ],
  [
    { id: 'e5', text: 'Gutenberg invents the printing press', year: 1440 },
    { id: 'e6', text: 'Columbus reaches the Americas', year: 1492 },
    { id: 'e7', text: 'American Declaration of Independence', year: 1776 },
    { id: 'e8', text: 'Moon landing', year: 1969 },
  ],
  [
    { id: 'e9', text: 'Birth of Muhammad', year: 570 },
    { id: 'e10', text: 'Black Death ravages Europe', year: 1347 },
    { id: 'e11', text: 'Industrial Revolution begins', year: 1760 },
    { id: 'e12', text: 'Berlin Wall falls', year: 1989 },
  ],
];

const whoAmIQuestions: { clues: string[]; answer: string; choices: string[] }[] = [
  { clues: ['I crossed the Rubicon.', 'I was betrayed on the Ides of March.', 'I said "Veni, vidi, vici."'], answer: 'Julius Caesar', choices: ['Julius Caesar', 'Augustus', 'Nero', 'Cicero'] },
  { clues: ['I led a slave rebellion.', 'I was a gladiator.', 'I defied the Roman Republic.'], answer: 'Spartacus', choices: ['Hannibal', 'Spartacus', 'Vercingetorix', 'Boudicca'] },
  { clues: ['I unified Egypt with Rome.', 'I was the last pharaoh.', 'My beauty was legendary.'], answer: 'Cleopatra', choices: ['Nefertiti', 'Hatshepsut', 'Cleopatra', 'Isis'] },
];

const quoteOrFakeData: { quote: string; attribution: string; isReal: boolean; explanation: string }[] = [
  { quote: 'The only thing we have to fear is fear itself.', attribution: 'Franklin D. Roosevelt', isReal: true, explanation: 'FDR\'s famous 1933 inaugural address during the Great Depression.' },
  { quote: 'I came, I saw, I conquered — but the parking was terrible.', attribution: 'Julius Caesar', isReal: false, explanation: 'Caesar said "Veni, vidi, vici" but the parking joke is fabricated.' },
  { quote: 'That\'s one small step for man, one giant leap for mankind.', attribution: 'Neil Armstrong', isReal: true, explanation: 'Armstrong spoke these words stepping onto the Moon on July 20, 1969.' },
];

// ============================================
// GAME COMPONENTS (preserved from original)
// ============================================

function ChronoGame({ onBack, onComplete }: { onBack: () => void; onComplete: (xp: number) => void }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [order, setOrder] = useState<typeof chronoEvents[0]>(() => [...chronoEvents[0]].sort(() => Math.random() - 0.5));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const moveItem = (idx: number, dir: -1 | 1) => {
    if (submitted) return;
    const newOrder = [...order];
    const target = idx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setOrder(newOrder);
  };

  const handleSubmit = () => {
    const correct = order.every((e, i) => i === 0 || e.year >= order[i - 1].year);
    if (correct) setScore(s => s + 1);
    setSubmitted(true);
  };

  const handleNext = () => {
    const next = roundIdx + 1;
    if (next >= chronoEvents.length) {
      onComplete(score * 25);
    } else {
      setRoundIdx(next);
      setOrder([...chronoEvents[next]].sort(() => Math.random() - 0.5));
      setSubmitted(false);
    }
  };

  const isCorrectOrder = order.every((e, i) => i === 0 || e.year >= order[i - 1].year);

  return (
    <div className="px-4 py-6 pb-28">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-3 hover:text-off-white transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-serif text-2xl font-bold italic text-off-white mb-1">Chrono Order</h1>
      <p className="text-sm text-text-3 mb-6">Round {roundIdx + 1} of {chronoEvents.length} — arrange oldest to newest</p>
      <div className="space-y-2">
        {order.map((event, i) => (
          <motion.div key={event.id} layout className={cn(
            'flex items-center gap-3 p-3 rounded-xl border',
            submitted ? (isCorrectOrder ? 'border-success bg-success/10' : 'border-ha-red bg-ha-red/10') : 'border-border-gold bg-ink-lift'
          )}>
            <div className="flex flex-col gap-1">
              <button onClick={() => moveItem(i, -1)} disabled={submitted || i === 0} className="p-0.5 hover:text-gold-2 disabled:opacity-20"><ChevronLeft size={14} className="rotate-90" /></button>
              <button onClick={() => moveItem(i, 1)} disabled={submitted || i === order.length - 1} className="p-0.5 hover:text-gold-2 disabled:opacity-20"><ChevronLeft size={14} className="-rotate-90" /></button>
            </div>
            <span className="flex-1 text-sm font-medium text-off-white">{event.text}</span>
            {submitted && <span className="text-xs text-text-3">{event.year < 0 ? `${Math.abs(event.year)} BCE` : event.year}</span>}
          </motion.div>
        ))}
      </div>
      <div className="mt-6">
        {!submitted ? (
          <button onClick={handleSubmit} className="w-full py-3 rounded-none bg-ha-red text-off-white font-display font-bold uppercase tracking-widest relative">
            <span className="absolute top-0 left-0 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
            Lock In Order
          </button>
        ) : (
          <div>
            <p className={cn('text-center font-bold mb-3', isCorrectOrder ? 'text-success' : 'text-ha-red')}>
              {isCorrectOrder ? 'Correct!' : 'Wrong order'}
            </p>
            <button onClick={handleNext} className="w-full py-3 rounded-none bg-ha-red text-off-white font-display font-bold uppercase tracking-widest">
              {roundIdx + 1 >= chronoEvents.length ? 'Finish' : 'Next Round'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WhoAmIGame({ onBack, onComplete }: { onBack: () => void; onComplete: (xp: number) => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = whoAmIQuestions[qIdx];

  const handleReveal = () => { if (revealedClues < q.clues.length) setRevealedClues(r => r + 1); };
  const handleAnswer = (choice: string) => {
    setSelected(choice);
    if (choice === q.answer) setScore(s => s + (4 - revealedClues));
  };
  const handleNext = () => {
    const next = qIdx + 1;
    if (next >= whoAmIQuestions.length) {
      onComplete(score * 10);
    } else {
      setQIdx(next);
      setRevealedClues(1);
      setSelected(null);
    }
  };

  return (
    <div className="px-4 py-6 pb-28">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-3 hover:text-off-white transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-serif text-2xl font-bold italic text-off-white mb-1">Who Am I?</h1>
      <p className="text-sm text-text-3 mb-6">Question {qIdx + 1} of {whoAmIQuestions.length}</p>
      <div className="space-y-2 mb-6">
        {q.clues.map((clue, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: i < revealedClues ? 1 : 0.2, y: 0 }}
            className={cn('p-3 rounded-xl border', i < revealedClues ? 'border-gold-2/50 bg-gold-2/5' : 'border-border-gold bg-ink-lift')}>
            <span className="text-sm text-off-white">{i < revealedClues ? clue : '???'}</span>
          </motion.div>
        ))}
        {!selected && revealedClues < q.clues.length && (
          <button onClick={handleReveal} className="text-xs text-gold-2 font-bold">Reveal next clue (-points)</button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(choice => (
          <button key={choice} onClick={() => !selected && handleAnswer(choice)} disabled={!!selected}
            className={cn('p-3 rounded-xl border text-sm font-semibold transition-all',
              selected ? (choice === q.answer ? 'border-success bg-success/10 text-success' : choice === selected ? 'border-ha-red bg-ha-red/10 text-ha-red' : 'border-border-gold opacity-40')
              : 'border-border-gold bg-ink-lift text-off-white hover:border-gold-2/50'
            )}>
            {choice}
          </button>
        ))}
      </div>
      {selected && (
        <button onClick={handleNext} className="w-full mt-4 py-3 rounded-none bg-ha-red text-off-white font-display font-bold uppercase tracking-widest">
          {qIdx + 1 >= whoAmIQuestions.length ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}

function QuoteOrFakeGame({ onBack, onComplete }: { onBack: () => void; onComplete: (xp: number) => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const q = quoteOrFakeData[qIdx];

  const handleAnswer = (isReal: boolean) => {
    setAnswer(isReal);
    if (isReal === q.isReal) setScore(s => s + 1);
  };

  const handleNext = () => {
    const next = qIdx + 1;
    if (next >= quoteOrFakeData.length) {
      onComplete(score * 20);
    } else {
      setQIdx(next);
      setAnswer(null);
    }
  };

  return (
    <div className="px-4 py-6 pb-28">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-3 hover:text-off-white transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-serif text-2xl font-bold italic text-off-white mb-1">Quote or Fake</h1>
      <p className="text-sm text-text-3 mb-6">Quote {qIdx + 1} of {quoteOrFakeData.length}</p>
      <div className="bg-ink-lift border border-border-gold rounded-xl p-5 mb-6">
        <p className="text-lg italic leading-relaxed text-off-white">"{q.quote}"</p>
        <p className="text-sm text-text-3 mt-3">— {q.attribution}</p>
      </div>
      {answer === null ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleAnswer(true)} className="py-3 rounded-xl border border-success bg-success/10 text-success font-bold hover:bg-success/20">Real</button>
          <button onClick={() => handleAnswer(false)} className="py-3 rounded-xl border border-ha-red bg-ha-red/10 text-ha-red font-bold hover:bg-ha-red/20">Fake</button>
        </div>
      ) : (
        <div>
          <p className={cn('text-center font-bold mb-2', (answer === q.isReal) ? 'text-success' : 'text-ha-red')}>
            {(answer === q.isReal) ? 'Correct!' : 'Wrong!'}
          </p>
          <p className="text-sm text-text-3 text-center mb-4">{q.explanation}</p>
          <button onClick={handleNext} className="w-full py-3 rounded-none bg-ha-red text-off-white font-display font-bold uppercase tracking-widest">
            {qIdx + 1 >= quoteOrFakeData.length ? 'Finish' : 'Next Quote'}
          </button>
        </div>
      )}
    </div>
  );
}

function GameResults({ title, xp, onBack }: { title: string; xp: number; onBack: () => void }) {
  return (
    <div className="px-4 py-6 pb-28 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-1 to-gold-3 flex items-center justify-center mb-6">
          <Trophy size={36} className="text-void" />
        </div>
        <h1 className="font-serif text-2xl font-bold italic text-off-white">{title} Complete!</h1>
        {xp > 0 ? (
          <p className="font-display text-4xl font-bold text-gold-2 mt-4">+{xp} XP</p>
        ) : (
          <p className="text-sm text-text-3 mt-4">Max XP reached today — great practice!</p>
        )}
        <button onClick={onBack} className="mt-8 px-8 py-3 rounded-none bg-ha-red text-off-white font-display font-bold uppercase tracking-widest relative">
          <span className="absolute top-0 left-0 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
          Back to Arcade
        </button>
      </motion.div>
    </div>
  );
}

// ============================================
// ARCADE UI COMPONENTS
// ============================================

// Custom game icons
const GameIcons = {
  clock: () => <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15 14"/></svg>,
  pin: () => <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  calendar: () => <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="4" y="6" width="16" height="15" rx="1"/><path d="M4 11H20M8 3V7M16 3V7"/></svg>,
  portrait: () => <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/><rect x="5" y="3" width="14" height="18" rx="1"/></svg>,
  book: () => <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M5 4V20L12 18L19 20L19 4L12 6Z"/><path d="M12 6V18"/></svg>,
  shield: () => <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 2L4 6V18L12 22L20 18V6Z"/><path d="M12 2V22"/></svg>,
};

// Filter Chips
function FilterChips({ selected, onSelect }: { selected: string; onSelect: (filter: string) => void }) {
  const filters = ['All Games', 'Quick Play', 'Trivia', 'Timeline', 'Multiplayer'];
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => onSelect(filter)}
          className={cn(
            'flex-shrink-0 px-3.5 py-2 rounded-full font-mono text-[9px] font-semibold tracking-[0.15em] uppercase border transition-colors',
            selected === filter
              ? 'bg-gold-2 text-void border-gold-2'
              : 'bg-ink-lift text-text-2 border-border-gold hover:border-gold-2/30'
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

// Streak Card (compact)
function StreakCard({ streak }: { streak: number }) {
  const days = Array(7).fill(0).map((_, i) => i < streak);
  return (
    <div className="bg-ink-lift border border-border-gold rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3" />
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-1 to-gold-3 flex items-center justify-center flex-shrink-0">
        <Flame size={16} className="text-void" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[8px] tracking-[0.25em] text-text-3 uppercase font-bold">Current Streak</div>
        <div className="font-serif text-lg font-bold italic text-gold-2">{streak} days</div>
      </div>
      <div className="flex gap-0.5">
        {days.map((on, i) => (
          <div key={i} className={cn('w-1.5 h-3.5 rounded-sm', on ? 'bg-gold-2' : 'bg-off-white/10')} />
        ))}
      </div>
    </div>
  );
}

// Daily Challenge Hero
function DailyChallenge({ game, onPlay }: { game: ArcadeGame; onPlay: () => void }) {
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 23, seconds: 11 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-ink-lift border border-border-gold rounded-xl overflow-hidden">
      {/* Media section */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#3a2818] to-[#0a0604]">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(230,171,42,.3),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_70%,rgba(61,214,122,.15),transparent_50%)]" />
        {/* Silhouette */}
        <div className="absolute bottom-0 left-[10%] right-[10%] h-[45%] bg-gradient-to-t from-[rgba(10,5,3,.9)] via-[rgba(20,10,5,.6)] to-transparent"
          style={{ clipPath: 'polygon(0 100%,8% 60%,15% 70%,24% 45%,34% 65%,42% 50%,55% 55%,68% 30%,78% 55%,88% 40%,100% 60%,100% 100%)' }} />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />

        {/* Live tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-success px-2.5 py-1 font-mono text-[9px] tracking-[0.28em] uppercase font-bold border border-success/30 rounded z-10">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          Daily · Live
        </div>

        {/* Countdown */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 border border-border-gold rounded z-10">
          <Clock size={10} className="text-gold-2" />
          <span className="font-mono text-[10px] text-gold-2 font-bold tracking-wide">
            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 -mt-14 relative z-10">
        <div className="font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-1">Today's Dispatch</div>
        <h2 className="font-serif text-[28px] font-bold italic text-off-white leading-none mb-1.5">What Happened<br/>Here?</h2>
        <p className="font-body text-[11.5px] text-text-2 leading-relaxed mb-3">
          Identify the historical event from the scene. Five stills, ten seconds each.
        </p>

        {/* Meta pills */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          <span className="px-2 py-1 rounded-full font-mono text-[8px] font-bold tracking-[0.12em] uppercase bg-gold-2/12 text-gold-2 border border-border-gold-hi">+100 XP</span>
          <span className="px-2 py-1 rounded-full font-mono text-[8px] font-bold tracking-[0.12em] uppercase bg-success/10 text-success border border-success/30">5 min</span>
          <span className="px-2 py-1 rounded-full font-mono text-[8px] font-bold tracking-[0.12em] uppercase bg-ha-red/10 text-ha-red border border-ha-red/30">Hard</span>
        </div>

        {/* CTA */}
        <button
          onClick={onPlay}
          className="w-full py-3 bg-ha-red text-off-white font-display text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 relative"
        >
          <span className="absolute top-0 left-0 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
          Play Now
          <ChevronRight size={12} />
        </button>

        {/* Stats */}
        <div className="flex gap-4 mt-2.5 pt-2.5 border-t border-off-white/8">
          <div>
            <div className="font-display text-sm font-bold text-off-white">1,247</div>
            <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-0.5">Played</div>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-off-white">8.3/10</div>
            <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-0.5">Avg Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Game Card (mobile carousel style)
interface GameCardProps {
  game: ArcadeGame;
  colorTheme: 'green' | 'red' | 'gold' | 'blue' | 'brown' | 'orange';
  badge?: string;
  badgeType?: 'hot' | 'new' | 'default';
  onPlay: () => void;
}

function GameCard({ game, colorTheme, badge, badgeType = 'default', onPlay }: GameCardProps) {
  const themeColors = {
    green: { bg: 'from-[#1a3a28] to-[#0a1a10]', glow: 'rgba(61,214,122,.25)', icon: 'text-success' },
    red: { bg: 'from-[#3a1810] to-[#0a0604]', glow: 'rgba(205,14,20,.25)', icon: 'text-ha-red' },
    gold: { bg: 'from-[#3a2a10] to-[#0a0604]', glow: 'rgba(230,171,42,.25)', icon: 'text-gold-2' },
    blue: { bg: 'from-[#1a2a3a] to-[#081018]', glow: 'rgba(74,159,255,.2)', icon: 'text-blue-400' },
    brown: { bg: 'from-[#3a2818] to-[#1a1008]', glow: 'rgba(200,160,120,.2)', icon: 'text-gold-2' },
    orange: { bg: 'from-[#3a1810] to-[#0a0604]', glow: 'rgba(178,100,31,.3)', icon: 'text-gold-3' },
  };

  const theme = themeColors[colorTheme];
  const IconComponent = GameIcons[game.type === 'guess-year' ? 'clock' : game.type === 'geoguessr-where' ? 'pin' : game.type === 'chrono' ? 'calendar' : 'book'];

  return (
    <div
      onClick={onPlay}
      className="flex-shrink-0 w-44 bg-ink-lift border border-border-gold rounded-xl overflow-hidden cursor-pointer hover:border-border-gold-hi transition-colors"
    >
      {/* Media */}
      <div className={cn('h-28 relative overflow-hidden bg-gradient-to-br', theme.bg)}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 40%, ${theme.glow}, transparent 60%)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

        {/* Icon */}
        <div className={cn('absolute top-2.5 left-2.5 w-6 h-6 opacity-70', theme.icon)}>
          <IconComponent />
        </div>

        {/* Badge */}
        {badge && (
          <div className={cn(
            'absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded font-mono text-[7px] tracking-[0.2em] uppercase font-bold border bg-black/70',
            badgeType === 'hot' && 'text-ha-red border-ha-red/30 flex items-center gap-1',
            badgeType === 'new' && 'text-success border-success/30',
            badgeType === 'default' && 'text-gold-2 border-border-gold'
          )}>
            {badgeType === 'hot' && <span className="w-1 h-1 bg-ha-red rounded-full" />}
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 relative">
        <div className="absolute top-0 left-3 w-4 h-0.5 bg-ha-red" />
        <div className="font-mono text-[7.5px] tracking-[0.25em] text-text-3 uppercase font-semibold mt-2 mb-0.5">{game.category || 'Trivia'}</div>
        <div className="font-serif text-[15px] font-bold italic text-off-white leading-tight mb-2">{game.title}</div>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-display text-[11px] font-bold text-gold-2">+{game.xpReward} XP</div>
            <div className="font-mono text-[7px] tracking-[0.15em] text-text-3 uppercase font-semibold">~2 min</div>
          </div>
          <div className="w-6 h-6 rounded-full bg-ha-red flex items-center justify-center">
            <Play size={10} fill="currentColor" className="text-off-white ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard
function Leaderboard() {
  const [period, setPeriod] = useState<'Day' | 'Wk' | 'All'>('Wk');
  const leaders = [
    { rank: 1, name: 'pharoh_of_queens', score: 24850 },
    { rank: 2, name: 'historianjane', score: 22140 },
    { rank: 3, name: 'bronze_age_bard', score: 19720 },
    { rank: 4, name: 'captain_lockard', score: 18330 },
    { rank: 5, name: 'vespasian1970', score: 17900 },
  ];

  return (
    <div className="bg-ink-lift border border-border-gold rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-2.5 flex justify-between items-end border-b border-off-white/8">
        <div>
          <div className="font-mono text-[8px] tracking-[0.28em] text-gold-2 uppercase font-bold mb-0.5">This Week</div>
          <div className="font-serif text-base font-bold italic text-off-white">Global Rank</div>
        </div>
        <div className="flex gap-0.5">
          {(['Day', 'Wk', 'All'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-2 py-1 font-mono text-[8px] tracking-[0.18em] uppercase font-bold rounded',
                period === p ? 'bg-charcoal text-gold-2' : 'text-text-3'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="py-1">
        {leaders.map((l, i) => (
          <div key={l.rank} className={cn('px-3.5 py-2 flex items-center gap-2.5 border-b border-off-white/8 last:border-b-0')}>
            <div className={cn(
              'w-5 font-display text-sm font-bold text-center',
              i === 0 && 'text-gold-2',
              i === 1 && 'text-text-2',
              i === 2 && 'text-gold-3',
              i > 2 && 'text-text-3'
            )}>
              {l.rank}
            </div>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-deep flex-shrink-0" />
            <div className="flex-1 font-body text-[11.5px] font-semibold text-off-white truncate">{l.name}</div>
            <div className="font-mono text-[10px] text-gold-2 font-bold tracking-wide">{l.score.toLocaleString()}</div>
          </div>
        ))}
        {/* Your rank */}
        <div className="px-3 py-2 flex items-center gap-2.5 bg-gold-2/5 border-l-2 border-gold-2">
          <div className="w-5 font-display text-sm font-bold text-center text-text-3">47</div>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-deep flex-shrink-0" />
          <div className="flex-1 font-body text-[11.5px] font-semibold text-off-white truncate">squid (you)</div>
          <div className="font-mono text-[10px] text-gold-2 font-bold tracking-wide">4,820</div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3.5 py-2.5 border-t border-off-white/8 font-mono text-[8.5px] tracking-[0.18em] text-text-3 uppercase font-semibold text-center">
        View Full Board <span className="text-gold-2">→</span>
      </div>
    </div>
  );
}

// Stats Grid
function StatsGrid() {
  const stats = [
    { value: '4,820', label: 'Arcade XP', color: 'gold' },
    { value: '184', label: 'Games Played', color: 'default' },
    { value: '68%', label: 'Win Rate', color: 'green' },
    { value: '12', label: 'Best Streak', color: 'default' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map(stat => (
        <div key={stat.label} className="p-2.5 bg-ink-lift border border-border-gold rounded-lg relative">
          <div className="absolute top-0 left-3 w-3 h-0.5 bg-gold-2" />
          <div className={cn(
            'font-display text-xl font-bold mt-1',
            stat.color === 'gold' && 'text-gold-2',
            stat.color === 'green' && 'text-success',
            stat.color === 'default' && 'text-off-white'
          )}>
            {stat.value}
          </div>
          <div className="font-mono text-[8px] tracking-[0.18em] text-text-3 uppercase font-semibold mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Achievement Card
function AchievementCard({ name, desc, icon, locked }: { name: string; desc: string; icon: React.ReactNode; locked?: boolean }) {
  return (
    <div className={cn('flex-shrink-0 w-26 bg-ink-lift border border-border-gold rounded-xl p-3 flex flex-col items-center text-center', locked && 'opacity-40')}>
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center mb-2 relative border-2',
        locked ? 'border-border-gold bg-charcoal' : 'border-gold-3 bg-gradient-to-br from-gold-2/10 to-gold-3/8'
      )}>
        <div className="absolute inset-[2px] rounded-full border border-dashed border-gold-2/30" />
        <div className={cn('w-4.5 h-4.5', locked ? 'text-text-4' : 'text-gold-2')}>
          {icon}
        </div>
      </div>
      <div className="font-display text-[9px] font-bold text-off-white uppercase tracking-[0.03em] leading-tight mb-0.5">{name}</div>
      <div className="font-mono text-[6.5px] text-text-3 tracking-[0.12em] uppercase font-semibold">{locked ? 'Locked' : desc}</div>
    </div>
  );
}

// ============================================
// MAIN ARCADE TAB
// ============================================

type ActiveGame = null | 'chrono' | 'who-am-i' | 'quote-or-fake' | 'wordle' | 'guess-year' | 'two-truths' | 'anachronism' | 'connections' | 'map-mystery' | 'artifact' | 'cause-effect' | 'geoguessr-where' | 'geoguessr-when' | 'geoguessr-what' | { type: string; xp: number };

export function ArcadeTab() {
  const { user, addXP, getArcadePlaysToday, recordArcadePlay } = useApp();
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [filter, setFilter] = useState('All Games');

  const gameThumbnails = useLiveGameThumbnails();
  const featuredGame = getDailyFeaturedGame();
  const popularGames = getPopularGames();

  const handleGameComplete = (gameType: string, gameTitle: string, xp: number) => {
    const game = ARCADE_GAMES.find(g => g.type === gameType);
    if (!game) return;
    const playsToday = getArcadePlaysToday(game.id);
    const xpToAward = playsToday < XP_CAP_PLAYS ? xp : 0;
    if (xpToAward > 0) addXP(xpToAward);
    recordArcadePlay(game.id, xpToAward);
    setActiveGame({ type: gameTitle, xp: xpToAward });
  };

  const handleSelectGame = (gameType: string) => {
    setActiveGame(gameType as ActiveGame);
  };

  // Game rendering logic (preserved from original)
  if (activeGame && typeof activeGame === 'object') {
    return <GameResults title={activeGame.type} xp={activeGame.xp} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'wordle') return <WordleGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('wordle', 'History Wordle', xp)} />;
  if (activeGame === 'chrono') return <ChronoGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('chrono', 'Chrono Order', xp)} />;
  if (activeGame === 'who-am-i') return <WhoAmIGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('who-am-i', 'Who Am I?', xp)} />;
  if (activeGame === 'quote-or-fake') return <QuoteOrFakeGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('quote-or-fake', 'Quote or Fake', xp)} />;
  if (activeGame === 'guess-year') return <GuessTheYearGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('guess-year', 'Guess the Year', xp)} />;
  if (activeGame === 'two-truths') return <TwoTruthsGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('two-truths', 'Two Truths & a Lie', xp)} />;
  if (activeGame === 'anachronism') return <AnachronismGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('anachronism', 'Spot the Anachronism', xp)} />;
  if (activeGame === 'connections') return <ConnectionsGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('connections', 'Historical Connections', xp)} />;
  if (activeGame === 'map-mystery') return <MapMysteryGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('map-mystery', 'Map Mysteries', xp)} />;
  if (activeGame === 'artifact') return <ArtifactGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('artifact', 'Artifact Detective', xp)} />;
  if (activeGame === 'cause-effect') return <CauseEffectGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('cause-effect', 'Cause & Effect', xp)} />;
  if (activeGame === 'geoguessr-where') return <GeoguessrGame mode="where" onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('geoguessr-where', 'Where in History?', xp)} />;
  if (activeGame === 'geoguessr-when') return <GeoguessrGame mode="when" onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('geoguessr-when', 'When in History?', xp)} />;
  if (activeGame === 'geoguessr-what') return <GeoguessrGame mode="what" onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('geoguessr-what', 'What Happened Here?', xp)} />;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-px bg-ha-red" />
          <span className="font-mono text-[9px] tracking-[0.35em] text-ha-red uppercase font-bold">Fast Play · Live</span>
        </div>
        <h1 className="font-display text-[38px] font-bold text-off-white uppercase leading-none tracking-tight">
          The <span className="text-gold-2">Arcade.</span>
        </h1>
        <p className="font-body text-[12.5px] text-text-2 leading-relaxed mt-1.5">
          Quick games between campaigns. Five minutes or less.
        </p>
      </div>

      {/* Filter Pills */}
      <div className="px-4 mb-4">
        <FilterChips selected={filter} onSelect={setFilter} />
      </div>

      {/* Streak Card */}
      <div className="px-4 mb-4">
        <StreakCard streak={user.streak} />
      </div>

      {/* Daily Challenge */}
      <div className="px-4 mb-5">
        <DailyChallenge game={featuredGame} onPlay={() => setActiveGame(featuredGame.type as ActiveGame)} />
      </div>

      {/* Quick Play Section */}
      <div className="mb-5">
        <div className="px-4 flex justify-between items-end mb-2.5">
          <div>
            <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-0.5">Quick Play</div>
            <div className="font-display text-lg font-bold text-off-white uppercase">The Cabinet</div>
          </div>
          <button className="font-mono text-[9px] tracking-[0.18em] text-gold-2 uppercase font-semibold flex items-center gap-1">
            All 12 <ChevronRight size={10} />
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
          <GameCard game={ARCADE_GAMES.find(g => g.type === 'guess-year')!} colorTheme="green" badge="Trending" badgeType="hot" onPlay={() => handleSelectGame('guess-year')} />
          <GameCard game={ARCADE_GAMES.find(g => g.type === 'geoguessr-where')!} colorTheme="red" badge="Top 3" onPlay={() => handleSelectGame('geoguessr-where')} />
          <GameCard game={ARCADE_GAMES.find(g => g.type === 'chrono')!} colorTheme="gold" onPlay={() => handleSelectGame('chrono')} />
          <GameCard game={ARCADE_GAMES.find(g => g.type === 'who-am-i')!} colorTheme="blue" badge="New" badgeType="new" onPlay={() => handleSelectGame('who-am-i')} />
          <GameCard game={ARCADE_GAMES.find(g => g.type === 'artifact')!} colorTheme="brown" onPlay={() => handleSelectGame('artifact')} />
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="px-4 mb-5">
        <div className="flex justify-between items-end mb-2.5">
          <div>
            <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-0.5">Leaderboard</div>
            <div className="font-display text-lg font-bold text-off-white uppercase">Top Historians</div>
          </div>
          <button className="font-mono text-[9px] tracking-[0.18em] text-gold-2 uppercase font-semibold flex items-center gap-1">
            Full Board <ChevronRight size={10} />
          </button>
        </div>
        <Leaderboard />
      </div>

      {/* Stats Section */}
      <div className="px-4 mb-5">
        <div className="mb-2.5">
          <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-0.5">Your Cabinet</div>
          <div className="font-display text-lg font-bold text-off-white uppercase">Arcade Stats</div>
        </div>
        <StatsGrid />
      </div>

      {/* Achievements Section */}
      <div className="mb-6">
        <div className="px-4 flex justify-between items-end mb-2.5">
          <div>
            <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-0.5">Medals</div>
            <div className="font-display text-lg font-bold text-off-white uppercase">The Collection</div>
          </div>
          <button className="font-mono text-[9px] tracking-[0.18em] text-gold-2 uppercase font-semibold flex items-center gap-1">
            All 24 <ChevronRight size={10} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
          <AchievementCard name="7-Day Streak" desc="Earned" icon={<Flame size={18} />} />
          <AchievementCard name="Chronologist" desc="Earned" icon={<Clock size={18} />} />
          <AchievementCard name="First Victory" desc="Earned" icon={<Trophy size={18} />} />
          <AchievementCard name="Top 10" desc="Locked" icon={<Lock size={18} />} locked />
          <AchievementCard name="Perfect Round" desc="Locked" icon={<Lock size={18} />} locked />
          <AchievementCard name="Century Club" desc="Locked" icon={<Lock size={18} />} locked />
        </div>
      </div>
    </div>
  );
}
