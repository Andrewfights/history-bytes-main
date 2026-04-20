/**
 * PearlHarborArena - Elite Assessment Challenge
 *
 * Opt-in challenge after Final Exam with 15 questions:
 * - Hard (Q1-5) → Master's tier
 * - Harder (Q6-10) → PhD tier
 * - Hardest (Q11-15) → Rhodes Scholar tier
 *
 * Features:
 * - Two-strike rule: 2 wrong answers = reset to zero
 * - Cash-out checkpoints after Q5 and Q10
 * - Progressive difficulty with XP bonuses
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, AlertTriangle, CheckCircle, XCircle, Crown, Award, GraduationCap } from 'lucide-react';
import { WW2Host } from '@/types';
import {
  ARENA_QUESTIONS,
  ArenaQuestion,
  ArenaRecognition,
  RECOGNITION_TIERS,
  getShuffledArenaQuestions,
  getTierForQuestion,
  isCheckpointQuestion,
  getRecognitionForCheckpoint,
  getXPBonusForTier,
} from '@/data/arenaQuestions';

type ArenaScreen = 'invite' | 'question' | 'answer_reveal' | 'checkpoint' | 'cashout' | 'reset' | 'completion';

interface PearlHarborArenaProps {
  host: WW2Host;
  onComplete: (xp: number, tier: ArenaRecognition) => void;
  onDecline: () => void;
  onBack: () => void;
  bankedTier?: ArenaRecognition | null;
}

export function PearlHarborArena({
  host,
  onComplete,
  onDecline,
  onBack,
  bankedTier = null,
}: PearlHarborArenaProps) {
  // Game state
  const [screen, setScreen] = useState<ArenaScreen>('invite');
  const [questions, setQuestions] = useState<ArenaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentTier, setCurrentTier] = useState<ArenaRecognition>(bankedTier || 'graduate');
  const [earnedXP, setEarnedXP] = useState(0);

  // Initialize shuffled questions on mount
  useEffect(() => {
    setQuestions(getShuffledArenaQuestions());
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const tier = currentQuestion ? getTierForQuestion(questionNumber) : 'hard';

  // Handle entering the Arena
  const handleEnterArena = useCallback(() => {
    setScreen('question');
    setCurrentQuestionIndex(0);
    setWrongAnswers(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setEarnedXP(0);
    setCurrentTier(bankedTier || 'graduate');
  }, [bankedTier]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((answerId: string) => {
    if (selectedAnswer !== null) return; // Already answered

    const correct = currentQuestion.options.find(o => o.id === answerId)?.isCorrect || false;
    setSelectedAnswer(answerId);
    setIsCorrect(correct);

    if (!correct) {
      setWrongAnswers(prev => prev + 1);
    }

    // Show answer reveal after short delay
    setTimeout(() => {
      setScreen('answer_reveal');
    }, 500);
  }, [currentQuestion, selectedAnswer]);

  // Handle continuing after answer reveal
  const handleContinueAfterReveal = useCallback(() => {
    // Check for two-strike reset
    if (wrongAnswers >= 2) {
      setScreen('reset');
      return;
    }

    // Check if this was a checkpoint question
    if (isCheckpointQuestion(questionNumber)) {
      const recognition = getRecognitionForCheckpoint(questionNumber);
      if (recognition) {
        setCurrentTier(recognition);
        setEarnedXP(getXPBonusForTier(recognition));
      }
      setScreen('checkpoint');
      return;
    }

    // Check for completion (all 15 questions)
    if (questionNumber >= 15) {
      setCurrentTier('rhodes_scholar');
      setEarnedXP(getXPBonusForTier('rhodes_scholar'));
      setScreen('completion');
      return;
    }

    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScreen('question');
  }, [questionNumber, wrongAnswers]);

  // Handle cash-out (bank current tier)
  const handleCashOut = useCallback(() => {
    setScreen('cashout');
  }, []);

  // Handle continuing after checkpoint
  const handleContinueAfterCheckpoint = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScreen('question');
  }, []);

  // Handle final cash-out confirmation
  const handleConfirmCashOut = useCallback(() => {
    onComplete(earnedXP, currentTier);
  }, [earnedXP, currentTier, onComplete]);

  // Handle retry after reset
  const handleRetry = useCallback(() => {
    setQuestions(getShuffledArenaQuestions());
    handleEnterArena();
  }, [handleEnterArena]);

  // Handle completion
  const handleCompletionConfirm = useCallback(() => {
    onComplete(earnedXP, currentTier);
  }, [earnedXP, currentTier, onComplete]);

  // Get tier-specific styling
  const getTierColor = (t: string) => {
    switch (t) {
      case 'hard': return 'from-amber-600 to-amber-800';
      case 'harder': return 'from-orange-600 to-red-700';
      case 'hardest': return 'from-red-600 to-purple-800';
      default: return 'from-slate-600 to-slate-800';
    }
  };

  const getTierLabel = (t: string) => {
    switch (t) {
      case 'hard': return 'HARD';
      case 'harder': return 'HARDER';
      case 'hardest': return 'HARDEST';
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden"
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <AnimatePresence mode="wait">
        {/* INVITE SCREEN */}
        {screen === 'invite' && (
          <InviteScreen
            host={host}
            onEnter={handleEnterArena}
            onDecline={onDecline}
            bankedTier={bankedTier}
          />
        )}

        {/* QUESTION SCREEN */}
        {screen === 'question' && currentQuestion && (
          <QuestionScreen
            question={currentQuestion}
            questionNumber={questionNumber}
            totalQuestions={15}
            tier={tier}
            tierColor={getTierColor(tier)}
            tierLabel={getTierLabel(tier)}
            wrongAnswers={wrongAnswers}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
            onBack={onBack}
          />
        )}

        {/* ANSWER REVEAL SCREEN */}
        {screen === 'answer_reveal' && currentQuestion && (
          <AnswerRevealScreen
            question={currentQuestion}
            selectedAnswer={selectedAnswer!}
            isCorrect={isCorrect!}
            wrongAnswers={wrongAnswers}
            host={host}
            onContinue={handleContinueAfterReveal}
          />
        )}

        {/* CHECKPOINT SCREEN */}
        {screen === 'checkpoint' && (
          <CheckpointScreen
            tier={currentTier}
            xpBonus={earnedXP}
            questionNumber={questionNumber}
            host={host}
            onCashOut={handleCashOut}
            onContinue={handleContinueAfterCheckpoint}
          />
        )}

        {/* CASH-OUT CONFIRMATION */}
        {screen === 'cashout' && (
          <CashOutScreen
            tier={currentTier}
            xpBonus={earnedXP}
            host={host}
            onConfirm={handleConfirmCashOut}
          />
        )}

        {/* RESET SCREEN */}
        {screen === 'reset' && (
          <ResetScreen
            host={host}
            bankedTier={bankedTier}
            onRetry={handleRetry}
            onExit={onBack}
          />
        )}

        {/* COMPLETION SCREEN */}
        {screen === 'completion' && (
          <CompletionScreen
            tier={currentTier}
            xpBonus={earnedXP}
            host={host}
            onConfirm={handleCompletionConfirm}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Invite Screen
function InviteScreen({
  host,
  onEnter,
  onDecline,
  bankedTier,
}: {
  host: WW2Host;
  onEnter: () => void;
  onDecline: () => void;
  bankedTier: ArenaRecognition | null;
}) {
  return (
    <motion.div
      key="invite"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-8"
    >
      {/* Arena Title */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-white mb-2">
          THE ARENA
        </h1>
        <p className="text-amber-400 text-sm uppercase tracking-widest">
          Where History Is Made
        </p>
      </motion.div>

      {/* Host Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
        style={{ backgroundColor: host.primaryColor }}
      >
        {host.avatar}
      </motion.div>

      {/* Host Challenge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-md text-center mb-8"
      >
        <p className="text-white/80 text-lg leading-relaxed mb-4">
          "You've proven you know the basics. But do you know the <span className="text-amber-400 font-bold">full story</span>?"
        </p>
        <p className="text-white/60 text-sm">
          Welcome to the Arena. 15 questions. Three tiers. Two wrong answers and you lose everything.
        </p>
      </motion.div>

      {/* Tier Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm mb-8 space-y-3"
      >
        <TierPreviewRow icon="📜" label="Master's" questions="Q1-5 (Hard)" xp="+200 XP" />
        <TierPreviewRow icon="🎖️" label="PhD" questions="Q6-10 (Harder)" xp="+500 XP" />
        <TierPreviewRow icon="👑" label="Rhodes Scholar" questions="Q11-15 (Hardest)" xp="+1,000 XP" />
      </motion.div>

      {/* Banked Tier Notice */}
      {bankedTier && bankedTier !== 'graduate' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-6 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg"
        >
          <p className="text-emerald-400 text-sm">
            You have {RECOGNITION_TIERS[bankedTier].label} banked. You can try for higher.
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button
          onClick={onEnter}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          Enter the Arena
        </button>
        <button
          onClick={onDecline}
          className="w-full py-3 rounded-xl bg-white/10 text-white/70 font-medium hover:bg-white/20 transition-all"
        >
          Not Today
        </button>
      </motion.div>
    </motion.div>
  );
}

function TierPreviewRow({ icon, label, questions, xp }: { icon: string; label: string; questions: string; xp: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-white font-medium">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-white/60 text-xs">{questions}</p>
        <p className="text-amber-400 text-sm font-bold">{xp}</p>
      </div>
    </div>
  );
}

// Question Screen
function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  tier,
  tierColor,
  tierLabel,
  wrongAnswers,
  selectedAnswer,
  onSelectAnswer,
  onBack,
}: {
  question: ArenaQuestion;
  questionNumber: number;
  totalQuestions: number;
  tier: string;
  tierColor: string;
  tierLabel: string;
  wrongAnswers: number;
  selectedAnswer: string | null;
  onSelectAnswer: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="question"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-4">
          {/* Wrong Answer Counter */}
          <div className="flex items-center gap-1">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < wrongAnswers ? 'bg-red-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Tier Badge */}
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${tierColor} text-white text-xs font-bold`}>
            {tierLabel}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round((questionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${tierColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Topic */}
        <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">
          {question.topic}
        </p>

        {/* Question Text */}
        <h2 className="text-white text-lg sm:text-xl font-medium leading-relaxed mb-8">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === option.id;

            return (
              <motion.button
                key={option.id}
                onClick={() => onSelectAnswer(option.id)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/60'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1 text-white/90 text-sm sm:text-base leading-relaxed">
                    {option.text}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Answer Reveal Screen
function AnswerRevealScreen({
  question,
  selectedAnswer,
  isCorrect,
  wrongAnswers,
  host,
  onContinue,
}: {
  question: ArenaQuestion;
  selectedAnswer: string;
  isCorrect: boolean;
  wrongAnswers: number;
  host: WW2Host;
  onContinue: () => void;
}) {
  const correctOption = question.options.find(o => o.isCorrect);

  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen"
    >
      {/* Result Banner */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`px-4 py-6 ${isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
      >
        <div className="flex items-center justify-center gap-3">
          {isCorrect ? (
            <CheckCircle size={32} className="text-emerald-400" />
          ) : (
            <XCircle size={32} className="text-red-400" />
          )}
          <span className={`text-2xl font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </span>
        </div>
        {!isCorrect && (
          <p className="text-center text-red-300/80 text-sm mt-2">
            Strike {wrongAnswers} of 2
            {wrongAnswers >= 2 && ' — Arena Reset'}
          </p>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Correct Answer */}
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-emerald-400 text-xs uppercase tracking-wider mb-2">Correct Answer</p>
          <p className="text-white font-medium">{correctOption?.text}</p>
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Explanation</p>
          <p className="text-white/80 text-sm leading-relaxed">{question.explanation}</p>
        </div>

        {/* Host Direction */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <p className="text-white/70 text-sm italic leading-relaxed">
            "{question.hostDirection}"
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 py-6 border-t border-white/10">
        <button
          onClick={onContinue}
          className={`w-full py-4 rounded-xl font-bold text-lg ${
            wrongAnswers >= 2
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-amber-500 text-black hover:bg-amber-400'
          }`}
        >
          {wrongAnswers >= 2 ? 'View Results' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
}

// Checkpoint Screen
function CheckpointScreen({
  tier,
  xpBonus,
  questionNumber,
  host,
  onCashOut,
  onContinue,
}: {
  tier: ArenaRecognition;
  xpBonus: number;
  questionNumber: number;
  host: WW2Host;
  onCashOut: () => void;
  onContinue: () => void;
}) {
  const tierInfo = RECOGNITION_TIERS[tier];
  const nextTier = tier === 'masters' ? 'PhD' : 'Rhodes Scholar';
  const nextQuestions = tier === 'masters' ? '5 Harder' : '5 Hardest';

  return (
    <motion.div
      key="checkpoint"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-8"
    >
      {/* Checkpoint Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/30 border-2 border-amber-500 flex items-center justify-center text-5xl mb-6"
      >
        {tierInfo.icon}
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-editorial text-3xl font-bold text-white mb-2"
      >
        {tierInfo.label} Achieved!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-amber-400 text-xl font-bold mb-6"
      >
        +{xpBonus} XP Earned
      </motion.p>

      {/* Host Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-md text-center mb-8"
      >
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <p className="text-white/70 text-sm italic leading-relaxed text-left">
            {tier === 'masters'
              ? `"Five down, ten to go. You've earned Master's status. You can bank it right now — walk away with ${xpBonus} bonus XP. Or you can keep going. But remember: two wrong answers and you lose everything. What's it going to be?"`
              : `"You're in rare company now. PhD level. ${xpBonus} bonus XP is yours to keep if you stop here. But the last five questions? Those are the ones that separate the experts from the legends. Rhodes Scholar is on the line. Do you have what it takes?"`}
          </p>
        </div>
      </motion.div>

      {/* Decision Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button
          onClick={onCashOut}
          className="w-full py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-lg hover:bg-emerald-500/30 transition-all"
        >
          Bank {tierInfo.label} (+{xpBonus} XP)
        </button>
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          Risk It — Go for {nextTier}
        </button>
        <p className="text-center text-white/40 text-xs mt-2">
          {nextQuestions} questions remaining
        </p>
      </motion.div>
    </motion.div>
  );
}

// Cash-Out Confirmation Screen
function CashOutScreen({
  tier,
  xpBonus,
  host,
  onConfirm,
}: {
  tier: ArenaRecognition;
  xpBonus: number;
  host: WW2Host;
  onConfirm: () => void;
}) {
  const tierInfo = RECOGNITION_TIERS[tier];

  return (
    <motion.div
      key="cashout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/30 border-2 border-emerald-500 flex items-center justify-center text-6xl mb-6"
      >
        {tierInfo.icon}
      </motion.div>

      <h2 className="font-editorial text-3xl font-bold text-white mb-2">
        {tierInfo.label} Secured!
      </h2>

      <p className="text-emerald-400 text-2xl font-bold mb-4">
        +{xpBonus} XP Banked
      </p>

      <p className="text-white/60 text-sm text-center max-w-xs mb-8">
        Your {tierInfo.label} status is permanently saved. You can return to try for a higher tier anytime.
      </p>

      <button
        onClick={onConfirm}
        className="w-full max-w-sm py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-400 transition-all"
      >
        Claim Rewards
      </button>
    </motion.div>
  );
}

// Reset Screen (Two Strikes)
function ResetScreen({
  host,
  bankedTier,
  onRetry,
  onExit,
}: {
  host: WW2Host;
  bankedTier: ArenaRecognition | null;
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <motion.div
      key="reset"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-8"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' }}
        className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-6"
      >
        <AlertTriangle size={48} className="text-red-500" />
      </motion.div>

      <h2 className="font-editorial text-3xl font-bold text-white mb-2">
        Arena Reset
      </h2>

      <p className="text-red-400 text-lg mb-6">
        Two strikes. Back to zero.
      </p>

      {/* Host Message */}
      <div className="max-w-md text-center mb-8">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <p className="text-white/70 text-sm italic leading-relaxed text-left">
            "The Arena doesn't forgive. You hit two wrong answers and you're back to zero. But the Arena is always open. Come back when you're ready and try again. Every Rhodes Scholar fell before they stood."
          </p>
        </div>
      </div>

      {/* Banked Tier Notice */}
      {bankedTier && bankedTier !== 'graduate' && (
        <div className="mb-6 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <p className="text-emerald-400 text-sm text-center">
            Your {RECOGNITION_TIERS[bankedTier].label} status is still safe.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onRetry}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          Try Again
        </button>
        <button
          onClick={onExit}
          className="w-full py-3 rounded-xl bg-white/10 text-white/70 font-medium hover:bg-white/20 transition-all"
        >
          Exit Arena
        </button>
      </div>
    </motion.div>
  );
}

// Completion Screen (Rhodes Scholar!)
function CompletionScreen({
  tier,
  xpBonus,
  host,
  onConfirm,
}: {
  tier: ArenaRecognition;
  xpBonus: number;
  host: WW2Host;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      key="completion"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-8"
    >
      {/* Crown Animation */}
      <motion.div
        initial={{ scale: 0, y: -100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center">
          <Crown size={64} className="text-white" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-amber-500/50 blur-xl -z-10" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-editorial text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2"
      >
        RHODES SCHOLAR
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-amber-400 text-2xl font-bold mb-6"
      >
        +{xpBonus} XP Earned
      </motion.p>

      {/* Host Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="max-w-md text-center mb-8"
      >
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <p className="text-white/80 text-sm italic leading-relaxed text-left">
            "You did it. Fifteen questions. Three tiers. And you're still standing. Welcome to the Rhodes Scholar tier. Your name goes on the permanent leaderboard. History remembers."
          </p>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="text-center">
          <p className="text-3xl">👑</p>
          <p className="text-white/60 text-xs mt-1">Crown</p>
        </div>
        <div className="text-center">
          <p className="text-3xl">🏆</p>
          <p className="text-white/60 text-xs mt-1">Leaderboard</p>
        </div>
        <div className="text-center">
          <p className="text-3xl">⭐</p>
          <p className="text-white/60 text-xs mt-1">Gold Souvenir</p>
        </div>
      </motion.div>

      {/* Claim Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        onClick={onConfirm}
        className="w-full max-w-sm py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg hover:from-amber-400 hover:to-yellow-400 transition-all"
      >
        Claim Your Crown
      </motion.button>
    </motion.div>
  );
}
