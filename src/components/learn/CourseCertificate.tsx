import { motion } from 'framer-motion';
import { Download, Share2, ChevronRight, Trophy, Star, X } from 'lucide-react';

interface CourseCertificateProps {
  studentName: string;
  courseName: string;
  courseSubtitle?: string;
  dateAwarded: string;
  totalLessons: number;
  totalUnits: number;
  totalXP: number;
  accuracy?: number;
  distinction?: string;
  certificateId?: string;
  directorName?: string;
  facultyName?: string;
  facultyTitle?: string;
  onClose?: () => void;
  onNextCourse?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

// Flourish corner SVG
function CornerFlourish() {
  return (
    <svg viewBox="0 0 52 52" fill="none" className="w-full h-full">
      <path
        d="M4 48 C4 28 12 12 26 4 C18 8 10 16 6 28 C4 36 4 44 4 48 Z"
        fill="var(--gold-3)"
        opacity="0.8"
      />
      <path
        d="M2 50 L2 2 L50 2"
        stroke="var(--gold-2)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="8" cy="8" r="3" fill="var(--gold-2)" />
    </svg>
  );
}

// Wax seal SVG
function WaxSeal() {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <radialGradient id="waxGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#E84046" />
          <stop offset="40%" stopColor="#CD0E14" />
          <stop offset="100%" stopColor="#8A0A0E" />
        </radialGradient>
        <filter id="waxShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
        </filter>
      </defs>
      {/* Wax drips */}
      <path
        d="M40 5 C25 10 15 25 12 40 C10 48 12 55 18 58 C24 62 35 60 40 52 C45 60 56 62 62 58 C68 55 70 48 68 40 C65 25 55 10 40 5"
        fill="url(#waxGradient)"
        filter="url(#waxShadow)"
      />
      {/* Inner ring */}
      <circle cx="40" cy="40" r="24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      {/* Center emblem */}
      <text x="40" y="36" textAnchor="middle" fill="#fdf0d0" fontSize="10" fontFamily="serif" fontWeight="bold">
        H·A
      </text>
      <text x="40" y="50" textAnchor="middle" fill="#fdf0d0" fontSize="7" fontFamily="serif">
        SIGILLUM
      </text>
      {/* Highlight */}
      <ellipse cx="30" cy="30" rx="6" ry="4" fill="rgba(255,255,255,0.15)" transform="rotate(-30 30 30)" />
    </svg>
  );
}

export function CourseCertificate({
  studentName,
  courseName,
  courseSubtitle,
  dateAwarded,
  totalLessons,
  totalUnits,
  totalXP,
  accuracy = 92,
  distinction = 'Honors',
  certificateId = 'HA-XXXX-000000',
  directorName = 'Edward R. Munro',
  facultyName = 'Dr. Helen Carver',
  facultyTitle = 'Faculty Historian',
  onClose,
  onNextCourse,
  onDownload,
  onShare,
}: CourseCertificateProps) {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Top bar */}
      {onClose && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-xs text-[var(--gold-2)] font-mono uppercase tracking-wider">
            <Trophy size={14} />
            <span>Course Complete · Certificate</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Certificate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="cert-paper max-w-2xl w-full">
          {/* Corner flourishes */}
          <span className="absolute top-3 left-3 w-12 h-12">
            <CornerFlourish />
          </span>
          <span className="absolute top-3 right-3 w-12 h-12 -scale-x-100">
            <CornerFlourish />
          </span>
          <span className="absolute bottom-3 left-3 w-12 h-12 -scale-y-100">
            <CornerFlourish />
          </span>
          <span className="absolute bottom-3 right-3 w-12 h-12 scale-x-[-1] scale-y-[-1]">
            <CornerFlourish />
          </span>

          {/* Content */}
          <div className="relative z-10 text-center py-4">
            {/* Seal */}
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[linear-gradient(180deg,var(--gold-1),var(--gold-2),var(--gold-3))] flex items-center justify-center shadow-lg">
              <Trophy size={24} className="text-[var(--parch-ink-dp)]" />
            </div>

            {/* Kick */}
            <div className="text-[9px] font-mono text-[var(--parch-ink-med)] uppercase tracking-[0.35em] mb-2">
              History Academy
            </div>

            {/* Title */}
            <h1 className="font-['Playfair_Display',Georgia,serif] text-2xl md:text-3xl text-[var(--parch-ink)] mb-5">
              Certificate of <em className="text-[var(--parch-red-dp)]">Completion</em>
            </h1>

            {/* Awarded to */}
            <p className="text-[11px] font-[var(--font-typewriter)] text-[var(--parch-ink-med)] uppercase tracking-wider mb-2">
              This is to certify that
            </p>

            {/* Student name */}
            <div className="cert-name mb-3">
              {studentName}
            </div>

            {/* For which */}
            <p className="text-[11px] font-[var(--font-typewriter)] text-[var(--parch-ink-med)] uppercase tracking-wider mb-2">
              has successfully completed the course
            </p>

            {/* Course name */}
            <h2 className="font-['Playfair_Display',Georgia,serif] italic text-xl text-[var(--parch-ink)] mb-1">
              {courseName}
            </h2>
            {courseSubtitle && (
              <p className="text-sm font-[var(--font-calligraphy)] italic text-[var(--parch-ink-med)] mb-3">
                {courseSubtitle}
              </p>
            )}

            {/* Divider with star */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="w-16 h-px bg-[var(--parch-ink-med)]/30" />
              <Star size={14} className="text-[var(--gold-3)]" fill="currentColor" />
              <div className="w-16 h-px bg-[var(--parch-ink-med)]/30" />
            </div>

            {/* Description */}
            <p className="text-[11px] font-[var(--font-typewriter)] text-[var(--parch-ink-med)] max-w-sm mx-auto mb-4 leading-relaxed">
              comprising <strong>{totalLessons} lessons</strong> across <strong>{totalUnits} units</strong> and earning <strong>{totalXP} XP</strong>, with distinction and a full complement of archival artifacts.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="text-center">
                <div className="text-[8px] font-mono text-[var(--parch-ink-med)] uppercase tracking-wider mb-0.5">
                  Date Awarded
                </div>
                <div className="font-[var(--font-stat)] italic text-sm text-[var(--parch-ink)]">
                  {dateAwarded}
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--parch-ink-med)]/30" />
              <div className="text-center">
                <div className="text-[8px] font-mono text-[var(--parch-ink-med)] uppercase tracking-wider mb-0.5">
                  Accuracy
                </div>
                <div className="font-[var(--font-stat)] italic text-sm text-[var(--parch-ink)]">
                  {accuracy}%
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--parch-ink-med)]/30" />
              <div className="text-center">
                <div className="text-[8px] font-mono text-[var(--parch-ink-med)] uppercase tracking-wider mb-0.5">
                  Distinction
                </div>
                <div className="font-[var(--font-stat)] italic text-sm text-[var(--parch-red-dp)]">
                  {distinction}
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex items-end justify-center gap-12 mb-4">
              <div className="cert-sig">
                <div className="cert-sig-line">{directorName}</div>
                <div className="cert-sig-rule" />
                <div className="cert-sig-name">{directorName}</div>
                <div className="cert-sig-title">Director, History Academy</div>
              </div>
              <div className="cert-sig">
                <div className="cert-sig-line alt">{facultyName}</div>
                <div className="cert-sig-rule" />
                <div className="cert-sig-name">{facultyName}</div>
                <div className="cert-sig-title">{facultyTitle}</div>
              </div>
            </div>
          </div>

          {/* Wax seal */}
          <div className="absolute bottom-6 right-6 w-16 h-16">
            <WaxSeal />
          </div>

          {/* Certificate ID */}
          <div className="absolute bottom-4 left-4 text-[8px] font-mono text-[var(--parch-ink-med)]/60 tracking-wider">
            No. {certificateId}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {onDownload && (
          <button
            onClick={onDownload}
            className="btn-primary-lg"
          >
            <Download size={14} strokeWidth={2.5} />
            Download PDF
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-[var(--border-gold)] rounded-md font-[var(--font-display)] text-xs uppercase tracking-wider text-[var(--text-2)] hover:border-[var(--gold-2)] hover:text-[var(--gold-2)] transition-colors bg-[rgba(0,0,0,0.3)]"
          >
            <Share2 size={14} />
            Share
          </button>
        )}
        {onNextCourse && (
          <button
            onClick={onNextCourse}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-[var(--border-gold)] rounded-md font-[var(--font-display)] text-xs uppercase tracking-wider text-[var(--text-2)] hover:border-[var(--gold-2)] hover:text-[var(--gold-2)] transition-colors bg-[rgba(0,0,0,0.3)]"
          >
            Next Course
            <ChevronRight size={14} />
          </button>
        )}
      </motion.div>
    </div>
  );
}
