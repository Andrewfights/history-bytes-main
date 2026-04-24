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
}

export function DossierCard({ lesson, state, index, onClick }: DossierCardProps) {
  const isClickable = state !== 'lock';
  const lessonNumber = String(index + 1).padStart(2, '0');

  // Get state-specific styles
  const getCardStyles = () => {
    switch (state) {
      case 'done':
        return 'border-gold-2/25 bg-gradient-to-b from-[rgba(30,24,18,0.7)] to-card hover:border-gold-2/45 hover:translate-x-0.5';
      case 'cur':
        return 'border-2 border-ha-red bg-gradient-to-br from-[rgba(58,28,16,0.5)] to-card shadow-[0_10px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(205,14,20,0.18)]';
      case 'upcoming':
        return 'border-gold-2/15 bg-card opacity-90 hover:opacity-100 hover:border-gold-2/35';
      case 'lock':
        return 'opacity-55 bg-[rgba(15,12,8,0.6)] border-off-white/10 cursor-not-allowed';
      default:
        return 'border-gold-2/15 bg-card';
    }
  };

  // Get fastener color
  const getFastenerStyle = () => {
    switch (state) {
      case 'done':
        return 'background: radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F); border-color: #6A3A12;';
      case 'cur':
        return 'background: radial-gradient(circle at 30% 30%, #ff8a90, #CD0E14 50%, #8A0A0E); border-color: #8A0A0E; box-shadow: 0 0 8px rgba(205,14,20,0.5);';
      case 'upcoming':
        return 'background: radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F); border-color: #6A3A12;';
      case 'lock':
        return 'background: #2a2018; border-color: #1a1008;';
      default:
        return 'background: radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F); border-color: #6A3A12;';
    }
  };

  // Get stamp text and color
  const getStamp = () => {
    switch (state) {
      case 'done':
        return { text: 'Declassified', className: 'text-gold-2 border-gold-2 bg-gold-2/15 shadow-[0_0_10px_rgba(230,171,42,0.2)]' };
      case 'cur':
        return { text: 'Active Briefing', className: 'text-off-white bg-ha-red border-ha-red shadow-[0_0_14px_rgba(205,14,20,0.55)]' };
      case 'upcoming':
        return { text: 'Awaiting Review', className: 'text-gold-2 border-gold-2 bg-transparent' };
      case 'lock':
        return { text: 'Classified', className: 'text-off-white/50 border-off-white/30 bg-black/50' };
      default:
        return { text: '', className: '' };
    }
  };

  // Get label dot and text
  const getLabelInfo = () => {
    switch (state) {
      case 'done':
        return { dotClass: 'bg-gold-2 shadow-[0_0_6px_rgba(230,171,42,0.5)]', textClass: 'text-gold-2', text: 'Declassified' };
      case 'cur':
        return { dotClass: 'bg-ha-red shadow-[0_0_8px_var(--ha-red)] animate-pulse', textClass: 'text-[#E84046]', text: 'Active Briefing' };
      case 'upcoming':
        return { dotClass: 'bg-off-white/50', textClass: 'text-off-white/70', text: 'Up Next' };
      case 'lock':
        return { dotClass: 'bg-off-white/30', textClass: 'text-off-white/40', text: 'Classified' };
      default:
        return { dotClass: '', textClass: '', text: '' };
    }
  };

  const stamp = getStamp();
  const label = getLabelInfo();

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        w-full text-left relative z-10 rounded overflow-hidden border
        grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr]
        transition-all duration-200
        ${getCardStyles()}
        ${isClickable ? 'cursor-pointer' : ''}
      `}
    >
      {/* Brass corner fasteners */}
      {['top-[6px] left-[6px]', 'top-[6px] right-[6px]', 'bottom-[6px] left-[6px]', 'bottom-[6px] right-[6px]'].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-[9px] h-[9px] rounded-full z-10 border`}
          style={{
            ...Object.fromEntries(getFastenerStyle().split(';').filter(s => s.trim()).map(s => {
              const [k, v] = s.split(':');
              return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v?.trim()];
            })),
            boxShadow: state === 'lock' ? 'inset 0 -1px 1px rgba(0,0,0,0.35)' : 'inset 0 -1px 1px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.5)'
          }}
        />
      ))}

      {/* Photo cell */}
      <div
        className={`
          relative overflow-hidden border-r border-dashed border-off-white/[0.08]
          flex items-center justify-center min-h-[96px] sm:min-h-[100px]
          ${state === 'lock' ? 'grayscale brightness-50' : ''}
        `}
        style={{
          background: state === 'cur'
            ? 'radial-gradient(ellipse at 40% 30%, rgba(205,14,20,0.25), transparent 60%), linear-gradient(135deg, #3a1810, #0a0604)'
            : 'linear-gradient(135deg, #2a1810, #0a0604)'
        }}
      >
        {/* Scene silhouette placeholder */}
        {state !== 'lock' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[60%] h-[50%] rounded-lg"
              style={{
                background: 'radial-gradient(ellipse at 50% 40%, rgba(120,80,40,0.5), rgba(40,30,20,0.8))'
              }}
            />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'linear-gradient(180deg, rgba(10,8,5,0.25) 0%, rgba(10,8,5,0.15) 50%, rgba(10,8,5,0.65) 100%)'
          }}
        />

        {/* File number stamp */}
        <div
          className={`
            absolute top-2 left-2 z-[3] font-mono text-[8px] tracking-[0.28em] font-bold uppercase
            py-[3px] px-[7px] rounded-sm backdrop-blur-[3px]
            ${state === 'cur'
              ? 'text-off-white bg-ha-red border border-ha-red-deep'
              : 'text-gold-br bg-[rgba(10,8,5,0.9)] border border-gold-2/35'
            }
          `}
        >
          {lessonNumber}
        </div>

        {/* Status stamp */}
        <div
          className={`
            absolute bottom-2 right-2 z-[3] py-[3px] px-2 font-oswald font-black text-[9px]
            tracking-[0.18em] uppercase border-[1.5px] rounded-sm whitespace-nowrap
            ${stamp.className}
            ${state === 'done' ? 'rotate-[-4deg]' : ''}
          `}
        >
          {state === 'lock' && (
            <Lock size={11} className="inline-block mr-1 -mt-0.5" strokeWidth={2} />
          )}
          {stamp.text}
        </div>

        {/* Lock overlay for locked state */}
        {state === 'lock' && (
          <div className="absolute inset-0 z-[4] flex items-center justify-center pointer-events-none">
            <div className="w-[34px] h-[34px] rounded-full bg-[rgba(10,8,5,0.88)] border-[1.5px] border-off-white/30 flex items-center justify-center backdrop-blur-[4px]">
              <Lock size={15} className="text-off-white/50" strokeWidth={2} />
            </div>
          </div>
        )}
      </div>

      {/* Body cell */}
      <div className="p-3 sm:p-4 flex flex-col justify-center gap-1 min-w-0">
        {/* Label row */}
        <div className={`flex items-center gap-[7px] font-mono text-[8px] tracking-[0.32em] uppercase font-bold ${label.textClass}`}>
          <div className={`w-[6px] h-[6px] rounded-full ${label.dotClass}`} />
          {label.text}
        </div>

        {/* Title */}
        <h3
          className={`
            font-playfair italic font-bold text-[15px] sm:text-[17px] leading-[1.15] tracking-[-0.005em]
            ${state === 'lock' ? 'text-off-white/50' : 'text-off-white'}
          `}
        >
          {state === 'lock' ? (
            <>
              <span className="inline-block h-[10px] w-[100px] bg-[#1a0e06] rounded-sm align-middle" style={{ boxShadow: 'inset 0 0 0 1px rgba(138,10,14,0.3)' }} />
            </>
          ) : (
            <>
              {lesson.title.split(' ').map((word, i) => {
                // Highlight the main word (usually in italics/gold)
                const isEmphasis = lesson.title.includes('Radar') && word === 'Radar'
                  || lesson.title.includes('Infamy') && word === 'Infamy'
                  || lesson.title.includes('Harbor') && word === 'Harbor'
                  || lesson.title.includes('Code') && word === 'Code'
                  || lesson.title.includes('Voices') && word === 'Voices'
                  || lesson.title.includes('Wave') && word === 'Wave'
                  || word.toLowerCase() === 'the' ? false : true;
                return (
                  <span key={i} className={isEmphasis ? 'text-gold-2' : ''}>
                    {word}{' '}
                  </span>
                );
              })}
            </>
          )}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[8.5px] text-off-white/50 tracking-[0.12em] uppercase font-semibold items-center">
          {state === 'lock' ? (
            <>
              <span className="inline-block h-[10px] w-[80px] bg-[#1a0e06] rounded-sm align-middle" style={{ boxShadow: 'inset 0 0 0 1px rgba(138,10,14,0.3)' }} />
              <span className="text-off-white/30">·</span>
              <span>{lesson.duration}</span>
              <span className="text-off-white/30">·</span>
              <span className="text-off-white/30 line-through">+{lesson.xpReward} XP</span>
            </>
          ) : (
            <>
              <span>{lesson.subtitle || lesson.narrativeArc}</span>
              <span className="text-off-white/30">·</span>
              <span>{lesson.duration}</span>
              <span className="text-off-white/30">·</span>
              <span className={`font-bold ${state === 'cur' ? 'text-[#E84046]' : 'text-gold-2'}`}>
                +{lesson.xpReward} XP
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {(state === 'cur' || state === 'upcoming') && lesson.description && (
          <p className="font-cormorant italic text-[12.5px] sm:text-[13px] text-off-white/70 leading-[1.4] mt-1 line-clamp-2">
            {lesson.description}
          </p>
        )}
        {state === 'lock' && (
          <p className="font-cormorant italic text-[12px] text-off-white/40 leading-[1.4] mt-1">
            Complete previous lessons to declassify this briefing.
          </p>
        )}
      </div>

      {/* Right action indicator (visible on hover/mobile) */}
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
              boxShadow: '0 6px 16px rgba(205,14,20,0.4), inset 0 1px 0 rgba(255,255,255,0.25)'
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
    </motion.button>
  );
}
