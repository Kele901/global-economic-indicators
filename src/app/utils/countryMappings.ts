export const COUNTRY_KEYS = [
  'USA', 'Canada', 'UK', 'France', 'Germany', 'Italy', 'Japan', 'Australia',
  'Mexico', 'SouthKorea', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Nigeria',
  'China', 'Russia', 'Brazil', 'Chile', 'Argentina', 'India', 'Norway',
  'Netherlands', 'Portugal', 'Belgium', 'Indonesia', 'SouthAfrica', 'Poland',
  'SaudiArabia', 'Egypt'
] as const;

export type CountryKey = (typeof COUNTRY_KEYS)[number];

export const COUNTRY_SLUGS: Record<string, CountryKey> = {
  'usa': 'USA', 'canada': 'Canada', 'uk': 'UK', 'united-kingdom': 'UK',
  'france': 'France', 'germany': 'Germany', 'italy': 'Italy', 'japan': 'Japan',
  'australia': 'Australia', 'mexico': 'Mexico', 'south-korea': 'SouthKorea',
  'spain': 'Spain', 'sweden': 'Sweden', 'switzerland': 'Switzerland',
  'turkey': 'Turkey', 'nigeria': 'Nigeria', 'china': 'China', 'russia': 'Russia',
  'brazil': 'Brazil', 'chile': 'Chile', 'argentina': 'Argentina', 'india': 'India',
  'norway': 'Norway', 'netherlands': 'Netherlands', 'portugal': 'Portugal',
  'belgium': 'Belgium', 'indonesia': 'Indonesia', 'south-africa': 'SouthAfrica',
  'saudi-arabia': 'SaudiArabia', 'egypt': 'Egypt', 'poland': 'Poland',
};

export const COUNTRY_KEY_TO_SLUG: Record<CountryKey, string> = {
  USA: 'usa', Canada: 'canada', UK: 'uk', France: 'france', Germany: 'germany',
  Italy: 'italy', Japan: 'japan', Australia: 'australia', Mexico: 'mexico',
  SouthKorea: 'south-korea', Spain: 'spain', Sweden: 'sweden',
  Switzerland: 'switzerland', Turkey: 'turkey', Nigeria: 'nigeria', China: 'china',
  Russia: 'russia', Brazil: 'brazil', Chile: 'chile', Argentina: 'argentina',
  India: 'india', Norway: 'norway', Netherlands: 'netherlands', Portugal: 'portugal',
  Belgium: 'belgium', Indonesia: 'indonesia', SouthAfrica: 'south-africa',
  Poland: 'poland', SaudiArabia: 'saudi-arabia', Egypt: 'egypt',
};

export const COUNTRY_DISPLAY_NAMES: Record<CountryKey, string> = {
  USA: 'United States', Canada: 'Canada', UK: 'United Kingdom', France: 'France',
  Germany: 'Germany', Italy: 'Italy', Japan: 'Japan', Australia: 'Australia',
  Mexico: 'Mexico', SouthKorea: 'South Korea', Spain: 'Spain', Sweden: 'Sweden',
  Switzerland: 'Switzerland', Turkey: 'Turkey', Nigeria: 'Nigeria', China: 'China',
  Russia: 'Russia', Brazil: 'Brazil', Chile: 'Chile', Argentina: 'Argentina',
  India: 'India', Norway: 'Norway', Netherlands: 'Netherlands', Portugal: 'Portugal',
  Belgium: 'Belgium', Indonesia: 'Indonesia', SouthAfrica: 'South Africa',
  Poland: 'Poland', SaudiArabia: 'Saudi Arabia', Egypt: 'Egypt',
};

export const COUNTRY_ISO2: Record<CountryKey, string> = {
  USA: 'US', Canada: 'CA', UK: 'GB', France: 'FR', Germany: 'DE', Italy: 'IT',
  Japan: 'JP', Australia: 'AU', Mexico: 'MX', SouthKorea: 'KR', Spain: 'ES',
  Sweden: 'SE', Switzerland: 'CH', Turkey: 'TR', Nigeria: 'NG', China: 'CN',
  Russia: 'RU', Brazil: 'BR', Chile: 'CL', Argentina: 'AR', India: 'IN',
  Norway: 'NO', Netherlands: 'NL', Portugal: 'PT', Belgium: 'BE', Indonesia: 'ID',
  SouthAfrica: 'ZA', Poland: 'PL', SaudiArabia: 'SA', Egypt: 'EG',
};

export const COUNTRY_ISO_NUMERIC: Record<CountryKey, string> = {
  USA: '840', Canada: '124', UK: '826', France: '250', Germany: '276', Italy: '380',
  Japan: '392', Australia: '036', Mexico: '484', SouthKorea: '410', Spain: '724',
  Sweden: '752', Switzerland: '756', Turkey: '792', Nigeria: '566', China: '156',
  Russia: '643', Brazil: '076', Chile: '152', Argentina: '032', India: '356',
  Norway: '578', Netherlands: '528', Portugal: '620', Belgium: '056', Indonesia: '360',
  SouthAfrica: '710', Poland: '616', SaudiArabia: '682', Egypt: '818',
};

export const ISO_NUMERIC_TO_COUNTRY: Record<string, CountryKey> = Object.fromEntries(
  Object.entries(COUNTRY_ISO_NUMERIC).map(([k, v]) => [v, k as CountryKey])
) as Record<string, CountryKey>;

export const COUNTRY_COLORS: Record<CountryKey, string> = {
  USA: '#8884d8', Canada: '#82ca9d', France: '#ffc658', Germany: '#ff8042',
  Italy: '#a4de6c', Japan: '#d0ed57', UK: '#83a6ed', Australia: '#ff7300',
  Mexico: '#e60049', SouthKorea: '#0bb4ff', Spain: '#50e991', Sweden: '#e6d800',
  Switzerland: '#9b19f5', Turkey: '#dc0ab4', Nigeria: '#00bfa0', China: '#b3d4ff',
  Russia: '#fd7f6f', Brazil: '#7eb0d5', Chile: '#b2e061', Argentina: '#bd7ebe',
  India: '#ff9ff3', Norway: '#45aaf2', Netherlands: '#ff6b35', Portugal: '#004e89',
  Belgium: '#f7b801', Indonesia: '#06a77d', SouthAfrica: '#d62246', Poland: '#c1292e',
  SaudiArabia: '#006c35', Egypt: '#c09000',
};

export const COUNTRY_REGIONS: Record<string, CountryKey[]> = {
  'North America': ['USA', 'Canada', 'Mexico'],
  'Europe': ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Sweden', 'Switzerland', 'Norway', 'Netherlands', 'Portugal', 'Belgium', 'Poland'],
  'Asia-Pacific': ['Japan', 'Australia', 'SouthKorea', 'China', 'India', 'Indonesia'],
  'Latin America': ['Brazil', 'Chile', 'Argentina'],
  'Middle East & Africa': ['Turkey', 'Nigeria', 'SouthAfrica', 'SaudiArabia', 'Egypt', 'Russia'],
};

export function getCountryKeyFromSlug(slug: string): CountryKey | undefined {
  return COUNTRY_SLUGS[slug.toLowerCase()];
}

export function getDisplayName(key: string): string {
  return COUNTRY_DISPLAY_NAMES[key as CountryKey] || key;
}
