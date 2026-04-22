import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WW2IntroProps {
  onBegin: () => void;
}

export function WW2Intro({ onBegin }: WW2IntroProps) {
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Fade in narration text after a delay
    const textTimer = setTimeout(() => setShowText(true), 500);
    // Show button after text appears
    const buttonTimer = setTimeout(() => setShowButton(true), 2500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Background video placeholder - grainy B&W effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black">
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 text-center max-w-md">
        {/* Era Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-editorial text-4xl font-bold text-white tracking-wide">
            WORLD WAR II
          </h1>
          <p className="text-lg text-white/60 mt-2 tracking-widest">
            1939 – 1945
          </p>
        </motion.div>

        {/* Narration Text */}
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="mb-12"
            >
              <p className="text-xl text-white/90 leading-relaxed font-light italic">
                "Before steel collided on the battlefield...
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-xl text-white/90 leading-relaxed font-light italic mt-2"
              >
                before tanks crossed Europe...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-xl text-white/90 leading-relaxed font-light italic mt-2"
              >
                a different kind of war was fought."
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Begin Button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={onBegin}
              className="px-12 py-4 rounded-xl bg-white text-black font-bold text-lg tracking-wide hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
            >
              Begin
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />
    </motion.div>
  );
}
