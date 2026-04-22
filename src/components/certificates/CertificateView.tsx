/**
 * CertificateView - Full parchment diploma view
 * Design: History Academy Dark v2 - Certificate View
 * Desktop: Centered diploma + actions grid below
 * Mobile: Stacked diploma + share + details + stats + next step
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Share2,
  Printer,
  Link2,
  Download,
  ChevronRight,
  Check,
  Copy,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface CertificateData {
  id: string;
  credentialId: string;
  title: string;
  recipientName: string;
  instructor: string;
  instructorTitle?: string;
  faculty: string;
  issuedDate: string;
  totalXp: number;
  // Performance stats
  accuracy?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  timeSpent?: string;
  trophiesEarned?: number;
  // Next step
  nextCourse?: {
    type: string;
    title: string;
    description: string;
  };
}

interface CertificateViewProps {
  certificate: CertificateData;
  onBack: () => void;
  onShare?: () => void;
  onNextCourse?: () => void;
  className?: string;
}

export function CertificateView({
  certificate,
  onBack,
  onShare,
  onNextCourse,
  className,
}: CertificateViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    const url = `https://historyacademy.com/certificates/${certificate.credentialId}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://historyacademy.com/certificates/${certificate.credentialId}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=Earned my ${certificate.title} certificate from History Academy!&url=https://historyacademy.com/certificates/${certificate.credentialId}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn('min-h-screen bg-void', className)}>
      {/* ═══════════ DESKTOP NAV ═══════════ */}
      <nav className="hidden md:flex relative z-10 items-center justify-between px-10 py-3.5 bg-ink/85 backdrop-blur-xl border-b border-off-white/[0.06]">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-ink-lift border border-gold-2/15 rounded-full text-off-white/70 hover:text-gold-2 hover:border-gold-2/30 transition-all"
          >
            <ArrowLeft size={11} />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-semibold">
              Back to Learn
            </span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 pl-5 border-l border-off-white/[0.08]">
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 280 280" className="w-6 h-6">
                <defs>
                  <linearGradient id="gl-cert" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F6E355" />
                    <stop offset="100%" stopColor="#B2641F" />
                  </linearGradient>
                  <linearGradient id="gr-cert" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#B2641F" />
                    <stop offset="100%" stopColor="#E6AB2A" />
                  </linearGradient>
                  <linearGradient id="gc-cert" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#F6E355" />
                    <stop offset="100%" stopColor="#E6AB2A" />
                  </linearGradient>
                </defs>
                <polygon points="40,30 105,30 105,250 40,250" fill="url(#gl-cert)" />
                <polygon points="40,30 105,30 120,15 55,15" fill="#F6E355" />
                <polygon points="105,30 105,250 120,235 120,15" fill="#B2641F" />
                <polygon points="175,30 240,30 240,250 175,250" fill="url(#gr-cert)" />
                <polygon points="175,30 240,30 255,15 190,15" fill="#F6E355" />
                <polygon points="175,30 175,250 160,235 160,15 190,15 175,30" fill="#B2641F" />
                <polygon points="105,120 175,120 175,160 105,160" fill="url(#gc-cert)" />
                <polygon points="105,120 175,120 160,105 120,105" fill="#F6E355" />
              </svg>
              <div className="w-6 h-0.5 bg-ha-red" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[13px] font-bold text-off-white tracking-[0.02em] uppercase">
                History
              </span>
              <span className="font-display text-[9px] font-semibold text-off-white tracking-[0.18em] uppercase mt-0.5">
                Academy
              </span>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="font-mono text-[10px] tracking-[0.2em] text-off-white/50 uppercase font-semibold">
            Learn · <span className="text-gold-2">Certificate</span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-deep" />
      </nav>

      {/* ═══════════ MOBILE HEADER ═══════════ */}
      <header className="md:hidden bg-void border-b border-off-white/[0.06] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center text-off-white/70"
          >
            <ArrowLeft size={12} />
          </button>
          <div className="text-center flex-1 px-3">
            <div className="font-mono text-[7.5px] tracking-[0.28em] text-off-white/50 uppercase font-bold mb-0.5">
              Credential
            </div>
            <h1 className="font-serif text-[13px] font-bold italic text-off-white line-clamp-1">
              {certificate.title}
            </h1>
          </div>
          <button
            onClick={onShare}
            className="w-7 h-7 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center text-gold-2"
          >
            <Share2 size={12} />
          </button>
        </div>
      </header>

      {/* ═══════════ DESKTOP HERO ═══════════ */}
      <div className="hidden md:block text-center py-8 max-w-[1400px] mx-auto relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-ha-red" />
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <span className="w-[30px] h-px bg-gold-deep" />
          <span className="font-mono text-[10px] tracking-[0.45em] text-gold-2 uppercase font-bold">
            Credential Earned
          </span>
          <span className="w-[30px] h-px bg-gold-deep" />
        </div>
        <h1 className="font-serif text-[36px] font-bold italic text-off-white leading-none mb-1.5">
          {certificate.title}
        </h1>
        <div className="font-mono text-[11px] text-off-white/50 tracking-[0.15em] uppercase font-semibold">
          Academy Certificate · {certificate.issuedDate}
        </div>
      </div>

      {/* ═══════════ MOBILE HERO ═══════════ */}
      <div className="md:hidden px-4 py-5 text-center relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-ha-red" />
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <span className="w-6 h-px bg-gold-deep" />
          <span className="font-mono text-[9px] tracking-[0.4em] text-gold-2 uppercase font-bold">
            Credential Earned
          </span>
          <span className="w-6 h-px bg-gold-deep" />
        </div>
        <h2 className="font-serif text-[22px] font-bold italic text-off-white leading-none mb-1">
          {certificate.title}
        </h2>
        <div className="font-mono text-[9px] text-off-white/50 tracking-[0.15em] uppercase font-semibold pb-3">
          Academy · {certificate.issuedDate}
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="md:max-w-[1400px] md:mx-auto md:px-10 px-4 pb-20 md:pb-16">
        {/* ─── DIPLOMA ─── */}
        <div className="max-w-[960px] mx-auto mb-6 md:mb-7">
          <div
            className="diploma relative bg-cream rounded-[4px] overflow-hidden"
            style={{
              aspectRatio: '11 / 8.5',
              boxShadow:
                '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(106,58,18,0.2), inset 0 0 120px rgba(106,58,18,0.08)',
            }}
          >
            {/* Parchment texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[4px]"
              style={{
                background: `
                  radial-gradient(ellipse at 20% 30%, rgba(180,140,90,0.08), transparent 50%),
                  radial-gradient(ellipse at 80% 70%, rgba(138,90,30,0.06), transparent 50%),
                  radial-gradient(ellipse at 50% 50%, rgba(230,171,42,0.04), transparent 70%)
                `,
              }}
            />

            {/* Double-line ornamental border */}
            <div className="absolute inset-[18px] md:inset-[18px] border-2 border-gold-deep pointer-events-none rounded-[2px]" />
            <div className="absolute inset-[24px] md:inset-[24px] border border-gold-deep/40 pointer-events-none rounded-[2px]" />

            {/* Corner flourishes */}
            <CornerFlourish position="tl" />
            <CornerFlourish position="tr" />
            <CornerFlourish position="br" />
            <CornerFlourish position="bl" />

            {/* Inner content */}
            <div className="relative z-[2] h-full flex flex-col p-[clamp(26px,6%,58px)] md:p-[clamp(32px,6%,58px)]">
              {/* Header */}
              <div className="text-center mb-[clamp(14px,3%,22px)]">
                {/* Crest */}
                <div className="flex justify-center mb-2.5">
                  <AcademyCrest className="w-[clamp(32px,5.5%,44px)] h-[clamp(32px,5.5%,44px)]" />
                </div>
                <div className="font-mono text-[clamp(8px,1.5%,10px)] tracking-[0.55em] text-gold-deep font-bold uppercase mb-2">
                  ◆ The History Channel ◆
                </div>
                <div className="font-display text-[clamp(12px,2.2%,16px)] font-bold text-ink-warm tracking-[0.35em] uppercase mb-1">
                  History Academy
                </div>
                <div className="font-calligraphy text-[clamp(9px,1.7%,12px)] italic text-gold-deep tracking-[0.15em]">
                  Est. MMXXVI · Founded on the record
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3.5 my-[clamp(10px,1.8%,16px)] text-gold-deep">
                <div className="flex-1 max-w-[180px] h-px bg-gradient-to-r from-transparent to-gold-deep" />
                <span className="text-[10px] tracking-[6px]">◆ ◆ ◆</span>
                <div className="flex-1 max-w-[180px] h-px bg-gradient-to-l from-transparent to-gold-deep" />
              </div>

              {/* Body */}
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="font-calligraphy text-[clamp(14px,2.6%,18px)] italic text-ink-deep mb-[clamp(12px,2%,18px)] tracking-[0.02em]">
                  This certifies that
                </div>
                <div className="font-serif text-[clamp(34px,7.2%,56px)] font-bold text-ink-warm leading-none mb-[clamp(14px,2.4%,22px)] tracking-[-0.01em]">
                  {certificate.recipientName}
                </div>
                <div className="font-calligraphy text-[clamp(13px,2.4%,17px)] italic text-ink-deep mb-[clamp(10px,1.8%,14px)] leading-[1.5] max-w-[520px] mx-auto">
                  having completed the required coursework, research, and final examination in the Faculty of {certificate.faculty} is hereby granted this certificate in
                </div>
                <div className="font-display text-[clamp(20px,3.8%,30px)] font-bold text-ink-warm leading-[1.05] tracking-[0.02em] uppercase mb-1.5">
                  {certificate.title}
                </div>
                <div className="font-calligraphy text-[clamp(11px,2%,14px)] italic text-gold-deep">
                  Instructor · {certificate.instructor}{certificate.instructorTitle && ` · ${certificate.instructorTitle}`}
                </div>
              </div>

              {/* Footer */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-[clamp(16px,4%,44px)] items-end pt-[clamp(12px,2.4%,22px)] mt-auto">
                {/* Signature */}
                <div className="text-left">
                  <div className="w-full h-px bg-ink-warm/40 mb-1.5" />
                  <div className="font-calligraphy text-[clamp(15px,3%,22px)] italic text-ink-warm font-semibold -translate-y-1.5">
                    {certificate.instructor.split(' ').pop()}
                  </div>
                  <div className="font-mono text-[clamp(7px,1.3%,9px)] tracking-[0.25em] text-ink-deep uppercase font-bold">
                    Instructor
                  </div>
                  {certificate.instructorTitle && (
                    <div className="font-calligraphy text-[clamp(9px,1.7%,12px)] italic text-gold-deep mt-0.5">
                      {certificate.instructorTitle}
                    </div>
                  )}
                </div>

                {/* Wax Seal */}
                <WaxSeal className="w-[clamp(68px,13%,96px)] h-[clamp(68px,13%,96px)]" />

                {/* Credential */}
                <div className="text-right">
                  <div className="w-full h-px bg-ink-warm/40 mb-1.5" />
                  <div className="font-mono text-[clamp(7px,1.3%,9px)] tracking-[0.25em] text-ink-deep uppercase font-bold mb-1">
                    Credential ID
                  </div>
                  <div className="font-calligraphy text-[clamp(11px,2%,14px)] text-ink-warm font-semibold">
                    {certificate.credentialId}
                  </div>
                  <div className="font-calligraphy text-[clamp(10px,1.8%,13px)] italic text-gold-deep">
                    Awarded {certificate.issuedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE PRIMARY SHARE ─── */}
        <button
          onClick={handleLinkedIn}
          className="md:hidden w-full bg-ha-red text-off-white py-3.5 flex items-center justify-center gap-2.5 relative mb-4"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
          <LinkedInIcon className="w-[13px] h-[13px]" />
          <span className="font-display text-[12px] font-bold uppercase tracking-[0.18em]">
            Share to LinkedIn
          </span>
        </button>

        {/* ─── MOBILE SECONDARY ACTIONS ─── */}
        <div className="md:hidden grid grid-cols-4 gap-1.5 mb-5">
          <ActionButton icon={<XIcon />} label="X" onClick={handleTwitter} />
          <ActionButton icon={<Download size={14} />} label="PDF" />
          <ActionButton icon={<Link2 size={14} />} label="Copy" onClick={handleCopyLink} />
          <ActionButton icon={<Printer size={14} />} label="Print" onClick={handlePrint} />
        </div>

        {/* ─── DESKTOP SHARE CARD ─── */}
        <div className="hidden md:block max-w-[1100px] mx-auto mb-4">
          <div className="bg-ink-lift border border-gold-2/15 rounded-[10px] overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-deep via-gold-1 to-gold-deep" />
            <div className="px-[18px] py-3.5 border-b border-off-white/[0.08] flex justify-between items-center">
              <div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-1">
                  ◆ Share & Export
                </div>
                <div className="font-serif text-[17px] font-bold italic text-off-white">
                  Frame it. Post it. Print it.
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2">
              <ShareButton
                icon={<LinkedInIcon />}
                label="Share to LinkedIn"
                onClick={handleLinkedIn}
                variant="primary"
              />
              <ShareButton
                icon={<Printer size={15} />}
                label="Print Diploma"
                onClick={handlePrint}
                variant="outline"
              />
              <ShareButton icon={<XIcon />} label="X / Post" onClick={handleTwitter} />
              <ShareButton icon={<Download size={15} />} label="PDF" />
              <ShareButton
                icon={copied ? <Check size={15} /> : <Link2 size={15} />}
                label={copied ? 'Copied!' : 'Copy Link'}
                onClick={handleCopyLink}
              />
            </div>
          </div>
        </div>

        {/* ─── INFO ROW (Desktop: 3-col, Mobile: stacked) ─── */}
        <div className="md:max-w-[1100px] md:mx-auto md:grid md:grid-cols-[1.2fr_1fr_1.2fr] md:gap-4 space-y-4 md:space-y-0">
          {/* Credential Details */}
          <div className="bg-ink-lift border border-gold-2/15 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-off-white/[0.08]">
              <div className="font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-1">
                ◆ Credential Details
              </div>
              <div className="font-serif text-[17px] font-bold italic text-off-white">
                Verified record.
              </div>
            </div>
            <CredRow label="ID" value={certificate.credentialId} copyable />
            <CredRow label="Issued" value={certificate.issuedDate} />
            <CredRow label="Instructor" value={certificate.instructor} />
            <CredRow label="Faculty" value={certificate.faculty} />
            <CredRow label="Total XP" value={`+${certificate.totalXp.toLocaleString()} XP`} gold />
            <div className="px-4 py-2.5 bg-ha-success/[0.06] border-t border-ha-success/15 flex items-center gap-2">
              <Check size={11} className="text-ha-success" />
              <span className="font-mono text-[9px] tracking-[0.15em] text-ha-success uppercase font-bold">
                Verified · historyacademy.com/verify
              </span>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-ink-lift border border-gold-2/15 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-off-white/[0.08]">
              <div className="font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-1">
                ◆ Your Performance
              </div>
              <div className="font-serif text-[17px] font-bold italic text-off-white">
                Course record.
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <StatCell
                value={certificate.accuracy ? `${certificate.accuracy}%` : '—'}
                label="Accuracy"
                color="green"
              />
              <StatCell
                value={
                  certificate.lessonsCompleted
                    ? `${certificate.lessonsCompleted}/${certificate.totalLessons}`
                    : '—'
                }
                label="Lessons"
              />
              <StatCell value={certificate.timeSpent || '—'} label="Time Spent" />
              <StatCell
                value={certificate.trophiesEarned?.toString() || '—'}
                label="Trophies"
                color="gold"
              />
            </div>
          </div>

          {/* Next Step */}
          <div className="bg-ink-lift border border-gold-2/15 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-off-white/[0.08]">
              <div className="font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-1">
                ◆ Keep Going
              </div>
              <div className="font-serif text-[17px] font-bold italic text-off-white">
                Next on the syllabus.
              </div>
            </div>
            <div className="p-4">
              {certificate.nextCourse ? (
                <button
                  onClick={onNextCourse}
                  className="w-full flex items-center gap-3 p-3 bg-charcoal border border-gold-2/15 rounded-lg relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />
                  <div
                    className="w-11 h-11 rounded-md flex-shrink-0 ml-1.5 border border-gold-2/15"
                    style={{
                      background: `
                        radial-gradient(ellipse at 50% 40%, rgba(178,100,31,0.4), transparent 60%),
                        linear-gradient(135deg, #4a2818, #1a0804)
                      `,
                    }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-mono text-[8px] tracking-[0.25em] text-gold-2 uppercase font-bold mb-0.5">
                      {certificate.nextCourse.type}
                    </div>
                    <div className="font-serif text-[13px] font-bold italic text-off-white leading-tight mb-0.5">
                      {certificate.nextCourse.title}
                    </div>
                    <div className="font-body text-[10px] text-off-white/70">
                      {certificate.nextCourse.description}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gold-2 flex-shrink-0" />
                </button>
              ) : (
                <div className="text-center py-4 text-off-white/50 font-mono text-[11px]">
                  All courses completed!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════ HELPER COMPONENTS ═══════════

function CornerFlourish({ position }: { position: 'tl' | 'tr' | 'br' | 'bl' }) {
  const rotations = { tl: '', tr: 'rotate(90deg)', br: 'rotate(180deg)', bl: 'rotate(270deg)' };
  const positions = {
    tl: 'top-[10px] left-[10px]',
    tr: 'top-[10px] right-[10px]',
    br: 'bottom-[10px] right-[10px]',
    bl: 'bottom-[10px] left-[10px]',
  };

  return (
    <div
      className={cn('absolute w-[46px] h-[46px] z-[3] pointer-events-none', positions[position])}
      style={{ transform: rotations[position] }}
    >
      <svg viewBox="0 0 46 46" className="w-full h-full text-gold-deep">
        <path d="M2 20V2H20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 30 Q2 16 16 16 Q30 16 30 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="6" cy="6" r="1.2" fill="currentColor" />
        <path d="M10 10 L14 14 M14 10 L10 14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}

function AcademyCrest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className}>
      <path
        d="M22 2 C10 2 4 10 4 22 C4 34 12 42 22 42 C32 42 40 34 40 22 C40 10 34 2 22 2Z"
        fill="none"
        stroke="#6A3A12"
        strokeWidth="1.2"
      />
      <path
        d="M8 22 Q8 12 14 10 Q12 16 14 22"
        fill="none"
        stroke="#B2641F"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M36 22 Q36 12 30 10 Q32 16 30 22"
        fill="none"
        stroke="#B2641F"
        strokeWidth="1"
        opacity="0.5"
      />
      <polygon points="14,12 19,12 19,32 14,32" fill="#B2641F" />
      <polygon points="25,12 30,12 30,32 25,32" fill="#B2641F" />
      <polygon points="19,19 25,19 25,25 19,25" fill="#6A3A12" />
    </svg>
  );
}

function WaxSeal({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Splatter effects */}
      <div
        className="absolute -top-1 -left-0.5 w-3 h-2 rounded-full blur-[1px]"
        style={{ background: 'radial-gradient(circle, #8a0a0e 40%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-1.5 -right-1 w-4 h-2.5 rounded-full blur-[1px]"
        style={{ background: 'radial-gradient(circle, #8a0a0e 40%, transparent 70%)' }}
      />

      {/* Outer seal */}
      <div
        className="absolute inset-0 rounded-full border-2 border-gold-deep"
        style={{
          background: 'radial-gradient(circle at 30% 25%, #e82020 0%, #8a0a0e 60%, #5a0205 100%)',
          boxShadow:
            '0 6px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,100,100,0.3)',
        }}
      />

      {/* Inner ring */}
      <div className="absolute inset-[8px] rounded-full border border-dashed border-gold-1/50 flex items-center justify-center">
        <span
          className="font-serif text-[clamp(22px,45%,34px)] font-bold italic text-gold-1"
          style={{ textShadow: '0 2px 3px rgba(0,0,0,0.6)' }}
        >
          H
        </span>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 px-1.5 bg-ink-lift border border-gold-2/15 rounded-lg text-off-white"
    >
      <span className="text-gold-2">{icon}</span>
      <span className="font-mono text-[7px] tracking-[0.18em] uppercase font-bold text-off-white/70">
        {label}
      </span>
    </button>
  );
}

function ShareButton({
  icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'outline';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all whitespace-nowrap',
        variant === 'primary' &&
          'bg-ha-red border-ha-red text-off-white relative hover:bg-ha-red-deep',
        variant === 'outline' &&
          'bg-charcoal border-gold-2/30 text-gold-2 relative hover:bg-gold-2/[0.08]',
        variant === 'default' &&
          'bg-charcoal border-gold-2/15 text-off-white hover:border-gold-2 hover:text-gold-2'
      )}
    >
      {(variant === 'primary' || variant === 'outline') && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2 pointer-events-none" />
        </>
      )}
      <span className={variant === 'default' ? 'text-gold-2' : ''}>{icon}</span>
      <span
        className={cn(
          'font-mono text-[9px] tracking-[0.2em] uppercase font-bold',
          (variant === 'primary' || variant === 'outline') &&
            'font-display text-[11px] tracking-[0.15em]'
        )}
      >
        {label}
      </span>
    </button>
  );
}

function CredRow({
  label,
  value,
  gold,
  copyable,
}: {
  label: string;
  value: string;
  gold?: boolean;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
  };

  return (
    <div className="px-4 py-2.5 flex justify-between items-center border-b border-off-white/[0.06] last:border-b-0">
      <span className="font-mono text-[8.5px] tracking-[0.22em] text-off-white/50 uppercase font-semibold">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'font-mono text-[11px] font-semibold tracking-[0.05em]',
            gold ? 'text-gold-2' : 'text-off-white'
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="w-6 h-6 rounded-full bg-charcoal border border-gold-2/15 flex items-center justify-center text-off-white/50 hover:text-gold-2 hover:border-gold-2/30 transition-colors"
          >
            <Copy size={9} />
          </button>
        )}
      </div>
    </div>
  );
}

function StatCell({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color?: 'gold' | 'green';
}) {
  return (
    <div className="p-2.5 bg-charcoal/40 border border-gold-2/15 rounded-md relative">
      <div className="absolute top-0 left-3 w-3.5 h-[1.5px] bg-gold-2" />
      <div
        className={cn(
          'font-display text-[22px] font-bold leading-none mt-1',
          color === 'gold' && 'text-gold-2',
          color === 'green' && 'text-ha-success',
          !color && 'text-off-white'
        )}
      >
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[0.18em] text-off-white/50 uppercase font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn('w-[15px] h-[15px]', className)}>
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V10h2.6v8zM7 8.7A1.5 1.5 0 1 1 7 5.8a1.5 1.5 0 0 1 0 3zM18.3 18h-2.6v-4.3c0-1-.4-1.7-1.3-1.7a1.4 1.4 0 0 0-1.3 1v5H10.5v-8h2.5v1a2.8 2.8 0 0 1 2.5-1.3c1.8 0 3 1.2 3 3.6V18z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn('w-[14px] h-[14px]', className)}>
      <path d="M18 2h3l-7 8 8 12h-6l-5-7-5 7H2l7-9L2 2h6l4 6z" />
    </svg>
  );
}

export default CertificateView;
