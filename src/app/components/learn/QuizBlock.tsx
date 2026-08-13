'use client';

// Multiple-choice quiz block for a single lesson. Immediate feedback,
// plain-English explanation revealed after answering, keyboard-friendly
// aria-pressed toggles. Reports the final score back to the parent
// once the last question is answered.

import { useState } from 'react';
import type { QuizQuestion } from '../../learn/lessons';

interface Props {
  isDarkMode: boolean;
  questions: QuizQuestion[];
  onFinish: (score: number, total: number) => void;
  compact?: boolean;
}

export default function QuizBlock({ isDarkMode, questions, onFinish, compact }: Props) {
  // answers[i] = index picked for question i, or null if unanswered
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [reported, setReported] = useState(false);

  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';
  const text   = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted  = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const answeredCount = answers.filter(a => a !== null).length;
  const score = answers.reduce((s, a, i) => s + (a === questions[i].answerIdx ? 1 : 0), 0);
  const allAnswered = answeredCount === questions.length;

  const handlePick = (qi: number, oi: number) => {
    setAnswers(prev => {
      if (prev[qi] !== null) return prev; // lock after first answer
      const next = [...prev];
      next[qi] = oi;
      const done = next.every(a => a !== null);
      if (done && !reported) {
        const s = next.reduce((acc, a, idx) => acc + (a === questions[idx].answerIdx ? 1 : 0), 0);
        setReported(true);
        // Schedule to avoid setState-in-render on parent
        setTimeout(() => onFinish(s, questions.length), 0);
      }
      return next;
    });
  };

  return (
    <div className={`rounded-lg border p-4 ${cardBg}`}>
      <div className={`text-[11px] uppercase tracking-wider font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
        Quick check {compact ? '' : '· Answer each to complete the lesson'}
      </div>
      <ol className="space-y-5">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const correct = q.answerIdx;
          const isDone = picked !== null;
          return (
            <li key={qi}>
              <div className={`text-sm font-medium mb-2 ${text}`}>{qi + 1}. {q.q}</div>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isCorrect = oi === correct;
                  let btnCls = isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100';
                  if (isDone) {
                    if (isCorrect) btnCls = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500';
                    else if (isPicked) btnCls = 'bg-rose-500/15 border-rose-500/40 text-rose-500';
                    else btnCls = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-400';
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => handlePick(qi, oi)}
                      disabled={isDone}
                      aria-pressed={isPicked}
                      className={`text-left text-sm px-3 py-2 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent disabled:cursor-default ${btnCls}`}
                    >
                      <span className="mr-2 font-semibold">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isDone && (
                <p className={`text-xs mt-2 ${muted}`} aria-live="polite">
                  <span className="font-semibold">{picked === correct ? '✅ Correct!' : '❌ Not quite.'}</span>{' '}
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {allAnswered && (
        <div className={`mt-4 pt-3 border-t text-sm ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
          You scored <span className="font-bold">{score}/{questions.length}</span>.{' '}
          {score === questions.length ? 'Perfect!' : score >= Math.ceil(questions.length * 0.7) ? 'Solid work.' : 'Give it another read and try again next time.'}
        </div>
      )}
    </div>
  );
}
