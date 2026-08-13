'use client';

// Expandable lesson panel. Header row shows emoji, title, reading
// time, and completion status. Expanding it reveals the analogy pull
// quote, plain-English body, "big ideas", optional jargon box,
// optional interactive demo, and the QuizBlock. Passing the quiz
// marks the lesson complete via the parent-provided onComplete
// callback.

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Lesson, DemoKey } from '../../learn/lessons';
import type { QuizScore } from '../../hooks/useLearnProgress';
import QuizBlock from './QuizBlock';

const InflationDemo = dynamic(() => import('./InflationDemo'), { ssr: false });
const InterestDemo  = dynamic(() => import('./InterestDemo'),  { ssr: false });
const GdpDemo       = dynamic(() => import('./GdpDemo'),       { ssr: false });
const TradeDemo     = dynamic(() => import('./TradeDemo'),     { ssr: false });
const DebtDemo      = dynamic(() => import('./DebtDemo'),      { ssr: false });
const CurrencyDemo  = dynamic(() => import('./CurrencyDemo'),  { ssr: false });

const DEMO_MAP: Record<DemoKey, React.ComponentType<{ isDarkMode: boolean }>> = {
  inflation: InflationDemo,
  interest:  InterestDemo,
  gdp:       GdpDemo,
  trade:     TradeDemo,
  debt:      DebtDemo,
  currency:  CurrencyDemo,
};

interface Props {
  lesson: Lesson;
  isDarkMode: boolean;
  isComplete: boolean;
  quizScore?: QuizScore;
  onComplete: (id: string, score?: number, total?: number) => void;
}

export default function LessonPanel({ lesson, isDarkMode, isComplete, quizScore, onComplete }: Props) {
  const [open, setOpen] = useState(false);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text   = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted  = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const Demo = lesson.demoKey ? DEMO_MAP[lesson.demoKey] : null;

  return (
    <article className={`rounded-lg border overflow-hidden ${cardBg} ${isComplete ? 'ring-1 ring-emerald-500/40' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`lesson-body-${lesson.id}`}
        className={`w-full flex items-center gap-3 p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent ${
          open ? '' : isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'
        }`}
      >
        <span className="text-2xl shrink-0" aria-hidden>{lesson.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${muted}`}>Lesson {lesson.order}</span>
            <span className={`text-xs ${muted}`}>· {lesson.minutes} min read</span>
            {isComplete && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                Complete{quizScore ? ` · ${quizScore.score}/${quizScore.total}` : ''}
              </span>
            )}
          </div>
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>{lesson.title}</h3>
        </div>
        <span aria-hidden className={`shrink-0 text-xl transition-transform ${open ? 'rotate-180' : ''} ${muted}`}>▾</span>
      </button>

      {open && (
        <div id={`lesson-body-${lesson.id}`} className={`px-4 sm:px-6 pb-5 pt-1 space-y-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          {/* Analogy pull quote */}
          <blockquote
            className={`text-sm sm:text-base italic border-l-4 pl-3 py-1 ${
              isDarkMode ? 'border-blue-400 text-gray-200' : 'border-blue-500 text-gray-700'
            }`}
          >
            {lesson.analogy}
          </blockquote>

          {/* Body */}
          <div className="space-y-3">
            {lesson.body.map((para, i) => (
              <p key={i} className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {para}
              </p>
            ))}
          </div>

          {/* Big ideas */}
          <div className={`rounded-md border p-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
            <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              Big ideas
            </div>
            <ul className={`text-sm space-y-1 list-disc pl-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {lesson.bigIdeas.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>

          {/* Jargon box */}
          {lesson.jargonBox && lesson.jargonBox.length > 0 && (
            <div className={`rounded-md border p-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                Jargon-buster
              </div>
              <dl className="text-sm space-y-1">
                {lesson.jargonBox.map(j => (
                  <div key={j.term} className="flex flex-wrap gap-x-2">
                    <dt className={`font-semibold ${text}`}>{j.term}:</dt>
                    <dd className={muted}>{j.plain}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Interactive demo */}
          {Demo && (
            <div>
              <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                Try it yourself
              </div>
              <Demo isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Quiz */}
          <QuizBlock
            isDarkMode={isDarkMode}
            questions={lesson.quiz}
            onFinish={(score, total) => onComplete(lesson.id, score, total)}
          />

          {/* Outbound links */}
          {lesson.linksTo.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {lesson.linksTo.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-blue-300 hover:text-white hover:border-blue-400'
                      : 'bg-white border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  See the real data · {link.label} →
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
