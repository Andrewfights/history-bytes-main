import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'landing' | 'signin' | 'signup' | 'forgot';

interface LandingPageProps {
  onAuthSuccess: (userId: string, email: string, isNewUser: boolean) => void;
}

// Demo credentials (for when Firebase is not configured)
const DEMO_USERS = {
  new: {
    id: 'demo-new-user',
    email: 'newuser@historybytes.com',
    password: 'demo123',
    displayName: 'New Explorer',
  },
  existing: {
    id: 'demo-existing-user',
    email: 'scholar@historybytes.com',
    password: 'demo123',
    displayName: 'History Scholar',
  },
};

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (type: 'new' | 'existing') => {
    setIsLoading(true);
    const user = DEMO_USERS[type];

    // Simulate a brief loading state
    setTimeout(() => {
      onAuthSuccess(user.id, user.email, type === 'new');
    }, 500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // If Firebase is configured, use real auth
    if (isConfigured) {
      try {
        await signIn(email, password);
        // Auth state change will be handled by AuthContext
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
        setError(errorMessage);
        setIsLoading(false);
      }
      return;
    }

    // Fall back to demo credentials when Firebase not configured
    const existingUser = DEMO_USERS.existing;
    if (email === existingUser.email && password === existingUser.password) {
      setTimeout(() => {
        onAuthSuccess(existingUser.id, existingUser.email, false);
      }, 500);
      return;
    }

    const newUser = DEMO_USERS.new;
    if (email === newUser.email && password === newUser.password) {
      setTimeout(() => {
        onAuthSuccess(newUser.id, newUser.email, true);
      }, 500);
      return;
    }

    // Invalid credentials
    setTimeout(() => {
      setError('Invalid email or password. Try the demo buttons below!');
      setIsLoading(false);
    }, 500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // If Firebase is configured, use real auth
    if (isConfigured) {
      try {
        await signUp(email, password, name);
        // Auth state change will be handled by AuthContext
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
        setError(errorMessage);
        setIsLoading(false);
      }
      return;
    }

    // For demo, just create a new user
    setTimeout(() => {
      const userId = `user-${Date.now()}`;
      onAuthSuccess(userId, email, true);
    }, 500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!isConfigured) {
      setError('Password reset is not available in demo mode');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox.');
      setIsLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {mode === 'landing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
            >
              <History size={48} className="text-primary" />
            </motion.div>

            <h1 className="font-editorial text-4xl font-bold text-foreground mb-3">
              History Bytes
            </h1>
            <p className="text-muted-foreground mb-8">
              Journey through time. Learn history like never before.
            </p>

            {/* Auth buttons */}
            <div className="space-y-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('signin')}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('signup')}
                className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-base flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
              >
                Create Account
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground">
                  Or try a demo
                </span>
              </div>
            </div>

            {/* Demo buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin('new')}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <Sparkles size={16} />
                Demo: New User Experience
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin('existing')}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                <User size={16} />
                Demo: Returning User
              </motion.button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Demo accounts let you explore without signing up
            </p>
          </motion.div>
        )}

        {/* Sign In Form */}
        {mode === 'signin' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <button
              onClick={() => setMode('landing')}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
            >
              <ArrowRight size={14} className="rotate-180" />
              Back
            </button>

            <h2 className="font-editorial text-2xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in to continue your journey
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setMode('forgot')}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Demo hint */}
            <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Demo Credentials
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('existing')}
                  disabled={isLoading}
                  className="w-full text-left text-xs p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="text-muted-foreground">Returning:</span>{' '}
                  <span className="text-foreground">scholar@historybytes.com</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('new')}
                  disabled={isLoading}
                  className="w-full text-left text-xs p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="text-muted-foreground">New User:</span>{' '}
                  <span className="text-foreground">newuser@historybytes.com</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <button
              onClick={() => setMode('landing')}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
            >
              <ArrowRight size={14} className="rotate-180" />
              Back
            </button>

            <h2 className="font-editorial text-2xl font-bold text-foreground mb-2">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Start your journey through history
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  At least 6 characters
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </motion.button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <button
              onClick={() => setMode('signin')}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
            >
              <ArrowRight size={14} className="rotate-180" />
              Back to sign in
            </button>

            <h2 className="font-editorial text-2xl font-bold text-foreground mb-2">
              Reset your password
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          History Bytes - Learn history through immersive experiences
        </p>
      </div>
    </div>
  );
}
