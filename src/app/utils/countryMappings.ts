// Canonical country roster. Every selector, colour scale, slug, flag lookup and
// ledger join resolves through this file. Keys are the internal "wbKey" strings
// used as column names in the CountryData rows produced by services/worldbank.ts,
// so COUNTRY_KEYS must stay in sync with COUNTRY_NAMES there — enforced by
// src/app/utils/__tests__/countryRoster.test.ts.

export const COUNTRY_KEYS = [
  // North America
  'USA', 'Canada', 'Mexico',
  // Latin America
  'Brazil', 'Chile', 'Argentina', 'Colombia',
  // Europe
  'UK', 'France', 'Germany', 'Italy', 'Spain', 'Sweden', 'Switzerland',
  'Norway', 'Netherlands', 'Portugal', 'Belgium', 'Poland', 'Greece',
  // Eurasia
  'Russia', 'Ukraine',
  // Middle East & North Africa
  'Turkey', 'SaudiArabia', 'Egypt', 'Israel', 'Iran', 'UAE', 'Qatar', 'Morocco',
  // Sub-Saharan Africa
  'Nigeria', 'SouthAfrica', 'Kenya', 'Ethiopia', 'Ghana',
  // Asia-Pacific
  'Japan', 'Australia', 'SouthKorea', 'China', 'India', 'Indonesia',
  'Singapore', 'Vietnam', 'Thailand', 'Philippines', 'Pakistan', 'Bangladesh',
] as const;

export type CountryKey = (typeof COUNTRY_KEYS)[number];

// The nine economies the dashboard opens with, and what "Reset defaults" restores.
export const DEFAULT_DASHBOARD_SELECTION: CountryKey[] = [
  'USA', 'Canada', 'Mexico', 'UK', 'France', 'Germany', 'Japan', 'China', 'India',
];

// Countries that appear in curated ledger data but have no World Bank series, so
// they are deliberately absent from COUNTRY_KEYS. Charts that source them from a
// curated table should label them as such rather than leaving a silent gap.
export const CURATED_ONLY_COUNTRIES: Record<string, { displayName: string; iso2: string; iso3: string; note: string }> = {
  Taiwan: {
    displayName: 'Taiwan',
    iso2: 'TW',
    iso3: 'TWN',
    note: 'Not a World Bank reporting economy. Figures come from curated national statistics and are not comparable to the live World Bank series.',
  },
};

export const COUNTRY_SLUGS: Record<string, CountryKey> = {
  'usa': 'USA', 'canada': 'Canada', 'mexico': 'Mexico',
  'brazil': 'Brazil', 'chile': 'Chile', 'argentina': 'Argentina', 'colombia': 'Colombia',
  'uk': 'UK', 'united-kingdom': 'UK', 'france': 'France', 'germany': 'Germany',
  'italy': 'Italy', 'spain': 'Spain', 'sweden': 'Sweden', 'switzerland': 'Switzerland',
  'norway': 'Norway', 'netherlands': 'Netherlands', 'portugal': 'Portugal',
  'belgium': 'Belgium', 'poland': 'Poland', 'greece': 'Greece',
  'russia': 'Russia', 'ukraine': 'Ukraine',
  'turkey': 'Turkey', 'saudi-arabia': 'SaudiArabia', 'egypt': 'Egypt',
  'israel': 'Israel', 'iran': 'Iran', 'uae': 'UAE', 'qatar': 'Qatar', 'morocco': 'Morocco',
  'nigeria': 'Nigeria', 'south-africa': 'SouthAfrica', 'kenya': 'Kenya',
  'ethiopia': 'Ethiopia', 'ghana': 'Ghana',
  'japan': 'Japan', 'australia': 'Australia', 'south-korea': 'SouthKorea',
  'china': 'China', 'india': 'India', 'indonesia': 'Indonesia', 'singapore': 'Singapore',
  'vietnam': 'Vietnam', 'thailand': 'Thailand', 'philippines': 'Philippines',
  'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh',
};

export const COUNTRY_KEY_TO_SLUG: Record<CountryKey, string> = {
  USA: 'usa', Canada: 'canada', Mexico: 'mexico',
  Brazil: 'brazil', Chile: 'chile', Argentina: 'argentina', Colombia: 'colombia',
  UK: 'uk', France: 'france', Germany: 'germany', Italy: 'italy', Spain: 'spain',
  Sweden: 'sweden', Switzerland: 'switzerland', Norway: 'norway',
  Netherlands: 'netherlands', Portugal: 'portugal', Belgium: 'belgium',
  Poland: 'poland', Greece: 'greece',
  Russia: 'russia', Ukraine: 'ukraine',
  Turkey: 'turkey', SaudiArabia: 'saudi-arabia', Egypt: 'egypt', Israel: 'israel',
  Iran: 'iran', UAE: 'uae', Qatar: 'qatar', Morocco: 'morocco',
  Nigeria: 'nigeria', SouthAfrica: 'south-africa', Kenya: 'kenya',
  Ethiopia: 'ethiopia', Ghana: 'ghana',
  Japan: 'japan', Australia: 'australia', SouthKorea: 'south-korea', China: 'china',
  India: 'india', Indonesia: 'indonesia', Singapore: 'singapore', Vietnam: 'vietnam',
  Thailand: 'thailand', Philippines: 'philippines', Pakistan: 'pakistan',
  Bangladesh: 'bangladesh',
};

export const COUNTRY_DISPLAY_NAMES: Record<CountryKey, string> = {
  USA: 'United States', Canada: 'Canada', Mexico: 'Mexico',
  Brazil: 'Brazil', Chile: 'Chile', Argentina: 'Argentina', Colombia: 'Colombia',
  UK: 'United Kingdom', France: 'France', Germany: 'Germany', Italy: 'Italy',
  Spain: 'Spain', Sweden: 'Sweden', Switzerland: 'Switzerland', Norway: 'Norway',
  Netherlands: 'Netherlands', Portugal: 'Portugal', Belgium: 'Belgium',
  Poland: 'Poland', Greece: 'Greece',
  Russia: 'Russia', Ukraine: 'Ukraine',
  Turkey: 'Türkiye', SaudiArabia: 'Saudi Arabia', Egypt: 'Egypt', Israel: 'Israel',
  Iran: 'Iran', UAE: 'United Arab Emirates', Qatar: 'Qatar', Morocco: 'Morocco',
  Nigeria: 'Nigeria', SouthAfrica: 'South Africa', Kenya: 'Kenya',
  Ethiopia: 'Ethiopia', Ghana: 'Ghana',
  Japan: 'Japan', Australia: 'Australia', SouthKorea: 'South Korea', China: 'China',
  India: 'India', Indonesia: 'Indonesia', Singapore: 'Singapore', Vietnam: 'Vietnam',
  Thailand: 'Thailand', Philippines: 'Philippines', Pakistan: 'Pakistan',
  Bangladesh: 'Bangladesh',
};

export const COUNTRY_ISO2: Record<CountryKey, string> = {
  USA: 'US', Canada: 'CA', Mexico: 'MX',
  Brazil: 'BR', Chile: 'CL', Argentina: 'AR', Colombia: 'CO',
  UK: 'GB', France: 'FR', Germany: 'DE', Italy: 'IT', Spain: 'ES', Sweden: 'SE',
  Switzerland: 'CH', Norway: 'NO', Netherlands: 'NL', Portugal: 'PT',
  Belgium: 'BE', Poland: 'PL', Greece: 'GR',
  Russia: 'RU', Ukraine: 'UA',
  Turkey: 'TR', SaudiArabia: 'SA', Egypt: 'EG', Israel: 'IL', Iran: 'IR',
  UAE: 'AE', Qatar: 'QA', Morocco: 'MA',
  Nigeria: 'NG', SouthAfrica: 'ZA', Kenya: 'KE', Ethiopia: 'ET', Ghana: 'GH',
  Japan: 'JP', Australia: 'AU', SouthKorea: 'KR', China: 'CN', India: 'IN',
  Indonesia: 'ID', Singapore: 'SG', Vietnam: 'VN', Thailand: 'TH',
  Philippines: 'PH', Pakistan: 'PK', Bangladesh: 'BD',
};

export const COUNTRY_ISO3: Record<CountryKey, string> = {
  USA: 'USA', Canada: 'CAN', Mexico: 'MEX',
  Brazil: 'BRA', Chile: 'CHL', Argentina: 'ARG', Colombia: 'COL',
  UK: 'GBR', France: 'FRA', Germany: 'DEU', Italy: 'ITA', Spain: 'ESP',
  Sweden: 'SWE', Switzerland: 'CHE', Norway: 'NOR', Netherlands: 'NLD',
  Portugal: 'PRT', Belgium: 'BEL', Poland: 'POL', Greece: 'GRC',
  Russia: 'RUS', Ukraine: 'UKR',
  Turkey: 'TUR', SaudiArabia: 'SAU', Egypt: 'EGY', Israel: 'ISR', Iran: 'IRN',
  UAE: 'ARE', Qatar: 'QAT', Morocco: 'MAR',
  Nigeria: 'NGA', SouthAfrica: 'ZAF', Kenya: 'KEN', Ethiopia: 'ETH', Ghana: 'GHA',
  Japan: 'JPN', Australia: 'AUS', SouthKorea: 'KOR', China: 'CHN', India: 'IND',
  Indonesia: 'IDN', Singapore: 'SGP', Vietnam: 'VNM', Thailand: 'THA',
  Philippines: 'PHL', Pakistan: 'PAK', Bangladesh: 'BGD',
};

export const COUNTRY_ISO_NUMERIC: Record<CountryKey, string> = {
  USA: '840', Canada: '124', Mexico: '484',
  Brazil: '076', Chile: '152', Argentina: '032', Colombia: '170',
  UK: '826', France: '250', Germany: '276', Italy: '380', Spain: '724',
  Sweden: '752', Switzerland: '756', Norway: '578', Netherlands: '528',
  Portugal: '620', Belgium: '056', Poland: '616', Greece: '300',
  Russia: '643', Ukraine: '804',
  Turkey: '792', SaudiArabia: '682', Egypt: '818', Israel: '376', Iran: '364',
  UAE: '784', Qatar: '634', Morocco: '504',
  Nigeria: '566', SouthAfrica: '710', Kenya: '404', Ethiopia: '231', Ghana: '288',
  Japan: '392', Australia: '036', SouthKorea: '410', China: '156', India: '356',
  Indonesia: '360', Singapore: '702', Vietnam: '704', Thailand: '764',
  Philippines: '608', Pakistan: '586', Bangladesh: '050',
};

export const ISO_NUMERIC_TO_COUNTRY: Record<string, CountryKey> = Object.fromEntries(
  Object.entries(COUNTRY_ISO_NUMERIC).map(([k, v]) => [v, k as CountryKey])
) as Record<string, CountryKey>;

export const ISO3_TO_COUNTRY: Record<string, CountryKey> = Object.fromEntries(
  Object.entries(COUNTRY_ISO3).map(([k, v]) => [v, k as CountryKey])
) as Record<string, CountryKey>;

export const COUNTRY_COLORS: Record<CountryKey, string> = {
  USA: '#8884d8', Canada: '#82ca9d', Mexico: '#e60049',
  Brazil: '#7eb0d5', Chile: '#b2e061', Argentina: '#bd7ebe', Colombia: '#fdd835',
  UK: '#83a6ed', France: '#ffc658', Germany: '#ff8042', Italy: '#a4de6c',
  Spain: '#50e991', Sweden: '#e6d800', Switzerland: '#9b19f5', Norway: '#45aaf2',
  Netherlands: '#ff6b35', Portugal: '#004e89', Belgium: '#f7b801',
  Poland: '#c1292e', Greece: '#0d47a1',
  Russia: '#fd7f6f', Ukraine: '#ffca28',
  Turkey: '#dc0ab4', SaudiArabia: '#006c35', Egypt: '#c09000', Israel: '#1e88e5',
  Iran: '#00897b', UAE: '#5e35b1', Qatar: '#6d4c41', Morocco: '#ad1457',
  Nigeria: '#00bfa0', SouthAfrica: '#d62246', Kenya: '#43a047',
  Ethiopia: '#8d6e63', Ghana: '#fb8c00',
  Japan: '#d0ed57', Australia: '#ff7300', SouthKorea: '#0bb4ff', China: '#b3d4ff',
  India: '#ff9ff3', Indonesia: '#06a77d', Singapore: '#ef5350', Vietnam: '#d81b60',
  Thailand: '#7cb342', Philippines: '#e53935', Pakistan: '#2e7d32',
  Bangladesh: '#00acc1',
};

export const COUNTRY_REGIONS: Record<string, CountryKey[]> = {
  'North America': ['USA', 'Canada', 'Mexico'],
  'Latin America': ['Brazil', 'Chile', 'Argentina', 'Colombia'],
  'Europe': ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Sweden', 'Switzerland', 'Norway', 'Netherlands', 'Portugal', 'Belgium', 'Poland', 'Greece'],
  'Eurasia': ['Russia', 'Ukraine'],
  'Middle East & North Africa': ['Turkey', 'SaudiArabia', 'Egypt', 'Israel', 'Iran', 'UAE', 'Qatar', 'Morocco'],
  'Sub-Saharan Africa': ['Nigeria', 'SouthAfrica', 'Kenya', 'Ethiopia', 'Ghana'],
  'Asia-Pacific': ['Japan', 'Australia', 'SouthKorea', 'China', 'India', 'Indonesia', 'Singapore', 'Vietnam', 'Thailand', 'Philippines', 'Pakistan', 'Bangladesh'],
};

export const REGION_ORDER = Object.keys(COUNTRY_REGIONS);

export function getCountryKeyFromSlug(slug: string): CountryKey | undefined {
  return COUNTRY_SLUGS[slug.toLowerCase()];
}

export function getDisplayName(key: string): string {
  return (
    COUNTRY_DISPLAY_NAMES[key as CountryKey] ||
    CURATED_ONLY_COUNTRIES[key]?.displayName ||
    key
  );
}

export function getRegionFor(key: CountryKey): string | undefined {
  return REGION_ORDER.find((region) => COUNTRY_REGIONS[region].includes(key));
}
