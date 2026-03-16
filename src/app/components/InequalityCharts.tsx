'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, Cell, ScatterChart, Scatter,
} from 'recharts';
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from 'react-simple-maps';
import {
  PIKETTY_R_VS_G, PIKETTY_LAWS, CAPITAL_INCOME_RATIO,
  TOP_INCOME_SHARES, TOP_WEALTH_SHARES,
  KUZNETS_SCATTER, KUZNETS_THEORETICAL_CURVE, COUNTRY_TRAJECTORIES,
  ELEPHANT_CURVE, INHERITANCE_FLOWS, TAX_HISTORY,
  WEALTH_COMPOSITION, INEQUALITY_MILESTONES, ACADEMIC_SOURCES,
  REGION_COLORS, COUNTRY_COLORS,
  type TopSharePoint, type TopWealthPoint,
} from '../data/inequalityData';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// OECD + key high-income country Gini fallbacks (OECD IDD & Eurostat, latest available ~2020-2022)
// Used when the World Bank API has no data for a country
const OECD_GINI_FALLBACK: Record<string, number> = {
  AUS: 32.5, AUT: 27.5, BEL: 25.9, CAN: 30.1, CHL: 44.9, COL: 51.3, CRI: 49.3,
  CZE: 25.0, DNK: 28.2, EST: 31.2, FIN: 27.4, FRA: 29.2, DEU: 29.6, GRC: 32.4,
  HUN: 28.9, ISL: 25.5, IRL: 28.9, ISR: 34.4, ITA: 32.8, JPN: 33.4, KOR: 31.4,
  LVA: 34.3, LTU: 35.4, LUX: 32.0, MEX: 42.0, NLD: 29.2, NZL: 32.0, NOR: 27.7,
  POL: 28.5, PRT: 32.0, SVK: 23.2, SVN: 24.4, ESP: 32.1, SWE: 28.8, CHE: 31.6,
  TUR: 41.5, GBR: 35.1, USA: 39.7,
  // Non-OECD high-income / European countries often missing from World Bank
  SGP: 37.9, HKG: 53.9, TWN: 33.6, ARE: 32.5, SAU: 45.9, QAT: 41.1, KWT: 36.0,
  BHR: 39.5, OMN: 37.3, CYP: 30.1, MLT: 28.7, HRV: 28.9, BGR: 39.4, ROU: 34.8,
  SRB: 34.5, MNE: 36.0, MKD: 33.0, BIH: 33.0, ALB: 30.0, XKX: 29.0,
};

const NUMERIC_TO_ISO3: Record<string, string> = {
  '004':'AFG','008':'ALB','010':'ATA','012':'DZA','016':'ASM','020':'AND','024':'AGO','028':'ATG',
  '031':'AZE','032':'ARG','036':'AUS','040':'AUT','044':'BHS','048':'BHR','050':'BGD','051':'ARM',
  '052':'BRB','056':'BEL','060':'BMU','064':'BTN','068':'BOL','070':'BIH','072':'BWA','076':'BRA',
  '084':'BLZ','090':'SLB','092':'VGB','096':'BRN','100':'BGR','104':'MMR','108':'BDI','112':'BLR',
  '116':'KHM','120':'CMR','124':'CAN','132':'CPV','140':'CAF','144':'LKA','148':'TCD','152':'CHL',
  '156':'CHN','158':'TWN','170':'COL','174':'COM','175':'MYT','178':'COG','180':'COD','184':'COK',
  '188':'CRI','191':'HRV','192':'CUB','196':'CYP','203':'CZE','204':'BEN','208':'DNK','212':'DMA',
  '214':'DOM','218':'ECU','222':'SLV','226':'GNQ','231':'ETH','232':'ERI','233':'EST','234':'FRO',
  '238':'FLK','242':'FJI','246':'FIN','250':'FRA','254':'GUF','258':'PYF','262':'DJI','266':'GAB',
  '268':'GEO','270':'GMB','275':'PSE','276':'DEU','288':'GHA','292':'GIB','296':'KIR','300':'GRC',
  '304':'GRL','308':'GRD','312':'GLP','316':'GUM','320':'GTM','324':'GIN','328':'GUY','332':'HTI',
  '336':'VAT','340':'HND','344':'HKG','348':'HUN','352':'ISL','356':'IND','360':'IDN','364':'IRN',
  '368':'IRQ','372':'IRL','376':'ISR','380':'ITA','384':'CIV','388':'JAM','392':'JPN','398':'KAZ',
  '400':'JOR','404':'KEN','408':'PRK','410':'KOR','414':'KWT','417':'KGZ','418':'LAO','422':'LBN',
  '426':'LSO','428':'LVA','430':'LBR','434':'LBY','438':'LIE','440':'LTU','442':'LUX','446':'MAC',
  '450':'MDG','454':'MWI','458':'MYS','462':'MDV','466':'MLI','470':'MLT','474':'MTQ','478':'MRT',
  '480':'MUS','484':'MEX','492':'MCO','496':'MNG','498':'MDA','499':'MNE','500':'MSR','504':'MAR',
  '508':'MOZ','512':'OMN','516':'NAM','520':'NRU','524':'NPL','528':'NLD','530':'ANT','533':'ABW',
  '540':'NCL','548':'VUT','554':'NZL','558':'NIC','562':'NER','566':'NGA','570':'NIU','578':'NOR',
  '583':'FSM','584':'MHL','585':'PLW','586':'PAK','591':'PAN','598':'PNG','600':'PRY','604':'PER',
  '608':'PHL','612':'PCN','616':'POL','620':'PRT','624':'GNB','626':'TLS','630':'PRI','634':'QAT',
  '638':'REU','642':'ROU','643':'RUS','646':'RWA','654':'SHN','659':'KNA','660':'AIA','662':'LCA',
  '666':'SPM','670':'VCT','674':'SMR','678':'STP','682':'SAU','686':'SEN','688':'SRB','690':'SYC',
  '694':'SLE','702':'SGP','703':'SVK','704':'VNM','705':'SVN','706':'SOM','710':'ZAF','716':'ZWE',
  '720':'YEM','724':'ESP','728':'SSD','729':'SDN','732':'ESH','736':'SDN','740':'SUR','744':'SJM',
  '748':'SWZ','752':'SWE','756':'CHE','760':'SYR','762':'TJK','764':'THA','768':'TGO','772':'TKL',
  '776':'TON','780':'TTO','784':'ARE','788':'TUN','792':'TUR','795':'TKM','796':'TCA','798':'TUV',
  '800':'UGA','804':'UKR','807':'MKD','818':'EGY','826':'GBR','831':'GGY','832':'JEY','833':'IMN',
  '834':'TZA','840':'USA','850':'VIR','854':'BFA','858':'URY','860':'UZB','862':'VEN','876':'WLF',
  '882':'WSM','887':'YEM','891':'SCG','894':'ZMB',
  '-99':'XKX',
};

type SubView = 'rvsg' | 'kuznets' | 'income' | 'wealth' | 'historical' | 'global' | 'tax';

interface Props {
  isDarkMode: boolean;
}

const SUB_VIEWS: { id: SubView; label: string; desc: string }[] = [
  { id: 'rvsg', label: 'r > g: Piketty\'s Laws', desc: 'The central inequality of capitalism' },
  { id: 'kuznets', label: 'The Kuznets Curve', desc: 'The inverted-U hypothesis and its refutation' },
  { id: 'income', label: 'Income Inequality', desc: 'Top shares, Gini, and the Elephant Curve' },
  { id: 'wealth', label: 'Wealth Inequality', desc: 'Concentration, inheritance, and composition' },
  { id: 'historical', label: 'Historical Dynamics', desc: '200 years of compression and divergence' },
  { id: 'global', label: 'Global Comparison', desc: 'World map of inequality with live data' },
  { id: 'tax', label: 'Tax & Policy', desc: 'Progressive taxation and Piketty\'s proposals' },
];

const INCOME_COUNTRIES = ['USA', 'France', 'UK', 'Germany', 'Japan', 'Sweden', 'Canada', 'Brazil', 'India', 'South Africa', 'China', 'Australia'];
const WEALTH_COUNTRIES = ['USA', 'France', 'UK', 'Germany', 'Japan', 'Sweden', 'Canada', 'Brazil', 'India', 'South Africa', 'China', 'Australia'];
const TAX_COUNTRIES = ['USA', 'UK', 'France', 'Germany'];

const InequalityCharts: React.FC<Props> = ({ isDarkMode }) => {
  const [subView, setSubView] = useState<SubView>('rvsg');
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const [expandedLaw, setExpandedLaw] = useState<number | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [showTrajectories, setShowTrajectories] = useState(false);
  const [giniData, setGiniData] = useState<Record<string, number>>({});
  const [mapHovered, setMapHovered] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(1);

  const tc = useMemo(() => ({
    card: isDarkMode ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200',
    cardHover: isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSec: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTer: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    grid: isDarkMode ? '#1f2937' : '#f3f4f6',
    axisLabel: isDarkMode ? '#9ca3af' : '#6b7280',
    tab: isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900',
    tabActive: isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow-sm',
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
    ocean: isDarkMode ? '#0a1929' : '#e3f2fd',
    land: isDarkMode ? '#1e293b' : '#e5e7eb',
    mapBorder: isDarkMode ? '#374151' : '#d1d5db',
  }), [isDarkMode]);

  // Fetch live Gini data for the global comparison view
  useEffect(() => {
    if (subView !== 'global') return;
    const cached = localStorage.getItem('inequality_gini_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 86400000) { setGiniData({ ...OECD_GINI_FALLBACK, ...parsed.data }); return; }
      } catch { /* ignore */ }
    }
    fetch('https://api.worldbank.org/v2/country/all/indicator/SI.POV.GINI?date=2000:2024&format=json&per_page=5000')
      .then(r => r.json())
      .then(json => {
        if (!json[1]) return;
        const AGGREGATES = new Set(['WLD','EAS','ECS','LCN','MEA','NAC','SAS','SSF','SSA','EAP','ECA','LAC','MNA','TSA','TSS','HIC','LIC','LMC','LMY','MIC','UMC','HPC','OED','PST','PRE','FCS','IDA','IDB','IDX','IBD','IBT','EMU','ARB','CEB','CSS','OSS','SST','TEA','TEC','TLA','TMN','UMC']);
        const liveMap: Record<string, number> = {};
        (json[1] as Array<{ countryiso3code: string; value: number | null; date: string }>)
          .filter(d => d.value !== null && d.countryiso3code && !AGGREGATES.has(d.countryiso3code))
          .sort((a, b) => Number(b.date) - Number(a.date))
          .forEach(d => { if (!liveMap[d.countryiso3code]) liveMap[d.countryiso3code] = d.value!; });
        const map: Record<string, number> = { ...OECD_GINI_FALLBACK, ...liveMap };
        setGiniData(map);
        localStorage.setItem('inequality_gini_cache', JSON.stringify({ ts: Date.now(), data: map }));
      })
      .catch(() => {});
  }, [subView]);

  const CustomTooltip = useCallback(({ active, payload, label, suffix, valueFormatter }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl shadow-2xl border backdrop-blur-sm" style={{ background: tc.tooltipBg, borderColor: tc.tooltipBorder, padding: '12px 16px', minWidth: 180, maxWidth: 320 }}>
        <div className="text-xs font-semibold mb-2" style={{ color: tc.tooltipTextSec }}>
          {label}{suffix && <span className="font-normal ml-1">{suffix}</span>}
        </div>
        <div className="space-y-1.5">
          {payload.filter((p: any) => p.value != null).map((p: any, i: number) => (
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

  // ── Data Transforms ──

  const incomeData = useMemo(() => {
    const data = TOP_INCOME_SHARES.filter(d => d.country === selectedCountry)
      .sort((a, b) => a.year - b.year);
    return data;
  }, [selectedCountry]);

  const wealthData = useMemo(() => {
    return TOP_WEALTH_SHARES.filter(d => d.country === selectedCountry)
      .sort((a, b) => a.year - b.year);
  }, [selectedCountry]);

  const betaData = useMemo(() => {
    const countries = [...new Set(CAPITAL_INCOME_RATIO.map(d => d.country))];
    const yearMap = new Map<number, Record<string, number>>();
    CAPITAL_INCOME_RATIO.forEach(d => {
      if (!yearMap.has(d.year)) yearMap.set(d.year, { year: d.year });
      yearMap.get(d.year)![d.country] = d.beta;
    });
    return { countries, data: Array.from(yearMap.values()).sort((a, b) => a.year - b.year) };
  }, []);

  const taxData = useMemo(() => {
    const yearMap = new Map<number, Record<string, number>>();
    TAX_HISTORY.forEach(d => {
      if (!yearMap.has(d.year)) yearMap.set(d.year, { year: d.year });
      yearMap.get(d.year)![`${d.country}_income`] = d.topMarginalRate;
      if (d.capitalGainsRate !== null) yearMap.get(d.year)![`${d.country}_capital`] = d.capitalGainsRate;
    });
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, []);

  const inheritanceData = useMemo(() => {
    const yearMap = new Map<number, Record<string, number>>();
    INHERITANCE_FLOWS.forEach(d => {
      if (!yearMap.has(d.year)) yearMap.set(d.year, { year: d.year });
      yearMap.get(d.year)![d.country] = d.annualFlow;
    });
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, []);

  const historicalUSData = useMemo(() => {
    return TOP_INCOME_SHARES.filter(d => d.country === 'USA').sort((a, b) => a.year - b.year);
  }, []);

  const giniMax = useMemo(() => Math.max(...Object.values(giniData), 1), [giniData]);

  const getGiniColor = useCallback((val: number) => {
    const t = val / giniMax;
    if (t < 0.35) return isDarkMode ? '#10B981' : '#059669';
    if (t < 0.5) return isDarkMode ? '#F59E0B' : '#D97706';
    if (t < 0.65) return isDarkMode ? '#F97316' : '#EA580C';
    return isDarkMode ? '#EF4444' : '#DC2626';
  }, [giniMax, isDarkMode]);

  // ── Shared Helpers ──

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

  const renderCountrySelector = (countries: string[]) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {countries.map(c => (
        <button
          key={c}
          onClick={() => setSelectedCountry(c)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCountry === c ? tc.tabActive : (isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
        >
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COUNTRY_COLORS[c] || '#6b7280' }} />
          {c}
        </button>
      ))}
    </div>
  );

  // ── r > g VIEW ──

  const renderRvsG = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>r &gt; g: The Fundamental Force for Divergence</h3>
        <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
          Piketty&apos;s central claim is that for most of human history, the rate of return on capital
          (<strong className={isDarkMode ? 'text-red-400' : 'text-red-600'}>r</strong>) has exceeded the
          growth rate of the economy (<strong className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>g</strong>).
          When r &gt; g, wealth inherited from the past grows faster than income from labour, so inherited
          wealth dominates and inequality rises.
        </p>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The brief period when g exceeded r (roughly 1914&ndash;1970) was the exception, not the rule.
          It was caused by wars, inflation, progressive taxation, and rapid post-war growth &mdash; not by
          any natural tendency of capitalism toward equality.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={PIKETTY_R_VS_G} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} type="number" domain={[0, 2100]} tickCount={10} />
              <YAxis {...axisProps} domain={[-2, 6]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Annual Rate (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v.toFixed(1)}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="natural" dataKey="rateOfReturn" name="r (return on capital)" stroke="#EF4444" fill="url(#rGrad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <Area type="natural" dataKey="growthRate" name="g (economic growth)" stroke="#3B82F6" fill="url(#gGrad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <ReferenceLine x={1914} stroke={isDarkMode ? '#fbbf24' : '#d97706'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: '1914', position: 'top', fill: isDarkMode ? '#fde68a' : '#92400e', fontSize: 9 }} />
              <ReferenceLine x={1945} stroke={isDarkMode ? '#fbbf24' : '#d97706'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: '1945', position: 'top', fill: isDarkMode ? '#fde68a' : '#92400e', fontSize: 9 }} />
              <ReferenceLine x={1980} stroke={isDarkMode ? '#fbbf24' : '#d97706'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: '1980', position: 'top', fill: isDarkMode ? '#fde68a' : '#92400e', fontSize: 9 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`text-xs mt-3 ${tc.textSec}`}>
          Source: Based on Piketty (2014) Figures 10.9&ndash;10.11. Projected values assume
          a return to historical norms as growth slows.
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-4 ${tc.text}`}>The Three Laws of Capitalism</h3>
        <div className="space-y-3">
          {PIKETTY_LAWS.map((law, i) => (
            <div key={i} className={`rounded-lg border p-4 cursor-pointer transition-all ${tc.card} ${tc.cardHover}`} onClick={() => setExpandedLaw(expandedLaw === i ? null : i)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-sm font-bold ${tc.text}`}>{law.name}</div>
                  <div className={`text-lg font-mono mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{law.formula}</div>
                </div>
                <span className={`text-xs ${tc.textSec}`}>{expandedLaw === i ? '−' : '+'}</span>
              </div>
              {expandedLaw === i && (
                <div className={`mt-3 pt-3 border-t ${tc.border} space-y-2`}>
                  <p className={`text-sm leading-relaxed ${tc.textTer}`}>{law.explanation}</p>
                  <div className={`rounded-lg p-3 ${tc.warnBg} border`}>
                    <div className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Implication</div>
                    <p className={`text-xs leading-relaxed ${tc.textTer}`}>{law.implication}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Capital/Income Ratio (β) Across Countries</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The capital/income ratio measures the total stock of capital (real estate, business capital,
          financial assets, etc.) relative to annual national income. In Europe before 1914, β was around
          600&ndash;700%. Wars destroyed capital and progressive taxation prevented re-accumulation. Since
          1980, β has been rising back toward pre-war levels &mdash; the return of &quot;patrimonial capitalism.&quot;
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={betaData.data} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} type="number" domain={['dataMin', 'dataMax']} />
              <YAxis {...axisProps} domain={[0, 800]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Capital/Income Ratio (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {betaData.countries.map(c => (
                <Line key={c} type="natural" dataKey={c} name={c} stroke={COUNTRY_COLORS[c] || '#6b7280'} strokeWidth={2.5} connectNulls dot={{ r: 2.5, fill: isDarkMode ? '#111827' : '#fff', stroke: COUNTRY_COLORS[c] || '#6b7280', strokeWidth: 2 }} activeDot={renderActiveDot} animationDuration={1500} />
              ))}
              <ReferenceLine y={600} stroke={isDarkMode ? '#fbbf24' : '#d97706'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} label={{ value: 'Pre-1914 European norm', position: 'right', fill: isDarkMode ? '#fde68a' : '#92400e', fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {renderQuoteBlock(
        'The central contradiction of capitalism: r > g. The entrepreneur inevitably tends to become a rentier, more and more dominant over those who own nothing but their labour. Once constituted, capital reproduces itself faster than output increases.',
        'Thomas Piketty', 'Capital in the Twenty-First Century', 2014,
      )}
    </div>
  );

  // ── KUZNETS CURVE VIEW ──

  const renderKuznets = () => {
    const scatterData = KUZNETS_SCATTER.map(d => ({
      ...d,
      fill: REGION_COLORS[d.region] || '#6b7280',
    }));
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>The Kuznets Curve: An Inverted-U?</h3>
          <p className={`text-sm mb-2 leading-relaxed ${tc.textTer}`}>
            In 1955, Simon Kuznets hypothesised that inequality follows an inverted-U pattern: it rises
            during industrialisation (as workers move from low-productivity agriculture to high-productivity
            industry) and then falls once most workers have transitioned.
          </p>
          <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
            Piketty&apos;s major critique: the data Kuznets used (1913&ndash;1948 in the US) showed a decline in
            inequality caused by <strong>wars and progressive taxation</strong>, not by economic development
            itself. The post-1980 rise in inequality &mdash; in countries that were already rich &mdash;
            decisively refutes the automatic inverted-U.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowTrajectories(!showTrajectories)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showTrajectories ? tc.tabActive : (isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
            >
              {showTrajectories ? 'Show Scatter' : 'Show Country Trajectories'}
            </button>
          </div>

          <div className={`rounded-xl p-4 ${tc.chartBg}`}>
            <ResponsiveContainer width="100%" height={450}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="gdpPerCapita" name="GDP per Capita" type="number" {...axisProps} tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} label={{ value: 'GDP per Capita (PPP USD)', position: 'insideBottom', offset: -5, style: { fill: tc.axisLabel, fontSize: 10 } }} domain={[0, 95000]} />
                <YAxis dataKey="gini" name="Gini" type="number" {...axisProps} domain={[20, 70]} label={{ value: 'Gini Coefficient', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
                <Tooltip content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  return (
                    <div className="rounded-xl shadow-2xl border backdrop-blur-sm" style={{ background: tc.tooltipBg, borderColor: tc.tooltipBorder, padding: '12px 16px' }}>
                      <div className="text-sm font-bold" style={{ color: tc.tooltipText }}>{d.country}</div>
                      <div className="text-xs mt-1" style={{ color: tc.tooltipTextSec }}>Region: {d.region}</div>
                      <div className="text-xs" style={{ color: tc.tooltipTextSec }}>GDP/cap: ${d.gdpPerCapita?.toLocaleString()}</div>
                      <div className="text-xs" style={{ color: tc.tooltipTextSec }}>Gini: {d.gini}</div>
                      {d.year && <div className="text-xs" style={{ color: tc.tooltipTextSec }}>Year: {d.year}</div>}
                    </div>
                  );
                }} />
                {!showTrajectories && (
                  <>
                    <Scatter name="Kuznets Theoretical" data={KUZNETS_THEORETICAL_CURVE.map(d => ({ ...d, country: 'Theory', region: 'Theory' }))} fill="none" stroke={isDarkMode ? '#6b7280' : '#9ca3af'} strokeWidth={2} strokeDasharray="8 4" line={{ type: 'natural' as const }} legendType="line">
                      {KUZNETS_THEORETICAL_CURVE.map((_, i) => <Cell key={i} fill="transparent" />)}
                    </Scatter>
                    <Scatter name="Countries" data={scatterData} fill="#3B82F6">
                      {scatterData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Scatter>
                  </>
                )}
                {showTrajectories && COUNTRY_TRAJECTORIES.map(ct => (
                  <Scatter key={ct.country} name={ct.country} data={ct.points.map(p => ({ ...p, country: ct.country, region: '' }))} fill={ct.color} stroke={ct.color} strokeWidth={2} line={{ type: 'natural' as const }} legendType="line">
                    {ct.points.map((_, i) => <Cell key={i} fill={ct.color} />)}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-3 flex flex-wrap gap-3 text-xs ${tc.textSec}`}>
            {!showTrajectories && Object.entries(REGION_COLORS).map(([r, c]) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />{r}
              </span>
            ))}
            {!showTrajectories && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: isDarkMode ? '#6b7280' : '#9ca3af' }} />
                Kuznets theoretical curve
              </span>
            )}
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${tc.warnBg}`}>
          <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Why the Kuznets Curve Is Wrong</h4>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            The scatter plot reveals the problem: rich countries span a wide range of inequality levels.
            The USA (Gini 41) and Denmark (Gini 28) have similar GDP per capita but vastly different inequality.
            Latin American countries are far above any theoretical curve. The data shows that <strong>institutions
            and policy choices</strong> matter more than the stage of development. The Kuznets inverted-U is
            not a law &mdash; it is a historical artifact of a specific period (1913&ndash;1970) when wars and
            progressive taxation compressed incomes.
          </p>
        </div>

        {renderQuoteBlock(
          'The reduction of inequality that took place in most developed countries between 1910 and 1950 was above all a consequence of war and of policies adopted to cope with the shocks of war. Similarly, the resurgence of inequality after 1980 is due largely to the political shifts of the past several decades, especially in regard to taxation and finance.',
          'Thomas Piketty', 'Capital in the Twenty-First Century', 2014,
        )}
      </div>
    );
  };

  // ── INCOME INEQUALITY VIEW ──

  const renderIncome = () => (
    <div className="space-y-6">
      {renderCountrySelector(INCOME_COUNTRIES)}

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Top Income Shares: {selectedCountry}</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The share of national income going to the top 1% and top 10% reveals the U-shaped trajectory
          that defines 20th-century inequality: extreme concentration before 1914, a dramatic &quot;Great
          Compression&quot; (1914&ndash;1970), then a sharp reversal &mdash; the &quot;Great Divergence&quot; &mdash;
          especially pronounced in Anglo-Saxon countries.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={incomeData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="top1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="top10Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bot50Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 55]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Share of National Income (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="natural" dataKey="top10" name="Top 10%" stroke="#F59E0B" fill="url(#top10Grad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <Area type="natural" dataKey="top1" name="Top 1%" stroke="#EF4444" fill="url(#top1Grad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <Area type="natural" dataKey="bottom50" name="Bottom 50%" stroke="#3B82F6" fill="url(#bot50Grad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <ReferenceLine x={1928} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} />
              <ReferenceLine x={1944} stroke={isDarkMode ? '#34d399' : '#059669'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} />
              <ReferenceLine x={1980} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`mt-3 flex gap-6 text-xs ${tc.textSec}`}>
          <span>Red dashed: peaks of inequality (1928, post-1980)</span>
          <span>Green dashed: peak of equality (1944)</span>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>The Elephant Curve: Globalisation&apos;s Winners and Losers</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          Branko Milanovic&apos;s famous chart shows cumulative income growth by global percentile (1988&ndash;2008).
          The shape reveals who benefited from globalisation: the global middle class (especially in China and
          India, around the 50th percentile), and the very richest (top 1%). Who lost? The lower-middle class
          of rich countries (around the 75th&ndash;85th global percentile) &mdash; the constituencies behind
          Brexit and Trump.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={ELEPHANT_CURVE} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="elephantGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="percentile" {...axisProps} label={{ value: 'Global Income Percentile', position: 'insideBottom', offset: -5, style: { fill: tc.axisLabel, fontSize: 10 } }} />
              <YAxis {...axisProps} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Cumulative Real Income Growth (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip suffix="th percentile" valueFormatter={(v: number) => `${v}%`} />} />
              <Area type="natural" dataKey="growthRate" name="Income Growth" stroke="#8B5CF6" fill="url(#elephantGrad)" strokeWidth={2.5} dot={{ r: 3, fill: isDarkMode ? '#111827' : '#fff', stroke: '#8B5CF6', strokeWidth: 2 }} activeDot={renderActiveDot} animationDuration={1200} />
              <ReferenceLine x={50} stroke={isDarkMode ? '#34d399' : '#059669'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} label={{ value: 'Global middle class', position: 'top', fill: isDarkMode ? '#6ee7b7' : '#047857', fontSize: 9 }} />
              <ReferenceLine x={80} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5} label={{ value: 'Rich-country lower-middle', position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`text-xs mt-3 ${tc.textSec}`}>
          Source: Based on Milanovic (2016). The &quot;elephant&quot; shape: the trunk rising at the right
          represents the global top 1%.
        </div>
      </div>

      {renderQuoteBlock(
        'Income inequality in the United States has returned to levels last seen in the 1920s. The top decile\'s share of national income exceeded 50% for the first time since 1928.',
        'Thomas Piketty & Emmanuel Saez', 'Income Inequality in the United States', 2003,
      )}
    </div>
  );

  // ── WEALTH INEQUALITY VIEW ──

  const renderWealth = () => (
    <div className="space-y-6">
      {renderCountrySelector(WEALTH_COUNTRIES)}

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Wealth Concentration: {selectedCountry}</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          Wealth inequality is always more extreme than income inequality. Before 1914, the top 1% in Europe
          owned 60&ndash;70% of all wealth. The 20th century saw dramatic de-concentration &mdash; through
          wars, inflation, progressive taxation, and the rise of a property-owning middle class. Since 1980,
          wealth has been re-concentrating, though it has not yet returned to Gilded Age levels.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={wealthData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="wTop1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="wTop10Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Share of Total Wealth (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="natural" dataKey="top10" name="Top 10%" stroke="#F59E0B" fill="url(#wTop10Grad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <Area type="natural" dataKey="top1" name="Top 1%" stroke="#EF4444" fill="url(#wTop1Grad)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Wealth Composition by Country</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          How wealth is held varies dramatically. In China and France, housing dominates (reflecting property
          booms). In the USA and Japan, financial assets are the largest category. The composition matters
          because different asset types are taxed and inherited differently.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={WEALTH_COMPOSITION} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="country" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="housing" name="Housing" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} animationDuration={1200} />
              <Bar dataKey="financial" name="Financial Assets" stackId="a" fill="#EF4444" animationDuration={1200} />
              <Bar dataKey="business" name="Business Assets" stackId="a" fill="#10B981" animationDuration={1200} />
              <Bar dataKey="pensions" name="Pensions" stackId="a" fill="#F59E0B" animationDuration={1200} />
              <Bar dataKey="other" name="Other" stackId="a" fill="#6B7280" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>The Return of Inheritance: France 1820&ndash;2020</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          Piketty shows that annual inheritance flows in France are returning to 19th-century levels.
          Before 1914, inherited wealth represented ~25% of national income annually. Wars and progressive
          taxation collapsed this to 5%. Now it&apos;s back above 15% and rising &mdash; meaning inherited
          wealth is once again becoming more important than earned income for life outcomes.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={inheritanceData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="inhFrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="inhUkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 30]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Annual Flow (% of National Income)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="natural" dataKey="France" name="France" stroke="#F59E0B" fill="url(#inhFrGrad)" strokeWidth={2.5} connectNulls dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <Area type="natural" dataKey="UK" name="UK" stroke="#EF4444" fill="url(#inhUkGrad)" strokeWidth={2.5} connectNulls dot={false} activeDot={renderActiveDot} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`text-xs mt-3 ${tc.textSec}`}>
          Source: Based on Piketty (2014) Figures 11.1&ndash;11.2.
        </div>
      </div>

      {renderQuoteBlock(
        'In all known societies, at all times, the least wealthy half of the population own virtually nothing. In France in 2010, the bottom 50% owned barely 5% of total wealth.',
        'Thomas Piketty', 'Capital in the Twenty-First Century', 2014,
      )}
    </div>
  );

  // ── HISTORICAL DYNAMICS VIEW ──

  const renderHistorical = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>The U-Shaped Curve of Inequality: 1910&ndash;2022</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The top 10% income share in the United States traces a dramatic U: extreme inequality in the Roaring
          Twenties, a sustained period of relative equality from the 1940s to the 1970s (&quot;The Great
          Compression&quot;), then a rapid return to pre-war levels (&quot;The Great Divergence&quot;). This is
          the defining chart of Piketty&apos;s argument: the egalitarian mid-century was an anomaly, not
          a norm.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={historicalUSData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="histTop10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="histTop1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 55]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="natural" dataKey="top10" name="Top 10% Share" stroke="#F59E0B" fill="url(#histTop10)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              <Area type="natural" dataKey="top1" name="Top 1% Share" stroke="#EF4444" fill="url(#histTop1)" strokeWidth={2.5} dot={false} activeDot={renderActiveDot} animationDuration={1200} />
              {/* Era annotations */}
              <ReferenceLine x={1928} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: 'Roaring 20s Peak', position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9 }} />
              <ReferenceLine x={1944} stroke={isDarkMode ? '#34d399' : '#059669'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: 'WWII / New Deal', position: 'top', fill: isDarkMode ? '#6ee7b7' : '#047857', fontSize: 9 }} />
              <ReferenceLine x={1980} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: 'Reagan/Thatcher', position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-5 ${tc.card}`} style={{ borderTop: '3px solid #10B981' }}>
          <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>The Great Compression (1914&ndash;1970)</h4>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            The most dramatic reduction of inequality in modern history. Caused by: (1) two world wars that
            destroyed capital; (2) hyperinflation that wiped out bondholders; (3) progressive taxation
            (top rates above 80%); (4) the welfare state and trade unions; (5) rapid economic growth that
            raised all incomes. This was <strong>not automatic</strong> &mdash; it required deliberate policy.
          </p>
        </div>
        <div className={`rounded-xl border p-5 ${tc.card}`} style={{ borderTop: '3px solid #EF4444' }}>
          <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>The Great Divergence (1980&ndash;Present)</h4>
          <p className={`text-sm leading-relaxed ${tc.textTer}`}>
            The reversal began with Reagan and Thatcher: top tax rates slashed, financial deregulation,
            weakened unions, globalisation. The top 1% share in the US doubled from 10% to over 20%.
            But crucially, this happened more in Anglo-Saxon countries than in continental Europe &mdash;
            proving it was <strong>policy, not technology</strong>, that drove the change.
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-4 ${tc.text}`}>Key Milestones in the History of Inequality</h3>
        <div className="space-y-2">
          {INEQUALITY_MILESTONES.map((m, i) => (
            <div key={i} className={`rounded-lg border p-3 cursor-pointer transition-all ${tc.card} ${tc.cardHover}`} onClick={() => setExpandedMilestone(expandedMilestone === i ? null : i)}>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded ${
                  m.direction === 'equalising' ? 'bg-emerald-500/10 text-emerald-500' :
                  m.direction === 'disequalising' ? 'bg-red-500/10 text-red-500' :
                  (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
                }`}>{m.year}</span>
                <span className={`text-sm font-medium flex-1 ${tc.text}`}>{m.event}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.direction === 'equalising' ? 'bg-emerald-500/10 text-emerald-500' :
                  m.direction === 'disequalising' ? 'bg-red-500/10 text-red-500' :
                  (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
                }`}>{m.direction === 'equalising' ? '↓ Equalising' : m.direction === 'disequalising' ? '↑ Disequalising' : '— Neutral'}</span>
                <span className={`text-xs ${tc.textSec}`}>{expandedMilestone === i ? '−' : '+'}</span>
              </div>
              {expandedMilestone === i && (
                <p className={`text-sm mt-2 pt-2 border-t ${tc.border} leading-relaxed ${tc.textTer}`}>{m.impact}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {renderQuoteBlock(
        'The history of inequality is shaped by the way economic, social, and political actors view what is just and what is not, as well as by the relative power of those actors. It is the joint product of all relevant actors combined.',
        'Thomas Piketty', 'Capital in the Twenty-First Century', 2014,
      )}
    </div>
  );

  // ── GLOBAL COMPARISON VIEW ──

  const renderGlobal = () => {
    const giniEntries = Object.entries(giniData).sort((a, b) => b[1] - a[1]);
    const ISO3_TO_NAME: Record<string, string> = {
      AFG:'Afghanistan',ALB:'Albania',DZA:'Algeria',AND:'Andorra',AGO:'Angola',ATG:'Antigua & Barbuda',
      ARG:'Argentina',ARM:'Armenia',AUS:'Australia',AUT:'Austria',AZE:'Azerbaijan',BHS:'Bahamas',
      BHR:'Bahrain',BGD:'Bangladesh',BRB:'Barbados',BLR:'Belarus',BEL:'Belgium',BLZ:'Belize',
      BEN:'Benin',BTN:'Bhutan',BOL:'Bolivia',BIH:'Bosnia & Herzegovina',BWA:'Botswana',BRA:'Brazil',
      BRN:'Brunei',BGR:'Bulgaria',BFA:'Burkina Faso',BDI:'Burundi',CPV:'Cabo Verde',KHM:'Cambodia',
      CMR:'Cameroon',CAN:'Canada',CAF:'Central African Rep.',TCD:'Chad',CHL:'Chile',CHN:'China',
      COL:'Colombia',COM:'Comoros',COG:'Congo',COD:'DR Congo',CRI:'Costa Rica',CIV:"Côte d'Ivoire",
      HRV:'Croatia',CUB:'Cuba',CYP:'Cyprus',CZE:'Czech Republic',DNK:'Denmark',DJI:'Djibouti',
      DOM:'Dominican Republic',ECU:'Ecuador',EGY:'Egypt',SLV:'El Salvador',GNQ:'Equatorial Guinea',
      ERI:'Eritrea',EST:'Estonia',SWZ:'Eswatini',ETH:'Ethiopia',FJI:'Fiji',FIN:'Finland',FRA:'France',
      GAB:'Gabon',GMB:'Gambia',GEO:'Georgia',DEU:'Germany',GHA:'Ghana',GRC:'Greece',GTM:'Guatemala',
      GIN:'Guinea',GNB:'Guinea-Bissau',GUY:'Guyana',HTI:'Haiti',HND:'Honduras',HUN:'Hungary',
      ISL:'Iceland',IND:'India',IDN:'Indonesia',IRN:'Iran',IRQ:'Iraq',IRL:'Ireland',ISR:'Israel',
      ITA:'Italy',JAM:'Jamaica',JPN:'Japan',JOR:'Jordan',KAZ:'Kazakhstan',KEN:'Kenya',KWT:'Kuwait',
      KGZ:'Kyrgyzstan',LAO:'Laos',LVA:'Latvia',LBN:'Lebanon',LSO:'Lesotho',LBR:'Liberia',LBY:'Libya',
      LTU:'Lithuania',LUX:'Luxembourg',MDG:'Madagascar',MWI:'Malawi',MYS:'Malaysia',MLI:'Mali',
      MLT:'Malta',MRT:'Mauritania',MUS:'Mauritius',MEX:'Mexico',MDA:'Moldova',MNG:'Mongolia',
      MNE:'Montenegro',MAR:'Morocco',MOZ:'Mozambique',MMR:'Myanmar',NAM:'Namibia',NPL:'Nepal',
      NLD:'Netherlands',NZL:'New Zealand',NIC:'Nicaragua',NER:'Niger',NGA:'Nigeria',PRK:'North Korea',
      MKD:'North Macedonia',NOR:'Norway',OMN:'Oman',PAK:'Pakistan',PAN:'Panama',PNG:'Papua New Guinea',
      PRY:'Paraguay',PER:'Peru',PHL:'Philippines',POL:'Poland',PRT:'Portugal',QAT:'Qatar',
      ROU:'Romania',RUS:'Russia',RWA:'Rwanda',SAU:'Saudi Arabia',SEN:'Senegal',SRB:'Serbia',
      SLE:'Sierra Leone',SGP:'Singapore',SVK:'Slovakia',SVN:'Slovenia',SLB:'Solomon Islands',
      SOM:'Somalia',ZAF:'South Africa',KOR:'South Korea',SSD:'South Sudan',ESP:'Spain',LKA:'Sri Lanka',
      SDN:'Sudan',SUR:'Suriname',SWE:'Sweden',CHE:'Switzerland',SYR:'Syria',TWN:'Taiwan',
      TJK:'Tajikistan',TZA:'Tanzania',THA:'Thailand',TLS:'Timor-Leste',TGO:'Togo',
      TTO:'Trinidad & Tobago',TUN:'Tunisia',TUR:'Turkey',TKM:'Turkmenistan',UGA:'Uganda',
      UKR:'Ukraine',ARE:'UAE',GBR:'United Kingdom',USA:'United States',URY:'Uruguay',
      UZB:'Uzbekistan',VEN:'Venezuela',VNM:'Vietnam',YEM:'Yemen',ZMB:'Zambia',ZWE:'Zimbabwe',
      PSE:'Palestine',XKX:'Kosovo',HKG:'Hong Kong',MAC:'Macao',
    };
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Global Gini Coefficients</h3>
          <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
            The Gini coefficient measures income inequality on a 0&ndash;100 scale. A value of 0 means
            perfect equality; 100 means all income goes to one person. Most countries fall between 25
            (Scandinavian countries) and 65 (South Africa). This map uses the latest available World Bank
            data.
          </p>
          <div className={`rounded-xl overflow-hidden relative ${tc.chartBg}`} style={{ height: 450 }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 130, center: [10, 30] }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup zoom={mapZoom} onMoveEnd={({ zoom }) => setMapZoom(zoom)}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) => geographies.map(geo => {
                    const numericId = String(geo.id);
                    const iso3 = NUMERIC_TO_ISO3[numericId] || '';
                    const val = giniData[iso3];
                    const isHovered = mapHovered === iso3;
                    return (
                      <Geography
                        key={geo.rpiKey || numericId}
                        geography={geo}
                        fill={val ? getGiniColor(val) : tc.land}
                        stroke={isHovered ? (isDarkMode ? '#f59e0b' : '#d97706') : tc.mapBorder}
                        strokeWidth={isHovered ? 1.5 : 0.5}
                        style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                        onMouseEnter={() => setMapHovered(iso3)}
                        onMouseLeave={() => setMapHovered(null)}
                      />
                    );
                  })}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            {mapHovered && giniData[mapHovered] && (
              <div className="absolute top-4 right-4 rounded-xl border shadow-lg backdrop-blur-sm p-3" style={{ background: tc.tooltipBg, borderColor: tc.tooltipBorder }}>
                <div className="text-sm font-bold" style={{ color: tc.tooltipText }}>{ISO3_TO_NAME[mapHovered] || mapHovered}</div>
                <div className="text-xs mt-1" style={{ color: tc.tooltipTextSec }}>Gini: <strong className="text-base" style={{ color: getGiniColor(giniData[mapHovered]) }}>{giniData[mapHovered].toFixed(1)}</strong></div>
              </div>
            )}
          </div>
          <div className={`mt-3 flex items-center gap-3 text-xs ${tc.textSec}`}>
            <span>Low inequality</span>
            <div className="flex h-3 rounded-full overflow-hidden flex-1 max-w-xs">
              <div className="flex-1" style={{ background: isDarkMode ? '#10B981' : '#059669' }} />
              <div className="flex-1" style={{ background: isDarkMode ? '#F59E0B' : '#D97706' }} />
              <div className="flex-1" style={{ background: isDarkMode ? '#F97316' : '#EA580C' }} />
              <div className="flex-1" style={{ background: isDarkMode ? '#EF4444' : '#DC2626' }} />
            </div>
            <span>High inequality</span>
            <button onClick={() => setMapZoom(1)} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>Reset zoom</button>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${tc.card}`}>
          <h3 className={`font-bold text-lg mb-3 ${tc.text}`}>Country Rankings by Gini Coefficient</h3>
          <p className={`text-sm mb-4 ${tc.textSec}`}>
            {giniEntries.length > 0 ? `Showing ${giniEntries.length} countries with available data.` : 'Loading data from World Bank...'}
          </p>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className={isDarkMode ? 'bg-gray-700/80' : 'bg-gray-100'}>
                  <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>#</th>
                  <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Country</th>
                  <th className={`px-4 py-2.5 text-right text-xs font-semibold ${tc.textSec}`}>Gini</th>
                  <th className={`px-4 py-2.5 text-left text-xs font-semibold ${tc.textSec}`}>Level</th>
                </tr>
              </thead>
              <tbody>
                {giniEntries.map(([iso3, val], i) => (
                  <tr key={iso3} className={`border-t ${tc.border}`}>
                    <td className={`px-4 py-2 tabular-nums ${tc.textSec}`}>{i + 1}</td>
                    <td className={`px-4 py-2 font-medium ${tc.text}`}>{ISO3_TO_NAME[iso3] || iso3}</td>
                    <td className="px-4 py-2 text-right font-bold tabular-nums" style={{ color: getGiniColor(val) }}>{val.toFixed(1)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${val < 30 ? 'bg-emerald-500/10 text-emerald-500' : val < 40 ? 'bg-amber-500/10 text-amber-500' : val < 50 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>
                        {val < 30 ? 'Low' : val < 40 ? 'Moderate' : val < 50 ? 'High' : 'Very High'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── TAX & POLICY VIEW ──

  const renderTax = () => (
    <div className="space-y-6">
      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Top Marginal Income Tax Rates (1900&ndash;2020)</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          The story of inequality in the 20th century is inseparable from the story of taxation. Top marginal
          rates rose dramatically during and after the World Wars (exceeding 90% in the US and UK), then
          collapsed during the neoliberal turn. Piketty argues this is the <strong>primary mechanism</strong>:
          when top rates were high, there was little incentive to extract extreme pay; when they fell, executive
          compensation and capital income exploded.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={taxData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} type="number" domain={[1900, 2025]} />
              <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} label={{ value: 'Top Marginal Rate (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axisLabel, fontSize: 10, fontWeight: 500 } }} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {TAX_COUNTRIES.map(c => (
                <Line key={c} type="natural" dataKey={`${c}_income`} name={`${c} Top Income`} stroke={COUNTRY_COLORS[c] || '#6b7280'} strokeWidth={2.5} connectNulls dot={{ r: 2.5, fill: isDarkMode ? '#111827' : '#fff', stroke: COUNTRY_COLORS[c] || '#6b7280', strokeWidth: 2 }} activeDot={renderActiveDot} animationDuration={1500} />
              ))}
              <ReferenceLine x={1944} stroke={isDarkMode ? '#34d399' : '#059669'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: 'US peak: 94%', position: 'top', fill: isDarkMode ? '#6ee7b7' : '#047857', fontSize: 9 }} />
              <ReferenceLine x={1981} stroke={isDarkMode ? '#f87171' : '#dc2626'} strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6} label={{ value: 'Reagan cuts', position: 'top', fill: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h3 className={`font-bold text-lg mb-2 ${tc.text}`}>Capital Gains vs Labour Income Taxation: USA</h3>
        <p className={`text-sm mb-5 leading-relaxed ${tc.textTer}`}>
          A critical source of inequality is the divergence between how labour income and capital income are
          taxed. In the US, capital gains have almost always been taxed at lower rates than wages. This means
          the richest Americans &mdash; whose income is predominantly from capital &mdash; face lower effective
          tax rates than their employees. Saez and Zucman (2019) showed that billionaires now pay a lower
          overall tax rate than the working class.
        </p>
        <div className={`rounded-xl p-4 ${tc.chartBg}`}>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={taxData.filter(d => d.USA_income != null)} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} type="number" domain={[1910, 2025]} />
              <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip content={<CustomTooltip valueFormatter={(v: number) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="natural" dataKey="USA_income" name="Top Income Rate" stroke="#EF4444" strokeWidth={2.5} connectNulls dot={false} activeDot={renderActiveDot} animationDuration={1500} />
              <Line type="natural" dataKey="USA_capital" name="Capital Gains Rate" stroke="#3B82F6" strokeWidth={2.5} connectNulls dot={false} activeDot={renderActiveDot} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={`text-xs mt-3 ${tc.textSec}`}>
          The gap between the two lines represents the tax advantage of capital over labour.
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold text-lg mb-3 ${tc.text}`}>Piketty&apos;s Policy Proposals</h4>
        <p className={`text-sm mb-4 leading-relaxed ${tc.textTer}`}>
          Piketty argues that without deliberate intervention, r &gt; g will drive wealth concentration
          indefinitely. His central proposal is a <strong>global progressive tax on net wealth</strong>,
          combined with significantly higher top income tax rates.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-lg p-4 ${tc.infoBg}`}>
            <div className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Global Wealth Tax</div>
            <ul className={`text-xs space-y-1.5 list-disc list-inside ${tc.textTer}`}>
              <li>0% on wealth below &euro;1 million</li>
              <li>1% on wealth &euro;1&ndash;5 million</li>
              <li>2% on wealth above &euro;5 million</li>
              <li>5&ndash;10% on wealth above &euro;1 billion</li>
            </ul>
            <p className={`text-xs mt-2 ${tc.textSec}`}>
              Purpose: prevent unlimited accumulation without confiscating existing wealth. Annual,
              not one-off. Requires international coordination to prevent capital flight.
            </p>
          </div>
          <div className={`rounded-lg p-4 ${tc.infoBg}`}>
            <div className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Progressive Income Tax</div>
            <ul className={`text-xs space-y-1.5 list-disc list-inside ${tc.textTer}`}>
              <li>Top marginal rate of 80%+ on income above $500k&ndash;$1m</li>
              <li>Capital gains taxed as ordinary income</li>
              <li>Corporate tax harmonisation to prevent arbitrage</li>
              <li>Inheritance tax with high exemption but steep progression</li>
            </ul>
            <p className={`text-xs mt-2 ${tc.textSec}`}>
              Historical precedent: the US had a 91% top rate from 1944&ndash;1964 and achieved
              its fastest economic growth in history.
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${tc.card}`}>
        <h4 className={`font-bold mb-2 ${tc.text}`}>Atkinson&apos;s 15 Proposals</h4>
        <p className={`text-sm leading-relaxed ${tc.textTer}`}>
          Tony Atkinson (2015) went further with 15 concrete measures: a guaranteed public employment
          programme, a minimum inheritance for all citizens at age 18, a progressive property tax,
          a &quot;participation income&quot; (conditional basic income), explicit technology policy
          favouring employment, strengthened collective bargaining, and a 65% top marginal rate. Atkinson
          stressed that inequality is a <strong>choice</strong>: &quot;If we want to reduce inequality,
          and if we are prepared to accept the consequences, there are steps we can take. They are not
          necessarily easy, and they involve trade-offs, but they exist.&quot;
        </p>
      </div>

      {renderQuoteBlock(
        'The tax system has become regressive at the very top: the richest 400 Americans now pay a lower total tax rate than any other group. The tax code treats a dollar of capital gains more favourably than a dollar earned through labour.',
        'Emmanuel Saez & Gabriel Zucman', 'The Triumph of Injustice', 2019,
      )}
    </div>
  );

  // ── Academic Sources ──

  const renderSources = () => (
    <div className={`rounded-xl border p-5 ${tc.card}`}>
      <h3 className={`font-bold text-lg mb-3 ${tc.text}`}>Academic Framework &amp; Sources</h3>
      <p className={`text-sm mb-4 ${tc.textTer}`}>
        This section draws on the most influential scholarship on economic inequality. Click each
        source to see its key contribution.
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

      {subView === 'rvsg' && renderRvsG()}
      {subView === 'kuznets' && renderKuznets()}
      {subView === 'income' && renderIncome()}
      {subView === 'wealth' && renderWealth()}
      {subView === 'historical' && renderHistorical()}
      {subView === 'global' && renderGlobal()}
      {subView === 'tax' && renderTax()}

      {renderSources()}
    </div>
  );
};

export default InequalityCharts;
