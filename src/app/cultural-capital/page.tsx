'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCulturalData, CulturalData, CountryData, COUNTRY_NAMES } from '../services/worldbank';
import { fetchCulturalStaticData, CulturalStaticData } from '../services/culturalData';
import StalenessBanner from '../components/StalenessBanner';
import SocialShareMenu from '../components/SocialShareMenu';
import { slugify } from '../lib/share';
import { QS_SNAPSHOT_DATE } from '../data/universityRankings';
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
  passportStrengthByCountry,
  INTERNAL_KEY_TO_ISO2,
} from '../data/culturalMetrics';
import { fetchPassportData, PassportLiveData, PassportProfile } from '../services/passport';
import { fetchEducationData, EducationLiveData } from '../services/education';

const HeritageWorldMap = dynamic(
  () => import('../components/HeritageWorldMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const PassportStrengthMap = dynamic(
  () => import('../components/PassportStrengthMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

const PassportStrengthChart = dynamic(
  () => import('../components/PassportStrengthChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    )
  }
);

const EducationDashboard = dynamic(
  () => import('../components/EducationDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading education dashboard...</span>
      </div>
    )
  }
);

const CulturalCapitalPage = () => {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [culturalData, setCulturalData] = useState<CulturalData | null>(null);
  const [staticData, setStaticData] = useState<CulturalStaticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(defaultCulturalCountries);
  const [passportLive, setPassportLive] = useState<PassportLiveData | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportError, setPassportError] = useState<string | null>(null);
  const passportLoadingRef = useRef(false);
  const [educationData, setEducationData] = useState<EducationLiveData | null>(null);
  const [educationLoading, setEducationLoading] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);
  const educationLoadingRef = useRef(false);

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

  useEffect(() => {
    if (activeSection !== 'passport') return;
    if (passportLive) return;
    if (passportLoadingRef.current) return;

    let cancelled = false;
    const loadPassport = async () => {
      passportLoadingRef.current = true;
      setPassportLoading(true);
      setPassportError(null);
      try {
        const data = await fetchPassportData();
        if (cancelled) return;
        setPassportLive(data);
        if (Object.keys(data.passports).length === 0) {
          setPassportError('Live passport data unavailable — showing static fallback.');
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[passport live] failed:', err);
        setPassportError(err?.message || 'Failed to load live passport data');
      } finally {
        passportLoadingRef.current = false;
        if (!cancelled) setPassportLoading(false);
      }
    };
    loadPassport();
    return () => { cancelled = true; };
  }, [activeSection, passportLive]);

  useEffect(() => {
    if (activeSection !== 'education') return;
    if (educationData) return;
    if (educationLoadingRef.current) return;

    let cancelled = false;
    const loadEducation = async () => {
      educationLoadingRef.current = true;
      setEducationLoading(true);
      setEducationError(null);
      try {
        const data = await fetchEducationData();
        if (cancelled) return;
        setEducationData(data);
        if (!data.sources.worldBank) {
          setEducationError('World Bank indicators unavailable — only PISA and ranking snapshots are shown.');
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[education live] failed:', err);
        setEducationError(err?.message || 'Failed to load live education data');
      } finally {
        educationLoadingRef.current = false;
        if (!cancelled) setEducationLoading(false);
      }
    };
    loadEducation();
    return () => { cancelled = true; };
  }, [activeSection, educationData]);

  const passportFallback: PassportLiveData = React.useMemo(() => {
    const passports: Record<string, PassportProfile> = {};
    Object.entries(passportStrengthByCountry).forEach(([internal, entry]) => {
      const iso2 = INTERNAL_KEY_TO_ISO2[internal];
      if (!iso2) return;
      passports[iso2] = {
        iso2, iso3: '', name: internal, flag: '', region: '', subregion: '',
        capital: '',
        totals: {
          visaFree: entry.visaFreeDestinations,
          visaOnArrival: 0, eVisa: 0, eta: 0, visaRequired: 0, noAdmission: 0,
          mobility: entry.visaFreeDestinations,
        },
        stay: { avgDays: 0, medianDays: 0, maxDays: 0,
          bucket0to29: 0, bucket30to89: 0, bucket90to179: 0, bucket180Plus: 0, unlimited: 0 },
        rank: entry.rank,
        avgAdvisory: null,
        destinations: [],
      };
    });
    return {
      passports,
      updatedAt: new Date().toISOString(),
      sources: {
        passportIndex: { ok: false },
        countries: { ok: false },
        travelAdvisory: { ok: false },
      },
    };
  }, []);

  const passportToRender: PassportLiveData = passportLive && Object.keys(passportLive.passports).length > 0
    ? passportLive
    : passportFallback;

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
          <ThemeToggle isDarkMode={isDarkMode} />
        </div>

        <StalenessBanner
          lastUpdated={QS_SNAPSHOT_DATE}
          label="QS World University Rankings 2026 snapshot"
          isDarkMode={isDarkMode}
        />

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
          <div id={slugify('Cultural capital key figures')} className="mb-8">
            <div className="flex justify-end mb-2">
              <SocialShareMenu title="Cultural capital key figures" isDarkMode={isDarkMode} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            { id: 'education', label: 'Education' },
            { id: 'passport', label: 'Passport Strength' },
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

            <div id={slugify('Global Heritage Map')} className={`rounded-xl overflow-hidden ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`px-4 py-3 border-b ${themeColors.border} flex items-start justify-between gap-2 flex-wrap`}>
                <div>
                  <h2 className="text-xl font-bold">Global Heritage Map</h2>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    UNESCO World Heritage Sites by country
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Global Heritage Map" isDarkMode={isDarkMode} />
                </div>
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

            <div id={slugify('Heritage by Region')} className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
                <h3 className="text-lg font-semibold">Heritage by Region</h3>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Heritage by Region" subject="dataset" isDarkMode={isDarkMode} />
                </div>
              </div>
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

        {/* Education Section */}
        {activeSection === 'education' && (
          <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-blue-500/50 text-blue-400' : 'bg-white border-blue-400 text-blue-700'
            }`}>
              <h3 className="font-semibold">Global Education Capital</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tertiary enrollment, literacy, education spending, graduates &amp; attainment, PISA outcomes,
                university rankings, research output, and teacher quality — joining live World Bank indicators
                with curated OECD PISA and QS World University Rankings snapshots.
              </p>
              {educationLoading && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Loading live indicators…
                </p>
              )}
              {educationError && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  {educationError}
                </p>
              )}
            </div>

            {educationData ? (
              <EducationDashboard
                isDarkMode={isDarkMode}
                educationData={educationData}
                selectedCountries={selectedCountries}
                onCountryChange={setSelectedCountries}
              />
            ) : (
              <div className={`p-8 rounded-xl border ${themeColors.cardBg} ${themeColors.border} text-center`}>
                <LoadingSpinner />
                <p className={`text-sm mt-4 ${themeColors.textSecondary}`}>
                  Fetching World Bank education indicators across {Object.keys(COUNTRY_NAMES).length} countries…
                </p>
              </div>
            )}

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Live sources:
                {' '}
                <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-blue-500">World Bank Indicators</a>
                {' · '}
                <a href="https://www.oecd.org/pisa/publications/" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-blue-500">OECD PISA</a>
                {' · '}
                <a href="https://www.topuniversities.com/world-university-rankings" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-blue-500">QS World University Rankings</a>
                . World Bank indicators (tertiary enrolment, literacy, spending, attainment, research output)
                are fetched live with 24h caching; the most recent non-null year per country is used because
                emerging-economy education series report infrequently. PISA is a triennial wave —
                {educationData?.pisaAsOf ? ` snapshot ${educationData.pisaAsOf}` : ' snapshot 2022'} (next wave: 2025 results).
                QS rankings reflect the
                {educationData?.rankingsAsOf ? ` ${educationData.rankingsAsOf}` : ' 2025-06-19'} 2026 edition.
                {educationData?.updatedAt && (
                  <>
                    {' '}Last refreshed: {new Date(educationData.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Passport Strength Section */}
        {activeSection === 'passport' && (
          <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-400 text-emerald-700'
            }`}>
              <h3 className="font-semibold">Global Passport &amp; Visa Intelligence</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Live mobility scores, per-destination visa types, length-of-stay limits, and travel advisories,
                sourced from the open Passport Index Dataset, the mledoze/countries dataset, and the Government of Canada&apos;s travel advice.
                Use the &quot;Visa Details&quot; tab to drill down into the exact technical rules for any
                passport–destination pair.
              </p>
              {passportLoading && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  Loading live data…
                </p>
              )}
              {passportError && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  {passportError}
                </p>
              )}
            </div>

            <div id={slugify('Passport Power World Map')} className={`rounded-xl overflow-hidden ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`px-4 py-3 border-b ${themeColors.border} flex items-start justify-between gap-2 flex-wrap`}>
                <div>
                  <h2 className="text-xl font-bold">Passport Power World Map</h2>
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    Switch metrics to visualize mobility, length of stay, eVisa exposure, or destination safety.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <SocialShareMenu title="Passport Power World Map" isDarkMode={isDarkMode} />
                </div>
              </div>
              <PassportStrengthMap
                isDarkMode={isDarkMode}
                passportData={passportToRender.passports}
              />
            </div>

            <PassportStrengthChart
              isDarkMode={isDarkMode}
              passportData={passportToRender.passports}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
              updatedAt={passportToRender.updatedAt}
              sources={passportToRender.sources}
            />

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Live sources:
                {' '}
                <a href="https://github.com/ilyankou/passport-index-dataset" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-emerald-500">Passport Index Dataset (Ilyankou, MIT)</a>
                {' · '}
                <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-emerald-500">mledoze/countries (ODbL)</a>
                {' · '}
                <a href="https://travel.gc.ca/travelling/advisories" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-emerald-500">Government of Canada travel advice (Open Government Licence – Canada)</a>
                . Mobility = visa-free + visa-on-arrival + ETA. Length-of-stay reflects the per-entry day limit
                published in the destination&apos;s policy; &quot;Unlimited / per visa&quot; applies to mobility
                blocs (e.g. Schengen, GCC) and bilateral free-movement agreements. Historical trend chart still
                uses Henley Passport Index figures because the open Passport Index source is point-in-time.
                {passportToRender.updatedAt && (
                  <>
                    {' '}Last refreshed: {new Date(passportToRender.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
                  </>
                )}
              </p>
            </div>
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
              <div id={slugify('Heritage Sites Comparison')} className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
                  <h3 className="text-lg font-semibold">Heritage Sites Comparison</h3>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <SocialShareMenu title="Heritage Sites Comparison" isDarkMode={isDarkMode} />
                  </div>
                </div>
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

              <div id={slugify('Creative Goods Exports ($B)')} className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
                  <h3 className="text-lg font-semibold">Creative Goods Exports ($B)</h3>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <SocialShareMenu title="Creative Goods Exports ($B)" isDarkMode={isDarkMode} />
                  </div>
                </div>
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
