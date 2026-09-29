'use client';

// The innovation pipeline for one country: R&D money and STEM graduates in,
// patents/publications/researchers in the middle, exports/employment/VC out.
//
// The SVG layout used to live here. It now lives in charts/FlowDiagram, and
// this file's only job is to turn the nine World Bank series into the
// columns/nodes/links that diagram expects.

import React, { useMemo, useState } from 'react';
import { CountryData } from '../services/worldbank';
import { formatNumber } from '../data/technologyIndicators';
import FlowDiagram, { type FlowColumn, type FlowNode, type FlowLink } from './charts/FlowDiagram';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

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

// Node heights are driven by each metric's value as a share of a plausible
// ceiling, because the raw units (% of GDP, patent counts, $bn) are not
// comparable. These ceilings are rough global maxima, not data.
const CEILINGS = {
  rdSpending: 5,
  stemGraduates: 40,
  patents: 500_000,
  publications: 500_000,
  researchers: 10_000,
  hightechExports: 40,
  techEmployment: 10,
  vcFunding: 350,
} as const;

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
  selectedYear,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const columnColors = {
    input: isDarkMode ? '#3B82F6' : '#2563EB',
    process: isDarkMode ? '#8B5CF6' : '#7C3AED',
    output: isDarkMode ? '#10B981' : '#059669',
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    [rdSpending, stemGraduates, patentData, hightechExports].forEach(data => {
      if (data?.length) {
        const yearData = data.find(d => d.year === selectedYear) || data[data.length - 1];
        if (yearData) {
          Object.keys(yearData).forEach(k => {
            if (k !== 'year' && typeof yearData[k] === 'number') countries.add(k);
          });
        }
      }
    });
    return Array.from(countries).sort();
  }, [rdSpending, stemGraduates, patentData, hightechExports, selectedYear]);

  const values = useMemo(() => {
    const read = (data: CountryData[]): number => {
      if (!data?.length) return 0;
      const yearData = data.find(d => d.year === selectedYear) || data[data.length - 1];
      if (!yearData) return 0;
      const value = yearData[selectedCountry];
      return typeof value === 'number' ? value : 0;
    };
    return {
      rdSpending: read(rdSpending),
      stemGraduates: read(stemGraduates),
      patents: read(patentData),
      publications: read(scientificPublications),
      researchers: read(researchersData),
      hightechExports: read(hightechExports),
      techEmployment: read(techEmployment),
      vcFunding: read(vcFunding),
    };
  }, [rdSpending, stemGraduates, patentData, scientificPublications, researchersData, hightechExports, techEmployment, vcFunding, selectedCountry, selectedYear]);

  const columns: FlowColumn[] = [
    { id: 'input',   label: 'Inputs',          color: columnColors.input },
    { id: 'process', label: 'Research output',  color: columnColors.process },
    { id: 'output',  label: 'Outcomes',         color: columnColors.output },
  ];

  const nodes: FlowNode[] = useMemo(() => {
    const share = (value: number, ceiling: number) => (ceiling > 0 ? Math.min(value / ceiling, 1) : 0);
    return [
      { id: 'rdSpending',      label: 'R&D spending',     column: 'input',   value: share(values.rdSpending, CEILINGS.rdSpending),           valueLabel: `${values.rdSpending.toFixed(1)}% GDP` },
      { id: 'stemGraduates',   label: 'STEM graduates',   column: 'input',   value: share(values.stemGraduates, CEILINGS.stemGraduates),     valueLabel: `${values.stemGraduates.toFixed(1)}% of grads` },
      { id: 'patents',         label: 'Patents',          column: 'process', value: share(values.patents, CEILINGS.patents),                 valueLabel: formatNumber(values.patents) },
      { id: 'publications',    label: 'Publications',     column: 'process', value: share(values.publications, CEILINGS.publications),       valueLabel: formatNumber(values.publications) },
      { id: 'researchers',     label: 'Researchers',      column: 'process', value: share(values.researchers, CEILINGS.researchers),         valueLabel: `${formatNumber(values.researchers)}/M people` },
      { id: 'hightechExports', label: 'High-tech exports',column: 'output',  value: share(values.hightechExports, CEILINGS.hightechExports), valueLabel: `${values.hightechExports.toFixed(1)}% of exports` },
      { id: 'techEmployment',  label: 'Tech employment',  column: 'output',  value: share(values.techEmployment, CEILINGS.techEmployment),   valueLabel: `${values.techEmployment.toFixed(1)}% of jobs` },
      { id: 'vcFunding',       label: 'VC funding',       column: 'output',  value: share(values.vcFunding, CEILINGS.vcFunding),             valueLabel: `$${values.vcFunding.toFixed(1)}B` },
    ];
  }, [values]);

  // Ribbon weights are a stylised account of how innovation inputs feed
  // outputs, not measured flows — there is no dataset that traces a specific
  // R&D dollar to a specific patent.
  const links: FlowLink[] = [
    { source: 'rdSpending',    target: 'patents',         value: 0.5 },
    { source: 'rdSpending',    target: 'publications',    value: 0.3 },
    { source: 'rdSpending',    target: 'researchers',     value: 0.2 },
    { source: 'stemGraduates', target: 'researchers',     value: 0.4 },
    { source: 'stemGraduates', target: 'patents',         value: 0.3 },
    { source: 'stemGraduates', target: 'publications',    value: 0.3 },
    { source: 'patents',       target: 'hightechExports', value: 0.5 },
    { source: 'patents',       target: 'vcFunding',       value: 0.5 },
    { source: 'publications',  target: 'hightechExports', value: 0.3 },
    { source: 'publications',  target: 'techEmployment',  value: 0.7 },
    { source: 'researchers',   target: 'techEmployment',  value: 0.6 },
    { source: 'researchers',   target: 'hightechExports', value: 0.4 },
  ];

  return (
    <div id={slugify('Tech Ecosystem Flow')} className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>Tech Ecosystem Flow</h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Innovation pipeline from inputs to outcomes ({selectedYear})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="tech-flow-country">Country</label>
          <select
            id="tech-flow-country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            }`}
          >
            {availableCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <SocialShareMenu title="Tech Ecosystem Flow" isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-4">
        {[
          { color: columnColors.input,   label: 'Inputs (investment)' },
          { color: columnColors.process, label: 'Process (research output)' },
          { color: columnColors.output,  label: 'Outcomes (economic impact)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: l.color }} />
            <span className={`text-sm ${themeColors.textSecondary}`}>{l.label}</span>
          </div>
        ))}
      </div>

      <FlowDiagram
        isDarkMode={isDarkMode}
        columns={columns}
        nodes={nodes}
        links={links}
        ariaLabel={`Innovation pipeline for ${selectedCountry} in ${selectedYear}, from R&D spending and STEM graduates through patents, publications and researchers to high-tech exports, tech employment and venture capital.`}
      />

      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
          {selectedCountry} innovation pipeline summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className={themeColors.textTertiary}>Total R&D investment</p>
            <p className={`font-medium ${themeColors.text}`}>{values.rdSpending.toFixed(2)}% of GDP</p>
          </div>
          <div>
            <p className={themeColors.textTertiary}>Research output</p>
            <p className={`font-medium ${themeColors.text}`}>{formatNumber(values.patents + values.publications)} patents + publications</p>
          </div>
          <div>
            <p className={themeColors.textTertiary}>Workforce</p>
            <p className={`font-medium ${themeColors.text}`}>{formatNumber(values.researchers)} researchers per million</p>
          </div>
          <div>
            <p className={themeColors.textTertiary}>Economic output</p>
            <p className={`font-medium ${themeColors.text}`}>{values.hightechExports.toFixed(1)}% high-tech exports</p>
          </div>
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
        <p className={`text-xs ${themeColors.textTertiary}`}>
          Node size is each metric as a share of a plausible global ceiling, because the underlying
          units are not comparable with each other. The ribbons are a stylised account of how inputs
          feed outputs — no dataset traces a specific R&amp;D dollar to a specific patent — so read
          them as structure, not measurement. Hover or tab to a node to highlight its connections.
        </p>
      </div>
    </div>
  );
};

export default TechFlowSankey;
