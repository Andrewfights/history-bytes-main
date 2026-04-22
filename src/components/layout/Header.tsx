/**
 * Header - Desktop navigation
 * Matches BottomNav: Home, Campaign, Learn, Arcade, Watch
 * Profile is accessed via avatar button (not in nav)
 */

import { Flame, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { TabType } from '@/types';
import { HistoryLogo } from '@/components/brand';

// Custom SVG icons matching BottomNav (24x24 viewBox, 1.8 stroke)
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={1.8}>
    <path d="M4 12L12 4L20 12M6 10V20H18V10" />
  </svg>
);

const CampaignIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="8" />
    <path d="M9 9l6 6M9 15l6-6" />
  </svg>
);

const LearnIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={1.8}>
    <path d="M5 4L5 20L12 18L19 20L19 4L12 6Z" />
    <path d="M12 6V18" />
  </svg>
);

const ArcadeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={1.8}>
    <rect x="3" y="7" width="18" height="12" rx="2" />
    <path d="M7 12h4M9 10v4" />
    <circle cx="15" cy="11" r=".8" fill="currentColor" />
    <circle cx="17" cy="13" r=".8" fill="currentColor" />
  </svg>
);

const WatchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current stroke-none">
    <path d="M6 4V20L20 12Z" />
  </svg>
);

// Nav configuration - matches BottomNav exactly
// Order: Home | Campaign | Learn | Arcade | Watch
interface NavItem {
  id: TabType;
  label: string;
  Icon: () => JSX.Element;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'journey', label: 'Campaign', Icon: CampaignIcon },
  { id: 'learn', label: 'Learn', Icon: LearnIcon },
  { id: 'arcade', label: 'Arcade', Icon: ArcadeIcon },
  { id: 'watch', label: 'Watch', Icon: WatchIcon },
];

export function Header() {
  const { user, activeTab, setActiveTab } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-xl border-b border-off-white/[0.06]">
      <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
        {/* Logo */}
        <HistoryLogo variant="full" size="md" withUnderline={true} className="shrink-0" />

        {/* Desktop nav - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? 'text-gold-2 bg-gold-2/10'
                    : 'text-off-white/50 hover:text-off-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-gold-2 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side - Streak badge + Profile avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak badge */}
          <motion.div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-2/10 border border-gold-2/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flame size={14} className="text-gold-2" />
            <span className="font-mono text-xs font-semibold text-gold-2">{user.streak}</span>
          </motion.div>

          {/* Profile avatar button - NOT in nav per design spec */}
          <motion.button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center hover:border-gold-2/30 hover:bg-ink-lift/80 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Profile"
          >
            <User size={16} className="text-off-white/60" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
