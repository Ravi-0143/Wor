import { RevisionGuideData } from '../types';
import { parseRevisionGuideMarkdown } from './revisionGuideParser';
import { GoogleGenAI } from '@google/genai';

export async function fetchDefaultRevisionGuide(): Promise<RevisionGuideData> {
  const basePath = (import.meta as any).env?.BASE_URL || '/';
  const cleanBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  
  const candidateUrls = [
    `${cleanBasePath}revision_guide.md`,
    `${cleanBasePath}public/revision_guide.md`,
    '/revision_guide.md',
    '/public/revision_guide.md',
    'https://raw.githubusercontent.com/Ravi-0143/Wor/main/public/revision_guide.md'
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          return parseRevisionGuideMarkdown(text, url);
        }
      }
    } catch {
      // Continue trying next candidate URL
    }
  }

  throw new Error('Failed to load default revision guide from all fallback locations.');
}

export async function fetchGitHubRevisionGuide(githubUrl: string): Promise<RevisionGuideData> {
  let targetUrl = githubUrl.trim();
  if (targetUrl.includes('github.com') && !targetUrl.includes('raw.githubusercontent.com')) {
    targetUrl = targetUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  try {
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

export async function fetchAIQuizQuestion(
  word: string,
  meaning: string,
  category: string | undefined,
  correctAnswer: string,
  distractorPool: string[]
): Promise<AIQuizQuestionResponse> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file locally or as a GitHub Secret in your repository.');
  }

  // Ensure we always have exactly 3 distractors
  const distractors = distractorPool.slice(0, 3);
  while (distractors.length < 3) distractors.push(`Option ${distractors.length + 1}`);

  // Shuffle all 4 options so the correct answer isn't always first
  const allOptions = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

  const prompt = `You are an SSC CGL / Competitive Exam Vocabulary Quiz Master.

Write an exam-quality multiple-choice question for the word "${word}".
  Word meaning: "${meaning || ''}"
  Category: "${category || 'General'}"

STRICT RULES — you MUST follow these exactly:
1. The CORRECT answer is: "${correctAnswer}"
2. The 4 answer choices are FIXED — use them exactly as given, in this order: ${JSON.stringify(allOptions)}
3. Do NOT invent new options. Do NOT change the spelling of any option.
4. "correctAnswer" in your JSON MUST be exactly: "${correctAnswer}"
5. "options" in your JSON MUST be exactly: ${JSON.stringify(allOptions)}

Your job is ONLY to write:
  - A clear, exam-style "question" stem (e.g. asking for synonym, antonym, or correct usage)
  - A helpful "explanation" (2 sentences: why the correct answer is right, why the others are wrong)
  - A short "hint" (word root, mnemonic, or subtle context clue)

Return ONLY valid JSON — no markdown, no backticks:
{
  "question": "...",
  "options": ${JSON.stringify(allOptions)},
  "correctAnswer": "${correctAnswer}",
  "explanation": "...",
  "hint": "..."
}`;

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const raw = response.text || '';
  const cleanJson = raw.replace(/```json|```/g, '').trim();

  let parsed: AIQuizQuestionResponse;
  try {
    parsed = JSON.parse(cleanJson);
  } catch {
    throw new Error('Gemini returned an unexpected format. Please try again in a moment.');
  }

  if (
    typeof parsed.question !== 'string' ||
    !Array.isArray(parsed.options) ||
    typeof parsed.correctAnswer !== 'string'
  ) {
    throw new Error('Gemini response was missing required fields. Please try again.');
  }

  // Hard-enforce lexicon options regardless of what Gemini returned
  parsed.options = allOptions;
  parsed.correctAnswer = correctAnswer;

  return parsed;
}
