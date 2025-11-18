import React, { useState, useEffect, useMemo } from 'react';
import {
  calculateInflation,
  getCountryDateRange,
  getCurrencySymbol,
  getCurrencyName,
  formatCurrency,
  validateYearSelection,
  InflationCalculation,
  CountryDateRange
} from '../services/inflationCalculator';
import { CountryData } from '../services/worldbank';
import ValueTimelineChart from './ValueTimelineChart';

interface InflationCalculatorProps {
  cpiData: CountryData[];
  isDarkMode: boolean;
  countryFlags: { [key: string]: React.ComponentType<any> };
}

const InflationCalculator: React.FC<InflationCalculatorProps> = ({
  cpiData,
  isDarkMode,
  countryFlags
}) => {
  const countries = [
    'USA', 'UK', 'Canada', 'France', 'Germany', 'Italy', 'Japan',
    'Australia', 'Mexico', 'SouthKorea', 'Spain', 'Sweden', 'Switzerland',
    'Turkey', 'Nigeria', 'China', 'Russia', 'Brazil', 'Chile', 'Argentina',
    'India', 'Norway', 'Netherlands', 'Portugal', 'Belgium', 'Indonesia',
    'SouthAfrica', 'Poland', 'SaudiArabia', 'Egypt'
  ].sort();

  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [amount, setAmount] = useState('100');
  const [startYear, setStartYear] = useState('2000');
  const [endYear, setEndYear] = useState('2024');
  const [result, setResult] = useState<InflationCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Get available date range for selected country
  const dateRange = useMemo(() => {
    return getCountryDateRange(cpiData, selectedCountry);
  }, [cpiData, selectedCountry]);

  // Update default years when country changes
  useEffect(() => {
    if (dateRange) {
      const currentYear = new Date().getFullYear();
      const defaultEndYear = Math.min(currentYear, dateRange.endYear);
      const defaultStartYear = Math.max(defaultEndYear - 24, dateRange.startYear);
      
      setStartYear(defaultStartYear.toString());
      setEndYear(defaultEndYear.toString());
      setShowResults(false);
      setError(null);
    }
  }, [selectedCountry, dateRange]);

  const handleCalculate = () => {
    try {
      setError(null);
      
      const amountNum = parseFloat(amount);
      const startYearNum = parseInt(startYear);
      const endYearNum = parseInt(endYear);

      if (isNaN(amountNum) || amountNum <= 0) {
        setError('Please enter a valid amount greater than zero');
        return;
      }

      // Validate year selection
      const validation = validateYearSelection(startYearNum, endYearNum, dateRange);
      if (!validation.isValid) {
        setError(validation.message || 'Invalid year selection');
        return;
      }

      const calculation = calculateInflation(
        amountNum,
        startYearNum,
        endYearNum,
        selectedCountry,
        cpiData
      );

      if (!calculation) {
        setError('Unable to calculate: CPI data not available for the selected period');
        return;
      }

      setResult(calculation);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during calculation');
      setShowResults(false);
    }
  };

  const handleShortcut = (yearsAgo: number) => {
    if (!dateRange) return;
    
    const currentYear = Math.min(new Date().getFullYear(), dateRange.endYear);
    const targetStartYear = Math.max(currentYear - yearsAgo, dateRange.startYear);
    
    setStartYear(targetStartYear.toString());
    setEndYear(currentYear.toString());
  };

  const FlagComponent = countryFlags[selectedCountry];

  // Generate year options based on available data
  const generateYearOptions = () => {
    if (!dateRange) return [];
    const years = [];
    for (let year = dateRange.startYear; year <= dateRange.endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  // Get appropriate padding based on currency symbol length
  const getCurrencyInputPadding = (country: string, year?: number) => {
    const symbol = getCurrencySymbol(country, year);
    // For longer symbols (3+ characters), use more padding
    if (symbol.length >= 3) {
      return 'pl-16'; // 4rem
    } else if (symbol.length === 2) {
      return 'pl-12'; // 3rem
    }
    return 'pl-8'; // 2rem (default)
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Calculator Form */}
      <div className={`p-6 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Inflation Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Selector */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Country
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className={`w-full px-4 py-2 pr-10 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === 'SouthKorea' ? 'South Korea' 
                      : country === 'SouthAfrica' ? 'South Africa'
                      : country === 'SaudiArabia' ? 'Saudi Arabia'
                      : country}
                  </option>
                ))}
              </select>
              {FlagComponent && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-6 h-4 pointer-events-none">
                  <FlagComponent />
                </div>
              )}
            </div>
            {dateRange && (
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Data available: {dateRange.startYear} - {dateRange.endYear}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Amount
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getCurrencySymbol(selectedCountry, parseInt(startYear) || new Date().getFullYear())}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className={`w-full ${getCurrencyInputPadding(selectedCountry, parseInt(startYear))} pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter amount"
              />
            </div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              In {getCurrencyName(selectedCountry, parseInt(startYear))}
            </p>
          </div>

          {/* Start Year */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              From Year
            </label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* End Year */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              To Year
            </label>
            <select
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className={`w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Calculate
        </button>

        {/* Shortcuts */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Quick shortcuts:
          </span>
          {[10, 25, 50].map((years) => (
            <button
              key={years}
              onClick={() => handleShortcut(years)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {years} years ago
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-100 border border-red-300">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {showResults && result && (
        <div className="mt-6 space-y-6">
          {/* Currency Change Notice */}
          {result.currencyChanged && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-blue-900 border-blue-700 text-blue-200' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start">
                <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Currency Conversion & Inflation Applied</p>
                  <p className="text-sm mb-2">
                    {selectedCountry} adopted the Euro in 2002. Your amount was first converted from{' '}
                    <strong>{getCurrencyName(selectedCountry, result.originalYear)}</strong> ({result.originalCurrency}) to Euros
                    {result.conversionRate && (
                      <span> at the official rate of 1 EUR = {result.conversionRate.toLocaleString()} {result.originalCurrency}</span>
                    )}
                    , then adjusted for inflation.
                  </p>
                  {result.convertedToEuros && result.amountInEuros && (
                    <p className="text-sm">
                      <strong>Conversion:</strong> {formatCurrency(result.originalAmount, selectedCountry, result.originalYear)} = €{result.amountInEuros.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Your Results
            </h3>

            <div className="space-y-4">
              {/* Main Result */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
              }`}>
                <p className={`text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  What goods and services costing
                </p>
                <p className={`text-3xl font-bold mb-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {formatCurrency(result.originalAmount, selectedCountry, result.originalYear)}
                </p>
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  in {result.originalYear} ({getCurrencyName(selectedCountry, result.originalYear)})
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  would cost
                </p>
                <p className={`text-3xl font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {formatCurrency(result.adjustedValue, selectedCountry, result.targetYear)}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  in {result.targetYear} ({getCurrencyName(selectedCountry, result.targetYear)})
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Average Annual {result.isDeflation ? 'Deflation' : 'Inflation'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    result.isDeflation
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-orange-400' : 'text-orange-600')
                  }`}>
                    {Math.abs(result.averageInflation).toFixed(2)}%
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Purchasing Power Change
                  </p>
                  <p className={`text-2xl font-bold ${
                    result.purchasingPowerChange < 0
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {result.purchasingPowerChange > 0 ? '+' : ''}
                    {result.purchasingPowerChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Over Time Chart */}
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Value Over Time
            </h3>
            <ValueTimelineChart
              data={result.yearlyValues}
              country={selectedCountry}
              originalAmount={result.originalAmount}
              originalYear={result.originalYear}
              targetYear={result.targetYear}
              targetValue={result.adjustedValue}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InflationCalculator;

