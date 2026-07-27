import React, { useState, useMemo } from 'react';
import { WordEntry } from '../../types';
import { Compass, Search, ArrowRight, Sparkles } from 'lucide-react';

interface ReverseIndexViewProps {
  words: WordEntry[];
  onSelectWord: (word: WordEntry) => void;
  onOpenAIExplanation: (word: WordEntry) => void;
}

export const ReverseIndexView: React.FC<ReverseIndexViewProps> = ({
  words,
  onSelectWord,
  onOpenAIExplanation
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const conceptMap = useMemo(() => {
    const map = new Map<string, WordEntry[]>();

    words.forEach(wordObj => {
      const allTerms = [
        ...wordObj.coreSynonyms,
        ...wordObj.advancedSynonyms,
        ...wordObj.examAnswers
      ];

      allTerms.forEach(term => {
        const cleanTerm = term.trim().toLowerCase();
        if (cleanTerm.length > 2) {
          if (!map.has(cleanTerm)) {
            map.set(cleanTerm, []);
          }
          const existing = map.get(cleanTerm)!;
          if (!existing.some(w => w.id === wordObj.id)) {
            existing.push(wordObj);
          }
        }
      });
    });

    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [words]);

  const filteredConcepts = useMemo(() => {
    if (!searchQuery.trim()) return conceptMap.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return conceptMap.filter(([term]) => term.includes(q));
  }, [conceptMap, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900 font-sans">Reverse Concept Engine</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Search any synonym or concept term to reverse-lookup all primary main character words that contain it.
        </p>

        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concept term (e.g., 'stubborn', 'praise')..."
            className="w-full rounded-2xl bg-slate-100 border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {filteredConcepts.length === 0 ? (
        <div className="py-20 text-center text-slate-500 font-sans border border-slate-200/60 rounded-3xl bg-slate-50/50">
          <Search className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-700">No concepts found matching "{searchQuery}"</p>
          <p className="text-xs mt-1">Try searching for a different synonym or phrase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConcepts.map(([concept, wordList]) => (
            <div key={concept} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-extrabold text-indigo-900 font-mono capitalize">{concept}</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {wordList.length} Words
                </span>
              </div>
  
              <div className="space-y-2">
                {wordList.map(w => (
                  <button
                    key={w.id}
                    onClick={() => onOpenAIExplanation(w)}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 font-serif">{w.word}</span>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{w.meaning}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
