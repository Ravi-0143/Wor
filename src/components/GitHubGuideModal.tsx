import React, { useState } from 'react';
import { Github, Upload, Link, AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import { fetchGitHubRevisionGuide } from '../services/apiService';
import { parseRevisionGuideMarkdown } from '../services/revisionGuideParser';
import { RevisionGuideData } from '../types';

interface GitHubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuideLoaded: (guide: RevisionGuideData) => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({
  isOpen,
  onClose,
  onGuideLoaded
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [pastedMarkdown, setPastedMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'github' | 'paste' | 'upload'>('github');

  if (!isOpen) return null;

  const handleFetchGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const guide = await fetchGitHubRevisionGuide(githubUrl);
      setSuccessMsg(`Successfully loaded ${guide.words.length} words from GitHub!`);
      setTimeout(() => {
        onGuideLoaded(guide);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch revision guide from GitHub URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParsePasted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedMarkdown.trim()) return;

    try {
      const guide = parseRevisionGuideMarkdown(pastedMarkdown, 'Custom Pasted Markdown');
      if (guide.words.length === 0) {
        setError('No words could be parsed from the provided text. Ensure markdown format is valid.');
        return;
      }
      setSuccessMsg(`Parsed ${guide.words.length} words from text!`);
      setTimeout(() => {
        onGuideLoaded(guide);
        onClose();
      }, 800);
    } catch (err: any) {
      setError('Failed to parse markdown text.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const guide = parseRevisionGuideMarkdown(content, file.name);
        onGuideLoaded(guide);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#020617]/90 p-6 shadow-2xl backdrop-blur-2xl transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Fetch Revision Guide</h3>
              <p className="text-xs text-slate-400">
                Load markdown directly from GitHub repository or custom source
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-4 flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveMode('github')}
            className={`flex-1 rounded-lg py-2 transition-all flex items-center justify-center gap-2 ${
              activeMode === 'github' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="h-3.5 w-3.5" />
            <span>GitHub Raw URL</span>
          </button>
          <button
            onClick={() => setActiveMode('paste')}
            className={`flex-1 rounded-lg py-2 transition-all flex items-center justify-center gap-2 ${
              activeMode === 'paste' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Paste Markdown</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex-1 rounded-lg py-2 transition-all flex items-center justify-center gap-2 ${
              activeMode === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload .md File</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5">
          {activeMode === 'github' && (
            <form onSubmit={handleFetchGitHub} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GitHub Repository / Raw File URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository/blob/main/revision_guide.md"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 font-mono"
                  required
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Accepts standard GitHub file links or direct <code className="text-blue-300">raw.githubusercontent.com</code> links.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Fetch & Render</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeMode === 'paste' && (
            <form onSubmit={handleParsePasted} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Paste Revision Guide Markdown Content
                </label>
                <textarea
                  value={pastedMarkdown}
                  onChange={(e) => setPastedMarkdown(e.target.value)}
                  placeholder="# SYNONYMS REVISION GUIDE&#10;## N WORDS&#10;### Naive ★★★★★&#10;**Meaning** > Simple, innocent..."
                  rows={8}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-slate-100 placeholder-slate-600 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 font-mono resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                >
                  Parse & Load
                </button>
              </div>
            </form>
          )}

          {activeMode === 'upload' && (
            <div className="py-6 text-center">
              <label className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/40 p-8 hover:border-blue-400/50 hover:bg-white/5 transition-all">
                <Upload className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">Click to upload .md file</span>
                <span className="text-[11px] text-slate-500 mt-1">Accepts revision_guide.md or any structured vocabulary markdown</span>
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
