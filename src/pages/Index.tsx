import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { JourneyTab } from '@/components/tabs/JourneyTab';
import { LearnTab } from '@/components/tabs/LearnTab';
import { ArcadeTab } from '@/components/tabs/ArcadeTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { WatchTab } from '@/components/tabs/WatchTab';
import { SessionFlow } from '@/components/session/SessionFlow';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { LandingPage } from '@/components/auth/LandingPage';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    isOnboarded,
    completeOnboarding,
    setSelectedGuide,
    isHydrated,
    isAuthenticated,
    signIn,
  } = useApp();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const handleStartSession = () => setIsSessionActive(true);
  const handleCloseSession = () => setIsSessionActive(false);
  const handlePlayDaily = () => setActiveTab('arcade');
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setActiveTab('learn');
  };
  const handleSelectChapter = () => setIsSessionActive(true);

  const handleOnboardingComplete = (guideId: string) => {
    setSelectedGuide(guideId);
    completeOnboarding();
    setActiveTab('home'); // Ensure user lands on home after onboarding
  };

  const handleAuthSuccess = (userId: string, email: string, isNewUser: boolean) => {
    signIn(userId, email, isNewUser);
  };

  // Show loading state while hydrating from localStorage
  if (!isHydrated) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📜</div>
          <p className="text-muted-foreground text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Show onboarding for first-time users (after authentication)
  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-dvh bg-background">
      <AnimatePresence>
        {isSessionActive && (
          <SessionFlow
            sessionId="s1"
            topicTitle={selectedTopicId || "WWII — The Blitz"}
            onClose={handleCloseSession}
            onNextSession={handleCloseSession}
          />
        )}
      </AnimatePresence>

      {!isSessionActive && (
        <>
          <Header />
          <main className="max-w-lg md:max-w-4xl mx-auto pb-20 md:pb-6">
            {activeTab === 'home' && (
              <HomeTab
                onStartSession={handleStartSession}
                onPlayDaily={handlePlayDaily}
                onSelectTopic={handleSelectTopic}
              />
            )}
            {activeTab === 'journey' && <JourneyTab />}

            {activeTab === 'learn' && (
              <LearnTab
                initialTopicId={selectedTopicId || undefined}
                onSelectChapter={handleSelectChapter}
              />
            )}
            {activeTab === 'arcade' && <ArcadeTab />}
            {activeTab === 'watch' && <WatchTab />}
            {activeTab === 'profile' && <ProfileTab />}
          </main>
          <BottomNav />
        </>
      )}
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
