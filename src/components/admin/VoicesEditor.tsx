import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Key, Save, Play, Pause, RefreshCw, Volume2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  isApiKeySet,
  fetchVoices,
  getVoiceSettings,
  saveVoiceSettings,
  initializeVoiceSettings,
  generateSpeech,
  VoiceConfig,
  ElevenLabsVoice,
} from '@/lib/elevenlabs';
import { spiritGuides } from '@/data/spiritGuidesData';

export default function VoicesEditor() {
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<ElevenLabsVoice[]>([]);
  const [voiceConfigs, setVoiceConfigs] = useState<VoiceConfig[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const configs = initializeVoiceSettings();
    setVoiceConfigs(configs);
    setIsKeySet(isApiKeySet());

    const savedKey = getApiKey();
    if (savedKey) {
      setApiKeyState(savedKey);
      loadAvailableVoices();
    }
  }, []);

  const loadAvailableVoices = async () => {
    setLoadingVoices(true);
    const voices = await fetchVoices();
    setAvailableVoices(voices);
    setLoadingVoices(false);
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setApiKey(apiKey.trim());
    setIsKeySet(true);
    toast.success('API key saved');
    loadAvailableVoices();
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setApiKeyState('');
    setIsKeySet(false);
    setAvailableVoices([]);
    toast.success('API key cleared');
  };

  const handleUpdateConfig = (configId: string, updates: Partial<VoiceConfig>) => {
    setVoiceConfigs(prev => {
      const updated = prev.map(config =>
        config.id === configId ? { ...config, ...updates } : config
      );
      saveVoiceSettings(updated);
      return updated;
    });
  };

  const handleTestVoice = async (configId: string) => {
    const config = voiceConfigs.find(c => c.id === configId);
    if (!config || !config.elevenLabsVoiceId) {
      toast.error('No voice assigned');
      return;
    }

    setGeneratingAudio(configId);
    const audioUrl = await generateSpeech({
      voiceId: config.elevenLabsVoiceId,
      text: `Hello, I am ${config.name}. Welcome to History Academy!`,
      stability: config.stability,
      similarityBoost: config.similarityBoost,
      style: config.style,
      speakerBoost: config.speakerBoost,
    });
    setGeneratingAudio(null);

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      toast.success('Playing test audio');
    } else {
      toast.error('Failed to generate audio');
    }
  };

  const selectedConfig = voiceConfigs.find(c => c.id === selectedConfigId);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-editorial text-3xl font-bold text-foreground">Voice Management</h1>
        <p className="text-muted-foreground mt-1">Configure ElevenLabs voices for Spirit Guides and narration</p>
      </div>

      {/* API Key Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">ElevenLabs API Key</h2>
            <p className="text-sm text-muted-foreground">
              {isKeySet ? 'API key is configured' : 'Enter your API key to enable voice generation'}
            </p>
          </div>
          {isKeySet && (
            <CheckCircle size={20} className="ml-auto text-green-500" />
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="xi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none font-mono text-sm"
            />
          </div>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="px-4 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
          {isKeySet ? (
            <button
              onClick={handleClearApiKey}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 size={18} />
              Clear
            </button>
          ) : (
            <button
              onClick={handleSaveApiKey}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Save size={18} />
              Save
            </button>
          )}
        </div>

        {!isKeySet && (
          <p className="text-xs text-muted-foreground mt-3">
            Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">elevenlabs.io</a>
          </p>
        )}
      </motion.div>

      {/* Available Voices */}
      {isKeySet && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Volume2 size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Available Voices</h2>
                <p className="text-sm text-muted-foreground">
                  {availableVoices.length} voices from your ElevenLabs account
                </p>
              </div>
            </div>
            <button
              onClick={loadAvailableVoices}
              disabled={loadingVoices}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loadingVoices ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {loadingVoices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : availableVoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No voices found. Make sure your API key is correct.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-auto">
              {availableVoices.map((voice) => (
                <div
                  key={voice.voice_id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Mic size={16} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.category}</p>
                  </div>
                  {voice.preview_url && (
                    <button
                      onClick={() => {
                        const audio = new Audio(voice.preview_url);
                        audio.play();
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Play size={14} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Voice Assignments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Mic size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Voice Assignments</h2>
            <p className="text-sm text-muted-foreground">
              Assign ElevenLabs voices to Spirit Guides and narration
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Voice List */}
          <div className="space-y-2">
            {voiceConfigs.map((config) => (
              <VoiceConfigCard
                key={config.id}
                config={config}
                isSelected={selectedConfigId === config.id}
                onClick={() => setSelectedConfigId(config.id)}
                availableVoices={availableVoices}
                onUpdate={(updates) => handleUpdateConfig(config.id, updates)}
                onTest={() => handleTestVoice(config.id)}
                isGenerating={generatingAudio === config.id}
                disabled={!isKeySet}
              />
            ))}
          </div>

          {/* Selected Voice Settings */}
          {selectedConfig && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-muted/50 rounded-xl p-4"
            >
              <h3 className="font-semibold text-foreground mb-4">
                Voice Settings: {selectedConfig.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Stability ({Math.round(selectedConfig.stability * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedConfig.stability * 100}
                    onChange={(e) => handleUpdateConfig(selectedConfig.id, {
                      stability: Number(e.target.value) / 100
                    })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher = more consistent, Lower = more expressive
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Clarity + Similarity ({Math.round(selectedConfig.similarityBoost * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedConfig.similarityBoost * 100}
                    onChange={(e) => handleUpdateConfig(selectedConfig.id, {
                      similarityBoost: Number(e.target.value) / 100
                    })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Style Exaggeration ({Math.round(selectedConfig.style * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedConfig.style * 100}
                    onChange={(e) => handleUpdateConfig(selectedConfig.id, {
                      style: Number(e.target.value) / 100
                    })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Speaker Boost
                  </label>
                  <button
                    onClick={() => handleUpdateConfig(selectedConfig.id, {
                      speakerBoost: !selectedConfig.speakerBoost
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      selectedConfig.speakerBoost ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-foreground rounded-full"
                      animate={{ x: selectedConfig.speakerBoost ? 26 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Info Banner */}
      {!isKeySet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200 font-medium">
                Voice generation disabled
              </p>
              <p className="text-sm text-amber-200/80 mt-1">
                Enter your ElevenLabs API key above to enable voice generation for Spirit Guides and lesson narration.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Voice Config Card Component
function VoiceConfigCard({
  config,
  isSelected,
  onClick,
  availableVoices,
  onUpdate,
  onTest,
  isGenerating,
  disabled,
}: {
  config: VoiceConfig;
  isSelected: boolean;
  onClick: () => void;
  availableVoices: ElevenLabsVoice[];
  onUpdate: (updates: Partial<VoiceConfig>) => void;
  onTest: () => void;
  isGenerating: boolean;
  disabled: boolean;
}) {
  const guide = spiritGuides.find(g => g.id === config.id);
  const assignedVoice = availableVoices.find(v => v.voice_id === config.elevenLabsVoiceId);

  return (
    <div
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-primary/5 border-primary'
          : 'bg-muted/30 border-border hover:border-muted-foreground'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
          {guide?.avatar || '🎙️'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{config.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {assignedVoice ? assignedVoice.name : 'No voice assigned'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }}
          disabled={disabled || !config.elevenLabsVoiceId || isGenerating}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play size={16} className="text-muted-foreground" />
          )}
        </button>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-border">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Assign Voice
          </label>
          <select
            value={config.elevenLabsVoiceId || ''}
            onChange={(e) => onUpdate({ elevenLabsVoiceId: e.target.value || null })}
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm disabled:opacity-50"
          >
            <option value="">Select a voice...</option>
            {availableVoices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name} ({voice.category})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
