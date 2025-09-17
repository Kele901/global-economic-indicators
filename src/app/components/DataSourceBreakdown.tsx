// Component showing detailed breakdown of data sources

'use client';

import React, { useState, useEffect } from 'react';
import { Database, Zap, Globe, TrendingUp, BarChart3, Users } from 'lucide-react';

interface DataSource {
  metric: string;
  isReal: boolean;
  source: string;
  description: string;
  accuracy: 'High' | 'Medium' | 'Demo';
}

interface DataSourceBreakdownProps {
  enableRealData: boolean;
  isRealData: boolean;
  isDarkMode: boolean;
}

const DataSourceBreakdown: React.FC<DataSourceBreakdownProps> = ({
  enableRealData,
  isRealData,
  isDarkMode
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`p-6 rounded-xl shadow-lg border ${
        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const dataSources: DataSource[] = [
    {
      metric: "GDP",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "World Bank API" : "Educational Mock",
      description: "Gross Domestic Product in current USD",
      accuracy: enableRealData ? "High" : "Demo"
    },
    {
      metric: "Total Exports/Imports",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "World Bank API" : "Educational Mock",
      description: "Goods and services trade values",
      accuracy: enableRealData ? "High" : "Demo"
    },
    {
      metric: "Trade Balance",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "Calculated from World Bank" : "Educational Mock",
      description: "Exports minus imports calculation",
      accuracy: enableRealData ? "High" : "Demo"
    },
    {
      metric: "Population",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "World Bank API" : "Educational Mock",
      description: "Total population figures",
      accuracy: enableRealData ? "High" : "Demo"
    },
    {
      metric: "Trading Partners",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "UN Comtrade API" : "Educational Mock",
      description: "Bilateral trade relationships",
      accuracy: enableRealData ? "High" : "Demo"
    },
    {
      metric: "Trade Intensity",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "Calculated from APIs" : "Educational Mock",
      description: "Trade as percentage of GDP",
      accuracy: enableRealData ? "High" : "Demo"
    },
    {
      metric: "Export/Import Categories",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "UN Comtrade (HS Codes)" : "Educational Mock",
      description: "Top product categories by value",
      accuracy: enableRealData ? "Medium" : "Demo"
    },
    {
      metric: "Growth Rates",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "World Bank Historical" : "Educational Mock",
      description: "Year-over-year growth calculations",
      accuracy: enableRealData ? "Medium" : "Demo"
    },
    {
      metric: "Diversification Index",
      isReal: enableRealData && isRealData,
      source: enableRealData ? "Calculated from Partners" : "Educational Mock",
      description: "Economic complexity measure",
      accuracy: enableRealData ? "Medium" : "Demo"
    },
    {
      metric: "Tariff Information",
      isReal: false,
      source: "Real-world Based Mock",
      description: "Based on actual trade disputes",
      accuracy: "Demo"
    }
  ];

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'High':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'Medium':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    }
  };

  const getAccuracyIcon = (accuracy: string) => {
    switch (accuracy) {
      case 'High':
        return <Zap className="w-4 h-4" />;
      case 'Medium':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg border ${
      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Data Sources & Accuracy
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          enableRealData
            ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
            : isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
        }`}>
          {enableRealData ? 'Live Data Mode' : 'Demo Mode'}
        </div>
      </div>

      <div className="space-y-3">
        {dataSources.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  item.accuracy === 'High'
                    ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                    : item.accuracy === 'Medium'
                    ? isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                    : isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <div className={getAccuracyColor(item.accuracy)}>
                    {getAccuracyIcon(item.accuracy)}
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.metric}
                  </h4>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getAccuracyColor(item.accuracy)}`}>
                  {item.accuracy}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.source}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
      }`}>
        <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          API Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              World Bank API
            </p>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              GDP, Trade Volumes, Population
            </p>
          </div>
          <div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              UN Comtrade API
            </p>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Partners, Categories, Flows
            </p>
          </div>
          <div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Calculated Metrics
            </p>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Growth Rates, Diversification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceBreakdown;
