import React, { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface EconomicMetricInfo {
  title: string;
  description: string;
  formula?: string;
  interpretation: string;
  implications: string[];
  dataSource?: string;
  frequency?: string;
  units?: string;
  relatedMetrics?: string[];
}

interface InfoPanelProps {
  metric: EconomicMetricInfo;
  isDarkMode: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  metric, 
  isDarkMode, 
  position = 'top-right',
  size = 'medium'
 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  };

  const sizeClasses = {
    small: 'max-w-lg',
    medium: 'max-w-3xl',
    large: 'max-w-4xl'
  };

  const themeColors = {
    background: isDarkMode ? 'bg-gray-800/95' : 'bg-white/95',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    border: isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50',
    shadow: isDarkMode ? 'shadow-2xl shadow-black/30' : 'shadow-2xl shadow-gray-900/20',
    hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    buttonBg: isDarkMode ? 'bg-gray-700/90' : 'bg-white/90',
    buttonBorder: isDarkMode ? 'border-gray-600/50' : 'border-gray-300/50',
    formulaBg: isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50/80',
    formulaBorder: isDarkMode ? 'border-gray-600/30' : 'border-blue-200/50',
    bulletColor: isDarkMode ? 'bg-blue-400' : 'bg-blue-500',
    tagBg: isDarkMode ? 'bg-gray-700/70' : 'bg-gray-100/80',
    tagBorder: isDarkMode ? 'border-gray-600/30' : 'border-gray-200/50'
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} info-panel-wrapper`}
      style={{ zIndex: 99999 }}
    >
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2.5 rounded-full transition-all duration-300 ease-out
          ${themeColors.buttonBg} ${themeColors.buttonBorder} ${themeColors.shadow}
          ${themeColors.hover} border backdrop-blur-sm
          ${isOpen ? 'ring-2 ring-blue-500/60 scale-110' : 'hover:scale-105'}
          group
        `}
        aria-label={`Learn more about ${metric.title}`}
      >
        <InformationCircleIcon 
          className={`w-5 h-5 transition-colors duration-200 ${
            isOpen ? themeColors.accent : themeColors.textSecondary
          } group-hover:text-blue-500`} 
        />
      </button>

      {/* Info Panel */}
      {isOpen && (
        <div 
          className={`
            absolute ${position.includes('right') ? 'right-0' : 'left-0'} top-14
            ${sizeClasses[size]} p-6 rounded-2xl
            ${themeColors.background} ${themeColors.border} ${themeColors.shadow}
            border backdrop-blur-md info-panel-content
            animate-in fade-in-0 slide-in-from-top-2 duration-300
          `}
          style={{ zIndex: 99999 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${themeColors.bulletColor}`} />
              <h3 className={`text-lg font-bold ${themeColors.text}`}>
                {metric.title}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-full ${themeColors.hover} transition-all duration-200 hover:scale-110`}
              aria-label="Close info panel"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className={`text-sm leading-relaxed mb-5 ${themeColors.textSecondary}`}>
            {metric.description}
          </p>

          {/* Formula */}
          {metric.formula && (
            <div className={`mb-5 p-4 rounded-xl ${themeColors.formulaBg} ${themeColors.formulaBorder} border`}>
              <p className={`text-xs font-semibold mb-2 ${themeColors.textTertiary} uppercase tracking-wider`}>
                Formula
              </p>
              <p className={`text-sm font-mono ${themeColors.text} bg-gray-800/10 dark:bg-gray-200/10 px-3 py-2 rounded-lg`}>
                {metric.formula}
              </p>
            </div>
          )}

          {/* Interpretation */}
          <div className="mb-5">
            <p className={`text-xs font-semibold mb-3 ${themeColors.textTertiary} uppercase tracking-wider flex items-center gap-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${themeColors.bulletColor}`} />
              How to Interpret
            </p>
            <p className={`text-sm leading-relaxed ${themeColors.textSecondary}`}>
              {metric.interpretation}
            </p>
          </div>

          {/* Implications */}
          <div className="mb-5">
            <p className={`text-xs font-semibold mb-3 ${themeColors.textTertiary} uppercase tracking-wider flex items-center gap-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${themeColors.bulletColor}`} />
              Economic Implications
            </p>
            <ul className="space-y-2.5">
              {metric.implications.map((implication, index) => (
                <li key={index} className={`text-sm ${themeColors.textSecondary} flex items-start gap-3`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${themeColors.bulletColor} mt-2 flex-shrink-0`}></span>
                  <span className="leading-relaxed">{implication}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Info Grid */}
          {(metric.units || metric.frequency) && (
            <div className="grid grid-cols-2 gap-4 mb-5">
              {metric.units && (
                <div className={`p-3 rounded-lg ${themeColors.tagBg} ${themeColors.tagBorder} border`}>
                  <p className={`text-xs font-semibold mb-1 ${themeColors.textTertiary} uppercase tracking-wider`}>
                    Units
                  </p>
                  <p className={`text-sm ${themeColors.textSecondary}`}>{metric.units}</p>
                </div>
              )}
              {metric.frequency && (
                <div className={`p-3 rounded-lg ${themeColors.tagBg} ${themeColors.tagBorder} border`}>
                  <p className={`text-xs font-semibold mb-1 ${themeColors.textTertiary} uppercase tracking-wider`}>
                    Update Frequency
                  </p>
                  <p className={`text-sm ${themeColors.textSecondary}`}>{metric.frequency}</p>
                </div>
              )}
            </div>
          )}

          {/* Data Source */}
          {metric.dataSource && (
            <div className={`mt-5 pt-4 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <p className={`text-xs ${themeColors.textTertiary} flex items-center gap-2`}>
                <span className="font-semibold">📊 Data Source:</span> 
                <span className="text-xs">{metric.dataSource}</span>
              </p>
            </div>
          )}

          {/* Related Metrics */}
          {metric.relatedMetrics && metric.relatedMetrics.length > 0 && (
            <div className={`mt-5 pt-4 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <p className={`text-xs font-semibold mb-3 ${themeColors.textTertiary} uppercase tracking-wider flex items-center gap-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${themeColors.bulletColor}`} />
                Related Metrics
              </p>
              <div className="flex flex-wrap gap-2">
                {metric.relatedMetrics.map((relatedMetric, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${themeColors.textSecondary} ${themeColors.tagBg} ${themeColors.tagBorder} border transition-colors duration-200 hover:bg-blue-100/50 dark:hover:bg-blue-900/20`}
                  >
                    {relatedMetric}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
