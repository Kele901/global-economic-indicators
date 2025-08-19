'use client';

import React, { useState } from 'react';
import { downloadAllCharts, ChartDownloadOptions } from '../utils/chartDownload';

interface BulkChartDownloadProps {
  chartSelector?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const BulkChartDownload: React.FC<BulkChartDownloadProps> = ({
  chartSelector = '[data-chart-container]',
  className = '',
  variant = 'secondary',
  size = 'md'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [showOptions, setShowOptions] = useState(false);

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    try {
      const options: ChartDownloadOptions = {
        format: downloadFormat,
        backgroundColor: '#ffffff'
      };

      await downloadAllCharts(chartSelector, options);
      setShowOptions(false);
    } catch (error) {
      console.error('Bulk download failed:', error);
      alert('Bulk download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getChartCount = () => {
    if (typeof window === 'undefined') return 0;
    return document.querySelectorAll(chartSelector).length;
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isDownloading}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          rounded-md font-medium transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
          ${className}
        `}
      >
        {isDownloading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Downloading All...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Download All Charts
          </>
        )}
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Found {getChartCount()} charts to download
              </p>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Format:</label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="png">PNG Images</option>
                <option value="jpg">JPG Images</option>
                <option value="pdf">PDF Documents</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleBulkDownload}
                disabled={isDownloading}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? 'Downloading...' : 'Download All'}
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkChartDownload;
