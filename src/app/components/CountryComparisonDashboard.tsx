import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import type { CountryData } from '../services/worldbank';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO } from 'country-flag-icons/react/3x2';

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
  };
  metricKey: keyof ComparisonMetricProps['data'];
  countries: string[];
  isDarkMode: boolean;
  yDomain?: [number, number];
  valueFormatter?: (value: number) => string;
}

const ComparisonMetric: React.FC<ComparisonMetricProps> = ({ 
  title, 
  data,
  metricKey,
  countries, 
  isDarkMode,
  yDomain = [0, 100],
  valueFormatter = (value: number) => `${value.toFixed(1)}%`
}) => (
  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{title}</h3>
    <div className="h-[180px] sm:h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data[metricKey]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
          <XAxis 
            dataKey="year" 
            stroke={isDarkMode ? '#fff' : '#666'}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            domain={yDomain} 
            stroke={isDarkMode ? '#fff' : '#666'}
            tick={{ fontSize: 10 }}
            width={35}
          />
          <Tooltip
            contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff' } : undefined}
            formatter={(value: number) => valueFormatter(value)}
          />
          <Legend wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
          {countries.map(country => (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              stroke={countryColors[country as keyof typeof countryColors]}
              dot={false}
              activeDot={{ r: 3 }}
              strokeWidth={1.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

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
    <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{title}</h3>
      <div className="space-y-2 sm:space-y-4">
        {sorted.map(country => {
          const value = latest[country] || 0;
          const FlagComponent = countryFlags[country];
          
          return (
            <div key={country} className="flex items-center gap-2 sm:gap-4">
              {FlagComponent && (
                <div className="w-6 h-4 sm:w-8 sm:h-6 overflow-hidden rounded shadow flex-shrink-0">
                  <FlagComponent />
                </div>
              )}
              <span className="flex-1 text-sm sm:text-base truncate">{country}</span>
              <span className="font-semibold text-sm sm:text-base">{format(value)}</span>
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
  const metrics = ['gdp', 'inflation', 'employment', 'debt'];
  let similarity = 0;

  metrics.forEach(metric => {
    const diff = Math.abs(country1Data[metric] - country2Data[metric]);
    const maxDiff = metric === 'debt' ? 150 : metric === 'employment' ? 40 : 20;
    similarity += (1 - Math.min(diff / maxDiff, 1)) * 25;
  });

  return Math.round(similarity);
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
    <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Economic Correlations</h3>
      <div className="space-y-2 sm:space-y-4">
        {correlations.map(({ country1, country2, gdp, inflation }) => {
          const Flag1 = countryFlags[country1];
          const Flag2 = countryFlags[country2];
          
          return (
            <div key={`${country1}-${country2}`} className="p-2 sm:p-3 rounded bg-opacity-10 bg-blue-500">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                {Flag1 && <Flag1 className="w-5 h-3 sm:w-6 sm:h-4" />}
                <span className="font-medium text-sm sm:text-base">{country1}</span>
                <span className="mx-1 sm:mx-2">⟷</span>
                {Flag2 && <Flag2 className="w-5 h-3 sm:w-6 sm:h-4" />}
                <span className="font-medium text-sm sm:text-base">{country2}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
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
            debt: data.governmentDebt[data.governmentDebt.length - 1][country1]
          };
          
          const compareLatest = {
            gdp: data.gdpGrowth[data.gdpGrowth.length - 1][country2],
            inflation: data.inflationRates[data.inflationRates.length - 1][country2],
            employment: data.employmentRates[data.employmentRates.length - 1][country2],
            debt: data.governmentDebt[data.governmentDebt.length - 1][country2]
          };
          
          similarities.push({
            country1,
            country2,
            similarity: calculateEconomicSimilarity(latest, compareLatest),
            gdpDiff: Math.abs(latest.gdp - compareLatest.gdp),
            inflationDiff: Math.abs(latest.inflation - compareLatest.inflation)
          });
        }
      });
    });
    
    return similarities;
  }, [data, countries]);

  return (
    <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Economic Similarity Analysis</h3>
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#555' : '#ccc'} />
            <XAxis 
              dataKey="gdpDiff" 
              name="GDP Difference" 
              unit="%" 
              stroke={isDarkMode ? '#fff' : '#666'}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              dataKey="inflationDiff" 
              name="Inflation Difference" 
              unit="%" 
              stroke={isDarkMode ? '#fff' : '#666'}
              tick={{ fontSize: 10 }}
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
            <Legend wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
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
      <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Bubble size indicates overall economic similarity. Smaller distances (closer to origin) suggest more similar economies.
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
      cpiData: filterByTimeRange(data.cpiData)
    };
  }, [data, selectedPeriod]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Country Comparison Dashboard</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Select up to {maxCountries} countries to compare</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md border text-xs sm:text-sm ${
              isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Time</option>
            <option value="10y">Last 10 Years</option>
            <option value="5y">Last 5 Years</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
          {Object.keys(countryColors).map(country => {
            const isSelected = selectedCountries.includes(country);
            const FlagComponent = countryFlags[country];
            
            return (
              <button
                key={country}
                onClick={() => handleCountryToggle(country)}
                className={`p-1 sm:p-2 rounded-md flex items-center gap-1 sm:gap-2 transition-colors
                  ${isSelected 
                    ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-100') 
                    : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200')
                  }`}
              >
                {FlagComponent && (
                  <div className="w-4 sm:w-5 h-3 sm:h-4 overflow-hidden rounded">
                    <FlagComponent />
                  </div>
                )}
                <span className="text-xs sm:text-sm">{country}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCountries.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
          </div>

          <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Comparative Analysis</h3>
            <div className="space-y-2 sm:space-y-4">
              {selectedCountries.map(country => {
                const latestData = {
                  interest: data.interestRates[data.interestRates.length - 1][country],
                  employment: data.employmentRates[data.employmentRates.length - 1][country],
                  unemployment: data.unemploymentRates[data.unemploymentRates.length - 1][country],
                  debt: data.governmentDebt[data.governmentDebt.length - 1][country],
                  inflation: data.inflationRates[data.inflationRates.length - 1][country],
                  gdp: data.gdpGrowth[data.gdpGrowth.length - 1][country],
                };

                return (
                  <div key={country} className="p-2 sm:p-3 rounded bg-opacity-10 bg-blue-500">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      {countryFlags[country] && React.createElement(countryFlags[country], { className: "w-5 h-3 sm:w-6 h-4" })}
                      <h4 className="font-semibold text-sm sm:text-base">{country}</h4>
                    </div>
                    <p className="text-xs sm:text-sm">
                      {country} currently shows {' '}
                      {latestData.gdp > 2 ? 'strong' : latestData.gdp > 0 ? 'moderate' : 'challenging'} growth at {latestData.gdp.toFixed(1)}% with {' '}
                      {latestData.inflation > 5 ? 'high' : latestData.inflation > 2 ? 'moderate' : 'low'} inflation ({latestData.inflation.toFixed(1)}%). {' '}
                      Employment levels are {latestData.employment > 65 ? 'robust' : latestData.employment > 55 ? 'moderate' : 'concerning'} at {latestData.employment.toFixed(1)}%, while {' '}
                      government debt is {latestData.debt > 100 ? 'significantly high' : latestData.debt > 60 ? 'moderate' : 'manageable'} at {latestData.debt.toFixed(1)}% of GDP.
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