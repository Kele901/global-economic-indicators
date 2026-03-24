'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCulturalData, CulturalData, CountryData, COUNTRY_NAMES } from '../services/worldbank';
import { fetchCulturalStaticData, CulturalStaticData } from '../services/culturalData';
import {
  culturalChartColors,
  defaultCulturalCountries,
  formatNumber,
  formatCurrency,
  intangibleHeritageByCountry,
  endangeredSitesByCountry,
  memoryOfWorldByCountry,
  musicRevenueFallbackData,
  bookTitlesByCountry,
  streamingOriginalsByCountry,
  gamingRevenueFallbackData,
  webLanguagePresenceByCountry,
  libraryDensityByCountry,
  performingArtsPerCapita,
  culturalParticipationByCountry,
  culturalGoodsImportsByCountry,
  languageDiversityIndex,
  endangeredLanguagesByCountry,
} from '../data/culturalMetrics';

const HeritageWorldMap = dynamic(
  () => import('../components/HeritageWorldMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

const HeritageSitesChart = dynamic(
  () => import('../components/HeritageSitesChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const CreativeEconomyChart = dynamic(
  () => import('../components/CreativeEconomyChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const TourismTrendsChart = dynamic(
  () => import('../components/TourismTrendsChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const CulturalInfraChart = dynamic(
  () => import('../components/CulturalInfraChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const CulturalRankingTable = dynamic(
  () => import('../components/CulturalRankingTable'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading table...</span>
      </div>
    )
  }
);

const CulturalHeatmapChart = dynamic(
  () => import('../components/CulturalHeatmapChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading heatmap...</span>
      </div>
    )
  }
);

const CulturalRadarChart = dynamic(
  () => import('../components/CulturalRadarChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading radar...</span>
      </div>
    )
  }
);

const IntangibleHeritageChart = dynamic(
  () => import('../components/IntangibleHeritageChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const MediaPublishingChart = dynamic(
  () => import('../components/MediaPublishingChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const DigitalCultureChart = dynamic(
  () => import('../components/DigitalCultureChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const CulturalParticipationChart = dynamic(
  () => import('../components/CulturalParticipationChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const CulturalTradeChart = dynamic(
  () => import('../components/CulturalTradeChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const LinguisticDiversityChart = dynamic(
  () => import('../components/LinguisticDiversityChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const CulturalCapitalPage = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [culturalData, setCulturalData] = useState<CulturalData | null>(null);
  const [staticData, setStaticData] = useState<CulturalStaticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(defaultCulturalCountries);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [worldBankData, culturalStaticData] = await Promise.all([
          fetchCulturalData(),
          fetchCulturalStaticData(),
        ]);

        setCulturalData(worldBankData);
        setStaticData(culturalStaticData);
      } catch (err: any) {
        console.error('Error loading cultural data:', err);
        setError(err.message || 'Failed to load cultural data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const latestMusicRevenue = React.useMemo(() => {
    const latest = musicRevenueFallbackData[musicRevenueFallbackData.length - 1];
    if (!latest) return {};
    const result: Record<string, number> = {};
    Object.entries(latest).forEach(([k, v]) => { if (k !== 'year') result[k] = v as number; });
    return result;
  }, []);

  const latestGamingRevenue = React.useMemo(() => {
    const latest = gamingRevenueFallbackData[gamingRevenueFallbackData.length - 1];
    if (!latest) return {};
    const result: Record<string, number> = {};
    Object.entries(latest).forEach(([k, v]) => { if (k !== 'year') result[k] = v as number; });
    return result;
  }, []);

  const themeColors = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const getLatestValue = (data: CountryData[], country: string): number | null => {
    for (let i = data.length - 1; i >= 0; i--) {
      const value = data[i][country];
      if (value !== undefined && value !== null && typeof value === 'number') return value;
    }
    return null;
  };

  const getSummaryStats = () => {
    if (!staticData) return null;

    const totalHeritageSites = Object.values(staticData.heritageSites).reduce((sum, d) => sum + d.total, 0);
    const totalCreativeCities = Object.values(staticData.creativeCities).reduce((sum, d) => sum + d.total, 0);
    const topHeritageCountry = Object.entries(staticData.heritageSites)
      .sort((a, b) => b[1].total - a[1].total)[0];
    const countriesTracked = Object.keys(staticData.heritageSites).length;

    return { totalHeritageSites, totalCreativeCities, topHeritageCountry, countriesTracked };
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
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
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
              Global Cultural Capital
            </h1>
            <p className={`${themeColors.textSecondary} max-w-2xl`}>
              Compare cultural capital across countries, cities and regions. Explore heritage,
              creative economies, tourism, and the infrastructure that sustains cultural influence.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={themeColors.textSecondary}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
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

        {/* SEO Intro */}
        <div className={`rounded-lg p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Cultural Capital Economics</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Cultural capital encompasses the heritage, creative industries, institutions, and soft power
            that shape a nation&apos;s global influence and economic competitiveness. This dashboard provides
            comprehensive data across 30+ countries on UNESCO Heritage Sites, intangible cultural heritage,
            creative trade and IP flows, music and gaming revenue, streaming production, book publishing,
            tourism, library and museum density, performing arts, cultural participation, language diversity,
            and much more.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Data sourced from UNESCO, World Bank, UNCTAD, UNWTO, Brand Finance, OECD, and curated institutional reports.
          </p>
        </div>

        {/* Quick Stats */}
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {summaryStats.totalHeritageSites}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Total Heritage Sites</div>
            </div>
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {summaryStats.totalCreativeCities}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Creative Cities Network</div>
            </div>
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {summaryStats.topHeritageCountry?.[0] || 'N/A'}
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>Most Heritage Sites</div>
            </div>
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                {summaryStats.countriesTracked}
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
            { id: 'overview', label: 'Overview' },
            { id: 'heritage', label: 'Heritage & Preservation' },
            { id: 'creative', label: 'Creative Economy' },
            { id: 'tourism', label: 'Tourism & Soft Power' },
            { id: 'infrastructure', label: 'Cultural Infrastructure' },
            { id: 'media', label: 'Media & Publishing' },
            { id: 'digital', label: 'Digital Culture' },
            { id: 'participation', label: 'Cultural Participation' },
            { id: 'trade', label: 'Cultural Trade' },
            { id: 'diversity', label: 'Linguistic Diversity' },
            { id: 'compare', label: 'Country Comparison' },
            { id: 'insights', label: 'Insights' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? isDarkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && staticData && (
          <div className="space-y-8">
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h2 className="text-xl font-bold mb-4">Cultural Capital Landscape</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Heritage &amp; Preservation
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    UNESCO World Heritage Sites, Intangible Cultural Heritage, Memory of the World,
                    and endangered languages represent humanity&apos;s irreplaceable cultural legacy.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Heritage Sites', 'Intangible Heritage', 'Memory of World', 'Endangered Languages'].map(item => (
                      <span key={item} className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Creative Economy
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    The creative economy encompasses goods and services rooted in culture, creativity,
                    and intellectual property &mdash; from film and music to design and publishing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Creative Trade', 'Film Industry', 'Cultural Jobs', 'IP Trade'].map(item => (
                      <span key={item} className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    Media &amp; Digital Culture
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    Music, gaming, streaming, and publishing revenue reveal the economic power of
                    contemporary creative industries and digital cultural production.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Music Revenue', 'Gaming Revenue', 'Streaming', 'Book Publishing'].map(item => (
                      <span key={item} className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Participation &amp; Diversity
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    Library density, performing arts attendance, cultural participation rates, and
                    linguistic diversity reflect how deeply culture permeates everyday life.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Libraries', 'Performing Arts', 'Participation Rate', 'Language Diversity'].map(item => (
                      <span key={item} className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-xl overflow-hidden ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`px-4 py-3 border-b ${themeColors.border}`}>
                <h2 className="text-xl font-bold">Global Heritage Map</h2>
                <p className={`text-sm ${themeColors.textSecondary}`}>
                  UNESCO World Heritage Sites by country
                </p>
              </div>
              <HeritageWorldMap
                isDarkMode={isDarkMode}
                heritageData={staticData.heritageSites}
              />
            </div>

            <CulturalRankingTable
              isDarkMode={isDarkMode}
              heritageData={staticData.heritageSites}
              tourismArrivals={culturalData?.tourismArrivals || []}
              tourismReceipts={culturalData?.tourismReceipts || []}
              creativeGoodsExports={staticData.creativeGoodsExports}
              creativeServicesExports={staticData.creativeServicesExports}
              museumDensity={staticData.museumDensity}
              creativeCities={staticData.creativeCities}
              culturalEmployment={staticData.culturalEmployment}
              featureFilms={staticData.featureFilms}
              intangibleHeritage={intangibleHeritageByCountry}
              musicRevenue={latestMusicRevenue}
              libraryDensity={libraryDensityByCountry}
              selectedCountries={selectedCountries}
            />
          </div>
        )}

        {/* Heritage Section */}
        {activeSection === 'heritage' && staticData && (
          <div className="space-y-8">
            <HeritageSitesChart
              isDarkMode={isDarkMode}
              heritageData={staticData.heritageSites}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />

            <IntangibleHeritageChart
              isDarkMode={isDarkMode}
              intangibleHeritage={intangibleHeritageByCountry}
              endangeredSites={endangeredSitesByCountry}
              memoryOfWorld={memoryOfWorldByCountry}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />

            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Heritage by Region</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Europe', countries: ['Italy', 'France', 'Germany', 'Spain', 'UK'], color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                  { label: 'Asia-Pacific', countries: ['China', 'Japan', 'India', 'Australia', 'SouthKorea'], color: isDarkMode ? 'text-amber-400' : 'text-amber-600' },
                  { label: 'Americas', countries: ['Mexico', 'USA', 'Brazil', 'Canada', 'Argentina'], color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' },
                  { label: 'MENA & Africa', countries: ['Egypt', 'Turkey', 'SouthAfrica', 'Nigeria', 'SaudiArabia'], color: isDarkMode ? 'text-purple-400' : 'text-purple-600' },
                ].map(region => (
                  <div key={region.label} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-2 ${region.color}`}>{region.label}</h4>
                    <div className="space-y-1">
                      {region.countries.map(country => (
                        <div key={country} className="flex justify-between text-sm">
                          <span className={themeColors.textSecondary}>{country}</span>
                          <span className="font-medium">{staticData.heritageSites[country]?.total || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Creative Economy Section */}
        {activeSection === 'creative' && staticData && culturalData && (
          <div className="space-y-8">
            <CreativeEconomyChart
              isDarkMode={isDarkMode}
              creativeGoodsExports={staticData.creativeGoodsExports}
              creativeServicesExports={staticData.creativeServicesExports}
              trademarkData={culturalData.trademarkApplications}
              featureFilms={staticData.featureFilms}
              culturalEmployment={staticData.culturalEmployment}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Tourism & Soft Power Section */}
        {activeSection === 'tourism' && staticData && culturalData && (
          <div className="space-y-8">
            <TourismTrendsChart
              isDarkMode={isDarkMode}
              tourismArrivals={culturalData.tourismArrivals}
              tourismReceipts={culturalData.tourismReceipts}
              tourismExpenditure={culturalData.tourismExpenditure}
              netMigration={culturalData.netMigration}
              softPowerRankings={staticData.softPowerRankings}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Cultural Infrastructure Section */}
        {activeSection === 'infrastructure' && staticData && culturalData && (
          <div className="space-y-8">
            <CulturalInfraChart
              isDarkMode={isDarkMode}
              museumDensity={staticData.museumDensity}
              creativeCities={staticData.creativeCities}
              educationExpenditure={culturalData.educationExpenditure}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Media & Publishing Section */}
        {activeSection === 'media' && (
          <div className="space-y-8">
            <MediaPublishingChart
              isDarkMode={isDarkMode}
              musicRevenue={musicRevenueFallbackData}
              bookTitles={bookTitlesByCountry}
              streamingOriginals={streamingOriginalsByCountry}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Digital Culture Section */}
        {activeSection === 'digital' && (
          <div className="space-y-8">
            <DigitalCultureChart
              isDarkMode={isDarkMode}
              gamingRevenue={gamingRevenueFallbackData}
              webLanguagePresence={webLanguagePresenceByCountry}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Cultural Participation Section */}
        {activeSection === 'participation' && (
          <div className="space-y-8">
            <CulturalParticipationChart
              isDarkMode={isDarkMode}
              libraryDensity={libraryDensityByCountry}
              performingArts={performingArtsPerCapita}
              culturalParticipation={culturalParticipationByCountry}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Cultural Trade Section */}
        {activeSection === 'trade' && culturalData && (
          <div className="space-y-8">
            <CulturalTradeChart
              isDarkMode={isDarkMode}
              ipReceipts={culturalData.ipReceipts}
              ipPayments={culturalData.ipPayments}
              culturalGoodsImports={culturalGoodsImportsByCountry}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Linguistic Diversity Section */}
        {activeSection === 'diversity' && (
          <div className="space-y-8">
            <LinguisticDiversityChart
              isDarkMode={isDarkMode}
              languageDiversity={languageDiversityIndex}
              endangeredLanguages={endangeredLanguagesByCountry}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />
          </div>
        )}

        {/* Country Comparison Section */}
        {activeSection === 'compare' && staticData && culturalData && (
          <div className="space-y-8">
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Select Countries to Compare</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {Object.values(COUNTRY_NAMES).map(country => (
                  <button
                    key={country}
                    onClick={() => {
                      if (selectedCountries.includes(country)) {
                        setSelectedCountries(selectedCountries.filter(c => c !== country));
                      } else if (selectedCountries.length < 12) {
                        setSelectedCountries([...selectedCountries, country]);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedCountries.includes(country) ? 'ring-2 ring-purple-500' : ''
                    } ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    style={{
                      backgroundColor: selectedCountries.includes(country)
                        ? (isDarkMode ? culturalChartColors[country] + '40' : culturalChartColors[country] + '20')
                        : undefined,
                    }}
                  >
                    {country}
                  </button>
                ))}
              </div>
              <p className={`text-xs mt-3 ${themeColors.textTertiary}`}>
                Select up to 12 countries. Currently selected: {selectedCountries.length}
              </p>
            </div>

            <CulturalRadarChart
              isDarkMode={isDarkMode}
              heritageData={staticData.heritageSites}
              tourismArrivals={culturalData.tourismArrivals}
              creativeGoodsExports={staticData.creativeGoodsExports}
              museumDensity={staticData.museumDensity}
              culturalEmployment={staticData.culturalEmployment}
              featureFilms={staticData.featureFilms}
              softPowerRankings={staticData.softPowerRankings}
              musicRevenue={latestMusicRevenue}
              libraryDensity={libraryDensityByCountry}
              selectedCountries={selectedCountries}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
                <h3 className="text-lg font-semibold mb-4">Heritage Sites Comparison</h3>
                <div className="space-y-3">
                  {selectedCountries.map(country => {
                    const value = staticData.heritageSites[country]?.total || 0;
                    const maxValue = 60;
                    const width = Math.min((value / maxValue) * 100, 100);
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{country}</span>
                          <span className="font-medium">{value} sites</span>
                        </div>
                        <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: culturalChartColors[country] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
                <h3 className="text-lg font-semibold mb-4">Creative Goods Exports ($B)</h3>
                <div className="space-y-3">
                  {selectedCountries.map(country => {
                    const value = staticData.creativeGoodsExports[country] || 0;
                    const maxValue = 200;
                    const width = Math.min((value / maxValue) * 100, 100);
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{country}</span>
                          <span className="font-medium">${value.toFixed(1)}B</span>
                        </div>
                        <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: culturalChartColors[country] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Section */}
        {activeSection === 'insights' && staticData && culturalData && (
          <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-purple-500 text-purple-400' : 'bg-white border-purple-400 text-purple-700'
            }`}>
              <h3 className="font-semibold">Advanced Analytics &amp; Insights</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Explore the relationships between cultural metrics, compare countries across
                multiple dimensions, and identify cultural capital strengths and gaps.
              </p>
            </div>

            <CulturalHeatmapChart
              isDarkMode={isDarkMode}
              heritageData={staticData.heritageSites}
              tourismArrivals={culturalData.tourismArrivals}
              creativeGoodsExports={staticData.creativeGoodsExports}
              creativeServicesExports={staticData.creativeServicesExports}
              museumDensity={staticData.museumDensity}
              culturalEmployment={staticData.culturalEmployment}
              featureFilms={staticData.featureFilms}
              educationExpenditure={culturalData.educationExpenditure}
              intangibleHeritage={intangibleHeritageByCountry}
              musicRevenue={latestMusicRevenue}
              gamingRevenue={latestGamingRevenue}
              libraryDensity={libraryDensityByCountry}
              selectedCountries={selectedCountries}
            />

            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                    Heritage Concentration
                  </h4>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    Europe holds the largest share of UNESCO World Heritage Sites, with Italy, France,
                    Germany, and Spain each exceeding 50 inscriptions. China and Turkey lead in intangible heritage.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Digital Cultural Power
                  </h4>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    The USA leads global music and gaming revenue, but China and Japan are close competitors
                    in gaming. South Korea&apos;s streaming originals output punches far above its population weight.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Cultural Infrastructure
                  </h4>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    Finland leads library density globally with 154 per million people. Nordic countries
                    also lead cultural participation rates, with Sweden at 78%.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                    Linguistic Diversity
                  </h4>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    India, USA, and Brazil each have over 170 endangered languages. Papua New Guinea has the
                    highest language diversity index at 0.99, reflecting extraordinary cultural plurality.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-rose-900/30' : 'bg-rose-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`}>
                    IP Trade Flows
                  </h4>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    The USA generates the highest IP receipts globally, reflecting the dominance of American
                    cultural content. Many developing nations are net IP importers, indicating reliance on foreign content.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                    Publishing &amp; Streaming
                  </h4>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    China publishes over 500,000 book titles annually, the most globally. The USA leads
                    streaming original production with 820+ titles, followed by the UK and South Korea.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer / Sources */}
        <div className={`mt-12 p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className="font-semibold mb-3">Data Sources &amp; Methodology</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>Primary Sources</h4>
              <ul className={`text-sm space-y-1 ${themeColors.textTertiary}`}>
                <li>UNESCO - World Heritage Centre</li>
                <li>UNESCO Institute for Statistics (UIS)</li>
                <li>World Bank - World Development Indicators</li>
                <li>UNCTAD - Creative Economy Programme</li>
                <li>UN World Tourism Organization (UNWTO)</li>
                <li>Brand Finance - Global Soft Power Index</li>
                <li>OECD/Eurostat - Cultural Statistics</li>
                <li>ICOM - International Council of Museums</li>
                <li>IFPI - Global Music Report</li>
                <li>Newzoo - Global Games Market Report</li>
                <li>IFLA - International Library Statistics</li>
                <li>Ethnologue / UNESCO Atlas of Languages</li>
                <li>Ampere Analysis - Streaming Data</li>
                <li>W3Techs - Web Language Statistics</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>Indicators Covered</h4>
              <ul className={`text-sm space-y-1 ${themeColors.textTertiary}`}>
                <li>UNESCO World Heritage Sites &amp; Intangible Heritage</li>
                <li>International Tourism Arrivals &amp; Receipts</li>
                <li>Creative Goods &amp; Services Exports</li>
                <li>Cultural Employment &amp; IP Trade</li>
                <li>Museum &amp; Library Density (per capita)</li>
                <li>Music, Gaming &amp; Streaming Revenue</li>
                <li>Book Publishing &amp; Film Production</li>
                <li>Language Diversity &amp; Endangered Languages</li>
                <li>Cultural Participation &amp; Performing Arts</li>
                <li>Web Language Presence</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>Notes</h4>
              <p className={`text-sm ${themeColors.textTertiary}`}>
                Data availability varies by country and year. Live data from the World Bank is
                refreshed daily with 24-hour caching. Static datasets (heritage sites, creative
                cities, museum counts) are updated periodically from official sources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalCapitalPage;
