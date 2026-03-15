import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BookOpen, Gamepad2, ArrowLeft, Image, Mic, Wand2, Users, HelpCircle, Compass, Shield } from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/journey-management', label: 'Journey Builder', icon: Compass, end: false },
  { path: '/admin/journeys', label: 'Arc Editor', icon: Map, end: false },
  { path: '/admin/trivia', label: 'Trivia Editor', icon: HelpCircle, end: false },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen, end: false },
  { path: '/admin/arcade', label: 'Arcade', icon: Gamepad2, end: false },
  { path: '/admin/guides', label: 'Spirit Guides', icon: Users, end: false },
  { path: '/admin/ww2-guides', label: 'WW2 Guides', icon: Shield, end: false },
  { path: '/admin/studio', label: 'Media Studio', icon: Wand2, end: false },
  { path: '/admin/media', label: 'Media Library', icon: Image, end: false },
  { path: '/admin/voices', label: 'Voices', icon: Mic, end: false },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="font-editorial text-xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-xs text-muted-foreground mt-1">Content Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back to App
        </NavLink>
      </div>
    </aside>
  );
}
