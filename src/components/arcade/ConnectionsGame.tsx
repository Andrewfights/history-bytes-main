import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, XCircle, RotateCcw } from 'lucide-react';
import { ConnectionsPuzzle } from '@/types';
import { useLiveConnectionsPuzzles } from '@/hooks/useLiveData';

interface ConnectionsGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

interface SolvedGroup {
  name: string;
  items: string[];
  color: 'yellow' | 'green' | 'blue' | 'purple';
}

const colorMap = {
  yellow: 'bg-yellow-500/80 text-yellow-950',
  green: 'bg-green-500/80 text-green-950',
  blue: 'bg-blue-500/80 text-blue-950',
  purple: 'bg-purple-500/80 text-purple-950',
};

export function ConnectionsGame({ onBack, onComplete }: ConnectionsGameProps) {
  const allPuzzles = useLiveConnectionsPuzzles();
  const [puzzle] = useState<ConnectionsPuzzle>(() => {
    // Get a random puzzle
    const randomIndex = Math.floor(Math.random() * allPuzzles.length);
    return allPuzzles[randomIndex];
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<SolvedGroup[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'results' | 'gameover'>('playing');
  const [shakeItems, setShakeItems] = useState(false);

  // Create shuffled grid of all items
  const shuffledItems = useMemo(() => {
    const allItems = puzzle.categories.flatMap(cat => cat.items);
    return allItems.sort(() => Math.random() - 0.5);
  }, [puzzle]);

  // Items still in play (not solved)
  const remainingItems = useMemo(() => {
    const solvedItems = solvedGroups.flatMap(g => g.items);
    return shuffledItems.filter(item => !solvedItems.includes(item));
  }, [shuffledItems, solvedGroups]);

  const maxMistakes = 4;

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < 4) {
      setSelected([...selected, item]);
    }
  };

  const handleSubmit = () => {
    if (selected.length !== 4) return;

    // Check if selection matches any unsolved category
    const matchedCategory = puzzle.categories.find(cat => {
      const catItems = cat.items;
      return selected.every(s => catItems.includes(s)) && catItems.every(s => selected.includes(s));
    });

    if (matchedCategory && !solvedGroups.some(g => g.name === matchedCategory.name)) {
      // Correct group!
      const newSolvedGroups = [...solvedGroups, {
        name: matchedCategory.name,
        items: matchedCategory.items,
        color: matchedCategory.color,
      }];
      setSolvedGroups(newSolvedGroups);
      setSelected([]);

      // Check if game is complete
      if (newSolvedGroups.length === 4) {
        setTimeout(() => setPhase('results'), 500);
      }
    } else {
      // Wrong guess
      setShakeItems(true);
      setTimeout(() => setShakeItems(false), 500);

      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setSelected([]);

      if (newMistakes >= maxMistakes) {
        setTimeout(() => setPhase('gameover'), 500);
      }
    }
  };

  const handleShuffle = () => {
    // Just reset selection - items are already randomized per session
    setSelected([]);
  };

  const handleComplete = () => {
    // 10 XP per group found + 15 bonus for completing all
    const groupXP = solvedGroups.length * 10;
    const completionBonus = solvedGroups.length === 4 ? 15 : 0;
    onComplete(groupXP + completionBonus);
  };

  if (phase === 'gameover') {
    // Show all answers
    return (
      <div className="px-4 py-6 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <XCircle size={40} className="text-destructive" />
          </div>

          <h2 className="font-editorial text-2xl font-bold mb-2">Out of Guesses!</h2>
          <p className="text-muted-foreground mb-6">Here were the connections:</p>

          <div className="space-y-2 mb-8">
            {puzzle.categories.map((cat) => (
              <div
                key={cat.name}
                className={`p-3 rounded-lg ${colorMap[cat.color]}`}
              >
                <p className="font-bold text-sm mb-1">{cat.name}</p>
                <p className="text-xs opacity-90">{cat.items.join(', ')}</p>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-8">
            +{solvedGroups.length * 10} XP
          </div>

          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
            >
              Continue
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 text-muted-foreground"
            >
              Back to Arcade
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="px-4 py-6 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles size={40} className="text-primary" />
          </div>

          <h2 className="font-editorial text-2xl font-bold mb-2">Perfect!</h2>
          <p className="text-muted-foreground mb-6">
            You found all 4 connections with {maxMistakes - mistakes} guesses to spare!
          </p>

          <div className="space-y-2 mb-8">
            {solvedGroups.map((group) => (
              <div
                key={group.name}
                className={`p-3 rounded-lg ${colorMap[group.color]}`}
              >
                <p className="font-bold text-sm mb-1">{group.name}</p>
                <p className="text-xs opacity-90">{group.items.join(', ')}</p>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-8">
            +{55} XP
          </div>

          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
            >
              Continue
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 text-muted-foreground"
            >
              Back to Arcade
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-editorial text-xl font-bold">Historical Connections</h1>
          <p className="text-sm text-muted-foreground">Find 4 groups of 4</p>
        </div>
      </div>

      {/* Mistakes Counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
          Mistakes remaining
        </span>
        <div className="flex gap-1">
          {Array.from({ length: maxMistakes }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < maxMistakes - mistakes ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Solved Groups */}
      <AnimatePresence>
        {solvedGroups.map((group) => (
          <motion.div
            key={group.name}
            initial={{ opacity: 0, scale: 0.9, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            className="mb-2"
          >
            <div className={`p-3 rounded-lg ${colorMap[group.color]}`}>
              <p className="font-bold text-sm text-center mb-1">{group.name}</p>
              <p className="text-xs text-center opacity-90">{group.items.join(', ')}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {remainingItems.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <motion.button
              key={item}
              onClick={() => handleSelect(item)}
              animate={shakeItems && isSelected ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`aspect-square p-2 rounded-lg border text-xs font-bold flex items-center justify-center text-center transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {item}
            </motion.button>
          );
        })}
      </div>

      {/* Selection Count */}
      <div className="text-center mb-4">
        <span className="text-sm text-muted-foreground">
          Selected: {selected.length}/4
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleShuffle}
          className="flex-1 py-3 rounded-xl border border-border flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          <RotateCcw size={16} />
          Deselect
        </button>
        <button
          onClick={handleSubmit}
          disabled={selected.length !== 4}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            selected.length === 4
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
