'use client';

// Workshop: spot the misleading chart.
//
// ChartTricksDemo above this lets the reader *apply* two tricks. This is
// the other half of the skill: being handed a chart cold and having to
// name what is wrong with it. Five rounds, five distinct tricks, a score
// and a verdict.
//
// Every round renders its chart from the same tiny SVG primitives so no
// chart library ends up in the teaching bundle, and so each chart can be
// deliberately broken in a specific way.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

type TrickId =
  | 'truncated'
  | 'cherryPicked'
  | 'dualAxis'
  | 'noDenominator'
  | 'wrongChartType';

interface Round {
  id: TrickId;
  headline: string;
  caption: string;
  // The correct answer plus the plausible-but-wrong ones are drawn from
  // the shared OPTIONS list, so the reader cannot pattern-match on which
  // options appear.
  explanation: string;
  render: (ctx: RenderCtx) => React.ReactNode;
}

interface RenderCtx {
  isDarkMode: boolean;
  grid: string;
  muted: string;
  text: string;
}

const OPTIONS: { id: TrickId; label: string }[] = [
  { id: 'truncated',      label: 'The y-axis does not start at zero' },
  { id: 'cherryPicked',   label: 'The time window was chosen to flatter' },
  { id: 'dualAxis',       label: 'Two different axes make unrelated lines look linked' },
  { id: 'noDenominator',  label: 'Raw totals where a per-person rate is needed' },
  { id: 'wrongChartType', label: 'The wrong chart type for this data' },
];

const W = 300;
const H = 110;

function line(values: number[], min: number, max: number): string {
  const span = max - min || 1;
  return values
    .map((v, i) => `${((i / (values.length - 1)) * W).toFixed(1)},${(H - ((v - min) / span) * H).toFixed(1)}`)
    .join(' ');
}

const ROUNDS: Round[] = [
  {
    id: 'truncated',
    headline: 'Company profits collapse!',
    caption: 'Quarterly profits, $m',
    explanation:
      'The profits fell from 98 to 94, a drop of about 4%. Because the axis starts at 93 rather than 0, that 4% fills the whole chart and reads as a collapse. Always find the bottom of the axis before you judge the size of a move.',
    render: ({ grid, muted }) => {
      const vals = [98, 97.4, 96.2, 95.5, 94.6, 94.1];
      return (
        <div className="flex gap-2">
          <div className={`flex flex-col justify-between text-[10px] tabular-nums ${muted}`} aria-hidden>
            <span>98</span><span>93</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 h-28" preserveAspectRatio="none" role="img" aria-label="Line falling steeply across the chart, y-axis labelled 98 at the top and 93 at the bottom">
            <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke={grid} />
            <polyline points={line(vals, 93, 98)} fill="none" stroke="#ef4444" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );
    },
  },
  {
    id: 'cherryPicked',
    headline: 'Crime has risen every year under this government',
    caption: 'Recorded offences, index',
    explanation:
      'Everything shown is true — the line does rise across the window. But the series starts in the year of a 30-year low, and the chart stops before the subsequent fall. Widen the window and the same data shows a long decline with a bump in it.',
    render: ({ grid, muted }) => {
      const vals = [78, 82, 86, 89, 92, 95];
      return (
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none" role="img" aria-label="Line rising steadily from 78 to 95 across six years">
            <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke={grid} />
            <polyline points={line(vals, 0, 100)} fill="none" stroke="#f59e0b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className={`flex justify-between text-[10px] mt-1 ${muted}`}>
            <span>2019</span><span>2024</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'dualAxis',
    headline: 'Immigration is driving up house prices',
    caption: 'Left axis: net migration (thousands). Right axis: house price index',
    explanation:
      'The two lines appear to move together, but each has its own axis with its own scale and starting point, chosen so they overlap. Slide either axis and the apparent relationship appears or vanishes. Dual axes can be legitimate, but they can also manufacture a correlation out of nothing.',
    render: ({ grid, muted }) => {
      const a = [180, 240, 300, 340, 500, 680];
      const b = [104, 108, 110, 118, 121, 126];
      return (
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none" role="img" aria-label="Two lines rising together, one on a left axis and one on a right axis">
            <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke={grid} />
            <polyline points={line(a, 150, 700)} fill="none" stroke="#3b82f6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <polyline points={line(b, 100, 130)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className={`flex gap-3 text-[10px] mt-1 ${muted}`}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Net migration (left)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />House prices (right)</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'noDenominator',
    headline: 'China is the world’s worst polluter',
    caption: 'Total CO₂ emissions, megatonnes',
    explanation:
      'The totals are correct: China emits more than any other country. But China also has more people than any other country. Per person, its emissions are below several of the bars it towers over here, and around a quarter of Qatar’s. A total is the right number for the atmosphere and the wrong number for blame.',
    render: ({ grid, muted, text }) => {
      const bars = [
        { name: 'China', value: 11500 },
        { name: 'USA', value: 5000 },
        { name: 'India', value: 2800 },
        { name: 'Russia', value: 1700 },
        { name: 'Japan', value: 1050 },
      ];
      const max = 12000;
      return (
        <div className="space-y-1.5" role="img" aria-label="Bar chart of total emissions with China more than twice the United States">
          {bars.map(b => (
            <div key={b.name} className="flex items-center gap-2">
              <span className={`text-[10px] w-12 ${muted}`}>{b.name}</span>
              <div className="flex-1 h-4 rounded" style={{ backgroundColor: grid }}>
                <div className="h-full rounded bg-rose-500" style={{ width: `${(b.value / max) * 100}%` }} />
              </div>
              <span className={`text-[10px] tabular-nums w-14 text-right ${text}`}>{b.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: 'wrongChartType',
    headline: 'How the vote split',
    caption: 'Share of the vote by party',
    explanation:
      'The shares add up to 148%, because voters could pick more than one option — so a pie chart, which is built on the assumption that the slices are exclusive parts of one whole, is the wrong tool. Grouped bars would show the same data without implying a total.',
    render: ({ muted }) => {
      const slices = [
        { name: 'Party A', pct: 52, color: '#3b82f6' },
        { name: 'Party B', pct: 41, color: '#ef4444' },
        { name: 'Party C', pct: 33, color: '#f59e0b' },
        { name: 'Party D', pct: 22, color: '#10b981' },
      ];
      // Drawn as a pie whose slices are scaled to fit 360°, which is exactly
      // the distortion being tested.
      const total = slices.reduce((s, x) => s + x.pct, 0);
      let angle = -90;
      const arcs = slices.map(s => {
        const sweep = (s.pct / total) * 360;
        const from = angle;
        angle += sweep;
        const rad = (d: number) => (d * Math.PI) / 180;
        const x1 = 55 + 50 * Math.cos(rad(from));
        const y1 = 55 + 50 * Math.sin(rad(from));
        const x2 = 55 + 50 * Math.cos(rad(angle));
        const y2 = 55 + 50 * Math.sin(rad(angle));
        return { d: `M55,55 L${x1},${y1} A50,50 0 ${sweep > 180 ? 1 : 0},1 ${x2},${y2} Z`, color: s.color, name: s.name, pct: s.pct };
      });
      return (
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 110 110" className="w-28 h-28 shrink-0" role="img" aria-label="Pie chart with four slices labelled 52, 41, 33 and 22 percent">
            {arcs.map(a => <path key={a.name} d={a.d} fill={a.color} />)}
          </svg>
          <div className="space-y-1">
            {arcs.map(a => (
              <div key={a.name} className={`text-[11px] flex items-center gap-1.5 ${muted}`}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: a.color }} />
                {a.name} · {a.pct}%
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
];

export default function ChartGameWorkshop({ isDarkMode }: Props) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<TrickId | null>(null);
  const [answers, setAnswers] = useState<(TrickId | null)[]>([]);

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const panel = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';

  const current = ROUNDS[round]!;
  const finished = answers.length === ROUNDS.length;
  const score = useMemo(() => answers.filter((a, i) => a === ROUNDS[i]!.id).length, [answers]);

  const submit = (id: TrickId) => {
    if (picked !== null) return;
    setPicked(id);
    setAnswers(prev => [...prev, id]);
  };

  const next = () => {
    setPicked(null);
    setRound(r => Math.min(r + 1, ROUNDS.length - 1));
  };

  const restart = () => {
    setRound(0);
    setPicked(null);
    setAnswers([]);
  };

  if (finished && picked === null) {
    const verdict = score === 5 ? 'Five from five. You are now the person who ruins charts at parties.'
      : score >= 4 ? 'Four from five. You will catch almost everything that matters.'
      : score >= 3 ? 'Three from five. Solid instincts, worth a second run.'
      : score >= 1 ? 'Below half. The tricks work — that is rather the point of them.'
      : 'Nothing right, which means every trick landed. Worth going round again.';
    return (
      <div className={`rounded-md border p-4 ${bg}`}>
        <div className={`text-2xl font-bold ${score >= 4 ? 'text-emerald-500' : score >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
          {score} / {ROUNDS.length}
        </div>
        <p className={`text-sm mt-1 ${text}`}>{verdict}</p>
        <ol className="mt-3 space-y-1">
          {ROUNDS.map((r, i) => {
            const right = answers[i] === r.id;
            return (
              <li key={r.id} className={`text-xs flex items-start gap-2 ${muted}`}>
                <span className={right ? 'text-emerald-500' : 'text-red-500'}>{right ? '✓' : '✗'}</span>
                <span>
                  <span className={text}>{OPTIONS.find(o => o.id === r.id)?.label}</span>
                  {!right && answers[i] && ` — you said "${OPTIONS.find(o => o.id === answers[i])?.label}"`}
                </span>
              </li>
            );
          })}
        </ol>
        <button
          onClick={restart}
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-4"
        >
          Play again
        </button>
      </div>
    );
  }

  const correct = picked === current.id;

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] uppercase tracking-wider ${muted}`}>
          Round {round + 1} of {ROUNDS.length}
        </span>
        <span className={`text-[11px] tabular-nums ${muted}`}>
          Score {score} / {answers.length}
        </span>
      </div>

      <div className={`rounded-md border p-3 ${panel}`}>
        <h4 className={`text-sm font-semibold mb-1 ${text}`}>{current.headline}</h4>
        <p className={`text-[11px] mb-3 ${muted}`}>{current.caption}</p>
        {current.render({ isDarkMode, grid, muted, text })}
      </div>

      <div className={`text-xs mt-3 mb-2 ${text}`}>What is wrong with this chart?</div>
      <div className="space-y-1.5">
        {OPTIONS.map(o => {
          const isAnswer = o.id === current.id;
          const isPicked = o.id === picked;
          const state = picked === null
            ? isDarkMode ? 'border-gray-600 hover:border-gray-400 text-gray-300' : 'border-gray-300 hover:border-gray-500 text-gray-700'
            : isAnswer
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
              : isPicked
                ? 'border-red-500 bg-red-500/10 text-red-500'
                : isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400';
          return (
            <button
              key={o.id}
              onClick={() => submit(o.id)}
              disabled={picked !== null}
              className={`w-full text-left text-xs px-3 py-2 rounded-md border transition-colors ${state}`}
            >
              {picked !== null && isAnswer ? '✓ ' : picked !== null && isPicked ? '✗ ' : ''}
              {o.label}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className={`mt-3 rounded-md border p-3 text-xs ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-amber-50 border-amber-100 text-gray-700'}`}>
          <div className={`font-semibold mb-1 ${correct ? 'text-emerald-500' : 'text-red-500'}`}>
            {correct ? 'Correct.' : 'Not quite.'}
          </div>
          <p>{current.explanation}</p>
          <button
            onClick={round < ROUNDS.length - 1 ? next : () => setPicked(null)}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-3"
          >
            {round < ROUNDS.length - 1 ? 'Next chart →' : 'See your score →'}
          </button>
        </div>
      )}

      <p className={`text-xs mt-3 ${muted}`}>
        Every chart here is drawn from real-looking but invented numbers. The tricks are not: each of
        the five turns up in published journalism and in company results presentations constantly,
        usually without anybody intending to deceive.
      </p>
    </div>
  );
}
