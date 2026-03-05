import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeadlinesContent, Question } from '@/types';

interface HeadlinesNodeProps {
  content: HeadlinesContent;
  xpReward: number;
  onComplete: (xp: number, message?: string) => void;
}

export function HeadlinesNode({ content, xpReward, onComplete }: HeadlinesNodeProps) {
  const [phase, setPhase] = useState<'read' | 'questions'>('read');
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentHeadline = content.headlines[headlineIndex];

  const handlePrevHeadline = () => {
    if (headlineIndex > 0) setHeadlineIndex(headlineIndex - 1);
  };

  const handleNextHeadline = () => {
    if (headlineIndex < content.headlines.length - 1) {
      setHeadlineIndex(headlineIndex + 1);
    } else {
      setPhase('questions');
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const currentQuestion = content.questions[questionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    if (isCorrect) setScore(score + 1);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex < content.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Account for the current answer in final score
      const currentQuestion = content.questions[questionIndex];
      const isCorrect = selectedAnswer === currentQuestion.answer;
      const finalScore = isCorrect ? score + 1 : score;
      const xp = Math.round((finalScore / content.questions.length) * xpReward);
      onComplete(xp, `Headlines complete! ${finalScore}/${content.questions.length} correct.`, { correct: finalScore, total: content.questions.length });
    }
  };

  return (
    <div className="px-4 py-6 pb-28">
      <AnimatePresence mode="wait">
        {phase === 'read' && (
          <motion.div
            key="read"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">📰</span>
              <h2 className="font-editorial text-xl font-bold">{content.publication}</h2>
              <p className="text-sm text-muted-foreground">{content.date}</p>
            </div>

            {/* Newspaper Card */}
            <motion.div
              key={currentHeadline.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-xl border border-border overflow-hidden mb-4"
            >
              {/* Image */}
              {currentHeadline.imageUrl && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={currentHeadline.imageUrl}
                    alt={currentHeadline.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="font-editorial text-lg font-bold uppercase mb-2 leading-tight">
                  {currentHeadline.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentHeadline.body}
                </p>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevHeadline}
                disabled={headlineIndex === 0}
                className={`p-2 rounded-full transition-colors ${
                  headlineIndex === 0
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <ChevronLeft size={24} />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {content.headlines.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === headlineIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    animate={index === headlineIndex ? { scale: 1.2 } : { scale: 1 }}
                  />
                ))}
              </div>

              <button
                onClick={handleNextHeadline}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                onClick={handleNextHeadline}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
              >
                {headlineIndex < content.headlines.length - 1 ? 'Next Headline' : 'Start Quiz'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Question {questionIndex + 1} of {content.questions.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  Score: {score}/{questionIndex + (showExplanation ? 1 : 0)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{
                    width: `${((questionIndex + (showExplanation ? 1 : 0)) / content.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div>
              <h3 className="font-bold text-lg mb-4">{content.questions[questionIndex].prompt}</h3>

              <div className="space-y-2 mb-4">
                {content.questions[questionIndex].choices.map((choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === content.questions[questionIndex].answer;

                  let cardStyle = 'bg-card border-border hover:border-primary/50';
                  if (showExplanation) {
                    if (isCorrectAnswer) {
                      cardStyle = 'bg-success/10 border-success';
                    } else if (isSelected && !isCorrectAnswer) {
                      cardStyle = 'bg-destructive/10 border-destructive';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-primary/10 border-primary';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showExplanation}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${cardStyle}`}
                      whileTap={!showExplanation ? { scale: 0.99 } : {}}
                    >
                      <span className="text-sm">{choice}</span>
                    </motion.button>
                  );
                })}
              </div>

              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-xl ${
                    selectedAnswer === content.questions[questionIndex].answer
                      ? 'bg-success/10'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm font-bold mb-1">
                    {selectedAnswer === content.questions[questionIndex].answer
                      ? '✓ Correct!'
                      : '✗ Not quite!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {content.questions[questionIndex].explanation}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Action Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              {!showExplanation ? (
                <motion.button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAnswer !== null
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextQuestion}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
                >
                  {questionIndex < content.questions.length - 1 ? 'Next Question' : 'Complete'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
