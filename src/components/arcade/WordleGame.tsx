import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Share2, Check, Delete } from 'lucide-react';

// ═══ PUZZLE DATA ═══
interface Puzzle {
  answer: string;
  era: string;
  cat: string;
  years: string;
  context: string;
}

const PUZZLES: Puzzle[] = [
  {
    answer: 'TUDOR',
    era: 'Early Modern',
    cat: 'Dynasty',
    years: '1485–1603',
    context:
      'The <strong>House of Tudor</strong> ruled England from 1485 to 1603, beginning with Henry VII\'s victory at Bosworth Field. Famous Tudors include Henry VIII, Mary I, and Elizabeth I — whose reign is considered a golden age of English literature and naval power.',
  },
  {
    answer: 'TESLA',
    era: 'Gilded Age',
    cat: 'Inventor',
    years: '1856–1943',
    context:
      '<strong>Nikola Tesla</strong>, Serbian-American inventor and engineer. His alternating current (AC) system powered the modern electrical grid, beating out Edison\'s direct current in the "War of the Currents" of the 1880s–90s.',
  },
  {
    answer: 'ALAMO',
    era: 'Texas Revolution',
    cat: 'Siege',
    years: 'February 23 – March 6, 1836',
    context:
      'A 13-day siege at the Alamo Mission in San Antonio. All Texan defenders — including <strong>Davy Crockett</strong> and <strong>Jim Bowie</strong> — were killed. "Remember the Alamo" became the rallying cry at San Jacinto six weeks later, where Texas won its independence.',
  },
  {
    answer: 'STEAM',
    era: 'Industrial Revolution',
    cat: 'Technology',
    years: '1769 onward',
    context:
      '<strong>James Watt</strong>\'s 1769 patent for an improved steam engine kicked off the Industrial Revolution. Within a century, steam powered factories, railways, and ships — reshaping economies, cities, and labor worldwide.',
  },
  {
    answer: 'LENIN',
    era: 'Russian Revolution',
    cat: 'Figure',
    years: '1870–1924',
    context:
      '<strong>Vladimir Lenin</strong> led the October Revolution that overthrew Russia\'s Provisional Government and established the Soviet state. His body, preserved since his death in 1924, still lies on display in Red Square.',
  },
  {
    answer: 'NIXON',
    era: 'Cold War',
    cat: 'President',
    years: '1913–1994',
    context:
      '<strong>Richard Nixon</strong>, 37th President of the United States. He opened diplomatic relations with China in 1972 and ended the Vietnam draft. He resigned on August 9, 1974 — the only US president ever to do so — following the Watergate scandal.',
  },
  {
    answer: 'ROMAN',
    era: 'Classical Antiquity',
    cat: 'Civilization',
    years: '753 BCE – 476 CE',
    context:
      'At its peak under Trajan (117 CE), <strong>Rome</strong> controlled territory from Scotland to the Persian Gulf — about 70 million people, a quarter of the world\'s population. Its legal systems, roads, and Latin language shaped the Western world for two millennia.',
  },
  {
    answer: 'MANOR',
    era: 'Medieval Europe',
    cat: 'Feudal Estate',
    years: '9th–15th century',
    context:
      'The <strong>manor</strong> was the economic heart of feudalism: a large estate worked by peasants (serfs) who owed labor and produce to the lord. In exchange, the lord provided protection and justice. The system began to erode after the Black Death (1347–51) gave surviving peasants leverage.',
  },
  {
    answer: 'TRUCE',
    era: 'World War I',
    cat: 'Event',
    years: 'Christmas 1914',
    context:
      'On Christmas Eve 1914, British and German soldiers along the Western Front spontaneously stopped fighting. They sang carols across no-man\'s-land, exchanged gifts, and in some places played football. Commanders on both sides moved quickly to prevent the <strong>Christmas Truce</strong> from recurring.',
  },
  {
    answer: 'PEACE',
    era: 'Post-War',
    cat: 'Concept',
    years: 'Treaty of Versailles, 1919',
    context:
      'The <strong>Treaty of Versailles</strong> ended WWI but demanded crushing reparations from Germany — laying the groundwork for WWII. The subsequent Potsdam Conference (1945) divided post-war Germany into occupation zones, setting the stage for the Cold War and the Iron Curtain.',
  },
];

type LetterState = 'correct' | 'present' | 'absent';

interface Guess {
  guess: string;
  feedback: LetterState[];
}

interface ChronicleState {
  puzzleIdx: number;
  guesses: Guess[];
  keyStates: Record<string, LetterState>;
  gameOver: boolean;
  won: boolean;
}

const STORAGE_KEY = 'ha-chronicle-wordle';

function loadState(): ChronicleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        puzzleIdx: parsed.puzzleIdx ?? 0,
        guesses: parsed.guesses ?? [],
        keyStates: parsed.keyStates ?? {},
        gameOver: parsed.gameOver ?? false,
        won: parsed.won ?? false,
      };
    }
  } catch {}
  return { puzzleIdx: 0, guesses: [], keyStates: {}, gameOver: false, won: false };
}

function saveState(state: ChronicleState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calculateFeedback(guess: string, answer: string): LetterState[] {
  const fb: LetterState[] = Array(5).fill('absent');
  const ansChars = answer.split('');
  const gChars = guess.split('');

  // Pass 1: correct positions
  for (let i = 0; i < 5; i++) {
    if (gChars[i] === ansChars[i]) {
      fb[i] = 'correct';
      ansChars[i] = '';
    }
  }
  // Pass 2: present letters
  for (let i = 0; i < 5; i++) {
    if (fb[i] === 'correct') continue;
    const idx = ansChars.indexOf(gChars[i]);
    if (idx !== -1) {
      fb[i] = 'present';
      ansChars[idx] = '';
    }
  }
  return fb;
}

function priorityOf(state: LetterState | undefined): number {
  return { absent: 0, present: 1, correct: 2 }[state ?? 'absent'] || 0;
}

interface WordleGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function WordleGame({ onBack, onComplete }: WordleGameProps) {
  const [state, setState] = useState<ChronicleState>(loadState);
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [flipping, setFlipping] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const puzzle = PUZZLES[state.puzzleIdx];
  const currentRow = state.guesses.length;

  // Save state on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Award XP on win
  useEffect(() => {
    if (state.won && !xpAwarded) {
      setXpAwarded(true);
      const xp = Math.max(10, (6 - state.guesses.length + 1) * 10);
      onComplete(xp);
    }
  }, [state.won, xpAwarded, state.guesses.length, onComplete]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (state.gameOver || locked) return;

      if (key === 'ENTER') {
        if (currentLetters.length !== 5) {
          setShake(true);
          setTimeout(() => setShake(false), 400);
          showToast('Not enough letters');
          return;
        }

        const guess = currentLetters.join('');
        const feedback = calculateFeedback(guess, puzzle.answer);

        setLocked(true);
        setFlipping(currentRow);

        // Reveal after animation
        setTimeout(() => {
          const newKeyStates = { ...state.keyStates };
          for (let i = 0; i < 5; i++) {
            const letter = guess[i];
            const current = newKeyStates[letter];
            if (!current || priorityOf(feedback[i]) > priorityOf(current)) {
              newKeyStates[letter] = feedback[i];
            }
          }

          const newGuesses = [...state.guesses, { guess, feedback }];
          const won = guess === puzzle.answer;
          const gameOver = won || newGuesses.length >= 6;

          setState((prev) => ({
            ...prev,
            guesses: newGuesses,
            keyStates: newKeyStates,
            gameOver,
            won,
          }));

          setCurrentLetters([]);
          setLocked(false);
          setFlipping(null);
        }, 5 * 200 + 300);
      } else if (key === 'BACKSPACE') {
        if (currentLetters.length > 0) {
          setCurrentLetters((prev) => prev.slice(0, -1));
        }
      } else if (/^[A-Z]$/.test(key) && currentLetters.length < 5) {
        setCurrentLetters((prev) => [...prev, key]);
      }
    },
    [state, locked, currentLetters, puzzle.answer, currentRow, showToast]
  );

  // Physical keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Enter') {
        e.preventDefault();
        handleKey('ENTER');
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        handleKey('BACKSPACE');
      } else if (/^Key[A-Z]$/.test(e.code)) {
        handleKey(e.code.slice(3));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const nextPuzzle = useCallback(() => {
    const nextIdx = state.puzzleIdx < PUZZLES.length - 1 ? state.puzzleIdx + 1 : 0;
    setState({
      puzzleIdx: nextIdx,
      guesses: [],
      keyStates: {},
      gameOver: false,
      won: false,
    });
    setCurrentLetters([]);
    setXpAwarded(false);
  }, [state.puzzleIdx]);

  const shareGrid = useCallback(() => {
    const emojiMap: Record<LetterState, string> = {
      correct: '🟩',
      present: '🟨',
      absent: '⬛',
    };
    const lines = state.guesses.map((g) => g.feedback.map((f) => emojiMap[f]).join('')).join('\n');
    const guessCount = state.won ? state.guesses.length : 'X';
    const text = `CHRONICLE · Vol. I · No. ${String(state.puzzleIdx + 1).padStart(3, '0')} · ${guessCount}/6\n\n${lines}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }, [state]);

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--text)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#131009] to-[#0a0805] border-b border-[var(--gold)]/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--t3)] hover:text-[var(--gold)] transition-colors font-mono text-[10px] uppercase tracking-wider"
        >
          <ArrowLeft size={12} />
          Arcade
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[var(--gold)] rounded-full flex items-center justify-center bg-gradient-to-br from-[rgba(80,50,18,0.6)] to-[rgba(40,20,6,0.7)] shadow-[0_0_16px_rgba(230,171,42,0.3)]">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 stroke-[var(--gold)]"
              fill="none"
              strokeWidth="1.8"
            >
              <path d="M4 4h12a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3V4zM4 4v14a3 3 0 0 0 3 3M8 8h7M8 12h7" />
            </svg>
          </div>
          <span className="font-serif italic text-lg">
            The <em className="text-[var(--gold)]">Chronicle</em>
          </span>
        </div>
        <div className="font-mono text-[10px] tracking-wider text-[var(--gold)] border border-[var(--gold)]/35 px-2 py-1 rounded bg-[rgba(40,25,8,0.4)]">
          Vol. I · No.{' '}
          <em className="font-serif text-sm text-[var(--gold-br)] not-italic">
            {String(state.puzzleIdx + 1).padStart(3, '0')}
          </em>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 bg-gradient-to-b from-[#0f0a05] via-[#0a0805] to-[#080503] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(60,35,12,0.38)_0%,transparent_55%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center px-4 py-6 gap-4">
          {/* Era hint */}
          {!state.gameOver && (
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="font-mono text-[9px] tracking-[0.4em] text-[var(--red-br)] uppercase font-bold flex items-center gap-2">
                <span className="w-4 h-px bg-[var(--red-br)]" />
                Puzzle {String(state.puzzleIdx + 1).padStart(2, '0')} of 10
                <span className="w-4 h-px bg-[var(--red-br)]" />
              </div>
              <div className="font-['Oswald',sans-serif] font-bold italic text-lg tracking-wide uppercase">
                {puzzle.era}
              </div>
              <div className="font-serif italic text-sm text-[var(--t3)]">
                {puzzle.cat}
                <span className="text-[var(--gold)] opacity-50 mx-2">·</span>
                {puzzle.years}
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[rgba(20,14,8,0.95)] text-[var(--gold-br)] font-['Oswald',sans-serif] font-bold text-[11px] tracking-[0.26em] uppercase px-4 py-2 border border-[var(--gold)]/35 rounded shadow-lg z-20 animate-in fade-in slide-in-from-top-2">
              {toast}
            </div>
          )}

          {/* Board */}
          <div className="grid gap-[5px] my-2">
            {Array(6)
              .fill(0)
              .map((_, rowIdx) => {
                const guess = state.guesses[rowIdx];
                const isCurrentRow = rowIdx === currentRow && !state.gameOver;
                const isFlipping = flipping === rowIdx;
                const isWinRow = state.won && rowIdx === state.guesses.length - 1;

                return (
                  <div
                    key={rowIdx}
                    className={`flex gap-[5px] ${shake && isCurrentRow ? 'animate-[row-shake_0.4s_ease-out]' : ''} ${isWinRow ? 'animate-[win-dance_0.65s_ease-in-out]' : ''}`}
                  >
                    {Array(5)
                      .fill(0)
                      .map((_, colIdx) => {
                        let letter = '';
                        let status: LetterState | 'empty' | 'filled' = 'empty';

                        if (guess) {
                          letter = guess.guess[colIdx];
                          status = guess.feedback[colIdx];
                        } else if (isCurrentRow) {
                          letter = currentLetters[colIdx] || '';
                          if (letter) status = 'filled';
                        }

                        const tileClass = {
                          empty: 'bg-[#1a1410] border-[rgba(242,238,230,0.12)]',
                          filled: 'bg-[#2a241a] border-[rgba(242,238,230,0.3)]',
                          correct:
                            'bg-gradient-to-b from-[var(--green)] to-[var(--green-dp)] border-[var(--green-dp)] text-[#0a2012] shadow-[0_0_14px_rgba(61,214,122,0.35)]',
                          present:
                            'bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dp)] border-[var(--gold-dp)] text-[#1a0b02] shadow-[0_0_14px_rgba(230,171,42,0.35)]',
                          absent: 'bg-[#231e16] border-[#12100a] text-[var(--t3)]',
                        }[status];

                        return (
                          <div
                            key={colIdx}
                            className={`w-[52px] h-[52px] sm:w-14 sm:h-14 flex items-center justify-center font-['Oswald',sans-serif] font-bold text-xl sm:text-2xl uppercase border-2 rounded transition-all select-none ${tileClass} ${
                              isFlipping
                                ? 'animate-[tile-flip_0.6s_ease-in-out]'
                                : status === 'filled'
                                ? 'animate-[tile-pop_0.1s_ease-out]'
                                : ''
                            }`}
                            style={{
                              animationDelay: isFlipping ? `${colIdx * 200}ms` : '0ms',
                            }}
                          >
                            {letter}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>

          {/* End screen */}
          {state.gameOver && (
            <div className="flex flex-col items-center gap-3 w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Stamp */}
              <div
                className={`px-6 py-2 border-[3px] border-double font-['Oswald',sans-serif] font-black text-xl sm:text-2xl tracking-[0.14em] uppercase italic animate-[stamp-land_1s_cubic-bezier(0.3,1.4,0.4,1)] ${
                  state.won
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-br)] shadow-[0_0_30px_rgba(230,171,42,0.22)]'
                    : 'border-[var(--red)] bg-[var(--red)]/10 text-[var(--red-br)] shadow-[0_0_30px_rgba(205,14,20,0.25)]'
                }`}
              >
                {state.won ? 'Solved' : 'Revealed'}
              </div>

              {/* Answer */}
              <div className="flex items-baseline gap-3 font-serif italic font-black text-3xl sm:text-4xl">
                <span className="font-mono text-[9px] tracking-[0.35em] text-[var(--t4)] uppercase font-bold not-italic">
                  Answer
                </span>
                <em className="text-[var(--gold)]">{puzzle.answer}</em>
              </div>

              {/* Stats */}
              <div className="flex gap-6 px-5 py-3 bg-[rgba(8,5,2,0.6)] border border-[var(--gold)]/35 rounded backdrop-blur-sm">
                <div className="text-center">
                  <div className="font-mono text-[8px] tracking-[0.3em] text-[var(--t4)] uppercase font-bold">
                    Guesses
                  </div>
                  <div className="font-serif italic text-xl text-[var(--gold)]">
                    {state.won ? state.guesses.length : 'X'}
                    <em className="text-[var(--gold-br)]">/6</em>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[8px] tracking-[0.3em] text-[var(--t4)] uppercase font-bold">
                    Puzzle
                  </div>
                  <div className="font-serif italic text-xl text-[var(--gold)]">
                    {String(state.puzzleIdx + 1).padStart(3, '0')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[8px] tracking-[0.3em] text-[var(--t4)] uppercase font-bold">
                    Series
                  </div>
                  <div className="font-serif italic text-xl text-[var(--gold)]">
                    <em className="text-[var(--gold-br)]">{state.puzzleIdx + 1}</em>/10
                  </div>
                </div>
              </div>

              {/* Context parchment */}
              <div className="w-full bg-gradient-to-br from-[#f2e4bd] via-[#e8d49c] to-[#d6b478] border border-[rgba(90,56,24,0.4)] p-4 rounded relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20400%20400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22cp%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%20seed%3D%2218%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%200.45%200%200%200%200%200.26%200%200%200%200%200.1%200%200%200%200.2%200%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23cp%29%22%2F%3E%3C%2Fsvg%3E')]" />
                <div className="relative z-10">
                  <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
                    <div className="font-mono text-[8px] tracking-[0.35em] text-[#9c1c1f] uppercase font-bold flex items-center gap-2">
                      <span className="text-[6px]">◆</span>
                      Historical Note
                    </div>
                    <div className="font-mono text-[8px] tracking-[0.25em] text-[#2a1608] uppercase font-bold opacity-75">
                      {puzzle.era} · {puzzle.years}
                    </div>
                  </div>
                  <div
                    className="font-['Special_Elite',serif] text-[13px] text-[#3a1e0a] leading-relaxed text-left"
                    dangerouslySetInnerHTML={{ __html: puzzle.context }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={shareGrid}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded font-['Oswald',sans-serif] text-[11px] font-bold tracking-[0.26em] uppercase transition-colors ${
                    copied
                      ? 'bg-[var(--green)]/25 border-[var(--green)] text-[var(--green)]'
                      : 'bg-[rgba(20,14,8,0.8)] border border-[var(--gold)]/35 text-[var(--gold)] hover:text-[var(--gold-br)] hover:border-[var(--gold)]'
                  }`}
                >
                  {copied ? <Check size={13} /> : <Share2 size={13} />}
                  {copied ? 'Copied' : 'Share Grid'}
                </button>
                <button
                  onClick={nextPuzzle}
                  className="flex-[1.2] flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-b from-[var(--gold-br)] via-[var(--gold)] to-[var(--gold-dp)] text-[#1a0b02] rounded font-['Oswald',sans-serif] text-[11px] font-black tracking-[0.3em] uppercase shadow-[0_8px_22px_rgba(230,171,42,0.3)] hover:brightness-105 transition-all relative"
                >
                  <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-[var(--red)]" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-[var(--red)]" />
                  {state.puzzleIdx < PUZZLES.length - 1 ? 'Next Puzzle' : 'Restart Series'}
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Keyboard */}
          {!state.gameOver && (
            <div className="flex flex-col gap-[5px] w-full max-w-[500px] mt-2">
              {KEYBOARD_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1">
                  {row.map((key) => {
                    const isWide = key === 'ENTER' || key === 'BACKSPACE';
                    const keyState = state.keyStates[key];

                    const keyClass = keyState
                      ? {
                          correct:
                            'bg-gradient-to-b from-[var(--green)] to-[var(--green-dp)] border-[var(--green-dp)] text-[#0a2012]',
                          present:
                            'bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dp)] border-[var(--gold-dp)] text-[#1a0b02]',
                          absent: 'bg-[#1a1610] border-[#0a0804] text-[var(--t4)]',
                        }[keyState]
                      : 'bg-gradient-to-b from-[#1a1309] to-[#0a0604] border-[rgba(230,171,42,0.2)] text-[var(--text)] hover:border-[var(--gold)]/35 hover:from-[#24180c] hover:to-[#130905]';

                    return (
                      <button
                        key={key}
                        onClick={() => handleKey(key)}
                        className={`${
                          isWide ? 'min-w-[52px] max-w-[68px] flex-[1.6]' : 'min-w-[28px] max-w-[42px] flex-1'
                        } h-[44px] sm:h-[52px] px-1 border rounded font-['Oswald',sans-serif] font-semibold text-xs sm:text-sm flex items-center justify-center uppercase shadow-[0_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all select-none ${keyClass}`}
                      >
                        {key === 'BACKSPACE' ? (
                          <Delete size={16} />
                        ) : key === 'ENTER' ? (
                          <span className="text-[10px] tracking-[0.1em]">Enter</span>
                        ) : (
                          key
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes tile-pop {
          0% { transform: scale(0.85); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes tile-flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }
        @keyframes row-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }
        @keyframes win-dance {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
          80% { transform: translateY(0); }
        }
        @keyframes stamp-land {
          0% { transform: rotate(-6deg) scale(2); opacity: 0; }
          60% { transform: rotate(-6deg) scale(0.92); opacity: 1; }
          100% { transform: rotate(-6deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
