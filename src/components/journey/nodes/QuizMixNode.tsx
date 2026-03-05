import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { QuizMixContent, Question } from '@/types';
import { WrongAnswerBanner } from '@/components/shared/WrongAnswerFeedback';

interface QuizMixNodeProps {
  content: QuizMixContent;
  xpReward: number;
  onComplete: (xp: number, message?: string) => void;
}

export function QuizMixNode({ content, xpReward, onComplete }: QuizMixNodeProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = content.questions[questionIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
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
      const finalScore = isCorrect ? score + 1 : score;
      const xp = Math.round((finalScore / content.questions.length) * xpReward);
      onComplete(xp, `Quiz complete! ${finalScore}/${content.questions.length} correct.`, { correct: finalScore, total: content.questions.length });
    }
  };

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <span className="text-4xl mb-2 block">❓</span>
          <h2 className="font-editorial text-xl font-bold">Quiz Mix</h2>
        </div>

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
        <h3 className="font-bold text-lg mb-4">{currentQuestion.prompt}</h3>

        <div className="space-y-2 mb-4">
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.answer;

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
                className={`w-full p-4 rounded-xl border transition-all text-left ${cardStyle}`}
                whileHover={!showExplanation ? { scale: 1.01 } : {}}
                whileTap={!showExplanation ? { scale: 0.99 } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    showExplanation
                      ? isCorrectAnswer
                        ? 'bg-success/20 text-success'
                        : isSelected
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted text-muted-foreground'
                      : isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-sm">{choice}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {showExplanation && (
          isCorrect ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-success/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-success" />
                <p className="text-sm font-bold">Correct!</p>
              </div>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </motion.div>
          ) : (
            <WrongAnswerBanner
              question={currentQuestion}
              userAnswer={currentQuestion.choices[selectedAnswer ?? 0]}
              correctAnswer={currentQuestion.choices[currentQuestion.answer as number]}
              nodeTitle="Quiz Mix"
              nodeType="quiz-mix"
            />
          )
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
    </div>
  );
}
