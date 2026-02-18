'use client';

import React, { useState, useMemo } from 'react';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber, formatPercent } from '../data/technologyIndicators';

interface TechFlowSankeyProps {
  isDarkMode: boolean;
  rdSpending: CountryData[];
  stemGraduates: CountryData[];
  patentData: CountryData[];
  scientificPublications: CountryData[];
  researchersData: CountryData[];
  hightechExports: CountryData[];
  techEmployment: CountryData[];
  vcFunding: CountryData[];
  selectedYear: number;
}

interface SankeyNode {
  id: string;
  label: string;
  category: 'input' | 'process' | 'output';
  value: number;
  x: number;
  y: number;
  height: number;
  color: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  sourceY: number;
  targetY: number;
  height: number;
}

const TechFlowSankey: React.FC<TechFlowSankeyProps> = ({
  isDarkMode,
  rdSpending,
  stemGraduates,
  patentData,
  scientificPublications,
  researchersData,
  hightechExports,
  techEmployment,
  vcFunding,
  selectedYear
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    linkColor: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
    linkHighlight: isDarkMode ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.4)'
  };

  const nodeColors = {
    input: isDarkMode ? '#3B82F6' : '#2563EB',
    process: isDarkMode ? '#8B5CF6' : '#7C3AED',
    output: isDarkMode ? '#10B981' : '#059669'
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    [rdSpending, stemGraduates, patentData, hightechExports].forEach(data => {
      if (data?.length) {
        const yearData = data.find(d => d.year === selectedYear) || data[data.length - 1];
        if (yearData) {
          Object.keys(yearData).forEach(k => {
            if (k !== 'year' && typeof yearData[k] === 'number') {
              countries.add(k);
            }
          });
        }
      }
    });
    return Array.from(countries).sort();
  }, [rdSpending, stemGraduates, patentData, hightechExports, selectedYear]);

  const getValue = (data: CountryData[], country: string): number => {
    if (!data?.length) return 0;
    const yearData = data.find(d => d.year === selectedYear) || data[data.length - 1];
    if (!yearData) return 0;
    const value = yearData[country];
    return typeof value === 'number' ? value : 0;
  };

  const countryData = useMemo(() => {
    return {
      rdSpending: getValue(rdSpending, selectedCountry),
      stemGraduates: getValue(stemGraduates, selectedCountry),
      patents: getValue(patentData, selectedCountry),
      publications: getValue(scientificPublications, selectedCountry),
      researchers: getValue(researchersData, selectedCountry),
      hightechExports: getValue(hightechExports, selectedCountry),
      techEmployment: getValue(techEmployment, selectedCountry),
      vcFunding: getValue(vcFunding, selectedCountry)
    };
  }, [rdSpending, stemGraduates, patentData, scientificPublications, researchersData, hightechExports, techEmployment, vcFunding, selectedCountry, selectedYear]);

  const normalizeValue = (value: number, max: number): number => {
    if (max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  };

  const maxValues = useMemo(() => ({
    rdSpending: 5,
    stemGraduates: 40,
    patents: 500000,
    publications: 500000,
    researchers: 10000,
    hightechExports: 40,
    techEmployment: 10,
    vcFunding: 350
  }), []);

  const normalizedData = useMemo(() => ({
    rdSpending: normalizeValue(countryData.rdSpending, maxValues.rdSpending),
    stemGraduates: normalizeValue(countryData.stemGraduates, maxValues.stemGraduates),
    patents: normalizeValue(countryData.patents, maxValues.patents),
    publications: normalizeValue(countryData.publications, maxValues.publications),
    researchers: normalizeValue(countryData.researchers, maxValues.researchers),
    hightechExports: normalizeValue(countryData.hightechExports, maxValues.hightechExports),
    techEmployment: normalizeValue(countryData.techEmployment, maxValues.techEmployment),
    vcFunding: normalizeValue(countryData.vcFunding, maxValues.vcFunding)
  }), [countryData, maxValues]);

  const svgWidth = 800;
  const svgHeight = 400;
  const nodeWidth = 20;
  const padding = 60;

  const nodes: SankeyNode[] = useMemo(() => {
    const inputX = padding;
    const processX = svgWidth / 2 - nodeWidth / 2;
    const outputX = svgWidth - padding - nodeWidth;

    const inputTotal = normalizedData.rdSpending + normalizedData.stemGraduates;
    const processTotal = normalizedData.patents + normalizedData.publications + normalizedData.researchers;
    const outputTotal = normalizedData.hightechExports + normalizedData.techEmployment + normalizedData.vcFunding;

    const scaleHeight = (value: number, total: number) => {
      if (total === 0) return 30;
      return Math.max((value / total) * (svgHeight - 100), 30);
    };

    let inputY = 50;
    let processY = 30;
    let outputY = 40;

    return [
      {
        id: 'rdSpending',
        label: 'R&D Spending',
        category: 'input' as const,
        value: countryData.rdSpending,
        x: inputX,
        y: inputY,
        height: scaleHeight(normalizedData.rdSpending, inputTotal),
        color: nodeColors.input
      },
      {
        id: 'stemGraduates',
        label: 'STEM Graduates',
        category: 'input' as const,
        value: countryData.stemGraduates,
        x: inputX,
        y: inputY + scaleHeight(normalizedData.rdSpending, inputTotal) + 20,
        height: scaleHeight(normalizedData.stemGraduates, inputTotal),
        color: nodeColors.input
      },
      {
        id: 'patents',
        label: 'Patents',
        category: 'process' as const,
        value: countryData.patents,
        x: processX,
        y: processY,
        height: scaleHeight(normalizedData.patents, processTotal),
        color: nodeColors.process
      },
      {
        id: 'publications',
        label: 'Publications',
        category: 'process' as const,
        value: countryData.publications,
        x: processX,
        y: processY + scaleHeight(normalizedData.patents, processTotal) + 15,
        height: scaleHeight(normalizedData.publications, processTotal),
        color: nodeColors.process
      },
      {
        id: 'researchers',
        label: 'Researchers',
        category: 'process' as const,
        value: countryData.researchers,
        x: processX,
        y: processY + scaleHeight(normalizedData.patents, processTotal) + scaleHeight(normalizedData.publications, processTotal) + 30,
        height: scaleHeight(normalizedData.researchers, processTotal),
        color: nodeColors.process
      },
      {
        id: 'hightechExports',
        label: 'High-Tech Exports',
        category: 'output' as const,
        value: countryData.hightechExports,
        x: outputX,
        y: outputY,
        height: scaleHeight(normalizedData.hightechExports, outputTotal),
        color: nodeColors.output
      },
      {
        id: 'techEmployment',
        label: 'Tech Employment',
        category: 'output' as const,
        value: countryData.techEmployment,
        x: outputX,
        y: outputY + scaleHeight(normalizedData.hightechExports, outputTotal) + 15,
        height: scaleHeight(normalizedData.techEmployment, outputTotal),
        color: nodeColors.output
      },
      {
        id: 'vcFunding',
        label: 'VC Funding',
        category: 'output' as const,
        value: countryData.vcFunding,
        x: outputX,
        y: outputY + scaleHeight(normalizedData.hightechExports, outputTotal) + scaleHeight(normalizedData.techEmployment, outputTotal) + 30,
        height: scaleHeight(normalizedData.vcFunding, outputTotal),
        color: nodeColors.output
      }
    ];
  }, [normalizedData, countryData, nodeColors]);

  const links: SankeyLink[] = useMemo(() => {
    const getNode = (id: string) => nodes.find(n => n.id === id)!;
    
    const createLink = (sourceId: string, targetId: string, valueRatio: number): SankeyLink => {
      const source = getNode(sourceId);
      const target = getNode(targetId);
      const linkHeight = Math.max(source.height * valueRatio, 5);
      
      return {
        source: sourceId,
        target: targetId,
        value: valueRatio,
        sourceY: source.y + (source.height - linkHeight) / 2,
        targetY: target.y + (target.height - linkHeight) / 2,
        height: linkHeight
      };
    };

    return [
      createLink('rdSpending', 'patents', 0.5),
      createLink('rdSpending', 'publications', 0.3),
      createLink('rdSpending', 'researchers', 0.2),
      createLink('stemGraduates', 'researchers', 0.4),
      createLink('stemGraduates', 'patents', 0.3),
      createLink('stemGraduates', 'publications', 0.3),
      createLink('patents', 'hightechExports', 0.5),
      createLink('patents', 'vcFunding', 0.5),
      createLink('publications', 'hightechExports', 0.3),
      createLink('publications', 'techEmployment', 0.7),
      createLink('researchers', 'techEmployment', 0.6),
      createLink('researchers', 'hightechExports', 0.4)
    ];
  }, [nodes]);

  const createPath = (link: SankeyLink): string => {
    const source = nodes.find(n => n.id === link.source)!;
    const target = nodes.find(n => n.id === link.target)!;
    
    const x1 = source.x + nodeWidth;
    const y1 = link.sourceY + link.height / 2;
    const x2 = target.x;
    const y2 = link.targetY + link.height / 2;
    
    const midX = (x1 + x2) / 2;
    
    return `M ${x1} ${y1 - link.height/2}
            C ${midX} ${y1 - link.height/2}, ${midX} ${y2 - link.height/2}, ${x2} ${y2 - link.height/2}
            L ${x2} ${y2 + link.height/2}
            C ${midX} ${y2 + link.height/2}, ${midX} ${y1 + link.height/2}, ${x1} ${y1 + link.height/2}
            Z`;
  };

  const formatNodeValue = (node: SankeyNode): string => {
    switch (node.id) {
      case 'rdSpending':
        return `${node.value.toFixed(1)}% GDP`;
      case 'stemGraduates':
        return `${node.value.toFixed(1)}%`;
      case 'patents':
      case 'publications':
        return formatNumber(node.value);
      case 'researchers':
        return `${formatNumber(node.value)}/M`;
      case 'hightechExports':
        return `${node.value.toFixed(1)}%`;
      case 'techEmployment':
        return `${node.value.toFixed(1)}%`;
      case 'vcFunding':
        return `$${node.value.toFixed(1)}B`;
      default:
        return formatNumber(node.value);
    }
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Tech Ecosystem Flow
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Innovation pipeline from inputs to outcomes ({selectedYear})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            {availableCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: nodeColors.input }}></div>
          <span className={`text-sm ${themeColors.textSecondary}`}>Inputs (Investment)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: nodeColors.process }}></div>
          <span className={`text-sm ${themeColors.textSecondary}`}>Process (Research Output)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: nodeColors.output }}></div>
          <span className={`text-sm ${themeColors.textSecondary}`}>Outcomes (Economic Impact)</span>
        </div>
      </div>

      {/* Sankey Diagram */}
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          <defs>
            <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={nodeColors.input} stopOpacity="0.3" />
              <stop offset="50%" stopColor={nodeColors.process} stopOpacity="0.3" />
              <stop offset="100%" stopColor={nodeColors.output} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Links */}
          {links.map((link, index) => (
            <path
              key={`link-${index}`}
              d={createPath(link)}
              fill={highlightedNode && (highlightedNode === link.source || highlightedNode === link.target)
                ? themeColors.linkHighlight
                : themeColors.linkColor
              }
              opacity={highlightedNode && highlightedNode !== link.source && highlightedNode !== link.target ? 0.2 : 1}
              className="transition-all duration-200"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g
              key={node.id}
              onMouseEnter={() => setHighlightedNode(node.id)}
              onMouseLeave={() => setHighlightedNode(null)}
              className="cursor-pointer"
            >
              <rect
                x={node.x}
                y={node.y}
                width={nodeWidth}
                height={node.height}
                fill={node.color}
                rx={4}
                className={`transition-all duration-200 ${
                  highlightedNode === node.id ? 'filter brightness-110' : ''
                }`}
              />
              <text
                x={node.category === 'input' ? node.x - 5 : node.category === 'output' ? node.x + nodeWidth + 5 : node.x + nodeWidth / 2}
                y={node.y + node.height / 2}
                textAnchor={node.category === 'input' ? 'end' : node.category === 'output' ? 'start' : 'middle'}
                dominantBaseline="middle"
                fill={isDarkMode ? '#E5E7EB' : '#374151'}
                fontSize={11}
                fontWeight={highlightedNode === node.id ? 'bold' : 'normal'}
              >
                {node.label}
              </text>
              <text
                x={node.category === 'input' ? node.x - 5 : node.category === 'output' ? node.x + nodeWidth + 5 : node.x + nodeWidth / 2}
                y={node.y + node.height / 2 + 14}
                textAnchor={node.category === 'input' ? 'end' : node.category === 'output' ? 'start' : 'middle'}
                dominantBaseline="middle"
                fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={10}
              >
                {formatNodeValue(node)}
              </text>
            </g>
          ))}

          {/* Column Labels */}
          <text x={padding} y={20} fill={nodeColors.input} fontSize={12} fontWeight="bold">
            INPUTS
          </text>
          <text x={svgWidth / 2} y={20} fill={nodeColors.process} fontSize={12} fontWeight="bold" textAnchor="middle">
            RESEARCH OUTPUT
          </text>
          <text x={svgWidth - padding} y={20} fill={nodeColors.output} fontSize={12} fontWeight="bold" textAnchor="end">
            OUTCOMES
          </text>
        </svg>
      </div>

      {/* Country Stats */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
          {selectedCountry} Innovation Pipeline Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className={themeColors.textTertiary}>Total R&D Investment</p>
            <p className={`font-medium ${themeColors.text}`}>{countryData.rdSpending.toFixed(2)}% of GDP</p>
          </div>
          <div>
            <p className={themeColors.textTertiary}>Research Output</p>
            <p className={`font-medium ${themeColors.text}`}>{formatNumber(countryData.patents + countryData.publications)} patents + publications</p>
          </div>
          <div>
            <p className={themeColors.textTertiary}>Workforce</p>
            <p className={`font-medium ${themeColors.text}`}>{formatNumber(countryData.researchers)} researchers/M</p>
          </div>
          <div>
            <p className={themeColors.textTertiary}>Economic Output</p>
            <p className={`font-medium ${themeColors.text}`}>{countryData.hightechExports.toFixed(1)}% high-tech exports</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
        <p className={`text-xs ${themeColors.textTertiary}`}>
          This diagram shows the flow of innovation from <strong>inputs</strong> (R&D investment, education) 
          through <strong>research outputs</strong> (patents, publications, researchers) to 
          <strong> economic outcomes</strong> (exports, employment, venture capital). 
          Hover over nodes to highlight connections.
        </p>
      </div>
    </div>
  );
};

export default TechFlowSankey;
