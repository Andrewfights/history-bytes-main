/**
 * EraTile - Era card with available/sealed states
 * WW2 is unlocked (available), all others are sealed with CLASSIFIED stamp
 * Design based on all_eras_locked.html design doc
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, User } from 'lucide-react';
import { HistoricalEra, getEraImageUrl } from '@/data/historicalEras';
import { useLiveEraTileOverrides } from '@/hooks/useLiveData';

interface EraTileProps {
  era: HistoricalEra;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
}

// Era-specific data for guide names and chapter counts
const ERA_META: Record<string, { guide: string; chapters: number; thumbLetter: string }> = {
  'ww2': { guide: 'War Correspondent', chapters: 10, thumbLetter: 'II' },
  'french-revolution': { guide: 'Marie', chapters: 3, thumbLetter: 'F' },
  'ancient-rome': { guide: 'Julius Caesar', chapters: 6, thumbLetter: 'R' },
  'civil-war': { guide: 'Mr. Lincoln', chapters: 5, thumbLetter: 'A' },
  'mesopotamia': { guide: 'Hammurabi', chapters: 4, thumbLetter: 'M' },
  'ancient-egypt': { guide: 'Cleopatra', chapters: 6, thumbLetter: 'E' },
  'medieval': { guide: 'Eleanor of Aquitaine', chapters: 5, thumbLetter: 'M' },
  'ancient-greece': { guide: 'Socrates', chapters: 5, thumbLetter: 'Ω' },
  'renaissance': { guide: 'Leonardo', chapters: 4, thumbLetter: 'R' },
  'industrial-revolution': { guide: 'James Watt', chapters: 4, thumbLetter: '⚙' },
  'exploration': { guide: 'Magellan', chapters: 5, thumbLetter: '⚓' },
  'ww1': { guide: 'Sassoon', chapters: 8, thumbLetter: 'I' },
  'cold-war': { guide: 'Agent K', chapters: 7, thumbLetter: 'C' },
  'american-revolution': { guide: 'Washington', chapters: 5, thumbLetter: 'A' },
  'vikings': { guide: 'Erik the Red', chapters: 4, thumbLetter: 'V' },
};

// Thumbnail gradient colors per era
const THUMB_GRADIENTS: Record<string, string> = {
  'ww2': 'radial-gradient(circle at 35% 30%, #8a3020, #4a1612 55%, #1a0604)',
  'french-revolution': 'radial-gradient(circle at 35% 30%, #8a2a3a, #4a1a28 55%, #1a0810)',
  'ancient-rome': 'radial-gradient(circle at 35% 30%, #a06a3a, #5a3518 55%, #2a1808)',
  'civil-war': 'radial-gradient(circle at 35% 30%, #4a5a6a, #2a384a 55%, #101820)',
  'mesopotamia': 'radial-gradient(circle at 35% 30%, #6a4a2a, #3a2a1a 55%, #180f08)',
  'ancient-egypt': 'radial-gradient(circle at 35% 30%, #b8953a, #7a5c18 55%, #2a1f08)',
  'medieval': 'radial-gradient(circle at 35% 30%, #3a4a2a, #1a2a1a 55%, #081006)',
  'ancient-greece': 'radial-gradient(circle at 35% 30%, #8a8a80, #4a4a48 55%, #1a1a18)',
  'renaissance': 'radial-gradient(circle at 35% 30%, #6a2a5a, #3a1a3a 55%, #180818)',
  'industrial-revolution': 'radial-gradient(circle at 35% 30%, #4a4a4a, #2a2a2a 55%, #0a0a0a)',
  'exploration': 'radial-gradient(circle at 35% 30%, #2a4a6a, #1a2a4a 55%, #081020)',
  'ww1': 'radial-gradient(circle at 35% 30%, #6a6a2a, #4a4a1a 55%, #1a1a08)',
  'cold-war': 'radial-gradient(circle at 35% 30%, #3a4a5a, #1a2a3a 55%, #08101a)',
  'american-revolution': 'radial-gradient(circle at 35% 30%, #2a3a5a, #1a2a4a 55%, #081020)',
  'vikings': 'radial-gradient(circle at 35% 30%, #3a3a3a, #1a1a1a 55%, #0a0a0a)',
};

export function EraTile({ era, onClick }: EraTileProps) {
  const meta = ERA_META[era.id] || { guide: 'Guide', chapters: 4, thumbLetter: era.name[0] };
  const thumbGradient = THUMB_GRADIENTS[era.id] || 'radial-gradient(circle at 35% 30%, #4a4a4a, #2a2a2a 55%, #0a0a0a)';

  if (era.isAvailable) {
    // AVAILABLE ERA (WW2)
    return (
      <motion.button
        onClick={onClick}
        className="relative w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl text-left cursor-pointer group overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, rgba(40,24,8,0.55), rgba(20,14,6,0.35) 40%, rgba(19,21,24,1))',
          border: '1px solid rgba(230,171,42,0.35)',
          boxShadow: '0 0 0 1px rgba(230,171,42,0.1), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,171,42,0.08)',
        }}
        whileHover={{
          x: 2,
          borderColor: 'rgba(230,171,42,1)',
          boxShadow: '0 0 0 1px rgba(230,171,42,0.3), 0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(230,171,42,0.12)',
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Gold rail on left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ background: 'linear-gradient(180deg, #F6E355, #B2641F)' }}
        />

        {/* ACTIVE NOW pill */}
        <div
          className="absolute -top-1.5 left-4 px-2 py-0.5 rounded-sm z-10"
          style={{
            background: '#E6AB2A',
            color: '#1a0b02',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '7px',
            letterSpacing: '0.28em',
            fontWeight: 700,
            textTransform: 'uppercase',
            boxShadow: '0 2px 6px rgba(230,171,42,0.4)',
          }}
        >
          <span style={{ color: '#8A0A0E', marginRight: '2px' }}>◆</span> Active Now
        </div>

        {/* Thumbnail medallion */}
        <div
          className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
          style={{
            border: '1.5px solid #E6AB2A',
            boxShadow: 'inset 0 1px 2px rgba(255,220,170,0.25), 0 3px 8px rgba(230,171,42,0.25), 0 0 0 2px rgba(10,6,2,0.8), 0 0 0 3px rgba(230,171,42,0.35)',
            background: thumbGradient,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center font-serif italic font-bold text-xl text-off-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
            {meta.thumbLetter}
          </div>
          {/* Sparkle highlight */}
          <div
            className="absolute"
            style={{
              top: '8%',
              left: '18%',
              width: '35%',
              height: '30%',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 40% 40%, rgba(255,240,200,0.5), transparent 65%)',
              mixBlendMode: 'screen',
            }}
          />
        </div>

        {/* Body content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="font-serif italic font-bold text-lg text-off-white leading-tight truncate">
            {era.name.split(' ').map((word, i, arr) =>
              i === arr.length - 1
                ? <em key={i} className="text-gold-2">{word}</em>
                : <span key={i}>{word} </span>
            )}
          </h3>
          <p className="text-xs text-off-white/70 truncate">{era.subtitle}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <div className="flex items-center gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.22em', color: '#E6AB2A', textTransform: 'uppercase', fontWeight: 700 }}>
              <User size={10} strokeWidth={1.8} />
              {meta.guide}
            </div>
            <span className="text-off-white/30" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '7px' }}>·</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.22em', color: 'rgba(242,238,230,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
              {meta.chapters} Chapters
            </span>
          </div>
        </div>

        {/* Gold arrow */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:translate-x-1"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(230,171,42,0.25), rgba(60,35,10,0.8))',
            border: '1px solid #E6AB2A',
          }}
        >
          <ChevronRight size={14} className="text-gold-2" strokeWidth={2.2} />
        </div>
      </motion.button>
    );
  }

  // SEALED ERA (locked)
  return (
    <div
      className="relative w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl text-left cursor-not-allowed overflow-hidden"
      style={{
        background: 'rgba(15,15,18,0.6)',
        border: '1px solid rgba(242,238,230,0.08)',
      }}
    >
      {/* Dim red rail on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
        style={{ background: 'rgba(138,10,14,0.45)' }}
      />

      {/* Thumbnail medallion with grayscale + CLASSIFIED stamp */}
      <div
        className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
        style={{
          border: '1.5px solid rgba(178,100,31,0.2)',
          boxShadow: 'inset 0 1px 2px rgba(255,220,170,0.15), 0 3px 6px rgba(0,0,0,0.5)',
          background: thumbGradient,
          filter: 'grayscale(100%) brightness(0.5) contrast(1.1)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center font-serif italic font-bold text-xl" style={{ color: 'rgba(255,240,220,0.55)', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
          {meta.thumbLetter}
        </div>
        {/* Darkening overlay */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
      </div>

      {/* CLASSIFIED stamp - positioned over thumbnail area */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%) rotate(-16deg)',
          fontFamily: "'Oswald', sans-serif",
          fontSize: '7px',
          fontWeight: 900,
          letterSpacing: '0.18em',
          color: 'rgba(255,60,60,0.95)',
          textTransform: 'uppercase',
          padding: '2px 4px',
          border: '1.2px solid rgba(255,60,60,0.85)',
          background: 'rgba(20,0,0,0.35)',
          textShadow: '0 0 4px rgba(138,10,14,0.6)',
          whiteSpace: 'nowrap',
          boxShadow: '0 0 0 1px rgba(255,60,60,0.15), inset 0 0 4px rgba(138,10,14,0.3)',
        }}
      >
        <div className="absolute -top-[2px] left-[15%] right-[15%] h-[0.5px]" style={{ background: 'rgba(255,60,60,0.7)' }} />
        <div className="absolute -bottom-[2px] left-[15%] right-[15%] h-[0.5px]" style={{ background: 'rgba(255,60,60,0.7)' }} />
        Classified
      </div>

      {/* Body content - dimmed */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 pl-1">
        <h3 className="font-serif italic font-bold text-lg leading-tight truncate" style={{ color: 'rgba(242,238,230,0.48)' }}>
          {era.name.split(' ').map((word, i, arr) =>
            i === arr.length - 1
              ? <em key={i} style={{ color: 'rgba(230,171,42,0.42)' }}>{word}</em>
              : <span key={i}>{word} </span>
          )}
        </h3>
        <p className="text-xs truncate" style={{ color: 'rgba(242,238,230,0.32)' }}>{era.subtitle}</p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <div className="flex items-center gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.22em', color: 'rgba(230,171,42,0.35)', textTransform: 'uppercase', fontWeight: 700 }}>
            <User size={10} strokeWidth={1.8} />
            {meta.guide}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '7px', color: 'rgba(242,238,230,0.2)' }}>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', letterSpacing: '0.22em', color: 'rgba(242,238,230,0.25)', textTransform: 'uppercase', fontWeight: 600 }}>
            {meta.chapters} Chapters
          </span>
        </div>
      </div>

      {/* SEALED badge */}
      <div
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 flex-shrink-0"
        style={{
          background: 'rgba(20,5,5,0.7)',
          border: '1px solid rgba(138,10,14,0.5)',
          borderRadius: '2px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '7px',
          letterSpacing: '0.25em',
          color: 'rgba(255,100,100,0.8)',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {/* Corner brackets */}
        <div className="absolute -top-[1px] -left-[1px] w-[5px] h-[5px] border-t border-l" style={{ borderColor: 'rgba(255,60,60,0.5)' }} />
        <div className="absolute -bottom-[1px] -right-[1px] w-[5px] h-[5px] border-b border-r" style={{ borderColor: 'rgba(255,60,60,0.5)' }} />
        <Lock size={9} strokeWidth={2} />
        Sealed
      </div>
    </div>
  );
}
