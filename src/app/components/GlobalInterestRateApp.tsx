'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchGlobalData } from '../services/worldbank';
import type { CountryData } from '../services/worldbank';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO } from 'country-flag-icons/react/3x2';
import AdSense from './AdSense';

const countryColors = {
  USA: "#8884d8", Canada: "#82ca9d", France: "#ffc658", Germany: "#ff8042", Italy: "#a4de6c", 
  Japan: "#d0ed57", UK: "#83a6ed", Australia: "#ff7300", Mexico: "#e60049", SouthKorea: "#0bb4ff", 
  Spain: "#50e991", Sweden: "#e6d800", Switzerland: "#9b19f5", Turkey: "#dc0ab4", Nigeria: "#00bfa0",
  China: "#b3d4ff", Russia: "#fd7f6f", Brazil: "#7eb0d5", Chile: "#b2e061", Argentina: "#bd7ebe",
  India: "#ff9ff3", Norway: "#45aaf2"
};

const countryFlags: { [key: string]: React.ComponentType<any> } = {
  UK: GB,
  USA: US,
  Canada: CA,
  France: FR,
  Germany: DE,
  Italy: IT,
  Japan: JP,
  Australia: AU,
  Mexico: MX,
  SouthKorea: KR,
  Spain: ES,
  Sweden: SE,
  Switzerland: CH,
  Turkey: TR,
  Nigeria: NG,
  China: CN,
  Russia: RU,
  Brazil: BR,
  Chile: CL,
  Argentina: AR,
  India: IN,
  Norway: NO
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
    <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center h-[300px] sm:h-[400px] text-red-500 text-center px-4">
    <p className="text-sm sm:text-base">{message}</p>
  </div>
);

const InterestRateSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <h3 className="text-base sm:text-lg font-semibold mb-2">Understanding Interest Rates</h3>
    <div className="space-y-2 sm:space-y-3">
      <p className="text-xs sm:text-sm">
        Interest rates are crucial economic indicators that influence borrowing costs, investment decisions, and overall economic activity. Our data, sourced from the World Bank, tracks real interest rates from 1960 to present day across major economies.
      </p>
      <div className="bg-white/10 p-2 sm:p-3 rounded">
        <h4 className="font-medium mb-1 text-sm sm:text-base">Key Insights:</h4>
        <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
          <li>Real interest rates account for inflation, showing actual borrowing costs</li>
          <li>Higher rates typically indicate tighter monetary policy</li>
          <li>Negative rates suggest accommodative monetary conditions</li>
          <li>Rates influence currency values and international capital flows</li>
        </ul>
      </div>
      <p className="text-xs sm:text-sm italic">
        Historical trends show how central banks use interest rates to manage inflation and economic growth.
      </p>
    </div>
  </div>
);

const EmploymentSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <h3 className="text-base sm:text-lg font-semibold mb-2">Employment Rate Analysis</h3>
    <div className="space-y-2 sm:space-y-3">
      <p className="text-xs sm:text-sm">
        Employment rates provide crucial insights into labor market health and economic vitality. Our comprehensive data covers employment trends from 1990 onwards, measuring the percentage of working-age population (ages 15-64) engaged in productive work.
      </p>
      <div className="bg-white/10 p-2 sm:p-3 rounded">
        <h4 className="font-medium mb-1 text-sm sm:text-base">Employment Indicators:</h4>
        <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
          <li>Labor force participation trends</li>
          <li>Sectoral employment distribution</li>
          <li>Regional employment variations</li>
          <li>Gender-based employment metrics</li>
        </ul>
      </div>
      <p className="text-xs sm:text-sm italic">
        Higher employment rates often correlate with economic growth and improved living standards.
      </p>
    </div>
  </div>
);

const UnemploymentSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      The unemployment rate shows the percentage of the labor force that is actively seeking employment but unable to find work. This metric is a key indicator of labor market health and economic conditions, with lower rates generally indicating a stronger economy. Data shown from 1990 onwards.
    </p>
  </div>
);

const DebtSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Central government debt shown as a percentage of each country's GDP (Gross Domestic Product). For example, a value of 100% means the government's debt equals one year's GDP. This ratio is a key measure of fiscal sustainability, with lower percentages generally indicating more manageable debt levels relative to the size of the economy. Historical data available from 1989 onwards.
    </p>
  </div>
);

const InflationSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      The inflation rate measures the annual percentage change in consumer prices. It indicates how quickly the general level of prices for goods and services is rising, and consequently, how quickly purchasing power is falling. Data available from 1960 onwards provides insights into long-term price stability trends.
    </p>
  </div>
);

const GDPGrowthSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      GDP (Gross Domestic Product) growth shows the annual percentage increase in a country's economic output. A positive rate indicates economic expansion, while a negative rate suggests contraction. This metric is crucial for understanding economic health and living standards. Data available from 1960 onwards provides insights into long-term economic development patterns.
    </p>
  </div>
);

const CPISummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      The Consumer Price Index (CPI) measures changes in the price level of a weighted average market basket of consumer goods and services. 
      The index is normalized to 100 in the base year (2010), making it easy to track price level changes over time. 
      A rising CPI indicates increasing consumer prices and potentially decreased purchasing power.
    </p>
  </div>
);

const CountryEconomicSummary = ({ 
  country, 
  data, 
  isDarkMode 
}: { 
  country: string;
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
}) => {
  if (!country) return null;

  const FlagComponent = countryFlags[country];

  // Prepare data for the combined chart
  const combinedData = data.interestRates.map(yearData => {
    const year = yearData.year;
    return {
      year,
      'Interest Rate': yearData[country] || null,
      'Employment': data.employmentRates.find(d => d.year === year)?.[country] || null,
      'Unemployment': data.unemploymentRates.find(d => d.year === year)?.[country] || null,
      'Govt Debt': data.governmentDebt.find(d => d.year === year)?.[country] || null,
      'Inflation': data.inflationRates.find(d => d.year === year)?.[country] || null,
      'GDP Growth': data.gdpGrowth.find(d => d.year === year)?.[country] || null,
    };
  }).filter(d => 
    d['Interest Rate'] !== null || 
    d['Employment'] !== null || 
    d['Unemployment'] !== null || 
    d['Govt Debt'] !== null || 
    d['Inflation'] !== null || 
    d['GDP Growth'] !== null
  );

  // Calculate metrics as before
  const calculateMetrics = (dataset: CountryData[], countryKey: string) => {
    const countryData = dataset
      .filter(d => d[countryKey] !== 0)
      .map(d => ({ year: d.year, value: d[countryKey] }));
    
    if (countryData.length === 0) return { recent: 0, avg: 0, trend: 'stable' };
    
    const recent = countryData[countryData.length - 1].value;
    const avg = countryData.reduce((sum, d) => sum + d.value, 0) / countryData.length;
    
    const recentYears = countryData.slice(-5);
    const trend = recentYears[recentYears.length - 1]?.value > recentYears[0]?.value 
      ? 'increasing' 
      : recentYears[recentYears.length - 1]?.value < recentYears[0]?.value 
        ? 'decreasing' 
        : 'stable';
    
    return { recent, avg, trend };
  };

  const metrics = {
    interest: calculateMetrics(data.interestRates, country),
    employment: calculateMetrics(data.employmentRates, country),
    unemployment: calculateMetrics(data.unemploymentRates, country),
    debt: calculateMetrics(data.governmentDebt, country),
    inflation: calculateMetrics(data.inflationRates, country),
    gdp: calculateMetrics(data.gdpGrowth, country),
    cpi: calculateMetrics(data.cpiData, country)
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      default: return '➡️';
    }
  };

  // Define line colors for the combined chart
  const metricColors = {
    'Interest Rate': '#8884d8',
    'Employment': '#82ca9d',
    'Unemployment': '#ffc658',
    'Govt Debt': '#ff8042',
    'Inflation': '#a4de6c',
    'GDP Growth': '#83a6ed'
  };

  return (
    <div className={`p-3 sm:p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h3 className="text-base sm:text-lg font-semibold">Economic Summary for {country}</h3>
        {FlagComponent && (
          <div className="w-12 h-8 sm:w-16 sm:h-10 overflow-hidden rounded-md shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform duration-200">
            <FlagComponent />
          </div>
        )}
      </div>
      <hr className={`my-3 sm:my-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
      
      <div className="mb-4 sm:mb-6 h-[180px] sm:h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
              stroke={isDarkMode ? '#fff' : '#666'}
              tick={{ fontSize: 10 }}
              width={35}
            />
            <Tooltip
              contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff', fontSize: '12px' } : { fontSize: '12px' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', marginTop: '8px' }}
            />
            {Object.entries(metricColors).map(([metric, color]) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={color}
                dot={false}
                activeDot={{ r: 3 }}
                strokeWidth={1.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 text-xs sm:text-sm">
        <p>
          <strong>Interest Rates:</strong> Currently at {metrics.interest.recent.toFixed(1)}% 
          {getTrendEmoji(metrics.interest.trend)} (Historical avg: {metrics.interest.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>Employment:</strong> Currently at {metrics.employment.recent.toFixed(1)}% 
          {getTrendEmoji(metrics.employment.trend)} (Historical avg: {metrics.employment.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>Unemployment:</strong> Currently at {metrics.unemployment.recent.toFixed(1)}% 
          {getTrendEmoji(metrics.unemployment.trend)} (Historical avg: {metrics.unemployment.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>Government Debt:</strong> Currently at {metrics.debt.recent.toFixed(1)}% of GDP 
          {getTrendEmoji(metrics.debt.trend)} (Historical avg: {metrics.debt.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>Inflation Rate:</strong> Currently at {metrics.inflation.recent.toFixed(1)}% 
          {getTrendEmoji(metrics.inflation.trend)} (Historical avg: {metrics.inflation.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>GDP Growth:</strong> Currently at {metrics.gdp.recent.toFixed(1)}% 
          {getTrendEmoji(metrics.gdp.trend)} (Historical avg: {metrics.gdp.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>Consumer Price Index:</strong> Currently at {metrics.cpi.recent.toFixed(1)} 
          {getTrendEmoji(metrics.cpi.trend)} (2010 base year = 100, Historical avg: {metrics.cpi.avg.toFixed(1)})
        </p>

        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-md ${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
          <p className="text-xs sm:text-sm">
            <strong>Economic Overview:</strong> {country}'s economy shows {' '}
            {metrics.gdp.recent > 2 ? 'strong' : metrics.gdp.recent > 0 ? 'moderate' : 'challenging'} growth at {metrics.gdp.recent.toFixed(1)}% with {' '}
            {metrics.inflation.recent > 5 ? 'high' : metrics.inflation.recent > 2 ? 'moderate' : 'low'} inflation ({metrics.inflation.recent.toFixed(1)}%). {' '}
            Employment levels are {metrics.employment.recent > 65 ? 'robust' : metrics.employment.recent > 55 ? 'moderate' : 'concerning'} at {metrics.employment.recent.toFixed(1)}%, while {' '}
            government debt is {metrics.debt.recent > 100 ? 'significantly high' : metrics.debt.recent > 60 ? 'moderate' : 'manageable'} at {metrics.debt.recent.toFixed(1)}% of GDP. {' '}
            {metrics.interest.recent > 5 ? 'High' : metrics.interest.recent > 2 ? 'Moderate' : 'Low'} interest rates ({metrics.interest.recent.toFixed(1)}%) suggest {' '}
            {metrics.interest.recent > 5 ? 'tight' : metrics.interest.recent > 2 ? 'balanced' : 'accommodative'} monetary policy.
          </p>
        </div>
      </div>
    </div>
  );
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  // Initialize state with a function to avoid unnecessary localStorage access on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync with localStorage and update theme when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));

      // Handle theme-specific updates
      if (key === 'isDarkMode') {
        document.documentElement.setAttribute('data-theme', storedValue ? 'dark' : 'light');
        document.body.classList.toggle('dark', storedValue as boolean);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Handle storage events from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
};

const GlobalInterestRateApp = () => {
  const [selectedPeriod, setSelectedPeriod] = useLocalStorage('selectedPeriod', 'all');
  const [selectedCountries, setSelectedCountries] = useLocalStorage('selectedCountries', Object.keys(countryColors).slice(0, 9));
  const [maxYAxis, setMaxYAxis] = useLocalStorage('maxYAxis', 20);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [isGridView, setIsGridView] = useLocalStorage('isGridView', false);
  const [selectedMetric, setSelectedMetric] = useLocalStorage<'interest' | 'employment' | 'unemployment' | 'debt' | 'inflation' | 'gdp' | 'cpi' | 'all'>('selectedMetric', 'all');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    interestRates: CountryData[];
    employmentRates: CountryData[];
    unemploymentRates: CountryData[];
    governmentDebt: CountryData[];
    inflationRates: CountryData[];
    gdpGrowth: CountryData[];
    cpiData: CountryData[];
  }>({
    interestRates: [],
    employmentRates: [],
    unemploymentRates: [],
    governmentDebt: [],
    inflationRates: [],
    gdpGrowth: [],
    cpiData: []
  });
  const [selectedCountryForSummary, setSelectedCountryForSummary] = useState<string>('');

  // Keep the data fetching useEffect
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchGlobalData();
        setData(result);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('isDarkMode');
      const initialDarkMode = savedTheme ? JSON.parse(savedTheme) : false;
      document.documentElement.setAttribute('data-theme', initialDarkMode ? 'dark' : 'light');
      document.body.classList.toggle('dark', initialDarkMode);
    }
  }, []);

  // Dispatch theme change event when isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  const filterData = (period: string, data: CountryData[]) => {
    const referenceYear = 2023; // Set fixed reference year to 2023
    switch (period) {
      case '20years':
        return data.filter(item => item.year >= referenceYear - 20);
      case '10years':
        return data.filter(item => item.year >= referenceYear - 10);
      case '5years':
        return data.filter(item => item.year >= referenceYear - 5);
      default:
        return data;
    }
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev: string[]) =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const filteredCountries = Object.keys(countryColors).filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create a reusable chart component
  const Chart = ({ 
    title, 
    data, 
    yDomain, 
    subtitle,
    summary: SummaryComponent 
  }: { 
    title: string;
    data: CountryData[];
    yDomain: [number, number];
    subtitle: string;
    summary: React.ComponentType<{ isDarkMode: boolean }>;
  }) => (
    <div className={`mb-6 sm:mb-8 ${isGridView ? 'h-[350px] sm:h-[400px] md:h-[500px]' : ''}`}>
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4">{title}</h2>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
        {subtitle}
      </div>
      {!isGridView && <SummaryComponent isDarkMode={isDarkMode} />}
      <div className={`${isGridView ? 'h-[200px] sm:h-[250px] md:h-[350px]' : 'h-[250px] sm:h-[300px] md:h-[400px]'} w-full`}>
        <ResponsiveContainer>
          <LineChart data={filterData(selectedPeriod, data)} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
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
              contentStyle={isDarkMode ? { backgroundColor: '#333', border: 'none', color: '#fff', fontSize: '12px' } : { fontSize: '12px' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', marginTop: '8px' }}
            />
            {selectedCountries.map(country => (
              <Line
                key={country}
                type="monotone"
                dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                activeDot={isGridView ? false : { r: 3 }}
                dot={isGridView ? false : { r: 1 }}
                strokeWidth={1.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Global Economic Indicators</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Global Economic Indicators</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Global Economic Indicators</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm">Light</span>
            <button
              className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white transform transition-transform ${isDarkMode ? 'translate-x-5 sm:translate-x-6' : ''}`} />
            </button>
            <span className="text-xs sm:text-sm">Dark</span>
          </div>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-300">
            Powered by World Bank Economic Data
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300">
            Available data ranges: Interest Rates (1960-2023), Employment & Unemployment (1990-2023), Government Debt (1989-2023)
          </p>
        </div>

        {/* Enhanced Introduction Section */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Comprehensive Economic Analysis Platform</h2>
            <p className="text-xs sm:text-sm mb-2 sm:mb-3">
              Welcome to our advanced economic data visualization platform. We provide in-depth analysis of key economic indicators across {Object.keys(countryColors).length} major economies, leveraging official World Bank data to deliver accurate, timely insights into global economic trends.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-white/10 p-2 sm:p-3 rounded">
                <h3 className="font-medium mb-1 sm:mb-2 text-sm">Key Features:</h3>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                  <li>Real-time economic data visualization</li>
                  <li>Cross-country comparative analysis</li>
                  <li>Historical trend examination</li>
                  <li>Multiple indicator correlation</li>
                </ul>
              </div>
              <div className="bg-white/10 p-2 sm:p-3 rounded">
                <h3 className="font-medium mb-1 sm:mb-2 text-sm">Available Metrics:</h3>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                  <li>Interest & Inflation Rates</li>
                  <li>Employment Statistics</li>
                  <li>GDP Growth Trends</li>
                  <li>Government Debt Levels</li>
                </ul>
              </div>
            </div>
            <p className="text-xs sm:text-sm italic">
              Updated regularly with the latest World Bank economic data releases.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-3 sm:space-y-4">
        {/* Controls Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className={`w-full p-2 sm:p-2.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Time</option>
            <option value="20years">Last 20 Years</option>
            <option value="10years">Last 10 Years</option>
            <option value="5years">Last 5 Years</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className={`w-full p-2 sm:p-2.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Metrics</option>
            <option value="interest">Interest Rates</option>
            <option value="employment">Employment Rates</option>
            <option value="unemployment">Unemployment Rates</option>
            <option value="debt">Government Debt</option>
            <option value="inflation">Inflation Rates</option>
            <option value="gdp">GDP Growth</option>
            <option value="cpi">Consumer Price Index</option>
          </select>
          <button
            onClick={() => setIsGridView(!isGridView)}
            className={`w-full p-2 sm:p-2.5 rounded-md text-sm font-medium ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {isGridView ? 'Stack View' : 'Grid View'}
          </button>
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const searchValue = e.target.value.toLowerCase();
              const matchedCountry = Object.keys(countryColors).find(
                country => country.toLowerCase() === searchValue
              );
              setSelectedCountryForSummary(matchedCountry || '');
            }}
            className={`w-full p-2 sm:p-2.5 rounded-md border text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Y-Axis Control - Mobile Optimized */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 sm:p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <label htmlFor="maxYAxis" className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'} text-sm font-medium whitespace-nowrap`}>
            Max Y-Axis Value (Interest Rate):
          </label>
          <input
            id="maxYAxis"
            type="number"
            value={maxYAxis}
            onChange={(e) => setMaxYAxis(Number(e.target.value))}
            className={`w-full sm:w-[120px] p-2 rounded-md border text-sm transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400' 
                : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Country Selection - Improved Mobile Layout */}
        <div className={`rounded-lg p-3 sm:p-4 border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-sm sm:text-base font-medium mb-3 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-700'
          }`}>
            Select Countries to Display:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredCountries.map(country => (
              <div key={country} className={`flex items-center space-x-2 p-2 rounded border transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                  : 'bg-white border-gray-200 hover:bg-gray-100'
              }`}>
                <input
                  type="checkbox"
                  id={country}
                  checked={selectedCountries.includes(country)}
                  onChange={() => handleCountryToggle(country)}
                  className={`rounded w-4 h-4 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'border-gray-500 text-blue-400 focus:ring-blue-400' 
                      : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                  }`}
                />
                <label htmlFor={country} className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'} text-xs sm:text-sm truncate cursor-pointer transition-colors duration-200`}>
                  {country}
                </label>
              </div>
            ))}
          </div>
        </div>

        {selectedCountryForSummary && (
          <>
            <CountryEconomicSummary
              country={selectedCountryForSummary}
              data={data}
              isDarkMode={isDarkMode}
            />

          </>
        )}
      </div>

      <div className={`${isGridView ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8' : 'space-y-12 sm:space-y-16'} mt-8 sm:mt-12`}>
        {(selectedMetric === 'interest' || selectedMetric === 'all') && (
          <Chart
            title="Interest Rates (%)"
            data={data.interestRates}
            yDomain={[0, maxYAxis]}
            subtitle="Vertical axis shows interest rates as a percentage, where 5 = 5% interest rate"
            summary={InterestRateSummary}
          />
        )}

        {(selectedMetric === 'employment' || selectedMetric === 'all') && (
          <Chart
            title="Employment Rates (%)"
            data={data.employmentRates}
            yDomain={[40, 80]}
            subtitle="Vertical axis shows percentage of working-age population employed, where 60 = 60% of population is employed"
            summary={EmploymentSummary}
          />
        )}

        {(selectedMetric === 'unemployment' || selectedMetric === 'all') && (
          <Chart
            title="Unemployment Rates (%)"
            data={data.unemploymentRates}
            yDomain={[0, 30]}
            subtitle="Vertical axis shows percentage of labor force unemployed, where 10 = 10% of labor force is seeking work"
            summary={UnemploymentSummary}
          />
        )}

        {(selectedMetric === 'debt' || selectedMetric === 'all') && (
          <Chart
            title="Central Government Debt (% of GDP)"
            data={data.governmentDebt}
            yDomain={[0, 250]}
            subtitle="Vertical axis shows debt as a percentage of GDP, where 100 = debt equals one year's GDP"
            summary={DebtSummary}
          />
        )}

        {(selectedMetric === 'inflation' || selectedMetric === 'all') && (
          <Chart
            title="Inflation Rates (%)"
            data={data.inflationRates}
            yDomain={[0, 25]}
            subtitle="Vertical axis shows annual percentage change in consumer prices, where 5 = 5% price increase per year"
            summary={InflationSummary}
          />
        )}

        {(selectedMetric === 'gdp' || selectedMetric === 'all') && (
          <Chart
            title="GDP Growth (%)"
            data={data.gdpGrowth}
            yDomain={[-10, 15]}
            subtitle="Vertical axis shows annual GDP growth as a percentage, where 3 = 3% growth in economic output"
            summary={GDPGrowthSummary}
          />
        )}

        {(selectedMetric === 'cpi' || selectedMetric === 'all') && (
          <Chart
            title="Consumer Price Index"
            data={data.cpiData}
            yDomain={[0, 200]}
            subtitle="Base year 2010 = 100. Values above 100 indicate price increases since 2010, below 100 indicate decreases."
            summary={CPISummary}
          />
        )}
      </div>

      {/* Bottom Ad Placement - Enhanced with methodology and sources */}
      <div className="mt-6 sm:mt-8 mb-4">
        <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-900 border border-gray-700 shadow-lg' 
            : 'bg-white border border-gray-200'
        }`}>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 dark:text-gray-100">Data Sources & Methodology</h2>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base md:text-lg dark:text-gray-200 text-gray-700">
              All economic indicators are sourced from the World Bank's official database, ensuring reliable 
              and consistent data across all countries. Our methodology includes:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base md:text-lg dark:text-gray-200 text-gray-700 ml-4 space-y-2 sm:space-y-3">
              <li>Regular data updates from official World Bank APIs</li>
              <li>Standardized data processing and normalization</li>
              <li>Quality checks and validation procedures</li>
              <li>Historical data preservation and versioning</li>
            </ul>
          </div>
        </div>
        <AdSense />
        <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 dark:text-white">Updates and Maintenance</h3>
          <p className="text-sm sm:text-base md:text-lg dark:text-white text-gray-700">
            Our platform is regularly updated to ensure accuracy and reliability of economic data. 
            Updates are performed automatically when new data becomes available from the World Bank.
          </p>
          <p className="text-sm sm:text-base md:text-lg dark:text-white text-gray-700 mt-3 sm:mt-4">
            © {new Date().getFullYear()} Global Economic Indicators. Data provided by the World Bank.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalInterestRateApp; 