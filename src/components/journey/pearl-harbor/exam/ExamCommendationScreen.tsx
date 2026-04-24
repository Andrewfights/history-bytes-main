/**
 * ExamCommendationScreen - Certificate / Award screen
 * State 04: Parchment certificate with medal, citation, stats,
 * wax seal, signatures, and action buttons
 */

import { motion } from 'framer-motion';
import { ArrowRight, Download, Share2, Medal, X } from 'lucide-react';
import type { WW2Host } from '@/types';
import type { ExamScoreResult, ScoreTier } from './types';

interface ExamCommendationScreenProps {
  host: WW2Host;
  userName: string;
  result: ExamScoreResult;
  onReturnToCampaign: () => void;
  onClose: () => void;
}

// Get rank title based on tier
function getRankTitle(tier: ScoreTier): string {
  switch (tier) {
    case 'perfect':
      return 'Master Historian';
    case 'expert':
      return 'Expert';
    case 'historian':
      return 'Specialist';
    case 'review':
      return 'Trainee';
    default:
      return 'Participant';
  }
}

export function ExamCommendationScreen({
  host,
  userName,
  result,
  onReturnToCampaign,
  onClose,
}: ExamCommendationScreenProps) {
  const rankTitle = getRankTitle(result.tier);

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pearl Harbor Commendation',
          text: `I earned the Pearl Harbor ${rankTitle} commendation with ${result.percentage}% accuracy!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  // Handle download (placeholder for PDF generation)
  const handleDownload = () => {
    // TODO: Implement PDF generation
    console.log('Download certificate');
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-void">
      {/* Header */}
      <div className="exam-header">
        <div className="exam-header-top">
          <div
            className="exam-header-kick"
            style={{ color: 'var(--gold-1)' }}
          >
            <span
              className="exam-header-kick-dot"
              style={{
                background: 'var(--gold-2)',
                boxShadow: '0 0 6px var(--gold-2)',
                animation: 'none',
              }}
            />
            Complete
          </div>
          <div className="exam-header-file">
            No. <em>001428</em>
          </div>
          <button className="exam-header-close" onClick={onClose}>
            <X size={11} strokeWidth={2.4} />
          </button>
        </div>
        <div className="exam-header-title-wrap">
          <div className="exam-header-title">
            Pearl Harbor <em>Commendation</em>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="exam-body flex-1 overflow-y-auto">
        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="exam-cert"
        >
          <div className="exam-cert-dashed" />

          {/* Medal */}
          <div className="exam-cert-medal-wrap">
            <div className="exam-cert-medal">
              <div className="exam-cert-medal-ribbon" />
              <motion.div
                initial={{ y: -20, scale: 0.6, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
                className="exam-cert-medal-coin"
              >
                <Medal size={26} />
              </motion.div>
            </div>
          </div>

          {/* Header */}
          <div className="exam-cert-header">
            <div className="exam-cert-sup-kick">◆ Commendation ◆</div>
            <h1 className="exam-cert-main-title">
              Pearl Harbor <em>{rankTitle}</em>
            </h1>
            <div className="exam-cert-sub-title">
              For exceptional performance in the Final Examination
            </div>
          </div>

          {/* Citation */}
          <div className="exam-cert-citation">
            <div className="exam-cert-awarded">Awarded to</div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="exam-cert-name"
            >
              {userName}
            </motion.div>
            <div className="exam-cert-name-rule" />
            <div className="exam-cert-citation-body">
              in recognition of <em>mastery over the events of December 7, 1941</em>,
              for completing the Final Examination with distinction.
            </div>
          </div>

          {/* Stats */}
          <div className="exam-cert-stats">
            <div className="exam-cert-stat">
              <div className="exam-cert-stat-val">
                {result.correct}/{result.total}
              </div>
              <div className="exam-cert-stat-lbl">Correct</div>
            </div>
            <div className="exam-cert-stat">
              <div className="exam-cert-stat-val">{result.percentage}%</div>
              <div className="exam-cert-stat-lbl">Accuracy</div>
            </div>
            <div className="exam-cert-stat">
              <div className="exam-cert-stat-val">+{result.xp}</div>
              <div className="exam-cert-stat-lbl">XP</div>
            </div>
            <div className="exam-cert-stat">
              <div className="exam-cert-stat-val">{rankTitle}</div>
              <div className="exam-cert-stat-lbl">Rank</div>
            </div>
          </div>

          {/* Signature row */}
          <div className="exam-cert-sig-row">
            <div className="exam-cert-seal">
              <div className="exam-cert-seal-txt">
                <span className="top">H.A.</span>
                <span className="mid">1941</span>
                <span className="bot">Sigillum</span>
              </div>
            </div>
            <div className="exam-cert-sig-pair">
              <div className="exam-cert-sig-block">
                <div className="exam-cert-sig-name">{host.name}</div>
                <div className="exam-cert-sig-rule" />
                <div className="exam-cert-sig-role">Chief Examiner</div>
              </div>
              <div className="exam-cert-sig-block">
                <div className="exam-cert-sig-name">E. R. Munro</div>
                <div className="exam-cert-sig-rule" />
                <div className="exam-cert-sig-role">Academy Director</div>
              </div>
            </div>
          </div>

          {/* Stamps */}
          <motion.div
            initial={{ scale: 2, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 0.82 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.4 }}
            className="exam-cert-stamp"
          >
            Certified
          </motion.div>
          <div className="exam-cert-id">
            File · <em>HA-PH-1941</em>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="exam-cert-actions"
        >
          <button className="exam-btn primary" onClick={onReturnToCampaign}>
            <ArrowRight size={12} strokeWidth={2.6} />
            Return to Campaign
          </button>
          <button className="exam-btn secondary" onClick={handleDownload}>
            <Download size={12} strokeWidth={2.6} />
            Download PDF
          </button>
          <button className="exam-btn secondary" onClick={handleShare}>
            <Share2 size={12} strokeWidth={2.6} />
            Share
          </button>
        </motion.div>
      </div>
    </div>
  );
}
