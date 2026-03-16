import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLiveGuide } from '@/hooks/useLiveData';
import { generateSpeech } from '@/lib/elevenlabs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GuideChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideChatModal({ isOpen, onClose }: GuideChatModalProps) {
  const { selectedGuideId } = useApp();
  const guide = useLiveGuide(selectedGuideId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize with guide's first message
  useEffect(() => {
    if (isOpen && guide && messages.length === 0) {
      const greeting = guide.firstMessage || guide.welcomeMessage || `Greetings! I am ${guide.name}. How may I assist you on your journey through history?`;
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, guide, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear messages when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset after animation completes
      const timer = setTimeout(() => {
        setMessages([]);
        setInput('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // History Channel colors: gold (amber), red, black, white - no blue
  const colorMap: Record<string, { bg: string; border: string; text: string; msgBg: string }> = {
    gold: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', msgBg: 'bg-amber-500/20' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', msgBg: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', msgBg: 'bg-red-500/20' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300', msgBg: 'bg-slate-500/20' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', msgBg: 'bg-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', msgBg: 'bg-purple-500/20' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', msgBg: 'bg-rose-500/20' },
  };

  const colors = guide ? (colorMap[guide.primaryColor] || colorMap.amber) : colorMap.amber;

  const speakText = async (text: string) => {
    if (!guide?.elevenLabsVoiceId || !audioEnabled) return;

    setIsSpeaking(true);
    try {
      const audioUrl = await generateSpeech({
        voiceId: guide.elevenLabsVoiceId,
        text,
        stability: guide.voiceStability,
        similarityBoost: guide.voiceSimilarity,
        style: guide.voiceStyle,
      });

      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (err) {
      console.error('Speech error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !guide) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Generate AI response using guide's personality and knowledge
      const response = await generateGuideResponse(userMessage.content, guide, messages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if audio is enabled
      if (audioEnabled && guide.elevenLabsVoiceId) {
        speakText(response);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I seem to be having trouble responding right now. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!guide) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg h-[85vh] sm:h-[600px] bg-card border border-border rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-border ${colors.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full overflow-hidden ${colors.border} border-2`}>
                  {guide.imageUrl ? (
                    <img src={guide.imageUrl} alt={guide.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-xl">{guide.avatar}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{guide.name}</h3>
                  <p className={`text-xs ${colors.text}`}>{guide.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {guide.elevenLabsVoiceId && (
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2 rounded-full transition-colors ${audioEnabled ? colors.bg + ' ' + colors.text : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : `${colors.msgBg} text-foreground rounded-bl-md`
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{guide.avatar}</span>
                        <span className={`text-xs ${colors.text} font-medium`}>{guide.name.split(' ')[0]}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`px-4 py-3 rounded-2xl ${colors.msgBg} rounded-bl-md`}>
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className={`animate-spin ${colors.text}`} />
                      <span className="text-sm text-muted-foreground">{guide.name.split(' ')[0]} is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Sparkles size={12} className={colors.text} />
                  <span>Speaking...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${guide.name.split(' ')[0]} anything...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none text-sm"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </motion.button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {guide.name} draws from their historical knowledge to respond
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple AI response generation based on guide personality
// In a real app, this would call an actual AI service
async function generateGuideResponse(
  userMessage: string,
  guide: any,
  history: Message[]
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const userMessageLower = userMessage.toLowerCase();

  // Context-aware responses based on guide's personality and era
  const personality = guide.personality || 'wise';
  const name = guide.name;
  const era = guide.era || '';
  const specialty = guide.specialty || 'history';

  // Simple rule-based responses with personality variations
  const responses: Record<string, string[]> = {
    greeting: [
      `Greetings, curious seeker! I am delighted to continue our discourse.`,
      `Ah, you return! Excellent. What knowledge shall we pursue today?`,
      `Welcome back, young scholar. Your thirst for knowledge honors me.`,
    ],
    history: [
      `${specialty} is a fascinating subject! In my time, we understood that history teaches us about our present as much as our past.`,
      `History, they say, does not repeat itself, but it often rhymes. What specific era interests you?`,
      `The study of the past illuminates the path forward. What period would you like to explore?`,
    ],
    about: [
      `I am ${name}, from the ${era}. My life's work has been dedicated to ${specialty.toLowerCase()}.`,
      `As ${guide.title}, I have spent my days contemplating the great questions of existence.`,
      `My journey through ${era} has given me unique insights into ${specialty.toLowerCase()}.`,
    ],
    question: [
      `A thought-provoking question! Let me share my perspective from ${era}...`,
      `That is precisely the kind of inquiry that drives wisdom. Consider this...`,
      `You touch upon something profound. In my experience, the answer lies in questioning further.`,
    ],
    default: [
      `Indeed, that is worthy of contemplation. In ${era}, we would say that all knowledge connects.`,
      `Your curiosity reminds me of my own pupils. Let us explore this together.`,
      `Fascinating! This brings to mind lessons from my time in ${era}.`,
    ],
  };

  // Determine response category
  let category = 'default';
  if (userMessageLower.match(/^(hi|hello|hey|greetings)/)) {
    category = 'greeting';
  } else if (userMessageLower.includes('history') || userMessageLower.includes('past')) {
    category = 'history';
  } else if (userMessageLower.includes('who are you') || userMessageLower.includes('tell me about yourself') || userMessageLower.includes('your name')) {
    category = 'about';
  } else if (userMessageLower.includes('?') || userMessageLower.includes('how') || userMessageLower.includes('what') || userMessageLower.includes('why')) {
    category = 'question';
  }

  // Select random response from category
  const categoryResponses = responses[category];
  const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

  // Add a catchphrase occasionally
  if (Math.random() > 0.7 && guide.catchphrases?.length > 0) {
    const catchphrase = guide.catchphrases[Math.floor(Math.random() * guide.catchphrases.length)];
    return `${response}\n\nAs I always say: "${catchphrase}"`;
  }

  return response;
}

export default GuideChatModal;
