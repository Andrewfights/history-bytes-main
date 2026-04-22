/**
 * PortraitFrame - Oval portrait frame with corner fasteners
 * Personnel file aesthetic for profile section
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface PortraitFrameProps {
  avatarUrl?: string;
  avatarEmoji?: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: {
    wrapper: 'w-16 h-20',
    oval: 'w-14 h-[70px]',
    icon: 'w-6 h-6',
    emoji: 'text-2xl',
    caption: 'text-[6px]',
  },
  md: {
    wrapper: 'w-24 h-28',
    oval: 'w-20 h-[90px]',
    icon: 'w-8 h-8',
    emoji: 'text-3xl',
    caption: 'text-[7px]',
  },
  lg: {
    wrapper: 'w-32 h-36',
    oval: 'w-28 h-[120px]',
    icon: 'w-10 h-10',
    emoji: 'text-4xl',
    caption: 'text-[8px]',
  },
};

export function PortraitFrame({
  avatarUrl,
  avatarEmoji,
  userName,
  size = 'md',
  className,
}: PortraitFrameProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn('portrait-frame relative flex flex-col items-center', className)}>
      {/* Frame with corners */}
      <div className={cn('relative', sizes.wrapper)}>
        {/* Corner fasteners */}
        <div className="portrait-corner absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-gold-2" />
        <div className="portrait-corner absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-gold-2" />
        <div className="portrait-corner absolute bottom-4 left-0 w-2 h-2 border-l-2 border-b-2 border-gold-2" />
        <div className="portrait-corner absolute bottom-4 right-0 w-2 h-2 border-r-2 border-b-2 border-gold-2" />

        {/* Oval frame */}
        <div
          className={cn(
            'portrait-oval mx-auto rounded-[50%] overflow-hidden relative',
            'border-2 border-gold-2/40',
            'bg-gradient-to-b from-[#3a2818] to-[#0a0604]',
            sizes.oval
          )}
        >
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 pointer-events-none" />

          {/* Avatar content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : avatarEmoji ? (
              <span className={cn('select-none', sizes.emoji)}>{avatarEmoji}</span>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#4a3828] to-[#1a0e04]">
                {/* Silhouette shape */}
                <div
                  className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[50%] h-[75%] rounded-[45%_45%_10%_10%]"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 25%, rgba(120,80,40,0.55), rgba(40,30,20,0.9))',
                  }}
                >
                  {/* Head circle */}
                  <div
                    className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[50%] h-[35%] rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(200,160,120,0.55), rgba(120,90,60,0.25))',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Spotlight effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(230,171,42,0.15), transparent 60%)',
            }}
          />
        </div>

        {/* Caption */}
        <div
          className={cn(
            'font-mono tracking-[0.2em] text-off-white/50 uppercase text-center mt-1.5',
            sizes.caption
          )}
        >
          &#9670; File Portrait &#9670;
        </div>
      </div>
    </div>
  );
}

export default PortraitFrame;
