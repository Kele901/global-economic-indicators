"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { fetchGlobalData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { COUNTRY_FLAGS as countryFlags } from '../components/CountryFlag';
import { COUNTRY_COLORS as countryColors } from '../utils/countryMappings';
import BulkChartDownload from '../components/BulkChartDownload';
import ChartDownloadButton from '../components/ChartDownloadButton';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';
import dynamic from 'next/dynamic';
import { CITY_LABELS, CITY_ORDER, type CityId } from '../data/cities';

// Dynamically import the map component to avoid SSR issues
const GlobalEconomicMap = dynamic(
  () => import('../components/GlobalEconomicMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center min-h-[400px]">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

// Forty-odd curated price charts across four cities. Most readers come here
// for the headline inflation series, so the city panels and the index table
// load on demand rather than in the page's first JavaScript payload.
const panelSkeleton = (label: string) => () => (
  <div className="w-full rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center min-h-[300px] mt-10">
    <span className="text-gray-500 dark:text-gray-400">Loading {label}…</span>
  </div>
);

const CityCostPanel = dynamic(() => import('../components/inflation/CityCostPanel'), {
  ssr: false,
  loading: panelSkeleton('city prices'),
});

const CostOfLivingOverview = dynamic(() => import('../components/inflation/CostOfLivingOverview'), {
  ssr: false,
  loading: panelSkeleton('the index table'),
});

// Under the Inflation tab all four cities are stacked, which is a lot of
// recharts to mount at once. Each panel waits until it is near the viewport.
function LazyCityPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref}>
      {visible ? children : <div className="min-h-[300px]" aria-hidden="true" />}
    </div>
  );
}


type InflationTab = 'inflation' | 'cost-of-living' | 'world-map';

// City tab type for Cost of Living section
type CityTab = 'overview' | CityId;

export default function InflationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["USA", "UK", "Germany"]);
  const [selectedPeriod, setSelectedPeriod] = useState<'5y' | '10y' | 'all'>('all');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [activeTab, setActiveTab] = useState<InflationTab>('inflation');
  const [selectedCityTab, setSelectedCityTab] = useState<CityTab>('overview');
  const inflationChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const globalData = await fetchGlobalData();
        setData(globalData);
      } catch (err) {
        setError('Failed to fetch economic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inflationData = useMemo(() => {
    if (!data) return [];
    let filtered = data.inflationRates || [];
    const endYear = new Date().getFullYear();
    const startYear = selectedPeriod === '5y' ? endYear - 5 : selectedPeriod === '10y' ? endYear - 10 : 1960;
    return filtered.filter((item: any) => parseInt(item.year) >= startYear && parseInt(item.year) <= endYear);
  }, [data, selectedPeriod]);

  const latestStats = useMemo(() => {
    if (!inflationData.length) return [];
    return selectedCountries.map(country => {
      const entry = latestEntry(inflationData, country);
      return { country, value: entry?.value };
    });
  }, [inflationData, selectedCountries]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Inflation & Cost of Living</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl">
              Track inflation rates across countries and explore cost of living indices for major cities worldwide.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BulkChartDownload variant="primary" size="sm" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Dark</span>
          </div>
        </div>

        {/* Static intro content - always visible for SEO */}
        <div className={`rounded-lg p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Global Inflation Tracker</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Inflation measures the rate at which prices for goods and services rise over time, eroding
            purchasing power. This dashboard tracks consumer price inflation across 30+ economies using
            data from the World Bank and IMF, with historical coverage spanning decades. Compare how
            different countries have managed price stability, identify periods of elevated inflation
            or deflation, and explore cost of living differences across major cities worldwide.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Switch between the Inflation Rates tab for cross-country analysis and the Cost of Living
            tab for city-level price comparisons including rent, groceries, and purchasing power indices.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setActiveTab('inflation')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'inflation'
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
            }`}
          >
            Inflation Rates
          </button>
          <button
            onClick={() => setActiveTab('cost-of-living')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'cost-of-living'
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
            }`}
          >
            Cost of Living Index
          </button>
          <button
            onClick={() => setActiveTab('world-map')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'world-map'
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
            }`}
          >
            World Map
          </button>
        </div>

        {/* Inflation Tab Content */}
        {activeTab === 'inflation' && (
        <>
        {/* Country Selector */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(countryColors).map(country => {
              const isSelected = selectedCountries.includes(country);
              const FlagComponent = countryFlags[country];
              return (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium
                    ${isSelected 
                      ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900') 
                      : (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                  `}
                >
                  {FlagComponent && <FlagComponent className="w-6 h-4 rounded" />}
                  {country}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="mb-4 flex gap-2">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className={`px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Time</option>
            <option value="10y">Last 10 Years</option>
            <option value="5y">Last 5 Years</option>
          </select>
        </div>

        {/* Key Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {latestStats.map(({ country, value }) => {
            const FlagComponent = countryFlags[country];
            return (
              <div key={country} className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {FlagComponent && <FlagComponent className="w-6 h-4 rounded" />}
                  <span className="font-semibold text-lg">{country}</span>
                </div>
                <div className="text-2xl font-bold">{value !== undefined ? `${value.toFixed(2)}%` : 'N/A'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Latest available</div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div 
          ref={inflationChartRef}
          data-chart-container
          data-chart-title="Inflation Rate Over Time"
          className={`rounded-lg shadow p-4 relative ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
        >
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-semibold">Inflation Rate Over Time</h2>
            <ChartDownloadButton
              chartElement={inflationChartRef.current}
              chartRef={inflationChartRef}
              chartData={{
                title: "Inflation Rate Over Time",
                data: inflationData,
                type: 'line',
                countries: selectedCountries
              }}
              variant="outline"
              size="sm"
            />
          </div>
          
          {/* Info Panel for Inflation Rate */}
          <InfoPanel
            metric={economicMetrics.inflationRate}
            isDarkMode={isDarkMode}
            position="top-right"
            size="medium"
          />
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">
            Data source: World Bank consumer price inflation (FP.CPI.TOTL.ZG), fetched live.
            Drag the handles under the chart to zoom into a period.
          </p>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                <Tooltip
                  contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                  labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                  formatter={(value: number) => `${value?.toFixed(2)}%`}
                />
                <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                {selectedCountries.map((country, idx) => (
                  <Line
                    key={country}
                    type="monotone"
                    dataKey={country}
                    stroke={countryColors[country as keyof typeof countryColors] || '#6366f1'}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
                {/* Sixty-plus years of annual CPI compresses the 1970s spike and
                    the post-2021 one into the same few pixels. The brush lets the
                    reader isolate either without losing the full-series context. */}
                {inflationData.length > 15 && (
                  <Brush
                    dataKey="year"
                    height={28}
                    travellerWidth={10}
                    stroke={isDarkMode ? '#6366f1' : '#4f46e5'}
                    fill={isDarkMode ? '#1f2937' : '#f9fafb'}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {CITY_ORDER.map(city => (
          <LazyCityPanel key={city}>
            <CityCostPanel city={city} isDarkMode={isDarkMode} />
          </LazyCityPanel>
        ))}
        </>
        )}

        {/* Cost of Living Tab Content */}
        {activeTab === 'cost-of-living' && (
          <div className="space-y-6">
            {/* Introduction */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className="text-xl font-bold mb-3">Cost of Living Index by City 2026</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                The Cost of Living Index compares the relative cost of living across cities worldwide, using New York City as the baseline (index = 100). 
                A city with an index of 80 means it is 20% cheaper than New York, while an index of 120 means it is 20% more expensive.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className="font-semibold">Cost of Living Index:</span> Relative indicator of consumer goods prices including groceries, restaurants, transportation, and utilities (excluding rent)
                </div>
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className="font-semibold">Rent Index:</span> Estimation of apartment rent prices compared to New York City
                </div>
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className="font-semibold">Purchasing Power:</span> Relative purchasing power in buying goods and services based on average net salary
                </div>
              </div>
            </div>

            {/* City Tabs Navigation */}
            <div className={`flex flex-wrap gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {[
                { id: 'overview' as CityTab, label: 'Overview', flag: null },
                ...CITY_ORDER.map(id => ({
                  id: id as CityTab,
                  label: CITY_LABELS[id].name,
                  flag: CITY_LABELS[id].flag,
                })),
              ].map(city => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityTab(city.id)}
                  aria-pressed={selectedCityTab === city.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedCityTab === city.id
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {city.flag && <span aria-hidden="true">{city.flag}</span>}
                  {city.label}
                </button>
              ))}
            </div>

            {selectedCityTab === 'overview' && <CostOfLivingOverview isDarkMode={isDarkMode} />}

            {selectedCityTab !== 'overview' && (
              <CityCostPanel city={selectedCityTab} isDarkMode={isDarkMode} compact />
            )}
          </div>
        )}

        {/* World Map Tab Content */}
        {activeTab === 'world-map' && (
          <div className="space-y-6">
            {/* Introduction */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className="text-xl font-bold mb-3">Global Economic Map</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Explore inflation rates by country and cost of living by city on an interactive world map. 
                Toggle between views to compare economic conditions across the globe.
              </p>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p><strong>Inflation View:</strong> Countries are colored based on their annual inflation rate, from green (low) to red (high).</p>
                <p className="mt-1"><strong>Cost of Living View:</strong> City markers show relative cost of living index where New York City = 100.</p>
                <p className="mt-1"><strong>Both View:</strong> See both country inflation and city cost of living data together.</p>
              </div>
            </div>

            {/* World Map Component */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <GlobalEconomicMap 
                isDarkMode={isDarkMode} 
                inflationData={data?.inflationRates || []}
              />
            </div>

            {/* Key Insights */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h3 className="text-lg font-bold mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Developed Economies</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Generally maintain low to moderate inflation (2-5%) with high cost of living in major cities like Zurich, New York, and London.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Emerging Markets</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Often experience higher inflation rates but offer lower cost of living, making cities like Mumbai, Cairo, and Jakarta more affordable.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>High Inflation Countries</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Countries like Turkey and Argentina face significant inflation challenges, impacting purchasing power and economic stability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 