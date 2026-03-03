import React, { useState, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import type { CountryData } from '../services/worldbank';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';
import ChartDownloadButton from './ChartDownloadButton';
import BulkChartDownload from './BulkChartDownload';
import InfoPanel from './InfoPanel';
import { economicMetrics } from '../data/economicMetrics';

const countryColors = {
  USA: "#8884d8", Canada: "#82ca9d", France: "#ffc658", Germany: "#ff8042", Italy: "#a4de6c", 
  Japan: "#d0ed57", UK: "#83a6ed", Australia: "#ff7300", Mexico: "#e60049", SouthKorea: "#0bb4ff", 
  Spain: "#50e991", Sweden: "#e6d800", Switzerland: "#9b19f5", Turkey: "#dc0ab4", Nigeria: "#00bfa0",
  China: "#b3d4ff", Russia: "#fd7f6f", Brazil: "#7eb0d5", Chile: "#b2e061", Argentina: "#bd7ebe",
  India: "#ff9ff3", Norway: "#45aaf2", Netherlands: "#ff6b35", Portugal: "#004e89", Belgium: "#f7b801",
  Indonesia: "#06a77d", SouthAfrica: "#d62246", Poland: "#c1292e", SaudiArabia: "#006c35", Egypt: "#c09000"
};

const countryFlags: { [key: string]: React.ComponentType<any> } = {
  UK: GB, USA: US, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG
};

const getThemeColors = (isDarkMode: boolean) => isDarkMode ? {
  card: 'bg-gray-800 border-gray-700',
  cardHover: 'hover:border-gray-600',
  cardInner: 'bg-gray-700/50',
  text: 'text-white',
  textSecondary: 'text-gray-400',
  textMuted: 'text-gray-500',
  border: 'border-gray-700',
  divider: 'bg-gray-700',
  accent: 'text-blue-400',
  accentBg: 'bg-blue-500/15',
  accentBorder: 'border-blue-500/40',
  gridStroke: '#374151',
  axisStroke: '#9ca3af',
  tooltipStyle: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
  btnSelected: 'bg-blue-500/20 border-blue-500 text-blue-400 ring-1 ring-blue-500/30',
  btnUnselected: 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50',
  periodActive: 'bg-blue-600 text-white',
  periodInactive: 'bg-gray-700/50 text-gray-400 hover:text-gray-300 hover:bg-gray-700',
  correlationBg: 'bg-gray-700/60 border border-gray-600/50',
  analysisBg: 'bg-gray-700/40 border border-gray-600/40',
} : {
  card: 'bg-white border-gray-200',
  cardHover: 'hover:border-gray-300 hover:shadow-md',
  cardInner: 'bg-gray-50',
  text: 'text-gray-900',
  textSecondary: 'text-gray-500',
  textMuted: 'text-gray-400',
  border: 'border-gray-200',
  divider: 'bg-gray-200',
  accent: 'text-blue-600',
  accentBg: 'bg-blue-50',
  accentBorder: 'border-blue-200',
  gridStroke: '#e5e7eb',
  axisStroke: '#6b7280',
  tooltipStyle: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
  btnSelected: 'bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500/30',
  btnUnselected: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  periodActive: 'bg-blue-600 text-white',
  periodInactive: 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  correlationBg: 'bg-blue-50/60 border border-blue-100',
  analysisBg: 'bg-blue-50/40 border border-blue-100',
};

const SectionHeader = ({ title, isDarkMode }: { title: string; isDarkMode: boolean }) => {
  const tc = getThemeColors(isDarkMode);
  return (
    <div className="flex items-center gap-3 mt-2 mb-4">
      <h3 className={`text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${tc.textSecondary}`}>
        {title}
      </h3>
      <div className={`flex-1 h-px ${tc.divider}`} />
    </div>
  );
};

interface ComparisonDashboardProps {
  data: {
    interestRates: CountryData[];
    employmentRates: CountryData[];
    unemploymentRates: CountryData[];
    governmentDebt: CountryData[];
    inflationRates: CountryData[];
    gdpGrowth: CountryData[];
    cpiData: CountryData[];
    populationGrowth: CountryData[];
    fdi: CountryData[];
    tradeBalance: CountryData[];
    governmentSpending: CountryData[];
    laborProductivity: CountryData[];
    giniCoefficient: CountryData[];
    rdSpending: CountryData[];
    energyConsumption: CountryData[];
    gdpPerCapitaPPP: CountryData[];
    currentAccount: CountryData[];
    grossCapitalFormation: CountryData[];
    reservesMonthsImports: CountryData[];
    exchangeRate: CountryData[];
    povertyRate: CountryData[];
    tertiaryEnrollment: CountryData[];
    taxRevenue: CountryData[];
    domesticCredit: CountryData[];
    exports: CountryData[];
    imports: CountryData[];
    lifeExpectancy: CountryData[];
    urbanPopulation: CountryData[];
    hightechExports: CountryData[];
    co2Emissions: CountryData[];
    netMigration: CountryData[];
    laborForceParticipation: CountryData[];
    budgetBalance: CountryData[];
    healthcareExpenditure: CountryData[];
    educationExpenditure: CountryData[];
    internetUsers: CountryData[];
    youthUnemployment: CountryData[];
    manufacturingValueAdded: CountryData[];
    householdConsumption: CountryData[];
    renewableEnergy: CountryData[];
    femaleLaborForce: CountryData[];
    militaryExpenditure: CountryData[];
    marketCapitalization: CountryData[];
    scientificPublications: CountryData[];
    ictExports: CountryData[];
    mobileSubscriptions: CountryData[];
    patentApplications: CountryData[];
    socialSpending: CountryData[];
    publicDebtService: CountryData[];
    servicesValueAdded: CountryData[];
    agriculturalValueAdded: CountryData[];
    tradeOpenness: CountryData[];
    tariffRate: CountryData[];
    tourismReceipts: CountryData[];
    privateInvestment: CountryData[];
    newBusinessDensity: CountryData[];
  };
  isDarkMode: boolean;
}

interface ComparisonMetricProps {
  title: string;
  data: {
    interestRates: CountryData[];
    employmentRates: CountryData[];
    unemploymentRates: CountryData[];
    governmentDebt: CountryData[];
    inflationRates: CountryData[];
    gdpGrowth: CountryData[];
    cpiData: CountryData[];
    populationGrowth: CountryData[];
    fdi: CountryData[];
    tradeBalance: CountryData[];
    governmentSpending: CountryData[];
    laborProductivity: CountryData[];
    giniCoefficient: CountryData[];
    rdSpending: CountryData[];
    energyConsumption: CountryData[];
    gdpPerCapitaPPP: CountryData[];
    currentAccount: CountryData[];
    grossCapitalFormation: CountryData[];
    reservesMonthsImports: CountryData[];
    exchangeRate: CountryData[];
    povertyRate: CountryData[];
    tertiaryEnrollment: CountryData[];
    taxRevenue: CountryData[];
    domesticCredit: CountryData[];
    exports: CountryData[];
    imports: CountryData[];
    lifeExpectancy: CountryData[];
    urbanPopulation: CountryData[];
    hightechExports: CountryData[];
    co2Emissions: CountryData[];
    netMigration: CountryData[];
    laborForceParticipation: CountryData[];
    budgetBalance: CountryData[];
    healthcareExpenditure: CountryData[];
    educationExpenditure: CountryData[];
    internetUsers: CountryData[];
    youthUnemployment: CountryData[];
    manufacturingValueAdded: CountryData[];
    householdConsumption: CountryData[];
    renewableEnergy: CountryData[];
    femaleLaborForce: CountryData[];
    militaryExpenditure: CountryData[];
    marketCapitalization: CountryData[];
    scientificPublications: CountryData[];
    ictExports: CountryData[];
    mobileSubscriptions: CountryData[];
    patentApplications: CountryData[];
    socialSpending: CountryData[];
    publicDebtService: CountryData[];
    servicesValueAdded: CountryData[];
    agriculturalValueAdded: CountryData[];
    tradeOpenness: CountryData[];
    tariffRate: CountryData[];
    tourismReceipts: CountryData[];
    privateInvestment: CountryData[];
    newBusinessDensity: CountryData[];
  };
  metricKey: keyof ComparisonMetricProps['data'];
  countries: string[];
  isDarkMode: boolean;
  yDomain?: [number, number];
  valueFormatter?: (value: number) => string;
  chartType?: 'line' | 'area' | 'bar';
}

const ComparisonMetric: React.FC<ComparisonMetricProps> = ({ 
  title, 
  data,
  metricKey,
  countries, 
  isDarkMode,
  yDomain = [0, 100],
  valueFormatter = (value: number) => `${value.toFixed(1)}%`,
  chartType = 'line'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const tc = getThemeColors(isDarkMode);
  const cardClass = `p-4 sm:p-5 rounded-xl border shadow-sm transition-all duration-200 relative ${tc.card} ${tc.cardHover}`;

  const sharedChartElements = (type: 'area' | 'bar' | 'line') => ({
    grid: <CartesianGrid strokeDasharray="3 3" stroke={tc.gridStroke} />,
    xAxis: <XAxis dataKey="year" stroke={tc.axisStroke} tick={{ fontSize: 10, fill: tc.axisStroke }} tickLine={{ stroke: tc.gridStroke }} />,
    yAxis: <YAxis domain={yDomain} stroke={tc.axisStroke} tickFormatter={valueFormatter} width={55} tick={{ fontSize: 10, fill: tc.axisStroke }} tickLine={{ stroke: tc.gridStroke }} />,
    tooltip: <Tooltip contentStyle={tc.tooltipStyle} formatter={(value: number) => valueFormatter(value)} />,
    legend: <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />,
    header: (
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-sm sm:text-base font-semibold leading-tight pr-2 ${tc.text}`}>{title}</h3>
        <ChartDownloadButton
          chartElement={chartRef.current}
          chartData={{ title, data: data[metricKey], type, countries }}
          variant="outline"
          size="sm"
        />
      </div>
    ),
    info: (
      <InfoPanel
        metric={economicMetrics[metricKey as keyof typeof economicMetrics] || economicMetrics.interestRate}
        isDarkMode={isDarkMode}
        position="top-right"
        size="small"
      />
    ),
  });

  if (chartType === 'area') {
    const els = sharedChartElements('area');
    return (
      <div ref={chartRef} data-chart-container data-chart-title={title} className={cardClass}>
        {els.header}
        {els.info}
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data[metricKey]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              {els.grid}{els.xAxis}{els.yAxis}{els.tooltip}{els.legend}
              {countries.map(country => (
                <Area key={country} type="monotone" dataKey={country}
                  stroke={countryColors[country as keyof typeof countryColors]}
                  fill={countryColors[country as keyof typeof countryColors]}
                  fillOpacity={0.15} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (chartType === 'bar') {
    const els = sharedChartElements('bar');
    return (
      <div ref={chartRef} data-chart-container data-chart-title={title} className={cardClass}>
        {els.header}
        {els.info}
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data[metricKey]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              {els.grid}{els.xAxis}{els.yAxis}{els.tooltip}{els.legend}
              {countries.map(country => (
                <Bar key={country} dataKey={country}
                  fill={countryColors[country as keyof typeof countryColors]}
                  radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  const els = sharedChartElements('line');
  return (
    <div ref={chartRef} data-chart-container data-chart-title={title} className={cardClass}>
      {els.header}
      {els.info}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data[metricKey]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            {els.grid}{els.xAxis}{els.yAxis}{els.tooltip}{els.legend}
            {countries.map(country => (
              <Line key={country} type="monotone" dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                dot={false} activeDot={{ r: 4 }} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface StatComparisonProps {
  countries: string[];
  metric: CountryData[];
  data: ComparisonDashboardProps['data'];
  isDarkMode: boolean;
  title: string;
  format?: (value: number) => string;
}

const StatComparison = ({
  countries,
  metric,
  data,
  isDarkMode,
  title,
  format = (v: number) => `${v.toFixed(1)}%`
}: StatComparisonProps) => {
  const tc = getThemeColors(isDarkMode);
  const latest = metric[metric.length - 1];
  
  if (!latest) {
    return (
      <div className={`p-4 rounded-xl border border-l-4 border-l-blue-500 shadow-sm ${tc.card}`}>
        <h3 className={`text-sm font-semibold mb-3 ${tc.text}`}>{title}</h3>
        <div className={`text-sm ${tc.textMuted}`}>
          No data available for this indicator
        </div>
      </div>
    );
  }
  
  const sorted = [...countries].sort((a, b) => (Number(latest[b]) || 0) - (Number(latest[a]) || 0));
  const maxVal = Math.max(...sorted.map(c => Math.abs(Number(latest[c]) || 0)), 1);

  return (
    <div className={`p-4 rounded-xl border border-l-4 border-l-blue-500 shadow-sm transition-all duration-200 ${tc.card} ${tc.cardHover}`}>
      <h3 className={`text-sm font-semibold mb-3 ${tc.text}`}>{title}</h3>
      <div className="space-y-3">
        {sorted.map((country, idx) => {
          const value = Number(latest[country]) || 0;
          const FlagComponent = countryFlags[country];
          const barWidth = Math.max((Math.abs(value) / maxVal) * 100, 4);
          
          return (
            <div key={country}>
              <div className="flex items-center gap-3 mb-1">
                {FlagComponent && (
                  <div className="w-7 h-5 overflow-hidden rounded shadow-sm flex-shrink-0">
                    <FlagComponent />
                  </div>
                )}
                <span className={`flex-1 text-sm ${tc.text}`}>{country}</span>
                <span className={`text-sm font-semibold tabular-nums ${idx === 0 ? tc.accent : tc.text}`}>
                  {format(value)}
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-100'}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: countryColors[country as keyof typeof countryColors] || '#8884d8',
                    opacity: idx === 0 ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const calculateCorrelation = (data1: number[], data2: number[]) => {
  const n = data1.length;
  if (n !== data2.length || n === 0) return 0;

  const mean1 = data1.reduce((a, b) => a + b, 0) / n;
  const mean2 = data2.reduce((a, b) => a + b, 0) / n;

  const variance1 = data1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0);
  const variance2 = data2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0);

  const covariance = data1.reduce((a, b, i) => a + (b - mean1) * (data2[i] - mean2), 0);

  return covariance / Math.sqrt(variance1 * variance2);
};

const calculateEconomicSimilarity = (country1Data: any, country2Data: any) => {
  // Enhanced economic similarity calculation with new metrics
  const metrics = [
    { key: 'gdp', weight: 20, maxDiff: 20 },
    { key: 'inflation', weight: 15, maxDiff: 20 },
    { key: 'employment', weight: 15, maxDiff: 40 },
    { key: 'debt', weight: 15, maxDiff: 150 },
    { key: 'fdi', weight: 10, maxDiff: 10 },
    { key: 'tradeBalance', weight: 10, maxDiff: 20 },
    { key: 'governmentSpending', weight: 5, maxDiff: 30 },
    { key: 'laborProductivity', weight: 5, maxDiff: 50000 },
    { key: 'gini', weight: 5, maxDiff: 0.3 }
  ];
  
  let similarity = 0;
  let totalWeight = 0;

  metrics.forEach(metric => {
    const diff = Math.abs(country1Data[metric.key] - country2Data[metric.key]);
    const normalizedDiff = Math.min(diff / metric.maxDiff, 1);
    similarity += (1 - normalizedDiff) * metric.weight;
    totalWeight += metric.weight;
  });

  return Math.round((similarity / totalWeight) * 100);
};

const CorrelationMatrix = ({ 
  data, 
  countries, 
  isDarkMode 
}: { 
  data: ComparisonDashboardProps['data']; 
  countries: string[]; 
  isDarkMode: boolean;
}) => {
  const correlations = useMemo(() => {
    const matrix: { country1: string; country2: string; gdp: number; inflation: number; employment: number; lifeExpectancy: number }[] = [];
    
    for (let i = 0; i < countries.length; i++) {
      for (let j = i + 1; j < countries.length; j++) {
        const country1 = countries[i];
        const country2 = countries[j];
        
        const gdpData1 = data.gdpGrowth.map(d => Number(d[country1]) || 0).filter(v => v !== 0);
        const gdpData2 = data.gdpGrowth.map(d => Number(d[country2]) || 0).filter(v => v !== 0);
        const inflationData1 = data.inflationRates.map(d => Number(d[country1]) || 0).filter(v => v !== 0);
        const inflationData2 = data.inflationRates.map(d => Number(d[country2]) || 0).filter(v => v !== 0);
        const employmentData1 = data.employmentRates.map(d => Number(d[country1]) || 0).filter(v => v !== 0);
        const employmentData2 = data.employmentRates.map(d => Number(d[country2]) || 0).filter(v => v !== 0);
        const lifeExpectancyData1 = data.lifeExpectancy.map(d => Number(d[country1]) || 0).filter(v => v !== 0);
        const lifeExpectancyData2 = data.lifeExpectancy.map(d => Number(d[country2]) || 0).filter(v => v !== 0);
        
        matrix.push({
          country1,
          country2,
          gdp: calculateCorrelation(gdpData1, gdpData2),
          inflation: calculateCorrelation(inflationData1, inflationData2),
          employment: calculateCorrelation(employmentData1, employmentData2),
          lifeExpectancy: calculateCorrelation(lifeExpectancyData1, lifeExpectancyData2)
        });
      }
    }
    return matrix;
  }, [data, countries]);

  const tc = getThemeColors(isDarkMode);
  const getCorrelationColor = (val: number) =>
    val > 0.5 ? 'text-emerald-500 font-semibold' : val < -0.5 ? 'text-red-500 font-semibold' : tc.textSecondary;
  const getCorrelationBadge = (val: number) => {
    const bg = val > 0.5 ? (isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-50') : val < -0.5 ? (isDarkMode ? 'bg-red-500/15' : 'bg-red-50') : (isDarkMode ? 'bg-gray-600/40' : 'bg-gray-50');
    return `inline-block px-2 py-0.5 rounded-md text-xs font-medium tabular-nums ${bg}`;
  };

  return (
    <div className={`p-4 sm:p-5 rounded-xl border shadow-sm transition-all duration-200 ${tc.card} ${tc.cardHover}`}>
      <h3 className={`text-base font-semibold mb-4 ${tc.text}`}>Economic Correlations</h3>
      <div className="space-y-3">
        {correlations.map(({ country1, country2, gdp, inflation, employment, lifeExpectancy }) => {
          const Flag1 = countryFlags[country1];
          const Flag2 = countryFlags[country2];
          
          return (
            <div key={`${country1}-${country2}`} className={`p-3 sm:p-4 rounded-lg ${tc.correlationBg}`}>
              <div className="flex items-center gap-2 mb-3">
                {Flag1 && <div className="w-6 h-4 rounded overflow-hidden shadow-sm"><Flag1 /></div>}
                <span className={`font-medium text-sm ${tc.text}`}>{country1}</span>
                <span className={`mx-1 ${tc.textMuted}`}>⟷</span>
                {Flag2 && <div className="w-6 h-4 rounded overflow-hidden shadow-sm"><Flag2 /></div>}
                <span className={`font-medium text-sm ${tc.text}`}>{country2}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  { label: 'GDP', val: gdp },
                  { label: 'Inflation', val: inflation },
                  { label: 'Employment', val: employment },
                  { label: 'Life Expectancy', val: lifeExpectancy },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className={`text-xs ${tc.textSecondary}`}>{label}</span>
                    <span className={`${getCorrelationBadge(val)} ${getCorrelationColor(val)}`}>
                      {(val * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EconomicSimilarityChart = ({
  data,
  countries,
  isDarkMode
}: {
  data: ComparisonDashboardProps['data'];
  countries: string[];
  isDarkMode: boolean;
}) => {
  const chartData = useMemo(() => {
    const similarities: any[] = [];
    
    countries.forEach(country1 => {
      countries.forEach(country2 => {
        if (country1 !== country2) {
          const latest = {
            gdp: Number(data.gdpGrowth[data.gdpGrowth.length - 1][country1]) || 0,
            inflation: Number(data.inflationRates[data.inflationRates.length - 1][country1]) || 0,
            employment: Number(data.employmentRates[data.employmentRates.length - 1][country1]) || 0,
            debt: Number(data.governmentDebt[data.governmentDebt.length - 1][country1]) || 0,
            fdi: Number(data.fdi[data.fdi.length - 1][country1]) || 0,
            tradeBalance: Number(data.tradeBalance[data.tradeBalance.length - 1][country1]) || 0,
            governmentSpending: Number(data.governmentSpending[data.governmentSpending.length - 1][country1]) || 0,
            laborProductivity: Number(data.laborProductivity[data.laborProductivity.length - 1][country1]) || 0,
            gini: Number(data.giniCoefficient[data.giniCoefficient.length - 1][country1]) || 0
          };
          
          const compareLatest = {
            gdp: Number(data.gdpGrowth[data.gdpGrowth.length - 1][country2]) || 0,
            inflation: Number(data.inflationRates[data.inflationRates.length - 1][country2]) || 0,
            employment: Number(data.employmentRates[data.employmentRates.length - 1][country2]) || 0,
            debt: Number(data.governmentDebt[data.governmentDebt.length - 1][country2]) || 0,
            fdi: Number(data.fdi[data.fdi.length - 1][country2]) || 0,
            tradeBalance: Number(data.tradeBalance[data.tradeBalance.length - 1][country2]) || 0,
            governmentSpending: Number(data.governmentSpending[data.governmentSpending.length - 1][country2]) || 0,
            laborProductivity: Number(data.laborProductivity[data.laborProductivity.length - 1][country2]) || 0,
            gini: Number(data.giniCoefficient[data.giniCoefficient.length - 1][country2]) || 0
          };
          
          similarities.push({
            country1,
            country2,
            similarity: calculateEconomicSimilarity(latest, compareLatest),
            gdpDiff: Math.abs(latest.gdp - compareLatest.gdp),
            inflationDiff: Math.abs(latest.inflation - compareLatest.inflation),
            fdiDiff: Math.abs(latest.fdi - compareLatest.fdi),
            tradeBalanceDiff: Math.abs(latest.tradeBalance - compareLatest.tradeBalance)
          });
        }
      });
    });
    
    return similarities;
  }, [data, countries]);

  const tc = getThemeColors(isDarkMode);

  return (
    <div className={`p-4 sm:p-5 rounded-xl border shadow-sm relative transition-all duration-200 ${tc.card} ${tc.cardHover}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-base font-semibold ${tc.text}`}>Enhanced Economic Similarity Analysis</h3>
        <InfoPanel
          metric={economicMetrics.economicSimilarityAnalysis}
          isDarkMode={isDarkMode}
          position="fixed-top-right"
          size="small"
        />
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.gridStroke} />
            <XAxis dataKey="gdpDiff" name="GDP Difference" unit="%" stroke={tc.axisStroke} tick={{ fontSize: 10, fill: tc.axisStroke }} />
            <YAxis dataKey="inflationDiff" name="Inflation Difference" unit="%" stroke={tc.axisStroke} tick={{ fontSize: 10, fill: tc.axisStroke }} />
            <ZAxis dataKey="similarity" range={[50, 400]} name="Economic Similarity" />
            <Tooltip
              contentStyle={tc.tooltipStyle}
              formatter={(value: any, name: string) => [
                `${parseFloat(value).toFixed(1)}%`,
                name.replace('Diff', ' Difference')
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {chartData.map((entry, index) => (
              <Scatter key={index} name={`${entry.country1} - ${entry.country2}`} data={[entry]} fill={countryColors[entry.country1]} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className={`mt-4 text-xs leading-relaxed ${tc.textMuted}`}>
        Bubble size indicates overall economic similarity. Smaller distances suggest more similar economies.
      </p>
    </div>
  );
};

// New component for multi-dimensional economic radar chart
const EconomicRadarChart = ({
  data,
  countries,
  isDarkMode
}: {
  data: ComparisonDashboardProps['data'];
  countries: string[];
  isDarkMode: boolean;
}) => {
  const radarData = useMemo(() => {
    if (countries.length === 0) return [];
    
    return countries.map(country => {
      const latest = {
        gdp: Number(data.gdpGrowth[data.gdpGrowth.length - 1][country]) || 0,
        inflation: Number(data.inflationRates[data.inflationRates.length - 1][country]) || 0,
        employment: Number(data.employmentRates[data.employmentRates.length - 1][country]) || 0,
        debt: Number(data.governmentDebt[data.governmentDebt.length - 1][country]) || 0,
        fdi: Number(data.fdi[data.fdi.length - 1][country]) || 0,
        tradeBalance: Number(data.tradeBalance[data.tradeBalance.length - 1][country]) || 0,
        governmentSpending: Number(data.governmentSpending[data.governmentSpending.length - 1][country]) || 0,
        gini: Number(data.giniCoefficient[data.giniCoefficient.length - 1][country]) || 0,
        gdpPerCapita: Number(data.gdpPerCapitaPPP[data.gdpPerCapitaPPP.length - 1][country]) || 0,
        lifeExpectancy: Number(data.lifeExpectancy[data.lifeExpectancy.length - 1][country]) || 0
      };
      
      // Normalize values to 0-100 scale for radar chart
      return {
        country,
        gdp: Math.min(Math.max((latest.gdp + 10) * 5, 0), 100), // -10% to +10% -> 0-100
        inflation: Math.min(Math.max((latest.inflation) * 5, 0), 100), // 0-20% -> 0-100
        employment: Math.min(Math.max((latest.employment - 40) * 2.5, 0), 100), // 40-80% -> 0-100
        debt: Math.min(Math.max((100 - latest.debt) * 1, 0), 100), // 100-0% -> 0-100 (inverted)
        fdi: Math.min(Math.max((latest.fdi + 5) * 10, 0), 100), // -5% to +5% -> 0-100
        tradeBalance: Math.min(Math.max((latest.tradeBalance + 10) * 5, 0), 100), // -10% to +10% -> 0-100
        governmentSpending: Math.min(Math.max((latest.governmentSpending - 10) * 2, 0), 100), // 10-60% -> 0-100
        gini: Math.min(Math.max((1 - latest.gini) * 100, 0), 100), // 1-0 -> 0-100 (inverted)
        gdpPerCapita: Math.min(Math.max((latest.gdpPerCapita / 1000), 0), 100), // $0-100k -> 0-100
        lifeExpectancy: Math.min(Math.max((latest.lifeExpectancy - 40) * 2.5, 0), 100) // 40-80 years -> 0-100
      };
    });
  }, [data, countries]);

  if (radarData.length === 0) return null;

  // Create a combined dataset for the radar chart
  const combinedData = [
    { metric: 'GDP Growth', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.gdp }), {}) },
    { metric: 'Inflation', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.inflation }), {}) },
    { metric: 'Employment', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.employment }), {}) },
    { metric: 'Debt Management', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.debt }), {}) },
    { metric: 'FDI', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.fdi }), {}) },
    { metric: 'Trade Balance', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.tradeBalance }), {}) },
    { metric: 'Government Spending', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.governmentSpending }), {}) },
    { metric: 'Income Equality', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.gini }), {}) },
    { metric: 'GDP per Capita', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.gdpPerCapita }), {}) },
    { metric: 'Life Expectancy', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.lifeExpectancy }), {}) }
  ];

  const tc = getThemeColors(isDarkMode);

  return (
    <div className={`p-4 sm:p-5 rounded-xl border shadow-sm transition-all duration-200 ${tc.card} ${tc.cardHover}`}>
      <h3 className={`text-base font-semibold mb-4 ${tc.text}`}>Economic Profile Radar Chart</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={combinedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke={tc.gridStroke} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: tc.axisStroke, fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: tc.axisStroke, fontSize: 10 }} />
            {countries.map((country) => (
              <Radar key={country} name={country} dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                fill={countryColors[country as keyof typeof countryColors]}
                fillOpacity={0.2} strokeWidth={2} />
            ))}
            <Tooltip contentStyle={tc.tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className={`mt-4 text-xs leading-relaxed ${tc.textMuted}`}>
        Multi-dimensional economic profile comparison. Higher values indicate better performance in each metric.
      </p>
    </div>
  );
};

const CountryComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ data, isDarkMode }) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'5y' | '10y' | 'all'>('all');
  const maxCountries = 4;

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(country)) {
        return prev.filter(c => c !== country);
      }
      if (prev.length >= maxCountries) {
        return [...prev.slice(1), country];
      }
      return [...prev, country];
    });
  };

  const filteredData = useMemo(() => {
    if (!selectedPeriod) return null;

    const endYear = new Date().getFullYear();
    const startYear = selectedPeriod === '5y' ? endYear - 5 : 
                     selectedPeriod === '10y' ? endYear - 10 : 1960;
    
    const filterByTimeRange = (data: CountryData[]) => {
      return data.filter(item => {
        const year = parseInt(item.year.toString());
        return year >= startYear && year <= endYear;
      });
    };

    return {
      interestRates: filterByTimeRange(data.interestRates),
      employmentRates: filterByTimeRange(data.employmentRates),
      unemploymentRates: filterByTimeRange(data.unemploymentRates),
      governmentDebt: filterByTimeRange(data.governmentDebt),
      inflationRates: filterByTimeRange(data.inflationRates),
      gdpGrowth: filterByTimeRange(data.gdpGrowth),
      cpiData: filterByTimeRange(data.cpiData),
      populationGrowth: filterByTimeRange(data.populationGrowth),
      fdi: filterByTimeRange(data.fdi),
      tradeBalance: filterByTimeRange(data.tradeBalance),
      governmentSpending: filterByTimeRange(data.governmentSpending),
      laborProductivity: filterByTimeRange(data.laborProductivity),
      giniCoefficient: filterByTimeRange(data.giniCoefficient),
      rdSpending: filterByTimeRange(data.rdSpending),
      energyConsumption: filterByTimeRange(data.energyConsumption),
      gdpPerCapitaPPP: filterByTimeRange(data.gdpPerCapitaPPP),
      currentAccount: filterByTimeRange(data.currentAccount),
      grossCapitalFormation: filterByTimeRange(data.grossCapitalFormation),
      reservesMonthsImports: filterByTimeRange(data.reservesMonthsImports),
      exchangeRate: filterByTimeRange(data.exchangeRate),
      povertyRate: filterByTimeRange(data.povertyRate),
      tertiaryEnrollment: filterByTimeRange(data.tertiaryEnrollment),
      taxRevenue: filterByTimeRange(data.taxRevenue),
      domesticCredit: filterByTimeRange(data.domesticCredit),
      exports: filterByTimeRange(data.exports),
      imports: filterByTimeRange(data.imports),
      lifeExpectancy: filterByTimeRange(data.lifeExpectancy),
      urbanPopulation: filterByTimeRange(data.urbanPopulation),
      hightechExports: filterByTimeRange(data.hightechExports),
      co2Emissions: filterByTimeRange(data.co2Emissions),
      netMigration: filterByTimeRange(data.netMigration),
      laborForceParticipation: filterByTimeRange(data.laborForceParticipation),
      budgetBalance: filterByTimeRange(data.budgetBalance),
      healthcareExpenditure: filterByTimeRange(data.healthcareExpenditure),
      educationExpenditure: filterByTimeRange(data.educationExpenditure),
      internetUsers: filterByTimeRange(data.internetUsers),
      youthUnemployment: filterByTimeRange(data.youthUnemployment),
      manufacturingValueAdded: filterByTimeRange(data.manufacturingValueAdded),
      householdConsumption: filterByTimeRange(data.householdConsumption),
      renewableEnergy: filterByTimeRange(data.renewableEnergy),
      femaleLaborForce: filterByTimeRange(data.femaleLaborForce),
      militaryExpenditure: filterByTimeRange(data.militaryExpenditure),
      marketCapitalization: filterByTimeRange(data.marketCapitalization),
      scientificPublications: filterByTimeRange(data.scientificPublications),
      ictExports: filterByTimeRange(data.ictExports),
      mobileSubscriptions: filterByTimeRange(data.mobileSubscriptions),
      patentApplications: filterByTimeRange(data.patentApplications),
      socialSpending: filterByTimeRange(data.socialSpending),
      publicDebtService: filterByTimeRange(data.publicDebtService),
      servicesValueAdded: filterByTimeRange(data.servicesValueAdded),
      agriculturalValueAdded: filterByTimeRange(data.agriculturalValueAdded),
      tradeOpenness: filterByTimeRange(data.tradeOpenness),
      tariffRate: filterByTimeRange(data.tariffRate),
      tourismReceipts: filterByTimeRange(data.tourismReceipts),
      privateInvestment: filterByTimeRange(data.privateInvestment),
      newBusinessDensity: filterByTimeRange(data.newBusinessDensity)
    };
  }, [data, selectedPeriod]);

  const tc = getThemeColors(isDarkMode);

  return (
    <div className="space-y-6">
      <div className={`p-4 sm:p-6 rounded-xl border shadow-sm ${tc.card}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Country Comparison Dashboard</h2>
            <p className={`text-sm mt-0.5 ${tc.textSecondary}`}>Select up to {maxCountries} countries to compare</p>
          </div>
          <div className="flex items-center gap-3">
            <BulkChartDownload variant="primary" size="sm" />
            <div className={`flex rounded-lg border ${tc.border} overflow-hidden`}>
              {(['all', '10y', '5y'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period ? tc.periodActive : tc.periodInactive
                  }`}
                >
                  {period === 'all' ? 'All Time' : period === '10y' ? '10 Years' : '5 Years'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.keys(countryColors).map(country => {
            const isSelected = selectedCountries.includes(country);
            const FlagComponent = countryFlags[country];
            
            return (
              <button
                key={country}
                onClick={() => handleCountryToggle(country)}
                className={`px-2.5 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border text-sm
                  ${isSelected ? tc.btnSelected : tc.btnUnselected}`}
              >
                {FlagComponent && (
                  <div className="w-6 h-4 overflow-hidden rounded shadow-sm flex-shrink-0">
                    <FlagComponent />
                  </div>
                )}
                <span className="truncate">{country}</span>
                {isSelected && (
                  <span className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCountries.length > 0 && (
        <>
          <SectionHeader title="Core Economic Indicators" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <ComparisonMetric
              title="Interest Rates"
              data={filteredData}
              metricKey="interestRates"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-1, 20]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Employment Rates"
              data={filteredData}
              metricKey="employmentRates"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="GDP Growth"
              data={filteredData}
              metricKey="gdpGrowth"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-10, 15]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Inflation Rates"
              data={filteredData}
              metricKey="inflationRates"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-5, 25]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
          </div>

          <SectionHeader title="Investment & Trade" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <ComparisonMetric
              title="Foreign Direct Investment (% of GDP)"
              data={filteredData}
              metricKey="fdi"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-10, 15]}
              valueFormatter={(value) => `${value.toFixed(2)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Trade Balance (% of GDP)"
              data={filteredData}
              metricKey="tradeBalance"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-20, 20]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Government Spending (% of GDP)"
              data={filteredData}
              metricKey="governmentSpending"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[10, 60]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Labor Productivity (GDP per worker)"
              data={filteredData}
              metricKey="laborProductivity"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 200000]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              chartType="bar"
            />
          </div>

          <SectionHeader title="Advanced Economic Indicators" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <ComparisonMetric
              title="Gini Coefficient (Income Inequality)"
              data={filteredData}
              metricKey="giniCoefficient"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 1]}
              valueFormatter={(value) => value.toFixed(3)}
            />
            <ComparisonMetric
              title="R&D Spending (% of GDP)"
              data={filteredData}
              metricKey="rdSpending"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 5]}
              valueFormatter={(value) => `${value.toFixed(2)}%`}
            />
            <ComparisonMetric
              title="Energy Consumption (kg oil equivalent per capita)"
              data={filteredData}
              metricKey="energyConsumption"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 10000]}
              valueFormatter={(value) => `${value.toLocaleString()} kg`}
              chartType="bar"
            />
            <ComparisonMetric
              title="Population Growth Rate"
              data={filteredData}
              metricKey="populationGrowth"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-2, 5]}
              valueFormatter={(value) => `${value.toFixed(2)}%`}
            />
            <ComparisonMetric
              title="Labor Force Participation Rate (%)"
              data={filteredData}
              metricKey="laborForceParticipation"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[30, 90]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Budget Balance (% of GDP)"
              data={filteredData}
              metricKey="budgetBalance"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-20, 10]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Healthcare Expenditure (% of GDP)"
              data={filteredData}
              metricKey="healthcareExpenditure"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 20]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Education Expenditure (% of GDP)"
              data={filteredData}
              metricKey="educationExpenditure"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 10]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Internet Users (% of population)"
              data={filteredData}
              metricKey="internetUsers"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 100]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Youth Unemployment Rate (%)"
              data={filteredData}
              metricKey="youthUnemployment"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 60]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Manufacturing Value Added (% of GDP)"
              data={filteredData}
              metricKey="manufacturingValueAdded"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 40]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Household Consumption (% of GDP)"
              data={filteredData}
              metricKey="householdConsumption"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[30, 90]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Renewable Energy Consumption (%)"
              data={filteredData}
              metricKey="renewableEnergy"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 100]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Female Labor Force Participation (%)"
              data={filteredData}
              metricKey="femaleLaborForce"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[20, 80]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Military Expenditure (% of GDP)"
              data={filteredData}
              metricKey="militaryExpenditure"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 10]}
              valueFormatter={(value) => `${value.toFixed(2)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Market Capitalization (% of GDP)"
              data={filteredData}
              metricKey="marketCapitalization"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 300]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Scientific Publications"
              data={filteredData}
              metricKey="scientificPublications"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 500000]}
              valueFormatter={(value) => value.toLocaleString()}
              chartType="bar"
            />
            <ComparisonMetric
              title="ICT Exports (% of goods exports)"
              data={filteredData}
              metricKey="ictExports"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 40]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Mobile Subscriptions (per 100 people)"
              data={filteredData}
              metricKey="mobileSubscriptions"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 200]}
              valueFormatter={(value) => value.toFixed(1)}
            />
            <ComparisonMetric
              title="Patent Applications"
              data={filteredData}
              metricKey="patentApplications"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 600000]}
              valueFormatter={(value) => value.toLocaleString()}
              chartType="bar"
            />
            <ComparisonMetric
              title="Social Protection Coverage (%)"
              data={filteredData}
              metricKey="socialSpending"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 100]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Public Debt Service (% of revenue)"
              data={filteredData}
              metricKey="publicDebtService"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 40]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Services Sector (% of GDP)"
              data={filteredData}
              metricKey="servicesValueAdded"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[30, 90]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Agriculture Sector (% of GDP)"
              data={filteredData}
              metricKey="agriculturalValueAdded"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 50]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Trade Openness (% of GDP)"
              data={filteredData}
              metricKey="tradeOpenness"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 400]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Average Tariff Rate (%)"
              data={filteredData}
              metricKey="tariffRate"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 20]}
              valueFormatter={(value) => `${value.toFixed(2)}%`}
            />
            <ComparisonMetric
              title="Tourism Receipts (% of exports)"
              data={filteredData}
              metricKey="tourismReceipts"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 30]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Private Sector Investment (% of GDP)"
              data={filteredData}
              metricKey="privateInvestment"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 40]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="New Business Density (per 1,000 people)"
              data={filteredData}
              metricKey="newBusinessDensity"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 30]}
              valueFormatter={(value) => value.toFixed(2)}
              chartType="bar"
            />
          </div>

          <SectionHeader title="Fiscal & Debt Indicators" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <ComparisonMetric
              title="Unemployment Rate (%)"
              data={filteredData}
              metricKey="unemploymentRates"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 30]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Government Debt (% of GDP)"
              data={filteredData}
              metricKey="governmentDebt"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 300]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Consumer Price Index"
              data={filteredData}
              metricKey="cpiData"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 200]}
              valueFormatter={(value) => value.toFixed(1)}
            />
            <ComparisonMetric
              title="GDP per Capita (PPP, current $)"
              data={filteredData}
              metricKey="gdpPerCapitaPPP"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 100000]}
              valueFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
            />
            <ComparisonMetric
              title="Current Account Balance (% of GDP)"
              data={filteredData}
              metricKey="currentAccount"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-20, 30]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Gross Capital Formation (% of GDP)"
              data={filteredData}
              metricKey="grossCapitalFormation"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 50]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Reserves (months of imports)"
              data={filteredData}
              metricKey="reservesMonthsImports"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 30]}
              valueFormatter={(value) => `${value.toFixed(1)} mo`}
            />
            <ComparisonMetric
              title="Exchange Rate (LCU per US$)"
              data={filteredData}
              metricKey="exchangeRate"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 200]}
              valueFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(2)}
            />
            <ComparisonMetric
              title="Poverty Rate (%)"
              data={filteredData}
              metricKey="povertyRate"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 80]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Tertiary Education Enrollment (%)"
              data={filteredData}
              metricKey="tertiaryEnrollment"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 120]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Tax Revenue (% of GDP)"
              data={filteredData}
              metricKey="taxRevenue"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 40]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="Domestic Credit to Private Sector (% of GDP)"
              data={filteredData}
              metricKey="domesticCredit"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 300]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
          </div>

          <SectionHeader title="Trade & Demographics" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <ComparisonMetric
              title="Exports of Goods & Services (% of GDP)"
              data={filteredData}
              metricKey="exports"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 60]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Imports of Goods & Services (% of GDP)"
              data={filteredData}
              metricKey="imports"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 60]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="Life Expectancy (years)"
              data={filteredData}
              metricKey="lifeExpectancy"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[40, 90]}
              valueFormatter={(value) => `${value.toFixed(1)} yrs`}
            />
            <ComparisonMetric
              title="Urban Population (% of total)"
              data={filteredData}
              metricKey="urbanPopulation"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 100]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ComparisonMetric
              title="High-Tech Exports (% of manufactured exports)"
              data={filteredData}
              metricKey="hightechExports"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 40]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              chartType="area"
            />
            <ComparisonMetric
              title="CO2 Emissions (metric tons per capita)"
              data={filteredData}
              metricKey="co2Emissions"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[0, 25]}
              valueFormatter={(value) => `${value.toFixed(1)} t`}
              chartType="bar"
            />
            <ComparisonMetric
              title="Net Migration"
              data={filteredData}
              metricKey="netMigration"
              countries={selectedCountries}
              isDarkMode={isDarkMode}
              yDomain={[-2000000, 2000000]}
              valueFormatter={(value) => {
                if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return Math.round(value).toString();
              }}
              chartType="bar"
            />
          </div>

          {selectedCountries.length >= 2 && (
            <>
              <CorrelationMatrix
                data={data}
                countries={selectedCountries}
                isDarkMode={isDarkMode}
              />
              
              <EconomicSimilarityChart
                data={data}
                countries={selectedCountries}
                isDarkMode={isDarkMode}
              />

              <EconomicRadarChart
                data={data}
                countries={selectedCountries}
                isDarkMode={isDarkMode}
              />
            </>
          )}

          <SectionHeader title="Latest Statistics" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatComparison
              title="Latest Interest Rates"
              countries={selectedCountries}
              metric={filteredData.interestRates}
              data={filteredData}
              isDarkMode={isDarkMode}
            />
            <StatComparison
              title="Latest Employment Rates"
              countries={selectedCountries}
              metric={filteredData.employmentRates}
              data={filteredData}
              isDarkMode={isDarkMode}
            />
            <StatComparison
              title="Latest GDP Growth"
              countries={selectedCountries}
              metric={filteredData.gdpGrowth}
              data={filteredData}
              isDarkMode={isDarkMode}
            />
            <StatComparison
              title="Latest FDI (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.fdi}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(2)}%`}
            />
            <StatComparison
              title="Latest Trade Balance (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.tradeBalance}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Gini Coefficient"
              countries={selectedCountries}
              metric={filteredData.giniCoefficient}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toFixed(3)}
            />
            <StatComparison
              title="Latest GDP per Capita (PPP)"
              countries={selectedCountries}
              metric={filteredData.gdpPerCapitaPPP}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `$${v.toLocaleString()}`}
            />
            <StatComparison
              title="Latest Tax Revenue (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.taxRevenue}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Life Expectancy"
              countries={selectedCountries}
              metric={filteredData.lifeExpectancy}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)} years`}
            />
            <StatComparison
              title="Latest CO2 Emissions (per capita)"
              countries={selectedCountries}
              metric={filteredData.co2Emissions}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(2)} tons`}
            />
            <StatComparison
              title="Latest Current Account (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.currentAccount}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Urban Population (%)"
              countries={selectedCountries}
              metric={filteredData.urbanPopulation}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Military Expenditure (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.militaryExpenditure}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(2)}%`}
            />
            <StatComparison
              title="Latest Market Capitalization (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.marketCapitalization}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Scientific Publications"
              countries={selectedCountries}
              metric={filteredData.scientificPublications}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toLocaleString()}
            />
            <StatComparison
              title="Latest ICT Exports (% of goods exports)"
              countries={selectedCountries}
              metric={filteredData.ictExports}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Mobile Subscriptions (per 100 people)"
              countries={selectedCountries}
              metric={filteredData.mobileSubscriptions}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toFixed(1)}
            />
            <StatComparison
              title="Latest Patent Applications"
              countries={selectedCountries}
              metric={filteredData.patentApplications}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toLocaleString()}
            />
            <StatComparison
              title="Latest Social Protection Coverage (%)"
              countries={selectedCountries}
              metric={filteredData.socialSpending}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Public Debt Service (% of revenue)"
              countries={selectedCountries}
              metric={filteredData.publicDebtService}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Services Sector (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.servicesValueAdded}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Agriculture Sector (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.agriculturalValueAdded}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Trade Openness (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.tradeOpenness}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Tariff Rate (%)"
              countries={selectedCountries}
              metric={filteredData.tariffRate}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(2)}%`}
            />
            <StatComparison
              title="Latest Tourism Receipts (% of exports)"
              countries={selectedCountries}
              metric={filteredData.tourismReceipts}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Private Investment (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.privateInvestment}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest New Business Density (per 1,000 people)"
              countries={selectedCountries}
              metric={filteredData.newBusinessDensity}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toFixed(2)}
            />
            <StatComparison
              title="Latest Unemployment Rate"
              countries={selectedCountries}
              metric={filteredData.unemploymentRates}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Government Debt (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.governmentDebt}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Consumer Price Index"
              countries={selectedCountries}
              metric={filteredData.cpiData}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toFixed(1)}
            />
            <StatComparison
              title="Latest Gross Capital Formation (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.grossCapitalFormation}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Reserves (months of imports)"
              countries={selectedCountries}
              metric={filteredData.reservesMonthsImports}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)} months`}
            />
            <StatComparison
              title="Latest Exchange Rate (LCU per US$)"
              countries={selectedCountries}
              metric={filteredData.exchangeRate}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => v.toFixed(2)}
            />
            <StatComparison
              title="Latest Poverty Rate"
              countries={selectedCountries}
              metric={filteredData.povertyRate}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Tertiary Enrollment (%)"
              countries={selectedCountries}
              metric={filteredData.tertiaryEnrollment}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Domestic Credit (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.domesticCredit}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Exports (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.exports}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest Imports (% of GDP)"
              countries={selectedCountries}
              metric={filteredData.imports}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest High-Tech Exports (% of manufactured)"
              countries={selectedCountries}
              metric={filteredData.hightechExports}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              title="Latest CO2 Emissions (tons per capita)"
              countries={selectedCountries}
              metric={filteredData.co2Emissions}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => `${v.toFixed(1)} t`}
            />
            <StatComparison
              title="Latest Net Migration"
              countries={selectedCountries}
              metric={filteredData.netMigration}
              data={filteredData}
              isDarkMode={isDarkMode}
              format={(v: number) => {
                if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
                return Math.round(v).toString();
              }}
            />
          </div>

          <SectionHeader title="Comparative Analysis" isDarkMode={isDarkMode} />
          <div className={`p-4 sm:p-5 rounded-xl border shadow-sm ${tc.card}`}>
            <h3 className={`text-base font-semibold mb-4 ${tc.text}`}>Enhanced Comparative Analysis</h3>
            <div className="space-y-3">
              {selectedCountries.map(country => {
                const latestData = {
                  interest: Number(data.interestRates[data.interestRates.length - 1][country]) || 0,
                  employment: Number(data.employmentRates[data.employmentRates.length - 1][country]) || 0,
                  unemployment: Number(data.unemploymentRates[data.unemploymentRates.length - 1][country]) || 0,
                  debt: Number(data.governmentDebt[data.governmentDebt.length - 1][country]) || 0,
                  inflation: Number(data.inflationRates[data.inflationRates.length - 1][country]) || 0,
                  gdp: Number(data.gdpGrowth[data.gdpGrowth.length - 1][country]) || 0,
                  fdi: Number(data.fdi[data.fdi.length - 1][country]) || 0,
                  tradeBalance: Number(data.tradeBalance[data.tradeBalance.length - 1][country]) || 0,
                  governmentSpending: Number(data.governmentSpending[data.governmentSpending.length - 1][country]) || 0,
                  laborProductivity: Number(data.laborProductivity[data.laborProductivity.length - 1][country]) || 0,
                  gini: Number(data.giniCoefficient[data.giniCoefficient.length - 1][country]) || 0,
                  rdSpending: Number(data.rdSpending[data.rdSpending.length - 1][country]) || 0,
                  energyConsumption: Number(data.energyConsumption[data.energyConsumption.length - 1][country]) || 0
                };

                return (
                  <div key={country} className={`p-4 rounded-lg ${tc.analysisBg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {countryFlags[country] && (
                        <div className="w-7 h-5 rounded overflow-hidden shadow-sm">
                          {React.createElement(countryFlags[country])}
                        </div>
                      )}
                      <h4 className={`font-semibold text-sm ${tc.text}`}>{country}</h4>
                    </div>
                    <p className={`text-sm leading-relaxed ${tc.textSecondary}`}>
                      {country} shows {' '}
                      {latestData.gdp > 2 ? 'strong' : latestData.gdp > 0 ? 'moderate' : 'challenging'} growth at {latestData.gdp.toFixed(1)}% with {' '}
                      {latestData.inflation > 5 ? 'high' : latestData.inflation > 2 ? 'moderate' : 'low'} inflation ({latestData.inflation.toFixed(1)}%). {' '}
                      FDI flows are {latestData.fdi > 2 ? 'strong' : latestData.fdi > 0 ? 'moderate' : 'weak'} at {latestData.fdi.toFixed(2)}% of GDP, while {' '}
                      trade balance is {latestData.tradeBalance > 2 ? 'positive' : latestData.tradeBalance > -2 ? 'balanced' : 'negative'} at {latestData.tradeBalance.toFixed(1)}% of GDP. {' '}
                      Income inequality (Gini: {latestData.gini.toFixed(3)}) is {latestData.gini < 0.3 ? 'low' : latestData.gini < 0.4 ? 'moderate' : 'high'}, and {' '}
                      R&D investment is {latestData.rdSpending > 2 ? 'high' : latestData.rdSpending > 1 ? 'moderate' : 'low'} at {latestData.rdSpending.toFixed(2)}% of GDP.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountryComparisonDashboard; 