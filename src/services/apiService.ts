import { RevisionGuideData } from '../types';
import { parseRevisionGuideMarkdown } from './revisionGuideParser';

export async function fetchDefaultRevisionGuide(): Promise<RevisionGuideData> {
  try {
    const res = await fetch('/api/revision-guide');
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const text = await res.text();
    return parseRevisionGuideMarkdown(text, 'Local /public/revision_guide.md');
  } catch (err) {
    console.warn('Fallback fetching directly from /revision_guide.md:', err);
    const directRes = await fetch('/revision_guide.md');
    if (!directRes.ok) {
      throw new Error('Failed to load default revision guide');
    }
    const text = await directRes.text();
    return parseRevisionGuideMarkdown(text, '/revision_guide.md');
  }
}

export async function fetchGitHubRevisionGuide(githubUrl: string): Promise<RevisionGuideData> {
  let targetUrl = githubUrl.trim();
  
  // Convert standard GitHub URL (e.g. github.com/user/repo/blob/main/path.md)
  // to raw URL (raw.githubusercontent.com/user/repo/main/path.md)
  if (targetUrl.includes('github.com') && !targetUrl.includes('raw.githubusercontent.com')) {
    targetUrl = targetUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  try {
    // Try via proxy first to bypass potential CORS
    const proxyUrl = `/api/fetch-github-guide?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    
    if (res.ok) {
      const markdown = await res.text();
      return parseRevisionGuideMarkdown(markdown, targetUrl);
    }
    
    // Direct fetch attempt if proxy fails
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

export async function fetchAIQuizQuestion(word: string, meaning?: string, category?: string) {
  try {
    const res = await fetch('/api/ai/quiz-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, meaning, category }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'AI quiz generation request failed');
    }

    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Failed to connect to AI server');
  }
}
