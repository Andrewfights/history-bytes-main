/**
 * BottomNav - History Academy bottom navigation
 * Design spec: 5 tabs, mono labels, gold active mark
 * Profile is accessed via avatar in top bar - NOT in bottom nav
 */

import { useApp } from '@/context/AppContext';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';

// Custom SVG icons per design spec (24x24 viewBox, 1.8 stroke)
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="nav-icon">
    <path d="M4 12L12 4L20 12M6 10V20H18V10" />
  </svg>
);

const CampaignIcon = () => (
  <svg viewBox="0 0 24 24" className="nav-icon">
    <circle cx="12" cy="12" r="8" />
    <path d="M9 9l6 6M9 15l6-6" />
  </svg>
);

const LearnIcon = () => (
  <svg viewBox="0 0 24 24" className="nav-icon">
    <path d="M5 4L5 20L12 18L19 20L19 4L12 6Z" />
    <path d="M12 6V18" />
  </svg>
);

const ArcadeIcon = () => (
  <svg viewBox="0 0 24 24" className="nav-icon">
    <rect x="3" y="7" width="18" height="12" rx="2" />
    <path d="M7 12h4M9 10v4" />
    <circle cx="15" cy="11" r=".8" fill="currentColor" />
    <circle cx="17" cy="13" r=".8" fill="currentColor" />
  </svg>
);

const WatchIcon = () => (
  <svg viewBox="0 0 24 24" className="nav-icon nav-icon-filled">
    <path d="M6 4V20L20 12Z" />
  </svg>
);

// Tab configuration per design spec
// Order: Home | Campaign | Learn | Arcade | Watch
interface NavItem {
  id: TabType;
  label: string;
  a11yLabel: string;
  Icon: () => JSX.Element;
  filled?: boolean;
  badge?: 'dot' | number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', a11yLabel: 'Home', Icon: HomeIcon },
  { id: 'journey', label: 'Camp.', a11yLabel: 'Campaigns', Icon: CampaignIcon },
  { id: 'learn', label: 'Learn', a11yLabel: 'Library', Icon: LearnIcon },
  { id: 'arcade', label: 'Arcade', a11yLabel: 'Arcade', Icon: ArcadeIcon },
  { id: 'watch', label: 'Watch', a11yLabel: 'Videos', Icon: WatchIcon, filled: true },
];

interface BottomNavProps {
  badges?: Partial<Record<TabType, 'dot' | number>>;
}

export function BottomNav({ badges = {} }: BottomNavProps) {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-void border-t border-off-white/[0.08]"
      role="navigation"
      aria-label="Primary"
    >
      <div
        className="flex justify-around"
        style={{ padding: '8px 0 max(14px, env(safe-area-inset-bottom))' }}
      >
        {navItems.map(({ id, label, a11yLabel, Icon, filled }) => {
          const isActive = activeTab === id;
          const badge = badges[id];
          const badgeLabel = typeof badge === 'number' ? `, ${badge} new` : badge === 'dot' ? ', new content' : '';

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-label={`${a11yLabel}${badgeLabel}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'nav-tab relative flex flex-col items-center justify-center gap-[3px]',
                'min-w-[48px] min-h-[48px] px-1.5 py-1',
                'font-mono text-[8.5px] font-semibold tracking-[0.15em] uppercase',
                'transition-colors duration-150 ease-out',
                isActive ? 'text-gold-2' : 'text-off-white/50 hover:text-off-white/70',
                filled && 'nav-tab-filled'
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Icon */}
              <Icon />

              {/* Badge - dot */}
              {badge === 'dot' && (
                <span
                  className="absolute top-1 right-3 w-2 h-2 rounded-full bg-ha-red"
                  style={{ boxShadow: '0 0 0 1.5px var(--void)' }}
                  aria-hidden="true"
                />
              )}

              {/* Badge - count */}
              {typeof badge === 'number' && (
                <span
                  className="absolute top-0.5 right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-ha-red text-off-white font-mono text-[8px] font-bold tracking-normal flex items-center justify-center"
                  style={{ border: '1.5px solid var(--void)' }}
                  aria-hidden="true"
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}

              {/* Label */}
              <span>{label}</span>

              {/* Active indicator bar */}
              <span
                className={cn(
                  'w-6 h-0.5 rounded-sm mt-0.5 transition-colors duration-150 ease-out',
                  isActive ? 'bg-gold-2' : 'bg-transparent'
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
