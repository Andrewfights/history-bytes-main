/**
 * Debug Assets Page - Test Firebase connection and asset loading
 * Access at /debug-assets
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Video,
  Image as ImageIcon,
  RefreshCw,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  subscribeToWW2ModuleAssets,
  type FirestoreWW2ModuleAssets,
  type PreModuleVideoConfig,
  type PostModuleVideoConfig,
} from '@/lib/firestore';
import { PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';

interface AssetStatus {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export default function DebugAssets() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<FirestoreWW2ModuleAssets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const firebaseConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      setError('Firebase is not configured');
      return;
    }

    console.log('[DebugAssets] Subscribing to WW2 module assets...');

    const unsubscribe = subscribeToWW2ModuleAssets((data) => {
      console.log('[DebugAssets] Received data:', data);
      setAssets(data);
      setLoading(false);
      if (!data) {
        setError('No data returned from Firestore - document may not exist');
      } else {
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [firebaseConfigured, refreshKey]);

  const getPreModuleVideoStatus = (beatId: string): AssetStatus => {
    const config = assets?.preModuleVideos?.[beatId];
    if (!config) {
      return { type: 'warning', message: 'Not configured' };
    }
    if (!config.enabled) {
      return { type: 'warning', message: 'Disabled' };
    }
    if (!config.videoUrl) {
      return { type: 'error', message: 'No URL' };
    }
    return { type: 'success', message: 'Ready' };
  };

  const getPostModuleVideoStatus = (beatId: string): AssetStatus => {
    const config = assets?.postModuleVideos?.[beatId];
    if (!config) {
      return { type: 'warning', message: 'Not configured' };
    }
    if (!config.enabled) {
      return { type: 'warning', message: 'Disabled' };
    }
    if (!config.videoUrl) {
      return { type: 'error', message: 'No URL' };
    }
    return { type: 'success', message: 'Ready' };
  };

  const getBeatMediaStatus = (beatId: string): AssetStatus => {
    const media = assets?.beatMedia?.[beatId];
    if (!media || Object.keys(media).length === 0) {
      return { type: 'warning', message: 'No media' };
    }
    const count = Object.keys(media).length;
    return { type: 'success', message: `${count} asset${count > 1 ? 's' : ''}` };
  };

  const StatusIcon = ({ status }: { status: AssetStatus }) => {
    if (status.type === 'success') return <CheckCircle2 className="text-green-500" size={16} />;
    if (status.type === 'warning') return <AlertTriangle className="text-yellow-500" size={16} />;
    return <XCircle className="text-red-500" size={16} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Asset Debug Panel</h1>
      <p className="text-white/60 mb-6">Verify Firebase connection and asset loading</p>

      {/* Firebase Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <Database size={20} />
          <h2 className="font-bold">Firebase Connection</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {firebaseConfigured ? (
              <CheckCircle2 className="text-green-500" size={16} />
            ) : (
              <XCircle className="text-red-500" size={16} />
            )}
            <span>Firebase configured: {firebaseConfigured ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="animate-spin text-blue-500" size={16} />
            ) : assets ? (
              <CheckCircle2 className="text-green-500" size={16} />
            ) : (
              <XCircle className="text-red-500" size={16} />
            )}
            <span>
              Firestore data: {loading ? 'Loading...' : assets ? 'Connected' : 'Not found'}
            </span>
          </div>
          {error && (
            <div className="text-red-400 bg-red-500/10 p-2 rounded mt-2">
              {error}
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Stats */}
      {assets && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Object.keys(assets.preModuleVideos || {}).filter(k => assets.preModuleVideos?.[k]?.enabled).length}
            </div>
            <div className="text-xs text-purple-300">Pre-Videos</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Object.keys(assets.postModuleVideos || {}).filter(k => assets.postModuleVideos?.[k]?.enabled).length}
            </div>
            <div className="text-xs text-blue-300">Post-Videos</div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-center">
            <div className="text-2xl font-bold text-green-400">
              {Object.keys(assets.beatMedia || {}).length}
            </div>
            <div className="text-xs text-green-300">Beat Media</div>
          </div>
        </motion.div>
      )}

      {/* Beat-by-Beat Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="font-bold flex items-center gap-2 mb-3">
          <Video size={20} />
          Beat Asset Status
        </h2>

        {PEARL_HARBOR_LESSONS.map((lesson, index) => {
          const preStatus = getPreModuleVideoStatus(lesson.id);
          const postStatus = getPostModuleVideoStatus(lesson.id);
          const mediaStatus = getBeatMediaStatus(lesson.id);
          const preConfig = assets?.preModuleVideos?.[lesson.id];
          const postConfig = assets?.postModuleVideos?.[lesson.id];
          const beatMedia = assets?.beatMedia?.[lesson.id];

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lesson.icon}</span>
                  <div>
                    <span className="font-medium text-sm">Beat {lesson.number}</span>
                    <span className="text-white/50 text-xs ml-2">{lesson.id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Pre-Module Video */}
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={preStatus} />
                  <span className="text-white/70">Pre:</span>
                  <span className={preStatus.type === 'success' ? 'text-green-400' : 'text-white/50'}>
                    {preStatus.message}
                  </span>
                </div>

                {/* Post-Module Video */}
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={postStatus} />
                  <span className="text-white/70">Post:</span>
                  <span className={postStatus.type === 'success' ? 'text-green-400' : 'text-white/50'}>
                    {postStatus.message}
                  </span>
                </div>

                {/* Beat Media */}
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={mediaStatus} />
                  <span className="text-white/70">Media:</span>
                  <span className={mediaStatus.type === 'success' ? 'text-green-400' : 'text-white/50'}>
                    {mediaStatus.message}
                  </span>
                </div>
              </div>

              {/* Show URLs if configured */}
              {(preConfig?.videoUrl || postConfig?.videoUrl || beatMedia) && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs space-y-1">
                  {preConfig?.videoUrl && (
                    <div className="text-purple-400 truncate">
                      Pre: {preConfig.videoUrl.substring(0, 50)}...
                    </div>
                  )}
                  {postConfig?.videoUrl && (
                    <div className="text-blue-400 truncate">
                      Post: {postConfig.videoUrl.substring(0, 50)}...
                    </div>
                  )}
                  {beatMedia && Object.entries(beatMedia).map(([key, url]) => (
                    <div key={key} className="text-green-400 truncate">
                      {key}: {String(url).substring(0, 50)}...
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Raw Data (collapsible) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-white/60 hover:text-white">
          View Raw Firestore Data
        </summary>
        <pre className="mt-2 p-4 rounded-xl bg-black/50 text-xs overflow-auto max-h-96">
          {JSON.stringify(assets, null, 2)}
        </pre>
      </details>
    </div>
  );
}
