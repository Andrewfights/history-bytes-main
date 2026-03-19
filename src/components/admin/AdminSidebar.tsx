import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map, BookOpen, Gamepad2, ArrowLeft, Image, Mic, Wand2, Users, HelpCircle, Compass, Shield, Trophy, Grid3X3, MousePointer2, X, Palette, Target, Tv } from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/ww2-module', label: 'WW2 Module', icon: Target, end: false },
  { path: '/admin/exam-videos', label: 'Exam Videos', icon: Tv, end: false },
  { path: '/admin/journey-management', label: 'Journey Builder', icon: Compass, end: false },
  { path: '/admin/journeys', label: 'Arc Editor', icon: Map, end: false },
  { path: '/admin/journey-ui', label: 'Journey Artwork', icon: Palette, end: false },
  { path: '/admin/maps', label: 'Map Editor', icon: MousePointer2, end: false },
  { path: '/admin/trivia', label: 'Trivia Editor', icon: HelpCircle, end: false },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen, end: false },
  { path: '/admin/arcade', label: 'Arcade', icon: Gamepad2, end: false },
  { path: '/admin/guides', label: 'Spirit Guides', icon: Users, end: false },
  { path: '/admin/ww2-guides', label: 'WW2 Guides', icon: Shield, end: false },
  { path: '/admin/era-tiles', label: 'Era Tiles', icon: Grid3X3, end: false },
  { path: '/admin/studio', label: 'Media Studio', icon: Wand2, end: false },
  { path: '/admin/media', label: 'Media Library', icon: Image, end: false },
  { path: '/admin/pantheon', label: 'Pantheon Editor', icon: Trophy, end: false },
  { path: '/admin/voices', label: 'Voices', icon: Mic, end: false },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-editorial text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Content Management</p>
        </div>
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Back to App */}
      <div className="p-3 border-t border-border">
        <NavLink
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back to App
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - always visible */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border min-h-screen flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar - slide-out drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
