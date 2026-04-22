import { Flame, User, Home, Compass, BookOpen, Gamepad2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { TabType } from '@/types';
import { HistoryLogo } from '@/components/brand';

// Match BottomNav order: Home | Campaign | Profile | Learn | Arcade
const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Campaign', icon: Compass },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2 },
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
          {navItems.map(({ id, label, icon: Icon }) => {
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
                <Icon size={16} strokeWidth={1.5} className="transition-all duration-200" />
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

        {/* Right side - Streak badge + Profile */}
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

          {/* Profile button */}
          <motion.button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-ink-lift border border-off-white/10 flex items-center justify-center hover:border-gold-2/30 hover:bg-ink-lift/80 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={16} className="text-off-white/60" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
