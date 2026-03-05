import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Delete } from 'lucide-react';

const WORDS: { word: string; hint: string }[] = [
  { word: 'CAESAR', hint: 'Roman dictator' },
  { word: 'SPARTA', hint: 'Greek warrior city-state' },
  { word: 'VIKING', hint: 'Norse seafarers' },
  { word: 'PHARAO', hint: 'Egyptian ruler (alt. spelling)' },
  { word: 'EMPIRE', hint: 'A vast realm under one ruler' },
  { word: 'SULTAN', hint: 'Ottoman title of power' },
  { word: 'ARMADA', hint: 'Spain\'s famous fleet' },
  { word: 'COLONY', hint: 'Settlement under foreign rule' },
  { word: 'TREATY', hint: 'A peace agreement' },
  { word: 'FEUDAL', hint: 'Medieval land-for-loyalty system' },
  { word: 'KNIGHT', hint: 'Armored medieval warrior' },
  { word: 'THRONE', hint: 'A monarch\'s seat' },
  { word: 'PLAGUE', hint: 'The Black Death, for one' },
  { word: 'REVOLT', hint: 'An uprising against authority' },
  { word: 'TRENCH', hint: 'WWI warfare feature' },
  { word: 'BISHOP', hint: 'Medieval church leader' },
  { word: 'ORACLE', hint: 'Ancient Greek prophetic site' },
  { word: 'AZTECS', hint: 'Mesoamerican empire builders' },
  { word: 'MONGOL', hint: 'Genghis Khan\'s people' },
  { word: 'SHOGUN', hint: 'Japanese military ruler' },
];

const MAX_GUESSES = 6;
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getWordForToday(): { word: string; hint: string } {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return WORDS[seed % WORDS.length];
}

function loadDailyState(dateKey: string): { guesses: string[]; completed: boolean } | null {
  try {
    const raw = localStorage.getItem('history-wordle-' + dateKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveDailyState(dateKey: string, guesses: string[], completed: boolean) {
  localStorage.setItem('history-wordle-' + dateKey, JSON.stringify({ guesses, completed }));
}

function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const result: LetterStatus[] = Array(target.length).fill('absent');
  const targetChars = target.split('');
  const remaining: (string | null)[] = [...targetChars];

  // First pass: correct positions
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetChars[i]) {
      result[i] = 'correct';
      remaining[i] = null;
    }
  }
  // Second pass: present but wrong position
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = 'present';
      remaining[idx] = null;
    }
  }
  return result;
}

const statusColors: Record<LetterStatus, string> = {
  correct: 'bg-success text-success-foreground border-success',
  present: 'bg-secondary text-secondary-foreground border-secondary',
  absent: 'bg-muted text-muted-foreground border-muted',
  empty: 'border-border bg-card',
};

interface WordleGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function WordleGame({ onBack, onComplete }: WordleGameProps) {
  const dateKey = getTodayKey();
  const { word: target, hint } = getWordForToday();
  const wordLen = target.length;
  const saved = loadDailyState(dateKey);

  const [guesses, setGuesses] = useState<string[]>(saved?.guesses ?? []);
  const [currentGuess, setCurrentGuess] = useState('');
  const alreadyCompleted = saved?.completed ?? false;
  const [gameOver, setGameOver] = useState(alreadyCompleted || (saved?.guesses?.length ?? 0) >= MAX_GUESSES || (saved?.guesses ?? []).includes(target));
  const [won, setWon] = useState((saved?.guesses ?? []).includes(target));
  const [shake, setShake] = useState(false);

  const letterStatuses = useCallback((): Record<string, LetterStatus> => {
    const map: Record<string, LetterStatus> = {};
    for (const guess of guesses) {
      const eval_ = evaluateGuess(guess, target);
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const status = eval_[i];
        const prev = map[letter];
        if (prev === 'correct') continue;
        if (status === 'correct') {
          map[letter] = 'correct';
        } else if (status === 'present' && prev !== 'present') {
          map[letter] = 'present';
        } else if (!prev) {
          map[letter] = status;
        }
      }
    }
    return map;
  }, [guesses, target]);

  const handleKey = (key: string) => {
    if (gameOver) return;
    if (key === '⌫' || key === 'BACKSPACE') {
      setCurrentGuess(g => g.slice(0, -1));
      return;
    }
    if (key === 'ENTER') {
      if (currentGuess.length !== wordLen) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === target) {
        setWon(true);
        setGameOver(true);
        saveDailyState(dateKey, newGuesses, true);
        const xp = Math.max(10, (MAX_GUESSES - newGuesses.length + 1) * 15);
        setTimeout(() => onComplete(xp), 1500);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameOver(true);
        saveDailyState(dateKey, newGuesses, true);
        setTimeout(() => onComplete(5), 1500);
      } else {
        saveDailyState(dateKey, newGuesses, false);
      }
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < wordLen) {
      setCurrentGuess(g => g + key);
    }
  };

  // Keyboard listener
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    handleKey(e.key.toUpperCase());
  }, [currentGuess, guesses, gameOver]);

  const keyMap = letterStatuses();

  return (
    <div className="px-4 py-6 pb-28" onKeyDown={handleKeyDown} tabIndex={0}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft size={16} /><span>Arcade</span>
      </button>
      <h1 className="font-editorial text-2xl font-bold mb-1">🔤 History Wordle</h1>
      <p className="text-sm text-muted-foreground mb-1">Guess the {wordLen}-letter history word in {MAX_GUESSES} tries</p>
      <p className="text-xs text-primary font-semibold mb-6">💡 Hint: {hint}</p>

      {/* Grid */}
      <div className="flex flex-col items-center gap-1.5 mb-6">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
          const isCurrentRow = rowIdx === guesses.length && !gameOver;
          const guess = guesses[rowIdx];
          const eval_ = guess ? evaluateGuess(guess, target) : null;

          return (
            <motion.div
              key={rowIdx}
              className="flex gap-1.5"
              animate={isCurrentRow && shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {Array.from({ length: wordLen }).map((_, colIdx) => {
                let letter = '';
                let status: LetterStatus = 'empty';

                if (guess) {
                  letter = guess[colIdx];
                  status = eval_![colIdx];
                } else if (isCurrentRow) {
                  letter = currentGuess[colIdx] || '';
                }

                return (
                  <motion.div
                    key={colIdx}
                    className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold text-lg ${statusColors[status]} ${
                      isCurrentRow && letter ? 'border-primary/50' : ''
                    }`}
                    animate={guess ? { rotateX: [0, 90, 0] } : {}}
                    transition={{ delay: colIdx * 0.1, duration: 0.4 }}
                  >
                    {letter}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <p className={`font-bold text-lg ${won ? 'text-success' : 'text-destructive'}`}>
            {won ? `🎉 Got it in ${guesses.length}!` : `The word was ${target}`}
          </p>
        </motion.div>
      )}

      {/* Keyboard */}
      <div className="flex flex-col items-center gap-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1">
            {row.map(key => {
              const isSpecial = key === 'ENTER' || key === '⌫';
              const keyStatus = keyMap[key];
              let bg = 'bg-muted/60 text-foreground';
              if (keyStatus === 'correct') bg = 'bg-success text-success-foreground';
              else if (keyStatus === 'present') bg = 'bg-secondary text-secondary-foreground';
              else if (keyStatus === 'absent') bg = 'bg-muted/30 text-muted-foreground';

              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`${isSpecial ? 'px-3' : 'w-8'} h-11 rounded-lg font-bold text-xs ${bg} active:opacity-70 transition-all`}
                >
                  {key === '⌫' ? <Delete size={16} /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
