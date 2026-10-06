'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, fetchExtraIndicators, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, COUNTRY_REGIONS, type CountryKey } from '../utils/countryMappings';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ScatterChart, Scatter, Cell, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import dynamic from 'next/dynamic';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';

const DevelopmentWorldMap = dynamic(() => import('../components/DevelopmentWorldMap'), { ssr: false });

function getLatest(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

function getValueAtYear(series: CountryData[] | undefined, country: string, year: number): number | null {
  if (!series) return null;
  for (const row of series) {
    const yr = Number((row as any).date || (row as any).year);
    if (yr === year) {
      const v = Number(row[country]);
      if (!isNaN(v) && v !== 0) return v;
    }
  }
  return null;
}

function getFirstAvailable(series: CountryData[] | undefined, country: string, minYear: number, maxYear: number): { year: number; value: number } | null {
  if (!series) return null;
  const sorted = [...series].sort((a, b) => Number((a as any).date || (a as any).year) - Number((b as any).date || (b as any).year));
  for (const row of sorted) {
    const yr = Number((row as any).date || (row as any).year);
    if (yr >= minYear && yr <= maxYear) {
      const v = Number(row[country]);
      if (!isNaN(v) && v !== 0) return { year: yr, value: v };
    }
  }
  return null;
}

function computeHDI(lifeExp: number | null, education: number | null, gdpPc: number | null): number | null {
  if (lifeExp === null || education === null || gdpPc === null) return null;
  const lifeIndex = Math.max(0, Math.min(1, (lifeExp - 20) / (85 - 20)));
  const eduIndex = Math.max(0, Math.min(1, education / 100));
  const incomeIndex = Math.max(0, Math.min(1, (Math.log(gdpPc) - Math.log(100)) / (Math.log(75000) - Math.log(100))));
  return parseFloat(((lifeIndex + eduIndex + incomeIndex) / 3).toFixed(3));
}

// Approximate World Bank Human Capital Index (2020) for tracked countries.
// Source: World Bank HCI 2020 report. Value ~0-1, higher = better human capital.
const HCI_2020: Partial<Record<CountryKey, number>> = {
  USA: 0.70, Canada: 0.80, UK: 0.78, France: 0.76, Germany: 0.75, Italy: 0.73,
  Japan: 0.80, Australia: 0.77, Mexico: 0.61, SouthKorea: 0.80, Spain: 0.73,
  Sweden: 0.80, Switzerland: 0.77, Turkey: 0.65, Nigeria: 0.36, China: 0.65,
  Russia: 0.68, Brazil: 0.55, Chile: 0.65, Argentina: 0.60, India: 0.49,
  Norway: 0.77, Netherlands: 0.79, Portugal: 0.75, Belgium: 0.76, Indonesia: 0.54,
  SouthAfrica: 0.43, Poland: 0.75, SaudiArabia: 0.58, Egypt: 0.49,
};

type DevMetricKey = 'lifeExpectancy' | 'gdpPerCapitaPPP' | 'tertiaryEnrollment' | 'internetUsers' | 'co2Emissions' | 'povertyRate';
type DevSectionId = 'overview' | 'map' | 'growth' | 'inequality' | 'education' | 'health' | 'environment' | 'sdg' | 'compare';
const DEV_SECTIONS: { id: DevSectionId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'map', label: 'Global Map', icon: '🗺️' },
  { id: 'growth', label: 'Growth & Trends', icon: '📈' },
  { id: 'inequality', label: 'Inequality & Gender', icon: '⚖️' },
  { id: 'education', label: 'Education & Human Capital', icon: '🎓' },
  { id: 'health', label: 'Health & Basic Services', icon: '🏥' },
  { id: 'environment', label: 'Sustainability & Demographics', icon: '🌱' },
  { id: 'sdg', label: 'SDG & Digital', icon: '🎯' },
  { id: 'compare', label: 'Compare Countries', icon: '🔍' },
];

const DEV_METRIC_OPTIONS: { key: DevMetricKey; label: string; yLabel: string; format: (v: number) => string }[] = [
  { key: 'lifeExpectancy', label: 'Life Expectancy', yLabel: 'Years', format: v => v.toFixed(1) },
  { key: 'gdpPerCapitaPPP', label: 'GDP per Capita (PPP)', yLabel: '$ (current intl)', format: v => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  { key: 'tertiaryEnrollment', label: 'Tertiary Enrollment', yLabel: '% gross', format: v => `${v.toFixed(1)}%` },
  { key: 'internetUsers', label: 'Internet Users', yLabel: '% of pop', format: v => `${v.toFixed(1)}%` },
  { key: 'co2Emissions', label: 'CO₂ Emissions', yLabel: 'tonnes/cap', format: v => `${v.toFixed(2)}` },
  { key: 'povertyRate', label: 'Poverty Rate ($2.15/day)', yLabel: '% of pop', format: v => `${v.toFixed(1)}%` },
];

export default function DevelopmentPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [extraData, setExtraData] = useState<Record<string, CountryData[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDevCountries, setSelectedDevCountries] = useState<string[]>(['USA', 'Japan', 'Brazil', 'India', 'Nigeria', 'China']);
  const [devMetric, setDevMetric] = useState<DevMetricKey>('lifeExpectancy');
  const [sortField, setSortField] = useState<string>('hdi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [mapMetric, setMapMetric] = useState<'hdi' | 'gini' | 'gdpPc' | 'lifeExp'>('hdi');
  const [radarCountries, setRadarCountries] = useState<CountryKey[]>(['USA', 'Norway', 'Japan', 'India']);
  const [demoCountry, setDemoCountry] = useState<CountryKey>('Nigeria');
  const [activeSection, setActiveSection] = useState<DevSectionId>('overview');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchGlobalData()
      .then(d => { setData(d as any); setLoading(false); })
      .catch(() => setLoading(false));

    fetchExtraIndicators({
      primaryCompletion: 'SE.PRM.CMPT.ZS',
      secondaryEnrollment: 'SE.SEC.ENRR',
      incomeShareLow20: 'SI.DST.FRST.20',
      incomeShareHigh20: 'SI.DST.05TH.20',
      birthRate: 'SP.DYN.CBRT.IN',
      deathRate: 'SP.DYN.CDRT.IN',
      fertilityRate: 'SP.DYN.TFRT.IN',
      under5Mortality: 'SH.DYN.MORT',
      maternalMortality: 'SH.STA.MMRT',
      physiciansPer1000: 'SH.MED.PHYS.ZS',
      hospitalBeds: 'SH.MED.BEDS.ZS',
      immunizationDPT: 'SH.IMM.IDPT',
      immunizationMeasles: 'SH.IMM.MEAS',
      electricityAccess: 'EG.ELC.ACCS.ZS',
      basicWater: 'SH.H2O.BASW.ZS',
      basicSanitation: 'SH.STA.BASS.ZS',
      popAge0_14: 'SP.POP.0014.TO.ZS',
      popAge15_64: 'SP.POP.1564.TO.ZS',
      popAge65Plus: 'SP.POP.65UP.TO.ZS',
      lifeExpMale: 'SP.DYN.LE00.MA.IN',
      lifeExpFemale: 'SP.DYN.LE00.FE.IN',
      schoolGenderParity: 'SE.ENR.PRSC.FM.ZS',
      resourceRents: 'NY.GDP.TOTL.RT.ZS',
      remittances: 'BX.TRF.PWKR.DT.GD.ZS',
      broadband: 'IT.NET.BBND.P2',
      mobileSubs: 'IT.CEL.SETS.P2',
    }).then(setExtraData).catch(err => {
      console.warn('[development] fetchExtraIndicators failed', err);
    });
  }, []);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', grid: '#374151', axis: '#9ca3af',
    tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
  };

  const scoreCards = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const lifeExp = getLatest(data.lifeExpectancy, ck);
      const education = getLatest(data.tertiaryEnrollment, ck);
      const gdpPc = getLatest(data.gdpPerCapitaPPP, ck);
      const gini = getLatest(data.giniCoefficient, ck);
      const poverty = getLatest(data.povertyRate, ck);
      const internet = getLatest(data.internetUsers, ck);
      const healthcare = getLatest(data.healthcareExpenditure, ck);
      const hdi = computeHDI(lifeExp, education, gdpPc);
      return { country: ck, hdi, lifeExp, education, gdpPc, gini, poverty, internet, healthcare };
    }).filter(c => c.hdi !== null).sort((a, b) => (b.hdi ?? 0) - (a.hdi ?? 0));
  }, [data]);

  // Convergence: initial (2000) GDP per capita vs annualized growth through latest
  const convergenceData = useMemo(() => {
    if (!data?.gdpPerCapitaPPP) return [];
    return COUNTRY_KEYS.map(ck => {
      const initial = getValueAtYear(data.gdpPerCapitaPPP, ck, 2000)
        || getFirstAvailable(data.gdpPerCapitaPPP, ck, 2000, 2005)?.value
        || null;
      const latest = getLatest(data.gdpPerCapitaPPP, ck);
      if (initial === null || latest === null || initial <= 0) return null;
      const years = 23;
      const cagr = (Math.pow(latest / initial, 1 / years) - 1) * 100;
      return {
        country: COUNTRY_DISPLAY_NAMES[ck],
        countryKey: ck,
        initial,
        latest,
        growth: parseFloat(cagr.toFixed(2)),
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [data]);

  // Education pipeline: primary completion → secondary enrollment → tertiary enrollment
  const educationPipeline = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const primary = getLatest(extraData.primaryCompletion, ck);
      const secondary = getLatest(extraData.secondaryEnrollment, ck);
      const tertiary = getLatest(data.tertiaryEnrollment, ck);
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
        countryKey: ck,
        Primary: primary !== null ? parseFloat(primary.toFixed(1)) : 0,
        Secondary: secondary !== null ? parseFloat(secondary.toFixed(1)) : 0,
        Tertiary: tertiary !== null ? parseFloat(tertiary.toFixed(1)) : 0,
      };
    }).filter(d => d.Primary || d.Secondary || d.Tertiary);
  }, [data, extraData]);

  // HCI vs HDI scatter
  const hciScatter = useMemo(() => {
    return scoreCards.map(sc => {
      const hci = HCI_2020[sc.country];
      if (hci === undefined || sc.hdi === null) return null;
      return {
        country: COUNTRY_DISPLAY_NAMES[sc.country],
        countryKey: sc.country,
        hci,
        hdi: sc.hdi,
        fill: COUNTRY_COLORS[sc.country],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [scoreCards]);

  // Social mobility: income share bottom 20% vs top 20%, plus ratio
  const mobilityData = useMemo(() => {
    return COUNTRY_KEYS.map(ck => {
      const low = getLatest(extraData.incomeShareLow20, ck);
      const high = getLatest(extraData.incomeShareHigh20, ck);
      if (low === null || high === null) return null;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
        countryKey: ck,
        'Bottom 20%': parseFloat(low.toFixed(1)),
        'Top 20%': parseFloat(high.toFixed(1)),
        ratio: parseFloat((high / low).toFixed(2)),
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.ratio - b.ratio);
  }, [extraData]);

  // Demographic transition for selected country (birth rate, death rate, fertility, life exp over time)
  const demoTransition = useMemo(() => {
    if (!extraData.birthRate) return [];
    const years = new Set<number>();
    [extraData.birthRate, extraData.deathRate, extraData.fertilityRate, data?.lifeExpectancy].forEach(s => {
      s?.forEach((row: any) => {
        const y = Number(row.date || row.year);
        if (!isNaN(y) && y >= 1960) years.add(y);
      });
    });
    return Array.from(years).sort((a, b) => a - b).map(year => ({
      year,
      'Birth Rate': getValueAtYear(extraData.birthRate, demoCountry, year),
      'Death Rate': getValueAtYear(extraData.deathRate, demoCountry, year),
      'Fertility Rate': getValueAtYear(extraData.fertilityRate, demoCountry, year),
      'Life Expectancy': data ? getValueAtYear(data.lifeExpectancy, demoCountry, year) : null,
    })).filter(d => d['Birth Rate'] !== null || d['Death Rate'] !== null);
  }, [extraData, data, demoCountry]);

  // Radar chart: normalized 0-100 scores across 6 dimensions
  const radarData = useMemo(() => {
    if (!data) return [];
    const dimensions = [
      { key: 'Health', get: (ck: CountryKey) => getLatest(data.lifeExpectancy, ck), normalize: (v: number) => ((v - 50) / (85 - 50)) * 100 },
      { key: 'Education', get: (ck: CountryKey) => getLatest(data.tertiaryEnrollment, ck), normalize: (v: number) => Math.min(100, v) },
      { key: 'Income', get: (ck: CountryKey) => getLatest(data.gdpPerCapitaPPP, ck), normalize: (v: number) => ((Math.log(v) - Math.log(1000)) / (Math.log(80000) - Math.log(1000))) * 100 },
      { key: 'Equality', get: (ck: CountryKey) => getLatest(data.giniCoefficient, ck), normalize: (v: number) => Math.max(0, 100 - ((v - 20) / (60 - 20)) * 100) },
      { key: 'Digital', get: (ck: CountryKey) => getLatest(data.internetUsers, ck), normalize: (v: number) => v },
      { key: 'Sustainability', get: (ck: CountryKey) => getLatest(data.renewableEnergy, ck), normalize: (v: number) => v },
    ];
    return dimensions.map(dim => {
      const point: Record<string, any> = { dimension: dim.key };
      radarCountries.forEach(ck => {
        const raw = dim.get(ck);
        point[COUNTRY_DISPLAY_NAMES[ck]] = raw !== null ? Math.max(0, Math.min(100, parseFloat(dim.normalize(raw).toFixed(1)))) : 0;
      });
      return point;
    });
  }, [data, radarCountries]);

  const socialMetrics = useMemo(() => {
    if (!data) return [];
    const metrics = ['healthcareExpenditure', 'educationExpenditure', 'internetUsers', 'femaleLaborForce'];
    const labels = ['Healthcare %GDP', 'Education %GDP', 'Internet %', 'Female Labor %'];
    return COUNTRY_KEYS.slice(0, 15).map(ck => {
      const point: Record<string, any> = { country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 10) };
      metrics.forEach((mk, i) => {
        point[labels[i]] = getLatest((data as any)[mk], ck) || 0;
      });
      return point;
    });
  }, [data]);

  const sustainData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => ({
      name: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
      co2: getLatest(data.co2Emissions, ck) || 0,
      renewable: getLatest(data.renewableEnergy, ck) || 0,
      fill: COUNTRY_COLORS[ck],
    })).filter(d => d.co2 > 0);
  }, [data]);

  const genderData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.slice(0, 15).map(ck => ({
      country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 10),
      female: getLatest(data.femaleLaborForce, ck) || 0,
      youth: getLatest(data.youthUnemployment, ck) || 0,
    }));
  }, [data]);

  const hdiBreakdown = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.slice(0, 15).map(ck => {
      const lifeExp = getLatest(data.lifeExpectancy, ck);
      const education = getLatest(data.tertiaryEnrollment, ck);
      const gdpPc = getLatest(data.gdpPerCapitaPPP, ck);
      const lifeScore = lifeExp !== null ? Math.max(0, Math.min(1, (lifeExp - 20) / (85 - 20))) * 100 : 0;
      const eduScore = education !== null ? Math.max(0, Math.min(1, education / 100)) * 100 : 0;
      const incScore = gdpPc !== null ? Math.max(0, Math.min(1, (Math.log(gdpPc) - Math.log(100)) / (Math.log(75000) - Math.log(100)))) * 100 : 0;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck).slice(0, 10),
        'Life Expectancy': parseFloat(lifeScore.toFixed(1)),
        'Education': parseFloat(eduScore.toFixed(1)),
        'Income': parseFloat(incScore.toFixed(1)),
      };
    });
  }, [data]);

  // Development Over Time with selectable metric
  const devOverTimeData = useMemo(() => {
    if (!data) return [];
    const series = (data as any)[devMetric] as CountryData[] | undefined;
    if (!series) return [];
    return series
      .filter((row: any) => {
        const yr = Number(row.date || row.year);
        return !isNaN(yr) && yr >= 2000;
      })
      .map((row: any) => {
        const point: Record<string, any> = { year: Number(row.date || row.year) };
        selectedDevCountries.forEach(ck => {
          const v = Number(row[ck]);
          if (!isNaN(v) && v > 0) point[ck] = v;
        });
        return point;
      })
      .sort((a: any, b: any) => a.year - b.year);
  }, [data, selectedDevCountries, devMetric]);

  const regionalComparison = useMemo(() => {
    if (scoreCards.length === 0) return [];
    const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa'];
    return regions.map(region => {
      const members = COUNTRY_REGIONS[region] || [];
      const cards = scoreCards.filter(sc => members.includes(sc.country as CountryKey));
      if (cards.length === 0) return { region, HDI: 0, Gini: 0, Healthcare: 0 };
      const avg = (arr: (number | null)[]): number => {
        const valid = arr.filter((v): v is number => v !== null);
        return valid.length > 0 ? parseFloat((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(1)) : 0;
      };
      return {
        region,
        HDI: parseFloat((avg(cards.map(c => c.hdi)) * 100).toFixed(1)),
        Gini: avg(cards.map(c => c.gini)),
        Healthcare: avg(cards.map(c => c.healthcare)),
      };
    });
  }, [scoreCards]);

  const povertyCards = useMemo(() => {
    return scoreCards
      .filter(sc => sc.gdpPc !== null)
      .sort((a, b) => (b.gdpPc ?? 0) - (a.gdpPc ?? 0));
  }, [scoreCards]);

  const rankingsData = useMemo(() => {
    const sorted = [...scoreCards];
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortField] ?? -Infinity;
      const bVal = (b as any)[sortField] ?? -Infinity;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [scoreCards, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleRadarCountry = (ck: CountryKey) => {
    setRadarCountries(prev => {
      if (prev.includes(ck)) return prev.filter(c => c !== ck);
      if (prev.length >= 6) return prev;
      return [...prev, ck];
    });
  };

  const devTimeColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Rises & Falls Leaderboard — HDI delta since 2000
  const risesFallsData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const lifeExpInit = getValueAtYear(data.lifeExpectancy, ck, 2000)
        || getFirstAvailable(data.lifeExpectancy, ck, 2000, 2005)?.value
        || null;
      const eduInit = getValueAtYear(data.tertiaryEnrollment, ck, 2000)
        || getFirstAvailable(data.tertiaryEnrollment, ck, 2000, 2005)?.value
        || null;
      const gdpInit = getValueAtYear(data.gdpPerCapitaPPP, ck, 2000)
        || getFirstAvailable(data.gdpPerCapitaPPP, ck, 2000, 2005)?.value
        || null;
      const hdiInit = computeHDI(lifeExpInit, eduInit, gdpInit);
      const hdiNow = computeHDI(
        getLatest(data.lifeExpectancy, ck),
        getLatest(data.tertiaryEnrollment, ck),
        getLatest(data.gdpPerCapitaPPP, ck)
      );
      if (hdiInit === null || hdiNow === null) return null;
      const delta = parseFloat((hdiNow - hdiInit).toFixed(3));
      return {
        country: COUNTRY_DISPLAY_NAMES[ck],
        countryKey: ck,
        hdiInit,
        hdiNow,
        delta,
        fill: delta >= 0 ? '#22c55e' : '#ef4444',
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.delta - a.delta);
  }, [data]);

  // Development Complexity Score — weighted composite
  const complexityScoreData = useMemo(() => {
    if (!data) return [];
    const weights = {
      hdi: 0.25,
      equality: 0.15,
      digital: 0.10,
      health: 0.15,
      sustainability: 0.10,
      gender: 0.10,
      services: 0.15,
    };
    return COUNTRY_KEYS.map(ck => {
      const lifeExp = getLatest(data.lifeExpectancy, ck);
      const education = getLatest(data.tertiaryEnrollment, ck);
      const gdpPc = getLatest(data.gdpPerCapitaPPP, ck);
      const hdi = computeHDI(lifeExp, education, gdpPc);
      const gini = getLatest(data.giniCoefficient, ck);
      const internet = getLatest(data.internetUsers, ck);
      const under5 = getLatest(extraData.under5Mortality, ck);
      const renewable = getLatest(data.renewableEnergy, ck);
      const femaleLabor = getLatest(data.femaleLaborForce, ck);
      const electricity = getLatest(extraData.electricityAccess, ck);
      const water = getLatest(extraData.basicWater, ck);
      const sanitation = getLatest(extraData.basicSanitation, ck);

      const hdiScore = hdi !== null ? hdi * 100 : null;
      const equalityScore = gini !== null ? Math.max(0, 100 - ((gini - 20) / (60 - 20)) * 100) : null;
      const digitalScore = internet;
      const healthScore = under5 !== null ? Math.max(0, 100 - (under5 / 150) * 100) : null;
      const sustainScore = renewable;
      const genderScore = femaleLabor;
      const servicesScore = [electricity, water, sanitation].filter((v): v is number => v !== null);
      const servicesAvg = servicesScore.length > 0 ? servicesScore.reduce((s, v) => s + v, 0) / servicesScore.length : null;

      const components = [
        { v: hdiScore, w: weights.hdi },
        { v: equalityScore, w: weights.equality },
        { v: digitalScore, w: weights.digital },
        { v: healthScore, w: weights.health },
        { v: sustainScore, w: weights.sustainability },
        { v: genderScore, w: weights.gender },
        { v: servicesAvg, w: weights.services },
      ];
      const validComponents = components.filter(c => c.v !== null) as { v: number; w: number }[];
      if (validComponents.length === 0) return null;
      const totalWeight = validComponents.reduce((s, c) => s + c.w, 0);
      const score = validComponents.reduce((s, c) => s + c.v * c.w, 0) / totalWeight;
      return {
        country: COUNTRY_DISPLAY_NAMES[ck],
        countryKey: ck,
        score: parseFloat(score.toFixed(1)),
        components: {
          HDI: hdiScore,
          Equality: equalityScore,
          Digital: digitalScore,
          Health: healthScore,
          Sustainability: sustainScore,
          Gender: genderScore,
          Services: servicesAvg,
        },
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score);
  }, [data, extraData]);

  // Inequality over time — Gini historical series
  const giniOverTimeData = useMemo(() => {
    if (!data?.giniCoefficient) return [];
    return data.giniCoefficient
      .filter((row: any) => {
        const yr = Number(row.date || row.year);
        return !isNaN(yr) && yr >= 1990;
      })
      .map((row: any) => {
        const point: Record<string, any> = { year: Number(row.date || row.year) };
        selectedDevCountries.forEach(ck => {
          const v = Number(row[ck]);
          if (!isNaN(v) && v > 0) point[ck] = v;
        });
        return point;
      })
      .sort((a: any, b: any) => a.year - b.year);
  }, [data, selectedDevCountries]);

  // Gender Development Index — male vs female life expectancy + parity
  const gdiData = useMemo(() => {
    return COUNTRY_KEYS.map(ck => {
      const leM = getLatest(extraData.lifeExpMale, ck);
      const leF = getLatest(extraData.lifeExpFemale, ck);
      const parity = getLatest(extraData.schoolGenderParity, ck);
      const femLabor = data ? getLatest(data.femaleLaborForce, ck) : null;
      if (leM === null && leF === null) return null;
      const leGap = leM !== null && leF !== null ? parseFloat((leF - leM).toFixed(1)) : null;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
        countryKey: ck,
        'Life Exp Male': leM !== null ? parseFloat(leM.toFixed(1)) : 0,
        'Life Exp Female': leF !== null ? parseFloat(leF.toFixed(1)) : 0,
        leGap,
        parity,
        femLabor,
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [extraData, data]);

  // Remittances reliance
  const remittancesData = useMemo(() => {
    return COUNTRY_KEYS.map(ck => {
      const v = getLatest(extraData.remittances, ck);
      if (v === null) return null;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
        countryKey: ck,
        remittances: parseFloat(v.toFixed(2)),
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.remittances - a.remittances);
  }, [extraData]);

  // Healthcare outcomes
  const healthOutcomesData = useMemo(() => {
    return COUNTRY_KEYS.map(ck => ({
      country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
      countryKey: ck,
      under5: getLatest(extraData.under5Mortality, ck),
      maternal: getLatest(extraData.maternalMortality, ck),
      physicians: getLatest(extraData.physiciansPer1000, ck),
      hospitalBeds: getLatest(extraData.hospitalBeds, ck),
      immuneDPT: getLatest(extraData.immunizationDPT, ck),
      immuneMeasles: getLatest(extraData.immunizationMeasles, ck),
    }));
  }, [extraData]);

  // Basic services access (composite infrastructure score)
  const basicServicesData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const elec = getLatest(extraData.electricityAccess, ck);
      const water = getLatest(extraData.basicWater, ck);
      const sanit = getLatest(extraData.basicSanitation, ck);
      const net = getLatest(data.internetUsers, ck);
      const values = [elec, water, sanit, net].filter((v): v is number => v !== null);
      if (values.length === 0) return null;
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
        countryKey: ck,
        Electricity: elec !== null ? parseFloat(elec.toFixed(1)) : 0,
        Water: water !== null ? parseFloat(water.toFixed(1)) : 0,
        Sanitation: sanit !== null ? parseFloat(sanit.toFixed(1)) : 0,
        Internet: net !== null ? parseFloat(net.toFixed(1)) : 0,
        score: parseFloat(avg.toFixed(1)),
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score);
  }, [data, extraData]);

  // Spending efficiency — healthcare $ vs life expectancy; education $ vs tertiary enrollment
  const healthSpendingData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const spend = getLatest(data.healthcareExpenditure, ck);
      const outcome = getLatest(data.lifeExpectancy, ck);
      if (spend === null || outcome === null) return null;
      return {
        country: COUNTRY_DISPLAY_NAMES[ck],
        countryKey: ck,
        spend: parseFloat(spend.toFixed(2)),
        outcome: parseFloat(outcome.toFixed(1)),
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [data]);

  const eduSpendingData = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => {
      const spend = getLatest(data.educationExpenditure, ck);
      const outcome = getLatest(data.tertiaryEnrollment, ck);
      if (spend === null || outcome === null) return null;
      return {
        country: COUNTRY_DISPLAY_NAMES[ck],
        countryKey: ck,
        spend: parseFloat(spend.toFixed(2)),
        outcome: parseFloat(outcome.toFixed(1)),
        fill: COUNTRY_COLORS[ck],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [data]);

  // Population pyramid — age structure for selected country
  const populationPyramidData = useMemo(() => {
    const young = getLatest(extraData.popAge0_14, demoCountry);
    const working = getLatest(extraData.popAge15_64, demoCountry);
    const old = getLatest(extraData.popAge65Plus, demoCountry);
    return [
      { band: '65+', percent: old !== null ? parseFloat(old.toFixed(1)) : 0, fill: '#ef4444' },
      { band: '15-64', percent: working !== null ? parseFloat(working.toFixed(1)) : 0, fill: '#3b82f6' },
      { band: '0-14', percent: young !== null ? parseFloat(young.toFixed(1)) : 0, fill: '#22c55e' },
    ];
  }, [extraData, demoCountry]);

  const dependencyRatio = useMemo(() => {
    const young = getLatest(extraData.popAge0_14, demoCountry);
    const working = getLatest(extraData.popAge15_64, demoCountry);
    const old = getLatest(extraData.popAge65Plus, demoCountry);
    if (young === null || working === null || old === null || working === 0) return null;
    return parseFloat((((young + old) / working) * 100).toFixed(1));
  }, [extraData, demoCountry]);

  // Resource Curse — resource rents vs HDI
  const resourceCurseData = useMemo(() => {
    return scoreCards.map(sc => {
      const rents = getLatest(extraData.resourceRents, sc.country);
      if (rents === null || sc.hdi === null) return null;
      return {
        country: COUNTRY_DISPLAY_NAMES[sc.country],
        countryKey: sc.country,
        rents: parseFloat(rents.toFixed(2)),
        hdi: sc.hdi,
        fill: COUNTRY_COLORS[sc.country],
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [scoreCards, extraData]);

  // SDG Progress Tracker — 8 proxy goals
  const sdgData = useMemo(() => {
    if (!data) return [];
    const countryAvg = (series: CountryData[] | undefined, invert = false, scale = 100): number => {
      if (!series) return 0;
      const vals = COUNTRY_KEYS.map(ck => getLatest(series, ck)).filter((v): v is number => v !== null);
      if (vals.length === 0) return 0;
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const normalized = Math.max(0, Math.min(100, (avg / scale) * 100));
      return parseFloat((invert ? 100 - normalized : normalized).toFixed(1));
    };
    return [
      { goal: 'SDG 1 — No Poverty', proxy: 'Poverty rate ($2.15/day)', value: countryAvg(data.povertyRate, true, 100), target: 100, description: 'Share of population above $2.15/day poverty line' },
      { goal: 'SDG 3 — Good Health', proxy: 'Life expectancy', value: countryAvg(data.lifeExpectancy, false, 90), target: 90, description: 'Life expectancy scaled to 90-year target' },
      { goal: 'SDG 4 — Quality Education', proxy: 'Tertiary enrollment', value: countryAvg(data.tertiaryEnrollment, false, 80), target: 80, description: 'Tertiary enrollment scaled to 80% target' },
      { goal: 'SDG 5 — Gender Equality', proxy: 'Female labor force', value: countryAvg(data.femaleLaborForce, false, 100), target: 100, description: 'Female labor participation rate' },
      { goal: 'SDG 7 — Clean Energy', proxy: 'Renewable energy %', value: countryAvg(data.renewableEnergy, false, 80), target: 80, description: 'Renewable share of final energy consumption' },
      { goal: 'SDG 8 — Decent Work', proxy: 'Employment rate', value: countryAvg(data.employmentRates, false, 80), target: 80, description: 'Employment to population ratio' },
      { goal: 'SDG 10 — Reduced Inequality', proxy: 'Gini index inverted', value: countryAvg(data.giniCoefficient, true, 60), target: 100, description: 'Inverted Gini — higher = more equal' },
      { goal: 'SDG 13 — Climate Action', proxy: 'CO₂ emissions inverted', value: countryAvg(data.co2Emissions, true, 20), target: 100, description: 'Inverted CO₂ per capita — higher = cleaner' },
    ];
  }, [data]);

  // Digital divide — internet, mobile, broadband rankings
  const digitalDivideData = useMemo(() => {
    if (!data) return { internet: [], mobile: [], broadband: [] };
    const build = (series: CountryData[] | undefined) => {
      if (!series) return [];
      return COUNTRY_KEYS.map(ck => {
        const v = getLatest(series, ck);
        if (v === null) return null;
        return {
          country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
          countryKey: ck,
          value: parseFloat(v.toFixed(1)),
          fill: COUNTRY_COLORS[ck],
        };
      }).filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => b.value - a.value);
    };
    return {
      internet: build(data.internetUsers),
      mobile: build(extraData.mobileSubs),
      broadband: build(extraData.broadband),
    };
  }, [data, extraData]);

  const mapScores = useMemo(() => {
    return scoreCards.map(sc => ({
      country: sc.country as CountryKey,
      hdi: sc.hdi,
      gini: sc.gini,
      gdpPc: sc.gdpPc,
      lifeExp: sc.lifeExp,
    }));
  }, [scoreCards]);

  const currentMetricConfig = DEV_METRIC_OPTIONS.find(o => o.key === devMetric)!;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading development data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inequality & Development Index</h1>
            <p className={`${tc.textSec}`}>Human development, inequality, and social progress indicators</p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} />
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Measuring Development Beyond GDP</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            GDP alone does not capture the full picture of a nation&apos;s well-being. The <strong>Human Development
            Index (HDI)</strong>, introduced by the UN, combines three dimensions: a long and healthy life (life
            expectancy), knowledge (education enrollment), and a decent standard of living (income per capita).
            This page computes a simplified HDI-like score for each country and combines it with inequality
            and sustainability metrics for a richer picture.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Gini Coefficient</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Measures income inequality on a 0-100 scale. 0 means perfect equality; higher values indicate greater inequality.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Social Progress</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Healthcare and education spending as % of GDP show how much governments invest in their citizens&apos; well-being.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Sustainability</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The scatter plot shows CO2 emissions vs renewable energy. The ideal position is bottom-right: low emissions, high renewables.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Countries are ranked by their computed development score. Explore social, gender, and environmental indicators below.
            <a href="/guides/development-inequality" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className={`flex flex-wrap gap-1 p-1 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {DEV_SECTIONS.map(section => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    active
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================ OVERVIEW ================ */}
        {activeSection === 'overview' && (
        <>
        {/* Development Scorecard */}
        <div id={slugify('Development Scorecard (Simplified HDI)')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
            <h2 className="text-xl font-semibold">Development Scorecard (Simplified HDI)</h2>
            <SocialShareMenu title="Development Scorecard (Simplified HDI)" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {scoreCards.map((sc, rank) => {
              const hdiColor = (sc.hdi ?? 0) >= 0.8 ? 'text-green-500' : (sc.hdi ?? 0) >= 0.6 ? 'text-yellow-500' : 'text-red-500';
              return (
                <div key={sc.country} className={`rounded-lg border p-3 ${tc.card}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${tc.textSec}`}>#{rank + 1}</span>
                  </div>
                  <p className="text-xs font-medium mt-1 truncate">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</p>
                  <p className={`text-xl font-bold ${hdiColor}`}>{sc.hdi?.toFixed(3)}</p>
                  <div className={`text-xs mt-1 ${tc.textSec}`}>
                    {sc.gini !== null && <span>Gini: {sc.gini.toFixed(1)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </>
        )}

        {/* ================ GLOBAL MAP ================ */}
        {activeSection === 'map' && (
        <>
        {/* Global Development Map */}
        <div className="mb-8">
          <div className={`rounded-xl border p-4 mb-3 ${isDarkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
            <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>🗺️ Global Development Map</h3>
            <p className={`text-xs ${isDarkMode ? 'text-indigo-200/80' : 'text-indigo-800/90'}`}>
              Choropleth view of HDI, Gini, GDP per capita or life expectancy. Hover a country to see its value. Dark regions have no data in our tracked set.
            </p>
          </div>
          <DevelopmentWorldMap
            isDarkMode={isDarkMode}
            scoreCards={mapScores}
            metric={mapMetric}
            onMetricChange={setMapMetric}
          />
        </div>
        </>
        )}

        {/* Convergence Chart — GROWTH */}
        {activeSection === 'growth' && (
        <div id={slugify('Development Convergence (2000 → Today)')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Development Convergence (2000 → Today)</h2>
            <SocialShareMenu title="Development Convergence (2000 → Today)" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Do poor countries catch up? X-axis shows initial GDP/capita (PPP) in 2000; Y-axis shows 23-year annualized growth. A downward slope = convergence
            (poorer countries grow faster). Flat/upward = divergence.
          </p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis
                  type="number"
                  dataKey="initial"
                  name="Initial GDP/cap (2000)"
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  scale="log"
                  domain={['auto', 'auto']}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  label={{ value: 'Initial GDP per capita, PPP (2000) — log scale', position: 'bottom', offset: 10, fontSize: 11, fill: tc.axis }}
                />
                <YAxis
                  type="number"
                  dataKey="growth"
                  name="Annualized growth %"
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => `${v}%`}
                  label={{ value: 'Annualized GDP/cap growth (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }}
                />
                <ReferenceLine y={0} stroke={tc.axis} strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={tc.tooltip}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{d.country}</p>
                        <p>Initial (2000): ${d.initial.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p>Latest: ${d.latest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p>Annualized growth: {d.growth}%</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={convergenceData}>
                  {convergenceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Education Pipeline — EDUCATION */}
        {activeSection === 'education' && (
        <div id={slugify('Education Pipeline')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Education Pipeline</h2>
            <SocialShareMenu title="Education Pipeline" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            How students progress through education stages (all % gross enrollment / completion).
            Steep drop-offs from secondary to tertiary often signal opportunity bottlenecks.
          </p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={educationPipeline} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={tc.tooltip} formatter={(v: number) => `${v}%`} />
                <Legend />
                <Bar dataKey="Primary" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Secondary" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Tertiary" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* HCI vs HDI — EDUCATION */}
        {activeSection === 'education' && (
        <div id={slugify('Human Capital vs Human Development')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Human Capital vs Human Development</h2>
            <SocialShareMenu title="Human Capital vs Human Development" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            World Bank Human Capital Index (HCI 2020, potential productivity of a child born today) vs our computed HDI.
            Countries above the diagonal over-perform on human capital relative to overall development; below the line under-perform.
          </p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis
                  type="number"
                  dataKey="hdi"
                  name="HDI"
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  domain={[0.3, 1]}
                  label={{ value: 'Human Development Index (computed)', position: 'bottom', offset: 10, fontSize: 11, fill: tc.axis }}
                />
                <YAxis
                  type="number"
                  dataKey="hci"
                  name="HCI"
                  stroke={tc.axis}
                  tick={{ fontSize: 11 }}
                  domain={[0.3, 1]}
                  label={{ value: 'Human Capital Index (WB 2020)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }}
                />
                <ReferenceLine segment={[{ x: 0.3, y: 0.3 }, { x: 1, y: 1 }]} stroke={tc.axis} strokeDasharray="4 4" />
                <Tooltip
                  contentStyle={tc.tooltip}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{d.country}</p>
                        <p>HDI: {d.hdi.toFixed(3)}</p>
                        <p>HCI: {d.hci.toFixed(2)}</p>
                        <p className={d.hci >= d.hdi ? 'text-green-500' : 'text-orange-500'}>
                          {d.hci >= d.hdi ? 'Over-performing on human capital' : 'Human capital lagging'}
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter data={hciScatter}>
                  {hciScatter.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Social Mobility: Income Share — INEQUALITY */}
        {activeSection === 'inequality' && (
        <div id={slugify('Income Share: Bottom 20% vs Top 20%')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Income Share: Bottom 20% vs Top 20%</h2>
            <SocialShareMenu title="Income Share: Bottom 20% vs Top 20%" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Perfect equality would give each quintile 20% of national income. In practice, the top 20% typically captures 35-50%+ while the bottom 20% gets 3-7%.
            Countries are sorted by the top-to-bottom ratio (lower = more equal).
          </p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mobilityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{label}</p>
                        <p>Bottom 20%: {d['Bottom 20%']}% of income</p>
                        <p>Top 20%: {d['Top 20%']}% of income</p>
                        <p className="mt-1 font-medium">Top/Bottom ratio: {d.ratio}x</p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="Bottom 20%" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Top 20%" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* ===================== HEALTH TAB ===================== */}

        {/* Healthcare Access & Outcomes — HEALTH */}
        {activeSection === 'health' && (
        <div id={slugify('Healthcare Access & Outcomes')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Healthcare Access & Outcomes</h2>
            <SocialShareMenu title="Healthcare Access & Outcomes" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Six core health system indicators: child and maternal mortality (outcomes), physicians and hospital beds
            (access), DPT and measles immunization (prevention coverage).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { key: 'under5', label: 'Under-5 Mortality', unit: 'per 1,000 live births', good: 'low', format: (v: number) => v.toFixed(1) },
              { key: 'maternal', label: 'Maternal Mortality', unit: 'per 100,000 live births', good: 'low', format: (v: number) => v.toFixed(0) },
              { key: 'physicians', label: 'Physicians', unit: 'per 1,000 people', good: 'high', format: (v: number) => v.toFixed(2) },
              { key: 'hospitalBeds', label: 'Hospital Beds', unit: 'per 1,000 people', good: 'high', format: (v: number) => v.toFixed(2) },
              { key: 'immuneDPT', label: 'DPT Immunization', unit: '% of children', good: 'high', format: (v: number) => `${v.toFixed(0)}%` },
              { key: 'immuneMeasles', label: 'Measles Immunization', unit: '% of children', good: 'high', format: (v: number) => `${v.toFixed(0)}%` },
            ].map(metric => {
              const rows = healthOutcomesData
                .map(r => ({ country: r.country, countryKey: r.countryKey, value: (r as any)[metric.key] as number | null }))
                .filter(r => r.value !== null);
              const sorted = [...rows].sort((a, b) => metric.good === 'high'
                ? (b.value! - a.value!)
                : (a.value! - b.value!));
              const top3 = sorted.slice(0, 3);
              const bottom3 = sorted.slice(-3).reverse();
              return (
                <div key={metric.key} className={`rounded-lg border p-4 ${tc.card}`}>
                  <p className="text-sm font-semibold">{metric.label}</p>
                  <p className={`text-xs mb-2 ${tc.textSec}`}>{metric.unit}</p>
                  <div className="text-xs">
                    <p className={`font-medium ${metric.good === 'high' ? 'text-green-500' : 'text-green-500'}`}>Best</p>
                    {top3.map(r => (
                      <p key={r.countryKey} className="flex justify-between">
                        <span className="truncate">{r.country}</span>
                        <span className="font-mono">{metric.format(r.value!)}</span>
                      </p>
                    ))}
                    <p className={`font-medium mt-2 text-red-500`}>Worst</p>
                    {bottom3.map(r => (
                      <p key={r.countryKey} className="flex justify-between">
                        <span className="truncate">{r.country}</span>
                        <span className="font-mono">{metric.format(r.value!)}</span>
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div id={slugify('Under-5 Mortality vs Physicians per 1000')} className="flex items-start justify-between gap-2 flex-wrap mt-6 mb-2">
            <h3 className="text-lg font-semibold">Under-5 Mortality vs Physicians per 1000</h3>
            <SocialShareMenu title="Under-5 Mortality vs Physicians per 1000" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Each country plotted by doctor density vs child mortality. Top-right = worst (many doctors unable to prevent mortality — rare, often data issues). Bottom-right = best.</p>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" dataKey="physicians" name="Physicians/1000" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'Physicians per 1,000 people', position: 'bottom', offset: 10, fontSize: 11, fill: tc.axis }} />
                <YAxis type="number" dataKey="under5" name="Under-5 Mortality" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'Under-5 mortality per 1,000', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{d.country}</p>
                        <p>Physicians/1000: {d.physicians?.toFixed(2) ?? 'N/A'}</p>
                        <p>Under-5 mortality: {d.under5?.toFixed(1) ?? 'N/A'} per 1,000</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={healthOutcomesData.filter(d => d.physicians !== null && d.under5 !== null).map(d => ({
                  ...d,
                  fill: COUNTRY_COLORS[d.countryKey as CountryKey],
                }))}>
                  {healthOutcomesData
                    .filter(d => d.physicians !== null && d.under5 !== null)
                    .map((e, i) => <Cell key={i} fill={COUNTRY_COLORS[e.countryKey as CountryKey]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Basic Services Access — HEALTH */}
        {activeSection === 'health' && (
        <div id={slugify('Basic Services Access')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Basic Services Access</h2>
            <SocialShareMenu title="Basic Services Access" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            The foundational infrastructure of development: electricity, drinking water, sanitation, and internet.
            Composite score is the simple average of available indicators per country (0-100%).
          </p>
          <div style={{ height: `${Math.max(320, basicServicesData.length * 30)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={basicServicesData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" domain={[0, 100]} stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={tc.tooltip} formatter={(v: number) => `${v}%`} />
                <Legend />
                <Bar dataKey="Electricity" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Water" stackId="b" fill="#3b82f6" />
                <Bar dataKey="Sanitation" stackId="c" fill="#22c55e" />
                <Bar dataKey="Internet" stackId="d" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className={`text-xs mt-3 ${tc.textSec}`}>
            Note: bars are shown side-by-side (not stacked) for each of the 4 service types. Countries are sorted by composite score.
          </p>
        </div>
        )}

        {/* Spending Efficiency — HEALTH */}
        {activeSection === 'health' && (
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Spending Efficiency — Value for Money</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Does more public spending produce better outcomes? Countries <strong>above</strong> the trend are over-performing
            (good outcomes per dollar spent); <strong>below</strong> the trend are under-performing.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div id={slugify('Healthcare $ → Life Expectancy')}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <h3 className="text-sm font-semibold">Healthcare $ → Life Expectancy</h3>
                <SocialShareMenu title="Healthcare $ → Life Expectancy" isDarkMode={isDarkMode} className="shrink-0" />
              </div>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis type="number" dataKey="spend" name="Healthcare %GDP" stroke={tc.axis} tick={{ fontSize: 11 }}
                      label={{ value: 'Healthcare spending (% GDP)', position: 'bottom', offset: 10, fontSize: 11, fill: tc.axis }} />
                    <YAxis type="number" dataKey="outcome" name="Life Expectancy" stroke={tc.axis} tick={{ fontSize: 11 }} domain={[50, 90]}
                      label={{ value: 'Life expectancy (yrs)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                    <Tooltip
                      contentStyle={tc.tooltip}
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={tc.tooltip} className="px-3 py-2 text-xs">
                            <p className="font-semibold mb-1">{d.country}</p>
                            <p>Spending: {d.spend}% of GDP</p>
                            <p>Life expectancy: {d.outcome} yrs</p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={healthSpendingData}>
                      {healthSpendingData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div id={slugify('Education $ → Tertiary Enrollment')}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <h3 className="text-sm font-semibold">Education $ → Tertiary Enrollment</h3>
                <SocialShareMenu title="Education $ → Tertiary Enrollment" isDarkMode={isDarkMode} className="shrink-0" />
              </div>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis type="number" dataKey="spend" name="Education %GDP" stroke={tc.axis} tick={{ fontSize: 11 }}
                      label={{ value: 'Education spending (% GDP)', position: 'bottom', offset: 10, fontSize: 11, fill: tc.axis }} />
                    <YAxis type="number" dataKey="outcome" name="Tertiary Enrollment" stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0, 120]}
                      label={{ value: 'Tertiary enrollment %', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                    <Tooltip
                      contentStyle={tc.tooltip}
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={tc.tooltip} className="px-3 py-2 text-xs">
                            <p className="font-semibold mb-1">{d.country}</p>
                            <p>Spending: {d.spend}% of GDP</p>
                            <p>Tertiary enrollment: {d.outcome}%</p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={eduSpendingData}>
                      {eduSpendingData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Demographic Transition — ENVIRONMENT */}
        {activeSection === 'environment' && (
        <div id={slugify('Demographic Transition')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Demographic Transition</h2>
              <p className={`text-xs ${tc.textSec}`}>
                The classic pattern: both birth and death rates fall as development progresses. Life expectancy rises and fertility converges toward replacement (~2.1).
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <select
                value={demoCountry}
                onChange={e => setDemoCountry(e.target.value as CountryKey)}
                className={`rounded-lg px-3 py-2 text-sm border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {COUNTRY_KEYS.map(ck => (
                  <option key={ck} value={ck}>{COUNTRY_DISPLAY_NAMES[ck]}</option>
                ))}
              </select>
              <SocialShareMenu title="Demographic Transition" isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoTransition} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke={tc.axis} tick={{ fontSize: 11 }} label={{ value: 'per 1000 / fertility', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <YAxis yAxisId="right" orientation="right" stroke={tc.axis} tick={{ fontSize: 11 }} label={{ value: 'Life expectancy (yrs)', angle: 90, position: 'insideRight', fontSize: 11, fill: tc.axis }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Birth Rate" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="Death Rate" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="Fertility Rate" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="right" type="monotone" dataKey="Life Expectancy" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* ===================== SDG TAB ===================== */}

        {/* SDG Progress Tracker — SDG */}
        {activeSection === 'sdg' && (
        <div id={slugify('SDG Progress Tracker (Tracked-Country Average)')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">SDG Progress Tracker (Tracked-Country Average)</h2>
            <SocialShareMenu title="SDG Progress Tracker (Tracked-Country Average)" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Progress toward 8 of the 17 UN Sustainable Development Goals, using proxy indicators averaged across tracked countries
            (0-100 scale, 100 = goal achieved). Bars shows distance to target.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sdgData.map(goal => {
              const progress = Math.max(0, Math.min(100, goal.value));
              const color = progress >= 75 ? '#22c55e' : progress >= 50 ? '#eab308' : progress >= 25 ? '#f97316' : '#ef4444';
              return (
                <div key={goal.goal} className={`rounded-lg border p-4 ${tc.card}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{goal.goal}</p>
                      <p className={`text-xs ${tc.textSec}`}>{goal.proxy}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color }}>{progress.toFixed(0)}</p>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                  </div>
                  <p className={`text-xs mt-2 ${tc.textSec}`}>{goal.description}</p>
                </div>
              );
            })}
          </div>
          <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${tc.textSec}`}>
              <strong>Note:</strong> These are approximate proxies — the UN tracks 232 indicators across the 17 SDGs.
              Scores inverted for SDG 1 (poverty), 10 (inequality), and 13 (CO₂): lower raw values = better progress.
            </p>
          </div>
        </div>
        )}

        {/* Digital Divide — SDG */}
        {activeSection === 'sdg' && (
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Digital Divide Gradient</h2>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Three dimensions of connectivity ranked side by side. A country can rank high on mobile
            (cellular leapfrogging) while lagging on fixed broadband — a common pattern in emerging markets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Internet Users (% population)', data: digitalDivideData.internet, suffix: '%', color: '#3b82f6' },
              { title: 'Mobile Subscriptions (per 100)', data: digitalDivideData.mobile, suffix: '', color: '#8b5cf6' },
              { title: 'Fixed Broadband (per 100)', data: digitalDivideData.broadband, suffix: '', color: '#ec4899' },
            ].map(col => (
              <div key={col.title} id={slugify(col.title)}>
                <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                  <h3 className="text-sm font-semibold">{col.title}</h3>
                  <SocialShareMenu title={col.title} isDarkMode={isDarkMode} className="shrink-0" />
                </div>
                <div style={{ height: `${Math.max(280, col.data.length * 24)}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={col.data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                      <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 10 }} width={80} />
                      <Tooltip contentStyle={tc.tooltip} formatter={(v: number) => `${v}${col.suffix}`} />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                        {col.data.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Radar Comparison — COMPARE */}
        {activeSection === 'compare' && (
        <div id={slugify('Multi-Dimensional Country Comparison')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold mb-1">Multi-Dimensional Country Comparison</h2>
                <p className={`text-xs ${tc.textSec}`}>
                  Six development dimensions normalized to 0-100. Select up to 6 countries to compare their full development profile.
                </p>
              </div>
              <SocialShareMenu title="Multi-Dimensional Country Comparison" isDarkMode={isDarkMode} className="shrink-0" />
            </div>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_KEYS.map(ck => {
                const active = radarCountries.includes(ck);
                return (
                  <button
                    key={ck}
                    onClick={() => toggleRadarCountry(ck)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      active
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {(COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-[400px] sm:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke={tc.grid} />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: tc.axis }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: tc.axis }} />
                {radarCountries.map((ck, i) => (
                  <Radar
                    key={ck}
                    name={COUNTRY_DISPLAY_NAMES[ck]}
                    dataKey={COUNTRY_DISPLAY_NAMES[ck]}
                    stroke={COUNTRY_COLORS[ck] || devTimeColors[i % devTimeColors.length]}
                    fill={COUNTRY_COLORS[ck] || devTimeColors[i % devTimeColors.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip contentStyle={tc.tooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Social Progress Charts — INEQUALITY (both charts) */}
        {activeSection === 'inequality' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div id={slugify('Social Progress Comparison')} className={`rounded-xl border p-6 ${tc.card}`}>
            <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
              <h2 className="text-xl font-semibold">Social Progress Comparison</h2>
              <SocialShareMenu title="Social Progress Comparison" isDarkMode={isDarkMode} className="shrink-0" />
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={socialMetrics} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  <Bar dataKey="Healthcare %GDP" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Education %GDP" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Internet %" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div id={slugify('Gender & Youth')} className={`rounded-xl border p-6 ${tc.card}`}>
            <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
              <h2 className="text-xl font-semibold">Gender & Youth</h2>
              <SocialShareMenu title="Gender & Youth" isDarkMode={isDarkMode} className="shrink-0" />
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Legend />
                  <Bar dataKey="female" name="Female Labor %" fill="#ec4899" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="youth" name="Youth Unemployment %" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        )}

        {/* Sustainability: CO2 vs Renewable — ENVIRONMENT */}
        {activeSection === 'environment' && (
        <div id={slugify('Sustainability: CO2 Emissions vs Renewable Energy')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Sustainability: CO2 Emissions vs Renewable Energy</h2>
            <SocialShareMenu title="Sustainability: CO2 Emissions vs Renewable Energy" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Ideal position is bottom-right (low CO2, high renewable energy)</p>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="renewable" name="Renewable Energy %" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'Renewable Energy (%)', position: 'bottom', offset: 0, fontSize: 11, fill: tc.axis }} />
                <YAxis dataKey="co2" name="CO2 per capita" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'CO2 (tonnes/cap)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip contentStyle={tc.tooltip} cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => [value.toFixed(1), name]} />
                <Scatter data={sustainData} name="Countries">
                  {sustainData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Population Pyramid — ENVIRONMENT */}
        {activeSection === 'environment' && (
        <div id={slugify('Population Age Structure')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Population Age Structure</h2>
              <p className={`text-xs ${tc.textSec}`}>
                Share of population in each age band. A bottom-heavy pyramid (many young) indicates a potential
                demographic dividend; a top-heavy one indicates an aging society with rising old-age dependency.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <select
                value={demoCountry}
                onChange={e => setDemoCountry(e.target.value as CountryKey)}
                className={`rounded-lg px-3 py-2 text-sm border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {COUNTRY_KEYS.map(ck => (
                  <option key={ck} value={ck}>{COUNTRY_DISPLAY_NAMES[ck]}</option>
                ))}
              </select>
              <SocialShareMenu title="Population Age Structure" isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={populationPyramidData} layout="vertical" margin={{ top: 5, right: 40, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis type="number" domain={[0, 100]} stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="band" stroke={tc.axis} tick={{ fontSize: 13, fontWeight: 600 }} width={50} />
                    <Tooltip contentStyle={tc.tooltip} formatter={(v: number) => `${v}% of population`} />
                    <Bar dataKey="percent" radius={[0, 6, 6, 0]}>
                      {populationPyramidData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className={`rounded-lg border p-4 ${tc.card}`}>
                <p className={`text-xs ${tc.textSec}`}>Total Dependency Ratio</p>
                <p className="text-2xl font-bold">
                  {dependencyRatio !== null ? `${dependencyRatio}%` : '—'}
                </p>
                <p className={`text-xs mt-1 ${tc.textSec}`}>
                  Dependents (0-14 &amp; 65+) per 100 working-age. Lower = more demographic dividend potential.
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${tc.card}`}>
                <p className={`text-xs ${tc.textSec}`}>Interpretation</p>
                <p className="text-xs mt-1">
                  {dependencyRatio === null ? 'Data unavailable' :
                    dependencyRatio < 50 ? '✓ Low dependency — prime working-age economy.' :
                    dependencyRatio < 70 ? '⚖ Moderate dependency — balanced demographics.' :
                    '⚠ High dependency — strain on working population.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Resource Curse Scatter — ENVIRONMENT */}
        {activeSection === 'environment' && (
        <div id={slugify('Resource Curse? Rents vs Development')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Resource Curse? Rents vs Development</h2>
            <SocialShareMenu title="Resource Curse? Rents vs Development" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Natural resource rents as % of GDP (oil, gas, minerals, forest) plotted against HDI. The
            &quot;resource curse&quot; hypothesis predicts countries high in resource rents often underperform on development
            (Venezuela, Nigeria, Saudi Arabia). Norway is the classic counter-example.
          </p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" dataKey="rents" name="Resource Rents" stroke={tc.axis} tick={{ fontSize: 11 }}
                  label={{ value: 'Natural resource rents (% GDP)', position: 'bottom', offset: 10, fontSize: 11, fill: tc.axis }} />
                <YAxis type="number" dataKey="hdi" name="HDI" stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0.3, 1]}
                  label={{ value: 'Human Development Index', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <ReferenceLine y={0.7} stroke={tc.axis} strokeDasharray="3 3" label={{ value: 'HDI 0.70', fill: tc.axis, fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine x={10} stroke={tc.axis} strokeDasharray="3 3" label={{ value: '10% rents', fill: tc.axis, fontSize: 10, position: 'insideTopLeft' }} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const curse = d.rents > 10 && d.hdi < 0.7;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{d.country}</p>
                        <p>Resource rents: {d.rents}% GDP</p>
                        <p>HDI: {d.hdi.toFixed(3)}</p>
                        {curse && <p className="text-red-500 font-medium mt-1">⚠ Resource curse zone</p>}
                      </div>
                    );
                  }}
                />
                <Scatter data={resourceCurseData}>
                  {resourceCurseData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* HDI Component Breakdown — OVERVIEW */}
        {activeSection === 'overview' && (
        <div id={slugify('HDI Component Breakdown')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">HDI Component Breakdown</h2>
            <SocialShareMenu title="HDI Component Breakdown" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Three dimensions of the Human Development Index scored 0-100 for top 15 countries</p>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hdiBreakdown} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}`} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Bar dataKey="Life Expectancy" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Education" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Income" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Development Over Time (with metric selector) — GROWTH */}
        {activeSection === 'growth' && (
        <div id={slugify('Development Over Time')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-xl font-semibold mb-1">Development Over Time</h2>
              <p className={`text-xs ${tc.textSec}`}>Historical trends since 2000 for selected countries and metric.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                {DEV_METRIC_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setDevMetric(opt.key)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      devMetric === opt.key
                        ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow'
                        : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <SocialShareMenu title="Development Over Time" isDarkMode={isDarkMode} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {COUNTRY_KEYS.map(ck => {
              const active = selectedDevCountries.includes(ck);
              return (
                <button
                  key={ck}
                  onClick={() => setSelectedDevCountries(prev =>
                    prev.includes(ck) ? prev.filter(c => c !== ck) : [...prev, ck]
                  )}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    active
                      ? 'bg-blue-500 text-white border-blue-500'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {(COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12)}
                </button>
              );
            })}
          </div>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={devOverTimeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={['auto', 'auto']}
                  label={{ value: currentMetricConfig.yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  formatter={(value: number) => currentMetricConfig.format(value)}
                />
                <Legend />
                {selectedDevCountries.map((ck, i) => (
                  <Line
                    key={ck}
                    type="monotone"
                    dataKey={ck}
                    name={COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck}
                    stroke={COUNTRY_COLORS[ck as CountryKey] || devTimeColors[i % devTimeColors.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Inequality Over Time — GROWTH */}
        {activeSection === 'growth' && (
        <div id={slugify('Inequality Over Time (Gini)')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Inequality Over Time (Gini)</h2>
            <SocialShareMenu title="Inequality Over Time (Gini)" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Gini coefficient historical series for selected countries since 1990. Lower = more equal. Uses the same
            country selection as &quot;Development Over Time&quot; above.
          </p>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={giniOverTimeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={['auto', 'auto']}
                  label={{ value: 'Gini Index', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                {selectedDevCountries.map((ck, i) => (
                  <Line
                    key={ck}
                    type="monotone"
                    dataKey={ck}
                    name={COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck}
                    stroke={COUNTRY_COLORS[ck as CountryKey] || devTimeColors[i % devTimeColors.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Regional Development Comparison — GROWTH */}
        {activeSection === 'growth' && (
        <div id={slugify('Regional Development Comparison')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Regional Development Comparison</h2>
            <SocialShareMenu title="Regional Development Comparison" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Average HDI (x100), Gini coefficient, and healthcare spending by region</p>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalComparison} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="region" stroke={tc.axis} tick={{ fontSize: 10 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Bar dataKey="HDI" name="HDI (x100)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Gini" name="Gini Index" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Healthcare" name="Healthcare %GDP" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Gender Development Index — INEQUALITY */}
        {activeSection === 'inequality' && (
        <div id={slugify('Gender Development Index')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Gender Development Index</h2>
            <SocialShareMenu title="Gender Development Index" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Male vs female life expectancy side by side. Women typically live 3-7 years longer; a narrow gap may signal
            maternal or health-system deficits. Hover for school gender parity and female labor force participation.
          </p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gdiData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="country" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} domain={[40, 90]}
                  label={{ value: 'Life expectancy (yrs)', angle: -90, position: 'insideLeft', fontSize: 11, fill: tc.axis }} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{label}</p>
                        <p>Male life exp: {d['Life Exp Male']} yrs</p>
                        <p>Female life exp: {d['Life Exp Female']} yrs</p>
                        {d.leGap !== null && <p className="font-medium">Gap: +{d.leGap} yrs female</p>}
                        {d.parity !== null && <p>School gender parity: {d.parity.toFixed(2)}</p>}
                        {d.femLabor !== null && <p>Female labor: {d.femLabor.toFixed(1)}%</p>}
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="Life Exp Male" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Life Exp Female" fill="#ec4899" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Remittances Reliance — INEQUALITY */}
        {activeSection === 'inequality' && (
        <div id={slugify('Remittances as % of GDP')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Remittances as % of GDP</h2>
            <SocialShareMenu title="Remittances as % of GDP" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Personal remittances received (from citizens working abroad). For countries like the Philippines, Tajikistan,
            Egypt, or Lebanon, remittances can exceed 5-20% of GDP — a critical but volatile income source that also
            signals outmigration pressure.
          </p>
          <div style={{ height: `${Math.max(300, remittancesData.length * 28)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={remittancesData} layout="vertical" margin={{ top: 5, right: 40, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={tc.tooltip} formatter={(v: number) => `${v}% of GDP`} />
                <Bar dataKey="remittances" radius={[0, 4, 4, 0]}>
                  {remittancesData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Poverty & Income Cards — INEQUALITY */}
        {activeSection === 'inequality' && (
        <div id={slugify('Poverty & Income Overview')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Poverty & Income Overview</h2>
            <SocialShareMenu title="Poverty & Income Overview" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Countries sorted by GDP per capita (PPP). Color indicators: Gini green &lt; 30, yellow &lt; 40, red &ge; 40</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {povertyCards.map(sc => {
              const giniColor = sc.gini === null ? 'text-gray-400' : sc.gini < 30 ? 'text-green-500' : sc.gini < 40 ? 'text-yellow-500' : 'text-red-500';
              return (
                <div key={sc.country} className={`rounded-lg border p-3 ${tc.card}`}>
                  <p className="text-xs font-semibold truncate">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</p>
                  <p className="text-lg font-bold mt-1">
                    ${sc.gdpPc !== null ? sc.gdpPc.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
                  </p>
                  <p className={`text-xs ${tc.textSec}`}>GDP/capita PPP</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <span className={`text-xs font-medium ${giniColor}`}>
                        Gini: {sc.gini !== null ? sc.gini.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs ${tc.textSec}`}>
                        Poverty: {sc.poverty !== null ? `${sc.poverty.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Development Complexity Score — OVERVIEW */}
        {activeSection === 'overview' && (
        <div id={slugify('Development Complexity Score')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Development Complexity Score</h2>
            <SocialShareMenu title="Development Complexity Score" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            A custom 7-dimension composite going beyond HDI. Weights: HDI 25%, Equality 15%, Basic Services 15%, Health Outcomes 15%,
            Digital 10%, Sustainability 10%, Gender 10%. Countries ranked 0-100.
          </p>
          <div style={{ height: `${Math.max(320, complexityScoreData.length * 28)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complexityScoreData} layout="vertical" margin={{ top: 5, right: 60, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" domain={[0, 100]} stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const comps = d.components;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{d.country}</p>
                        <p className="font-bold mb-1">Composite: {d.score}</p>
                        {Object.entries(comps).map(([k, v]: any) => (
                          <p key={k}>{k}: {v !== null ? v.toFixed(1) : 'N/A'}</p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {complexityScoreData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Rises & Falls Leaderboard — OVERVIEW */}
        {activeSection === 'overview' && (
        <div id={slugify('Development Rises & Falls (2000 → Today)')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Development Rises & Falls (2000 → Today)</h2>
            <SocialShareMenu title="Development Rises & Falls (2000 → Today)" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>
            Change in computed HDI from 2000 to latest. Green = gains; red = losses. Reveals which countries have
            climbed the development ladder fastest and which have regressed.
          </p>
          <div style={{ height: `${Math.max(320, risesFallsData.length * 28)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risesFallsData} layout="vertical" margin={{ top: 5, right: 40, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))} />
                <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 11 }} width={100} />
                <ReferenceLine x={0} stroke={tc.axis} />
                <Tooltip
                  contentStyle={tc.tooltip}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="px-3 py-2 text-xs">
                        <p className="font-semibold mb-1">{d.country}</p>
                        <p>HDI 2000: {d.hdiInit.toFixed(3)}</p>
                        <p>HDI Today: {d.hdiNow.toFixed(3)}</p>
                        <p className={d.delta >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                          {d.delta >= 0 ? '+' : ''}{d.delta.toFixed(3)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="delta" radius={[0, 4, 4, 0]}>
                  {risesFallsData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Development Rankings Table — OVERVIEW */}
        {activeSection === 'overview' && (
        <div id={slugify('Development Rankings')} className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <h2 className="text-xl font-semibold">Development Rankings</h2>
            <SocialShareMenu title="Development Rankings" subject="dataset" isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <p className={`text-xs mb-4 ${tc.textSec}`}>Click column headers to sort. All countries ranked by key development indicators.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {[
                    { key: 'rank', label: 'Rank' },
                    { key: 'country', label: 'Country' },
                    { key: 'hdi', label: 'HDI Score' },
                    { key: 'lifeExp', label: 'Life Exp.' },
                    { key: 'education', label: 'Education %' },
                    { key: 'gdpPc', label: 'GDP/Capita' },
                    { key: 'gini', label: 'Gini' },
                    { key: 'healthcare', label: 'Healthcare %' },
                    { key: 'internet', label: 'Internet %' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-left font-medium cursor-pointer select-none hover:text-blue-500 transition-colors ${tc.textSec}`}
                      onClick={() => col.key !== 'rank' && col.key !== 'country' && toggleSort(col.key)}
                    >
                      {col.label}
                      {sortField === col.key && (
                        <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankingsData.map((sc, idx) => (
                  <tr
                    key={sc.country}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? 'border-gray-700/50 hover:bg-gray-700/30'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{COUNTRY_DISPLAY_NAMES[sc.country as CountryKey]}</td>
                    <td className="px-3 py-2">
                      <span className={
                        (sc.hdi ?? 0) >= 0.8 ? 'text-green-500 font-semibold' :
                        (sc.hdi ?? 0) >= 0.6 ? 'text-yellow-500 font-semibold' : 'text-red-500 font-semibold'
                      }>
                        {sc.hdi?.toFixed(3) ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{sc.lifeExp?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2">{sc.education !== null ? `${sc.education.toFixed(1)}%` : '—'}</td>
                    <td className="px-3 py-2">{sc.gdpPc !== null ? `$${sc.gdpPc.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={
                        sc.gini === null ? '' :
                        sc.gini < 30 ? 'text-green-500' : sc.gini < 40 ? 'text-yellow-500' : 'text-red-500'
                      }>
                        {sc.gini?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{sc.healthcare !== null ? `${sc.healthcare.toFixed(1)}%` : '—'}</td>
                    <td className="px-3 py-2">{sc.internet !== null ? `${sc.internet.toFixed(1)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
