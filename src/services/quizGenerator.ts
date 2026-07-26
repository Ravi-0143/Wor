import { WordEntry, QuizQuestion } from '../types';

export function generateQuizQuestions(words: WordEntry[], count: number = 10): QuizQuestion[] {
  if (words.length === 0) return [];

  // Filter words that have valid synonyms or exam answers
  const validWords = words.filter(w => w.coreSynonyms.length > 0 || w.examAnswers.length > 0 || w.antonyms.length > 0);
  if (validWords.length === 0) return [];

  // Shuffle and pick
  const shuffledWords = [...validWords].sort(() => Math.random() - 0.5);
  const selected = shuffledWords.slice(0, Math.min(count, shuffledWords.length));

  const questions: QuizQuestion[] = [];

  selected.forEach((wordEntry, index) => {
    // Pick question type randomly
    const questionTypes: ('synonym' | 'antonym' | 'exam_answer' | 'meaning')[] = [];
    if (wordEntry.coreSynonyms.length > 0) questionTypes.push('synonym');
    if (wordEntry.antonyms.length > 0) questionTypes.push('antonym');
    if (wordEntry.examAnswers.length > 0) questionTypes.push('exam_answer');
    questionTypes.push('meaning');

    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let questionText = '';
    let correctAnswer = '';
    let explanation = '';

    if (type === 'synonym') {
      correctAnswer = wordEntry.coreSynonyms[0];
      questionText = `What is the primary CORE SYNONYM for "${wordEntry.word}"?`;
      explanation = `"${wordEntry.word}" means "${wordEntry.meaning}". Its primary synonym is "${correctAnswer}".`;
    } else if (type === 'antonym') {
      correctAnswer = wordEntry.antonyms[0];
      questionText = `Which word is the ANTONYM (opposite) of "${wordEntry.word}"?`;
      explanation = `"${wordEntry.word}" means "${wordEntry.meaning}". Its opposite is "${correctAnswer}".`;
    } else if (type === 'exam_answer') {
      const rawAns = wordEntry.examAnswers[0];
      // Clean question format like "Gullible (Q1)" -> "Gullible"
      correctAnswer = rawAns.split('(')[0].trim();
      questionText = `In SSC Previous Year Questions, what was the official answer for "${wordEntry.word}"?`;
      explanation = `Official SSC exam answer for "${wordEntry.word}": ${rawAns}.`;
    } else {
      correctAnswer = wordEntry.meaning.length > 60 ? wordEntry.meaning.slice(0, 57) + '...' : wordEntry.meaning;
      questionText = `What is the accurate MEANING of "${wordEntry.word}"?`;
      explanation = `"${wordEntry.word}" means: ${wordEntry.meaning}.`;
    }

    // Build distractors from other words
    const distractors: string[] = [];
    const otherWords = words.filter(w => w.id !== wordEntry.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);

    for (const other of shuffledOthers) {
      let distractorVal = '';
      if (type === 'synonym' && other.coreSynonyms.length > 0) {
        distractorVal = other.coreSynonyms[0];
      } else if (type === 'antonym' && other.antonyms.length > 0) {
        distractorVal = other.antonyms[0];
      } else if (type === 'meaning') {
        distractorVal = other.meaning.length > 60 ? other.meaning.slice(0, 57) + '...' : other.meaning;
      } else {
        distractorVal = other.word;
      }

      if (distractorVal && distractorVal !== correctAnswer && !distractors.includes(distractorVal)) {
        distractors.push(distractorVal);
      }
      if (distractors.length >= 3) break;
    }

    // Fallbacks if not enough distractors
    while (distractors.length < 3) {
      distractors.push(`Option ${distractors.length + 1}`);
    }

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    questions.push({
      id: `q-${index}-${wordEntry.id}`,
      word: wordEntry,
      type,
      question: questionText,
      options,
      correctAnswer,
      explanation,
    });
  });

  return questions;
}
