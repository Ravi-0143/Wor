import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import { WordEntry } from '../../types';
import { ArrowLeft, Volume2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   ANIMATION & INJECTED STYLES (PAPER LIGHT THEME)
───────────────────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

  .wi-root {
    --wi-bg:       #FAFAF8;
    --wi-ink:      #1a1a18;
    --wi-ink-2:    #3d3d38;
    --wi-ink-3:    #7a7a72;
    --wi-ink-4:    #b0b0a8;
    --wi-green:    #2e6b4a;
    --wi-red:      #852929;
    --wi-blue:     #1a4b8a;
    --wi-accent:   #c9a84c;
    min-height: 100vh;
    background: var(--wi-bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--wi-ink);
    position: relative;
    overflow-x: hidden;
  }

  /* Core Animations */
  @keyframes wi-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .wi-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: var(--wi-ink);
    margin-left: 3px;
    vertical-align: middle;
    animation: wi-blink 0.85s step-end infinite;
  }

  @keyframes wi-rise {
    from { opacity: 0; transform: translateY(18px) scale(0.99); filter: blur(3px); }
    to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
  }
  .wi-section { opacity: 0; }
  .wi-section.visible { animation: wi-rise 0.82s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  @keyframes wi-page-in { from { opacity: 0; } to { opacity: 1; } }
  .wi-page-fade { animation: wi-page-in 0.4s ease forwards; }

  @media (prefers-reduced-motion: reduce) {
    .wi-section { opacity: 1 !important; animation: none !important; }
    .wi-cursor  { animation: none !important; }
  }

  /* Typography */
  .wi-word { font-family: 'Lora', Georgia, serif; font-weight: 600; color: var(--wi-ink); letter-spacing: -0.02em; line-height: 1.1; }
  .wi-meaning { font-family: 'Lora', Georgia, serif; font-style: italic; font-weight: 400; color: var(--wi-ink-2); line-height: 1.6; }
  .wi-label { font-family: 'Inter', system-ui, sans-serif; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wi-ink-4); }
  .wi-body { font-family: 'Inter', system-ui, sans-serif; font-weight: 400; color: var(--wi-ink-2); line-height: 1.7; }
  .wi-example-text { font-family: 'Lora', Georgia, serif; font-style: italic; color: var(--wi-ink-2); line-height: 1.7; }
  .wi-mnemonic-text { font-family: 'Inter', system-ui, sans-serif; font-weight: 400; color: var(--wi-ink-2); line-height: 1.65; }

  /* SSC Frequency Indicator */
  .wi-freq-container { display: inline-flex; align-items: center; gap: 0.25rem; margin-top: 0.65rem; padding: 0.25rem 0.6rem; background: rgba(0,0,0,0.03); border-radius: 20px; }
  .wi-star { color: var(--wi-accent); font-size: 0.75rem; opacity: 0.3; transition: opacity 0.3s ease; }
  .wi-star.active { opacity: 1; }
  .wi-freq-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wi-ink-3); margin-left: 0.35rem; }

  /* Word Family Tags */
  .wi-family-tag { font-family: 'Inter', system-ui, sans-serif; font-size: 0.8125rem; color: var(--wi-ink-2); background: rgba(0,0,0,0.04); padding: 0.3rem 0.75rem; border-radius: 16px; border: 1px solid rgba(0,0,0,0.03); outline: none; }
  .wi-family-tag.interactive { transition: all 0.15s ease; }
  .wi-family-tag.interactive:hover, .wi-family-tag.interactive:focus { background: rgba(26,75,138,0.08); border-color: rgba(26,75,138,0.25); color: var(--wi-blue); }
  .wi-family-container { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }

  /* Synonyms & Interactive Elements */
  .wi-syn-item { display: flex; align-items: baseline; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid rgba(0,0,0,0.06); cursor: pointer; transition: color 0.15s ease; text-decoration: none; background: none; border-left: none; border-right: none; border-top: none; outline: none; width: 100%; text-align: left; }
  .wi-syn-item:last-child { border-bottom: none; }
  .wi-syn-item:hover .wi-syn-word, .wi-syn-item:focus .wi-syn-word { color: var(--wi-ink); }
  .wi-syn-item:focus { box-shadow: 0 0 0 2px rgba(26,75,138,0.35); border-radius: 4px; }
  .wi-syn-index { font-family: 'Inter', monospace; font-size: 0.65rem; font-weight: 600; color: var(--wi-ink-4); min-width: 1.8rem; user-select: none; }
  .wi-syn-word { font-family: 'Inter', system-ui, sans-serif; font-size: 0.9375rem; font-weight: 500; color: var(--wi-ink-3); transition: color 0.15s ease; }
  .wi-syn-word.core { color: var(--wi-green); font-weight: 500; }
  .wi-syn-word.advanced { color: var(--wi-blue); font-weight: 400; }
  .wi-ant-word { font-family: 'Inter', system-ui, sans-serif; font-size: 0.875rem; font-weight: 400; color: var(--wi-red); opacity: 0.75; }

  /* Buttons & Utilities */
  .wi-back { display: inline-flex; align-items: center; gap: 0.375rem; background: none; border: none; cursor: pointer; padding: 0.25rem 0; color: var(--wi-ink-4); font-family: 'Inter', system-ui, sans-serif; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.04em; transition: color 0.15s ease; outline: none; }
  .wi-back:hover, .wi-back:focus { color: var(--wi-ink-2); }
  .wi-speak { display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 50%; transition: color 0.15s ease, transform 0.15s ease; outline: none; color: var(--wi-ink-4); }
  .wi-speak:hover, .wi-speak.playing { color: var(--wi-blue); transform: scale(1.12); }
  .wi-divider { border: none; border-top: 1px solid rgba(0,0,0,0.07); margin: 0; }
  .wi-trap { border-left: 2px solid var(--wi-accent); padding-left: 1rem; }
  .wi-trap-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wi-accent); }
  .wi-etym { font-family: 'Inter', system-ui, sans-serif; font-size: 0.8125rem; color: var(--wi-ink-4); line-height: 1.6; }

  @keyframes wi-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
  .wi-skeleton { height: 0.75rem; background: rgba(0,0,0,0.08); border-radius: 4px; animation: wi-pulse 1.6s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
const Section = memo(({ children, visible, delay, className = '' }: { children: React.ReactNode; visible: boolean; delay: number; className?: string; }) => (
  <div className={`wi-section${visible ? ' visible' : ''} ${className}`} style={visible ? { animationDelay: `${delay}ms` } : undefined}>
    {children}
  </div>
));
Section.displayName = 'Section';

const SynonymRow = memo(({ word, index, type, allWords, onSelectRelatedWord }: { word: string; index: number; type: 'core' | 'advanced'; allWords: WordEntry[]; onSelectRelatedWord: (w: WordEntry) => void; }) => {
  const match = useMemo(() => allWords.find(w => w.word.toLowerCase() === word.toLowerCase()), [allWords, word]);
  const handleClick = useCallback(() => { if (match) onSelectRelatedWord(match); }, [match, onSelectRelatedWord]);
  const handleKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }, [handleClick]);

  return (
    <button className="wi-syn-item" onClick={match ? handleClick : undefined} onKeyDown={match ? handleKey : undefined} tabIndex={match ? 0 : -1} aria-label={`${word}${match ? ' — click to open' : ''}`} title={match ? `Open ${word}` : word} style={{ cursor: match ? 'pointer' : 'default' }}>
      <span className="wi-syn-index">{String(index + 1).padStart(2, '0')}.</span>
      <span className={`wi-syn-word ${type}`}>{word}</span>
    </button>
  );
});
SynonymRow.displayName = 'SynonymRow';

// Interactive Family Tag Component
const FamilyTag = memo(({ fam, allWords, onSelectRelatedWord }: { fam: string; allWords: WordEntry[]; onSelectRelatedWord: (w: WordEntry) => void; }) => {
  const match = useMemo(() => {
    // Clean up word for matching, e.g. "Egotist (self-praiser)" -> "Egotist"
    let cleanWord = fam.replace(/\([^)]*\)/g, '').trim();
    cleanWord = cleanWord.replace(/[*_]/g, '').trim();
    const lowerClean = cleanWord.toLowerCase();
    
    let m = allWords.find(w => w.word.toLowerCase() === lowerClean);
    if (m) return m;

    const words = lowerClean.split(/\s+/);
    for (const w of words) {
      const cleanW = w.replace(/[^a-z]/gi, '');
      if (cleanW) {
        m = allWords.find(entry => entry.word.toLowerCase() === cleanW.toLowerCase());
        if (m) return m;
      }
    }
    return undefined;
  }, [fam, allWords]);

  const handleClick = useCallback(() => { if (match) onSelectRelatedWord(match); }, [match, onSelectRelatedWord]);
  const handleKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }, [handleClick]);

  if (match) {
    return (
      <button
        className="wi-family-tag interactive"
        onClick={handleClick}
        onKeyDown={handleKey}
        tabIndex={0}
        aria-label={`${fam} — click to open`}
        title={`Open ${match.word}`}
        style={{ cursor: 'pointer' }}
      >
        {fam}
      </button>
    );
  }

  return (
    <span className="wi-family-tag">
      {fam}
    </span>
  );
});
FamilyTag.displayName = 'FamilyTag';

export interface WordDetailInspectorViewProps {
  word: WordEntry;
  allWords: WordEntry[];
  onSelectRelatedWord: (w: WordEntry) => void;
  onBack: () => void;
}

export type Phase = 'silence' | 'typing' | 'settling' | 'revealing';

export interface EnrichedWordEntry extends WordEntry {
  frequency?: 1 | 2 | 3 | 4 | 5;
  wordFamilyArray?: string[];
}

const SILENCE_MS = 60;
const SETTLE_MS = 140;
const SECTION_DELAY_MS = 90;

const typingDelay = () => 45 + Math.random() * 30;

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export const WordDetailInspectorView: React.FC<WordDetailInspectorViewProps> = ({ word, allWords, onSelectRelatedWord, onBack }) => {
  const [phase, setPhase]               = useState<Phase>('silence');
  const [typedChars, setTypedChars]     = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [sectionCount, setSectionCount] = useState(0); 

  const reduced    = useMemo(() => prefersReducedMotion(), []);
  const wordIdRef  = useRef<string>('');
  const timerRef   = useRef<ReturnType<typeof setTimeout>>();

  // Dynamic enrichment logic to parse stars and wordFamily string array safely
  const enrichedWord = useMemo<EnrichedWordEntry | null>(() => {
    if (!word) return null;

    let parsedFamily: string[] = [];
    if (word.wordFamily) {
      if (Array.isArray(word.wordFamily)) {
        parsedFamily = word.wordFamily;
      } else if (typeof word.wordFamily === 'string') {
        let clean = word.wordFamily.replace(/\*\*(?:Related|Family|Phrase|Words)\*\*/gi, '').trim();
        clean = clean.replace(/^[\s·:→>]+/, '').trim();
        parsedFamily = clean.split(/·|,|;/).map(item => item.trim()).filter(Boolean);
      }
    }

    return {
      ...word,
      frequency: (word.stars as 1 | 2 | 3 | 4 | 5) || undefined,
      wordFamilyArray: parsedFamily.length > 0 ? parsedFamily : undefined
    };
  }, [word]);

  const allSynonyms = useMemo(() => word ? [...word.coreSynonyms, ...word.advancedSynonyms] : [], [word]);

  const sections = useMemo(() => {
    if (!enrichedWord) return [];
    const list: string[] = ['word', 'meaning'];
    if (allSynonyms.length > 0) list.push('synonyms');
    if (enrichedWord.antonyms.length > 0) list.push('antonyms');
    if (enrichedWord.wordFamilyArray && enrichedWord.wordFamilyArray.length > 0) list.push('family'); // Evaluates newly injected family arrays
    if (enrichedWord.traps || enrichedWord.examAnswers.length > 0) list.push('exam');
    list.push('nav'); 
    return list;
  }, [enrichedWord, allSynonyms]);

  const clearTimer = useCallback(() => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const runTyping = useCallback((text: string, onDone: () => void) => {
    let idx = 0;
    const tick = () => {
      idx++;
      setTypedChars(idx);
      if (idx < text.length) { timerRef.current = setTimeout(tick, typingDelay()); } else { onDone(); }
    };
    setTypedChars(0);
    timerRef.current = setTimeout(tick, typingDelay());
  }, []);

  const runEntrySequence = useCallback((w: WordEntry) => {
    clearTimer();
    setPhase('silence');
    setTypedChars(0);
    setSectionCount(0);
    wordIdRef.current = w.id;

    if (reduced) {
      setTypedChars(w.word.length);
      setPhase('revealing');
      setSectionCount(999);
      return;
    }

    timerRef.current = setTimeout(() => {
      setPhase('typing');
      runTyping(w.word, () => {
        setPhase('settling');
        timerRef.current = setTimeout(() => {
          setPhase('revealing');
          let count = 0;
          const reveal = () => {
            count++;
            setSectionCount(count);
            if (count < 20) { timerRef.current = setTimeout(reveal, SECTION_DELAY_MS); }
          };
          timerRef.current = setTimeout(reveal, SECTION_DELAY_MS);
        }, SETTLE_MS);
      });
    }, SILENCE_MS);
  }, [clearTimer, reduced, runTyping]);

  useEffect(() => { if (!word) return; runEntrySequence(word); return clearTimer; }, [word?.id]);

  const handleSpeak = useCallback(() => {
    if (!word || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.rate = 0.82;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend   = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [word]);

  if (!word || !enrichedWord) return null;

  const displayedWord = enrichedWord.word.slice(0, typedChars);
  const showCursor    = phase === 'typing' || phase === 'settling';
  const isVisible = (sectionName: string) => { if (phase !== 'revealing') return false; const idx = sections.indexOf(sectionName); return idx !== -1 && sectionCount > idx; };
  const sectionDelay = (sectionName: string): number => { const idx = sections.indexOf(sectionName); return idx * SECTION_DELAY_MS; };

  // SSC Frequency text mapper
  const getFrequencyLabel = (rating?: number) => {
    switch(rating) {
      case 5: return "SSC Loves This";
      case 4: return "Frequently Seen";
      case 3: return "Moderate Frequency";
      case 2: return "Occasionally Seen";
      default: return "";
    }
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="wi-root wi-page-fade" role="main" aria-label={`Word immersion: ${enrichedWord.word}`}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem)', minHeight: '100vh' }}>
          
          <Section visible={isVisible('nav')} delay={sectionDelay('nav')}>
            <div style={{ marginBottom: '4rem' }}>
              <button className="wi-back" onClick={onBack} aria-label="Back to lexicon" tabIndex={0}>
                <ArrowLeft size={13} strokeWidth={2} />
                <span>Lexicon</span>
              </button>
            </div>
          </Section>

          {/* Word Header with Integrated Frequency Module */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 className="wi-word" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', margin: 0 }} aria-label={enrichedWord.word}>
                {displayedWord || '\u00A0'}
                {showCursor && <span className="wi-cursor" aria-hidden="true" />}
              </h1>
              {typedChars >= enrichedWord.word.length && (
                <button className={`wi-speak${isPlaying ? ' playing' : ''}`} onClick={handleSpeak} aria-label={`Pronounce ${enrichedWord.word}`} title="Listen">
                  <Volume2 size={17} strokeWidth={isPlaying ? 2.5 : 1.75} />
                </button>
              )}
            </div>

            {typedChars >= enrichedWord.word.length && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                {enrichedWord.hindiMeaning && (
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.8125rem', color: 'var(--wi-ink-4)', letterSpacing: '0.02em' }}>
                    {enrichedWord.hindiMeaning}
                  </span>
                )}
                {/* Dynamically parsed frequency scale */}
                {enrichedWord.frequency && (
                  <div className="wi-freq-container" aria-label={`Frequency rating: ${enrichedWord.frequency} out of 5`}>
                    <div style={{ display: 'flex', gap: '0.1rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`wi-star ${star <= (enrichedWord.frequency || 0) ? 'active' : ''}`}>★</span>
                      ))}
                    </div>
                    <span className="wi-freq-label">{getFrequencyLabel(enrichedWord.frequency)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Section visible={isVisible('meaning')} delay={sectionDelay('meaning')}>
            <div style={{ marginBottom: '3rem' }}>
              <p className="wi-meaning" style={{ fontSize: 'clamp(1.0625rem, 2.5vw, 1.25rem)', margin: 0 }}>
                {enrichedWord.meaning}
              </p>
            </div>
          </Section>

          {allSynonyms.length > 0 && (
            <Section visible={isVisible('synonyms')} delay={sectionDelay('synonyms')}>
              <div style={{ marginBottom: '3rem' }}>
                <p className="wi-label" style={{ marginBottom: '1rem' }}>Synonyms</p>
                <div role="list" aria-label="Synonyms">
                  {enrichedWord.coreSynonyms.map((syn, i) => <SynonymRow key={`core-${syn}`} word={syn} index={i} type="core" allWords={allWords} onSelectRelatedWord={onSelectRelatedWord} />)}
                  {enrichedWord.advancedSynonyms.map((syn, i) => <SynonymRow key={`adv-${syn}`} word={syn} index={enrichedWord.coreSynonyms.length + i} type="advanced" allWords={allWords} onSelectRelatedWord={onSelectRelatedWord} />)}
                </div>
              </div>
            </Section>
          )}

          {enrichedWord.antonyms.length > 0 && (
            <Section visible={isVisible('antonyms')} delay={sectionDelay('antonyms')}>
              <div style={{ marginBottom: '3rem' }}>
                <p className="wi-label" style={{ marginBottom: '0.75rem' }}>Opposites</p>
                <p aria-label="Antonyms">
                  {enrichedWord.antonyms.map((ant, i) => (
                    <React.Fragment key={ant}>
                      <span className="wi-ant-word">{ant}</span>
                      {i < enrichedWord.antonyms.length - 1 && <span style={{ color: 'var(--wi-ink-4)', margin: '0 0.5rem', fontSize: '0.7rem' }}>·</span>}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </Section>
          )}

          {/* Newly integrated Word Family section */}
          {enrichedWord.wordFamilyArray && enrichedWord.wordFamilyArray.length > 0 && (
             <Section visible={isVisible('family')} delay={sectionDelay('family')}>
                <div style={{ marginBottom: '3rem' }}>
                  <p className="wi-label" style={{ marginBottom: '0.75rem' }}>Word Family</p>
                  <div className="wi-family-container">
                    {enrichedWord.wordFamilyArray.map(fam => (
                      <FamilyTag key={fam} fam={fam} allWords={allWords} onSelectRelatedWord={onSelectRelatedWord} />
                    ))}
                  </div>
                </div>
             </Section>
          )}



          {(enrichedWord.traps || enrichedWord.examAnswers.length > 0) && (
            <Section visible={isVisible('exam')} delay={sectionDelay('exam')}>
              <div style={{ marginBottom: '3rem' }}>
                <hr className="wi-divider" style={{ marginBottom: '2rem' }} />
                {enrichedWord.traps && (
                  <div className="wi-trap" style={{ marginBottom: enrichedWord.examAnswers.length > 0 ? '1.25rem' : 0 }}>
                    <p className="wi-trap-label" style={{ marginBottom: '0.4rem' }}>Watch out</p>
                    <p className="wi-body" style={{ fontSize: '0.875rem', margin: 0 }}>{enrichedWord.traps}</p>
                  </div>
                )}
                {enrichedWord.examAnswers.length > 0 && (
                  <div>
                    <p className="wi-label" style={{ marginBottom: '0.5rem' }}>SSC answer keys</p>
                    <p className="wi-body" style={{ fontSize: '0.875rem', margin: 0 }}>{enrichedWord.examAnswers.join('  ·  ')}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          <div style={{ height: '4rem' }} aria-hidden="true" />
        </div>
      </div>
    </>
  );
};
