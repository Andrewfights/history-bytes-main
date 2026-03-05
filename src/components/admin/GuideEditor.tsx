import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Users, Save, Upload, Wand2, Plus, X, Loader2, ImageIcon, GripVertical, Mic, Volume2, Brain, Palette, Database, Video, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAllSpiritGuides } from '@/data/spiritGuidesData';
import { generateImage, base64ToDataUrl, isGeminiConfigured, buildCharacterPrompt } from '@/lib/gemini';
import { saveGuide, loadGuides, reorderGuides, checkDatabaseReady, type DbSpiritGuide } from '@/lib/database';
import { getApiKey, fetchVoices, generateSpeech, getVoiceSettings, saveVoiceSettings, type VoiceConfig } from '@/lib/elevenlabs';
import { saveGuides as saveGuidesToStorage, loadStoredGuides } from '@/lib/adminStorage';
import { MediaPicker } from './MediaPicker';
import { uploadFile, type MediaFile } from '@/lib/supabase';
import type { SpiritGuide } from '@/types';
import { triggerDataRefresh } from '@/hooks/useLiveData';

type EditableGuide = DbSpiritGuide & { localImageUrl?: string };

const personalityOptions = ['wise', 'witty', 'bold', 'regal', 'scholarly', 'adventurous'];
const colorOptions = ['blue', 'slate', 'amber', 'purple', 'emerald', 'red', 'rose', 'cyan'];

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

export default function GuideEditor() {
  const [guides, setGuides] = useState<EditableGuide[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'voice' | 'ai'>('basic');
  const [availableVoices, setAvailableVoices] = useState<ElevenLabsVoice[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'introVideo' | 'welcomeVideo' | 'celebrationVideo'>('introVideo');
  const [previewingVideo, setPreviewingVideo] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refImageInputRef = useRef<HTMLInputElement>(null);

  const selectedGuide = guides.find(g => g.id === selectedId);

  // Check if a guide has a valid image URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  const openMediaPicker = (type: 'introVideo' | 'welcomeVideo' | 'celebrationVideo') => {
    setMediaPickerType(type);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (file: MediaFile) => {
    if (!selectedId) return;
    const field = mediaPickerType === 'introVideo' ? 'introVideoUrl'
      : mediaPickerType === 'welcomeVideo' ? 'welcomeVideoUrl'
      : 'celebrationVideoUrl';
    handleUpdateGuide(field as keyof EditableGuide, file.url);
    toast.success(`${mediaPickerType.replace('Video', ' video')} set`);
  };

  const clearVideo = (type: 'introVideo' | 'welcomeVideo' | 'celebrationVideo') => {
    const field = type === 'introVideo' ? 'introVideoUrl'
      : type === 'welcomeVideo' ? 'welcomeVideoUrl'
      : 'celebrationVideoUrl';
    handleUpdateGuide(field as keyof EditableGuide, undefined);
  };

  // Load guides from database or fall back to localStorage/local data
  useEffect(() => {
    async function init() {
      const isReady = await checkDatabaseReady();
      setDbReady(isReady);

      if (isReady) {
        const dbGuides = await loadGuides();
        if (dbGuides.length > 0) {
          setGuides(dbGuides);
          return;
        }
      }

      // Try localStorage first
      const storedGuides = loadStoredGuides();
      if (storedGuides && storedGuides.length > 0) {
        setGuides(storedGuides);
        return;
      }

      // Fall back to default data
      const localGuides = getAllSpiritGuides().map((g, i) => ({
        ...g,
        displayOrder: i,
        knowledgeBase: '',
        firstMessage: g.welcomeMessage,
        stylePrompt: '',
      }));
      setGuides(localGuides);
    }
    init();
  }, []);

  // Auto-save to localStorage when guides change (if not using Supabase)
  useEffect(() => {
    if (guides.length > 0 && !dbReady) {
      saveGuidesToStorage(guides);
    }
  }, [guides, dbReady]);

  // Load ElevenLabs voices
  useEffect(() => {
    async function loadVoices() {
      if (getApiKey()) {
        const voices = await fetchVoices();
        setAvailableVoices(voices);
      }
    }
    loadVoices();
  }, []);

  const handleSelectGuide = (id: string) => {
    setSelectedId(id);
  };

  const handleUpdateGuide = <K extends keyof EditableGuide>(field: K, value: EditableGuide[K]) => {
    if (!selectedId) return;
    setGuides(prev => prev.map(g =>
      g.id === selectedId ? { ...g, [field]: value } : g
    ));
  };

  const handleReorder = (newOrder: EditableGuide[]) => {
    setGuides(newOrder.map((g, i) => ({ ...g, displayOrder: i })));
  };

  const handleAddCatchphrase = () => {
    if (!selectedGuide) return;
    const newPhrases = [...selectedGuide.catchphrases, ''];
    handleUpdateGuide('catchphrases', newPhrases);
  };

  const handleUpdateCatchphrase = (index: number, value: string) => {
    if (!selectedGuide) return;
    const newPhrases = [...selectedGuide.catchphrases];
    newPhrases[index] = value;
    handleUpdateGuide('catchphrases', newPhrases);
  };

  const handleRemoveCatchphrase = (index: number) => {
    if (!selectedGuide) return;
    const newPhrases = selectedGuide.catchphrases.filter((_, i) => i !== index);
    handleUpdateGuide('catchphrases', newPhrases);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setGuides(prev => prev.map(g =>
        g.id === selectedId ? { ...g, localImageUrl: dataUrl } : g
      ));
      setImageError(prev => ({ ...prev, [selectedId]: false }));
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    toast.loading('Uploading image...', { id: 'upload' });
    const uploadResult = await uploadFile(file);

    if (uploadResult?.url) {
      setGuides(prev => prev.map(g =>
        g.id === selectedId ? { ...g, imageUrl: uploadResult.url } : g
      ));
      toast.success('Image uploaded successfully', { id: 'upload' });
    } else {
      // Fall back to data URL
      const fallbackReader = new FileReader();
      fallbackReader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setGuides(prev => prev.map(g =>
          g.id === selectedId ? { ...g, imageUrl: dataUrl } : g
        ));
      };
      fallbackReader.readAsDataURL(file);
      toast.warning('Saved locally (cloud upload unavailable)', { id: 'upload' });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedId]);

  const handleGenerateImage = async () => {
    if (!selectedGuide || !isGeminiConfigured()) {
      toast.error('Gemini API not configured');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating portrait...', { description: 'This may take a moment' });

    try {
      // Use style prompt if available, otherwise build from guide data
      const stylePrompt = selectedGuide.stylePrompt || buildCharacterPrompt(
        selectedGuide.name,
        selectedGuide.era,
        selectedGuide.title,
        `${selectedGuide.specialty}, ${selectedGuide.personality} personality`
      );

      const result = await generateImage({
        prompt: stylePrompt,
        aspectRatio: '1:1',
        style: 'portrait'
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

        // Upload to Firebase Storage for persistence
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `guide-${selectedGuide.id}-${Date.now()}.${result.mimeType.split('/')[1] || 'png'}`;
        const file = new File([blob], fileName, { type: result.mimeType });

        const uploadResult = await uploadFile(file);
        const finalUrl = uploadResult?.url || dataUrl;

        setGuides(prev => prev.map(g =>
          g.id === selectedId ? { ...g, localImageUrl: dataUrl, imageUrl: finalUrl } : g
        ));
        setImageError(prev => ({ ...prev, [selectedId!]: false }));
        toast.success('Portrait generated and saved!');
      } else {
        toast.error('Failed to generate image', { description: 'Please try again' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate portraits for all guides without valid images
  const handleGenerateAllPortraits = async () => {
    if (!isGeminiConfigured()) {
      toast.error('Gemini API not configured');
      return;
    }

    const guidesNeedingImages = guides.filter(g => !isValidImageUrl(g.imageUrl));

    if (guidesNeedingImages.length === 0) {
      toast.info('All guides already have portraits');
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: guidesNeedingImages.length });

    for (let i = 0; i < guidesNeedingImages.length; i++) {
      const guide = guidesNeedingImages[i];
      setGenerationProgress({ current: i + 1, total: guidesNeedingImages.length });

      try {
        toast.loading(`Generating portrait for "${guide.name}"...`, { id: `gen-${guide.id}` });

        const stylePrompt = guide.stylePrompt || buildCharacterPrompt(
          guide.name,
          guide.era,
          guide.title,
          `${guide.specialty}, ${guide.personality} personality`
        );

        const result = await generateImage({
          prompt: stylePrompt,
          aspectRatio: '1:1',
          style: 'portrait'
        });

        if (result) {
          const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

          // Upload to Firebase Storage
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const fileName = `guide-${guide.id}-${Date.now()}.${result.mimeType.split('/')[1] || 'png'}`;
          const file = new File([blob], fileName, { type: result.mimeType });

          const uploadResult = await uploadFile(file);
          const finalUrl = uploadResult?.url || dataUrl;

          setGuides(prev => prev.map(g =>
            g.id === guide.id ? { ...g, localImageUrl: dataUrl, imageUrl: finalUrl } : g
          ));
          setImageError(prev => ({ ...prev, [guide.id]: false }));

          // Auto-save to database
          const updatedGuide = { ...guide, imageUrl: finalUrl };
          await saveGuide(updatedGuide);

          toast.success(`Portrait generated for "${guide.name}"`, { id: `gen-${guide.id}` });
        } else {
          toast.error(`Failed to generate portrait for "${guide.name}"`, { id: `gen-${guide.id}` });
        }
      } catch (error) {
        console.error(`Error generating portrait for ${guide.name}:`, error);
        toast.error(`Error generating portrait for "${guide.name}"`, { id: `gen-${guide.id}` });
      }

      // Rate limit - wait between requests
      if (i < guidesNeedingImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setIsGeneratingAll(false);
    setGenerationProgress({ current: 0, total: 0 });
    triggerDataRefresh('GUIDES');
    toast.success('Portrait generation complete!');
  };

  const handleTestVoice = async () => {
    if (!selectedGuide?.elevenLabsVoiceId) {
      toast.error('No voice selected');
      return;
    }

    setIsTesting(true);
    try {
      const text = selectedGuide.firstMessage || selectedGuide.introQuote || 'Hello, I am your guide.';
      const audioUrl = await generateSpeech({
        voiceId: selectedGuide.elevenLabsVoiceId,
        text,
        stability: selectedGuide.voiceStability,
        similarityBoost: selectedGuide.voiceSimilarity,
        style: selectedGuide.voiceStyle,
      });

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        toast.success('Playing voice sample');
      } else {
        toast.error('Failed to generate speech');
      }
    } catch (error) {
      console.error('Voice test error:', error);
      toast.error('Error testing voice');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGuide) return;

    setIsSaving(true);
    try {
      // Always try Supabase first
      const success = await saveGuide(selectedGuide);
      if (success) {
        // Also save reordering
        await reorderGuides(guides.map(g => g.id));
        toast.success('Guide saved to cloud', {
          description: 'Changes synced to Supabase database.',
        });
      } else {
        // Fallback message - saveGuide already saves to localStorage on failure
        toast.success('Guide saved locally', {
          description: 'Supabase unavailable - saved to browser storage.',
        });
      }

      // Trigger refresh for frontend components
      triggerDataRefresh('GUIDES');
    } catch (error) {
      console.error('Save error:', error);
      // saveGuide handles its own fallback, so this is a real error
      toast.error('Error saving guide', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Always try Supabase first
      let allSuccess = true;
      for (const guide of guides) {
        const success = await saveGuide(guide);
        if (!success) allSuccess = false;
      }
      await reorderGuides(guides.map(g => g.id));

      // Trigger refresh for frontend components
      triggerDataRefresh('GUIDES');

      if (allSuccess) {
        toast.success('All guides saved to cloud', {
          description: 'Changes synced to Supabase database.',
        });
      } else {
        toast.success('Guides saved locally', {
          description: 'Supabase unavailable - saved to browser storage.',
        });
      }
    } catch (error) {
      console.error('Save all error:', error);
      toast.error('Error saving guides', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGuide = () => {
    const newId = `guide-${Date.now()}`;
    const newGuide: EditableGuide = {
      id: newId,
      name: 'New Guide',
      title: 'Historical Figure',
      era: 'Unknown Era',
      specialty: 'History',
      avatar: '📚',
      imageUrl: '',
      introQuote: 'Enter an inspiring quote here.',
      welcomeMessage: 'Welcome message for this guide.',
      personality: 'wise',
      primaryColor: 'blue',
      secondaryColor: 'slate',
      catchphrases: ['Catchphrase 1', 'Catchphrase 2'],
      displayOrder: guides.length,
      knowledgeBase: '',
      firstMessage: '',
      stylePrompt: '',
    };
    setGuides(prev => [...prev, newGuide]);
    setSelectedId(newId);
    toast.success('New guide created');
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-foreground">Guide Editor</h1>
          <p className="text-muted-foreground mt-1">
            Manage spirit guides, voices, and AI imagery
            {dbReady && <span className="ml-2 text-emerald-500 text-xs">(Database connected)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateAllPortraits}
            disabled={isGeneratingAll || !isGeminiConfigured()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {generationProgress.current}/{generationProgress.total}
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate All Art
              </>
            )}
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Database size={18} />
            Save All
          </button>
          <button
            onClick={handleAddGuide}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Guide
          </button>
        </div>
      </div>

      {/* Reorderable Guide Grid */}
      <Reorder.Group
        axis="x"
        values={guides}
        onReorder={handleReorder}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {guides.map((guide, index) => (
          <Reorder.Item
            key={guide.id}
            value={guide}
            className="relative"
          >
            <GuideCard
              guide={guide}
              index={index + 1}
              isSelected={guide.id === selectedId}
              onSelect={() => handleSelectGuide(guide.id)}
              hasError={imageError[guide.id]}
              onImageError={() => setImageError(prev => ({ ...prev, [guide.id]: true }))}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Editor Panel */}
      <AnimatePresence mode="wait">
        {selectedGuide && (
          <motion.div
            key={selectedGuide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-xl"
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedGuide.avatar}</span>
                <div>
                  <h2 className="text-lg font-semibold">{selectedGuide.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedGuide.title}</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Guide
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: 'basic', label: 'Basic Info', icon: Users },
                { id: 'voice', label: 'Voice & AI', icon: Mic },
                { id: 'ai', label: 'Character Style', icon: Palette },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground block">Portrait Image</label>
                    <div className="aspect-square rounded-xl bg-muted border-2 border-dashed border-border overflow-hidden relative">
                      {(selectedGuide.localImageUrl || selectedGuide.imageUrl) && !imageError[selectedGuide.id] ? (
                        <img
                          src={selectedGuide.localImageUrl || selectedGuide.imageUrl}
                          alt={selectedGuide.name}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(prev => ({ ...prev, [selectedGuide.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <span className="text-6xl mb-2">{selectedGuide.avatar}</span>
                          <p className="text-sm">No image set</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                      >
                        <Upload size={16} />
                        Upload
                      </button>
                      <button
                        onClick={handleGenerateImage}
                        disabled={isGenerating || !isGeminiConfigured()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        Generate
                      </button>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Avatar Emoji</label>
                      <input
                        type="text"
                        value={selectedGuide.avatar}
                        onChange={(e) => handleUpdateGuide('avatar', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-2xl text-center"
                      />
                    </div>

                    {/* Video Uploads Section */}
                    <div className="pt-4 border-t border-border">
                      <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
                        <Video size={16} className="text-primary" />
                        Guide Videos
                      </label>

                      {/* Intro Video (Selection Preview) */}
                      <div className="mb-3">
                        <label className="text-xs text-muted-foreground mb-1.5 block">Intro Video (5-15s preview)</label>
                        {selectedGuide.introVideoUrl ? (
                          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                            <video
                              src={selectedGuide.introVideoUrl}
                              className="w-full h-full object-cover"
                              muted
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                            <div className="absolute top-1 right-1 flex gap-1">
                              <button
                                onClick={() => setPreviewingVideo(selectedGuide.introVideoUrl!)}
                                className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-white"
                              >
                                <Play size={12} />
                              </button>
                              <button
                                onClick={() => clearVideo('introVideo')}
                                className="p-1.5 rounded bg-black/60 hover:bg-red-600 text-white"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openMediaPicker('introVideo')}
                            className="w-full py-3 rounded-lg border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground text-xs transition-colors"
                          >
                            + Add intro video
                          </button>
                        )}
                      </div>

                      {/* Welcome Video */}
                      <div className="mb-3">
                        <label className="text-xs text-muted-foreground mb-1.5 block">Welcome Video (after selection)</label>
                        {selectedGuide.welcomeVideoUrl ? (
                          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                            <video
                              src={selectedGuide.welcomeVideoUrl}
                              className="w-full h-full object-cover"
                              muted
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                            <div className="absolute top-1 right-1 flex gap-1">
                              <button
                                onClick={() => setPreviewingVideo(selectedGuide.welcomeVideoUrl!)}
                                className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-white"
                              >
                                <Play size={12} />
                              </button>
                              <button
                                onClick={() => clearVideo('welcomeVideo')}
                                className="p-1.5 rounded bg-black/60 hover:bg-red-600 text-white"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openMediaPicker('welcomeVideo')}
                            className="w-full py-3 rounded-lg border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground text-xs transition-colors"
                          >
                            + Add welcome video
                          </button>
                        )}
                      </div>

                      {/* Celebration Video */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Celebration Video (milestones)</label>
                        {selectedGuide.celebrationVideoUrl ? (
                          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                            <video
                              src={selectedGuide.celebrationVideoUrl}
                              className="w-full h-full object-cover"
                              muted
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                            <div className="absolute top-1 right-1 flex gap-1">
                              <button
                                onClick={() => setPreviewingVideo(selectedGuide.celebrationVideoUrl!)}
                                className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-white"
                              >
                                <Play size={12} />
                              </button>
                              <button
                                onClick={() => clearVideo('celebrationVideo')}
                                className="p-1.5 rounded bg-black/60 hover:bg-red-600 text-white"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openMediaPicker('celebrationVideo')}
                            className="w-full py-3 rounded-lg border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground text-xs transition-colors"
                          >
                            + Add celebration video
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                      <input
                        type="text"
                        value={selectedGuide.name}
                        onChange={(e) => handleUpdateGuide('name', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                      <input
                        type="text"
                        value={selectedGuide.title}
                        onChange={(e) => handleUpdateGuide('title', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Era</label>
                      <input
                        type="text"
                        value={selectedGuide.era}
                        onChange={(e) => handleUpdateGuide('era', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Specialty</label>
                      <input
                        type="text"
                        value={selectedGuide.specialty}
                        onChange={(e) => handleUpdateGuide('specialty', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Personality</label>
                        <select
                          value={selectedGuide.personality}
                          onChange={(e) => handleUpdateGuide('personality', e.target.value as SpiritGuide['personality'])}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                        >
                          {personalityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Primary Color</label>
                        <select
                          value={selectedGuide.primaryColor}
                          onChange={(e) => handleUpdateGuide('primaryColor', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                        >
                          {colorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quotes & Messages */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Intro Quote</label>
                      <textarea
                        value={selectedGuide.introQuote}
                        onChange={(e) => handleUpdateGuide('introQuote', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Welcome Message</label>
                      <textarea
                        value={selectedGuide.welcomeMessage}
                        onChange={(e) => handleUpdateGuide('welcomeMessage', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                      />
                    </div>

                    {/* Catchphrases */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-foreground">Catchphrases</label>
                        <button onClick={handleAddCatchphrase} className="text-xs text-primary hover:underline">+ Add</button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedGuide.catchphrases.map((phrase, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={phrase}
                              onChange={(e) => handleUpdateCatchphrase(index, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
                            />
                            <button onClick={() => handleRemoveCatchphrase(index)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice & AI Tab */}
              {activeTab === 'voice' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Voice Configuration */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Mic size={18} className="text-primary" />
                      ElevenLabs Voice
                    </h3>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Voice</label>
                      {availableVoices.length > 0 ? (
                        <select
                          value={selectedGuide.elevenLabsVoiceId || ''}
                          onChange={(e) => handleUpdateGuide('elevenLabsVoiceId', e.target.value || undefined)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                        >
                          <option value="">Select a voice...</option>
                          {availableVoices.map(v => (
                            <option key={v.voice_id} value={v.voice_id}>{v.name} ({v.category})</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No voices loaded. Add your ElevenLabs API key in settings or enter a voice ID below.</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Or enter Voice ID manually
                      </label>
                      <input
                        type="text"
                        value={selectedGuide.elevenLabsVoiceId || ''}
                        onChange={(e) => handleUpdateGuide('elevenLabsVoiceId', e.target.value || undefined)}
                        placeholder="e.g., 21m00Tcm4TlvDq8ikWAM"
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use any public ElevenLabs voice ID. Find voices at <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ElevenLabs Voice Library</a>
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        First Message (what they say when selected)
                      </label>
                      <textarea
                        value={selectedGuide.firstMessage || ''}
                        onChange={(e) => handleUpdateGuide('firstMessage', e.target.value)}
                        rows={3}
                        placeholder="Welcome, seeker of truth. I am Socrates, and I shall be your guide..."
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Stability: {Math.round((selectedGuide.voiceStability || 0.5) * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={selectedGuide.voiceStability || 0.5}
                          onChange={(e) => handleUpdateGuide('voiceStability', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Clarity: {Math.round((selectedGuide.voiceSimilarity || 0.75) * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={selectedGuide.voiceSimilarity || 0.75}
                          onChange={(e) => handleUpdateGuide('voiceSimilarity', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleTestVoice}
                      disabled={isTesting || !selectedGuide.elevenLabsVoiceId}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      Test Voice
                    </button>
                  </div>

                  {/* Knowledge Base */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Brain size={18} className="text-primary" />
                      Knowledge Base (Character Backstory)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This information helps AI understand the character's background, expertise, and how they should respond.
                    </p>
                    <textarea
                      value={selectedGuide.knowledgeBase || ''}
                      onChange={(e) => handleUpdateGuide('knowledgeBase', e.target.value)}
                      rows={12}
                      placeholder={`${selectedGuide.name} was born in... Known for... Their teaching style is...`}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Character Style Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Palette size={18} className="text-primary" />
                      Character Style Prompt
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This prompt is used when generating AI images of this character. Use @{selectedGuide.name} in the generator to reference this style.
                    </p>
                    <textarea
                      value={selectedGuide.stylePrompt || ''}
                      onChange={(e) => handleUpdateGuide('stylePrompt', e.target.value)}
                      rows={4}
                      placeholder="elderly Greek philosopher, white beard, bald head, toga, contemplative expression, classical Greek setting..."
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                    />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">How to use @ mentions</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      In the Media Studio generator, type <code className="bg-muted px-1 rounded">@{selectedGuide.name}</code> to automatically include this character's style prompt.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Example: <code className="bg-muted px-1 rounded">@{selectedGuide.name} teaching students in the agora</code>
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Reference Images</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add reference images to maintain visual consistency across generated content.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {/* Placeholder for reference images - would be populated from database */}
                      <button className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedGuide && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ImageIcon size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Drag guides to reorder. Select a guide to edit.</p>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['video']}
        title={
          mediaPickerType === 'introVideo' ? 'Select Intro Video'
          : mediaPickerType === 'welcomeVideo' ? 'Select Welcome Video'
          : 'Select Celebration Video'
        }
      />

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={previewingVideo}
                className="w-full rounded-xl"
                controls
                autoPlay
              />
              <button
                onClick={() => setPreviewingVideo(null)}
                className="absolute -top-10 right-0 p-2 text-white hover:text-white/80"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Guide Card Component
function GuideCard({
  guide,
  index,
  isSelected,
  onSelect,
  hasError,
  onImageError
}: {
  guide: EditableGuide;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  hasError: boolean;
  onImageError: () => void;
}) {
  const imageUrl = guide.localImageUrl || guide.imageUrl;

  return (
    <div
      onClick={onSelect}
      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Drag handle */}
      <div className="absolute top-2 left-2 z-10 p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} className="text-white" />
      </div>

      {/* Order number */}
      <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
        <span className="text-white text-xs font-bold">{index}</span>
      </div>

      {imageUrl && !hasError ? (
        <img src={imageUrl} alt={guide.name} className="w-full h-full object-cover" onError={onImageError} />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-4xl">{guide.avatar}</span>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">{guide.name}</p>
        <p className="text-white/70 text-xs truncate">{guide.title}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && <div className="absolute inset-0 border-4 border-primary rounded-xl pointer-events-none" />}
    </div>
  );
}
