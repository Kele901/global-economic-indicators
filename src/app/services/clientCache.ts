// Client-side caching utility for economic data
// This reduces API calls and improves performance

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class ClientCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours for economic data

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.DEFAULT_TTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });

    // Store in localStorage for persistence across sessions
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `cache_${key}`,
          JSON.stringify({ data, timestamp: now, expiresAt })
        );
      }
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error);
    }
  }

  /**
   * Get data from cache if not expired
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    let cached = this.cache.get(key);
    
    // If not in memory, try localStorage
    if (!cached && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          cached = JSON.parse(stored);
          if (cached) {
            this.cache.set(key, cached);
          }
        }
      } catch (error) {
        console.warn('Failed to read cache from localStorage:', error);
      }
    }

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to delete cache from localStorage:', error);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear cache from localStorage:', error);
      }
    }
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Get age of cache entry in milliseconds
   */
  getAge(key: string): number | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    return Date.now() - cached.timestamp;
  }

  /**
   * Check if cache entry is stale (older than threshold)
   */
  isStale(key: string, threshold: number = this.DEFAULT_TTL * 0.8): boolean {
    const age = this.getAge(key);
    return age !== null && age > threshold;
  }
}

// Export singleton instance
export const clientCache = new ClientCache();

// Cache version - increment this when data structure changes or new data sources are added
// Version History:
// v1: Initial version with World Bank data only
// v2: Added FRED integration for US data
// v3: Added 16 additional economic indicators (GDP per capita PPP, current account, etc.)
// v4: Added BIS (Bank for International Settlements) integration
// v5: Enhanced OECD integration with policy rates
// v9: Added IP receipts/payments to cultural data
// v10: Added Tier 1+2 dashboard indicators (WGI governance, demographics, health,
//      resource rents, income shares, palma ratio, external debt, REER, PM2.5,
//      OECD long-term rates, OECD house prices, derived real policy rate & term spread).
//      Also extended World Bank fetch window from :2024 to :2026 so newly-published
//      2025 data is picked up automatically.
// v11: Fixed empty Term Spread chart - switched long-term rate source from broken
//      OECD SDMX key (IRLT.LT) to FRED IRLTLT01XXM156N series (~20 countries),
//      with OECD as fallback for non-FRED-covered economies.
// v12: Fixed empty WGI governance charts - World Bank archived legacy CC.EST /
//      GE.EST / PV.EST / RQ.EST / RL.EST / VA.EST codes in 2024 and moved WGI to
//      a dedicated database. Switched to new GOV_WGI_*.EST codes with source=3.
// v13: Fixed empty Bottom 40% / Palma charts (replaced invalid SI.DST.FRST.40
//      with quintile sum SI.DST.FRST.20 + SI.DST.02ND.20) and empty OECD housing
//      charts (corrected SDMX dimension order to FREQ.REF_AREA.MEASURE.… and
//      switched measure code from RPI → RHPI for the real house price index).
// v14: Re-fixed empty housing charts - OECD renamed the dataset to
//      DSD_AN_HOUSE_PRICES@DF_HOUSE_PRICES (analytical), and the actual
//      dimension order is REF_AREA.FREQ.MEASURE.UNIT_MEASURE (no FREQ-first).
//      Measure codes are RHP (real house price index) and HPI_YDH (price-to-
//      income ratio), with UNIT_MEASURE = IX (index).
// v15: OECD SDMX endpoint for house prices still returns 404 - migrated to
//      FRED-hosted BIS Residential Property Prices (Q{ISO2}R628BIS / N628BIS).
//      Repurposed Price-to-Income chart as Nominal House Price Index, so both
//      housing charts now share a single reliable source (BIS via FRED).
// v16: Resource Atlas launch. Extended fetchGlobalData with 7 new World Bank
//      indicators (coal / gas / forest rents, net energy imports, fuel &
//      ores/metals exports, electricity access). Added FRED commodity price
//      series (WTI, Brent, Henry Hub, EU gas, coal, gold, copper, aluminium,
//      iron ore, nickel, wheat) and EIA-with-static-fallback for oil reserves
//      and production. Existing users need cache invalidated so new fields
//      populate.
export const CURRENT_CACHE_VERSION = 16;

// Export cache key generators for consistency
export const CacheKeys = {
  worldBankIndicator: (indicator: string) => `wb_${indicator}`,
  worldBankAll: () => 'wb_all_data',
  tradeData: (countries: string[]) => `trade_${countries.sort().join('_')}`,
  forexRates: () => 'forex_rates',
  lastUpdate: () => 'last_update_timestamp',
  cacheVersion: () => 'cache_version',
  
  // BIS cache keys
  bisPolicyRates: () => 'bis_policy_rates',
  bisJapanPolicyRates: () => 'bis_japan_policy_rates',
  
  // OECD cache keys
  oecdPolicyRates: () => 'oecd_policy_rates',
  oecdJapanPolicyRates: () => 'oecd_japan_policy_rates',
  oecdGovernmentDebt: () => 'oecd_government_debt',
  oecdJapanGovernmentDebt: () => 'oecd_japan_gov_debt',
  
  // IMF cache keys
  imfGovernmentDebt: () => 'imf_government_debt',
  imfJapanGovernmentDebt: () => 'imf_japan_gov_debt',
  imfInterestRates: () => 'imf_interest_rates',
  
  // FRED cache keys
  fredSeries: (seriesId: string) => `fred_${seriesId}`,
  
  // Policy rates cache keys
  policyRate: (country: string) => `policy_rate_${country}`,

  // Resource Atlas cache keys (v16)
  commodity: (id: string) => `commodity_${id}`,
  eiaOilReserves: () => 'eia_oil_reserves',
  eiaOilProduction: () => 'eia_oil_production',
};
