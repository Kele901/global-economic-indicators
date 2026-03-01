'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';
import { fetchGlobalData } from '../services/worldbank';
import type { CountryData } from '../services/worldbank';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';
import AdSense from './AdSense';
import ChartDownloadButton from './ChartDownloadButton';
import BulkChartDownload from './BulkChartDownload';
import DataStatusIndicator from './DataStatusIndicator';
import LoadingSpinner from './LoadingSpinner';

const countryColors = {
  USA: "#8884d8", Canada: "#82ca9d", France: "#ffc658", Germany: "#ff8042", Italy: "#a4de6c", 
  Japan: "#d0ed57", UK: "#83a6ed", Australia: "#ff7300", Mexico: "#e60049", SouthKorea: "#0bb4ff", 
  Spain: "#50e991", Sweden: "#e6d800", Switzerland: "#9b19f5", Turkey: "#dc0ab4", Nigeria: "#00bfa0",
  China: "#b3d4ff", Russia: "#fd7f6f", Brazil: "#7eb0d5", Chile: "#b2e061", Argentina: "#bd7ebe",
  India: "#ff9ff3", Norway: "#45aaf2", Netherlands: "#ff6b35", Portugal: "#004e89", Belgium: "#f7b801",
  Indonesia: "#06a77d", SouthAfrica: "#d62246", Poland: "#c1292e", SaudiArabia: "#006c35", Egypt: "#c09000"
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
  Norway: NO,
  Netherlands: NL,
  Portugal: PT,
  Belgium: BE,
  Indonesia: ID,
  SouthAfrica: ZA,
  Poland: PL,
  SaudiArabia: SA,
  Egypt: EG
};

// Custom Tooltip Component to prevent duplicates
const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    // Remove duplicates by creating a Map with country name as key
    const uniqueData = new Map();
    payload.forEach((entry: any) => {
      if (entry.value !== null && entry.value !== undefined) {
        uniqueData.set(entry.dataKey, {
          name: entry.dataKey,
          value: entry.value,
          color: entry.color
        });
      }
    });

    return (
      <div 
        className="custom-tooltip"
        style={{
          backgroundColor: isDarkMode ? '#333' : '#fff',
          border: isDarkMode ? '1px solid #555' : '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          fontSize: '12px',
          color: isDarkMode ? '#fff' : '#000'
        }}
      >
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
        {Array.from(uniqueData.values()).map((entry: any) => (
          <p 
            key={entry.name}
            style={{ 
              margin: '2px 0',
              color: entry.color
            }}
          >
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

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

const PopulationGrowthSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
          <p className="text-xs sm:text-sm">
        Population growth rate shows the annual percentage change in a country&apos;s total population. This metric reflects demographic trends, 
        labor force availability, and long-term economic potential. Higher growth rates can indicate expanding markets and labor pools, 
        while lower rates may suggest aging populations and potential labor shortages.
      </p>
  </div>
);

const FDISummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Foreign Direct Investment (FDI) represents international capital flows into a country, measured as a percentage of GDP. 
      FDI indicates investor confidence, economic openness, and potential for technology transfer and job creation. 
      Higher FDI levels often correlate with economic growth and international integration.
    </p>
  </div>
);

const TradeBalanceSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Trade balance shows the difference between a country&apos;s exports and imports as a percentage of GDP. 
      Positive values indicate trade surpluses (exports &gt; imports), while negative values show trade deficits. 
      This metric reflects economic competitiveness, currency strength, and global market position.
    </p>
  </div>
);

const GovernmentSpendingSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Government spending represents total public expenditure as a percentage of GDP. This includes infrastructure, 
      social services, defense, and other public investments. Higher spending can stimulate economic activity 
      but may also indicate fiscal expansion and potential debt concerns.
    </p>
  </div>
);

const LaborProductivitySummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Labor productivity measures economic output per hour worked, indicating efficiency and technological advancement. 
      Higher productivity suggests better resource utilization, innovation, and competitive advantages. 
      This metric is crucial for understanding long-term economic growth potential.
    </p>
  </div>
);

const GiniCoefficientSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      The Gini coefficient measures income inequality on a scale from 0 (perfect equality) to 1 (perfect inequality). 
      Lower values indicate more equal income distribution, while higher values suggest greater inequality. 
      This metric helps assess social stability and economic inclusiveness.
    </p>
    <div className={`mt-2 p-2 rounded ${isDarkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'}`}>
      <p className="text-xs">
        <strong>Data Sources:</strong> Income inequality data combines World Bank statistics, OECD reports, 
        and academic research to provide comprehensive coverage across all countries.
      </p>
    </div>
  </div>
);

const RDSpendingSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Research and Development spending as a percentage of GDP indicates a country&apos;s commitment to innovation and 
      technological advancement. Higher R&D investment often correlates with future economic competitiveness, 
      productivity gains, and long-term growth potential.
    </p>
  </div>
);

const EnergyConsumptionSummary = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`p-3 sm:p-4 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
    <p className="text-xs sm:text-sm">
      Energy consumption per capita reflects economic activity levels, industrialization, and living standards. 
      Higher consumption often indicates more developed economies, though efficiency improvements can reduce 
      this correlation. This metric helps assess economic development and sustainability challenges.
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
      'Population Growth': data.populationGrowth.find(d => d.year === year)?.[country] || null,
      'FDI': data.fdi.find(d => d.year === year)?.[country] || null,
      'Trade Balance': data.tradeBalance.find(d => d.year === year)?.[country] || null,
      'Govt Spending': data.governmentSpending.find(d => d.year === year)?.[country] || null,
      'Labor Productivity': data.laborProductivity.find(d => d.year === year)?.[country] || null,
      'Gini Coefficient': data.giniCoefficient.find(d => d.year === year)?.[country] || null,
      'R&D Spending': data.rdSpending.find(d => d.year === year)?.[country] || null,
      'Energy Consumption': data.energyConsumption.find(d => d.year === year)?.[country] || null,
    };
  }).filter(d => 
    d['Interest Rate'] !== null || 
    d['Employment'] !== null || 
    d['Unemployment'] !== null || 
    d['Govt Debt'] !== null || 
    d['Inflation'] !== null || 
    d['GDP Growth'] !== null ||
    d['Population Growth'] !== null ||
    d['FDI'] !== null ||
    d['Trade Balance'] !== null ||
    d['Govt Spending'] !== null ||
    d['Labor Productivity'] !== null ||
    d['Gini Coefficient'] !== null ||
    d['R&D Spending'] !== null ||
    d['Energy Consumption'] !== null
  );

  // Calculate metrics as before
  const calculateMetrics = (dataset: CountryData[], countryKey: string) => {
    const countryData = dataset
      .filter(d => d[countryKey] !== 0)
      .map(d => ({ year: d.year, value: Number(d[countryKey]) || 0 }));
    
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
    cpi: calculateMetrics(data.cpiData, country),
    population: calculateMetrics(data.populationGrowth, country),
    fdi: calculateMetrics(data.fdi, country),
    trade: calculateMetrics(data.tradeBalance, country),
    spending: calculateMetrics(data.governmentSpending, country),
    productivity: calculateMetrics(data.laborProductivity, country),
    gini: calculateMetrics(data.giniCoefficient, country),
    rd: calculateMetrics(data.rdSpending, country),
    energy: calculateMetrics(data.energyConsumption, country)
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
    'GDP Growth': '#83a6ed',
    'Population Growth': '#ff6b6b',
    'FDI': '#4ecdc4',
    'Trade Balance': '#45b7d1',
    'Govt Spending': '#96ceb4',
    'Labor Productivity': '#feca57',
    'Gini Coefficient': '#ff9ff3',
    'R&D Spending': '#54a0ff',
    'Energy Consumption': '#5f27cd'
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
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
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
        <p>
          <strong>Population Growth:</strong> Currently at {metrics.population.recent.toFixed(2)}% 
          {getTrendEmoji(metrics.population.trend)} (Historical avg: {metrics.population.avg.toFixed(2)}%)
        </p>
        <p>
          <strong>Foreign Direct Investment:</strong> Currently at {metrics.fdi.recent.toFixed(2)}% of GDP 
          {getTrendEmoji(metrics.fdi.trend)} (Historical avg: {metrics.fdi.avg.toFixed(2)}%)
        </p>
        <p>
          <strong>Trade Balance:</strong> Currently at {metrics.trade.recent.toFixed(2)}% of GDP 
          {getTrendEmoji(metrics.trade.trend)} (Historical avg: {metrics.trade.avg.toFixed(2)}%)
        </p>
        <p>
          <strong>Government Spending:</strong> Currently at {metrics.spending.recent.toFixed(1)}% of GDP 
          {getTrendEmoji(metrics.spending.trend)} (Historical avg: {metrics.spending.avg.toFixed(1)}%)
        </p>
        <p>
          <strong>Labor Productivity:</strong> Currently at {metrics.productivity.recent.toFixed(0)} 
          {getTrendEmoji(metrics.productivity.trend)} (Historical avg: {metrics.productivity.avg.toFixed(0)})
        </p>
        <p>
          <strong>Income Inequality (Gini):</strong> Currently at {metrics.gini.recent.toFixed(3)} 
          {getTrendEmoji(metrics.gini.trend)} (Historical avg: {metrics.gini.avg.toFixed(3)})
        </p>
        <p>
          <strong>R&D Spending:</strong> Currently at {metrics.rd.recent.toFixed(2)}% of GDP 
          {getTrendEmoji(metrics.rd.trend)} (Historical avg: {metrics.rd.avg.toFixed(2)}%)
        </p>
        <p>
          <strong>Energy Consumption:</strong> Currently at {metrics.energy.recent.toFixed(0)} kWh per capita 
          {getTrendEmoji(metrics.energy.trend)} (Historical avg: {metrics.energy.avg.toFixed(0)} kWh)
        </p>

        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-md ${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
          <p className="text-xs sm:text-sm">
            <strong>Economic Overview:</strong> {country}&apos;s economy shows {' '}
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
  const [selectedMetric, setSelectedMetric] = useLocalStorage<'interest' | 'employment' | 'unemployment' | 'debt' | 'inflation' | 'gdp' | 'cpi' | 'population' | 'fdi' | 'trade' | 'spending' | 'productivity' | 'gini' | 'rd' | 'energy' | 'gdpPerCapita' | 'currentAccount' | 'capitalFormation' | 'reserves' | 'exchangeRate' | 'poverty' | 'education' | 'taxRevenue' | 'credit' | 'exports' | 'imports' | 'lifeExpectancy' | 'urbanization' | 'hightech' | 'co2' | 'migration' | 'laborForce' | 'budget' | 'healthcare' | 'eduExpenditure' | 'internet' | 'youthUnemployment' | 'manufacturing' | 'household' | 'renewable' | 'femaleLaborForce' | 'military' | 'marketCap' | 'sciPublications' | 'ictExports' | 'mobile' | 'patents' | 'socialSpending' | 'debtService' | 'services' | 'agriculture' | 'tradeOpen' | 'tariffs' | 'tourism' | 'privateInvest' | 'newBusiness' | 'all'>('selectedMetric', 'all');
  
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
  }>({
    interestRates: [],
    employmentRates: [],
    unemploymentRates: [],
    governmentDebt: [],
    inflationRates: [],
    gdpGrowth: [],
    cpiData: [],
    populationGrowth: [],
    fdi: [],
    tradeBalance: [],
    governmentSpending: [],
    laborProductivity: [],
    giniCoefficient: [],
    rdSpending: [],
    energyConsumption: [],
    gdpPerCapitaPPP: [],
    currentAccount: [],
    grossCapitalFormation: [],
    reservesMonthsImports: [],
    exchangeRate: [],
    povertyRate: [],
    tertiaryEnrollment: [],
    taxRevenue: [],
    domesticCredit: [],
    exports: [],
    imports: [],
    lifeExpectancy: [],
    urbanPopulation: [],
    hightechExports: [],
    co2Emissions: [],
    netMigration: [],
    laborForceParticipation: [],
    budgetBalance: [],
    healthcareExpenditure: [],
    educationExpenditure: [],
    internetUsers: [],
    youthUnemployment: [],
    manufacturingValueAdded: [],
    householdConsumption: [],
    renewableEnergy: [],
    femaleLaborForce: [],
    militaryExpenditure: [],
    marketCapitalization: [],
    scientificPublications: [],
    ictExports: [],
    mobileSubscriptions: [],
    patentApplications: [],
    socialSpending: [],
    publicDebtService: [],
    servicesValueAdded: [],
    agriculturalValueAdded: [],
    tradeOpenness: [],
    tariffRate: [],
    tourismReceipts: [],
    privateInvestment: [],
    newBusinessDensity: []
  });
  const [selectedCountryForSummary, setSelectedCountryForSummary] = useState<string>('');

  // Data fetching function
  const loadData = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchGlobalData(forceRefresh);
      
      // Debug: Check what countries we have data for
      console.log('Available countries in interest rates:', 
        result.interestRates[0] ? Object.keys(result.interestRates[0]).filter(k => k !== 'year') : []
      );
      console.log('Selected countries:', selectedCountries);
      
      setData(result);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
    
    // Debug: Check selectedCountries on mount
    console.log('=== DEBUG INFO ===');
    console.log('Selected countries from localStorage:', selectedCountries);
    console.log('Available country names:', Object.keys(countryColors));
    console.log('USA is selected:', selectedCountries.includes('USA'));
    console.log('==================');
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
    const referenceYear = 2024; // Set fixed reference year to 2024
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

  const formatYAxisTick = (value: number): string => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(0)}K`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
  };

  // Create a reusable chart component with different styles for different metrics
  const Chart = ({ 
    title, 
    data, 
    yDomain, 
    subtitle,
    summary: SummaryComponent,
    chartType = 'line'
  }: { 
    title: string;
    data: CountryData[];
    yDomain: [number, number];
    subtitle: string;
    summary?: React.ComponentType<{ isDarkMode: boolean }>;
    chartType?: 'line' | 'area' | 'bar' | 'composed';
  }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const renderChart = () => {
      const commonProps = {
        data: filterData(selectedPeriod, data),
        margin: { top: 5, right: 15, left: 5, bottom: 5 }
      };

      if (chartType === 'area') {
        return (
          <AreaChart {...commonProps}>
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
              width={55}
              tickFormatter={formatYAxisTick}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend 
              wrapperStyle={{ fontSize: '10px', marginTop: '8px' }}
            />
            {selectedCountries.map(country => (
              <Area
                key={country}
                type="monotone"
                dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                fill={countryColors[country as keyof typeof countryColors]}
                fillOpacity={0.3}
                activeDot={isGridView ? false : { r: 4 }}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      }

      if (chartType === 'bar') {
        return (
          <BarChart {...commonProps}>
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
              width={55}
              tickFormatter={formatYAxisTick}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend 
              wrapperStyle={{ fontSize: '10px', marginTop: '8px' }}
            />
            {selectedCountries.map(country => (
              <Bar
                key={country}
                dataKey={country}
                fill={countryColors[country as keyof typeof countryColors]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        );
      }

      if (chartType === 'composed') {
        return (
          <ComposedChart {...commonProps}>
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
              width={55}
              tickFormatter={formatYAxisTick}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend 
              wrapperStyle={{ fontSize: '10px', marginTop: '8px' }}
            />
            {selectedCountries.map(country => (
              <Area
                key={country}
                type="monotone"
                dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                fill={countryColors[country as keyof typeof countryColors]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            {selectedCountries.map(country => (
              <Line
                key={`${country}-line`}
                type="monotone"
                dataKey={country}
                stroke={countryColors[country as keyof typeof countryColors]}
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </ComposedChart>
        );
      }

      // Default line chart with enhanced styling
      return (
        <LineChart {...commonProps}>
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
            width={55}
            tickFormatter={formatYAxisTick}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
          <Legend 
            wrapperStyle={{ fontSize: '10px', marginTop: '8px' }}
          />
          {selectedCountries.map(country => (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              stroke={countryColors[country as keyof typeof countryColors]}
              activeDot={isGridView ? false : { r: 4 }}
              dot={isGridView ? false : { r: 2 }}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </LineChart>
      );
    };

    return (
      <div 
        ref={chartRef}
        data-chart-container
        data-chart-title={title}
        className={`mb-6 sm:mb-8 ${isGridView ? 'h-[350px] sm:h-[400px] md:h-[500px]' : ''}`}
      >
        <div className="flex justify-between items-start mb-2 sm:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">{title}</h2>
          <ChartDownloadButton
            chartElement={chartRef.current}
            chartData={{
              title,
              data: filterData(selectedPeriod, data),
              type: chartType,
              countries: selectedCountries
            }}
            variant="outline"
            size="sm"
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
          {subtitle}
        </div>
         {!isGridView && SummaryComponent && <SummaryComponent isDarkMode={isDarkMode} />}
        <div className={`${isGridView ? 'h-[200px] sm:h-[250px] md:h-[350px]' : 'h-[250px] sm:h-[300px] md:h-[400px]'} w-full`}>
          <ResponsiveContainer>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Global Economic Indicators</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Comprehensive economic data for 30+ countries across 50+ indicators
        </p>
        
        {/* Static intro content visible during loading */}
        <div className="rounded-lg p-4 sm:p-6 mb-6 bg-blue-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3">Explore Global Economic Data</h2>
          <p className="text-sm mb-4">
            Our dashboard provides access to key economic indicators including interest rates, GDP growth, 
            inflation, unemployment, trade balances, and many more metrics. Data is sourced from the 
            World Bank, IMF, OECD, and Federal Reserve.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded bg-white dark:bg-gray-700">
              <span className="font-semibold">30+</span> Countries
            </div>
            <div className="p-2 rounded bg-white dark:bg-gray-700">
              <span className="font-semibold">50+</span> Indicators
            </div>
            <div className="p-2 rounded bg-white dark:bg-gray-700">
              <span className="font-semibold">60+</span> Years of Data
            </div>
            <div className="p-2 rounded bg-white dark:bg-gray-700">
              <span className="font-semibold">5</span> Data Sources
            </div>
          </div>
        </div>
        
        <LoadingSpinner 
          message="Loading Economic Indicators"
          subtitle="Fetching the latest data from World Bank, IMF, OECD, and other trusted sources..."
        />
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
            <BulkChartDownload variant="primary" size="sm" />
            <span className="text-xs sm:text-sm">Light</span>
            <button
              className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white transform transition-transform ${isDarkMode ? 'translate-x-5 sm:translate-x-6' : ''}`} />
            </button>
            <span className="text-xs sm:text-sm">Dark</span>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-300">
            Powered by World Bank Economic Data
          </p>
          <DataStatusIndicator 
            isDarkMode={isDarkMode} 
            onRefresh={() => loadData(true)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-300">
            Available data ranges: Interest Rates (1960-2024), Employment & Unemployment (1990-2024), Government Debt (1989-2023), 
            Population Growth (1960-2024), FDI & Trade (1960-2024), Government Spending (1960-2023), Labor Productivity (1990-2024), 
            Income Inequality (1960-2023), R&D Spending (1996-2023), Energy Consumption (1960-2023), GDP per Capita (1990-2024),
            Current Account & Reserves (1960-2024), Education & Life Expectancy (1970-2024), Tax Revenue & Credit (1990-2024),
            CO2 Emissions (1960-2024), Trade Flows & High-tech (1960-2024), Urbanization & Migration (1960-2024)
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
                <h3 className="font-medium mb-1 sm:mb-2 text-sm">Available Metrics (58 Indicators):</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                    <li>Interest & Inflation Rates</li>
                    <li>Employment Statistics</li>
                    <li>GDP Growth & Per Capita</li>
                    <li>Government Debt & Tax Revenue</li>
                    <li>Population & Migration</li>
                    <li>Foreign Direct Investment</li>
                    <li>Trade Balance & Flows</li>
                    <li>Government Spending</li>
                    <li>Labor Productivity</li>
                    <li>Income Inequality</li>
                    <li>R&D Investment</li>
                    <li>Energy & CO2 Emissions</li>
                  </ul>
                  <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
                    <li>Current Account Balance</li>
                    <li>Capital Formation</li>
                    <li>Reserves & Exchange Rates</li>
                    <li>Poverty Rates</li>
                    <li>Education Enrollment</li>
                    <li>Domestic Credit</li>
                    <li>Export & Import Analysis</li>
                    <li>Life Expectancy</li>
                    <li>Urbanization Trends</li>
                    <li>High-tech Exports</li>
                    <li>Net Migration Patterns</li>
                    <li>Consumer Price Index</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm italic">
              Updated regularly with the latest World Bank economic data releases. Most indicators include data through 2024, 
              while some specialized metrics (Government Debt, Government Spending, Income Inequality, R&D, Energy) are available through 2023.
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
            aria-label="Select time period"
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
            aria-label="Select economic metric"
          >
            <option value="all">All Metrics (58 Indicators)</option>
            <optgroup label="Core Economic Indicators">
              <option value="interest">Interest Rates</option>
              <option value="inflation">Inflation Rates</option>
              <option value="gdp">GDP Growth</option>
              <option value="gdpPerCapita">GDP per Capita (PPP)</option>
              <option value="cpi">Consumer Price Index</option>
            </optgroup>
            <optgroup label="Employment & Labor">
              <option value="employment">Employment Rates</option>
              <option value="unemployment">Unemployment Rates</option>
              <option value="productivity">Labor Productivity</option>
              <option value="laborForce">Labor Force Participation</option>
              <option value="youthUnemployment">Youth Unemployment</option>
              <option value="femaleLaborForce">Female Labor Force Participation</option>
            </optgroup>
            <optgroup label="Government & Fiscal">
              <option value="debt">Government Debt</option>
              <option value="spending">Government Spending</option>
              <option value="taxRevenue">Tax Revenue</option>
              <option value="budget">Budget Balance</option>
              <option value="healthcare">Healthcare Expenditure</option>
              <option value="eduExpenditure">Education Expenditure</option>
              <option value="military">Military Expenditure</option>
              <option value="debtService">Public Debt Service</option>
              <option value="socialSpending">Social Spending</option>
            </optgroup>
            <optgroup label="International Trade & Investment">
              <option value="fdi">Foreign Direct Investment</option>
              <option value="trade">Trade Balance</option>
              <option value="exports">Exports</option>
              <option value="imports">Imports</option>
              <option value="currentAccount">Current Account Balance</option>
              <option value="hightech">High-tech Exports</option>
              <option value="manufacturing">Manufacturing Value Added</option>
              <option value="ictExports">ICT Exports</option>
              <option value="tradeOpen">Trade Openness</option>
              <option value="tariffs">Tariff Rate</option>
              <option value="tourism">Tourism Receipts</option>
            </optgroup>
            <optgroup label="Financial & Monetary">
              <option value="credit">Domestic Credit</option>
              <option value="reserves">Foreign Reserves</option>
              <option value="exchangeRate">Exchange Rates</option>
              <option value="capitalFormation">Capital Formation</option>
              <option value="household">Household Consumption</option>
              <option value="marketCap">Market Capitalization</option>
              <option value="privateInvest">Private Investment</option>
            </optgroup>
            <optgroup label="Social & Development">
              <option value="population">Population Growth</option>
              <option value="migration">Net Migration</option>
              <option value="gini">Income Inequality (Gini)</option>
              <option value="poverty">Poverty Rate</option>
              <option value="lifeExpectancy">Life Expectancy</option>
              <option value="education">Tertiary Education</option>
              <option value="urbanization">Urbanization</option>
              <option value="internet">Internet Users</option>
              <option value="mobile">Mobile Subscriptions</option>
            </optgroup>
            <optgroup label="Innovation & Environment">
              <option value="rd">R&D Spending</option>
              <option value="energy">Energy Consumption</option>
              <option value="co2">CO2 Emissions</option>
              <option value="renewable">Renewable Energy</option>
              <option value="sciPublications">Scientific Publications</option>
              <option value="patents">Patent Applications</option>
            </optgroup>
            <optgroup label="Economic Structure">
              <option value="services">Services Value Added</option>
              <option value="agriculture">Agricultural Value Added</option>
              <option value="newBusiness">New Business Density</option>
            </optgroup>
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
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm sm:text-base font-medium ${
              isDarkMode ? 'text-gray-100' : 'text-gray-700'
            }`}>
              Select Countries to Display:
            </h3>
            <button
              onClick={() => {
                const defaultCountries = Object.keys(countryColors).slice(0, 9);
                setSelectedCountries(defaultCountries);
                console.log('Reset to default countries:', defaultCountries);
              }}
              className={`text-xs px-2 py-1 rounded ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Reset Defaults
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredCountries.map(country => {
              return (
                <div 
                  key={country} 
                  className={`flex items-center space-x-2 p-2 rounded border transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-white border-gray-200 hover:bg-gray-100'
                  }`}
                >
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
                  <label 
                    htmlFor={country} 
                    className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'} text-xs sm:text-sm truncate cursor-pointer transition-colors duration-200`}
                  >
                    {country}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {selectedCountryForSummary && (
          <>
            <CountryEconomicSummary
              country={selectedCountryForSummary}
              data={data}
              isDarkMode={isDarkMode}
            />
            {/* Middle Ad Placement - only show when data is loaded */}
            <div className="my-8">
              <AdSense show={!loading && data.interestRates.length > 0} />
            </div>
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
            chartType="line"
          />
        )}

        {(selectedMetric === 'employment' || selectedMetric === 'all') && (
          <Chart
            title="Employment Rates (%)"
            data={data.employmentRates}
            yDomain={[40, 80]}
            subtitle="Vertical axis shows percentage of working-age population employed, where 60 = 60% of population is employed"
            summary={EmploymentSummary}
            chartType="composed"
          />
        )}

        {(selectedMetric === 'unemployment' || selectedMetric === 'all') && (
          <Chart
            title="Unemployment Rates (%)"
            data={data.unemploymentRates}
            yDomain={[0, 30]}
            subtitle="Vertical axis shows percentage of labor force unemployed, where 10 = 10% of labor force is seeking work"
            summary={UnemploymentSummary}
            chartType="line"
          />
        )}

        {(selectedMetric === 'debt' || selectedMetric === 'all') && (
          <Chart
            title="Central Government Debt (% of GDP)"
            data={data.governmentDebt}
            yDomain={[0, 250]}
            subtitle="Vertical axis shows debt as a percentage of GDP, where 100 = debt equals one year's GDP"
            summary={DebtSummary}
            chartType="area"
          />
        )}

        {(selectedMetric === 'inflation' || selectedMetric === 'all') && (
          <Chart
            title="Inflation Rates (%)"
            data={data.inflationRates}
            yDomain={[0, 25]}
            subtitle="Vertical axis shows annual percentage change in consumer prices, where 5 = 5% price increase per year"
            summary={InflationSummary}
            chartType="line"
          />
        )}

        {(selectedMetric === 'gdp' || selectedMetric === 'all') && (
          <Chart
            title="GDP Growth (%)"
            data={data.gdpGrowth}
            yDomain={[-10, 15]}
            subtitle="Vertical axis shows annual GDP growth as a percentage, where 3 = 3% growth in economic output"
            summary={GDPGrowthSummary}
            chartType="composed"
          />
        )}

        {(selectedMetric === 'cpi' || selectedMetric === 'all') && (
          <Chart
            title="Consumer Price Index"
            data={data.cpiData}
            yDomain={[0, 200]}
            subtitle="Base year 2010 = 100. Values above 100 indicate price increases since 2010, below 100 indicate decreases."
            summary={CPISummary}
            chartType="line"
          />
        )}

        {(selectedMetric === 'population' || selectedMetric === 'all') && (
          <Chart
            title="Population Growth Rate (%)"
            data={data.populationGrowth}
            yDomain={[-2, 5]}
            subtitle="Annual percentage change in total population. Positive values indicate growth, negative values indicate decline."
            summary={PopulationGrowthSummary}
            chartType="composed"
          />
        )}

        {(selectedMetric === 'fdi' || selectedMetric === 'all') && (
          <Chart
            title="Foreign Direct Investment (% of GDP)"
            data={data.fdi}
            yDomain={[-5, 15]}
            subtitle="FDI inflows as a percentage of GDP. Higher values indicate greater international investment confidence."
            summary={FDISummary}
            chartType="area"
          />
        )}

        {(selectedMetric === 'trade' || selectedMetric === 'all') && (
          <Chart
            title="Trade Balance (% of GDP)"
            data={data.tradeBalance}
            yDomain={[-15, 15]}
            subtitle="Trade surplus (positive) or deficit (negative) as a percentage of GDP."
            summary={TradeBalanceSummary}
            chartType="composed"
          />
        )}

        {(selectedMetric === 'spending' || selectedMetric === 'all') && (
          <Chart
            title="Government Spending (% of GDP)"
            data={data.governmentSpending}
            yDomain={[0, 60]}
            subtitle="Total government expenditure as a percentage of GDP, including all public sector spending."
            summary={GovernmentSpendingSummary}
            chartType="area"
          />
        )}

        {(selectedMetric === 'productivity' || selectedMetric === 'all') && (
          <Chart
            title="Labor Productivity (Output per Hour)"
            data={data.laborProductivity}
            yDomain={[0, 100]}
            subtitle="Economic output per hour worked, indicating efficiency and technological advancement."
            summary={LaborProductivitySummary}
            chartType="bar"
          />
        )}

        {(selectedMetric === 'gini' || selectedMetric === 'all') && (
          <Chart
            title="Income Inequality (Gini Coefficient)"
            data={data.giniCoefficient}
            yDomain={[0, 1]}
            subtitle="Income distribution measure: 0 = perfect equality, 1 = perfect inequality."
            summary={GiniCoefficientSummary}
            chartType="line"
          />
        )}

        {(selectedMetric === 'rd' || selectedMetric === 'all') && (
          <Chart
            title="Research & Development Spending (% of GDP)"
            data={data.rdSpending}
            yDomain={[0, 5]}
            subtitle="R&D investment as a percentage of GDP, indicating innovation commitment and future competitiveness."
            summary={RDSpendingSummary}
            chartType="area"
          />
        )}

        {(selectedMetric === 'energy' || selectedMetric === 'all') && (
          <Chart
            title="Energy Consumption per Capita (kWh)"
            data={data.energyConsumption}
            yDomain={[0, 20000]}
            subtitle="Annual energy consumption per person, reflecting economic activity and living standards."
            summary={EnergyConsumptionSummary}
            chartType="bar"
          />
        )}

        {(selectedMetric === 'gdpPerCapita' || selectedMetric === 'all') && (
          <Chart
            title="GDP per Capita (PPP, current international $)"
            data={data.gdpPerCapitaPPP}
            yDomain={[0, 100000]}
            subtitle="GDP per person adjusted for purchasing power parity, showing standard of living across countries."
            chartType="area"
          />
        )}

        {(selectedMetric === 'currentAccount' || selectedMetric === 'all') && (
          <Chart
            title="Current Account Balance (% of GDP)"
            data={data.currentAccount}
            yDomain={[-20, 20]}
            subtitle="Current account surplus (positive) or deficit (negative), indicating external balance."
            chartType="composed"
          />
        )}

        {(selectedMetric === 'capitalFormation' || selectedMetric === 'all') && (
          <Chart
            title="Gross Capital Formation (% of GDP)"
            data={data.grossCapitalFormation}
            yDomain={[0, 60]}
            subtitle="Investment in fixed assets and inventory changes, indicating future economic capacity."
            chartType="area"
          />
        )}

        {(selectedMetric === 'reserves' || selectedMetric === 'all') && (
          <Chart
            title="Total Reserves (Months of Imports)"
            data={data.reservesMonthsImports}
            yDomain={[0, 30]}
            subtitle="Foreign reserves measured in months of import coverage, indicating economic resilience."
            chartType="line"
          />
        )}

        {(selectedMetric === 'exchangeRate' || selectedMetric === 'all') && (
          <Chart
            title="Exchange Rate (LCU per USD)"
            data={data.exchangeRate}
            yDomain={[0, 100]}
            subtitle="Official exchange rate of local currency units per US dollar, showing currency strength."
            chartType="line"
          />
        )}

        {(selectedMetric === 'poverty' || selectedMetric === 'all') && (
          <Chart
            title="Poverty Rate (% below $2.15/day, 2017 PPP)"
            data={data.povertyRate}
            yDomain={[0, 100]}
            subtitle="Percentage of population living below international poverty line."
            chartType="bar"
          />
        )}

        {(selectedMetric === 'education' || selectedMetric === 'all') && (
          <Chart
            title="Tertiary Education Enrollment (% gross)"
            data={data.tertiaryEnrollment}
            yDomain={[0, 120]}
            subtitle="University/college enrollment rate, indicating human capital development."
            chartType="area"
          />
        )}

        {(selectedMetric === 'taxRevenue' || selectedMetric === 'all') && (
          <Chart
            title="Tax Revenue (% of GDP)"
            data={data.taxRevenue}
            yDomain={[0, 50]}
            subtitle="Government tax revenue as percentage of GDP, showing fiscal capacity."
            chartType="bar"
          />
        )}

        {(selectedMetric === 'credit' || selectedMetric === 'all') && (
          <Chart
            title="Domestic Credit to Private Sector (% of GDP)"
            data={data.domesticCredit}
            yDomain={[0, 250]}
            subtitle="Private sector credit as percentage of GDP, indicating financial sector development."
            chartType="line"
          />
        )}

        {(selectedMetric === 'exports' || selectedMetric === 'all') && (
          <Chart
            title="Exports of Goods & Services (% of GDP)"
            data={data.exports}
            yDomain={[0, 120]}
            subtitle="Total exports as percentage of GDP, showing trade openness and competitiveness."
            chartType="area"
          />
        )}

        {(selectedMetric === 'imports' || selectedMetric === 'all') && (
          <Chart
            title="Imports of Goods & Services (% of GDP)"
            data={data.imports}
            yDomain={[0, 120]}
            subtitle="Total imports as percentage of GDP, reflecting domestic consumption and investment."
            chartType="area"
          />
        )}

        {(selectedMetric === 'lifeExpectancy' || selectedMetric === 'all') && (
          <Chart
            title="Life Expectancy at Birth (years)"
            data={data.lifeExpectancy}
            yDomain={[40, 90]}
            subtitle="Average lifespan in years, a key indicator of health and development."
            chartType="line"
          />
        )}

        {(selectedMetric === 'urbanization' || selectedMetric === 'all') && (
          <Chart
            title="Urban Population (% of total)"
            data={data.urbanPopulation}
            yDomain={[0, 100]}
            subtitle="Percentage of population living in urban areas, reflecting development patterns."
            chartType="area"
          />
        )}

        {(selectedMetric === 'hightech' || selectedMetric === 'all') && (
          <Chart
            title="High-technology Exports (% of manufactured exports)"
            data={data.hightechExports}
            yDomain={[0, 60]}
            subtitle="High-tech products as share of manufactured exports, indicating technological sophistication."
            chartType="bar"
          />
        )}

        {(selectedMetric === 'co2' || selectedMetric === 'all') && (
          <Chart
            title="CO2 Emissions (metric tons per capita)"
            data={data.co2Emissions}
            yDomain={[0, 25]}
            subtitle="Carbon dioxide emissions per person, reflecting environmental impact and energy use."
            chartType="area"
          />
        )}

        {(selectedMetric === 'migration' || selectedMetric === 'all') && (
          <Chart
            title="Net Migration"
            data={data.netMigration}
            yDomain={[-500000, 1500000]}
            subtitle="Net number of migrants entering (positive) or leaving (negative) the country."
            chartType="composed"
          />
        )}

        {(selectedMetric === 'laborForce' || selectedMetric === 'all') && (
          <Chart
            title="Labor Force Participation Rate"
            data={data.laborForceParticipation}
            yDomain={[30, 90]}
            subtitle="Percentage of the working-age population (15+) that is economically active."
            chartType="line"
          />
        )}

        {(selectedMetric === 'budget' || selectedMetric === 'all') && (
          <Chart
            title="Budget Balance (Fiscal Surplus/Deficit)"
            data={data.budgetBalance}
            yDomain={[-20, 10]}
            subtitle="Government cash surplus or deficit as a percentage of GDP (positive values indicate surplus, negative indicate deficit)."
            chartType="composed"
          />
        )}

        {(selectedMetric === 'healthcare' || selectedMetric === 'all') && (
          <Chart
            title="Healthcare Expenditure"
            data={data.healthcareExpenditure}
            yDomain={[0, 20]}
            subtitle="Current health expenditure as a percentage of GDP, indicating investment in public health."
            chartType="area"
          />
        )}

        {(selectedMetric === 'eduExpenditure' || selectedMetric === 'all') && (
          <Chart
            title="Education Expenditure"
            data={data.educationExpenditure}
            yDomain={[0, 10]}
            subtitle="Government expenditure on education as a percentage of GDP, reflecting investment in human capital."
            chartType="area"
          />
        )}

        {(selectedMetric === 'internet' || selectedMetric === 'all') && (
          <Chart
            title="Internet Users"
            data={data.internetUsers}
            yDomain={[0, 100]}
            subtitle="Percentage of population with internet access, indicating digital connectivity and technological advancement."
            chartType="line"
          />
        )}

        {(selectedMetric === 'youthUnemployment' || selectedMetric === 'all') && (
          <Chart
            title="Youth Unemployment Rate"
            data={data.youthUnemployment}
            yDomain={[0, 60]}
            subtitle="Unemployment rate among youth aged 15-24, a key indicator of labor market health and future economic prospects."
            chartType="line"
          />
        )}

        {(selectedMetric === 'manufacturing' || selectedMetric === 'all') && (
          <Chart
            title="Manufacturing Value Added"
            data={data.manufacturingValueAdded}
            yDomain={[0, 40]}
            subtitle="Manufacturing sector's contribution to GDP as a percentage, indicating industrial capacity."
            chartType="area"
          />
        )}

        {(selectedMetric === 'household' || selectedMetric === 'all') && (
          <Chart
            title="Household Consumption"
            data={data.householdConsumption}
            yDomain={[30, 90]}
            subtitle="Household final consumption expenditure as a percentage of GDP, reflecting consumer spending patterns."
            chartType="area"
          />
        )}

        {(selectedMetric === 'renewable' || selectedMetric === 'all') && (
          <Chart
            title="Renewable Energy Consumption"
            data={data.renewableEnergy}
            yDomain={[0, 100]}
            subtitle="Renewable energy consumption as a percentage of total final energy consumption, indicating sustainability efforts."
            chartType="line"
          />
        )}

        {(selectedMetric === 'femaleLaborForce' || selectedMetric === 'all') && (
          <Chart
            title="Female Labor Force Participation Rate"
            data={data.femaleLaborForce}
            yDomain={[20, 80]}
            subtitle="Percentage of female working-age population (15+) that is economically active, reflecting gender equality in labor markets."
            chartType="line"
          />
        )}

        {(selectedMetric === 'military' || selectedMetric === 'all') && (
          <Chart
            title="Military Expenditure"
            data={data.militaryExpenditure}
            yDomain={[0, 10]}
            subtitle="Military expenditure as a percentage of GDP, indicating defense spending priorities."
            chartType="area"
          />
        )}

        {(selectedMetric === 'marketCap' || selectedMetric === 'all') && (
          <Chart
            title="Market Capitalization"
            data={data.marketCapitalization}
            yDomain={[0, 300]}
            subtitle="Market capitalization of listed domestic companies as a percentage of GDP, reflecting stock market depth."
            chartType="line"
          />
        )}

        {(selectedMetric === 'sciPublications' || selectedMetric === 'all') && (
          <Chart
            title="Scientific and Technical Publications"
            data={data.scientificPublications}
            yDomain={[0, 500000]}
            subtitle="Number of scientific and technical journal articles published, indicating research output and innovation capacity."
            chartType="bar"
          />
        )}

        {(selectedMetric === 'ictExports' || selectedMetric === 'all') && (
          <Chart
            title="ICT Goods Exports"
            data={data.ictExports}
            yDomain={[0, 40]}
            subtitle="Information and communications technology goods exports as a percentage of total goods exports."
            chartType="area"
          />
        )}

        {(selectedMetric === 'mobile' || selectedMetric === 'all') && (
          <Chart
            title="Mobile Cellular Subscriptions"
            data={data.mobileSubscriptions}
            yDomain={[0, 200]}
            subtitle="Mobile cellular subscriptions per 100 people, indicating telecommunications infrastructure and adoption."
            chartType="line"
          />
        )}

        {(selectedMetric === 'patents' || selectedMetric === 'all') && (
          <Chart
            title="Patent Applications (Residents)"
            data={data.patentApplications}
            yDomain={[0, 600000]}
            subtitle="Number of patent applications filed by residents, reflecting innovation and intellectual property creation."
            chartType="bar"
          />
        )}

        {(selectedMetric === 'socialSpending' || selectedMetric === 'all') && (
          <Chart
            title="Social Protection Coverage"
            data={data.socialSpending}
            yDomain={[0, 100]}
            subtitle="Percentage of population covered by social protection programs, indicating social safety net strength."
            chartType="area"
          />
        )}

        {(selectedMetric === 'debtService' || selectedMetric === 'all') && (
          <Chart
            title="Public Debt Service (Interest Payments)"
            data={data.publicDebtService}
            yDomain={[0, 40]}
            subtitle="Interest payments as a percentage of government revenue, indicating debt burden."
            chartType="composed"
          />
        )}

        {(selectedMetric === 'services' || selectedMetric === 'all') && (
          <Chart
            title="Services Sector Value Added"
            data={data.servicesValueAdded}
            yDomain={[30, 90]}
            subtitle="Services sector's contribution to GDP as a percentage, indicating economic structure."
            chartType="area"
          />
        )}

        {(selectedMetric === 'agriculture' || selectedMetric === 'all') && (
          <Chart
            title="Agricultural Sector Value Added"
            data={data.agriculturalValueAdded}
            yDomain={[0, 50]}
            subtitle="Agriculture, forestry, and fishing sector's contribution to GDP as a percentage."
            chartType="area"
          />
        )}

        {(selectedMetric === 'tradeOpen' || selectedMetric === 'all') && (
          <Chart
            title="Trade Openness"
            data={data.tradeOpenness}
            yDomain={[0, 400]}
            subtitle="Sum of exports and imports as a percentage of GDP, measuring economic openness to international trade."
            chartType="line"
          />
        )}

        {(selectedMetric === 'tariffs' || selectedMetric === 'all') && (
          <Chart
            title="Average Tariff Rate"
            data={data.tariffRate}
            yDomain={[0, 20]}
            subtitle="Simple mean of applied tariff rates on all products, indicating trade policy restrictiveness."
            chartType="line"
          />
        )}

        {(selectedMetric === 'tourism' || selectedMetric === 'all') && (
          <Chart
            title="Tourism Receipts"
            data={data.tourismReceipts}
            yDomain={[0, 30]}
            subtitle="International tourism receipts as a percentage of total exports, showing tourism sector importance."
            chartType="area"
          />
        )}

        {(selectedMetric === 'privateInvest' || selectedMetric === 'all') && (
          <Chart
            title="Private Sector Investment"
            data={data.privateInvestment}
            yDomain={[0, 40]}
            subtitle="Gross fixed capital formation by private sector as a percentage of GDP, reflecting private investment activity."
            chartType="area"
          />
        )}

        {(selectedMetric === 'newBusiness' || selectedMetric === 'all') && (
          <Chart
            title="New Business Density"
            data={data.newBusinessDensity}
            yDomain={[0, 30]}
            subtitle="New businesses registered per 1,000 people ages 15-64, indicating entrepreneurial activity."
            chartType="bar"
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
        {/* Bottom ad - only show when data is loaded */}
        <AdSense show={!loading && data.interestRates.length > 0} />
        <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 dark:text-white">Updates and Maintenance</h3>
          <p className="text-sm sm:text-base md:text-lg dark:text-white text-gray-700">
            Our platform is regularly updated to ensure accuracy and reliability of economic data. 
            Updates are performed automatically when new data becomes available from the World Bank.
            Latest data includes 2024 economic indicators for most metrics, with specialized indicators available through 2023.
          </p>
          <p className="text-sm sm:text-base md:text-lg dark:text-white text-gray-700 mt-3 sm:mt-4">
            © {new Date().getFullYear()} Global Economic Indicators. Data provided by the World Bank, most indicators updated through 2024.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalInterestRateApp; 