import React, { useState, useEffect } from 'react';
import { WordEntry } from '../../types';
import { fetchAIQuizQuestion, AIQuizQuestionResponse } from '../02_MarkdownParserService/apiService';
import { Brain, CheckCircle2, XCircle, Award, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizChallengeViewProps {
  words: WordEntry[];
}

interface Question {
  targetWord: WordEntry;
  options: string[];
  correctAnswer: string;
  questionText?: string;
  explanation?: string;
  hint?: string;
  isAiGenerated?: boolean;
}

export const QuizChallengeView: React.FC<QuizChallengeViewProps> = ({ words }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Check if Gemini API key is available (baked in at build time via VITE_GEMINI_API_KEY)
  const hasApiKey = !!((import.meta as any).env?.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (!words || words.length < 4) return;

    const generated: Question[] = words.slice(0, 10).map(wordObj => {
      const correctAnswer = wordObj.coreSynonyms[0] || wordObj.meaning;
      const otherWords = words.filter(w => w.id !== wordObj.id);
      const wrongOptions = otherWords
        .map(w => w.coreSynonyms[0] || w.meaning)
        .slice(0, 3);

      const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

      return {
        targetWord: wordObj,
        options: allOptions,
        correctAnswer
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
  }, [words]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return;
    // Guard: currentQuestion may be undefined if questions array is empty
    if (!currentQuestion) return;
    setSelectedOption(opt);

    if (opt === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
      try {
        confetti({ particleCount: 25, spread: 60, origin: { y: 0.6 } });
      } catch {
        // confetti may fail in canvas-blocked or non-secure contexts — not critical
      }
    }
  };

  const handleGenerateAIQuestion = async () => {
    if (!currentQuestion) return;
    setAiLoading(true);
    setAiError(null);
    setShowHint(false);

    try {
      const aiRes: AIQuizQuestionResponse = await fetchAIQuizQuestion(
        currentQuestion.targetWord.word,
        currentQuestion.targetWord.meaning,
        currentQuestion.targetWord.category
      );

      setQuestions(prev => {
        const updated = [...prev];
        updated[currentIndex] = {
          ...updated[currentIndex],
          questionText: aiRes.question,
          options: aiRes.options,
          correctAnswer: aiRes.correctAnswer,
          explanation: aiRes.explanation,
          hint: aiRes.hint,
          isAiGenerated: true
        };
        return updated;
      });
      setSelectedOption(null);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI question.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowHint(false);
    setAiError(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (!words || words.length < 4) {
    return (
      <div className="py-20 text-center text-slate-400 font-mono">
        Need at least 4 words in your dataset to build a quiz challenge.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 font-mono animate-pulse">
        Building quiz questions…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/10 bg-[#161922] p-6 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F1F5F9] font-sans">SSC Exam Practice Quiz</h2>
            <p className="text-xs text-slate-400">Master vocabulary with static & Gemini AI-generated exam questions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-3.5 py-1.5 rounded-xl border border-purple-500/20">
            Score: {score} / {questions.length}
          </div>
        </div>
      </div>

      {/* API Key Notice — only shown if key is missing */}
      {!hasApiKey && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-4">
          <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-300/90 leading-relaxed">
            <span className="font-bold text-amber-300">AI Quiz Generation is disabled.</span>{' '}
            The "Generate Gemini AI Question" button requires a{' '}
            <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-200 font-mono">VITE_GEMINI_API_KEY</code> environment variable.{' '}
            To enable it: go to your{' '}
            <a
              href="https://github.com/Ravi-0143/Wor/settings/secrets/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-amber-200 hover:text-white"
            >
              GitHub repo → Settings → Secrets
            </a>{' '}
            and add <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-200 font-mono">VITE_GEMINI_API_KEY</code> with your key from{' '}
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline text-amber-200 hover:text-white">aistudio.google.com</a>.
            The static quiz below works fully without it.
          </div>
        </div>
      )}

      {!isFinished && currentQuestion ? (
        <div className="rounded-3xl border border-white/10 bg-[#161922] p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Question Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
              {currentQuestion.isAiGenerated && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] border border-amber-500/30">
                  <Sparkles className="h-3 w-3" /> Gemini AI Question
                </span>
              )}
            </span>

            <button
              onClick={handleGenerateAIQuestion}
              disabled={aiLoading || !hasApiKey}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-1.5 text-xs font-medium text-amber-300 border border-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title={!hasApiKey ? 'API key not configured — see the notice above' : 'Generate a dynamic exam question powered by Gemini API'}
            >
              <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'Generating AI Quiz...' : !hasApiKey ? 'AI Unavailable (no API key)' : 'Generate Gemini AI Question'}</span>
            </button>
          </div>

          {aiError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
              {aiError}
            </div>
          )}

          {/* Question Text */}
          <div className="text-center space-y-3 py-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] font-serif leading-relaxed">
              {currentQuestion.questionText || `What is the synonym for "${currentQuestion.targetWord.word}"?`}
            </h3>
            {currentQuestion.targetWord.hindiMeaning && !currentQuestion.questionText && (
              <p className="text-xs text-amber-400 font-semibold font-serif">
                (हिंदी: {currentQuestion.targetWord.hindiMeaning})
              </p>
            )}

            {currentQuestion.hint && (
              <div className="pt-1">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>{showHint ? 'Hide Hint' : 'Show AI Hint'}</span>
                </button>
                {showHint && (
                  <p className="mt-2 text-xs font-sans text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 max-w-lg mx-auto">
                    💡 <strong>Hint:</strong> {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {(currentQuestion.options || []).filter(Boolean).map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQuestion.correctAnswer;
              let btnStyle = 'border-white/10 bg-[#1C202C] hover:bg-[#232838] text-[#E2E8F0]';

              if (selectedOption !== null) {
                if (isCorrect) btnStyle = 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 font-bold';
                else if (isSelected) btnStyle = 'border-rose-500/60 bg-rose-500/20 text-rose-200';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedOption !== null}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />}
                  {selectedOption !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation */}
          {selectedOption !== null && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              {currentQuestion.explanation && (
                <div className="p-4 rounded-2xl bg-[#1C202C] border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1">
                  <p className="font-bold text-amber-400 font-mono text-xs uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Answer Explanation
                  </p>
                  <p className="font-sans">{currentQuestion.explanation}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition-all"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Final Score'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#161922] p-12 text-center space-y-5 shadow-2xl">
          <Award className="h-14 w-14 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-bold text-[#F1F5F9] font-serif">Quiz Challenge Completed!</h3>
          <p className="text-sm font-mono text-slate-400">
            You scored <strong className="text-amber-400">{score}</strong> out of {questions.length}
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setSelectedOption(null);
              setIsFinished(false);
            }}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all"
          >
            Retake Practice Quiz
          </button>
        </div>
      )}
    </div>
  );
};
