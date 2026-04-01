'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  historicalMarketData,
  globalMarketClock,
  minskyPhases,
  getBuffettIndicatorZone,
  getCAPEZone,
} from '../data/marketCyclesData';
import {
  cycleIndicators,
  getCurrentCyclePhase,
  crisisEvents,
} from '../data/economicCycles';

interface CycleReportGeneratorProps {
  isDarkMode: boolean;
}

const CycleReportGenerator: React.FC<CycleReportGeneratorProps> = ({ isDarkMode }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const currentPhase = getCurrentCyclePhase();
  const latestMarketData = historicalMarketData[historicalMarketData.length - 1];
  const buffettZone = latestMarketData.buffettIndicator
    ? getBuffettIndicatorZone(latestMarketData.buffettIndicator)
    : null;
  const capeZone = latestMarketData.shillerCAPE
    ? getCAPEZone(latestMarketData.shillerCAPE)
    : null;

  const recentCrises = crisisEvents
    .filter((c) => c.year >= 2000)
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);

  const getIndicatorStatus = (indicator: {
    currentValue: number;
    warningThreshold: number;
    dangerThreshold: number;
  }): 'normal' | 'warning' | 'danger' => {
    const { currentValue, warningThreshold, dangerThreshold } = indicator;
    if (dangerThreshold > warningThreshold) {
      if (currentValue >= dangerThreshold) return 'danger';
      if (currentValue >= warningThreshold) return 'warning';
      return 'normal';
    }
    if (currentValue <= dangerThreshold) return 'danger';
    if (currentValue <= warningThreshold) return 'warning';
    return 'normal';
  };

  const statusColors: Record<string, string> = {
    normal: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  const getRiskScore = (): number => {
    let score = 0;
    for (const ind of cycleIndicators) {
      const status = getIndicatorStatus(ind);
      if (status === 'warning') score += 1;
      if (status === 'danger') score += 2;
    }
    return Math.min(Math.round((score / (cycleIndicators.length * 2)) * 100), 100);
  };

  const getRiskAssessment = (score: number): string => {
    if (score < 25) return 'Low risk — conditions broadly favorable';
    if (score < 50) return 'Moderate risk — some indicators warrant monitoring';
    if (score < 75) return 'Elevated risk — multiple warning signals present';
    return 'High risk — conditions consistent with late-cycle stress';
  };

  const currentMinskyPhase = (): string => {
    const riskScore = getRiskScore();
    if (riskScore < 30) return minskyPhases[0].name;
    if (riskScore < 65) return minskyPhases[1].name;
    return minskyPhases[2].name;
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const reportElement = reportRef.current;
      if (!reportElement) return;

      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px';
      reportElement.style.display = 'block';
      reportElement.style.width = '800px';

      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: false,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`cycle-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      if (reportRef.current) {
        reportRef.current.style.display = 'none';
      }
      setIsGenerating(false);
    }
  };

  const riskScore = getRiskScore();
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sectionTitle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
    borderBottom: '2px solid #3b82f6',
    paddingBottom: '6px',
    marginBottom: '12px',
    marginTop: '24px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    marginBottom: '16px',
  };

  const thStyle: React.CSSProperties = {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '6px 8px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#334155',
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    padding: '5px 8px',
    color: '#1e293b',
  };

  return (
    <>
      <button
        onClick={generateReport}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-all ${
          isGenerating
            ? 'opacity-70 cursor-not-allowed bg-blue-500'
            : isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isGenerating ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        {isGenerating ? 'Generating...' : 'Generate Cycle Report'}
      </button>

      <div ref={reportRef} style={{ display: 'none' }}>
        <div
          style={{
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '40px',
            maxWidth: '800px',
            lineHeight: 1.5,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Global Economic &amp; Market Cycle Report
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              Generated {reportDate}
            </p>
            <div
              style={{
                height: '3px',
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                marginTop: '16px',
                borderRadius: '2px',
              }}
            />
          </div>

          {/* Section 1: Current Cycle Phase */}
          <div style={sectionTitle}>1. Current Cycle Phase</div>
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            {currentPhase ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                      {currentPhase.name}
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: '10px',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: riskScore >= 50 ? '#fef2f2' : '#f0fdf4',
                        color: riskScore >= 50 ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {currentPhase.phase.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Risk Score</div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        color: riskScore >= 75 ? '#dc2626' : riskScore >= 50 ? '#f59e0b' : '#16a34a',
                      }}
                    >
                      {riskScore}/100
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '10px', marginBottom: '6px' }}>
                  {currentPhase.description}
                </p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  Assessment: {getRiskAssessment(riskScore)}
                </p>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Minsky Stage: {currentMinskyPhase()} | Interest Rates: {currentPhase.interestRateTrend} | Debt Trend: {currentPhase.debtTrend}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                No matching cycle phase for the current year.
              </p>
            )}
          </div>

          {/* Section 2: Key Indicators */}
          <div style={sectionTitle}>2. Key Indicators</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Indicator</th>
                <th style={thStyle}>Current</th>
                <th style={thStyle}>Historical Avg</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cycleIndicators.map((ind, i) => {
                const status = getIndicatorStatus(ind);
                return (
                  <tr key={i}>
                    <td style={tdStyle}>{ind.name}</td>
                    <td style={tdStyle}>
                      {ind.currentValue}
                      {ind.unit !== 'ratio' ? ind.unit : ''}
                    </td>
                    <td style={tdStyle}>
                      {ind.historicalAverage}
                      {ind.unit !== 'ratio' ? ind.unit : ''}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: statusColors[status],
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Section 3: Market Valuation */}
          <div style={sectionTitle}>3. Market Valuation</div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                Buffett Indicator (Market Cap / GDP)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
                {latestMarketData.buffettIndicator ?? 'N/A'}%
              </div>
              {buffettZone && (
                <>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: buffettZone.color + '20',
                      color: buffettZone.color,
                    }}
                  >
                    {buffettZone.label}
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                    {buffettZone.assessment}
                  </p>
                </>
              )}
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                Shiller CAPE Ratio
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
                {latestMarketData.shillerCAPE ?? 'N/A'}
              </div>
              {capeZone && (
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: capeZone.color + '20',
                    color: capeZone.color,
                  }}
                >
                  {capeZone.label}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Global Market Positions */}
          <div style={sectionTitle}>4. Global Market Positions</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Phase</th>
                <th style={thStyle}>GDP Growth</th>
                <th style={thStyle}>Inflation</th>
                <th style={thStyle}>Policy</th>
              </tr>
            </thead>
            <tbody>
              {globalMarketClock.map((market, i) => {
                const phaseColors: Record<string, string> = {
                  early: '#16a34a',
                  mid: '#2563eb',
                  late: '#d97706',
                  recession: '#dc2626',
                };
                return (
                  <tr key={i}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{market.country}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color: phaseColors[market.phase] || '#334155',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {market.phase}
                    </td>
                    <td style={tdStyle}>{market.gdpGrowth}%</td>
                    <td style={tdStyle}>{market.inflationRate}%</td>
                    <td
                      style={{
                        ...tdStyle,
                        textTransform: 'capitalize',
                      }}
                    >
                      {market.policyStance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Section 5: Historical Analogies */}
          <div style={sectionTitle}>5. Historical Analogies</div>
          <p style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>
            Recent crisis events that inform current cycle positioning:
          </p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Year</th>
                <th style={thStyle}>Event</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>GDP Impact</th>
              </tr>
            </thead>
            <tbody>
              {recentCrises.map((crisis, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{crisis.year}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{crisis.name}</td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{crisis.type}</td>
                  <td style={tdStyle}>{crisis.severity}/5</td>
                  <td style={tdStyle}>
                    {crisis.gdpDecline ? `-${crisis.gdpDecline}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '10px',
              color: '#94a3b8',
              lineHeight: 1.6,
            }}
          >
            <p style={{ fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Disclaimer</p>
            <p>
              This report is generated from static reference data and publicly available economic
              indicators. It does not constitute financial advice. Past cycle patterns do not
              guarantee future outcomes. Always consult qualified financial professionals before
              making investment decisions.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
              }}
            >
              <span>Generated: {reportDate}</span>
              <span>
                Sources: Federal Reserve, IMF, World Bank, Robert Shiller, Minsky Framework
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CycleReportGenerator;
