import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BookOpen, Gamepad2, Users, FileText, Layers, ArrowRight, Wand2 } from 'lucide-react';
import { arcs } from '@/data/journeyData';
import { courses, units, lessons } from '@/data/courseData';
import { anachronismScenes, connectionsPuzzles, mapMysteries, artifactCases, causeEffectPairs } from '@/data/arcadeData';
import { spiritGuides } from '@/data/spiritGuidesData';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface QuickLinkProps {
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

function QuickLink({ to, title, description, icon: Icon }: QuickLinkProps) {
  return (
    <Link
      to={to}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors mt-2" />
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  // Calculate stats
  const totalChapters = arcs.reduce((sum, arc) => sum + arc.chapters.length, 0);
  const totalNodes = arcs.reduce((sum, arc) =>
    sum + arc.chapters.reduce((chSum, ch) => chSum + ch.nodes.length, 0), 0
  );
  const totalArcadeContent =
    anachronismScenes.length +
    connectionsPuzzles.length +
    mapMysteries.length +
    artifactCases.length +
    causeEffectPairs.length;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-editorial text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your History Bytes content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Journey Arcs" value={arcs.length} icon={Map} color="bg-primary" />
        <StatCard title="Chapters" value={totalChapters} icon={Layers} color="bg-emerald-500" />
        <StatCard title="Nodes" value={totalNodes} icon={FileText} color="bg-blue-500" />
        <StatCard title="Spirit Guides" value={spiritGuides.length} icon={Users} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Courses" value={courses.length} icon={BookOpen} color="bg-orange-500" />
        <StatCard title="Units" value={units.length} icon={Layers} color="bg-cyan-500" />
        <StatCard title="Lessons" value={lessons.length} icon={FileText} color="bg-rose-500" />
        <StatCard title="Arcade Items" value={totalArcadeContent} icon={Gamepad2} color="bg-amber-500" />
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Content Editors</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <QuickLink
          to="/admin/journeys"
          title="Journey Editor"
          description={`Manage ${arcs.length} arcs, ${totalChapters} chapters, and ${totalNodes} nodes`}
          icon={Map}
        />
        <QuickLink
          to="/admin/courses"
          title="Course Editor"
          description={`Manage ${courses.length} courses, ${units.length} units, and ${lessons.length} lessons`}
          icon={BookOpen}
        />
        <QuickLink
          to="/admin/arcade"
          title="Arcade Editor"
          description={`Manage ${totalArcadeContent} arcade game items across 5 game types`}
          icon={Gamepad2}
        />
        <QuickLink
          to="/admin/studio"
          title="Media Studio"
          description="Generate AI images, upload media, and create video timelines"
          icon={Wand2}
        />
        <QuickLink
          to="/admin/guides"
          title="Spirit Guides"
          description={`Manage ${spiritGuides.length} spirit guides, upload portraits, and generate AI images`}
          icon={Users}
        />
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
      >
        <p className="text-sm text-amber-200">
          <strong>Note:</strong> This is a demo admin panel. Changes are displayed in the UI but not persisted to a database.
          Backend integration coming soon.
        </p>
      </motion.div>
    </div>
  );
}
