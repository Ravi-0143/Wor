import React, { useState } from 'react';
import { WordEntry } from '../../types';
import { 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Sparkles, 
  BookOpen,
  Star,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MasteryTrackerViewProps {
  words: WordEntry[];
  masteredIds: string[];
  onToggleMastery: (wordId: string) => void;
}

export const MasteryTrackerView: React.FC<MasteryTrackerViewProps> = ({
  words,
  masteredIds,
  onToggleMastery,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'flashcard' | 'list'>('flashcard');

  const unmasteredWords = words.filter(w => !masteredIds.includes(w.id));
  const masteredWords = words.filter(w => masteredIds.includes(w.id));

  const currentWord = unmasteredWords[currentIndex] || unmasteredWords[0] || null;

  const handleNextCard = (markMastered: boolean) => {
    if (currentWord && markMastered) {
      onToggleMastery(currentWord.id);
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {
        // confetti may fail in canvas-blocked or non-secure contexts — not critical
      }
    }
    setIsFlipped(false);
    if (currentIndex < unmasteredWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const progressPercent = words.length > 0 ? Math.round((masteredIds.length / words.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      
      {/* Header Progress Card */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900 font-sans">Mastery Flashcard Engine</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Test recall memory on unmastered word characters with interactive flip cards.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">{progressPercent}%</span>
              <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">
                {masteredIds.length} / {words.length} Mastered
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold font-mono">
              <Flame className="h-5 w-5 fill-emerald-500 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-200/80 p-1 border border-slate-300/80">
          <button
            onClick={() => setActiveTab('flashcard')}
            className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all ${
              activeTab === 'flashcard' ? 'bg-white text-indigo-900 shadow-md' : 'text-slate-600'
            }`}
          >
            Spaced Flashcard Mode ({unmasteredWords.length})
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all ${
              activeTab === 'list' ? 'bg-white text-emerald-900 shadow-md' : 'text-slate-600'
            }`}
          >
            Mastered Characters Archive ({masteredWords.length})
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Flashcard */}
      {activeTab === 'flashcard' && (
        <div className="space-y-6">
          {unmasteredWords.length === 0 ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-12 text-center space-y-4 shadow-xl">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 font-serif">
                All Word Characters Mastered! 🎉
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                You have successfully mastered all vocabulary words in this revision guide. Revisit the archive or load another guide.
              </p>
            </div>
          ) : currentWord ? (
            <div className="space-y-6">
              {/* Flip Card Container */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="group relative min-h-[320px] w-full cursor-pointer rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl transition-all duration-500 hover:shadow-indigo-100 flex flex-col justify-between"
              >
                {!isFlipped ? (
                  /* FRONT OF CARD */
                  <div className="flex flex-col items-center justify-center text-center my-auto space-y-4">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-mono font-bold text-indigo-700 border border-indigo-200">
                      {currentWord.category}
                    </span>
                    <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-serif">
                      {currentWord.word}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => handleSpeak(e, currentWord.word)}
                        className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-mono text-slate-400">Click card to reveal definition & synonyms</span>
                    </div>
                  </div>
                ) : (
                  /* BACK OF CARD */
                  <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-2xl font-bold text-slate-900 font-serif">{currentWord.word}</h4>
                        {currentWord.hindiMeaning && (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                            {currentWord.hindiMeaning}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-medium font-sans">
                        "{currentWord.meaning}"
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-indigo-800 font-mono uppercase">Core Synonyms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(currentWord.coreSynonyms || []).map((s, idx) => (
                          <span key={idx} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900 border border-indigo-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {currentWord.traps && (
                      <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 font-sans">
                        <strong>Trap Warning:</strong> {currentWord.traps}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                  Card {currentIndex + 1} of {unmasteredWords.length}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleNextCard(false)}
                  className="flex items-center gap-2 rounded-2xl bg-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-all shadow-sm"
                >
                  <XCircle className="h-4 w-4 text-slate-500" />
                  <span>Needs Practice (Skip)</span>
                </button>

                <button
                  onClick={() => handleNextCard(true)}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>I Know This (Mark Mastered)</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Mode 2: Mastered List */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {masteredWords.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              No mastered words yet. Practice with the flashcards above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masteredWords.map((word) => (
                <div key={word.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">{word.word}</h4>
                    <p className="text-xs text-slate-600 font-sans line-clamp-1">{word.meaning}</p>
                  </div>
                  <button
                    onClick={() => onToggleMastery(word.id)}
                    className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50"
                  >
                    Unmaster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
