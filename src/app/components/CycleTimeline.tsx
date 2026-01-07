'use client';

import React, { useState, useRef, useEffect } from 'react';
import { empireCycles, type EmpireCycle } from '../data/economicCycles';

interface CycleTimelineProps {
  isDarkMode: boolean;
  onSelectEmpire?: (empire: EmpireCycle | null) => void;
  selectedEmpire?: EmpireCycle | null;
}

const CycleTimeline: React.FC<CycleTimelineProps> = ({
  isDarkMode,
  onSelectEmpire,
  selectedEmpire
}) => {
  const [hoveredEmpire, setHoveredEmpire] = useState<EmpireCycle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Timeline configuration
  const startYear = 1400;
  const endYear = 2100;
  const totalYears = endYear - startYear;
  const timelineHeight = 400;
  const padding = { left: 60, right: 40, top: 60, bottom: 60 };
  const chartWidth = containerWidth - padding.left - padding.right;
  const chartHeight = timelineHeight - padding.top - padding.bottom;

  const yearToX = (year: number) => {
    return padding.left + ((year - startYear) / totalYears) * chartWidth;
  };

  // Generate year markers
  const yearMarkers = [];
  for (let year = 1400; year <= 2100; year += 100) {
    yearMarkers.push(year);
  }

  // Calculate empire bar positions
  const empireHeight = 35;
  const empireGap = 12;
  const empireStartY = padding.top + 20;

  const handleMouseMove = (e: React.MouseEvent, empire: EmpireCycle) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setHoveredEmpire(empire);
  };

  const handleMouseLeave = () => {
    setHoveredEmpire(null);
  };

  const handleClick = (empire: EmpireCycle) => {
    if (onSelectEmpire) {
      onSelectEmpire(selectedEmpire?.id === empire.id ? null : empire);
    }
  };

  // Get phase width calculations
  const getPhaseWidths = (empire: EmpireCycle) => {
    const riseWidth = yearToX(empire.peakStart) - yearToX(empire.riseStart);
    const peakWidth = yearToX(empire.peakEnd) - yearToX(empire.peakStart);
    const declineWidth = yearToX(empire.declineEnd) - yearToX(empire.peakEnd);
    return { riseWidth, peakWidth, declineWidth };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}
      style={{ height: timelineHeight + 80 }}
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          The Rise and Fall of Great Powers
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Based on Ray Dalio&apos;s &quot;The Big Cycle&quot; framework - tracking 500 years of economic power shifts
        </p>
      </div>

      {/* SVG Timeline */}
      <svg
        width="100%"
        height={timelineHeight}
        className="overflow-visible"
      >
        {/* Background grid */}
        {yearMarkers.map(year => (
          <g key={year}>
            <line
              x1={yearToX(year)}
              y1={padding.top}
              x2={yearToX(year)}
              y2={timelineHeight - padding.bottom}
              stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              strokeDasharray="4,4"
            />
            <text
              x={yearToX(year)}
              y={timelineHeight - padding.bottom + 20}
              textAnchor="middle"
              className={`text-xs ${isDarkMode ? 'fill-gray-500' : 'fill-gray-400'}`}
            >
              {year}
            </text>
          </g>
        ))}

        {/* Current year marker */}
        <line
          x1={yearToX(2024)}
          y1={padding.top - 10}
          x2={yearToX(2024)}
          y2={timelineHeight - padding.bottom}
          stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
          strokeWidth={2}
          strokeDasharray="6,3"
        />
        <text
          x={yearToX(2024)}
          y={padding.top - 15}
          textAnchor="middle"
          className={`text-xs font-semibold ${isDarkMode ? 'fill-blue-400' : 'fill-blue-600'}`}
        >
          Today
        </text>

        {/* Empire Bars */}
        {empireCycles.map((empire, index) => {
          const y = empireStartY + index * (empireHeight + empireGap);
          const { riseWidth, peakWidth, declineWidth } = getPhaseWidths(empire);
          const isSelected = selectedEmpire?.id === empire.id;
          const isHovered = hoveredEmpire?.id === empire.id;
          const opacity = (isSelected || isHovered) ? 1 : 0.8;

          return (
            <g 
              key={empire.id}
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleClick(empire)}
              onMouseMove={(e) => handleMouseMove(e, empire)}
              onMouseLeave={handleMouseLeave}
              style={{ transform: isHovered ? 'translateY(-2px)' : 'none' }}
            >
              {/* Empire label */}
              <text
                x={padding.left - 8}
                y={y + empireHeight / 2 + 4}
                textAnchor="end"
                className={`text-xs font-medium ${
                  isDarkMode ? 'fill-gray-300' : 'fill-gray-700'
                }`}
              >
                {empire.name}
              </text>

              {/* Rise phase (gradient from transparent to full) */}
              <defs>
                <linearGradient id={`rise-${empire.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={empire.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={empire.color} stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id={`decline-${empire.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={empire.color} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={empire.color} stopOpacity={0.1} />
                </linearGradient>
              </defs>

              {/* Rise phase */}
              <rect
                x={yearToX(empire.riseStart)}
                y={y}
                width={riseWidth}
                height={empireHeight}
                fill={`url(#rise-${empire.id})`}
                rx={4}
                opacity={opacity}
                className="transition-opacity duration-200"
              />

              {/* Peak phase */}
              <rect
                x={yearToX(empire.peakStart)}
                y={y}
                width={peakWidth}
                height={empireHeight}
                fill={empire.color}
                opacity={opacity}
                className="transition-opacity duration-200"
              />

              {/* Decline phase */}
              <rect
                x={yearToX(empire.peakEnd)}
                y={y}
                width={declineWidth}
                height={empireHeight}
                fill={`url(#decline-${empire.id})`}
                rx={4}
                opacity={opacity}
                className="transition-opacity duration-200"
              />

              {/* Selection indicator */}
              {isSelected && (
                <rect
                  x={yearToX(empire.riseStart) - 2}
                  y={y - 2}
                  width={yearToX(empire.declineEnd) - yearToX(empire.riseStart) + 4}
                  height={empireHeight + 4}
                  fill="none"
                  stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                  strokeWidth={2}
                  rx={6}
                />
              )}

              {/* Peak period indicator */}
              {peakWidth > 40 && (
                <text
                  x={yearToX(empire.peakStart) + peakWidth / 2}
                  y={y + empireHeight / 2 + 4}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-white"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  PEAK
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${padding.left}, ${timelineHeight - 25})`}>
          <rect x={0} y={0} width={12} height={12} fill="#22c55e" opacity={0.5} rx={2} />
          <text x={16} y={10} className={`text-[10px] ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}>Rise</text>
          
          <rect x={50} y={0} width={12} height={12} fill="#3b82f6" rx={2} />
          <text x={66} y={10} className={`text-[10px] ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}>Peak</text>
          
          <rect x={100} y={0} width={12} height={12} fill="#ef4444" opacity={0.5} rx={2} />
          <text x={116} y={10} className={`text-[10px] ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}>Decline</text>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredEmpire && (
        <div
          className={`absolute z-50 p-3 rounded-lg shadow-xl border max-w-xs pointer-events-none ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          style={{
            left: Math.min(tooltipPosition.x + 10, containerWidth - 280),
            top: Math.min(tooltipPosition.y + 10, timelineHeight - 100),
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredEmpire.color }}
            />
            <span className="font-semibold">{hoveredEmpire.fullName}</span>
          </div>
          <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {hoveredEmpire.description}
          </p>
          <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex justify-between">
              <span>Rise:</span>
              <span>{hoveredEmpire.riseStart} - {hoveredEmpire.peakStart}</span>
            </div>
            <div className="flex justify-between">
              <span>Peak:</span>
              <span>{hoveredEmpire.peakStart} - {hoveredEmpire.peakEnd}</span>
            </div>
            <div className="flex justify-between">
              <span>Decline:</span>
              <span>{hoveredEmpire.peakEnd} - {hoveredEmpire.declineEnd}</span>
            </div>
            {hoveredEmpire.reserveCurrency && (
              <div className="flex justify-between pt-1 border-t border-gray-600">
                <span>Reserve Currency:</span>
                <span className="font-medium">{hoveredEmpire.reserveCurrency}</span>
              </div>
            )}
          </div>
          <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Click to see detailed metrics
          </p>
        </div>
      )}

      {/* Selected Empire Details Panel */}
      {selectedEmpire && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedEmpire.color }}
                />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedEmpire.fullName}
                </h4>
              </div>
              <p className={`text-sm mb-3 max-w-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedEmpire.description}
              </p>
            </div>
            <button
              onClick={() => onSelectEmpire?.(null)}
              className={`p-1 rounded-full hover:bg-gray-700/50 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Key Events Timeline */}
          <div className="mt-3">
            <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              KEY EVENTS
            </h5>
            <div className="flex flex-wrap gap-2">
              {selectedEmpire.keyEvents.slice(0, 5).map((event, idx) => (
                <div 
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="font-semibold">{event.year}:</span> {event.event}
                </div>
              ))}
            </div>
          </div>

          {/* Power Metrics */}
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-7 gap-2">
            {Object.entries(selectedEmpire.metrics).map(([key, values]) => {
              const labels: Record<string, string> = {
                education: 'Education',
                innovation: 'Innovation',
                competitiveness: 'Trade Power',
                militaryStrength: 'Military',
                tradeVolume: 'Trade Volume',
                financialCenter: 'Finance',
                reserveCurrencyStatus: 'Reserve Currency'
              };
              const peakValue = values[1];
              return (
                <div 
                  key={key}
                  className={`p-2 rounded text-center ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {labels[key]}
                  </div>
                  <div className={`text-sm font-bold ${
                    peakValue >= 80 ? 'text-green-500' :
                    peakValue >= 60 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {peakValue}
                  </div>
                  <div className={`text-[9px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    Peak Score
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleTimeline;

