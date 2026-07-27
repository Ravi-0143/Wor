import { RevisionGuideData } from '../../types';
import { parseRevisionGuideMarkdown } from '../../services/revisionGuideParser';
import { GoogleGenAI } from '@google/genai';

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
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file locally or as a GitHub Secret.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an SSC CGL / Competitive Exam Vocabulary Quiz Master.
Generate a high-yield multiple-choice quiz question for the vocabulary word "${word}" (Meaning: "${meaning || ''}", Category: "${category || 'General'}").

Return ONLY valid JSON matching this exact structure:
{
  "question": "Clear exam-style question stem asking for synonym, antonym, or correct usage of ${word}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string from options that is correct",
  "explanation": "Brief 2-sentence explanation of why the correct answer is right and why distractors are wrong",
  "hint": "Useful clue highlighting subtle context or word root"
}

Make sure 1 option is clearly correct and 3 are plausible distractors. Respond ONLY with raw JSON, no markdown formatting or backticks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text || '';
  const cleanJson = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanJson);
}
