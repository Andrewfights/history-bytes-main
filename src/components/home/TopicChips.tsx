import { motion } from 'framer-motion';
import { mockTopics } from '@/data/mockData';

interface TopicChipsProps {
  selectedTopic: string | null;
  onSelect: (topicId: string) => void;
}

export function TopicChips({ selectedTopic, onSelect }: TopicChipsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Explore Topics
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {mockTopics.map((topic, index) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={() => onSelect(topic.id)}
            className={`topic-chip ${selectedTopic === topic.id ? 'topic-chip-active' : ''}`}
          >
            <span className="mr-1.5">{topic.icon}</span>
            {topic.title}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
