'use client';

import React, { useState, useRef } from 'react';
import { downloadChart, ChartDownloadOptions, ChartData } from '../utils/chartDownload';

interface ChartDownloadButtonProps {
  chartElement: HTMLElement | null;
  chartData: ChartData;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  chartRef?: React.RefObject<HTMLDivElement>;
}

const ChartDownloadButton: React.FC<ChartDownloadButtonProps> = ({
  chartElement,
  chartData,
  className = '',
  variant = 'primary',
  size = 'md',
  chartRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'pdf' | 'csv'>('png');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg dark:shadow-blue-500/25',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg dark:shadow-gray-400/25',
    outline: 'bg-transparent border-2 border-gray-300 hover:bg-gray-50 text-gray-700 dark:text-white dark:border-gray-400 dark:hover:bg-gray-600 dark:hover:border-gray-300 dark:shadow-lg dark:shadow-gray-900/50 dark:ring-1 dark:ring-gray-400/20'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const handleDownload = async () => {
    // Try multiple ways to get the chart element
    let targetElement = chartElement;
    
    // First try: use the chartRef if available
    if (!targetElement && chartRef?.current) {
      targetElement = chartRef.current;
      console.log('Using chartRef.current:', targetElement);
    }
    
    // Second try: use the chartElement prop
    if (!targetElement) {
      targetElement = chartElement;
      console.log('Using chartElement prop:', targetElement);
    }
    
    // Third try: find by chart title using data attributes
    if (!targetElement) {
      const chartTitle = chartData.title;
      const chartContainers = document.querySelectorAll('[data-chart-container]');
      console.log('Found chart containers:', chartContainers.length);
      
      for (const container of chartContainers) {
        const titleAttr = container.getAttribute('data-chart-title');
        console.log('Container title:', titleAttr, 'Looking for:', chartTitle);
        if (titleAttr === chartTitle) {
          targetElement = container as HTMLElement;
          console.log('Found chart by title:', targetElement);
          break;
        }
      }
    }
    
    // Fourth try: find any chart container if all else fails
    if (!targetElement) {
      const chartContainers = document.querySelectorAll('[data-chart-container]');
      if (chartContainers.length > 0) {
        targetElement = chartContainers[0] as HTMLElement;
        console.log('Using first available chart container:', targetElement);
      }
    }
    
    if (!targetElement) {
      console.error('ChartDownloadButton: Could not find chart element for:', chartData.title);
      console.error('chartElement:', chartElement);
      console.error('chartRef.current:', chartRef?.current);
      console.error('Available chart containers:', document.querySelectorAll('[data-chart-container]').length);
      alert('Chart element not found. Please try again.');
      return;
    }

    // Verify the element is actually in the DOM
    if (!document.contains(targetElement)) {
      console.error('ChartDownloadButton: Chart element is not in the DOM');
      alert('Chart element not found. Please try again.');
      return;
    }

    setIsDownloading(true);
    try {
      // Validate chart data
      if (!chartData || !chartData.title) {
        throw new Error('Invalid chart data: missing title');
      }
      
      if (!chartData.data || !Array.isArray(chartData.data)) {
        console.warn('Chart data is missing or not an array, using empty data');
        chartData.data = [];
      }
      
      const options: ChartDownloadOptions = {
        format: downloadFormat,
        filename: chartData.title.toLowerCase().replace(/\s+/g, '-'),
        backgroundColor: '#ffffff'
      };

      console.log('Starting download with element:', targetElement);
      console.log('Chart data:', chartData);
      console.log('Download options:', options);
      
      await downloadChart(targetElement, chartData, options);
      setIsOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
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

  // Debug logging to help troubleshoot ref issues
  React.useEffect(() => {
    if (chartElement) {
      console.log('ChartDownloadButton: Chart element found:', chartElement);
    } else {
      console.log('ChartDownloadButton: Chart element not found for:', chartData.title);
    }
  }, [chartElement, chartData.title]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          rounded-md font-semibold transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
          dark:text-white dark:font-bold
          hover:scale-105 active:scale-95
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
        <div 
          data-chart-download-dropdown
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl border-2 border-gray-200 dark:border-gray-600 z-50 dark:shadow-2xl dark:shadow-gray-900/50"
        >
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <label className="text-sm font-semibold text-gray-700 dark:text-white">Format:</label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as any)}
                className="mt-1 block w-full px-3 py-1 text-sm border-2 border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
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
              className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
