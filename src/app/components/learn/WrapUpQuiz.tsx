'use client';

// Wrap-up quiz — the 10-question final assessment gate for the
// certificate. Locked until every lesson is marked complete, then
// opens the door to Certificate.tsx once the user submits.

import { useState } from 'react';
import { TOTAL_LESSONS, type QuizQuestion } from '../../learn/lessons';
import type { QuizScore } from '../../hooks/useLearnProgress';
import QuizBlock from './QuizBlock';

interface Props {
  isDarkMode: boolean;
  questions: QuizQuestion[];
  unlocked: boolean;
  existingScore?: QuizScore;
  onFinish: (score: number, total: number) => void;
}

export default function WrapUpQuiz({ isDarkMode, questions, unlocked, existingScore, onFinish }: Props) {
  const [started, setStarted] = useState(false);

  const bg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${bg}`}>
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <div>
          <div className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Final Wrap-up</div>
          <h2 className={`text-2xl font-bold ${text}`}>10-question final quiz</h2>
        </div>
        {existingScore && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold">
            Best score: {existingScore.score}/{existingScore.total}
          </span>
        )}
      </div>
      <p className={`text-sm ${muted}`}>
        Answer 7 out of 10 correctly to unlock your printable certificate. You can retake it any time.
      </p>

      {!unlocked ? (
        <div className={`mt-5 rounded-md border p-3 text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          🔒 Complete all {TOTAL_LESSONS} lessons above to unlock this quiz.
        </div>
      ) : !started ? (
        <button
          onClick={() => setStarted(true)}
          className="mt-5 text-sm font-semibold px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          {existingScore ? 'Retake the quiz' : 'Start the wrap-up quiz'}
        </button>
      ) : (
        <div className="mt-5">
          <QuizBlock
            isDarkMode={isDarkMode}
            questions={questions}
            onFinish={(s, t) => onFinish(s, t)}
            compact
          />
        </div>
      )}
    </div>
  );
}
