import { Flame, User, Home, Compass, BookOpen, Gamepad2, Play, Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { TabType } from '@/types';
import { useTheme } from 'next-themes';

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Journey', icon: Compass },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2 },
  { id: 'watch', label: 'Watch', icon: Play },
];

export function Header() {
  const { user, activeTab, setActiveTab } = useApp();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-obsidian-900/78 backdrop-blur-[12px] border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
        {/* Logo */}
        <h1 className="font-editorial text-xl font-bold tracking-widest shrink-0">
          <span className="text-gold-highlight">HISTORY</span><span className="text-gold-primary">+</span>
        </h1>

        {/* Desktop nav - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-gold-highlight bg-gold-primary/10'
                    : 'text-ivory/54 hover:text-ivory hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-200" />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-gold-primary to-gold-highlight rounded-full shadow-[0_0_8px_rgba(198,162,79,0.4)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.div
            className="streak-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flame size={14} className="text-gold-highlight" />
            <span>{user.streak}</span>
          </motion.div>

          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:border-gold-primary/30 hover:bg-white/[0.06] transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-gold-highlight" />
            ) : (
              <Moon size={16} className="text-gold-highlight" />
            )}
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:border-gold-primary/30 hover:bg-white/[0.06] transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={16} className="text-ivory/60" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
