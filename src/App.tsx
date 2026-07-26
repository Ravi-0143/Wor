/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';

// Module 01: Lexicon Main Stage
import { FloatingAntigravityCanvas } from './modules/01_LexiconMainStage/FloatingAntigravityCanvas';
import { Navbar } from './modules/01_LexiconMainStage/Navbar';
import { LexiconListView } from './modules/01_LexiconMainStage/LexiconListView';

// Module 02: Markdown Parser Service
import { fetchDefaultRevisionGuide } from './modules/02_MarkdownParserService/apiService';

// Module 03: Main Character Word Stage (Bypassed in favor of Module 08)
import { WordDetailInspectorView } from './modules/08_WordDetailInspector/WordDetailInspectorView';

// Module 04: Flashcard Mastery Engine
import { MasteryTrackerView } from './modules/04_FlashcardMasteryEngine/MasteryTrackerView';

// Module 05: Synonym Mesh Graph
import { WordGraphView } from './modules/05_SynonymMeshGraph/WordGraphView';

// Module 06: Exam Quiz Engine
import { QuizChallengeView } from './modules/06_ExamQuizEngine/QuizChallengeView';

// Module 07: Reverse Concept Engine
import { ReverseIndexView } from './modules/07_ReverseConceptEngine/ReverseIndexView';

import { GitHubGuideModal } from './components/GitHubGuideModal';
import { RevisionGuideData, WordEntry } from './types';
import { IntroLanding } from './modules/01_LexiconMainStage/IntroLanding';

import { 
  Award, 
  AlertTriangle, 
  Star, 
  Target,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [subView, setSubView] = useState<'cards' | 'graph' | 'reverse' | 'quiz' | 'mastery' | 'inspect'>('cards');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [guideData, setGuideData] = useState<RevisionGuideData | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(true);
  const [guideError, setGuideError] = useState<string | null>(null);

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [mainCharacterWord, setMainCharacterWord] = useState<WordEntry | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minStarsFilter, setMinStarsFilter] = useState<number>(0);
  const [trapsOnly, setTrapsOnly] = useState<boolean>(false);
  const [pyqOnly, setPyqOnly] = useState<boolean>(false);

  const [scrollScale, setScrollScale] = useState<number>(1.0);

  // Dynamic Scroll Zoom-Out Effect based on Scroll Velocity
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let animId: number;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const deltaY = Math.abs(currentScrollY - lastScrollY);
      const deltaTime = Math.max(16, currentTime - lastTime);

      const velocity = deltaY / deltaTime; // speed in px/ms
      lastScrollY = currentScrollY;
      lastTime = currentTime;

      // Scale range: 1.0 (stationary) to ~0.94 (fast scroll)
      const targetScale = Math.max(0.94, 1.0 - Math.min(velocity, 2.0) * 0.03);
      setScrollScale(prev => prev + (targetScale - prev) * 0.2);
    };

    const returnToNormal = () => {
      setScrollScale(prev => {
        const diff = 1.0 - prev;
        if (Math.abs(diff) < 0.0005) return 1.0;
        return prev + diff * 0.12;
      });
      animId = requestAnimationFrame(returnToNormal);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    animId = requestAnimationFrame(returnToNormal);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('antigravity-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atlas-mastered-words');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadDefaultGuide = async () => {
    setIsLoadingGuide(true);
    setGuideError(null);
    try {
      const data = await fetchDefaultRevisionGuide();
      setGuideData(data);
      if (data.words.length > 0) {
        setMainCharacterWord(data.words[0]);
      }
    } catch (err: any) {
      setGuideError(err.message || 'Failed to load default revision guide.');
    } finally {
      setIsLoadingGuide(false);
    }
  };

  useEffect(() => {
    loadDefaultGuide();
  }, []);

  const handleToggleMastery = (wordId: string) => {
    setMasteredIds((prev) => {
      const updated = prev.includes(wordId) 
        ? prev.filter(id => id !== wordId) 
        : [...prev, wordId];
      localStorage.setItem('atlas-mastered-words', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredWords = useMemo(() => {
    if (!guideData) return [];
    return guideData.words.filter(w => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesWord = w.word.toLowerCase().includes(q);
        const matchesMeaning = w.meaning.toLowerCase().includes(q);
        const matchesHindi = w.hindiMeaning?.toLowerCase().includes(q);
        const matchesSyns = w.coreSynonyms.some(s => s.toLowerCase().includes(q)) || w.advancedSynonyms.some(s => s.toLowerCase().includes(q));
        const matchesAnts = w.antonyms.some(a => a.toLowerCase().includes(q));
        const matchesExam = w.examAnswers.some(e => e.toLowerCase().includes(q));
        if (!matchesWord && !matchesMeaning && !matchesHindi && !matchesSyns && !matchesAnts && !matchesExam) return false;
      }

      if (selectedCategory !== 'All' && w.category !== selectedCategory) {
        return false;
      }

      if (minStarsFilter > 0 && w.stars < minStarsFilter) {
        return false;
      }

      if (trapsOnly && !w.traps) {
        return false;
      }

      if (pyqOnly && w.examAnswers.length === 0) {
        return false;
      }

      return true;
    });
  }, [guideData, searchQuery, selectedCategory, minStarsFilter, trapsOnly, pyqOnly]);

  const activeHeroWord = mainCharacterWord || (guideData?.words[0] || null);

  if (showIntro) {
    return (
      <IntroLanding
        words={guideData?.words || []}
        onEnter={(view, selectedW) => {
          if (view === 'inspect' && selectedW) {
            setSelectedWord(selectedW);
            setSubView('inspect');
          } else if (view) {
            setSubView(view as 'cards' | 'graph' | 'reverse' | 'quiz' | 'mastery' | 'inspect');
          } else {
            setSubView('cards');
          }
          setShowIntro(false);
        }}
        introWord="Lexicon"
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0F1115] text-[#F1F5F9] font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* Module 01: Static Monastery Dark Background */}
      <FloatingAntigravityCanvas
        words={guideData?.words || []}
        onSelectWord={(w) => {
          setMainCharacterWord(w);
          setSubView('cards');
        }}
        selectedWordId={activeHeroWord?.id}
      />

      {/* Module 01: Monastery Dark Navbar */}
      <Navbar
        subView={subView}
        setSubView={setSubView}
        guideData={guideData}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoadingGuide}
        onReloadDefault={loadDefaultGuide}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* MAIN VIEWPORT CONTAINER WITH DYNAMIC SCROLL ZOOM-OUT SCALE */}
      <div 
        style={{ 
          transform: `scale(${scrollScale})`, 
          transformOrigin: 'top center', 
          transition: 'transform 0.1s ease-out' 
        }}
        className="will-change-transform"
      >
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
          
          {guideError && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold">Unable to load revision guide markdown</p>
                <p className="mt-0.5 text-rose-400/80">{guideError}</p>
              </div>
            </div>
          )}

          {/* SubView 1: Main Character Word Stage & Continuous Lexicon View */}
          {subView === 'cards' && (
            <div className="space-y-10">
              
              {/* Module 03 HeroWordStage Bypassed - Directory directly deep dives to Module 08 */}

              {/* Module 01: Continuous Lexicon Directory Table ("No Cards!") */}
              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-400" />
                      <h2 className="text-lg font-bold text-[#F1F5F9] font-serif">
                        Lexicon Directory Index
                      </h2>
                      <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300 border border-amber-500/20">
                        {filteredWords.length} Terms
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Select any term row to focus its details on the stage above.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`rounded-lg px-3 py-1 transition-all font-medium border ${
                        selectedCategory === 'All'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-[#161922] text-slate-400 border-white/10 hover:text-slate-200'
                      }`}
                    >
                      All ({guideData?.words.length || 0})
                    </button>

                    <button
                      onClick={() => setMinStarsFilter(prev => prev === 5 ? 0 : 5)}
                      className={`rounded-lg px-3 py-1 flex items-center gap-1 transition-all border ${
                        minStarsFilter === 5
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                          : 'bg-[#161922] text-slate-400 border-white/10 hover:text-slate-200'
                      }`}
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>5-Star PYQ</span>
                    </button>

                    <button
                      onClick={() => setTrapsOnly(!trapsOnly)}
                      className={`rounded-lg px-3 py-1 flex items-center gap-1 transition-all border ${
                        trapsOnly
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                          : 'bg-[#161922] text-slate-400 border-white/10 hover:text-slate-200'
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <span>Traps Only</span>
                    </button>

                    <button
                      onClick={() => setPyqOnly(!pyqOnly)}
                      className={`rounded-lg px-3 py-1 flex items-center gap-1 transition-all border ${
                        pyqOnly
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'
                          : 'bg-[#161922] text-slate-400 border-white/10 hover:text-slate-200'
                      }`}
                    >
                      <Award className="h-3 w-3 text-emerald-400" />
                      <span>SSC PYQ</span>
                    </button>
                  </div>
                </div>

                {isLoadingGuide ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent mx-auto mb-3" />
                    <p className="text-xs font-mono">Loading Lexicon Directory...</p>
                  </div>
                ) : filteredWords.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#161922] p-10 text-center shadow-xl">
                    <p className="text-slate-400 text-xs sm:text-sm">
                      No words match the current search query or filter settings.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setMinStarsFilter(0);
                        setTrapsOnly(false);
                        setPyqOnly(false);
                      }}
                      className="mt-4 rounded-xl bg-amber-500/20 px-4 py-1.5 text-xs font-medium text-amber-300 border border-amber-500/30 shadow-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <LexiconListView
                    words={filteredWords}
                    onSelectWord={(w) => {
                      setMainCharacterWord(w);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onOpenAIExplanation={(w) => {
                      setSelectedWord(w);
                      setSubView('inspect');
                    }}
                    masteredIds={masteredIds}
                    onToggleMastery={handleToggleMastery}
                  />
                )}
              </div>

            </div>
          )}

          {/* Module 05: Synonym Mesh Graph View */}
          {subView === 'graph' && (
            <WordGraphView
              words={guideData?.words || []}
              onSelectWord={(w) => {
                setSelectedWord(w);
                setSubView('inspect');
              }}
            />
          )}

          {/* Module 07: Reverse Concept Index */}
          {subView === 'reverse' && (
            <ReverseIndexView
              words={guideData?.words || []}
              onSelectWord={(w) => {
                setSelectedWord(w);
                setSubView('inspect');
              }}
              onOpenAIExplanation={(w) => {
                setSelectedWord(w);
                setSubView('inspect');
              }}
            />
          )}

          {/* Module 06: Exam Practice Quiz Engine */}
          {subView === 'quiz' && (
            <QuizChallengeView
              words={guideData?.words || []}
            />
          )}

          {/* Module 04: Flashcard Mastery Engine */}
          {subView === 'mastery' && (
            <MasteryTrackerView
              words={guideData?.words || []}
              masteredIds={masteredIds}
              onToggleMastery={handleToggleMastery}
            />
          )}

          {/* Module 08: Word Detail Inspector View */}
          {subView === 'inspect' && selectedWord && (
            <WordDetailInspectorView
              word={selectedWord}
              allWords={guideData?.words || []}
              onSelectRelatedWord={(w) => setSelectedWord(w)}
              onBack={() => setSubView('cards')}
            />
          )}

        {/* Persistent Return to Portal Button at the bottom of every module */}
        <div className="flex justify-center pt-8 pb-12 border-t border-white/5 mt-10">
          <button
            onClick={() => {
              setShowIntro(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 px-5 py-2.5 text-xs font-semibold text-slate-300 border border-white/10 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Return to Intro Portal</span>
          </button>
        </div>

        </main>
      </div>

      <GitHubGuideModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onGuideLoaded={(newGuide) => {
          setGuideData(newGuide);
          if (newGuide.words.length > 0) setMainCharacterWord(newGuide.words[0]);
        }}
      />

    </div>
  );
}
