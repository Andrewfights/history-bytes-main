import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Wand2, Upload, Film, Image, Video, Sparkles, Download, Trash2,
  GripVertical, Clock, Play, Pause, Scissors, Plus, X, Check,
  ChevronDown, Loader2, AlertCircle, Copy, Eye, Clapperboard, AtSign,
  Music, Volume2, VolumeX, Repeat, Square
} from 'lucide-react';
import { toast } from 'sonner';
import { generateImage, isGeminiConfigured, base64ToDataUrl, downloadBase64Image } from '@/lib/gemini';
import { generateVideo, isVeoConfigured, buildVideoPrompt } from '@/lib/veo';
import { generateMusic, isSunoConfigured, GAME_MUSIC_GENRES, ERA_MUSIC_STYLES, downloadAudio, getAudioDuration, type GeneratedMusic } from '@/lib/suno';
import { useCharacterMention, type MentionSuggestion } from '@/hooks/useCharacterMention';
import { getAllSpiritGuides } from '@/data/spiritGuidesData';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getMediaGalleryItems,
  saveMediaGalleryItem,
  deleteMediaGalleryItem,
  subscribeToMediaGallery,
  getTimelineClips,
  saveAllTimelineClips,
  deleteTimelineClip,
  subscribeToTimelineClips,
  getMusicLibraryItems,
  saveMusicLibraryItem,
  deleteMusicLibraryItem,
  subscribeToMusicLibrary,
  type FirestoreMediaGalleryItem,
  type FirestoreTimelineClip,
  type FirestoreMusicLibraryItem,
} from '@/lib/firestore';
// Legacy imports for fallback (offline support)
import {
  loadStoredMediaGallery,
  saveMediaGallery as saveMediaGalleryLocal,
  loadStoredTimelineClips,
  saveTimelineClips as saveTimelineClipsLocal,
  loadStoredMusicLibrary,
  saveMusicLibrary as saveMusicLibraryLocal,
  type StoredMedia,
  type StoredTimelineClip,
  type StoredMusic,
} from '@/lib/adminStorage';
import { useLiveCourses } from '@/hooks/useLiveData';

type TabType = 'generate' | 'video' | 'music' | 'upload' | 'timeline';
type MediaType = 'image' | 'video' | 'audio';
type AspectRatio = '16:9' | '1:1' | '9:16';

interface TimelineClip {
  id: string;
  name: string;
  type: MediaType;
  duration: number; // seconds
  thumbnail: string;
  src: string;
  trimStart?: number;
  trimEnd?: number;
}

interface GeneratedMedia {
  id: string;
  prompt: string;
  type: MediaType;
  aspectRatio: AspectRatio;
  dataUrl: string;
  createdAt: Date;
}

// Preset prompts for eras and guides
const ERA_PRESETS = [
  { label: 'French Revolution', prompt: 'Dramatic scene of the storming of the Bastille fortress in Paris 1789, angry crowd with torches, smoke rising, golden hour lighting, cinematic' },
  { label: 'World War II', prompt: 'D-Day beach landing at Normandy 1944, soldiers wading through water, dramatic cloudy sky, explosions in distance, cinematic war photography' },
  { label: 'Ancient Rome', prompt: 'Majestic Roman Colosseum at golden hour, gladiators entering arena, packed crowds, Roman eagles and banners, epic scale, cinematic' },
  { label: 'Medieval Europe', prompt: 'Grand medieval castle on misty hilltop at dawn, knights on horseback, banners flying, golden morning light through fog, cinematic fantasy' },
  { label: 'Ancient Egypt', prompt: 'Great Pyramids of Giza at sunset with Sphinx, golden sand dunes, dramatic orange and purple sky, cinematic epic scale' },
  { label: 'Ancient Greece', prompt: 'Parthenon on Acropolis in Athens during golden age, white marble gleaming, philosophers in togas, blue Aegean Sea, cinematic' },
  { label: 'Renaissance', prompt: 'Renaissance Florence street scene, Brunelleschis Dome, artists painting, Medici nobles, warm Italian sunlight, oil painting aesthetic' },
  { label: 'Industrial Revolution', prompt: 'Victorian-era factory district, steam from chimneys, workers at dawn, early locomotives, cobblestone streets, dramatic atmosphere' },
];

const GUIDE_PRESETS = [
  { label: 'Socrates', prompt: 'Portrait of ancient Greek philosopher Socrates, elderly wise man with white beard, contemplative expression, Greek toga, marble columns background, Renaissance painting style' },
  { label: 'Abraham Lincoln', prompt: 'Portrait of President Abraham Lincoln, iconic beard, thoughtful eyes, black formal coat, sepia-toned studio lighting, American flag background' },
  { label: 'Cleopatra VII', prompt: 'Portrait of Queen Cleopatra VII of Egypt, kohl-lined eyes, golden cobra headdress, elaborate gold jewelry, royal Egyptian aesthetic' },
  { label: 'Leonardo da Vinci', prompt: 'Portrait of Leonardo da Vinci, long gray hair and beard, Renaissance cap and robes, workshop with sketches background, candlelight' },
  { label: 'Sun Tzu', prompt: 'Portrait of Sun Tzu, ancient Chinese strategist, traditional topknot, Han dynasty silk robes, serene wise expression, ink painting aesthetic' },
  { label: 'Marie Curie', prompt: 'Portrait of Marie Curie, dark hair pulled back, determined expression, Victorian dress, laboratory with glowing samples background' },
  { label: 'Harriet Tubman', prompt: 'Portrait of Harriet Tubman, strong determined expression, 19th century clothing with headscarf, North Star background, sepia tones' },
  { label: 'Queen Elizabeth I', prompt: 'Portrait of Queen Elizabeth I, white makeup, red curled hair, elaborate ruff collar, jeweled crown, Tudor palace background' },
];

// Mention popup component
function MentionPopup({
  suggestions,
  selectedIndex,
  onSelect,
  position,
}: {
  suggestions: MentionSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: MentionSuggestion) => void;
  position: { top: number; left: number } | null;
}) {
  if (suggestions.length === 0 || !position) return null;

  return (
    <div
      className="absolute z-50 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
            index === selectedIndex ? 'bg-primary/10' : 'hover:bg-secondary'
          }`}
        >
          <img
            src={suggestion.avatar}
            alt={suggestion.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{suggestion.name}</p>
            <p className="text-xs text-muted-foreground truncate">{suggestion.title}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function MediaStudio() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [generating, setGenerating] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatingMusic, setGeneratingMusic] = useState(false);

  // State for generated media (synced with Firebase)
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // State for timeline clips (synced with Firebase)
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [clipsLoaded, setClipsLoaded] = useState(false);

  // State for music library (synced with Firebase)
  const [musicLibrary, setMusicLibrary] = useState<StoredMusic[]>([]);
  const [musicLoaded, setMusicLoaded] = useState(false);

  // Load data from Firebase on mount
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Fallback to localStorage if Firebase not configured
      const stored = loadStoredMediaGallery();
      setGeneratedMedia(stored.map(m => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })));
      setTimelineClips(loadStoredTimelineClips());
      setMusicLibrary(loadStoredMusicLibrary());
      setMediaLoaded(true);
      setClipsLoaded(true);
      setMusicLoaded(true);
      return;
    }

    // Subscribe to Firebase collections for real-time updates
    const unsubMedia = subscribeToMediaGallery((items) => {
      setGeneratedMedia(items.map(m => ({
        id: m.id,
        prompt: m.prompt,
        type: m.type as 'image' | 'video',
        aspectRatio: m.aspectRatio as AspectRatio,
        dataUrl: m.dataUrl,
        createdAt: new Date(m.createdAt),
      })));
      setMediaLoaded(true);
    });

    const unsubClips = subscribeToTimelineClips((clips) => {
      setTimelineClips(clips.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as MediaType,
        duration: c.duration,
        thumbnail: c.thumbnail,
        src: c.src,
        trimStart: c.trimStart,
        trimEnd: c.trimEnd,
      })));
      setClipsLoaded(true);
    });

    const unsubMusic = subscribeToMusicLibrary((items) => {
      setMusicLibrary(items.map(m => ({
        id: m.id,
        title: m.title,
        prompt: m.prompt,
        audioUrl: m.audioUrl,
        duration: m.duration,
        genre: m.genre,
        era: m.era,
        mood: m.mood,
        assignedTo: m.assignedTo,
        playMode: m.playMode,
        createdAt: m.createdAt,
        source: m.source,
      })));
      setMusicLoaded(true);
    });

    return () => {
      unsubMedia();
      unsubClips();
      unsubMusic();
    };
  }, []);

  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);
  const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generation form state
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [mediaType, setMediaType] = useState<MediaType>('image');

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [selectedSourceImage, setSelectedSourceImage] = useState<GeneratedMedia | null>(null);

  // Music generation state
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicGenre, setMusicGenre] = useState('');
  const [musicEra, setMusicEra] = useState('');
  const [musicDuration, setMusicDuration] = useState<number>(60);
  const [musicInstrumental, setMusicInstrumental] = useState(true);

  // Music assignment state
  const [assigningMusicId, setAssigningMusicId] = useState<string | null>(null);
  const [assignmentPlayMode, setAssignmentPlayMode] = useState<'once' | 'loop'>('loop');

  // @ mention support
  const {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    selectSuggestion,
    resolveMentions,
  } = useCharacterMention();

  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const videoPromptInputRef = useRef<HTMLTextAreaElement>(null);

  const geminiConfigured = isGeminiConfigured();
  const veoConfigured = isVeoConfigured();
  const sunoConfigured = isSunoConfigured();

  // Note: Firebase data is saved on each operation (add/update/delete)
  // Local storage fallback for offline support
  useEffect(() => {
    if (!isFirebaseConfigured() && mediaLoaded) {
      const toStore: StoredMedia[] = generatedMedia.map(m => ({
        id: m.id,
        prompt: m.prompt,
        type: m.type,
        aspectRatio: m.aspectRatio,
        dataUrl: m.dataUrl,
        createdAt: m.createdAt.toISOString(),
      }));
      saveMediaGalleryLocal(toStore);
    }
  }, [generatedMedia, mediaLoaded]);

  useEffect(() => {
    if (!isFirebaseConfigured() && clipsLoaded) {
      saveTimelineClipsLocal(timelineClips);
    }
  }, [timelineClips, clipsLoaded]);

  useEffect(() => {
    if (!isFirebaseConfigured() && musicLoaded) {
      saveMusicLibraryLocal(musicLibrary);
    }
  }, [musicLibrary, musicLoaded]);

  // Handle prompt input with @ mention support
  const handlePromptChange = (value: string, inputRef: React.RefObject<HTMLTextAreaElement>) => {
    setPrompt(value);
    const cursorPos = inputRef.current?.selectionStart || 0;
    handleInputChange(value, cursorPos);

    // Calculate mention popup position
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMentionPosition({ top: rect.bottom + 4, left: rect.left });
    }
  };

  const handleVideoPromptChange = (value: string, inputRef: React.RefObject<HTMLTextAreaElement>) => {
    setVideoPrompt(value);
    const cursorPos = inputRef.current?.selectionStart || 0;
    handleInputChange(value, cursorPos);

    // Calculate mention popup position
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMentionPosition({ top: rect.bottom + 4, left: rect.left });
    }
  };

  const handleMentionSelect = (suggestion: MentionSuggestion, isVideoPrompt: boolean = false) => {
    const newValue = selectSuggestion(suggestion);
    if (isVideoPrompt) {
      setVideoPrompt(newValue);
    } else {
      setPrompt(newValue);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!geminiConfigured) {
      toast.error('Gemini API not configured');
      return;
    }

    setGenerating(true);
    toast.loading('Generating image...', { id: 'generating' });

    try {
      // Resolve @ mentions to style prompts
      const resolvedPrompt = resolveMentions(prompt);

      const result = await generateImage({
        prompt: resolvedPrompt,
        aspectRatio,
        style: aspectRatio === '1:1' ? 'portrait' : 'cinematic',
      });

      if (result) {
        const newMedia: GeneratedMedia = {
          id: Date.now().toString(),
          prompt,
          type: 'image',
          aspectRatio,
          dataUrl: base64ToDataUrl(result.base64Data, result.mimeType),
          createdAt: new Date(),
        };

        // Save to Firebase
        if (isFirebaseConfigured()) {
          await saveMediaGalleryItem({
            id: newMedia.id,
            prompt: newMedia.prompt,
            type: newMedia.type,
            aspectRatio: newMedia.aspectRatio,
            dataUrl: newMedia.dataUrl,
            createdAt: newMedia.createdAt.toISOString(),
          });
        } else {
          setGeneratedMedia(prev => [newMedia, ...prev]);
        }
        toast.success('Image generated!', { id: 'generating' });
      } else {
        toast.error('Failed to generate image', { id: 'generating' });
      }
    } catch (error) {
      toast.error('Error generating image', { id: 'generating' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error('Please enter a video prompt');
      return;
    }

    if (!veoConfigured) {
      toast.error('Veo API not configured');
      return;
    }

    setGeneratingVideo(true);
    toast.loading('Generating video... This may take a moment.', { id: 'generating-video' });

    try {
      // Resolve @ mentions to style prompts
      const resolvedPrompt = resolveMentions(videoPrompt);

      const result = await generateVideo({
        prompt: resolvedPrompt,
        imageBase64: selectedSourceImage
          ? selectedSourceImage.dataUrl.split(',')[1]
          : undefined,
        duration: videoDuration,
        aspectRatio: videoAspectRatio,
      });

      if (result) {
        // Add to timeline
        const newClip: TimelineClip = {
          id: Date.now().toString(),
          name: videoPrompt.slice(0, 30) + '...',
          type: 'video',
          duration: result.duration,
          thumbnail: selectedSourceImage?.dataUrl || result.videoUrl,
          src: result.videoUrl,
        };

        // Save to Firebase
        if (isFirebaseConfigured()) {
          const allClips = [...timelineClips, newClip];
          await saveAllTimelineClips(allClips.map((c, i) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            duration: c.duration,
            thumbnail: c.thumbnail,
            src: c.src,
            trimStart: c.trimStart,
            trimEnd: c.trimEnd,
            displayOrder: i,
          })));
        } else {
          setTimelineClips(prev => [...prev, newClip]);
        }
        toast.success('Video generated!', { id: 'generating-video' });
        setActiveTab('timeline');
      } else {
        toast.error('Failed to generate video. Video generation may be async - check back later.', { id: 'generating-video' });
      }
    } catch (error) {
      toast.error('Error generating video', { id: 'generating-video' });
    } finally {
      setGeneratingVideo(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() && !musicGenre) {
      toast.error('Please enter a prompt or select a genre');
      return;
    }

    if (!sunoConfigured) {
      toast.error('Suno API not configured. Add VITE_SUNO_API_KEY to your .env file');
      return;
    }

    setGeneratingMusic(true);
    toast.loading('Generating music... This may take a moment.', { id: 'generating-music' });

    try {
      const genrePreset = GAME_MUSIC_GENRES.find(g => g.id === musicGenre);
      const fullPrompt = genrePreset
        ? `${genrePreset.prompt}. ${musicPrompt}`
        : musicPrompt;

      const result = await generateMusic({
        prompt: fullPrompt,
        style: genrePreset?.label,
        duration: musicDuration,
        instrumental: musicInstrumental,
        era: musicEra || undefined,
        mood: genrePreset?.label,
      });

      if (result) {
        const newMusic: StoredMusic = {
          id: result.id,
          title: result.title,
          prompt: fullPrompt,
          audioUrl: result.audioUrl,
          duration: result.duration,
          genre: musicGenre,
          era: musicEra,
          createdAt: result.createdAt.toISOString(),
          source: 'generated',
        };

        // Save to Firebase
        if (isFirebaseConfigured()) {
          await saveMusicLibraryItem({
            id: newMusic.id,
            title: newMusic.title,
            prompt: newMusic.prompt,
            audioUrl: newMusic.audioUrl,
            duration: newMusic.duration,
            genre: newMusic.genre,
            era: newMusic.era,
            createdAt: newMusic.createdAt,
            source: newMusic.source,
          });
        } else {
          setMusicLibrary(prev => [newMusic, ...prev]);
        }
        toast.success('Music generated!', { id: 'generating-music' });
      } else {
        toast.error('Failed to generate music. Check your API key and try again.', { id: 'generating-music' });
      }
    } catch (error) {
      toast.error('Error generating music', { id: 'generating-music' });
    } finally {
      setGeneratingMusic(false);
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const audioUrl = event.target?.result as string;
      const duration = await getAudioDuration(audioUrl);

      const newMusic: StoredMusic = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        prompt: 'Uploaded file',
        audioUrl,
        duration: duration || 0,
        createdAt: new Date().toISOString(),
        source: 'uploaded',
      };

      // Save to Firebase
      if (isFirebaseConfigured()) {
        await saveMusicLibraryItem({
          id: newMusic.id,
          title: newMusic.title,
          prompt: newMusic.prompt,
          audioUrl: newMusic.audioUrl,
          duration: newMusic.duration,
          createdAt: newMusic.createdAt,
          source: newMusic.source,
        });
      } else {
        setMusicLibrary(prev => [newMusic, ...prev]);
      }
      toast.success('Music uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handlePlayMusic = (music: StoredMusic) => {
    if (playingMusicId === music.id) {
      // Stop playing
      audioRef.current?.pause();
      setPlayingMusicId(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(music.audioUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingMusicId(null);
      setPlayingMusicId(music.id);
    }
  };

  const handleDeleteMusic = async (musicId: string) => {
    if (playingMusicId === musicId) {
      audioRef.current?.pause();
      setPlayingMusicId(null);
    }

    // Delete from Firebase
    if (isFirebaseConfigured()) {
      await deleteMusicLibraryItem(musicId);
    } else {
      setMusicLibrary(prev => prev.filter(m => m.id !== musicId));
    }
    toast.success('Music removed');
  };

  const handleDownloadMusic = (music: StoredMusic) => {
    downloadAudio(music.audioUrl, `${music.title}.mp3`);
    toast.success('Music downloaded');
  };

  const handleAssignMusic = async (musicId: string, targetType: 'module' | 'game' | 'lesson' | 'course', targetId: string, targetName: string) => {
    const music = musicLibrary.find(m => m.id === musicId);
    if (!music) return;

    const existingAssignments = music.assignedTo || [];
    const alreadyAssigned = existingAssignments.some(a => a.id === targetId);

    let updatedAssignments: StoredMusic['assignedTo'];
    if (alreadyAssigned) {
      // Remove assignment
      updatedAssignments = existingAssignments.filter(a => a.id !== targetId);
    } else {
      // Add assignment
      updatedAssignments = [...existingAssignments, { type: targetType, id: targetId, name: targetName }];
    }

    // Save to Firebase
    if (isFirebaseConfigured()) {
      await saveMusicLibraryItem({
        id: music.id,
        title: music.title,
        prompt: music.prompt,
        audioUrl: music.audioUrl,
        duration: music.duration,
        genre: music.genre,
        era: music.era,
        mood: music.mood,
        assignedTo: updatedAssignments,
        playMode: alreadyAssigned ? music.playMode : assignmentPlayMode,
        createdAt: music.createdAt,
        source: music.source,
      });
    } else {
      setMusicLibrary(prev => prev.map(m => {
        if (m.id === musicId) {
          return {
            ...m,
            assignedTo: updatedAssignments,
            playMode: alreadyAssigned ? m.playMode : assignmentPlayMode,
          };
        }
        return m;
      }));
    }
    toast.success('Music assignment updated');
  };

  const handleUpdatePlayMode = async (musicId: string, playMode: 'once' | 'loop') => {
    const music = musicLibrary.find(m => m.id === musicId);
    if (!music) return;

    // Save to Firebase
    if (isFirebaseConfigured()) {
      await saveMusicLibraryItem({
        id: music.id,
        title: music.title,
        prompt: music.prompt,
        audioUrl: music.audioUrl,
        duration: music.duration,
        genre: music.genre,
        era: music.era,
        mood: music.mood,
        assignedTo: music.assignedTo,
        playMode,
        createdAt: music.createdAt,
        source: music.source,
      });
    } else {
      setMusicLibrary(prev => prev.map(m =>
        m.id === musicId ? { ...m, playMode } : m
      ));
    }
  };

  const handleDownload = (media: GeneratedMedia) => {
    const filename = `${media.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}-${media.aspectRatio}.png`;
    const base64 = media.dataUrl.split(',')[1];
    downloadBase64Image(base64, filename);
    toast.success('Image downloaded');
  };

  const handleAddToTimeline = async (media: GeneratedMedia) => {
    const newClip: TimelineClip = {
      id: Date.now().toString(),
      name: media.prompt.slice(0, 30) + '...',
      type: 'image',
      duration: 5, // Default 5 seconds for images
      thumbnail: media.dataUrl,
      src: media.dataUrl,
    };

    // Save to Firebase
    if (isFirebaseConfigured()) {
      const allClips = [...timelineClips, newClip];
      await saveAllTimelineClips(allClips.map((c, i) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        duration: c.duration,
        thumbnail: c.thumbnail,
        src: c.src,
        trimStart: c.trimStart,
        trimEnd: c.trimEnd,
        displayOrder: i,
      })));
    } else {
      setTimelineClips(prev => [...prev, newClip]);
    }
    toast.success('Added to timeline');
    setActiveTab('timeline');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let addedToTimeline = 0;
    let addedToMusic = 0;
    const newClips: TimelineClip[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          const isVideo = file.type.startsWith('video/');
          const isAudio = file.type.startsWith('audio/');

          if (isAudio) {
            // Add to music library
            const duration = await getAudioDuration(dataUrl);
            const newMusic: StoredMusic = {
              id: Date.now().toString() + Math.random(),
              title: file.name.replace(/\.[^/.]+$/, ''),
              prompt: 'Uploaded file',
              audioUrl: dataUrl,
              duration: duration || 0,
              createdAt: new Date().toISOString(),
              source: 'uploaded',
            };

            // Save to Firebase
            if (isFirebaseConfigured()) {
              await saveMusicLibraryItem({
                id: newMusic.id,
                title: newMusic.title,
                prompt: newMusic.prompt,
                audioUrl: newMusic.audioUrl,
                duration: newMusic.duration,
                createdAt: newMusic.createdAt,
                source: newMusic.source,
              });
            } else {
              setMusicLibrary(prev => [newMusic, ...prev]);
            }
            addedToMusic++;
          } else if (isVideo) {
            // For videos, we need to get duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            await new Promise<void>((resolveVideo) => {
              video.onloadedmetadata = () => {
                const newClip: TimelineClip = {
                  id: Date.now().toString() + Math.random(),
                  name: file.name,
                  type: 'video',
                  duration: video.duration,
                  thumbnail: dataUrl, // Would be better to generate actual thumbnail
                  src: dataUrl,
                };
                newClips.push(newClip);
                addedToTimeline++;
                resolveVideo();
              };
            });
            video.src = dataUrl;
          } else {
            const newClip: TimelineClip = {
              id: Date.now().toString() + Math.random(),
              name: file.name,
              type: 'image',
              duration: 5,
              thumbnail: dataUrl,
              src: dataUrl,
            };
            newClips.push(newClip);
            addedToTimeline++;
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    // Save timeline clips to Firebase
    if (newClips.length > 0) {
      if (isFirebaseConfigured()) {
        const allClips = [...timelineClips, ...newClips];
        await saveAllTimelineClips(allClips.map((c, i) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          duration: c.duration,
          thumbnail: c.thumbnail,
          src: c.src,
          trimStart: c.trimStart,
          trimEnd: c.trimEnd,
          displayOrder: i,
        })));
      } else {
        setTimelineClips(prev => [...prev, ...newClips]);
      }
    }

    if (addedToTimeline > 0 && addedToMusic > 0) {
      toast.success(`Added ${addedToTimeline} file(s) to timeline and ${addedToMusic} to music library`);
    } else if (addedToMusic > 0) {
      toast.success(`Added ${addedToMusic} file(s) to music library`);
      setActiveTab('music');
    } else {
      toast.success(`Added ${addedToTimeline} file(s) to timeline`);
      setActiveTab('timeline');
    }
  };

  const handleRemoveClip = async (clipId: string) => {
    // Delete from Firebase
    if (isFirebaseConfigured()) {
      await deleteTimelineClip(clipId);
    } else {
      setTimelineClips(prev => prev.filter(c => c.id !== clipId));
    }
    if (selectedClip?.id === clipId) {
      setSelectedClip(null);
    }
    toast.success('Clip removed');
  };

  const handleUpdateClipDuration = async (clipId: string, duration: number) => {
    const updatedClips = timelineClips.map(c =>
      c.id === clipId ? { ...c, duration: Math.max(1, duration) } : c
    );

    // Save to Firebase
    if (isFirebaseConfigured()) {
      await saveAllTimelineClips(updatedClips.map((c, i) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        duration: c.duration,
        thumbnail: c.thumbnail,
        src: c.src,
        trimStart: c.trimStart,
        trimEnd: c.trimEnd,
        displayOrder: i,
      })));
    } else {
      setTimelineClips(updatedClips);
    }
  };

  const totalDuration = timelineClips.reduce((sum, clip) => sum + clip.duration, 0);

  // Handle reordering clips (saves to Firebase)
  const handleReorderClips = async (newOrder: TimelineClip[]) => {
    setTimelineClips(newOrder); // Update UI immediately

    // Save to Firebase
    if (isFirebaseConfigured()) {
      await saveAllTimelineClips(newOrder.map((c, i) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        duration: c.duration,
        thumbnail: c.thumbnail,
        src: c.src,
        trimStart: c.trimStart,
        trimEnd: c.trimEnd,
        displayOrder: i,
      })));
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-editorial text-3xl font-bold text-foreground">Media Studio</h1>
        <p className="text-muted-foreground mt-1">Generate AI images, upload media, and create video timelines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'generate', label: 'AI Image', icon: Wand2 },
          { id: 'video', label: 'AI Video', icon: Clapperboard },
          { id: 'music', label: 'AI Music', icon: Music, badge: musicLibrary.length },
          { id: 'upload', label: 'Upload', icon: Upload },
          { id: 'timeline', label: 'Timeline', icon: Film, badge: timelineClips.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-foreground/20">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* AI Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Generate with AI
              </h2>

              {!geminiConfigured && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-200">Gemini API not configured</p>
                      <p className="text-xs text-amber-200/70 mt-1">Add VITE_GEMINI_API_KEY to your .env file</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Input with @ mention support */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prompt
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    <AtSign size={12} className="inline mr-1" />
                    Use @ to mention characters
                  </span>
                </label>
                <textarea
                  ref={promptInputRef}
                  value={prompt}
                  onChange={(e) => handlePromptChange(e.target.value, promptInputRef)}
                  onKeyDown={(e) => {
                    const result = handleKeyDown(e);
                    if (result) setPrompt(result);
                  }}
                  placeholder="Describe the image you want to generate... Use @Socrates to reference characters"
                  className="w-full h-32 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none text-sm"
                />
                {showSuggestions && (
                  <MentionPopup
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                    onSelect={(s) => handleMentionSelect(s, false)}
                    position={mentionPosition}
                  />
                )}
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(['16:9', '1:1', '9:16'] as AspectRatio[]).map(ar => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        aspectRatio === ar
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating || !geminiConfigured}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate Image
                  </>
                )}
              </button>
            </div>

            {/* Presets */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Era Presets</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {ERA_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => { setPrompt(preset.prompt); setAspectRatio('16:9'); }}
                    className="px-3 py-2 text-xs text-left rounded-lg bg-muted hover:bg-muted/80 transition-colors truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <h3 className="font-semibold text-foreground mb-3">Guide Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {GUIDE_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => { setPrompt(preset.prompt); setAspectRatio('1:1'); }}
                    className="px-3 py-2 text-xs text-left rounded-lg bg-muted hover:bg-muted/80 transition-colors truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Images */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-4">Generated Images</h2>

            {generatedMedia.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image size={48} className="mx-auto mb-3 opacity-50" />
                <p>No images generated yet</p>
                <p className="text-sm mt-1">Use the form to generate AI images</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {generatedMedia.map(media => (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={media.dataUrl}
                      alt={media.prompt}
                      className={`w-full object-cover ${
                        media.aspectRatio === '1:1' ? 'aspect-square' :
                        media.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(media)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleAddToTimeline(media)}
                        className="p-2 rounded-lg bg-primary hover:bg-primary/80 text-white"
                        title="Add to Timeline"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white/80 truncate">{media.prompt.slice(0, 40)}...</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Generation Tab */}
      {activeTab === 'video' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Generation Form */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clapperboard size={18} className="text-primary" />
                Generate Video with Veo 3.1
              </h2>

              {!veoConfigured && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-200">Veo API not configured</p>
                      <p className="text-xs text-amber-200/70 mt-1">Add VITE_VEO_API_KEY to your .env file</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Image Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Source Image (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select a generated image to animate, or leave empty for text-to-video
                </p>
                {selectedSourceImage ? (
                  <div className="relative">
                    <img
                      src={selectedSourceImage.dataUrl}
                      alt="Source"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setSelectedSourceImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {generatedMedia.filter(m => m.type === 'image').slice(0, 8).map(media => (
                      <button
                        key={media.id}
                        onClick={() => setSelectedSourceImage(media)}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                      >
                        <img src={media.dataUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {generatedMedia.filter(m => m.type === 'image').length === 0 && (
                      <div className="col-span-4 text-center py-4 text-muted-foreground text-sm">
                        Generate images first, or use text-to-video
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Motion Prompt Input */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motion Prompt
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    <AtSign size={12} className="inline mr-1" />
                    Use @ to mention characters
                  </span>
                </label>
                <textarea
                  ref={videoPromptInputRef}
                  value={videoPrompt}
                  onChange={(e) => handleVideoPromptChange(e.target.value, videoPromptInputRef)}
                  onKeyDown={(e) => {
                    const result = handleKeyDown(e);
                    if (result) setVideoPrompt(result);
                  }}
                  placeholder="Describe the motion or action... e.g., '@Socrates walks slowly, gesturing as he speaks'"
                  className="w-full h-24 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none text-sm"
                />
                {showSuggestions && (
                  <MentionPopup
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                    onSelect={(s) => handleMentionSelect(s, true)}
                    position={mentionPosition}
                  />
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8].map(d => (
                    <button
                      key={d}
                      onClick={() => setVideoDuration(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        videoDuration === d
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(['16:9', '1:1', '9:16'] as const).map(ar => (
                    <button
                      key={ar}
                      onClick={() => setVideoAspectRatio(ar)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        videoAspectRatio === ar
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateVideo}
                disabled={generatingVideo || !veoConfigured}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingVideo ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Clapperboard size={18} />
                    Generate Video
                  </>
                )}
              </button>
            </div>

            {/* Video Motion Presets */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Motion Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Walking', prompt: 'slowly walking forward, natural gait' },
                  { label: 'Speaking', prompt: 'speaking animatedly, gesturing with hands' },
                  { label: 'Looking', prompt: 'looking around thoughtfully, subtle head movement' },
                  { label: 'Writing', prompt: 'writing with a quill, focused concentration' },
                  { label: 'Reading', prompt: 'reading from a scroll, eyes moving' },
                  { label: 'Dramatic', prompt: 'dramatic reveal, wind blowing, cinematic' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setVideoPrompt(preset.prompt)}
                    className="px-3 py-2 text-xs text-left rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips and Info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Video size={18} className="text-primary" />
              Video Generation Tips
            </h2>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium text-foreground mb-1">Using @ Mentions</h4>
                <p>Type @ followed by a character name (e.g., @Socrates) to automatically include their style prompt for consistent character imagery.</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground mb-1">Image-to-Video</h4>
                <p>For best results, select a generated image as the source. The video will animate that specific image.</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground mb-1">Motion Prompts</h4>
                <p>Describe the action or motion you want. Be specific about movement direction, speed, and character actions.</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground mb-1">Duration</h4>
                <p>Shorter videos (2-4s) tend to have better quality. Longer videos may take more time to generate.</p>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-medium text-amber-200 mb-1">Note</h4>
                <p className="text-amber-200/70">Video generation may take 30-60 seconds. Generated videos are automatically added to your timeline.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Music Generation Tab */}
      {activeTab === 'music' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Music Generation Form */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Music size={18} className="text-primary" />
                Generate AI Music with Suno
              </h2>

              {!sunoConfigured && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-200">Suno API not configured</p>
                      <p className="text-xs text-amber-200/70 mt-1">Add VITE_SUNO_API_KEY and VITE_SUNO_API_URL to your .env file</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Music Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Music Description
                </label>
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Describe the music you want... e.g., 'epic orchestral battle theme' or 'calm medieval tavern ambiance'"
                  className="w-full h-24 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none text-sm"
                />
              </div>

              {/* Genre Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Genre Preset</label>
                <select
                  value={musicGenre}
                  onChange={(e) => setMusicGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                >
                  <option value="">Custom / No preset</option>
                  {GAME_MUSIC_GENRES.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.label}</option>
                  ))}
                </select>
              </div>

              {/* Historical Era */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Historical Era (Optional)</label>
                <select
                  value={musicEra}
                  onChange={(e) => setMusicEra(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                >
                  <option value="">No specific era</option>
                  {Object.keys(ERA_MUSIC_STYLES).map(era => (
                    <option key={era} value={era}>{era}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
                <div className="flex gap-2">
                  {[30, 60, 120, 180].map(d => (
                    <button
                      key={d}
                      onClick={() => setMusicDuration(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        musicDuration === d
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Instrumental Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={musicInstrumental}
                    onChange={(e) => setMusicInstrumental(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Instrumental only (no vocals)</span>
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateMusic}
                disabled={generatingMusic || !sunoConfigured}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingMusic ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating Music...
                  </>
                ) : (
                  <>
                    <Music size={18} />
                    Generate Music
                  </>
                )}
              </button>

              {/* Upload Music */}
              <div className="mt-4 pt-4 border-t border-border">
                <label className="w-full py-3 rounded-lg bg-muted text-foreground font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
                  <Upload size={18} />
                  Upload Music File
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleMusicUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Supports MP3, WAV, OGG, and other audio formats
                </p>
              </div>
            </div>

            {/* Quick Genre Presets */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {GAME_MUSIC_GENRES.slice(0, 8).map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => {
                      setMusicGenre(genre.id);
                      setMusicPrompt(genre.prompt);
                    }}
                    className="px-3 py-2 text-xs text-left rounded-lg bg-muted hover:bg-muted/80 transition-colors truncate"
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Music Library */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Volume2 size={18} className="text-primary" />
              Music Library
            </h2>

            {musicLibrary.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music size={48} className="mx-auto mb-3 opacity-50" />
                <p>No music in library</p>
                <p className="text-sm mt-1">Generate AI music or upload audio files</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {musicLibrary.map(music => (
                  <motion.div
                    key={music.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border transition-colors ${
                      playingMusicId === music.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => handlePlayMusic(music)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          playingMusicId === music.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-primary/20'
                        }`}
                      >
                        {playingMusicId === music.id ? (
                          <Square size={16} fill="currentColor" />
                        ) : (
                          <Play size={16} fill="currentColor" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{music.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDuration(music.duration)}</span>
                          {music.genre && (
                            <>
                              <span>|</span>
                              <span>{GAME_MUSIC_GENRES.find(g => g.id === music.genre)?.label || music.genre}</span>
                            </>
                          )}
                          {music.source === 'uploaded' && (
                            <>
                              <span>|</span>
                              <span>Uploaded</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAssigningMusicId(assigningMusicId === music.id ? null : music.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            assigningMusicId === music.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title="Assign to module/game"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadMusic(music)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMusic(music.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Assignment Panel */}
                    <AnimatePresence>
                      {assigningMusicId === music.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <MusicAssignmentPanel
                            music={music}
                            onAssign={(type, id, name) => handleAssignMusic(music.id, type, id, name)}
                            onPlayModeChange={(mode) => handleUpdatePlayMode(music.id, mode)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Assignment Info */}
                    {music.assignedTo && music.assignedTo.length > 0 && assigningMusicId !== music.id && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Assigned to: {music.assignedTo.map(a => a.name).join(', ')}
                          {music.playMode && ` (${music.playMode})`}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Upload size={18} className="text-primary" />
            Upload Media
          </h2>

          <label className="block border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground mt-2">Images (PNG, JPG, WebP), Videos (MP4, WebM), and Audio (MP3, WAV)</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            Uploaded files will be added directly to your timeline or music library
          </p>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Timeline Stats */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Clips</p>
                <p className="text-xl font-bold">{timelineClips.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Duration</p>
                <p className="text-xl font-bold">{formatDuration(totalDuration)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-medium cursor-pointer hover:bg-muted/80 transition-colors">
                <Plus size={18} />
                Add Media
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Film size={18} className="text-primary" />
              Timeline
              <span className="text-xs text-muted-foreground font-normal ml-2">
                Drag clips to reorder (top = first)
              </span>
            </h2>

            {timelineClips.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <Film size={48} className="mx-auto mb-3 opacity-50" />
                <p>No clips in timeline</p>
                <p className="text-sm mt-1">Generate AI images or upload media to get started</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={timelineClips}
                onReorder={handleReorderClips}
                className="space-y-2"
              >
                {timelineClips.map((clip, index) => (
                  <Reorder.Item
                    key={clip.id}
                    value={clip}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TimelineClipItem
                      clip={clip}
                      index={index}
                      isSelected={selectedClip?.id === clip.id}
                      onSelect={() => setSelectedClip(clip)}
                      onRemove={() => handleRemoveClip(clip.id)}
                      onDurationChange={(d) => handleUpdateClipDuration(clip.id, d)}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Selected Clip Details */}
          {selectedClip && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-4">Clip Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedClip.thumbnail}
                    alt={selectedClip.name}
                    className="w-full rounded-lg object-cover aspect-video"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Name</label>
                    <p className="font-medium">{selectedClip.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Type</label>
                    <p className="font-medium capitalize">{selectedClip.type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={selectedClip.duration}
                        onChange={(e) => handleUpdateClipDuration(selectedClip.id, parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 rounded-lg bg-background border border-border text-sm"
                      />
                      <span className="text-sm text-muted-foreground">seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Timeline Clip Item Component
function TimelineClipItem({
  clip,
  index,
  isSelected,
  onSelect,
  onRemove,
  onDurationChange,
}: {
  clip: TimelineClip;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDurationChange: (duration: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        isSelected
          ? 'bg-primary/10 border-primary'
          : 'bg-muted/50 border-border hover:border-primary/50'
      }`}
    >
      {/* Drag Handle */}
      <div className="text-muted-foreground cursor-grab">
        <GripVertical size={20} />
      </div>

      {/* Order Number */}
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img src={clip.thumbnail} alt={clip.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <button onClick={onSelect} className="flex-1 text-left min-w-0">
        <p className="font-medium text-foreground truncate">{clip.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {clip.type === 'video' ? <Video size={12} /> : <Image size={12} />}
          <span className="capitalize">{clip.type}</span>
          <span>|</span>
          <Clock size={12} />
          <span>{formatDuration(clip.duration)}</span>
        </div>
      </button>

      {/* Duration Input */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="1"
          value={clip.duration}
          onChange={(e) => onDurationChange(parseFloat(e.target.value) || 1)}
          className="w-14 px-2 py-1 rounded-lg bg-background border border-border text-xs text-center"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-xs text-muted-foreground">s</span>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}

// Music Assignment Panel Component
function MusicAssignmentPanel({
  music,
  onAssign,
  onPlayModeChange,
}: {
  music: StoredMusic;
  onAssign: (type: 'module' | 'game' | 'lesson' | 'course', id: string, name: string) => void;
  onPlayModeChange: (mode: 'once' | 'loop') => void;
}) {
  const { data: courses } = useLiveCourses();

  // Predefined game/module types
  const gameModules = [
    { id: 'timeline-game', name: 'Timeline Game', type: 'game' as const },
    { id: 'anachronism-finder', name: 'Anachronism Finder', type: 'game' as const },
    { id: 'connections', name: 'Connections Puzzle', type: 'game' as const },
    { id: 'map-mystery', name: 'Map Mystery', type: 'game' as const },
    { id: 'artifact-case', name: 'Artifact Case', type: 'game' as const },
    { id: 'home-background', name: 'Home Screen Background', type: 'module' as const },
    { id: 'lesson-background', name: 'Lesson Background', type: 'module' as const },
    { id: 'arcade-background', name: 'Arcade Background', type: 'module' as const },
  ];

  const isAssigned = (id: string) => music.assignedTo?.some(a => a.id === id);

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
      {/* Play Mode */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Play Mode:</span>
        <div className="flex gap-2">
          <button
            onClick={() => onPlayModeChange('once')}
            className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
              music.playMode === 'once'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Play size={12} /> Once
          </button>
          <button
            onClick={() => onPlayModeChange('loop')}
            className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
              music.playMode === 'loop' || !music.playMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Repeat size={12} /> Loop
          </button>
        </div>
      </div>

      {/* Games/Modules */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Games & Modules:</p>
        <div className="flex flex-wrap gap-1">
          {gameModules.map(module => (
            <button
              key={module.id}
              onClick={() => onAssign(module.type, module.id, module.name)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                isAssigned(module.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {module.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses */}
      {courses.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Courses:</p>
          <div className="flex flex-wrap gap-1">
            {courses.slice(0, 8).map(course => (
              <button
                key={course.id}
                onClick={() => onAssign('course', course.id, course.title)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  isAssigned(course.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {course.title.slice(0, 20)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Assignments */}
      {music.assignedTo && music.assignedTo.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-primary mb-1">Currently assigned to:</p>
          <div className="flex flex-wrap gap-1">
            {music.assignedTo.map(assignment => (
              <span
                key={assignment.id}
                className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-md"
              >
                {assignment.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
