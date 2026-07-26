import React, { useState } from 'react';
import { 
  Search, 
  Github, 
  RefreshCw,
  Award,
  Brain,
  Sparkles,
  ChevronDown,
  Network,
  Compass,
  SlidersHorizontal,
  X,
  Target
} from 'lucide-react';
import { RevisionGuideData } from '../../types';

interface NavbarProps {
  subView: 'cards' | 'graph' | 'reverse' | 'quiz' | 'mastery' | 'inspect';
  setSubView: (view: 'cards' | 'graph' | 'reverse' | 'quiz' | 'mastery' | 'inspect') => void;
  guideData: RevisionGuideData | null;
  onOpenGitHubModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
  onReloadDefault: () => void;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  subView,
  setSubView,
  guideData,
  onOpenGitHubModal,
  searchQuery,
  setSearchQuery,
  isLoading,
  onReloadDefault,
  showFilters,
  setShowFilters,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0F1115]/90 backdrop-blur-xl shadow-2xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 gap-4">
        
        {/* Antigravity Brand Badge */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setSubView('cards')}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-[#F1F5F9] text-base font-serif">
                ANTIGRAVITY <span className="text-amber-400 font-sans font-medium text-xs uppercase tracking-widest">LEXICON</span>
              </span>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300 border border-amber-500/20">
                MONASTERY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
              Single-Focus Word Stage & Lexicon Directory
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-[#161922] p-1 border border-white/10">

          <button
            onClick={() => setSubView('cards')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              subView === 'cards'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span>Word Stage</span>
            {guideData && (
              <span className="ml-1 rounded-md bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300 font-mono">
                {guideData.words.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubView('mastery')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              subView === 'mastery'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-emerald-400" />
            <span>Mastery</span>
          </button>

          <button
            onClick={() => setSubView('quiz')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              subView === 'quiz'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-purple-400" />
            <span>Exam Quiz</span>
          </button>

          {/* Advanced Views Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                subView === 'graph' || subView === 'reverse'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showMoreMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#161922] p-1.5 shadow-2xl backdrop-blur-2xl z-50"
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                <button
                  onClick={() => {
                    setSubView('graph');
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-amber-500/10 hover:text-amber-300"
                >
                  <Network className="h-3.5 w-3.5 text-amber-400" />
                  <span>Synonym Mesh Graph</span>
                </button>

                <button
                  onClick={() => {
                    setSubView('reverse');
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-amber-500/10 hover:text-amber-300"
                >
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  <span>Reverse Index</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Global Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              id="antigravity-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search term, meaning, trap, or synonym... ( / )"
              className="w-full rounded-xl bg-[#161922] border border-white/10 pl-9 pr-8 py-2 text-xs text-[#F1F5F9] placeholder-slate-500 focus:border-amber-500/50 focus:bg-[#1C202C] focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${
              showFilters
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#161922] text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title="Toggle Filter Panel"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#161922] px-3 py-2 text-xs font-medium text-slate-300 border border-white/10 hover:bg-slate-800 transition-all"
            title="Import Markdown Guide"
          >
            <Github className="h-3.5 w-3.5 text-slate-300" />
            <span className="hidden lg:inline">Import</span>
          </button>

          <button
            onClick={onReloadDefault}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#161922] text-slate-300 border border-white/10 hover:bg-slate-800 transition-all disabled:opacity-50"
            title="Reload Default Guide"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden border-t border-white/10 bg-[#0F1115] px-3 py-2 gap-1 overflow-x-auto">

        <button
          onClick={() => setSubView('cards')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
            subView === 'cards' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Word Stage</span>
        </button>

        <button
          onClick={() => setSubView('mastery')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
            subView === 'mastery' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Mastery</span>
        </button>

        <button
          onClick={() => setSubView('quiz')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
            subView === 'quiz' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>Quiz</span>
        </button>

        <button
          onClick={() => setSubView('graph')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
            subView === 'graph' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          <span>Graph</span>
        </button>
      </div>
    </header>
  );
};
