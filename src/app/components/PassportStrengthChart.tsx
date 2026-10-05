'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter, LabelList,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  culturalChartColors,
  softPowerRankings,
  passportHistoricalScores,
  gdpPerCapitaByCountry,
  passportStrengthByCountry,
  INTERNAL_KEY_TO_ISO2,
  ISO2_TO_INTERNAL_KEY,
} from '../data/culturalMetrics';
import {
  PassportProfile,
  PassportLiveData,
  VisaType,
  VISA_TYPE_LABELS,
  VISA_TYPE_COLORS,
  getAdvisoryTier,
  getMobilityTier,
} from '../services/passport';
import dynamic from 'next/dynamic';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const IsoFlag = dynamic(() => import('./IsoFlag'), {
  ssr: false,
  loading: () => <span className="inline-block w-6 h-4 rounded-sm bg-gray-200 dark:bg-gray-700" aria-hidden="true" />,
});

interface PassportStrengthChartProps {
  isDarkMode: boolean;
  passportData: Record<string, PassportProfile>; // keyed by ISO2
  selectedCountries: string[]; // internal keys
  onCountryChange: (countries: string[]) => void;
  updatedAt?: string;
  sources?: PassportLiveData['sources'];
}

type SortField = 'rank' | 'mobility' | 'change' | 'country' | 'avgStay' | 'eVisa' | 'advisory';
type ViewId =
  | 'table' | 'bar' | 'movers' | 'histogram' | 'scatter' | 'softpower'
  | 'radar' | 'trends' | 'regions' | 'tiers' | 'insights'
  | 'lengthOfStay' | 'visaTypes' | 'destinations' | 'reciprocity';

const DISPLAY_NAMES: Record<string, string> = {
  USA: 'United States', UK: 'United Kingdom', SouthKorea: 'South Korea',
  SouthAfrica: 'South Africa', SaudiArabia: 'Saudi Arabia', UAE: 'United Arab Emirates',
  NewZealand: 'New Zealand', CzechRepublic: 'Czech Republic', CostaRica: 'Costa Rica',
  NorthKorea: 'North Korea', NorthMacedonia: 'North Macedonia',
  DRCongo: 'DR Congo', DominicanRepublic: 'Dominican Republic',
  PapuaNewGuinea: 'Papua New Guinea', SriLanka: 'Sri Lanka',
  TrinidadAndTobago: 'Trinidad and Tobago',
};

const REGIONS: { label: string; color: string; colorDark: string; chartColor: string; countries: string[] }[] = [
  { label: 'Europe', color: 'text-blue-600', colorDark: 'text-blue-400', chartColor: '#3B82F6', countries: ['France', 'Germany', 'Italy', 'Spain', 'UK', 'Sweden', 'Norway', 'Netherlands', 'Switzerland', 'Belgium', 'Poland', 'Portugal', 'Denmark', 'Finland', 'Ireland', 'Austria', 'Greece', 'Malta', 'Hungary', 'CzechRepublic', 'Croatia', 'Estonia', 'Latvia', 'Lithuania', 'Iceland', 'Romania', 'Bulgaria', 'Cyprus', 'Slovakia', 'Slovenia', 'Luxembourg', 'Serbia', 'Albania', 'Ukraine'] },
  { label: 'Asia-Pacific', color: 'text-amber-600', colorDark: 'text-amber-400', chartColor: '#F59E0B', countries: ['Singapore', 'Japan', 'SouthKorea', 'China', 'India', 'Indonesia', 'Australia', 'NewZealand', 'Malaysia', 'Thailand', 'Philippines', 'Vietnam', 'Cambodia', 'Kazakhstan', 'Bangladesh', 'Nepal', 'Pakistan', 'Afghanistan'] },
  { label: 'Americas', color: 'text-emerald-600', colorDark: 'text-emerald-400', chartColor: '#10B981', countries: ['USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Uruguay', 'CostaRica', 'Paraguay', 'Peru', 'Colombia', 'Ecuador', 'Venezuela'] },
  { label: 'MENA & Africa', color: 'text-purple-600', colorDark: 'text-purple-400', chartColor: '#8B5CF6', countries: ['Turkey', 'SaudiArabia', 'Egypt', 'Israel', 'Nigeria', 'SouthAfrica', 'Russia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Morocco', 'Kenya', 'Ghana', 'Tunisia', 'Ethiopia', 'Iran', 'Iraq'] },
];

// Share of each axis's data range a dot's code label occupies, sized for the
// narrowest (mobile) plot so labels stay apart at every width.
const LABEL_GAP_X = 0.04;
const LABEL_GAP_Y = 0.06;

/**
 * Keys of the dots that can carry a code label without colliding with another
 * label. Isolated dots are placed first so outliers are always named; dots in
 * dense clusters may go unlabelled but still name themselves in the tooltip.
 */
function spacedLabelKeys<T extends { key: string }>(points: T[], x: (p: T) => number, y: (p: T) => number): Set<string> {
  if (points.length === 0) return new Set();
  const xs = points.map(x);
  const ys = points.map(y);
  const xRange = Math.max(...xs) - Math.min(...xs) || 1;
  const yRange = Math.max(...ys) - Math.min(...ys) || 1;
  const near = (a: T, b: T) =>
    Math.abs(x(a) - x(b)) / xRange < LABEL_GAP_X && Math.abs(y(a) - y(b)) / yRange < LABEL_GAP_Y;
  const crowding = new Map(points.map(p => [p.key, points.filter(q => q !== p && near(p, q)).length]));
  const placed: T[] = [];
  [...points]
    .sort((a, b) => (crowding.get(a.key) ?? 0) - (crowding.get(b.key) ?? 0))
    .forEach(p => { if (!placed.some(q => near(p, q))) placed.push(p); });
  return new Set(placed.map(p => p.key));
}

interface CountryDot {
  country: string;
  iso2: string;
  fill: string;
  region: string;
}

interface CountryDotTooltipProps<T extends CountryDot> {
  // Recharts injects these two.
  active?: boolean;
  payload?: Array<{ payload: T }>;
  isDarkMode: boolean;
  rows: (dot: T) => [label: string, value: string][];
}

function CountryDotTooltip<T extends CountryDot>({ active, payload, isDarkMode, rows }: CountryDotTooltipProps<T>) {
  const dot = active ? payload?.[0]?.payload : undefined;
  if (!dot) return null;
  return (
    <div className={`rounded-lg border px-3 py-2 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="flex items-center gap-2 font-semibold text-sm">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dot.fill }} />
        {dot.country}
        <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{dot.iso2}</span>
      </div>
      <div className={`text-xs mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{dot.region}</div>
      {rows(dot).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 text-xs">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
          <span className="font-medium tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}

const TREND_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'];

interface TableRow {
  country: string;
  iso2: string;
  rank: number;
  mobility: number;
  visaFree: number;
  visaOnArrival: number;
  eVisa: number;
  eta: number;
  visaRequired: number;
  avgStay: number;
  maxStay: number;
  advisory: number | null;
  change: number;
  tier: { label: string; color: string; colorDark: string };
}

const PassportStrengthChart: React.FC<PassportStrengthChartProps> = ({
  isDarkMode, passportData, selectedCountries, onCountryChange, updatedAt, sources,
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeView, setActiveView] = useState<ViewId>('table');
  const [destPassport, setDestPassport] = useState<string>('USA');
  const [destSearch, setDestSearch] = useState('');
  const [destVisaFilter, setDestVisaFilter] = useState<'all' | VisaType>('all');
  const [reciprocityA, setReciprocityA] = useState<string>('USA');
  const [reciprocityB, setReciprocityB] = useState<string>('Japan');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTertiary: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
    rowHover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
    headerBg: isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50',
    tooltipBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDarkMode ? '#374151' : '#E5E7EB',
    tooltipText: isDarkMode ? '#F3F4F6' : '#111827',
  };

  const displayName = (country: string) => DISPLAY_NAMES[country] || country;

  const tooltipStyle = {
    backgroundColor: themeColors.tooltipBg,
    border: `1px solid ${themeColors.tooltipBorder}`,
    borderRadius: '8px',
    color: themeColors.tooltipText,
  };

  // Build a view keyed by internal country key (so the existing cross-references work).
  const liveByInternalKey = useMemo(() => {
    const out: Record<string, PassportProfile> = {};
    Object.values(passportData).forEach(p => {
      const internal = ISO2_TO_INTERNAL_KEY[p.iso2];
      if (internal) out[internal] = p;
    });
    return out;
  }, [passportData]);

  // Internal keys that actually have live data, in mobility order.
  const trackedInternalKeys = useMemo(() => {
    return Object.keys(liveByInternalKey).sort((a, b) =>
      liveByInternalKey[b].totals.mobility - liveByInternalKey[a].totals.mobility
    );
  }, [liveByInternalKey]);

  // --- DATA COMPUTATIONS ---

  const tableData = useMemo<TableRow[]>(() => {
    const data = trackedInternalKeys.map(country => {
      const p = liveByInternalKey[country];
      const previous = passportStrengthByCountry[country]?.visaFreeDestinations ?? p.totals.mobility;
      return {
        country,
        iso2: p.iso2,
        rank: p.rank,
        mobility: p.totals.mobility,
        visaFree: p.totals.visaFree,
        visaOnArrival: p.totals.visaOnArrival,
        eVisa: p.totals.eVisa,
        eta: p.totals.eta,
        visaRequired: p.totals.visaRequired,
        avgStay: p.stay.avgDays,
        maxStay: p.stay.maxDays,
        advisory: p.avgAdvisory,
        change: p.totals.mobility - previous,
        tier: getMobilityTier(p.totals.mobility),
      };
    });
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'rank': cmp = a.rank - b.rank; break;
        case 'mobility': cmp = b.mobility - a.mobility; break;
        case 'change': cmp = b.change - a.change; break;
        case 'country': cmp = displayName(a.country).localeCompare(displayName(b.country)); break;
        case 'avgStay': cmp = b.avgStay - a.avgStay; break;
        case 'eVisa': cmp = b.eVisa - a.eVisa; break;
        case 'advisory':
          cmp = (a.advisory ?? 99) - (b.advisory ?? 99); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return data;
  }, [liveByInternalKey, trackedInternalKeys, sortField, sortAsc]);

  const [barMode, setBarMode] = useState<'all' | 'selected' | 'byRegion' | 'delta'>('all');

  const barDataAll = useMemo(() => {
    return tableData
      .map(row => {
        const region = REGIONS.find(r => r.countries.includes(row.country));
        return {
          country: displayName(row.country),
          key: row.country,
          visaFree: row.mobility,
          previous: passportStrengthByCountry[row.country]?.visaFreeDestinations ?? row.mobility,
          change: row.change,
          tierColor: isDarkMode ? row.tier.colorDark : row.tier.color,
          regionColor: region?.chartColor || '#8B5CF6',
          region: region?.label || 'Other',
        };
      })
      .sort((a, b) => b.visaFree - a.visaFree);
  }, [tableData, isDarkMode]);

  const barDataSelected = useMemo(() => {
    return barDataAll.filter(d => selectedCountries.includes(d.key));
  }, [barDataAll, selectedCountries]);

  const barDataByRegion = useMemo(() => {
    return REGIONS.map(region => {
      const tracked = region.countries.filter(c => liveByInternalKey[c]);
      const scores = tracked.map(c => liveByInternalKey[c].totals.mobility);
      const avg = tracked.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / tracked.length) : 0;
      const max = tracked.length > 0 ? Math.max(...scores) : 0;
      const min = tracked.length > 0 ? Math.min(...scores) : 0;
      return { region: region.label, avg, max, min, color: region.chartColor, count: tracked.length };
    });
  }, [liveByInternalKey]);

  const barDataDelta = useMemo(() => {
    return [...barDataAll].sort((a, b) => b.change - a.change);
  }, [barDataAll]);

  const tierDistribution = useMemo(() => {
    const tiers: Record<string, { count: number; color: string }> = {
      'Excellent': { count: 0, color: '#059669' },
      'Very Strong': { count: 0, color: '#10B981' },
      'Strong': { count: 0, color: '#0891B2' },
      'Moderate': { count: 0, color: '#D97706' },
      'Weak': { count: 0, color: '#EA580C' },
      'Very Weak': { count: 0, color: '#DC2626' },
    };
    Object.values(passportData).forEach(p => {
      const t = getMobilityTier(p.totals.mobility);
      tiers[t.label].count++;
    });
    return Object.entries(tiers)
      .filter(([, v]) => v.count > 0)
      .map(([label, v]) => ({ name: label, value: v.count, fill: v.color }));
  }, [passportData]);

  const regionStats = useMemo(() => {
    return REGIONS.map(region => {
      const tracked = region.countries.filter(c => liveByInternalKey[c]);
      const scores = tracked.map(c => liveByInternalKey[c].totals.mobility);
      const avg = tracked.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / tracked.length) : 0;
      const best = tracked.length > 0
        ? tracked.reduce((b, c) => liveByInternalKey[c].totals.mobility > liveByInternalKey[b].totals.mobility ? c : b, tracked[0])
        : null;
      const worst = tracked.length > 0
        ? tracked.reduce((w, c) => liveByInternalKey[c].totals.mobility < liveByInternalKey[w].totals.mobility ? c : w, tracked[0])
        : null;
      const stdDev = tracked.length > 1
        ? Math.round(Math.sqrt(scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length))
        : 0;
      const avgChange = tracked.length > 0
        ? Math.round(tracked.reduce((s, c) => {
          const cur = liveByInternalKey[c].totals.mobility;
          const prev = passportStrengthByCountry[c]?.visaFreeDestinations ?? cur;
          return s + (cur - prev);
        }, 0) / tracked.length * 10) / 10
        : 0;
      return { ...region, avg, best, worst, tracked: tracked.length, stdDev, avgChange, maxScore: Math.max(...scores, 0), minScore: Math.min(...scores, 0) };
    });
  }, [liveByInternalKey]);

  const moversData = useMemo(() => {
    const all = tableData.map(row => ({
      country: row.country,
      change: row.change,
      score: row.mobility,
    })).filter(d => d.change !== 0);
    const gainers = [...all].sort((a, b) => b.change - a.change).slice(0, 10);
    const losers = [...all].sort((a, b) => a.change - b.change).slice(0, 10);
    return { gainers, losers };
  }, [tableData]);

  const histogramData = useMemo(() => {
    const buckets: { range: string; count: number; min: number }[] = [];
    for (let i = 0; i <= 190; i += 10) {
      buckets.push({ range: `${i}-${i + 9}`, count: 0, min: i });
    }
    Object.values(passportData).forEach(p => {
      const score = p.totals.mobility;
      const idx = Math.min(Math.floor(score / 10), buckets.length - 1);
      if (idx >= 0) buckets[idx].count++;
    });
    return buckets.filter(b => b.count > 0);
  }, [passportData]);

  const mobilityGap = useMemo(() => {
    const scores = Object.values(passportData).map(p => p.totals.mobility);
    if (scores.length === 0) return { max: 0, min: 0, gap: 0, avg: 0, median: 0, total: 0 };
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const median = [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)];
    return { max, min, gap: max - min, avg, median, total: scores.length };
  }, [passportData]);

  const scatterData = useMemo(() => {
    const points = trackedInternalKeys
      .filter(c => gdpPerCapitaByCountry[c])
      .map(country => {
        const p = liveByInternalKey[country];
        const region = REGIONS.find(r => r.countries.includes(country));
        return {
          country: displayName(country),
          key: country,
          iso2: p.iso2,
          rank: p.rank,
          gdp: Math.round(gdpPerCapitaByCountry[country] / 1000),
          visaFree: p.totals.mobility,
          fill: region?.chartColor || '#8B5CF6',
          region: region?.label || 'Other',
        };
      });
    const labelled = spacedLabelKeys(points, d => d.gdp, d => d.visaFree);
    return points.map(d => ({ ...d, label: labelled.has(d.key) ? d.iso2 : undefined }));
  }, [liveByInternalKey, trackedInternalKeys]);

  const softPowerData = useMemo(() => {
    const points = trackedInternalKeys
      .filter(c => softPowerRankings[c])
      .map(country => {
        const p = liveByInternalKey[country];
        const region = REGIONS.find(r => r.countries.includes(country));
        return {
          country: displayName(country),
          key: country,
          iso2: p.iso2,
          passportRank: p.rank,
          softPowerRank: softPowerRankings[country].rank,
          softPowerScore: softPowerRankings[country].score,
          visaFree: p.totals.mobility,
          gap: Math.abs(p.rank - softPowerRankings[country].rank),
          fill: region?.chartColor || '#8B5CF6',
          region: region?.label || 'Other',
        };
      })
      .sort((a, b) => b.gap - a.gap);
    const labelled = spacedLabelKeys(points, d => d.softPowerRank, d => d.passportRank);
    return points.map(d => ({ ...d, label: labelled.has(d.key) ? d.iso2 : undefined }));
  }, [liveByInternalKey, trackedInternalKeys]);

  const radarData = useMemo(() => {
    const metrics = ['Avg Score', 'Best Passport', 'Consistency', 'YoY Change', 'Coverage'];
    const maxAvg = Math.max(...regionStats.map(r => r.avg), 1);
    const maxMax = Math.max(...regionStats.map(r => r.maxScore), 1);
    const maxTracked = Math.max(...regionStats.map(r => r.tracked), 1);

    return metrics.map(metric => {
      const entry: Record<string, string | number> = { metric };
      regionStats.forEach(r => {
        let val = 0;
        switch (metric) {
          case 'Avg Score': val = (r.avg / maxAvg) * 100; break;
          case 'Best Passport': val = (r.maxScore / maxMax) * 100; break;
          case 'Consistency': val = r.stdDev > 0 ? Math.max(0, 100 - r.stdDev) : 100; break;
          case 'YoY Change': val = 50 + r.avgChange * 5; break;
          case 'Coverage': val = (r.tracked / maxTracked) * 100; break;
        }
        entry[r.label] = Math.round(Math.max(0, Math.min(100, val)));
      });
      return entry;
    });
  }, [regionStats]);

  const trendData = useMemo(() => {
    const countries = selectedCountries.filter(c =>
      passportHistoricalScores.some(row => row[c] !== undefined)
    );
    return passportHistoricalScores.map(row => {
      const entry: Record<string, number | string> = { year: row.year };
      countries.forEach(c => {
        if (row[c] !== undefined) entry[c] = row[c];
      });
      return entry;
    });
  }, [selectedCountries]);

  const trendCountries = useMemo(() => {
    return selectedCountries.filter(c =>
      passportHistoricalScores.some(row => row[c] !== undefined)
    );
  }, [selectedCountries]);

  // ===== NEW: LENGTH OF STAY =====
  const lengthOfStayData = useMemo(() => {
    return tableData
      .slice()
      .sort((a, b) => b.avgStay - a.avgStay)
      .map(row => ({
        key: row.country,
        country: displayName(row.country),
        avgDays: row.avgStay,
        maxDays: row.maxStay,
        medianDays: liveByInternalKey[row.country].stay.medianDays,
        bucket0to29: liveByInternalKey[row.country].stay.bucket0to29,
        bucket30to89: liveByInternalKey[row.country].stay.bucket30to89,
        bucket90to179: liveByInternalKey[row.country].stay.bucket90to179,
        bucket180Plus: liveByInternalKey[row.country].stay.bucket180Plus,
        unlimited: liveByInternalKey[row.country].stay.unlimited,
      }));
  }, [tableData, liveByInternalKey]);

  // ===== NEW: VISA TYPES =====
  const visaTypesData = useMemo(() => {
    return tableData
      .slice()
      .sort((a, b) => b.mobility - a.mobility)
      .map(row => ({
        key: row.country,
        country: displayName(row.country),
        visaFree: row.visaFree,
        visaOnArrival: row.visaOnArrival,
        eta: row.eta,
        eVisa: row.eVisa,
        visaRequired: row.visaRequired,
      }));
  }, [tableData]);

  const overallVisaTypePie = useMemo(() => {
    const totals: Record<VisaType, number> = {
      'visa-free': 0, 'visa-on-arrival': 0, eta: 0, 'e-visa': 0,
      'visa-required': 0, 'no-admission': 0,
    };
    Object.values(passportData).forEach(p => {
      totals['visa-free'] += p.totals.visaFree;
      totals['visa-on-arrival'] += p.totals.visaOnArrival;
      totals.eta += p.totals.eta;
      totals['e-visa'] += p.totals.eVisa;
      totals['visa-required'] += p.totals.visaRequired;
      totals['no-admission'] += p.totals.noAdmission;
    });
    return (Object.keys(totals) as VisaType[]).map(t => ({
      name: VISA_TYPE_LABELS[t],
      visaType: t,
      value: totals[t],
      fill: isDarkMode ? VISA_TYPE_COLORS[t].dark : VISA_TYPE_COLORS[t].light,
    })).filter(d => d.value > 0);
  }, [passportData, isDarkMode]);

  // ===== NEW: DESTINATIONS DRILL-DOWN =====
  const destinationsRows = useMemo(() => {
    const profile = liveByInternalKey[destPassport];
    if (!profile) return [];
    const q = destSearch.trim().toLowerCase();
    return profile.destinations
      .filter(d => destVisaFilter === 'all' ? true : d.visaType === destVisaFilter)
      .filter(d => q === '' ? true :
        d.name.toLowerCase().includes(q) ||
        d.iso2.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [liveByInternalKey, destPassport, destSearch, destVisaFilter]);

  // ===== NEW: RECIPROCITY =====
  const reciprocityAToB = useMemo(() => {
    const a = liveByInternalKey[reciprocityA];
    const isoB = INTERNAL_KEY_TO_ISO2[reciprocityB];
    if (!a || !isoB) return null;
    return a.destinations.find(d => d.iso2 === isoB) || null;
  }, [liveByInternalKey, reciprocityA, reciprocityB]);

  const reciprocityBToA = useMemo(() => {
    const b = liveByInternalKey[reciprocityB];
    const isoA = INTERNAL_KEY_TO_ISO2[reciprocityA];
    if (!b || !isoA) return null;
    return b.destinations.find(d => d.iso2 === isoA) || null;
  }, [liveByInternalKey, reciprocityA, reciprocityB]);

  // --- HANDLERS ---

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(field === 'rank' || field === 'country' || field === 'advisory'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-xs opacity-50">
      {sortField === field ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  const TABS: { id: ViewId; label: string }[] = [
    { id: 'table', label: 'Ranking' },
    { id: 'destinations', label: 'Visa Details' },
    { id: 'lengthOfStay', label: 'Length of Stay' },
    { id: 'visaTypes', label: 'Visa Types' },
    { id: 'reciprocity', label: 'Reciprocity' },
    { id: 'bar', label: 'Bar Chart' },
    { id: 'movers', label: 'Movers' },
    { id: 'histogram', label: 'Distribution' },
    { id: 'scatter', label: 'GDP Link' },
    { id: 'softpower', label: 'Soft Power' },
    { id: 'radar', label: 'Radar' },
    { id: 'trends', label: 'Trends' },
    { id: 'regions', label: 'Regions' },
    { id: 'tiers', label: 'Tiers' },
    { id: 'insights', label: 'Insights' },
  ];

  const renderVisaBadge = (visaType: VisaType) => {
    const c = isDarkMode ? VISA_TYPE_COLORS[visaType].dark : VISA_TYPE_COLORS[visaType].light;
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: c + '22', color: c }}>
        {VISA_TYPE_LABELS[visaType]}
      </span>
    );
  };

  const renderAdvisoryBadge = (score: number | null) => {
    const tier = getAdvisoryTier(score);
    const c = isDarkMode ? tier.colorDark : tier.color;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: c + '22', color: c }}>
        {score === null ? '—' : score.toFixed(1)} · {tier.label}
      </span>
    );
  };

  const formattedUpdatedAt = updatedAt
    ? new Date(updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const passportCount = Object.keys(passportData).length;
  const destinationCount = Object.values(passportData)[0]?.destinations.length || 0;

  const viewShareTitle = `Passport Strength Analysis — ${TABS.find(tab => tab.id === activeView)?.label ?? ''}`;
  const viewHasOwnShares = activeView === 'lengthOfStay' || activeView === 'visaTypes'
    || activeView === 'histogram' || activeView === 'insights';

  return (
    <div className="space-y-6">
      <div id={viewHasOwnShares ? undefined : slugify(viewShareTitle)} className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
        {/* Header + tabs */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Passport Strength Analysis</h2>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                Live Passport Index &mdash; {passportCount} passports &times; {destinationCount} destinations
                {formattedUpdatedAt && <> &middot; refreshed {formattedUpdatedAt}</>}
              </p>
              {sources && (
                <p className={`text-[11px] mt-1 ${themeColors.textTertiary}`}>
                  Sources: Passport Index Dataset
                  {sources.passportIndex.ok ? '' : ' (offline)'}
                  {' · '}Country reference data
                  {sources.countries.ok ? '' : ' (offline)'}
                  {' · '}Government of Canada travel advice
                  {sources.travelAdvisory.ok ? '' : ' (offline)'}
                </p>
              )}
            </div>
            {!viewHasOwnShares && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <SocialShareMenu
                  title={viewShareTitle}
                  subject={activeView === 'table' || activeView === 'destinations' ? 'dataset' : 'chart'}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
          </div>
          <div className={`flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === tab.id
                    ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-white text-gray-900 shadow'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== RANKING TABLE ===== */}
        {activeView === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={themeColors.headerBg}>
                  {([
                    { field: 'rank' as SortField, label: 'Rank' },
                    { field: 'country' as SortField, label: 'Country' },
                    { field: 'mobility' as SortField, label: 'Mobility Score' },
                    { field: 'change' as SortField, label: 'Change vs Henley 2024' },
                    { field: 'avgStay' as SortField, label: 'Avg Stay (days)' },
                    { field: 'eVisa' as SortField, label: 'eVisa #' },
                    { field: 'advisory' as SortField, label: 'Avg Advisory' },
                  ]).map(col => (
                    <th key={col.field} onClick={() => handleSort(col.field)}
                      className={`px-3 py-3 text-left font-semibold cursor-pointer select-none ${col.field === 'rank' ? 'w-14' : ''}`}>
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th className="px-3 py-3 text-left font-semibold">Tier</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.country} className={`border-t ${themeColors.border} ${themeColors.rowHover} transition-colors`}>
                    <td className="px-3 py-3 font-bold text-lg" style={{ color: isDarkMode ? row.tier.colorDark : row.tier.color }}>#{row.rank}</td>
                    <td className="px-3 py-3 font-medium">{displayName(row.country)}</td>
                    <td className="px-3 py-3 font-bold">{row.mobility}</td>
                    <td className="px-3 py-3">
                      <span className={row.change > 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : row.change < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : themeColors.textSecondary}>
                        {row.change > 0 ? `+${row.change}` : row.change === 0 ? '0' : row.change}
                      </span>
                    </td>
                    <td className="px-3 py-3">{row.avgStay > 0 ? row.avgStay : '—'}</td>
                    <td className="px-3 py-3">{row.eVisa}</td>
                    <td className="px-3 py-3">{renderAdvisoryBadge(row.advisory)}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: (isDarkMode ? row.tier.colorDark : row.tier.color) + '20', color: isDarkMode ? row.tier.colorDark : row.tier.color }}>
                        {row.tier.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={`text-[11px] mt-3 ${themeColors.textTertiary}`}>
              Mobility Score = visa-free + visa-on-arrival + ETA destinations (live count from the Passport Index dataset). eVisa is shown separately because it normally requires advance application.
            </p>
          </div>
        )}

        {/* ===== DESTINATIONS DRILL-DOWN ===== */}
        {activeView === 'destinations' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className={`block text-xs mb-1 ${themeColors.textSecondary}`}>Passport</label>
                <select
                  value={destPassport}
                  onChange={e => setDestPassport(e.target.value)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300'}`}
                >
                  {trackedInternalKeys.map(k => (
                    <option key={k} value={k}>{displayName(k)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${themeColors.textSecondary}`}>Filter</label>
                <select
                  value={destVisaFilter}
                  onChange={e => setDestVisaFilter(e.target.value as any)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">All destinations</option>
                  <option value="visa-free">Visa-Free only</option>
                  <option value="visa-on-arrival">Visa on Arrival only</option>
                  <option value="eta">ETA only</option>
                  <option value="e-visa">eVisa only</option>
                  <option value="visa-required">Visa Required only</option>
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className={`block text-xs mb-1 ${themeColors.textSecondary}`}>Search</label>
                <input
                  value={destSearch}
                  onChange={e => setDestSearch(e.target.value)}
                  placeholder="Search country, ISO, or region…"
                  className={`w-full px-3 py-1.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {liveByInternalKey[destPassport] && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { label: 'Visa-Free', value: liveByInternalKey[destPassport].totals.visaFree, t: 'visa-free' as VisaType },
                  { label: 'VOA', value: liveByInternalKey[destPassport].totals.visaOnArrival, t: 'visa-on-arrival' as VisaType },
                  { label: 'ETA', value: liveByInternalKey[destPassport].totals.eta, t: 'eta' as VisaType },
                  { label: 'eVisa', value: liveByInternalKey[destPassport].totals.eVisa, t: 'e-visa' as VisaType },
                  { label: 'Visa Required', value: liveByInternalKey[destPassport].totals.visaRequired, t: 'visa-required' as VisaType },
                  { label: 'Avg Stay', value: liveByInternalKey[destPassport].stay.avgDays || '—', t: null },
                  { label: 'Max Stay', value: liveByInternalKey[destPassport].stay.maxDays || '—', t: null },
                ].map(s => {
                  const c = s.t ? (isDarkMode ? VISA_TYPE_COLORS[s.t].dark : VISA_TYPE_COLORS[s.t].light) : (isDarkMode ? '#A78BFA' : '#7C3AED');
                  return (
                    <div key={s.label} className={`p-2.5 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <div className="text-xl font-bold" style={{ color: c }}>{s.value}</div>
                      <div className={`text-[10px] ${themeColors.textSecondary}`}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={`overflow-x-auto rounded-lg border ${themeColors.border}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={themeColors.headerBg}>
                    <th className="px-3 py-2 text-left font-semibold">Flag</th>
                    <th className="px-3 py-2 text-left font-semibold">Destination</th>
                    <th className="px-3 py-2 text-left font-semibold">ISO</th>
                    <th className="px-3 py-2 text-left font-semibold">Region</th>
                    <th className="px-3 py-2 text-left font-semibold">Visa Type</th>
                    <th className="px-3 py-2 text-left font-semibold">Length of Stay</th>
                    <th className="px-3 py-2 text-left font-semibold">Advisory</th>
                  </tr>
                </thead>
                <tbody>
                  {destinationsRows.map((d) => (
                    <tr key={d.iso2} className={`border-t ${themeColors.border}`}>
                      <td className="px-3 py-2"><IsoFlag iso2={d.iso2} title={d.name} /></td>
                      <td className="px-3 py-2 font-medium">{d.name}</td>
                      <td className="px-3 py-2 text-xs">{d.iso2}</td>
                      <td className={`px-3 py-2 text-xs ${themeColors.textSecondary}`}>{d.region}{d.subregion ? ` · ${d.subregion}` : ''}</td>
                      <td className="px-3 py-2">{renderVisaBadge(d.visaType)}</td>
                      <td className="px-3 py-2">
                        {d.lengthOfStayDays
                          ? <span className="font-semibold">{d.lengthOfStayDays} days</span>
                          : d.visaType === 'visa-required' || d.visaType === 'no-admission'
                            ? <span className={themeColors.textTertiary}>—</span>
                            : <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>Unlimited / per visa</span>
                        }
                      </td>
                      <td className="px-3 py-2">{renderAdvisoryBadge(d.advisoryScore)}</td>
                    </tr>
                  ))}
                  {destinationsRows.length === 0 && (
                    <tr><td colSpan={7} className={`px-3 py-6 text-center ${themeColors.textSecondary}`}>No destinations match the current filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={`text-[11px] ${themeColors.textTertiary}`}>
              Length-of-stay values are reported by the Passport Index dataset (sourced from passportindex.org). &quot;Unlimited / per visa&quot; means the visa policy doesn&apos;t specify a fixed day cap (often Schengen-style internal mobility). Advisory levels are from the Government of Canada&apos;s travel advice (0 = normal precautions, 1 = high degree of caution, 2 = avoid non-essential travel, 3 = avoid all travel).
            </p>
          </div>
        )}

        {/* ===== LENGTH OF STAY ===== */}
        {activeView === 'lengthOfStay' && (
          <div className="space-y-6">
            <div id={slugify('Average Length of Stay (visa-free / VOA / ETA destinations)')}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <h3 className="font-semibold">Average Length of Stay (visa-free / VOA / ETA destinations)</h3>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Average Length of Stay (visa-free / VOA / ETA destinations)" isDarkMode={isDarkMode} />
                </div>
              </div>
              <div className="w-full" style={{ height: `${Math.max(400, lengthOfStayData.length * 22)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lengthOfStayData} layout="vertical" margin={{ top: 5, right: 20, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                      label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: themeColors.tickColor, fontSize: 11 }} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number, name: string) => [`${value} days`, name === 'avgDays' ? 'Average Stay' : name === 'maxDays' ? 'Max Stay' : 'Median Stay']} />
                    <Legend formatter={(v: string) => v === 'avgDays' ? 'Average Stay' : v === 'maxDays' ? 'Max Stay' : 'Median Stay'} />
                    <Bar dataKey="avgDays" fill={isDarkMode ? '#60A5FA' : '#3B82F6'} radius={[0, 3, 3, 0]} barSize={9} name="avgDays" />
                    <Bar dataKey="medianDays" fill={isDarkMode ? '#A78BFA' : '#7C3AED'} radius={[0, 3, 3, 0]} barSize={9} name="medianDays" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id={slugify('Stay Length Distribution (per passport)')}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <h3 className="font-semibold">Stay Length Distribution (per passport)</h3>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Stay Length Distribution (per passport)" isDarkMode={isDarkMode} />
                </div>
              </div>
              <div className="w-full" style={{ height: `${Math.max(400, lengthOfStayData.length * 22)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lengthOfStayData} layout="vertical" stackOffset="expand" margin={{ top: 5, right: 20, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: themeColors.tickColor, fontSize: 11 }} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          bucket0to29: '< 30 days', bucket30to89: '30–89 days',
                          bucket90to179: '90–179 days', bucket180Plus: '180+ days',
                          unlimited: 'Unlimited / per visa',
                        };
                        return [`${value} destinations`, labels[name] || name];
                      }} />
                    <Legend formatter={(v: string) => ({
                      bucket0to29: '< 30 days', bucket30to89: '30–89 days',
                      bucket90to179: '90–179 days', bucket180Plus: '180+ days',
                      unlimited: 'Unlimited / per visa',
                    } as Record<string, string>)[v] || v} />
                    <Bar dataKey="bucket0to29" stackId="s" fill="#FBBF24" name="bucket0to29" />
                    <Bar dataKey="bucket30to89" stackId="s" fill="#34D399" name="bucket30to89" />
                    <Bar dataKey="bucket90to179" stackId="s" fill="#22D3EE" name="bucket90to179" />
                    <Bar dataKey="bucket180Plus" stackId="s" fill="#A78BFA" name="bucket180Plus" />
                    <Bar dataKey="unlimited" stackId="s" fill="#F472B6" name="unlimited" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ===== VISA TYPES ===== */}
        {activeView === 'visaTypes' && (
          <div className="space-y-6">
            <div id={slugify('Global Visa Policy Mix')} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overallVisaTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={50} outerRadius={110} paddingAngle={2}
                      label={({ name, value }) => `${name} (${value.toLocaleString()})`}>
                      {overallVisaTypePie.map((entry) => (<Cell key={entry.visaType} fill={entry.fill} />))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value.toLocaleString()} pairs`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold">Global Visa Policy Mix</h3>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <SocialShareMenu title="Global Visa Policy Mix" isDarkMode={isDarkMode} />
                  </div>
                </div>
                <p className={`text-sm ${themeColors.textSecondary}`}>
                  Across every tracked passport-destination pair in the live dataset.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {overallVisaTypePie.map(d => (
                    <div key={d.visaType} className={`flex items-center justify-between p-2 rounded ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id={slugify('Visa Policy Breakdown per Passport')}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <h3 className="font-semibold">Visa Policy Breakdown per Passport</h3>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Visa Policy Breakdown per Passport" isDarkMode={isDarkMode} />
                </div>
              </div>
              <div className="w-full" style={{ height: `${Math.max(420, visaTypesData.length * 22)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visaTypesData} layout="vertical" margin={{ top: 5, right: 20, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 11 }} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          visaFree: 'Visa-Free', visaOnArrival: 'Visa on Arrival',
                          eta: 'ETA', eVisa: 'eVisa', visaRequired: 'Visa Required',
                        };
                        return [`${value} destinations`, labels[name] || name];
                      }} />
                    <Legend formatter={(v: string) => ({
                      visaFree: 'Visa-Free', visaOnArrival: 'Visa on Arrival',
                      eta: 'ETA', eVisa: 'eVisa', visaRequired: 'Visa Required',
                    } as Record<string, string>)[v] || v} />
                    <Bar dataKey="visaFree" stackId="v" fill={isDarkMode ? VISA_TYPE_COLORS['visa-free'].dark : VISA_TYPE_COLORS['visa-free'].light} name="visaFree" />
                    <Bar dataKey="visaOnArrival" stackId="v" fill={isDarkMode ? VISA_TYPE_COLORS['visa-on-arrival'].dark : VISA_TYPE_COLORS['visa-on-arrival'].light} name="visaOnArrival" />
                    <Bar dataKey="eta" stackId="v" fill={isDarkMode ? VISA_TYPE_COLORS.eta.dark : VISA_TYPE_COLORS.eta.light} name="eta" />
                    <Bar dataKey="eVisa" stackId="v" fill={isDarkMode ? VISA_TYPE_COLORS['e-visa'].dark : VISA_TYPE_COLORS['e-visa'].light} name="eVisa" />
                    <Bar dataKey="visaRequired" stackId="v" fill={isDarkMode ? VISA_TYPE_COLORS['visa-required'].dark : VISA_TYPE_COLORS['visa-required'].light} name="visaRequired" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ===== RECIPROCITY ===== */}
        {activeView === 'reciprocity' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Compare visa rules in both directions. Many country pairs have asymmetric rules — e.g. visa-free one way, visa-required the other — which reveals the diplomatic balance of mobility.
            </p>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className={`block text-xs mb-1 ${themeColors.textSecondary}`}>Passport A</label>
                <select value={reciprocityA} onChange={e => setReciprocityA(e.target.value)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300'}`}>
                  {trackedInternalKeys.map(k => <option key={k} value={k}>{displayName(k)}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${themeColors.textSecondary}`}>Passport B</label>
                <select value={reciprocityB} onChange={e => setReciprocityB(e.target.value)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300'}`}>
                  {trackedInternalKeys.map(k => <option key={k} value={k}>{displayName(k)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { from: reciprocityA, to: reciprocityB, rule: reciprocityAToB },
                { from: reciprocityB, to: reciprocityA, rule: reciprocityBToA },
              ].map(({ from, to, rule }) => (
                <div key={`${from}-${to}`} className={`p-5 rounded-lg border ${themeColors.border} ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="text-sm mb-3">
                    <span className={themeColors.textSecondary}>Direction:</span>{' '}
                    <span className="font-semibold">{displayName(from)} → {displayName(to)}</span>
                  </div>
                  {rule ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${themeColors.textSecondary}`}>Visa Type</span>
                        {renderVisaBadge(rule.visaType)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${themeColors.textSecondary}`}>Length of Stay</span>
                        <span className="font-bold">
                          {rule.lengthOfStayDays
                            ? `${rule.lengthOfStayDays} days`
                            : rule.visaType === 'visa-required' || rule.visaType === 'no-admission'
                              ? '—'
                              : 'Unlimited / per visa'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${themeColors.textSecondary}`}>Travel Advisory</span>
                        {renderAdvisoryBadge(rule.advisoryScore)}
                      </div>
                      {rule.advisoryMessage && (
                        <p className={`text-[11px] mt-2 ${themeColors.textTertiary}`}>
                          {rule.advisoryMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={`text-sm ${themeColors.textSecondary}`}>No live data for this direction.</p>
                  )}
                </div>
              ))}
            </div>

            {reciprocityAToB && reciprocityBToA && reciprocityAToB.visaType !== reciprocityBToA.visaType && (
              <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
                Asymmetric pair detected: {displayName(reciprocityA)} passport gets <strong>{VISA_TYPE_LABELS[reciprocityAToB.visaType]}</strong> into {displayName(reciprocityB)},
                while {displayName(reciprocityB)} passport gets <strong>{VISA_TYPE_LABELS[reciprocityBToA.visaType]}</strong> into {displayName(reciprocityA)}.
              </div>
            )}
          </div>
        )}

        {/* ===== BAR CHART ===== */}
        {activeView === 'bar' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all' as const, label: `All Countries (${barDataAll.length})` },
                { id: 'selected' as const, label: `Selected (${barDataSelected.length})` },
                { id: 'byRegion' as const, label: 'By Region' },
                { id: 'delta' as const, label: 'Score Change' },
              ]).map(opt => (
                <button key={opt.id} onClick={() => setBarMode(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    barMode === opt.id
                      ? isDarkMode ? 'bg-purple-600 border-purple-500 text-white' : 'bg-purple-100 border-purple-300 text-purple-800'
                      : isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {barMode === 'all' && (
              <div className="w-full" style={{ height: `${Math.max(500, barDataAll.length * 22)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barDataAll} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 11 }} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number, name: string) => [value, name === 'visaFree' ? 'Live Mobility' : 'Henley 2024']} />
                    <Legend formatter={(v: string) => v === 'visaFree' ? 'Live Mobility Score' : 'Henley 2024 (reference)'} />
                    <Bar dataKey="previous" fill={isDarkMode ? '#4B5563' : '#D1D5DB'} radius={[0, 3, 3, 0]} barSize={9} name="previous" />
                    <Bar dataKey="visaFree" radius={[0, 3, 3, 0]} barSize={9} name="visaFree">
                      {barDataAll.map((entry) => (<Cell key={entry.key} fill={entry.tierColor} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {barMode === 'selected' && (
              barDataSelected.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className={themeColors.textSecondary}>No selected countries have passport data. Use the Country Comparison tab to select countries.</p>
                </div>
              ) : (
                <div className="w-full" style={{ height: `${Math.max(300, barDataSelected.length * 40)}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barDataSelected} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                      <XAxis type="number" domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                      <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 11 }} width={105} interval={0} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => [value, name === 'visaFree' ? 'Live Mobility' : 'Henley 2024']} />
                      <Legend formatter={(v: string) => v === 'visaFree' ? 'Live Mobility Score' : 'Henley 2024 (reference)'} />
                      <Bar dataKey="previous" fill={isDarkMode ? '#4B5563' : '#D1D5DB'} radius={[0, 4, 4, 0]} barSize={16} name="previous" />
                      <Bar dataKey="visaFree" radius={[0, 4, 4, 0]} barSize={16} name="visaFree">
                        {barDataSelected.map((entry) => (<Cell key={entry.key} fill={culturalChartColors[entry.key] || entry.tierColor} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            )}

            {barMode === 'byRegion' && (
              <div className="space-y-4">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barDataByRegion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                      <XAxis dataKey="region" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                      <YAxis domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = { avg: 'Average', max: 'Strongest', min: 'Weakest' };
                          return [value, labels[name] || name];
                        }} />
                      <Legend formatter={(v: string) => {
                        const labels: Record<string, string> = { avg: 'Average', max: 'Strongest', min: 'Weakest' };
                        return labels[v] || v;
                      }} />
                      <Bar dataKey="max" fill={isDarkMode ? '#34D399' : '#059669'} radius={[4, 4, 0, 0]} barSize={20} name="max" />
                      <Bar dataKey="avg" radius={[4, 4, 0, 0]} barSize={20} name="avg">
                        {barDataByRegion.map((entry) => (<Cell key={entry.region} fill={entry.color} />))}
                      </Bar>
                      <Bar dataKey="min" fill={isDarkMode ? '#F87171' : '#DC2626'} radius={[4, 4, 0, 0]} barSize={20} name="min" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {barDataByRegion.map(r => (
                    <div key={r.region} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <div className="font-semibold text-sm" style={{ color: r.color }}>{r.region}</div>
                      <div className={`text-xs mt-1 ${themeColors.textSecondary}`}>
                        {r.count} countries &middot; Avg <span className="font-bold">{r.avg}</span>
                      </div>
                      <div className={`text-xs ${themeColors.textTertiary}`}>
                        Range: {r.min} &ndash; {r.max}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {barMode === 'delta' && (
              <div className="w-full" style={{ height: `${Math.max(500, barDataDelta.length * 22)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barDataDelta} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                      domain={['dataMin - 2', 'dataMax + 2']} />
                    <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 10 }} width={105} interval={0} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}`, 'Henley 2024 → Live Mobility']} />
                    <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={9}>
                      {barDataDelta.map((entry) => (
                        <Cell key={entry.key} fill={entry.change > 0 ? (isDarkMode ? '#34D399' : '#059669') : entry.change < 0 ? (isDarkMode ? '#F87171' : '#DC2626') : (isDarkMode ? '#6B7280' : '#9CA3AF')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ===== MOVERS ===== */}
        {activeView === 'movers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                Biggest Gainers (Henley 2024 → Live)
              </h3>
              <div className="space-y-3">
                {moversData.gainers.map((m, i) => {
                  const tier = getMobilityTier(m.score);
                  return (
                    <div key={m.country} className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <span className={`text-xl font-bold w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">{displayName(m.country)}</span>
                          <span className="text-sm font-medium" style={{ color: isDarkMode ? tier.colorDark : tier.color }}>{m.score}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        +{m.change}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                Biggest Decliners (Henley 2024 → Live)
              </h3>
              <div className="space-y-3">
                {moversData.losers.map((m, i) => {
                  const tier = getMobilityTier(m.score);
                  return (
                    <div key={m.country} className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <span className={`text-xl font-bold w-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">{displayName(m.country)}</span>
                          <span className="text-sm font-medium" style={{ color: isDarkMode ? tier.colorDark : tier.color }}>{m.score}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {m.change}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== HISTOGRAM ===== */}
        {activeView === 'histogram' && (
          <div className="space-y-6">
            <div id={slugify('Passport mobility key figures')}>
              <div className="flex justify-end mb-2">
                <SocialShareMenu title="Passport mobility key figures" isDarkMode={isDarkMode} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'Strongest', value: mobilityGap.max.toString(), sub: 'destinations', accent: isDarkMode ? 'text-green-400' : 'text-green-600' },
                  { label: 'Weakest', value: mobilityGap.min.toString(), sub: 'destinations', accent: isDarkMode ? 'text-red-400' : 'text-red-600' },
                  { label: 'Mobility Gap', value: mobilityGap.gap.toString(), sub: 'destinations', accent: isDarkMode ? 'text-amber-400' : 'text-amber-600' },
                  { label: 'Average', value: mobilityGap.avg.toString(), sub: 'destinations', accent: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                  { label: 'Median', value: mobilityGap.median.toString(), sub: 'destinations', accent: isDarkMode ? 'text-cyan-400' : 'text-cyan-600' },
                  { label: 'Passports', value: mobilityGap.total.toString(), sub: 'tracked', accent: isDarkMode ? 'text-purple-400' : 'text-purple-600' },
                ].map(stat => (
                  <div key={stat.label} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</div>
                    <div className={`text-xs ${themeColors.textSecondary}`}>{stat.label}</div>
                    <div className={`text-[10px] ${themeColors.textTertiary}`}>{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div id={slugify('Mobility Score Distribution (10-destination buckets)')}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
                <h3 className="font-semibold">Mobility Score Distribution (10-destination buckets)</h3>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Mobility Score Distribution (10-destination buckets)" isDarkMode={isDarkMode} />
                </div>
              </div>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis dataKey="range" tick={{ fill: themeColors.tickColor, fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} passports`, 'Count']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {histogramData.map((entry) => {
                        const tier = getMobilityTier(entry.min + 5);
                        return <Cell key={entry.range} fill={isDarkMode ? tier.colorDark : tier.color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ===== SCATTER ===== */}
        {activeView === 'scatter' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Each dot represents a country, labelled with its two-letter code where space allows. Hover or tap any dot for the country name. X-axis: GDP per capita (PPP, thousands $). Y-axis: live mobility score.
            </p>
            <div className="w-full h-[320px] sm:h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 16, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="gdp" type="number" name="GDP/capita (k$)" unit="k"
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }} label={{ value: 'GDP per Capita (PPP, thousands $)', position: 'insideBottom', offset: -5, fill: themeColors.tickColor, fontSize: 11 }} />
                  <YAxis dataKey="visaFree" type="number" name="Mobility" domain={[0, 200]}
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }} label={{ value: 'Mobility Score', angle: -90, position: 'insideLeft', fill: themeColors.tickColor, fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }}
                    content={
                      <CountryDotTooltip
                        isDarkMode={isDarkMode}
                        rows={(d: (typeof scatterData)[number]) => [
                          ['GDP per capita (PPP)', `$${d.gdp}k`],
                          ['Mobility score', String(d.visaFree)],
                          ['Passport rank', `#${d.rank}`],
                        ]}
                      />
                    } />
                  {REGIONS.map(region => (
                    <Scatter key={region.label} name={region.label}
                      data={scatterData.filter(d => d.region === region.label)}
                      fill={region.chartColor}>
                      {scatterData.filter(d => d.region === region.label).map((entry) => (
                        <Cell key={entry.key} fill={region.chartColor} />
                      ))}
                      <LabelList dataKey="label" position="top" offset={6} style={{ fill: themeColors.tickColor, fontSize: 10 }} />
                    </Scatter>
                  ))}
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className={`p-3 rounded-lg text-xs ${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
              Notable outliers: UAE and Qatar (high GDP, moderate passport); China (large economy, restricted passport);
              Singapore (top passport and top GDP); India and Nigeria (large economies, weak passports).
            </div>
          </div>
        )}

        {/* ===== SOFT POWER ===== */}
        {activeView === 'softpower' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Comparing live passport rank vs Brand Finance Global Soft Power Index rank. Large gaps reveal where global influence diverges from travel freedom. Dots are labelled with two-letter country codes; hover or tap any dot for the country name.
            </p>
            <div className="w-full h-[320px] sm:h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 16, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="softPowerRank" type="number" name="Soft Power Rank" reversed
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                    label={{ value: 'Soft Power Rank (lower = stronger)', position: 'insideBottom', offset: -5, fill: themeColors.tickColor, fontSize: 11 }} />
                  <YAxis dataKey="passportRank" type="number" name="Passport Rank" reversed
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                    label={{ value: 'Passport Rank (lower = stronger)', angle: -90, position: 'insideLeft', fill: themeColors.tickColor, fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }}
                    content={
                      <CountryDotTooltip
                        isDarkMode={isDarkMode}
                        rows={(d: (typeof softPowerData)[number]) => [
                          ['Passport rank', `#${d.passportRank}`],
                          ['Soft Power rank', `#${d.softPowerRank}`],
                          ['Rank gap', `${d.gap} positions`],
                        ]}
                      />
                    } />
                  <Scatter data={softPowerData} fill="#8B5CF6">
                    {softPowerData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="label" position="top" offset={6} style={{ fill: themeColors.tickColor, fontSize: 10 }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Biggest Rank Disconnects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {softPowerData.slice(0, 6).map(d => (
                  <div key={d.key} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <div className="font-medium mb-1">{d.country}</div>
                    <div className="flex justify-between text-sm">
                      <span className={themeColors.textSecondary}>Passport: <span className="font-bold">#{d.passportRank}</span></span>
                      <span className={themeColors.textSecondary}>Soft Power: <span className="font-bold">#{d.softPowerRank}</span></span>
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      Gap: {d.gap} rank positions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== RADAR ===== */}
        {activeView === 'radar' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Multi-dimensional comparison: average mobility, best passport, internal consistency (low spread), year-over-year trajectory, and country coverage per region.
            </p>
            <div className="w-full h-[320px] sm:h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke={themeColors.gridColor} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: themeColors.tickColor, fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: themeColors.tickColor, fontSize: 10 }} />
                  {REGIONS.map((region) => (
                    <Radar key={region.label} name={region.label} dataKey={region.label}
                      stroke={region.chartColor} fill={region.chartColor} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                  <Legend />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {regionStats.map(r => (
                <div key={r.label} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className={`font-semibold text-sm ${isDarkMode ? r.colorDark : r.color}`}>{r.label}</div>
                  <div className="text-xs mt-1">
                    <span className={themeColors.textSecondary}>Avg: </span><span className="font-bold">{r.avg}</span>
                    <span className={themeColors.textSecondary}> | Spread: </span><span className="font-bold">&plusmn;{r.stdDev}</span>
                  </div>
                  <div className={`text-xs ${themeColors.textTertiary}`}>
                    YoY: <span className={r.avgChange >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}>
                      {r.avgChange >= 0 ? '+' : ''}{r.avgChange}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TRENDS ===== */}
        {activeView === 'trends' && (
          <div className="space-y-4">
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Historical passport scores for selected countries (2015&ndash;2026). Use the Country Comparison tab to change which countries appear.
            </p>
            {trendCountries.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className={themeColors.textSecondary}>No historical data available for the currently selected countries. Try selecting countries like USA, Japan, Germany, China, or Brazil.</p>
              </div>
            ) : (
              <div className="w-full h-[320px] sm:h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                    <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                    <YAxis domain={[0, 200]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    {trendCountries.map((country, i) => (
                      <Line key={country} type="monotone" dataKey={country}
                        name={displayName(country)}
                        stroke={culturalChartColors[country] || TREND_COLORS[i % TREND_COLORS.length]}
                        strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ===== REGIONS ===== */}
        {activeView === 'regions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regionStats.map(region => (
              <div key={region.label} className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold text-lg mb-1 ${isDarkMode ? region.colorDark : region.color}`}>{region.label}</h3>
                <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
                  {region.tracked} countries &middot; Avg: <span className="font-bold">{region.avg}</span> &middot; Spread: &plusmn;{region.stdDev}
                </p>
                <div className="space-y-2">
                  {region.countries.filter(c => liveByInternalKey[c]).map(country => {
                    const p = liveByInternalKey[country];
                    const tier = getMobilityTier(p.totals.mobility);
                    const width = Math.min((p.totals.mobility / 195) * 100, 100);
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-0.5">
                          <span>{displayName(country)}</span>
                          <span className="font-medium">{p.totals.mobility} <span className={themeColors.textTertiary}>({tier.label})</span></span>
                        </div>
                        <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: isDarkMode ? tier.colorDark : tier.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {region.best && (
                  <p className={`text-xs mt-3 ${themeColors.textTertiary}`}>
                    Best: {displayName(region.best)} (#{liveByInternalKey[region.best].rank})
                    {region.worst && <> &middot; Worst: {displayName(region.worst)} (#{liveByInternalKey[region.worst].rank})</>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== TIERS ===== */}
        {activeView === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={60} outerRadius={110} paddingAngle={3}
                    label={({ name, value }) => `${name} (${value})`}>
                    {tierDistribution.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value} passports`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">Tier Breakdown</h3>
              {[
                { label: 'Excellent', range: '165+ destinations', color: '#059669', colorDark: '#34D399' },
                { label: 'Very Strong', range: '145–164 destinations', color: '#10B981', colorDark: '#6EE7B7' },
                { label: 'Strong', range: '115–144 destinations', color: '#0891B2', colorDark: '#22D3EE' },
                { label: 'Moderate', range: '75–114 destinations', color: '#D97706', colorDark: '#FBBF24' },
                { label: 'Weak', range: '45–74 destinations', color: '#EA580C', colorDark: '#FB923C' },
                { label: 'Very Weak', range: 'Under 45 destinations', color: '#DC2626', colorDark: '#F87171' },
              ].map(tier => {
                const count = tierDistribution.find(t => t.name === tier.label)?.value || 0;
                return (
                  <div key={tier.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: isDarkMode ? tier.colorDark : tier.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium text-sm" style={{ color: isDarkMode ? tier.colorDark : tier.color }}>{tier.label}</span>
                        <span className={`text-xs ${themeColors.textSecondary}`}>{tier.range}</span>
                      </div>
                    </div>
                    <span className="font-bold text-sm w-8 text-right">{count}</span>
                  </div>
                );
              })}
              <div className={`mt-4 pt-3 border-t ${themeColors.border}`}>
                <p className={`text-xs ${themeColors.textTertiary}`}>
                  Distribution of {passportCount} tracked passports. Live mobility average: {mobilityGap.avg}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== INSIGHTS ===== */}
        {activeView === 'insights' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                What is the &quot;Mobility Score&quot;?
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                Sum of destinations where a passport gets <strong>visa-free</strong>, <strong>visa-on-arrival</strong>, or <strong>ETA</strong> access — i.e. crossing the border without filing an embassy visa application first. eVisas are tracked separately because they normally require an online application and approval before travel.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                What does length of stay mean?
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                The number of days you can remain in the destination per entry without a separate residence permit. Common values: <strong>30, 60, 90, 180, 365 days</strong>. &quot;Unlimited / per visa&quot; applies to mobility blocs like Schengen, where days roll up across multiple member states (90 in 180), or to free-movement unions like ECOWAS or the GCC.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                Why are advisory scores included?
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                A passport may grant entry, but the destination may still carry an official warning. Levels come from the Government of Canada&apos;s travel advice: <strong>0</strong> = normal precautions, <strong>3</strong> = avoid all travel. Pair high mobility with low advisory for a realistic picture of where the passport is &quot;actually usable&quot; today.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                eVisa vs ETA vs VOA
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                <strong>VOA</strong> (Visa on Arrival) is decided at the airport, usually for a fee.
                <strong> ETA</strong> (Electronic Travel Authorization, e.g. US ESTA, UK ETA, Canadian eTA) is a pre-screening, normally approved in minutes.
                <strong> eVisa</strong> is a formal visa applied for online days/weeks ahead — closer in practice to a traditional embassy visa.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                Why does the Mobility Score differ from Henley?
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                The Henley index uses IATA Timatic and counts VF + VOA + eTA, with proprietary destination weighting (227 destinations including territories). The live Passport Index dataset is open-source, covers 199 sovereign destinations, and excludes pure eVisas from the mobility headline — so absolute numbers will diverge slightly, but rankings closely track.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-cyan-900/20' : 'bg-cyan-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                Asymmetric Visa Pairs
              </h4>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                Open the <strong>Reciprocity</strong> tab to spot asymmetric pairs — countries that grant visa-free entry to a partner while requiring a full visa in return. These imbalances frequently surface in bilateral negotiations and are a leading indicator of upcoming visa-policy changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportStrengthChart;
