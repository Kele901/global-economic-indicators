# FRED API Integration for US Economic Data

## Overview

The application now integrates with the Federal Reserve Economic Data (FRED) API to provide comprehensive, high-quality US economic data from 1960 onwards. This supplements the World Bank API data and ensures complete US coverage across all metrics.

## Implementation Details

### Files Created/Modified

1. **`src/app/services/fred.ts`** (NEW)
   - FRED API service for fetching US-specific economic data
   - Includes caching, retry logic, and error handling
   - Fetches 14 different economic indicators for the USA

2. **`src/app/services/worldbank.ts`** (MODIFIED)
   - Updated to merge FRED data with World Bank data
   - USA data now comes from FRED (more reliable and complete)
   - Other countries continue to use World Bank data

### FRED Series Used

The following FRED series IDs are used for US economic indicators:

- **Interest Rates**: `INTDSRUSM193N` - Discount Rate for United States
- **Unemployment Rate**: `UNRATE` - Civilian Unemployment Rate
- **Employment Rate**: `EMRATIO` - Employment-Population Ratio
- **Inflation Rate**: `FPCPITOTLZGUSA` - Inflation, Consumer Prices
- **GDP Growth**: `A191RL1Q225SBEA` - Real GDP Growth Rate
- **CPI**: `CPIAUCSL` - Consumer Price Index for All Urban Consumers
- **Government Debt**: `GFDEGDQ188S` - Federal Debt as % of GDP
- **Population Growth**: `SPPOPGROWUSA` - Population Growth Rate
- **FDI**: `ROWFDIQ027S` - Foreign Direct Investment in US
- **Trade Balance**: `BOPGSTB` - Trade Balance: Goods and Services
- **Government Spending**: `GCEC1` - Government Consumption Expenditures
- **Labor Productivity**: `OPHNFB` - Nonfarm Business: Real Output Per Hour
- **R&D Spending**: `Y694RC1Q027SBEA` - Research and Development Expenditures
- **Energy Consumption**: `ENEUC` - Energy Consumption

### How It Works

1. **Data Fetching**: When the app loads, it fetches data from both:
   - World Bank API (for all countries including US)
   - FRED API (specifically for US data)

2. **Data Merging**: The `mergeUSADataFromFRED()` function:
   - Takes World Bank data and FRED data as inputs
   - Creates a comprehensive dataset by year
   - Prioritizes FRED data for USA (adds missing years, fills gaps)
   - Preserves World Bank data for other countries

3. **Caching**: Both FRED and World Bank data are cached for 24 hours
   - Reduces API calls
   - Improves performance
   - Synchronized cache clearing

### API Key Configuration

The FRED API key is configured with a fallback:
- Primary: `process.env.NEXT_PUBLIC_FRED_API_KEY`
- Fallback: Hardcoded key in `fred.ts`

**Your API Key**: `30008945655d5ff4d1ade8c836f86dea`

### Benefits

✅ **Complete US Data Coverage**: Data from 1960 onwards for all metrics  
✅ **Higher Quality**: Official US government source (Federal Reserve)  
✅ **Better Reliability**: FRED API is more stable than World Bank for US data  
✅ **Seamless Integration**: No changes needed to UI components  
✅ **Automatic Fallback**: If FRED fails, World Bank data is still used  
✅ **Performance**: Cached data reduces API calls  

### Testing

To verify the integration is working:

1. **Clear Cache**: Refresh the data using the refresh button on the dashboard
2. **Check Console**: Look for these log messages:
   ```
   Fetching supplementary US data from FRED...
   FRED: Found X years of data for [series_id]
   FRED merge: Added X new years, updated X existing years for USA
   ```
3. **Verify Data**: Check that USA data appears in all charts from 1960 onwards

### Console Logs to Monitor

The integration adds several helpful console logs:

- `"Fetching supplementary US data from FRED..."` - FRED fetch initiated
- `"FRED: Found X years of data for [series]"` - Data retrieved per series
- `"FRED merge: Added X new years, updated X existing years for USA"` - Merge results
- `"Cleared all cached economic data (World Bank + FRED)"` - Cache cleared

### Troubleshooting

**If US data is still missing:**

1. Check browser console for FRED API errors
2. Verify API key is correct (30008945655d5ff4d1ade8c836f86dea)
3. Clear cache and refresh
4. Check FRED API status: https://fred.stlouisfed.org/

**Common Issues:**

- **Rate Limiting**: FRED API has rate limits. Caching prevents this.
- **Network Errors**: Retry logic handles temporary failures
- **Invalid Series ID**: Check FRED documentation for valid series

### Future Enhancements

Possible improvements for future versions:

1. Add more FRED series for additional metrics
2. Implement real-time data updates
3. Add user preference to choose data source
4. Display data source indicators in tooltips
5. Add FRED data for other countries if available

### API Documentation

- **FRED API Docs**: https://fred.stlouisfed.org/docs/api/fred/
- **Series Search**: https://fred.stlouisfed.org/
- **Rate Limits**: 120 requests per minute

---

## Date Implemented

November 17, 2024

## Integration Status

✅ **COMPLETE AND ACTIVE**

The FRED integration is now live and will automatically fetch US data on every app load (with 24-hour caching).

