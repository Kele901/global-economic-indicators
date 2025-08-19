# Chart Download Features

This application now includes comprehensive chart download functionality that allows users to download all graphs in multiple formats.

## Features

### Individual Chart Downloads
- Each chart now has a download button in the top-right corner
- Supports multiple formats: PNG, JPG, PDF, and CSV
- Downloads are named automatically based on the chart title
- High-quality image exports with configurable resolution

### Bulk Download
- "Download All Charts" button available in the main header of each page
- Automatically detects all charts on the current page
- Downloads all charts in the selected format
- Shows count of charts found before downloading

## Supported Formats

### Image Formats (PNG/JPG)
- High-resolution exports (2x scale by default)
- Configurable quality settings
- Background color customization
- Perfect for presentations and reports

### PDF Format
- Landscape orientation for optimal chart display
- Professional document format
- Suitable for printing and sharing

### CSV Format
- Raw data export for analysis
- Includes all chart data points
- Compatible with Excel, Google Sheets, and other tools
- Year column always appears first for chronological sorting

## Usage

### Individual Chart Download
1. Look for the download button (📥) in the top-right corner of any chart
2. Click the button to open the download options
3. Select your preferred format (PNG, JPG, PDF, or CSV)
4. Click "Download Now"
5. The file will be saved to your default downloads folder

### Bulk Download
1. Find the "Download All Charts" button in the page header
2. Click to open bulk download options
3. Select your preferred format
4. Click "Download All"
5. All charts will be downloaded sequentially with a small delay between each

## Technical Implementation

### Components
- `ChartDownloadButton`: Individual chart download button
- `BulkChartDownload`: Bulk download functionality
- `chartDownload.ts`: Core download utilities

### Dependencies
- `html2canvas`: For converting charts to images
- `jsPDF`: For PDF generation
- Native browser APIs for CSV export

### Data Attributes
Charts are automatically detected using these HTML attributes:
- `data-chart-container`: Identifies chart containers
- `data-chart-title`: Provides chart titles for file naming

## Supported Pages

The download functionality is available on all major pages:
- **Global Economic Indicators**: Main dashboard with multiple economic metrics
- **Country Comparison Dashboard**: Side-by-side country comparisons
- **Inflation Page**: Detailed inflation analysis with city-specific data

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers may have limited PDF support

## File Naming Convention

Files are automatically named using this pattern:
- Individual charts: `{chart-title}-{timestamp}.{extension}`
- Bulk downloads: `{chart-title}.{extension}`

## Performance Notes

- Image downloads are processed client-side for immediate results
- PDF generation may take a few seconds for complex charts
- Bulk downloads include delays between files to prevent browser issues
- Large charts may require more memory and processing time

## Troubleshooting

### Common Issues
1. **Download fails**: Check browser permissions and try refreshing the page
2. **PDF not working**: Ensure you're using a modern browser with PDF support
3. **Large file sizes**: PNG files are larger than JPG; use JPG for web sharing
4. **CSV formatting**: Open CSV files in a spreadsheet application for proper formatting

### Best Practices
- Use PNG for high-quality images and printing
- Use JPG for web sharing and smaller file sizes
- Use PDF for professional documents and presentations
- Use CSV for data analysis and further processing

## Future Enhancements

Planned improvements include:
- ZIP file creation for bulk downloads
- Custom chart dimensions
- Batch format conversion
- Cloud storage integration
- Advanced chart customization options
