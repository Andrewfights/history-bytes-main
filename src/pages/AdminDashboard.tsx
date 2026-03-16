import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BookOpen, Gamepad2, Users, FileText, Layers, ArrowRight, Wand2, Cloud, CloudOff, Loader2, CheckCircle2 } from 'lucide-react';
import { arcs } from '@/data/journeyData';
import { courses, units, lessons } from '@/data/courseData';
import { anachronismScenes, connectionsPuzzles, mapMysteries, artifactCases, causeEffectPairs } from '@/data/arcadeData';
import { spiritGuides } from '@/data/spiritGuidesData';
import { isFirebaseConfigured } from '@/lib/firebase';
import { migrateAllToFirebase, type MigrationResult } from '@/lib/migrateToFirebase';
import { toast } from 'sonner';

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
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const firebaseConfigured = isFirebaseConfigured();

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

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateAllToFirebase();
      setMigrationResult(result);

      if (result.success) {
        toast.success('Migration completed successfully!');
      } else {
        toast.error(`Migration completed with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Check console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

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

      {/* Cloud Sync Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-8 rounded-xl p-4 border ${
          firebaseConfigured
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        {/* Debug info - shows what env vars are detected */}
        {!firebaseConfigured && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono">
            <p className="text-red-400 font-bold mb-2">Firebase Debug Info:</p>
            <p>API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
            <p>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
            <p>Storage Bucket: {import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</p>
            <p className="mt-2 text-amber-400">Make sure you redeployed after adding env vars in Vercel!</p>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {firebaseConfigured ? (
              <Cloud size={20} className="text-green-400 mt-0.5" />
            ) : (
              <CloudOff size={20} className="text-amber-400 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${firebaseConfigured ? 'text-green-300' : 'text-amber-200'}`}>
                {firebaseConfigured ? 'Firebase Cloud Sync Enabled' : 'Local Storage Mode'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {firebaseConfigured
                  ? 'Changes are synced to Firebase and visible to all users immediately.'
                  : 'Add Firebase environment variables to enable cloud sync.'}
              </p>
            </div>
          </div>

          {firebaseConfigured && (
            <button
              onClick={handleMigration}
              disabled={isMigrating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isMigrating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Cloud size={14} />
                  Migrate Local Data
                </>
              )}
            </button>
          )}
        </div>

        {/* Migration Result */}
        {migrationResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-green-400" />
              <span className="text-sm text-green-300">Migration Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-green-500/10 rounded px-2 py-1">
                <span className="font-medium">{migrationResult.migratedItems.eraTileOverrides}</span>
                <span className="text-muted-foreground ml-1">Era Tiles</span>
              </div>
              <div className="bg-green-500/10 rounded px-2 py-1">
                <span className="font-medium">{migrationResult.migratedItems.gameThumbnails}</span>
                <span className="text-muted-foreground ml-1">Game Thumbs</span>
              </div>
              <div className="bg-green-500/10 rounded px-2 py-1">
                <span className="font-medium">{migrationResult.migratedItems.pearlHarborMedia}</span>
                <span className="text-muted-foreground ml-1">PH Media</span>
              </div>
              <div className="bg-green-500/10 rounded px-2 py-1">
                <span className="font-medium">{migrationResult.migratedItems.ghostArmyMedia}</span>
                <span className="text-muted-foreground ml-1">GA Media</span>
              </div>
            </div>
            {migrationResult.skippedDataUrls > 0 && (
              <p className="text-xs text-amber-300 mt-2">
                {migrationResult.skippedDataUrls} local files skipped (upload via editors to sync)
              </p>
            )}
            {migrationResult.errors.length > 0 && (
              <p className="text-xs text-red-300 mt-2">
                {migrationResult.errors.length} errors occurred. Check console for details.
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
