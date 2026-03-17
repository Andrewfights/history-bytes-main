import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, HelpCircle, Quote, X, Check, ArrowUp, ArrowDown, ChevronLeft, Gamepad2 } from 'lucide-react';

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

// New components
import { FeaturedGameHero } from '@/components/arcade/FeaturedGameHero';
import { GameCarousel } from '@/components/arcade/GameCarousel';
import { OrnamentalDivider } from '@/components/shared/OrnamentalDivider';

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
import { useApp } from '@/context/AppContext';

// ---- Game Data ----
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
  { clues: ['I wrote "I Have a Dream."', 'I led the Montgomery Bus Boycott.', 'I received the Nobel Peace Prize in 1964.'], answer: 'Martin Luther King Jr.', choices: ['Malcolm X', 'Martin Luther King Jr.', 'Rosa Parks', 'John Lewis'] },
  { clues: ['I discovered penicillin.', 'I worked at St. Mary\'s Hospital.', 'I won the Nobel Prize in 1945.'], answer: 'Alexander Fleming', choices: ['Louis Pasteur', 'Alexander Fleming', 'Jonas Salk', 'Robert Koch'] },
];

const quoteOrFakeData: { quote: string; attribution: string; isReal: boolean; explanation: string }[] = [
  { quote: 'The only thing we have to fear is fear itself.', attribution: 'Franklin D. Roosevelt', isReal: true, explanation: 'FDR\'s famous 1933 inaugural address during the Great Depression.' },
  { quote: 'I came, I saw, I conquered — but the parking was terrible.', attribution: 'Julius Caesar', isReal: false, explanation: 'Caesar said "Veni, vidi, vici" but the parking joke is fabricated.' },
  { quote: 'That\'s one small step for man, one giant leap for mankind.', attribution: 'Neil Armstrong', isReal: true, explanation: 'Armstrong spoke these words stepping onto the Moon on July 20, 1969.' },
  { quote: 'History is written by the victors, but edited by their wives.', attribution: 'Winston Churchill', isReal: false, explanation: 'While the first half is attributed to Churchill, the second part is fabricated.' },
  { quote: 'Give me liberty, or give me death!', attribution: 'Patrick Henry', isReal: true, explanation: 'Spoken at the Virginia Convention in 1775.' },
  { quote: 'In the end, we will remember not the words of our enemies, but the silence of our friends.', attribution: 'Martin Luther King Jr.', isReal: true, explanation: 'A well-known quote from Dr. King.' },
  { quote: 'An army marches on its stomach, but retreats on its pride.', attribution: 'Napoleon Bonaparte', isReal: false, explanation: 'Napoleon said the first part; the second is an invention.' },
];

// ---- Chrono Order Game ----
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
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-editorial text-2xl font-bold mb-1">⏳ Chrono Order</h1>
      <p className="text-sm text-muted-foreground mb-6">Round {roundIdx + 1} of {chronoEvents.length} — arrange oldest to newest</p>

      <div className="space-y-2">
        {order.map((event, i) => (
          <motion.div key={event.id} layout className={`flex items-center gap-3 p-3 rounded-xl border ${
            submitted ? (isCorrectOrder ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10') : 'border-border bg-card'
          }`}>
            <div className="flex flex-col gap-1">
              <button onClick={() => moveItem(i, -1)} disabled={submitted || i === 0} className="p-0.5 hover:text-primary disabled:opacity-20"><ArrowUp size={14} /></button>
              <button onClick={() => moveItem(i, 1)} disabled={submitted || i === order.length - 1} className="p-0.5 hover:text-primary disabled:opacity-20"><ArrowDown size={14} /></button>
            </div>
            <span className="flex-1 text-sm font-medium">{event.text}</span>
            {submitted && <span className="text-xs text-muted-foreground">{event.year < 0 ? `${Math.abs(event.year)} BCE` : event.year}</span>}
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        {!submitted ? (
          <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Lock In Order</button>
        ) : (
          <div>
            <p className={`text-center font-bold mb-3 ${isCorrectOrder ? 'text-success' : 'text-destructive'}`}>
              {isCorrectOrder ? '✓ Correct!' : '✗ Wrong order'}
            </p>
            <button onClick={handleNext} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
              {roundIdx + 1 >= chronoEvents.length ? 'Finish' : 'Next Round'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Who Am I Game ----
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
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-editorial text-2xl font-bold mb-1">🎭 Who Am I?</h1>
      <p className="text-sm text-muted-foreground mb-6">Question {qIdx + 1} of {whoAmIQuestions.length}</p>

      <div className="space-y-2 mb-6">
        {q.clues.map((clue, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: i < revealedClues ? 1 : 0.2, y: 0 }}
            className={`p-3 rounded-xl border ${i < revealedClues ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}>
            <span className="text-sm">{i < revealedClues ? clue : '???'}</span>
          </motion.div>
        ))}
        {!selected && revealedClues < q.clues.length && (
          <button onClick={handleReveal} className="text-xs text-primary font-bold">Reveal next clue (−points)</button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(choice => (
          <button key={choice} onClick={() => !selected && handleAnswer(choice)} disabled={!!selected}
            className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
              selected ? (choice === q.answer ? 'border-success bg-success/10 text-success' : choice === selected ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border opacity-40')
              : 'border-border bg-card hover:border-primary/50'
            }`}>
            {choice}
          </button>
        ))}
      </div>

      {selected && (
        <button onClick={handleNext} className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
          {qIdx + 1 >= whoAmIQuestions.length ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}

// ---- Quote or Fake Game ----
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
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-editorial text-2xl font-bold mb-1">💬 Quote or Fake</h1>
      <p className="text-sm text-muted-foreground mb-6">Quote {qIdx + 1} of {quoteOrFakeData.length}</p>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <p className="text-lg italic leading-relaxed">"{q.quote}"</p>
        <p className="text-sm text-muted-foreground mt-3">— {q.attribution}</p>
      </div>

      {answer === null ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleAnswer(true)} className="py-3 rounded-xl border border-success bg-success/10 text-success font-bold hover:bg-success/20">
            <Check size={18} className="inline mr-1" />Real
          </button>
          <button onClick={() => handleAnswer(false)} className="py-3 rounded-xl border border-destructive bg-destructive/10 text-destructive font-bold hover:bg-destructive/20">
            <X size={18} className="inline mr-1" />Fake
          </button>
        </div>
      ) : (
        <div>
          <p className={`text-center font-bold mb-2 ${(answer === q.isReal) ? 'text-success' : 'text-destructive'}`}>
            {(answer === q.isReal) ? '✓ Correct!' : '✗ Wrong!'}
          </p>
          <p className="text-sm text-muted-foreground text-center mb-4">{q.explanation}</p>
          <button onClick={handleNext} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            {qIdx + 1 >= quoteOrFakeData.length ? 'Finish' : 'Next Quote'}
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Game Results ----
function GameResults({ title, xp, onBack }: { title: string; xp: number; onBack: () => void }) {
  return (
    <div className="px-4 py-6 pb-28 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-12">
        <p className="text-5xl mb-4">🏆</p>
        <h1 className="font-editorial text-2xl font-bold">{title} Complete!</h1>
        {xp > 0 ? (
          <p className="text-3xl font-bold text-gradient-gold mt-4">+{xp} XP</p>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">Max XP reached today — great practice!</p>
        )}
        <button onClick={onBack} className="mt-8 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
          Back to Arcade
        </button>
      </motion.div>
    </div>
  );
}

// ---- Main Arcade Tab ----
type ActiveGame = null | 'chrono' | 'who-am-i' | 'quote-or-fake' | 'wordle' | 'guess-year' | 'two-truths' | 'anachronism' | 'connections' | 'map-mystery' | 'artifact' | 'cause-effect' | 'geoguessr-where' | 'geoguessr-when' | 'geoguessr-what' | { type: string; xp: number };

export function ArcadeTab() {
  const { user, addXP, getArcadePlaysToday, recordArcadePlay } = useApp();
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  // Use live Firebase data for game thumbnails (real-time updates from admin)
  const gameThumbnails = useLiveGameThumbnails();

  // Get featured and popular games from data
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

  if (activeGame && typeof activeGame === 'object') {
    return <GameResults title={activeGame.type} xp={activeGame.xp} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'wordle') {
    return <WordleGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('wordle', 'History Wordle', xp)} />;
  }
  if (activeGame === 'chrono') {
    return <ChronoGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('chrono', 'Chrono Order', xp)} />;
  }
  if (activeGame === 'who-am-i') {
    return <WhoAmIGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('who-am-i', 'Who Am I?', xp)} />;
  }
  if (activeGame === 'quote-or-fake') {
    return <QuoteOrFakeGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('quote-or-fake', 'Quote or Fake', xp)} />;
  }
  if (activeGame === 'guess-year') {
    return <GuessTheYearGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('guess-year', 'Guess the Year', xp)} />;
  }
  if (activeGame === 'two-truths') {
    return <TwoTruthsGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('two-truths', 'Two Truths & a Lie', xp)} />;
  }
  if (activeGame === 'anachronism') {
    return <AnachronismGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('anachronism', 'Spot the Anachronism', xp)} />;
  }
  if (activeGame === 'connections') {
    return <ConnectionsGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('connections', 'Historical Connections', xp)} />;
  }
  if (activeGame === 'map-mystery') {
    return <MapMysteryGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('map-mystery', 'Map Mysteries', xp)} />;
  }
  if (activeGame === 'artifact') {
    return <ArtifactGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('artifact', 'Artifact Detective', xp)} />;
  }
  if (activeGame === 'cause-effect') {
    return <CauseEffectGame onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('cause-effect', 'Cause & Effect', xp)} />;
  }
  if (activeGame === 'geoguessr-where') {
    return <GeoguessrGame mode="where" onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('geoguessr-where', 'Where in History?', xp)} />;
  }
  if (activeGame === 'geoguessr-when') {
    return <GeoguessrGame mode="when" onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('geoguessr-when', 'When in History?', xp)} />;
  }
  if (activeGame === 'geoguessr-what') {
    return <GeoguessrGame mode="what" onBack={() => setActiveGame(null)} onComplete={(xp) => handleGameComplete('geoguessr-what', 'What Happened Here?', xp)} />;
  }

  return (
    <div className="px-4 py-6 space-y-5 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-editorial text-2xl font-bold">Arcade</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fast Play · Leaderboards</p>
      </motion.div>

      {/* Featured Game Hero - NEW */}
      <FeaturedGameHero
        game={featuredGame}
        imageUrl={getGameImageUrl(featuredGame, gameThumbnails)}
        playsToday={getArcadePlaysToday(featuredGame.id)}
        onPlay={() => setActiveGame(featuredGame.type as ActiveGame)}
      />

      <OrnamentalDivider variant="compass" />

      {/* Quick Play Carousel - NEW */}
      <GameCarousel
        title="Quick Play"
        subtitle="Popular games for quick sessions"
        games={popularGames}
        gameThumbnails={gameThumbnails}
        onSelectGame={handleSelectGame}
        getPlaysToday={getArcadePlaysToday}
      />

      <OrnamentalDivider variant="simple" />

      {/* All Games Section */}
      <section className="space-y-3">
        <h2 className="section-plaque">All Games</h2>
        <div className="space-y-3">
          {ARCADE_GAMES.map((game, i) => {
            const playsToday = getArcadePlaysToday(game.id);
            const xpCapReached = playsToday >= XP_CAP_PLAYS;
            const isFeatured = game.id === featuredGame.id;
            const imageUrl = getGameImageUrl(game, gameThumbnails);

            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => setActiveGame(game.type as ActiveGame)}
                className="w-full lesson-card card-hover flex items-center gap-4 text-left active:scale-[0.99] transition-transform touch-target"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <Gamepad2 size={24} className="text-primary/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{game.title}</h3>
                    {isFeatured && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Today</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(j => (
                        <div key={j} className={`w-4 h-1.5 rounded-full transition-colors ${j < playsToday ? 'bg-primary' : 'bg-border'}`} />
                      ))}
                    </div>
                    {xpCapReached ? (
                      <span className="text-[10px] text-muted-foreground">Max XP reached · Play for fun</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">+{game.xpReward} XP per play</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
