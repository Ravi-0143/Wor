import React from 'react';
import { WordEntry } from '../../types';

interface FloatingAntigravityCanvasProps {
  words: WordEntry[];
  onSelectWord: (word: WordEntry) => void;
  selectedWordId?: string;
}

export const FloatingAntigravityCanvas: React.FC<FloatingAntigravityCanvasProps> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0F1115]">
      {/* Static serene ambient atmosphere */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)`
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
