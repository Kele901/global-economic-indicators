'use client';

import { useCallback, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { dateSeed, seededRandom } from '../../utils/heatmap/quiz';
import { lineQuestion, type LineQuestion } from '../../utils/inflation/quiz';
import { regionOf } from '../../utils/inflation/stripes';
import { debtErosionPath, realSavingsPath } from '../../utils/inflation/money';
import { seriesOf, valueAt } from '../../utils/inflation/stats';
import { fetchPolicyRateRows } from '../../services/inflationData';
import { ChapterMeta, ChartLoading, CountrySelect, EmptyNote, Lede, Panel, Segmented, compactPct, countryName, pct, theme, useLazyFetch, type InflationChapterProps } from './ui';

const DAILY_COUNT = 5;

export default function ChapterTools({ isDarkMode, data }: InflationChapterProps) {
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Test yourself, then put numbers on two everyday questions: is cash in the bank keeping up with prices, and how much does inflation
        shrink what you owe?
      </Lede>
      <QuizPanel isDarkMode={isDarkMode} data={data} />
      <div className="grid gap-6 lg:grid-cols-2">
        <CashPanel isDarkMode={isDarkMode} data={data} />
        <DebtPanel isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

type Streak = { current: number; best: number };
type DailyRecord = { seed: number; answered: number; correct: number };

function QuizPanel({ isDarkMode, data }: Pick<InflationChapterProps, 'isDarkMode' | 'data'>) {
  const t = theme(isDarkMode);
  const [mode, setMode] = useState<'practice' | 'daily'>('practice');
  const [streak, setStreak] = useLocalStorage<Streak>('inflation-quiz-streak', { current: 0, best: 0 });
  const today = dateSeed(new Date());
  const [daily, setDaily] = useLocalStorage<DailyRecord>('inflation-quiz-daily', { seed: today, answered: 0, correct: 0 });
  const dailyRecord = daily.seed === today ? daily : { seed: today, answered: 0, correct: 0 };

  const dailyQuestions = useMemo(() => {
    const rng = seededRandom(today);
    const out: LineQuestion[] = [];
    const seen = new Set<CountryKey>();
    for (let i = 0; i < 40 && out.length < DAILY_COUNT; i++) {
      const q = lineQuestion(data.inflationRates, rng);
      if (q && !seen.has(q.answer)) {
        seen.add(q.answer);
        out.push(q);
      }
    }
    return out;
  }, [data.inflationRates, today]);

  const [practiceSeed, setPracticeSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const practice = useMemo(() => lineQuestion(data.inflationRates, seededRandom(practiceSeed)), [data.inflationRates, practiceSeed]);

  const [picked, setPicked] = useState<CountryKey | null>(null);
  const [hint, setHint] = useState(false);
  const dailyDone = dailyRecord.answered >= dailyQuestions.length;
  // The daily answer is recorded on click, so while it is shown the current question is the one before `answered`.
  const dailyIndex = Math.min(dailyRecord.answered - (picked ? 1 : 0), dailyQuestions.length - 1);
  const question = mode === 'practice' ? practice : dailyQuestions[Math.max(0, dailyIndex)];

  const answer = useCallback(
    (k: CountryKey) => {
      if (!question || picked) return;
      setPicked(k);
      const right = k === question.answer;
      setStreak((s) => ({ current: right ? s.current + 1 : 0, best: Math.max(s.best, right ? s.current + 1 : 0) }));
      if (mode === 'daily') setDaily({ seed: today, answered: dailyRecord.answered + 1, correct: dailyRecord.correct + (right ? 1 : 0) });
    },
    [question, picked, setStreak, mode, setDaily, today, dailyRecord],
  );

  const next = () => {
    setPicked(null);
    setHint(false);
    if (mode === 'practice') setPracticeSeed(Math.floor(Math.random() * 1e9));
  };

  const title = 'Guess the country from its inflation line';
  const showDailySummary = mode === 'daily' && dailyDone && !picked;
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="One country's inflation since 1990, unlabelled. Which is it? Practice as long as you like, or play today's five, the same for everyone."
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setPicked(null);
            setHint(false);
          }}
          options={[
            { id: 'practice', label: 'Practice' },
            { id: 'daily', label: 'Daily five' },
          ]}
        />
      }
      note={`Streak: ${streak.current} in a row (best ${streak.best}). Stored in this browser only.`}
    >
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-inflation']} />
      {showDailySummary ? (
        <div className={`rounded-lg border p-6 text-center ${t.inset}`}>
          <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>Today&rsquo;s score</div>
          <div className={`text-4xl font-bold tabular-nums my-2 ${t.text}`}>
            {dailyRecord.correct} / {dailyQuestions.length}
          </div>
          <p className={`text-sm ${t.textSec}`}>Come back tomorrow for a new set, or keep going in practice mode.</p>
        </div>
      ) : !question ? (
        <EmptyNote isDarkMode={isDarkMode}>Not enough long inflation histories loaded to build a question.</EmptyNote>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
          <div data-chart-container data-chart-title={title} style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={question.series} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={compactPct} width={48} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: number) => [pct(v), picked ? countryName(question.answer) : 'Mystery country']} />
                <ReferenceLine y={2} stroke="#10b981" strokeDasharray="5 4" />
                <Line dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {mode === 'daily' && (
              <div className={`text-xs ${t.textMuted}`}>
                Question {Math.max(0, dailyIndex) + 1} of {dailyQuestions.length} &middot; {dailyRecord.correct} correct
              </div>
            )}
            {question.options.map((k) => {
              const state = !picked ? 'idle' : k === question.answer ? 'right' : k === picked ? 'wrong' : 'other';
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!!picked}
                  onClick={() => answer(k)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    state === 'right'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : state === 'wrong'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : state === 'other'
                          ? `${t.chip} opacity-50`
                          : t.chip
                  }`}
                >
                  {countryName(k)}
                </button>
              );
            })}
            {!picked && (
              <button type="button" onClick={() => setHint(true)} className={`text-xs underline ${t.accent}`} disabled={hint}>
                {hint ? `Hint: it's in ${regionOf(question.answer)}` : 'Show a hint'}
              </button>
            )}
            {picked && (
              <div className="space-y-2">
                <p className={`text-sm ${t.textSec}`}>
                  {picked === question.answer ? 'Correct! ' : `It was ${countryName(question.answer)}. `}
                  Peak {pct(Math.max(...question.series.map((o) => o.value)))} in{' '}
                  {question.series.reduce((a, b) => (b.value > a.value ? b : a)).year}.
                </p>
                <button type="button" onClick={next} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {mode === 'daily' && dailyDone ? 'See score' : 'Next question'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function CashPanel({ isDarkMode, data }: Pick<InflationChapterProps, 'isDarkMode' | 'data'>) {
  const t = theme(isDarkMode);
  const { data: policy, loading, failed } = useLazyFetch(true, fetchPolicyRateRows);
  const available = useMemo(() => COUNTRY_KEYS.filter((k) => seriesOf(policy ?? [], k).length > 5), [policy]);
  const [picked, setCountry] = useState<CountryKey>('USA');
  const country = available.includes(picked) || !available.length ? picked : available[0];
  const [start, setStart] = useState(2010);
  const [spread, setSpread] = useState(-1);
  const amount = 10000;

  const chart = useMemo(() => {
    const years: number[] = [];
    const nominal: number[] = [];
    const inflation: number[] = [];
    for (const o of seriesOf(data.inflationRates, country)) {
      if (o.year <= start) continue;
      const r = valueAt(policy ?? [], country, o.year);
      if (r == null) break;
      years.push(o.year);
      nominal.push(Math.max(0, r + spread));
      inflation.push(o.value);
    }
    const saved = realSavingsPath(amount, nominal, inflation);
    const cash = realSavingsPath(amount, nominal.map(() => 0), inflation);
    return [start, ...years].map((year, i) => ({ year, saved: saved[i], cash: cash[i] }));
  }, [data.inflationRates, policy, country, start, spread]);

  const last = chart[chart.length - 1];
  const title = 'Cash vs inflation';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle={`What ${amount.toLocaleString()} in savings is worth in today's prices, earning the policy rate plus or minus a spread, against the same money kept as cash.`}
      note="Savings rates usually sit below the policy rate; the default spread is -1pp. Deposit rates never go below zero here. Real values, start year = 10,000."
    >
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['fred-policy-rates', 'wb-inflation']}
        download={{ filename: `cash-vs-inflation-${country}-${start}`, title, getData: () => chart }}
      />
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {available.length > 0 && <CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} options={available} />}
        <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
          From
          <select value={start} onChange={(e) => setStart(Number(e.target.value))} className={`text-xs rounded-md border px-2 py-1 ${t.input}`}>
            {[1995, 2000, 2005, 2010, 2015, 2020].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
          Spread {spread > 0 ? '+' : ''}
          {spread}pp
          <input type="range" min={-3} max={2} step={0.5} value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="accent-blue-600 w-24" />
        </label>
      </div>
      {loading || (!policy && !failed) ? (
        <ChartLoading isDarkMode={isDarkMode} height={260} />
      ) : chart.length < 3 ? (
        <EmptyNote isDarkMode={isDarkMode}>No overlapping policy-rate and inflation years for {countryName(country)} from {start}.</EmptyNote>
      ) : (
        <>
          <p className={`text-sm mb-2 ${t.textSec}`}>
            By {last.year}: savings worth <span className={`font-semibold ${last.saved >= amount ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.round(last.saved).toLocaleString()}</span>{' '}
            in {start} money; cash worth <span className="font-semibold text-rose-500">{Math.round(last.cash).toLocaleString()}</span>.
          </p>
          <div data-chart-container data-chart-title={`${title}: ${countryName(country)}`} style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={t.axis} tick={{ fontSize: 11 }} width={52} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [Math.round(v).toLocaleString(), n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={amount} stroke={t.axis} strokeDasharray="4 4" />
                <Line dataKey="saved" name="In a savings account" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="cash" name="As cash" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  );
}

function DebtPanel({ isDarkMode }: { isDarkMode: boolean }) {
  const t = theme(isDarkMode);
  const [principal, setPrincipal] = useState(200000);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(25);
  const chart = useMemo(() => {
    const mine = debtErosionPath(principal, rate, years);
    const two = debtErosionPath(principal, 2, years);
    return mine.map((v, i) => ({ year: i, real: v, at2: two[i] }));
  }, [principal, rate, years]);
  const end = chart[chart.length - 1];
  const eroded = (1 - end.real / principal) * 100;
  const title = 'How inflation shrinks a fixed debt';
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={title}
      subtitle="A loan fixed in money terms gets lighter as prices and wages rise. The real value of the balance, before any repayments."
      note="Illustration: assumes a constant inflation rate and ignores interest and repayments. The dashed line shows the same debt at 2% inflation."
    >
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-inflation']} download={{ filename: 'debt-erosion', title, getData: () => chart }} />
      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
        <label className={`flex flex-col gap-1 ${t.textSec}`}>
          Debt
          <input
            type="number"
            min={1000}
            step={1000}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value) || 1000))}
            className={`rounded-md border px-2 py-1 tabular-nums ${t.input}`}
          />
        </label>
        <label className={`flex flex-col gap-1 ${t.textSec}`}>
          Inflation {rate}%
          <input type="range" min={0} max={20} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="accent-blue-600" />
        </label>
        <label className={`flex flex-col gap-1 ${t.textSec}`}>
          {years} years
          <input type="range" min={1} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} className="accent-blue-600" />
        </label>
      </div>
      <p className={`text-sm mb-2 ${t.textSec}`}>
        After {years} years at {rate}% inflation, {principal.toLocaleString()} owed is worth{' '}
        <span className={`font-semibold tabular-nums ${t.text}`}>{Math.round(end.real).toLocaleString()}</span> in today&rsquo;s money:{' '}
        <span className="font-semibold text-emerald-500">{eroded.toFixed(0)}%</span> lighter.
      </p>
      <div data-chart-container data-chart-title={title} style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={t.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => `Y${v}`} />
            <YAxis stroke={t.axis} tick={{ fontSize: 11 }} width={52} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} domain={[0, principal]} />
            <Tooltip contentStyle={t.tooltip} labelFormatter={(l) => `Year ${l}`} formatter={(v: number, n: string) => [Math.round(v).toLocaleString(), n]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="real" name={`Real value at ${rate}%`} stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line dataKey="at2" name="At 2%" stroke={t.axis} strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
