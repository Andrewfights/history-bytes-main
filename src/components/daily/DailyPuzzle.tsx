import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Send, Trophy, X } from 'lucide-react';
import { mockDailyPuzzle } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export function DailyPuzzle() {
  const { addXP } = useApp();
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [result, setResult] = useState<'correct' | 'wrong' | 'failed' | null>(null);
  const maxAttempts = 4;

  const handleSubmit = () => {
    if (!guess.trim()) return;
    
    const guessYear = parseInt(guess, 10);
    if (guessYear === mockDailyPuzzle.answer) {
      setResult('correct');
      addXP(50 - (attempts * 10)); // More XP for fewer attempts
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setResult('failed');
      } else {
        setResult('wrong');
        // Reveal next clue
        if (revealedClues < mockDailyPuzzle.clues.length) {
          setRevealedClues(prev => prev + 1);
        }
        // Reset wrong state after animation
        setTimeout(() => setResult(null), 1500);
      }
    }
    setGuess('');
  };

  if (result === 'correct' || result === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 space-y-6"
      >
        <div className={`text-center p-8 rounded-2xl ${
          result === 'correct' ? 'bg-success/10' : 'bg-destructive/10'
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result === 'correct' ? 'bg-success/20' : 'bg-destructive/20'
          }`}>
            {result === 'correct' ? (
              <Trophy size={32} className="text-success" />
            ) : (
              <X size={32} className="text-destructive" />
            )}
          </div>
          
          <h2 className="font-editorial text-2xl font-bold mb-2">
            {result === 'correct' ? 'Correct!' : 'Not Quite'}
          </h2>
          
          <p className="text-3xl font-bold text-primary mb-4">
            {mockDailyPuzzle.answer}
          </p>
          
          <p className="text-muted-foreground">
            {mockDailyPuzzle.explanation}
          </p>
          
          {result === 'correct' && (
            <p className="mt-4 text-success font-semibold">
              +{50 - (attempts * 10)} XP earned!
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-editorial text-2xl font-bold">Guess the Year</h2>
        <p className="text-sm text-muted-foreground">
          Use the clues to determine when this historical event occurred
        </p>
      </div>

      <div className="space-y-3">
        {mockDailyPuzzle.clues.slice(0, revealedClues).map((clue, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lesson-card"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={16} className="text-primary" />
              </div>
              <p className="text-sm leading-relaxed">{clue}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {result === 'wrong' && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-destructive font-medium"
          >
            Not quite. Try again!
          </motion.p>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter year (e.g., 1945)"
            className="w-full h-14 px-4 bg-input rounded-xl border border-border text-center text-xl font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!guess.trim()}
          className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:glow-yellow"
        >
          <Send size={18} />
          Submit Guess
        </motion.button>

        <p className="text-center text-sm text-muted-foreground">
          Attempts: {attempts} / {maxAttempts}
        </p>
      </div>
    </div>
  );
}
