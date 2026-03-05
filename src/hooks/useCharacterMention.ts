/**
 * Hook for handling @ character mentions in text inputs
 * Provides autocomplete suggestions and resolves mentions to style prompts
 */

import { useState, useCallback, useMemo } from 'react';
import { getAllSpiritGuides } from '@/data/spiritGuidesData';
import type { SpiritGuide } from '@/types';

export interface CharacterMention {
  id: string;
  name: string;
  stylePrompt?: string;
  imageUrl?: string;
}

export interface MentionSuggestion {
  id: string;
  name: string;
  title: string;
  avatar: string;
  imageUrl?: string;
}

interface UseCharacterMentionOptions {
  customCharacters?: CharacterMention[];
}

interface UseCharacterMentionReturn {
  suggestions: MentionSuggestion[];
  showSuggestions: boolean;
  query: string;
  selectedIndex: number;
  handleInputChange: (value: string, cursorPosition: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => string | null;
  selectSuggestion: (suggestion: MentionSuggestion) => string;
  closeSuggestions: () => void;
  resolveMentions: (text: string) => string;
  extractMentions: (text: string) => string[];
}

export function useCharacterMention(
  options: UseCharacterMentionOptions = {}
): UseCharacterMentionReturn {
  const { customCharacters = [] } = options;

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [currentValue, setCurrentValue] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  // Combine default guides with custom characters
  const allCharacters = useMemo(() => {
    const guides = getAllSpiritGuides();
    const guideCharacters: CharacterMention[] = guides.map(g => ({
      id: g.id,
      name: g.name,
      stylePrompt: buildDefaultStylePrompt(g),
      imageUrl: g.imageUrl,
    }));
    return [...guideCharacters, ...customCharacters];
  }, [customCharacters]);

  // Filter suggestions based on query
  const suggestions = useMemo((): MentionSuggestion[] => {
    if (!query) return [];

    const guides = getAllSpiritGuides();
    const filtered = guides.filter(g =>
      g.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.slice(0, 5).map(g => ({
      id: g.id,
      name: g.name,
      title: g.title,
      avatar: g.avatar,
      imageUrl: g.imageUrl,
    }));
  }, [query]);

  // Handle input change to detect @ mentions
  const handleInputChange = useCallback((value: string, cursorPosition: number) => {
    setCurrentValue(value);
    setCursorPos(cursorPosition);

    // Find if we're in a mention context
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      // Check if there's a space between @ and cursor (would end the mention)
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      const hasSpace = textAfterAt.includes(' ');

      if (!hasSpace) {
        setMentionStart(atIndex);
        setQuery(textAfterAt);
        setShowSuggestions(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
    setQuery('');
    setMentionStart(-1);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent): string | null => {
    if (!showSuggestions || suggestions.length === 0) return null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        return null;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return null;

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        if (selected) {
          return selectSuggestion(selected);
        }
        return null;

      case 'Escape':
        setShowSuggestions(false);
        return null;

      default:
        return null;
    }
  }, [showSuggestions, suggestions, selectedIndex]);

  // Select a suggestion and insert it into the text
  const selectSuggestion = useCallback((suggestion: MentionSuggestion): string => {
    if (mentionStart === -1) return currentValue;

    const beforeMention = currentValue.substring(0, mentionStart);
    const afterMention = currentValue.substring(cursorPos);
    const newValue = `${beforeMention}@${suggestion.name}${afterMention}`;

    setShowSuggestions(false);
    setQuery('');
    setMentionStart(-1);

    return newValue;
  }, [currentValue, mentionStart, cursorPos]);

  // Close suggestions
  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setQuery('');
    setMentionStart(-1);
  }, []);

  // Resolve all @ mentions in text to their style prompts
  const resolveMentions = useCallback((text: string): string => {
    let result = text;

    // Find all @mentions
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionName = match[1];
      const character = allCharacters.find(
        c => c.name.toLowerCase() === mentionName.toLowerCase()
      );

      if (character && character.stylePrompt) {
        // Replace @Name with the style prompt
        result = result.replace(
          `@${mentionName}`,
          `[${character.name}: ${character.stylePrompt}]`
        );
      }
    }

    return result;
  }, [allCharacters]);

  // Extract all @ mentions from text
  const extractMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }, []);

  return {
    suggestions,
    showSuggestions,
    query,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    selectSuggestion,
    closeSuggestions,
    resolveMentions,
    extractMentions,
  };
}

// Build default style prompt for a guide
function buildDefaultStylePrompt(guide: SpiritGuide): string {
  const parts: string[] = [];

  // Add era-specific styling
  if (guide.era.includes('Greece')) {
    parts.push('ancient Greek attire', 'toga', 'classical setting');
  } else if (guide.era.includes('Egypt')) {
    parts.push('ancient Egyptian royal attire', 'golden jewelry', 'kohl-lined eyes');
  } else if (guide.era.includes('Renaissance')) {
    parts.push('Renaissance-era clothing', 'Italian style');
  } else if (guide.era.includes('19th Century')) {
    parts.push('19th century American attire');
  } else if (guide.era.includes('Tudor')) {
    parts.push('Tudor-era royal attire', 'elaborate ruff collar');
  } else if (guide.era.includes('China')) {
    parts.push('ancient Chinese attire', 'traditional robes');
  }

  // Add personality-based styling
  if (guide.personality === 'wise') {
    parts.push('thoughtful expression', 'dignified pose');
  } else if (guide.personality === 'regal') {
    parts.push('commanding presence', 'royal bearing');
  } else if (guide.personality === 'scholarly') {
    parts.push('intellectual appearance', 'surrounded by books or equipment');
  } else if (guide.personality === 'bold') {
    parts.push('determined expression', 'strong stance');
  }

  return parts.join(', ');
}

// Export a component for the mention popup
export function getMentionPopupPosition(
  inputElement: HTMLInputElement | HTMLTextAreaElement | null,
  mentionStart: number
): { top: number; left: number } {
  if (!inputElement) return { top: 0, left: 0 };

  // Create a temporary span to measure text position
  const span = document.createElement('span');
  span.style.font = getComputedStyle(inputElement).font;
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.whiteSpace = 'pre';
  span.textContent = inputElement.value.substring(0, mentionStart);
  document.body.appendChild(span);

  const inputRect = inputElement.getBoundingClientRect();
  const textWidth = span.offsetWidth;
  document.body.removeChild(span);

  return {
    top: inputRect.bottom + 4,
    left: inputRect.left + Math.min(textWidth, inputRect.width - 200),
  };
}
