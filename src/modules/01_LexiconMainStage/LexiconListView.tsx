import React from 'react';
import { WordEntry } from '../../types';
import { CheckCircle2, ArrowRight, Star, AlertTriangle, Award, BookOpen } from 'lucide-react';

interface LexiconListViewProps {
  words: WordEntry[];
  onSelectWord: (word: WordEntry) => void;
  onOpenAIExplanation: (word: WordEntry) => void;
  masteredIds: string[];
  onToggleMastery: (wordId: string) => void;
}

export const LexiconListView: React.FC<LexiconListViewProps> = ({
  words,
  onSelectWord,
  onOpenAIExplanation,
  masteredIds,
  onToggleMastery,
}) => {
  // Guard: ensure words is always an array even if parent passes undefined
  const safeWords = Array.isArray(words) ? words : [];

  return (
    <div className="space-y-4">
      
      {/* EXAM-READY QUICK REVISION HEADER */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
          <span className="uppercase tracking-wider font-semibold text-[#F1F5F9]">
            Exam-Ready Quick Revision Lexicon
          </span>
          <span className="text-slate-500">({safeWords.length} terms)</span>
        </div>
        <span className="text-[11px] text-amber-400/80 hidden sm:inline">
          Instant Frequent Synonyms At a Glance • Click term to Delve Deeper (Module 08)
        </span>
      </div>

      {/* CONTINUOUS LEXICON TABLE CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161922] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#1C202C] text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4 min-w-[160px]">Word & Category</th>
                <th className="py-3.5 px-4 min-w-[220px]">Meaning & Hindi</th>
                <th className="py-3.5 px-4 min-w-[260px]">Instant Frequent Synonyms</th>
                <th className="py-3.5 px-4 hidden lg:table-cell min-w-[140px]">Antonyms</th>
                <th className="py-3.5 px-4 text-center">PYQ Rating</th>
                <th className="py-3.5 px-4 text-right min-w-[130px]">Module 08 Deep Dive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-[#E2E8F0] font-sans">
              {safeWords.map((word) => {
                const isMastered = masteredIds.includes(word.id);
                const allFrequentSynonyms = [...(word.coreSynonyms || []), ...(word.advancedSynonyms || [])];
                void allFrequentSynonyms;

                return (
                  <tr 
                    key={word.id}
                    onClick={() => onOpenAIExplanation(word)}
                    className="group hover:bg-[#1C202C]/90 transition-colors cursor-pointer"
                    title={`Click to delve deeper into ${word.word} in Module 08`}
                  >
                    {/* Mastery Checkbox */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleMastery(word.id)}
                        className={`p-1 rounded-md transition-all ${
                          isMastered 
                            ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' 
                            : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                        }`}
                        title={isMastered ? 'Mastered' : 'Mark as Mastered'}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </td>

                    {/* Word Title & Category */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-serif font-bold text-[#F1F5F9] group-hover:text-amber-400 transition-colors">
                            {word.word}
                          </span>
                          {word.traps && (
                            <AlertTriangle className="h-3 w-3 text-amber-400" title="Contains Confusion Trap" />
                          )}
                          {word.examAnswers.length > 0 && (
                            <Award className="h-3 w-3 text-emerald-400" title="SSC PYQ Match" />
                          )}
                        </div>
                        <span className="inline-block rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/5">
                          {word.category}
                        </span>
                      </div>
                    </td>

                    {/* Meaning & Hindi */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-sans leading-snug line-clamp-2">
                        {word.meaning}
                      </p>
                      {word.hindiMeaning && (
                        <p className="text-[11px] text-amber-400/90 font-serif line-clamp-1 mt-0.5">
                          हिंदी: {word.hindiMeaning}
                        </p>
                      )}
                    </td>

                    {/* Instant Frequent Synonyms at a Glance */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(word.coreSynonyms || []).map((syn, idx) => (
                          <span
                            key={`core-${idx}`}
                            className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/20"
                          >
                            {syn}
                          </span>
                        ))}
                        {(word.advancedSynonyms || []).map((syn, idx) => (
                          <span
                            key={`adv-${idx}`}
                            className="rounded-md bg-[#232838] px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-white/5"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Antonyms */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(word.antonyms || []).length > 0 ? (
                          (word.antonyms || []).map((ant, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-500/20 line-through"
                            >
                              {ant}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">—</span>
                        )}
                      </div>
                    </td>

                    {/* PYQ Stars / Micro-Dots */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-0.5" title={`PYQ Rating: ${word.stars}/5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={`h-1.5 w-1.5 rounded-full ${i < word.stars ? 'bg-amber-400' : 'bg-slate-800'}`} 
                          />
                        ))}
                      </div>
                    </td>

                    {/* Delve Deeper (Module 08 Inspector) */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenAIExplanation(word)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-all shadow-sm group-hover:border-amber-400"
                      >
                        <span>Delve Deeper</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
