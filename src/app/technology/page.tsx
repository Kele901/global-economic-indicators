'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchTechnologyData, TechnologyData, CountryData, COUNTRY_NAMES } from '../services/worldbank';
import { 
  technologyIndicators, 
  techChartColors, 
  defaultTechCountries,
  formatNumber,
  formatPercent
} from '../data/technologyIndicators';

// Dynamically import chart components to avoid SSR issues
const PatentTrendsChart = dynamic(
  () => import('../components/PatentTrendsChart'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const RDSpendingChart = dynamic(
  () => import('../components/RDSpendingChart'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const TechExportsChart = dynamic(
  () => import('../components/TechExportsChart'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const InnovationRankingTable = dynamic(
  () => import('../components/InnovationRankingTable'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading table...</span>
      </div>
    )
  }
);

const TechWorldMap = dynamic(
  () => import('../components/TechWorldMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

const TechnologyPage = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [techData, setTechData] = useState<TechnologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(defaultTechCountries);
  const [selectedYear, setSelectedYear] = useState<number>(2022);

  // Dispatch theme change event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  // Fetch technology data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTechnologyData();
        setTechData(data);
        
        // Set the latest year with data
        if (data.rdSpending.length > 0) {
          const latestYear = Math.max(...data.rdSpending.map(d => d.year));
          setSelectedYear(Math.min(latestYear, 2022));
        }
      } catch (err: any) {
        console.error('Error loading technology data:', err);
        setError(err.message || 'Failed to load technology data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Theme colors
  const themeColors = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  // Helper function to get latest value for a country
  const getLatestValue = (data: CountryData[], country: string): number | null => {
    for (let i = data.length - 1; i >= 0; i--) {
      const value = data[i][country];
      if (value !== undefined && value !== null && typeof value === 'number') {
        return value;
      }
    }
    return null;
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    if (!techData) return null;

    const stats = {
      totalPatents: 0,
      avgRDSpending: 0,
      topPatentCountry: '',
      topRDCountry: '',
      topPatentValue: 0,
      topRDValue: 0,
      countriesWithData: 0
    };

    // Get latest year data for patents
    const latestPatentData = techData.patentApplicationsResident[techData.patentApplicationsResident.length - 1];
    if (latestPatentData) {
      Object.entries(latestPatentData).forEach(([key, value]) => {
        if (key !== 'year' && typeof value === 'number') {
          stats.totalPatents += value;
          if (value > stats.topPatentValue) {
            stats.topPatentValue = value;
            stats.topPatentCountry = key;
          }
        }
      });
    }

    // Get latest year data for R&D spending
    const latestRDData = techData.rdSpending[techData.rdSpending.length - 1];
    let rdCount = 0;
    if (latestRDData) {
      Object.entries(latestRDData).forEach(([key, value]) => {
        if (key !== 'year' && typeof value === 'number') {
          stats.avgRDSpending += value;
          rdCount++;
          if (value > stats.topRDValue) {
            stats.topRDValue = value;
            stats.topRDCountry = key;
          }
        }
      });
      if (rdCount > 0) {
        stats.avgRDSpending = stats.avgRDSpending / rdCount;
      }
      stats.countriesWithData = rdCount;
    }

    return stats;
  };

  const summaryStats = getSummaryStats();

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.background} ${themeColors.text} flex items-center justify-center`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeColors.background} ${themeColors.text} flex items-center justify-center`}>
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border} max-w-md text-center`}>
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p className={themeColors.textSecondary}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.background} ${themeColors.text}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Global Technology &amp; Innovation
            </h1>
            <p className={`${themeColors.textSecondary} max-w-2xl`}>
              Explore technology development metrics across nations including patent activity, 
              R&amp;D investment, high-tech exports, and innovation indicators.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={themeColors.textSecondary}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                isDarkMode ? 'translate-x-6' : ''
              }`} />
            </button>
            <span className={themeColors.textSecondary}>Dark</span>
          </div>
        </div>

        {/* Quick Stats */}
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {formatNumber(summaryStats.totalPatents)}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Total Patent Applications</div>
            </div>
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {formatPercent(summaryStats.avgRDSpending)}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Avg R&amp;D Spending (% GDP)</div>
            </div>
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {summaryStats.topPatentCountry}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Top Patent Filer</div>
            </div>
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                {summaryStats.countriesWithData}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Countries Tracked</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className={`flex flex-wrap gap-2 mb-8 p-1 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'patents', label: 'Patents & IP', icon: '📜' },
            { id: 'rd', label: 'R&D Investment', icon: '🔬' },
            { id: 'trade', label: 'Tech Trade', icon: '🌐' },
            { id: 'compare', label: 'Country Comparison', icon: '📈' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 shadow'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section: Overview */}
        {activeSection === 'overview' && techData && (
          <div className="space-y-8">
            {/* Key Insights */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h2 className="text-xl font-bold mb-4">Technology &amp; Innovation Landscape</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Patent Activity
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    Patent applications are a key indicator of innovation activity. Countries with 
                    high patent filings typically have strong R&amp;D ecosystems and IP protection frameworks.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Resident Patents', 'Non-Resident Patents', 'Trademarks'].map(item => (
                      <span 
                        key={item}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    R&amp;D Investment
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    Research and development spending as a percentage of GDP reflects a nation&apos;s 
                    commitment to innovation and long-term economic competitiveness.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['R&D Spending', 'Researchers', 'Technicians'].map(item => (
                      <span 
                        key={item}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Innovation Map */}
            <div className={`rounded-xl overflow-hidden ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`px-4 py-3 border-b ${themeColors.border}`}>
                <h2 className="text-xl font-bold">Global Innovation Map</h2>
                <p className={`text-sm ${themeColors.textSecondary}`}>
                  R&amp;D spending as percentage of GDP by country
                </p>
              </div>
              <TechWorldMap
                isDarkMode={isDarkMode}
                data={techData.rdSpending}
                metric="rdSpending"
                selectedYear={selectedYear}
              />
            </div>

            {/* Innovation Rankings */}
            <InnovationRankingTable
              isDarkMode={isDarkMode}
              techData={techData}
              selectedYear={selectedYear}
            />
          </div>
        )}

        {/* Section: Patents & IP */}
        {activeSection === 'patents' && techData && (
          <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-blue-500 text-blue-400' 
                : 'bg-white border-blue-400 text-blue-700'
            }`}>
              <h3 className="font-semibold">Understanding Patent Data</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Patent applications indicate the level of innovation activity. Resident patents reflect 
                domestic innovation, while non-resident patents show foreign interest in a market.
              </p>
            </div>

            <PatentTrendsChart
              isDarkMode={isDarkMode}
              patentData={techData.patentApplicationsResident}
              nonResidentData={techData.patentApplicationsNonResident}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />

            {/* Trademark Applications */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Trademark Applications</h3>
              <p className={`text-sm ${themeColors.textSecondary} mb-4`}>
                Trademark filings indicate commercial activity and brand development across economies.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {defaultTechCountries.slice(0, 10).map(country => {
                  const value = getLatestValue(techData.trademarkApplications, country);
                  return (
                    <div 
                      key={country}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
                    >
                      <div className="text-lg font-bold" style={{ color: techChartColors[country] }}>
                        {value ? formatNumber(value) : 'N/A'}
                      </div>
                      <div className={`text-xs ${themeColors.textTertiary}`}>{country}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section: R&D Investment */}
        {activeSection === 'rd' && techData && (
          <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-emerald-500 text-emerald-400' 
                : 'bg-white border-emerald-400 text-emerald-700'
            }`}>
              <h3 className="font-semibold">R&amp;D Investment Metrics</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Research and development spending is a key driver of long-term economic growth 
                and technological advancement. Leading economies typically invest 2-4% of GDP in R&amp;D.
              </p>
            </div>

            <RDSpendingChart
              isDarkMode={isDarkMode}
              rdData={techData.rdSpending}
              researchersData={techData.researchersRD}
              techniciansData={techData.techniciansRD}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />

            {/* Researchers per Million */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Research Workforce</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${themeColors.textSecondary}`}>
                    Researchers per Million People
                  </h4>
                  <div className="space-y-2">
                    {defaultTechCountries.slice(0, 5).map(country => {
                      const value = getLatestValue(techData.researchersRD, country);
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <span className={themeColors.textSecondary}>{country}</span>
                          <span className="font-medium" style={{ color: techChartColors[country] }}>
                            {value ? formatNumber(value) : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${themeColors.textSecondary}`}>
                    Technicians per Million People
                  </h4>
                  <div className="space-y-2">
                    {defaultTechCountries.slice(0, 5).map(country => {
                      const value = getLatestValue(techData.techniciansRD, country);
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <span className={themeColors.textSecondary}>{country}</span>
                          <span className="font-medium" style={{ color: techChartColors[country] }}>
                            {value ? formatNumber(value) : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Tech Trade */}
        {activeSection === 'trade' && techData && (
          <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-purple-500 text-purple-400' 
                : 'bg-white border-purple-400 text-purple-700'
            }`}>
              <h3 className="font-semibold">Technology Trade Indicators</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                High-tech exports and ICT goods trade reflect a country&apos;s position in global 
                technology value chains and manufacturing sophistication.
              </p>
            </div>

            <TechExportsChart
              isDarkMode={isDarkMode}
              hightechData={techData.hightechExports}
              ictData={techData.ictExports}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />

            {/* IP Royalties */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Intellectual Property Flows</h3>
              <p className={`text-sm ${themeColors.textSecondary} mb-4`}>
                IP receipts and payments show the flow of technology licensing and royalties between countries.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    IP Receipts (Income)
                  </h4>
                  <div className="space-y-2">
                    {defaultTechCountries.slice(0, 5).map(country => {
                      const value = getLatestValue(techData.ipReceipts, country);
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <span className={themeColors.textSecondary}>{country}</span>
                          <span className="font-medium text-green-500">
                            ${value ? formatNumber(value) : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    IP Payments (Costs)
                  </h4>
                  <div className="space-y-2">
                    {defaultTechCountries.slice(0, 5).map(country => {
                      const value = getLatestValue(techData.ipPayments, country);
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <span className={themeColors.textSecondary}>{country}</span>
                          <span className="font-medium text-orange-500">
                            ${value ? formatNumber(value) : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Country Comparison */}
        {activeSection === 'compare' && techData && (
          <div className="space-y-8">
            {/* Country Selector */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Select Countries to Compare</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {Object.values(COUNTRY_NAMES).map(country => (
                  <button
                    key={country}
                    onClick={() => {
                      if (selectedCountries.includes(country)) {
                        setSelectedCountries(selectedCountries.filter(c => c !== country));
                      } else if (selectedCountries.length < 10) {
                        setSelectedCountries([...selectedCountries, country]);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedCountries.includes(country)
                        ? 'ring-2 ring-blue-500'
                        : ''
                    } ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    style={{
                      backgroundColor: selectedCountries.includes(country) 
                        ? (isDarkMode ? techChartColors[country] + '40' : techChartColors[country] + '20')
                        : undefined,
                      borderColor: selectedCountries.includes(country) ? techChartColors[country] : undefined
                    }}
                  >
                    {country}
                  </button>
                ))}
              </div>
              <p className={`text-xs mt-3 ${themeColors.textTertiary}`}>
                Select up to 10 countries. Currently selected: {selectedCountries.length}
              </p>
            </div>

            {/* Comparison Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
                <h3 className="text-lg font-semibold mb-4">R&amp;D Spending Comparison</h3>
                <div className="space-y-3">
                  {selectedCountries.map(country => {
                    const value = getLatestValue(techData.rdSpending, country);
                    const maxValue = 5; // Max R&D as % of GDP for scale
                    const width = value ? Math.min((value / maxValue) * 100, 100) : 0;
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{country}</span>
                          <span className="font-medium">{value ? formatPercent(value) : 'N/A'}</span>
                        </div>
                        <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${width}%`,
                              backgroundColor: techChartColors[country]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
                <h3 className="text-lg font-semibold mb-4">High-Tech Exports Comparison</h3>
                <div className="space-y-3">
                  {selectedCountries.map(country => {
                    const value = getLatestValue(techData.hightechExports, country);
                    const maxValue = 50; // Max high-tech exports % for scale
                    const width = value ? Math.min((value / maxValue) * 100, 100) : 0;
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{country}</span>
                          <span className="font-medium">{value ? formatPercent(value) : 'N/A'}</span>
                        </div>
                        <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${width}%`,
                              backgroundColor: techChartColors[country]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scientific Output */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Scientific Publications</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {selectedCountries.map(country => {
                  const value = getLatestValue(techData.scientificPublications, country);
                  return (
                    <div 
                      key={country}
                      className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
                    >
                      <div className="text-2xl font-bold" style={{ color: techChartColors[country] }}>
                        {value ? formatNumber(value) : 'N/A'}
                      </div>
                      <div className={`text-sm ${themeColors.textSecondary}`}>{country}</div>
                      <div className={`text-xs ${themeColors.textTertiary}`}>articles</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer / Sources */}
        <div className={`mt-12 p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className="font-semibold mb-3">Data Sources &amp; Methodology</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>
                Primary Sources
              </h4>
              <ul className={`text-sm space-y-1 ${themeColors.textTertiary}`}>
                <li>World Bank - World Development Indicators</li>
                <li>WIPO - World Intellectual Property Organization</li>
                <li>UNESCO - Institute for Statistics</li>
                <li>UN Comtrade - Trade Statistics</li>
                <li>ITU - International Telecommunication Union</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>
                Indicators Covered
              </h4>
              <ul className={`text-sm space-y-1 ${themeColors.textTertiary}`}>
                <li>Patent &amp; Trademark Applications</li>
                <li>R&amp;D Expenditure (% of GDP)</li>
                <li>Researchers &amp; Technicians in R&amp;D</li>
                <li>High-Technology Exports</li>
                <li>Scientific Publications</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>
                Notes
              </h4>
              <p className={`text-sm ${themeColors.textTertiary}`}>
                Data availability varies by country and year. Some indicators may have 
                reporting lags of 1-2 years. Values are based on the most recent available 
                data from each source.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyPage;
