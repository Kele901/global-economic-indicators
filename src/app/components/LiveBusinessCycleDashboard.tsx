'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  yieldCurveHistory,
  historicalMarketData,
  type YieldCurveDataPoint,
} from '../data/marketCyclesData';

interface LiveBusinessCycleDashboardProps {
  isDarkMode: boolean;
}

interface FredObservation {
  date: string;
  value: string;
}

interface YieldCurvePoint {
  date: string;
  spread10Y2Y: number | null;
  spread10Y3M: number | null;
  isRecession: boolean;
}

interface CreditSpreadPoint {
  date: string;
  spread: number | null;
}

const RECESSION_PERIODS = [
  { start: '1980-01', end: '1980-07' },
  { start: '1981-07', end: '1982-11' },
  { start: '1990-07', end: '1991-03' },
  { start: '2001-03', end: '2001-11' },
  { start: '2007-12', end: '2009-06' },
  { start: '2020-02', end: '2020-04' },
];

function isInRecession(dateStr: string): boolean {
  for (const period of RECESSION_PERIODS) {
    if (dateStr >= period.start && dateStr <= period.end) return true;
  }
  return false;
}

function parseObservations(data: FredObservation[]): { date: string; value: number }[] {
  return data
    .filter((obs) => obs.value !== '.')
    .map((obs) => ({
      date: obs.date.slice(0, 7),
      value: parseFloat(obs.value),
    }));
}

function getRecessionRiskLevel(probability: number): {
  label: string;
  color: string;
  description: string;
} {
  if (probability < 15)
    return { label: 'Low', color: '#22c55e', description: 'Expansion likely to continue' };
  if (probability < 30)
    return { label: 'Moderate', color: '#eab308', description: 'Some warning signs present' };
  if (probability < 50)
    return { label: 'Elevated', color: '#f97316', description: 'Significant risk building' };
  return { label: 'High', color: '#ef4444', description: 'Recession likely imminent' };
}

function getYieldCurveSignal(spread: number): { label: string; color: string } {
  if (spread < -0.5) return { label: 'Deeply Inverted', color: '#ef4444' };
  if (spread < 0) return { label: 'Inverted', color: '#f97316' };
  if (spread < 0.5) return { label: 'Flat', color: '#eab308' };
  return { label: 'Normal', color: '#22c55e' };
}

function getCreditSpreadSignal(spread: number): { label: string; color: string } {
  if (spread < 3) return { label: 'Tight', color: '#22c55e' };
  if (spread < 5) return { label: 'Normal', color: '#eab308' };
  if (spread < 7) return { label: 'Wide', color: '#f97316' };
  return { label: 'Distressed', color: '#ef4444' };
}

function getOverallAssessment(
  recessionProb: number,
  yieldSpread: number,
  creditSpread: number
): { label: string; color: string } {
  let score = 0;
  if (recessionProb > 40) score += 3;
  else if (recessionProb > 25) score += 2;
  else if (recessionProb > 15) score += 1;

  if (yieldSpread < -0.5) score += 3;
  else if (yieldSpread < 0) score += 2;
  else if (yieldSpread < 0.5) score += 1;

  if (creditSpread > 7) score += 3;
  else if (creditSpread > 5) score += 2;
  else if (creditSpread > 3.5) score += 1;

  if (score >= 7) return { label: 'Severe Stress', color: '#ef4444' };
  if (score >= 5) return { label: 'Caution', color: '#f97316' };
  if (score >= 3) return { label: 'Watch', color: '#eab308' };
  return { label: 'Healthy', color: '#22c55e' };
}

export default function LiveBusinessCycleDashboard({
  isDarkMode,
}: LiveBusinessCycleDashboardProps) {
  const [yieldCurveData, setYieldCurveData] = useState<YieldCurvePoint[]>([]);
  const [creditSpreadData, setCreditSpreadData] = useState<CreditSpreadPoint[]>([]);
  const [recessionProbability, setRecessionProbability] = useState<number>(25);
  const [currentYieldSpread, setCurrentYieldSpread] = useState<number>(0.1);
  const [currentCreditSpread, setCurrentCreditSpread] = useState<number>(3.5);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('fallback');

  const loadFallbackData = useCallback(() => {
    const fallbackYieldCurve: YieldCurvePoint[] = yieldCurveHistory.map(
      (d: YieldCurveDataPoint) => ({
        date: d.date,
        spread10Y2Y: d.spread10Y2Y,
        spread10Y3M: d.spread10Y3M,
        isRecession: d.isRecession,
      })
    );
    setYieldCurveData(fallbackYieldCurve);

    const fallbackCredit: CreditSpreadPoint[] = historicalMarketData
      .filter((d) => d.creditSpread !== undefined)
      .map((d) => ({
        date: `${d.year}-01`,
        spread: d.creditSpread ?? null,
      }));
    setCreditSpreadData(fallbackCredit);

    const latest = historicalMarketData[historicalMarketData.length - 1];
    setRecessionProbability(latest.recessionProbability ?? 25);
    setCurrentYieldSpread(latest.yieldCurve10Y2Y ?? 0.1);
    setCurrentCreditSpread(latest.creditSpread ?? 3.5);
    setDataSource('fallback');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchFredSeries(seriesId: string): Promise<FredObservation[] | null> {
      try {
        const res = await fetch(`/api/fred?series_id=${seriesId}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.observations ?? null;
      } catch {
        return null;
      }
    }

    async function loadData() {
      setLoading(true);

      const [t10y2yRaw, t10y3mRaw, creditRaw, recessionRaw] = await Promise.all([
        fetchFredSeries('T10Y2Y'),
        fetchFredSeries('T10Y3M'),
        fetchFredSeries('BAMLH0A0HYM2'),
        fetchFredSeries('RECPROUSM156N'),
      ]);

      if (cancelled) return;

      const t10y2y = t10y2yRaw ? parseObservations(t10y2yRaw) : null;
      const t10y3m = t10y3mRaw ? parseObservations(t10y3mRaw) : null;
      const credit = creditRaw ? parseObservations(creditRaw) : null;
      const recession = recessionRaw ? parseObservations(recessionRaw) : null;

      if (!t10y2y && !t10y3m && !credit && !recession) {
        loadFallbackData();
        setLoading(false);
        return;
      }

      setDataSource('live');

      if (t10y2y || t10y3m) {
        const dateMap = new Map<string, YieldCurvePoint>();

        const allDates = new Set<string>();
        t10y2y?.forEach((d) => allDates.add(d.date));
        t10y3m?.forEach((d) => allDates.add(d.date));

        const t10y2yMap = new Map(t10y2y?.map((d) => [d.date, d.value]) ?? []);
        const t10y3mMap = new Map(t10y3m?.map((d) => [d.date, d.value]) ?? []);

        Array.from(allDates)
          .sort()
          .forEach((date) => {
            dateMap.set(date, {
              date,
              spread10Y2Y: t10y2yMap.get(date) ?? null,
              spread10Y3M: t10y3mMap.get(date) ?? null,
              isRecession: isInRecession(date),
            });
          });

        const ycData = Array.from(dateMap.values());
        setYieldCurveData(ycData);

        const latestYc = ycData[ycData.length - 1];
        if (latestYc?.spread10Y2Y != null) {
          setCurrentYieldSpread(latestYc.spread10Y2Y);
        }
      } else {
        const fallbackYc = yieldCurveHistory.map((d: YieldCurveDataPoint) => ({
          date: d.date,
          spread10Y2Y: d.spread10Y2Y,
          spread10Y3M: d.spread10Y3M,
          isRecession: d.isRecession,
        }));
        setYieldCurveData(fallbackYc);
        setCurrentYieldSpread(
          historicalMarketData[historicalMarketData.length - 1].yieldCurve10Y2Y ?? 0.1
        );
      }

      if (credit) {
        const csData = credit.map((d) => ({ date: d.date, spread: d.value }));
        setCreditSpreadData(csData);
        const latestCs = csData[csData.length - 1];
        if (latestCs?.spread != null) setCurrentCreditSpread(latestCs.spread);
      } else {
        const fallbackCredit = historicalMarketData
          .filter((d) => d.creditSpread !== undefined)
          .map((d) => ({ date: `${d.year}-01`, spread: d.creditSpread ?? null }));
        setCreditSpreadData(fallbackCredit);
        setCurrentCreditSpread(
          historicalMarketData[historicalMarketData.length - 1].creditSpread ?? 3.5
        );
      }

      if (recession) {
        const latestRec = recession[recession.length - 1];
        if (latestRec) setRecessionProbability(latestRec.value);
      } else {
        setRecessionProbability(
          historicalMarketData[historicalMarketData.length - 1].recessionProbability ?? 25
        );
      }

      setLoading(false);
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [loadFallbackData]);

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const recessionRisk = getRecessionRiskLevel(recessionProbability);
  const yieldSignal = getYieldCurveSignal(currentYieldSpread);
  const creditSignal = getCreditSpreadSignal(currentCreditSpread);
  const overall = getOverallAssessment(recessionProbability, currentYieldSpread, currentCreditSpread);

  const RecessionGauge = ({ probability }: { probability: number }) => {
    const clampedProb = Math.max(0, Math.min(100, probability));
    const needleAngle = 180 - (clampedProb / 100) * 180;
    const needleRadians = (needleAngle * Math.PI) / 180;
    const needleLength = 70;
    const cx = 100;
    const cy = 95;
    const needleX = cx + needleLength * Math.cos(needleRadians);
    const needleY = cy - needleLength * Math.sin(needleRadians);

    const arcRadius = 80;

    function describeArc(
      centerX: number,
      centerY: number,
      radius: number,
      startAngleDeg: number,
      endAngleDeg: number
    ): string {
      const startRad = (startAngleDeg * Math.PI) / 180;
      const endRad = (endAngleDeg * Math.PI) / 180;
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY - radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY - radius * Math.sin(endRad);
      const largeArcFlag = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`;
    }

    return (
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px] mx-auto">
        <path
          d={describeArc(cx, cy, arcRadius, 120, 180)}
          fill="none"
          stroke="#22c55e"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={describeArc(cx, cy, arcRadius, 60, 120)}
          fill="none"
          stroke="#eab308"
          strokeWidth="14"
          strokeLinecap="butt"
        />
        <path
          d={describeArc(cx, cy, arcRadius, 0, 60)}
          fill="none"
          stroke="#ef4444"
          strokeWidth="14"
          strokeLinecap="round"
        />

        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={isDarkMode ? '#e5e7eb' : '#1f2937'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill={isDarkMode ? '#e5e7eb' : '#1f2937'} />

        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          className="text-[16px] font-bold"
          fill={recessionRisk.color}
        >
          {clampedProb.toFixed(1)}%
        </text>

        <text
          x="18"
          y={cy + 8}
          textAnchor="middle"
          className="text-[9px]"
          fill={isDarkMode ? '#9ca3af' : '#6b7280'}
        >
          0%
        </text>
        <text
          x={cx}
          y="5"
          textAnchor="middle"
          className="text-[9px]"
          fill={isDarkMode ? '#9ca3af' : '#6b7280'}
        >
          50%
        </text>
        <text
          x="182"
          y={cy + 8}
          textAnchor="middle"
          className="text-[9px]"
          fill={isDarkMode ? '#9ca3af' : '#6b7280'}
        >
          100%
        </text>
      </svg>
    );
  };

  const YieldCurveTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        className={`p-3 rounded-lg shadow-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
      >
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value != null ? `${entry.value.toFixed(2)}%` : 'N/A'}
          </p>
        ))}
      </div>
    );
  };

  const CreditTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        className={`p-3 rounded-lg shadow-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
      >
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value != null ? `${entry.value.toFixed(2)}%` : 'N/A'}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
          <div className={`h-6 w-48 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-4`} />
          <div className={`h-40 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <div className={`h-6 w-40 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-4`} />
              <div className={`h-64 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`rounded-xl border ${cardBorder} ${cardBg} p-4`}>
              <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-3`} />
              <div className={`h-8 w-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
              <div className={`h-3 w-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recessionBands = RECESSION_PERIODS.map((period) => ({
    x1: period.start,
    x2: period.end,
  }));

  const yieldCurveDomain = yieldCurveData.length > 0
    ? [yieldCurveData[0].date, yieldCurveData[yieldCurveData.length - 1].date]
    : undefined;

  const creditDomain = creditSpreadData.length > 0
    ? [creditSpreadData[0].date, creditSpreadData[creditSpreadData.length - 1].date]
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>Live Business Cycle Indicators</h2>
          <p className={`text-sm ${textSecondary} mt-1`}>
            Real-time economic signals from Federal Reserve data
            {dataSource === 'live' && (
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500 text-xs font-medium">Live</span>
              </span>
            )}
            {dataSource === 'fallback' && (
              <span className="ml-2 text-xs text-yellow-500 font-medium">Using cached data</span>
            )}
          </p>
        </div>
      </div>

      <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
        <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Recession Probability Gauge</h3>
        <p className={`text-sm ${textSecondary} mb-4`}>
          Smoothed U.S. recession probability from FRED (RECPROUSM156N)
        </p>
        <div className="flex flex-col items-center">
          <RecessionGauge probability={recessionProbability} />
          <div className="mt-3 text-center">
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: recessionRisk.color }}
            >
              {recessionRisk.label} Risk
            </span>
            <p className={`text-sm ${textSecondary} mt-2`}>{recessionRisk.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>Yield Curve Monitor</h3>
          <p className={`text-sm ${textSecondary} mb-4`}>
            Treasury spread: 10Y-2Y and 10Y-3M (negative = inverted)
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldCurveData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="yc10y2yGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="yc10y3mGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  domain={yieldCurveDomain}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<YieldCurveTooltip />} />
                <ReferenceLine y={0} stroke={isDarkMode ? '#6b7280' : '#9ca3af'} strokeDasharray="4 4" />
                {recessionBands
                  .filter((band) => {
                    if (!yieldCurveDomain) return false;
                    return band.x2 >= yieldCurveDomain[0] && band.x1 <= yieldCurveDomain[1];
                  })
                  .map((band, idx) => (
                    <ReferenceArea
                      key={`recession-yc-${idx}`}
                      x1={band.x1}
                      x2={band.x2}
                      fill="#ef4444"
                      fillOpacity={0.1}
                      strokeOpacity={0}
                    />
                  ))}
                <Area
                  type="monotone"
                  dataKey="spread10Y2Y"
                  name="10Y-2Y Spread"
                  stroke="#3b82f6"
                  fill="url(#yc10y2yGrad)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="spread10Y3M"
                  name="10Y-3M Spread"
                  stroke="#8b5cf6"
                  fill="url(#yc10y3mGrad)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className={`text-xs ${textSecondary}`}>10Y-2Y</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-violet-500" />
              <span className={`text-xs ${textSecondary}`}>10Y-3M</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-500/20 border border-red-500/30" />
              <span className={`text-xs ${textSecondary}`}>Recession</span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>Credit Conditions</h3>
          <p className={`text-sm ${textSecondary} mb-4`}>
            ICE BofA High Yield OAS (BAMLH0A0HYM2)
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={creditSpreadData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  domain={creditDomain}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<CreditTooltip />} />
                <ReferenceLine
                  y={6}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{
                    value: 'Danger: 6%',
                    position: 'right',
                    fill: '#ef4444',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spread"
                  name="HY Spread"
                  stroke="#f97316"
                  fill="url(#creditGrad)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="spread"
                  name="HY Spread Line"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span className={`text-xs ${textSecondary}`}>High Yield OAS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }} />
              <span className={`text-xs ${textSecondary}`}>Danger Threshold</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-4`}>
          <p className={`text-xs font-medium uppercase tracking-wider ${textSecondary} mb-2`}>
            Recession Risk
          </p>
          <p className="text-2xl font-bold" style={{ color: recessionRisk.color }}>
            {recessionProbability.toFixed(1)}%
          </p>
          <p className="text-xs mt-1" style={{ color: recessionRisk.color }}>
            {recessionRisk.label}
          </p>
          <p className={`text-xs ${textSecondary} mt-1`}>{recessionRisk.description}</p>
        </div>

        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-4`}>
          <p className={`text-xs font-medium uppercase tracking-wider ${textSecondary} mb-2`}>
            Yield Curve Signal
          </p>
          <p className="text-2xl font-bold" style={{ color: yieldSignal.color }}>
            {currentYieldSpread > 0 ? '+' : ''}
            {currentYieldSpread.toFixed(2)}%
          </p>
          <p className="text-xs mt-1" style={{ color: yieldSignal.color }}>
            {yieldSignal.label}
          </p>
          <p className={`text-xs ${textSecondary} mt-1`}>10Y-2Y Treasury spread</p>
        </div>

        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-4`}>
          <p className={`text-xs font-medium uppercase tracking-wider ${textSecondary} mb-2`}>
            Credit Spread
          </p>
          <p className="text-2xl font-bold" style={{ color: creditSignal.color }}>
            {currentCreditSpread.toFixed(2)}%
          </p>
          <p className="text-xs mt-1" style={{ color: creditSignal.color }}>
            {creditSignal.label}
          </p>
          <p className={`text-xs ${textSecondary} mt-1`}>High yield OAS</p>
        </div>

        <div className={`rounded-xl border ${cardBorder} ${cardBg} p-4`}>
          <p className={`text-xs font-medium uppercase tracking-wider ${textSecondary} mb-2`}>
            Overall Assessment
          </p>
          <div
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: overall.color }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: overall.color }}
            />
            {overall.label}
          </div>
          <p className={`text-xs ${textSecondary} mt-2`}>
            Based on recession probability, yield curve, and credit conditions
          </p>
        </div>
      </div>
    </div>
  );
}
