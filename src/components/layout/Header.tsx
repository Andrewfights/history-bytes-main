/**
 * Header - Desktop top navigation
 * Design: History Academy Dark v2 - Home Nav
 * H Logo | HOME CAMPAIGN LEARN ARCADE WATCH | Streak + Avatar
 */

import { Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TabType } from '@/types';
import { ThemeToggle } from './ThemeToggle';

// Nav configuration
interface NavItem {
  id: TabType;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'journey', label: 'Campaign' },
  { id: 'learn', label: 'Learn' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'watch', label: 'Watch' },
];

export function Header() {
  const { user, activeTab, setActiveTab } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-xl border-b border-off-white/[0.06]">
      <div className="flex items-center justify-between px-6 lg:px-10 h-[52px] max-w-[1400px] mx-auto">
        {/* ═══ LEFT: Logo + Nav Links ═══ */}
        <div className="flex items-center gap-8">
          {/* H Logo with stacked text */}
          <div className="flex items-center gap-2.5">
            {/* H Icon with red bar */}
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 280 280" className="w-[26px] h-[26px]">
                <defs>
                  <linearGradient id="gl-header" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F6E355"/>
                    <stop offset="100%" stopColor="#B2641F"/>
                  </linearGradient>
                  <linearGradient id="gr-header" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#B2641F"/>
                    <stop offset="100%" stopColor="#E6AB2A"/>
                  </linearGradient>
                  <linearGradient id="gc-header" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#F6E355"/>
                    <stop offset="100%" stopColor="#E6AB2A"/>
                  </linearGradient>
                </defs>
                <polygon points="40,30 105,30 105,250 40,250" fill="url(#gl-header)"/>
                <polygon points="40,30 105,30 120,15 55,15" fill="#F6E355"/>
                <polygon points="105,30 105,250 120,235 120,15" fill="#B2641F"/>
                <polygon points="175,30 240,30 240,250 175,250" fill="url(#gr-header)"/>
                <polygon points="175,30 240,30 255,15 190,15" fill="#F6E355"/>
                <polygon points="175,30 175,250 160,235 160,15 190,15 175,30" fill="#B2641F"/>
                <polygon points="105,120 175,120 175,160 105,160" fill="url(#gc-header)"/>
                <polygon points="105,120 175,120 160,105 120,105" fill="#F6E355"/>
              </svg>
              <div className="w-[26px] h-[2px] bg-ha-red" />
            </div>

            {/* Stacked text: HISTORY / ACADEMY */}
            <div className="flex flex-col leading-none">
              <span className="font-display text-[13px] font-bold text-off-white tracking-[0.02em] uppercase">
                History
              </span>
              <span className="font-display text-[9px] font-semibold text-off-white tracking-[0.18em] uppercase mt-0.5">
                Academy
              </span>
            </div>
          </div>

          {/* Desktop nav links - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`font-mono text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-150 ${
                    isActive
                      ? 'text-gold-2'
                      : 'text-off-white/50 hover:text-off-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ═══ RIGHT: Streak chip + Avatar ═══ */}
        <div className="flex items-center gap-2.5">
          {/* Streak chip */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-ink-lift border border-gold-2/20 rounded-full"
          >
            <Flame
              size={12}
              className="text-gold-2"
              style={{ animation: 'flicker 3s infinite' }}
            />
            <span className="font-mono text-[10px] font-bold text-gold-2 tracking-[0.1em]">
              {user.streak}
            </span>
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Avatar button */}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-2 shadow-[0_0_0_2px_rgba(230,171,42,0.15)] overflow-hidden"
            aria-label="Profile"
          >
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'Profile'}
                className="w-full h-full object-cover"
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
