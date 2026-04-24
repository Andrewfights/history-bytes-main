/**
 * LettersHomeAudioEditor - Admin interface for managing Letters Home audio recordings
 * Allows uploading audio files for each of the 3 soldier letters (Barsky, Adelman, James)
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Upload, Trash2, Play, Pause, Music, User } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import {
  subscribeToWW2ModuleAssets,
  updateLettersHomeAudio,
  type LettersHomeAudioConfig,
} from '@/lib/firestore';
import type { MediaFile } from '@/lib/supabase';

const LETTERS = [
  {
    id: 'barsky',
    name: 'Joseph Barsky',
    rank: 'Private',
    ship: 'USS Arizona',
    date: 'December 5, 1941',
    recipient: 'His Mother',
    fate: 'KIA - Dec 7, 1941',
    fateColor: 'text-red-400',
    icon: 'Anchor',
  },
  {
    id: 'adelman',
    name: 'Harvey Adelman',
    rank: 'Seaman First Class',
    ship: 'USS West Virginia',
    date: 'December 6, 1941',
    recipient: 'His Wife Ruth',
    fate: 'KIA - Dec 7, 1941',
    fateColor: 'text-red-400',
    icon: 'Heart',
  },
  {
    id: 'james',
    name: 'Wendell James',
    rank: 'Mess Attendant 2nd Class',
    ship: 'USS Nevada',
    date: 'December 4, 1941',
    recipient: 'His Father',
    fate: 'Survived',
    fateColor: 'text-green-400',
    icon: 'Medal',
  },
];

export function LettersHomeAudioEditor() {
  const [letterAudio, setLetterAudio] = useState<Record<string, LettersHomeAudioConfig>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [editingReader, setEditingReader] = useState<string | null>(null);
  const [readerName, setReaderName] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to WW2 module assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setLetterAudio(assets?.lettersHomeAudio || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectMedia = async (file: MediaFile) => {
    if (!selectedLetter) return;

    const currentConfig = letterAudio[selectedLetter] || { letterId: selectedLetter };
    const updatedConfig: LettersHomeAudioConfig = {
      ...currentConfig,
      letterId: selectedLetter,
      audioUrl: file.url,
    };

    const success = await updateLettersHomeAudio(selectedLetter, updatedConfig);
    if (success) {
      toast.success(`Audio uploaded for ${LETTERS.find(l => l.id === selectedLetter)?.name}`);
    } else {
      toast.error('Failed to save audio');
    }

    setIsMediaPickerOpen(false);
    setSelectedLetter(null);
  };

  const handleRemoveAudio = async (letterId: string) => {
    const currentConfig = letterAudio[letterId];
    if (!currentConfig) return;

    // If only removing audio but keeping reader name, update the config
    if (currentConfig.readerName) {
      const updatedConfig: LettersHomeAudioConfig = {
        ...currentConfig,
        audioUrl: undefined,
      };
      await updateLettersHomeAudio(letterId, updatedConfig);
    } else {
      // Remove the entire entry
      await updateLettersHomeAudio(letterId, null);
    }

    // Stop playback if this letter was playing
    if (playingAudio === letterId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    }

    toast.success('Audio removed');
  };

  const handleSaveReaderName = async (letterId: string) => {
    const currentConfig = letterAudio[letterId] || { letterId };
    const updatedConfig: LettersHomeAudioConfig = {
      ...currentConfig,
      letterId,
      readerName: readerName.trim() || undefined,
    };

    const success = await updateLettersHomeAudio(letterId, updatedConfig);
    if (success) {
      toast.success('Reader name saved');
    } else {
      toast.error('Failed to save reader name');
    }

    setEditingReader(null);
    setReaderName('');
  };

  const toggleAudioPlay = (letterId: string, audioUrl: string) => {
    if (playingAudio === letterId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlayingAudio(null);
      audioRef.current.play().catch(console.error);
      setPlayingAudio(letterId);
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
          <Mail className="text-amber-400" size={24} />
          <h1 className="text-2xl font-bold text-foreground">Letters Home Audio</h1>
        </div>
        <p className="text-muted-foreground">
          Upload audio recordings for each soldier's letter in Beat 10 (Letters Home).
          These recordings will be played when users view each letter.
        </p>
      </div>

      {/* Letter Cards */}
      <div className="space-y-4">
        {LETTERS.map((letter) => {
          const config = letterAudio[letter.id];
          const hasAudio = !!config?.audioUrl;
          const readerDisplayName = config?.readerName || 'Voice actor not specified';

          return (
            <div
              key={letter.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Letter Header */}
              <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Mail size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{letter.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {letter.rank} · {letter.ship}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Letter to {letter.recipient} · {letter.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium ${letter.fateColor}`}>
                    {letter.fate}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${hasAudio ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {hasAudio ? 'Audio Ready' : 'No Audio'}
                  </span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Music size={16} className="text-amber-400" />
                  <span className="font-medium text-foreground text-sm">Letter Recording</span>
                </div>

                {hasAudio ? (
                  <div className="space-y-3">
                    {/* Audio Player */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAudioPlay(letter.id, config.audioUrl!)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                      >
                        {playingAudio === letter.id ? <Pause size={16} /> : <Play size={16} />}
                        {playingAudio === letter.id ? 'Pause' : 'Play Recording'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLetter(letter.id);
                          setIsMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleRemoveAudio(letter.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Reader Name */}
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-muted-foreground" />
                      {editingReader === letter.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={readerName}
                            onChange={(e) => setReaderName(e.target.value)}
                            placeholder="Voice actor name..."
                            className="flex-1 px-2 py-1 bg-muted rounded border border-border text-foreground text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveReaderName(letter.id)}
                            className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingReader(null);
                              setReaderName('');
                            }}
                            className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-muted-foreground">{readerDisplayName}</span>
                          <button
                            onClick={() => {
                              setEditingReader(letter.id);
                              setReaderName(config?.readerName || '');
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>

                    {/* URL Preview */}
                    <p className="text-xs text-muted-foreground truncate">{config.audioUrl}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedLetter(letter.id);
                      setIsMediaPickerOpen(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-amber-500/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Upload Audio Recording
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <h4 className="font-semibold text-amber-400 mb-2">Recording Guidelines:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Each letter should be read slowly and with emotion</li>
          <li>Ideal length: 1-2 minutes per letter</li>
          <li>Audio format: MP3 or WAV recommended</li>
          <li>Consider period-appropriate voice acting style</li>
          <li>The reader name appears in the audio player UI</li>
        </ul>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setSelectedLetter(null);
        }}
        onSelect={handleSelectMedia}
        allowedTypes={['audio']}
        title={`Select Audio for ${LETTERS.find(l => l.id === selectedLetter)?.name || ''}'s Letter`}
      />
    </div>
  );
}

export default LettersHomeAudioEditor;
