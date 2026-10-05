'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';
import { CURRENT_YEAR, PREV_YEAR, lastYearOf, mean, pct, outlookTheme, type OutlookSeries } from '../lib/outlook';
import { GLOBAL_OUTLOOK_SUMMARY, RISKS, type OutlookRisk, type RiskLevel } from '../data/imfProjections';

const IsoFlag = dynamic(() => import('./IsoFlag'), {
  ssr: false,
  loading: () => <span className="inline-block w-5 h-3.5 rounded-sm bg-gray-200 dark:bg-gray-700" aria-hidden="true" />,
});

const TITLE = 'Risks & Uncertainties';
const LEVELS: Record<RiskLevel, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
const score = (r: OutlookRisk) => r.likelihood * r.impact;

const LABELLED = (() => {
  const counters = { downside: 0, upside: 0 };
  return RISKS.map(r => ({ ...r, tag: `${r.type === 'downside' ? 'D' : 'U'}${++counters[r.type]}` }));
})();
type LabelledRisk = (typeof LABELLED)[number];

interface Props {
  isDarkMode: boolean;
  series: OutlookSeries;
}

export default function OutlookRisks({ isDarkMode, series }: Props) {
  const t = outlookTheme(isDarkMode);
  const [focused, setFocused] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'downside' | 'upside'>('all');

  const baseline = useMemo(() => {
    const g = (key: string, y = CURRENT_YEAR) => series.gdp.get(key)?.[y] ?? null;
    const inf = (key: string, y = CURRENT_YEAR) => series.inflation.get(key)?.[y] ?? null;
    const last = lastYearOf(series.gdp.get('ADVEC')) ?? CURRENT_YEAR + 5;
    const lastInf = lastYearOf(series.inflation.get('ADVEC')) ?? last;
    const notes: Record<string, string | null> = {
      trade: g('Mexico') != null && g('Canada') != null
        ? `IMF baseline for ${CURRENT_YEAR}: Mexico ${pct(g('Mexico'))}, Canada ${pct(g('Canada'))} growth.`
        : null,
      geopolitics: `Baseline oil price assumption: about $${GLOBAL_OUTLOOK_SUMMARY.oilPrice.value} a barrel.`,
      markets: g('USA') != null ? `IMF baseline US growth in ${CURRENT_YEAR}: ${pct(g('USA'))}.` : null,
      inflation: inf('ADVEC') != null
        ? `Advanced-economy inflation is projected at ${pct(inf('ADVEC'))} in ${CURRENT_YEAR}, against the 2% most central banks target.`
        : null,
      china: g('China', PREV_YEAR) != null && g('China') != null
        ? `IMF sees China's growth at ${pct(g('China', PREV_YEAR))} in ${PREV_YEAR}, ${pct(g('China'))} in ${CURRENT_YEAR}${g('China', last) != null ? ` and ${pct(g('China', last))} by ${last}` : ''}.`
        : null,
      fiscal: null,
      ai: (() => {
        const m = mean(series.gdp.get('ADVEC'), CURRENT_YEAR + 1, last);
        return m != null ? `The baseline has advanced economies growing ${pct(m)} a year in ${CURRENT_YEAR + 1}–${last}; faster productivity would lift that.` : null;
      })(),
      'trade-deals': g('WEOWORLD') != null ? `IMF baseline world growth in ${CURRENT_YEAR}: ${pct(g('WEOWORLD'))}.` : null,
      disinflation: inf('ADVEC', lastInf) != null && inf('OEMDC', lastInf) != null
        ? `The baseline already has inflation easing to ${pct(inf('ADVEC', lastInf))} in advanced and ${pct(inf('OEMDC', lastInf))} in emerging economies by ${lastInf}.`
        : null,
      green: null,
    };
    return notes;
  }, [series]);

  const balance = useMemo(() => {
    const down = LABELLED.filter(r => r.type === 'downside');
    const up = LABELLED.filter(r => r.type === 'upside');
    const downWeight = down.reduce((s, r) => s + score(r), 0);
    const upWeight = up.reduce((s, r) => s + score(r), 0);
    const ranked = [...LABELLED].sort((a, b) => score(b) - score(a) || a.type.localeCompare(b.type));
    return { down, up, downWeight, upWeight, downShare: downWeight / (downWeight + upWeight), top: ranked[0], ranked };
  }, []);

  const visible = filter === 'all' ? LABELLED : LABELLED.filter(r => r.type === filter);

  const focus = (id: string) => {
    setFocused(id);
    if (filter !== 'all' && LABELLED.find(r => r.id === id)?.type !== filter) setFilter('all');
    requestAnimationFrame(() => document.getElementById(`risk-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  const chip = (r: LabelledRisk, size: 'sm' | 'md' = 'md') => (
    <button
      key={r.id}
      type="button"
      onClick={() => focus(r.id)}
      onMouseEnter={() => setFocused(r.id)}
      onMouseLeave={() => setFocused(null)}
      title={r.title}
      className={`inline-flex items-center justify-center rounded-full font-semibold tabular-nums text-white transition-transform ${
        size === 'md' ? 'h-7 min-w-7 px-1.5 text-[11px]' : 'h-5 min-w-5 px-1 text-[10px]'
      } ${r.type === 'downside' ? 'bg-red-500' : 'bg-green-500'} ${focused === r.id ? 'scale-110 ring-2 ring-offset-1 ring-blue-400' : ''}`}
    >
      {r.tag}
    </button>
  );

  const levelPill = (label: string, level: RiskLevel, type: OutlookRisk['type']) => {
    const strong = type === 'downside'
      ? ['', 'bg-red-500/10 text-red-500', 'bg-red-500/20 text-red-500', 'bg-red-500 text-white']
      : ['', 'bg-green-500/10 text-green-600', 'bg-green-500/20 text-green-600', 'bg-green-500 text-white'];
    return (
      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${strong[level]}`}>
        {label}: {LEVELS[level]}
      </span>
    );
  };

  const filterClass = (active: boolean) => `px-3 py-1 ${active ? 'bg-blue-500/20 text-blue-500' : t.textSec}`;

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <h2 className="text-xl font-semibold">{TITLE}</h2>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className={`inline-flex rounded border overflow-hidden text-xs ${t.toggleBorder}`} data-share-exclude>
            <button type="button" onClick={() => setFilter('all')} className={filterClass(filter === 'all')}>All ({LABELLED.length})</button>
            <button type="button" onClick={() => setFilter('downside')} className={filterClass(filter === 'downside')}>Downside ({balance.down.length})</button>
            <button type="button" onClick={() => setFilter('upside')} className={filterClass(filter === 'upside')}>Upside ({balance.up.length})</button>
          </div>
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-sm mb-5 ${t.textSec}`}>
        What could push growth and inflation away from the IMF&apos;s central forecast, how likely each risk is, how much it
        would matter, and where it would bite hardest.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className={`lg:col-span-3 rounded-lg border p-4 ${t.subtle}`}>
          <p className="text-sm font-semibold mb-3">Risk matrix</p>
          <div className="flex gap-2">
            <p className={`text-[10px] text-center pb-5 ${t.textSec}`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Impact on the outlook →
            </p>
            <div className="flex-1">
              <div className="grid grid-cols-[3.5rem_repeat(3,1fr)] gap-1">
                {([3, 2, 1] as RiskLevel[]).map(impact => (
                  <div key={impact} className="contents">
                    <div className={`flex items-center text-[11px] ${t.textSec}`}>{LEVELS[impact]}</div>
                    {([1, 2, 3] as RiskLevel[]).map(likelihood => {
                      const cell = LABELLED.filter(r => r.impact === impact && r.likelihood === likelihood);
                      const heat = impact * likelihood;
                      const bg = heat >= 6
                        ? (isDarkMode ? 'bg-red-500/15' : 'bg-red-50')
                        : heat >= 3
                          ? (isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50')
                          : (isDarkMode ? 'bg-gray-700/40' : 'bg-white');
                      return (
                        <div key={likelihood} className={`min-h-[64px] lg:min-h-[88px] rounded border ${t.border} ${bg} p-1.5 flex flex-wrap content-center justify-center gap-1`}>
                          {cell.map(r => chip(r))}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div />
                {([1, 2, 3] as RiskLevel[]).map(l => (
                  <div key={l} className={`text-center text-[11px] ${t.textSec}`}>{LEVELS[l]}</div>
                ))}
              </div>
              <p className={`text-center text-[10px] mt-1 ${t.textSec}`}>Likelihood over the forecast horizon →</p>
            </div>
          </div>
          <p className={`text-[11px] mt-3 ${t.textSec}`}>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 align-middle mr-1" />Downside
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 align-middle ml-3 mr-1" />Upside
            <span className="ml-3">Hover or click a marker to find the risk below.</span>
          </p>
        </div>

        <div className={`lg:col-span-2 rounded-lg border p-4 flex flex-col ${t.subtle}`}>
          <p className="text-sm font-semibold mb-1">Balance of risks</p>
          <p className="text-2xl font-bold">{balance.downShare >= 0.55 ? 'Tilted to the downside' : balance.downShare <= 0.45 ? 'Tilted to the upside' : 'Broadly balanced'}</p>
          <div className="mt-3">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-red-500" style={{ width: `${balance.downShare * 100}%` }} />
              <div className="bg-green-500 flex-1" />
            </div>
            <div className="flex justify-between text-[11px] mt-1 tabular-nums">
              <span className="text-red-500">Downside {Math.round(balance.downShare * 100)}%</span>
              <span className="text-green-500">Upside {Math.round((1 - balance.downShare) * 100)}%</span>
            </div>
          </div>
          <p className={`text-xs mt-3 leading-relaxed ${t.textSec}`}>
            Each risk is weighted by likelihood × impact. {balance.down.length} downside risks carry a combined weight of{' '}
            {balance.downWeight}, against {balance.upWeight} for {balance.up.length} upside risks. The single biggest is{' '}
            <button type="button" onClick={() => focus(balance.top.id)} className="font-medium text-blue-500 hover:underline">
              {balance.top.title.toLowerCase()}
            </button>
            , rated {LEVELS[balance.top.likelihood].toLowerCase()} likelihood and {LEVELS[balance.top.impact].toLowerCase()} impact.
          </p>
          <p className={`text-[10px] uppercase tracking-wide mt-4 mb-1.5 ${t.textSec}`}>Heaviest risks</p>
          <ol className="space-y-1.5">
            {balance.ranked.slice(0, 5).map(r => (
              <li key={r.id} className="flex items-center gap-2 text-xs">
                {chip(r, 'sm')}
                <span className="flex-1 truncate" title={r.title}>{r.title}</span>
                <span className="flex gap-0.5" aria-label={`Weight ${score(r)} of 9`} title={`Weight ${score(r)} of 9`}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-3 rounded-sm ${i < score(r) ? (r.type === 'downside' ? 'bg-red-500' : 'bg-green-500') : (isDarkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-auto pt-3 grid grid-cols-2 gap-2 text-xs">
            {(['downside', 'upside'] as const).map(type => {
              const list = type === 'downside' ? balance.down : balance.up;
              const near = list.filter(r => r.horizon !== 'Medium term').length;
              return (
                <div key={type} className={`rounded border p-2 ${t.border}`}>
                  <p className={`font-semibold ${type === 'downside' ? 'text-red-500' : 'text-green-500'}`}>
                    {type === 'downside' ? 'Downside' : 'Upside'}
                  </p>
                  <p className={t.textSec}>{near} near-term, {list.length - near} medium-term</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['downside', 'upside'] as const)
          .filter(type => filter === 'all' || filter === type)
          .map(type => {
            const list = visible.filter(r => r.type === type);
            return (
              <div key={type} className={filter !== 'all' ? 'md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 content-start' : 'space-y-3'}>
                <h3 className={`text-sm font-semibold ${filter !== 'all' ? 'md:col-span-2' : 'mb-3'} ${type === 'downside' ? 'text-red-500' : 'text-green-500'}`}>
                  {type === 'downside' ? 'Downside risks' : 'Upside risks'}
                </h3>
                {list.map(r => {
                  const note = baseline[r.id];
                  return (
                    <div
                      key={r.id}
                      id={`risk-${r.id}`}
                      onMouseEnter={() => setFocused(r.id)}
                      onMouseLeave={() => setFocused(null)}
                      className={`rounded-lg border p-3 transition-shadow ${
                        type === 'downside'
                          ? (isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                          : (isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200')
                      } ${focused === r.id ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {chip(r, 'sm')}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{r.title}</p>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {levelPill('Likelihood', r.likelihood, r.type)}
                            {levelPill('Impact', r.impact, r.type)}
                            <span className={`text-[10px] ${t.textSec}`}>· {r.horizon}</span>
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm mt-2 ${t.textSec}`}>{r.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
                        <div>
                          <p className={`text-[10px] uppercase tracking-wide mb-1 ${t.textSec}`}>How it spreads</p>
                          <div className="flex flex-wrap gap-1">
                            {r.channels.map(c => (
                              <span key={c} className={`rounded px-1.5 py-0.5 text-[11px] ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700 border border-gray-200'}`}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-wide mb-1 ${t.textSec}`}>
                            {type === 'downside' ? 'Most exposed' : 'Best placed'}
                          </p>
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {r.exposed.map(e => (
                              <span key={e.iso2} className="inline-flex items-center gap-1 text-[11px]">
                                <IsoFlag iso2={e.iso2} title={e.name} className="w-4 h-3 shrink-0" />
                                {e.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <p className={`text-[10px] uppercase tracking-wide mb-1 ${t.textSec}`}>What to watch</p>
                          <p className="text-[11px]">{r.watch.join(' · ')}</p>
                        </div>
                      </div>

                      {note && (
                        <p className={`text-[11px] mt-3 pt-2 border-t ${type === 'downside' ? 'border-red-500/20' : 'border-green-500/20'} ${t.textSec}`}>
                          <span className="font-medium">In the numbers:</span> {note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      <p className={`text-[11px] mt-5 ${t.textSec}`}>
        Likelihood and impact ratings are this site&apos;s editorial judgement, informed by the risks discussed in the IMF World
        Economic Outlook and other official forecasts. They are not IMF ratings. &ldquo;In the numbers&rdquo; figures come from
        the live IMF WEO projections shown elsewhere on this page.
      </p>
    </div>
  );
}
