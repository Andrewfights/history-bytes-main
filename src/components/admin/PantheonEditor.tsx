/**
 * PantheonEditor - Admin tool for managing Pantheon souvenirs
 *
 * Create/edit souvenirs for each historical world, generate tier images
 * using Gemini (Nano Banana), and manage the souvenir collection.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Wand2, Upload, Save, Trash2, Plus, Eye, Download,
  Loader2, AlertCircle, Check, ChevronDown, ChevronUp, Image,
  Sparkles, Edit2, X, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { generateImage, isGeminiConfigured, base64ToDataUrl, downloadBase64Image } from '@/lib/gemini';
import type { Souvenir, SouvenirTier, PantheonWorld } from '@/types';
import { SOUVENIR_TIER_NAMES, SOUVENIR_TIER_COLORS } from '@/types';
import { PANTHEON_WORLDS, PANTHEON_SOUVENIRS } from '@/data/pantheonSouvenirs';
import { TierBadge, DisplayCase } from '@/components/journey/pantheon';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getPantheonSouvenirs,
  savePantheonSouvenir,
  deletePantheonSouvenir,
  getPantheonSouvenirImages,
  savePantheonSouvenirImages,
  deletePantheonSouvenirImages,
  subscribeToPantheonSouvenirs,
  subscribeToPantheonSouvenirImages,
  type FirestorePantheonSouvenir,
  type FirestorePantheonSouvenirImages,
} from '@/lib/firestore';
import { uploadFile } from '@/lib/supabase';

interface AdminSouvenir extends Souvenir {
  isCustom?: boolean;
}

interface SouvenirImages {
  [souvenirId: string]: {
    [tier in SouvenirTier]?: string;
  };
}

// Convert Firestore souvenir to AdminSouvenir
function firestoreToAdminSouvenir(fs: FirestorePantheonSouvenir): AdminSouvenir {
  // Find the default souvenir for placeholder images
  const defaultSouvenir = PANTHEON_SOUVENIRS.find(s => s.worldId === fs.worldId);
  return {
    id: fs.id,
    worldId: fs.worldId,
    name: fs.name,
    description: fs.description,
    significance: fs.significance,
    images: defaultSouvenir?.images || {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
    isCustom: fs.isCustom,
  };
}

// Convert Firestore images to SouvenirImages
function firestoreToSouvenirImages(fsImages: FirestorePantheonSouvenirImages[]): SouvenirImages {
  const result: SouvenirImages = {};
  for (const img of fsImages) {
    result[img.id] = {};
    if (img.gray) result[img.id].gray = img.gray;
    if (img.bronze) result[img.id].bronze = img.bronze;
    if (img.silver) result[img.id].silver = img.silver;
    if (img.gold) result[img.id].gold = img.gold;
  }
  return result;
}

// Preset prompts for generating souvenir images at each tier
const SOUVENIR_TIER_PROMPTS: Record<SouvenirTier, (name: string, description: string) => string> = {
  gray: (name, desc) => `Museum artifact photograph: ${name}, ${desc}.
    Matte pewter gray finish, understated museum replica quality,
    soft diffused lighting, neutral background,
    archival documentation style, subtle shadows,
    professional artifact photography, 8K detail`,

  bronze: (name, desc) => `Premium artifact: ${name}, ${desc}.
    Polished bronze finish with warm amber patina,
    memorial sculpture quality, warm golden hour lighting,
    subtle reflections, museum display pedestal,
    rich warm tones, dignified presentation, 8K detail`,

  silver: (name, desc) => `Prestigious artifact: ${name}, ${desc}.
    Polished silver finish with cool blue-white highlights,
    scholarly elegance, crisp studio lighting,
    pristine condition, academic institution quality,
    sophisticated cool tones, 8K detail`,

  gold: (name, desc) => `Legendary artifact: ${name}, ${desc}.
    Luminous 24K gold finish with radiant glow effect,
    Rhodes Scholar prestige, ethereal golden light emanating,
    subtle particle effects, divine quality,
    warm golden aura, masterpiece presentation, 8K detail`,
};

// World-specific souvenir suggestions (keyed by era ID from HISTORICAL_ERAS)
const WORLD_SOUVENIR_SUGGESTIONS: Record<string, { name: string; description: string; significance: string }[]> = {
  'ww2': [
    { name: 'M1 Combat Helmet', description: 'The iconic "steel pot" worn by every American GI from Normandy to Okinawa', significance: 'Symbol of the American soldier across every theater' },
    { name: 'Dog Tags', description: 'Military identification tags worn by all service members', significance: 'Personal identity in the chaos of war' },
    { name: 'Purple Heart Medal', description: 'Military decoration awarded to those wounded or killed in service', significance: 'Honor and sacrifice' },
  ],
  'american-revolution': [
    { name: 'Flintlock Musket', description: 'The weapon that won American independence', significance: 'Symbol of the citizen soldier' },
    { name: 'Tricorn Hat', description: 'Iconic three-cornered hat of the Revolutionary era', significance: 'Spirit of 1776' },
    { name: 'Liberty Bell', description: 'Iconic symbol of American independence', significance: 'Freedom and democracy' },
  ],
  'ancient-egypt': [
    { name: 'Ankh Amulet', description: 'Ancient Egyptian symbol of eternal life', significance: 'Life, death, and the afterlife' },
    { name: 'Scarab Beetle', description: 'Sacred symbol of rebirth and transformation', significance: 'Divine protection' },
    { name: 'Eye of Horus', description: 'Ancient symbol of protection and royal power', significance: 'Divine watchfulness' },
  ],
  'ancient-rome': [
    { name: 'Gladius Sword', description: 'The short sword that built an empire', significance: 'Roman military might' },
    { name: 'Laurel Wreath', description: 'Crown of victory worn by emperors and champions', significance: 'Glory and triumph' },
    { name: 'SPQR Eagle Standard', description: 'The sacred eagle carried by Roman legions', significance: 'Roman identity and honor' },
  ],
  'civil-war': [
    { name: 'Union Kepi', description: 'The distinctive cap worn by Union soldiers', significance: 'Unity and preservation' },
    { name: 'Cavalry Saber', description: 'The curved sword of mounted troops', significance: 'Honor and duty' },
    { name: 'Hardtack', description: 'The simple cracker that sustained armies', significance: 'Endurance and sacrifice' },
  ],
  'ancient-greece': [
    { name: 'Corinthian Helmet', description: 'Bronze helmet worn by Greek hoplites', significance: 'Courage and democracy' },
    { name: 'Olive Wreath', description: 'Crown awarded to Olympic victors', significance: 'Athletic excellence' },
    { name: 'Athenian Owl Coin', description: 'Silver tetradrachm of Athens', significance: 'Wisdom and trade' },
  ],
  'medieval': [
    { name: 'Crusader Sword', description: 'Longsword carried to the Holy Land', significance: 'Faith and chivalry' },
    { name: 'Chain Mail', description: 'Interlocking rings of protective armor', significance: 'Knightly defense' },
    { name: 'Castle Key', description: 'Iron key to a medieval fortress', significance: 'Power and security' },
  ],
  'renaissance': [
    { name: "Da Vinci's Compass", description: 'Mathematical instrument of the masters', significance: 'Art meets science' },
    { name: 'Quill Pen', description: 'The writing instrument of scholars', significance: 'Knowledge and creation' },
    { name: 'Globe', description: 'Model of the newly mapped world', significance: 'Discovery and understanding' },
  ],
  'french-revolution': [
    { name: 'Tricolor Cockade', description: 'Revolutionary rosette of the people', significance: 'Liberty, equality, fraternity' },
    { name: 'Bastille Key', description: 'Key from the fallen prison fortress', significance: 'End of tyranny' },
    { name: 'Phrygian Cap', description: 'Red cap of freed slaves and revolution', significance: 'Freedom and liberation' },
  ],
  'industrial-revolution': [
    { name: 'Steam Engine Gear', description: 'Iron gear powering the machines', significance: 'Innovation and progress' },
    { name: 'Spinning Jenny Spool', description: 'Thread from the textile revolution', significance: 'Industry and labor' },
    { name: 'Railroad Spike', description: 'The spike connecting the nation', significance: 'Transportation and expansion' },
  ],
  'exploration': [
    { name: "Navigator's Compass", description: 'Instrument guiding ships across oceans', significance: 'Discovery and courage' },
    { name: 'Spyglass', description: 'Telescope scanning distant horizons', significance: 'Vision and exploration' },
    { name: 'Astrolabe', description: 'Ancient navigation device', significance: 'Stars and navigation' },
  ],
  'vikings': [
    { name: 'Viking Helmet', description: 'Spectacle-guard helmet of Norse warriors', significance: 'Warrior spirit' },
    { name: "Thor's Hammer", description: 'Mjolnir pendant worn by warriors', significance: 'Divine protection' },
    { name: 'Rune Stone', description: 'Carved stone with runic inscriptions', significance: 'Ancient wisdom' },
  ],
  'ww1': [
    { name: 'Brodie Helmet', description: 'Steel helmet of the trenches', significance: 'Endurance in the mud' },
    { name: 'Gas Mask', description: 'Protection from chemical warfare', significance: 'Survival and horror' },
    { name: 'Trench Whistle', description: 'Signal whistle for the charge', significance: 'Courage under fire' },
  ],
  'cold-war': [
    { name: 'CIA Star Badge', description: 'Intelligence service insignia', significance: 'Espionage and secrets' },
    { name: 'Berlin Wall Fragment', description: 'Piece of the divided city', significance: 'Freedom vs tyranny' },
    { name: 'Space Race Medal', description: 'Achievement in the cosmic race', significance: 'Innovation and rivalry' },
  ],
  'mesopotamia': [
    { name: 'Cuneiform Tablet', description: 'Clay tablet with the first writing', significance: 'Dawn of civilization' },
    { name: 'Cylinder Seal', description: 'Personal seal for documents', significance: 'Identity and authority' },
    { name: 'Ziggurat Brick', description: 'Brick from the great temples', significance: 'Faith and architecture' },
  ],
};


export default function PantheonEditor() {
  const [souvenirs, setSouvenirs] = useState<AdminSouvenir[]>([...PANTHEON_SOUVENIRS]);
  const [souvenirImages, setSouvenirImages] = useState<SouvenirImages>({});
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [editingSouvenir, setEditingSouvenir] = useState<AdminSouvenir | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingTier, setGeneratingTier] = useState<SouvenirTier | null>(null);
  const [previewTier, setPreviewTier] = useState<SouvenirTier>('gold');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);

  const geminiConfigured = isGeminiConfigured();

  // Load from Firebase and subscribe to updates
  useEffect(() => {
    let unsubSouvenirs: (() => void) | undefined;
    let unsubImages: (() => void) | undefined;

    const loadData = async () => {
      setIsLoading(true);

      if (isFirebaseConfigured()) {
        setIsSyncedToCloud(true);

        // Load initial data
        try {
          const [fsSouvenirs, fsImages] = await Promise.all([
            getPantheonSouvenirs(),
            getPantheonSouvenirImages(),
          ]);

          if (fsSouvenirs.length > 0) {
            setSouvenirs(fsSouvenirs.map(firestoreToAdminSouvenir));
          }
          setSouvenirImages(firestoreToSouvenirImages(fsImages));
        } catch (error) {
          console.error('Failed to load from Firestore:', error);
        }

        // Subscribe to real-time updates
        unsubSouvenirs = subscribeToPantheonSouvenirs((fsSouvenirs) => {
          if (fsSouvenirs.length > 0) {
            setSouvenirs(fsSouvenirs.map(firestoreToAdminSouvenir));
          }
        });

        unsubImages = subscribeToPantheonSouvenirImages((fsImages) => {
          setSouvenirImages(firestoreToSouvenirImages(fsImages));
        });
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      if (unsubSouvenirs) unsubSouvenirs();
      if (unsubImages) unsubImages();
    };
  }, []);

  const selectedWorld = PANTHEON_WORLDS.find(w => w.id === selectedWorldId);
  const selectedSouvenir = selectedWorld
    ? souvenirs.find(s => s.worldId === selectedWorld.id)
    : null;

  // Get image for a souvenir tier (custom or default)
  const getImageForTier = (souvenirId: string, tier: SouvenirTier): string => {
    const customImage = souvenirImages[souvenirId]?.[tier];
    if (customImage) return customImage;

    const souvenir = souvenirs.find(s => s.id === souvenirId);
    return souvenir?.images[tier] || '/assets/pantheon/placeholder.png';
  };

  // Generate image for a specific tier - saves to Firebase
  const handleGenerateImage = async (souvenir: AdminSouvenir, tier: SouvenirTier) => {
    if (!geminiConfigured) {
      toast.error('Gemini API not configured. Add your key in Profile Settings.');
      return;
    }

    if (!isSyncedToCloud) {
      toast.error('Firebase not configured. Cannot save images.');
      return;
    }

    setGeneratingTier(tier);
    toast.loading(`Generating ${SOUVENIR_TIER_NAMES[tier]} image...`, { id: 'generating' });

    try {
      const prompt = SOUVENIR_TIER_PROMPTS[tier](souvenir.name, souvenir.description);

      const result = await generateImage({
        prompt,
        aspectRatio: '1:1',
        style: 'cinematic',
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

        // Upload to Firebase Storage
        let imageUrl = dataUrl;
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `pantheon-${souvenir.id}-${tier}.png`, { type: result.mimeType });
          const uploadResult = await uploadFile(file);
          if (uploadResult?.url) {
            imageUrl = uploadResult.url;
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload to cloud storage', { id: 'generating' });
          return;
        }

        // Save to Firestore
        const currentImages = souvenirImages[souvenir.id] || {};
        await savePantheonSouvenirImages({
          id: souvenir.id,
          ...currentImages,
          [tier]: imageUrl,
        });

        toast.success(`${SOUVENIR_TIER_NAMES[tier]} image generated and saved!`, { id: 'generating' });
      } else {
        toast.error('Failed to generate image', { id: 'generating' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image', { id: 'generating' });
    } finally {
      setGeneratingTier(null);
    }
  };

  // Generate all tier images
  const handleGenerateAllTiers = async (souvenir: AdminSouvenir) => {
    const tiers: SouvenirTier[] = ['gray', 'bronze', 'silver', 'gold'];

    for (const tier of tiers) {
      await handleGenerateImage(souvenir, tier);
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Handle image upload - saves to Firebase
  const handleImageUpload = async (souvenirId: string, tier: SouvenirTier, file: File) => {
    if (!isSyncedToCloud) {
      toast.error('Firebase not configured. Cannot save images.');
      return;
    }

    toast.loading('Uploading image...', { id: 'upload' });

    try {
      // Upload to Firebase Storage
      const uploadResult = await uploadFile(file);
      if (!uploadResult?.url) {
        toast.error('Failed to upload to cloud storage', { id: 'upload' });
        return;
      }

      // Save to Firestore
      const currentImages = souvenirImages[souvenirId] || {};
      await savePantheonSouvenirImages({
        id: souvenirId,
        ...currentImages,
        [tier]: uploadResult.url,
      });

      toast.success(`${SOUVENIR_TIER_NAMES[tier]} image uploaded!`, { id: 'upload' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: 'upload' });
    }
  };

  // Download image
  const handleDownloadImage = (souvenirId: string, tier: SouvenirTier) => {
    const imageUrl = getImageForTier(souvenirId, tier);
    if (imageUrl.startsWith('data:')) {
      const base64 = imageUrl.split(',')[1];
      const souvenir = souvenirs.find(s => s.id === souvenirId);
      downloadBase64Image(base64, `${souvenir?.name || 'souvenir'}-${tier}.png`);
      toast.success('Image downloaded');
    }
  };

  // Create new souvenir - saves to Firebase
  const handleCreateSouvenir = async (worldId: string, suggestion?: typeof WORLD_SOUVENIR_SUGGESTIONS['ww2'][0]) => {
    if (!isSyncedToCloud) {
      toast.error('Firebase not configured. Cannot create souvenirs.');
      return;
    }

    const newSouvenir: AdminSouvenir = {
      id: `${worldId}-${Date.now()}`,
      worldId,
      name: suggestion?.name || 'New Souvenir',
      description: suggestion?.description || 'Description of this historical artifact',
      significance: suggestion?.significance || 'Why this artifact matters',
      images: {
        gray: '/assets/pantheon/placeholder.png',
        bronze: '/assets/pantheon/placeholder.png',
        silver: '/assets/pantheon/placeholder.png',
        gold: '/assets/pantheon/placeholder.png',
      },
      isCustom: true,
    };

    try {
      await savePantheonSouvenir({
        id: newSouvenir.id,
        worldId: newSouvenir.worldId,
        name: newSouvenir.name,
        description: newSouvenir.description,
        significance: newSouvenir.significance,
        isCustom: true,
      });

      setEditingSouvenir(newSouvenir);
      setIsCreating(false);
      toast.success('Souvenir created');
    } catch (error) {
      console.error('Failed to create souvenir:', error);
      toast.error('Failed to create souvenir');
    }
  };

  // Update souvenir - saves to Firebase
  const handleUpdateSouvenir = async (updated: AdminSouvenir) => {
    if (!isSyncedToCloud) {
      toast.error('Firebase not configured. Cannot update souvenirs.');
      return;
    }

    try {
      await savePantheonSouvenir({
        id: updated.id,
        worldId: updated.worldId,
        name: updated.name,
        description: updated.description,
        significance: updated.significance,
        isCustom: updated.isCustom,
      });

      setEditingSouvenir(null);
      toast.success('Souvenir updated');
    } catch (error) {
      console.error('Failed to update souvenir:', error);
      toast.error('Failed to update souvenir');
    }
  };

  // Delete souvenir - removes from Firebase
  const handleDeleteSouvenir = async (souvenirId: string) => {
    if (!isSyncedToCloud) {
      toast.error('Firebase not configured. Cannot delete souvenirs.');
      return;
    }

    try {
      await Promise.all([
        deletePantheonSouvenir(souvenirId),
        deletePantheonSouvenirImages(souvenirId),
      ]);

      setEditingSouvenir(null);
      toast.success('Souvenir deleted');
    } catch (error) {
      console.error('Failed to delete souvenir:', error);
      toast.error('Failed to delete souvenir');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl flex items-center justify-center py-12">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="text-muted-foreground">Loading souvenirs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-editorial text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="text-amber-400" />
            Pantheon Editor
          </h1>
          {/* Cloud sync status */}
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isSyncedToCloud
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isSyncedToCloud ? '☁️ Cloud Sync' : '⚠️ Local Only'}
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage souvenirs and generate tier images with Nano Banana (Gemini)
        </p>
      </div>

      {/* API Status */}
      {!geminiConfigured && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-400 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-amber-200">Nano Banana (Gemini) not configured</p>
              <p className="text-sm text-amber-200/70 mt-1">
                Add your Gemini API key in Profile Settings to generate souvenir images with AI.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* World List */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-primary" />
            Historical Worlds
          </h2>

          <div className="space-y-2">
            {PANTHEON_WORLDS.map(world => {
              const worldSouvenir = souvenirs.find(s => s.worldId === world.id);
              const hasImages = worldSouvenir && souvenirImages[worldSouvenir.id];
              const imageCount = hasImages
                ? Object.keys(souvenirImages[worldSouvenir.id] || {}).length
                : 0;

              return (
                <button
                  key={world.id}
                  onClick={() => setSelectedWorldId(world.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedWorldId === world.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{world.name}</p>
                      <p className={`text-xs ${selectedWorldId === world.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {worldSouvenir ? worldSouvenir.name : 'No souvenir'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {imageCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedWorldId === world.id
                            ? 'bg-primary-foreground/20'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {imageCount}/4
                        </span>
                      )}
                      {!world.isAvailable && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Souvenir Editor */}
        <div className="lg:col-span-2 space-y-4">
          {selectedWorld ? (
            <>
              {/* World Header */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">{selectedWorld.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedSouvenir ? `Souvenir: ${selectedSouvenir.name}` : 'No souvenir assigned'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {selectedSouvenir && (
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          showPreview ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                    )}

                    {!selectedSouvenir && (
                      <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus size={16} />
                        Create Souvenir
                      </button>
                    )}
                  </div>
                </div>

                {/* Souvenir Suggestions */}
                {isCreating && WORLD_SOUVENIR_SUGGESTIONS[selectedWorld.id] && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Suggested souvenirs:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {WORLD_SOUVENIR_SUGGESTIONS[selectedWorld.id].map(suggestion => (
                        <button
                          key={suggestion.name}
                          onClick={() => handleCreateSouvenir(selectedWorld.id, suggestion)}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted text-left transition-colors"
                        >
                          <p className="font-medium text-sm">{suggestion.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {suggestion.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCreateSouvenir(selectedWorld.id)}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Or create custom souvenir...
                    </button>
                  </div>
                )}
              </div>

              {/* Souvenir Details */}
              {selectedSouvenir && (
                <>
                  {/* Edit Form */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Edit2 size={16} />
                        Souvenir Details
                      </h3>
                      {selectedSouvenir.isCustom && (
                        <button
                          onClick={() => handleDeleteSouvenir(selectedSouvenir.id)}
                          className="text-destructive hover:text-destructive/80 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                        <input
                          type="text"
                          value={editingSouvenir?.name ?? selectedSouvenir.name}
                          onChange={(e) => setEditingSouvenir({
                            ...selectedSouvenir,
                            ...(editingSouvenir || {}),
                            name: e.target.value
                          })}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                        <textarea
                          value={editingSouvenir?.description ?? selectedSouvenir.description}
                          onChange={(e) => setEditingSouvenir({
                            ...selectedSouvenir,
                            ...(editingSouvenir || {}),
                            description: e.target.value
                          })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Historical Significance</label>
                        <textarea
                          value={editingSouvenir?.significance ?? selectedSouvenir.significance}
                          onChange={(e) => setEditingSouvenir({
                            ...selectedSouvenir,
                            ...(editingSouvenir || {}),
                            significance: e.target.value
                          })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
                        />
                      </div>

                      {editingSouvenir && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleUpdateSouvenir(editingSouvenir)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                          >
                            <Save size={16} />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingSouvenir(null)}
                            className="px-4 py-2 rounded-lg bg-muted text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier Images */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Image size={16} />
                        Tier Images
                      </h3>
                      <button
                        onClick={() => handleGenerateAllTiers(selectedSouvenir)}
                        disabled={!geminiConfigured || generatingTier !== null}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 text-sm"
                      >
                        <Sparkles size={14} />
                        Generate All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(['gray', 'bronze', 'silver', 'gold'] as SouvenirTier[]).map(tier => {
                        const imageUrl = getImageForTier(selectedSouvenir.id, tier);
                        const hasCustomImage = !!souvenirImages[selectedSouvenir.id]?.[tier];
                        const isGenerating = generatingTier === tier;
                        const colors = SOUVENIR_TIER_COLORS[tier];

                        return (
                          <div key={tier} className="space-y-2">
                            {/* Image Preview */}
                            <div
                              className="relative aspect-square rounded-xl border-2 overflow-hidden group"
                              style={{ borderColor: colors.primary + '40' }}
                            >
                              {isGenerating ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={imageUrl}
                                    alt={`${selectedSouvenir.name} - ${tier}`}
                                    className="w-full h-full object-contain bg-slate-900"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/assets/pantheon/placeholder.png';
                                    }}
                                  />

                                  {/* Overlay actions */}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleGenerateImage(selectedSouvenir, tier)}
                                      disabled={!geminiConfigured}
                                      className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                                      title="Generate with AI"
                                    >
                                      <Wand2 size={16} />
                                    </button>

                                    <label className="p-2 rounded-lg bg-white/20 text-white cursor-pointer hover:bg-white/30">
                                      <Upload size={16} />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleImageUpload(selectedSouvenir.id, tier, file);
                                        }}
                                        className="hidden"
                                      />
                                    </label>

                                    {hasCustomImage && (
                                      <button
                                        onClick={() => handleDownloadImage(selectedSouvenir.id, tier)}
                                        className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
                                        title="Download"
                                      >
                                        <Download size={16} />
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Custom badge */}
                              {hasCustomImage && !isGenerating && (
                                <div className="absolute top-2 right-2">
                                  <Check size={14} className="text-green-400" />
                                </div>
                              )}
                            </div>

                            {/* Tier label */}
                            <div className="text-center">
                              <TierBadge tier={tier} size="sm" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview */}
                  <AnimatePresence mode="wait">
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-card border border-border rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Eye size={16} />
                            Display Preview
                          </h3>
                          <div className="flex gap-1">
                            {(['gray', 'bronze', 'silver', 'gold'] as SouvenirTier[]).map(tier => (
                              <button
                                key={tier}
                                onClick={() => setPreviewTier(tier)}
                                className={`px-2 py-1 text-xs rounded ${
                                  previewTier === tier
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {SOUVENIR_TIER_NAMES[tier]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-center py-8 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
                          <DisplayCase
                            world={selectedWorld}
                            souvenir={{
                              ...selectedSouvenir,
                              images: {
                                ...selectedSouvenir.images,
                                [previewTier]: getImageForTier(selectedSouvenir.id, previewTier),
                              },
                            }}
                            tier={previewTier}
                            isUnlocked={true}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Select a world to manage its souvenir</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground">Total Souvenirs:</span>
              <span className="ml-2 font-bold">{souvenirs.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">With Images:</span>
              <span className="ml-2 font-bold">{Object.keys(souvenirImages).length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Custom:</span>
              <span className="ml-2 font-bold">{souvenirs.filter(s => s.isCustom).length}</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset all souvenirs to defaults? This will delete custom souvenirs and generated images.')) {
                setSouvenirs([...PANTHEON_SOUVENIRS]);
                setSouvenirImages({});
                toast.success('Reset to defaults');
              }
            }}
            className="text-muted-foreground hover:text-destructive flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
