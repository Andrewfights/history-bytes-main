/**
 * TheaterMediaEditor - Admin component for managing theater cinematic videos and background music
 * Allows uploading/managing media for each WW2 theater (Pearl Harbor, Normandy, etc.)
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Music2, Upload, Play, Pause, Volume2, Trash2, Save, X, CheckCircle, Loader2 } from 'lucide-react';
import { TheaterMediaConfig, updateTheaterMedia, getTheaterMedia } from '@/lib/firestore';
import { uploadFile } from '@/lib/firebaseStorage';
import { useToast } from '@/hooks/use-toast';

interface TheaterMediaEditorProps {
  theaterId: string;
  theaterName: string;
  onSave?: (config: TheaterMediaConfig) => void;
}

export function TheaterMediaEditor({
  theaterId,
  theaterName,
  onSave,
}: TheaterMediaEditorProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Media state
  const [cinematicVideoUrl, setCinematicVideoUrl] = useState<string>('');
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState<string>('');
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.1);
  const [musicFadeDuration, setMusicFadeDuration] = useState(500);

  // Upload state
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [musicUploadProgress, setMusicUploadProgress] = useState(0);

  // Preview state
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load existing config
  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      try {
        const config = await getTheaterMedia(theaterId);
        if (config) {
          setCinematicVideoUrl(config.cinematicVideoUrl || '');
          setBackgroundMusicUrl(config.backgroundMusicUrl || '');
          setBackgroundMusicVolume(config.backgroundMusicVolume ?? 0.1);
          setMusicFadeDuration(config.musicFadeDuration ?? 500);
        }
      } catch (error) {
        console.error('Failed to load theater media config:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [theaterId]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [cinematicVideoUrl, backgroundMusicUrl, backgroundMusicVolume, musicFadeDuration]);

  // Handle video upload
  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a video file (MP4, WebM, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      const result = await uploadFile(file, (progress) => {
        setVideoUploadProgress(Math.round(progress));
      });
      if (result?.url) {
        setCinematicVideoUrl(result.url);
        toast({
          title: 'Video uploaded',
          description: 'Cinematic video has been uploaded successfully.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Video upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  };

  // Handle music upload
  const handleMusicUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an audio file (MP3, WAV, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingMusic(true);
    setMusicUploadProgress(0);

    try {
      const result = await uploadFile(file, (progress) => {
        setMusicUploadProgress(Math.round(progress));
      });
      if (result?.url) {
        setBackgroundMusicUrl(result.url);
        toast({
          title: 'Music uploaded',
          description: 'Background music has been uploaded successfully.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Music upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload music. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingMusic(false);
      setMusicUploadProgress(0);
    }
  };

  // Save config
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config: TheaterMediaConfig = {
        cinematicVideoUrl: cinematicVideoUrl || undefined,
        backgroundMusicUrl: backgroundMusicUrl || undefined,
        backgroundMusicVolume,
        musicFadeDuration,
      };

      await updateTheaterMedia(theaterId, config);
      setHasChanges(false);
      onSave?.(config);

      toast({
        title: 'Settings saved',
        description: `${theaterName} media settings have been saved.`,
      });
    } catch (error) {
      console.error('Failed to save theater media config:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete video
  const handleDeleteVideo = () => {
    // Note: Not deleting from storage as we only have the URL, not the file ID
    // The file can be cleaned up manually in Firebase Console if needed
    setCinematicVideoUrl('');
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    }
  };

  // Delete music
  const handleDeleteMusic = () => {
    // Note: Not deleting from storage as we only have the URL, not the file ID
    // The file can be cleaned up manually in Firebase Console if needed
    setBackgroundMusicUrl('');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  // Toggle video preview
  const toggleVideoPreview = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlayingVideo(!isPlayingVideo);
    }
  };

  // Toggle music preview
  const toggleMusicPreview = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-white/50" size={20} />
          <span className="text-white/50">Loading {theaterName} settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Film size={20} className="text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white">{theaterName}</h3>
            <p className="text-xs text-white/50">
              {cinematicVideoUrl ? 'Cinematic configured' : 'No cinematic'} • {backgroundMusicUrl ? 'Music configured' : 'No music'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-white/50"
        >
          ▼
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-6">
              {/* Cinematic Video Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film size={16} className="text-amber-400" />
                  Entry Cinematic Video
                </h4>

                {cinematicVideoUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      src={cinematicVideoUrl}
                      className="w-full h-full object-contain"
                      onEnded={() => setIsPlayingVideo(false)}
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <button
                        onClick={toggleVideoPreview}
                        className="px-3 py-1.5 rounded-lg bg-black/50 text-white text-sm flex items-center gap-2 hover:bg-black/70"
                      >
                        {isPlayingVideo ? <Pause size={14} /> : <Play size={14} />}
                        {isPlayingVideo ? 'Pause' : 'Preview'}
                      </button>
                      <button
                        onClick={handleDeleteVideo}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <div className={`relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors ${isUploadingVideo ? 'pointer-events-none' : ''}`}>
                      {isUploadingVideo ? (
                        <div className="space-y-2">
                          <Loader2 className="mx-auto animate-spin text-amber-400" size={24} />
                          <p className="text-sm text-white/70">Uploading... {videoUploadProgress}%</p>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 transition-all"
                              style={{ width: `${videoUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto text-white/30 mb-2" size={32} />
                          <p className="text-sm text-white/50">Upload cinematic video</p>
                          <p className="text-xs text-white/30 mt-1">MP4, WebM • Max 100MB</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                      disabled={isUploadingVideo}
                    />
                  </label>
                )}
              </div>

              {/* Background Music Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Music2 size={16} className="text-amber-400" />
                  Background Music
                </h4>

                {backgroundMusicUrl ? (
                  <div className="p-4 rounded-lg bg-white/5 space-y-3">
                    <audio
                      ref={audioRef}
                      src={backgroundMusicUrl}
                      loop
                      onEnded={() => setIsPlayingMusic(false)}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleMusicPreview}
                        className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 transition-colors"
                      >
                        {isPlayingMusic ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-white">Background Music</p>
                        <p className="text-xs text-white/50">Click to preview</p>
                      </div>
                      <button
                        onClick={handleDeleteMusic}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Volume</span>
                        <span>{Math.round(backgroundMusicVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={backgroundMusicVolume}
                        onChange={(e) => setBackgroundMusicVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>

                    {/* Fade Duration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Fade Duration</span>
                        <span>{musicFadeDuration}ms</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={musicFadeDuration}
                        onChange={(e) => setMusicFadeDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <div className={`relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors ${isUploadingMusic ? 'pointer-events-none' : ''}`}>
                      {isUploadingMusic ? (
                        <div className="space-y-2">
                          <Loader2 className="mx-auto animate-spin text-amber-400" size={24} />
                          <p className="text-sm text-white/70">Uploading... {musicUploadProgress}%</p>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 transition-all"
                              style={{ width: `${musicUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Music2 className="mx-auto text-white/30 mb-2" size={32} />
                          <p className="text-sm text-white/50">Upload background music</p>
                          <p className="text-xs text-white/30 mt-1">MP3, WAV, OGG • Max 20MB</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleMusicUpload(e.target.files[0])}
                      disabled={isUploadingMusic}
                    />
                  </label>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    hasChanges
                      ? 'bg-amber-500 text-black hover:bg-amber-400'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : hasChanges ? (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Saved
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TheaterMediaEditor;
