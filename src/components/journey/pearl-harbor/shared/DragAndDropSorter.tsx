/**
 * DragAndDropSorter - Reorderable items for sorting/ordering challenges
 * Used in Beat 5 (Breaking News), Beat 8 (Day of Infamy)
 */

import { useState, useCallback, useEffect } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export interface SortableItem {
  id: string;
  label: string;
  icon?: string;
  category?: string;
}

type SorterMode = 'order' | 'categorize';

interface OrderModeProps {
  mode: 'order';
  items: SortableItem[];
  correctOrder: string[]; // Array of item IDs in correct order
  onComplete: (isCorrect: boolean, attempts: number) => void;
}

interface CategorizeModeProps {
  mode: 'categorize';
  items: SortableItem[];
  categories: { id: string; label: string }[];
  correctCategories: Record<string, string>; // itemId -> categoryId
  onComplete: (score: number, total: number) => void;
}

type DragAndDropSorterProps = (OrderModeProps | CategorizeModeProps) & {
  title?: string;
  instructions?: string;
  showHints?: boolean;
  maxAttempts?: number;
};

export function DragAndDropSorter(props: DragAndDropSorterProps) {
  if (props.mode === 'categorize') {
    return <CategorizeSorter {...props} />;
  }
  return <OrderSorter {...props} />;
}

// Order mode component
function OrderSorter({
  items,
  correctOrder,
  onComplete,
  title,
  instructions,
  showHints = false,
  maxAttempts = 3,
}: OrderModeProps & { title?: string; instructions?: string; showHints?: boolean; maxAttempts?: number }) {
  const [orderedItems, setOrderedItems] = useState<SortableItem[]>(() =>
    shuffleArray([...items])
  );
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  const checkOrder = useCallback(() => {
    const currentOrder = orderedItems.map((item) => item.id);
    const correct = currentOrder.every((id, index) => id === correctOrder[index]);

    setAttempts((prev) => prev + 1);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct || attempts + 1 >= maxAttempts) {
      onComplete(correct, attempts + 1);
    }

    // Mark which positions are correct (for hints)
    if (showHints && !correct) {
      const checked = new Set<number>();
      currentOrder.forEach((id, index) => {
        if (id === correctOrder[index]) {
          checked.add(index);
        }
      });
      setCheckedIndices(checked);
    }
  }, [orderedItems, correctOrder, attempts, maxAttempts, onComplete, showHints]);

  const handleReset = () => {
    setOrderedItems(shuffleArray([...items]));
    setShowResult(false);
    setCheckedIndices(new Set());
  };

  const handleTryAgain = () => {
    setShowResult(false);
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      {(title || instructions) && (
        <div className="mb-6 text-center">
          {title && (
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          )}
          {instructions && (
            <p className="text-white/60 text-sm">{instructions}</p>
          )}
        </div>
      )}

      {/* Reorderable list */}
      <Reorder.Group
        axis="y"
        values={orderedItems}
        onReorder={setOrderedItems}
        className="flex-1 space-y-3"
      >
        {orderedItems.map((item, index) => {
          const isPositionCorrect = checkedIndices.has(index);

          return (
            <Reorder.Item
              key={item.id}
              value={item}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${
                isPositionCorrect
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
              }`}
            >
              {/* Order number */}
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>

              {/* Icon */}
              {item.icon && <span className="text-xl">{item.icon}</span>}

              {/* Label */}
              <span className="flex-1 text-white font-medium">{item.label}</span>

              {/* Drag handle */}
              <GripVertical size={20} className="text-white/40" />

              {/* Correct indicator */}
              {isPositionCorrect && (
                <CheckCircle2 size={20} className="text-green-400" />
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Attempts counter */}
      <div className="mt-4 text-center text-white/40 text-sm">
        Attempts: {attempts}/{maxAttempts}
      </div>

      {/* Result overlay */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 text-center"
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Perfect Order!</h3>
                  <p className="text-white/60 mb-4">
                    You got it right in {attempts} attempt{attempts > 1 ? 's' : ''}.
                  </p>
                </>
              ) : attempts >= maxAttempts ? (
                <>
                  <XCircle size={48} className="text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Out of Attempts</h3>
                  <p className="text-white/60 mb-4">
                    The correct order has been revealed.
                  </p>
                </>
              ) : (
                <>
                  <XCircle size={48} className="text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Not Quite</h3>
                  <p className="text-white/60 mb-4">
                    {maxAttempts - attempts} attempt{maxAttempts - attempts > 1 ? 's' : ''} remaining.
                    {showHints && ' Green items are in the correct position.'}
                  </p>
                  <button
                    onClick={handleTryAgain}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
        >
          <RotateCcw size={18} />
          Reset
        </button>
        <button
          onClick={checkOrder}
          disabled={showResult}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          Check Order
        </button>
      </div>
    </div>
  );
}

// Categorize mode component (for BEFORE/AFTER sorting)
function CategorizeSorter({
  items,
  categories,
  correctCategories,
  onComplete,
  title,
  instructions,
}: CategorizeModeProps & { title?: string; instructions?: string }) {
  const [placements, setPlacements] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(items.map((item) => [item.id, null]))
  );
  const [unplacedItems, setUnplacedItems] = useState<SortableItem[]>([...items]);
  const [showResult, setShowResult] = useState(false);

  const handleDrop = (itemId: string, categoryId: string) => {
    setPlacements((prev) => ({ ...prev, [itemId]: categoryId }));
    setUnplacedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleRemove = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setPlacements((prev) => ({ ...prev, [itemId]: null }));
      setUnplacedItems((prev) => [...prev, item]);
    }
  };

  const checkPlacements = () => {
    let correct = 0;
    Object.entries(placements).forEach(([itemId, categoryId]) => {
      if (categoryId === correctCategories[itemId]) {
        correct++;
      }
    });
    setShowResult(true);
    onComplete(correct, items.length);
  };

  const allPlaced = unplacedItems.length === 0;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      {(title || instructions) && (
        <div className="mb-4 text-center">
          {title && (
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          )}
          {instructions && (
            <p className="text-white/60 text-sm">{instructions}</p>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-4 mb-6">
        {categories.map((category) => {
          const placedItems = items.filter(
            (item) => placements[item.id] === category.id
          );

          return (
            <div
              key={category.id}
              className="flex-1 min-h-[200px] bg-white/5 rounded-xl p-3 border-2 border-dashed border-white/20"
            >
              <h4 className="text-white font-bold text-center mb-3 pb-2 border-b border-white/10">
                {category.label}
              </h4>
              <div className="space-y-2">
                {placedItems.map((item) => {
                  const isCorrect = showResult && correctCategories[item.id] === category.id;
                  const isWrong = showResult && correctCategories[item.id] !== category.id;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-green-500/20 border border-green-500'
                          : isWrong
                          ? 'bg-red-500/20 border border-red-500'
                          : 'bg-white/10'
                      }`}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span className="flex-1 text-white text-sm">{item.label}</span>
                      {!showResult && (
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-white/40 hover:text-white"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      {isCorrect && <CheckCircle2 size={16} className="text-green-400" />}
                      {isWrong && <XCircle size={16} className="text-red-400" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unplaced items */}
      {unplacedItems.length > 0 && (
        <div className="mb-4">
          <p className="text-white/40 text-xs mb-2 text-center">
            Tap an item, then tap a category to place it
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {unplacedItems.map((item) => (
              <ItemPill
                key={item.id}
                item={item}
                categories={categories}
                onPlace={(categoryId) => handleDrop(item.id, categoryId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Check button */}
      <button
        onClick={checkPlacements}
        disabled={!allPlaced || showResult}
        className="mt-auto py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showResult ? 'Complete!' : allPlaced ? 'Check Answers' : `Place ${unplacedItems.length} more item${unplacedItems.length > 1 ? 's' : ''}`}
      </button>
    </div>
  );
}

// Item pill with category selection
function ItemPill({
  item,
  categories,
  onPlace,
}: {
  item: SortableItem;
  categories: { id: string; label: string }[];
  onPlace: (categoryId: string) => void;
}) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-300 rounded-full text-sm font-medium hover:bg-amber-500/30 transition-colors"
      >
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.label}
      </button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-800 rounded-lg shadow-xl border border-white/10 overflow-hidden z-20"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onPlace(category.id);
                  setShowOptions(false);
                }}
                className="block w-full px-4 py-2 text-white text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {category.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
