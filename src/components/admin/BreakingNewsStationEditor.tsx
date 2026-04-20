/**
 * BreakingNewsStationEditor - Admin interface for managing Breaking News radio station media
 * Allows uploading audio and video for each of the 3 radio stations (CBS, NBC, MBS)
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Radio, Upload, Trash2, Play, Pause, Video, Music } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import {
  subscribeToWW2ModuleAssets,
  updateBreakingNewsStation,
  type BreakingNewsStationMedia,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

const STATIONS = [
  { id: 'cbs', name: 'CBS', program: 'New York Philharmonic', time: '2:26 PM EST' },
  { id: 'nbc', name: 'NBC', program: 'Football: Giants vs. Dodgers', time: '2:29 PM EST' },
  { id: 'mutual', name: 'MBS', program: 'Double or Nothing Quiz Show', time: '2:30 PM EST' },
];

export function BreakingNewsStationEditor() {
  const [stationMedia, setStationMedia] = useState<Record<string, BreakingNewsStationMedia>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setStationMedia(assets?.breakingNewsStations || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectMedia = async (file: MediaFile) => {
    if (!selectedStation) return;

    const currentMedia = stationMedia[selectedStation] || { stationId: selectedStation };
    const updatedMedia: BreakingNewsStationMedia = {
      ...currentMedia,
      stationId: selectedStation,
      [mediaType === 'audio' ? 'audioUrl' : 'videoUrl']: file.url,
    };

    const success = await updateBreakingNewsStation(selectedStation, updatedMedia);
    if (success) {
      toast.success(`${mediaType === 'audio' ? 'Audio' : 'Video'} uploaded for ${STATIONS.find(s => s.id === selectedStation)?.name}`);
    } else {
      toast.error('Failed to save media');
    }

    setIsMediaPickerOpen(false);
    setSelectedStation(null);
  };

  const handleRemoveMedia = async (stationId: string, type: 'audio' | 'video') => {
    const currentMedia = stationMedia[stationId];
    if (!currentMedia) return;

    const updatedMedia: BreakingNewsStationMedia = {
      ...currentMedia,
      [type === 'audio' ? 'audioUrl' : 'videoUrl']: undefined,
    };

    // If both audio and video are removed, delete the entire entry
    if (!updatedMedia.audioUrl && !updatedMedia.videoUrl) {
      await updateBreakingNewsStation(stationId, null);
    } else {
      await updateBreakingNewsStation(stationId, updatedMedia);
    }

    toast.success(`${type === 'audio' ? 'Audio' : 'Video'} removed`);
  };

  const toggleAudioPlay = (stationId: string, audioUrl: string) => {
    if (playingAudio === stationId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlayingAudio(null);
      audioRef.current.play().catch(console.error);
      setPlayingAudio(stationId);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="text-amber-400" size={24} />
          <h1 className="text-2xl font-bold text-foreground">Breaking News Station Media</h1>
        </div>
        <p className="text-muted-foreground">
          Upload audio clips and videos for each radio station in Beat 5 (Breaking News).
          After the pre-module video, users will select a station to hear the radio broadcast, then watch the video.
        </p>
      </div>

      {/* Station Cards */}
      <div className="space-y-4">
        {STATIONS.map((station) => {
          const media = stationMedia[station.id];
          const hasAudio = !!media?.audioUrl;
          const hasVideo = !!media?.videoUrl;

          return (
            <div
              key={station.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Station Header */}
              <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  {station.name}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{station.program}</h3>
                  <p className="text-sm text-muted-foreground">{station.time}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${hasAudio ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {hasAudio ? 'Audio Ready' : 'No Audio'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${hasVideo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {hasVideo ? 'Video Ready' : 'No Video'}
                  </span>
                </div>
              </div>

              {/* Media Controls */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Audio Section */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Music size={18} className="text-amber-400" />
                    <span className="font-medium text-foreground">Radio Audio</span>
                  </div>

                  {hasAudio ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAudioPlay(station.id, media.audioUrl!)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                        >
                          {playingAudio === station.id ? <Pause size={16} /> : <Play size={16} />}
                          {playingAudio === station.id ? 'Pause' : 'Play'}
                        </button>
                        <button
                          onClick={() => handleRemoveMedia(station.id, 'audio')}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{media.audioUrl}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedStation(station.id);
                        setMediaType('audio');
                        setIsMediaPickerOpen(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-amber-500/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Upload Audio
                    </button>
                  )}
                </div>

                {/* Video Section */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Video size={18} className="text-amber-400" />
                    <span className="font-medium text-foreground">Station Video</span>
                  </div>

                  {hasVideo ? (
                    <div className="space-y-2">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-2">
                        <video
                          src={media.videoUrl}
                          className="w-full h-full object-contain"
                          controls
                          muted
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStation(station.id);
                            setMediaType('video');
                            setIsMediaPickerOpen(true);
                          }}
                          className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => handleRemoveMedia(station.id, 'video')}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedStation(station.id);
                        setMediaType('video');
                        setIsMediaPickerOpen(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-amber-500/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Upload Video
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <h4 className="font-semibold text-amber-400 mb-2">How it works:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Pre-module video plays (configured in WW2 Module Editor)</li>
          <li>User sees 3 radio station buttons (CBS, NBC, MBS)</li>
          <li>User taps a station → audio plays automatically</li>
          <li>User taps Continue → station video plays</li>
          <li>After video ends → continues to newspaper screen</li>
        </ol>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setSelectedStation(null);
        }}
        onSelect={handleSelectMedia}
        allowedTypes={mediaType === 'audio' ? ['audio'] : ['video']}
        title={`Select ${mediaType === 'audio' ? 'Audio' : 'Video'} for ${STATIONS.find(s => s.id === selectedStation)?.name || ''}`}
      />
    </div>
  );
}

export default BreakingNewsStationEditor;
