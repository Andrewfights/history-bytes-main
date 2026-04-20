/**
 * AppSettingsEditor - Admin panel for app-wide settings
 * Includes toggles for welcome screen, onboarding, etc.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Check, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import {
  getOnboardingSettings,
  saveOnboardingSettings,
  subscribeToOnboardingSettings,
  type FirestoreOnboardingSettings,
} from '@/lib/firestore';
import { toast } from 'sonner';

export function AppSettingsEditor() {
  const [settings, setSettings] = useState<FirestoreOnboardingSettings>({
    showWelcomeScreen: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Subscribe to settings
  useEffect(() => {
    const unsubscribe = subscribeToOnboardingSettings((data) => {
      setSettings(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleWelcomeScreen = async () => {
    setIsSaving(true);
    const newValue = !settings.showWelcomeScreen;

    try {
      await saveOnboardingSettings({ showWelcomeScreen: newValue });
      toast.success(
        newValue
          ? 'Welcome screen enabled'
          : 'Welcome screen disabled for demo',
        {
          description: newValue
            ? 'New users will see the welcome screen'
            : 'Users will skip directly to the app',
        }
      );
    } catch (error) {
      console.error('Failed to save setting:', error);
      toast.error('Failed to save setting');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">App Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure app-wide behavior and features
          </p>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        {/* Welcome Screen Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Welcome Screen</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Show the "Welcome to History Bytes" onboarding screen for new/demo users
              </p>
            </div>
            <button
              onClick={handleToggleWelcomeScreen}
              disabled={isSaving}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.showWelcomeScreen
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            >
              <motion.div
                animate={{
                  x: settings.showWelcomeScreen ? 24 : 4,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                ) : settings.showWelcomeScreen ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : null}
              </motion.div>
            </button>
          </div>

          {/* Status indicator */}
          <div className={`mt-3 text-xs px-2 py-1 rounded-md inline-flex items-center gap-1 ${
            settings.showWelcomeScreen
              ? 'bg-green-500/10 text-green-400'
              : 'bg-amber-500/10 text-amber-400'
          }`}>
            {settings.showWelcomeScreen ? (
              <>
                <ToggleRight size={14} />
                Enabled - Users will see welcome screen
              </>
            ) : (
              <>
                <ToggleLeft size={14} />
                Disabled - Users skip to app (Demo Mode)
              </>
            )}
          </div>
        </motion.div>

        {/* Info box */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Disable the welcome screen for demos
            to let users jump straight into the app experience.
          </p>
        </div>
      </div>
    </div>
  );
}
