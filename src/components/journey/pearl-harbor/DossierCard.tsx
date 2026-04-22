/**
 * DossierCard - Intelligence file-style lesson card
 * Mission briefing aesthetic with declassified/classified states
 */

import { motion } from 'framer-motion';
import { Play, Lock, Check } from 'lucide-react';
import { PearlHarborLesson } from '@/data/pearlHarborLessons';

export type DossierState = 'done' | 'cur' | 'lock';

interface DossierCardProps {
  lesson: PearlHarborLesson;
  state: DossierState;
  index: number;
  onClick: () => void;
}

export function DossierCard({ lesson, state, index, onClick }: DossierCardProps) {
  const isClickable = state !== 'lock';
  const lessonNumber = String(index + 1).padStart(2, '0');

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        w-full text-left relative z-10 p-2.5 rounded bg-ink-lift border flex gap-2.5
        transition-all duration-200
        ${state === 'done' ? 'border-gold-2/35 bg-[rgba(30,24,18,0.6)]' : ''}
        ${state === 'cur' ? 'border-ha-red bg-gradient-to-br from-[rgba(58,28,16,0.5)] to-ink-lift shadow-[0_6px_18px_rgba(0,0,0,0.4)]' : ''}
        ${state === 'lock' ? 'opacity-45 border-off-white/10 cursor-not-allowed' : ''}
        ${isClickable ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}
      `}
    >
      {/* Corner fasteners */}
      <div
        className={`absolute top-[5px] left-[5px] w-1.5 h-1.5 rounded-full border-[1.5px] bg-ink z-10
          ${state === 'cur' ? 'border-ha-red' : 'border-gold-2/50'}
        `}
      />
      <div
        className={`absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full border-[1.5px] bg-ink z-10
          ${state === 'cur' ? 'border-ha-red' : 'border-gold-2/50'}
        `}
      />

      {/* Photo placeholder */}
      <div
        className={`
          w-[58px] h-[58px] rounded flex-shrink-0 relative overflow-hidden border
          ${state === 'done' ? 'bg-gradient-to-br from-[#3a2818] to-[#1a0c04] border-gold-2/20' : ''}
          ${state === 'cur' ? 'border-ha-red/50' : ''}
          ${state === 'lock' ? 'bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] border-off-white/10' : ''}
        `}
        style={state === 'cur' ? {
          background: 'radial-gradient(ellipse at 30% 30%, rgba(205,14,20,0.4), transparent 60%), linear-gradient(135deg, #3a1810, #0a0604)'
        } : undefined}
      >
        {/* Silhouette placeholder */}
        {state !== 'lock' && (
          <div
            className="absolute inset-[15%_25%] rounded-[40%_40%_15%_15%]"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(120,80,40,0.5), rgba(40,30,20,0.8))'
            }}
          />
        )}

        {/* Gold overlay effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(230,171,42,0.2), transparent 70%)'
          }}
        />

        {/* Number stamp */}
        <div
          className={`
            absolute top-[3px] right-[3px] px-1.5 py-0.5 rounded-sm font-mono text-[7px] font-bold tracking-[0.1em] z-10
            ${state === 'cur' ? 'bg-ha-red text-off-white' : 'bg-black/70 text-gold-2'}
          `}
        >
          {lessonNumber}
        </div>
      </div>

      {/* Body content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Status label */}
        <div
          className={`
            flex items-center gap-1.5 font-mono text-[7px] tracking-[0.28em] uppercase font-bold mb-1
            ${state === 'done' ? 'text-gold-2' : ''}
            ${state === 'cur' ? 'text-ha-red' : ''}
            ${state === 'lock' ? 'text-off-white/35' : ''}
          `}
        >
          {/* Status dot */}
          <div
            className={`
              w-[5px] h-[5px] rounded-full
              ${state === 'done' ? 'bg-gold-2' : ''}
              ${state === 'cur' ? 'bg-ha-red shadow-[0_0_6px_var(--ha-red)]' : ''}
              ${state === 'lock' ? 'bg-off-white/35' : ''}
            `}
          />

          {/* Status text */}
          {state === 'done' && 'Declassified'}
          {state === 'cur' && 'Active Briefing'}
          {state === 'lock' && 'Classified'}
        </div>

        {/* Title */}
        <h3
          className={`
            font-serif text-sm font-bold italic leading-tight mb-1
            ${state === 'lock' ? 'text-off-white/50' : 'text-off-white'}
          `}
        >
          {lesson.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-2 font-mono text-[7.5px] text-off-white/50 tracking-[0.08em]">
          <span>{lesson.subtitle || lesson.narrativeArc}</span>
          <span className="text-off-white/30">·</span>
          <span>{lesson.duration}</span>
          {state !== 'lock' && (
            <>
              <span className="text-off-white/30">·</span>
              <span className={state === 'cur' ? 'text-ha-red font-bold' : 'text-gold-2 font-bold'}>
                +{lesson.xpReward} XP
              </span>
            </>
          )}
        </div>

        {/* Description (only for current lesson) */}
        {state === 'cur' && lesson.description && (
          <p className="font-sans text-[9.5px] text-off-white/70 leading-relaxed mt-1 line-clamp-2">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Action indicator */}
      <div className="flex-shrink-0 flex items-center justify-center w-6">
        {state === 'done' && (
          <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
            <Check size={12} className="text-success" />
          </div>
        )}
        {state === 'cur' && (
          <div className="w-6 h-6 rounded-full bg-ha-red flex items-center justify-center shadow-[0_0_12px_rgba(205,14,20,0.5)]">
            <Play size={10} className="text-off-white ml-0.5" fill="currentColor" />
          </div>
        )}
        {state === 'lock' && (
          <Lock size={14} className="text-off-white/30" />
        )}
      </div>
    </motion.button>
  );
}
