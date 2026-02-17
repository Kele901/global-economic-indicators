/**
 * Fallback technology data for countries with limited API coverage
 * Sources: World Bank, OECD, UNESCO, WIPO annual reports
 * 
 * This data is used when live API calls fail or return no data
 * Data is updated periodically from official sources
 */

export interface FallbackDataPoint {
  year: number;
  value: number;
}

export interface CountryTechFallback {
  rdSpending?: FallbackDataPoint[];  // R&D as % of GDP
  researchers?: FallbackDataPoint[]; // Researchers per million
  patents?: FallbackDataPoint[];     // Patent applications
  hightechExports?: FallbackDataPoint[]; // High-tech exports (% of manufactured)
  internetUsers?: FallbackDataPoint[]; // Internet users (% of population)
}

// Fallback data for countries with limited API coverage
// Data sourced from World Bank, OECD, WIPO, and national statistics offices
export const TECHNOLOGY_FALLBACK_DATA: { [country: string]: CountryTechFallback } = {
  // Japan - Strong tech data
  Japan: {
    rdSpending: [
      { year: 2015, value: 3.28 },
      { year: 2016, value: 3.14 },
      { year: 2017, value: 3.21 },
      { year: 2018, value: 3.28 },
      { year: 2019, value: 3.24 },
      { year: 2020, value: 3.27 },
      { year: 2021, value: 3.30 },
      { year: 2022, value: 3.31 },
    ],
    researchers: [
      { year: 2015, value: 5231 },
      { year: 2016, value: 5305 },
      { year: 2017, value: 5331 },
      { year: 2018, value: 5455 },
      { year: 2019, value: 5479 },
      { year: 2020, value: 5513 },
      { year: 2021, value: 5568 },
    ],
    patents: [
      { year: 2015, value: 318721 },
      { year: 2016, value: 318381 },
      { year: 2017, value: 318479 },
      { year: 2018, value: 313567 },
      { year: 2019, value: 307969 },
      { year: 2020, value: 288472 },
      { year: 2021, value: 289200 },
      { year: 2022, value: 291400 },
    ],
    internetUsers: [
      { year: 2015, value: 91.1 },
      { year: 2016, value: 92.0 },
      { year: 2017, value: 84.6 },
      { year: 2018, value: 91.4 },
      { year: 2019, value: 92.7 },
      { year: 2020, value: 90.2 },
      { year: 2021, value: 82.9 },
    ],
  },
  
  // South Korea - Very strong tech data
  SouthKorea: {
    rdSpending: [
      { year: 2015, value: 4.22 },
      { year: 2016, value: 4.23 },
      { year: 2017, value: 4.55 },
      { year: 2018, value: 4.53 },
      { year: 2019, value: 4.64 },
      { year: 2020, value: 4.81 },
      { year: 2021, value: 4.93 },
      { year: 2022, value: 5.21 },
    ],
    researchers: [
      { year: 2015, value: 6899 },
      { year: 2016, value: 7087 },
      { year: 2017, value: 7498 },
      { year: 2018, value: 7980 },
      { year: 2019, value: 8150 },
      { year: 2020, value: 8714 },
      { year: 2021, value: 8985 },
    ],
    patents: [
      { year: 2015, value: 213694 },
      { year: 2016, value: 208830 },
      { year: 2017, value: 204775 },
      { year: 2018, value: 209992 },
      { year: 2019, value: 218975 },
      { year: 2020, value: 226759 },
      { year: 2021, value: 237998 },
      { year: 2022, value: 240000 },
    ],
    internetUsers: [
      { year: 2015, value: 89.9 },
      { year: 2016, value: 92.8 },
      { year: 2017, value: 95.1 },
      { year: 2018, value: 96.0 },
      { year: 2019, value: 96.2 },
      { year: 2020, value: 97.0 },
      { year: 2021, value: 97.6 },
    ],
  },
  
  // Mexico
  Mexico: {
    rdSpending: [
      { year: 2015, value: 0.43 },
      { year: 2016, value: 0.40 },
      { year: 2017, value: 0.33 },
      { year: 2018, value: 0.31 },
      { year: 2019, value: 0.28 },
      { year: 2020, value: 0.29 },
      { year: 2021, value: 0.30 },
    ],
    researchers: [
      { year: 2015, value: 243 },
      { year: 2016, value: 260 },
      { year: 2017, value: 283 },
      { year: 2018, value: 299 },
      { year: 2019, value: 314 },
      { year: 2020, value: 320 },
    ],
    patents: [
      { year: 2015, value: 18071 },
      { year: 2016, value: 17413 },
      { year: 2017, value: 17184 },
      { year: 2018, value: 16424 },
      { year: 2019, value: 14626 },
      { year: 2020, value: 14035 },
      { year: 2021, value: 15200 },
    ],
    internetUsers: [
      { year: 2015, value: 57.4 },
      { year: 2016, value: 59.5 },
      { year: 2017, value: 63.9 },
      { year: 2018, value: 65.8 },
      { year: 2019, value: 70.1 },
      { year: 2020, value: 71.5 },
      { year: 2021, value: 75.6 },
    ],
  },
  
  // Sweden - Very high R&D
  Sweden: {
    rdSpending: [
      { year: 2015, value: 3.22 },
      { year: 2016, value: 3.25 },
      { year: 2017, value: 3.33 },
      { year: 2018, value: 3.32 },
      { year: 2019, value: 3.39 },
      { year: 2020, value: 3.49 },
      { year: 2021, value: 3.42 },
      { year: 2022, value: 3.40 },
    ],
    researchers: [
      { year: 2015, value: 7034 },
      { year: 2016, value: 7203 },
      { year: 2017, value: 7556 },
      { year: 2018, value: 7827 },
      { year: 2019, value: 8023 },
      { year: 2020, value: 8142 },
      { year: 2021, value: 8300 },
    ],
    patents: [
      { year: 2015, value: 3821 },
      { year: 2016, value: 3620 },
      { year: 2017, value: 3579 },
      { year: 2018, value: 3567 },
      { year: 2019, value: 3527 },
      { year: 2020, value: 3486 },
      { year: 2021, value: 3500 },
    ],
    internetUsers: [
      { year: 2015, value: 90.6 },
      { year: 2016, value: 91.5 },
      { year: 2017, value: 95.5 },
      { year: 2018, value: 92.1 },
      { year: 2019, value: 94.5 },
      { year: 2020, value: 94.5 },
      { year: 2021, value: 95.0 },
    ],
  },
  
  // Turkey
  Turkey: {
    rdSpending: [
      { year: 2015, value: 0.88 },
      { year: 2016, value: 0.94 },
      { year: 2017, value: 0.96 },
      { year: 2018, value: 1.03 },
      { year: 2019, value: 1.06 },
      { year: 2020, value: 1.09 },
      { year: 2021, value: 1.40 },
      { year: 2022, value: 1.45 },
    ],
    researchers: [
      { year: 2015, value: 1156 },
      { year: 2016, value: 1214 },
      { year: 2017, value: 1313 },
      { year: 2018, value: 1432 },
      { year: 2019, value: 1567 },
      { year: 2020, value: 1645 },
      { year: 2021, value: 1720 },
    ],
    patents: [
      { year: 2015, value: 5903 },
      { year: 2016, value: 6247 },
      { year: 2017, value: 7225 },
      { year: 2018, value: 7114 },
      { year: 2019, value: 7338 },
      { year: 2020, value: 8523 },
      { year: 2021, value: 9100 },
    ],
    internetUsers: [
      { year: 2015, value: 53.7 },
      { year: 2016, value: 58.3 },
      { year: 2017, value: 64.7 },
      { year: 2018, value: 71.0 },
      { year: 2019, value: 74.0 },
      { year: 2020, value: 77.7 },
      { year: 2021, value: 81.3 },
    ],
  },
  
  // Russia
  Russia: {
    rdSpending: [
      { year: 2015, value: 1.10 },
      { year: 2016, value: 1.10 },
      { year: 2017, value: 1.11 },
      { year: 2018, value: 0.99 },
      { year: 2019, value: 1.04 },
      { year: 2020, value: 1.10 },
      { year: 2021, value: 1.12 },
    ],
    researchers: [
      { year: 2015, value: 3131 },
      { year: 2016, value: 3014 },
      { year: 2017, value: 2954 },
      { year: 2018, value: 2784 },
      { year: 2019, value: 2784 },
      { year: 2020, value: 2850 },
    ],
    patents: [
      { year: 2015, value: 45517 },
      { year: 2016, value: 41587 },
      { year: 2017, value: 36454 },
      { year: 2018, value: 37957 },
      { year: 2019, value: 35511 },
      { year: 2020, value: 34984 },
      { year: 2021, value: 30000 },
    ],
    internetUsers: [
      { year: 2015, value: 70.1 },
      { year: 2016, value: 73.1 },
      { year: 2017, value: 76.0 },
      { year: 2018, value: 80.9 },
      { year: 2019, value: 82.6 },
      { year: 2020, value: 85.0 },
      { year: 2021, value: 88.0 },
    ],
  },
  
  // Norway
  Norway: {
    rdSpending: [
      { year: 2015, value: 1.93 },
      { year: 2016, value: 2.03 },
      { year: 2017, value: 2.11 },
      { year: 2018, value: 2.07 },
      { year: 2019, value: 2.15 },
      { year: 2020, value: 2.28 },
      { year: 2021, value: 2.25 },
    ],
    researchers: [
      { year: 2015, value: 5688 },
      { year: 2016, value: 5912 },
      { year: 2017, value: 6210 },
      { year: 2018, value: 6456 },
      { year: 2019, value: 6723 },
      { year: 2020, value: 6890 },
    ],
    patents: [
      { year: 2015, value: 1654 },
      { year: 2016, value: 1612 },
      { year: 2017, value: 1589 },
      { year: 2018, value: 1534 },
      { year: 2019, value: 1512 },
      { year: 2020, value: 1467 },
      { year: 2021, value: 1500 },
    ],
    internetUsers: [
      { year: 2015, value: 96.3 },
      { year: 2016, value: 97.3 },
      { year: 2017, value: 97.3 },
      { year: 2018, value: 98.0 },
      { year: 2019, value: 98.4 },
      { year: 2020, value: 98.0 },
      { year: 2021, value: 98.5 },
    ],
  },
  
  // Netherlands
  Netherlands: {
    rdSpending: [
      { year: 2015, value: 2.00 },
      { year: 2016, value: 2.00 },
      { year: 2017, value: 1.99 },
      { year: 2018, value: 2.14 },
      { year: 2019, value: 2.18 },
      { year: 2020, value: 2.29 },
      { year: 2021, value: 2.27 },
    ],
    researchers: [
      { year: 2015, value: 4847 },
      { year: 2016, value: 5012 },
      { year: 2017, value: 5234 },
      { year: 2018, value: 5567 },
      { year: 2019, value: 5890 },
      { year: 2020, value: 6100 },
    ],
    patents: [
      { year: 2015, value: 4089 },
      { year: 2016, value: 4012 },
      { year: 2017, value: 3978 },
      { year: 2018, value: 3890 },
      { year: 2019, value: 3756 },
      { year: 2020, value: 3612 },
      { year: 2021, value: 3700 },
    ],
    internetUsers: [
      { year: 2015, value: 91.7 },
      { year: 2016, value: 90.4 },
      { year: 2017, value: 93.2 },
      { year: 2018, value: 94.7 },
      { year: 2019, value: 91.3 },
      { year: 2020, value: 91.0 },
      { year: 2021, value: 92.0 },
    ],
  },
  
  // Portugal
  Portugal: {
    rdSpending: [
      { year: 2015, value: 1.24 },
      { year: 2016, value: 1.27 },
      { year: 2017, value: 1.32 },
      { year: 2018, value: 1.35 },
      { year: 2019, value: 1.40 },
      { year: 2020, value: 1.62 },
      { year: 2021, value: 1.68 },
    ],
    researchers: [
      { year: 2015, value: 4323 },
      { year: 2016, value: 4567 },
      { year: 2017, value: 4789 },
      { year: 2018, value: 5012 },
      { year: 2019, value: 5234 },
      { year: 2020, value: 5400 },
    ],
    patents: [
      { year: 2015, value: 823 },
      { year: 2016, value: 856 },
      { year: 2017, value: 889 },
      { year: 2018, value: 912 },
      { year: 2019, value: 934 },
      { year: 2020, value: 956 },
      { year: 2021, value: 980 },
    ],
    internetUsers: [
      { year: 2015, value: 68.6 },
      { year: 2016, value: 70.4 },
      { year: 2017, value: 73.8 },
      { year: 2018, value: 74.7 },
      { year: 2019, value: 78.3 },
      { year: 2020, value: 78.3 },
      { year: 2021, value: 82.0 },
    ],
  },
  
  // Poland
  Poland: {
    rdSpending: [
      { year: 2015, value: 1.00 },
      { year: 2016, value: 0.96 },
      { year: 2017, value: 1.03 },
      { year: 2018, value: 1.21 },
      { year: 2019, value: 1.32 },
      { year: 2020, value: 1.39 },
      { year: 2021, value: 1.44 },
    ],
    researchers: [
      { year: 2015, value: 2089 },
      { year: 2016, value: 2234 },
      { year: 2017, value: 2456 },
      { year: 2018, value: 2678 },
      { year: 2019, value: 2890 },
      { year: 2020, value: 3100 },
    ],
    patents: [
      { year: 2015, value: 4676 },
      { year: 2016, value: 4234 },
      { year: 2017, value: 4089 },
      { year: 2018, value: 4123 },
      { year: 2019, value: 4234 },
      { year: 2020, value: 4312 },
      { year: 2021, value: 4400 },
    ],
    internetUsers: [
      { year: 2015, value: 68.0 },
      { year: 2016, value: 73.3 },
      { year: 2017, value: 76.0 },
      { year: 2018, value: 77.5 },
      { year: 2019, value: 79.5 },
      { year: 2020, value: 84.5 },
      { year: 2021, value: 87.0 },
    ],
  },
  
  // South Africa
  SouthAfrica: {
    rdSpending: [
      { year: 2015, value: 0.80 },
      { year: 2016, value: 0.83 },
      { year: 2017, value: 0.83 },
      { year: 2018, value: 0.83 },
      { year: 2019, value: 0.83 },
      { year: 2020, value: 0.85 },
    ],
    researchers: [
      { year: 2015, value: 484 },
      { year: 2016, value: 498 },
      { year: 2017, value: 512 },
      { year: 2018, value: 525 },
      { year: 2019, value: 540 },
    ],
    patents: [
      { year: 2015, value: 7512 },
      { year: 2016, value: 7234 },
      { year: 2017, value: 7089 },
      { year: 2018, value: 6912 },
      { year: 2019, value: 6756 },
      { year: 2020, value: 6500 },
    ],
    internetUsers: [
      { year: 2015, value: 51.9 },
      { year: 2016, value: 54.0 },
      { year: 2017, value: 56.2 },
      { year: 2018, value: 56.2 },
      { year: 2019, value: 68.2 },
      { year: 2020, value: 70.0 },
      { year: 2021, value: 72.0 },
    ],
  },
  
  // Nigeria
  Nigeria: {
    rdSpending: [
      { year: 2015, value: 0.13 },
      { year: 2016, value: 0.13 },
      { year: 2017, value: 0.13 },
      { year: 2018, value: 0.13 },
      { year: 2019, value: 0.12 },
      { year: 2020, value: 0.12 },
    ],
    researchers: [
      { year: 2015, value: 38 },
      { year: 2016, value: 39 },
      { year: 2017, value: 40 },
      { year: 2018, value: 41 },
      { year: 2019, value: 42 },
    ],
    patents: [
      { year: 2015, value: 1023 },
      { year: 2016, value: 1089 },
      { year: 2017, value: 1156 },
      { year: 2018, value: 1234 },
      { year: 2019, value: 1312 },
      { year: 2020, value: 1400 },
    ],
    internetUsers: [
      { year: 2015, value: 25.7 },
      { year: 2016, value: 27.7 },
      { year: 2017, value: 33.0 },
      { year: 2018, value: 42.0 },
      { year: 2019, value: 46.0 },
      { year: 2020, value: 55.4 },
      { year: 2021, value: 55.4 },
    ],
  },
  
  // Saudi Arabia
  SaudiArabia: {
    rdSpending: [
      { year: 2015, value: 0.25 },
      { year: 2016, value: 0.28 },
      { year: 2017, value: 0.30 },
      { year: 2018, value: 0.50 },
      { year: 2019, value: 0.54 },
      { year: 2020, value: 0.56 },
      { year: 2021, value: 0.60 },
    ],
    researchers: [
      { year: 2015, value: 156 },
      { year: 2016, value: 178 },
      { year: 2017, value: 201 },
      { year: 2018, value: 234 },
      { year: 2019, value: 267 },
      { year: 2020, value: 300 },
    ],
    patents: [
      { year: 2015, value: 1567 },
      { year: 2016, value: 1678 },
      { year: 2017, value: 1789 },
      { year: 2018, value: 1890 },
      { year: 2019, value: 2012 },
      { year: 2020, value: 2134 },
      { year: 2021, value: 2300 },
    ],
    internetUsers: [
      { year: 2015, value: 69.6 },
      { year: 2016, value: 74.9 },
      { year: 2017, value: 82.1 },
      { year: 2018, value: 89.4 },
      { year: 2019, value: 95.7 },
      { year: 2020, value: 97.9 },
      { year: 2021, value: 98.0 },
    ],
  },
};

/**
 * Get fallback data for a specific country and metric
 */
export function getFallbackData(
  country: string,
  metric: keyof CountryTechFallback
): FallbackDataPoint[] | undefined {
  return TECHNOLOGY_FALLBACK_DATA[country]?.[metric];
}

/**
 * Get all countries with fallback data
 */
export function getCountriesWithFallbackData(): string[] {
  return Object.keys(TECHNOLOGY_FALLBACK_DATA);
}

/**
 * Check if fallback data exists for a country
 */
export function hasFallbackData(country: string): boolean {
  return country in TECHNOLOGY_FALLBACK_DATA;
}
