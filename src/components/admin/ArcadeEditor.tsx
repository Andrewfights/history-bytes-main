import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, ChevronRight, ArrowLeft, Save, Plus, Trash2, Image, X,
  HelpCircle, MapPin, Calendar, FileQuestion, Copy, GripVertical, Database, Upload, Wand2, Loader2,
  Cloud, CloudOff, ImagePlus
} from 'lucide-react';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import { generateImage, base64ToDataUrl, isGeminiConfigured } from '@/lib/gemini';
import { uploadFile } from '@/lib/supabase';
import { uploadToFirebaseStorage } from '@/lib/firebaseStorage';
import { useThumbnailUrl, PLACEHOLDER_IMAGE } from '@/lib/thumbnailUtils';
import {
  anachronismScenes as defaultAnachronismScenes,
  connectionsPuzzles as defaultConnectionsPuzzles,
  mapMysteries as defaultMapMysteries,
  artifactCases as defaultArtifactCases,
  causeEffectPairs as defaultCauseEffectPairs,
} from '@/data/arcadeData';
import { historicalScenes as defaultHistoricalScenes, HistoricalScene, Clue } from '@/data/geoguessrData';
import {
  setArcadeImage,
  getArcadeImage,
  initArcadeMediaCache,
} from '@/lib/adminStorage';
import {
  loadGameThumbnails,
  loadGameThumbnailsAsync,
  saveGameThumbnail,
  initGameThumbnailsCache,
} from '@/data/arcadeGames';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getArcadeGameContent,
  getAllArcadeGameContent,
  saveArcadeGameContent,
  subscribeToArcadeGameContent,
  type FirestoreArcadeGameContent,
} from '@/lib/firestore';

type GameType = 'anachronism' | 'connections' | 'map-mystery' | 'artifact' | 'cause-effect' | 'geoguessr';
type ViewMode = 'games' | 'items' | 'edit';

interface GameTypeInfo {
  id: GameType;
  title: string;
  description: string;
  thumbnailUrl?: string;
  color: string;
  items: any[];
}

const defaultGameTypesMeta: Omit<GameTypeInfo, 'items' | 'thumbnailUrl'>[] = [
  {
    id: 'geoguessr',
    title: 'Geoguessr History',
    description: 'Historical scenes with location/date/event guessing',
    color: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'anachronism',
    title: 'Spot the Anachronism',
    description: 'Find historical inaccuracies in scenes',
    color: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'connections',
    title: 'Historical Connections',
    description: 'Group related historical items',
    color: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'map-mystery',
    title: 'Map Mysteries',
    description: 'Identify empires by their territory',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'artifact',
    title: 'Artifact Detective',
    description: 'Identify historical artifacts from clues',
    color: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'cause-effect',
    title: 'Cause & Effect',
    description: 'Match historical causes with effects',
    color: 'bg-rose-500/20 text-rose-400',
  },
];

export default function ArcadeEditor() {
  const [view, setView] = useState<ViewMode>('games');
  const [selectedGame, setSelectedGame] = useState<GameTypeInfo | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [editedItem, setEditedItem] = useState<any>(null);
  const [mediaInitialized, setMediaInitialized] = useState(false);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);

  // Game thumbnails state
  const [gameThumbnails, setGameThumbnails] = useState<Record<string, string>>(() => loadGameThumbnails());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [uploadingGameId, setUploadingGameId] = useState<string | null>(null);

  // Arcade game content state
  const [arcadeData, setArcadeData] = useState<{
    geoguessr: any[];
    anachronism: any[];
    connections: any[];
    mapMystery: any[];
    artifact: any[];
    causeEffect: any[];
  }>({
    geoguessr: [...defaultHistoricalScenes],
    anachronism: [...defaultAnachronismScenes],
    connections: [...defaultConnectionsPuzzles],
    mapMystery: [...defaultMapMysteries],
    artifact: [...defaultArtifactCases],
    causeEffect: [...defaultCauseEffectPairs],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize IndexedDB cache for media and load data from Firestore
  useEffect(() => {
    const init = async () => {
      await initArcadeMediaCache();
      setMediaInitialized(true);

      const firebaseConfigured = isFirebaseConfigured();
      setIsSyncedToCloud(firebaseConfigured);

      // Load thumbnails from Firestore
      await initGameThumbnailsCache();
      const freshThumbnails = await loadGameThumbnailsAsync();
      setGameThumbnails(freshThumbnails);

      if (firebaseConfigured) {
        // Load game content from Firestore
        try {
          const allContent = await getAllArcadeGameContent();
          const newData = { ...arcadeData };

          allContent.forEach((content) => {
            if (content.items && content.items.length > 0) {
              switch (content.gameType) {
                case 'geoguessr':
                  newData.geoguessr = content.items;
                  break;
                case 'anachronism':
                  newData.anachronism = content.items;
                  break;
                case 'connections':
                  newData.connections = content.items;
                  break;
                case 'map-mystery':
                  newData.mapMystery = content.items;
                  break;
                case 'artifact':
                  newData.artifact = content.items;
                  break;
                case 'cause-effect':
                  newData.causeEffect = content.items;
                  break;
              }
            }
          });

          setArcadeData(newData);
        } catch (err) {
          console.error('Failed to load arcade content from Firebase:', err);
        }

        // Subscribe to real-time updates
        const unsubscribe = subscribeToArcadeGameContent((allContent) => {
          setArcadeData((prev) => {
            const newData = { ...prev };
            allContent.forEach((content) => {
              if (content.items && content.items.length > 0) {
                switch (content.gameType) {
                  case 'geoguessr':
                    newData.geoguessr = content.items;
                    break;
                  case 'anachronism':
                    newData.anachronism = content.items;
                    break;
                  case 'connections':
                    newData.connections = content.items;
                    break;
                  case 'map-mystery':
                    newData.mapMystery = content.items;
                    break;
                  case 'artifact':
                    newData.artifact = content.items;
                    break;
                  case 'cause-effect':
                    newData.causeEffect = content.items;
                    break;
                }
              }
            });
            return newData;
          });
        });

        setIsLoading(false);
        return () => unsubscribe();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Build gameTypes array with current data and thumbnails
  const gameTypes: GameTypeInfo[] = defaultGameTypesMeta.map(meta => ({
    ...meta,
    thumbnailUrl: gameThumbnails[meta.id],
    items: meta.id === 'geoguessr' ? arcadeData.geoguessr :
           meta.id === 'anachronism' ? arcadeData.anachronism :
           meta.id === 'connections' ? arcadeData.connections :
           meta.id === 'map-mystery' ? arcadeData.mapMystery :
           meta.id === 'artifact' ? arcadeData.artifact :
           arcadeData.causeEffect,
  }));

  // Check if a thumbnail URL is valid
  const isValidThumbnail = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  // Upload image for a game type
  const handleUploadGameImage = async (gameId: string, file: File) => {
    setUploadingGameId(gameId);
    toast.loading(`Uploading image for ${gameId}...`, { id: `upload-${gameId}` });

    try {
      // Try Firebase Storage first, fall back to Supabase
      let uploadUrl: string | null = null;

      try {
        uploadUrl = await uploadToFirebaseStorage(file, `arcade/${gameId}`);
      } catch (firebaseError) {
        console.warn('Firebase Storage failed, trying Supabase:', firebaseError);
        const supabaseResult = await uploadFile(file);
        if (supabaseResult) {
          uploadUrl = supabaseResult.url;
        }
      }

      if (uploadUrl) {
        // Update local state
        const newThumbnails = { ...gameThumbnails, [gameId]: uploadUrl };
        setGameThumbnails(newThumbnails);

        // Save to Firestore
        saveGameThumbnail(gameId, uploadUrl);

        toast.success(`Image uploaded for ${gameId}`, { id: `upload-${gameId}` });
      } else {
        toast.error(`Failed to upload image for ${gameId}`, { id: `upload-${gameId}` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Error uploading image: ${error}`, { id: `upload-${gameId}` });
    } finally {
      setUploadingGameId(null);
    }
  };

  // Generate thumbnails for all games without valid images
  const handleGenerateAllThumbnails = async () => {
    if (!isGeminiConfigured()) {
      toast.error('Gemini API not configured');
      return;
    }

    const gamesNeedingThumbnails = defaultGameTypesMeta.filter(g => !isValidThumbnail(gameThumbnails[g.id]));

    if (gamesNeedingThumbnails.length === 0) {
      toast.info('All games already have thumbnails');
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: gamesNeedingThumbnails.length });

    const newThumbnails = { ...gameThumbnails };

    for (let i = 0; i < gamesNeedingThumbnails.length; i++) {
      const game = gamesNeedingThumbnails[i];
      setGenerationProgress({ current: i + 1, total: gamesNeedingThumbnails.length });

      try {
        toast.loading(`Generating art for "${game.title}"...`, { id: `gen-${game.id}` });

        const prompt = `Game thumbnail for "${game.title}" - ${game.description}. Educational history game, vibrant colors, engaging design, suitable for mobile app. Professional game art style, high quality illustration.`;

        const result = await generateImage({
          prompt,
          aspectRatio: '1:1',
          style: 'cinematic'
        });

        if (result) {
          const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const fileName = `game-${game.id}-${Date.now()}.${result.mimeType.split('/')[1] || 'png'}`;
          const file = new File([blob], fileName, { type: result.mimeType });

          const uploadResult = await uploadFile(file);

          if (uploadResult) {
            newThumbnails[game.id] = uploadResult.url;
            // Save to Firestore immediately
            saveGameThumbnail(game.id, uploadResult.url);
            toast.success(`Generated art for "${game.title}"`, { id: `gen-${game.id}` });
          } else {
            toast.error(`Failed to upload art for "${game.title}"`, { id: `gen-${game.id}` });
          }
        } else {
          toast.error(`Failed to generate art for "${game.title}"`, { id: `gen-${game.id}` });
        }
      } catch (error) {
        console.error(`Error generating art for ${game.title}:`, error);
        toast.error(`Error generating art for "${game.title}"`, { id: `gen-${game.id}` });
      }

      if (i < gamesNeedingThumbnails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setGameThumbnails(newThumbnails);
    setIsGeneratingAll(false);
    setGenerationProgress({ current: 0, total: 0 });
    toast.success('Game art generation complete!');
  };

  // Helper function to save game content to Firebase
  const saveGameContentToFirebase = async (gameType: string, items: any[]) => {
    if (!isFirebaseConfigured()) return;

    try {
      const content: FirestoreArcadeGameContent = {
        id: gameType,
        gameType: gameType as FirestoreArcadeGameContent['gameType'],
        items,
      };
      await saveArcadeGameContent(content);
    } catch (err) {
      console.error(`Failed to save ${gameType} content to Firebase:`, err);
    }
  };

  const handleSelectGame = (game: GameTypeInfo) => {
    setSelectedGame(game);
    setSelectedItemIndex(null);
    setEditedItem(null);
    setView('items');
  };

  const handleSelectItem = (index: number) => {
    if (!selectedGame) return;
    setSelectedItemIndex(index);
    setEditedItem(JSON.parse(JSON.stringify(selectedGame.items[index]))); // Deep clone
    setView('edit');
  };

  const handleCreateNew = () => {
    if (!selectedGame) return;
    const newItem = createNewItem(selectedGame.id);
    setSelectedItemIndex(-1); // -1 indicates new item
    setEditedItem(newItem);
    setView('edit');
  };

  const handleBack = useCallback(() => {
    if (view === 'edit') {
      setSelectedItemIndex(null);
      setEditedItem(null);
      setView('items');
    } else if (view === 'items') {
      setSelectedGame(null);
      setView('games');
    }
  }, [view]);

  const handleSave = useCallback(async () => {
    if (!selectedGame || editedItem === null) return;

    setIsSaving(true);
    const gameId = selectedGame.id;
    const dataKey = gameId === 'geoguessr' ? 'geoguessr' :
                    gameId === 'anachronism' ? 'anachronism' :
                    gameId === 'connections' ? 'connections' :
                    gameId === 'map-mystery' ? 'mapMystery' :
                    gameId === 'artifact' ? 'artifact' : 'causeEffect';

    // Update local state
    let updatedItems: any[] = [];
    setArcadeData(prev => {
      const items = [...prev[dataKey]];
      if (selectedItemIndex === -1) {
        // New item
        items.push(editedItem);
      } else if (selectedItemIndex !== null) {
        // Update existing
        items[selectedItemIndex] = editedItem;
      }
      updatedItems = items;
      return { ...prev, [dataKey]: items };
    });

    // Save to Firebase
    try {
      await saveGameContentToFirebase(gameId, updatedItems);
      toast.success('Changes saved to cloud');
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error('Failed to save to cloud');
    } finally {
      setIsSaving(false);
    }

    handleBack();
  }, [selectedGame, editedItem, selectedItemIndex, handleBack]);

  const handleDelete = useCallback(async () => {
    if (!selectedGame || selectedItemIndex === null || selectedItemIndex === -1) return;

    if (!confirm('Delete this item?')) return;

    setIsSaving(true);
    const gameId = selectedGame.id;
    const dataKey = gameId === 'geoguessr' ? 'geoguessr' :
                    gameId === 'anachronism' ? 'anachronism' :
                    gameId === 'connections' ? 'connections' :
                    gameId === 'map-mystery' ? 'mapMystery' :
                    gameId === 'artifact' ? 'artifact' : 'causeEffect';

    let updatedItems: any[] = [];
    setArcadeData(prev => {
      const items = prev[dataKey].filter((_: any, i: number) => i !== selectedItemIndex);
      updatedItems = items;
      return { ...prev, [dataKey]: items };
    });

    // Save to Firebase
    try {
      await saveGameContentToFirebase(gameId, updatedItems);
      toast.success('Item deleted');
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error('Failed to sync deletion to cloud');
    } finally {
      setIsSaving(false);
    }

    handleBack();
  }, [selectedGame, selectedItemIndex, handleBack]);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {view !== 'games' && (
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-3xl font-bold text-foreground">Arcade Editor</h1>
            {/* Cloud sync status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
              isSyncedToCloud
                ? 'bg-green-500/10 text-green-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              {isSyncedToCloud ? (
                <>
                  <Cloud size={12} />
                  Cloud Sync
                </>
              ) : (
                <>
                  <CloudOff size={12} />
                  No Cloud
                </>
              )}
            </div>
          </div>
          <Breadcrumbs
            game={selectedGame}
            itemIndex={selectedItemIndex}
            onSelectGame={() => { setSelectedItemIndex(null); setEditedItem(null); setView('items'); }}
          />
        </div>
        {view === 'games' && (
          <button
            onClick={handleGenerateAllThumbnails}
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
        )}
        {view === 'items' && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add New
          </button>
        )}
      </div>

      {/* Game Type List */}
      {view === 'games' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {gameTypes.map((game) => (
            <GameTypeCard
              key={game.id}
              game={game}
              onClick={() => handleSelectGame(game)}
              onUploadImage={handleUploadGameImage}
              isUploading={uploadingGameId === game.id}
            />
          ))}
        </motion.div>
      )}

      {/* Item List */}
      {view === 'items' && selectedGame && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {selectedGame.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No items yet. Click "Add New" to create one.</p>
            </div>
          ) : (
            selectedGame.items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                gameType={selectedGame.id}
                index={index}
                onClick={() => handleSelectItem(index)}
              />
            ))
          )}
        </motion.div>
      )}

      {/* Item Editor */}
      {view === 'edit' && selectedGame && editedItem && (
        <ItemEditor
          item={editedItem}
          setItem={setEditedItem}
          gameType={selectedGame.id}
          isNew={selectedItemIndex === -1}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// Create new item template based on game type
function createNewItem(gameType: GameType): any {
  const id = `${gameType}-${Date.now()}`;

  switch (gameType) {
    case 'geoguessr':
      return {
        id,
        imageUrl: '',
        event: '',
        year: new Date().getFullYear(),
        location: '',
        era: '',
        difficulty: 2,
        clues: [
          { id: `${id}-c1`, text: '', xpPenalty: 10 },
        ],
        options: {
          events: ['', '', '', ''],
          years: [0, 0, 0, 0],
          locations: ['', '', '', ''],
        },
        revealText: '',
        funFact: '',
      };
    case 'anachronism':
      return {
        id,
        era: '',
        year: '',
        setting: '',
        details: [],
        explanation: '',
      };
    case 'connections':
      return {
        id,
        categories: [
          { name: '', items: ['', '', '', ''], difficulty: 1, color: 'yellow' },
          { name: '', items: ['', '', '', ''], difficulty: 2, color: 'green' },
          { name: '', items: ['', '', '', ''], difficulty: 3, color: 'blue' },
          { name: '', items: ['', '', '', ''], difficulty: 4, color: 'purple' },
        ],
      };
    case 'map-mystery':
      return {
        id,
        empireName: '',
        svgPath: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        peakYear: '',
        funFact: '',
        modernRegion: '',
      };
    case 'artifact':
      return {
        id,
        name: '',
        clues: ['', '', ''],
        options: ['', '', '', ''],
        correctIndex: 0,
        revealText: '',
      };
    case 'cause-effect':
      return {
        id,
        type: 'cause-to-effect',
        prompt: '',
        correctAnswer: '',
        wrongAnswers: ['', '', ''],
        explanation: '',
        era: '',
      };
    default:
      return { id };
  }
}

// Breadcrumbs Component
function Breadcrumbs({
  game,
  itemIndex,
  onSelectGame,
}: {
  game: GameTypeInfo | null;
  itemIndex: number | null;
  onSelectGame: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
      <span className="hover:text-foreground cursor-default">Games</span>
      {game && (
        <>
          <ChevronRight size={14} />
          <button onClick={onSelectGame} className="hover:text-foreground">
            {game.title}
          </button>
        </>
      )}
      {itemIndex !== null && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground">
            {itemIndex === -1 ? 'New Item' : `Item #${itemIndex + 1}`}
          </span>
        </>
      )}
    </div>
  );
}

// Game Type Card Component
function GameTypeCard({
  game,
  onClick,
  onUploadImage,
  isUploading,
}: {
  game: GameTypeInfo;
  onClick: () => void;
  onUploadImage: (gameId: string, file: File) => void;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if thumbnail is valid
  const hasValidThumbnail = game.thumbnailUrl && (
    game.thumbnailUrl.startsWith('http://') ||
    game.thumbnailUrl.startsWith('https://') ||
    game.thumbnailUrl.startsWith('data:')
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(game.id, file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
      <div className="flex items-center justify-between">
        <button
          onClick={onClick}
          className="flex items-center gap-4 flex-1 text-left"
        >
          <div className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center overflow-hidden relative`}>
            {hasValidThumbnail ? (
              <img
                src={game.thumbnailUrl}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Gamepad2 size={24} className="opacity-50" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {game.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {game.description} | {game.items.length} items
            </p>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Upload image button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Upload icon/artwork"
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ImagePlus size={18} />
            )}
          </button>

          <button
            onClick={onClick}
            className="p-2 text-muted-foreground group-hover:text-primary transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Item Card Component
function ItemCard({
  item,
  gameType,
  index,
  onClick,
}: {
  item: any;
  gameType: GameType;
  index: number;
  onClick: () => void;
}) {
  const getItemTitle = () => {
    switch (gameType) {
      case 'geoguessr':
        return item.event || 'Untitled Scene';
      case 'anachronism':
        return `${item.era} - ${item.setting}`;
      case 'connections':
        return `Puzzle ${index + 1} - ${item.categories?.length || 0} categories`;
      case 'map-mystery':
        return `${item.empireName} (${item.peakYear})`;
      case 'artifact':
        return item.name;
      case 'cause-effect':
        return item.prompt;
      default:
        return `Item ${index + 1}`;
    }
  };

  const getItemSubtitle = () => {
    switch (gameType) {
      case 'geoguessr':
        return `${item.year} | ${item.location} | ${item.era}`;
      case 'anachronism':
        return `${item.details?.length || 0} details`;
      case 'cause-effect':
        return item.era;
      default:
        return `ID: ${item.id}`;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-md">
              {getItemTitle()}
            </h3>
            <p className="text-sm text-muted-foreground">{getItemSubtitle()}</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}

// Item Editor Component
function ItemEditor({
  item,
  setItem,
  gameType,
  isNew,
  onSave,
  onDelete,
}: {
  item: any;
  setItem: (item: any) => void;
  gameType: GameType;
  isNew: boolean;
  onSave: () => void;
  onDelete: () => void;
}) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerField, setMediaPickerField] = useState<string>('');

  const handleMediaSelect = (url: string) => {
    if (mediaPickerField) {
      // If it's a data URL, save to IndexedDB
      if (url.startsWith('data:')) {
        const mediaKey = `${item.id}:${mediaPickerField}`;
        setArcadeImage(mediaKey, url);
        setItem({ ...item, [mediaPickerField]: `idb:arcade:${mediaKey}` });
      } else {
        setItem({ ...item, [mediaPickerField]: url });
      }
    }
    setShowMediaPicker(false);
  };

  const openMediaPicker = (field: string) => {
    setMediaPickerField(field);
    setShowMediaPicker(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">ID: {item.id}</span>
          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
            {gameType}
          </span>
          {isNew && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Form Fields Based on Game Type */}
      {gameType === 'geoguessr' && (
        <GeoguessrEditor item={item} setItem={setItem} openMediaPicker={openMediaPicker} />
      )}
      {gameType === 'anachronism' && (
        <AnachronismEditor item={item} setItem={setItem} openMediaPicker={openMediaPicker} />
      )}
      {gameType === 'connections' && (
        <ConnectionsEditor item={item} setItem={setItem} />
      )}
      {gameType === 'map-mystery' && (
        <MapMysteryEditor item={item} setItem={setItem} />
      )}
      {gameType === 'artifact' && (
        <ArtifactEditor item={item} setItem={setItem} openMediaPicker={openMediaPicker} />
      )}
      {gameType === 'cause-effect' && (
        <CauseEffectEditor item={item} setItem={setItem} />
      )}

      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker
            onSelect={handleMediaSelect}
            onClose={() => setShowMediaPicker(false)}
            allowedTypes={['image', 'video']}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Form Input Component
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:border-primary outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:border-primary outline-none"
        />
      )}
    </div>
  );
}

// Helper to resolve arcade image URLs from IndexedDB
function resolveArcadeImageUrl(value: string | undefined): string {
  if (!value) return '';
  if (value.startsWith('idb:arcade:')) {
    const key = value.replace('idb:arcade:', '');
    return getArcadeImage(key) || '';
  }
  return value;
}

// Image Field Component with Upload and Generate
function ImageField({
  label,
  value,
  onPick,
  onClear,
  onChange,
  generatePromptContext,
  itemId,
  fieldName,
}: {
  label: string;
  value: string;
  onPick: () => void;
  onClear: () => void;
  onChange?: (url: string) => void;
  generatePromptContext?: string;
  itemId?: string;
  fieldName?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve the image URL (handle IndexedDB references)
  const resolvedValue = resolveArcadeImageUrl(value);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Save to IndexedDB if we have item context
      if (itemId && fieldName) {
        const mediaKey = `${itemId}:${fieldName}`;
        setArcadeImage(mediaKey, dataUrl);
        onChange(`idb:arcade:${mediaKey}`);
      } else {
        onChange(dataUrl);
      }
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!isGeminiConfigured() || !onChange) {
      toast.error('Gemini API not configured');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating image...', { description: 'This may take a moment' });

    try {
      const prompt = generatePromptContext
        ? `Historical scene: ${generatePromptContext}. Photorealistic style, detailed, suitable for an educational history game.`
        : 'Historical educational scene, detailed, photorealistic';

      const result = await generateImage({
        prompt,
        aspectRatio: '16:9',
        style: 'photorealistic'
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);
        // Save to IndexedDB if we have item context
        if (itemId && fieldName) {
          const mediaKey = `${itemId}:${fieldName}`;
          setArcadeImage(mediaKey, dataUrl);
          onChange(`idb:arcade:${mediaKey}`);
        } else {
          onChange(dataUrl);
        }
        toast.success('Image generated!');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <div className="space-y-3">
        {/* Image Preview */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border relative">
          {resolvedValue ? (
            <>
              <img src={resolvedValue} alt="" className="w-full h-full object-cover" />
              <button
                onClick={onClear}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Image size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No image set</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
          >
            <Upload size={14} />
            Upload
          </button>
          <button
            type="button"
            onClick={onPick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
          >
            <Image size={14} />
            Library
          </button>
          {onChange && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !isGeminiConfigured()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Generate
            </button>
          )}
        </div>

        {/* URL Input */}
        {onChange && (
          <input
            type="text"
            value={resolvedValue || ''}
            onChange={(e) => {
              if (itemId && fieldName && e.target.value.startsWith('data:')) {
                const mediaKey = `${itemId}:${fieldName}`;
                setArcadeImage(mediaKey, e.target.value);
                onChange(`idb:arcade:${mediaKey}`);
              } else {
                onChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-xs"
            placeholder="Or paste image URL..."
          />
        )}
      </div>
    </div>
  );
}

// Geoguessr Editor
function GeoguessrEditor({
  item,
  setItem,
  openMediaPicker,
}: {
  item: HistoricalScene;
  setItem: (item: any) => void;
  openMediaPicker: (field: string) => void;
}) {
  const updateClue = (index: number, field: keyof Clue, value: string | number) => {
    const newClues = [...item.clues];
    newClues[index] = { ...newClues[index], [field]: value };
    setItem({ ...item, clues: newClues });
  };

  const addClue = () => {
    const newClue: Clue = {
      id: `${item.id}-c${item.clues.length + 1}`,
      text: '',
      xpPenalty: 10,
    };
    setItem({ ...item, clues: [...item.clues, newClue] });
  };

  const removeClue = (index: number) => {
    const newClues = item.clues.filter((_, i) => i !== index);
    setItem({ ...item, clues: newClues });
  };

  const updateOption = (category: 'events' | 'years' | 'locations', index: number, value: string | number) => {
    const newOptions = { ...item.options };
    if (category === 'years') {
      newOptions[category] = [...(newOptions[category] || [])];
      newOptions[category]![index] = Number(value);
    } else {
      newOptions[category] = [...(newOptions[category] || [])];
      newOptions[category]![index] = String(value);
    }
    setItem({ ...item, options: newOptions });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileQuestion size={18} className="text-primary" />
          Basic Information
        </h3>

        <ImageField
          label="Scene Image"
          value={item.imageUrl}
          onPick={() => openMediaPicker('imageUrl')}
          onClear={() => setItem({ ...item, imageUrl: '' })}
          onChange={(url) => setItem({ ...item, imageUrl: url })}
          generatePromptContext={`${item.event || 'Historical event'} in ${item.location || 'unknown location'}, ${item.era || 'historical era'}, year ${item.year || 'unknown'}`}
          itemId={item.id}
          fieldName="imageUrl"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Event Name"
            value={item.event}
            onChange={(v) => setItem({ ...item, event: v })}
            placeholder="The Storming of the Bastille"
          />
          <FormInput
            label="Year"
            value={item.year}
            type="number"
            onChange={(v) => setItem({ ...item, year: parseInt(v) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Location"
            value={item.location}
            onChange={(v) => setItem({ ...item, location: v })}
            placeholder="Paris, France"
          />
          <FormInput
            label="Era"
            value={item.era}
            onChange={(v) => setItem({ ...item, era: v })}
            placeholder="French Revolution"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Difficulty</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => setItem({ ...item, difficulty: d })}
                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                  item.difficulty === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border border-border hover:border-primary/50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clues */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <HelpCircle size={18} className="text-primary" />
            Clues ({item.clues.length})
          </h3>
          <button
            onClick={addClue}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            <Plus size={14} />
            Add Clue
          </button>
        </div>

        <div className="space-y-3">
          {item.clues.map((clue, index) => (
            <div key={clue.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <span className="text-sm font-bold text-muted-foreground mt-2.5">#{index + 1}</span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={clue.text}
                  onChange={(e) => updateClue(index, 'text', e.target.value)}
                  placeholder="Enter clue text..."
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">XP Penalty:</label>
                  <input
                    type="number"
                    value={clue.xpPenalty}
                    onChange={(e) => updateClue(index, 'xpPenalty', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded bg-card border border-border text-sm text-center"
                  />
                </div>
              </div>
              {item.clues.length > 1 && (
                <button
                  onClick={() => removeClue(index)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Answer Options */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          Answer Options
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Event Options (for "What Happened?")</label>
            <div className="space-y-2">
              {(item.options.events || ['', '', '', '']).map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    opt === item.event ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i === 0 && opt === item.event ? '✓' : i + 1}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption('events', i, e.target.value)}
                    placeholder={i === 0 ? 'Correct answer (matches event name)' : `Wrong option ${i}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Year Options (for "When?")</label>
            <div className="grid grid-cols-4 gap-2">
              {(item.options.years || [0, 0, 0, 0]).map((opt: number, i: number) => (
                <input
                  key={i}
                  type="number"
                  value={opt || ''}
                  onChange={(e) => updateOption('years', i, e.target.value)}
                  placeholder={i === 0 ? 'Correct' : 'Wrong'}
                  className={`px-3 py-2 rounded-lg border focus:border-primary outline-none text-sm text-center ${
                    opt === item.year && opt !== 0 ? 'bg-green-500/10 border-green-500' : 'bg-muted border-border'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Location Options (for "Where?")</label>
            <div className="space-y-2">
              {(item.options.locations || ['', '', '', '']).map((opt: string, i: number) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption('locations', i, e.target.value)}
                  placeholder={i === 0 ? 'Correct location' : `Wrong location ${i}`}
                  className={`w-full px-3 py-2 rounded-lg border focus:border-primary outline-none text-sm ${
                    opt === item.location && opt !== '' ? 'bg-green-500/10 border-green-500' : 'bg-muted border-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reveal Content */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Reveal Content</h3>
        <FormInput
          label="Reveal Text"
          value={item.revealText}
          onChange={(v) => setItem({ ...item, revealText: v })}
          placeholder="Explanation shown after the answer is revealed..."
          multiline
          rows={3}
        />
        <FormInput
          label="Fun Fact"
          value={item.funFact}
          onChange={(v) => setItem({ ...item, funFact: v })}
          placeholder="An interesting fact about this event..."
          multiline
          rows={2}
        />
      </div>
    </div>
  );
}

// Anachronism Editor
function AnachronismEditor({
  item,
  setItem,
  openMediaPicker,
}: {
  item: any;
  setItem: (item: any) => void;
  openMediaPicker: (field: string) => void;
}) {
  const addDetail = () => {
    const newDetail = {
      id: `${item.id}-d${(item.details?.length || 0) + 1}`,
      text: '',
      isAnachronism: false,
    };
    setItem({ ...item, details: [...(item.details || []), newDetail] });
  };

  const updateDetail = (index: number, field: string, value: any) => {
    const newDetails = [...item.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setItem({ ...item, details: newDetails });
  };

  const removeDetail = (index: number) => {
    const newDetails = item.details.filter((_: any, i: number) => i !== index);
    setItem({ ...item, details: newDetails });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Scene Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Era" value={item.era || ''} onChange={(v) => setItem({ ...item, era: v })} placeholder="Victorian Era" />
          <FormInput label="Year" value={item.year || ''} onChange={(v) => setItem({ ...item, year: v })} placeholder="1850" />
        </div>
        <FormInput label="Setting" value={item.setting || ''} onChange={(v) => setItem({ ...item, setting: v })} placeholder="London street scene" />
        <FormInput label="Explanation" value={item.explanation || ''} onChange={(v) => setItem({ ...item, explanation: v })} multiline placeholder="Why the anachronisms don't belong..." />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Scene Details ({item.details?.length || 0})</h3>
          <button onClick={addDetail} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            <Plus size={14} /> Add Detail
          </button>
        </div>
        <div className="space-y-3">
          {(item.details || []).map((detail: any, index: number) => (
            <div key={detail.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <input
                type="text"
                value={detail.text}
                onChange={(e) => updateDetail(index, 'text', e.target.value)}
                placeholder="Detail description..."
                className="flex-1 px-3 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={detail.isAnachronism}
                  onChange={(e) => updateDetail(index, 'isAnachronism', e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className={detail.isAnachronism ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  Anachronism
                </span>
              </label>
              <button onClick={() => removeDetail(index)} className="p-2 text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Connections Editor
function ConnectionsEditor({ item, setItem }: { item: any; setItem: (item: any) => void }) {
  const colors = ['yellow', 'green', 'blue', 'purple'] as const;

  const updateCategory = (index: number, field: string, value: any) => {
    const newCategories = [...item.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setItem({ ...item, categories: newCategories });
  };

  const updateCategoryItem = (catIndex: number, itemIndex: number, value: string) => {
    const newCategories = [...item.categories];
    newCategories[catIndex].items = [...newCategories[catIndex].items];
    newCategories[catIndex].items[itemIndex] = value;
    setItem({ ...item, categories: newCategories });
  };

  return (
    <div className="space-y-4">
      {item.categories.map((cat: any, catIndex: number) => (
        <div key={catIndex} className={`bg-card border-2 rounded-xl p-6 space-y-4 border-${colors[catIndex]}-500/50`}>
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full bg-${colors[catIndex]}-500`} />
            <FormInput
              label={`Category ${catIndex + 1} Name`}
              value={cat.name}
              onChange={(v) => updateCategory(catIndex, 'name', v)}
              placeholder="Category name..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cat.items.map((item: string, itemIndex: number) => (
              <input
                key={itemIndex}
                type="text"
                value={item}
                onChange={(e) => updateCategoryItem(catIndex, itemIndex, e.target.value)}
                placeholder={`Item ${itemIndex + 1}`}
                className="px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Map Mystery Editor
function MapMysteryEditor({ item, setItem }: { item: any; setItem: (item: any) => void }) {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...item.options];
    newOptions[index] = value;
    setItem({ ...item, options: newOptions });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <FormInput label="Empire Name" value={item.empireName || ''} onChange={(v) => setItem({ ...item, empireName: v })} />
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Peak Year" value={item.peakYear || ''} onChange={(v) => setItem({ ...item, peakYear: v })} />
        <FormInput label="Modern Region" value={item.modernRegion || ''} onChange={(v) => setItem({ ...item, modernRegion: v })} />
      </div>
      <FormInput label="Fun Fact" value={item.funFact || ''} onChange={(v) => setItem({ ...item, funFact: v })} multiline />
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Answer Options</label>
        <div className="space-y-2">
          {(item.options || ['', '', '', '']).map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={item.correctIndex === i}
                onChange={() => setItem({ ...item, correctIndex: i })}
                className="w-4 h-4"
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className={`flex-1 px-3 py-2 rounded-lg border focus:border-primary outline-none text-sm ${
                  item.correctIndex === i ? 'bg-green-500/10 border-green-500' : 'bg-muted border-border'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Artifact Editor
function ArtifactEditor({
  item,
  setItem,
  openMediaPicker,
}: {
  item: any;
  setItem: (item: any) => void;
  openMediaPicker: (field: string) => void;
}) {
  const updateClue = (index: number, value: string) => {
    const newClues = [...item.clues];
    newClues[index] = value;
    setItem({ ...item, clues: newClues });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...item.options];
    newOptions[index] = value;
    setItem({ ...item, options: newOptions });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <FormInput label="Artifact Name" value={item.name || ''} onChange={(v) => setItem({ ...item, name: v })} />
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Clues</label>
        <div className="space-y-2">
          {(item.clues || ['', '', '']).map((clue: string, i: number) => (
            <input
              key={i}
              type="text"
              value={clue}
              onChange={(e) => updateClue(i, e.target.value)}
              placeholder={`Clue ${i + 1}`}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm"
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Answer Options</label>
        <div className="space-y-2">
          {(item.options || ['', '', '', '']).map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={item.correctIndex === i}
                onChange={() => setItem({ ...item, correctIndex: i })}
                className="w-4 h-4"
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className={`flex-1 px-3 py-2 rounded-lg border focus:border-primary outline-none text-sm ${
                  item.correctIndex === i ? 'bg-green-500/10 border-green-500' : 'bg-muted border-border'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
      <FormInput label="Reveal Text" value={item.revealText || ''} onChange={(v) => setItem({ ...item, revealText: v })} multiline />
    </div>
  );
}

// Cause Effect Editor
function CauseEffectEditor({ item, setItem }: { item: any; setItem: (item: any) => void }) {
  const updateWrongAnswer = (index: number, value: string) => {
    const newAnswers = [...item.wrongAnswers];
    newAnswers[index] = value;
    setItem({ ...item, wrongAnswers: newAnswers });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Type</label>
          <select
            value={item.type || 'cause-to-effect'}
            onChange={(e) => setItem({ ...item, type: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:border-primary outline-none"
          >
            <option value="cause-to-effect">Cause to Effect</option>
            <option value="effect-to-cause">Effect to Cause</option>
          </select>
        </div>
        <FormInput label="Era" value={item.era || ''} onChange={(v) => setItem({ ...item, era: v })} />
      </div>
      <FormInput label="Prompt" value={item.prompt || ''} onChange={(v) => setItem({ ...item, prompt: v })} multiline placeholder="What was the cause/effect of..." />
      <FormInput label="Correct Answer" value={item.correctAnswer || ''} onChange={(v) => setItem({ ...item, correctAnswer: v })} />
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Wrong Answers</label>
        <div className="space-y-2">
          {(item.wrongAnswers || ['', '', '']).map((ans: string, i: number) => (
            <input
              key={i}
              type="text"
              value={ans}
              onChange={(e) => updateWrongAnswer(i, e.target.value)}
              placeholder={`Wrong answer ${i + 1}`}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm"
            />
          ))}
        </div>
      </div>
      <FormInput label="Explanation" value={item.explanation || ''} onChange={(v) => setItem({ ...item, explanation: v })} multiline />
    </div>
  );
}
