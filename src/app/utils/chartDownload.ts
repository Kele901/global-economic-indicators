import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ChartDownloadOptions {
  format: 'png' | 'jpg' | 'pdf' | 'csv';
  filename?: string;
  quality?: number;
  backgroundColor?: string;
}

export interface ChartData {
  title: string;
  data: any[];
  type: 'line' | 'area' | 'bar' | 'composed';
  countries?: string[];
}

/**
 * Downloads a chart as an image (PNG or JPG)
 */
export const downloadChartAsImage = async (
  chartElement: HTMLElement,
  options: ChartDownloadOptions
): Promise<void> => {
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: options.quality || 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const link = document.createElement('a');
    const filename = options.filename || `chart-${Date.now()}`;
    
    if (options.format === 'png') {
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
    } else {
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', options.quality || 0.8);
    }
    
    link.click();
  } catch (error) {
    console.error('Error downloading chart as image:', error);
    throw new Error('Failed to download chart as image');
  }
};

/**
 * Downloads a chart as a PDF
 */
export const downloadChartAsPDF = async (
  chartElement: HTMLElement,
  options: ChartDownloadOptions
): Promise<void> => {
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    const imgWidth = 297; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    const filename = options.filename || `chart-${Date.now()}`;
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error downloading chart as PDF:', error);
    throw new Error('Failed to download chart as PDF');
  }
};

/**
 * Downloads chart data as CSV
 */
export const downloadChartAsCSV = (
  chartData: ChartData,
  options: ChartDownloadOptions
): void => {
  try {
    if (!chartData.data || chartData.data.length === 0) {
      throw new Error('No data available for CSV download');
    }

    // Get all unique keys from the data
    const keys = new Set<string>();
    chartData.data.forEach(item => {
      Object.keys(item).forEach(key => keys.add(key));
    });
    
    const sortedKeys = Array.from(keys).sort((a, b) => {
      if (a === 'year') return -1;
      if (b === 'year') return 1;
      return a.localeCompare(b);
    });

    // Create CSV content
    const csvContent = [
      // Header row
      sortedKeys.join(','),
      // Data rows
      ...chartData.data.map(item => 
        sortedKeys.map(key => {
          const value = item[key];
          // Handle null/undefined values and wrap strings in quotes
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value}"`;
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = options.filename || `${chartData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading chart as CSV:', error);
    throw new Error('Failed to download chart as CSV');
  }
};

/**
 * Main download function that handles all formats
 */
export const downloadChart = async (
  chartElement: HTMLElement,
  chartData: ChartData,
  options: ChartDownloadOptions
): Promise<void> => {
  try {
    switch (options.format) {
      case 'png':
      case 'jpg':
        await downloadChartAsImage(chartElement, options);
        break;
      case 'pdf':
        await downloadChartAsPDF(chartElement, options);
        break;
      case 'csv':
        downloadChartAsCSV(chartData, options);
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  } catch (error) {
    console.error('Error downloading chart:', error);
    throw error;
  }
};

/**
 * Downloads all charts on the page
 */
export const downloadAllCharts = async (
  chartSelector: string = '[data-chart-container]',
  options: ChartDownloadOptions = { format: 'png' }
): Promise<void> => {
  try {
    const chartElements = document.querySelectorAll(chartSelector);
    
    if (chartElements.length === 0) {
      throw new Error('No charts found to download');
    }

    // For multiple charts, we'll create a zip file or download them individually
    if (options.format === 'csv') {
      // For CSV, we'll need to get the data from each chart
      // This would require the chart components to expose their data
      throw new Error('Bulk CSV download not yet implemented');
    }

    // For images and PDFs, download each chart
    for (let i = 0; i < chartElements.length; i++) {
      const element = chartElements[i] as HTMLElement;
      const title = element.getAttribute('data-chart-title') || `chart-${i + 1}`;
      
      await downloadChart(element, { title, data: [], type: 'line' }, {
        ...options,
        filename: title
      });
      
      // Add a small delay between downloads to prevent browser issues
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Error downloading all charts:', error);
    throw error;
  }
};
