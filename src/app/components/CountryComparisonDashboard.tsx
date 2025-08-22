import React, { useState, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import type { CountryData } from '../services/worldbank';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO } from 'country-flag-icons/react/3x2';
import ChartDownloadButton from './ChartDownloadButton';
import BulkChartDownload from './BulkChartDownload';
import InfoPanel from './InfoPanel';
import { economicMetrics } from '../data/economicMetrics';

const countryColors = {
  USA: "#8884d8", Canada: "#82ca9d", France: "#ffc658", Germany: "#ff8042", Italy: "#a4de6c", 
  Japan: "#d0ed57", UK: "#83a6ed", Australia: "#ff7300", Mexico: "#e60049", SouthKorea: "#0bb4ff", 
  Spain: "#50e991", Sweden: "#e6d800", Switzerland: "#9b19f5", Turkey: "#dc0ab4", Nigeria: "#00bfa0",
  China: "#b3d4ff", Russia: "#fd7f6f", Brazil: "#7eb0d5", Chile: "#b2e061", Argentina: "#bd7ebe",
  India: "#ff9ff3", Norway: "#45aaf2"
};

const countryFlags: { [key: string]: React.ComponentType<any> } = {
  UK: GB, USA: US, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO
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
  if (chartType === 'area') {
    return (
      <div 
        ref={chartRef}
        data-chart-container
        data-chart-title={title}
        className={`p-4 rounded-lg relative ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ChartDownloadButton
            chartElement={chartRef.current}
            chartData={{
              title,
              data: data[metricKey],
              type: 'area',
              countries
            }}
            variant="outline"
            size="sm"
          />
        </div>
        
        {/* Info Panel */}
        <InfoPanel
          metric={economicMetrics[metricKey as keyof typeof economicMetrics] || economicMetrics.interestRate}
          isDarkMode={isDarkMode}
          position="top-right"
          size="small"
        />
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data[metricKey]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
              <XAxis dataKey="year" stroke={isDarkMode ? '#fff' : '#666'} />
              <YAxis domain={yDomain} stroke={isDarkMode ? '#fff' : '#666'} />
              <Tooltip
                contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff' } : undefined}
                formatter={(value: number) => valueFormatter(value)}
              />
              <Legend />
              {countries.map(country => (
                <Area
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stroke={countryColors[country as keyof typeof countryColors]}
                  fill={countryColors[country as keyof typeof countryColors]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (chartType === 'bar') {
    return (
      <div 
        ref={chartRef}
        data-chart-container
        data-chart-title={title}
        className={`p-4 rounded-lg relative ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ChartDownloadButton
            chartElement={chartRef.current}
            chartData={{
              title,
              data: data[metricKey],
              type: 'bar',
              countries
            }}
            variant="outline"
            size="sm"
          />
        </div>
        
        {/* Info Panel */}
        <InfoPanel
          metric={economicMetrics[metricKey as keyof typeof economicMetrics] || economicMetrics.interestRate}
          isDarkMode={isDarkMode}
          position="top-right"
          size="small"
        />
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data[metricKey]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
              <XAxis dataKey="year" stroke={isDarkMode ? '#fff' : '#666'} />
              <YAxis domain={yDomain} stroke={isDarkMode ? '#fff' : '#666'} />
              <Tooltip
                contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff' } : undefined}
                formatter={(value: number) => valueFormatter(value)}
              />
              <Legend />
              {countries.map(country => (
                <Bar
                  key={country}
                  dataKey={country}
                  fill={countryColors[country as keyof typeof countryColors]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef}
      data-chart-container
      data-chart-title={title}
      className={`p-4 rounded-lg relative ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <ChartDownloadButton
          chartElement={chartRef.current}
          chartData={{
            title,
            data: data[metricKey],
            type: 'line',
            countries
          }}
          variant="outline"
          size="sm"
        />
      </div>
      
      {/* Info Panel */}
      <InfoPanel
        metric={economicMetrics[metricKey as keyof typeof economicMetrics] || economicMetrics.interestRate}
        isDarkMode={isDarkMode}
        position="top-right"
        size="small"
      />
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data[metricKey]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
            <XAxis dataKey="year" stroke={isDarkMode ? '#fff' : '#666'} />
            <YAxis domain={yDomain} stroke={isDarkMode ? '#fff' : '#666'} />
            <Tooltip
              contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff' } : undefined}
              formatter={(value: number) => valueFormatter(value)}
            />
            <Legend />
            {countries.map(country => (
              <Line
                key={country}
                type="monotone"
                dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                dot={false}
                activeDot={{ r: 4 }}
              />
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
  const latest = metric[metric.length - 1];
  const sorted = [...countries].sort((a, b) => (latest[b] || 0) - (latest[a] || 0));

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {sorted.map(country => {
          const value = latest[country] || 0;
          const FlagComponent = countryFlags[country];
          
          return (
            <div key={country} className="flex items-center gap-4">
              {FlagComponent && (
                <div className="w-8 h-6 overflow-hidden rounded shadow">
                  <FlagComponent />
                </div>
              )}
              <span className="flex-1">{country}</span>
              <span className="font-semibold">{format(value)}</span>
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
    const matrix: { country1: string; country2: string; gdp: number; inflation: number }[] = [];
    
    for (let i = 0; i < countries.length; i++) {
      for (let j = i + 1; j < countries.length; j++) {
        const country1 = countries[i];
        const country2 = countries[j];
        
        const gdpData1 = data.gdpGrowth.map(d => d[country1] || 0).filter(v => v !== 0);
        const gdpData2 = data.gdpGrowth.map(d => d[country2] || 0).filter(v => v !== 0);
        const inflationData1 = data.inflationRates.map(d => d[country1] || 0).filter(v => v !== 0);
        const inflationData2 = data.inflationRates.map(d => d[country2] || 0).filter(v => v !== 0);
        
        matrix.push({
          country1,
          country2,
          gdp: calculateCorrelation(gdpData1, gdpData2),
          inflation: calculateCorrelation(inflationData1, inflationData2)
        });
      }
    }
    return matrix;
  }, [data, countries]);

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <h3 className="text-lg font-semibold mb-4">Economic Correlations</h3>
      <div className="space-y-4">
        {correlations.map(({ country1, country2, gdp, inflation }) => {
          const Flag1 = countryFlags[country1];
          const Flag2 = countryFlags[country2];
          
          return (
            <div key={`${country1}-${country2}`} className="p-3 rounded bg-opacity-10 bg-blue-500">
              <div className="flex items-center gap-2 mb-2">
                {Flag1 && <Flag1 className="w-6 h-4" />}
                <span className="font-medium">{country1}</span>
                <span className="mx-2">⟷</span>
                {Flag2 && <Flag2 className="w-6 h-4" />}
                <span className="font-medium">{country2}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">GDP Correlation: </span>
                  <span className={gdp > 0.5 ? 'text-green-500' : gdp < -0.5 ? 'text-red-500' : ''}>
                    {(gdp * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Inflation Correlation: </span>
                  <span className={inflation > 0.5 ? 'text-green-500' : inflation < -0.5 ? 'text-red-500' : ''}>
                    {(inflation * 100).toFixed(1)}%
                  </span>
                </div>
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
            gdp: data.gdpGrowth[data.gdpGrowth.length - 1][country1],
            inflation: data.inflationRates[data.inflationRates.length - 1][country1],
            employment: data.employmentRates[data.employmentRates.length - 1][country1],
            debt: data.governmentDebt[data.governmentDebt.length - 1][country1],
            fdi: data.fdi[data.fdi.length - 1][country1],
            tradeBalance: data.tradeBalance[data.tradeBalance.length - 1][country1],
            governmentSpending: data.governmentSpending[data.governmentSpending.length - 1][country1],
            laborProductivity: data.laborProductivity[data.laborProductivity.length - 1][country1],
            gini: data.giniCoefficient[data.giniCoefficient.length - 1][country1]
          };
          
          const compareLatest = {
            gdp: data.gdpGrowth[data.gdpGrowth.length - 1][country2],
            inflation: data.inflationRates[data.inflationRates.length - 1][country2],
            employment: data.employmentRates[data.employmentRates.length - 1][country2],
            debt: data.governmentDebt[data.governmentDebt.length - 1][country2],
            fdi: data.fdi[data.fdi.length - 1][country2],
            tradeBalance: data.tradeBalance[data.tradeBalance.length - 1][country2],
            governmentSpending: data.governmentSpending[data.governmentSpending.length - 1][country2],
            laborProductivity: data.laborProductivity[data.laborProductivity.length - 1][country2],
            gini: data.giniCoefficient[data.giniCoefficient.length - 1][country2]
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

  return (
    <div className={`p-4 rounded-lg relative ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Enhanced Economic Similarity Analysis</h3>
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
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
            <XAxis 
              dataKey="gdpDiff" 
              name="GDP Difference" 
              unit="%" 
              stroke={isDarkMode ? '#fff' : '#666'}
            />
            <YAxis 
              dataKey="inflationDiff" 
              name="Inflation Difference" 
              unit="%" 
              stroke={isDarkMode ? '#fff' : '#666'}
            />
            <ZAxis 
              dataKey="similarity" 
              range={[50, 400]} 
              name="Economic Similarity"
            />
            <Tooltip
              contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff' } : undefined}
              formatter={(value: any, name: string) => [
                `${parseFloat(value).toFixed(1)}%`,
                name.replace('Diff', ' Difference')
              ]}
            />
            <Legend />
            {chartData.map((entry, index) => (
              <Scatter
                key={index}
                name={`${entry.country1} - ${entry.country2}`}
                data={[entry]}
                fill={countryColors[entry.country1]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Enhanced analysis includes GDP, inflation, FDI, trade balance, government spending, labor productivity, and Gini coefficient. 
        Bubble size indicates overall economic similarity. Smaller distances suggest more similar economies.
      </div>
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
        gdp: data.gdpGrowth[data.gdpGrowth.length - 1][country] || 0,
        inflation: data.inflationRates[data.inflationRates.length - 1][country] || 0,
        employment: data.employmentRates[data.employmentRates.length - 1][country] || 0,
        debt: data.governmentDebt[data.governmentDebt.length - 1][country] || 0,
        fdi: data.fdi[data.fdi.length - 1][country] || 0,
        tradeBalance: data.tradeBalance[data.tradeBalance.length - 1][country] || 0,
        governmentSpending: data.governmentSpending[data.governmentSpending.length - 1][country] || 0,
        gini: data.giniCoefficient[data.giniCoefficient.length - 1][country] || 0
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
        gini: Math.min(Math.max((1 - latest.gini) * 100, 0), 100) // 1-0 -> 0-100 (inverted)
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
    { metric: 'Income Equality', ...radarData.reduce((acc, country) => ({ ...acc, [country.country]: country.gini }), {}) }
  ];

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <h3 className="text-lg font-semibold mb-4">Economic Profile Radar Chart</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={combinedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke={isDarkMode ? '#555' : '#ccc'} />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: isDarkMode ? '#fff' : '#666' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: isDarkMode ? '#fff' : '#666' }}
            />
            {countries.map((country) => (
              <Radar
                key={country}
                name={country}
                dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                fill={countryColors[country as keyof typeof countryColors]}
                fillOpacity={0.3}
              />
            ))}
            <Tooltip
              contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff' } : undefined}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Multi-dimensional economic profile comparison. Higher values indicate better performance in each metric.
      </div>
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
      energyConsumption: filterByTimeRange(data.energyConsumption)
    };
  }, [data, selectedPeriod]);

  return (
    <div className="space-y-8">
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Country Comparison Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select up to {maxCountries} countries to compare</p>
          </div>
          <div className="flex items-center gap-3">
            <BulkChartDownload variant="primary" size="sm" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
              className={`px-3 py-2 rounded-md border ${
                isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Time</option>
              <option value="10y">Last 10 Years</option>
              <option value="5y">Last 5 Years</option>
            </select>
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
                className={`p-2 rounded-lg flex items-center gap-2 transition-colors
                  ${isSelected 
                    ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-100') 
                    : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200')
                  }`}
              >
                {FlagComponent && (
                  <div className="w-6 h-4 overflow-hidden rounded">
                    <FlagComponent />
                  </div>
                )}
                <span className="text-sm">{country}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCountries.length > 0 && (
        <>
          {/* Core Economic Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          {/* New Economic Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          {/* Advanced Economic Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          {/* Enhanced Statistics Comparison */}
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
          </div>

          {/* Enhanced Comparative Analysis */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">Enhanced Comparative Analysis</h3>
            <div className="space-y-4">
              {selectedCountries.map(country => {
                const latestData = {
                  interest: data.interestRates[data.interestRates.length - 1][country],
                  employment: data.employmentRates[data.employmentRates.length - 1][country],
                  unemployment: data.unemploymentRates[data.unemploymentRates.length - 1][country],
                  debt: data.governmentDebt[data.governmentDebt.length - 1][country],
                  inflation: data.inflationRates[data.inflationRates.length - 1][country],
                  gdp: data.gdpGrowth[data.gdpGrowth.length - 1][country],
                  fdi: data.fdi[data.fdi.length - 1][country],
                  tradeBalance: data.tradeBalance[data.tradeBalance.length - 1][country],
                  governmentSpending: data.governmentSpending[data.governmentSpending.length - 1][country],
                  laborProductivity: data.laborProductivity[data.laborProductivity.length - 1][country],
                  gini: data.giniCoefficient[data.giniCoefficient.length - 1][country],
                  rdSpending: data.rdSpending[data.rdSpending.length - 1][country],
                  energyConsumption: data.energyConsumption[data.energyConsumption.length - 1][country]
                };

                return (
                  <div key={country} className="p-4 rounded bg-opacity-10 bg-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      {countryFlags[country] && React.createElement(countryFlags[country], { className: "w-6 h-4" })}
                      <h4 className="font-semibold">{country}</h4>
                    </div>
                    <p className="text-sm">
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