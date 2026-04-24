/**
 * JourneyUIEditor - Admin component for managing Journey tab artwork
 * Allows uploading/generating custom images for Featured Journey, Rank badges, Pantheon, and Trophy Room
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image, Upload, Loader2, Cloud, CloudOff, Wand2, Trash2,
  Trophy, Crown, Sparkles, Map, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { generateImage, base64ToDataUrl, isGeminiConfigured, buildHistoricalPrompt } from '@/lib/gemini';
import { uploadToFirebaseStorage } from '@/lib/firebaseStorage';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getJourneyUIAssets,
  saveJourneyUIAssets,
  subscribeToJourneyUIAssets,
  type FirestoreJourneyUIAssets,
} from '@/lib/firestore';
import { MediaPicker } from './MediaPicker';

// Rank tiers for badge images
const RANK_TIERS = [
  { id: 'bronze', label: 'Bronze', color: 'from-amber-600 to-amber-800' },
  { id: 'silver', label: 'Silver', color: 'from-slate-300 to-slate-500' },
  { id: 'gold', label: 'Gold', color: 'from-yellow-400 to-yellow-600' },
  { id: 'platinum', label: 'Platinum', color: 'from-cyan-300 to-cyan-500' },
  { id: 'diamond', label: 'Diamond', color: 'from-blue-400 to-purple-500' },
  { id: 'legendary', label: 'Legendary', color: 'from-amber-400 via-amber-200 to-amber-400' },
];

// UI Sections that can have custom artwork
const UI_SECTIONS = [
  {
    id: 'featuredJourney',
    label: 'Featured Journey',
    description: 'Hero background for the featured journey section (Pearl Harbor)',
    icon: Map,
    imageKey: 'featuredJourneyImage' as const,
    iconKey: 'featuredJourneyIcon' as const,
    aiPrompt: 'Dramatic aerial view of Pearl Harbor on December 7, 1941, with USS Arizona and battleship row, early morning light, smoke rising, cinematic historical illustration, dark moody atmosphere',
  },
  {
    id: 'pantheon',
    label: 'The Pantheon',
    description: 'Icon/background for the Pantheon souvenir collection',
    icon: Crown,
    imageKey: 'pantheonImage' as const,
    iconKey: 'pantheonIcon' as const,
    aiPrompt: 'Ancient Greek temple interior with golden artifacts on pedestals, marble columns, dramatic lighting through ceiling oculus, museum display aesthetic, warm golden tones',
  },
  {
    id: 'trophyRoom',
    label: 'Trophy Room',
    description: 'Icon/background for the Trophy Room achievements',
    icon: Trophy,
    imageKey: 'trophyRoomImage' as const,
    iconKey: 'trophyRoomIcon' as const,
    aiPrompt: 'Ornate trophy room with golden trophies and medals on velvet displays, mahogany wood shelving, warm candlelight, prestigious award display aesthetic',
  },
];

export default function JourneyUIEditor() {
  const [assets, setAssets] = useState<FirestoreJourneyUIAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState<string | null>(null);
  const [selectedRankTier, setSelectedRankTier] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<string | null>(null);

  const isSyncedToCloud = isFirebaseConfigured();
  const geminiConfigured = isGeminiConfigured();

  // Load assets from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToJourneyUIAssets((data) => {
      setAssets(data || { id: 'journeyUIAssets' });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTarget) return;

    setIsUploading(currentUploadTarget);
    toast.loading('Uploading image...', { id: 'upload' });

    try {
      let uploadUrl: string | null = null;

      // Check if this is a rank badge upload
      const isRankBadge = currentUploadTarget.startsWith('rank-');
      const storagePath = isRankBadge ? 'journey-ui/ranks' : 'journey-ui';

      if (isFirebaseConfigured()) {
        uploadUrl = await uploadToFirebaseStorage(file, storagePath);
      }

      if (uploadUrl) {
        if (isRankBadge) {
          // Handle rank badge upload - save to nested rankBadgeImages object
          const tierId = currentUploadTarget.replace('rank-', '');
          const currentBadges = assets?.rankBadgeImages || {};
          await saveJourneyUIAssets({
            ...assets,
            rankBadgeImages: { ...currentBadges, [tierId]: uploadUrl },
          });
        } else {
          // Handle regular asset upload
          await saveAsset(currentUploadTarget, uploadUrl);
        }
        toast.success('Image uploaded!', { id: 'upload' });
      } else {
        toast.error('Upload failed', { id: 'upload' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', { id: 'upload' });
    } finally {
      setIsUploading(null);
      setCurrentUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMediaSelect = async (url: string) => {
    if (!mediaPickerOpen) return;

    setIsUploading(mediaPickerOpen);
    try {
      await saveAsset(mediaPickerOpen, url);
      toast.success('Image selected!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsUploading(null);
      setMediaPickerOpen(null);
    }
  };

  const handleGenerateImage = async (sectionId: string, prompt: string) => {
    if (!geminiConfigured) {
      toast.error('Gemini API not configured');
      return;
    }

    setIsGenerating(sectionId);
    toast.loading('Generating image with AI...', { id: 'generate' });

    try {
      const result = await generateImage({
        prompt,
        aspectRatio: sectionId === 'featuredJourney' ? '16:9' : '1:1',
        style: 'cinematic',
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

        // Upload to Firebase Storage
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], `${sectionId}-${Date.now()}.png`, { type: 'image/png' });
        const uploadUrl = await uploadToFirebaseStorage(file, 'journey-ui');

        if (uploadUrl) {
          const section = UI_SECTIONS.find(s => s.id === sectionId);
          if (section) {
            await saveAsset(section.imageKey, uploadUrl);
          }
          toast.success('Image generated and saved!', { id: 'generate' });
        }
      } else {
        toast.error('Generation failed', { id: 'generate' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed', { id: 'generate' });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateRankBadge = async (tierId: string) => {
    if (!geminiConfigured) {
      toast.error('Gemini API not configured');
      return;
    }

    const tier = RANK_TIERS.find(t => t.id === tierId);
    if (!tier) return;

    setIsGenerating(`rank-${tierId}`);
    toast.loading(`Generating ${tier.label} badge...`, { id: 'generate' });

    try {
      const prompt = `Ornate ${tier.label.toLowerCase()} medal badge icon, ${tier.label === 'Legendary' ? 'glowing golden with mystical aura' : `${tier.label.toLowerCase()} metallic finish`}, intricate engravings, achievement badge design, game UI asset, transparent background style, centered composition`;

      const result = await generateImage({
        prompt,
        aspectRatio: '1:1',
        style: 'icon',
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], `rank-${tierId}-${Date.now()}.png`, { type: 'image/png' });
        const uploadUrl = await uploadToFirebaseStorage(file, 'journey-ui/ranks');

        if (uploadUrl) {
          const currentBadges = assets?.rankBadgeImages || {};
          await saveJourneyUIAssets({
            ...assets,
            rankBadgeImages: { ...currentBadges, [tierId]: uploadUrl },
          });
          toast.success(`${tier.label} badge generated!`, { id: 'generate' });
        }
      } else {
        toast.error('Generation failed', { id: 'generate' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed', { id: 'generate' });
    } finally {
      setIsGenerating(null);
    }
  };

  const saveAsset = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      await saveJourneyUIAssets({
        ...assets,
        [key]: value,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAsset = async (key: string) => {
    if (!assets) return;

    setIsSaving(true);
    try {
      const updated = { ...assets };
      delete (updated as Record<string, unknown>)[key];
      await saveJourneyUIAssets(updated);
      toast.success('Image removed');
    } catch (error) {
      toast.error('Failed to remove');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveRankBadge = async (tierId: string) => {
    if (!assets?.rankBadgeImages) return;

    setIsSaving(true);
    try {
      const { [tierId]: _, ...rest } = assets.rankBadgeImages;
      await saveJourneyUIAssets({
        ...assets,
        rankBadgeImages: rest,
      });
      toast.success('Badge removed');
    } catch (error) {
      toast.error('Failed to remove');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileUpload = (targetKey: string) => {
    setCurrentUploadTarget(targetKey);
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-editorial text-3xl font-bold text-foreground">Journey UI Artwork</h1>
            <p className="text-muted-foreground mt-1">Customize images for the Journey tab sections</p>
          </div>
          <div className="flex items-center gap-2">
            {isSyncedToCloud ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Cloud size={14} />
                Synced to Firebase
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <CloudOff size={14} />
                Firebase not configured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gemini Status */}
      {!geminiConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-200">
            <Wand2 className="inline mr-2" size={16} />
            Gemini API not configured. Add VITE_GEMINI_API_KEY to your .env file for AI image generation.
          </p>
        </div>
      )}

      {/* UI Sections */}
      <div className="space-y-6">
        {UI_SECTIONS.map((section) => {
          const Icon = section.icon;
          const imageUrl = assets?.[section.imageKey];
          const isUploadingThis = isUploading === section.imageKey;
          const isGeneratingThis = isGenerating === section.id;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={section.label}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveAsset(section.imageKey)}
                        className="absolute top-1 right-1 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  {(isUploadingThis || isGeneratingThis) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={24} />
                    </div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Icon size={18} className="text-primary" />
                    {section.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => triggerFileUpload(section.imageKey)}
                      disabled={isUploadingThis}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Upload size={16} />
                      Upload
                    </button>

                    <button
                      onClick={() => setMediaPickerOpen(section.imageKey)}
                      disabled={isUploadingThis}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Image size={16} />
                      Media Library
                    </button>

                    {geminiConfigured && (
                      <button
                        onClick={() => handleGenerateImage(section.id, section.aiPrompt)}
                        disabled={isGeneratingThis}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <Wand2 size={16} />
                        Generate with AI
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Rank Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-primary" />
            Rank Badge Images
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Custom badge images for each rank tier (replaces emoji icons)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {RANK_TIERS.map((tier) => {
              const badgeUrl = assets?.rankBadgeImages?.[tier.id];
              const isGeneratingThis = isGenerating === `rank-${tier.id}`;
              const isUploadingThis = isUploading === `rank-${tier.id}`;

              return (
                <div key={tier.id} className="text-center">
                  {/* Badge Preview */}
                  <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden bg-muted mb-2">
                    {badgeUrl ? (
                      <>
                        <img
                          src={badgeUrl}
                          alt={tier.label}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveRankBadge(tier.id)}
                          className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                        <Crown size={24} className="text-white/80" />
                      </div>
                    )}
                    {(isGeneratingThis || isUploadingThis) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={20} />
                      </div>
                    )}
                  </div>

                  {/* Tier Label */}
                  <p className="text-sm font-medium text-foreground mb-2">{tier.label}</p>

                  {/* Actions */}
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => {
                        setCurrentUploadTarget(`rank-${tier.id}`);
                        setSelectedRankTier(tier.id);
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingThis}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                      title="Upload"
                    >
                      <Upload size={14} />
                    </button>

                    {geminiConfigured && (
                      <button
                        onClick={() => handleGenerateRankBadge(tier.id)}
                        disabled={isGeneratingThis}
                        className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors disabled:opacity-50"
                        title="Generate with AI"
                      >
                        <Wand2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPicker
          isOpen={true}
          onClose={() => setMediaPickerOpen(null)}
          onSelect={handleMediaSelect}
          title="Select Image"
        />
      )}
    </div>
  );
}
