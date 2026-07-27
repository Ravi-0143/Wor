import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { WordEntry } from '../../types';

/*
  IntroLanding
  ------------
  Standalone landing screen. Mount it BEFORE your existing Navbar / subView shell:

    const [showIntro, setShowIntro] = useState(true);
    return showIntro
      ? <IntroLanding words={allWords} onEnter={() => setShowIntro(false)} />
      : <ExistingApp />;   // your current Navbar + cards/graph/quiz app, untouched

  Props:
    words     - your WordEntry[] (only `id` and `word` are read here)
    onEnter   - called once the exit fade finishes
    introWord - the word typed in the center (default "Lexicon")
*/

const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

const DEMO_WORDS = [
  'ephemeral', 'vindicate', 'austere', 'labyrinthine', 'ostensible', 'placate',
  'conflagration', 'indigent', 'recalcitrant', 'sanguine', 'obfuscate', 'tenuous',
  'garrulous', 'pernicious', 'equivocal', 'fortuitous', 'laconic', 'magnanimous',
  'nascent', 'obdurate', 'parsimonious', 'quixotic', 'reticent', 'sagacious',
  'taciturn', 'ubiquitous', 'vitriolic', 'wistful', 'abstruse', 'cacophony',
  'diaphanous', 'ebullient', 'fastidious', 'gregarious', 'hackneyed', 'ineffable',
  'juxtapose', 'kaleidoscope', 'languid', 'mellifluous', 'nefarious', 'opulent',
  'paradigm', 'querulous', 'ruminate', 'solace', 'trepidation', 'unassailable',
  'vicarious', 'winsome',
].map((word, i) => ({ 
  id: `demo-${i}`, 
  word,
  stars: 3,
  meaning: `A placeholder meaning for the demo word ${word}. Load a real guide to see full details.`,
  coreSynonyms: [],
  advancedSynonyms: [],
  antonyms: [],
  examAnswers: [],
  category: 'Demo',
}));

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);
  return reduced;
}

const NAV_BUTTONS = [
  { id: 'all', label: 'All Words', view: 'cards' },
  { id: 'reverse', label: 'Reverse Concept Search', view: 'reverse' },
  { id: 'mesh', label: 'Synonym Mesh Tracker', view: 'graph' },
  { id: 'mastery', label: 'Flashcard Mastery', view: 'mastery' },
  { id: 'quiz', label: 'Practice Quiz', view: 'quiz' },
];

interface IntroLandingProps {
  words?: WordEntry[];
  onEnter?: (view?: string, selectedWord?: WordEntry) => void;
  introWord?: string;
  onOpenGitHubModal?: () => void;
  onReloadDefault?: () => void;
  isLoadingGuide?: boolean;
}

type Stage = 'typing' | 'title-fade-out' | 'buttons-slide' | 'buttons-sink' | 'title-return' | 'exiting';

export function IntroLanding({ 
  words = [], 
  onEnter, 
  introWord = 'Lexicon',
  onOpenGitHubModal,
  onReloadDefault,
  isLoadingGuide = false
}: IntroLandingProps) {
  const reducedMotion = useReducedMotion();

  // Pick 40 random words to display as stars so it changes every time the portal is opened
  const pool = useMemo(() => {
    const hasRealWords = Array.isArray(words) && words.length > 0;
    const poolSource = hasRealWords ? words : DEMO_WORDS;
    return [...poolSource]
      .sort(() => Math.random() - 0.5)
      .slice(0, 40);
  }, [words]);

  const particleData = useMemo(() => {
    const n = pool.length;
    const rMin = 18;
    const rMax = 46;
    return pool.map((entry, i) => {
      const radius = rMin + (rMax - rMin) * Math.sqrt(i / n);
      const angle = i * GOLDEN_ANGLE;
      const layer = i % 3; // 0 near, 1 mid, 2 far
      return {
        id: entry.id,
        word: entry.word,
        homeXPct: 50 + radius * Math.cos(angle),
        homeYPct: 50 + radius * Math.sin(angle) * 0.82,
        layer,
        freqA: 0.15 + Math.random() * 0.25,
        freqB: 0.31 + Math.random() * 0.37,
        phaseA: Math.random() * Math.PI * 2,
        phaseB: Math.random() * Math.PI * 2,
        amp: layer === 0 ? 2.2 : layer === 1 ? 1.4 : 0.8,
      };
    });
  }, [pool]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  const particleRefs = useRef<Array<{ dot: HTMLDivElement | null; label: HTMLButtonElement | null }>>([]);
  if (particleRefs.current.length !== particleData.length) {
    particleRefs.current = particleData.map(() => ({ dot: null, label: null }));
  }

  const [typedLength, setTypedLength] = useState(0);
  const [stage, setStage] = useState<Stage>('typing');
  const [cursorOpacity, setCursorOpacity] = useState(1);
  const [fieldOpacity, setFieldOpacity] = useState(1);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkRafRef = useRef<number | null>(null);
  const exitRafRef = useRef<number | null>(null);
  const buttonsRafRef = useRef<number | null>(null);

  const [buttonProgress, setButtonProgress] = useState(() => NAV_BUTTONS.map(() => 0));

  // ---- pointer / touch tracking ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const setFromClient = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };
    const onMove = (e: MouseEvent) => setFromClient(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) setFromClient(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('touchmove', onTouch, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('touchmove', onTouch);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // ---- main animation loop: imperative DOM writes, no per-frame React state ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const REVEAL_RADIUS = 150;

    const tick = (t: number) => {
      const rect = el.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const minDim = Math.min(w, h);
      const mouse = mouseRef.current;

      particleData.forEach((particle, i) => {
        const refs = particleRefs.current[i];
        if (!refs || !refs.dot) return;

        let x = (particle.homeXPct / 100) * w;
        let y = (particle.homeYPct / 100) * h;

        if (!reducedMotion) {
          const drift = (minDim * particle.amp) / 100;
          const dx = Math.sin(t * 0.001 * particle.freqA + particle.phaseA) * drift
                   + Math.sin(t * 0.001 * particle.freqB + particle.phaseB) * drift * 0.5;
          const dy = Math.cos(t * 0.001 * particle.freqB + particle.phaseA) * drift
                   + Math.cos(t * 0.001 * particle.freqA + particle.phaseB) * drift * 0.5;
          x += dx;
          y += dy;
        }

        const dist = Math.hypot(mouse.x - x, mouse.y - y);
        const reveal = Math.max(0, 1 - dist / REVEAL_RADIUS);
        const eased = reveal * reveal * (3 - 2 * reveal); // smoothstep

        const layerBase = particle.layer === 0 ? 0.55 : particle.layer === 1 ? 0.38 : 0.24;
        const dotOpacity = layerBase + eased * (1 - layerBase);
        const dotScale = 1 + eased * 1.8;

        refs.dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${dotScale})`;
        refs.dot.style.opacity = dotOpacity.toFixed(3);

        if (refs.label) {
          refs.label.style.transform = `translate3d(${x}px, ${y - 14}px, 0)`;
          refs.label.style.opacity = eased.toFixed(3);
          refs.label.style.fontSize = `${11 + eased * 3}px`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, particleData]);

  // ---- typing effect: variable per-character delay, types in both 'typing' and 'title-return' ----
  useEffect(() => {
    if (stage !== 'typing' && stage !== 'title-return') return;
    const full = introWord.length;

    if (reducedMotion) {
      setTypedLength(full);
      if (stage === 'typing') {
        setStage('title-fade-out');
      }
      return;
    }
    if (typedLength >= full) {
      if (stage === 'typing') {
        const timeout = setTimeout(() => setStage('title-fade-out'), 1000);
        return () => clearTimeout(timeout);
      }
      return;
    }
    const delay = 140 + Math.random() * 140;
    typingTimeoutRef.current = setTimeout(() => setTypedLength((l) => l + 1), delay);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typedLength, introWord, reducedMotion, stage]);

  // ---- blink cursor during typing states ----
  useEffect(() => {
    if (stage !== 'typing' && stage !== 'title-return') return;
    const blink = (t: number) => {
      setCursorOpacity(0.35 + 0.65 * ((Math.sin(t * 0.006) + 1) / 2));
      blinkRafRef.current = requestAnimationFrame(blink);
    };
    blinkRafRef.current = requestAnimationFrame(blink);
    return () => {
      if (blinkRafRef.current) cancelAnimationFrame(blinkRafRef.current);
    };
  }, [stage]);

  // ---- transition stage: title fade out transitions to buttons slide ----
  useEffect(() => {
    if (stage !== 'title-fade-out') return;
    const timeout = setTimeout(() => {
      setStage('buttons-slide');
    }, 800);
    return () => clearTimeout(timeout);
  }, [stage]);

  const [destinationView, setDestinationView] = useState<string | undefined>(undefined);
  const [selectedWordToInspect, setSelectedWordToInspect] = useState<WordEntry | undefined>(undefined);

  // ---- exit sequence: fade whole field, then hand off ----
  useEffect(() => {
    if (stage !== 'exiting') return;
    const start = performance.now();
    const duration = 500;
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / duration);
      setFieldOpacity(1 - progress);
      if (progress < 1) exitRafRef.current = requestAnimationFrame(step);
      else if (onEnter) {
        onEnter(destinationView, selectedWordToInspect);
      }
    };
    exitRafRef.current = requestAnimationFrame(step);
    return () => {
      if (exitRafRef.current) cancelAnimationFrame(exitRafRef.current);
    };
  }, [stage, onEnter, destinationView, selectedWordToInspect]);

  // ---- buttons: staggered horizontal slide-in, brief hold, then shrink & sink ----
  useEffect(() => {
    if (stage !== 'buttons-slide') return;

    const staggerMs = reducedMotion ? 0 : 160;
    const slideInMs = reducedMotion ? 1 : 550;
    const holdMs = reducedMotion ? 0 : 600;
    const sinkMs = reducedMotion ? 1 : 800;
    const n = NAV_BUTTONS.length;
    const start = performance.now();
    const sinkStart: { current: number | null } = { current: null };

    const step = (t: number) => {
      const elapsed = t - start;

      if (buttonsRafRef.current === null) return;

      // Phase 1: Slide in horizontally from side
      const nextProgress = NAV_BUTTONS.map((_, i) => {
        const localStart = i * staggerMs;
        const localT = elapsed - localStart;
        if (localT <= 0) return 0;
        const raw = Math.min(1, localT / slideInMs);
        return raw * raw * (3 - 2 * raw); // smoothstep
      });

      const allSlidIn = elapsed > (n - 1) * staggerMs + slideInMs;

      if (!allSlidIn) {
        setButtonProgress(nextProgress);
        buttonsRafRef.current = requestAnimationFrame(step);
        return;
      }

      // Phase 2: Settle at center briefly, then shrink and sink to bottom dock
      if (sinkStart.current === null) sinkStart.current = t;
      const sinkElapsed = t - sinkStart.current - holdMs;

      if (sinkElapsed <= 0) {
        setButtonProgress(NAV_BUTTONS.map(() => 1));
        buttonsRafRef.current = requestAnimationFrame(step);
        return;
      }

      const sinkRaw = Math.min(1, sinkElapsed / sinkMs);
      const sinkEased = sinkRaw * sinkRaw * (3 - 2 * sinkRaw);
      setButtonProgress(NAV_BUTTONS.map(() => 1 + sinkEased)); // encodes 1.0 to 2.0 (sinking progress)

      if (sinkRaw < 1) {
        buttonsRafRef.current = requestAnimationFrame(step);
      } else {
        setStage('buttons-sink');
      }
    };

    buttonsRafRef.current = requestAnimationFrame(step);
    return () => {
      if (buttonsRafRef.current) cancelAnimationFrame(buttonsRafRef.current);
      buttonsRafRef.current = null;
    };
  }, [stage, reducedMotion]);

  // Transition from buttons-sink to title-return
  useEffect(() => {
    if (stage !== 'buttons-sink') return;
    setTypedLength(0); // Reset typed counter so we can type it out again
    setStage('title-return');
  }, [stage]);

  const handleNavClick = useCallback((e: React.MouseEvent, btn: typeof NAV_BUTTONS[0]) => {
    e.stopPropagation();
    setDestinationView(btn.view);
    setStage('exiting');
  }, []);

  const handleActivate = useCallback(() => {
    if (stage === 'exiting') return;
    if (stage === 'typing') {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setTypedLength(introWord.length);
      setStage('exiting');
      return;
    }
    setStage('exiting');
  }, [stage, introWord]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  }, [handleActivate]);

  return (
    <div
      ref={containerRef}
      onClick={handleActivate}
      className="fixed inset-0 overflow-hidden select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #10101c 0%, #07070d 55%, #030305 100%)',
        opacity: fieldOpacity,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&display=swap');
      `}</style>

      <div aria-hidden="true">
        {/* ambient nebula */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 rounded-full"
          style={{ width: '36rem', height: '36rem', opacity: 0.2, background: 'radial-gradient(circle, #4C3FBF 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 rounded-full"
          style={{ width: '30rem', height: '30rem', opacity: 0.15, background: 'radial-gradient(circle, #7C4FBF 0%, transparent 70%)', filter: 'blur(60px)' }}
        />

        {particleData.map((particle, i) => (
          <React.Fragment key={particle.id}>
            <div
              ref={(node) => { if (particleRefs.current[i]) particleRefs.current[i].dot = node; }}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 3, height: 3, left: 0, top: 0,
                marginLeft: -1.5, marginTop: -1.5,
                background: '#A9A6FF',
                boxShadow: '0 0 6px 1px rgba(169,166,255,0.55)',
                willChange: 'transform, opacity',
              }}
            />
            {/* Clickable floating words that open in Module 08 detail inspector */}
            <button
              ref={(node) => { if (particleRefs.current[i]) particleRefs.current[i].label = node; }}
              onClick={(e) => {
                e.stopPropagation();
                const actualWord = pool.find(w => w.id === particle.id);
                if (actualWord && 'meaning' in actualWord) {
                  setDestinationView('inspect');
                  setSelectedWordToInspect(actualWord as WordEntry);
                  setStage('exiting');
                } else {
                  setStage('exiting');
                }
              }}
              className="pointer-events-auto absolute font-sans font-medium tracking-wide whitespace-nowrap bg-transparent border-0 cursor-pointer text-indigo-100 hover:text-white transition-colors duration-150 focus:outline-none"
              style={{
                left: 0, top: 0,
                textShadow: '0 0 12px rgba(169,166,255,0.6)',
                opacity: 0,
                willChange: 'transform, opacity, font-size',
              }}
            >
              {particle.word}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Top Bar API & Data Controls on Portal */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-mono font-medium text-amber-300 border border-amber-500/20 backdrop-blur-md shadow-lg">
          {words.length} Words
        </span>

        {onOpenGitHubModal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGitHubModal();
            }}
            className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300 border border-white/10 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md shadow-lg"
            title="Import Markdown Guide or API Data"
          >
            <span>Import Guide</span>
          </button>
        )}

        {onReloadDefault && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReloadDefault();
            }}
            disabled={isLoadingGuide}
            className="p-1.5 rounded-full bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md shadow-lg disabled:opacity-50"
            title="Reload Default Guide"
          >
            <span className={`inline-block ${isLoadingGuide ? 'animate-spin text-amber-400' : ''}`}>↻</span>
          </button>
        )}
      </div>

      {/* Main Title Center Stage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 380,
            fontSize: 'clamp(2.75rem, 9vw, 6.5rem)',
            letterSpacing: '0.01em',
            color: '#F7F5FF',
            textShadow: '0 0 40px rgba(139,143,255,0.35), 0 0 90px rgba(139,143,255,0.18)',
            opacity: stage === 'title-fade-out' || stage === 'buttons-slide' ? 0 : 1,
            transform: `scale(${stage === 'title-return' ? 1.0 : 0.96})`,
            transition: 'opacity 0.7s ease-in-out, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {introWord.slice(0, typedLength)}
          <span style={{ opacity: stage === 'title-fade-out' ? 0 : cursorOpacity, marginLeft: 2 }}>|</span>
        </div>
      </div>

      {/* Navigation Buttons: Slide from side -> shrink & sink to bottom */}
      {stage !== 'typing' && stage !== 'title-fade-out' && (
        <div
          className="absolute inset-x-0 top-1/2 flex items-center justify-center pointer-events-none"
          style={{ gap: '0.75rem', flexWrap: 'wrap', padding: '0 1.5rem', transform: 'translateY(-50%)' }}
        >
          {NAV_BUTTONS.map((btn, i) => {
            const p = buttonProgress[i] || 0;
            const riseP = Math.min(1, p);
            const sinkP = Math.max(0, p - 1); // 0 to 1 once sinking starts

            // Horizontal slide-in from side (right) and fade in
            const slideX = (1 - riseP) * 800;
            const riseOpacity = riseP;

            // Sink and shrink to bottom layer
            const sinkY = sinkP * (window.innerHeight * 0.38);
            const sinkScale = 1 - sinkP * 0.15;

            return (
              <button
                key={btn.id}
                onClick={(e) => handleNavClick(e, btn)}
                className="pointer-events-auto rounded-full font-sans font-medium tracking-wide cursor-pointer"
                style={{
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.85rem',
                  color: '#F4F2FF',
                  background: 'rgba(169,166,255,0.08)',
                  border: '1px solid rgba(169,166,255,0.28)',
                  backdropFilter: 'blur(8px)',
                  transform: `translate3d(${slideX}px, ${sinkY}px, 0) scale(${sinkScale})`,
                  opacity: riseOpacity,
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(169,166,255,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(169,166,255,0.55)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(169,166,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(169,166,255,0.28)';
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
