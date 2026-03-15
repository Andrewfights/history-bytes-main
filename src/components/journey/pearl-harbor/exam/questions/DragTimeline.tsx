/**
 * DragTimeline - Categorize items into before/after timeline
 * Wrapper for DragAndDropSorter in categorize mode
 * Used for Q10 (Public opinion shift)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { DragTimelineQuestion, ExamAnswer } from '../types';

interface DragTimelineProps {
  question: DragTimelineQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

export function DragTimeline({ question, onAnswer }: DragTimelineProps) {
  const [placements, setPlacements] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(question.items.map((item) => [item.id, null]))
  );
  const [unplacedItems, setUnplacedItems] = useState([...question.items]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handlePlace = (itemId: string, categoryId: string) => {
    if (isSubmitted) return;
    setPlacements((prev) => ({ ...prev, [itemId]: categoryId }));
    setUnplacedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleRemove = (itemId: string) => {
    if (isSubmitted) return;
    const item = question.items.find((i) => i.id === itemId);
    if (item) {
      setPlacements((prev) => ({ ...prev, [itemId]: null }));
      setUnplacedItems((prev) => [...prev, item]);
    }
  };

  const handleSubmit = () => {
    if (unplacedItems.length > 0 || isSubmitted) return;

    let correct = 0;
    Object.entries(placements).forEach(([itemId, categoryId]) => {
      if (categoryId === question.correctPlacements[itemId]) {
        correct++;
      }
    });

    const totalItems = question.items.length;
    const isAllCorrect = correct === totalItems;

    setScore(correct);
    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect: isAllCorrect,
      value: placements,
      partialCredit: correct / totalItems,
    });
  };

  const allPlaced = unplacedItems.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Category badge */}
      {question.category && (
        <div className="mb-3">
          <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
            {question.category}
          </span>
        </div>
      )}

      {/* Question text */}
      <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
        {question.prompt}
      </h3>

      {/* Categories */}
      <div className="flex gap-3 mb-4 flex-1">
        {question.categories.map((category) => {
          const placedItems = question.items.filter(
            (item) => placements[item.id] === category.id
          );

          return (
            <div
              key={category.id}
              className="flex-1 min-h-[160px] bg-white/5 rounded-xl p-3 border-2 border-dashed border-white/20"
            >
              <h4 className="text-white font-bold text-center text-sm mb-3 pb-2 border-b border-white/10">
                {category.label}
              </h4>
              <div className="space-y-2">
                {placedItems.map((item) => {
                  const isCorrect =
                    isSubmitted && question.correctPlacements[item.id] === category.id;
                  const isWrong =
                    isSubmitted && question.correctPlacements[item.id] !== category.id;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-2 rounded-lg flex items-center gap-2 text-sm ${
                        isCorrect
                          ? 'bg-green-500/20 border border-green-500'
                          : isWrong
                          ? 'bg-red-500/20 border border-red-500'
                          : 'bg-white/10'
                      }`}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span className="flex-1 text-white text-xs">{item.label}</span>
                      {!isSubmitted && (
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-white/40 hover:text-white p-1"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      {isCorrect && <CheckCircle2 size={14} className="text-green-400" />}
                      {isWrong && <XCircle size={14} className="text-red-400" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unplaced items */}
      {unplacedItems.length > 0 && !isSubmitted && (
        <div className="mb-4">
          <p className="text-white/40 text-xs mb-2 text-center">
            Tap an item, then choose a category:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {unplacedItems.map((item) => (
              <ItemPill
                key={item.id}
                item={item}
                categories={question.categories}
                onPlace={(categoryId) => handlePlace(item.id, categoryId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl mb-4 text-center ${
            score === question.items.length
              ? 'bg-green-500/20'
              : score >= question.items.length / 2
              ? 'bg-amber-500/20'
              : 'bg-red-500/20'
          }`}
        >
          <p className="text-white font-bold">
            {score === question.items.length
              ? 'Perfect!'
              : `${score}/${question.items.length} correct`}
          </p>
        </motion.div>
      )}

      {/* Submit button */}
      <AnimatePresence>
        {!isSubmitted && (
          <motion.button
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSubmit}
            disabled={!allPlaced}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allPlaced
              ? 'Check Answers'
              : `Place ${unplacedItems.length} more item${unplacedItems.length > 1 ? 's' : ''}`}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Item pill with category selection dropdown
function ItemPill({
  item,
  categories,
  onPlace,
}: {
  item: { id: string; label: string; icon?: string };
  categories: { id: string; label: string }[];
  onPlace: (categoryId: string) => void;
}) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-3 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-300 rounded-full text-xs font-medium hover:bg-amber-500/30 transition-colors"
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
