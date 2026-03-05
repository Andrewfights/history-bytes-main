import { motion } from 'framer-motion';
import { Share2, Link2 } from 'lucide-react';

interface ShareCardProps {
  title: string;
  subtitle: string;
  onShareImage?: () => void;
  onCopyLink?: () => void;
}

export function ShareCard({ title, subtitle, onShareImage, onCopyLink }: ShareCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm mx-auto rounded-2xl border border-primary/30 bg-card overflow-hidden"
    >
      <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">Achievement</p>
        <h2 className="font-editorial text-xl font-bold mt-2">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        <p className="font-editorial text-lg font-bold text-primary mt-4">
          HISTORY<span className="text-secondary">+</span>
        </p>
      </div>

      <div className="flex gap-3 p-4">
        <button
          onClick={onShareImage}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
        >
          <Share2 size={16} />
          Share Image
        </button>
        <button
          onClick={onCopyLink}
          className="flex-1 py-3 rounded-xl border border-border font-bold text-sm flex items-center justify-center gap-2 transition-all hover:border-primary/50 active:scale-95"
        >
          <Link2 size={16} />
          Copy Link
        </button>
      </div>
    </motion.div>
  );
}
