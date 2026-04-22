/**
 * FacultyCard - Instructor portrait card for Learn section
 * Shows era tag, portrait, name, role, course count, and rating
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star, User } from 'lucide-react';

export interface Instructor {
  id: string;
  name: string;
  title: string;
  role: string;
  era: string;
  courseCount: number;
  rating: number;
  imageUrl?: string;
}

interface FacultyCardProps {
  instructor: Instructor;
  onClick?: () => void;
  className?: string;
}

export function FacultyCard({ instructor, onClick, className }: FacultyCardProps) {
  const { name, title, role, era, courseCount, rating, imageUrl } = instructor;

  return (
    <div
      onClick={onClick}
      className={cn(
        'faculty-card flex-shrink-0 w-[150px] bg-ink-lift border border-border-gold rounded-xl overflow-hidden',
        'cursor-pointer transition-all duration-200 hover:border-gold-2/30 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Portrait area */}
      <div className="relative h-[130px] overflow-hidden bg-gradient-to-b from-[#3a2818] to-[#0a0604]">
        {/* Era tag */}
        <div className="absolute top-2 left-2 z-10">
          <span className="font-mono text-[7px] tracking-[0.2em] text-gold-2/90 uppercase bg-void/70 px-1.5 py-0.5 rounded">
            {era}
          </span>
        </div>

        {/* Spotlight effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(230,171,42,0.2), transparent 60%)',
          }}
        />

        {/* Portrait */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* Silhouette placeholder */}
            <div
              className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[55%] h-[85%] rounded-[45%_45%_10%_10%]"
              style={{
                background: 'radial-gradient(ellipse at 50% 25%, rgba(120,80,40,0.55), rgba(40,30,20,0.9))',
              }}
            >
              <div
                className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[42%] h-[32%] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(200,160,120,0.55), rgba(120,90,60,0.25))',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 relative">
        {/* Red accent line */}
        <div className="absolute top-0 left-0 w-[22px] h-[1.5px] bg-ha-red" />

        {/* Title */}
        <div className="font-mono text-[7px] text-text-3 tracking-wide uppercase mb-1 mt-1">
          {title}
        </div>

        {/* Name */}
        <h3 className="font-serif text-[13px] font-bold italic text-off-white leading-tight mb-0.5">
          {name}
        </h3>

        {/* Role */}
        <div className="font-body text-[10px] text-gold-2 italic mb-2 line-clamp-1">
          {role}
        </div>

        {/* Stats */}
        <div className="font-mono text-[8px] text-text-3">
          <span className="text-gold-2 font-bold text-[11px] mr-0.5">{courseCount}</span>
          Courses
          <span className="mx-1.5">·</span>
          <span className="text-gold-2 font-bold text-[11px] mr-0.5">{rating}★</span>
          Rating
        </div>
      </div>
    </div>
  );
}

export default FacultyCard;
