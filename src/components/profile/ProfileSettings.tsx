import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eye, EyeOff, LogOut, Edit2, Check, TrendingUp, TrendingDown, Target, BookOpen, Brain, Gamepad2, Play, Camera, Crown, Settings, ChevronDown, ChevronUp, Key, Trophy, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRank, getNextRankXP } from '@/types';
import { BadgeShowcase } from '@/components/badges/BadgeShowcase';
import { StudyNotes } from './StudyNotes';
import { ApiKeySettings } from './ApiKeySettings';
import { usePantheonProgress, TierBadge, PantheonRoom } from '@/components/journey/pantheon';
import { isAdminUser } from '@/components/admin/AdminRoute';
import { useWW2Preferences } from '@/components/journey/ww2/hooks/useWW2Preferences';
import { getWW2HostById } from '@/data/ww2Hosts';
import { WW2HostSelection } from '@/components/journey/ww2';


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
  const { selectedHostId, selectHost, hasSelectedHost } = useWW2Preferences();
  const currentHost = selectedHostId ? getWW2HostById(selectedHostId) : null;
  const [showHostSelection, setShowHostSelection] = useState(false);

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
            className="w-[78px] h-[78px] rounded-full bg-ink-lift border-2 border-gold-2/30 mx-auto mb-2 flex items-center justify-center text-4xl relative group"
          >
            {selectedAvatar}
            <div className="absolute inset-0 rounded-full bg-void/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-off-white" />
            </div>
          </motion.button>
        </div>

        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-3 bg-ink-lift border border-off-white/[0.06] rounded-xl p-3 max-w-xs mx-auto"
          >
            {avatarOptions.map((av) => (
              <button
                key={av}
                onClick={() => { setSelectedAvatar(av); setShowAvatarPicker(false); }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                  selectedAvatar === av ? 'bg-gold-2/20 ring-2 ring-gold-2' : 'bg-ink-lift hover:bg-off-white/[0.04]'
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
              className="bg-ink-lift border border-off-white/10 rounded-lg px-3 py-2 text-center font-semibold text-off-white focus:outline-none focus:border-gold-2/50"
              autoFocus
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className="p-2 rounded-lg bg-success text-void">
              <Check size={18} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-display text-xl font-semibold text-off-white uppercase tracking-wide">{user.displayName}</h2>
            <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg hover:bg-off-white/[0.04] transition-colors">
              <Edit2 size={16} className="text-off-white/50" />
            </button>
          </div>
        )}

        {/* Stats Grid - 4 columns */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="font-serif text-xl font-bold text-gold-2">{user.xp.toLocaleString()}</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-off-white/50">XP</p>
          </div>
          <div className="w-px h-8 bg-off-white/10" />
          <div className="text-center">
            <p className="font-serif text-xl font-bold text-off-white">{user.streak}</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-off-white/50">Day Streak</p>
          </div>
          <div className="w-px h-8 bg-off-white/10" />
          <div className="text-center">
            <p className="font-serif text-xl font-bold text-off-white">{Math.round(overallAccuracy)}%</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-off-white/50">Accuracy</p>
          </div>
          <div className="w-px h-8 bg-off-white/10" />
          <div className="text-center">
            <p className="font-serif text-xl font-bold text-gold-2">{crownedCount}</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-off-white/50">Crowned</p>
          </div>
        </div>
      </div>

      {/* Rank Section - pfr pattern with left gold accent */}
      {(() => {
        const rank = getRank(user.xp);
        const { next, threshold, current } = getNextRankXP(user.xp);
        const pct = next ? Math.round(((user.xp - current) / (threshold - current)) * 100) : 100;
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative bg-ink-lift border border-gold-2/15 rounded-xl p-4 overflow-hidden">
            {/* Left gold accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2 rounded-l-xl" />

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gold-2/15 flex items-center justify-center">
                <Crown size={16} className="text-gold-2" />
              </div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-off-white/50">Current Rank</h3>
            </div>
            <p className="font-serif text-lg font-bold text-gold-2">{rank}</p>
            <div className="mt-3 h-[2px] rounded-full bg-void/50 overflow-hidden">
              <motion.div
                className="h-full bg-gold-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[10px] text-off-white/50">{user.xp.toLocaleString()} XP</span>
              {next ? (
                <span className="font-mono text-[10px] text-off-white/50">Next: {next} ({threshold.toLocaleString()} XP)</span>
              ) : (
                <span className="font-mono text-[10px] text-gold-2 font-bold uppercase tracking-wide">Maximum Rank</span>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* WW2 Guide Section - pfg pattern with left red accent */}
      {hasSelectedHost && currentHost && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative bg-ink-lift border border-off-white/[0.06] rounded-xl p-4 overflow-hidden"
        >
          {/* Left red accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ha-red rounded-l-xl" />

          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-gold-2" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-off-white/50">Your WW2 Guide</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl overflow-hidden border border-off-white/10"
                style={{ backgroundColor: currentHost.primaryColor + '30' }}
              >
                {currentHost.avatarUrl ? (
                  <img src={currentHost.avatarUrl} alt={currentHost.name} className="w-full h-full object-cover" />
                ) : (
                  currentHost.avatar
                )}
              </div>
              <div>
                <p className="font-display font-bold text-off-white uppercase tracking-wide">{currentHost.name}</p>
                <p className="font-serif italic text-xs text-gold-2">{currentHost.description}</p>
              </div>
            </div>
            <button
              onClick={() => setShowHostSelection(true)}
              className="px-3 py-1.5 font-mono text-[10px] font-medium bg-off-white/[0.04] hover:bg-off-white/[0.08] text-off-white/70 rounded-lg transition-colors border border-off-white/[0.06] uppercase tracking-wide"
            >
              Change
            </button>
          </div>
        </motion.div>
      )}

      {/* Badge Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-ink-lift border border-off-white/[0.06] rounded-xl p-4"
      >
        <BadgeShowcase />
      </motion.div>

      {/* Pantheon - Souvenir Collection */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
        onClick={() => setShowPantheon(true)}
        className="w-full bg-ink-lift border border-off-white/[0.06] hover:border-gold-2/20 rounded-xl p-4 text-left transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-2/10 border border-gold-2/20 flex items-center justify-center text-2xl">
              🪖
            </div>
            <div>
              <h3 className="font-serif font-bold text-off-white flex items-center gap-2">
                The Pantheon
                {!isPantheonLoading && getHighestTier() && (
                  <TierBadge tier={getHighestTier()!} size="sm" showLabel={false} />
                )}
              </h3>
              <p className="font-mono text-[10px] text-off-white/50 uppercase tracking-wide">
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
          <Trophy size={20} className="text-gold-2/50 group-hover:text-gold-2 transition-colors" />
        </div>
      </motion.button>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-3">
          <h3 className="font-serif text-lg text-off-white">Progress by Category</h3>
          <div className="w-12 h-0.5 bg-ha-red mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const pct = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
            return (
              <div key={cat.category} className="bg-ink-lift border border-off-white/[0.06] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-gold-2" />
                  <span className="font-mono text-[10px] font-semibold text-off-white/70 uppercase tracking-wide">{cat.category}</span>
                </div>
                <p className="font-serif text-lg font-bold text-off-white">{cat.completed}<span className="text-off-white/50 text-sm font-normal">/{cat.total}</span></p>
                <div className="h-[2px] rounded-full bg-void/50 mt-2 overflow-hidden">
                  <motion.div className="h-full bg-gold-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.4, duration: 0.6 }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Per-Era Performance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="mb-3">
          <h3 className="font-serif text-lg text-off-white">Performance by Era</h3>
          <div className="w-12 h-0.5 bg-ha-red mt-1.5" />
        </div>
        <div className="space-y-3">
          {eraStats.map((era) => {
            const notStarted = era.quizzesDone === 0;
            return (
              <div key={era.era} className="bg-ink-lift border border-off-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif text-sm font-semibold text-off-white">{era.era}</h4>
                  {notStarted ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-off-white/40">Not Started</span>
                  ) : (
                    <span className={`font-serif text-sm font-bold ${era.accuracy >= 80 ? 'text-success' : era.accuracy >= 60 ? 'text-gold-2' : 'text-ha-red'}`}>
                      {era.accuracy}%
                    </span>
                  )}
                </div>
                {!notStarted && (
                  <>
                    <p className="font-mono text-[10px] text-off-white/50 mb-2">{era.quizzesDone} quizzes completed</p>
                    {era.strongTopics.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={12} className="text-success" />
                        <span className="text-[11px] text-off-white/70">Strong: {era.strongTopics.join(', ')}</span>
                      </div>
                    )}
                    {era.weakTopics.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <TrendingDown size={12} className="text-ha-red" />
                        <span className="text-[11px] text-off-white/70">Improve: {era.weakTopics.join(', ')}</span>
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
        <div className="mb-3">
          <h3 className="font-serif text-lg text-off-white">Recommended Next</h3>
          <div className="w-12 h-0.5 bg-ha-red mt-1.5" />
        </div>
        <div className="relative bg-ink-lift border border-gold-2/15 rounded-xl p-4 overflow-hidden">
          {/* Left gold accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2 rounded-l-xl" />
          <div className="flex items-start gap-3">
            <Target size={20} className="text-gold-2 mt-0.5" />
            <div>
              <p className="font-serif text-sm font-semibold text-off-white">Strengthen: Roman Law</p>
              <p className="text-xs text-off-white/60 mt-0.5">Your weakest topic in The Ancient World. Revisit the lesson and retake the quiz.</p>
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
        <div className="mb-1">
          <h3 className="font-serif text-lg text-off-white">Settings</h3>
          <div className="w-12 h-0.5 bg-ha-red mt-1.5" />
        </div>

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateUser({ anonLeaderboard: !user.anonLeaderboard })}
          className="w-full bg-ink-lift border border-off-white/[0.06] rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {user.anonLeaderboard ? <EyeOff size={20} className="text-off-white/50" /> : <Eye size={20} className="text-gold-2" />}
            <div className="text-left">
              <p className="font-medium text-off-white">Anonymous on Leaderboard</p>
              <p className="text-sm text-off-white/50">{user.anonLeaderboard ? 'Your name is hidden' : 'Your name is visible'}</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${user.anonLeaderboard ? 'bg-gold-2' : 'bg-off-white/10'}`}>
            <motion.div className="w-5 h-5 bg-off-white rounded-full mt-0.5" animate={{ x: user.anonLeaderboard ? 26 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </div>
        </motion.button>

        {/* Account info */}
        {userEmail && (
          <div className="w-full bg-ink-lift border border-off-white/[0.06] rounded-xl p-4 flex items-center gap-3">
            <User size={20} className="text-off-white/50" />
            <div className="text-left">
              <p className="font-medium text-off-white">Account</p>
              <p className="text-sm text-off-white/50">{userEmail}</p>
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
            className="w-full bg-ink-lift border border-off-white/[0.06] rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-gold-2" />
              <span className="font-medium text-off-white">Study Notes</span>
              {studyNotes.length > 0 && (
                <span className="font-mono text-[10px] bg-gold-2/20 text-gold-2 px-2 py-0.5 rounded-full">
                  {studyNotes.length}
                </span>
              )}
            </div>
            {showStudyNotes ? <ChevronUp size={18} className="text-off-white/50" /> : <ChevronDown size={18} className="text-off-white/50" />}
          </button>

          <AnimatePresence>
            {showStudyNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-xl border border-off-white/[0.06] bg-ink-lift overflow-hidden">
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
          className="w-full bg-ink-lift border border-off-white/[0.06] rounded-xl p-4 flex items-center gap-3 text-ha-red"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </motion.button>

        {/* Admin Panel Link - Only shown to admin users */}
        {isAdminUser(userEmail) && (
          <Link to="/admin">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-ink-lift border border-off-white/[0.06] rounded-xl p-4 flex items-center gap-3 text-gold-2"
            >
              <Settings size={20} />
              <span className="font-medium">Admin Panel</span>
            </motion.div>
          </Link>
        )}
      </div>

      {/* Pantheon Modal */}
      <AnimatePresence>
        {showPantheon && (
          <PantheonRoom onBack={() => setShowPantheon(false)} />
        )}
      </AnimatePresence>

      {/* Host Selection Modal */}
      {showHostSelection && (
        <WW2HostSelection
          onSelectHost={(hostId) => {
            selectHost(hostId);
            setShowHostSelection(false);
          }}
          onClose={() => setShowHostSelection(false)}
        />
      )}
    </div>
  );
}
