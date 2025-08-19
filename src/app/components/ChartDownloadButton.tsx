'use client';

import React, { useState, useRef } from 'react';
import { downloadChart, ChartDownloadOptions, ChartData } from '../utils/chartDownload';

interface ChartDownloadButtonProps {
  chartElement: HTMLElement | null;
  chartData: ChartData;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ChartDownloadButton: React.FC<ChartDownloadButtonProps> = ({
  chartElement,
  chartData,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'pdf' | 'csv'>('png');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!chartElement) {
      alert('Chart element not found. Please try again.');
      return;
    }

    setIsDownloading(true);
    try {
      const options: ChartDownloadOptions = {
        format: downloadFormat,
        filename: chartData.title.toLowerCase().replace(/\s+/g, '-'),
        backgroundColor: '#ffffff'
      };

      await downloadChart(chartElement, chartData, options);
      setIsOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
            Downloading...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Format:</label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as any)}
                className="mt-1 block w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="png">PNG Image</option>
                <option value="jpg">JPG Image</option>
                <option value="pdf">PDF Document</option>
                <option value="csv">CSV Data</option>
              </select>
            </div>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Downloading...' : 'Download Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDownloadButton;
