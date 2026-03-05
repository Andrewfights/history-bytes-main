import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, XCircle, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';
import { InteractiveNodeContent, Artifact } from '@/data/ghostArmyStory';
import { useGhostArmyNodeMedia } from './useGhostArmyMedia';

interface WhoAmINodeProps {
  content: InteractiveNodeContent;
  xpReward: number;
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
}

type Phase = 'intro' | 'artifact' | 'conclusion';

export function WhoAmINode({ content, xpReward, onComplete }: WhoAmINodeProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentArtifactIndex, setCurrentArtifactIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Get stored media for this node
  const media = useGhostArmyNodeMedia('node-3-interactive');

  const currentArtifact = content.artifacts[currentArtifactIndex];
  const xpPerArtifact = Math.floor(xpReward / content.artifacts.length);

  const handleStart = () => {
    setPhase('artifact');
  };

  const handleRevealClue = () => {
    if (revealedClues < currentArtifact.clues.length) {
      setRevealedClues(prev => prev + 1);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentArtifact.correctIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    setTotalAnswered(prev => prev + 1);
    setShowResult(true);
  };

  const handleNextArtifact = () => {
    if (currentArtifactIndex < content.artifacts.length - 1) {
      setCurrentArtifactIndex(prev => prev + 1);
      setRevealedClues(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setPhase('conclusion');
    }
  };

  const handleFinish = () => {
    const earnedXP = Math.floor(xpReward * (correctCount / content.artifacts.length));
    onComplete(earnedXP, { correct: correctCount, total: totalAnswered });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <AnimatePresence mode="wait">
        {/* Intro Phase */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col"
          >
            {/* Hero image or placeholder */}
            {media?.backgroundImage ? (
              <div className="relative h-[30vh] overflow-hidden">
                <img
                  src={media.backgroundImage}
                  alt="Ghost Army Tools"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
            ) : (
              <div className="h-[20vh] bg-gradient-to-b from-purple-900/20 to-transparent" />
            )}

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 -mt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl mb-6"
              >
                🎭
              </motion.div>

              <h2 className="font-editorial text-2xl font-bold text-center mb-4">
                {content.title}
              </h2>

              <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
                {content.introNarration}
              </p>

              <div className="flex items-center gap-2 mb-8">
                <HelpCircle size={16} className="text-primary" />
                <span className="text-sm text-muted-foreground">
                  {content.artifacts.length} artifacts to identify
                </span>
              </div>

              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                Begin Investigation
              </button>
            </div>
          </motion.div>
        )}

        {/* Artifact Phase */}
        {phase === 'artifact' && (
          <motion.div
            key={`artifact-${currentArtifactIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-6"
          >
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {content.artifacts.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < currentArtifactIndex
                      ? 'bg-success'
                      : i === currentArtifactIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                Who Am I?
              </h3>
              <p className="text-muted-foreground text-sm">
                Artifact {currentArtifactIndex + 1} of {content.artifacts.length}
              </p>
            </div>

            {/* Mystery artifact box */}
            <div className="relative mb-6">
              <motion.div
                className={`p-6 rounded-2xl border-2 ${
                  showResult
                    ? selectedAnswer === currentArtifact.correctIndex
                      ? 'bg-success/10 border-success'
                      : 'bg-destructive/10 border-destructive'
                    : 'bg-card border-border'
                }`}
              >
                {/* Artifact silhouette/blur */}
                <div className="flex items-center justify-center h-24 mb-4">
                  {showResult ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-5xl"
                    >
                      {selectedAnswer === currentArtifact.correctIndex ? '🎯' : '❌'}
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center"
                    >
                      <span className="text-3xl font-bold text-muted-foreground">?</span>
                    </motion.div>
                  )}
                </div>

                {/* Clues */}
                <div className="space-y-3">
                  {currentArtifact.clues.map((clue, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: i < revealedClues ? 1 : 0.3,
                        height: 'auto',
                      }}
                      className={`flex items-start gap-3 ${
                        i < revealedClues ? '' : 'blur-sm select-none'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        {i < revealedClues ? (
                          <Eye size={14} className="text-primary" />
                        ) : (
                          <EyeOff size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm">
                        <span className="font-bold text-primary">Clue {i + 1}:</span> "{clue}"
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Reveal clue button */}
                {!showResult && revealedClues < currentArtifact.clues.length && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleRevealClue}
                    className="flex items-center gap-2 mt-4 mx-auto px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Lightbulb size={16} />
                    Reveal Next Clue
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Answer choices */}
            {revealedClues > 0 && !showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 mb-6"
              >
                <p className="text-sm font-bold text-center mb-3">What am I?</p>
                {currentArtifact.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedAnswer === index
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedAnswer === index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-sm">{choice}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Result reveal */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-6"
              >
                <div className={`p-4 rounded-xl ${
                  selectedAnswer === currentArtifact.correctIndex
                    ? 'bg-success/10'
                    : 'bg-destructive/10'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === currentArtifact.correctIndex ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : (
                      <XCircle size={18} className="text-destructive" />
                    )}
                    <span className="font-bold">
                      {selectedAnswer === currentArtifact.correctIndex ? 'Correct!' : 'Not quite!'}
                    </span>
                  </div>
                  <p className="font-bold text-primary mb-2">{currentArtifact.name}</p>
                  <p className="text-sm text-muted-foreground">{currentArtifact.revealText}</p>
                </div>

                {/* XP for this artifact */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gold-highlight font-bold">
                    +{selectedAnswer === currentArtifact.correctIndex ? xpPerArtifact : Math.floor(xpPerArtifact * 0.3)} XP
                  </span>
                </div>
              </motion.div>
            )}

            {/* Action button */}
            {!showResult && revealedClues > 0 && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  selectedAnswer !== null
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            )}

            {showResult && (
              <button
                onClick={handleNextArtifact}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {currentArtifactIndex < content.artifacts.length - 1 ? 'Next Artifact' : 'Continue'}
                <ChevronRight size={20} />
              </button>
            )}
          </motion.div>
        )}

        {/* Conclusion Phase */}
        {phase === 'conclusion' && (
          <motion.div
            key="conclusion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8"
          >
            {/* Summary */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-6xl mb-6"
            >
              🎖️
            </motion.div>

            <h2 className="font-editorial text-2xl font-bold text-center mb-4">
              Investigation Complete
            </h2>

            <p className="text-lg font-bold text-primary mb-2">
              {correctCount}/{totalAnswered} Artifacts Identified
            </p>

            <div className="flex items-center gap-2 mb-8">
              <span className="text-gold-highlight font-bold text-lg">
                +{Math.floor(xpReward * (correctCount / content.artifacts.length))} XP
              </span>
            </div>

            {/* Narration */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8 max-w-sm">
              <p className="font-editorial italic text-center">
                "{content.conclusionNarration}"
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
