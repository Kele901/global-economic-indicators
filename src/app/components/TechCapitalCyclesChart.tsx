'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, Cell,
} from 'recharts';
import {
  GREAT_SURGES, CAPITAL_FLOW_PHASES, ADOPTION_CURVES, FINANCIAL_BUBBLES,
  KONDRATIEV_WAVES, ACADEMIC_SOURCES, SURGE_COLORS, INEQUALITY_DATA,
  CONTEMPORARY_PARALLELS, PHASE_DESCRIPTIONS, EXTENDED_QUOTES,
  PEREZ_FIGURE_DATA,
  type GreatSurge,
} from '../data/techCapitalCyclesData';

type SubView = 'historical' | 'surges' | 'capital' | 'adoption' | 'bubbles' | 'kondratiev' | 'societal' | 'contemporary';

interface Props {
  isDarkMode: boolean;
}

const SUB_VIEWS: { id: SubView; label: string; desc: string }[] = [
  { id: 'historical', label: 'Historical Record', desc: 'Perez figure: bubbles, recessions & golden ages' },
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
    card: isDarkMode ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200',
    cardHover: isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSec: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTer: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    grid: isDarkMode ? '#1f2937' : '#f3f4f6',
    axis: isDarkMode ? '#4b5563' : '#d1d5db',
    axisLabel: isDarkMode ? '#9ca3af' : '#6b7280',
    tab: isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900',
    tabActive: isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow-sm',
    surgeBtn: isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    surgeBtnActive: 'ring-2 ring-blue-500',
    infoBg: isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50',
    quoteBg: isDarkMode ? 'bg-indigo-900/20 border-indigo-700/30' : 'bg-indigo-50 border-indigo-100',
    warnBg: isDarkMode ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200',
    successBg: isDarkMode ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    tooltipBg: isDarkMode ? '#111827' : '#ffffff',
    tooltipBorder: isDarkMode ? '#374151' : '#e5e7eb',
    tooltipText: isDarkMode ? '#f9fafb' : '#111827',
    tooltipTextSec: isDarkMode ? '#9ca3af' : '#6b7280',
    chartBg: isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50/50',
  }), [isDarkMode]);

  const viewQuotes = useMemo(() => EXTENDED_QUOTES.filter(q => q.relevantView === subView), [subView]);

  // ── Custom tooltip renderer ──
  const CustomTooltip = useCallback(({ active, payload, label, suffix, valueFormatter }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-xl shadow-2xl border backdrop-blur-sm"
        style={{
          background: tc.tooltipBg,
          borderColor: tc.tooltipBorder,
          padding: '12px 16px',
          minWidth: 180,
          maxWidth: 320,
        }}
      >
        <div className="text-xs font-semibold mb-2" style={{ color: tc.tooltipTextSec }}>
          {typeof label === 'number' && label > 1000 ? label : label}
          {suffix && <span className="font-normal ml-1">{suffix}</span>}
        </div>
        <div className="space-y-1.5">
          {payload.filter((p: any) => p.value != null && p.value !== 0).map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || p.stroke }} />
                <span className="text-xs truncate" style={{ color: tc.tooltipText }}>{p.name}</span>
              </div>
              <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: p.color || p.stroke }}>
                {valueFormatter ? valueFormatter(p.value) : (typeof p.value === 'number' ? p.value.toFixed(1) : p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }, [tc]);

  // ── Custom active dot ──
  const renderActiveDot = useCallback((props: any) => {
    const { cx, cy, stroke } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill={stroke} fillOpacity={0.15} stroke="none" />
        <circle cx={cx} cy={cy} r={5} fill={isDarkMode ? '#111827' : '#fff'} stroke={stroke} strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={2} fill={stroke} stroke="none" />
      </g>
    );
  }, [isDarkMode]);

  const axisProps = useMemo(() => ({
    stroke: 'none',
    tick: { fontSize: 11, fill: tc.axisLabel, fontFamily: 'inherit' },
    tickLine: false,
    axisLine: false,
  }), [tc.axisLabel]);

  const gridProps = useMemo(() => ({
    strokeDasharray: '2 6',
    stroke: tc.grid,
    strokeOpacity: 0.8,
    vertical: false as const,
  }), [tc.grid]);

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
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedSurge ? tc.tabActive : tc.surgeBtn}`}
      >
        All Surges
      </button>
      {GREAT_SURGES.map(s => (
        <button
          key={s.id}
          onClick={() => setSelectedSurge(selectedSurge === s.id ? null : s.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedSurge === s.id ? tc.surgeBtnActive + ' ' + tc.surgeBtn : tc.surgeBtn}`}
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

  // ── HISTORICAL RECORD (PEREZ FIGURE) VIEW ──
  const renderHistoricalRecord = () => {
    const timelineStart = 1771;
    const timelineEnd = 2060;
    const span = timelineEnd - timelineStart;
    const pct = (y: number) => ((y - timelineStart) / span) * 100;

    const installColor = isDarkMode ? '#F59E0B' : '#D97706';
    const tpColor = isDarkMode ? '#EF4444' : '#DC2626';
    const deployColor = isDarkMode ? '#10B981' : '#059669';
    const maturityColor = isDarkMode ? '#6B7280' : '#9CA3AF';
    const headerBg = isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100';
    const rowBorder = isDarkMode ? 'border-gray-700/50' : 'border-gray-200';
    const rowHover = isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50';
    const colDivider = isDarkMode ? 'border-gray-700/40' : 'border-gray-200/60';

    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-1 ${tc.text}`}>The Historical Record</h3>
          <p className={`text-sm mb-1 ${tc.textTer}`}>
            Bubble prosperities, recessions and golden ages
          </p>
          <p className={`text-xs mb-5 ${tc.textSec}`}>
            Based on Perez (2002, 2009). Each technological revolution follows the same structural
            sequence: a speculative &quot;gilded age&quot; bubble during Installation, a recessionary Turning
            Point, then a broadly prosperous Golden Age during Deployment.
          </p>

          {/* Figure container */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: 800 }}>
              {/* Column headers */}
              <div className={`flex rounded-t-lg overflow-hidden text-xs font-bold ${headerBg}`}>
                <div className={`flex-shrink-0 px-4 py-3 ${tc.text}`} style={{ width: 180 }}>
                  No., date, revolution,<br />core country
                </div>
                <div className={`flex-1 border-l ${colDivider}`}>
                  <div className="flex">
                    <div className="flex-1 text-center px-2 py-1.5" style={{ borderBottom: `3px solid ${installColor}` }}>
                      <div style={{ color: installColor }} className="font-extrabold text-sm">INSTALLATION PERIOD</div>
                      <div className={`font-normal mt-0.5 ${tc.textSec}`}>&lsquo;Gilded Age&rsquo; Bubbles</div>
                    </div>
                    <div className="text-center px-2 py-1.5 flex-shrink-0" style={{ width: 100, borderBottom: `3px solid ${tpColor}` }}>
                      <div style={{ color: tpColor }} className="font-extrabold text-sm">TURNING<br />POINT</div>
                      <div className={`font-normal mt-0.5 ${tc.textSec}`}>Recessions</div>
                    </div>
                    <div className="flex-1 text-center px-2 py-1.5" style={{ borderBottom: `3px solid ${deployColor}` }}>
                      <div style={{ color: deployColor }} className="font-extrabold text-sm">DEPLOYMENT PERIOD</div>
                      <div className={`font-normal mt-0.5 ${tc.textSec}`}>&lsquo;Golden Ages&rsquo;</div>
                    </div>
                    <div className="text-center px-2 py-1.5 flex-shrink-0" style={{ width: 80, borderBottom: `3px solid ${maturityColor}` }}>
                      <div style={{ color: maturityColor }} className="font-extrabold text-xs">Maturity /<br />decline</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rows */}
              {PEREZ_FIGURE_DATA.map((row, idx) => {
                const surge = GREAT_SURGES.find(s => s.id === row.surgeId)!;
                const isLast = idx === PEREZ_FIGURE_DATA.length - 1;
                return (
                  <div
                    key={row.surgeId}
                    className={`flex border-t ${rowBorder} ${rowHover} transition-colors ${isLast ? 'rounded-b-lg' : ''}`}
                  >
                    {/* Left label column */}
                    <div className="flex-shrink-0 px-4 py-4" style={{ width: 180 }}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className="text-2xl font-black leading-none"
                          style={{ color: surge.color }}
                        >
                          {row.ordinal}
                        </span>
                        <span className={`text-xs font-bold ${tc.text}`}>{row.dateLine}</span>
                      </div>
                      <div className={`text-xs font-semibold leading-tight ${tc.text}`}>
                        {row.revolutionName}
                      </div>
                      <div className={`text-xs mt-0.5 ${tc.textSec}`}>{row.coreCountry}</div>
                    </div>

                    {/* Timeline bar area */}
                    <div className={`flex-1 border-l ${colDivider} relative`} style={{ minHeight: 90 }}>
                      <div className="flex h-full">
                        {/* Installation column */}
                        <div className="flex-1 relative px-3 py-3 flex flex-col justify-center">
                          <div
                            className="absolute top-2 bottom-2 rounded-lg"
                            style={{
                              left: `${pct(row.installStart) * 0.9}%`,
                              right: `${(100 - pct(row.installEnd) * 0.9)}%`,
                              minWidth: 10,
                              background: `linear-gradient(135deg, ${installColor}30, ${installColor}15)`,
                              border: `1px solid ${installColor}40`,
                            }}
                          />
                          <div className="relative z-10">
                            <div className={`text-xs font-semibold leading-tight ${tc.text}`}>
                              {row.bubbleLabel}
                            </div>
                            {row.bubbleDetail && (
                              <div className={`text-xs mt-0.5 ${tc.textSec}`}>{row.bubbleDetail}</div>
                            )}
                          </div>
                        </div>

                        {/* Turning Point column */}
                        <div className="flex-shrink-0 relative px-2 py-3 flex flex-col justify-center items-center" style={{ width: 100 }}>
                          <div
                            className="absolute top-1 bottom-1 left-2 right-2 rounded"
                            style={{
                              background: `linear-gradient(180deg, ${tpColor}25, ${tpColor}10)`,
                              border: `1.5px dashed ${tpColor}50`,
                            }}
                          />
                          <div className="relative z-10 text-center">
                            <div className="text-xs font-bold" style={{ color: tpColor }}>
                              {row.recessionLabel}
                            </div>
                          </div>
                        </div>

                        {/* Deployment / Golden Age column */}
                        <div className="flex-1 relative px-3 py-3 flex flex-col justify-center">
                          <div
                            className="absolute top-2 bottom-2 rounded-lg"
                            style={{
                              left: '5%',
                              right: '15%',
                              background: `linear-gradient(135deg, ${deployColor}25, ${deployColor}10)`,
                              border: `1px solid ${deployColor}35`,
                            }}
                          />
                          <div className="relative z-10">
                            <div className={`text-xs font-semibold leading-tight ${tc.text}`}>
                              {row.goldenAgeLabel}
                            </div>
                            <div className={`text-xs mt-0.5 ${tc.textSec}`}>
                              {row.goldenAgeDetail}
                            </div>
                          </div>
                        </div>

                        {/* Maturity column */}
                        <div className="flex-shrink-0 relative px-2 py-3 flex flex-col justify-center items-center" style={{ width: 80 }}>
                          {!isLast && (
                            <div
                              className="absolute top-2 bottom-2 left-2 right-2 rounded"
                              style={{
                                background: `linear-gradient(180deg, ${maturityColor}15, ${maturityColor}05)`,
                              }}
                            />
                          )}
                          {isLast && (
                            <div className="relative z-10 text-center">
                              <div className="text-xs font-bold animate-pulse" style={{ color: deployColor }}>
                                {row.maturityNote}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Overlap note for 3rd surge */}
                      {row.maturityNote && !isLast && (
                        <div className={`absolute -bottom-3 right-4 text-xs italic z-20 ${tc.textSec}`}>
                          {row.maturityNote}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* "We are here" indicator line */}
              <div className="flex mt-0.5">
                <div style={{ width: 180 }} />
                <div className="flex-1 relative" style={{ height: 28 }}>
                  <div className="absolute flex flex-col items-center" style={{ left: '72%', top: 0 }}>
                    <div className="w-0.5 h-3" style={{ backgroundColor: tpColor }} />
                    <div
                      className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${tpColor}20`, color: tpColor }}
                    >
                      We are here
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-5 pt-4 border-t ${tc.border}`}>
            <p className={`text-xs ${tc.textSec}`}>
              Source: Based on Perez (2002) and Perez (2009). The figure illustrates how each technological
              revolution has followed the same structural sequence over 250 years: a speculative bubble
              during Installation, a recessionary Turning Point, then a Golden Age during Deployment.
              The key insight is that bubbles are not aberrations &mdash; they are the mechanism by which
              financial capital installs the infrastructure of each new paradigm.
            </p>
          </div>
        </div>

        {/* Detailed annotation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-xl border p-4 ${tc.card}`} style={{ borderTop: `3px solid ${installColor}` }}>
            <h4 className="font-bold text-sm mb-2" style={{ color: installColor }}>Installation Period</h4>
            <p className={`text-xs leading-relaxed ${tc.textTer}`}>
              Financial capital leads. New technology appears, entrepreneurs experiment, and speculative
              money floods in. Asset prices soar and wealth concentrates enormously. The infrastructure
              of the new paradigm is built &mdash; at speculators&apos; expense. Each era produces its own
              variant of a &quot;gilded age&quot;: Canal Mania, Railway Mania, the Roaring Twenties, the Dot-com bubble.
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${tc.card}`} style={{ borderTop: `3px solid ${tpColor}` }}>
            <h4 className="font-bold text-sm mb-2" style={{ color: tpColor }}>Turning Point</h4>
            <p className={`text-xs leading-relaxed ${tc.textTer}`}>
              The bubble bursts. Financial crisis, recession, and social upheaval follow. This is the
              critical juncture: society must choose to reform institutions to accommodate the new
              technology. The severity and duration of the turning point depends on how quickly and
              thoroughly institutional reform occurs. The 1929&ndash;43 period was the longest because
              reform (New Deal, WWII mobilisation) was delayed.
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${tc.card}`} style={{ borderTop: `3px solid ${deployColor}` }}>
            <h4 className="font-bold text-sm mb-2" style={{ color: deployColor }}>Deployment Period</h4>
            <p className={`text-xs leading-relaxed ${tc.textTer}`}>
              Production capital takes over. The technology spreads to all sectors. New regulations,
              institutions, and social norms align with the new paradigm. Broadly shared prosperity
              &mdash; a &quot;golden age.&quot; The infrastructure built during the bubble is now available
              cheaply, enabling mass adoption. The Victorian Boom, the Belle Époque, and the Post-war
              Golden Age were all deployment periods.
            </p>
          </div>
        </div>

        {renderQuoteBlock(
          'Bubbles are functional to the process of technology diffusion. They provide the massive investment needed to install the new infrastructure, which then becomes available at low cost for the deployment period.',
          'Carlota Perez', 'Technological Revolutions and Financial Capital', 2002,
        )}
      </div>
    );
  };

  // ── SURGES TIMELINE VIEW ──
  const renderSurgesTimeline = () => {
    const displaySurges = selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES;
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>The Perez Phase Model</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            Carlota Perez argues every technological revolution follows a recurring five-phase pattern.
            The revolution is divided into two broad periods: <strong>Installation</strong> (led by financial capital
            and speculation) and <strong>Deployment</strong> (led by production capital and institutional frameworks).
            Between them lies the <strong>Turning Point</strong> &mdash; a crash that forces society to choose between
            institutional reform and stagnation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(['irruption', 'frenzy', 'turning', 'synergy', 'maturity'] as const).map(phase => {
              const desc = PHASE_DESCRIPTIONS[phase];
              const isExpanded = expandedPhase === phase;
              return (
                <div key={phase} onClick={() => setExpandedPhase(isExpanded ? null : phase)} className={`rounded-lg border p-3 cursor-pointer transition-all ${tc.card} ${tc.cardHover} ${isExpanded ? tc.surgeBtnActive : ''}`}>
                  <div className="text-xl mb-1">{desc.icon}</div>
                  <div className={`font-bold text-sm ${tc.text}`}>{desc.title}</div>
                  <div className={`text-xs mt-1 ${tc.textSec}`}>{desc.mood}</div>
                  {isExpanded && (
                    <div className={`mt-2 pt-2 border-t ${tc.border} space-y-2`}>
                      <p className={`text-xs leading-relaxed ${tc.textTer}`}>{desc.description}</p>
                      <div className={`text-xs ${tc.textSec}`}><strong>Capital type:</strong> {desc.capitalType}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
            <span className="text-amber-500 font-medium">&larr; Installation (Financial Capital) &rarr;</span>
            <span className="text-green-500 font-medium">&larr; Deployment (Production Capital) &rarr;</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-1 ${tc.text}`}>The Five Great Surges (1771&ndash;Present)</h3>
          <p className={`text-sm mb-5 ${tc.textSec}`}>
            Warm = Installation &middot; Cool = Deployment &middot; Red dashed = Turning Points
          </p>
          <div className={`rounded-xl p-4 ${tc.chartBg}`}>
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart data={surgesTimelineData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                <defs>
                  {displaySurges.map(s => (
                    <React.Fragment key={s.id}>
                      <linearGradient id={`installGrad${s.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SURGE_COLORS[s.id].installation} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={SURGE_COLORS[s.id].installation} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id={`deployGrad${s.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SURGE_COLORS[s.id].deployment} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={SURGE_COLORS[s.id].deployment} stopOpacity={0.02} />
                      </linearGradient>
                    </React.Fragment>
                  ))}
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="year" {...axisProps} />
                <YAxis {...axisProps} label={{ value: 'Intensity', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
                <Tooltip content={<CustomTooltip />} />
                {displaySurges.map(s => (
                  <React.Fragment key={s.id}>
                    <Area type="natural" dataKey={`s${s.id}_install`} name={`${s.name} (Install)`} stroke={SURGE_COLORS[s.id].installation} fill={`url(#installGrad${s.id})`} strokeWidth={2.5} connectNulls dot={false} activeDot={renderActiveDot} animationDuration={1200} />
                    <Area type="natural" dataKey={`s${s.id}_deploy`} name={`${s.name} (Deploy)`} stroke={SURGE_COLORS[s.id].deployment} fill={`url(#deployGrad${s.id})`} strokeWidth={2.5} connectNulls dot={false} activeDot={renderActiveDot} animationDuration={1200} />
                  </React.Fragment>
                ))}
                {displaySurges.map(s => (
                  <ReferenceLine key={`tp-${s.id}`} x={s.turningPointYear} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.7} label={{ value: String(s.turningPointYear), position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9, fontWeight: 600 }} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displaySurges.map(renderSurgeCard)}
        </div>
        {viewQuotes.map((q, i) => <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>)}
      </div>
    );
  };

  // ── CAPITAL DYNAMICS VIEW ──
  const renderCapitalDynamics = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Financial Capital vs Production Capital</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          During each surge&apos;s <strong>Installation</strong> period, <em>financial capital</em> dominates &mdash;
          venture funding, speculation, IPOs, and asset bubbles. After the <strong>Turning Point</strong> crash,
          <em> production capital</em> takes over &mdash; retained earnings, institutional investment, and
          government spending.
        </p>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The infrastructure installed during the bubble (at speculators&apos; expense) becomes available
          cheaply, enabling broad deployment. The question for each surge is whether institutional
          reform after the crash is sufficient to channel the technology toward broadly shared prosperity.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={capitalData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="finCapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="prodCapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 100]} label={{ value: '% Capital Dominance', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="natural" dataKey="financialCapital" name="Financial Capital" stackId="1" stroke="#EF4444" fill="url(#finCapGrad)" strokeWidth={2.5} animationDuration={1200} />
              <Area type="natural" dataKey="productionCapital" name="Production Capital" stackId="1" stroke="#3B82F6" fill="url(#prodCapGrad)" strokeWidth={2.5} animationDuration={1200} />
              {(selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES).map(s => (
                <ReferenceLine key={`tp-${s.id}`} x={s.turningPointYear} stroke={isDarkMode ? '#fbbf24' : '#d97706'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.7} label={{ value: `${s.turningPointYear}`, position: 'top', fill: isDarkMode ? '#fde68a' : '#92400e', fontSize: 9, fontWeight: 600 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Financial Capital</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Production Capital</span>
          <span className="text-amber-500 font-medium">Amber lines = Turning Points</span>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>The Minsky Connection: Why Bubbles Are Inevitable</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Hyman Minsky&apos;s Financial Instability Hypothesis explains <em>why</em> the frenzy phase
          always produces a bubble. During stable periods, financial actors gradually shift from
          <strong> hedge finance</strong> to <strong>speculative finance</strong> to <strong>Ponzi
          finance</strong>. This progression is the natural consequence of sustained stability encouraging
          risk-taking. When applied to Perez&apos;s framework, Minsky explains why every installation
          period produces financial excess: the very success of the new technology validates
          increasingly risky bets.
        </p>
      </div>
      {viewQuotes.map((q, i) => <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>)}
    </div>
  );

  // ── ADOPTION S-CURVES VIEW ──
  const renderAdoptionCurves = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Technology Adoption S-Curves</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          Every major technology follows a logistic S-curve. Financial bubbles consistently occur
          during the steep middle section &mdash; when the technology&apos;s potential is visible but full
          deployment hasn&apos;t been achieved.
        </p>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          Note the <strong>acceleration of adoption speed</strong>: canals took ~60 years to reach 80%;
          railways ~40; television ~15; smartphones ~10. Each successive technology diffuses faster.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={adoptionData.data} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} type="number" domain={['dataMin', 'dataMax']} />
              <YAxis {...axisProps} domain={[0, 100]} label={{ value: 'Adoption %', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {adoptionData.lines.map(curve => (
                <Line key={curve.technology} type="natural" dataKey={curve.technology} stroke={curve.color} strokeWidth={2.5} dot={{ r: 2.5, fill: isDarkMode ? '#111827' : '#fff', stroke: curve.color, strokeWidth: 2 }} activeDot={renderActiveDot} connectNulls animationDuration={1500} />
              ))}
              {FINANCIAL_BUBBLES.filter(b => !selectedSurge || b.surgeId === selectedSurge).map(b => (
                <ReferenceLine key={`crash-${b.name}`} x={b.crashYear} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} label={{ value: b.name.split(' ')[0], position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9, fontWeight: 500 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={`text-xs mt-3 ${tc.textSec}`}>
          Red dashed lines mark bubble crash years. Crashes occur during the steep adoption phase.
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>What Survives the Crash: Infrastructure, Not Fortunes</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Janeway (2012): what dies in a financial crash is not the technology itself, but the particular
          pattern of its financing. Railway Mania capital was destroyed, but the railways survived.
          The dot-com crash left behind fibre-optic cables and data centres. Bubbles are
          <em> functional</em> to technology diffusion: they mobilise risk capital that cautious
          investors would never provide.
        </p>
      </div>
      {viewQuotes.map((q, i) => <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>)}
    </div>
  );

  // ── BUBBLES & CRASHES VIEW ──
  const renderBubbles = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Financial Bubbles Across Surges</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          Every technological revolution produces a speculative bubble during its installation period.
          Janeway (2012) argues these bubbles serve an <em>essential function</em>: they mobilise risk
          capital to build revolutionary infrastructure that cautious investors would never finance.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={bubblesData} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
              <defs>
                {bubblesData.map((b, i) => {
                  const surge = GREAT_SURGES.find(s => s.id === b.surgeId);
                  const col = surge?.color || '#6b7280';
                  return (
                    <linearGradient key={i} id={`bubbleGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={col} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={col} stopOpacity={0.4} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid {...gridProps} vertical horizontal={false} />
              <XAxis type="number" {...axisProps} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="label" {...axisProps} width={130} tick={{ fontSize: 12, fill: tc.axisLabel, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Bar dataKey="decline" name="Market Decline" radius={[0, 8, 8, 0]} barSize={32} animationDuration={1200}>
                {bubblesData.map((_b, i) => (
                  <Cell key={i} fill={`url(#bubbleGrad${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bubblesData.map(b => (
          <div key={b.name} className={`rounded-xl border p-5 ${tc.card}`}>
            <h4 className={`font-bold mb-1 ${tc.text}`}>{b.name}</h4>
            <span className={`text-xs ${tc.textSec}`}>{b.surgeName}</span>
            <p className={`text-sm mt-2 mb-4 leading-relaxed ${tc.textTer}`}>{b.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-xl p-3 ${tc.infoBg}`}>
                <div className="text-red-500 font-bold text-xl">-{b.decline}%</div>
                <div className={`text-xs mt-0.5 ${tc.textSec}`}>Peak-to-Trough</div>
              </div>
              <div className={`rounded-xl p-3 ${tc.infoBg}`}>
                <div className={`font-bold text-xl ${tc.text}`}>{b.crashYear}</div>
                <div className={`text-xs mt-0.5 ${tc.textSec}`}>Crash Year</div>
              </div>
              <div className={`rounded-xl p-3 ${tc.infoBg}`}>
                <div className="text-blue-500 font-bold text-xl">{b.recovery}yr</div>
                <div className={`text-xs mt-0.5 ${tc.textSec}`}>To Recovery</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-5 ${tc.warnBg}`}>
        <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>The Recurring Pattern</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Notice the escalation: Canal Mania (-60%), Railway Mania (-67%), Roaring Twenties (-89%),
          Dot-com (-78%). Each bubble is larger in absolute terms because each successive paradigm
          operates at greater scale. The 1929 crash took 25 years to recover because the institutional
          response was delayed. The dot-com recovery was faster but the 2008 crisis suggests the
          reckoning was merely postponed.
        </p>
      </div>
      {viewQuotes.map((q, i) => <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>)}
    </div>
  );

  // ── KONDRATIEV WAVES VIEW ──
  const renderKondratiev = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Kondratiev Long Waves (1780&ndash;2020s)</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          Nikolai Kondratiev identified long economic cycles of ~40&ndash;60 years. Each upswing is
          driven by a cluster of radical innovations; each downswing by the exhaustion of the prevailing
          paradigm. Perez refined this by showing how financial capital mediates the transition.
        </p>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The upswing of a new wave overlaps with the downswing of the old one, creating turbulence,
          inequality, and institutional crisis &mdash; precisely what we may be experiencing now as the
          ICT paradigm matures and AI potentially launches a new wave.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={kondratievData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="innovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="decade" {...axisProps} />
              <YAxis yAxisId="growth" {...axisProps} label={{ value: 'GDP Growth %', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <YAxis yAxisId="innov" orientation="right" {...axisProps} label={{ value: 'Innovation Intensity', angle: 90, position: 'insideRight', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area yAxisId="growth" type="natural" dataKey="upswing" name="Upswing Growth" fill="url(#upGrad)" stroke="#10B981" strokeWidth={2.5} animationDuration={1200} />
              <Area yAxisId="growth" type="natural" dataKey="downswing" name="Downswing Growth" fill="url(#downGrad)" stroke="#EF4444" strokeWidth={2.5} animationDuration={1200} />
              <Area yAxisId="innov" type="natural" dataKey="innovationIntensity" name="Innovation Intensity" fill="url(#innovGrad)" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" animationDuration={1500} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Upswing</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Downswing</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-500 inline-block border-t-2 border-dashed border-purple-500" /> Innovation Intensity</span>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-3 ${tc.text}`}>Wave Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}>
                <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Wave</th>
                <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Period</th>
                <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Innovation Cluster</th>
                <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Energy Base</th>
                <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Peak Growth</th>
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
                    <td className={`px-4 py-2.5 font-medium ${tc.text}`}>
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: surge?.color }} />
                      {name}
                    </td>
                    <td className={`px-4 py-2.5 ${tc.textTer}`}>{startDecade}s&ndash;{endDecade}s</td>
                    <td className={`px-4 py-2.5 ${tc.textTer}`}>{surge?.keyTechnologies.slice(0, 3).join(', ')}</td>
                    <td className={`px-4 py-2.5 ${tc.textTer}`}>{surge?.paradigmShift.energySource}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-500">{peakGrowth.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>Freeman &amp; Louçã: Techno-Economic Paradigm Shifts</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Freeman &amp; Louçã (2001) extended the Kondratiev framework by arguing that each long wave
          is not merely an economic cycle but a <strong>techno-economic paradigm shift</strong>. The
          transition requires matching transformations of institutions, education, regulation, and
          social norms. When institutional transformation lags behind the technological one, the result
          is social tension, inequality, and political upheaval.
        </p>
      </div>
      {viewQuotes.map((q, i) => <React.Fragment key={i}>{renderQuoteBlock(q.quote, q.author, q.source, q.year)}</React.Fragment>)}
    </div>
  );

  // ── SOCIETAL IMPACT VIEW ──
  const renderSocietalImpact = () => {
    const displaySurges = selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES;
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Inequality Across Technological Revolutions</h3>
          <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
            Inequality rises sharply during <strong>Installation</strong> periods, peaks at the
            <strong> Turning Point</strong>, and falls during <strong>Deployment</strong>. The most dramatic
            example is the &quot;Great Compression&quot; (1929&ndash;1970) when the top 10% income share fell from
            ~50% to ~33%. The current 5th surge shows the <em>opposite</em> trajectory: inequality has
            risen back toward Gilded Age levels, suggesting the deployment&apos;s institutional reset has
            not yet occurred.
          </p>
          <div className={`rounded-xl p-4 ${tc.chartBg}`}>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={inequalityData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                <defs>
                  <linearGradient id="ineqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.45} />
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="year" {...axisProps} />
                <YAxis {...axisProps} domain={[25, 55]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Top 10% Income Share', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
                <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
                <Area type="natural" dataKey="topSharePct" name="Top 10% Income Share" fill="url(#ineqGrad)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: isDarkMode ? '#111827' : '#fff', stroke: '#F59E0B', strokeWidth: 2 }} activeDot={renderActiveDot} animationDuration={1200} />
                {(selectedSurge ? GREAT_SURGES.filter(s => s.id === selectedSurge) : GREAT_SURGES).map(s => (
                  <ReferenceLine key={`tp-${s.id}`} x={s.turningPointYear} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} label={{ value: String(s.turningPointYear), position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9, fontWeight: 500 }} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={`text-xs mt-3 ${tc.textSec}`}>
            Data inspired by Piketty, Saez &amp; Zucman. Red lines mark turning-point crashes.
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-4 ${tc.text}`}>Techno-Economic Paradigm Shifts</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            Freeman &amp; Louçã argue that each revolution transforms the entire <em>techno-economic
            paradigm</em>: energy, transport, communication, organisation, and geographic scope all shift.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}>
                  <th className={`px-3 py-2.5 text-left font-semibold ${tc.textSec}`}>Dimension</th>
                  {displaySurges.map(s => (
                    <th key={s.id} className="px-3 py-2.5 text-left font-semibold" style={{ color: s.color }}>{s.id}{getSurgeOrdinal(s.id)} Surge</th>
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
                    <td className={`px-3 py-2.5 font-medium ${tc.text}`}>{row.label}</td>
                    {displaySurges.map(s => (
                      <td key={s.id} className={`px-3 py-2.5 ${tc.textTer}`}>{s.paradigmShift[row.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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

  // ── CONTEMPORARY VIEW ──
  const renderContemporary = () => {
    const surge5 = GREAT_SURGES[4];
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Where Are We in the Cycle?</h3>
          <p className={`text-sm mb-3 leading-relaxed ${tc.textTer}`}>
            The 5th surge passed its <strong>Turning Point</strong> with the dot-com crash (2000&ndash;2002)
            and should now be in its <strong>Deployment</strong> period. But has the institutional reset
            that characterises a true golden age actually occurred?
          </p>
          <p className={`text-sm mb-3 leading-relaxed ${tc.textTer}`}>
            After 1929, the New Deal and Bretton Woods created a comprehensive framework that channelled
            mass-production technology toward broadly shared prosperity for 30 years. After 2000,
            Sarbanes-Oxley and Dodd-Frank were partial responses but nothing equivalent has emerged.
          </p>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            Perez argues this means we are in a <strong>&quot;frustrated deployment&quot;</strong> &mdash; the
            technological conditions for a golden age exist, but institutional alignment is missing.
            Rising inequality, populist politics, and the climate crisis all suggest unresolved tensions.
            AI and the green transition may be catalysts for the institutional reform still needed.
          </p>
        </div>

        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h4 className={`font-bold mb-3 ${tc.text}`}>5th Surge Phase Position</h4>
          <div className="flex items-center gap-1 flex-wrap text-xs mb-3">
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec} line-through`}>Irruption (1971&ndash;1990s)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec} line-through`}>Frenzy (1990s&ndash;2000)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec} line-through`}>Turning Point (2000&ndash;02)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className="px-3 py-1.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 font-bold ring-2 ring-green-500">Synergy? (2002&ndash;present)</span>
            <span className={tc.textSec}>&rarr;</span>
            <span className={`px-3 py-1.5 rounded ${tc.infoBg} ${tc.textSec}`}>Maturity (future)</span>
          </div>
          <div className={`rounded-lg p-3 ${tc.warnBg} border text-sm`}>
            <strong className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Key question:</strong>
            <span className={` ${tc.textTer}`}> Are we in a genuine Golden Age, or a &quot;frustrated deployment&quot;
            where institutional reform hasn&apos;t caught up? Rising inequality, platform monopolies, and
            democratic stress suggest the alignment is incomplete.</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h4 className={`font-bold mb-2 ${tc.text}`}>AI: New Surge or Extension of the 5th?</h4>
          <p className={`text-sm mb-3 leading-relaxed ${tc.textTer}`}>
            Is AI the beginning of a <strong>6th great surge</strong>, or the maturation of the 5th?
            Perez argues the green transition is the true deployment opportunity. But AI&apos;s speed and
            generality may qualify it as a new &quot;big bang.&quot;
          </p>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            If AI is a new surge, we are in <strong>irruption</strong>: enormous VC investment, rapid
            capability growth, and early signs of frenzy. A bubble and crash would be <em>ahead</em>,
            not behind. If it is an extension, it should be harnessed by production capital for
            broad deployment.
          </p>
        </div>

        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-4 ${tc.text}`}>Historical Parallels to Today</h3>
          <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
            If the underlying dynamics are similar, history doesn&apos;t repeat but it <em>rhymes</em>.
          </p>
          <div className="space-y-3">
            {CONTEMPORARY_PARALLELS.map((p, i) => (
              <div key={i} className={`rounded-lg border p-4 cursor-pointer transition-all ${tc.card} ${tc.cardHover}`} onClick={() => setExpandedParallel(expandedParallel === i ? null : i)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${tc.text}`}>{p.modernEquivalent}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === 'playing-out' ? 'bg-red-500/10 text-red-500' :
                        p.status === 'emerging' ? 'bg-amber-500/10 text-amber-500' :
                        p.status === 'potential' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>{p.status.replace('-', ' ')}</span>
                    </div>
                    <div className={`text-xs ${tc.textSec}`}>Historical parallel: {p.historicalEvent} (Surge {p.historicalSurge})</div>
                  </div>
                  <span className={`text-xs ${tc.textSec}`}>{expandedParallel === i ? '−' : '+'}</span>
                </div>
                {expandedParallel === i && (
                  <p className={`text-sm mt-3 pt-3 border-t ${tc.border} leading-relaxed ${tc.textTer}`}>{p.analysis}</p>
                )}
              </div>
            ))}
          </div>
        </div>

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
          'Carlota Perez', 'Technological Revolutions and Financial Capital', 2002,
        )}
      </div>
    );
  };

  // ── Academic Sources ──
  const renderSources = () => (
    <div className={`rounded-xl border p-5 ${tc.card}`}>
      <h3 className={`font-bold text-lg mb-3 ${tc.text}`}>Academic Framework &amp; Sources</h3>
      <p className={`text-sm mb-4 ${tc.textTer}`}>
        The analysis draws on scholarship connecting technological change, financial dynamics, and
        long-run economic development. Click each source to see its key contribution.
      </p>
      <div className="space-y-2">
        {ACADEMIC_SOURCES.map((src, i) => (
          <div key={i} className={`rounded-lg border p-3 cursor-pointer transition-all ${tc.card} ${tc.cardHover}`} onClick={() => setExpandedSource(expandedSource === i ? null : i)}>
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
              <p className={`text-sm mt-2 pt-2 border-t ${tc.border} leading-relaxed ${tc.textTer}`}>{src.keyInsight}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex flex-wrap gap-1.5">
          {SUB_VIEWS.map(v => (
            <button key={v.id} onClick={() => setSubView(v.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${subView === v.id ? tc.tabActive : tc.tab}`} title={v.desc}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {subView !== 'contemporary' && subView !== 'historical' && renderSurgeSelector()}

      {subView === 'historical' && renderHistoricalRecord()}
      {subView === 'surges' && renderSurgesTimeline()}
      {subView === 'capital' && renderCapitalDynamics()}
      {subView === 'adoption' && renderAdoptionCurves()}
      {subView === 'bubbles' && renderBubbles()}
      {subView === 'kondratiev' && renderKondratiev()}
      {subView === 'societal' && renderSocietalImpact()}
      {subView === 'contemporary' && renderContemporary()}

      {renderSources()}
    </div>
  );
};

function getSurgeOrdinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return suffixes[n] || 'th';
}

export default TechCapitalCyclesChart;
