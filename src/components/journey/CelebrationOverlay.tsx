import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
  duration: number;
}

export function CelebrationOverlay() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#C6A24F', '#E8C979', '#3FAF7D', '#F5F2EA', '#B88A2E'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        duration: 2 + Math.random() * 1.5,
      });
    }

    setParticles(newParticles);

    // Clear after animation
    const timer = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              left: `${particle.x}%`,
              top: '-5%',
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              top: '110%',
              rotate: particle.rotation + 720,
              opacity: [1, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              boxShadow: `0 0 ${particle.size}px ${particle.color}40`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
