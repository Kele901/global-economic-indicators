'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, Cell,
} from 'recharts';
import {
  GREAT_SURGES, CAPITAL_FLOW_PHASES, ADOPTION_CURVES, FINANCIAL_BUBBLES,
  KONDRATIEV_WAVES, ACADEMIC_SOURCES, SURGE_COLORS, INEQUALITY_DATA,
  CONTEMPORARY_PARALLELS, PHASE_DESCRIPTIONS, EXTENDED_QUOTES,
  type GreatSurge,
} from '../data/techCapitalCyclesData';

type SubView = 'surges' | 'capital' | 'adoption' | 'bubbles' | 'kondratiev' | 'societal' | 'contemporary';

interface Props {
  isDarkMode: boolean;
}

const SUB_VIEWS: { id: SubView; label: string; desc: string }[] = [
  { id: 'surges', label: 'Surges Timeline', desc: 'The five great surges of technological revolution' },
  { id: 'capital', label: 'Capital Dynamics', desc: 'Financial vs production capital across surges' },
  { id: 'adoption', label: 'Adoption S-Curves', desc: 'How technologies diffuse through society' },
  { id: 'bubbles', label: 'Bubbles & Crashes', desc: 'The recurring pattern of speculative excess' },
  { id: 'kondratiev', label: 'Kondratiev Waves', desc: '250 years of long economic cycles' },
  { id: 'societal', label: 'Societal Impact', desc: 'Inequality, institutions, and paradigm shifts' },
  { id: 'contemporary', label: 'Where Are We Now?', desc: 'Today\'s parallels to historical patterns' },
];

const TechCapitalCyclesChart: React.FC<Props> = ({ isDarkMode }) => {
  const [subView, setSubView] = useState<SubView>('surges');
  const [selectedSurge, setSelectedSurge] = useState<number | null>(null);
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const [expandedParallel, setExpandedParallel] = useState<number | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const tc = useMemo(() => ({
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    cardHover: isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSec: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTer: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    axis: isDarkMode ? '#6b7280' : '#9ca3af',
    tooltip: { backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, color: isDarkMode ? '#fff' : '#111827' },
    tab: isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900',
    tabActive: isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow',
    surgeBtn: isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    surgeBtnActive: 'ring-2 ring-blue-500',
    infoBg: isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50',
    quoteBg: isDarkMode ? 'bg-indigo-900/20 border-indigo-700/30' : 'bg-indigo-50 border-indigo-100',
    warnBg: isDarkMode ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200',
    successBg: isDarkMode ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  }), [isDarkMode]);

  const viewQuotes = useMemo(() => EXTENDED_QUOTES.filter(q => q.relevantView === subView), [subView]);

  // ── Surges Timeline data ──
  const surgesTimelineData = useMemo(() => {
    const points: { year: number; [key: string]: number }[] = [];
    GREAT_SURGES.forEach(surge => {
      const installEnd = surge.turningPointYear;
      for (let y = surge.startYear; y <= Math.min(surge.endYear, 2025); y += 5) {
        const existing = points.find(p => p.year === y);
        let installVal = 0;
        let deployVal = 0;
        if (y <= installEnd) {
          const t = (y - surge.startYear) / (installEnd - surge.startYear);
          installVal = Math.sin(t * Math.PI) * 80 + 20;
        }
        if (y >= installEnd) {
          const t = (y - installEnd) / (Math.min(surge.endYear, 2025) - installEnd);
          deployVal = Math.sin(t * Math.PI) * 70 + 30;
        }
        if (existing) {
          existing[`s${surge.id}_install`] = installVal;
          existing[`s${surge.id}_deploy`] = deployVal;
        } else {
          const p: any = { year: y };
          p[`s${surge.id}_install`] = installVal;
          p[`s${surge.id}_deploy`] = deployVal;
          points.push(p);
        }
      }
    });
    return points.sort((a, b) => a.year - b.year);
  }, []);

  const capitalData = useMemo(() => {
    if (selectedSurge) return CAPITAL_FLOW_PHASES.filter(p => p.surgeId === selectedSurge);
    return CAPITAL_FLOW_PHASES;
  }, [selectedSurge]);

  const adoptionData = useMemo(() => {
    const curves = selectedSurge ? ADOPTION_CURVES.filter(c => c.surgeId === selectedSurge) : ADOPTION_CURVES;
    const yearMap = new Map<number, Record<string, number>>();
    curves.forEach(curve => {
      curve.data.forEach(d => {
        if (!yearMap.has(d.year)) yearMap.set(d.year, { year: d.year });
        yearMap.get(d.year)![curve.technology] = d.adoptionPct;
      });
    });
    return { lines: curves, data: Array.from(yearMap.values()).sort((a, b) => a.year - b.year) };
  }, [selectedSurge]);

  const bubblesData = useMemo(() => {
    const items = selectedSurge ? FINANCIAL_BUBBLES.filter(b => b.surgeId === selectedSurge) : FINANCIAL_BUBBLES;
    return items.map(b => ({
      ...b,
      label: b.name,
      decline: b.declinePct,
      recovery: b.recoveryYear - b.crashYear,
      surgeName: GREAT_SURGES.find(s => s.id === b.surgeId)?.name || '',
    }));
  }, [selectedSurge]);

  const kondratievData = useMemo(() => {
    return KONDRATIEV_WAVES.map(w => ({
      ...w,
      label: `${w.decade}s`,
      upswing: w.phase === 'upswing' ? w.growthRate : 0,
      downswing: w.phase === 'downswing' ? w.growthRate : 0,
    }));
  }, []);

  const inequalityData = useMemo(() => {
    if (selectedSurge) return INEQUALITY_DATA.filter(d => d.surgeId === selectedSurge);
    return INEQUALITY_DATA;
  }, [selectedSurge]);

  // ── SHARED UI ──

  const renderQuoteBlock = (quote: string, author: string, source: string, year: number) => (
    <div className={`rounded-xl border p-4 ${tc.quoteBg}`}>
      <blockquote className={`text-sm italic leading-relaxed ${tc.textTer}`}>
        &quot;{quote}&quot;
      </blockquote>
      <div className={`text-xs mt-2 ${tc.textSec}`}>
        &mdash; {author}, <em>{source}</em> ({year})
      </div>
    </div>
  );

  const renderSurgeSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setSelectedSurge(null)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedSurge ? tc.tabActive : tc.surgeBtn}`}
      >
        All Surges
      </button>
      {GREAT_SURGES.map(s => (
        <button
          key={s.id}
          onClick={() => setSelectedSurge(selectedSurge === s.id ? null : s.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedSurge === s.id ? tc.surgeBtnActive + ' ' + tc.surgeBtn : tc.surgeBtn}`}
          style={selectedSurge === s.id ? { borderColor: s.color } : undefined}
        >
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: s.color }} />
          {s.id}{getSurgeOrdinal(s.id)} Surge
        </button>
      ))}
    </div>
  );

  const renderSurgeCard = (surge: GreatSurge) => (
    <div key={surge.id} className={`rounded-xl border p-5 ${tc.card}`} style={{ borderLeft: `4px solid ${surge.color}` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className={`font-bold text-base ${tc.text}`}>{surge.name}</h4>
          <span className={`text-xs ${tc.textSec}`}>{surge.period}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: surge.color + '20', color: surge.color }}>
          Surge {surge.id}
        </span>
      </div>
      <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>{surge.description}</p>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
          <div className={`font-medium mb-0.5 ${tc.textSec}`}>Big Bang Event</div>
          <div className={`font-medium ${tc.text}`}>{surge.bigBang}</div>
          <div className={tc.textSec}>{surge.bigBangYear}</div>
        </div>
        <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
          <div className={`font-medium mb-0.5 ${tc.textSec}`}>Turning Point / Crash</div>
          <div className={`font-medium ${tc.text}`}>{surge.turningPoint}</div>
          <div className={tc.textSec}>{surge.turningPointYear}</div>
        </div>
        <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
          <div className={`font-medium mb-0.5 ${tc.textSec}`}>Installation Period</div>
          <div className={tc.text}>{surge.installationPeriod}</div>
        </div>
        <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
          <div className={`font-medium mb-0.5 ${tc.textSec}`}>Deployment Period</div>
          <div className={tc.text}>{surge.deploymentPeriod}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className={`text-xs font-semibold ${tc.textSec} mb-1.5`}>Key Technologies</div>
        <div className="flex flex-wrap gap-1">
          {surge.keyTechnologies.map(t => (
            <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${tc.infoBg} ${tc.text}`}>{t}</span>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className={`text-xs font-semibold ${tc.textSec} mb-1.5`}>Key Financial Events</div>
        <div className="flex flex-wrap gap-1">
          {surge.keyFinancialEvents.map(e => (
            <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">{e}</span>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className={`text-xs font-semibold ${tc.textSec} mb-1`}>Key Figures</div>
        <div className="space-y-1.5">
          {surge.keyFigures.map(f => (
            <div key={f.name} className={`text-xs ${tc.textTer}`}>
              <strong className={tc.text}>{f.name}</strong> ({f.role}) &mdash; {f.contribution}
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-lg p-3 ${tc.successBg} border`}>
        <div className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Golden Age</div>
        <p className={`text-xs leading-relaxed ${tc.textTer}`}>{surge.goldenAge}</p>
      </div>
    </div>
  );

  // ── SURGES TIMELINE VIEW ──
  const renderSurgesTimeline = () => {
    const displaySurges = selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES;
    return (
      <div className="space-y-6">
        {/* Phase model explainer */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>The Perez Phase Model</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            Carlota Perez argues every technological revolution follows a recurring five-phase pattern.
            The revolution is divided into two broad periods: <strong>Installation</strong> (led by financial capital
            and speculation) and <strong>Deployment</strong> (led by production capital and institutional frameworks).
            Between them lies the <strong>Turning Point</strong> &mdash; a crash that forces society to choose between
            institutional reform and stagnation. Understanding where we are in this cycle is key to
            interpreting current events.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(['irruption', 'frenzy', 'turning', 'synergy', 'maturity'] as const).map(phase => {
              const desc = PHASE_DESCRIPTIONS[phase];
              const isExpanded = expandedPhase === phase;
              return (
                <div
                  key={phase}
                  onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                  className={`rounded-lg border p-3 cursor-pointer transition-all ${tc.card} ${tc.cardHover} ${isExpanded ? tc.surgeBtnActive : ''}`}
                >
                  <div className="text-xl mb-1">{desc.icon}</div>
                  <div className={`font-bold text-sm ${tc.text}`}>{desc.title}</div>
                  <div className={`text-xs mt-1 ${tc.textSec}`}>{desc.mood}</div>
                  {isExpanded && (
                    <div className={`mt-2 pt-2 border-t ${tc.border} space-y-2`}>
                      <p className={`text-xs leading-relaxed ${tc.textTer}`}>{desc.description}</p>
                      <div className={`text-xs ${tc.textSec}`}>
                        <strong>Capital type:</strong> {desc.capitalType}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase flow diagram */}
        <div className={`rounded-xl border p-4 ${tc.card}`}>
          <div className="flex items-center justify-center gap-1 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">Irruption</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className="px-3 py-1.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 font-medium">Frenzy</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className="px-3 py-1.5 rounded bg-gray-500/20 text-gray-600 dark:text-gray-300 font-bold border-2 border-dashed border-red-400">TURNING POINT</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className="px-3 py-1.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 font-medium">Synergy</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className="px-3 py-1.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">Maturity</span>
          </div>
          <div className="flex justify-center gap-8 mt-2 text-xs">
            <span className="text-amber-500 font-medium">&larr; Installation Period (Financial Capital) &rarr;</span>
            <span className="text-green-500 font-medium">&larr; Deployment Period (Production Capital) &rarr;</span>
          </div>
        </div>

        {/* Timeline chart */}
        <div className={`rounded-xl border p-4 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-3 ${tc.text}`}>The Five Great Surges (1771&ndash;Present)</h3>
          <p className={`text-sm mb-4 ${tc.textTer}`}>
            Each coloured band represents a technological surge. Warm colours show the Installation
            period (financial capital leads), cool colours show the Deployment period (production capital
            leads). Red dashed lines mark the Turning Points &mdash; the bubble crashes that separate them.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={surgesTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} label={{ value: 'Intensity', angle: -90, position: 'insideLeft', style: { fill: tc.axis, fontSize: 11 } }} />
              <Tooltip contentStyle={tc.tooltip} />
              {displaySurges.map(s => (
                <React.Fragment key={s.id}>
                  <Area type="monotone" dataKey={`s${s.id}_install`} name={`${s.name} (Installation)`} stroke={SURGE_COLORS[s.id].installation} fill={SURGE_COLORS[s.id].installation} fillOpacity={0.15} strokeWidth={2} connectNulls dot={false} />
                  <Area type="monotone" dataKey={`s${s.id}_deploy`} name={`${s.name} (Deployment)`} stroke={SURGE_COLORS[s.id].deployment} fill={SURGE_COLORS[s.id].deployment} fillOpacity={0.15} strokeWidth={2} connectNulls dot={false} />
                </React.Fragment>
              ))}
              {displaySurges.map(s => (
                <ReferenceLine key={`tp-${s.id}`} x={s.turningPointYear} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: s.turningPointYear.toString(), position: 'top', fill: isDarkMode ? '#f87171' : '#dc2626', fontSize: 10 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Surge detail cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displaySurges.map(renderSurgeCard)}
        </div>

        {/* Contextual quotes */}
        {viewQuotes.map((q, i) => (
          <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>
        ))}
      </div>
    );
  };

  // ── CAPITAL DYNAMICS VIEW ──
  const renderCapitalDynamics = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Financial Capital vs Production Capital</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          This is the core dynamic of Perez&apos;s framework. During each surge&apos;s <strong>Installation</strong> period,
          <em> financial capital</em> dominates &mdash; venture funding, speculation, IPOs, and asset bubbles.
          Money flows toward the new technology not because investors understand it, but because they
          see others making money. This creates a self-reinforcing cycle of speculation.
        </p>
        <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
          After the <strong>Turning Point</strong> crash, <em>production capital</em> takes over &mdash; retained
          earnings, institutional investment, and government spending. The infrastructure installed
          during the bubble (at speculators&apos; expense) becomes available cheaply, enabling broad
          deployment. The question for each surge is whether institutional reform after the crash
          is sufficient to channel the technology toward broadly shared prosperity.
        </p>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={capitalData}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
            <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
            <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: '% of Capital Dominance', angle: -90, position: 'insideLeft', style: { fill: tc.axis, fontSize: 10 } }} />
            <Tooltip contentStyle={tc.tooltip} formatter={(val: number) => `${val}%`} />
            <Legend />
            <Area type="monotone" dataKey="financialCapital" name="Financial Capital" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
            <Area type="monotone" dataKey="productionCapital" name="Production Capital" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
            {(selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES).map(s => (
              <ReferenceLine key={`tp-${s.id}`} x={s.turningPointYear} stroke={isDarkMode ? '#fbbf24' : '#d97706'} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: `TP ${s.turningPointYear}`, position: 'top', fill: isDarkMode ? '#fbbf24' : '#d97706', fontSize: 9 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Financial Capital (speculation, VC, asset prices)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Production Capital (infrastructure, institutional investment)</span>
          <span className="text-amber-500">Amber lines = Turning Points</span>
        </div>
      </div>

      {/* Minsky connection */}
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>The Minsky Connection: Why Bubbles Are Inevitable</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Hyman Minsky&apos;s Financial Instability Hypothesis explains <em>why</em> the frenzy phase
          always produces a bubble. During stable periods, financial actors gradually shift from
          <strong> hedge finance</strong> (where income covers all debt payments) to <strong>speculative
          finance</strong> (where income covers interest but not principal) to <strong>Ponzi
          finance</strong> (where income covers neither &mdash; returns depend entirely on asset price
          appreciation). This progression is not irrational; it is the natural consequence of
          sustained stability encouraging risk-taking. When applied to Perez&apos;s framework, Minsky
          explains why every installation period produces financial excess: the very success of the
          new technology validates increasingly risky bets.
        </p>
      </div>

      {viewQuotes.map((q, i) => (
        <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>
      ))}
    </div>
  );

  // ── ADOPTION S-CURVES VIEW ──
  const renderAdoptionCurves = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Technology Adoption S-Curves</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          Every major technology follows a logistic S-curve of adoption: slow initial uptake,
          rapid acceleration, then saturation. This pattern is remarkably consistent across 250
          years, from canals to AI. Financial bubbles consistently occur during the steep middle
          section of the curve &mdash; when the technology&apos;s transformative potential is visible but
          full deployment hasn&apos;t been achieved.
        </p>
        <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
          Note the <strong>acceleration of adoption speed</strong>: canals took ~60 years to reach 80%
          adoption; railways ~40 years; electricity ~40 years; television ~15 years; the internet
          ~15 years; smartphones ~10 years. Each successive technology diffuses faster because it
          builds on the infrastructure and institutional learning of previous surges.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={adoptionData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
            <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} type="number" domain={['dataMin', 'dataMax']} />
            <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: 'Adoption %', angle: -90, position: 'insideLeft', style: { fill: tc.axis, fontSize: 11 } }} />
            <Tooltip contentStyle={tc.tooltip} formatter={(val: number) => `${val}%`} />
            <Legend />
            {adoptionData.lines.map(curve => (
              <Line key={curve.technology} type="monotone" dataKey={curve.technology} stroke={curve.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
            {FINANCIAL_BUBBLES.filter(b => !selectedSurge || b.surgeId === selectedSurge).map(b => (
              <ReferenceLine key={`crash-${b.name}`} x={b.crashYear} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="3 3" strokeWidth={1} label={{ value: b.name.split(' ')[0], position: 'top', fill: isDarkMode ? '#f87171' : '#dc2626', fontSize: 9 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className={`text-xs mt-2 ${tc.textSec}`}>
          Red dashed lines mark bubble crash years. Crashes consistently occur during the steep
          adoption phase &mdash; the moment of maximum excitement and maximum uncertainty.
        </div>
      </div>

      {/* Janeway's insight about infrastructure survival */}
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>What Survives the Crash: Infrastructure, Not Fortunes</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          William Janeway (2012) makes a crucial observation: what dies in a financial crash is not
          the technology itself, but the particular pattern of its financing. The speculative
          capital that funded Railway Mania was destroyed, but the railways survived and became the
          backbone of the Victorian economy. The dot-com crash wiped out trillions in market
          capitalisation, but the fibre-optic cables, data centres, and software platforms it funded
          became the infrastructure for Web 2.0, cloud computing, and the mobile revolution. This is
          why Perez argues that bubbles, though painful, are <em>functional</em> to the process of
          technology diffusion: they mobilise the risk capital needed to build transformative
          infrastructure that cautious investors would never fund.
        </p>
      </div>

      {viewQuotes.map((q, i) => (
        <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>
      ))}
    </div>
  );

  // ── BUBBLES & CRASHES VIEW ──
  const renderBubbles = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Financial Bubbles Across Surges</h3>
        <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
          Every technological revolution produces a speculative bubble during its installation
          period. The pattern is strikingly consistent: new technology appears &rarr; early
          profits attract financial capital &rarr; speculation feeds on itself &rarr; asset
          prices decouple from fundamentals &rarr; crash. But Janeway (2012) argues these bubbles
          serve an <em>essential function</em>: they mobilise risk capital needed to build
          revolutionary infrastructure that cautious investors would never finance.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={bubblesData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
            <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: 'Peak-to-Trough Decline (%)', position: 'bottom', style: { fill: tc.axis, fontSize: 11 } }} />
            <YAxis type="category" dataKey="label" stroke={tc.axis} tick={{ fontSize: 11 }} width={130} />
            <Tooltip contentStyle={tc.tooltip} formatter={(val: number) => `${val}%`} />
            <Bar dataKey="decline" name="Market Decline %" radius={[0, 4, 4, 0]}>
              {bubblesData.map((b, i) => {
                const surge = GREAT_SURGES.find(s => s.id === b.surgeId);
                return <Cell key={i} fill={surge?.color || '#6b7280'} fillOpacity={0.8} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bubblesData.map(b => (
          <div key={b.name} className={`rounded-xl border p-5 ${tc.card}`}>
            <h4 className={`font-bold mb-1 ${tc.text}`}>{b.name}</h4>
            <span className={`text-xs ${tc.textSec}`}>{b.surgeName}</span>
            <p className={`text-sm mt-2 mb-4 leading-relaxed ${tc.textTer}`}>{b.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
                <div className="text-red-500 font-bold text-lg">-{b.decline}%</div>
                <div className={`text-xs ${tc.textSec}`}>Peak-to-Trough</div>
              </div>
              <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
                <div className={`font-bold text-lg ${tc.text}`}>{b.crashYear}</div>
                <div className={`text-xs ${tc.textSec}`}>Crash Year</div>
              </div>
              <div className={`rounded-lg p-2.5 ${tc.infoBg}`}>
                <div className="text-blue-500 font-bold text-lg">{b.recovery}yr</div>
                <div className={`text-xs ${tc.textSec}`}>To Recovery</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pattern recognition card */}
      <div className={`rounded-xl border p-5 ${tc.warnBg}`}>
        <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>The Recurring Pattern</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Notice the escalation: Canal Mania (-60%), Railway Mania (-67%), Roaring Twenties (-89%),
          Dot-com (-78%). Each bubble is larger in absolute terms because each successive paradigm
          operates at greater scale. Also notice recovery times: the 1929 crash took 25 years to recover
          (peak-to-peak) because the institutional response (New Deal) was delayed. The dot-com
          recovery was faster technologically but the associated 2008 crisis suggests the institutional
          reckoning was merely postponed, not avoided.
        </p>
      </div>

      {viewQuotes.map((q, i) => (
        <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>
      ))}
    </div>
  );

  // ── KONDRATIEV WAVES VIEW ──
  const renderKondratiev = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Kondratiev Long Waves (1780&ndash;2020s)</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          In 1925, Soviet economist Nikolai Kondratiev identified long economic cycles of approximately
          40&ndash;60 years. Each upswing is driven by a cluster of radical innovations; each downswing
          by the exhaustion of the prevailing techno-economic paradigm. Freeman &amp; Louçã (2001)
          mapped these waves to specific innovation clusters and institutional changes.
        </p>
        <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
          Perez refined this by showing how <em>financial capital mediates the transition</em> between
          waves. The upswing of a new wave overlaps with the downswing of the old one, creating a
          period of turbulence, inequality, and institutional crisis &mdash; precisely what we may be
          experiencing in the 2020s as the ICT paradigm matures and AI potentially launches a new wave.
        </p>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={kondratievData}>
            <defs>
              <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="innovGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
            <XAxis dataKey="decade" stroke={tc.axis} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="growth" stroke={tc.axis} tick={{ fontSize: 11 }} label={{ value: 'GDP Growth %', angle: -90, position: 'insideLeft', style: { fill: tc.axis, fontSize: 10 } }} />
            <YAxis yAxisId="innov" orientation="right" stroke={tc.axis} tick={{ fontSize: 11 }} label={{ value: 'Innovation Intensity', angle: 90, position: 'insideRight', style: { fill: tc.axis, fontSize: 10 } }} />
            <Tooltip contentStyle={tc.tooltip} />
            <Legend />
            <Area yAxisId="growth" type="monotone" dataKey="upswing" name="Upswing Growth" fill="url(#upGrad)" stroke="#10B981" strokeWidth={2} />
            <Area yAxisId="growth" type="monotone" dataKey="downswing" name="Downswing Growth" fill="url(#downGrad)" stroke="#EF4444" strokeWidth={2} />
            <Area yAxisId="innov" type="monotone" dataKey="innovationIntensity" name="Innovation Intensity" fill="url(#innovGrad)" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Upswing (expansion)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Downswing (contraction)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded border-2 border-purple-500 border-dashed inline-block" /> Innovation Intensity</span>
        </div>
      </div>

      {/* Wave summary table */}
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-3 ${tc.text}`}>Wave Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <th className={`px-3 py-2 text-left ${tc.textSec}`}>Wave</th>
                <th className={`px-3 py-2 text-left ${tc.textSec}`}>Period</th>
                <th className={`px-3 py-2 text-left ${tc.textSec}`}>Innovation Cluster</th>
                <th className={`px-3 py-2 text-left ${tc.textSec}`}>Energy Base</th>
                <th className={`px-3 py-2 text-left ${tc.textSec}`}>Peak Growth</th>
              </tr>
            </thead>
            <tbody>
              {['1st Wave: Cotton & Iron', '2nd Wave: Railways & Steam', '3rd Wave: Steel & Electricity', '4th Wave: Oil & Mass Production', '5th Wave: ICT & Digital'].map((name, i) => {
                const waveData = KONDRATIEV_WAVES.filter(w => w.waveName === name);
                const peakGrowth = Math.max(...waveData.map(w => w.growthRate));
                const startDecade = waveData[0]?.decade;
                const endDecade = waveData[waveData.length - 1]?.decade;
                const surge = GREAT_SURGES[i];
                return (
                  <tr key={name} className={`border-t ${tc.border}`}>
                    <td className={`px-3 py-2.5 font-medium ${tc.text}`}>
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: surge?.color }} />
                      {name}
                    </td>
                    <td className={`px-3 py-2.5 ${tc.textTer}`}>{startDecade}s&ndash;{endDecade}s</td>
                    <td className={`px-3 py-2.5 ${tc.textTer}`}>{surge?.keyTechnologies.slice(0, 3).join(', ')}</td>
                    <td className={`px-3 py-2.5 ${tc.textTer}`}>{surge?.paradigmShift.energySource}</td>
                    <td className={`px-3 py-2.5 font-medium text-green-500`}>{peakGrowth.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Freeman & Louçã contribution */}
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>Freeman &amp; Louçã: Techno-Economic Paradigm Shifts</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Freeman &amp; Louçã (2001) extended the Kondratiev framework by arguing that each long
          wave is not merely an economic cycle but a <strong>techno-economic paradigm shift</strong>.
          This means the transition requires not just new technology but a matching transformation
          of institutions, education, regulation, management practices, and social norms. When
          the institutional transformation lags behind the technological one, the result is the
          kind of social tension, inequality, and political upheaval characteristic of the
          installation/frenzy period. The golden age only begins when institutions catch up.
        </p>
      </div>

      {viewQuotes.map((q, i) => (
        <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>
      ))}
    </div>
  );

  // ── SOCIETAL IMPACT VIEW (NEW) ──
  const renderSocietalImpact = () => {
    const displaySurges = selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES;
    return (
      <div className="space-y-6">
        {/* Inequality chart */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Inequality Across Technological Revolutions</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            A striking pattern emerges when mapping wealth concentration against the Perez cycle:
            inequality rises sharply during <strong>Installation</strong> periods as financial capital
            concentrates, peaks at the <strong>Turning Point</strong>, and falls during <strong>Deployment</strong> as
            institutional reforms and broad-based growth distribute prosperity. The most dramatic
            example is the &quot;Great Compression&quot; of 1929&ndash;1970, when the top 10% income share fell
            from ~50% to ~33% &mdash; the deployment golden age of the 4th surge. The current 5th
            surge shows the <em>opposite</em> trajectory: inequality has risen back toward Gilded Age
            levels, suggesting the deployment&apos;s institutional reset has not yet occurred.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={inequalityData}>
              <defs>
                <linearGradient id="ineqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={[25, 55]} label={{ value: 'Top 10% Income Share (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axis, fontSize: 10 } }} />
              <Tooltip contentStyle={tc.tooltip} formatter={(val: number) => `${val}%`} />
              <Area type="monotone" dataKey="topSharePct" name="Top 10% Income Share" fill="url(#ineqGrad)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
              {(selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES).map(s => (
                <ReferenceLine key={`tp-${s.id}`} x={s.turningPointYear} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="4 3" strokeWidth={1} label={{ value: s.turningPointYear.toString(), position: 'top', fill: isDarkMode ? '#f87171' : '#dc2626', fontSize: 9 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <div className={`text-xs mt-2 ${tc.textSec}`}>
            Data inspired by Piketty, Saez &amp; Zucman. Red lines mark turning-point crashes.
            Note how inequality consistently peaks at or just before each crash.
          </div>
        </div>

        {/* Paradigm shift comparison */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-4 ${tc.text}`}>Techno-Economic Paradigm Shifts</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            Freeman &amp; Louçã argue that each revolution doesn&apos;t just change technology &mdash; it
            transforms the entire <em>techno-economic paradigm</em>: the energy source, transport
            infrastructure, communication medium, organisational form, and geographic scope all
            shift in concert. When institutions fail to adapt, the result is the social tension
            characteristic of installation periods.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <th className={`px-3 py-2 text-left ${tc.textSec}`}>Dimension</th>
                  {displaySurges.map(s => (
                    <th key={s.id} className={`px-3 py-2 text-left`} style={{ color: s.color }}>{s.id}{getSurgeOrdinal(s.id)} Surge</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Energy Source', key: 'energySource' as const },
                  { label: 'Transport', key: 'transportInfra' as const },
                  { label: 'Communication', key: 'communicationMedium' as const },
                  { label: 'Org. Form', key: 'organisationalForm' as const },
                  { label: 'Geographic Scope', key: 'geographicScope' as const },
                ].map(row => (
                  <tr key={row.key} className={`border-t ${tc.border}`}>
                    <td className={`px-3 py-2 font-medium ${tc.text}`}>{row.label}</td>
                    {displaySurges.map(s => (
                      <td key={s.id} className={`px-3 py-2 ${tc.textTer}`}>{s.paradigmShift[row.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Societal impact cards for each surge */}
        {displaySurges.map(surge => (
          <div key={surge.id} className={`rounded-xl border p-5 ${tc.card}`} style={{ borderLeft: `4px solid ${surge.color}` }}>
            <h4 className={`font-bold mb-3 ${tc.text}`}>{surge.name}: Societal Impact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Employment Transformation</div>
                <p className={`text-sm leading-relaxed ${tc.textTer}`}>{surge.societalImpact.employmentShift}</p>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Urbanisation &amp; Geography</div>
                <p className={`text-sm leading-relaxed ${tc.textTer}`}>{surge.societalImpact.urbanisation}</p>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Inequality Pattern</div>
                <p className={`text-sm leading-relaxed ${tc.textTer}`}>{surge.societalImpact.inequalityPattern}</p>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Living Standards</div>
                <p className={`text-sm leading-relaxed ${tc.textTer}`}>{surge.societalImpact.livingStandards}</p>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Cultural Change</div>
                <p className={`text-sm leading-relaxed ${tc.textTer}`}>{surge.societalImpact.culturalChange}</p>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Social Movements</div>
                <div className="flex flex-wrap gap-1">
                  {surge.societalImpact.socialMovements.map(m => (
                    <span key={m} className={`text-xs px-2 py-0.5 rounded-full ${tc.infoBg} ${tc.text}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Institutional response */}
            <div className={`mt-4 pt-4 border-t ${tc.border}`}>
              <h5 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Institutional Response (After the Turning Point)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Key Regulations</div>
                  <ul className={`text-xs list-disc list-inside space-y-0.5 ${tc.textTer}`}>
                    {surge.institutionalResponse.regulations.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
                <div>
                  <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>New Institutions</div>
                  <ul className={`text-xs list-disc list-inside space-y-0.5 ${tc.textTer}`}>
                    {surge.institutionalResponse.newInstitutions.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Financial Reforms</div>
                  <ul className={`text-xs list-disc list-inside space-y-0.5 ${tc.textTer}`}>
                    {surge.institutionalResponse.financialReforms.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              </div>
              <div className={`mt-3 rounded-lg p-3 ${tc.infoBg}`}>
                <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Landmark Legislation</div>
                <p className={`text-xs leading-relaxed ${tc.textTer}`}>{surge.institutionalResponse.keyLegislation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── CONTEMPORARY / "WHERE ARE WE NOW?" VIEW (NEW) ──
  const renderContemporary = () => {
    const surge5 = GREAT_SURGES[4];
    return (
      <div className="space-y-6">
        {/* Current position assessment */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Where Are We in the Cycle?</h3>
          <p className={`text-sm mb-3 leading-relaxed ${tc.textTer}`}>
            If Perez&apos;s framework is correct, the 5th surge (ICT/Digital) passed its <strong>Turning
            Point</strong> with the dot-com crash (2000&ndash;2002) and should now be in its <strong>Deployment</strong> period.
            But there&apos;s a critical debate: has the institutional reset that characterises a true
            deployment golden age actually occurred?
          </p>
          <p className={`text-sm mb-3 leading-relaxed ${tc.textTer}`}>
            After the 4th surge&apos;s crash (1929), the New Deal (1933&ndash;38) and Bretton Woods (1944)
            created a comprehensive institutional framework that channelled mass-production technology
            toward broadly shared prosperity for 30 years. After the 5th surge&apos;s dot-com crash,
            Sarbanes-Oxley (2002) and Dodd-Frank (2010) were partial responses, but nothing equivalent
            to the New Deal has emerged.
          </p>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            Perez argues this means we are in a <strong>&quot;frustrated deployment&quot;</strong> &mdash; the
            technological conditions for a golden age exist, but the institutional framework is
            misaligned. The 2008 financial crisis, rising inequality, populist politics, and the
            climate crisis all suggest unresolved tensions from an incomplete turning point. The
            emerging AI revolution and green transition may be catalysts for the institutional
            reform that&apos;s still needed.
          </p>
        </div>

        {/* Position indicator */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h4 className={`font-bold mb-3 ${tc.text}`}>5th Surge Phase Position</h4>
          <div className="flex items-center gap-1 flex-wrap text-xs mb-3">
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec} line-through`}>Irruption (1971&ndash;1990s)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec} line-through`}>Frenzy (1990s&ndash;2000)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec} line-through`}>Turning Point (2000&ndash;2002)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className="px-3 py-1.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 font-bold ring-2 ring-green-500">Synergy? (2002&ndash;present)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec}`}>Maturity (future)</span>
          </div>
          <div className={`rounded-lg p-3 ${tc.warnBg} border text-sm`}>
            <strong className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Key question:</strong>
            <span className={` ${tc.textTer}`}> Are we in a genuine Synergy/Golden Age, or a &quot;frustrated deployment&quot; where
            institutional reform hasn&apos;t caught up with the technological paradigm? Perez (2002) argues
            the golden age only begins when regulation, education, and social norms align with the
            new technology. Rising inequality, platform monopolies, and democratic stress suggest
            the alignment is incomplete.</span>
          </div>
        </div>

        {/* AI as potential 6th surge or extension */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h4 className={`font-bold mb-2 ${tc.text}`}>AI: New Surge or Extension of the 5th?</h4>
          <p className={`text-sm mb-3 leading-relaxed ${tc.textTer}`}>
            A critical open question: is the current AI revolution the beginning of a <strong>6th great
            surge</strong>, or is it the maturation phase of the 5th (ICT) surge? Perez herself has
            argued that the green transition, enabled by digital technology, is the true deployment
            opportunity for the 5th surge. But the speed and apparent generality of AI — potentially
            automating cognitive work as broadly as the steam engine automated physical work — may
            qualify it as a new &quot;big bang&quot; event.
          </p>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            If AI is a new surge, the framework predicts we are in the <strong>irruption</strong> phase:
            enormous VC investment, rapid capability growth, and early signs of a speculative frenzy
            (the AI investment surge of 2023&ndash;). This would mean a bubble and crash are <em>ahead</em> of
            us, not behind. If AI is an extension of the 5th surge, the framework predicts it should
            be harnessed by production capital for broad deployment &mdash; which depends on the
            institutional framework being right.
          </p>
        </div>

        {/* Historical parallels */}
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-4 ${tc.text}`}>Historical Parallels to Today</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            One of the most powerful applications of the Perez framework is identifying structural
            parallels between today&apos;s situation and earlier turning points. If the underlying dynamics
            are similar, history doesn&apos;t repeat but it <em>rhymes</em>.
          </p>
          <div className="space-y-3">
            {CONTEMPORARY_PARALLELS.map((p, i) => (
              <div
                key={i}
                className={`rounded-lg border p-4 cursor-pointer transition-all ${tc.card} ${tc.cardHover}`}
                onClick={() => setExpandedParallel(expandedParallel === i ? null : i)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${tc.text}`}>{p.modernEquivalent}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === 'playing-out' ? 'bg-red-500/10 text-red-500' :
                        p.status === 'emerging' ? 'bg-amber-500/10 text-amber-500' :
                        p.status === 'potential' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {p.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className={`text-xs ${tc.textSec}`}>
                      Historical parallel: {p.historicalEvent} (Surge {p.historicalSurge})
                    </div>
                  </div>
                  <span className={`text-xs ${tc.textSec}`}>{expandedParallel === i ? '−' : '+'}</span>
                </div>
                {expandedParallel === i && (
                  <p className={`text-sm mt-3 pt-3 border-t ${tc.border} leading-relaxed ${tc.textTer}`}>
                    {p.analysis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5th surge detail recap */}
        <div className={`rounded-xl border p-5 ${tc.card}`} style={{ borderLeft: `4px solid ${surge5.color}` }}>
          <h4 className={`font-bold mb-2 ${tc.text}`}>The 5th Surge in Detail: {surge5.name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Employment Shift (Now)</div>
              <p className={`leading-relaxed ${tc.textTer}`}>{surge5.societalImpact.employmentShift}</p>
            </div>
            <div>
              <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Inequality Pattern (Now)</div>
              <p className={`leading-relaxed ${tc.textTer}`}>{surge5.societalImpact.inequalityPattern}</p>
            </div>
            <div>
              <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Cultural Change (Now)</div>
              <p className={`leading-relaxed ${tc.textTer}`}>{surge5.societalImpact.culturalChange}</p>
            </div>
            <div>
              <div className={`text-xs font-semibold mb-1 ${tc.textSec}`}>Institutional Response (So Far)</div>
              <p className={`leading-relaxed ${tc.textTer}`}>{surge5.institutionalResponse.keyLegislation}</p>
            </div>
          </div>
        </div>

        {renderQuoteBlock(
          'Not only does the irruption of each revolution set the stage for a bubble, but also, in the times of paradigm transition, the conditions are especially fertile for the growth of a financial hotbed of decoupled financial capital.',
          'Carlota Perez',
          'Technological Revolutions and Financial Capital',
          2002,
        )}
      </div>
    );
  };

  // ── Academic Sources ──
  const renderSources = () => (
    <div className={`rounded-xl border p-5 ${tc.card}`}>
      <h3 className={`font-bold text-lg mb-3 ${tc.text}`}>Academic Framework &amp; Sources</h3>
      <p className={`text-sm mb-4 ${tc.textTer}`}>
        The analysis above draws on a rich tradition of scholarship connecting technological
        change, financial dynamics, and long-run economic development. Click each source to see
        its key contribution.
      </p>
      <div className="space-y-2">
        {ACADEMIC_SOURCES.map((src, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 cursor-pointer transition-all ${tc.card} ${tc.cardHover}`}
            onClick={() => setExpandedSource(expandedSource === i ? null : i)}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-sm font-medium ${tc.text}`}>{src.author} ({src.year})</span>
                <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${src.category === 'primary' ? 'bg-blue-500/10 text-blue-500' : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                  {src.category}
                </span>
              </div>
              <span className={`text-xs ${tc.textSec}`}>{expandedSource === i ? '−' : '+'}</span>
            </div>
            <div className={`text-xs italic ${tc.textSec}`}>{src.title}</div>
            {expandedSource === i && (
              <p className={`text-sm mt-2 pt-2 border-t ${tc.border} leading-relaxed ${tc.textTer}`}>
                {src.keyInsight}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sub-view tabs */}
      <div className={`rounded-xl p-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex flex-wrap gap-1.5">
          {SUB_VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setSubView(v.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${subView === v.id ? tc.tabActive : tc.tab}`}
              title={v.desc}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Surge filter (not shown on contemporary view) */}
      {subView !== 'contemporary' && renderSurgeSelector()}

      {/* Active sub-view */}
      {subView === 'surges' && renderSurgesTimeline()}
      {subView === 'capital' && renderCapitalDynamics()}
      {subView === 'adoption' && renderAdoptionCurves()}
      {subView === 'bubbles' && renderBubbles()}
      {subView === 'kondratiev' && renderKondratiev()}
      {subView === 'societal' && renderSocietalImpact()}
      {subView === 'contemporary' && renderContemporary()}

      {/* Sources (always visible) */}
      {renderSources()}
    </div>
  );
};

function getSurgeOrdinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return suffixes[n] || 'th';
}

export default TechCapitalCyclesChart;
