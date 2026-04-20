import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, BookOpen, Trophy, Gamepad2 } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (guideId: string) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBegin = () => {
    setIsAnimating(true);
    // Pass empty string since we're not using guides for now
    setTimeout(() => {
      onComplete('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-48 h-48 bg-gold-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-8 shadow-xl shadow-primary/20"
        >
          <span className="text-5xl">📜</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-editorial text-4xl font-bold text-center mb-4"
        >
          Welcome to
          <br />
          <span className="text-primary">History Academy</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-center max-w-sm mb-12"
        >
          Discover history through interactive stories, challenges, and games.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm space-y-3 mb-12"
        >
          <FeatureRow
            icon={<BookOpen size={20} />}
            title="Interactive Stories"
            description="Learn through immersive historical narratives"
            delay={0.7}
          />
          <FeatureRow
            icon={<Gamepad2 size={20} />}
            title="Fun Challenges"
            description="Test your knowledge with mini-games"
            delay={0.8}
          />
          <FeatureRow
            icon={<Trophy size={20} />}
            title="Earn Rewards"
            description="Level up and unlock new content"
            delay={0.9}
          />
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={handleBegin}
          disabled={isAnimating}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAnimating ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={20} />
              Start Exploring
              <ChevronRight size={20} />
            </>
          )}
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="pb-8 text-center"
      >
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}

interface FeatureRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureRow({ icon, title, description, delay }: FeatureRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
