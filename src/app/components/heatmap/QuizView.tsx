'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';
import { getMetricByKey } from '../../utils/metricCategories';
import { flagFor } from '../../utils/heatmap/palettes';
import { dateSeed, generateQuestion, generateQuiz, seededRandom, type QuizQuestion } from '../../utils/heatmap/quiz';
import type { HeatmapData } from '../../utils/heatmap/values';
import { heatmapTheme } from './theme';

interface Streak { current: number; best: number }
interface DailyRecord { seed: number; score: number; total: number }

interface Props {
  data: HeatmapData;
  isDarkMode: boolean;
  onShowOnMap: (q: QuizQuestion) => void;
}

export default function QuizView({ data, isDarkMode, onShowOnMap }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [streak, setStreak] = useLocalStorage<Streak>('heatmapQuizStreak', { current: 0, best: 0 });
  const [daily, setDaily] = useLocalStorage<DailyRecord | null>('heatmapQuizDaily', null);

  const seed = useMemo(() => dateSeed(new Date()), []);
  const dailyQuestions = useMemo(() => generateQuiz(data, seed), [data, seed]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);

  const newPractice = useCallback(() => generateQuestion(data, seededRandom(Math.floor(Math.random() * 2 ** 31))), [data]);
  const [practiceQ, setPracticeQ] = useState<QuizQuestion | null>(() => newPractice());
  const [answer, setAnswer] = useState<CountryKey | null>(null);

  const dailyDone = daily?.seed === seed;
  const question = mode === 'daily' ? (dailyDone ? null : dailyQuestions[dailyIndex] ?? null) : practiceQ;

  const choose = (ck: CountryKey) => {
    if (!question || answer) return;
    setAnswer(ck);
    const correct = ck === question.answer;
    setStreak(s => ({ current: correct ? s.current + 1 : 0, best: Math.max(s.best, correct ? s.current + 1 : 0) }));
    if (mode === 'daily' && correct) setDailyScore(s => s + 1);
  };

  const next = () => {
    setAnswer(null);
    if (mode === 'practice') { setPracticeQ(newPractice()); return; }
    if (dailyIndex + 1 >= dailyQuestions.length) {
      setDaily({ seed, score: dailyScore, total: dailyQuestions.length });
    } else {
      setDailyIndex(i => i + 1);
    }
  };

  const switchMode = (m: 'daily' | 'practice') => { setMode(m); setAnswer(null); };
  const def = question ? getMetricByKey(question.metric) : undefined;
  const fmt = (v: number) => (def ? def.format(v) : v.toFixed(1));
  const sortedOptions = question && answer
    ? [...question.options].sort((a, b) => (question.direction === 'highest' ? question.values[b]! - question.values[a]! : question.values[a]! - question.values[b]!))
    : question?.options ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className={`flex rounded-lg border overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          {(['daily', 'practice'] as const).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-4 py-2 text-sm ${mode === m ? 'bg-blue-600 text-white' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700')}`}>
              {m === 'daily' ? 'Daily challenge' : 'Practice'}
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-sm">
          <span><span className={tc.textSec}>Streak </span><span className="font-bold tabular-nums">{streak.current}</span></span>
          <span><span className={tc.textSec}>Best </span><span className="font-bold tabular-nums">{streak.best}</span></span>
          {mode === 'daily' && !dailyDone && <span><span className={tc.textSec}>Q </span><span className="font-bold tabular-nums">{dailyIndex + 1}/{dailyQuestions.length}</span></span>}
        </div>
      </div>

      {mode === 'daily' && dailyDone && daily && (
        <div className={`text-center p-8 rounded-xl ${tc.subtle}`}>
          <p className={`text-xs uppercase tracking-wider mb-2 ${tc.textSec}`}>Today&rsquo;s challenge complete</p>
          <p className="text-4xl font-bold mb-2">{daily.score} / {daily.total}</p>
          <p className={`text-sm mb-4 ${tc.textSec}`}>A new set of five questions arrives tomorrow. Keep your streak going in practice mode.</p>
          <button onClick={() => switchMode('practice')} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white">Practice now</button>
        </div>
      )}

      {question && def && (
        <div>
          <p className={`text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>{question.year} data</p>
          <h3 className="text-xl font-bold mb-4">
            Which of these had the {question.direction} {def.label.toLowerCase()}?
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {sortedOptions.map(ck => {
              const isAnswer = ck === question.answer;
              const isChosen = ck === answer;
              const state = !answer ? 'idle' : isAnswer ? 'right' : isChosen ? 'wrong' : 'other';
              return (
                <button key={ck} onClick={() => choose(ck)} disabled={!!answer}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                    state === 'right' ? 'border-emerald-500 bg-emerald-500/10'
                    : state === 'wrong' ? 'border-red-500 bg-red-500/10'
                    : state === 'other' ? (isDarkMode ? 'border-gray-700 opacity-70' : 'border-gray-200 opacity-70')
                    : (isDarkMode ? 'border-gray-600 hover:border-blue-500' : 'border-gray-200 hover:border-blue-500')}`}>
                  <span className="font-medium">{flagFor(ck)} {COUNTRY_DISPLAY_NAMES[ck]}</span>
                  {answer && <span className="text-sm tabular-nums font-semibold">{fmt(question.values[ck]!)}</span>}
                </button>
              );
            })}
          </div>
          {answer && (
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <p className={`font-semibold ${answer === question.answer ? 'text-emerald-500' : 'text-red-500'}`}>
                {answer === question.answer ? 'Correct!' : `Not quite: it was ${COUNTRY_DISPLAY_NAMES[question.answer]}.`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => onShowOnMap(question)} className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>Show on map</button>
                <button onClick={next} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white">
                  {mode === 'daily' && dailyIndex + 1 >= dailyQuestions.length ? 'See results' : 'Next question'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!question && !(mode === 'daily' && dailyDone) && (
        <p className={`py-12 text-center text-sm ${tc.textSec}`}>Not enough data has loaded to build a quiz yet.</p>
      )}
    </div>
  );
}
