import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eye, EyeOff, LogOut, Edit2, Check, TrendingUp, TrendingDown, Target, BookOpen, Brain, Gamepad2, Play, Camera, Crown, Settings, ChevronDown, ChevronUp, Key, Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRank, getNextRankXP } from '@/types';
import { BadgeShowcase } from '@/components/badges/BadgeShowcase';
import { StudyNotes } from './StudyNotes';
import { ApiKeySettings } from './ApiKeySettings';
import { usePantheonProgress, TierBadge, PantheonRoom } from '@/components/journey/pantheon';


const avatarOptions = ['👤', '🧑‍🎓', '🦉', '🏛️', '⚔️', '🌍', '🎭', '📜', '🔺', '👑'];

const eraStats = [
  { era: 'The Ancient World', accuracy: 87, quizzesDone: 12, strongTopics: ['Mesopotamia', 'Egypt'], weakTopics: ['Roman Law'] },
  { era: 'Classical Empires', accuracy: 72, quizzesDone: 5, strongTopics: ['Greek Philosophy'], weakTopics: ['Han Dynasty', 'Maurya Empire'] },
  { era: 'Medieval Europe', accuracy: 0, quizzesDone: 0, strongTopics: [], weakTopics: [] },
];

const categoryStats = [
  { category: 'Lessons', icon: BookOpen, completed: 8, total: 24, color: 'text-primary' },
  { category: 'Stories', icon: Play, completed: 3, total: 10, color: 'text-secondary' },
  { category: 'Language', icon: Brain, completed: 1, total: 8, color: 'text-success' },
  { category: 'Games', icon: Gamepad2, completed: 2, total: 12, color: 'text-destructive' },
];

export function ProfileSettings() {
  const { user, updateUser, crownedCount, signOut, userEmail, selectedGuideId, studyNotes } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [showStudyNotes, setShowStudyNotes] = useState(false);
  const [showPantheon, setShowPantheon] = useState(false);
  const { getTotalSouvenirs, getHighestTier, isLoading: isPantheonLoading } = usePantheonProgress();

  const handleSave = () => {
    updateUser({ displayName });
    setIsEditing(false);
  };

  const overallAccuracy = eraStats.filter(e => e.quizzesDone > 0).reduce((sum, e) => sum + e.accuracy, 0) /
    Math.max(eraStats.filter(e => e.quizzesDone > 0).length, 1);

  return (
    <div className="p-4 space-y-6">
      {/* Avatar & Name */}
      <div className="text-center">
        <div className="relative inline-block">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center text-4xl relative group"
          >
            {selectedAvatar}
            <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-foreground" />
            </div>
          </motion.button>
        </div>

        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-3 bg-card border border-border rounded-xl p-3 max-w-xs mx-auto"
          >
            {avatarOptions.map((av) => (
              <button
                key={av}
                onClick={() => { setSelectedAvatar(av); setShowAvatarPicker(false); }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                  selectedAvatar === av ? 'bg-primary/20 ring-2 ring-primary' : 'bg-card hover:bg-muted'
                }`}
              >
                {av}
              </button>
            ))}
          </motion.div>
        )}

        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-center font-semibold focus:outline-none focus:border-primary"
              autoFocus
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className="p-2 rounded-lg bg-success text-success-foreground">
              <Check size={18} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg hover:bg-card transition-colors">
              <Edit2 size={16} className="text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient-gold">{user.xp.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Total XP</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">{user.streak}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Day Streak</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">{Math.round(overallAccuracy)}%</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Accuracy</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{crownedCount}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Crowned</p>
          </div>
        </div>
      </div>

      {/* Rank Section */}
      {(() => {
        const rank = getRank(user.xp);
        const { next, threshold, current } = getNextRankXP(user.xp);
        const pct = next ? Math.round(((user.xp - current) / (threshold - current)) * 100) : 100;
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-primary" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Current Rank</h3>
            </div>
            <p className="font-editorial text-2xl font-bold text-primary">{rank}</p>
            <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">{user.xp.toLocaleString()} XP</span>
              {next ? (
                <span className="text-xs text-muted-foreground">Next: {next} ({threshold.toLocaleString()} XP)</span>
              ) : (
                <span className="text-xs text-primary font-bold">Maximum Rank Achieved</span>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Badge Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <BadgeShowcase />
      </motion.div>

      {/* Pantheon - Souvenir Collection */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
        onClick={() => setShowPantheon(true)}
        className="w-full bg-gradient-to-r from-slate-800/80 to-slate-900/60 border border-white/10 hover:border-amber-500/30 rounded-xl p-4 text-left transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-slate-700/50 flex items-center justify-center text-2xl">
              🪖
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                The Pantheon
                {!isPantheonLoading && getHighestTier() && (
                  <TierBadge tier={getHighestTier()!} size="sm" showLabel={false} />
                )}
              </h3>
              <p className="text-xs text-white/60">
                {isPantheonLoading ? (
                  'Loading...'
                ) : getTotalSouvenirs() > 0 ? (
                  `${getTotalSouvenirs()} souvenir${getTotalSouvenirs() !== 1 ? 's' : ''} collected`
                ) : (
                  'Your souvenir collection awaits'
                )}
              </p>
            </div>
          </div>
          <Trophy size={20} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
        </div>
      </motion.button>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Progress by Category</h3>
        <div className="grid grid-cols-2 gap-3">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const pct = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
            return (
              <div key={cat.category} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={cat.color} />
                  <span className="text-xs font-semibold">{cat.category}</span>
                </div>
                <p className="text-lg font-bold">{cat.completed}<span className="text-muted-foreground text-sm font-normal">/{cat.total}</span></p>
                <div className="h-1.5 rounded-full bg-border mt-2 overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.4, duration: 0.6 }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Per-Era Performance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Performance by Era</h3>
        <div className="space-y-3">
          {eraStats.map((era) => {
            const notStarted = era.quizzesDone === 0;
            return (
              <div key={era.era} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">{era.era}</h4>
                  {notStarted ? (
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Not Started</span>
                  ) : (
                    <span className={`text-sm font-bold ${era.accuracy >= 80 ? 'text-success' : era.accuracy >= 60 ? 'text-primary' : 'text-destructive'}`}>
                      {era.accuracy}%
                    </span>
                  )}
                </div>
                {!notStarted && (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">{era.quizzesDone} quizzes completed</p>
                    {era.strongTopics.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={12} className="text-success" />
                        <span className="text-[11px] text-foreground/80">Strong: {era.strongTopics.join(', ')}</span>
                      </div>
                    )}
                    {era.weakTopics.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <TrendingDown size={12} className="text-destructive" />
                        <span className="text-[11px] text-foreground/80">Improve: {era.weakTopics.join(', ')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Recommended Next</h3>
        <div className="bg-card border border-primary/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Target size={20} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Strengthen: Roman Law</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your weakest topic in The Ancient World. Revisit the lesson and retake the quiz.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <ApiKeySettings />
      </motion.div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Settings</h3>

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateUser({ anonLeaderboard: !user.anonLeaderboard })}
          className="w-full lesson-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {user.anonLeaderboard ? <EyeOff size={20} className="text-muted-foreground" /> : <Eye size={20} className="text-primary" />}
            <div className="text-left">
              <p className="font-medium">Anonymous on Leaderboard</p>
              <p className="text-sm text-muted-foreground">{user.anonLeaderboard ? 'Your name is hidden' : 'Your name is visible'}</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${user.anonLeaderboard ? 'bg-primary' : 'bg-border'}`}>
            <motion.div className="w-5 h-5 bg-foreground rounded-full mt-0.5" animate={{ x: user.anonLeaderboard ? 26 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </div>
        </motion.button>

        {/* Account info */}
        {userEmail && (
          <div className="w-full lesson-card flex items-center gap-3">
            <User size={20} className="text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Account</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        )}

        {/* Study Notes Section */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full"
        >
          <button
            onClick={() => setShowStudyNotes(!showStudyNotes)}
            className="w-full lesson-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-primary" />
              <span className="font-medium">Study Notes</span>
              {studyNotes.length > 0 && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {studyNotes.length}
                </span>
              )}
            </div>
            {showStudyNotes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <AnimatePresence>
            {showStudyNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden">
                  <StudyNotes />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          onClick={signOut}
          className="w-full lesson-card flex items-center gap-3 text-destructive"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </motion.button>

        {/* Admin Panel Link */}
        <Link to="/admin">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileTap={{ scale: 0.98 }}
            className="w-full lesson-card flex items-center gap-3 text-primary"
          >
            <Settings size={20} />
            <span className="font-medium">Admin Panel</span>
          </motion.div>
        </Link>
      </div>

      {/* Pantheon Modal */}
      <AnimatePresence>
        {showPantheon && (
          <PantheonRoom onBack={() => setShowPantheon(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
