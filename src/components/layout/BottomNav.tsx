import { Home, Compass, BookOpen, Gamepad2, Play } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TabType } from '@/types';
import { motion } from 'framer-motion';

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Campaign', icon: Compass },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2 },
  { id: 'watch', label: 'Watch', icon: Play },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden nav-glass border-t border-white/[0.06]">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto pb-safe">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className="relative flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-3 py-2 gap-1 no-select"
              whileTap={{ scale: 0.92 }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active indicator at top */}
              {isActive && (
                <motion.div
                  layoutId="nav-top-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-hc-red"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon
                    size={26}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -inset-3 bg-gold-primary/15 rounded-full blur-lg -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>

              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  y: isActive ? 0 : 1
                }}
                className={`text-[11px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
