import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Calendar, Sparkles } from 'lucide-react';
import { badges, getBadgesByCategory, getBadgeById } from '@/data/badgeData';
import { Badge, BadgeCategory, CATEGORY_CONFIG, RARITY_CONFIG } from '@/types/badges';
import { useBadgeTracker } from '@/hooks/useBadgeTracker';
import { BadgeCard } from './BadgeCard';

interface BadgeShowcaseProps {
  showLocked?: boolean;
}

export function BadgeShowcase({ showLocked = true }: BadgeShowcaseProps) {
  const { earnedBadges, isBadgeEarned, getEarnedBadgeData, getBadgeProgress } = useBadgeTracker();
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : getBadgesByCategory(selectedCategory);

  const displayBadges = showLocked
    ? filteredBadges
    : filteredBadges.filter(b => isBadgeEarned(b.id));

  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-primary" />
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Achievements
          </h3>
        </div>
        <span className="text-sm font-semibold text-primary">
          {earnedCount}/{totalCount}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <CategoryTab
          label="All"
          isSelected={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        />
        {(Object.keys(CATEGORY_CONFIG) as BadgeCategory[]).map(cat => (
          <CategoryTab
            key={cat}
            label={`${CATEGORY_CONFIG[cat].icon} ${CATEGORY_CONFIG[cat].label}`}
            isSelected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 gap-2">
        {displayBadges.map(badge => {
          const isEarned = isBadgeEarned(badge.id);
          const earnedData = getEarnedBadgeData(badge.id);
          const progress = !isEarned ? getBadgeProgress(badge) : null;

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={isEarned}
              isNew={earnedData?.isNew}
              onClick={() => setSelectedBadge(badge)}
              progress={progress}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {displayBadges.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No badges in this category yet.</p>
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetailModal
            badge={selectedBadge}
            isEarned={isBadgeEarned(selectedBadge.id)}
            earnedAt={getEarnedBadgeData(selectedBadge.id)?.earnedAt}
            progress={getBadgeProgress(selectedBadge)}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryTab({ label, isSelected, onClick }: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-border text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

interface BadgeDetailModalProps {
  badge: Badge;
  isEarned: boolean;
  earnedAt?: string;
  progress: { current: number; target: number } | null;
  onClose: () => void;
}

function BadgeDetailModal({ badge, isEarned, earnedAt, progress, onClose }: BadgeDetailModalProps) {
  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const categoryConfig = CATEGORY_CONFIG[badge.category];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <X size={18} className="text-muted-foreground" />
        </button>

        {/* Badge icon */}
        <div className="text-center mb-4">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-5xl ${
              isEarned ? rarityConfig.bgColor : 'bg-muted/50'
            } ${isEarned ? '' : 'grayscale opacity-50'}`}
          >
            {badge.icon}
          </div>
        </div>

        {/* Badge name */}
        <h3 className={`text-xl font-bold text-center mb-1 ${isEarned ? rarityConfig.color : 'text-muted-foreground'}`}>
          {badge.name}
        </h3>

        {/* Rarity & Category */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`text-[10px] uppercase tracking-wider font-bold ${rarityConfig.color}`}>
            {rarityConfig.label}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className={`text-[10px] uppercase tracking-wider font-medium ${categoryConfig.color}`}>
            {categoryConfig.icon} {categoryConfig.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center mb-4">
          {badge.description}
        </p>

        {/* Earned info */}
        {isEarned && earnedAt && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <Calendar size={12} />
            <span>Earned on {formatDate(earnedAt)}</span>
          </div>
        )}

        {/* Progress for locked badges */}
        {!isEarned && progress && progress.target > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress.current}/{progress.target}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* XP bonus */}
        {badge.xpBonus && (
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <Sparkles size={14} className="text-primary" />
            <span className="text-primary font-semibold">+{badge.xpBonus} XP</span>
            <span className="text-muted-foreground">{isEarned ? 'earned' : 'reward'}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
