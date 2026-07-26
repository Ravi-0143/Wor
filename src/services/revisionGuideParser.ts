import { RevisionGuideData, WordEntry, LegendItem } from '../types';

export function parseRevisionGuideMarkdown(markdown: string, sourceUrl?: string): RevisionGuideData {
  const lines = markdown.split(/\r?\n/);

  let title = 'SYNONYMS REVISION GUIDE';
  let subtitle = '';
  const legend: LegendItem[] = [];
  const tips: string[] = [];
  const words: WordEntry[] = [];
  const categoriesSet = new Set<string>();

  let currentCategory = 'General';
  let currentWord: Partial<WordEntry> | null = null;

  const commitCurrentWord = () => {
    if (currentWord && currentWord.word) {
      const entry: WordEntry = {
        id: `word-${currentWord.word.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        word: currentWord.word,
        stars: currentWord.stars || 3,
        meaning: currentWord.meaning || 'No meaning provided',
        hindiMeaning: currentWord.hindiMeaning,
        coreSynonyms: currentWord.coreSynonyms || [],
        advancedSynonyms: currentWord.advancedSynonyms || [],
        antonyms: currentWord.antonyms || [],
        wordFamily: currentWord.wordFamily,
        examAnswers: currentWord.examAnswers || [],
        traps: currentWord.traps,
        crossReference: currentWord.crossReference,
        category: currentCategory,
      };
      words.push(entry);
      categoriesSet.add(currentCategory);
    }
    currentWord = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract Title
    if (line.startsWith('# ') && !line.startsWith('# PART')) {
      title = line.replace('# ', '').trim();
      continue;
    }

    // Extract Subtitle
    if (line.startsWith('### ') && (line.includes('SSC') || line.includes('English') || line.includes('Guide'))) {
      subtitle = line.replace('### ', '').trim();
      continue;
    }

    // Legend table rows
    if (line.startsWith('|') && line.includes('🟢')) {
      // e.g. | 🟢 | Core synonym (must know) |
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        legend.push({ symbol: parts[0], meaning: parts[1] });
      }
      continue;
    }

    // Tips block
    if (line.startsWith('> **Tip:**') || line.startsWith('> **') || line.startsWith('>')) {
      const tipText = line.replace(/^>\s*/, '').replace(/\*\*/g, '').trim();
      if (tipText) tips.push(tipText);
      continue;
    }

    // Category Headings (## A WORDS, ## N WORDS, ## O WORDS)
    if (line.startsWith('## ') && !line.startsWith('## HOW TO USE')) {
      commitCurrentWord();
      currentCategory = line.replace('## ', '').trim();
      categoriesSet.add(currentCategory);
      continue;
    }

    // Word Headings (### Abstruse ★★★★ or ### Abdurate → See Obdurate)
    if (line.startsWith('### ')) {
      commitCurrentWord();
      const rawHeader = line.replace('### ', '').trim();

      // Check cross reference: Abdurate → See Obdurate
      if (rawHeader.includes('→') || rawHeader.includes('See ')) {
        const parts = rawHeader.split(/→|->|See /i);
        const word = parts[0].trim();
        const ref = parts.slice(1).join(' ').trim();
        currentWord = {
          word,
          stars: 3,
          meaning: `Cross reference to ${ref}`,
          crossReference: ref,
          coreSynonyms: [],
          advancedSynonyms: [],
          antonyms: [],
          examAnswers: [],
        };
        continue;
      }

      // Count stars
      const starMatch = rawHeader.match(/★+/g);
      let starCount = 3;
      if (starMatch) {
        starCount = starMatch[0].length;
      }

      // Extract word name
      const wordName = rawHeader.replace(/★+/g, '').replace(/[\(\)]/g, '').trim();

      currentWord = {
        word: wordName,
        stars: starCount,
        meaning: '',
        coreSynonyms: [],
        advancedSynonyms: [],
        antonyms: [],
        examAnswers: [],
      };
      continue;
    }

    // Parsing properties of currentWord
    if (currentWord) {
      // Meaning
      if (line.startsWith('**Meaning**')) {
        let meaningText = line.replace('**Meaning**', '').replace(/^[\s>:=]+/, '').trim();
        // Check for Hindi meaning in parentheses like (शुरू) or (नवीनता)
        const hindiMatch = meaningText.match(/\(([\u0900-\u097F\s]+)\)/);
        if (hindiMatch) {
          currentWord.hindiMeaning = hindiMatch[1].trim();
          meaningText = meaningText.replace(hindiMatch[0], '').trim();
        }
        currentWord.meaning = meaningText;
        continue;
      }

      // Core Synonyms: 🟢 **Core** · Obscure · Unclear · Vague · Arcane
      if (line.includes('🟢') || line.toLowerCase().includes('core')) {
        const text = line.replace(/🟢|\*\*Core\*\*|Core/gi, '').replace(/^[\s·:]+/, '').trim();
        const syns = text.split(/·|,|;/).map(s => s.trim()).filter(Boolean);
        currentWord.coreSynonyms = syns;
        continue;
      }

      // Advanced Synonyms: 🔵 **Advanced** · Esoteric · Recondite · Cryptic
      if (line.includes('🔵') || line.toLowerCase().includes('advanced')) {
        const text = line.replace(/🔵|\*\*Advanced\*\*|Advanced/gi, '').replace(/^[\s·:]+/, '').trim();
        const syns = text.split(/·|,|;/).map(s => s.trim()).filter(Boolean);
        currentWord.advancedSynonyms = syns;
        continue;
      }

      // Antonyms: 🟠 **Antonyms** · Clear · Obvious · Lucid
      if (line.includes('🟠') || line.toLowerCase().includes('antonyms')) {
        const text = line.replace(/🟠|\*\*Antonyms\*\*|Antonyms/gi, '').replace(/^[\s·:]+/, '').trim();
        const ants = text.split(/·|,|;/).map(s => s.trim()).filter(Boolean);
        currentWord.antonyms = ants;
        continue;
      }

      // Word Family / Related: 🟣
      if (line.includes('🟣')) {
        const familyText = line.replace(/🟣|\*\*Family\*\*|\*\*Phrase\*\*/gi, '').replace(/^[\s·:]+/, '').trim();
        currentWord.wordFamily = familyText;
        continue;
      }

      // Exam Answers: ⭐ **Exam Answers** → *Gullible* (Q1) · *Innocent* (Q12)
      if (line.includes('⭐') || line.toLowerCase().includes('exam answer')) {
        const text = line.replace(/⭐|\*\*Exam Answers?\*\*|Exam Answers?/gi, '').replace(/^[\s·:→>]+/, '').trim();
        // Remove markdown asterisks and parse individual answers
        const cleanText = text.replace(/\*/g, '');
        const answers = cleanText.split(/·|,/).map(a => a.trim()).filter(Boolean);
        currentWord.examAnswers = answers;
        continue;
      }

      // Traps & Warnings: ⚠ *Naive ≠ Stupid. It means innocent/trusting, not dull.*
      if (line.includes('⚠') || line.startsWith('Warning:') || line.startsWith('Note:')) {
        const trapText = line.replace(/^⚠/, '').replace(/\*/g, '').trim();
        currentWord.traps = trapText;
        continue;
      }
    }
  }

  // Commit last word
  commitCurrentWord();

  return {
    title: title || 'SYNONYMS REVISION GUIDE',
    subtitle: subtitle || 'SSC / Competitive Exams Vocabulary System',
    legend,
    tips,
    words,
    categories: Array.from(categoriesSet),
    rawMarkdown: markdown,
    sourceUrl,
    loadedAt: new Date().toISOString(),
  };
}
