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
    console.log('Starting image download for element:', chartElement);
    console.log('Element dimensions:', chartElement.offsetWidth, 'x', chartElement.offsetHeight);
    
    // Verify the element has content
    if (chartElement.offsetWidth === 0 || chartElement.offsetHeight === 0) {
      throw new Error('Chart element has no dimensions. Please ensure the chart is fully loaded.');
    }
    
    // Temporarily hide any dropdowns or overlays that might interfere with the chart
    const originalOverflow = document.body.style.overflow;
    const originalZIndex = document.body.style.zIndex;
    
    // Hide any open dropdowns or modals
    const dropdowns = document.querySelectorAll('[data-chart-download-dropdown]');
    const originalDropdownStyles: { element: Element; display: string }[] = [];
    
    dropdowns.forEach(dropdown => {
      const element = dropdown as HTMLElement;
      originalDropdownStyles.push({
        element,
        display: element.style.display
      });
      element.style.display = 'none';
    });
    
    // Ensure the chart element is fully visible
    const originalChartZIndex = chartElement.style.zIndex;
    chartElement.style.zIndex = '9999';
    
    try {
      // Small delay to ensure any animations or transitions are complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try to find the actual chart canvas/svg element within the container
      let chartContentElement = chartElement;
      const chartCanvas = chartElement.querySelector('canvas');
      const chartSvg = chartElement.querySelector('svg');
      
      console.log('Found chart elements - Canvas:', !!chartCanvas, 'SVG:', !!chartSvg);
      
      // If we find a canvas or SVG, use that for better quality
      if (chartCanvas) {
        chartContentElement = chartCanvas as HTMLElement;
        console.log('Using canvas element for capture');
      } else if (chartSvg) {
        chartContentElement = chartSvg as HTMLElement;
        console.log('Using SVG element for capture');
      } else {
        console.log('Using container element for capture');
      }
      
      console.log('Capturing chart with element:', chartContentElement);
      console.log('Content element dimensions:', chartContentElement.offsetWidth, 'x', chartContentElement.offsetHeight);
      
      // Try to capture the chart with html2canvas
      let canvas;
      try {
        console.log('Attempting primary html2canvas capture...');
        canvas = await html2canvas(chartContentElement, {
          backgroundColor: options.backgroundColor || '#ffffff',
          scale: 1, // Start with scale 1 for testing
          useCORS: false,
          allowTaint: false,
          logging: true, // Enable logging for debugging
          // Focus on the chart content only
          width: chartContentElement.offsetWidth || chartElement.offsetWidth,
          height: chartContentElement.offsetHeight || chartElement.offsetHeight
        });
        console.log('Primary capture successful');
      } catch (html2canvasError) {
        console.error('Primary html2canvas failed, trying with minimal options:', html2canvasError);
        
        try {
          // Fallback: try with absolute minimal options
          console.log('Attempting fallback capture...');
          canvas = await html2canvas(chartContentElement, {
            backgroundColor: options.backgroundColor || '#ffffff',
            scale: 1,
            useCORS: false,
            allowTaint: false,
            logging: true,
            removeContainer: false,
            foreignObjectRendering: false
          });
          console.log('Fallback capture successful');
        } catch (fallbackError) {
          console.error('Fallback html2canvas also failed:', fallbackError);
          
          // Last resort: try to capture the entire chart container
          console.log('Trying to capture entire chart container as last resort...');
          canvas = await html2canvas(chartElement, {
            backgroundColor: options.backgroundColor || '#ffffff',
            scale: 1,
            useCORS: false,
            allowTaint: false,
            logging: true,
            removeContainer: false,
            foreignObjectRendering: false
          });
          console.log('Last resort capture successful');
        }
      }

      console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);
      
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
      console.log('Download link clicked for:', filename);
    } finally {
      // Restore original styles
      chartElement.style.zIndex = originalChartZIndex;
      
      // Restore dropdown visibility
      originalDropdownStyles.forEach(({ element, display }) => {
        (element as HTMLElement).style.display = display;
      });
      
      // Restore body styles
      document.body.style.overflow = originalOverflow;
      document.body.style.zIndex = originalZIndex;
    }
  } catch (error) {
    console.error('Error downloading chart as image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to download chart as image: ${error.message}`);
    } else {
      throw new Error('Failed to download chart as image: Unknown error');
    }
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
    console.log('Starting PDF download for element:', chartElement);
    console.log('Element dimensions:', chartElement.offsetWidth, 'x', chartElement.offsetHeight);
    
    // Verify the element has content
    if (chartElement.offsetWidth === 0 || chartElement.offsetHeight === 0) {
      throw new Error('Chart element has no dimensions. Please ensure the chart is fully loaded.');
    }
    
    // Temporarily hide any dropdowns or overlays that might interfere with the chart
    const originalOverflow = document.body.style.overflow;
    const originalZIndex = document.body.style.zIndex;
    
    // Hide any open dropdowns or modals
    const dropdowns = document.querySelectorAll('[data-chart-download-dropdown]');
    const originalDropdownStyles: { element: Element; display: string }[] = [];
    
    dropdowns.forEach(dropdown => {
      const element = dropdown as HTMLElement;
      originalDropdownStyles.push({
        element,
        display: element.style.display
      });
      element.style.display = 'none';
    });
    
    // Ensure the chart element is fully visible
    const originalChartZIndex = chartElement.style.zIndex;
    chartElement.style.zIndex = '9999';
    
    try {
      // Small delay to ensure any animations or transitions are complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try to find the actual chart canvas/svg element within the container
      let chartContentElement = chartElement;
      const chartCanvas = chartElement.querySelector('canvas');
      const chartSvg = chartElement.querySelector('svg');
      
      console.log('Found chart elements for PDF - Canvas:', !!chartCanvas, 'SVG:', !!chartSvg);
      
      // If we find a canvas or SVG, use that for better quality
      if (chartCanvas) {
        chartContentElement = chartCanvas as HTMLElement;
        console.log('Using canvas element for PDF capture');
      } else if (chartSvg) {
        chartContentElement = chartSvg as HTMLElement;
        console.log('Using SVG element for PDF capture');
      } else {
        console.log('Using container element for PDF capture');
      }
      
      console.log('Capturing chart for PDF with element:', chartContentElement);
      console.log('Content element dimensions:', chartContentElement.offsetWidth, 'x', chartContentElement.offsetHeight);
      
      // Try to capture the chart with html2canvas for PDF
      let canvas;
      try {
        console.log('Attempting primary html2canvas capture for PDF...');
        canvas = await html2canvas(chartContentElement, {
          backgroundColor: options.backgroundColor || '#ffffff',
          scale: 1, // Start with scale 1 for testing
          useCORS: false,
          allowTaint: false,
          logging: true, // Enable logging for debugging
          // Focus on the chart content only
          width: chartContentElement.offsetWidth || chartElement.offsetWidth,
          height: chartContentElement.offsetHeight || chartElement.offsetHeight
        });
        console.log('Primary PDF capture successful');
      } catch (html2canvasError) {
        console.error('Primary html2canvas failed for PDF, trying with minimal options:', html2canvasError);
        
        try {
          // Fallback: try with absolute minimal options
          console.log('Attempting fallback PDF capture...');
          canvas = await html2canvas(chartContentElement, {
            backgroundColor: options.backgroundColor || '#ffffff',
            scale: 1,
            useCORS: false,
            allowTaint: false,
            logging: true,
            removeContainer: false,
            foreignObjectRendering: false
          });
          console.log('Fallback PDF capture successful');
        } catch (fallbackError) {
          console.error('Fallback html2canvas also failed for PDF:', fallbackError);
          
          // Last resort: try to capture the entire chart container
          console.log('Trying to capture entire chart container for PDF as last resort...');
          canvas = await html2canvas(chartElement, {
            backgroundColor: options.backgroundColor || '#ffffff',
            scale: 1,
            useCORS: false,
            allowTaint: false,
            logging: true,
            removeContainer: false,
            foreignObjectRendering: false
          });
          console.log('Last resort PDF capture successful');
        }
      }

      console.log('Canvas created successfully for PDF:', canvas.width, 'x', canvas.height);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const filename = options.filename || `chart-${Date.now()}`;
      pdf.save(`${filename}.pdf`);
      console.log('PDF saved successfully:', filename);
    } finally {
      // Restore original styles
      chartElement.style.zIndex = originalChartZIndex;
      
      // Restore dropdown visibility
      originalDropdownStyles.forEach(({ element, display }) => {
        (element as HTMLElement).style.display = display;
      });
      
      // Restore body styles
      document.body.style.overflow = originalOverflow;
      document.body.style.zIndex = originalZIndex;
    }
  } catch (error) {
    console.error('Error downloading chart as PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to download chart as PDF: ${error.message}`);
    } else {
      throw new Error('Failed to download chart as PDF: Unknown error');
    }
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
    console.log('downloadChart called with:', {
      element: chartElement,
      data: chartData,
      options
    });
    
    // Validate inputs
    if (!chartElement) {
      throw new Error('Chart element is required');
    }
    
    if (!chartData) {
      throw new Error('Chart data is required');
    }
    
    if (!options.format) {
      throw new Error('Download format is required');
    }
    
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
