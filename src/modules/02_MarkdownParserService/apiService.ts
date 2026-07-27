import { RevisionGuideData, WordEntry } from '../../types';
import { parseRevisionGuideMarkdown } from '../../services/revisionGuideParser';

export async function fetchDefaultRevisionGuide(): Promise<RevisionGuideData> {
  try {
    const response = await fetch('/api/revision-guide');
    if (!response.ok) {
      throw new Error(`Failed to load revision guide: ${response.statusText}`);
    }
    const text = await response.text();
    return parseRevisionGuideMarkdown(text, 'Local /public/revision_guide.md');
  } catch (err: any) {
    console.warn('Fallback fetching directly from revision_guide.md:', err);
    const basePath = (import.meta as any).env?.BASE_URL || '/';
    const cleanBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const directRes = await fetch(`${cleanBasePath}revision_guide.md`);
    if (!directRes.ok) {
      throw new Error('Failed to load default revision guide');
    }
    const text = await directRes.text();
    return parseRevisionGuideMarkdown(text, `${cleanBasePath}revision_guide.md`);
  }
}

export async function fetchGitHubRevisionGuide(githubUrl: string): Promise<RevisionGuideData> {
  let targetUrl = githubUrl.trim();
  if (targetUrl.includes('github.com') && !targetUrl.includes('raw.githubusercontent.com')) {
    targetUrl = targetUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  try {
    const proxyUrl = `/api/fetch-github-guide?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    
    if (res.ok) {
      const markdown = await res.text();
      return parseRevisionGuideMarkdown(markdown, targetUrl);
    }
    
    const directRes = await fetch(targetUrl);
    if (!directRes.ok) {
      throw new Error(`Failed to fetch GitHub file: status ${directRes.status}`);
    }
    const markdown = await directRes.text();
    return parseRevisionGuideMarkdown(markdown, targetUrl);
  } catch (err: any) {
    throw new Error(`GitHub fetch failed: ${err.message}`);
  }
}

export interface AIQuizQuestionResponse {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export async function fetchAIQuizQuestion(word: string, meaning: string, category?: string): Promise<AIQuizQuestionResponse> {
  const response = await fetch('/api/ai/quiz-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, meaning, category })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate AI Quiz question.');
  }

  return await response.json();
}
