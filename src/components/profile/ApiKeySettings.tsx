/**
 * ApiKeySettings - Manage user API keys for AI features
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Check, X, ExternalLink, Sparkles } from 'lucide-react';
import {
  getStoredApiKeys,
  saveApiKey,
  removeApiKey,
  maskApiKey,
  hasApiKey,
  isUsingUserKey,
  StoredApiKeys,
} from '@/lib/apiKeys';

interface ApiKeyInputProps {
  service: keyof StoredApiKeys;
  label: string;
  description: string;
  placeholder: string;
  helpUrl: string;
}

function ApiKeyInput({ service, label, description, placeholder, helpUrl }: ApiKeyInputProps) {
  const [value, setValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const storedKeys = getStoredApiKeys();
  const currentKey = storedKeys[service];
  const isConfigured = hasApiKey(service);
  const isUserKey = isUsingUserKey(service);

  useEffect(() => {
    if (currentKey) {
      setValue(currentKey);
    }
  }, [currentKey]);

  const handleSave = () => {
    if (value.trim()) {
      saveApiKey(service, value.trim());
      setIsEditing(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleRemove = () => {
    removeApiKey(service);
    setValue('');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(currentKey || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-primary" />
          <h4 className="font-semibold text-sm">{label}</h4>
          {isConfigured && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isUserKey
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isUserKey ? 'Your Key' : 'Default'}
            </span>
          )}
        </div>
        <a
          href={helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          Get Key <ExternalLink size={12} />
        </a>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{description}</p>

      {isEditing ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!value.trim()}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Save Key
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium text-sm"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {currentKey ? (
            <>
              <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground">
                {maskApiKey(currentKey)}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium"
              >
                Edit
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRemove}
                className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <X size={16} />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="w-full py-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              + Add API Key
            </motion.button>
          )}
        </div>
      )}

      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-green-400 flex items-center gap-1"
        >
          <Check size={14} />
          Key saved successfully
        </motion.div>
      )}
    </div>
  );
}

export function ApiKeySettings() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-primary" />
        <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          AI Features
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Add your own API keys to unlock AI-powered features. Keys are stored locally on your device.
      </p>

      <ApiKeyInput
        service="gemini"
        label="Google Gemini"
        description="Powers AI image generation for historical scenes and characters."
        placeholder="AIzaSy..."
        helpUrl="https://aistudio.google.com/app/apikey"
      />

      {/* Can add more API key inputs here in the future */}
      {/*
      <ApiKeyInput
        service="elevenlabs"
        label="ElevenLabs"
        description="Powers AI voice narration for lessons."
        placeholder="sk_..."
        helpUrl="https://elevenlabs.io/app/settings/api-keys"
      />
      */}
    </div>
  );
}
