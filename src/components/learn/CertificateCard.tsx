/**
 * CertificateCard - Earned certificate display with wax seal
 * Features corner flourishes and instructor/date info
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Share2, Download, Award } from 'lucide-react';

export interface Certificate {
  id: string;
  title: string;
  instructor: string;
  date: string;
  icon?: React.ReactNode;
}

interface CertificateCardProps {
  certificate: Certificate;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function CertificateCard({
  certificate,
  onShare,
  onDownload,
  className,
}: CertificateCardProps) {
  const { title, instructor, date, icon } = certificate;

  return (
    <div
      className={cn(
        'certificate-card relative bg-ink-lift border border-border-gold-hi rounded-xl p-4 overflow-hidden',
        className
      )}
    >
      {/* Corner flourishes */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-gold-2 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-gold-2 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-gold-2 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-gold-2 pointer-events-none" />

      <div className="flex gap-3 items-center">
        {/* Wax seal */}
        <div
          className={cn(
            'flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center',
            'bg-gradient-radial from-ha-red to-ha-red-deep',
            'border-2 border-gold-2',
            'shadow-md'
          )}
          style={{
            boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset 0 0 8px rgba(0,0,0,0.3)',
          }}
        >
          {icon || (
            <span className="font-serif text-[15px] font-bold italic text-gold-1 drop-shadow">
              H
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Kick label */}
          <div className="font-mono text-[7px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-0.5">
            Academy Certificate
          </div>

          {/* Title */}
          <h3 className="font-serif text-[13px] font-bold italic text-off-white leading-tight mb-1 line-clamp-1">
            {title}
          </h3>

          {/* Instructor + Date */}
          <div className="font-mono text-[9px] text-text-3 tracking-wide">
            {instructor} · {date}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 rounded-lg bg-off-white/5 hover:bg-gold-2/10 text-text-3 hover:text-gold-2 transition-colors"
            >
              <Share2 size={14} />
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 rounded-lg bg-off-white/5 hover:bg-gold-2/10 text-text-3 hover:text-gold-2 transition-colors"
            >
              <Download size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for horizontal scrolling
export function CertificateCardCompact({
  certificate,
  onClick,
  className,
}: {
  certificate: Certificate;
  onClick?: () => void;
  className?: string;
}) {
  const { title, instructor, date } = certificate;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-[180px] bg-ink-lift border border-border-gold-hi rounded-lg p-3 relative overflow-hidden cursor-pointer',
        'transition-all duration-200 hover:border-gold-2/40 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Mini corners */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2 pointer-events-none" />

      <div className="flex gap-2.5 items-center">
        {/* Mini seal */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-radial from-ha-red to-ha-red-deep border-[1.5px] border-gold-2"
        >
          <span className="font-serif text-[12px] font-bold italic text-gold-1">H</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-mono text-[6px] tracking-[0.25em] text-gold-2 uppercase font-bold mb-0.5">
            Certificate
          </div>
          <h4 className="font-serif text-[11px] font-bold italic text-off-white leading-tight line-clamp-1">
            {title}
          </h4>
          <div className="font-mono text-[7px] text-text-3 tracking-wide mt-0.5">
            {instructor}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateCard;
