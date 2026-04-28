/**
 * DossierCard - Intelligence file-style lesson card
 * Mission briefing aesthetic with 4 states:
 * - completed: Gold fasteners, "DECLASSIFIED" stamp
 * - current: Red border, pulsing dot, "ACTIVE BRIEFING" stamp
 * - upcoming: Available but not started, "AWAITING REVIEW" stamp
 * - locked: Greyed out, lock icon overlay, "CLASSIFIED" stamp
 */

import { motion } from 'framer-motion';
import { Play, Lock, Check, Clock } from 'lucide-react';
import { PearlHarborLesson } from '@/data/pearlHarborLessons';

export type DossierState = 'done' | 'cur' | 'upcoming' | 'lock';

interface DossierCardProps {
  lesson: PearlHarborLesson;
  state: DossierState;
  index: number;
  onClick: () => void;
  showRightColumn?: boolean;
  completedTime?: string;
  cardImageUrl?: string;  // Optional custom image for the card
}

// Map state to CSS class
const stateClassMap: Record<DossierState, string> = {
  done: 'completed',
  cur: 'current',
  upcoming: 'upcoming',
  lock: 'locked',
};

// Get stamp text based on state
const stampTextMap: Record<DossierState, string> = {
  done: 'Declassified',
  cur: 'Active Briefing',
  upcoming: 'Awaiting Review',
  lock: 'Classified',
};

// Get label text based on state
const labelTextMap: Record<DossierState, string> = {
  done: 'Declassified',
  cur: 'Active Briefing',
  upcoming: 'Up Next',
  lock: 'Classified',
};

// Get button text based on state
const buttonTextMap: Record<DossierState, string> = {
  done: 'Review',
  cur: 'Begin Briefing',
  upcoming: 'Queue Up',
  lock: 'Locked',
};

export function DossierCard({
  lesson,
  state,
  index,
  onClick,
  showRightColumn = false,
  completedTime,
  cardImageUrl,
}: DossierCardProps) {
  const isClickable = state !== 'lock';
  const lessonNumber = String(index + 1).padStart(2, '0');
  const stateClass = stateClassMap[state];

  // Parse title to highlight the main word
  const renderTitle = () => {
    if (state === 'lock') {
      return <span className="doss-redact" style={{ width: '100px' }} />;
    }

    const words = lesson.title.split(' ');
    return words.map((word, i) => {
      // Common words to NOT highlight
      const skipWords = ['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'from'];
      const isEmphasis = !skipWords.includes(word.toLowerCase());
      return (
        <span key={i}>
          {isEmphasis ? <em>{word}</em> : word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  return (
    <motion.div
      onClick={isClickable ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`doss ${stateClass} ${isClickable ? '' : ''}`}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Brass corner fasteners */}
      <span className="doss-fastener tl" />
      <span className="doss-fastener tr" />
      <span className="doss-fastener bl" />
      <span className="doss-fastener br" />

      {/* Photo cell */}
      <div className="doss-photo">
        {/* Custom image or placeholder */}
        {cardImageUrl && state !== 'lock' ? (
          <img
            src={cardImageUrl}
            alt={lesson.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                state === 'cur'
                  ? 'radial-gradient(ellipse at 40% 30%, rgba(205,14,20,0.25), transparent 60%), linear-gradient(135deg, #3a1810, #0a0604)'
                  : 'linear-gradient(135deg, #2a1810, #0a0604)',
            }}
          >
            {state !== 'lock' && (
              <div
                className="w-[60%] h-[50%] rounded-lg"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 40%, rgba(120,80,40,0.5), rgba(40,30,20,0.8))',
                }}
              />
            )}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="doss-photo-ovl" />

        {/* File number stamp */}
        <div className="doss-file-n">{lessonNumber}</div>

        {/* Status stamp (on photo) */}
        <div className="doss-stamp">
          {state === 'lock' && <Lock size={11} className="inline-block mr-1 -mt-0.5" strokeWidth={2} />}
          {stampTextMap[state]}
        </div>

        {/* Lock overlay for locked state */}
        {state === 'lock' && (
          <div className="doss-lock-ovl">
            <div className="doss-lock-ic">
              <Lock size={15} strokeWidth={2} />
            </div>
          </div>
        )}
      </div>

      {/* Body cell */}
      <div className="doss-body">
        {/* Label row */}
        <div className="doss-label">
          <span className="doss-label-dot" />
          {labelTextMap[state]}
        </div>

        {/* Title */}
        <h3 className="doss-title">{renderTitle()}</h3>

        {/* Meta row */}
        <div className="doss-meta">
          {state === 'lock' ? (
            <>
              <span className="doss-redact" style={{ width: '80px' }} />
              <span className="sep">·</span>
              <span>{lesson.duration}</span>
              <span className="sep">·</span>
              <span className="xp">+{lesson.xpReward} XP</span>
            </>
          ) : (
            <>
              <span>{lesson.subtitle || lesson.narrativeArc}</span>
              <span className="sep">·</span>
              <span>{lesson.duration}</span>
              <span className="sep">·</span>
              <span className="xp">+{lesson.xpReward} XP</span>
            </>
          )}
        </div>

        {/* Description */}
        {(state === 'cur' || state === 'upcoming') && lesson.description && (
          <p className="doss-desc line-clamp-2">{lesson.description}</p>
        )}
        {state === 'lock' && (
          <p className="doss-desc" style={{ color: 'var(--text-4)' }}>
            Complete previous lessons to declassify this briefing.
          </p>
        )}
      </div>

      {/* Right action column (desktop only) */}
      {showRightColumn && (
        <div className="doss-right">
          <div>
            <div className="doss-right-time">
              {state === 'done' && completedTime ? completedTime : lesson.duration?.replace(' min', ':00') || '5:00'}
            </div>
            <div className="doss-right-time-sub">
              {state === 'done' ? 'Completed' : 'Runtime'}
            </div>
          </div>
          <button
            className="doss-right-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (isClickable) onClick();
            }}
            disabled={!isClickable}
          >
            {state === 'done' && <Play size={11} strokeWidth={2.5} />}
            {state === 'cur' && <Play size={11} strokeWidth={2.5} />}
            {state === 'upcoming' && <Clock size={11} strokeWidth={2.5} />}
            {state === 'lock' && <Lock size={11} strokeWidth={2.5} />}
            {buttonTextMap[state]}
          </button>
        </div>
      )}

      {/* Mobile right action indicator */}
      {!showRightColumn && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 sm:hidden">
          {state === 'done' && (
            <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <Check size={12} className="text-green-400" strokeWidth={3} />
            </div>
          )}
          {state === 'cur' && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #ff6a70, #CD0E14 45%, #8A0A0E)',
                boxShadow: '0 6px 16px rgba(205,14,20,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <Play size={11} className="text-off-white ml-0.5" fill="currentColor" />
            </div>
          )}
          {state === 'upcoming' && (
            <div className="w-6 h-6 rounded-full bg-gold-2/10 border border-gold-2/30 flex items-center justify-center">
              <Clock size={12} className="text-gold-2" strokeWidth={2} />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
