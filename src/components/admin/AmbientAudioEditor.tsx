/**
 * AmbientAudioEditor - Admin interface for managing ambient audio tracks
 * Allows uploading ambient audio that plays in the background while users interact with beats
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2, Upload, Trash2, Play, Pause, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import {
  subscribeToWW2ModuleAssets,
  updateAmbientAudio,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

// Define beats that support ambient audio
const AMBIENT_AUDIO_BEATS = [
  {
    id: 'empty-war-chest',
    name: 'An Empty War Chest',
    description: 'Ambient audio plays while users read the economic background info',
    beatNumber: 2,
  },
  // Add more beats here as needed
];

interface AmbientAudioConfig {
  enabled: boolean;
  audioUrl: string;
}

export function AmbientAudioEditor() {
  const [ambientAudio, setAmbientAudio] = useState<Record<string, AmbientAudioConfig>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBeat, setSelectedBeat] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setAmbientAudio(assets?.ambientAudio || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectMedia = async (file: MediaFile) => {
    if (!selectedBeat) return;

    const currentConfig = ambientAudio[selectedBeat];
    const updatedConfig: AmbientAudioConfig = {
      enabled: currentConfig?.enabled ?? true,
      audioUrl: file.url,
    };

    const success = await updateAmbientAudio(selectedBeat, updatedConfig);
    if (success) {
      toast.success(`Ambient audio uploaded for ${AMBIENT_AUDIO_BEATS.find(b => b.id === selectedBeat)?.name}`);
    } else {
      toast.error('Failed to save audio');
    }

    setIsMediaPickerOpen(false);
    setSelectedBeat(null);
  };

  const handleRemoveAudio = async (beatId: string) => {
    await updateAmbientAudio(beatId, null);

    // Stop playback if this beat was playing
    if (playingAudio === beatId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    }

    toast.success('Ambient audio removed');
  };

  const handleToggleEnabled = async (beatId: string) => {
    const currentConfig = ambientAudio[beatId];
    if (!currentConfig) return;

    const updatedConfig: AmbientAudioConfig = {
      ...currentConfig,
      enabled: !currentConfig.enabled,
    };

    const success = await updateAmbientAudio(beatId, updatedConfig);
    if (success) {
      toast.success(updatedConfig.enabled ? 'Ambient audio enabled' : 'Ambient audio disabled');
    } else {
      toast.error('Failed to update');
    }
  };

  const toggleAudioPlay = (beatId: string, audioUrl: string) => {
    if (playingAudio === beatId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      audioRef.current.onended = () => setPlayingAudio(null);
      audioRef.current.play().catch(console.error);
      setPlayingAudio(beatId);
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
          <Volume2 className="text-amber-400" size={24} />
          <h1 className="text-2xl font-bold text-foreground">Ambient Audio</h1>
        </div>
        <p className="text-muted-foreground">
          Upload ambient audio tracks that play in the background while users interact with beat content.
          These tracks loop continuously and create atmosphere.
        </p>
      </div>

      {/* Beat Cards */}
      <div className="space-y-4">
        {AMBIENT_AUDIO_BEATS.map((beat) => {
          const config = ambientAudio[beat.id];
          const hasAudio = !!config?.audioUrl;
          const isEnabled = config?.enabled ?? false;

          return (
            <div
              key={beat.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Beat Header */}
              <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Volume2 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{beat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Beat {beat.beatNumber} · {beat.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${hasAudio ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {hasAudio ? 'Audio Ready' : 'No Audio'}
                  </span>
                  {hasAudio && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${isEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
              </div>

              {/* Audio Controls */}
              <div className="p-4">
                {hasAudio ? (
                  <div className="space-y-3">
                    {/* Audio Player & Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => toggleAudioPlay(beat.id, config.audioUrl)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                      >
                        {playingAudio === beat.id ? <Pause size={16} /> : <Play size={16} />}
                        {playingAudio === beat.id ? 'Stop Preview' : 'Preview'}
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(beat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isEnabled
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {isEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBeat(beat.id);
                          setIsMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleRemoveAudio(beat.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* URL Preview */}
                    <p className="text-xs text-muted-foreground truncate">{config.audioUrl}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedBeat(beat.id);
                      setIsMediaPickerOpen(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-amber-500/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Upload Ambient Audio
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <h4 className="font-semibold text-amber-400 mb-2">Ambient Audio Guidelines:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Audio should be seamlessly loopable (no jarring starts/stops)</li>
          <li>Keep volume moderate - this plays in the background while users read</li>
          <li>Recommended length: 30 seconds to 2 minutes</li>
          <li>Format: MP3 or WAV recommended</li>
          <li>Use the "Enabled" toggle to turn playback on/off without removing the file</li>
        </ul>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setSelectedBeat(null);
        }}
        onSelect={handleSelectMedia}
        allowedTypes={['audio']}
        title={`Select Ambient Audio for ${AMBIENT_AUDIO_BEATS.find(b => b.id === selectedBeat)?.name || ''}`}
      />
    </div>
  );
}

export default AmbientAudioEditor;
