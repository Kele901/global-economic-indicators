'use client';

import React, { useState, useRef, useEffect } from 'react';
import { kondratievWaves, type KondratievWave } from '../data/marketCyclesData';

interface KondratievWaveChartProps {
  isDarkMode: boolean;
}

const phaseColors: Record<string, string> = {
  spring: '#22c55e',
  summer: '#eab308',
  autumn: '#f97316',
  winter: '#3b82f6',
};

const phaseLabels: Record<string, string> = {
  spring: 'Spring (Growth)',
  summer: 'Summer (Prosperity)',
  autumn: 'Autumn (Stagnation)',
  winter: 'Winter (Depression)',
};

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const KondratievWaveChart: React.FC<KondratievWaveChartProps> = ({ isDarkMode }) => {
  const [selectedWave, setSelectedWave] = useState<KondratievWave | null>(null);
  const [hoveredWave, setHoveredWave] = useState<KondratievWave | null>(null);
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

  const startYear = 1770;
  const endYear = 2070;
  const totalYears = endYear - startYear;
  const barHeight = 40;
  const barGap = 15;
  const padding = { left: 60, right: 40, top: 60, bottom: 60 };
  const chartWidth = containerWidth - padding.left - padding.right;
  const timelineHeight = padding.top + kondratievWaves.length * (barHeight + barGap) + padding.bottom;

  const yearToX = (year: number) =>
    padding.left + ((year - startYear) / totalYears) * chartWidth;

  const yearMarkers: number[] = [];
  for (let year = 1800; year <= 2060; year += 20) {
    yearMarkers.push(year);
  }

  const handleMouseMove = (e: React.MouseEvent, wave: KondratievWave) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredWave(wave);
  };

  const handleMouseLeave = () => {
    setHoveredWave(null);
  };

  const handleClick = (wave: KondratievWave) => {
    setSelectedWave(selectedWave?.id === wave.id ? null : wave);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}
    >
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Kondratiev Long Waves
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          250 years of technology-driven economic super-cycles (50–60 years each)
        </p>
      </div>

      <svg
        width="100%"
        height={timelineHeight}
        className="overflow-visible"
      >
        <defs>
          {kondratievWaves.map((wave) => (
            <linearGradient key={`grad-${wave.id}`} id={`wave-grad-${wave.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={wave.color} stopOpacity={0.3} />
              <stop offset="40%" stopColor={wave.color} stopOpacity={0.9} />
              <stop offset="70%" stopColor={wave.color} stopOpacity={0.7} />
              <stop offset="100%" stopColor={darkenColor(wave.color, 60)} stopOpacity={0.4} />
            </linearGradient>
          ))}
        </defs>

        {yearMarkers.map((year) => (
          <g key={year}>
            <line
              x1={yearToX(year)}
              y1={padding.top}
              x2={yearToX(year)}
              y2={timelineHeight - padding.bottom}
              stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
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

        <line
          x1={yearToX(2025)}
          y1={padding.top - 10}
          x2={yearToX(2025)}
          y2={timelineHeight - padding.bottom}
          stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
          strokeWidth={2}
          strokeDasharray="6,3"
        />
        <text
          x={yearToX(2025)}
          y={padding.top - 15}
          textAnchor="middle"
          className={`text-xs font-semibold ${isDarkMode ? 'fill-blue-400' : 'fill-blue-600'}`}
        >
          Today
        </text>

        {kondratievWaves.map((wave, index) => {
          const y = padding.top + index * (barHeight + barGap);
          const isSelected = selectedWave?.id === wave.id;
          const isHovered = hoveredWave?.id === wave.id;
          const opacity = isSelected || isHovered ? 1 : 0.8;
          const phases = wave.phases;

          return (
            <g
              key={wave.id}
              className="cursor-pointer"
              onClick={() => handleClick(wave)}
              onMouseMove={(e) => handleMouseMove(e, wave)}
              onMouseLeave={handleMouseLeave}
            >
              <text
                x={padding.left - 8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                className={`text-[10px] font-medium ${
                  isDarkMode ? 'fill-gray-300' : 'fill-gray-700'
                }`}
              >
                K{wave.number}
              </text>

              {(['spring', 'summer', 'autumn', 'winter'] as const).map((phase) => {
                const p = phases[phase];
                const x = yearToX(p.start);
                const w = yearToX(p.end) - x;
                const isFirst = phase === 'spring';
                const isLast = phase === 'winter';

                return (
                  <rect
                    key={phase}
                    x={x}
                    y={y}
                    width={Math.max(0, w)}
                    height={barHeight}
                    fill={phaseColors[phase]}
                    opacity={opacity}
                    rx={isFirst || isLast ? 4 : 0}
                    className="transition-opacity duration-200"
                  />
                );
              })}

              {(yearToX(wave.endYear) - yearToX(wave.startYear)) > 80 && (
                <text
                  x={yearToX(wave.startYear) + (yearToX(wave.endYear) - yearToX(wave.startYear)) / 2}
                  y={y + barHeight / 2 + 4}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-white"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                >
                  {wave.name}
                </text>
              )}

              {isSelected && (
                <rect
                  x={yearToX(wave.startYear) - 2}
                  y={y - 2}
                  width={yearToX(wave.endYear) - yearToX(wave.startYear) + 4}
                  height={barHeight + 4}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  rx={6}
                />
              )}
            </g>
          );
        })}
      </svg>

      {hoveredWave && (
        <div
          className={`absolute z-50 pointer-events-none rounded-lg shadow-xl border px-3 py-2 max-w-xs ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          style={{
            left: Math.min(tooltipPosition.x + 12, containerWidth - 260),
            top: tooltipPosition.y - 10,
          }}
        >
          <p className="font-semibold text-sm">{hoveredWave.name}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {hoveredWave.startYear}–{hoveredWave.endYear} ({hoveredWave.endYear - hoveredWave.startYear} years)
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {hoveredWave.drivingTechnologies.map((tech) => (
              <span
                key={tech}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(phaseLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: phaseColors[key] }}
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedWave && (
        <div
          className={`mx-4 mb-4 p-4 rounded-lg border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-blue-900/30 border-blue-500'
              : 'bg-blue-50 border-blue-500'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Wave {selectedWave.number}: {selectedWave.name}
              </h4>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedWave.startYear}–{selectedWave.endYear} &middot; Led by {selectedWave.leadingCountry}
              </p>
            </div>
            <button
              onClick={() => setSelectedWave(null)}
              className={`text-xs px-2 py-1 rounded ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              ✕
            </button>
          </div>

          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {selectedWave.description}
          </p>

          <div className="mb-3">
            <p className={`text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Driving Technologies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedWave.drivingTechnologies.map((tech) => (
                <span
                  key={tech}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className={`text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Key Innovations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedWave.keyInnovations.map((item) => (
                <span
                  key={item}
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['spring', 'summer', 'autumn', 'winter'] as const).map((phase) => {
              const p = selectedWave.phases[phase];
              return (
                <div
                  key={phase}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/60' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: phaseColors[phase] }}
                    />
                    <span className={`text-xs font-medium capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {phase}
                    </span>
                  </div>
                  <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {p.start}–{p.end}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {p.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KondratievWaveChart;
