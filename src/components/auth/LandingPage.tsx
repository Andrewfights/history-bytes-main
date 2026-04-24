import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Sparkles, CheckCircle, RefreshCw,
  Play, Menu, X, Flame, ChevronRight, Star, Lock as LockIcon,
  Film, Globe, Flag, Pause, Volume2, VolumeX,
  Home, Map, BookOpen, Gamepad2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { HistoryLogo } from '@/components/brand';
import { WW2_HOSTS } from '@/data/ww2Hosts';
import { isFirebaseConfigured } from '@/lib/firebase';
import { getWW2Hosts, type FirestoreWW2Host } from '@/lib/firestore';
import type { WW2Host } from '@/types';

type AuthMode = 'landing' | 'signin' | 'signup' | 'forgot' | 'verify-sent' | 'reset-sent';

// Trailer video path
const TRAILER_VIDEO = '/assets/Teaser.mp4';

// Translate Firebase error codes to user-friendly messages
function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'An unexpected error occurred';
  const message = error.message.toLowerCase();
  if (message.includes('auth/invalid-email')) return 'Please enter a valid email address';
  if (message.includes('auth/user-disabled')) return 'This account has been disabled.';
  if (message.includes('auth/user-not-found')) return 'No account found with this email.';
  if (message.includes('auth/wrong-password') || message.includes('auth/invalid-credential')) return 'Incorrect password.';
  if (message.includes('auth/email-already-in-use')) return 'An account with this email already exists.';
  if (message.includes('auth/weak-password')) return 'Password is too weak. Use at least 6 characters.';
  if (message.includes('auth/too-many-requests')) return 'Too many attempts. Try again later.';
  if (message.includes('auth/network-request-failed')) return 'Network error. Check your connection.';
  return error.message.replace(/Firebase: /g, '').replace(/\(auth\/.*\)\.?/g, '').trim() || 'An error occurred';
}

interface LandingPageProps {
  onAuthSuccess: (userId: string, email: string, isNewUser: boolean) => void;
}

// ============================================
// DEMO CREDENTIALS - Easy access for testing
// ============================================
const DEMO_CREDENTIALS = {
  newUser: { email: 'newuser@historybytes.com', password: 'demo123' },
  returning: { email: 'scholar@historybytes.com', password: 'demo123' },
};

const DEMO_USERS = {
  new: { id: 'demo-new-user', email: DEMO_CREDENTIALS.newUser.email, displayName: 'New Explorer' },
  existing: { id: 'demo-existing-user', email: DEMO_CREDENTIALS.returning.email, displayName: 'History Scholar' },
};

// ============================================
// TRAILER PLAYER COMPONENT
// ============================================
function TrailerPlayer({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  // Handle any user interaction (mouse or touch)
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!showControls) {
      setShowControls(true);
    }
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Set new timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceInteraction >= 2400 && isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  }, [showControls, isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black flex items-center justify-center"
      onClick={onClose}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleInteraction}
    >
      {/* Video container - 16:9 aspect ratio */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl mx-4"
      >
        {/* Video wrapper with 16:9 aspect ratio */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            src={TRAILER_VIDEO}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onClick={handlePlayPause}
          />

          {/* Controls overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: showControls ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-off-white/20 flex items-center justify-center text-off-white hover:bg-black/70 transition-colors pointer-events-auto"
            >
              <X size={20} />
            </button>

            {/* Center play/pause */}
            <button
              onClick={handlePlayPause}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black/50 border-2 border-off-white/30 flex items-center justify-center text-off-white hover:bg-black/70 hover:border-gold-2 transition-all pointer-events-auto"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
              {/* Progress bar */}
              <div
                className="relative h-1 bg-off-white/20 rounded-full mb-3 cursor-pointer group"
                onClick={handleSeek}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gold-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gold-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, marginLeft: '-6px' }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={handlePlayPause}
                    className="text-off-white hover:text-gold-2 transition-colors"
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  </button>

                  {/* Mute */}
                  <button
                    onClick={handleMuteToggle}
                    className="text-off-white hover:text-gold-2 transition-colors"
                  >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>

                  {/* Time */}
                  <span className="font-mono text-xs text-off-white/70">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Trailer label */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ha-red animate-pulse" />
                  <span className="font-mono text-[10px] tracking-[0.2em] text-off-white/60 uppercase">Official Trailer</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative corner flourishes */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-gold-2/40 rounded-tl pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-r-2 border-t-2 border-gold-2/40 rounded-tr pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-2 border-b-2 border-gold-2/40 rounded-bl pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-2 border-b-2 border-gold-2/40 rounded-br pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const { signIn, signUp, resetPassword, sendVerificationEmail, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [ww2Hosts, setWw2Hosts] = useState<(WW2Host & { hidden?: boolean })[]>([]);

  // Load ALL WW2 hosts including hidden ones (for landing page showcase)
  useEffect(() => {
    const loadHosts = async () => {
      // Start with defaults
      setWw2Hosts(WW2_HOSTS);

      // If Firebase is configured, load ALL hosts from Firestore (including hidden)
      if (isFirebaseConfigured()) {
        try {
          const firestoreHosts = await getWW2Hosts();
          if (firestoreHosts && firestoreHosts.length > 0) {
            // Map Firestore hosts to WW2Host format, keeping hidden ones for landing page
            const mappedHosts = firestoreHosts
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map((h: FirestoreWW2Host) => ({
                id: h.id as WW2Host['id'],
                name: h.name,
                title: h.title,
                era: h.era,
                specialty: h.specialty,
                imageUrl: h.imageUrl,
                introVideoUrl: h.introVideoUrl,
                welcomeVideoUrl: h.welcomeVideoUrl,
                moreInfoVideoUrl: h.moreInfoVideoUrl,
                primaryColor: h.primaryColor,
                avatar: h.avatar,
                voiceStyle: h.voiceStyle,
                description: h.description,
                isAvailable: h.isAvailable ?? true,
                hidden: h.hidden ?? false,
              }));
            setWw2Hosts(mappedHosts);
          }
        } catch (e) {
          console.log('[LandingPage] Could not load hosts from Firestore, using defaults');
        }
      }
    };
    loadHosts();
  }, []);

  const handleDemoLogin = (type: 'new' | 'existing') => {
    setIsLoading(true);
    const user = DEMO_USERS[type];
    setTimeout(() => onAuthSuccess(user.id, user.email, type === 'new'), 500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isConfigured) {
      try {
        const result = await signIn(email, password);
        toast.success('Welcome back!');
        onAuthSuccess(result.uid, result.email, false);
      } catch (err: unknown) {
        setError(getAuthErrorMessage(err));
        setIsLoading(false);
      }
      return;
    }

    // Demo fallback
    if (email === DEMO_CREDENTIALS.returning.email && password === DEMO_CREDENTIALS.returning.password) {
      setTimeout(() => onAuthSuccess(DEMO_USERS.existing.id, DEMO_USERS.existing.email, false), 500);
      return;
    }
    if (email === DEMO_CREDENTIALS.newUser.email && password === DEMO_CREDENTIALS.newUser.password) {
      setTimeout(() => onAuthSuccess(DEMO_USERS.new.id, DEMO_USERS.new.email, true), 500);
      return;
    }
    setTimeout(() => { setError('Invalid credentials. Try demo buttons below!'); setIsLoading(false); }, 500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isConfigured) {
      try {
        const result = await signUp(email, password, name);
        toast.success('Account created!');
        onAuthSuccess(result.uid, result.email, true);
      } catch (err: unknown) {
        setError(getAuthErrorMessage(err));
        setIsLoading(false);
      }
      return;
    }
    setTimeout(() => onAuthSuccess(`user-${Date.now()}`, email, true), 500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!isConfigured) { setError('Not available in demo mode'); setIsLoading(false); return; }
    try {
      await resetPassword(email);
      toast.success('Reset link sent!');
      setMode('reset-sent');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent!');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
    setIsResending(false);
  };

  // Show auth modal over landing
  const showAuthModal = mode !== 'landing';

  return (
    <div className="min-h-screen bg-void text-off-white font-body overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-ink/85 backdrop-blur-xl border-b-2 border-ha-red">
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-14 flex items-center">
          {/* History Academy Logo */}
          <div className="flex items-center gap-2.5">
            {/* H Mark */}
            <div className="w-8 h-8 bg-gradient-to-b from-[#F6E355] via-[#E6AB2A] to-[#B2641F] flex items-center justify-center">
              <span className="font-display text-[20px] font-bold text-[#1a1008] leading-none" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.2)' }}>H</span>
            </div>
            {/* Text */}
            <div className="font-display font-bold text-off-white uppercase leading-[0.95]">
              <div className="text-[13px] tracking-[0.01em]">History</div>
              <div className="text-[8px] tracking-[0.22em] font-semibold text-gold-2 mt-[1px]">Academy</div>
            </div>
          </div>

          {/* Desktop Nav - Center section with flex-1 */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8">
            <a href="#features" className="font-mono text-[11px] tracking-[0.2em] uppercase text-off-white/70 hover:text-gold-2 transition-colors">Features</a>
            <a href="#campaigns" className="font-mono text-[11px] tracking-[0.2em] uppercase text-off-white/70 hover:text-gold-2 transition-colors">Campaigns</a>
            <a href="#guides" className="font-mono text-[11px] tracking-[0.2em] uppercase text-off-white/70 hover:text-gold-2 transition-colors">Guides</a>
          </div>

          {/* Right side - Sign In & Get Started */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => setMode('signin')} className="font-mono text-[11px] tracking-[0.2em] uppercase text-off-white/70 hover:text-gold-2 transition-colors">
              Sign In
            </button>
            <button onClick={() => setMode('signup')} className="bg-ha-red text-off-white px-4 py-2 rounded-md font-display text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-ha-red-deep transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-off-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-ink border-t border-off-white/[0.06] overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block font-mono text-sm text-off-white/70 py-2">Features</a>
                <a href="#campaigns" className="block font-mono text-sm text-off-white/70 py-2">Campaigns</a>
                <a href="#guides" className="block font-mono text-sm text-off-white/70 py-2">Guides</a>
                <hr className="border-off-white/10" />
                <button onClick={() => { setMode('signin'); setMobileMenuOpen(false); }} className="block w-full text-left font-mono text-sm text-off-white/70 py-2">Sign In</button>
                <button onClick={() => { setMode('signup'); setMobileMenuOpen(false); }} className="block w-full bg-ha-red text-off-white px-4 py-3 rounded-md font-display text-sm font-bold uppercase tracking-wider">Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-4 md:pt-6 pb-12 md:pb-16 px-4 md:px-10 overflow-hidden" style={{
        background: 'radial-gradient(ellipse at 20% 30%, rgba(205,14,20,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(230,171,42,0.1) 0%, transparent 50%), linear-gradient(180deg, #000 0%, #0A0A0A 100%)'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Hero Text */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                <div className="w-8 h-0.5 bg-ha-red" />
                <span className="font-mono text-[11px] tracking-[0.4em] text-gold-2 uppercase font-semibold">History Academy</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.92] tracking-tight mb-6">
                Step inside<br />
                <span className="text-gold-2" style={{ textShadow: '0 0 60px rgba(230,171,42,0.3)' }}>the moments.</span>
              </h1>
              <p className="font-body text-lg text-off-white/70 leading-relaxed max-w-xl mb-8 mx-auto md:mx-0">
                Pearl Harbor. Normandy. The Berlin Wall. Don't just read about the turning points of history — step inside them, hosted by veterans and scholars who lived them.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-8">
                <button
                  onClick={() => setMode('signup')}
                  className="btn-ha-gold px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3"
                >
                  Begin Your Journey <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-6 py-4 rounded-md border border-off-white/30 font-display text-sm font-bold uppercase tracking-[0.15em] text-off-white hover:border-gold-2 hover:text-gold-2 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="currentColor" /> Watch Trailer
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 justify-center md:justify-start flex-wrap">
                <div className="flex items-center gap-1 text-gold-2 font-mono text-sm">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <span className="ml-2 text-off-white/70">4.9</span>
                </div>
                <div className="w-px h-5 bg-off-white/10" />
                <div className="font-mono text-[10px] tracking-[0.2em] text-off-white/50 uppercase">
                  <strong className="font-display text-sm text-off-white">100K+</strong> Learners
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold-2/10 rounded-full blur-[100px]" />
              <div className="relative w-[280px] md:w-[300px] bg-black rounded-[40px] p-2 border-2 border-charcoal shadow-2xl transform -rotate-3">
                <div className="bg-ink rounded-[32px] overflow-hidden aspect-[9/19.5]">
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-10" />

                  {/* Screen content */}
                  <div className="pt-10 px-4 pb-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <HistoryLogo variant="icon" size="sm" withUnderline={false} />
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-ink-lift border border-gold-2/15 text-gold-2 font-mono text-[10px]">
                        <Flame size={12} /> 8
                      </div>
                    </div>

                    {/* Featured card */}
                    <div className="bg-ink-lift border border-gold-2/15 rounded-xl overflow-hidden">
                      <div className="h-28 relative overflow-hidden">
                        <img
                          src="/assets/ww2-battles/pearl-harbor.png"
                          alt="Pearl Harbor"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
                        <span className="absolute top-2 left-2 bg-black/70 text-gold-2 px-2 py-1 font-mono text-[7px] tracking-wider uppercase rounded">Featured</span>
                        {/* Play indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/50 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-0.5" />
                        </div>
                      </div>
                      <div className="p-2.5 -mt-6 relative z-10">
                        <h3 className="font-serif text-base font-bold">Pearl Harbor</h3>
                        <p className="font-mono text-[8px] text-off-white/50 tracking-wider uppercase mt-0.5">Beat 5 of 10</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="font-mono text-[8px]">
                            <span>8 / 14 Lessons</span>
                            <span className="text-gold-2 ml-2">+442 XP</span>
                          </div>
                          <div className="bg-ha-red text-off-white px-2 py-0.5 font-display text-[7px] font-bold uppercase tracking-wider flex items-center gap-1">
                            Continue
                            <ArrowRight size={8} />
                          </div>
                        </div>
                        <div className="h-0.5 bg-off-white/10 rounded mt-1.5">
                          <div className="h-full w-[57%] bg-gradient-to-r from-gold-dp to-gold-2 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Your Campaign section */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-serif italic text-sm font-bold text-off-white">Your <span className="text-gold-2">Campaign</span></h4>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-ink-lift border border-gold-2/15 text-gold-2 font-mono text-[8px]">
                          <Flame size={10} /> 3
                        </div>
                      </div>
                      {/* Rank card mini */}
                      <div className="bg-ink-lift border border-gold-2/15 rounded-lg p-2 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold-2 rounded-l" />
                        <div className="flex items-center gap-2 ml-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-2 to-gold-dp flex items-center justify-center shadow-[0_2px_8px_rgba(230,171,42,0.3)]">
                            <Star size={14} className="text-black/70" fill="currentColor" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-[6px] tracking-[0.3em] text-off-white/50 uppercase">Current Rank</div>
                            <div className="font-serif italic text-xs font-bold text-gold-2">Time Tourist</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex-1 h-[2px] bg-off-white/10 rounded overflow-hidden">
                                <div className="h-full w-[65%] bg-gradient-to-r from-gold-dp to-gold-2" />
                              </div>
                              <span className="font-mono text-[6px] text-gold-2/70">1,250 XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats row mini */}
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {[
                        { v: '3', l: 'Eras' },
                        { v: '12', l: 'Nodes' },
                        { v: '87%', l: 'Acc.' },
                        { v: '3', l: 'Streak' },
                      ].map((s) => (
                        <div key={s.l} className="bg-ink-lift border border-gold-2/15 rounded p-1.5 text-center">
                          <div className="font-serif italic text-xs font-bold text-off-white">{s.v}</div>
                          <div className="font-mono text-[5px] tracking-[0.2em] text-off-white/50 uppercase">{s.l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Up Next section */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="font-mono text-[7px] tracking-[0.2em] text-off-white/50 uppercase">Up Next</h4>
                        <ChevronRight size={10} className="text-off-white/30" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="flex-1 bg-ink-lift border border-gold-2/15 rounded-lg p-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ha-red/30 to-ha-red-deep/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px]">🎯</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-serif text-[9px] font-bold text-off-white truncate">Radar Alert</div>
                            <div className="font-mono text-[6px] text-gold-2/70">+35 XP</div>
                          </div>
                        </div>
                        <div className="flex-1 bg-ink-lift border border-gold-2/15 rounded-lg p-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-2/20 to-gold-dp/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px]">📻</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-serif text-[9px] font-bold text-off-white truncate">Radio Room</div>
                            <div className="font-mono text-[6px] text-gold-2/70">+40 XP</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Challenge teaser */}
                    <div className="mt-2 bg-gradient-to-r from-ha-red/20 to-ha-red-deep/10 border border-ha-red/30 rounded-lg p-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-ha-red/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={12} className="text-ha-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[7px] tracking-wider text-ha-red uppercase">Daily Challenge</div>
                        <div className="font-serif text-[8px] font-bold text-off-white">Code Talkers Quiz</div>
                      </div>
                      <div className="font-mono text-[8px] text-gold-2 font-bold">+50 XP</div>
                    </div>

                    {/* Bottom nav */}
                    <div className="mt-auto pt-2 flex justify-around border-t border-off-white/10">
                      {[
                        { name: 'Home', icon: Home },
                        { name: 'Journey', icon: Map },
                        { name: 'Learn', icon: BookOpen },
                        { name: 'Arcade', icon: Gamepad2 },
                      ].map((tab, i) => (
                        <div key={tab.name} className={`text-center ${i === 1 ? 'text-gold-2' : 'text-off-white/40'}`}>
                          <tab.icon size={14} className="mx-auto mb-0.5" strokeWidth={i === 1 ? 2.5 : 1.5} />
                          <div className="font-mono text-[5px] tracking-wider uppercase">{tab.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-[15%] -right-4 md:right-0 bg-ink-lift border border-gold-2/30 p-3 rounded-lg shadow-xl transform rotate-3 hidden sm:block">
                <div className="font-mono text-[9px] tracking-[0.2em] text-gold-2 uppercase">Active Campaign</div>
                <div className="font-display text-base font-bold uppercase mt-1">WWII</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-16 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] tracking-[0.4em] text-ha-red uppercase font-semibold mb-4">Why History Academy</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold uppercase mb-4">
              More than <span className="text-gold-2">a textbook.</span>
            </h2>
            <p className="font-body text-lg text-off-white/70 max-w-xl mx-auto">
              Three ways the Academy turns history into something you remember.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Cinematic Lessons', desc: 'Every lesson plays like a History Channel documentary. Archival footage, expert hosts, real moments reconstructed with care.', icon: Film },
              { num: '02', title: 'Step Into the Moment', desc: 'Make choices as Private Lockard at Opana Point. Tune the dial in December 1941. Cast a vote in the Roman Senate.', icon: Globe },
              { num: '03', title: 'Learn Your Way', desc: 'Structured campaigns for the committed. Quick arcade games for the curious. Short-form video feed for scrolling.', icon: Flag },
            ].map((f) => (
              <div key={f.num} className="card-ha p-8 relative overflow-hidden group hover:border-gold-2/30 hover:-translate-y-1 transition-all duration-200">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gold-2 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                <div className="font-mono text-[10px] tracking-[0.3em] text-ha-red uppercase font-semibold mb-5">{f.num} · Experience</div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-2/15 to-gold-3/10 border border-gold-2/15 flex items-center justify-center text-gold-2 mb-5">
                  <f.icon size={26} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl font-bold uppercase mb-3">{f.title}</h3>
                <p className="font-body text-sm text-off-white/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Showcase */}
      <section id="campaigns" className="py-12 md:py-16 px-4 md:px-10" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(205,14,20,0.08), transparent 50%)'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] tracking-[0.4em] text-ha-red uppercase font-semibold mb-4">Available Now</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold uppercase mb-4">
              Start with <span className="text-gold-2">Pearl Harbor.</span>
            </h2>
            <p className="font-body text-lg text-off-white/70 max-w-xl mx-auto">
              Twelve campaigns in production. One ready to take you inside right now.
            </p>
          </div>

          {/* Featured Campaign */}
          <div className="card-ha overflow-hidden grid md:grid-cols-2 mb-8">
            <div className="h-64 md:h-auto relative overflow-hidden">
              <img
                src="/assets/ww2-battles/pearl-harbor.png"
                alt="Pearl Harbor"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.3em] text-gold-2 uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-ha-red rounded-full animate-pulse" /> Live Campaign
              </div>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="font-mono text-[11px] tracking-[0.3em] text-gold-2 uppercase font-semibold mb-4">World War II · Pacific Theater</div>
              <h3 className="font-display text-4xl md:text-5xl font-bold uppercase mb-2">Pearl Harbor</h3>
              <p className="font-serif text-lg italic text-gold-2 mb-5">"A date which will live in infamy."</p>
              <p className="font-body text-off-white/70 leading-relaxed mb-6">
                December 7, 1941. Fourteen lessons tracing the morning from a dismissed radar blip at Opana Point to the "Day of Infamy" address.
              </p>
              <div className="flex gap-8 mb-8 pt-6 border-t border-off-white/[0.08]">
                <div><div className="font-display text-xl font-bold text-gold-2">14</div><div className="font-mono text-[9px] tracking-[0.2em] text-off-white/50 uppercase">Lessons</div></div>
                <div><div className="font-display text-xl font-bold text-gold-2">45m</div><div className="font-mono text-[9px] tracking-[0.2em] text-off-white/50 uppercase">Per Beat</div></div>
                <div><div className="font-display text-xl font-bold text-gold-2">280</div><div className="font-mono text-[9px] tracking-[0.2em] text-off-white/50 uppercase">XP Total</div></div>
              </div>
              <button onClick={() => setMode('signup')} className="btn-ha-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.15em] w-fit flex items-center gap-2">
                Begin Campaign <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'American Revolution', era: '1775 – 1783', season: 'Coming Spring', imageUrl: 'https://images.unsplash.com/photo-1508433957232-3107f5fd5995?w=400&h=300&fit=crop' },
              { title: 'Ancient Greece', era: '800 – 31 BCE', season: 'Coming Summer', imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=300&fit=crop' },
              { title: 'Ancient Egypt', era: '3100 – 30 BCE', season: 'Coming Fall', imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&h=300&fit=crop' },
              { title: 'The Roman Empire', era: '27 BCE – 476 CE', season: 'Coming Winter', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop' },
            ].map((c) => (
              <div key={c.title} className="card-ha overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="h-28 md:h-36 relative bg-gradient-to-br from-charcoal-2 to-ink overflow-hidden">
                  {/* Era image */}
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  <div className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full border border-gold-2/30 flex items-center justify-center text-gold-2">
                    <LockIcon size={12} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-mono text-[8px] md:text-[9px] tracking-[0.25em] text-off-white/50 uppercase mb-1">{c.era}</div>
                  <div className="font-serif text-sm md:text-base font-bold leading-tight mb-1">{c.title}</div>
                  <div className="font-mono text-[9px] text-off-white/50">{c.season}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section id="guides" className="py-12 md:py-16 px-4 md:px-10" style={{
        background: 'linear-gradient(180deg, #000 0%, #0A0A0A 100%)'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] tracking-[0.4em] text-ha-red uppercase font-semibold mb-4">Meet The Cast</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold uppercase mb-4">
              Hosts who <span className="text-gold-2">were there.</span>
            </h2>
            <p className="font-body text-lg text-off-white/70 max-w-xl mx-auto">
              Every campaign is led by someone with personal stakes in the period.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* All WW2 Hosts from Firestore (including hidden ones for landing page showcase) */}
            {ww2Hosts.map((host) => (
              <div key={host.id} className="card-ha overflow-hidden group hover:-translate-y-1 transition-all relative">
                {/* Show "Coming Soon" for unavailable hosts */}
                {host.isAvailable === false && (
                  <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-off-white/70 uppercase bg-black/60 px-3 py-1 rounded">Coming Soon</span>
                  </div>
                )}
                <div className="h-40 md:h-52 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${host.primaryColor}, #0a0a0a)` }}>
                  {/* Real host image if available */}
                  {host.imageUrl ? (
                    <img
                      src={host.imageUrl}
                      alt={host.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-radial from-gold-2/15 to-transparent" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-7xl opacity-90 drop-shadow-lg">
                        {host.avatar}
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 bg-black/70 text-gold-2 px-2 py-0.5 font-mono text-[8px] tracking-[0.2em] uppercase rounded border border-gold-2/20 z-10">{host.era}</span>
                  {host.isAvailable !== false && (
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-success rounded-full shadow-[0_0_8px_rgba(61,214,122,0.6)] z-10" />
                  )}
                </div>
                <div className="p-4 relative">
                  <div className="absolute top-0 left-0 w-8 h-0.5 bg-ha-red" />
                  <h4 className="font-display text-sm md:text-lg font-bold uppercase mt-3 mb-1">{host.name}</h4>
                  <p className="font-serif text-xs md:text-sm italic text-gold-2">{host.title}</p>
                </div>
              </div>
            ))}
            {/* Coming Soon - Rome placeholder (only show if we have fewer than 4 WW2 hosts) */}
            {ww2Hosts.length < 4 && (
              <div className="card-ha overflow-hidden group hover:-translate-y-1 transition-all relative">
                <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-off-white/70 uppercase bg-black/60 px-3 py-1 rounded">Coming Soon</span>
                </div>
                <div className="h-40 md:h-52 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6b5b3d, #0a0a0a)' }}>
                  <div className="absolute inset-0 bg-gradient-radial from-gold-2/15 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-7xl opacity-90 drop-shadow-lg">
                    🏛️
                  </div>
                  <span className="absolute top-2 left-2 bg-black/70 text-gold-2 px-2 py-0.5 font-mono text-[8px] tracking-[0.2em] uppercase rounded border border-gold-2/20 z-10">Rome</span>
                </div>
                <div className="p-4 relative">
                  <div className="absolute top-0 left-0 w-8 h-0.5 bg-ha-red" />
                  <h4 className="font-display text-sm md:text-lg font-bold uppercase mt-3 mb-1">Prof. Aurelia</h4>
                  <p className="font-serif text-xs md:text-sm italic text-gold-2">Classical Historian</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 px-4 md:px-10 border-y border-off-white/[0.08]" style={{
        background: 'linear-gradient(90deg, #CD0E14 0%, #CD0E14 4px, #000 4px)'
      }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '100K+', l: 'Learners Worldwide' },
            { v: '4.9★', l: 'Average Rating' },
            { v: '120', l: 'Lessons Published' },
            { v: '50h', l: 'Content Hours' },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-4xl md:text-6xl font-bold text-gold-2">{s.v}</div>
              <div className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] text-off-white/70 uppercase mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 md:py-20 px-4 md:px-10 text-center relative" style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(205,14,20,0.12), transparent 60%)'
      }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-ha-red" />
        <div className="max-w-3xl mx-auto">
          <div className="font-mono text-xs tracking-[0.45em] text-gold-2 uppercase font-semibold mb-6">Your first campaign is free</div>
          <h2 className="font-display text-5xl md:text-7xl font-bold uppercase mb-6">
            Ready to step <span className="text-gold-2">inside?</span>
          </h2>
          <p className="font-body text-lg text-off-white/70 mb-10 max-w-xl mx-auto">
            Download the Academy. Start with Pearl Harbor. Meet Sgt. Mitchell. Your first fourteen lessons are on the house.
          </p>
          <button onClick={() => setMode('signup')} className="btn-ha-gold px-10 py-5 font-display text-base font-bold uppercase tracking-[0.15em] flex items-center gap-3 mx-auto">
            Get Started Free <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-10 border-t-[3px] border-ha-red bg-void">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* History Academy Logo */}
            <div className="flex items-center gap-2.5">
              {/* H Mark */}
              <div className="w-9 h-9 bg-gradient-to-b from-[#F6E355] via-[#E6AB2A] to-[#B2641F] flex items-center justify-center">
                <span className="font-display text-[22px] font-bold text-[#1a1008] leading-none" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.2)' }}>H</span>
              </div>
              {/* Text */}
              <div className="font-display font-bold text-off-white uppercase leading-[0.95]">
                <div className="text-[14px] tracking-[0.01em]">History</div>
                <div className="text-[9px] tracking-[0.22em] font-semibold text-gold-2 mt-[1px]">Academy</div>
              </div>
            </div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-off-white/50 uppercase">
              © 2024 History Academy. All rights reserved.
            </p>
          </div>

          {/* Demo Credentials - Always visible */}
          <div className="mt-8 p-4 rounded-xl bg-ink-lift border border-gold-2/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-gold-2" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-gold-2 uppercase font-semibold">Demo Credentials</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-gold-2/10">
                <div>
                  <div className="font-mono text-[9px] text-off-white/50 uppercase tracking-wider">New User</div>
                  <div className="text-off-white">{DEMO_CREDENTIALS.newUser.email}</div>
                  <div className="text-off-white/70 text-xs">Password: {DEMO_CREDENTIALS.newUser.password}</div>
                </div>
                <button onClick={() => handleDemoLogin('new')} className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase tracking-wider hover:bg-emerald-500/30 transition-colors">
                  Try
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-gold-2/10">
                <div>
                  <div className="font-mono text-[9px] text-off-white/50 uppercase tracking-wider">Returning User</div>
                  <div className="text-off-white">{DEMO_CREDENTIALS.returning.email}</div>
                  <div className="text-off-white/70 text-xs">Password: {DEMO_CREDENTIALS.returning.password}</div>
                </div>
                <button onClick={() => handleDemoLogin('existing')} className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] uppercase tracking-wider hover:bg-amber-500/30 transition-colors">
                  Try
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setMode('landing')}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-ink border border-gold-2/20 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Sign In */}
              {mode === 'signin' && (
                <>
                  <button onClick={() => setMode('landing')} className="text-sm text-off-white/50 hover:text-off-white mb-6 flex items-center gap-1">
                    <ArrowRight size={14} className="rotate-180" /> Back
                  </button>
                  <h2 className="font-display text-2xl font-bold uppercase mb-2">Welcome back</h2>
                  <p className="text-off-white/70 text-sm mb-6">Sign in to continue your campaign</p>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/50" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-gold-2/15 focus:border-gold-2 outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/50" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-gold-2/15 focus:border-gold-2 outline-none transition-colors" />
                      </div>
                    </div>
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl btn-ha-gold font-display text-sm font-bold uppercase tracking-wider disabled:opacity-50">
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <button onClick={() => setMode('forgot')} className="text-off-white/50 hover:text-gold-2">Forgot password?</button>
                    <button onClick={() => setMode('signup')} className="text-gold-2 hover:underline">Sign up</button>
                  </div>
                  <div className="mt-6 pt-6 border-t border-off-white/10">
                    <p className="text-xs text-center text-off-white/50 mb-3">Quick Demo Access</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleDemoLogin('existing')} className="py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">Returning</button>
                      <button onClick={() => handleDemoLogin('new')} className="py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider">New User</button>
                    </div>
                  </div>
                </>
              )}

              {/* Sign Up */}
              {mode === 'signup' && (
                <>
                  <button onClick={() => setMode('landing')} className="text-sm text-off-white/50 hover:text-off-white mb-6 flex items-center gap-1">
                    <ArrowRight size={14} className="rotate-180" /> Back
                  </button>
                  <h2 className="font-display text-2xl font-bold uppercase mb-2">Create Account</h2>
                  <p className="text-off-white/70 text-sm mb-6">Start your campaign through history</p>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/50" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-gold-2/15 focus:border-gold-2 outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/50" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-gold-2/15 focus:border-gold-2 outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/50" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" required minLength={6} className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-gold-2/15 focus:border-gold-2 outline-none transition-colors" />
                      </div>
                      <p className="text-xs text-off-white/50 mt-1">At least 6 characters</p>
                    </div>
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl btn-ha-gold font-display text-sm font-bold uppercase tracking-wider disabled:opacity-50">
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </form>
                  <p className="text-center text-sm text-off-white/50 mt-6">
                    Already have an account? <button onClick={() => setMode('signin')} className="text-gold-2 hover:underline">Sign in</button>
                  </p>
                </>
              )}

              {/* Forgot Password */}
              {mode === 'forgot' && (
                <>
                  <button onClick={() => setMode('signin')} className="text-sm text-off-white/50 hover:text-off-white mb-6 flex items-center gap-1">
                    <ArrowRight size={14} className="rotate-180" /> Back
                  </button>
                  <h2 className="font-display text-2xl font-bold uppercase mb-2">Reset Password</h2>
                  <p className="text-off-white/70 text-sm mb-6">Enter your email for a reset link</p>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/50" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-gold-2/15 focus:border-gold-2 outline-none transition-colors" />
                    </div>
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl btn-ha-gold font-display text-sm font-bold uppercase tracking-wider disabled:opacity-50">
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              )}

              {/* Verify Email Sent */}
              {mode === 'verify-sent' && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Mail size={36} className="text-emerald-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase mb-2">Check Your Email</h2>
                  <p className="text-off-white/70 text-sm mb-6">Verification link sent to <span className="text-off-white">{email}</span></p>
                  {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 mb-4">{error}</p>}
                  {success && <p className="text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 mb-4">{success}</p>}
                  <button onClick={() => setMode('signin')} className="w-full py-3.5 rounded-xl btn-ha-gold font-display text-sm font-bold uppercase mb-3">Go to Sign In</button>
                  <button onClick={handleResendVerification} disabled={isResending} className="w-full py-3 rounded-xl border border-off-white/20 text-off-white/70 text-sm flex items-center justify-center gap-2">
                    {isResending ? <><RefreshCw size={14} className="animate-spin" /> Sending...</> : <><RefreshCw size={14} /> Resend</>}
                  </button>
                </div>
              )}

              {/* Reset Email Sent */}
              {mode === 'reset-sent' && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle size={36} className="text-emerald-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase mb-2">Reset Link Sent</h2>
                  <p className="text-off-white/70 text-sm mb-6">Check <span className="text-off-white">{email}</span> for the link</p>
                  <button onClick={() => setMode('signin')} className="w-full py-3.5 rounded-xl btn-ha-gold font-display text-sm font-bold uppercase mb-3">Return to Sign In</button>
                  <button onClick={() => setMode('forgot')} className="w-full py-3 rounded-xl border border-off-white/20 text-off-white/70 text-sm">Send Another Link</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Video Modal */}
      <AnimatePresence>
        {showTrailer && (
          <TrailerPlayer onClose={() => setShowTrailer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
