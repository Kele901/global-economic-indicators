'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

interface ChartDownloadMenuProps {
  chartRef: React.RefObject<HTMLDivElement>;
  data: any[];
  filename: string;
  title: string;
  isDarkMode: boolean;
}

const ChartDownloadMenu: React.FC<ChartDownloadMenuProps> = ({
  chartRef,
  data,
  filename,
  title,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sanitizeFilename = (name: string) =>
    name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

  const downloadCSV = () => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]).filter(k => k !== 'color' && k !== 'fill');
    const header = keys.join(',');
    const rows = data.map(row =>
      keys
        .map(k => {
          const val = row[k];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string' && (val.includes(',') || val.includes('"')))
            return `"${val.replace(/"/g, '""')}"`;
          return val;
        })
        .join(',')
    );
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(filename)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const downloadJPG = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(filename)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('JPG export failed:', err);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const downloadPDF = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const landscape = canvas.width > canvas.height;
      const pdf = new jsPDF({
        orientation: landscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;

      pdf.setFontSize(14);
      pdf.text(title, pageW / 2, 15, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(
        `Global Economic Indicators — ${new Date().toLocaleDateString()}`,
        pageW / 2,
        21,
        { align: 'center' }
      );
      pdf.setTextColor(0);

      const finalH = Math.min(imgH, pageH - 35);
      pdf.addImage(imgData, 'PNG', 10, 28, imgW, finalH);
      pdf.save(`${sanitizeFilename(filename)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const menuItems = [
    { label: 'CSV', sublabel: 'Spreadsheet', color: 'text-green-500', action: downloadCSV },
    { label: 'PDF', sublabel: 'Document', color: 'text-red-500', action: downloadPDF },
    { label: 'JPG', sublabel: 'Image', color: 'text-blue-500', action: downloadJPG },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`p-1.5 rounded-lg transition-all ${
          isDarkMode
            ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
        } ${isExporting ? 'animate-pulse' : ''}`}
        title="Download chart"
      >
        <Download className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 z-50 rounded-lg shadow-xl border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          } overflow-hidden min-w-[150px]`}
        >
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              disabled={isExporting}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className={`${item.color} font-mono text-xs font-bold w-7`}>
                {item.label}
              </span>
              <span>{item.sublabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartDownloadMenu;
